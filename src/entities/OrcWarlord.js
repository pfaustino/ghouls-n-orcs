
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { Orc } from './Orc.js';

export class OrcWarlord extends Orc {
    createMesh() {
        super.createMesh();

        // Make it GIANT
        this.mesh.scale.setScalar(2.2);

        // Retheme colors for "Boss" feel
        // Body (Dark Grey skin)
        if (this.bodyPart) this.bodyPart.material.color.setHex(0x222222);

        // Head (Red Helmet)
        if (this.headPart) this.headPart.material.color.setHex(0xaa2222);

        // Shield (Gold)
        if (this.shieldMesh) {
            this.shieldMesh.material.color.setHex(0xffaa00);
            this.shieldMesh.material.metalness = 1.0;
            this.shieldMesh.material.roughness = 0.2;
        }

        // Axe (Black Steel)
        if (this.weaponMesh) {
            this.weaponMesh.material.color.setHex(0x111111);
        }
    }

    constructor(scene, config, x, y, game) {
        super(scene, config, x, y, game);
        this.game.boss = this; // Register
        this.maxHealth = config.hp; // Store max for UI calc

        // Show Boss Bar
        const hud = document.getElementById('boss-hud');
        if (hud) hud.style.display = 'block';
        this.updateBossBar();
    }

    takeDamage(amount) {
        super.takeDamage(amount);
        this.updateBossBar();
    }

    updateBossBar() {
        const bar = document.getElementById('boss-health-bar');
        if (bar) {
            const pct = Math.max(0, (this.hp / this.maxHealth) * 100);
            bar.style.width = pct + '%';
        }
    }

    die() {
        super.die(); // Plays sound, particles

        this.game.boss = null;

        // Hide Boss Bar
        const hud = document.getElementById('boss-hud');
        if (hud) hud.style.display = 'none';

        // Huge explosion particles?
        if (this.game.particleManager) {
            const center = this.position.clone().add(new THREE.Vector3(0, 2.0, 0));
            this.game.particleManager.emit({
                position: center,
                count: 30, // Excessive
                color: 'blood',
                scale: 3.0
            });
            this.game.particleManager.emit({
                position: center,
                count: 10,
                color: 'armor',
                scale: 3.0
            });
        }

        // VICTORY!
        if (this.game.levelManager) {
            this.game.levelManager.triggerVictory();
        }
    }

    fixedUpdate(dt) {
        super.fixedUpdate(dt);

        // Arena Constraints (Updated for Extended Level)
        if (this.position.x < 372) {
            this.position.x = 372;
            this.velocity.x = 0;
            this.facingRight = true; // Turn back
        }
        if (this.position.x > 408) {
            this.position.x = 408;
            this.velocity.x = 0;
            this.facingRight = false;
        }
    }
}
