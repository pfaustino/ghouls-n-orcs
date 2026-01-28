
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
        this.maxHealth = this.health; // Use correct property

        // Define Arena Bounds Relative to Spawn
        this.minX = x - 18; // Arena Boundary Left

        this.maxX = x + 18; // Arena Boundary Right

        // Show Boss Bar
        const hud = document.getElementById('boss-hud');
        if (hud) hud.style.display = 'block';
        this.updateBossBar();
    }

    takeDamage(amount) {
        super.takeDamage(amount);
        this.updateBossBar();

        // Aggro on Hit (if idle)
        if (this.fsm.currentStateName !== 'DEATH' && this.fsm.currentStateName !== 'APPROACH' && this.fsm.currentStateName !== 'ATTACK') {
            this.fsm.changeState('APPROACH');
        }
    }

    updateBossBar() {
        const bar = document.getElementById('boss-health-bar');
        if (bar) {
            const pct = Math.max(0, (this.health / this.maxHealth) * 100);
            bar.style.width = pct + '%';
        }
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;

        // Play Death Sound
        if (this.game.audio) this.game.audio.playSound('enemy_death');

        // Particles (Blood/Armor)
        if (this.game.particleManager) {
            const center = this.position.clone().add(new THREE.Vector3(0, 2.0, 0));
            this.game.particleManager.emit({
                position: center,
                count: 30,
                color: 'blood',
                scale: 3.0
            });
        }

        // Disable AI but keep physics (for fall)
        this.fsm.update = () => { }; // No-op
        this.velocity.x = 0;

        // Play Anim
        // Play Anim (Once)
        if (this.mixer && this.animations['death']) {
            this.mixer.stopAllAction();
            const action = this.mixer.clipAction(this.animations['death']);
            action.setLoop(THREE.LoopOnce);
            action.clampWhenFinished = true;
            action.reset().play();
        } else {
            this.playAnim('death');
        }

        this.game.boss = null;

        // Hide Boss Bar
        const hud = document.getElementById('boss-hud');
        if (hud) hud.style.display = 'none';

        // Wait before victory (2 seconds)
        setTimeout(() => {
            // Remove mesh
            this.scene.remove(this.mesh);
            this.isActive = false;

            // VICTORY!
            if (this.game.levelManager) {
                this.game.levelManager.triggerVictory();
            }
        }, 2000);
    }

    fixedUpdate(dt) {
        super.fixedUpdate(dt);

        // Arena Constraints (Dynamic) for Boss
        if (this.position.x < this.minX) {
            this.position.x = this.minX;
            this.velocity.x = 0;
            this.facingRight = true;
        }
        if (this.position.x > this.maxX) {
            this.position.x = this.maxX;
            this.velocity.x = 0;
            this.facingRight = false;
        }

        // Lock Player in Arena
        if (this.game.player && !this.isDead) {
            // Check if player entered deep enough to trigger lock
            if (!this.playerLocked && this.game.player.position.x > this.minX + 2) {
                this.playerLocked = true;
                console.log("🔒 Arena Locked!");
            }

            if (this.playerLocked) {
                // Left Wall
                if (this.game.player.position.x < this.minX) {
                    this.game.player.position.x = this.minX;
                    this.game.player.velocity.x = 0;
                }
                // Right Wall
                if (this.game.player.position.x > this.maxX) {
                    this.game.player.position.x = this.maxX;
                    this.game.player.velocity.x = 0;
                }
            }
        }
    }
}
