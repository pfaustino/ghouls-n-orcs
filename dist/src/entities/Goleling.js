
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { clone } from 'https://unpkg.com/three@0.160.0/examples/jsm/utils/SkeletonUtils.js';
import { Enemy } from './Enemy.js';
import { State } from '../core/StateMachine.js';

/**
 * Goleling - Small goblin-like creature
 * Fast, weak, attacks in groups
 */
export class Goleling extends Enemy {
    createMesh() {
        if (this.game.assets && this.game.assets.models['goleling']) {
            const gltf = this.game.assets.models['goleling'];
            this.model = clone(gltf.scene);

            this.mesh.add(this.model);

            // Transform - small creature
            this.model.rotation.y = Math.PI / 2;
            this.model.scale.setScalar(0.8);
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
                if (lowerName === 'walk') this.animations['walk'] = clip;
                if (lowerName === 'run') this.animations['run'] = clip;
                if (lowerName === 'idle') this.animations['idle'] = clip;
                if (lowerName === 'death') this.animations['death'] = clip;
            });
        } else {
            this.createProceduralMesh();
        }
    }

    createProceduralMesh() {
        const group = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({ color: 0x44aa44 }); // Green

        // Small body
        const bodyGeo = new THREE.BoxGeometry(0.4, 0.5, 0.3);
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 0.25;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.3);
        const head = new THREE.Mesh(headGeo, mat);
        head.position.y = 0.6;
        group.add(head);

        this.bodyMesh = group;
        this.mesh.add(group);
    }

    playAnim(name) {
        if (!this.mixer) return;
        const clip = this.animations[name] || this.animations['idle'];
        if (clip) {
            const action = this.mixer.clipAction(clip);
            if (!action.isRunning()) {
                this.mixer.stopAllAction();
                action.reset().play();
            }
        }
    }

    constructor(scene, config, x, y, game) {
        super(scene, config, x, y, game);

        // AI States
        this.fsm.addState('IDLE', new GolelingIdleState(this.fsm));
        this.fsm.addState('APPROACH', new GolelingApproachState(this.fsm));
        this.fsm.addState('ATTACK', new GolelingAttackState(this.fsm));
        this.fsm.addState('PATROL', new GolelingPatrolState(this.fsm));

        this.fsm.changeState('IDLE');
    }
}

// AI States
class GolelingIdleState extends State {
    enter() {
        this.owner.velocity.x = 0;
        this.owner.playAnim('idle');
    }
    update(dt) {
        if (this.owner.game.player) {
            const dx = this.owner.game.player.position.x - this.owner.position.x;
            if (Math.abs(dx) < this.owner.config.detectionRange) {
                this.machine.changeState('APPROACH');
            }
        }
    }
}

class GolelingApproachState extends State {
    enter() {
        this.owner.playAnim('run');
    }
    update(dt) {
        const player = this.owner.game.player;
        if (!player || player.isDead) {
            this.machine.changeState('IDLE');
            return;
        }

        const dx = player.position.x - this.owner.position.x;
        const dist = Math.abs(dx);

        // Face player
        this.owner.facingRight = dx > 0;
        this.owner.mesh.rotation.y = this.owner.facingRight ? 0 : Math.PI;

        // Move
        const dir = Math.sign(dx);

        // Ledge Detection (Don't fall!)
        const lookAheadX = this.owner.position.x + (dir * 1.5); // Look ahead
        const platform = this.owner.game.levelManager.findGroundAt(lookAheadX);
        const yDiff = platform ? (this.owner.position.y - platform.box.max.y) : 999;

        if (!platform || yDiff > 4.0) {
            // Edge detected! Run away!
            this.machine.changeState('PATROL', { dir: -dir, duration: 1.5 });
            return;
        }

        this.owner.velocity.x = dir * this.owner.config.speed;

        // Attack range
        if (dist < this.owner.config.attackRange) {
            this.machine.changeState('ATTACK');
        }
    }
}

class GolelingAttackState extends State {
    enter() {
        this.owner.velocity.x = 0;
        this.timer = 0;
        this.hasHit = false;
        this.owner.playAnim('attack');
        if (this.owner.game.audio) this.owner.game.audio.playSound('punch');
    }

    update(dt) {
        this.timer += dt;
        const config = this.owner.config;

        if (this.timer > config.telegraphDuration && !this.hasHit) {
            this.checkHit();
            this.hasHit = true;
        }

        if (this.timer >= config.telegraphDuration + config.attackDuration + config.recoveryDuration) {
            this.machine.changeState('APPROACH');
        }
    }

    checkHit() {
        const player = this.owner.game.player;
        if (player) {
            const dx = player.position.x - this.owner.position.x;
            const dir = this.owner.facingRight ? 1 : -1;
            if (Math.abs(dx) < this.owner.config.attackRange && Math.sign(dx) === dir) {
                if (Math.abs(player.position.y - this.owner.position.y) < 1.5) {
                    player.takeDamage(this.owner.config.damage);
                }
            }
        }
    }
}

class GolelingPatrolState extends State {
    enter(params) {
        this.dir = params && params.dir ? params.dir : 1;
        this.timer = params && params.duration ? params.duration : 1.0;
        this.owner.facingRight = this.dir > 0;
        this.owner.mesh.rotation.y = this.owner.facingRight ? 0 : Math.PI;

        this.owner.playAnim('run'); // Keep running but away
    }

    update(dt) {
        this.timer -= dt;
        this.owner.velocity.x = this.dir * this.owner.config.speed;

        if (this.timer <= 0) {
            this.machine.changeState('IDLE'); // Stop briefly before chasing again
        }
    }
}
