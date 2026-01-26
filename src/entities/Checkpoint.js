
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GameConfig } from '../config/GameConfig.js';

export class Checkpoint {
    constructor(x, y, z) {
        const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
        const mat = new THREE.MeshStandardMaterial({ emissive: 0x00ff00 });
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.position.set(x, y, z);
        this.mesh.rotation.x = Math.PI / 2;
        this.activated = false;

        // Tag for identification
        this.mesh.userData = { isCheckpoint: true, instance: this };
    }

    // Called from LevelManager each frame
    tryActivate(player) {
        const dist = this.mesh.position.distanceTo(player.position);
        if (!this.activated && dist < 1) {
            this.activated = true;
            this.mesh.material.emissive.setHex(0xffff00);
            // Save player state
            if (typeof player.saveCheckpoint === 'function') {
                player.saveCheckpoint(this.mesh.position.clone());
            }
        }
    }
}
