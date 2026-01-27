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

        this.createMesh();
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
        this.mesh.visible = false;
        console.log(`${this.config.name} died!`);

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

        // Remove from scene (simple version)
        this.scene.remove(this.mesh);
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
