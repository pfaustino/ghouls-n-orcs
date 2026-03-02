
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { clone } from 'https://unpkg.com/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';
import { Orc } from './Orc.js';

/**
 * Ogre Boss - "Bigarm" 
 * Level 3 boss - A massive ogre with devastating attacks
 */
export class Ogre extends Orc {
    createMesh() {
        // Use the Ogre model instead of Orc
        if (this.game.assets && this.game.assets.models['ogre']) {
            const gltf = this.game.assets.models['ogre'];
            this.model = clone(gltf.scene);

            this.mesh.add(this.model);

            // Transform
            this.model.rotation.y = Math.PI / 2; // Face left (toward player)
            this.model.scale.setScalar(2.5); // MASSIVE
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
                // Handle animation name formatting
                if (name.includes('|')) {
                    const parts = name.split('|');
                    name = parts[parts.length - 1];
                }
                const lowerName = name.toLowerCase();
                this.animations[lowerName] = clip;

                // Map Bigarm animations
                if (name === 'Punch') this.animations['attack'] = clip;
                if (lowerName.includes('hitreact')) this.animations['hit'] = clip;
                if (name === 'Walk') this.animations['walk'] = clip;
                if (name === 'Run') this.animations['run'] = clip;
                if (name === 'Idle') this.animations['idle'] = clip;
                if (name === 'Death') this.animations['death'] = clip;
            });
        } else {
            // Fallback to Orc procedural mesh
            super.createProceduralMesh();
            this.mesh.scale.setScalar(2.5);
        }
    }

    constructor(scene, config, x, y, game) {
        super(scene, config, x, y, game);
        this.game.boss = this; // Register as the boss
        this.maxHealth = this.health;

        // Arena bounds relative to spawn
        this.minX = x - 25; // Larger arena for bigger boss
        this.maxX = x + 25;

        // Show Boss Bar
        const hud = document.getElementById('boss-hud');
        const nameEl = document.getElementById('boss-name');
        if (hud) hud.style.display = 'block';
        if (nameEl) nameEl.textContent = 'BIGARM THE CRUSHER';
        this.updateBossBar();
    }

    takeDamage(amount) {
        super.takeDamage(amount);
        this.updateBossBar();

        // Aggro on Hit
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

        // Particles (Blood)
        if (this.game.particleManager) {
            const center = this.position.clone().add(new THREE.Vector3(0, 2.5, 0));
            this.game.particleManager.emit({
                position: center,
                count: 40,
                color: 'blood',
                scale: 4.0
            });
        }

        // Disable AI but keep physics (for fall)
        this.fsm.update = () => { };
        this.velocity.x = 0;

        // Play Death Animation
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

        // Wait before victory (3 seconds for dramatic effect)
        setTimeout(() => {
            // Remove mesh
            this.scene.remove(this.mesh);
            this.isActive = false;

            // VICTORY!
            if (this.game.levelManager) {
                this.game.levelManager.triggerVictory();
            }
        }, 3000);
    }

    fixedUpdate(dt) {
        super.fixedUpdate(dt);

        // Arena Constraints
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
            if (!this.playerLocked && this.game.player.position.x > this.minX + 2) {
                this.playerLocked = true;
                console.log("🔒 Ogre Arena Locked!");
            }

            if (this.playerLocked) {
                if (this.game.player.position.x < this.minX) {
                    this.game.player.position.x = this.minX;
                    this.game.player.velocity.x = 0;
                }
                if (this.game.player.position.x > this.maxX) {
                    this.game.player.position.x = this.maxX;
                    this.game.player.velocity.x = 0;
                }
            }
        }
    }
}
