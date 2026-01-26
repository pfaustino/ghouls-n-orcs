/**
 * Orc.js
 * 
 * Elite enemy with shield mechanics and aggressive attacks.
 * AI Behavior:
 * - IDLE: Wait
 * - PATROL: Walk back and forth (optional)
 * - APPROACH: Walk towards player with shield up
 * - ATTACK: Big overhead swing when close
 * - BLOCK: If hit from front while shield is up
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Enemy } from './Enemy.js';
import { State } from '../core/StateMachine.js';

export class Orc extends Enemy {
    createMesh() {
        // Big hulking body
        const group = new THREE.Group();

        // Torso
        const bodyGeo = new THREE.BoxGeometry(1.2, 1.6, 0.8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x553311 }); // Dark brown skin
        this.bodyPart = new THREE.Mesh(bodyGeo, bodyMat);
        this.bodyPart.position.y = 0.8;
        this.bodyPart.castShadow = true;
        group.add(this.bodyPart);

        // Head
        const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x442200 });
        this.headPart = new THREE.Mesh(headGeo, headMat);
        this.headPart.position.set(0, 1.7, 0.2);
        group.add(this.headPart);

        // Shield (Left box)
        const shieldGeo = new THREE.BoxGeometry(0.2, 1.2, 1.0);
        const shieldMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        this.shieldMesh.position.set(0.7, 0.8, 0.5); // "Left" side relative to facing? adjusted in logic
        group.add(this.shieldMesh);

        // Weapon (Right box)
        const axeGeo = new THREE.BoxGeometry(0.2, 1.5, 0.2);
        const axeMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6 });
        this.weaponMesh = new THREE.Mesh(axeGeo, axeMat);
        this.weaponMesh.position.set(-0.7, 1.2, 0.5);
        this.weaponMesh.rotation.x = Math.PI / 4;
        group.add(this.weaponMesh);

        this.bodyMesh = group; // Assign to parent class prop for flash effects
        this.mesh.add(group);
    }

    constructor(scene, config, x, y, game) {
        super(scene, config, x, y, game);

        // Setup AI
        this.fsm.addState('IDLE', new OrcIdleState(this.fsm));
        this.fsm.addState('APPROACH', new OrcApproachState(this.fsm));
        this.fsm.addState('ATTACK', new OrcAttackState(this.fsm));
        this.fsm.addState('PATROL', new OrcPatrolState(this.fsm));

        this.fsm.changeState('IDLE');
    }

    takeDamage(amount, sourcePos) {
        // Direction check for shield
        // If blocking (APPROACH state) and hit from front
        const vectorToSource = sourcePos ? sourcePos.x - this.position.x : 0;
        const hitFromFront = (this.facingRight && vectorToSource > 0) || (!this.facingRight && vectorToSource < 0);

        if (this.fsm.currentStateName === 'APPROACH' && hitFromFront) {
            console.log("🛡️ Orc BLOCKED attack!");
            // Feedback
            this.game.particleManager.emit({
                position: this.position.clone().add(new THREE.Vector3(this.facingRight ? 0.5 : -0.5, 1, 0)),
                count: 5,
                color: 'spark',
                scale: 1
            });
            if (this.game && this.game.audio) this.game.audio.playSound('armor_break');
            return; // No damage
        }

        super.takeDamage(amount);
    }
}

class OrcIdleState extends State {
    enter() {
        this.owner.velocity.x = 0;
    }
    update(dt) {
        if (this.owner.game.player) {
            const dx = this.owner.game.player.position.x - this.owner.position.x;
            if (Math.abs(dx) < this.owner.config.detectionRange) {
                this.machine.changeState('APPROACH');
            }
        }
    }
}

class OrcApproachState extends State {
    update(dt) {
        const player = this.owner.game.player;
        if (!player) return;

        const dx = player.position.x - this.owner.position.x;
        const dist = Math.abs(dx);

        // Face player
        this.owner.facingRight = dx > 0;
        this.owner.mesh.rotation.y = this.owner.facingRight ? 0 : Math.PI;

        // Visual Shield Up
        this.owner.shieldMesh.position.set(0.6, 1.0, 0.3);
        this.owner.shieldMesh.rotation.z = 0;

        // Move
        let dir = Math.sign(dx);

        // Smart Ledge Detection
        const lookAheadX = this.owner.position.x + (dir * 2.5); // Look further ahead for big Orc
        const platform = this.owner.game.levelManager.findGroundAt(lookAheadX);
        const yDiff = platform ? (this.owner.position.y - platform.box.max.y) : 999;

        if (!platform || yDiff > 3.0) {
            // Force Patrol state away from ledge
            this.machine.changeState('PATROL', { dir: -dir, duration: 3.0 });
            return;
        }

        this.owner.velocity.x = dir * this.owner.config.speed;

        // Attack range
        if (dist < this.owner.config.attackRange) {
            this.machine.changeState('ATTACK');
        }
    }
}

class OrcAttackState extends State {
    constructor(machine) {
        super(machine);
        this.timer = 0;
        this.hasHit = false;
    }

    enter() {
        this.owner.velocity.x = 0;
        this.timer = 0;
        this.hasHit = false;

        // Windup visual
        this.owner.weaponMesh.rotation.x = -Math.PI / 2; // Back
        if (this.owner.bodyMesh) this.owner.bodyMesh.position.y = 1.0;

        // Color flash
        if (this.owner.bodyPart) this.owner.bodyPart.material.color.setHex(0xffaa00);
    }

    update(dt) {
        this.timer += dt;
        const config = this.owner.config;

        // Windup -> Swing
        if (this.timer > config.telegraphDuration && this.timer < config.telegraphDuration + config.attackDuration) {
            if (!this.hasHit) {
                // Check hitbox once
                this.checkHit();
                this.hasHit = true;

                // Swing visual
                this.owner.weaponMesh.rotation.x = Math.PI / 2; // Forward
            }
        }

        // End
        if (this.timer >= config.telegraphDuration + config.attackDuration + config.recoveryDuration) {
            this.machine.changeState('APPROACH');
        }
    }

    checkHit() {
        // Simple range check for now
        const player = this.owner.game.player;
        if (player) {
            const startX = this.owner.position.x;
            const range = this.owner.config.attackRange + 0.5;
            const dir = this.owner.facingRight ? 1 : -1;

            // Box check would be better, but distance is okay for prototype
            const dx = player.position.x - startX;
            if (Math.abs(dx) < range && Math.sign(dx) === dir) {
                // Hit check collision plane
                // Also check Y diff?
                if (Math.abs(player.position.y - this.owner.position.y) < 2) {
                    player.takeDamage(this.owner.config.damage);
                }
            }
        }
    }

    exit() {
        if (this.owner.bodyMesh) this.owner.bodyMesh.position.y = 0; // Reset
        this.owner.weaponMesh.rotation.x = Math.PI / 4; // Reset

        if (this.owner.bodyPart) this.owner.bodyPart.material.color.setHex(0x553311); // Reset
    }
}

class OrcPatrolState extends State {
    enter(params) {
        this.dir = params && params.dir ? params.dir : 1;
        this.timer = params && params.duration ? params.duration : 2.0;
        this.owner.facingRight = this.dir > 0;
        this.owner.mesh.rotation.y = this.owner.facingRight ? 0 : Math.PI;

        // Lower shield while walking away
        this.owner.shieldMesh.position.set(0.7, 0.8, 0.5);
        this.owner.shieldMesh.rotation.z = 0.5;
    }

    update(dt) {
        this.timer -= dt;

        // Move
        this.owner.velocity.x = this.dir * this.owner.config.speed;

        if (this.timer <= 0) {
            this.machine.changeState('APPROACH');
        }
    }
}

