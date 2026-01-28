/**
 * Player.js
 * 
 * The main player entity class featuring:
 * - 3D Skeleton/SkinnedMesh construction
 * - Physics-based platforming movement (fixed jump arcs)
 * - Complex State Machine for animation/logic
 * - Combat handling (attacks, hitboxes)
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

import { clone } from 'https://unpkg.com/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';
import { GameConfig } from '../config/GameConfig.js';
import { StateMachine, State } from '../core/StateMachine.js';
import { WeaponFactory } from './WeaponFactory.js';

export class Player {
    get isDead() {
        return this.health <= 0 || this.currentState === 'DEATH';
    }

    constructor(scene, input, game) {
        this.scene = scene;
        this.input = input;
        this.game = game;

        // Mesh & Animation components
        this.mesh = null;
        this.skeleton = null;
        this.mixer = null;
        this.animations = {};

        // Physics state
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.facingRight = true;
        this.isGrounded = false;

        // Gameplay state
        this.health = GameConfig.player.maxArmor;
        this.inventory = ['spear', 'knife', 'axe', 'torch'];
        this.currentWeaponIndex = 0;
        this.isInvincible = false;
        this.invincibleTimer = 0;

        // State Machine
        this.fsm = new StateMachine(this);
        this.setupStateMachine();
    }

    async init() {
        // Try to load GLB if available
        if (this.game.assets && this.game.assets.models['player']) {
            this.loadCharacterModel();
        } else {
            this.createProceduralCharacter();
        }

        // Set initial state
        this.updateWeaponUI();
        this.fsm.changeState('IDLE');
    }

    loadCharacterModel() {
        const gltf = this.game.assets.models['player'];
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);

        // Clone with SkeletonUtils (Correct for SkinnedMesh)
        this.model = clone(gltf.scene);

        // ADD TO MESH (like Ghoul.js - no internal scale fix)
        this.mesh.add(this.model);
        this.bodyMesh = this.model;

        // Clone materials to allow independent flashing/coloring
        this.model.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
            }
        });

        // Transform (like Ghoul.js)
        this.model.rotation.y = Math.PI / 2; // Face right (opposite of enemy)
        this.model.scale.setScalar(1.5);
        this.model.position.y = 0;

        // Shadows & Visibility (Standard)
        this.model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.frustumCulled = false;
                if (child.material) {
                    child.material.transparent = true;
                    child.material.opacity = 1.0;
                }
            }
        });

        // Setup Animation
        this.mixer = new THREE.AnimationMixer(this.model);
        this.animations = {};

        gltf.animations.forEach((clip) => {
            let name = clip.name;
            // Format is "EnemyArmature|...|ActionName", take the LAST part
            if (name.includes('|')) {
                const parts = name.split('|');
                name = parts[parts.length - 1];
            }
            let lowerName = name.toLowerCase();
            this.animations[lowerName] = clip;
            console.log(`🎥 Anim: ${lowerName}`);

            // Mappings for different models
            // Hooded Adventurer
            if (lowerName === 'sword_slash') this.animations['attack_melee'] = clip;
            if (lowerName === 'punch_right') this.animations['attack_throw'] = clip;

            // Fallbacks: Use RUN for JUMP if no jump exists (e.g. Hooded Adventurer)
            if (lowerName === 'run' && !this.animations['jump']) {
                this.animations['jump'] = clip;
            }

            if (lowerName === 'idle_sword') this.animations['idle'] = clip; // Better stance with weapon

            // Standard / Zombie fallback
            if (lowerName === 'attack') {
                this.animations['attack_throw'] = clip;
                this.animations['attack_melee'] = clip;
            }

            if (lowerName === 'jump') this.animations['jump'] = clip; // Explicit map
            if (lowerName === 'hitrecieve') this.animations['hit'] = clip;
        });

        // Hide internal weapon if present
        let weaponBone = this.model.getObjectByName('Weapon');
        if (weaponBone) weaponBone.visible = false;

        // Weapon Attachment
        let handBone = null;
        this.model.traverse(c => {
            if (!handBone && c.isBone && (c.name.toLowerCase().includes('hand') && c.name.toLowerCase().includes('r'))) {
                handBone = c;
            }
        });

        if (handBone) {
            console.log(`✅ Found Hand Bone: ${handBone.name}`);
            this.handGroup = new THREE.Group();
            this.handGroup.rotation.x = Math.PI / 2;
            handBone.add(this.handGroup);
        } else {
            this.handGroup = new THREE.Group();
            this.model.add(this.handGroup);
            this.handGroup.position.set(0.5, 1, 0);
        }

        // Initialize Weapon visual
        this.updateWeaponVisuals();
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
            this.currentAction = action; // Store for external access
        }
    }

    createProceduralCharacter() {
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);

        // 1. Base Body (Skin/Underwear)
        const skinGeo = new THREE.CapsuleGeometry(0.35, 1.0, 4, 8);
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xffccaa }); // Skin tone
        this.skinMesh = new THREE.Mesh(skinGeo, skinMat);
        this.skinMesh.position.y = 0.9;
        this.skinMesh.castShadow = true;
        this.mesh.add(this.skinMesh);

        // "Underwear" (Boxers)
        const boxersGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.3, 8);
        const boxersMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); // White boxers with hearts?
        const boxers = new THREE.Mesh(boxersGeo, boxersMat);
        boxers.position.y = -0.2; // Relative to skin center
        this.skinMesh.add(boxers);
        this.bodyMesh = this.skinMesh; // For flashes

        // Weapon (Parent to body/arm) - Hand Group
        this.handGroup = new THREE.Group();
        this.handGroup.position.set(0.4, 0.2, 0.3); // Hand position roughly
        this.skinMesh.add(this.handGroup);

        // Initial visual
        this.updateWeaponVisuals();
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.mesh.position.copy(this.position);
    }

    flashColor(colorHex, duration = 0.1) {
        if (!this.model) return;

        // If already flashing, just update the color but don't re-save oldColors
        const isNewFlash = !this._flashing;
        this._flashing = true;

        // Clear any pending reset
        if (this._flashTimeout) {
            clearTimeout(this._flashTimeout);
        }

        this.model.traverse((child) => {
            if (child.isMesh && child.material) {
                // Store original color only on first flash
                if (isNewFlash && !child._originalColor) {
                    child._originalColor = child.material.color.getHex();
                }
                child.material.color.setHex(colorHex);
            }
        });

        // Reset after duration
        this._flashTimeout = setTimeout(() => {
            this._flashing = false;
            this.model.traverse((child) => {
                if (child.isMesh && child.material && child._originalColor !== undefined) {
                    child.material.color.setHex(child._originalColor);
                }
            });
        }, duration * 1000);
    }

    toggleTransparency(enabled, opacity) {
        if (!this.model) return;
        this.model.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.transparent = enabled;
                child.material.opacity = opacity;
            }
        });
    }

    switchWeapon(dir) {
        this.currentWeaponIndex += dir;
        if (this.currentWeaponIndex < 0) this.currentWeaponIndex = this.inventory.length - 1;
        if (this.currentWeaponIndex >= this.inventory.length) this.currentWeaponIndex = 0;

        this.updateWeaponUI();
        this.updateWeaponVisuals();
        if (this.game && this.game.audio) this.game.audio.playSound('switch');
    }

    updateWeaponVisuals() {
        if (!this.handGroup) return;

        // precise cleanup
        while (this.handGroup.children.length > 0) {
            const child = this.handGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            this.handGroup.remove(child);
        }

        const key = this.inventory[this.currentWeaponIndex];
        const config = GameConfig.weapons[key];
        if (!config) return;

        const mesh = WeaponFactory.createMesh(config.sprite);
        this.handGroup.add(mesh);
        this.weaponMesh = mesh;

        // Orient for holding (Vertical-ish)
        // Factory output: Spear/Knife along X. Axe/Torch along Y.
        if (config.sprite === 'spear' || config.sprite === 'knife') {
            mesh.rotation.z = Math.PI / 2; // Point Up
            if (config.sprite === 'spear') mesh.position.y = -0.4; // Hold near end?
            else mesh.position.y = 0.2;
        } else {
            // Axe/Torch are Y aligned
            mesh.position.y = 0;
        }

        // Tilt slightly forward
        mesh.rotation.x = Math.PI / 8;

        this.weaponMesh = mesh; // Keep reference for animation (heavy attack rotates this)
    }

    updateWeaponUI() {
        const el = document.getElementById('weapon-display');
        if (el) {
            const weaponKey = this.inventory[this.currentWeaponIndex];
            const weaponName = GameConfig.weapons[weaponKey].name;
            el.textContent = weaponName.toUpperCase();
        }
    }

    // =========================================================================
    // STATE MACHINE SETUP
    // =========================================================================
    setupStateMachine() {
        this.fsm.addState('IDLE', new IdleState(this.fsm));
        this.fsm.addState('RUN', new RunState(this.fsm));
        this.fsm.addState('JUMP_RISE', new JumpRiseState(this.fsm));
        this.fsm.addState('JUMP_FALL', new JumpFallState(this.fsm));
        this.fsm.addState('ATTACK_THROW', new AttackThrowState(this.fsm));
        this.fsm.addState('ATTACK_HEAVY', new AttackHeavyState(this.fsm));
        this.fsm.addState('ATTACK_HEAVY', new AttackHeavyState(this.fsm));
        this.fsm.addState('ROLL', new RollState(this.fsm));
        this.fsm.addState('DEATH', new DeathState(this.fsm));
    }

    get currentState() {
        return this.fsm.currentStateName;
    }

    // =========================================================================
    // UPDATE LOOPS
    // =========================================================================

    fixedUpdate(dt) {
        // Physics integration

        // Apply Gravity
        if (!this.isGrounded) {
            this.velocity.y -= GameConfig.player.gravity * dt;

            // Terminal velocity
            if (this.velocity.y < -GameConfig.player.maxFallSpeed) {
                this.velocity.y = -GameConfig.player.maxFallSpeed;
            }
        }

        // Apply Velocity Y
        this.position.y += this.velocity.y * dt;

        // Ground Collision (LevelManager)
        if (this.game.levelManager) {
            this.isGrounded = this.game.levelManager.checkGroundCollision(this);
        } else {
            // Fallback
            if (this.position.y <= 0) {
                this.position.y = 0;
                if (this.velocity.y < 0) this.velocity.y = 0;
                this.isGrounded = true;
            }
        }

        // Apply Velocity X
        this.position.x += this.velocity.x * dt;

        // Wall Collision
        if (this.game.levelManager) {
            this.game.levelManager.checkWallCollision(this);
        }

        // Sync mesh position
        this.mesh.position.copy(this.position);

        // Facing direction visual update
        if (this.velocity.x !== 0) {
            const facing = this.velocity.x > 0 ? 1 : -1;
            if ((this.facingRight && facing === -1) || (!this.facingRight && facing === 1)) {
                this.facingRight = facing === 1;
                this.mesh.rotation.y = this.facingRight ? 0 : Math.PI;
            }
        }

        // Kill Plane (Falling into pits)
        if (this.position.y < -10) {
            this.takeDamage(999);
        }
    }

    update(dt) {
        // Check Restart Input (Death)
        if (this.waitingForRestart) {
            if (this.input.keys.get('KeyR') || this.input.isJustPressed('jump') || this.input.isJustPressed('attackPrimary')) {
                this.waitingForRestart = false; // Prevent multiple calls
                if (this.game && this.game.restartGame) {
                    this.game.restartGame();
                } else {
                    location.reload();
                }
            }
        }

        // Update State Machine
        this.fsm.update(dt);

        // Update Animation Mixer
        if (this.mixer) {
            this.mixer.update(dt);
        }

        // Weapon Switching
        if (!this.currentState.startsWith('ATTACK') && this.currentState !== 'DEATH') {
            if (this.input.isJustPressed('weaponPrev')) this.switchWeapon(-1);
            if (this.input.isJustPressed('weaponNext')) this.switchWeapon(1);
        }

        // Handle invincibility timer
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
                this.toggleTransparency(false, 1.0);
            } else {
                // Blink effect
                const opacity = Math.sin(this.invincibleTimer * 20) > 0 ? 0.5 : 1.0;
                this.toggleTransparency(true, opacity);
            }
        }
    }

    takeDamage(amount) {
        if (this.isInvincible || this.health <= 0) return;

        this.health -= amount;
        console.log(`💔 Player hit! Health: ${this.health}`);

        if (this.game && this.game.audio) {
            this.game.audio.playSound('hit');
        }

        // Update UI
        this.updateArmorUI();

        // Armor Breaking Visuals
        if (this.health === 2 && this.helmet) {
            this.helmet.visible = false;
            this.spawnArmorShards(this.helmet.position, 3);
            if (this.game.audio) this.game.audio.playSound('armor_break');
        } else if (this.health === 1 && this.chestPlate) {
            this.chestPlate.visible = false;
            this.spawnArmorShards(this.chestPlate.position, 5);
            if (this.game.audio) this.game.audio.playSound('armor_break');
        }

        if (this.health <= 0) {
            this.die();
        } else {
            // Invincibility frames
            this.isInvincible = true;
            this.invincibleTimer = GameConfig.player.invincibilityDuration;

            // Knockback (simple version)
            this.velocity.y = 5;
            this.velocity.x = -5 * (this.facingRight ? 1 : -1);
            this.isGrounded = false;
            this.fsm.changeState('JUMP_FALL');
        }
    }

    spawnArmorShards(localPos, count) {
        // Convert to world space
        const worldPos = new THREE.Vector3();
        if (this.skinMesh) {
            this.skinMesh.localToWorld(worldPos.copy(localPos));
        } else {
            worldPos.copy(this.position).add(localPos);
        }

        if (this.game.particleManager) {
            this.game.particleManager.emit({
                position: worldPos,
                count: count,
                color: 'armor',
                scale: 2.0
            });
        }
    }

    updateArmorUI() {
        for (let i = 1; i <= GameConfig.player.maxArmor; i++) {
            const el = document.getElementById(`armor-${i}`);
            if (el) {
                if (i > this.health) {
                    el.classList.add('lost');
                    el.classList.remove('damaged');
                } else {
                    el.classList.remove('lost');
                }
            }
        }
    }

    die() {
        if (this.currentState === 'DEATH') return; // Prevent double death
        console.log("💀 Player DIED");

        // Disable input processing via state
        this.fsm.changeState('DEATH');

        // Play death music/sound
        if (this.game && this.game.audio) {
            this.game.audio.playSound('death');
        }

        // Wait 2 seconds before showing game over UI (let death animation play)
        setTimeout(() => {
            // Show Game Over UI with fade-in
            const ui = document.getElementById('game-over-screen');
            if (ui) {
                ui.classList.remove('hidden');
                ui.style.opacity = '0';
                ui.style.transition = 'opacity 0.5s ease-in';
                // Trigger reflow then fade in
                requestAnimationFrame(() => {
                    ui.style.opacity = '1';
                });
            }

            // Enable restart (delayed slightly)
            setTimeout(() => {
                this.waitingForRestart = true;
            }, 1000);
        }, 2000);
    }
}

// Add Death State
class DeathState extends State {
    enter() {
        this.owner.velocity.set(0, 0, 0);

        // Play death animation (non-looping)
        this.owner.playAnim('death');

        // Make animation play only once (not loop)
        if (this.owner.currentAction) {
            this.owner.currentAction.setLoop(THREE.LoopOnce);
            this.owner.currentAction.clampWhenFinished = true;
        }
    }
    update(dt) {
        // Nothing, dead - animation handles visual
    }
}

class EmoteState extends State {
    enter() {
        this.owner.velocity.set(0, 0, 0);
        this.owner.playAnim('wave');
        this.timer = 0;
        this.duration = 2.0; // Default duration

        if (this.owner.currentAction) {
            this.owner.currentAction.setLoop(THREE.LoopOnce);
            this.owner.currentAction.clampWhenFinished = true;
            // Use clip duration if available, but at least 1s
            const clipDuration = this.owner.currentAction.getClip().duration;
            if (clipDuration > 0) this.duration = clipDuration;
        }
    }
    update(dt) {
        this.timer += dt;
        if (this.timer >= this.duration) {
            this.machine.changeState('IDLE');
        }
    }
}

// =========================================================================
// PLAYER STATES
// =========================================================================

class IdleState extends State {
    enter() {
        this.owner.velocity.x = 0;
        this.owner.playAnim('idle');
    }

    update(dt) {
        // Check Transitions

        // JUMP
        if (this.owner.input.isJustPressed('jump') && this.owner.isGrounded) {
            this.machine.changeState('JUMP_RISE');
            return;
        }

        // ATTACK
        if (this.owner.input.isJustPressed('attackPrimary')) {
            this.machine.changeState('ATTACK_THROW');
            return;
        }

        // ATTACK HEAVY
        if (this.owner.input.isJustPressed('attackSecondary')) {
            this.machine.changeState('ATTACK_HEAVY');
            return;
        }

        // ROLL (L)
        if (this.owner.input.isJustPressed('roll')) {
            this.machine.changeState('ROLL');
            return;
        }

        // RUN
        const hInput = this.owner.input.getHorizontalAxis();
        if (Math.abs(hInput) > 0.1) {
            this.machine.changeState('RUN');
            return;
        }
    }
}

class RunState extends State {
    enter() {
        this.owner.playAnim('run');
    }

    update(dt) {
        const hInput = this.owner.input.getHorizontalAxis();

        // Move
        this.owner.velocity.x = hInput * GameConfig.player.runSpeed;

        // Transitions

        // ROLL
        if (this.owner.input.isJustPressed('roll')) {
            this.machine.changeState('ROLL');
            return;
        }

        // IDLE (Stopped)
        if (Math.abs(hInput) < 0.1) {
            this.machine.changeState('IDLE');
            return;
        }

        // JUMP
        if (this.owner.input.isJustPressed('jump') && this.owner.isGrounded) {
            this.machine.changeState('JUMP_RISE');
            return;
        }

        // ATTACK
        if (this.owner.input.isJustPressed('attackPrimary')) {
            this.machine.changeState('ATTACK_THROW');
            return;
        }

        // ATTACK HEAVY
        if (this.owner.input.isJustPressed('attackSecondary')) {
            this.machine.changeState('ATTACK_HEAVY');
            return;
        }

        // FALLING (Walked off ledge)
        if (!this.owner.isGrounded) {
            this.machine.changeState('JUMP_FALL');
            return;
        }
    }
}

class JumpRiseState extends State {
    enter() {
        this.owner.velocity.y = GameConfig.player.jumpVelocity;
        this.owner.isGrounded = false;
        this.owner.playAnim('jump');

        // Ensure jump/roll loops (especially for generic roll animations mapped to jump)
        if (this.owner.currentAction) {
            this.owner.currentAction.setLoop(THREE.LoopRepeat);
            this.owner.currentAction.play();
        }

        if (this.owner.game && this.owner.game.audio) this.owner.game.audio.playSound('jump');
    }

    update(dt) {
        const hInput = this.owner.input.getHorizontalAxis();

        // Air control (reduced)
        this.owner.velocity.x = hInput * GameConfig.player.runSpeed; // * GameConfig.player.airControlMultiplier;

        // Variable Jump Height: Cut velocity if button released
        if (this.owner.input.isJustReleased('jump') && this.owner.velocity.y > 0) {
            this.owner.velocity.y *= GameConfig.player.jumpCutMultiplier;
        }

        // ATTACK
        if (this.owner.input.isJustPressed('attackPrimary')) {
            this.machine.changeState('ATTACK_THROW');
            return;
        }

        // ATTACK HEAVY (Air)
        if (this.owner.input.isJustPressed('attackSecondary')) {
            this.machine.changeState('ATTACK_HEAVY');
            return;
        }

        // Apex reached implies falling next physics step
        if (this.owner.velocity.y <= 0) {
            this.machine.changeState('JUMP_FALL');
        }
    }
}

class JumpFallState extends State {
    update(dt) {
        const hInput = this.owner.input.getHorizontalAxis();

        // Air control
        if (Math.abs(hInput) > 0.1) {
            this.owner.velocity.x = hInput * GameConfig.player.runSpeed;
        }

        // ATTACK
        if (this.owner.input.isJustPressed('attackPrimary')) {
            this.machine.changeState('ATTACK_THROW');
            return;
        }

        // ATTACK HEAVY (Air)
        if (this.owner.input.isJustPressed('attackSecondary')) {
            this.machine.changeState('ATTACK_HEAVY');
            return;
        }

        // Landed
        if (this.owner.isGrounded) {
            if (Math.abs(hInput) > 0.1) {
                this.machine.changeState('RUN');
            } else {
                this.machine.changeState('IDLE');
            }
        }
    }
}

class AttackThrowState extends State {
    constructor(machine) {
        super(machine);
        this.timer = 0;
        this.animPhase = 'anticipation'; // anticipation, active, recovery
    }

    enter() {
        this.timer = 0;
        this.animPhase = 'anticipation';

        // Play attack animation
        this.owner.playAnim('attack_throw');

        // Stop movement if on ground (commit to attack)
        if (this.owner.isGrounded) {
            this.owner.velocity.x = 0;
        }

        // Visual cue (flash white)
        this.owner.flashColor(0xffffff, 0.1);

        // Spawn actual projectile
        this.spawnProjectile();

        if (this.owner.game && this.owner.game.audio) this.owner.game.audio.playSound('spear_thrust');
    }

    update(dt) {
        this.timer += dt;

        // Anticipation -> Active
        if (this.animPhase === 'anticipation' && this.timer >= GameConfig.attacks.throw.anticipation) {
            this.animPhase = 'active';
            this.owner.flashColor(0xffff00, 0.1);
        }

        // Active -> Recovery
        if (this.animPhase === 'active' && this.timer >= (GameConfig.attacks.throw.anticipation + GameConfig.attacks.throw.active)) {
            this.animPhase = 'recovery';
            // No color change needed for recovery, just finish
        }

        // End
        const totalDuration = GameConfig.attacks.throw.anticipation +
            GameConfig.attacks.throw.active +
            GameConfig.attacks.throw.recovery;

        if (this.timer >= totalDuration) {
            if (this.owner.isGrounded) {
                this.machine.changeState('IDLE');
            } else {
                this.machine.changeState('JUMP_FALL');
            }
        }
    }

    spawnProjectile() {
        // Spawn actual projectile
        const offset = this.owner.facingRight ? 0.8 : -0.8;
        const x = this.owner.position.x + offset;
        const y = this.owner.position.y + 2.2; // Shoulder height (Raised for Adventurer scaled)
        const dir = this.owner.facingRight ? 1 : -1;

        // Use equipped weapon
        const weaponKey = this.owner.inventory[this.owner.currentWeaponIndex];
        if (this.owner.game) {
            this.owner.game.spawnProjectile(GameConfig.weapons[weaponKey], x, y, dir, 'player');
        }
    }
}

class AttackHeavyState extends State {
    constructor(machine) {
        super(machine);
        this.timer = 0;
        this.phase = 'anticipation'; // anticipation, active, recovery
        this.hitEnemies = new Set();
        this.startRotation = new THREE.Euler();
        this.targetRotation = new THREE.Euler();
    }

    enter() {
        this.timer = 0;
        this.phase = 'anticipation';
        this.hitEnemies.clear();

        // Play attack animation
        this.owner.playAnim('attack_melee');

        // Stop movement
        if (this.owner.isGrounded) {
            this.owner.velocity.x = 0;
        }

        // Visual setup - Wind up
        if (this.owner.weaponMesh) {
            this.startRotation.copy(this.owner.weaponMesh.rotation);
            // Wind up backwards
            this.owner.weaponMesh.rotation.z = -Math.PI / 2;
        }

        // Flash cues
        this.owner.flashColor(0xffaa00, 0.1); // Orange charging
    }

    update(dt) {
        this.timer += dt;
        const config = GameConfig.attacks.heavy;

        // Determine Phase
        if (this.timer < config.anticipation) {
            this.phase = 'anticipation';
        } else if (this.timer < config.anticipation + config.active) {
            // TRANSITION TO ACTIVE
            if (this.phase !== 'active') {
                this.phase = 'active';
                this.owner.flashColor(0xff0000, 0.15); // Red hot swing

                // Swing visuals
                if (this.owner.weaponMesh) {
                    this.owner.weaponMesh.rotation.z = Math.PI / 2; // Swing forward
                }

                if (this.owner.game && this.owner.game.audio) this.owner.game.audio.playSound('swing');
            }
            this.checkCollisions();
        } else if (this.timer < config.anticipation + config.active + config.recovery) {
            // TRANSITION TO RECOVERY
            if (this.phase !== 'recovery') {
                this.phase = 'recovery';
                this.owner.flashColor(0xaa4444, 0.1); // Cooling down

                // Return visuals
                if (this.owner.weaponMesh) {
                    this.owner.weaponMesh.rotation.z = Math.PI / 4; // Back to idle
                }
            }
        } else {
            // FINISHED
            if (this.owner.isGrounded) {
                this.machine.changeState('IDLE');
            } else {
                this.machine.changeState('JUMP_FALL');
            }
            return;
        }
    }

    checkCollisions() {
        // Only run if we have a game reference
        if (!this.owner.game) return;

        const enemies = this.owner.game.enemies;
        const hitboxConfig = GameConfig.collision.attackHitboxes.heavySwing;

        // Calculate Hitbox in world space
        const facingDir = this.owner.facingRight ? 1 : -1;
        const centerX = this.owner.position.x + (hitboxConfig.offset.x * facingDir);
        const centerY = this.owner.position.y + hitboxConfig.offset.y;

        // Create a Box3 for the attack
        const attackBox = new THREE.Box3();
        const halfWidth = hitboxConfig.width / 2;
        const halfHeight = hitboxConfig.height / 2;

        attackBox.min.set(centerX - halfWidth, centerY - halfHeight, -1);
        attackBox.max.set(centerX + halfWidth, centerY + halfHeight, 1);

        // Debug visual (optional, skipped for now)

        // Check against all enemies
        for (const enemy of enemies) {
            if (!enemy.isActive || this.hitEnemies.has(enemy)) continue;

            const enemyBox = enemy.getBounds();
            if (attackBox.intersectsBox(enemyBox)) {
                // HIT!
                this.hitEnemies.add(enemy);
                this.applyDamage(enemy);
            }
        }
    }

    applyDamage(enemy) {
        console.log(`⚔️ Heavy Hit on ${enemy.config.name}!`);

        const config = GameConfig.attacks.heavy;

        // Damage
        enemy.takeDamage(config.damage);

        // Knockback logic
        const dir = this.owner.facingRight ? 1 : -1;
        enemy.velocity.x = dir * config.knockback;
        enemy.velocity.y = 2; // Little pop up
        enemy.isGrounded = false; // Lift them off ground

        // Camera Shake effect if available
        if (this.owner.game.shakeCamera) {
            this.owner.game.shakeCamera(0.3, 0.15);
        }

        // Particle effect
        if (this.owner.game.particleManager) {
            this.owner.game.particleManager.emit({
                position: enemy.position,
                count: 12,
                color: 'hit', // White/yellow spark
                scale: 2.0
            });
        }
    }

    exit() {
        // Color is auto-reset by flashColor's timeout, no manual reset needed

        // Reset weapon rotation
        if (this.owner.weaponMesh) {
            this.owner.weaponMesh.rotation.copy(this.startRotation);
        }
    }
}

class RollState extends State {
    enter() {
        this.timer = 0;
        this.owner.isInvincible = true;
        this.owner.playAnim('jump'); // Fallback visual

        // Boost Speed in facing direction
        const dir = this.owner.facingRight ? 1 : -1;
        this.owner.velocity.x = GameConfig.player.runSpeed * 1.8 * dir;
        this.owner.velocity.y = 0;

        // Flash blue for invincibility visual
        this.owner.flashColor(0x00aaff, 0.4);

        if (this.owner.game && this.owner.game.audio) {
            // this.owner.game.audio.playSound('jump'); // Reuse jump sound
        }
    }

    update(dt) {
        this.timer += dt;

        // Move
        this.owner.position.x += this.owner.velocity.x * dt;

        if (this.timer > 0.5) {
            this.machine.changeState('IDLE');
        }
    }

    exit() {
        this.owner.isInvincible = false;
        this.owner.velocity.x = 0; // Stop momentum on exit
    }
}
