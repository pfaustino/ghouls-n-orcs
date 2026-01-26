/**
 * Ghoul.js
 * 
 * Basic fodder enemy.
 * AI Behavior:
 * - IDLE: Wait seeing player
 * - PURSUE: Walk towards player
 * - ATTACK: Stop and lunge when close
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Enemy } from './Enemy.js';
import { State } from '../core/StateMachine.js';

export class Ghoul extends Enemy {
    createMesh() {
        // Green, hunchbacked box
        const geo = new THREE.BoxGeometry(0.8, 1.4, 0.8);
        const mat = new THREE.MeshStandardMaterial({ color: 0x44aa44 }); // Zombie green
        this.bodyMesh = new THREE.Mesh(geo, mat);
        this.bodyMesh.position.y = 0.7;
        this.bodyMesh.castShadow = true;
        this.mesh.add(this.bodyMesh);

        // Add "Arms"
        const armGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
        const armLeft = new THREE.Mesh(armGeo, mat);
        armLeft.position.set(0.5, 0.8, 0.3);
        armLeft.rotation.z = -0.5; // Dangling
        this.mesh.add(armLeft);
    }

    constructor(scene, config, x, y, game) {
        super(scene, config, x, y, game);

        // Setup AI
        this.fsm.addState('IDLE', new GhoulIdleState(this.fsm));
        this.fsm.addState('PURSUE', new GhoulPursueState(this.fsm));

        this.fsm.changeState('PURSUE'); // Default to aggressive for now
    }
}

class GhoulIdleState extends State {
    enter() {
        this.owner.velocity.x = 0;
    }

    update(dt) {
        // If player exists, pursue
        if (this.owner.game.player) {
            this.machine.changeState('PURSUE');
        }
    }
}

class GhoulPursueState extends State {
    update(dt) {
        const player = this.owner.game.player;
        if (!player) return;

        const dx = player.position.x - this.owner.position.x;
        const dist = Math.abs(dx);

        // Move towards player
        const dir = Math.sign(dx);
        this.owner.velocity.x = dir * this.owner.config.speed;

        // Stop if too close (Attack range logic later)
        if (dist < 0.1) {
            this.owner.velocity.x = 0;
        }
    }
}
