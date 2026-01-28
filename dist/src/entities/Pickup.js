/**
 * Pickup.js
 * 
 * Collectible items (Weapons, Armor, Points).
 * Simple bobbing animation.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class Pickup {
    constructor(scene, config, x, y) {
        this.scene = scene;
        this.config = config; // { type: 'weapon', id: 'axe' } or { type: 'armor' }
        this.isActive = true;

        this.position = new THREE.Vector3(x, y, 0);
        this.time = Math.random() * 10;

        // Visuals
        this.mesh = this.createMesh(config);
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
    }

    createMesh(config) {
        const group = new THREE.Group();

        // Base item shape
        let geometry, material;

        if (config.type === 'weapon') {
            geometry = new THREE.BoxGeometry(0.4, 0.4, 0.1);
            if (config.id === 'axe') material = new THREE.MeshStandardMaterial({ color: 0xaa4444 });
            else if (config.id === 'knife') material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            else material = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        } else if (config.type === 'armor') {
            geometry = new THREE.BoxGeometry(0.4, 0.5, 0.2);
            material = new THREE.MeshStandardMaterial({ color: 0xc4a35a });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        group.add(mesh);

        // Glow/Halo
        const glowGeo = new THREE.RingGeometry(0.3, 0.4, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        group.add(glow);

        return group;
    }

    update(dt) {
        this.time += dt;

        // Bobbing animation
        this.mesh.position.y = this.position.y + Math.sin(this.time * 3) * 0.2;
        this.mesh.rotation.y += dt;
    }

    getBounds() {
        return new THREE.Box3().setFromObject(this.mesh);
    }

    destroy() {
        this.isActive = false;
        if (this.mesh) {
            this.scene.remove(this.mesh);
            // Dispose logic omitted for brevity
        }
    }
}
