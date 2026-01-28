/**
 * GameConfig.js
 * 
 * Central configuration for all game parameters.
 * Organized by system for easy tuning and balancing.
 */

export const GameConfig = {
    // ===========================================
    // RENDERING & CAMERA
    // ===========================================
    rendering: {
        clearColor: 0x0a0a15,      // Dark gothic background
        fogColor: 0x0a0a15,
        fogNear: 15,
        fogFar: 50
    },

    camera: {
        // Using perspective with narrow FOV for 2.5D effect
        fov: 35,                   // Narrow FOV reduces perspective distortion
        near: 0.1,
        far: 500,
        distance: 12,              // Distance from play plane (Z axis)
        height: 3,                 // Camera Y position
        lookAtHeight: 1.5,         // What Y level the camera looks at
        leadOffset: 1.5,           // How far to lead the camera in facing direction
        smoothSpeed: 0.08          // Camera follow smoothing (0-1)
    },

    // ===========================================
    // PLAYER PHYSICS & MOVEMENT
    // ===========================================
    player: {
        // Movement
        runSpeed: 6.0,             // Units per second
        acceleration: 40,          // How quickly player reaches max speed
        deceleration: 35,          // How quickly player stops

        // Jump physics (fixed arc, committed)
        jumpVelocity: 10,           // Initial upward velocity
        gravity: 28,               // Gravity acceleration
        maxFallSpeed: 18,          // Terminal velocity
        jumpCutMultiplier: 0.5,    // Velocity multiplier when releasing jump early
        airControlMultiplier: 0.3, // Reduced air control for committed jumps

        // Animation timing (in seconds)
        jumpSquatDuration: 0.05,   // Brief "windup" before leaving ground
        landingLag: 0.1,           // Recovery frames after landing

        // Combat
        maxArmor: 3,               // Armor pieces before death
        invincibilityDuration: 1.5, // Seconds of i-frames after hit
        knockbackForce: 4
    },

    // ===========================================
    // ATTACKS & WEAPONS
    // ===========================================
    attacks: {
        // Light attack (throw)
        throw: {
            anticipation: 0.08,     // Wind-up duration
            active: 0.05,           // Projectile spawn window
            recovery: 0.15,         // Follow-through
            projectileSpeed: 14,
            maxOnScreen: 2          // GnG-style projectile limit
        },

        // Heavy attack (melee)
        heavy: {
            anticipation: 0.18,     // Longer wind-up for power
            active: 0.1,            // Hitbox active duration
            recovery: 0.3,          // Punishable recovery
            damage: 2,
            knockback: 3,
            range: 1.8
        }
    },

    // ===========================================
    // WEAPONS DATA
    // ===========================================
    weapons: {
        spear: {
            name: 'Spear',
            damage: 1,
            speed: 14,
            fireRate: 0.4,          // Seconds between throws
            trajectory: 'straight',
            sprite: 'spear'
        },
        knife: {
            name: 'Throwing Knives',
            damage: 0.5,
            speed: 18,
            fireRate: 0.2,
            trajectory: 'straight',
            sprite: 'knife'
        },
        axe: {
            name: 'War Axe',
            damage: 2,
            speed: 10,
            fireRate: 0.6,
            trajectory: 'arc',
            arcHeight: 2,
            sprite: 'axe'
        },
        torch: {
            name: 'Cursed Torch',
            damage: 1,
            speed: 8,
            fireRate: 0.8,
            trajectory: 'lob',
            lingerDuration: 2,
            sprite: 'torch'
        }
    },

    // ===========================================
    // ENEMIES
    // ===========================================
    enemies: {
        // Ghouls (basic fodder)
        ghoulShambling: {
            name: 'Shambling Ghoul',
            health: 1,
            speed: 1.5,
            damage: 1,
            detectionRange: 8,
            attackRange: 1.2,
            telegraphDuration: 0.5,  // Clear warning before attack
            attackDuration: 0.15,
            recoveryDuration: 0.6    // Punish window
        },

        ghoulCrawler: {
            name: 'Crawler',
            health: 1,
            speed: 2,
            damage: 1,
            detectionRange: 5,
            attackRange: 0.8,
            telegraphDuration: 0.3,
            attackDuration: 0.1,
            recoveryDuration: 0.4,
            lowProfile: true         // Ducked hitbox
        },

        // Orcs (elite)
        orcGrunt: {
            name: 'Grunt Orc',
            health: 3,
            speed: 2,
            damage: 2,
            detectionRange: 10,
            attackRange: 1.5,
            telegraphDuration: 0.6,
            attackDuration: 0.2,
            recoveryDuration: 0.8,
            hasShield: true,
            shieldAngles: { min: -45, max: 45 } // Blocks frontal attacks
        },

        orcBerserker: {
            name: 'Berserker Orc',
            health: 2,
            speed: 4,
            damage: 3,
            detectionRange: 12,
            attackRange: 2,
            telegraphDuration: 0.8,  // Big windup
            attackDuration: 0.15,
            recoveryDuration: 1.2    // Very punishable
        },

        // Flying
        gargoyle: {
            name: 'Stone Gargoyle',
            health: 2,
            speed: 3.5,
            damage: 1,
            detectionRange: 12,
            attackRange: 4,
            telegraphDuration: 0.5,
            attackDuration: 1.0,  // Swoop duration
            recoveryDuration: 1.5,
            isFlying: true
        },

        // Boss
        orcWarlord: {
            name: 'Ironbound Warlord',
            health: 40,
            speed: 2.0,
            chargeSpeed: 9.0,
            damage: 2, // 1 heart usually, maybe 2 creates tension
            detectionRange: 20,
            attackRange: 3.5, // Giant reach
            telegraphDuration: 1.2,
            attackDuration: 0.4,
            recoveryDuration: 2.5,
            hasShield: true,
            shieldAngles: { min: -60, max: 60 },
            isBoss: true
        }
    },

    // ===========================================
    // HITBOXES & HURTBOXES
    // ===========================================
    collision: {
        // Player hitbox (for receiving damage)
        playerHurtbox: {
            width: 0.6,
            height: 1.8,
            offset: { x: 0, y: 0.9 }  // Offset from feet
        },

        playerCrouchHurtbox: {
            width: 0.6,
            height: 1.0,
            offset: { x: 0, y: 0.5 }
        },

        // These will be defined per-animation frame for precise timing
        attackHitboxes: {
            heavySwing: {
                width: 1.5,
                height: 1.2,
                offset: { x: 0.8, y: 1.0 }  // In front of player, chest height
            }
        }
    },

    // ===========================================
    // ANIMATION STATES
    // ===========================================
    states: {
        player: [
            'IDLE',
            'RUN',
            'JUMP_SQUAT',    // Pre-jump crouch
            'JUMP_RISE',
            'JUMP_FALL',
            'LAND',
            'CROUCH',
            'ATTACK_THROW',
            'ATTACK_HEAVY',
            'HIT_REACTION',
            'DEATH'
        ],

        enemy: [
            'IDLE',
            'PATROL',
            'PURSUE',
            'ATTACK_TELEGRAPH',
            'ATTACK_ACTIVE',
            'ATTACK_RECOVERY',
            'HIT_STAGGER',
            'DEATH'
        ]
    },

    // ===========================================
    // LEVELS & WORLD
    // ===========================================
    world: {
        gravity: 28,
        groundLevel: 0,
        parallaxLayers: [
            { depth: -70, speedMultiplier: 0.1, color: 0x1a0a1a },  // Far background
            { depth: -40, speedMultiplier: 0.3, color: 0x2a1a2a },  // Mid background
            { depth: -20, speedMultiplier: 0.5, color: 0x3a2a3a }   // Near background
        ]
    }
};
