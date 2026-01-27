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
import { GameConfig } from '../config/GameConfig.js';
import { StateMachine, State } from '../core/StateMachine.js';
import { WeaponFactory } from './WeaponFactory.js';

export class Player {
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
        // For now, procedurally generate a placeholder character
        // In the future this would load a glTF file
        this.createProceduralCharacter();

        // Set initial state
        this.updateWeaponUI();
        this.fsm.changeState('IDLE');
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

        // 2. Armor Group
        this.armorGroup = new THREE.Group();
        this.skinMesh.add(this.armorGroup);

        // Chestplate
        const chestGeo = new THREE.CylinderGeometry(0.42, 0.40, 0.5, 8);
        const armorMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
        this.chestPlate = new THREE.Mesh(chestGeo, armorMat);
        this.chestPlate.position.y = 0.2;
        this.armorGroup.add(this.chestPlate);

        // Helmet
        const helmGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        this.helmet = new THREE.Mesh(helmGeo, armorMat.clone());
        this.helmet.position.y = 0.7;
        this.armorGroup.add(this.helmet);

        // Assign bodyMesh to skinMesh for general purpose (flashing/physics)
        this.bodyMesh = this.skinMesh;

        // Weapon (Parent to body/arm) - Hand Group
        this.handGroup = new THREE.Group();
        this.handGroup.position.set(0.4, 0.2, 0.3); // Hand position roughly
        // this.handGroup.rotation.x = Math.PI / 4;
        this.skinMesh.add(this.handGroup);

        // Initial visual
        this.updateWeaponVisuals();

        // Direction indicator (Eyes)
        const eyeGeo = new THREE.BoxGeometry(0.3, 0.1, 0.2);
        const eyeMesh = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        eyeMesh.position.set(0, 0.6, 0.3); // Relative to skin
        this.skinMesh.add(eyeMesh);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.mesh.position.copy(this.position);
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
                this.bodyMesh.material.opacity = 1.0;
                this.bodyMesh.material.transparent = false;
            } else {
                // Blink effect
                this.bodyMesh.material.transparent = true;
                this.bodyMesh.material.opacity = Math.sin(this.invincibleTimer * 20) > 0 ? 0.5 : 1.0;
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
        console.log("💀 Player DIED");

        // Disable input processing via state
        this.fsm.changeState('DEATH');

        // Show Game Over UI
        const ui = document.getElementById('game-over-screen');
        if (ui) ui.classList.remove('hidden');

        // Listen for restart
        const restartHandler = (e) => {
            if (e.key === 'r' || e.key === 'R' || e.type === 'touchstart') {
                window.removeEventListener('keydown', restartHandler);
                window.removeEventListener('touchstart', restartHandler);
                location.reload();
            }
        };

        // Delayed listener to prevent accidental restart
        setTimeout(() => {
            window.addEventListener('keydown', restartHandler);
            window.addEventListener('touchstart', restartHandler);
        }, 1000);
    }
}

// Add Death State
class DeathState extends State {
    enter() {
        this.owner.velocity.set(0, 0, 0);
        if (this.owner.bodyMesh) {
            this.owner.bodyMesh.rotation.x = -Math.PI / 2; // Fall over
            this.owner.bodyMesh.position.y = 0.2;
        }
    }
    update(dt) {
        // Nothing, dead
    }
}

// =========================================================================
// PLAYER STATES
// =========================================================================

class IdleState extends State {
    enter() {
        this.owner.velocity.x = 0;
        // console.log("Enter IDLE");
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

        // RUN
        const hInput = this.owner.input.getHorizontalAxis();
        if (Math.abs(hInput) > 0.1) {
            this.machine.changeState('RUN');
            return;
        }
    }
}

class RunState extends State {
    update(dt) {
        const hInput = this.owner.input.getHorizontalAxis();

        // Move
        this.owner.velocity.x = hInput * GameConfig.player.runSpeed;

        // Transitions

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

        // Stop movement if on ground (commit to attack)
        if (this.owner.isGrounded) {
            this.owner.velocity.x = 0;
        }

        // console.log("THROW ATTACK START");

        // Visual cue (flash white)
        this.owner.bodyMesh.material.color.setHex(0xffffff);

        // Spawn actual projectile
        this.spawnProjectile();

        if (this.owner.game && this.owner.game.audio) this.owner.game.audio.playSound('throw');
    }

    update(dt) {
        this.timer += dt;

        // Anticipation -> Active
        if (this.animPhase === 'anticipation' && this.timer >= GameConfig.attacks.throw.anticipation) {
            this.animPhase = 'active';
            this.owner.bodyMesh.material.color.setHex(0xffff00); // Yellow flash
        }

        // Active -> Recovery
        if (this.animPhase === 'active' && this.timer >= (GameConfig.attacks.throw.anticipation + GameConfig.attacks.throw.active)) {
            this.animPhase = 'recovery';
            this.owner.bodyMesh.material.color.setHex(0xaa2222); // Back to red
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
        const y = this.owner.position.y + 1.2; // Shoulder height
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
        this.owner.bodyMesh.material.color.setHex(0xffaa00); // Orange charging
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
                this.owner.bodyMesh.material.color.setHex(0xff0000); // Red hot swing

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
                this.owner.bodyMesh.material.color.setHex(0xaa4444); // Cooling down

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
        // Reset color (should probably restore original color, but red is default for now)
        if (this.owner.bodyMesh) {
            // Restore default colors based on armor/skin not hardcoded?
            // For now, let's just assume the default red helper color or nothing
            // Actually, Player.init sets specific colors. We should probably just clear the emissive "flash" effect or reset.
            // But since we don't store original state easily, let's re-apply the known default or rely on the flash logic which uses setTimeout.
            // The logic above used setHex directly.
            // Let's assume the flash logic in enter() overwrote it.
            // We'll leave the color reset for now as it matches existing code style, though imprecise.
            this.owner.bodyMesh.material.color.setHex(0xaa2222);
        }

        // Reset weapon rotation
        if (this.owner.weaponMesh) {
            this.owner.weaponMesh.rotation.copy(this.startRotation);
        }
    }
}
