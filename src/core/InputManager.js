/**
 * InputManager.js
 * 
 * Handles all keyboard and gamepad input with an event-driven architecture.
 * Supports both pressed/released states and continuous input polling.
 * 
 * Design goals:
 * - Immediate input for responsive gameplay
 * - Buffered inputs for attack/jump queuing
 * - Clean event subscription for UI systems
 */

export class InputManager {
    constructor() {
        // Current state of all keys
        this.keys = new Map();

        // Keys pressed this frame (for single-press actions)
        this.justPressed = new Set();

        // Keys released this frame
        this.justReleased = new Set();

        // Input buffer for combo/queuing system
        this.inputBuffer = [];
        this.bufferDuration = 0.15; // 150ms input buffer

        // Event listeners
        this.listeners = new Map();

        // Gamepad state
        this.gamepad = null;
        this.gamepadDeadzone = 0.2;

        // Key bindings (easily remappable)
        this.bindings = {
            // Movement
            left: ['KeyA', 'ArrowLeft'],
            right: ['KeyD', 'ArrowRight'],
            up: ['KeyW', 'ArrowUp'],
            down: ['KeyS', 'ArrowDown'],

            // Actions
            jump: ['Space'],
            attackPrimary: ['KeyJ'],      // Throw
            attackSecondary: ['KeyK'],    // Heavy melee
            roll: ['KeyL'],               // Roll/Dodge

            // Weapons
            weaponPrev: ['KeyQ'],
            weaponNext: ['KeyE'],

            // System
            pause: ['Escape'],
            debug: ['F3']
        };

        // Initialize
        this.setupKeyboardListeners();
        this.setupGamepadListeners();
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            // Prevent default for game keys (but not F-keys for dev tools)
            if (!e.code.startsWith('F') || e.code === 'F3') {
                e.preventDefault();
            }

            // Track if this is a new press
            if (!this.keys.get(e.code)) {
                this.justPressed.add(e.code);
                this.addToBuffer(e.code);
            }

            this.keys.set(e.code, true);

            // Check for bound actions
            this.checkBindings(e.code, 'pressed');
        });

        window.addEventListener('keyup', (e) => {
            this.keys.set(e.code, false);
            this.justReleased.add(e.code);

            // Check for bound actions
            this.checkBindings(e.code, 'released');
        });

        // Clear per-frame states at end of each frame
        // This is called from the game loop
    }

    /**
     * Setup gamepad connection listeners
     */
    setupGamepadListeners() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('🎮 Gamepad connected:', e.gamepad.id);
            this.gamepad = e.gamepad;
        });

        window.addEventListener('gamepaddisconnected', () => {
            console.log('🎮 Gamepad disconnected');
            this.gamepad = null;
        });
    }

    /**
     * Add input to buffer for combo/queue system
     */
    addToBuffer(code) {
        this.inputBuffer.push({
            code,
            timestamp: performance.now()
        });

        // Clean old inputs
        const now = performance.now();
        this.inputBuffer = this.inputBuffer.filter(
            input => (now - input.timestamp) < this.bufferDuration * 1000
        );
    }

    /**
     * Check if a buffered input exists
     */
    hasBufferedInput(action) {
        const codes = this.bindings[action] || [];
        const now = performance.now();

        return this.inputBuffer.some(input =>
            codes.includes(input.code) &&
            (now - input.timestamp) < this.bufferDuration * 1000
        );
    }

    /**
     * Consume a buffered input (removes it)
     */
    consumeBufferedInput(action) {
        const codes = this.bindings[action] || [];
        const now = performance.now();

        const index = this.inputBuffer.findIndex(input =>
            codes.includes(input.code) &&
            (now - input.timestamp) < this.bufferDuration * 1000
        );

        if (index !== -1) {
            this.inputBuffer.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Check if an action is currently held
     */
    isHeld(action) {
        const codes = this.bindings[action] || [];
        return codes.some(code => this.keys.get(code)) || this.keys.get(`GP_${action}`);
    }

    /**
     * Check if an action was just pressed this frame
     */
    isJustPressed(action) {
        const codes = this.bindings[action] || [];
        return codes.some(code => this.justPressed.has(code)) || this.justPressed.has(`GP_${action}`);
    }

    /**
     * Check if an action was just released this frame
     */
    isJustReleased(action) {
        const codes = this.bindings[action] || [];
        return codes.some(code => this.justReleased.has(code)) || this.justReleased.has(`GP_${action}`);
    }

    /**
     * Get horizontal movement input (-1 to 1)
     */
    getHorizontalAxis() {
        let axis = 0;

        if (this.isHeld('left')) axis -= 1;
        if (this.isHeld('right')) axis += 1;

        // Add gamepad input
        if (this.gamepad) {
            const gamepads = navigator.getGamepads();
            const gp = gamepads[this.gamepad.index];
            if (gp) {
                const leftStickX = gp.axes[0];
                if (Math.abs(leftStickX) > this.gamepadDeadzone) {
                    axis = leftStickX;
                }
            }
        }

        return Math.max(-1, Math.min(1, axis));
    }

    /**
     * Get vertical movement input (-1 to 1)
     */
    getVerticalAxis() {
        let axis = 0;

        if (this.isHeld('up')) axis += 1;
        if (this.isHeld('down')) axis -= 1;

        // Add gamepad input
        if (this.gamepad) {
            const gamepads = navigator.getGamepads();
            const gp = gamepads[this.gamepad.index];
            if (gp) {
                const leftStickY = -gp.axes[1]; // Invert Y
                if (Math.abs(leftStickY) > this.gamepadDeadzone) {
                    axis = leftStickY;
                }
            }
        }

        return Math.max(-1, Math.min(1, axis));
    }

    /**
     * Check bindings and emit events
     */
    checkBindings(code, type) {
        for (const [action, codes] of Object.entries(this.bindings)) {
            if (codes.includes(code)) {
                this.emit(action, { type, code });
            }
        }
    }

    /**
     * Subscribe to input events
     */
    on(action, callback) {
        if (!this.listeners.has(action)) {
            this.listeners.set(action, []);
        }
        this.listeners.get(action).push(callback);
    }

    /**
     * Unsubscribe from input events
     */
    off(action, callback) {
        const list = this.listeners.get(action);
        if (list) {
            const index = list.indexOf(callback);
            if (index !== -1) list.splice(index, 1);
        }
    }

    /**
     * Emit an input event
     */
    emit(action, data) {
        const list = this.listeners.get(action);
        if (list) {
            for (const callback of list) {
                callback(data);
            }
        }
    }

    /**
     * Clear per-frame input states
     * Call this at the end of each game loop frame
     */
    endFrame() {
        this.justPressed.clear();
        this.justReleased.clear();
    }

    /**
     * Poll gamepad state (call each frame)
     */
    pollGamepad() {
        if (!this.gamepad) return;

        const gamepads = navigator.getGamepads();
        const gp = gamepads[this.gamepad.index];
        if (!gp) return;

        // Map gamepad buttons to actions
        // Button indices may vary by controller
        const buttonMap = {
            0: 'jump',           // A/Cross
            2: 'attackPrimary',  // X/Square
            3: 'attackSecondary',// Y/Triangle
            1: 'roll',           // B/Circle
            4: 'weaponPrev',     // LB
            5: 'weaponNext',     // RB
            9: 'pause'           // Start
        };

        for (const [buttonIndex, action] of Object.entries(buttonMap)) {
            const button = gp.buttons[buttonIndex];
            if (button && button.pressed) {
                // Simulate key press for this action
                const codes = this.bindings[action];
                if (codes && codes.length > 0) {
                    if (!this.keys.get(`GP_${action}`)) {
                        this.justPressed.add(`GP_${action}`);
                    }
                    this.keys.set(`GP_${action}`, true);
                }
            } else {
                if (this.keys.get(`GP_${action}`)) {
                    this.justReleased.add(`GP_${action}`);
                }
                this.keys.set(`GP_${action}`, false);
            }
        }
    }
}
