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
import { clone } from 'https://unpkg.com/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';
import { Enemy } from './Enemy.js';
import { State } from '../core/StateMachine.js';

export class Ghoul extends Enemy {
    createMesh() {
        if (this.game.assets && this.game.assets.models['ghoul']) {
            const gltf = this.game.assets.models['ghoul'];
            this.model = clone(gltf.scene);

            this.mesh.add(this.model);

            // Adjust transform
            this.model.rotation.y = -Math.PI / 2; // Face Left by default
            this.model.scale.setScalar(1.5);
            this.model.position.y = 0;

            // Shadows
            this.model.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
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
                this.animations[name.toLowerCase()] = clip;
                console.log(`🧟 Anim: ${name.toLowerCase()}`);
            });

        } else {
            // Fallback to Procedural logic if asset missing
            this.createProceduralMesh();
        }
    }

    playAnim(name) {
        if (!this.mixer) return;
        const clip = this.animations[name] || this.animations['idle'] || this.animations['run'];
        if (clip) {
            const action = this.mixer.clipAction(clip);
            if (!action.isRunning()) {
                this.mixer.stopAllAction();
                action.reset().play();
            }
        }
    }

    createProceduralMesh() {
        const group = new THREE.Group();
        const matSkin = new THREE.MeshStandardMaterial({ color: 0x558855, roughness: 0.9, flatShading: true });
        const matClothes = new THREE.MeshStandardMaterial({ color: 0x443355, roughness: 1.0 });

        // Torso (Thin/Ribs)
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), matSkin);
        torso.position.y = 0.8;
        torso.rotation.x = 0.2; // Hunch forward
        torso.castShadow = true;
        group.add(torso);

        // Pelvis/Pants
        const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.35), matClothes);
        pelvis.position.y = 0.4;
        pelvis.castShadow = true;
        group.add(pelvis);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), matSkin);
        head.position.set(0, 1.25, 0.2); // Forward neck
        head.rotation.x = 0.1;
        head.castShadow = true;
        group.add(head);

        // Jaw/Mouth (Open)
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.1, 0.2), new THREE.MeshStandardMaterial({ color: 0x331111 }));
        jaw.position.set(0, -0.18, 0.05);
        head.add(jaw);

        // Glowing Eyes
        const eyeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const lEye = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        lEye.position.set(0.1, 0.05, 0.18);
        head.add(lEye);
        const rEye = lEye.clone();
        rEye.position.set(-0.1, 0.05, 0.18);
        head.add(rEye);

        // Arms (Outstretched) - UPDATED ORIENTATION
        const armGeo = new THREE.BoxGeometry(0.12, 0.7, 0.12);

        const lArm = new THREE.Mesh(armGeo, matSkin);
        lArm.position.set(0, 0.9, -0.35); // Side (Z-)
        lArm.rotation.z = -1.4; // Point X+
        lArm.rotation.x = 0.2;
        group.add(lArm);

        const rArm = new THREE.Mesh(armGeo, matSkin);
        rArm.position.set(0, 0.9, 0.35); // Side (Z+)
        rArm.rotation.z = -1.4; // Point X+
        rArm.rotation.x = -0.2;
        group.add(rArm);

        this.bodyMesh = group; // For flash effect
        this.mesh.add(group);
    }

    constructor(scene, config, x, y, game) {
        super(scene, config, x, y, game);

        // Setup AI
        this.fsm.addState('IDLE', new GhoulIdleState(this.fsm));
        this.fsm.addState('PATROL', new GhoulPatrolState(this.fsm));
        this.fsm.addState('PURSUE', new GhoulPursueState(this.fsm));

        this.fsm.changeState('PATROL');
    }
}

class GhoulIdleState extends State {
    enter() {
        this.owner.velocity.x = 0;
        this.timer = 0;
        this.owner.playAnim('idle');
    }

    update(dt) {
        this.timer += dt;

        // Look for player
        const player = this.owner.game.player;
        if (player) {
            const dist = Math.abs(player.position.x - this.owner.position.x);
            if (dist < this.owner.config.detectionRange) {
                this.machine.changeState('PURSUE');
                return;
            }
        }

        // Resume patrol after short wait
        if (this.timer > 1.0) {
            this.machine.changeState('PATROL');
        }
    }
}

class GhoulPatrolState extends State {
    enter() {
        // Pick a random direction if not set
        if (!this.direction) this.direction = Math.random() > 0.5 ? 1 : -1;
        this.owner.facingRight = this.direction > 0;

        // Face correct way
        if (this.owner.model) {
            this.owner.model.rotation.y = this.owner.facingRight ? Math.PI / 2 : -Math.PI / 2;
        }

        this.owner.playAnim('walk'); // or Run
    }

    update(dt) {
        // 1. Check for Player
        const player = this.owner.game.player;
        if (player) {
            const dist = Math.abs(player.position.x - this.owner.position.x);
            // Height check (don't detect if on different floor)
            const yDist = Math.abs(player.position.y - this.owner.position.y);

            if (dist < this.owner.config.detectionRange && yDist < 3.0) {
                this.machine.changeState('PURSUE');
                return;
            }
        }

        // 2. Move
        this.owner.velocity.x = this.direction * this.owner.config.speed;

        // 3. Wall / Edge Detection
        if (this.checkObstacles()) {
            this.flip();
        }
    }

    checkObstacles() {
        // Look ahead
        const lookAheadDist = 1.0;
        const nextX = this.owner.position.x + (this.direction * lookAheadDist);

        // Check 1: Ledge (Ground Check)
        const platform = this.owner.game.levelManager.findGroundAt(nextX);
        const myY = this.owner.position.y;

        // If no ground, or ground is way below us -> Ledge
        if (!platform || (myY - platform.box.max.y) > 2.0) {
            return true;
        }

        // Check 2: Wall (Velocity Check)
        // If we expected to move but stopped, we likely hit a wall
        if (Math.abs(this.owner.velocity.x) < 0.1) {
            // Only confirm wall if we actually tried to move
            return true;
        }

        return false;
    }

    flip() {
        this.direction *= -1;
        this.owner.facingRight = this.direction > 0;
        // this.owner.mesh.rotation.y = this.owner.facingRight ? 0 : Math.PI; // Old logic

        // New Logic for GLB orientation (Right = +X)
        if (this.owner.model) {
            this.owner.model.rotation.y = this.owner.facingRight ? Math.PI / 2 : -Math.PI / 2;
        }

        // Push slightly away from wall/edge to prevent sticking
        this.owner.velocity.x = 0;
        this.owner.position.x += this.direction * 0.1;
    }
}

class GhoulPursueState extends State {
    enter() {
        this.owner.playAnim('run');
    }

    update(dt) {
        const player = this.owner.game.player;
        if (!player) return;

        const dx = player.position.x - this.owner.position.x;
        const dist = Math.abs(dx);
        const dir = Math.sign(dx);

        // Stop if too close (Attack range logic later)
        if (dist < 0.8) {
            this.owner.velocity.x = 0;
            this.owner.playAnim('attack'); // Attack anim
            return;
        } else {
            // Ensure running if coming from attack
            this.owner.playAnim('run');
        }

        // Ledge Check before moving
        const lookAheadX = this.owner.position.x + (dir * 1.5);
        const platform = this.owner.game.levelManager.findGroundAt(lookAheadX);
        const myY = this.owner.position.y;

        if (!platform || (myY - platform.box.max.y) > 2.0) {
            this.owner.velocity.x = 0;
            // Maybe go back to idle/patrol if stuck?
        } else {
            // Move towards player
            this.owner.velocity.x = dir * this.owner.config.speed;

            // Update facing
            if (dir !== 0) {
                this.owner.facingRight = dir > 0;
                if (this.owner.model) {
                    this.owner.model.rotation.y = this.owner.facingRight ? Math.PI / 2 : -Math.PI / 2;
                }
            }
        }
    }
}
