/**
 * Enemy.js
 * 
 * Base class for all enemies.
 * standardized hitboxes, health management, and state machine integration.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { StateMachine } from '../core/StateMachine.js';
import { GameConfig } from '../config/GameConfig.js';

export class Enemy {
    constructor(scene, config, x, y, game) {
        this.scene = scene;
        this.config = config;
        this.game = game;

        this.isActive = true;
        this.health = config.health;
        this.facingRight = false;

        // Physics
        this.position = new THREE.Vector3(x, y, 0);
        this.velocity = new THREE.Vector3();
        this.isGrounded = false;

        // State Machine
        this.fsm = new StateMachine(this);

        // Visuals
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Animations
        this.mixer = null;
        this.animations = {};

        this.createMesh();
    }

    playAnim(name) {
        if (!this.mixer) return;

        // Find clip (fuzzy match?)
        let clip = this.animations[name];

        // Fallback: Try keys including name
        if (!clip) {
            const key = Object.keys(this.animations).find(k => k.includes(name));
            if (key) clip = this.animations[key];
        }

        if (clip) {
            const action = this.mixer.clipAction(clip);
            if (!action.isRunning()) {
                this.mixer.stopAllAction(); // Simple switch
                action.reset().play();
            }
            return action;
        }
    }

    canDealDamage() {
        if (!this.fsm) return false;
        const s = this.fsm.currentStateName.toUpperCase();
        return s.includes('ATTACK') || s === 'SWOOP' || s === 'HEADBUTT' || s === 'LUNGE' || s === 'BITE';
    }

    update(dt) {
        if (!this.isActive && !this.isDying) return;

        if (this.mixer) this.mixer.update(dt);

        // AI Logic only if alive
        if (this.isActive && this.fsm) {
            this.fsm.update(dt);
        }
    }

    createMesh() {
        // Placeholder - Override in subclasses
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.bodyMesh = new THREE.Mesh(geo, mat);
        this.mesh.add(this.bodyMesh);
    }

    takeDamage(amount) {
        this.health -= amount;

        // Flash white
        if (this.bodyMesh) {
            this.bodyMesh.traverse((child) => {
                if (child.isMesh && child.material && child.material.color) {
                    const oldColor = child.material.color.getHex();
                    child.material.color.setHex(0xffffff);
                    setTimeout(() => {
                        if (this.isActive && child && child.material) {
                            child.material.color.setHex(oldColor);
                        }
                    }, 100);
                }
            });
        }

        if (this.game && this.game.audio) this.game.audio.playSound('hit');

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.isActive) return;
        this.isActive = false;
        this.isDying = true;
        console.log(`${this.config.name} died!`);

        // Play Death Anim
        this.playAnim('death');
        const deathClip = this.animations['death'];
        if (deathClip && this.mixer) {
            const act = this.mixer.clipAction(deathClip);
            act.reset(); // Ensure valid start
            act.setLoop(THREE.LoopOnce);
            act.clampWhenFinished = true;
            act.play();
        }

        // Cleanup after 2s
        setTimeout(() => {
            if (this.isDying) {
                this.mesh.visible = false;
                this.isDying = false;
            }
        }, 2000);

        if (this.game && this.game.audio) this.game.audio.playSound('enemy_death');

        // Particles
        if (this.game.particleManager) {
            const center = this.position.clone().add(new THREE.Vector3(0, 1.0, 0)); // Center of mass

            // Determine blood type
            let bloodType = 'blood';
            // Simple string check on name or config type
            if (this.config.name.includes('Ghoul')) bloodType = 'green_blood';

            // Blood burst
            this.game.particleManager.emit({
                position: center,
                count: 12,
                color: bloodType,
                scale: 1.5
            });

            // Bone chunks
            this.game.particleManager.emit({
                position: center,
                count: 4,
                color: 'bone',
                scale: 1.0
            });

            // Armor scraps for Orcs
            if (this.config.name.includes('Orc')) {
                this.game.particleManager.emit({
                    position: center,
                    count: 5,
                    color: 'armor',
                    scale: 1.5
                });
            }
        }
    }

    fixedUpdate(dt) {
        if (!this.isActive) return;

        // Gravity
        if (!this.isGrounded) {
            this.velocity.y -= GameConfig.world.gravity * dt;
        }

        // Move
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // Ground Collision
        if (this.game.levelManager) {
            this.isGrounded = this.game.levelManager.checkGroundCollision(this);
            this.game.levelManager.checkWallCollision(this);
        } else if (this.position.y <= 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // Update Mesh
        this.mesh.position.copy(this.position);

        // Update AI
        this.fsm.update(dt);

        // Kill Plane
        if (this.position.y < -10) {
            this.die();
        }
    }

    // Simple AABB Collision check
    getBounds() {
        return new THREE.Box3().setFromObject(this.mesh);
    }
}
