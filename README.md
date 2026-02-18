# 🎣 Mythic Waters: Enhanced Edition

**Mythic Waters** is a feature-rich, browser-based fishing simulation RPG built entirely with Vanilla JavaScript — no frameworks, no build tools, no dependencies. It combines a skill-based reflex minigame with deep idle progression mechanics, all wrapped in a responsive "Pastel Pop" aesthetic powered by the **Space Grotesk** typeface and CSS custom properties. Players travel across 20 legendary biomes, adapt to 20 dynamic weather conditions, and upgrade their arsenal across 12 rods and 11 baits in pursuit of the elusive *Mythic* tier catch.

---

## ✨ Key Features

### 🎮 Core Gameplay

* **Skill-Based Catching:** Every cast triggers a reflex-based minigame where a moving indicator bounces back and forth across a track. Players must time their click to land the indicator inside a colored target zone. Rarer fish produce smaller zones and faster indicators, making them genuinely harder to catch.
* **Six-Tier Rarity System:** Fish are divided into **Common**, **Uncommon**, **Rare**, **Epic**, **Legendary**, and **Mythic** tiers. Catch rates are determined by a weighted RNG roll that factors in the combined Luck stat from your equipped rod, bait, active amulet, and any weather modifiers currently in play.
* **Rod Capacity Mechanic:** Each rod has a maximum weight capacity. If a hooked fish exceeds that limit, the line snaps and the fish escapes — regardless of minigame performance. This creates a natural gear gate that rewards strategic upgrades.
* **Idle Auto-Fishing:** Toggle a fully automated fishing bot (🤖) that cycles through casting, hooking, and reeling on randomized cooldowns (1–3 seconds). Auto-fishing uses a Web Worker–based timer system that continues to fire reliably even when the browser tab is in the background, so idle progression is never throttled. The auto-fish combo is capped at 10× (compared to 20× in manual mode) to preserve the incentive for active play.
* **Offline Progression:** When auto-fishing is enabled and the player closes the browser, the game simulates all missed fishing cycles upon return. The elapsed time is divided by the average cycle duration (~3.3 seconds), and each simulated cycle rolls rarity, weight, capacity checks, combo bonuses, amulet consumption, and XP — exactly mirroring live auto-fish logic.

### 🌍 World & Environment

* **20 Unique Biomes:** The game world spans a wide range of fantastical environments, each with its own color palette, lore description, and exclusive fish species roster. Locations range from the serene *Mistvale Lake* and rugged *Stone Rapids* through exotic realms like the *Neon Bayou*, *Chrono-River*, and *Aetherial Void*, all the way to the creative *Confection Coast*, *Origami Archipelago*, and *Silk-Thread Stream*.
* **20 Dynamic Weather Patterns:** Weather changes automatically every 3 minutes through a weighted probability system, and each pattern applies its own Luck multiplier, difficulty modifier, and a chance for unique fish buffs that increase sell value:
  * **Standard (6):** Clear Skies, Light Rain, Thunderstorm, Dense Fog, Heatwave, Gale Force.
  * **Exotic (7):** Rare phenomena like **Locust Plague** (+40% Luck feeding frenzy), **Sakura Drift** (calmer waters, +30% Luck), **Flash Blizzard** (−20% Luck but guaranteed Cryo-Preserved +60% Value), **Acid Downpour** (small chance for Mutated +150% Value), and **Tectonic Shift** (+50% Luck, erratic fish).
  * **Additional (7):** **Golden Hour**, **Crimson Tide**, **Ashfall**, **Diamond Dust**, **Monsoon**, **Autumn Drift**, and the extremely rare **Swamp Haze** (neutral Luck but a tiny chance for Ancient fish at +200% Value).
* **Purchasable Weather Stacking:** Players can buy weather effects from the shop and run multiple simultaneously alongside the natural cycle, stacking their Luck bonuses additively.

### 💰 Progression & Economy

* **12 Fishing Rods:** A full upgrade path from the free *Bamboo Pole* (15 kg capacity) through mid-game rods like the *Carbon Striker* and *Titanium Alloy*, up to endgame powerhouses like the *Chrono-Spinner* (25,000 kg) and the ultimate *Omni-Verse Rod* (100,000 kg capacity, 800 Luck).
* **11 Bait Types:** Each bait adds a flat Luck bonus. The progression runs from the humble *Worm* (+1 Luck) through *Flux Jelly*, *Magic Paste*, and *Void Essence* up to the endgame *Singularity Lure* (+200 Luck).
* **Biome-Specific Amulets:** Purchasable consumable items that provide a Luck bonus while fishing in their matching biome. Each successful catch consumes one charge, and the amulet deactivates when its stock is depleted.
* **Combo System:** Consecutive successful catches build a combo multiplier, adding +10% value per combo level. Manual fishing caps at 20× combo (+200% value) while auto-fishing caps at 10× (+100% value). Missed catches or escaped fish instantly reset the combo.
* **XP & Leveling:** Every catch awards rarity-scaled XP. Level thresholds follow a quadratic curve (`level × 1000 + level² × 100`), ensuring a satisfying early-game pace that gradually slows into endgame.
* **Persistent Saves:** The built-in `SaveSystem` writes game state to `localStorage` with checksum validation to guard against corruption. Saves are triggered automatically after every catch and on manual button press, and can be fully reset from the header.
* **Anti-Exploit Protections:** All static data objects (rods, baits, rarity tables, locations, weather, fish databases) are deeply frozen with `Object.freeze()` and `deepFreeze()` to prevent console-based tampering.

---

## 🛠️ Technical Architecture

### Stack

* **HTML5** — Semantic markup with a single-page layout. Every interactive element has a unique ID for clean DOM queries.
* **CSS3** — A custom "Pastel Pop" design system built on CSS custom properties (`:root` variables), `Grid` and `Flexbox` layouts, `backdrop-filter` glassmorphism effects, and CSS `@keyframes` animations for floating text, progress bars, and weather transitions. Typography is set in [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) via Google Fonts.
* **JavaScript (ES6+)** — Fully object-oriented with modular class-based architecture. Zero external dependencies.

### Codebase Overview

The project is organized into a clean separation of **data**, **systems**, and **engine** layers:

| Layer | Responsibility |
|---|---|
| `js/data/` | Static game data: rarity tiers, rods, baits, weather definitions, locations, amulets, and per-biome fish databases. All data is frozen at load time. |
| `js/data/biomes/` | Individual fish roster files for each of the 20 biomes. Each file registers its fish arrays into the global `FISH_DB` object. |
| `js/systems/` | Runtime subsystems: `UI` (rendering, status updates, floating text), `Shop` (tabbed modal — weather, amulets, rods, baits), `Inventory` (catch log table, sell logic), and `SaveSystem` (localStorage persistence with checksum). |
| `js/engine.js` | The core `Game` class: state management, weather cycling, cast/rarity/minigame logic, combo system, auto-fish lifecycle, offline catch simulation, and Web Worker timer integration. |
| `js/timer-worker.js` | A lightweight Web Worker script for `setTimeout` that fires reliably in background tabs (not throttled by the browser). The engine inlines this as a Blob for `file://` compatibility. |
| `game.js` | Legacy monolithic file containing the original all-in-one game code (data + logic + UI). Retained for reference; the modular `js/` structure is the active codebase. |

---

## 📂 Project Structure

```text
fishing-simulator/
├── index.html                        # Entry point — DOM layout and script loading order
├── styles.css                        # Full "Pastel Pop" design system and animations
├── game.js                           # Legacy monolithic game file (reference only)
├── LICENSE                           # MIT License
├── README.md                         # This file
│
└── js/
    ├── engine.js                     # Core Game class — all runtime logic
    ├── timer-worker.js               # Web Worker for background-safe timers
    │
    ├── data/
    │   ├── rarity.js                 # Six rarity tiers and their stat multipliers
    │   ├── rods.js                   # 12 fishing rods (cost, luck, capacity, speed)
    │   ├── baits.js                  # 11 bait types (cost, luck bonus)
    │   ├── weather.js                # 20 weather patterns and deepFreeze utility
    │   ├── locations.js              # 20 biome definitions (name, lore, color palette)
    │   ├── amulets.js                # Per-biome amulet data (cost, luck bonus, stock)
    │   ├── weather-shop.js           # Weather shop purchase limits
    │   ├── fish-db.js                # Global FISH_DB initializer
    │   │
    │   └── biomes/                   # Per-biome fish rosters (20 files)
    │       ├── mistvale.js
    │       ├── stone_rapids.js
    │       ├── volcanic.js
    │       ├── emerald.js
    │       ├── midnight.js
    │       ├── crystalline_abyss.js
    │       ├── skyhollow_reaches.js
    │       ├── resonant_depths.js
    │       ├── mycelial_depths.js
    │       ├── sunken_citadel.js
    │       ├── glacial_spire.js
    │       ├── chrono_river.js
    │       ├── neon_bayou.js
    │       ├── gearwork_grotto.js
    │       ├── aetherial_void.js
    │       ├── confection_coast.js
    │       ├── origami_archipelago.js
    │       ├── vaporwave_vista.js
    │       ├── prism_light_pools.js
    │       └── silk_thread_stream.js
    │
    └── systems/
        ├── ui.js                     # UI rendering — stats, status bar, floating text
        ├── shop.js                   # Tabbed shop modal — buy rods, baits, weather, amulets
        ├── inventory.js              # Catch log table and sell-all functionality
        └── save.js                   # localStorage persistence with checksum validation
```

---

## 🚀 Getting Started

### Prerequisites

All you need is a modern web browser — no Node.js, no package manager, no build step. The entire game runs from static files.

### Running Locally

1. **Clone the repository:**

   ```bash
   git clone https://github.com/prezvious/fishing-simulator.git
   cd fishing-simulator
   ```

2. **Open the game:**
   Simply open `index.html` in any modern web browser (Chrome, Firefox, Edge, or Safari). You can double-click the file or drag it into a browser window.

3. **Start fishing!**

> **Note:** The game works perfectly when opened directly from the filesystem (`file://` protocol). The Web Worker timer is inlined as a Blob URL, so there are no cross-origin issues even without a local server.

### Optional: Local Development Server

If you prefer to serve the files over HTTP (for example, to avoid any `file://` edge cases in older browsers), you can use any simple static server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx, no install needed)
npx -y serve .
```

Then open `http://localhost:8000` in your browser.

---

## 🕹️ How to Play

1. **Cast Your Line** — Click the **"Cast Line"** button. The game rolls for a fish rarity based on your total Luck (the sum of your rod's Luck, bait's Luck, any active amulet bonus, all multiplied by the current weather modifier).

2. **Play the Minigame** — When a fish bites, an indicator bar starts bouncing across the screen. Click **"REEL NOW!"** while the indicator is inside the green target zone to land the catch. Rarer fish have faster indicators, smaller target zones, and weather can further alter difficulty.

3. **Watch Your Rod Capacity** — If the fish's weight exceeds your rod's maximum capacity, it will snap the line and escape no matter how good your timing is. Upgrade your rod to handle heavier catches.

4. **Build Combos** — Consecutive successful catches increase your combo multiplier, boosting the coin value of every subsequent catch. Missing a fish or having one escape resets the combo to zero.

5. **Explore Biomes** — Use the **Expeditions** panel to travel to different biomes. Each location has its own unique pool of fish species across all six rarity tiers.

6. **Upgrade Your Gear** — Open the **Shop** to invest your coins in better rods (more Luck and weight capacity), stronger baits (more Luck), weather effects (stackable Luck bonuses), and biome amulets (consumable Luck boosts).

7. **Go Idle** — Toggle the **🤖 Auto** button to enable auto-fishing. The bot will cast, hook, and reel automatically on a loop. It even works in background tabs and simulates catches while you're away.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

Copyright © 2026 Maximus Erick.
