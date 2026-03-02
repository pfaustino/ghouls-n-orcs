
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GameConfig } from '../config/GameConfig.js';
import { Levels } from '../config/Levels.js';
import { Ghoul } from '../entities/Ghoul.js';
import { Orc } from '../entities/Orc.js';
import { OrcWarlord } from '../entities/OrcWarlord.js';
import { Ogre } from '../entities/Ogre.js';
import { Gargoyle } from '../entities/Gargoyle.js';
import { Goleling } from '../entities/Goleling.js';

export class LevelManager {
    constructor(game) {
        this.game = game;
        this.scene = game.scene;

        this.currentLevel = null;
        this.platforms = []; // Array of { mesh, box }
        this.spawners = [];
        this.levelGroup = new THREE.Group();
        this.scene.add(this.levelGroup);

        // Victory state
        this.victoryTriggered = false;
        this.waitingForInput = false;
    }

    loadLevel(levelId) {
        const data = Levels[levelId];
        if (!data) {
            console.error(`Level ${levelId} not found!`);
            return;
        }

        console.log(`Loading level: ${data.name}`);
        this.currentLevel = data;

        this.showLevelTitle(data.name);

        // Clear existing
        this.clearLevel();

        // Reset victory state for new level
        this.victoryTriggered = false;
        this.waitingForInput = false;

        // Build geometry
        this.buildPlatforms(data.platforms);

        // Setup spawners
        this.setupSpawners(data.spawners);
    }

    restartLevel() {
        if (!this.currentLevel) return;

        console.log(`🔄 Restarting level: ${this.currentLevel.name}`);

        // Reset spawners (keep platforms)
        this.spawners = [];
        this.setupSpawners(this.currentLevel.spawners);
    }

    clearLevel() {
        // Remove meshes
        while (this.levelGroup.children.length > 0) {
            const mesh = this.levelGroup.children[0];
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.levelGroup.remove(mesh);
        }
        this.platforms = [];
        this.spawners = [];
    }

    buildPlatforms(platformData) {
        const matGround = new THREE.MeshStandardMaterial({
            color: 0x1a1a20, roughness: 0.9, metalness: 0.1
        });

        const matPlat = new THREE.MeshStandardMaterial({
            color: 0x2a2a35, roughness: 0.8, metalness: 0.2
        });

        platformData.forEach(p => {
            const geo = new THREE.BoxGeometry(p.w, p.h, p.d);
            const mat = p.type === 'ground' ? matGround : matPlat;
            const mesh = new THREE.Mesh(geo, mat);

            mesh.position.set(p.x, p.y, 0); // Z is usually 0 center
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            this.levelGroup.add(mesh);

            // Compute physics box
            // Note: Box3 is AABB in world space
            mesh.updateMatrixWorld();
            const box = new THREE.Box3().setFromObject(mesh);

            this.platforms.push({
                mesh: mesh,
                box: box,
                isGround: p.type === 'ground'
            });
        });
    }

    setupSpawners(spawnerData) {
        // Clone data so we can modify 'spawned' state
        this.spawners = spawnerData.map(s => ({ ...s, spawned: false }));
    }

    update(dt) {
        if (!this.game.player) return;

        const playerX = this.game.player.position.x;

        // Check spawners
        this.spawners.forEach(s => {
            if (s.spawned) return;

            // Trigger when player gets close (from left)
            if (Math.abs(s.x - playerX) < s.triggerDist) {
                this.spawnEnemy(s);
                s.spawned = true;
            }
        });

        // Check Victory Input
        if (this.waitingForInput) {
            const input = this.game.inputManager;
            // Check R key (Keyboard) or A/X button (Gamepad)
            if (input.keys.get('KeyR') || input.isJustPressed('jump') || input.isJustPressed('attackPrimary')) {
                this.waitingForInput = false;
                this.advanceLevel();
            }
        }

        // Check Victory Input
        if (this.waitingForInput) {
            const input = this.game.inputManager;
            if (input.keys.get('KeyR') || input.isJustPressed('jump') || input.isJustPressed('attackPrimary')) {
                this.waitingForInput = false;
                this.advanceLevel();
            }
        }

        // Check Level End (Only if NO boss)
        if (this.currentLevel && !this.currentLevel.hasBoss) {
            const lastPlat = this.currentLevel.platforms[this.currentLevel.platforms.length - 1];
            const levelEndX = lastPlat.x + (lastPlat.w / 2);

            if (playerX > levelEndX - 5) {
                this.triggerVictory();
            }
        }
    }

    triggerVictory() {
        if (this.victoryTriggered) return;
        this.victoryTriggered = true;

        if (this.game && this.game.audio) this.game.audio.playSound('victory');

        console.log("🏆 Level Complete!");
        const ui = document.getElementById('victory-screen');
        const instruction = document.getElementById('victory-instruction');
        const title = document.getElementById('victory-title');

        if (ui) {
            const nextLevel = (this.currentLevel && this.currentLevel.nextLevel);

            if (title) {
                title.textContent = nextLevel ? "VICTORY" : "YOU WON THE GAME!";
            }

            if (instruction) {
                instruction.textContent = nextLevel
                    ? "Press 'R' or [A] to Continue"
                    : "Press 'R' or [A] to Return to Start";
            }
            ui.classList.remove('hidden');
        }

        // Delay input acceptance
        setTimeout(() => {
            this.waitingForInput = true;
        }, 1000);
    }

    advanceLevel() {
        const victoryUI = document.getElementById('victory-screen');
        if (victoryUI) victoryUI.classList.add('hidden');

        // Check for Next Level
        if (this.currentLevel && this.currentLevel.nextLevel) {
            const nextId = this.currentLevel.nextLevel;
            console.log(`➡️ Advancing to Level: ${nextId}`);

            this.loadLevel(nextId);

            // Reset Player for new level
            if (this.game.player) {
                this.game.player.setPosition(0, 5, 0);
                this.game.player.velocity.set(0, 0, 0);
                this.game.player.health = this.game.player.maxHealth;
                this.game.player.isDead = false;
                this.game.player.fsm.changeState('IDLE');
                if (this.game.player.updateHealthUI) this.game.player.updateHealthUI();
            }
            this.victoryTriggered = false;
        } else {
            // No next level -> Restart Game
            if (this.game && this.game.restartGame) {
                this.game.restartGame();
            } else {
                location.reload();
            }
        }
    }

    spawnEnemy(spawnerInfo) {
        // Determine Y position (raycast or check platforms at that X)
        let spawnY = 0;
        // Find highest platform at spawner x
        const platform = this.findGroundAt(spawnerInfo.x);
        if (platform) {
            spawnY = platform.box.max.y;
        } else {
            // Fallback for pits logic (maybe spawn in air?)
            spawnY = 5;
        }

        const config = GameConfig.enemies[spawnerInfo.type];
        if (config) {
            console.log(`💀 Spawning ${config.name} at ${spawnerInfo.x}, ${spawnY}`);

            let enemy;
            if (spawnerInfo.type === 'ogreBoss') {
                enemy = new Ogre(this.scene, config, spawnerInfo.x, spawnY, this.game);
            } else if (spawnerInfo.type === 'orcWarlord') {
                enemy = new OrcWarlord(this.scene, config, spawnerInfo.x, spawnY, this.game);
            } else if (spawnerInfo.type.startsWith('orc')) {
                enemy = new Orc(this.scene, config, spawnerInfo.x, spawnY, this.game);
            } else if (spawnerInfo.type === 'gargoyle') {
                enemy = new Gargoyle(this.scene, config, spawnerInfo.x, spawnY, this.game);
            } else if (spawnerInfo.type === 'goleling') {
                enemy = new Goleling(this.scene, config, spawnerInfo.x, spawnY, this.game);
            } else {
                enemy = new Ghoul(this.scene, config, spawnerInfo.x, spawnY, this.game);
            }

            this.game.enemies.push(enemy);
        }
    }

    /**
     * Check simple collision for an entity (Player/Enemy)
     * Returns true if grounded and updates entity Y position/Velocity
     */
    checkGroundCollision(entity) {
        const colliderWidth = 0.4; // Approximated

        // Check if we are landing on any platform
        // We only collide if:
        // 1. We are falling (velocity.y <= 0)
        // 2. Our feet are close to platform top
        // 3. We are within X/Z bounds

        if (entity.velocity.y > 0) return false;

        const feetPos = new THREE.Vector3(entity.position.x, entity.position.y, 0);
        let groundedPlatform = null;

        for (const p of this.platforms) {
            const box = p.box;

            // X Check
            if (feetPos.x + colliderWidth < box.min.x || feetPos.x - colliderWidth > box.max.x) continue;

            // Y Check (Feet slightly above or inside top face)
            // snapDistance: how far down we snap to ground
            const snapDistance = 0.5;
            const yDiff = feetPos.y - box.max.y;

            if (yDiff >= -0.1 && yDiff < snapDistance) {
                groundedPlatform = p;
                break; // Found highest? Technically should sort by Y if overlapping
            }
        }

        if (groundedPlatform) {
            entity.position.y = groundedPlatform.box.max.y;
            entity.velocity.y = 0;
            return true;
        }

        return false;
    }

    checkWallCollision(entity) {
        const colliderWidth = 0.4; // Half-width
        const colliderHeight = 1.5; // Height to check against walls

        // Construct player AABB
        const minX = entity.position.x - colliderWidth;
        const maxX = entity.position.x + colliderWidth;
        const minY = entity.position.y + 0.1; // Lift slightly to avoid floor friction
        const maxY = entity.position.y + colliderHeight;

        for (const p of this.platforms) {
            // Optimization: If platform is ground (y=0) and we are above it, skip?
            // Or simple AABB check
            const box = p.box;

            // Check overlap
            if (maxX > box.min.x && minX < box.max.x &&
                maxY > box.min.y && minY < box.max.y) {

                // Determine overlaps
                const overlapX = Math.min(maxX, box.max.x) - Math.max(minX, box.min.x);
                const overlapY = Math.min(maxY, box.max.y) - Math.max(minY, box.min.y);

                // If overlapY is significant, it's a wall hit.
                // If overlapY is tiny, it might be feet clipping floor - ignore
                if (overlapY > 0.2) {
                    // Resolve X
                    if (entity.position.x < (box.min.x + box.max.x) / 2) {
                        // Push Left
                        entity.position.x = box.min.x - colliderWidth - 0.001;
                    } else {
                        // Push Right
                        entity.position.x = box.max.x + colliderWidth + 0.001;
                    }
                    entity.velocity.x = 0;
                }
            }
        }
    }

    // Helper to find ground height at specific X (for spawning)
    findGroundAt(x) {
        let bestP = null;
        for (const p of this.platforms) {
            if (x >= p.box.min.x && x <= p.box.max.x) {
                if (!bestP || p.box.max.y > bestP.box.max.y) {
                    bestP = p;
                }
            }
        }
        return bestP;
    }

    showLevelTitle(name) {
        const overlay = document.getElementById('level-title-overlay');
        const text = document.getElementById('level-title-text');
        if (overlay && text) {
            text.textContent = name;
            overlay.classList.remove('hidden');
            overlay.classList.remove('minimized'); // Reset to center

            if (this.titleTimeout) clearTimeout(this.titleTimeout);

            this.titleTimeout = setTimeout(() => {
                overlay.classList.add('minimized');
            }, 3000);
        }
    }
}
