/**
 * UI HANDLER
 * Manages all DOM rendering: stats, locations, weather, minigame, and status messages.
 */

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
                // Clear amulet if new biome doesn't match
                if (this.game.state.activeAmulet && this.game.state.activeAmulet !== key) {
                    this.game.log(`Your ${AMULETS[this.game.state.activeAmulet].name} fades as you leave its biome.`);
                    this.game.state.activeAmulet = null;
                }
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
        let label = `Last Catch: <span style="color:${RARITY[fish.rarity].color}">${fish.name}</span> (${fish.weight}kg)`;
        if (fish.variant) {
            const varColor = fish.variant.label === 'Prismatic' ? '#e879f9' :
                fish.variant.label === 'Shadow' ? '#6366f1' : '#facc15';
            label = `Last Catch: <span style="color:${varColor}">${fish.variant.icon} ${fish.variant.label}</span> <span style="color:${RARITY[fish.rarity].color}">${fish.name}</span> (${fish.weight}kg)`;
        }
        document.getElementById('last-catch').innerHTML = label;
    }

    showMinigame(show) {
        const el = document.getElementById('minigame-ui');
        el.className = show ? 'minigame-container active' : 'minigame-container';
    }

    updateWeather() {
        const badge = document.getElementById('weather-badge');
        const text = document.getElementById('weather-text');
        const icon = document.querySelector('.weather-icon');

        const baseWeather = WEATHER_DATA[this.game.weather.current];
        const activeWeathers = this.game.state.activeWeathers || [];

        // Build icon string: base + purchased
        let icons = baseWeather ? baseWeather.icon : '☀️';
        activeWeathers.forEach(key => {
            const d = WEATHER_DATA[key];
            if (d) icons += d.icon;
        });
        icon.textContent = icons;

        // Combined luck display
        const totalLuck = this.game.getWeatherMultiplier();
        const luckMod = totalLuck >= 1 ? `+${Math.round((totalLuck - 1) * 100)}%` : `${Math.round((totalLuck - 1) * 100)}%`;

        if (activeWeathers.length > 0) {
            text.textContent = `${activeWeathers.length + 1} Weathers (${luckMod} Luck)`;
            badge.style.borderColor = '#4ade80';
        } else if (baseWeather) {
            text.textContent = baseWeather.luck !== 1 ? `${baseWeather.name} (${luckMod} Luck)` : baseWeather.name;
            if (baseWeather.luck > 1.2) badge.style.borderColor = '#4ade80';
            else if (baseWeather.luck < 1) badge.style.borderColor = 'var(--danger)';
            else if (baseWeather.luck > 1) badge.style.borderColor = 'var(--accent)';
            else badge.style.borderColor = 'var(--border)';
        }
    }

    floatText(msg) {
        this.floatTextStyled(msg, '#facc15');
    }

    floatTextStyled(msg, color = '#facc15') {
        const container = document.querySelector('.action-area') || document.body;
        const el = document.createElement('div');
        el.textContent = msg;
        Object.assign(el.style, {
            position: 'absolute',
            left: '50%',
            top: '40%',
            transform: 'translateX(-50%)',
            fontSize: '1.4rem',
            fontWeight: '700',
            color: color,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            zIndex: '100',
            transition: 'all 1.5s ease-out',
            opacity: '1'
        });
        container.style.position = container.style.position || 'relative';
        container.appendChild(el);
        requestAnimationFrame(() => {
            el.style.top = '10%';
            el.style.opacity = '0';
        });
        setTimeout(() => el.remove(), 1600);
    }
}
