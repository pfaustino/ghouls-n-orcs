/**
 * Projectile.js
 * 
 * Base class for all ranged weapons (spears, knives, axes, torches).
 * Uses simple physics for trajectories (straight or arced).
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

import { WeaponFactory } from './WeaponFactory.js';

export class Projectile {
    constructor(scene, config, x, y, direction, owner) {
        this.scene = scene;
        this.config = config;
        this.direction = direction; // 1 or -1
        this.owner = owner; // 'player' or 'enemy'

        this.isActive = true;
        this.lifeTime = 0;

        // Physics
        this.position = new THREE.Vector3(x, y, 0);
        this.velocity = new THREE.Vector3(
            config.speed * direction,
            config.trajectory === 'arc' ? config.arcHeight * 5 : 0, // Initial upward velocity for arcs
            0
        );

        // Setup Lob Trajectory (Torch)
        if (config.trajectory === 'lob') {
            this.velocity.y = 8; // Default lob up
            this.velocity.x = config.speed * direction * 0.7; // Slower X
        }

        // Mesh
        this.mesh = this.createMesh(config);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);

        // Update rotation to face direction
        if (direction < 0) {
            this.mesh.rotation.y = Math.PI;
        }
    }

    createMesh(config) {
        return WeaponFactory.createMesh(config.sprite);
    }

    fixedUpdate(dt) {
        if (!this.isActive) return;

        this.lifeTime += dt;

        // Apply Gravity if arcing
        if (this.config.trajectory === 'arc' || this.config.trajectory === 'lob') {
            this.velocity.y -= 20 * dt; // Gravity
        }

        // Move
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // Rotation alignment for axes
        if (this.config.sprite === 'axe') {
            this.mesh.rotation.z -= 10 * dt * this.direction;
        }
        else if (this.config.trajectory === 'arc') {
            // Point in velocity direction
            const angle = Math.atan2(this.velocity.y, this.velocity.x);
            this.mesh.rotation.z = angle;
        }

        this.mesh.position.copy(this.position);

        // Check bounds/collision
        if (this.lifeTime > 3 || this.position.y < -15) {
            this.destroy(); // Out of bounds
        }
    }

    destroy() {
        this.isActive = false;
        if (this.mesh) {
            this.scene.remove(this.mesh);

            // Clean up resources (Handle Groups)
            this.mesh.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });

            this.mesh = null;
        }
    }
}
