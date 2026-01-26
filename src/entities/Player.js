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
        this.fsm.changeState('IDLE');
    }

    createProceduralCharacter() {
        // Create a group to hold everything
        this.mesh = new THREE.Group();
        this.scene.add(this.mesh);

        // Visual debug mesh (a capsule/box for now until we have rig)
        const geometry = new THREE.CapsuleGeometry(0.4, 1.0, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0xaa2222 }); // Red knight
        this.bodyMesh = new THREE.Mesh(geometry, material);
        this.bodyMesh.position.y = 0.9; // Pivot at feet
        this.bodyMesh.castShadow = true;
        this.mesh.add(this.bodyMesh);

        // Add a "Weapon" visual
        const weaponGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
        const weaponMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        this.weaponMesh = new THREE.Mesh(weaponGeo, weaponMat);
        this.weaponMesh.position.set(0.4, 0.8, 0.3);
        this.weaponMesh.rotation.x = Math.PI / 4;
        this.mesh.add(this.weaponMesh);

        // Direction indicator
        const eyeGeo = new THREE.BoxGeometry(0.3, 0.1, 0.2);
        const eyeMesh = new THREE.Mesh(eyeGeo, new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        eyeMesh.position.set(0.2, 1.3, 0);
        this.mesh.add(eyeMesh);
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.mesh.position.copy(this.position);
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

        // Apply Velocity to Position
        this.position.x += this.velocity.x * dt;
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

        // Update UI
        this.updateArmorUI();

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
        // console.log("Enter JUMP_RISE");
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
    }

    update(dt) {
        this.timer += dt;

        // Anticipation -> Active
        if (this.animPhase === 'anticipation' && this.timer >= GameConfig.attacks.throw.anticipation) {
            this.animPhase = 'active';
            this.spawnProjectile();
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

        // Default to spear for now, could be dynamic based on inventory
        if (this.owner.game) {
            this.owner.game.spawnProjectile(GameConfig.weapons.spear, x, y, dir, 'player');
        }
    }
}
