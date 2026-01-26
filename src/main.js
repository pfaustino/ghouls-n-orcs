/**
 * Ghouls n Orcs - Main Entry Point
 * 
 * A 2.5D side-scrolling action platformer built with three.js.
 * This module initializes the game engine, scene, and core systems.
 * 
 * Architecture Overview:
 * - Game class orchestrates the main loop and system coordination
 * - Scene setup uses orthographic/narrow-FOV perspective for 2.5D view
 * - ES modules for clean dependency management
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { SceneManager } from './core/SceneManager.js';
import { LevelManager } from './core/LevelManager.js';
import { ParticleManager } from './core/ParticleManager.js';
import { InputManager } from './core/InputManager.js';
import { Player } from './entities/Player.js';
import { GameConfig } from './config/GameConfig.js';
import { Ghoul } from './entities/Ghoul.js';

/**
 * Main Game Class
 * Orchestrates all game systems and manages the core game loop.
 */
class Game {
    constructor() {
        // Core three.js components
        this.renderer = null;
        this.scene = null;
        this.camera = null;

        // Game systems
        this.sceneManager = null;
        this.levelManager = null;
        this.particleManager = null;
        this.inputManager = null;

        // Entities
        this.player = null;
        this.enemies = [];
        this.projectiles = [];

        // Timing
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
        this.fixedTimeStep = 1 / 60; // 60 FPS physics
        this.accumulator = 0;

        // State
        this.isRunning = false;
        this.isPaused = false;

        // Debug
        this.debugMode = false;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.currentFPS = 60;

        // Effects
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.shakeOffset = new THREE.Vector3();
    }

    /**
     * Initialize all game systems
     */
    async init() {
        console.log('🎮 Ghouls n Orcs - Initializing...');

        try {
            // Update loading text
            this.updateLoadingProgress(10, 'Setting up renderer...');
            await this.initRenderer();

            this.updateLoadingProgress(30, 'Creating scene...');
            await this.initScene();

            this.updateLoadingProgress(50, 'Loading assets...');
            await this.loadAssets();

            this.updateLoadingProgress(70, 'Setting up input...');
            this.initInput();

            this.updateLoadingProgress(90, 'Spawning player...');
            await this.initEntities();

            this.updateLoadingProgress(100, 'Ready!');

            // Small delay to show completion
            await new Promise(resolve => setTimeout(resolve, 500));

            // Hide loading screen
            document.getElementById('loading-screen').classList.add('hidden');

            // Start the game loop
            this.isRunning = true;
            this.gameLoop();

            console.log('✅ Game initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.updateLoadingProgress(0, `Error: ${error.message}`);
        }
    }

    /**
     * Update loading progress bar and text
     */
    updateLoadingProgress(percent, text) {
        const loadingBar = document.getElementById('loading-bar');
        const loadingText = document.getElementById('loading-text');

        if (loadingBar) loadingBar.style.width = `${percent}%`;
        if (loadingText) loadingText.textContent = text;
    }

    /**
     * Initialize the WebGL renderer
     */
    async initRenderer() {
        const container = document.getElementById('game-container');

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(GameConfig.rendering.clearColor);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        container.appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Initialize the scene and camera for 2.5D side-view
     */
    async initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(GameConfig.rendering.clearColor);

        // Add fog for depth
        this.scene.fog = new THREE.Fog(
            GameConfig.rendering.fogColor,
            GameConfig.rendering.fogNear,
            GameConfig.rendering.fogFar
        );

        // Create SceneManager for environment, lighting, and parallax
        this.sceneManager = new SceneManager(this.scene);
        await this.sceneManager.init();

        // Init Level Manager
        this.levelManager = new LevelManager(this);
        this.levelManager.loadLevel('graveyard');

        // Init Particles
        this.particleManager = new ParticleManager(this.scene);

        // Setup camera - using perspective with narrow FOV for subtle depth
        // This gives us the 2.5D look while maintaining some parallax
        this.camera = new THREE.PerspectiveCamera(
            GameConfig.camera.fov,
            window.innerWidth / window.innerHeight,
            GameConfig.camera.near,
            GameConfig.camera.far
        );

        // Position camera for side-view
        // X: will follow player, Y: slightly above ground, Z: viewing distance
        this.camera.position.set(0, GameConfig.camera.height, GameConfig.camera.distance);
        this.camera.lookAt(0, GameConfig.camera.lookAtHeight, 0);
    }

    /**
     * Load all game assets (models, textures, audio)
     */
    async loadAssets() {
        // For now, we'll use procedural placeholder models
        // This will be replaced with glTF loading later
        console.log('📦 Loading assets (using placeholders for now)');

        // Simulate loading time for demonstration
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    /**
     * Initialize input handling
     */
    initInput() {
        this.inputManager = new InputManager();

        // Debug mode toggle
        this.inputManager.on('debug', () => {
            this.debugMode = !this.debugMode;
            const debugPanel = document.getElementById('debug-info');
            if (debugPanel) {
                debugPanel.style.display = this.debugMode ? 'block' : 'none';
            }
        });

        // Pause toggle
        this.inputManager.on('pause', () => {
            this.isPaused = !this.isPaused;
            console.log(this.isPaused ? '⏸️ Game Paused' : '▶️ Game Resumed');
        });
    }

    /**
     * Initialize game entities (player, enemies, etc.)
     */
    async initEntities() {
        // Create player
        this.player = new Player(this.scene, this.inputManager, this);
        await this.player.init();

        // Position player at spawn point
        this.player.setPosition(0, 5, 0); // Start high to drop in

        // Spawn a test enemy
        // this.spawnTestEnemy(); // Handled by LevelManager now
    }

    /**
     * Spawn a test enemy for development
     */
    spawnTestEnemy() {
        if (!GameConfig.enemies.ghoulShambling) {
            console.warn('⚠️ Ghoul config not found, skipping enemy spawn');
            return;
        }

        const x = 8;
        const y = 0;
        const config = GameConfig.enemies.ghoulShambling;

        const enemy = new Ghoul(this.scene, config, x, y, this);
        this.enemies.push(enemy);
    }

    /**
     * Main game loop using fixed timestep for physics
     */
    gameLoop() {
        if (!this.isRunning) return;

        requestAnimationFrame(() => this.gameLoop());

        // Calculate delta time
        this.deltaTime = Math.min(this.clock.getDelta(), 0.1); // Cap at 100ms

        // Skip update if paused
        if (this.isPaused) {
            this.render();
            return;
        }

        // Fixed timestep accumulator for physics
        this.accumulator += this.deltaTime;

        while (this.accumulator >= this.fixedTimeStep) {
            this.fixedUpdate(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }

        // Variable timestep update for animation/visuals
        this.update(this.deltaTime);

        // Render
        this.render();

        // Update FPS counter
        this.updateFPS(this.deltaTime);

        // Clear input states for next frame
        this.inputManager.endFrame();
    }

    /**
     * Spawn a new projectile
     */
    spawnProjectile(config, x, y, direction, owner) {
        import('./entities/Projectile.js').then(({ Projectile }) => {
            const projectile = new Projectile(this.scene, config, x, y, direction, owner);
            this.projectiles.push(projectile);
        });
    }

    /**
     * Fixed timestep update - used for physics and game logic
     * @param {number} dt - Fixed delta time (1/60)
     */
    fixedUpdate(dt) {
        // Update player physics
        if (this.player) {
            this.player.fixedUpdate(dt);
        }

        // Update enemies
        for (const enemy of this.enemies) {
            enemy.fixedUpdate(dt);
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.fixedUpdate(dt);

            if (!p.isActive) {
                this.projectiles.splice(i, 1);
            }
        }

        // Collision detection
        this.checkCollisions();
    }

    /**
     * Variable timestep update - used for animations and visuals
     * @param {number} dt - Variable delta time
     */
    update(dt) {
        // Update player animations
        if (this.player) {
            this.player.update(dt);

            // Camera follows player
            this.updateCamera(dt);
        }

        // Update scene (parallax, effects)
        this.sceneManager.update(dt, this.player?.position.x || 0);

        // Update Level (Spawners)
        if (this.levelManager) {
            this.levelManager.update(dt);
        }

        // Update Particles
        if (this.particleManager) {
            this.particleManager.update(dt);
        }

        // Update Shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            const damp = this.shakeTimer > 0 ? (this.shakeTimer / 0.5) : 0; // Simple damping
            this.shakeOffset.set(
                (Math.random() - 0.5) * this.shakeIntensity * damp,
                (Math.random() - 0.5) * this.shakeIntensity * damp,
                0
            );
        } else {
            this.shakeOffset.set(0, 0, 0);
        }

        // Update debug display
        if (this.debugMode) {
            this.updateDebugDisplay();
        }
    }

    /**
     * Update camera to follow player
     */
    updateCamera(dt) {
        if (!this.player) return;

        // X Axis Targets
        const targetX = this.player.position.x +
            (this.player.facingRight ? GameConfig.camera.leadOffset : -GameConfig.camera.leadOffset);

        // Y Axis Targets
        // Camera maintains relative height to player
        // We clamp the target Y so the camera doesn't go below ground level if we want, 
        // but for vertical levels we generally want it to follow.
        // Let's treat y= -2 as a "floor" for camera target to avoid looking at underbellies too much
        const clampedPlayerY = Math.max(-2, this.player.position.y);
        const targetY = clampedPlayerY + GameConfig.camera.height;

        const weight = GameConfig.camera.smoothSpeed * dt * 60;

        // Smooth X
        this.camera.position.x = THREE.MathUtils.lerp(
            this.camera.position.x,
            targetX,
            weight
        );

        // Smooth Y
        this.camera.position.y = THREE.MathUtils.lerp(
            this.camera.position.y,
            targetY,
            weight
        );

        // Maintain constant look angle (Pitch)
        // derived from config: difference between camera height and lookAt height
        const pitchOffset = GameConfig.camera.height - GameConfig.camera.lookAtHeight;
        const currentLookAtY = this.camera.position.y - pitchOffset;

        this.camera.lookAt(
            this.camera.position.x,
            currentLookAtY,
            0
        );

        // Apply Screenshake
        this.camera.position.add(this.shakeOffset);
    }

    shakeCamera(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    /**
     * Check all collision pairs
     */
    checkCollisions() {
        // 1. Projectiles vs Enemies
        for (const p of this.projectiles) {
            if (!p.isActive) continue;

            p.mesh.updateMatrixWorld();
            const pBox = new THREE.Box3().setFromObject(p.mesh);

            if (p.owner === 'player') {
                for (const enemy of this.enemies) {
                    if (!enemy.isActive) continue;

                    enemy.mesh.updateMatrixWorld();
                    const eBox = enemy.getBounds();

                    if (pBox.intersectsBox(eBox)) {
                        console.log(`🎯 Hit ${enemy.config.name} for ${p.config.damage} damage!`);

                        // Effects
                        this.particleManager.emit({
                            position: enemy.position,
                            count: 8,
                            color: 'blood',
                            scale: 1.5
                        });
                        this.shakeCamera(0.2, 0.2);

                        enemy.takeDamage(p.config.damage);
                        p.destroy();
                        break;
                    }
                }
            }
        }

        // 2. Player vs Enemies (Touch Damage)
        if (this.player && !this.player.isInvincible) {
            this.player.mesh.updateMatrixWorld();
            // Use specific body mesh for tighter hitbox if available, else whole group
            const pBox = new THREE.Box3().setFromObject(this.player.bodyMesh || this.player.mesh);
            pBox.expandByScalar(-0.1); // Slightly forgiving hitbox

            for (const enemy of this.enemies) {
                if (!enemy.isActive) continue;

                enemy.mesh.updateMatrixWorld();
                const eBox = enemy.getBounds();
                eBox.expandByScalar(-0.1);

                if (pBox.intersectsBox(eBox)) {
                    this.particleManager.emit({
                        position: this.player.position,
                        count: 15,
                        color: 'blood',
                        scale: 2.0
                    });
                    this.shakeCamera(0.5, 0.4); // Harder shake
                    this.player.takeDamage(enemy.config.damage || 1);
                }
            }
        }
    }

    /**
     * Render the scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Update FPS counter
     */
    updateFPS(dt) {
        this.frameCount++;
        this.fpsTimer += dt;

        if (this.fpsTimer >= 1) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
    }

    /**
     * Update debug display
     */
    updateDebugDisplay() {
        if (!this.player) return;

        const stateEl = document.getElementById('debug-state');
        const posEl = document.getElementById('debug-position');
        const velEl = document.getElementById('debug-velocity');
        const fpsEl = document.getElementById('debug-fps');

        if (stateEl) stateEl.textContent = `State: ${this.player.currentState}`;
        if (posEl) posEl.textContent = `Pos: ${this.player.position.x.toFixed(2)}, ${this.player.position.y.toFixed(2)}`;
        if (velEl) velEl.textContent = `Vel: ${this.player.velocity.x.toFixed(2)}, ${this.player.velocity.y.toFixed(2)}`;
        if (fpsEl) fpsEl.textContent = `FPS: ${this.currentFPS}`;
    }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();

    // Expose game instance for debugging
    window.game = game;
});
