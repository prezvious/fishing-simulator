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
// Freeze rarity data to prevent console exploits
Object.values(RARITY).forEach(r => Object.freeze(r));
Object.freeze(RARITY);

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
// Freeze static data to prevent console exploits
RODS.forEach(rod => Object.freeze(rod));
Object.freeze(RODS);

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
// Freeze static data to prevent console exploits
BAITS.forEach(bait => Object.freeze(bait));
Object.freeze(BAITS);

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
    },
    glacial_spire: {
        name: "Glacial Spire",
        desc: "Towering frozen peaks where the water is supercooled and the aurora borealis touches the surface.",
        colors: ["#e3f2fd", "#ffffff"] // Icy White & Pale Azure
    },
    chrono_river: {
        name: "Chrono-River",
        desc: "A river flowing backwards through time, surrounded by golden dunes and floating hourglasses.",
        colors: ["#fff9c4", "#fbc02d"] // Antique Gold & Parchment Yellow
    },
    neon_bayou: {
        name: "Neon Bayou",
        desc: "A synthetic wetland lit by holographic advertisements and leaking coolant streams.",
        colors: ["#ea80fc", "#8c9eff"] // Electric Purple & Cyber Blue
    },
    gearwork_grotto: {
        name: "Gearwork Grotto",
        desc: "An industrial cavern filled with grinding gears, steam vents, and oil-slicked waters.",
        colors: ["#d7ccc8", "#a1887f"] // Copper, Rust & Steam Grey
    },
    aetherial_void: {
        name: "Aetherial Void",
        desc: "The edge of the universe where stars are born. You aren't fishing in water, but in pure stardust.",
        colors: ["#311b92", "#000000"] // Deep Indigo & Void Black
    },
    // New Expeditions from JSON
    confection_coast: {
        name: "Confection Coast",
        desc: "A sugary paradise where the waves are made of warm syrup and the sand is pure powdered sugar.",
        colors: ["#ffb7b2", "#b5ead7"] // Pastel Coral & Mint
    },
    origami_archipelago: {
        name: "Origami Archipelago",
        desc: "A delicate world of folded parchment and ink, where paper cranes nest in cardboard cliffs.",
        colors: ["#fdfbf7", "#9a8c98"] // Cream & Paper Grey
    },
    vaporwave_vista: {
        name: "Vaporwave Vista",
        desc: "An eternal 80s sunset over a wireframe ocean, humming with low-fidelity synth nostalgia.",
        colors: ["#e0bbe4", "#ffdfd3"] // Pastel Purple & Peach
    },
    prism_light_pools: {
        name: "Prism-Light Pools",
        desc: "Blindingly clear shallows where light shatters into rainbows across mirror-smooth surfaces.",
        colors: ["#ffffff", "#e6e6fa"] // White & Lavender
    },
    silk_thread_stream: {
        name: "Silk-Thread Stream",
        desc: "A river composed of millions of flowing golden threads, woven by the hands of unseen giants.",
        colors: ["#fff9c4", "#d1c4e9"] // Light Gold & Lavender
    }
};
// Deep freeze utility for nested objects
const deepFreeze = obj => {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null) deepFreeze(obj[key]);
    });
    return Object.freeze(obj);
};
// Freeze locations to prevent console exploits
deepFreeze(LOCATIONS);

/* --- WEATHER DATA --- */
const WEATHER_DATA = {
    // Legacy Weather Types (with added probability & difficulty_mod)
    clear: { name: 'Clear Skies', icon: '☀️', luck: 1.0, buff: null, buffChance: 0, valBonus: 0, difficulty_mod: 1.0, probability: 0.25, desc: "Standard fishing conditions." },
    rain: { name: 'Light Rain', icon: '🌧️', luck: 1.1, buff: 'Soaked', buffChance: 0.4, valBonus: 0.1, difficulty_mod: 0.95, probability: 0.12, desc: "+10% Luck. Fish may be Soaked (+10% Value)." },
    storm: { name: 'Thunderstorm', icon: '⛈️', luck: 1.25, buff: 'Stormcharged', buffChance: 0.3, valBonus: 0.3, difficulty_mod: 1.2, probability: 0.08, desc: "+25% Luck. Fish may be Stormcharged (+30% Value)." },
    fog: { name: 'Dense Fog', icon: '🌫️', luck: 1.15, buff: 'Mystified', buffChance: 0.35, valBonus: 0.15, difficulty_mod: 0.9, probability: 0.1, desc: "+15% Luck. Fish may be Mystified (+15% Value)." },
    heatwave: { name: 'Heatwave', icon: '🔥', luck: 1.05, buff: 'Sun-Kissed', buffChance: 0.25, valBonus: 0.2, difficulty_mod: 1.1, probability: 0.08, desc: "+5% Luck. Fish may be Sun-Kissed (+20% Value)." },
    gale: { name: 'Gale Force', icon: '🌬️', luck: 1.2, buff: 'Wind-Swept', buffChance: 0.5, valBonus: 0.15, difficulty_mod: 1.15, probability: 0.1, desc: "+20% Luck. Fish may be Wind-Swept (+15% Value)." },
    // New Exotic Weather Types
    locust_plague: { name: 'Locust Plague', icon: '🦗', luck: 1.4, buff: 'Engorged', buffChance: 0.8, valBonus: 0.1, difficulty_mod: 0.9, probability: 0.05, desc: "A swarm of insects hits the water. +40% Luck due to feeding frenzy. Fish are 'Engorged' (+10% Value)." },
    silica_storm: { name: 'Silica Storm', icon: '🏜️', luck: 1.05, buff: 'Polished', buffChance: 0.5, valBonus: 0.35, difficulty_mod: 1.3, probability: 0.06, desc: "Abrasive sands scour the scales. +5% Luck. Fish may be 'Polished' (+35% Value) but are harder to catch." },
    sakura_drift: { name: 'Sakura Drift', icon: '🌸', luck: 1.3, buff: 'Decorated', buffChance: 0.6, valBonus: 0.2, difficulty_mod: 0.7, probability: 0.08, desc: "Pink petals calm the waters. +30% Luck. Fish are calmer (slower minigame) and 'Decorated' (+20% Value)." },
    flash_blizzard: { name: 'Flash Blizzard', icon: '❄️', luck: 0.8, buff: 'Cryo-Preserved', buffChance: 1.0, valBonus: 0.6, difficulty_mod: 1.5, probability: 0.03, desc: "-20% Luck (Lines freeze). However, 100% chance for fish to be 'Cryo-Preserved' (+60% Value)." },
    acid_downpour: { name: 'Acid Downpour', icon: '🧪', luck: 0.9, buff: 'Mutated', buffChance: 0.3, valBonus: 1.5, difficulty_mod: 1.2, probability: 0.02, desc: "Corrosive rain burns gear (-10% Luck). Small chance for 'Mutated' fish (+150% Value)." },
    spore_bloom: { name: 'Spore Bloom', icon: '🍄', luck: 1.15, buff: 'Symbiotic', buffChance: 0.45, valBonus: 0.25, difficulty_mod: 1.1, probability: 0.05, desc: "Fungal clouds drift over the water. +15% Luck. Fish may become 'Symbiotic' (+25% Value)." },
    tectonic_shift: { name: 'Tectonic Shift', icon: '🌋', luck: 1.5, buff: 'Agitated', buffChance: 0.2, valBonus: 0.15, difficulty_mod: 1.4, probability: 0.04, desc: "Earthquakes startle bottom-feeders. +50% Luck (Massive bite rate) but fish are erratic and 'Agitated'." },
    // Additional Weather from JSON
    golden_hour: { name: 'Golden Hour', icon: '🌅', luck: 1.5, buff: 'Gilded', buffChance: 0.5, valBonus: 0.5, difficulty_mod: 1.2, probability: 0.05, desc: "The sun hits the water just right. +50% Luck. Fish shimmer with 'Gilded' scales (+50% Value), but are faster to flee." },
    crimson_tide: { name: 'Crimson Tide', icon: '🩸', luck: 1.3, buff: 'Frenzied', buffChance: 0.3, valBonus: 0.25, difficulty_mod: 1.6, probability: 0.08, desc: "A red algal bloom spreads. +30% Luck. Fish are aggressive and 'Frenzied' (+25% Value), making the minigame very fast." },
    ashfall: { name: 'Ashfall', icon: '🌋', luck: 0.9, buff: 'Obsidian-Clad', buffChance: 0.4, valBonus: 0.4, difficulty_mod: 0.8, probability: 0.06, desc: "Volcanic grit fills the air. -10% Luck (Gills clogged). Fish are sluggish (easier catch) and 'Obsidian-Clad' (+40% Value)." },
    diamond_dust: { name: 'Diamond Dust', icon: '✨', luck: 1.1, buff: 'Crystallized', buffChance: 0.7, valBonus: 0.15, difficulty_mod: 1.1, probability: 0.1, desc: "Suspended ice crystals refract light. +10% Luck. High chance for 'Crystallized' fish (+15% Value) due to extreme cold." },
    monsoon: { name: 'Monsoon', icon: '🌊', luck: 1.25, buff: 'Torrential', buffChance: 0.2, valBonus: 0.3, difficulty_mod: 1.4, probability: 0.07, desc: "Relentless tropical rain. +25% Luck. Massive fish surface to feed, becoming 'Torrential' (+30% Value) but fighting hard." },
    autumn_drift: { name: 'Autumn Drift', icon: '🍂', luck: 1.2, buff: 'Harvest-Ready', buffChance: 0.5, valBonus: 0.2, difficulty_mod: 0.9, probability: 0.15, desc: "Orange leaves blanket the surface. +20% Luck. Fish mistake leaves for food; they are 'Harvest-Ready' (+20% Value) and calm." },
    swamp_haze: { name: 'Swamp Haze', icon: '🐊', luck: 1.0, buff: 'Ancient', buffChance: 0.1, valBonus: 2.0, difficulty_mod: 1.3, probability: 0.04, desc: "A thick, humid vapor rises. Neutral Luck. Very rare chance to find 'Ancient' fish variants that sell for triple value (+200%)." }
};
// Freeze weather data to prevent console exploits
deepFreeze(WEATHER_DATA);

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
    },
    glacial_spire: {
        common: [['Frost Minnow', 0.5, 2.0], ['Ice Chip', 0.6, 2.2], ['Snowflake Dart', 0.4, 1.8]],
        uncommon: [['Hailstone Bass', 3.0, 6.5], ['Polar Perch', 2.8, 6.0], ['Glacier Crab', 3.2, 7.0]],
        rare: [['Permafrost Eel', 10.0, 24.0], ['Cryo-Pike', 12.0, 28.0], ['Icicle Ray', 11.5, 26.0]],
        epic: [['Blizzard Shark', 50.0, 110.0], ['Aurora Fin', 55.0, 125.0], ['Absolute Zero', 48.0, 105.0]],
        legendary: [['Frozen Leviathan', 350.0, 850.0], ['Spirit of Winter', 400.0, 950.0]],
        mythic: [['The Ice Age', 2100.0, 5200.0]]
    },
    chrono_river: {
        common: [['Ticking Tetra', 0.5, 2.0], ['Second Hand', 0.6, 2.5], ['Minute Minnow', 0.4, 1.8]],
        uncommon: [['Retrograde Salmon', 3.5, 7.0], ['Dejavu Dory', 3.0, 6.5], ['Hourglass Flounder', 3.2, 6.8]],
        rare: [['Timeline Trout', 12.0, 28.0], ['Flux Fish', 14.0, 32.0], ['Continuum Carp', 13.0, 29.0]],
        epic: [['Paradox Pike', 60.0, 140.0], ['Epoch Eel', 65.0, 150.0], ['Temporal Titan', 58.0, 135.0]],
        legendary: [['Chronos Keeper', 420.0, 1000.0], ['Sands of Time', 450.0, 1100.0]],
        mythic: [['The Ouroboros', 2600.0, 6200.0]]
    },
    neon_bayou: {
        common: [['Pixel Prawn', 0.4, 1.5], ['Bit-Biter', 0.6, 2.0], ['Glitch Guppy', 0.5, 1.8]],
        uncommon: [['Cyber-Carp', 3.0, 6.5], ['Data-Bass', 3.5, 7.5], ['Firewall Fish', 2.8, 6.0]],
        rare: [['Holo-Halibut', 11.0, 26.0], ['Laser-Fin', 13.0, 30.0], ['Synthetic Salmon', 12.0, 28.0]],
        epic: [['Mainframe Marlin', 55.0, 130.0], ['Virus Viper', 60.0, 145.0], ['System Crash Shark', 52.0, 120.0]],
        legendary: [['The Algo-Rhythm', 380.0, 920.0], ['Digital Demon', 410.0, 980.0]],
        mythic: [['Y2K Leviathan', 2300.0, 5600.0]]
    },
    gearwork_grotto: {
        common: [['Rust Roach', 0.6, 2.2], ['Bolt Bait', 0.5, 1.9], ['Scrap Snapper', 0.7, 2.5]],
        uncommon: [['Piston Perch', 3.5, 7.5], ['Spring-Loaded Salmon', 4.0, 8.5], ['Cog Cod', 3.2, 7.0]],
        rare: [['Boiler Bass', 14.0, 32.0], ['Copper Catfish', 16.0, 36.0], ['Ironclad Eel', 15.0, 34.0]],
        epic: [['Steam-Engine Shark', 65.0, 160.0], ['Oil-Slick Ray', 70.0, 175.0], ['Industrial Titan', 62.0, 150.0]],
        legendary: [['The Iron Giant', 450.0, 1150.0], ['Mechanized Maw', 480.0, 1200.0]],
        mythic: [['Deus Ex Machina', 2800.0, 6800.0]]
    },
    aetherial_void: {
        common: [['Comet Crumb', 0.5, 1.8], ['Asteroid Anchovy', 0.6, 2.0], ['Star Dust Mite', 0.4, 1.5]],
        uncommon: [['Zodiac Zebra', 3.2, 7.0], ['Meteor Minnow', 3.5, 7.8], ['Orbital Oscar', 3.0, 6.5]],
        rare: [['Nebula Newt', 15.0, 35.0], ['Gravity Grouper', 18.0, 40.0], ['Vacuum Viper', 16.0, 38.0]],
        epic: [['Supernova Snapper', 75.0, 180.0], ['Void Ray', 80.0, 195.0], ['Galaxy Gar', 72.0, 170.0]],
        legendary: [['Event Horizon', 500.0, 1300.0], ['Dark Matter Dragon', 550.0, 1400.0]],
        mythic: [['The Big Bang', 3000.0, 7500.0]]
    },
    // New Expedition Fish from JSON
    confection_coast: {
        common: [['Sugar Crystal', 0.1, 0.5], ['Syrup Guppy', 0.2, 0.8], ['Sprinkle Minnow', 0.3, 0.9], ['Gummy Worm Fish', 0.4, 1.2], ['Candy Corn Crab', 0.5, 1.5], ['Wafer Snapper', 0.6, 2.0], ['Lollipop Tetra', 0.5, 1.8], ['Cocoa Nibbler', 0.8, 2.5], ['Jellybean Darter', 0.4, 1.4], ['Frosting Flounder', 1.0, 3.0]],
        uncommon: [['Marshmallow Bass', 2.5, 6.0], ['Licorice Eel', 3.0, 7.5], ['Toffee Trout', 3.5, 8.0], ['Biscuit Skate', 4.0, 9.0], ['Caramel Carp', 3.8, 8.5], ['Peppermint Perch', 2.8, 6.5], ['Donut Discus', 3.2, 7.0], ['Hard-Candy Cod', 4.5, 10.0], ['Meringue Ray', 5.0, 11.0], ['Fizzy Lifter', 2.5, 5.5]],
        rare: [['Gingerbread Grouper', 12.0, 25.0], ['Red Velvet Snapper', 15.0, 30.0], ['Macaron Manta', 18.0, 35.0], ['Rock Candy Lobster', 10.0, 22.0], ['Cotton Candy Koi', 14.0, 28.0], ['Bubblegum Puffer', 8.0, 20.0], ['Fudge Brownie Catfish', 16.0, 32.0], ['Truffle Turtle', 20.0, 40.0]],
        epic: [['Gelatinous Giant', 40.0, 90.0], ['Jawbreaker Shark', 50.0, 110.0], ['Marzipan Marlin', 60.0, 130.0], ['Crème Brûlée Colossus', 55.0, 120.0], ['Ganache Gar', 45.0, 100.0], ['Swirl-Pop Sturgeon', 70.0, 150.0], ['Tiramisu Tigerfish', 65.0, 140.0], ['Honeycomb Hammerhead', 80.0, 180.0]],
        legendary: [['Wedding Cake Whale', 300.0, 700.0], ['Royal Icing Leviathan', 400.0, 900.0], ['Eternal Gobstopper', 250.0, 600.0], ['Molten Chocolate Maw', 350.0, 800.0], ['The Sugar Rush', 500.0, 1000.0]],
        mythic: [['The Confectioner', 2000.0, 4500.0], ['Grand Gateau', 2500.0, 5000.0], ['Infinite Glaze', 2200.0, 4800.0], ['Spirit of Sweetness', 3000.0, 6000.0]]
    },
    origami_archipelago: {
        common: [['Paperclip Minnow', 0.1, 0.4], ['Pulp Tetra', 0.2, 0.7], ['Sticky-Note Snapper', 0.3, 1.0], ['Cardboard Crab', 0.5, 1.8], ['Tissue Guppy', 0.1, 0.5], ['Folded Fin', 0.4, 1.2], ['Confetti Darter', 0.2, 0.8], ['Scrap Shad', 0.6, 2.0], ['Bookmark Bass', 0.8, 2.5], ['Doodle Bug', 0.3, 1.1]],
        uncommon: [['Envelope Ray', 2.0, 5.0], ['Manilla Carp', 3.0, 7.0], ['Corrugated Cod', 4.0, 9.0], ['Origami Crane-Fish', 2.5, 6.0], ['Ink-Stain Eel', 3.5, 8.0], ['Parchment Perch', 2.8, 6.5], ['Stationary Skate', 4.5, 10.0], ['Blueprint Bluegill', 3.2, 7.5], ['Scissor-Tail', 2.0, 5.5], ['Papyrus Pike', 5.0, 12.0]],
        rare: [['Cardstock Catfish', 10.0, 25.0], ['Quill-Pen Squid', 12.0, 28.0], ['Vellum Viper', 15.0, 32.0], ['Watermark Walleye', 18.0, 35.0], ['Calligraphy Koi', 14.0, 30.0], ['Papier-Mâché Puffer', 20.0, 45.0], ['Staple Remover Shark', 25.0, 50.0], ['Binding Glue Gar', 22.0, 48.0]],
        epic: [['Hardcover Grouper', 50.0, 120.0], ['Scrollwork Serpent', 60.0, 140.0], ['Pop-Up Book Predator', 70.0, 160.0], ['Fountain Pen Leviathan', 80.0, 180.0], ['Encyclopedia Eel', 90.0, 200.0], ['The Great Draft', 100.0, 220.0], ['Carbon Copy Colossus', 110.0, 240.0], ['Marble-Ink Manta', 120.0, 260.0]],
        legendary: [['The First Edition', 350.0, 800.0], ['Library Guardian', 400.0, 900.0], ['Masterpiece Ray', 450.0, 1000.0], ['Ancient Scroll', 500.0, 1100.0], ['The Final Chapter', 600.0, 1300.0]],
        mythic: [['The Blank Page', 2000.0, 4500.0], ['Infinite Fold', 2500.0, 5500.0], ['Living Story', 3000.0, 6500.0], ['Papercut Phantom', 3500.0, 7000.0]]
    },
    vaporwave_vista: {
        common: [['Static Shad', 0.1, 0.5], ['Scanline Tetra', 0.2, 0.6], ['Grid Guppy', 0.1, 0.4], ['Vector Minnow', 0.3, 0.8], ['Pastel Prawn', 0.1, 0.3], ['Low-Fi Leech', 0.2, 0.5], ['Wireframe Worm', 0.1, 0.2], ['Sunset Sardine', 0.3, 0.7], ['VHS Darter', 0.4, 0.9], ['Betamax Bass', 0.5, 1.2], ['Floppy Flounder', 0.6, 1.5], ['Gradient Goby', 0.2, 0.6], ['Polygon Perch', 0.4, 1.0], ['Synth Snapper', 0.5, 1.3]],
        uncommon: [['Retro Ray', 2.0, 5.0], ['Analog Angler', 2.5, 6.0], ['Chromatic Cod', 3.0, 7.0], ['Glitch Grouper', 4.0, 9.0], ['Cyber-Palm Crab', 1.5, 4.0], ['Laser Disc Lobster', 2.0, 5.5], ['CRT Catfish', 3.5, 8.0], ['Noise Nibbler', 1.8, 4.5], ['Distortion Drum', 3.2, 7.5], ['Reverb Roach', 1.2, 3.0], ['Equalizer Eel', 2.8, 6.5], ['Waveform Walleye', 3.0, 7.0]],
        rare: [['Magnetic Carp', 8.0, 18.0], ['Neon-Striped Bass', 9.0, 20.0], ['Magenta Mackerel', 7.5, 16.0], ['Cyan Cichlid', 6.0, 14.0], ['Grid-Line Gar', 10.0, 22.0], ['Retrowave Ray', 12.0, 25.0], ['Outrun Oscar', 8.5, 19.0], ['VCR Viper', 11.0, 24.0], ['Synth-Pop Shark', 15.0, 30.0], ['Cassette Eel', 9.5, 21.0]],
        epic: [['Surround Sound Shark', 45.0, 100.0], ['High-Fidelity Halibut', 50.0, 110.0], ['Resolution Ray', 55.0, 120.0], ['Pixel Pike', 40.0, 90.0], ['Voxel Viper', 48.0, 105.0], ['Texture Trout', 42.0, 95.0], ['Render Ray', 60.0, 130.0], ['Shader Shark', 65.0, 140.0]],
        legendary: [['Refresh-Rate Ray', 250.0, 600.0], ['Latency Leviathan', 300.0, 700.0], ['Buffering Beast', 280.0, 650.0], ['Packet-Loss Pike', 260.0, 620.0], ['The Mainframe', 400.0, 900.0]],
        mythic: [['Bandwidth Behemoth', 2000.0, 5000.0], ['The Glitch King', 2500.0, 6000.0], ['System Failure', 2200.0, 5500.0], ['The Blue Screen', 2800.0, 6500.0]]
    },
    prism_light_pools: {
        common: [['Clear Minnow', 0.1, 0.4], ['Glass Guppy', 0.1, 0.3], ['Mirror Mullet', 0.2, 0.6], ['Reflect Roach', 0.2, 0.5], ['Shimmer Shad', 0.3, 0.7], ['Glint Goby', 0.1, 0.4], ['Sparkle Sprat', 0.1, 0.3], ['Crystal Crab', 0.4, 1.2], ['Diamond Darter', 0.2, 0.5], ['Quartz Quillback', 0.5, 1.5], ['Lens Lobster', 0.6, 1.8], ['Optic Oyster', 0.3, 0.9], ['Photon Prawn', 0.1, 0.4], ['Ray Roach', 0.2, 0.6]],
        uncommon: [['Beam Bass', 2.5, 6.0], ['Spectrum Snapper', 3.0, 7.0], ['Rainbow Runner', 2.0, 5.0], ['Prism Perch', 2.2, 5.5], ['Refraction Ray', 3.5, 8.0], ['Convex Cod', 3.8, 8.5], ['Concave Carp', 3.2, 7.5], ['Focus Flounder', 2.8, 6.5], ['Magnify Mackerel', 2.4, 5.8], ['Flash Fluke', 3.0, 6.8], ['Glimmer Gar', 4.0, 9.0], ['Shine Shark', 4.5, 10.0]],
        rare: [['Polish Pike', 8.0, 20.0], ['Luster Lungfish', 9.0, 22.0], ['Gloss Grouper', 10.0, 25.0], ['Sheen Skate', 7.5, 18.0], ['Radiant Roughy', 6.5, 15.0], ['Brilliant Barracuda', 11.0, 26.0], ['Luminous Lingcod', 12.0, 28.0], ['Vivid Viperfish', 8.5, 19.0], ['Incandescent Idiacanthus', 7.0, 16.0], ['Glowing Gourami', 5.0, 12.0]],
        epic: [['Neon Needlefish', 40.0, 85.0], ['Flashlight Fish', 35.0, 80.0], ['Lantern Lurker', 45.0, 100.0], ['Beacon Bass', 50.0, 110.0], ['Signal Sturgeon', 55.0, 120.0], ['Transmission Trout', 48.0, 105.0], ['Broadcast Bream', 42.0, 95.0], ['Frequency Fish', 38.0, 90.0]],
        legendary: [['Wavelength Whale', 300.0, 750.0], ['Amplitude Angler', 280.0, 700.0], ['Phase Pike', 260.0, 650.0], ['Interference Icefish', 250.0, 600.0], ['Diffraction Drum', 320.0, 800.0]],
        mythic: [['Polarization Puffer', 2000.0, 4800.0], ['The Great Mirror', 2500.0, 5500.0], ['The White Light', 3000.0, 7000.0], ['The Final Reflection', 2800.0, 6500.0]]
    },
    silk_thread_stream: {
        common: [['Silkworm Minnow', 0.1, 0.4], ['Threadfin Dart', 0.2, 0.6], ['Bobbin Guppy', 0.1, 0.3], ['Lint Roach', 0.2, 0.5], ['Cotton Carp', 0.4, 1.2], ['Spool Sprat', 0.1, 0.3], ['Needle-Point Nibbler', 0.1, 0.4], ['Patchwork Prawn', 0.2, 0.5], ['Felt Flounder', 0.5, 1.5], ['Button Bass', 0.6, 1.8], ['Twine Tetra', 0.2, 0.6], ['Canvas Chub', 0.5, 1.4], ['Calico Catfish', 0.8, 2.5], ['Wooly Wrasse', 0.4, 1.2], ['Lace Loach', 0.2, 0.7], ['Hemming Herring', 0.3, 0.8], ['Stitch Sardine', 0.2, 0.6], ['Tassel Trout', 0.6, 2.0], ['Ribbon Rasbora', 0.1, 0.4], ['Seam Snapper', 0.5, 1.6], ['Thimble Tetra', 0.1, 0.3], ['Fiber Fin', 0.3, 0.9], ['Flax Fluke', 0.6, 1.7], ['Jute Jawfish', 0.4, 1.3], ['Hemp Halibut', 0.8, 2.2], ['String Ray', 0.7, 2.1], ['Yarn Goby', 0.2, 0.5], ['Textile Tilapia', 0.5, 1.8]],
        uncommon: [['Velvet Viperfish', 2.0, 5.5], ['Satin Salmon', 2.5, 6.0], ['Corduroy Cod', 3.0, 7.5], ['Denim Dory', 2.8, 6.5], ['Polyester Perch', 2.2, 5.8], ['Nylon Needlefish', 1.8, 4.5], ['Embroidery Eel', 3.5, 8.0], ['Quilt Queenfish', 3.0, 7.0], ['Weaver Wrasse', 2.5, 6.2], ['Spindle Shark', 4.0, 9.5], ['Shuttle Shad', 1.5, 4.0], ['Loom Lurker', 3.8, 8.5], ['Woven Walleye', 3.2, 7.8], ['Selvage Skate', 4.5, 10.0], ['Burlap Barracuda', 5.0, 11.0], ['Chenille Chub', 2.0, 5.0], ['Flannel Filefish', 2.4, 5.6], ['Tulle Tuna', 4.0, 9.0], ['Muslin Mullet', 2.6, 6.4], ['Chiffon Cichlid', 2.2, 5.5], ['Organza Oscar', 2.8, 6.8], ['Pattern Pike', 3.5, 8.2]],
        rare: [['Cashmere Carp', 8.0, 18.0], ['Pashmina Pike', 9.0, 20.0], ['Damask Drum', 7.5, 16.0], ['Brocade Bass', 8.5, 19.0], ['Paisley Plaice', 6.0, 14.0], ['Tartan Trout', 7.0, 15.0], ['Argyle Angler', 9.5, 21.0], ['Houndstooth Halibut', 10.0, 22.0], ['Herringbone Hake', 6.5, 14.5], ['Tweed Tarpon', 11.0, 24.0], ['Mohair Marlin', 12.0, 26.0], ['Angora Arapaima', 15.0, 32.0], ['Merino Mackerel', 5.5, 12.0], ['Silk-Spinner Shark', 14.0, 30.0], ['Golden-Thread Grouper', 13.0, 28.0], ['Silver-Needle Snapper', 8.0, 17.0]],
        epic: [['Kimono Koi', 40.0, 90.0], ['Saree Sturgeon', 45.0, 100.0], ['Toga Tigerfish', 50.0, 110.0], ['Tunic Tuna', 55.0, 120.0], ['Robe Ray', 42.0, 95.0], ['Mantle Manta', 48.0, 105.0], ['Vestment Viper', 38.0, 85.0], ['Cloak Coelacanth', 60.0, 130.0], ['Scarf Sawfish', 35.0, 80.0], ['Poncho Piranha', 30.0, 70.0], ['Blanket Bass', 40.0, 88.0], ['Duvet Dorado', 44.0, 98.0]],
        legendary: [['The Golden Fleece', 250.0, 600.0], ['Mithril Weave', 280.0, 650.0], ['Spidersilk Sovereign', 300.0, 700.0], ['The Grand Weaver', 350.0, 800.0], ['Eternal Loom', 320.0, 750.0], ['Fate\'s Thread', 400.0, 900.0]],
        mythic: [['Fabric of Reality', 2000.0, 4800.0], ['Time-Weaver Titan', 2500.0, 5500.0], ['The Unraveler', 2200.0, 5000.0], ['Primordial Strand', 2800.0, 6000.0]]
    }
};
// Freeze fish database to prevent console exploits
deepFreeze(FISH_DB);

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

        // Update state
        this.weather.current = type;
        const data = WEATHER_DATA[type];

        // Add new class for CSS styling
        document.body.classList.add(`weather-${type}`);

        this.ui.updateWeather(type);
        this.log(`Weather: ${data.name} - ${data.desc}`);
    }

    getWeatherMultiplier() {
        return WEATHER_DATA[this.weather.current].luck;
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
            this.breakCombo();
            return;
        }

        const hit = this.minigame.pos >= this.minigame.targetStart &&
            this.minigame.pos <= (this.minigame.targetStart + this.minigame.targetWidth);

        this.minigame.active = false;
        this.ui.showMinigame(false);
        document.getElementById('action-btn').classList.remove('reeling');

        if (hit) {
            this.catchSuccess(fish);
        } else {
            this.catchFail(fish);
        }
    }

    /* --- MECHANICS: RESOLUTION --- */
    catchSuccess(fish) {
        const rod = RODS.find(r => r.id === this.state.rod);

        // Note: Capacity check now happens in resolveMinigame() -
        // fish too heavy for the rod will ALWAYS escape before reaching here

        // 1. Success!
        this.incrementCombo();

        // Apply Combo Bonus to Value
        const comboBonus = 1 + (this.state.combo * 0.1); // 10% per combo
        fish.value = Math.floor(fish.value * comboBonus);

        // 3. Add to Inventory with unique ID
        const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.state.inventory.push({ ...fish, id: uniqueId });
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
        // Manual mode capped at 20x combo
        if (this.state.combo < 20) {
            this.state.combo++;
            if (this.state.combo > 1) this.ui.floatText(`Combo x${this.state.combo}!`);
        } else if (this.state.combo === 20) {
            this.log('Combo capped at 20x!');
        }
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
            document.getElementById('auto-cooldown-container').style.display = 'none';
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

        // Show and animate cooldown progress bar
        const container = document.getElementById('auto-cooldown-container');
        const fill = document.getElementById('cooldown-bar-fill');
        container.style.display = 'block';
        fill.style.width = '0%';

        this.ui.updateStatus('🤖 Auto-fishing...');

        const startTime = performance.now();
        const animateCooldown = (currentTime) => {
            if (!this.autoFish.enabled) {
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

        this.autoFish.timer = setTimeout(() => {
            if (!this.autoFish.enabled) return;
            container.style.display = 'none';
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

        // Capacity Check - Fish too heavy ALWAYS escapes (same as manual mode)
        if (fish.weight > rod.capacity) {
            this.log(`🤖 RELEASED! ${fish.name} (${fish.weight}kg) was too heavy to lift with ${rod.name} (${rod.capacity}kg max).`);
            this.ui.updateStatus(`🤖 ${fish.name} broke free! Too heavy!`, 'danger');
            this.breakCombo();
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

            // 3. Add to Inventory with unique ID
            const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            this.state.inventory.push({ ...fish, id: uniqueId });
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

        const data = WEATHER_DATA[type];
        if (data) {
            icon.textContent = data.icon;
            // Show luck modifier in display
            const luckMod = data.luck >= 1 ? `+${Math.round((data.luck - 1) * 100)}%` : `${Math.round((data.luck - 1) * 100)}%`;
            text.textContent = data.luck !== 1 ? `${data.name} (${luckMod} Luck)` : data.name;
            // Color the border based on luck value
            if (data.luck > 1.2) badge.style.borderColor = '#4ade80'; // Green for high luck
            else if (data.luck < 1) badge.style.borderColor = 'var(--danger)'; // Red for negative luck
            else if (data.luck > 1) badge.style.borderColor = 'var(--accent)'; // Accent for moderate luck
            else badge.style.borderColor = 'var(--border)'; // Default
        }
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
        const inventory = this.game.state.inventory;
        const currentRows = tableBody.children.length;

        // Optimization: If inventory is empty, clear table immediately
        if (inventory.length === 0) {
            tableBody.innerHTML = '';
            return;
        }

        // Optimization: Differential Update
        // If we have more items in inventory than rows, and the existing rows match the start of the list,
        // we only need to render the new items at the top.
        if (inventory.length > currentRows) {
            const newCount = inventory.length - currentRows;
            const newItems = inventory.slice(-newCount);

            // Iterate through new items and prepend them to the table.
            // Since we want the NEWEST item at the TOP, and we slice [Older, ..., Newest],
            // simply prepending each one in order works because the last one prepended ends up at the top.
            // Example: Add A then B. Prepend A (A, ...). Prepend B (B, A, ...).
            newItems.forEach(item => {
                tableBody.prepend(this.createRow(item));
            });
            return;
        }

        // Fallback: Full Re-render
        // Used when inventory shrinks (other than clear) or length mismatch implies unsynced state.
        tableBody.innerHTML = '';
        [...inventory].reverse().forEach(item => {
            tableBody.appendChild(this.createRow(item));
        });
    }

    createRow(item) {
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
        return tr;
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

    // Simple checksum for save integrity
    computeChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    save() {
        const saveData = {
            state: this.game.state,
            checksum: this.computeChecksum(this.game.state),
            version: 2 // Save version for migration
        };
        localStorage.setItem('mythic_waters_enhanced', JSON.stringify(saveData));
    }

    load() {
        const data = localStorage.getItem('mythic_waters_enhanced');
        if (data) {
            try {
                const parsed = JSON.parse(data);

                // Check for new save format (v2+)
                if (parsed.version && parsed.checksum !== undefined) {
                    const expectedChecksum = this.computeChecksum(parsed.state);
                    if (parsed.checksum !== expectedChecksum) {
                        console.warn('Save integrity check failed - data may be corrupted');
                        this.game.log('⚠️ Save data appears modified. Loading anyway...');
                    }
                    // Validate critical fields
                    const validated = this.validateState(parsed.state);
                    this.game.state = { ...this.game.state, ...validated };
                } else {
                    // Legacy save format (v1) - migrate it
                    const validated = this.validateState(parsed);
                    this.game.state = { ...this.game.state, ...validated };
                }
                this.game.log("Welcome back, angler.");
            } catch (e) { console.error("Save Error", e); }
        }
    }

    validateState(state) {
        // Sanitize loaded data to prevent injection
        const validated = { ...state };

        // Validate coins (must be positive integer)
        if (typeof validated.coins !== 'number' || validated.coins < 0) validated.coins = 0;
        validated.coins = Math.floor(validated.coins);

        // Validate level (must be positive integer >= 1)
        if (typeof validated.level !== 'number' || validated.level < 1) validated.level = 1;
        validated.level = Math.floor(validated.level);

        // Validate XP (must be positive)
        if (typeof validated.xp !== 'number' || validated.xp < 0) validated.xp = 0;

        // Validate rods owned (must be valid rod IDs from RODS)
        const validRodIds = RODS.map(r => r.id);
        if (!Array.isArray(validated.rodsOwned)) validated.rodsOwned = ['bamboo'];
        validated.rodsOwned = validated.rodsOwned.filter(id => validRodIds.includes(id));
        if (!validated.rodsOwned.includes('bamboo')) validated.rodsOwned.unshift('bamboo');

        // Validate equipped rod
        if (!validated.rodsOwned.includes(validated.rod)) validated.rod = 'bamboo';

        // Validate baits owned
        const validBaitIds = BAITS.map(b => b.id);
        if (!Array.isArray(validated.baitsOwned)) validated.baitsOwned = ['worm'];
        validated.baitsOwned = validated.baitsOwned.filter(id => validBaitIds.includes(id));
        if (!validated.baitsOwned.includes('worm')) validated.baitsOwned.unshift('worm');

        // Validate equipped bait
        if (!validated.baitsOwned.includes(validated.bait)) validated.bait = 'worm';

        // Validate location
        if (!LOCATIONS[validated.location]) validated.location = 'mistvale';

        // Validate inventory (filter invalid items)
        if (!Array.isArray(validated.inventory)) validated.inventory = [];
        validated.inventory = validated.inventory.filter(item =>
            item && typeof item.value === 'number' && typeof item.weight === 'number' && RARITY[item.rarity]
        );

        // Cap combo to prevent exploits
        if (typeof validated.combo !== 'number' || validated.combo < 0 || validated.combo > 20) validated.combo = 0;

        return validated;
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
