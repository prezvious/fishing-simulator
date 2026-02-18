/**
 * MYTHIC WATERS: ENHANCED EDITION — Core Engine
 * Contains the Game class with all core mechanics:
 *   - Weather system
 *   - Fishing logic (cast, rarity roll, minigame)
 *   - Combo system
 *   - XP & Levels
 *   - Auto-fishing
 *
 * All data (RARITY, RODS, BAITS, LOCATIONS, WEATHER_DATA, FISH_DB)
 * and systems (UI, Shop, Inventory, SaveSystem) are loaded via prior script tags.
 *
 * Wrapped in IIFE to prevent global scope access (Vuln #1 hardening).
 */

(function () {

    class Game {
        constructor() {
            this.state = {
                coins: 0,
                xp: 0,
                level: 1,
                inventory: [],
                location: 'mistvale',
                rod: 'bamboo',
                rodsOwned: ['bamboo'],
                bait: 'worm',
                baitsOwned: ['worm'],
                combo: 0,
                totalCatches: 0,
                // Pity timer: consecutive catches without rare+ fish
                pityCounter: 0,
                // Shop: Purchased weathers running simultaneously (max WEATHER_BUY_LIMIT)
                activeWeathers: [],
                // Shop: Amulet stock per biome { biomeKey: count }
                amuletStock: {},
                // Currently worn amulet biome key (or null)
                activeAmulet: null,
                // Auto-fish persistence
                autoFishEnabled: false,
                lastSaveTimestamp: Date.now(),
                // Achievements
                achievements: [],
                achievementCounters: {}
            };

            this.weather = {
                current: 'clear',
                timer: 0
            };

            this.minigame = {
                active: false,
                pos: 0,
                direction: 1,
                speed: 1,
                targetStart: 0,
                targetWidth: 20,
                fishOnLine: null
            };

            // Auto-fishing state
            this.autoFish = {
                enabled: false,
                phase: 'idle', // 'idle', 'casting', 'hooking', 'reeling'
                timer: null,
                // Background-tracking fields
                cooldownStart: 0,   // timestamp when cooldown began
                cooldownDuration: 0 // how long the cooldown lasts (ms)
            };

            this.loopId = null;

            // Web Worker for un-throttled background timers
            this._timerCallbacks = {};
            this._timerIdCounter = 0;
            this._initTimerWorker();

            // System Modules
            this.ui = new UI(this);
            this.inventory = new Inventory(this);
            this.shop = new Shop(this);
            this.saveSystem = new SaveSystem(this);
            this.achievementManager = new AchievementManager(this);
        }

        init() {
            this.saveSystem.load();
            this.achievementManager.init();
            this.processOfflineCatches();
            this.ui.renderAll();
            this.startWeatherCycle();
            this.gameLoop();
            this._initVisibilityHandler();

            // Auto-resume auto-fish if it was enabled before reload
            if (this.state.autoFishEnabled) {
                this.autoFish.enabled = true;
                const btn = document.getElementById('auto-fish-btn');
                const castBtn = document.getElementById('action-btn');
                btn.textContent = '🤖 Auto: ON';
                btn.classList.add('active');
                castBtn.disabled = true;
                castBtn.style.opacity = '0.5';
                this.log('Auto-fishing resumed from previous session.');
                this.startAutoFishCycle();
            }
        }

        /* --- WEB WORKER TIMER (runs in background tabs) --- */
        _initTimerWorker() {
            try {
                // Inline the worker script as a Blob to avoid file:// SecurityError
                const workerCode = `
                const timers = {};
                self.onmessage = function (e) {
                    const { command, id, delay } = e.data;
                    if (command === 'start') {
                        if (timers[id]) clearTimeout(timers[id]);
                        timers[id] = setTimeout(() => {
                            delete timers[id];
                            self.postMessage({ id });
                        }, delay);
                    }
                    if (command === 'cancel') {
                        if (timers[id]) {
                            clearTimeout(timers[id]);
                            delete timers[id];
                        }
                    }
                };
            `;
                const blob = new Blob([workerCode], { type: 'application/javascript' });
                const url = URL.createObjectURL(blob);
                this._timerWorker = new Worker(url);
                URL.revokeObjectURL(url); // Clean up the URL after worker is created
                this._timerWorker.onmessage = (e) => {
                    const { id } = e.data;
                    const cb = this._timerCallbacks[id];
                    if (cb) {
                        delete this._timerCallbacks[id];
                        cb();
                    }
                };
            } catch (err) {
                // Fallback: if Workers aren't available, use regular setTimeout
                console.warn('Web Worker unavailable, falling back to setTimeout:', err);
                this._timerWorker = null;
            }
        }

        /** Schedule a callback after `delay` ms — uses Worker if available */
        _workerTimeout(callback, delay) {
            if (this._timerWorker) {
                const id = 'timer_' + (++this._timerIdCounter);
                this._timerCallbacks[id] = callback;
                this._timerWorker.postMessage({ command: 'start', id, delay });
                return id;
            }
            // Fallback to regular setTimeout
            return setTimeout(callback, delay);
        }

        /** Cancel a pending worker timer */
        _cancelWorkerTimeout(id) {
            if (id == null) return;
            if (this._timerWorker && typeof id === 'string') {
                delete this._timerCallbacks[id];
                this._timerWorker.postMessage({ command: 'cancel', id });
            } else {
                clearTimeout(id);
            }
        }

        /* --- VISIBILITY CHANGE: sync UI when tab regains focus --- */
        _initVisibilityHandler() {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') {
                    // Tab is back in focus — refresh all UI
                    this.ui.renderStats();
                    this.inventory.render();
                    this.ui.updateWeather();

                    // Sync cooldown progress bar if auto-fishing
                    if (this.autoFish.enabled && this.autoFish.phase === 'casting') {
                        this._syncCooldownBar();
                    }
                }
            });
        }

        /** Update the cooldown bar to reflect actual elapsed time (after background) */
        _syncCooldownBar() {
            const container = document.getElementById('auto-cooldown-container');
            const fill = document.getElementById('cooldown-bar-fill');
            const elapsed = Date.now() - this.autoFish.cooldownStart;
            const duration = this.autoFish.cooldownDuration;
            const progress = Math.min(elapsed / duration, 1);
            fill.style.width = (progress * 100) + '%';
            if (progress >= 1) {
                container.style.display = 'none';
            } else {
                container.style.display = 'block';
            }
        }

        gameLoop() {
            if (this.minigame.active) {
                this.updateMinigame();
            }
            requestAnimationFrame(() => this.gameLoop());
        }

        /* --- MECHANICS: WEATHER --- */
        selectWeatherType() {
            // Dynamic weighted selection based on probability
            let totalWeight = 0;
            const weatherKeys = Object.keys(WEATHER_DATA);
            weatherKeys.forEach(key => {
                totalWeight += (WEATHER_DATA[key].probability || 0.1);
            });

            let random = Math.random() * totalWeight;
            for (const key of weatherKeys) {
                const weight = WEATHER_DATA[key].probability || 0.1;
                if (random < weight) {
                    return key;
                }
                random -= weight;
            }
            return 'clear'; // Fallback
        }

        startWeatherCycle() {
            // Initial weather
            this.setWeather('clear');

            setInterval(() => {
                const nextWeather = this.selectWeatherType();
                this.setWeather(nextWeather);
            }, 180000); // Change every 3 minutes
        }

        setWeather(type) {
            // Remove old weather classes
            Object.keys(WEATHER_DATA).forEach(k => document.body.classList.remove(`weather-${k}`));

            // Update base (natural cycle) weather
            this.weather.current = type;

            // Add CSS classes for base + all purchased weathers
            document.body.classList.add(`weather-${type}`);
            this.state.activeWeathers.forEach(k => document.body.classList.add(`weather-${k}`));

            this.ui.updateWeather();
            this.log(`Weather: ${WEATHER_DATA[type].name} - ${WEATHER_DATA[type].desc}`);
        }

        /** Add a purchased weather (max WEATHER_BUY_LIMIT simultaneous) */
        addPurchasedWeather(key) {
            if (this.state.activeWeathers.length >= WEATHER_BUY_LIMIT) return false;
            if (this.state.activeWeathers.includes(key)) return false;
            this.state.activeWeathers.push(key);
            document.body.classList.add(`weather-${key}`);
            this.ui.updateWeather();
            return true;
        }

        /** Remove a purchased weather */
        removePurchasedWeather(key) {
            const idx = this.state.activeWeathers.indexOf(key);
            if (idx === -1) return;
            this.state.activeWeathers.splice(idx, 1);
            // Only remove CSS class if it's not also the base weather
            if (this.weather.current !== key) {
                document.body.classList.remove(`weather-${key}`);
            }
            this.ui.updateWeather();
        }

        /** Combined luck multiplier: base weather + all purchased weathers (additive bonuses) */
        getWeatherMultiplier() {
            let bonus = WEATHER_DATA[this.weather.current].luck - 1; // base weather bonus
            this.state.activeWeathers.forEach(key => {
                const data = WEATHER_DATA[key];
                if (data) bonus += (data.luck - 1);
            });
            return 1 + bonus; // 1.0 base + sum of all bonuses
        }

        /* --- MECHANICS: FISHING LOGIC --- */
        startCast() {
            if (this.minigame.active) return; // Prevent double cast

            // Rate limiting to prevent rapid cast exploits
            const now = Date.now();
            if (this.lastCastTime && now - this.lastCastTime < 500) return;
            this.lastCastTime = now;

            const rod = RODS.find(r => r.id === this.state.rod);
            const bait = BAITS.find(b => b.id === this.state.bait);

            // 1. Calculate Luck (rod + bait + amulet) * weather
            let baseLuck = rod.luck + bait.luck;
            if (this.state.activeAmulet === this.state.location && AMULETS[this.state.activeAmulet]) {
                baseLuck += AMULETS[this.state.activeAmulet].luckBonus;
            }
            let totalLuck = baseLuck * this.getWeatherMultiplier();

            // 2. Roll Rarity
            const rarityKey = this.rollRarity(totalLuck, this._getPityBonus());

            // 3. Pick Fish
            const fishTemplate = this.pickFish(this.state.location, rarityKey);
            if (!fishTemplate) {
                this.log("Nothing bit...");
                document.getElementById('action-btn').textContent = 'Cast Line';
                return;
            }

            // 4. Generate Weight (Gaussian-ish)
            const mean = (fishTemplate.minWeight + fishTemplate.maxWeight) / 2;
            const weight = this.generateWeight(mean, fishTemplate.maxWeight);

            // 5. Calculate Weather Buffs
            const weatherInfo = WEATHER_DATA[this.weather.current];
            let appliedBuff = null;
            let finalValue = Math.floor(weight * RARITY[rarityKey].mult);

            if (weatherInfo.buff && Math.random() < weatherInfo.buffChance) {
                appliedBuff = weatherInfo.buff;
                finalValue = Math.floor(finalValue * (1 + weatherInfo.valBonus));
            }

            // 6. Prepare Minigame
            this.startMinigame({
                name: fishTemplate.name,
                rarity: rarityKey,
                weight: weight,
                value: finalValue,
                location: LOCATIONS[this.state.location].name,
                buff: appliedBuff // Pass buff to minigame data
            });
        }

        rollRarity(luck, pityBonus = 0) {
            // Weighted pool roll with tier-specific diminishing returns.
            // Legendary and mythic have hard-capped weight bonuses so they
            // remain genuinely rare even at maximum luck.
            const effectiveLuck = luck + pityBonus;
            const sqrtLuck = Math.sqrt(effectiveLuck);
            let pool = [];

            for (let k of Object.keys(RARITY)) {
                let weight = RARITY[k].weight;

                if (k === 'common') {
                    // Common shrinks linearly with luck (floor of 10)
                    weight = Math.max(10, weight - (effectiveLuck * 0.1));
                } else if (k === 'uncommon') {
                    weight += effectiveLuck * 0.06;
                } else if (k === 'rare') {
                    weight += effectiveLuck * 0.04;
                } else if (k === 'epic') {
                    // Diminishing returns via sqrt, capped at +18
                    weight += Math.min(sqrtLuck * 0.5, 18);
                } else if (k === 'legendary') {
                    // Hard cap: even at max luck, weight only reaches ~12
                    weight += Math.min(sqrtLuck * 0.2, 6);
                } else if (k === 'mythic') {
                    // Strongest cap: mythic should always feel special (~6 max)
                    weight += Math.min(sqrtLuck * 0.1, 3);
                }

                for (let i = 0; i < Math.floor(weight); i++) pool.push(k);
            }

            // Advantage reroll: high luck grants up to 50% chance to roll
            // twice and take the rarer result (lower base weight = rarer).
            const rerollChance = Math.min(0.5, effectiveLuck / 1000);
            if (Math.random() < rerollChance) {
                const a = pool[Math.floor(Math.random() * pool.length)];
                const b = pool[Math.floor(Math.random() * pool.length)];
                return RARITY[a].weight <= RARITY[b].weight ? a : b;
            }

            return pool[Math.floor(Math.random() * pool.length)];
        }

        pickFish(loc, rarity) {
            const table = FISH_DB[loc]?.[rarity];
            if (!table) return null; // Fallback
            const f = table[Math.floor(Math.random() * table.length)];
            return { name: f[0], minWeight: f[1], maxWeight: f[2] };
        }

        generateWeight(mean, max) {
            // Simplified variance
            let w = mean + ((Math.random() - 0.5) * (mean * 0.5));
            return parseFloat(Math.min(max * 1.5, Math.max(0.1, w)).toFixed(2));
        }

        /* --- MECHANICS: MINIGAME --- */
        startMinigame(fishData) {
            this.minigame.fishOnLine = fishData;
            this.minigame.active = true;

            const diff = RARITY[fishData.rarity].difficulty;

            // Setup Logic
            this.minigame.pos = 0;
            this.minigame.direction = 1;
            this.minigame.targetWidth = Math.max(10, 30 * diff);
            this.minigame.targetStart = Math.random() * (90 - this.minigame.targetWidth) + 5;

            // Speed based on rarity + minor random variation
            let baseSpeed = 1.0;
            if (fishData.rarity === 'legendary') baseSpeed = 2.0;
            if (fishData.rarity === 'mythic') baseSpeed = 3.5;

            // Apply weather difficulty modifier
            const weatherMod = WEATHER_DATA[this.weather.current].difficulty_mod || 1.0;
            this.minigame.speed = (baseSpeed + (Math.random() * 0.5)) * weatherMod;

            // Update UI
            this.ui.showMinigame(true);
            this.ui.updateStatus(`HOOKED! ${fishData.rarity.toUpperCase()} catch! Reel it in!`);
            document.getElementById('action-btn').textContent = "REEL NOW!";
            document.getElementById('action-btn').classList.add('reeling');

            // Set CSS for target zone
            const zone = document.getElementById('mg-target');
            zone.style.left = this.minigame.targetStart + '%';
            zone.style.width = this.minigame.targetWidth + '%';
        }

        updateMinigame() {
            // Move indicator
            this.minigame.pos += this.minigame.speed * this.minigame.direction;
            if (this.minigame.pos >= 100 || this.minigame.pos <= 0) {
                this.minigame.direction *= -1;
            }
            // Update DOM directly for smoothness
            document.getElementById('mg-indicator').style.left = this.minigame.pos + '%';
        }

        resolveMinigame() {
            if (!this.minigame.active) return;

            const fish = this.minigame.fishOnLine;
            const rod = RODS.find(r => r.id === this.state.rod);

            // Pre-check: Fish too heavy for rod? It ALWAYS escapes - never catchable
            if (fish.weight > rod.capacity) {
                this.minigame.active = false;
                this.ui.showMinigame(false);
                document.getElementById('action-btn').classList.remove('reeling');

                this.log(`RELEASED! ${fish.name} (${fish.weight}kg) was too heavy to lift with your ${rod.name} (${rod.capacity}kg max).`);
                this.ui.updateStatus(`${fish.name} broke free! Too heavy!`, "danger");
                this.ui.floatText("TOO HEAVY!");
                this.achievementManager.onWeightFail(fish);
                this.breakCombo();
                return;
            }

            const hit = this.minigame.pos >= this.minigame.targetStart &&
                this.minigame.pos <= (this.minigame.targetStart + this.minigame.targetWidth);

            this.minigame.active = false;
            this.ui.showMinigame(false);
            document.getElementById('action-btn').classList.remove('reeling');

            if (hit) {
                this._catchAuthorized = true; // Vuln #2: authorize catch before calling
                this.catchSuccess(fish);
            } else {
                this.catchFail(fish);
            }
        }

        /* --- MECHANICS: RESOLUTION --- */
        catchSuccess(fish) {
            // Vuln #2: Only accept catches from legitimate game flow
            if (!this._catchAuthorized) return;
            this._catchAuthorized = false;

            // Vuln #4: Rate limit — prevent loop-based speedhacks
            const now = Date.now();
            if (this._lastCatchTime && now - this._lastCatchTime < 400) return;
            this._lastCatchTime = now;

            // 1. Success!
            this.incrementCombo();

            // Apply Combo Bonus to Value
            const comboBonus = 1 + (this.state.combo * 0.1);
            fish.value = Math.floor(fish.value * comboBonus);

            // 2. Roll Shiny Variant (surprise multiplier)
            this._rollVariant(fish);

            // 3. Roll Critical Catch (combo-scaled burst)
            const isCrit = this._rollCritical(fish, this.state.combo);

            // 4. Add to Inventory with unique ID
            const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            this.state.inventory.push({ ...fish, id: uniqueId });
            this.state.totalCatches++;
            this.inventory.render();
            this._consumeAmulet();

            // 5. Pity timer update
            this._updatePity(fish.rarity);

            // 6. XP
            this.gainXp(RARITY[fish.rarity].xp);

            // 7. Build log message
            let logMsg = `Caught ${fish.name} (${fish.weight}kg)`;
            if (fish.variant) logMsg = `${fish.variant.icon} ${logMsg} [${fish.variant.label}]`;
            if (isCrit) logMsg += ' ⚡CRITICAL!';
            logMsg += ` | +${fish.value} coins value`;
            this.log(logMsg);

            let statusMsg = `Caught ${fish.name}!`;
            if (fish.variant) statusMsg = `${fish.variant.icon} ${fish.variant.label} ${fish.name}!`;
            if (isCrit) statusMsg += ' ⚡CRITICAL!';
            this.ui.updateStatus(statusMsg, 'success');
            this.ui.updateLastCatch(fish);
            this.ui.renderStats();

            // 8. Check milestone rewards
            this._checkMilestone();

            // 9. Achievement check
            this.achievementManager.onCatch(fish);

            this.saveSystem.save();
        }

        catchFail(fish) {
            // Near-miss feedback: show exactly what escaped
            const rarityName = RARITY[fish.rarity].name;
            const tierIndex = Object.keys(RARITY).indexOf(fish.rarity);
            let msg, statusType;

            if (tierIndex >= 4) {
                // Legendary or Mythic — maximum drama
                msg = `😱 A ${rarityName.toUpperCase()} ${fish.name} (${fish.weight}kg) escaped! So close!`;
                statusType = 'danger';
                this.ui.floatTextStyled(`${rarityName.toUpperCase()} ESCAPED!`, RARITY[fish.rarity].color);
            } else if (tierIndex >= 3) {
                // Epic
                msg = `😤 An ${rarityName} ${fish.name} (${fish.weight}kg) got away!`;
                statusType = 'warning';
                this.ui.floatTextStyled(`${rarityName} escaped!`, RARITY[fish.rarity].color);
            } else if (tierIndex >= 2) {
                // Rare
                msg = `A ${rarityName} ${fish.name} slipped off the hook!`;
                statusType = 'warning';
            } else {
                msg = `${fish.name} escaped...`;
                statusType = 'warning';
            }

            this.log(msg);
            this.ui.updateStatus(msg, statusType);
            this.breakCombo();
        }

        _consumeAmulet() {
            const biome = this.state.location;
            if (this.state.activeAmulet !== biome) return;
            if (!this.state.amuletStock[biome] || this.state.amuletStock[biome] <= 0) {
                this.state.activeAmulet = null;
                return;
            }
            this.state.amuletStock[biome]--;
            this.achievementManager.onAmuletUsed();
            if (this.state.amuletStock[biome] <= 0) {
                this.state.activeAmulet = null;
                this.log(`Amulet for ${LOCATIONS[biome].name} has been used up!`);
            }
        }

        /* --- COMBO SYSTEM --- */
        incrementCombo() {
            // Manual mode capped at 20x combo
            if (this.state.combo < 20) {
                this.state.combo++;
                if (this.state.combo > 1) this.ui.floatText(`Combo x${this.state.combo}!`);
            }
            // Cap reached — UI already shows "20x", no log spam needed
            this.achievementManager.onComboChange(this.state.combo, this.autoFish.enabled);
            this.ui.renderStats();
        }

        breakCombo() {
            if (this.state.combo > 1) this.log(`Combo of ${this.state.combo} lost.`);
            this.state.combo = 0;
            this.ui.renderStats();
        }

        /* --- XP & LEVELS --- */
        gainXp(amount) {
            this.state.xp += amount;
            while (this.state.xp >= this.getXpNext()) {
                this.state.xp -= this.getXpNext();
                this.state.level++;
                this.log(`LEVEL UP! You are now level ${this.state.level}`);
                this.ui.floatText("LEVEL UP!");
            }
            this.ui.renderStats();
        }

        getXpNext() {
            return this.state.level * 1000 + Math.pow(this.state.level, 2) * 100;
        }

        /* --- AUTO-FISHING SYSTEM (Background-safe via Web Worker) --- */
        toggleAutoFish() {
            this.autoFish.enabled = !this.autoFish.enabled;
            this.state.autoFishEnabled = this.autoFish.enabled;
            const btn = document.getElementById('auto-fish-btn');
            const castBtn = document.getElementById('action-btn');

            if (this.autoFish.enabled) {
                btn.textContent = '🤖 Auto: ON';
                btn.classList.add('active');
                castBtn.disabled = true;
                castBtn.style.opacity = '0.5';
                this.log('Auto-fishing ENABLED (runs in background).');
                this.startAutoFishCycle();
            } else {
                btn.textContent = '🤖 Auto: OFF';
                btn.classList.remove('active');
                castBtn.disabled = false;
                castBtn.style.opacity = '1';
                castBtn.textContent = 'Cast Line';
                this.autoFish.phase = 'idle';
                this._cancelWorkerTimeout(this.autoFish.timer);
                this.autoFish.timer = null;
                this.ui.showMinigame(false);
                document.getElementById('auto-cooldown-container').style.display = 'none';
                this.ui.updateStatus('Auto-fishing disabled. Ready to cast...');
                this.log('Auto-fishing DISABLED.');
            }
            this.saveSystem.save();
        }

        startAutoFishCycle() {
            if (!this.autoFish.enabled) return;

            this.autoFish.phase = 'casting';
            document.getElementById('action-btn').textContent = 'Auto Mode';

            // Randomized cooldown between 1-3 seconds for realistic auto-fishing
            const cooldown = 1000 + Math.random() * 2000;

            // Track cooldown timing for background sync
            this.autoFish.cooldownStart = Date.now();
            this.autoFish.cooldownDuration = cooldown;

            // Show and animate cooldown progress bar
            const container = document.getElementById('auto-cooldown-container');
            const fill = document.getElementById('cooldown-bar-fill');
            container.style.display = 'block';
            fill.style.width = '0%';

            this.ui.updateStatus('🤖 Auto-fishing...');

            // Animate cooldown bar (only runs when tab is visible)
            const startTime = performance.now();
            const animateCooldown = (currentTime) => {
                if (!this.autoFish.enabled || this.autoFish.phase !== 'casting') {
                    container.style.display = 'none';
                    return;
                }

                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / cooldown, 1);
                fill.style.width = (progress * 100) + '%';

                if (progress < 1) {
                    requestAnimationFrame(animateCooldown);
                }
            };
            requestAnimationFrame(animateCooldown);

            // Use Worker timer — fires reliably even in background tabs
            this.autoFish.timer = this._workerTimeout(() => {
                if (!this.autoFish.enabled) return;
                container.style.display = 'none';
                this.autoCast();
            }, cooldown);
        }

        autoCast() {
            if (!this.autoFish.enabled) return;

            const rod = RODS.find(r => r.id === this.state.rod);
            const bait = BAITS.find(b => b.id === this.state.bait);

            // Calculate Luck & Roll (rod + bait + amulet) * weather
            let baseLuck = rod.luck + bait.luck;
            if (this.state.activeAmulet === this.state.location && AMULETS[this.state.activeAmulet]) {
                baseLuck += AMULETS[this.state.activeAmulet].luckBonus;
            }
            let totalLuck = baseLuck * this.getWeatherMultiplier();
            const rarityKey = this.rollRarity(totalLuck, this._getPityBonus());
            const fishTemplate = this.pickFish(this.state.location, rarityKey);

            if (!fishTemplate) {
                this.log('🤖 Nothing bit... Retrying.');
                this.ui.updateStatus('🤖 Nothing bit... Casting again...');
                this.startAutoFishCycle();
                return;
            }

            const mean = (fishTemplate.minWeight + fishTemplate.maxWeight) / 2;
            const weight = this.generateWeight(mean, fishTemplate.maxWeight);

            this.minigame.fishOnLine = {
                name: fishTemplate.name,
                rarity: rarityKey,
                weight: weight,
                value: Math.floor(weight * RARITY[rarityKey].mult),
                location: LOCATIONS[this.state.location].name
            };

            // Apply weather buff chance (same as manual cast)
            const weatherInfo = WEATHER_DATA[this.weather.current];
            if (weatherInfo.buff && Math.random() < weatherInfo.buffChance) {
                this.minigame.fishOnLine.buff = weatherInfo.buff;
                this.minigame.fishOnLine.value = Math.floor(this.minigame.fishOnLine.value * (1 + weatherInfo.valBonus));
            }

            // Phase 2: Hook Time (based on rod speed, very fast)
            this.autoFish.phase = 'hooking';
            const hookDelay = Math.max(100, 500 - (rod.speed * 8));
            this.ui.updateStatus(`🤖 Waiting for a bite...`);

            this.autoFish.timer = this._workerTimeout(() => {
                if (!this.autoFish.enabled) return;
                this.autoReel();
            }, hookDelay);
        }

        autoReel() {
            if (!this.autoFish.enabled) return;

            const fish = this.minigame.fishOnLine;
            this.autoFish.phase = 'reeling';
            this.ui.updateStatus(`🤖 HOOKED! Reeling in ${fish.rarity.toUpperCase()} ${fish.name}...`);
            document.getElementById('action-btn').textContent = 'Reeling...';

            // Phase 3: Reel Time (0.5 seconds - faster than manual)
            this.autoFish.timer = this._workerTimeout(() => {
                if (!this.autoFish.enabled) return;
                this.autoResolve();
            }, 500);
        }

        autoResolve() {
            if (!this.autoFish.enabled) return;

            const fish = this.minigame.fishOnLine;
            const rod = RODS.find(r => r.id === this.state.rod);

            // Capacity Check - Fish too heavy ALWAYS escapes (same as manual mode)
            if (fish.weight > rod.capacity) {
                this.log(`🤖 RELEASED! ${fish.name} (${fish.weight}kg) was too heavy to lift with ${rod.name} (${rod.capacity}kg max).`);
                this.ui.updateStatus(`🤖 ${fish.name} broke free! Too heavy!`, 'danger');
                this.achievementManager.onWeightFail(fish);
                this.breakCombo();
            } else {
                // Auto-fishing has a 10x combo limit for balance
                if (this.state.combo < 10) {
                    this.incrementCombo();
                }
                // Cap reached — no log spam needed

                // Apply Combo Bonus to Value
                const comboBonus = 1 + (this.state.combo * 0.1);
                fish.value = Math.floor(fish.value * comboBonus);

                // Roll variant & critical (same as manual)
                this._rollVariant(fish);
                const isCrit = this._rollCritical(fish, this.state.combo);

                // Add to Inventory with unique ID
                const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                this.state.inventory.push({ ...fish, id: uniqueId });
                this.state.totalCatches++;
                this.inventory.render();
                this._consumeAmulet();
                this._updatePity(fish.rarity);
                this.gainXp(RARITY[fish.rarity].xp);

                let logMsg = `🤖 Caught ${fish.name} (${fish.weight}kg)`;
                if (fish.variant) logMsg = `🤖 ${fish.variant.icon} ${fish.name} [${fish.variant.label}]`;
                if (isCrit) logMsg += ' ⚡CRITICAL!';
                logMsg += ` | +${fish.value} coins value`;
                this.log(logMsg);

                let statusMsg = `🤖 Caught ${fish.name}!`;
                if (fish.variant) statusMsg = `🤖 ${fish.variant.icon} ${fish.variant.label} ${fish.name}!`;
                if (isCrit) statusMsg += ' ⚡CRITICAL!';
                this.ui.updateStatus(statusMsg, 'success');
                this.ui.updateLastCatch(fish);
                this.ui.renderStats();
                this._checkMilestone();
                this.achievementManager.onCatch(fish);
                this.saveSystem.save();
            }

            this.minigame.fishOnLine = null;

            // Start next cycle
            this.autoFish.phase = 'idle';
            this.startAutoFishCycle();
        }

        /* --- OFFLINE PROGRESSION --- */
        processOfflineCatches() {
            // E2 fix: Prevent repeated calls from console
            if (this._offlineProcessed) return;
            this._offlineProcessed = true;

            if (!this.state.autoFishEnabled) return;
            if (!this.state.lastSaveTimestamp) return;

            const now = Date.now();
            const rawElapsed = now - this.state.lastSaveTimestamp;
            // E1 fix: Cap offline time to 8 hours to prevent time-travel exploits
            const MAX_OFFLINE_MS = 28800000; // 8 hours
            const elapsed = Math.min(Math.max(rawElapsed, 0), MAX_OFFLINE_MS);
            this.achievementManager.onOfflineReturn(rawElapsed);
            if (elapsed < 5000) return; // Less than 5 seconds away — not worth simulating

            const rod = RODS.find(r => r.id === this.state.rod);
            const bait = BAITS.find(b => b.id === this.state.bait);
            if (!rod || !bait) return;

            // Average cycle time: ~2.5s cooldown + ~0.3s hook + 0.5s reel = ~3.3s
            const avgCycleMs = 3300;
            const maxCycles = Math.min(Math.floor(elapsed / avgCycleMs), 500); // Cap at 500 to prevent oversized saves
            if (maxCycles <= 0) return;

            let totalFishCaught = 0;
            let totalCoins = 0;
            let totalXpGained = 0;
            let combo = Math.min(this.state.combo, 10);

            // Calculate luck (same as autoCast)
            let baseLuck = rod.luck + bait.luck;
            if (this.state.activeAmulet === this.state.location && AMULETS[this.state.activeAmulet]) {
                baseLuck += AMULETS[this.state.activeAmulet].luckBonus;
            }
            const weatherMult = this.getWeatherMultiplier();
            let totalLuck = baseLuck * weatherMult;

            let pity = this.state.pityCounter || 0;

            for (let i = 0; i < maxCycles; i++) {
                // Pity bonus applied to rarity roll
                const pityBonus = pity >= 30 ? 100 : pity >= 20 ? 50 : pity >= 10 ? 20 : 0;
                const rarityKey = this.rollRarity(totalLuck, pityBonus);
                const fishTemplate = this.pickFish(this.state.location, rarityKey);

                if (!fishTemplate) {
                    combo = 0;
                    continue;
                }

                const mean = (fishTemplate.minWeight + fishTemplate.maxWeight) / 2;
                const weight = this.generateWeight(mean, fishTemplate.maxWeight);

                // Capacity check — fish too heavy escapes
                if (weight > rod.capacity) {
                    combo = 0;
                    continue;
                }

                // Successful catch
                if (combo < 10) combo++;
                const comboBonus = 1 + (combo * 0.1);
                let value = Math.floor(Math.floor(weight * RARITY[rarityKey].mult) * comboBonus);

                // Apply weather buff chance
                const weatherInfo = WEATHER_DATA[this.weather.current];
                if (weatherInfo.buff && Math.random() < weatherInfo.buffChance) {
                    value = Math.floor(value * (1 + weatherInfo.valBonus));
                }

                // Roll variant (offline)
                const variantRoll = Math.random();
                if (variantRoll < 0.01) {
                    value = Math.floor(value * 10); // Prismatic
                } else if (variantRoll < 0.05) {
                    value = Math.floor(value * 5);  // Shadow
                } else if (variantRoll < 0.13) {
                    value = Math.floor(value * 3);  // Golden
                }

                // Roll critical (offline)
                const critChance = 0.08 + (combo * 0.0085);
                if (Math.random() < critChance) value = Math.floor(value * 2);

                // Update pity
                const tierIdx = Object.keys(RARITY).indexOf(rarityKey);
                if (tierIdx >= 2) { pity = 0; } else { pity++; }

                // Offline fish go directly to coins (not inventory) to prevent localStorage bloat
                // B2 note: Achievement hooks intentionally not fired for offline catches (limited simulation)
                totalFishCaught++;
                totalCoins += value;

                // Consume amulet stock
                if (this.state.activeAmulet === this.state.location && this.state.amuletStock[this.state.location] > 0) {
                    this.state.amuletStock[this.state.location]--;
                    if (this.state.amuletStock[this.state.location] <= 0) {
                        this.state.activeAmulet = null;
                        baseLuck = rod.luck + bait.luck;
                        totalLuck = baseLuck * weatherMult;
                    }
                }

                // XP (B3 fix: evaluate getXpNext() fresh each iteration)
                const xpGain = RARITY[rarityKey].xp;
                totalXpGained += xpGain;
                this.state.xp += xpGain;
                while (this.state.xp >= this.getXpNext()) {
                    this.state.xp -= this.getXpNext();
                    this.state.level++;
                }

                this.state.totalCatches++;

                // B1 fix: Check milestones during offline progression
                const c = this.state.totalCatches;
                if (c > 0 && c % 100 === 0) { totalCoins += 15000; }
                else if (c > 0 && c % 50 === 0) { totalCoins += 5000; }
                else if (c > 0 && c % 25 === 0) { totalCoins += 2000; }
                else if (c > 0 && c % 10 === 0) { totalCoins += 500; }
            }

            this.state.pityCounter = pity;

            this.state.combo = combo;

            if (totalFishCaught > 0) {
                // Add offline earnings directly to coins
                this.state.coins += totalCoins;
                this.state.lastSaveTimestamp = now;
                this.saveSystem.save();
                this.showOfflinePopup(elapsed, totalFishCaught, totalCoins, totalXpGained);
            }
        }

        /* --- ACHIEVEMENTS MODAL --- */
        openAchievements() {
            this.achievementManager.renderModal();
            document.getElementById('achievements-overlay').classList.add('active');
            document.getElementById('achievements-modal').classList.add('active');
        }

        closeAchievements() {
            document.getElementById('achievements-overlay').classList.remove('active');
            document.getElementById('achievements-modal').classList.remove('active');
        }

        showOfflinePopup(elapsedMs, fishCount, coins, xp) {
            // Format time
            const totalSec = Math.floor(elapsedMs / 1000);
            let timeStr;
            if (totalSec < 60) {
                timeStr = `${totalSec}s`;
            } else if (totalSec < 3600) {
                const m = Math.floor(totalSec / 60);
                const s = totalSec % 60;
                timeStr = `${m}m ${s}s`;
            } else {
                const h = Math.floor(totalSec / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                timeStr = `${h}h ${m}m`;
            }

            // Create popup element
            const popup = document.createElement('div');
            popup.className = 'offline-popup';
            popup.innerHTML = `
            <div class="offline-popup-header">
                <span>🤖 Welcome Back!</span>
                <button class="offline-popup-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <p>While you were away <strong>${timeStr}</strong>, you caught <strong>${fishCount}</strong> fish worth <strong>${coins.toLocaleString()}</strong> coins.</p>
            <p style="font-size:0.8rem;color:#6b7280;">+${xp} XP earned</p>
        `;
            document.body.appendChild(popup);

            // Auto-dismiss after 8 seconds
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.classList.add('offline-popup-fade');
                    setTimeout(() => popup.remove(), 500);
                }
            }, 8000);
        }

        log(msg) {
            const ul = document.getElementById('game-log');
            const li = document.createElement('li');
            li.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
            ul.prepend(li);
            if (ul.children.length > 20) ul.lastChild.remove();
        }

        /* --- REWARD SYSTEMS --- */

        /** Roll a shiny variant on a caught fish. Mutates fish in-place. */
        _rollVariant(fish) {
            const roll = Math.random();
            if (roll < 0.01) {
                fish.variant = { label: 'Prismatic', icon: '🌈', mult: 10 };
            } else if (roll < 0.05) {
                fish.variant = { label: 'Shadow', icon: '🌑', mult: 5 };
            } else if (roll < 0.13) {
                fish.variant = { label: 'Golden', icon: '🌟', mult: 3 };
            }
            if (fish.variant) {
                fish.value = Math.floor(fish.value * fish.variant.mult);
                this.ui.floatTextStyled(
                    `${fish.variant.icon} ${fish.variant.label}!`,
                    fish.variant.label === 'Prismatic' ? '#e879f9' :
                        fish.variant.label === 'Shadow' ? '#6366f1' : '#facc15'
                );
            }
        }

        /** Roll a critical catch. Returns true if critical hit. Mutates fish value. */
        _rollCritical(fish, combo) {
            const critChance = 0.08 + (combo * 0.0085);
            if (Math.random() < critChance) {
                fish.value = Math.floor(fish.value * 2);
                this.ui.floatTextStyled('⚡ CRITICAL!', '#f43f5e');
                return true;
            }
            return false;
        }

        /** Update the pity counter. Resets on rare+ catch, increments on common/uncommon. */
        _updatePity(rarityKey) {
            const tierIndex = Object.keys(RARITY).indexOf(rarityKey);
            if (tierIndex >= 2) {
                // Rare or above — reset pity and announce drought break if it was long
                if (this.state.pityCounter >= 15) {
                    this.ui.floatTextStyled('🎯 Drought Broken!', '#4ade80');
                }
                this.state.pityCounter = 0;
            } else {
                this.state.pityCounter++;
            }
        }

        /** Get the current pity luck bonus based on drought length. */
        _getPityBonus() {
            const p = this.state.pityCounter || 0;
            if (p >= 30) return 100;
            if (p >= 20) return 50;
            if (p >= 10) return 20;
            return 0;
        }

        /** Check if totalCatches hit a milestone and award bonus coins. */
        _checkMilestone() {
            const c = this.state.totalCatches;
            let bonus = 0;
            let msg = '';

            if (c > 0 && c % 100 === 0) {
                bonus = 15000;
                msg = `💎 Century Catch #${c}! +${bonus.toLocaleString()} bonus coins!`;
            } else if (c > 0 && c % 50 === 0) {
                bonus = 5000;
                msg = `🔥 ${c} Catches! +${bonus.toLocaleString()} bonus coins!`;
            } else if (c > 0 && c % 25 === 0) {
                bonus = 2000;
                msg = `🏆 ${c} Catches! +${bonus.toLocaleString()} bonus coins!`;
            } else if (c > 0 && c % 10 === 0) {
                bonus = 500;
                msg = `🎉 ${c}-Catch Streak! +${bonus.toLocaleString()} bonus coins!`;
            }

            if (bonus > 0) {
                this.state.coins += bonus;
                this.log(msg);
                this.ui.floatTextStyled(msg, '#facc15');
                this.ui.renderStats();
            }
        }
    }

    /* --- INIT --- */
    const game = new Game();

    // Event Listener for the Main Button
    document.getElementById('action-btn').addEventListener('click', () => {
        if (game.minigame.active) {
            game.resolveMinigame();
            document.getElementById('action-btn').textContent = "Cast Line";
        } else {
            document.getElementById('action-btn').textContent = "Waiting...";
            game.startCast();
        }
    });

    // Auto-Fish Button Event Listener
    document.getElementById('auto-fish-btn').addEventListener('click', () => {
        game.toggleAutoFish();
    });

    // Frozen public API — only these methods are accessible from HTML onclick handlers
    // game itself is NOT global (trapped inside IIFE closure)
    window.GameAPI = Object.freeze({
        shopOpen: () => game.shop.open(),
        shopClose: () => game.shop.close(),
        shopSwitchTab: (t) => game.shop.switchTab(t),
        shopBuyWeather: (k) => game.shop.buyWeather(k),
        shopRemoveWeather: (k) => game.shop.removeWeather(k),
        shopBuyAmulet: (k) => game.shop.buyAmulet(k),
        shopWearAmulet: (k) => game.shop.wearAmulet(k),
        shopBuyRod: (id) => game.shop.buyRod(id),
        shopBuyBait: (id) => game.shop.buyBait(id),
        inventorySellAll: () => game.inventory.sellAll(),
        manualSave: () => game.saveSystem.manualSave(),
        resetData: () => game.saveSystem.resetData(),
        openAchievements: () => game.openAchievements(),
        closeAchievements: () => game.closeAchievements(),
    });

    // Init Game
    game.init();

})(); // End IIFE
