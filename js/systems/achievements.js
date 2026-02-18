/**
 * ACHIEVEMENT SYSTEM
 * Tracks and awards achievements based on game events.
 * Persists state via game.state.achievements (set of unlocked IDs)
 * and game.state.achievementCounters (e.g. amulets used).
 */

class AchievementManager {
    constructor(game) {
        this.game = game;
        // Ensure state containers exist (save.js may have loaded them)
        if (!this.game.state.achievements) this.game.state.achievements = [];
        if (!this.game.state.achievementCounters) this.game.state.achievementCounters = {};
    }

    /** Check if an achievement is already unlocked */
    has(id) {
        return this.game.state.achievements.includes(id);
    }

    /** Unlock an achievement if not already unlocked */
    unlock(id) {
        if (this.has(id)) return;
        if (!ACHIEVEMENTS[id]) return;

        this.game.state.achievements.push(id);
        const ach = ACHIEVEMENTS[id];
        this.game.log(`🏆 Achievement Unlocked: ${ach.icon} ${ach.name}`);
        this._showToast(ach);
        this._updateCounter();
        this.game.saveSystem.save();
    }

    /** Increment a named counter (e.g. 'amuletsUsed') and return new value */
    incrementCounter(key, amount = 1) {
        const c = this.game.state.achievementCounters;
        c[key] = (c[key] || 0) + amount;
        return c[key];
    }

    getCounter(key) {
        return this.game.state.achievementCounters[key] || 0;
    }

    /** Update the trophy counter in the UI */
    _updateCounter() {
        const el = document.getElementById('achievement-count');
        if (el) {
            el.textContent = `${this.game.state.achievements.length}/${Object.keys(ACHIEVEMENTS).length}`;
        }
    }

    /** Show a toast notification for an unlocked achievement */
    _showToast(ach) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-toast-icon">${ach.icon}</div>
            <div class="achievement-toast-body">
                <div class="achievement-toast-title">🏆 Achievement Unlocked!</div>
                <div class="achievement-toast-name">${ach.name}</div>
                <div class="achievement-toast-desc">${ach.desc}</div>
            </div>
        `;
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.classList.add('show'));

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }

    // =========================================================
    //  EVENT HOOKS — Called from engine.js at various points
    // =========================================================

    /** Called after any successful catch (manual or auto) */
    onCatch(fish) {
        const s = this.game.state;

        // #1 From Humble Beginnings
        if (!this.has('humble_beginnings') && s.rod === 'bamboo') {
            this.unlock('humble_beginnings');
        }

        // #8 Heavy Lifter
        if (!this.has('heavy_lifter') && fish.weight > 500) {
            this.unlock('heavy_lifter');
        }

        // #10 Storm Chaser
        if (!this.has('storm_chaser')) {
            const w = this.game.weather.current;
            if (w === 'storm' || w === 'gale') {
                this.unlock('storm_chaser');
            }
        }

        // #19 Night Owl
        if (!this.has('night_owl') && s.location === 'midnight') {
            const hour = new Date().getHours();
            if (hour >= 0 && hour < 4) {
                this.unlock('night_owl');
            }
        }

        // #20 Frozen Assets
        if (!this.has('frozen_assets') && fish.buff === 'Cryo-Preserved') {
            this.unlock('frozen_assets');
        }

        // Biome-specific fish achievements (#12-16, #18)
        const fishChecks = [
            'glitch_matrix', 'sugar_rush', 'paper_cut',
            'time_traveler', 'void_stare', 'fish_404'
        ];
        for (const achId of fishChecks) {
            if (!this.has(achId) && ACHIEVEMENTS[achId].fish) {
                if (ACHIEVEMENTS[achId].fish.includes(fish.name)) {
                    this.unlock(achId);
                }
            }
        }
    }

    /** Called when a fish escapes due to weight limit */
    onWeightFail(fish) {
        // #9 The One That Got Away
        if (!this.has('one_that_got_away')) {
            if (fish.rarity === 'mythic' || fish.rarity === 'legendary') {
                this.unlock('one_that_got_away');
            }
        }
    }

    /** Called when combo changes */
    onComboChange(combo, isAuto) {
        // #6 Flow State (manual only, combo 20)
        if (!this.has('flow_state') && !isAuto && combo >= 20) {
            this.unlock('flow_state');
        }
        // #7 Bot Buddy (auto-fish combo cap = 10)
        if (!this.has('bot_buddy') && isAuto && combo >= 10) {
            this.unlock('bot_buddy');
        }
    }

    /** Called when a rod or bait is purchased */
    onPurchase(type, id) {
        if (type === 'rod') {
            // #3 Gearhead
            if (!this.has('gearhead') && id === 'alloy') {
                this.unlock('gearhead');
            }
            // #4 The Omni-Presence
            if (!this.has('omni_presence') && id === 'omniverse') {
                this.unlock('omni_presence');
            }
        }
        if (type === 'bait') {
            // #5 Singularity Seeker
            if (!this.has('singularity_seeker') && id === 'singularity') {
                this.unlock('singularity_seeker');
            }
        }
    }

    /** Called when inventory is sold (coins change) */
    onCoinsChange() {
        // #2 Pastel Tycoon
        if (!this.has('pastel_tycoon') && this.game.state.coins >= 1000000) {
            this.unlock('pastel_tycoon');
        }
    }

    /** Called when a weather is purchased */
    onWeatherPurchase() {
        // #11 Weather God
        if (!this.has('weather_god') && this.game.state.activeWeathers.length >= 5) {
            this.unlock('weather_god');
        }
    }

    /** Called when an amulet is consumed */
    onAmuletUsed() {
        const count = this.incrementCounter('amuletsUsed');
        // #17 Local Legend
        if (!this.has('local_legend') && count >= 50) {
            this.unlock('local_legend');
        }
    }

    /** Called when offline catches are processed */
    onOfflineReturn(elapsedMs) {
        // #21 Welcome Back, Kotter
        if (!this.has('welcome_back') && elapsedMs > 86400000) {
            this.unlock('welcome_back');
        }
    }

    /** Render the achievements modal content */
    renderModal() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        const categories = [
            { key: 'progression', label: '📈 Progression & Economy' },
            { key: 'skill', label: '🎣 Skill & Mechanics' },
            { key: 'biome', label: '🌍 Biome & Lore' },
            { key: 'secret', label: '🥚 Secret & Fun' }
        ];

        let html = '';
        for (const cat of categories) {
            const entries = Object.entries(ACHIEVEMENTS).filter(([, a]) => a.category === cat.key);
            html += `<div class="achievement-category"><h3>${cat.label}</h3>`;
            for (const [id, ach] of entries) {
                const unlocked = this.has(id);
                const hidden = ach.secret && !unlocked;
                html += `
                    <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${hidden ? '❓' : ach.icon}</div>
                        <div class="achievement-info">
                            <div class="achievement-name">${hidden ? '???' : ach.name}</div>
                            <div class="achievement-desc">${hidden ? 'This achievement is a secret...' : ach.desc}</div>
                        </div>
                        ${unlocked ? '<div class="achievement-check">✅</div>' : ''}
                    </div>
                `;
            }
            html += '</div>';
        }
        container.innerHTML = html;
    }

    /** Initialize — update counter and check for any retroactive unlocks */
    init() {
        this._updateCounter();
        // Retroactive check for coins
        this.onCoinsChange();
        // Retroactive check for equipment
        if (this.game.state.rodsOwned.includes('alloy')) this.onPurchase('rod', 'alloy');
        if (this.game.state.rodsOwned.includes('omniverse')) this.onPurchase('rod', 'omniverse');
        if (this.game.state.baitsOwned.includes('singularity')) this.onPurchase('bait', 'singularity');
        // Retroactive check for weathers
        if (this.game.state.activeWeathers.length >= 5) this.onWeatherPurchase();
    }
}
