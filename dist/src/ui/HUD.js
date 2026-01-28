
export class HUD {
    constructor() {
        // Assume HTML elements already exist with these IDs
        this.armorEls = Array.from(document.querySelectorAll('[id^=armor-]'));
        this.livesEl = document.getElementById('lives');
        this.weaponIcon = document.getElementById('weapon-icon');
        this.moonTimer = document.getElementById('moon-timer');
        this.soulCounter = document.getElementById('souls');
    }

    update(player, moonProgress) {
        // Armor
        this.armorEls.forEach((el, i) => {
            // IDs are armor-1, armor-2... 
            // array index 0 corresponds to armor 1
            // if player.health is 2, then armor 1 and 2 (indices 0 and 1) are active
            // so we toggle 'lost' if index >= player.health
            el.classList.toggle('lost', i >= player.health);
        });

        // Lives
        if (this.livesEl) {
            this.livesEl.textContent = `Lives: ${player.lives !== undefined ? player.lives : 3}`;
        }

        // Weapon
        if (this.weaponIcon && player.currentWeapon) {
            const newSrc = `assets/${player.currentWeapon.sprite}.png`;
            // Only update if changed to prevent 404 flooding / flickering
            if (!this.weaponIcon.src.endsWith(newSrc) && this.weaponIcon.getAttribute('data-weapon') !== player.currentWeapon.sprite) {
                this.weaponIcon.src = newSrc;
                this.weaponIcon.setAttribute('data-weapon', player.currentWeapon.sprite);
            }
        }

        // Moon timer (percentage)
        if (this.moonTimer) {
            this.moonTimer.style.width = `${moonProgress * 100}%`;
        }

        // Souls
        if (this.soulCounter) {
            this.soulCounter.textContent = player.souls !== undefined ? player.souls : 0;
        }
    }
}
