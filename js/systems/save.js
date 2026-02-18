/**
 * SAVE SYSTEM
 * Handles saving, loading, validation, and resetting of game state via localStorage.
 */

class SaveSystem {
    constructor(game) { this.game = game; }

    // Simple checksum for save integrity
    computeChecksum(data) {
        // Vuln #3: Salted checksum — salt uses game state fields so
        // console users can't regenerate valid checksums externally
        const salt = 'MW_v3_' + (data.totalCatches || 0) + '_' + (data.level || 1);
        const str = salt + JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    save() {
        this.game.state.lastSaveTimestamp = Date.now();

        // Cap inventory at 500 items — auto-sell oldest fish over the limit
        const MAX_INVENTORY = 500;
        if (this.game.state.inventory.length > MAX_INVENTORY) {
            const excess = this.game.state.inventory.splice(0, this.game.state.inventory.length - MAX_INVENTORY);
            let soldValue = 0;
            excess.forEach(item => soldValue += item.value);
            this.game.state.coins += soldValue;
            this.game.log(`📦 Inventory full! Auto-sold ${excess.length} oldest fish for ${soldValue.toLocaleString()} coins.`);
            // D1 fix: Check coin-based achievements after auto-sell
            this.game.achievementManager.onCoinsChange();
        }

        const saveData = {
            state: this.game.state,
            checksum: this.computeChecksum(this.game.state),
            version: 3
        };

        try {
            localStorage.setItem('mythic_waters_enhanced', JSON.stringify(saveData));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                // Emergency: sell all inventory to free up space
                console.warn('localStorage quota exceeded — emergency auto-sell triggered');
                let emergencyCoins = 0;
                this.game.state.inventory.forEach(item => emergencyCoins += item.value);
                this.game.state.coins += emergencyCoins;
                this.game.state.inventory = [];
                this.game.log(`⚠️ Storage full! Emergency sold all fish for ${emergencyCoins.toLocaleString()} coins.`);

                // Retry save with empty inventory
                try {
                    const retryData = {
                        state: this.game.state,
                        checksum: this.computeChecksum(this.game.state),
                        version: 3
                    };
                    localStorage.setItem('mythic_waters_enhanced', JSON.stringify(retryData));
                } catch (retryErr) {
                    console.error('Save failed even after emergency sell:', retryErr);
                }
            } else {
                console.error('Save error:', e);
            }
        }
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
                        // E3 fix: Reject tampered saves — reset to defaults
                        console.warn('Save integrity check failed — data has been tampered with');
                        this.game.log('⚠️ Save data tampered! Progress reset for integrity.');
                        alert('⚠️ Save data integrity check failed.\nYour save appears to have been modified externally.\nProgress has been reset to prevent exploits.');
                        localStorage.removeItem('mythic_waters_enhanced');
                        return;
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

        // Validate totalCatches
        if (typeof validated.totalCatches !== 'number' || validated.totalCatches < 0) validated.totalCatches = 0;
        validated.totalCatches = Math.floor(validated.totalCatches);

        // Validate activeWeathers (array of valid weather keys, max WEATHER_BUY_LIMIT)
        if (!Array.isArray(validated.activeWeathers)) {
            validated.activeWeathers = [];
        } else {
            const validWeatherKeys = Object.keys(WEATHER_DATA);
            validated.activeWeathers = validated.activeWeathers
                .filter(k => validWeatherKeys.includes(k))
                .slice(0, WEATHER_BUY_LIMIT);
        }

        // Validate amuletStock (object with valid biome keys, values >= 0)
        if (typeof validated.amuletStock !== 'object' || validated.amuletStock === null || Array.isArray(validated.amuletStock)) {
            validated.amuletStock = {};
        } else {
            const validBiomeKeys = Object.keys(LOCATIONS);
            const cleanAmulets = {};
            for (const [key, val] of Object.entries(validated.amuletStock)) {
                if (validBiomeKeys.includes(key) && typeof val === 'number' && val >= 0) {
                    cleanAmulets[key] = Math.floor(val);
                }
            }
            validated.amuletStock = cleanAmulets;
        }

        // Validate activeAmulet (must be valid biome key with stock, or null)
        if (validated.activeAmulet !== null) {
            if (!AMULETS[validated.activeAmulet]) {
                validated.activeAmulet = null;
            } else if (!validated.amuletStock[validated.activeAmulet] || validated.amuletStock[validated.activeAmulet] <= 0) {
                validated.activeAmulet = null;
            }
        }

        // Validate auto-fish persistence
        if (typeof validated.autoFishEnabled !== 'boolean') validated.autoFishEnabled = false;
        if (typeof validated.lastSaveTimestamp !== 'number' || validated.lastSaveTimestamp <= 0) {
            validated.lastSaveTimestamp = Date.now();
        }

        // Validate pityCounter (must be non-negative integer, capped at 100)
        if (typeof validated.pityCounter !== 'number' || validated.pityCounter < 0) validated.pityCounter = 0;
        validated.pityCounter = Math.min(Math.floor(validated.pityCounter), 100);

        // Validate achievements (array of valid achievement IDs)
        if (!Array.isArray(validated.achievements)) {
            validated.achievements = [];
        } else {
            const validIds = Object.keys(ACHIEVEMENTS);
            validated.achievements = validated.achievements.filter(id => validIds.includes(id));
            validated.achievements = [...new Set(validated.achievements)]; // deduplicate
        }

        // Validate achievementCounters (object with numeric values)
        if (typeof validated.achievementCounters !== 'object' || validated.achievementCounters === null || Array.isArray(validated.achievementCounters)) {
            validated.achievementCounters = {};
        } else {
            for (const [key, val] of Object.entries(validated.achievementCounters)) {
                if (typeof val !== 'number' || val < 0) validated.achievementCounters[key] = 0;
            }
        }

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
