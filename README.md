# 🎣 Mythic Waters: Enhanced Edition

**Mythic Waters** is a feature-rich, browser-based fishing simulation RPG built with Vanilla JavaScript. It combines skill-based minigames with idle mechanics, wrapped in a responsive "Pastel Pop" aesthetic. Players travel across legendary biomes, battle dynamic weather conditions, and upgrade their arsenal to catch the elusive *Mythic* tier fish.

## ✨ Key Features

### 🎮 Core Gameplay
* **Skill-Based Catching:** A reflex-based minigame where players must hook fish by aligning a moving indicator with a dynamic target zone.
* **Rarity System:** Six tiers of fish ranging from **Common** to **Mythic**, with catch rates calculated via a weighted RNG system based on Luck stats.
* **Idle Mechanics:** A balanced **Auto-Fish** mode ("Bot") that allows for passive grinding with a randomized cooldown (1-3s) and a combo cap of 10x to balance progression.

### 🌍 Dynamic Environment
* **15 Unique Biomes:** Explore a vast world including *Mistvale Lake*, *Volcanic Bay*, *Neon Bayou*, *Chrono-River*, and the reality-bending *Aetherial Void*. Each location features unique visual themes, lore, and exclusive fish species.
* **Advanced Weather System:** A real-time cycle featuring **13 distinct weather patterns**:
    * **Standard:** Clear, Rain, Storm, Fog, Heatwave, Gale.
    * **Exotic Events:** Rare phenomena like **Locust Plagues** (+40% Luck), **Silica Storms** (Abrasive sand), **Flash Blizzards** (Frozen lines), and **Tectonic Shifts** that drastically alter gameplay difficulty and rewards.

### 💰 Progression & Economy
* **Gear Mastery:** Purchase **12 tiers of fishing rods** (from *Bamboo* to the *Omni-Verse Rod*) and **11 types of bait** (including *Void Essence* and *Singularity Lures*) to maximize Capacity and Luck.
* **Combo System:** Chain catches together to increase fish value (up to +200% value at 20x combo).
* **Economy:** Sell catches to earn coins, gain XP to level up, and manage a weight-limited inventory.
* **Persistent Data:** Built-in local storage system (`SaveSystem`) ensures progress is saved automatically with checksum validation to prevent corruption.

## 🛠️ Technical Stack

* **HTML5:** Semantic structure for the game interface.
* **CSS3:** Custom "Pastel Pop" design system using CSS Variables (`:root`), Grid/Flexbox layouts, and CSS Keyframe animations for visual feedback.
* **JavaScript (ES6+):**
    * **OOP Architecture:** Modular classes for `Game`, `UI`, `Shop`, `Inventory`, and `SaveSystem`.
    * **State Management:** Centralized state object for data consistency.
    * **No External Dependencies:** Lightweight and fast performance without frameworks.

## 🚀 How to Run

1.  **Clone or Download** the repository.
2.  Ensure the file structure is correct:
    * `index.html`
    * `styles.css`
    * `game.js`
3.  Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari).
4.  Start fishing!

## 🕹️ How to Play

1.  **Cast:** Click **"Cast Line"** to start. The rarity of the fish is determined by your current Luck (Rod + Bait + Weather).
2.  **Hook:** When a fish bites, a minigame appears. Click **"REEL NOW!"** when the moving bar is inside the green target zone.
    * *Tip:* Rarer fish have faster bars and smaller target zones.
3.  **Manage:** If the fish is too heavy for your rod, the line will snap. Upgrade your rod in the **Rod Smith** shop to increase weight capacity.
4.  **Travel:** Use the **Expeditions** panel to change biomes and discover new fish species.
5.  **Automate:** Toggle the **🤖 Auto** button to let the game fish for you (with reduced efficiency and capped combos).

## 📂 Project Structure

```text
/
├── index.html      # Main entry point and DOM structure
├── styles.css      # Styling, animations, and "Pastel Pop" theme
└── game.js         # Game logic, databases (Fish/Items/Locations), and controller
```
