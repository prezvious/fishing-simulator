/**
 * MYTHIC WATERS: ENHANCED EDITION
 * Logic Breakdown:
 * 1. Data Definitions (Fish, Rods, Locations)
 * 2. State Management (Coins, XP, Inventory)
 * 3. Mechanics (Minigame, Weather, Rarity Rolls)
 * 4. UI Rendering
 */

/* --- 1. DATA DEFINITIONS --- */

const RARITY = {
    common: { name: "Common", color: "#94a3b8", weight: 42, mult: 4, xp: 75, difficulty: 0.8 }, // Difficulty: size of target zone (0-1)
    uncommon: { name: "Uncommon", color: "#4ade80", weight: 24, mult: 9, xp: 150, difficulty: 0.6 },
    rare: { name: "Rare", color: "#6dd6ff", weight: 15, mult: 25, xp: 350, difficulty: 0.45 },
    epic: { name: "Epic", color: "#a78bfa", weight: 10, mult: 45, xp: 800, difficulty: 0.3 },
    legendary: { name: "Legendary", color: "#fb7185", weight: 6, mult: 110, xp: 2000, difficulty: 0.2 },
    mythic: { name: "Mythic", color: "#facc15", weight: 3, mult: 260, xp: 5000, difficulty: 0.12 }
};

const RODS = [
    { id: 'bamboo', name: 'Bamboo Pole', cost: 0, luck: 2, capacity: 15, speed: 5 },
    { id: 'fiberglass', name: 'Fiberglass Rod', cost: 450, luck: 12, capacity: 35, speed: 10 },
    { id: 'graphite', name: 'Graphite Precision', cost: 2500, luck: 18, capacity: 60, speed: 15 },
    { id: 'carbon', name: 'Carbon Striker', cost: 2500, luck: 30, capacity: 100, speed: 20 },
    { id: 'alloy', name: 'Titanium Alloy', cost: 8000, luck: 45, capacity: 200, speed: 30 },
    { id: 'neofiber', name: 'Nano-Weave Pro', cost: 50000, luck: 65, capacity: 400, speed: 35 },
    { id: 'quantum', name: 'Quantum Weaver', cost: 25000, luck: 80, capacity: 600, speed: 40 },
    { id: 'starcaller', name: 'Starcaller', cost: 75000, luck: 150, capacity: 2000, speed: 50 },
    { id: 'void', name: 'Void Walker', cost: 250000, luck: 300, capacity: 10000, speed: 60 },
    { id: 'aether', name: 'Aether-Caster', cost: 2500000, luck: 200, capacity: 5000, speed: 55 },
    { id: 'chronos', name: 'Chrono-Spinner', cost: 25000000, luck: 450, capacity: 25000, speed: 70 },
    { id: 'omniverse', name: 'Omni-Verse Rod', cost: 500000000, luck: 800, capacity: 100000, speed: 90 }
];

// Re-sorting rods by cost to ensure logical progression in UI
RODS.sort((a, b) => a.cost - b.cost);

const BAITS = [
    { id: 'worm', name: 'Worm', cost: 0, luck: 1 },
    { id: 'cricket', name: 'Cricket', cost: 150, luck: 7 },
    { id: 'glow_grub', name: 'Biolume Grub', cost: 800, luck: 10 },
    { id: 'minnow', name: 'Live Minnow', cost: 3000, luck: 18 },
    { id: 'flux_jelly', name: 'Flux Jelly', cost: 5000, luck: 25 },
    { id: 'spinner', name: 'Neon Spinner', cost: 5000, luck: 30 },
    { id: 'magic', name: 'Magic Paste', cost: 20000, luck: 60 },
    { id: 'void_shrimp', name: 'Abyssal Shrimp', cost: 25000, luck: 50 },
    { id: 'void_essence', name: 'Void Essence', cost: 50000, luck: 120 },
    { id: 'star_dust', name: 'Stardust Cluster', cost: 200000, luck: 90 },
    { id: 'singularity', name: 'Singularity Lure', cost: 2000000, luck: 200 }
];

// Re-sorting baits by cost
BAITS.sort((a, b) => a.cost - b.cost);

const LOCATIONS = {
    mistvale: {
        name: "Mistvale Lake",
        desc: "A serene lake shrouded in perpetual morning mist.",
        colors: ["#e0f7fa", "#b2ebf2"] // Pastel Cyan
    },
    stone_rapids: {
        name: "Stone Rapids",
        desc: "Fast-flowing waters carving through ancient granite.",
        colors: ["#eceff1", "#cfd8dc"] // Pastel Blue-Grey
    },
    volcanic: {
        name: "Volcanic Bay",
        desc: "Boiling waters rich with minerals and danger.",
        colors: ["#ffe0b2", "#ffcc80"] // Pastel Orange/Peach
    },
    emerald: {
        name: "Emerald Basin",
        desc: "Lush, overgrown waters hiding massive beasts.",
        colors: ["#c8e6c9", "#a5d6a7"] // Pastel Green
    },
    midnight: {
        name: "Midnight Ocean",
        desc: "Deep, dark waters where bioluminescence rules.",
        colors: ["#d1c4e9", "#b39ddb"] // Pastel Purple
    },
    crystalline_abyss: {
        name: "Crystalline Abyss",
        desc: "Geometric caverns where light refracts through living crystal formations, creating impossible colors and temporal distortions.",
        colors: ["#f8bbd0", "#f48fb1"] // Pastel Pink
    },
    skyhollow_reaches: {
        name: "Skyhollow Reaches",
        desc: "Floating islands suspended above an endless sky, where water defies gravity and clouds form living ecosystems beneath crystalline equilibrium.",
        colors: ["#bbdefb", "#90caf9"] // Pastel Sky Blue
    },
    resonant_depths: {
        name: "Resonant Depths",
        desc: "Subterranean underwater caverns where sound materializes into visible harmonics, and every movement creates symphonic ripples through sentient waters.",
        colors: ["#b2dfdb", "#80cbc4"] // Pastel Teal
    },
    mycelial_depths: {
        name: "Mycelial Depths",
        desc: "An underground civilization of bioluminescent fungal forests where spore clouds drift like clouds. Waters shimmer with ethereal light from countless living organisms.",
        colors: ["#e1bee7", "#ce93d8"] // Pastel Lavender
    },
    sunken_citadel: {
        name: "Sunken Citadel",
        desc: "The ruins of an advanced civilization lie submerged beneath crystalline waters. Ancient architecture blends seamlessly with coral growth.",
        colors: ["#cfd8dc", "#b0bec5"] // Pastel Steel Blue
    }
};

/* --- WEATHER DATA --- */
const WEATHER_DATA = {
    clear: { name: 'Clear Skies', icon: '☀️', luck: 1.0, buff: null, buffChance: 0, valBonus: 0, desc: "Standard fishing conditions." },
    rain: { name: 'Light Rain', icon: '🌧️', luck: 1.1, buff: 'Soaked', buffChance: 0.4, valBonus: 0.1, desc: "+10% Luck. Fish may be Soaked (+10% Value)." },
    storm: { name: 'Thunderstorm', icon: '⛈️', luck: 1.25, buff: 'Stormcharged', buffChance: 0.3, valBonus: 0.3, desc: "+25% Luck. Fish may be Stormcharged (+30% Value)." },
    fog: { name: 'Dense Fog', icon: '🌫️', luck: 1.15, buff: 'Mystified', buffChance: 0.35, valBonus: 0.15, desc: "+15% Luck. Fish may be Mystified (+15% Value)." },
    heatwave: { name: 'Heatwave', icon: '🔥', luck: 1.05, buff: 'Sun-Kissed', buffChance: 0.25, valBonus: 0.2, desc: "+5% Luck. Fish may be Sun-Kissed (+20% Value)." },
    gale: { name: 'Gale Force', icon: '🌬️', luck: 1.2, buff: 'Wind-Swept', buffChance: 0.5, valBonus: 0.15, desc: "+20% Luck. Fish may be Wind-Swept (+15% Value)." }
};

// Fish Database (Reconstructed & Simplified)
const FISH_DB = {
    mistvale: {
        common: [['Silver Dart', 0.5, 2], ['Cove Sardine', 0.5, 2], ['Fog Goby', 0.5, 3]],
        uncommon: [['Mist Perch', 2, 5], ['Twilight Damsel', 2, 6]],
        rare: [['Golden Trout', 5, 12], ['Vapor Cobia', 8, 15]],
        epic: [['Stormborn Marlin', 20, 45], ['Cyclone Tuna', 25, 50]],
        legendary: [['Leviathan Ray', 100, 300], ['Mist Walker', 150, 400]],
        mythic: [['Aetherfin', 500, 1000]]
    },
    stone_rapids: {
        common: [['Creek Twisty', 0.5, 2], ['Stone Glider', 0.8, 3]],
        uncommon: [['Rapids Phantom', 3, 8], ['Granite Lurker', 4, 10]],
        rare: [['Raging Trout', 10, 20], ['Whitewater Specter', 12, 25]],
        epic: [['Torrent Dancer', 30, 60], ['Boulder Bass', 40, 80]],
        legendary: [['Stone Reaper', 150, 400]],
        mythic: [['Torrentheart', 600, 1200]]
    },
    volcanic: {
        common: [['Scorch Minnow', 0.5, 2], ['Ashveil Snapper', 1, 4]],
        uncommon: [['Magma Guardian', 5, 12], ['Thermal Nibbler', 4, 10]],
        rare: [['Inferno Lurker', 15, 35], ['Lava Fin', 20, 40]],
        epic: [['Molten Leviathan', 60, 150], ['Obsidian Terror', 80, 200]],
        legendary: [['Pyroclasm Titan', 300, 800]],
        mythic: [['Infernion', 1000, 2500]]
    },
    emerald: {
        common: [['Moss Nibbler', 0.5, 2], ['Green Dart', 0.6, 3]],
        uncommon: [['Verdant Phantom', 4, 10], ['Canopy Dancer', 5, 12]],
        rare: [['Emerald Reaver', 15, 40], ['Jungle Pike', 18, 45]],
        epic: [['Verdant Titan', 70, 180], ['Forest Colossus', 90, 220]],
        legendary: [['Primordial Feeder', 400, 1000]],
        mythic: [['Verdaxis', 1200, 3000]]
    },
    midnight: {
        common: [['Moon Minnow', 0.5, 2], ['Darkness Hopper', 1, 3]],
        uncommon: [['Lantern Fish', 5, 15], ['Void Crab', 6, 18]],
        rare: [['Nighttime Reaver', 25, 60], ['Starless Serpent', 30, 70]],
        epic: [['Abyss Behemoth', 100, 300], ['Deep Dweller', 120, 350]],
        legendary: [['Midnight Gorger', 600, 1500]],
        mythic: [['Voidshroud', 2000, 5000]]
    },
    crystalline_abyss: {
        common: [['Prism Dart', 0.5, 2.0], ['Refract Minnow', 0.6, 2.2], ['Shard Glider', 0.7, 2.1]],
        uncommon: [['Faceted Phantom', 2.5, 5.5], ['Chromatic Whisper', 3.0, 6.2], ['Geometry Swimmer', 2.8, 5.8]],
        rare: [['Fractal Leviathan', 8.0, 18.0], ['Iridescent Specter', 10.0, 22.0], ['Prism Reaver', 9.5, 20.5]],
        epic: [['Dimensional Titan', 35.0, 85.0], ['Kaleidoscope Beast', 40.0, 95.0], ['Void Facet', 38.0, 90.0]],
        legendary: [['Paradox Leviathan', 250.0, 650.0], ['Architect of Light', 300.0, 750.0]],
        mythic: [['Crystalline Consciousness', 1500.0, 4000.0]]
    },
    skyhollow_reaches: {
        common: [['Gust Minnow', 0.4, 1.8], ['Cloud Hopper', 0.6, 2.0], ['Wind Rider', 0.5, 1.9]],
        uncommon: [['Zephyr Phantom', 3.0, 6.5], ['Updraft Dancer', 2.8, 6.0], ['Breeze Glider', 3.2, 6.8]],
        rare: [['Tempest Striker', 11.0, 25.0], ['Skyborn Reaver', 13.0, 28.0], ['Cyclone Serpent', 12.0, 26.0]],
        epic: [['Nimbus Colossus', 50.0, 120.0], ['Hurricane Titan', 55.0, 130.0], ['Stratosphere Beast', 48.0, 115.0]],
        legendary: [['Zephyr King', 350.0, 900.0], ['Aurora Leviathan', 400.0, 1000.0]],
        mythic: [['Skyhollow Eternal', 2200.0, 5500.0]]
    },
    resonant_depths: {
        common: [['Echo Dart', 0.5, 2.0], ['Harmonic Nibbler', 0.7, 2.3], ['Resonance Hopper', 0.6, 2.1]],
        uncommon: [['Vibrancy Phantom', 3.2, 7.0], ['Sonata Swimmer', 2.9, 6.5], ['Frequency Lurker', 3.5, 7.5]],
        rare: [['Symphony Striker', 12.0, 27.0], ['Harmonic Colossus', 14.0, 30.0], ['Melodic Reaver', 13.0, 28.0]],
        epic: [['Resonance Behemoth', 60.0, 150.0], ['Chord Titan', 65.0, 155.0], ['Acoustic Leviathan', 58.0, 145.0]],
        legendary: [['Maestro of Abyss', 400.0, 1100.0], ['Infinite Echo', 450.0, 1200.0]],
        mythic: [['Primordial Symphony', 2500.0, 6000.0]]
    },
    mycelial_depths: {
        common: [['Sporophyte Dart', 0.4, 1.8], ['Glimmer Gill', 0.6, 2.1], ['Spore Hopper', 0.5, 1.9]],
        uncommon: [['Luminous Whisper', 2.5, 5.8], ['Mycelium Phantom', 3.2, 6.5], ['Fungal Veil', 2.8, 6.1]],
        rare: [['Iridescent Speck', 6.5, 15.2], ['Aetherial Serpent', 8.0, 18.5], ['Luminescent Reaver', 7.2, 16.8]],
        epic: [['Spore Lord', 25.0, 58.0], ['Biolume Colossus', 28.5, 62.5], ['Ethereal Titan', 26.8, 60.2]],
        legendary: [['Mycelial Sovereign', 110.0, 350.0], ['Spore Ascendant', 125.0, 380.0], ['Luminous Leviathan', 140.0, 400.0]],
        mythic: [['Fungal Eclipse', 550.0, 1500.0], ['Primordial Spore', 600.0, 1600.0], ['Consciousness Tide', 520.0, 1400.0], ['Netherwhisper Phantom', 580.0, 1550.0], ['Abyss Gardener', 610.0, 1700.0]]
    },
    sunken_citadel: {
        common: [['Artifact Minnow', 0.5, 2.0], ['Ruin Dart', 0.6, 2.2], ['Stone Glimmer', 0.4, 1.9]],
        uncommon: [['Pillar Guard', 3.5, 7.2], ['Cenotaph Keeper', 4.0, 8.1], ['Rune Phantom', 3.2, 7.5]],
        rare: [['Obsidian Oracle', 9.5, 20.8], ['Corallith Sentinel', 10.2, 22.5], ['Cipher Guardian', 8.8, 19.5]],
        epic: [['Architrave Beast', 35.0, 75.5], ['Monument Stalker', 38.5, 82.0], ['Catacombs Titan', 32.0, 70.0]],
        legendary: [['Citadel Warden', 155.0, 425.0], ['Herald of Stone', 170.0, 450.0], ['Threshold Keeper', 145.0, 400.0]],
        mythic: [['Ancient Memory', 700.0, 1800.0], ['Sunken Sovereignty', 750.0, 1900.0], ['Precursor Echo', 680.0, 1750.0], ['Civilization\'s Last Breath', 720.0, 1850.0], ['Eternal Sentinel', 765.0, 1920.0]]
    }
};

/* --- 2. CORE GAME ENGINE --- */

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
            totalCatches: 0
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
            timer: null
        };

        this.loopId = null;

        // System Modules
        this.ui = new UI(this);
        this.inventory = new Inventory(this);
        this.shop = new Shop(this);
        this.saveSystem = new SaveSystem(this);
    }

    init() {
        this.saveSystem.load();
        this.ui.renderAll();
        this.startWeatherCycle();
        this.gameLoop(); // Start animation loop for minigame
    }

    gameLoop() {
        if (this.minigame.active) {
            this.updateMinigame();
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    /* --- MECHANICS: WEATHER --- */
    startWeatherCycle() {
        // Initial weather
        this.setWeather('clear');

        setInterval(() => {
            const roll = Math.random();
            let type = 'clear';

            // Weather Probabilities
            if (roll < 0.4) type = 'clear';          // 40%
            else if (roll < 0.6) type = 'rain';      // 20%
            else if (roll < 0.7) type = 'gale';      // 10%
            else if (roll < 0.8) type = 'fog';       // 10%
            else if (roll < 0.9) type = 'heatwave';  // 10%
            else type = 'storm';                     // 10%

            this.setWeather(type);
        }, 180000); // Change every 3 minutes
    }

    setWeather(type) {
        this.weather.current = type;
        const data = WEATHER_DATA[type];
        this.ui.updateWeather(type);
        this.log(`Weather: ${data.name} - ${data.desc}`);
    }

    getWeatherMultiplier() {
        return WEATHER_DATA[this.weather.current].luck;
    }

    /* --- MECHANICS: FISHING LOGIC --- */
    startCast() {
        if (this.minigame.active) return; // Prevent double cast

        const rod = RODS.find(r => r.id === this.state.rod);
        const bait = BAITS.find(b => b.id === this.state.bait);

        // 1. Calculate Luck
        let totalLuck = (rod.luck + bait.luck) * this.getWeatherMultiplier();

        // 2. Roll Rarity
        const rarityKey = this.rollRarity(totalLuck);

        // 3. Pick Fish
        const fishTemplate = this.pickFish(this.state.location, rarityKey);
        if (!fishTemplate) {
            this.log("Nothing bit...");
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

    rollRarity(luck) {
        // Simple weighted roll modified by luck
        const tiers = Object.keys(RARITY);
        // Luck reduces the "common" weight and slightly boosts others
        let rand = Math.random() * 100;

        // High luck gives a reroll chance
        if (Math.random() * 500 < luck) {
            rand = Math.random() * 60; // Bias towards better tiers
        }

        let cumulative = 0;
        // Total weight approx 100.
        // We iterate backwards (Mythic -> Common) to check high tiers first? 
        // No, standard weighted roll:
        let pool = [];
        for (let k of tiers) {
            let weight = RARITY[k].weight;
            if (k === 'common') weight = Math.max(10, weight - (luck * 0.1)); // Luck reduces common trash
            if (k !== 'common') weight += (luck * 0.05); // Luck slightly boosts others

            for (let i = 0; i < weight; i++) pool.push(k);
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

        const diff = RARITY[fishData.rarity].difficulty; // 0.8 (easy) to 0.12 (hard)

        // Setup Logic
        this.minigame.pos = 0;
        this.minigame.direction = 1;
        this.minigame.targetWidth = Math.max(10, 30 * diff); // Zone width %
        this.minigame.targetStart = Math.random() * (90 - this.minigame.targetWidth) + 5; // Random pos

        // Speed based on rarity + minor random variation
        let baseSpeed = 1.0;
        if (fishData.rarity === 'legendary') baseSpeed = 2.0;
        if (fishData.rarity === 'mythic') baseSpeed = 3.5;
        this.minigame.speed = baseSpeed + (Math.random() * 0.5);

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

        const hit = this.minigame.pos >= this.minigame.targetStart &&
            this.minigame.pos <= (this.minigame.targetStart + this.minigame.targetWidth);

        this.minigame.active = false;
        this.ui.showMinigame(false);
        document.getElementById('action-btn').classList.remove('reeling');

        if (hit) {
            this.catchSuccess(this.minigame.fishOnLine);
        } else {
            this.catchFail(this.minigame.fishOnLine);
        }
    }

    /* --- MECHANICS: RESOLUTION --- */
    catchSuccess(fish) {
        const rod = RODS.find(r => r.id === this.state.rod);

        // 1. Capacity Check
        if (fish.weight > rod.capacity) {
            this.log(`LINE SNAP! ${fish.name} (${fish.weight}kg) was too heavy for your ${rod.name} (${rod.capacity}kg).`);
            this.ui.updateStatus("Line Snapped!", "danger");
            this.breakCombo();
            return;
        }

        // 2. Success!
        this.incrementCombo();

        // Apply Combo Bonus to Value
        const comboBonus = 1 + (this.state.combo * 0.1); // 10% per combo
        fish.value = Math.floor(fish.value * comboBonus);

        // 3. Add to Inventory
        this.state.inventory.push({ ...fish, id: Date.now() });
        this.inventory.render();

        // 4. XP
        this.gainXp(RARITY[fish.rarity].xp);

        this.log(`Caught ${fish.name} (${fish.weight}kg) | +${fish.value} coins value`);
        this.ui.updateStatus(`Caught ${fish.name}!`, "success");
        this.ui.updateLastCatch(fish);
        this.ui.renderStats();
        this.saveSystem.save();
    }

    catchFail(fish) {
        this.log(`Escaped! You missed the ${fish.rarity} ${fish.name}.`);
        this.ui.updateStatus("Fish Escaped...", "warning");
        this.breakCombo();
    }

    /* --- COMBO SYSTEM --- */
    incrementCombo() {
        this.state.combo++;
        if (this.state.combo > 1) this.ui.floatText(`Combo x${this.state.combo}!`);
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
        const nextLvl = this.getXpNext();
        if (this.state.xp >= nextLvl) {
            this.state.xp -= nextLvl;
            this.state.level++;
            this.log(`LEVEL UP! You are now level ${this.state.level}`);
            this.ui.floatText("LEVEL UP!");
        }
        this.ui.renderStats();
    }

    getXpNext() {
        return this.state.level * 1000 + Math.pow(this.state.level, 2) * 100;
    }

    /* --- AUTO-FISHING SYSTEM --- */
    toggleAutoFish() {
        this.autoFish.enabled = !this.autoFish.enabled;
        const btn = document.getElementById('auto-fish-btn');
        const castBtn = document.getElementById('action-btn');

        if (this.autoFish.enabled) {
            btn.textContent = '🤖 Auto: ON';
            btn.classList.add('active');
            castBtn.disabled = true;
            castBtn.style.opacity = '0.5';
            this.log('Auto-fishing ENABLED.');
            this.startAutoFishCycle();
        } else {
            btn.textContent = '🤖 Auto: OFF';
            btn.classList.remove('active');
            castBtn.disabled = false;
            castBtn.style.opacity = '1';
            castBtn.textContent = 'Cast Line';
            this.autoFish.phase = 'idle';
            if (this.autoFish.timer) {
                clearTimeout(this.autoFish.timer);
                this.autoFish.timer = null;
            }
            this.ui.showMinigame(false);
            this.ui.updateStatus('Auto-fishing disabled. Ready to cast...');
            this.log('Auto-fishing DISABLED.');
        }
    }

    startAutoFishCycle() {
        if (!this.autoFish.enabled) return;

        this.autoFish.phase = 'casting';
        document.getElementById('action-btn').textContent = 'Auto Mode';

        // Randomized cooldown between 1-3 seconds for realistic auto-fishing
        const cooldown = 1000 + Math.random() * 2000; // 1000-3000ms
        this.ui.updateStatus(`🤖 Waiting ${(cooldown / 1000).toFixed(1)}s before next cast...`);

        this.autoFish.timer = setTimeout(() => {
            if (!this.autoFish.enabled) return;
            this.autoCast();
        }, cooldown);
    }

    autoCast() {
        if (!this.autoFish.enabled) return;

        const rod = RODS.find(r => r.id === this.state.rod);
        const bait = BAITS.find(b => b.id === this.state.bait);

        // Calculate Luck & Roll
        let totalLuck = (rod.luck + bait.luck) * this.getWeatherMultiplier();
        const rarityKey = this.rollRarity(totalLuck);
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

        // Phase 2: Hook Time (based on rod speed, very fast)
        this.autoFish.phase = 'hooking';
        const hookDelay = Math.max(100, 500 - (rod.speed * 8));
        this.ui.updateStatus(`🤖 Waiting for a bite...`);

        this.autoFish.timer = setTimeout(() => {
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
        this.autoFish.timer = setTimeout(() => {
            if (!this.autoFish.enabled) return;
            this.autoResolve();
        }, 500);
    }

    autoResolve() {
        if (!this.autoFish.enabled) return;

        const fish = this.minigame.fishOnLine;
        const rod = RODS.find(r => r.id === this.state.rod);

        // Capacity Check (only way to fail in auto mode)
        if (fish.weight > rod.capacity) {
            this.log(`🤖 LINE SNAP! ${fish.name} (${fish.weight}kg) was too heavy for ${rod.name}.`);
            this.ui.updateStatus('🤖 Line Snapped!', 'danger');
        } else {
            // Auto-fishing has a 10x combo limit for balance
            if (this.state.combo < 10) {
                this.incrementCombo();
            } else if (this.state.combo === 10) {
                // Notify once when hitting the cap
                this.log('🤖 Auto-fishing combo capped at 10x!');
            }

            // Apply Combo Bonus to Value
            const comboBonus = 1 + (this.state.combo * 0.1);
            fish.value = Math.floor(fish.value * comboBonus);

            this.state.inventory.push({ ...fish, id: Date.now() });
            this.inventory.render();
            this.gainXp(RARITY[fish.rarity].xp);
            this.log(`🤖 Caught ${fish.name} (${fish.weight}kg) | +${fish.value} coins value`);
            this.ui.updateStatus(`🤖 Caught ${fish.name}!`, 'success');
            this.ui.updateLastCatch(fish);
            this.ui.renderStats();
            this.saveSystem.save();
        }

        this.minigame.fishOnLine = null;

        // Start next cycle
        this.autoFish.phase = 'idle';
        this.startAutoFishCycle();
    }

    log(msg) {
        const ul = document.getElementById('game-log');
        const li = document.createElement('li');
        li.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        ul.prepend(li);
        if (ul.children.length > 20) ul.lastChild.remove();
    }
}

/* --- 3. UI HANDLER --- */
class UI {
    constructor(game) { this.game = game; }

    renderAll() {
        this.renderStats();
        this.renderLocations();
        this.game.shop.render();
        this.game.inventory.render();
    }

    renderStats() {
        const s = this.game.state;
        const rod = RODS.find(r => r.id === s.rod);

        document.getElementById('coins-display').textContent = s.coins.toLocaleString();
        document.getElementById('level-display').textContent = s.level;
        document.getElementById('xp-current').textContent = Math.floor(s.xp);
        document.getElementById('xp-next').textContent = this.game.getXpNext();
        document.getElementById('capacity-display').textContent = rod.capacity + " KG";
        document.getElementById('combo-display').textContent = s.combo + "x";

        // XP Bar
        const pct = (s.xp / this.game.getXpNext()) * 100;
        document.getElementById('xp-bar').style.width = pct + "%";
    }

    renderLocations() {
        const grid = document.getElementById('location-grid');
        grid.innerHTML = '';
        Object.entries(LOCATIONS).forEach(([key, data]) => {
            const div = document.createElement('div');
            div.className = `location-card ${this.game.state.location === key ? 'active' : ''}`;
            div.innerHTML = `<div class="loc-name">${data.name}</div><div class="loc-desc">${data.desc}</div>`;
            div.onclick = () => {
                this.game.state.location = key;
                this.game.breakCombo(); // Changing location breaks combo
                this.game.log(`Traveled to ${data.name}.`);
                this.renderLocations();
                this.updateTheme();
                this.game.saveSystem.save();
            };
            grid.appendChild(div);
        });
        this.updateTheme();
    }

    updateTheme() {
        const loc = LOCATIONS[this.game.state.location];
        document.body.style.setProperty('--bg', `linear-gradient(120deg, ${loc.colors[0]}, ${loc.colors[1]})`);
    }

    updateStatus(msg, type = 'normal') {
        const el = document.getElementById('status-message');
        el.textContent = msg;
        el.style.color = type === 'danger' ? 'var(--danger)' : type === 'success' ? 'var(--success)' : type === 'warning' ? 'var(--warning)' : 'var(--text)';
    }

    updateLastCatch(fish) {
        document.getElementById('last-catch').innerHTML = `Last Catch: <span style="color:${RARITY[fish.rarity].color}">${fish.name}</span> (${fish.weight}kg)`;
    }

    showMinigame(show) {
        const el = document.getElementById('minigame-ui');
        el.className = show ? 'minigame-container active' : 'minigame-container';
    }

    updateWeather(type) {
        const badge = document.getElementById('weather-badge');
        const text = document.getElementById('weather-text');
        const icon = document.querySelector('.weather-icon');

        if (type === 'clear') { icon.textContent = '☀️'; text.textContent = 'Clear Skies'; badge.style.borderColor = 'var(--border)'; }
        if (type === 'rain') { icon.textContent = '🌧️'; text.textContent = 'Rain (+10% Luck)'; badge.style.borderColor = 'var(--accent)'; }
        if (type === 'storm') { icon.textContent = '⚡'; text.textContent = 'Storm (+25% Luck)'; badge.style.borderColor = 'var(--warning)'; }
    }

    floatText(msg) {
        // Simple visual feedback could be added here
    }
}

/* --- 4. SHOP & INVENTORY --- */
class Shop {
    constructor(game) { this.game = game; }

    render() {
        // Rods
        const rContainer = document.getElementById('rod-shop');
        rContainer.innerHTML = '';
        RODS.forEach(rod => {
            const owned = this.game.state.rodsOwned.includes(rod.id);
            const equipped = this.game.state.rod === rod.id;
            const btnText = equipped ? "Equipped" : owned ? "Equip" : "Buy";
            const btnClass = equipped ? "btn-secondary" : owned ? "btn-primary" : "btn-primary";

            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
        <div class="item-info">
            <h3>${rod.name}</h3>
            <p>Cap: ${rod.capacity}kg | Luck: ${rod.luck}</p>
        </div>
        <div class="item-buy">
            ${!owned ? `<span class="cost">${rod.cost.toLocaleString()}</span>` : ''}
            <button class="${btnClass}" ${equipped ? 'disabled' : ''} onclick="game.shop.buyRod('${rod.id}')">${btnText}</button>
        </div>
    `;
            rContainer.appendChild(div);
        });

        // Baits
        const bContainer = document.getElementById('bait-shop');
        bContainer.innerHTML = '';
        BAITS.forEach(bait => {
            const owned = this.game.state.baitsOwned.includes(bait.id);
            const equipped = this.game.state.bait === bait.id;
            const btnText = equipped ? "Active" : owned ? "Equip" : "Buy";

            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
        <div class="item-info">
            <h3>${bait.name}</h3>
            <p>Luck Bonus: +${bait.luck}</p>
        </div>
        <div class="item-buy">
            ${!owned ? `<span class="cost">${bait.cost.toLocaleString()}</span>` : ''}
            <button class="${equipped ? 'btn-secondary' : 'btn-primary'}" ${equipped ? 'disabled' : ''} onclick="game.shop.buyBait('${bait.id}')">${btnText}</button>
        </div>
    `;
            bContainer.appendChild(div);
        });
    }

    buyRod(id) {
        const item = RODS.find(r => r.id === id);
        if (this.game.state.rodsOwned.includes(id)) {
            this.game.state.rod = id;
            this.game.log(`Equipped ${item.name}.`);
        } else {
            if (this.game.state.coins >= item.cost) {
                this.game.state.coins -= item.cost;
                this.game.state.rodsOwned.push(id);
                this.game.state.rod = id;
                this.game.log(`Purchased ${item.name}!`);
            } else {
                this.game.log("Not enough coins.");
            }
        }
        this.game.ui.renderAll();
        this.game.saveSystem.save();
    }

    buyBait(id) {
        const item = BAITS.find(b => b.id === id);
        if (this.game.state.baitsOwned.includes(id)) {
            this.game.state.bait = id;
            this.game.log(`Using ${item.name}.`);
        } else {
            if (this.game.state.coins >= item.cost) {
                this.game.state.coins -= item.cost;
                this.game.state.baitsOwned.push(id);
                this.game.state.bait = id;
                this.game.log(`Purchased ${item.name}!`);
            } else {
                this.game.log("Not enough coins.");
            }
        }
        this.game.ui.renderAll();
        this.game.saveSystem.save();
    }
}

class Inventory {
    constructor(game) { this.game = game; }

    render() {
        const tableBody = document.querySelector('#inventory-table tbody');
        tableBody.innerHTML = '';

        // Show latest first
        [...this.game.state.inventory].reverse().forEach(item => {
            const tr = document.createElement('tr');

            const rarityColor = RARITY[item.rarity].color;
            const buffHtml = item.buff
                ? `<span style="font-size:0.75rem; background:${rarityColor}33; color:${rarityColor}; padding:2px 6px; border-radius:4px; margin-left:0.5rem;">${item.buff}</span>`
                : '';

            tr.innerHTML = `
                <td>
                    <span style="color:${rarityColor}; font-weight:600">${item.name}</span>
                    ${buffHtml}
                </td>
                <td><span class="rarity-tag" style="background:${rarityColor}22; color:${rarityColor}">${item.rarity}</span></td>
                <td>${item.weight} kg</td>
                <td style="color:#facc15; font-weight:600">${item.value.toLocaleString()}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    sellAll() {
        if (this.game.state.inventory.length === 0) return;

        let total = 0;
        this.game.state.inventory.forEach(i => total += i.value);
        this.game.state.coins += total;

        const count = this.game.state.inventory.length;
        this.game.state.inventory = [];

        this.game.log(`Sold ${count} fish for ${total} coins.`);
        this.game.ui.renderAll();
        this.game.saveSystem.save();
    }
}

/* --- 5. SYSTEM --- */
class SaveSystem {
    constructor(game) { this.game = game; }

    save() {
        localStorage.setItem('mythic_waters_enhanced', JSON.stringify(this.game.state));
    }

    load() {
        const data = localStorage.getItem('mythic_waters_enhanced');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.game.state = { ...this.game.state, ...parsed };
                this.game.log("Welcome back, angler.");
            } catch (e) { console.error("Save Error", e); }
        }
    }

    manualSave() {
        this.save();
        alert("Game Saved!");
    }

    resetData() {
        if (confirm("Wipe all progress?")) {
            localStorage.removeItem('mythic_waters_enhanced');
            location.reload();
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

// Init Game
game.init();
