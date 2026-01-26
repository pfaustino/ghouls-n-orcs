/**
 * StateMachine.js
 * 
 * robust hierarchical state machine for complex character behavior.
 * Used by Player and Enemies to manage animations and logic states.
 */

export class StateMachine {
    constructor(owner) {
        this.owner = owner;
        this.states = {};
        this.currentState = null;
        this.currentStateName = "";
        this.previousStateName = "";
        this.stateStartTime = 0;
    }

    addState(name, stateImpl) {
        this.states[name] = stateImpl;
    }

    changeState(limitToName) {
        // If we're already in this state, do nothing
        if (this.currentStateName === limitToName) return;

        const newState = this.states[limitToName];
        if (!newState) {
            console.error(`State ${limitToName} not found!`);
            return;
        }

        // Exit current state
        if (this.currentState && this.currentState.exit) {
            this.currentState.exit();
        }

        // Store history
        this.previousStateName = this.currentStateName;
        this.currentStateName = limitToName;
        this.currentState = newState;
        this.stateStartTime = performance.now() / 1000;

        // Enter new state
        if (this.currentState.enter) {
            this.currentState.enter();
        }

        // Debug
        // console.log(`State changed: ${this.previousStateName} -> ${this.currentStateName}`);
    }

    update(dt) {
        if (this.currentState && this.currentState.update) {
            this.currentState.update(dt);
        }
    }

    getStateDuration() {
        return (performance.now() / 1000) - this.stateStartTime;
    }
}

/**
 * Base State definition
 */
export class State {
    constructor(machine) {
        this.machine = machine;
        this.owner = machine.owner;
    }

    enter() { }
    update(dt) { }
    exit() { }
}
