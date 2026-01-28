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
import { clone } from 'https://unpkg.com/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';
import { Enemy } from './Enemy.js';
import { State } from '../core/StateMachine.js';

export class Orc extends Enemy {
    createMesh() {
        if (this.game.assets && this.game.assets.models['orc']) {
            const gltf = this.game.assets.models['orc'];
            this.model = clone(gltf.scene);

            this.mesh.add(this.model);

            // Transform (like Ghoul.js - no internal scale fix)
            this.model.rotation.y = Math.PI / 2; // Face left (toward player)
            this.model.scale.setScalar(1.5);
            this.model.position.y = 0;

            // Shadows
            this.model.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) child.material = child.material.clone();
                }
            });
            this.bodyMesh = this.model;

            // Animations
            this.mixer = new THREE.AnimationMixer(this.model);
            gltf.animations.forEach(clip => {
                let name = clip.name;
                // Format is "EnemyArmature|...|ActionName", take the LAST part
                if (name.includes('|')) {
                    const parts = name.split('|');
                    name = parts[parts.length - 1];
                }
                const lowerName = name.toLowerCase();
                this.animations[lowerName] = clip;

                // Map based on User Screenshot
                if (name === 'Weapon') this.animations['attack'] = clip;
                if (name === 'Punch') this.animations['punch'] = clip;

                if (lowerName.includes('hitreact')) this.animations['hit'] = clip;
                if (name === 'Walk') this.animations['walk'] = clip;
                if (name === 'Run') this.animations['run'] = clip;
                if (name === 'Idle') this.animations['idle'] = clip;
                if (name === 'Death') this.animations['death'] = clip;
            });

        } else {
            this.createProceduralMesh();
        }
    }

    createProceduralMesh() {
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
        this.shieldMesh.position.set(0.7, 0.8, 0.5);
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

    playAnim(name) {
        if (!this.mixer) return;
        const clip = this.animations[name] || this.animations['idle']; // Fallback
        if (clip) {
            const action = this.mixer.clipAction(clip);
            if (!action.isRunning()) {
                this.mixer.stopAllAction();
                action.reset().play();
            }
        }
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
        this.owner.playAnim('idle');
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
    enter() {
        this.owner.playAnim('walk'); // User requested walk
    }
    update(dt) {
        const player = this.owner.game.player;
        if (!player || player.isDead) {
            this.machine.changeState('IDLE');
            return;
        }

        const dx = player.position.x - this.owner.position.x;
        const dist = Math.abs(dx);

        // Face player
        this.owner.facingRight = dx > 0;
        this.owner.mesh.rotation.y = this.owner.facingRight ? 0 : Math.PI;

        // Move
        let dir = Math.sign(dx);
        const wasStuck = Math.abs(this.owner.velocity.x) < 0.1;

        // Smart Ledge Detection
        const lookAheadX = this.owner.position.x + (dir * 2.5); // Look further ahead for big Orc
        const platform = this.owner.game.levelManager.findGroundAt(lookAheadX);
        const yDiff = platform ? (this.owner.position.y - platform.box.max.y) : 999;

        if (!platform || yDiff > 6.0) {
            // Force Patrol state away from ledge
            this.machine.changeState('PATROL', { dir: -dir, duration: 3.0 });
            return;
        }

        this.owner.velocity.x = dir * this.owner.config.speed;

        // Jump Check
        if (this.owner.isGrounded && wasStuck && (player.position.y > this.owner.position.y + 0.5) && dir !== 0) {
            this.owner.velocity.y = 12; // Jump up
            this.owner.isGrounded = false;
        }

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

        // Play Attack Animation
        // Assuming animation 'attack' exists, usually encompasses windup+hit+recovery
        this.owner.playAnim('attack');

        // Sound
        if (this.owner.game.audio) this.owner.game.audio.playSound('punch');

        // Alternatively, if split clips:
        // this.owner.playAnim('slash');

        // Color flash
        // if (this.owner.bodyPart) this.owner.bodyPart.material.color.setHex(0xffaa00);
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
            }
        }

        // End
        // We could also check `this.owner.mixer.clipAction(clip).isRunning()`
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

            const dx = player.position.x - startX;
            if (Math.abs(dx) < range && Math.sign(dx) === dir) {
                if (Math.abs(player.position.y - this.owner.position.y) < 2) {
                    player.takeDamage(this.owner.config.damage);
                }
            }
        }
    }

    exit() {
        // Cleanup visuals if needed
    }
}

class OrcPatrolState extends State {
    enter(params) {
        this.dir = params && params.dir ? params.dir : 1;
        this.timer = params && params.duration ? params.duration : 2.0;
        this.owner.facingRight = this.dir > 0;
        this.owner.mesh.rotation.y = this.owner.facingRight ? 0 : Math.PI;

        this.owner.playAnim('walk');
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

