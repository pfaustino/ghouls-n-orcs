
export class Input {
    constructor() {
        this.keys = {};
        this.prevKeys = {};
        this.justPressed = {};
        this.justReleased = {};

        // Bind events
        window.addEventListener('keydown', (e) => this._down(e));
        window.addEventListener('keyup', (e) => this._up(e));
    }

    _down(e) {
        this.keys[e.key.toLowerCase()] = true;
    }

    _up(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    // Call at start of each frame to capture "just pressed/released"
    update() {
        this.justPressed = {};
        this.justReleased = {};

        for (const k in this.keys) {
            const now = this.keys[k];
            const before = this.prevKeys[k] ?? false;
            if (now && !before) this.justPressed[k] = true;
            if (!now && before) this.justReleased[k] = true;
        }
        this.prevKeys = { ...this.keys };
    }

    isJustPressed(action) {
        const map = {
            left: ['a', 'arrowleft'],
            right: ['d', 'arrowright'],
            jump: [' ', 'arrowup'],
            down: ['s', 'arrowdown'],
            attackPrimary: ['j'],
            attackHeavy: ['k'],
            guard: ['l'],
            switchWeaponPrev: ['q'],
            switchWeaponNext: ['e'],
            pause: ['escape'],
            restart: ['r']
        };
        const keys = map[action];
        return keys ? keys.some(k => this.justPressed[k]) : false;
    }

    isJustReleased(action) {
        const map = {
            jump: [' ', 'arrowup']
        };
        return map[action]?.some(k => this.justReleased[k]);
    }

    getHorizontalAxis() {
        let axis = 0;
        if (this.keys['a'] || this.keys['arrowleft']) axis -= 1;
        if (this.keys['d'] || this.keys['arrowright']) axis += 1;
        return axis;
    }
}
