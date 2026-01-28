
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { clone } from 'https://unpkg.com/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';
import { Enemy } from './Enemy.js';
import { State } from '../core/StateMachine.js';
import { GameConfig } from '../config/GameConfig.js';

export class Gargoyle extends Enemy {
    createMesh() {
        // Try to load Demon.glb model
        if (this.game.assets && this.game.assets.models['gargoyle']) {
            const gltf = this.game.assets.models['gargoyle'];
            this.model = clone(gltf.scene);

            this.mesh.add(this.model);

            // Transform
            this.model.rotation.y = Math.PI / 2; // Face toward player
            this.model.scale.setScalar(1.2);
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
            this.animations = {};
            gltf.animations.forEach(clip => {
                let name = clip.name;
                if (name.includes('|')) {
                    const parts = name.split('|');
                    name = parts[parts.length - 1];
                }
                const lowerName = name.toLowerCase();
                this.animations[lowerName] = clip;

                // Map animations
                if (lowerName.includes('attack') || lowerName.includes('punch')) this.animations['attack'] = clip;
                if (lowerName.includes('hit')) this.animations['hit'] = clip;
                if (lowerName === 'walk' || lowerName === 'fly') this.animations['walk'] = clip;
                if (lowerName === 'idle') this.animations['idle'] = clip;
                if (lowerName === 'death') this.animations['death'] = clip;
            });
        } else {
            // Fallback to procedural mesh if model not loaded
            this.createProceduralMesh();
        }
    }

    createProceduralMesh() {
        const group = new THREE.Group();

        // Material: Stone Grey
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });

        // Body (Squat)
        const bodyGeo = new THREE.BoxGeometry(0.8, 0.8, 0.6);
        this.bodyPart = new THREE.Mesh(bodyGeo, stoneMat);
        this.bodyPart.castShadow = true;
        group.add(this.bodyPart);

        // Head
        const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        this.headPart = new THREE.Mesh(headGeo, stoneMat);
        this.headPart.position.set(0, 0.7, 0.2);
        group.add(this.headPart);

        // Wings (Visual only)
        const wingGeo = new THREE.BoxGeometry(0.1, 0.8, 1.2);
        this.leftWing = new THREE.Mesh(wingGeo, stoneMat);
        this.leftWing.position.set(0, 0.4, 0.6);
        this.leftWing.rotation.z = Math.PI / 4;
        group.add(this.leftWing);

        this.rightWing = new THREE.Mesh(wingGeo, stoneMat);
        this.rightWing.position.set(0, 0.4, -0.6);
        this.rightWing.rotation.z = Math.PI / 4;
        group.add(this.rightWing);

        // Eyes (Red when active)
        const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x333333 }); // Dark initially
        this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        this.leftEye.position.set(0.2, 0.7, 0.46);
        group.add(this.leftEye);
        this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        this.rightEye.position.set(-0.2, 0.7, 0.46);
        group.add(this.rightEye);

        this.bodyMesh = group;
        this.mesh.add(group);
    }

    constructor(scene, config, x, y, game) {
        super(scene, config, x, y, game);
        // Visuals handled by createMesh (called by super)

        // AI
        this.fsm.addState('IDLE', new GargoyleIdleState(this.fsm));
        this.fsm.addState('HOVER', new GargoyleHoverState(this.fsm));
        this.fsm.addState('SWOOP', new GargoyleSwoopState(this.fsm));

        this.fsm.changeState('IDLE');
    }

    // Override physics to handle Flying (No Gravity)
    fixedUpdate(dt) {
        if (this.isDying) {
            // Fall to ground
            this.velocity.y -= GameConfig.world.gravity * dt;
            this.position.y += this.velocity.y * dt;

            // Ground Collision
            if (this.game.levelManager) {
                this.game.levelManager.checkGroundCollision(this);
            } else if (this.position.y <= 0) {
                this.position.y = 0;
                this.velocity.y = 0;
            }

            this.mesh.position.copy(this.position);

            // Rotate to lie down (Simulate death animation)
            if (this.bodyMesh) {
                this.bodyMesh.rotation.x = -Math.PI / 2; // Flat on back/front
                this.bodyMesh.position.y = 0.4; // Offset to not sink in ground if origin is center
            }
            return;
        }

        if (!this.isActive) return;

        // Custom Physics for Flying
        // No Gravity applied here

        // Apply Velocity
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // Check Wall/Ceiling Collisions?
        // For simplicity, just check ground to prevent sinking
        if (this.game.levelManager) {
            // Only block if moving down
            if (this.velocity.y < 0 && this.game.levelManager.checkGroundCollision(this)) {
                // Landed?
            }
        }

        // Update Mesh
        this.mesh.position.copy(this.position);

        // Logic
        this.fsm.update(dt);

        // Facing
        if (this.velocity.x !== 0) {
            this.facingRight = this.velocity.x > 0;
            // Mesh Rotation (Face Player)
            this.bodyMesh.rotation.y = this.facingRight ? 0 : Math.PI;
        }

        // Kill Plane
        if (this.position.y < -10) this.die();
    }

    wakeUp() {
        // glowing eyes
        const red = new THREE.Color(0xff0000);
        if (this.leftEye) this.leftEye.material.color = red;
        if (this.rightEye) this.rightEye.material.color = red;
    }
}

// ==========================================
// STATES
// ==========================================

class GargoyleIdleState extends State {
    enter() {
        this.owner.velocity.set(0, 0, 0);
        // Maybe sit on something?
    }
    update(dt) {
        if (this.owner.game.player) {
            const dist = this.owner.position.distanceTo(this.owner.game.player.position);
            if (dist < this.owner.config.detectionRange) {
                this.owner.wakeUp();
                this.machine.changeState('HOVER');
            }
        }
    }
}

class GargoyleHoverState extends State {
    constructor(machine) {
        super(machine);
        this.hoverTimer = 0;
        this.preferredHeight = 4; // Height above player
    }

    enter() {
        this.hoverTimer = 0;
    }

    update(dt) {
        if (!this.owner.game.player || this.owner.game.player.isDead) {
            this.machine.changeState('IDLE');
            return;
        }

        const player = this.owner.game.player;
        const targetX = player.position.x;
        const targetY = player.position.y + this.preferredHeight;

        // Float towards target
        const dx = targetX - this.owner.position.x;
        const dy = targetY - this.owner.position.y;

        // Smooth movement
        this.owner.velocity.x = dx * 1.5; // Spring-like
        this.owner.velocity.y = dy * 1.0;

        // Clamp speed
        const speed = this.owner.config.speed;
        this.owner.velocity.clampLength(0, speed);

        // Bobbing
        this.hoverTimer += dt * 2;
        this.owner.velocity.y += Math.sin(this.hoverTimer) * 0.5;

        // Attack Check
        const dist = this.owner.position.distanceTo(player.position);
        // Only attack if we are roughly above
        if (Math.abs(dx) < 3 && dist < this.owner.config.attackRange * 2) {
            // Random chance or timer?
            if (Math.random() < 0.02) { // approx once per second at 60fps
                this.machine.changeState('SWOOP');
            }
        }
    }
}

class GargoyleSwoopState extends State {
    enter() {
        if (!this.owner.game.player || this.owner.game.player.isDead) {
            this.machine.changeState('HOVER');
            return;
        }

        // Aim at player
        const player = this.owner.game.player;
        const dx = player.position.x - this.owner.position.x;
        const dy = player.position.y - this.owner.position.y;

        const vec = new THREE.Vector3(dx, dy, 0).normalize();
        const swoopSpeed = this.owner.config.speed * 3.0; // Fast!

        this.owner.velocity.copy(vec.multiplyScalar(swoopSpeed));

        this.timer = 0;

        // Play Anim & Sound
        this.owner.playAnim('attack'); // Headbutt
        if (this.owner.game.audio) this.owner.game.audio.playSound('punch');
    }

    update(dt) {
        this.timer += dt;

        // Swoop lasts fixed time
        if (this.timer > this.owner.config.attackDuration) {
            // Setup recovery (fly up)
            this.owner.velocity.y = 3; // Fly Up
            this.machine.changeState('HOVER');
        }

        // Hit detection managed by Enemy.checkCollisions?
        // No, usually Main.js checks collisions via hitboxes. 
        // Enemy just needs to touch Player. Player.checkCollisions handles taking damage.
    }
}
