
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];

        // Reusable geometries/materials
        this.boxGeo = new THREE.BoxGeometry(1, 1, 1);
        this.bloodMat = new THREE.MeshBasicMaterial({ color: 0xaa0000 });
        this.dustMat = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.8 });
        this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        this.armorMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.6 });
        this.greenBloodMat = new THREE.MeshBasicMaterial({ color: 0x228822 });
        this.boneMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 1.0 });
    }

    emit(config) {
        const count = config.count || 5;
        const color = config.color || 'blood';

        for (let i = 0; i < count; i++) {
            const size = (0.05 + Math.random() * 0.1) * (config.scale || 1);
            let material = this.bloodMat;

            if (color === 'dust') material = this.dustMat;
            if (color === 'spark') material = this.sparkMat;
            if (color === 'armor') material = this.armorMat;
            if (color === 'green_blood') material = this.greenBloodMat;
            if (color === 'bone') material = this.boneMat;

            const mesh = new THREE.Mesh(this.boxGeo, material);
            mesh.scale.setScalar(size);

            // Initial position (with some spread)
            mesh.position.copy(config.position);
            mesh.position.x += (Math.random() - 0.5) * 0.5;
            mesh.position.y += (Math.random() - 0.5) * 0.5;

            // Velocity explodes outward
            const speed = 2 + Math.random() * 4;
            const angle = Math.random() * Math.PI * 2;

            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed + 2, // Biased upward
                (Math.random() - 0.5) * 2 // Some Z depth
            );

            this.scene.add(mesh);
            this.particles.push({
                mesh,
                velocity,
                life: 0.5 + Math.random() * 0.5,
                gravity: 15
            });
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
                continue;
            }

            // Physics
            p.velocity.y -= p.gravity * dt;
            p.mesh.position.addScaledVector(p.velocity, dt);

            // Rotation
            p.mesh.rotation.x += p.velocity.z * dt;
            p.mesh.rotation.z -= p.velocity.x * dt;

            // Fade out
            if (p.life < 0.2) {
                p.mesh.scale.multiplyScalar(0.9);
            }
        }
    }
}
