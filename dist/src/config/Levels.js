
export const Levels = {
    graveyard: {
        id: 'graveyard',
        name: 'Graveyard Outskirts',
        length: 450,
        hasBoss: true,
        platforms: [
            // =========================================
            // SECTION 1: GRAVEYARD (x: 0 - 100)
            // =========================================
            { x: -10, y: -1, w: 40, h: 2, d: 10, type: 'ground' }, // Start
            { x: 17, y: 0, w: 8, h: 1, d: 5, type: 'platform' },

            // Staircase up
            { x: 26, y: 1.0, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 34, y: 2.0, w: 6, h: 1, d: 5, type: 'platform' },

            // Long bridge
            { x: 50, y: 2.0, w: 20, h: 1, d: 5, type: 'platform' },

            // Lower pit area
            { x: 75, y: -1, w: 30, h: 2, d: 10, type: 'ground' },

            // Step out of pit
            { x: 92, y: 0.5, w: 6, h: 1, d: 5, type: 'platform' },

            // =========================================
            // SECTION 2: ORC OUTPOST (x: 100 - 180)
            // =========================================
            { x: 100, y: 1.5, w: 15, h: 1, d: 5, type: 'platform' },
            { x: 125, y: 0, w: 40, h: 2, d: 10, type: 'ground' }, // Main Camp

            // Watchtower
            { x: 146, y: 1.2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 151, y: 2.4, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 155, y: 3.5, w: 10, h: 1, d: 5, type: 'platform' },

            // Descent
            { x: 168, y: 1.5, w: 8, h: 1, d: 5, type: 'platform' },
            { x: 176, y: 1.0, w: 6, h: 1, d: 5, type: 'platform' }, // Added bridge

            // =========================================
            // SECTION 3: THE CRUMBLING BRIDGE (x: 180 - 280)
            // Challenge: Precise jumping over death pits
            // =========================================
            { x: 185, y: 0, w: 10, h: 2, d: 10, type: 'ground' }, // Save point before jumps

            // Bridge Gap Fix
            { x: 192.5, y: 0.5, w: 6, h: 1, d: 5, type: 'platform' },

            // Floating Platforms
            { x: 200, y: 1.0, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 206, y: 0.5, w: 5, h: 1, d: 5, type: 'platform' }, // Added to bridge gap
            { x: 212, y: 0.0, w: 5, h: 1, d: 5, type: 'platform' }, // Low dip
            { x: 218, y: 1.0, w: 5, h: 1, d: 5, type: 'platform' }, // Bridge high jump
            { x: 224, y: 2.0, w: 5, h: 1, d: 5, type: 'platform' }, // High jump
            { x: 230, y: 1.8, w: 5, h: 1, d: 5, type: 'platform' }, // Bridge high gap
            { x: 236, y: 1.5, w: 5, h: 1, d: 5, type: 'platform' },

            // Bridge Fix (x238 gap)
            { x: 243, y: 1.5, w: 6, h: 1, d: 5, type: 'platform' },

            // Mid-bridge Safety
            { x: 250, y: 1.5, w: 15, h: 1, d: 5, type: 'platform' },

            // Bridge Gap Fix 2
            { x: 257.5, y: 2.0, w: 6, h: 1, d: 5, type: 'platform' },

            // More Jumps
            { x: 265, y: 2.5, w: 5, h: 1, d: 5, type: 'platform' },
            { x: 270, y: 1.8, w: 5, h: 1, d: 5, type: 'platform' }, // Added to fix 4.5 gap
            { x: 275, y: 1.0, w: 6, h: 1, d: 5, type: 'platform' },

            // Forest Entry Fix
            { x: 285, y: 0.5, w: 6, h: 1, d: 5, type: 'platform' },

            // =========================================
            // SECTION 4: HAUNTED FOREST (x: 280 - 370)
            // Challenge: Uneven terrain + Ambushes
            // =========================================
            { x: 292, y: 0, w: 30, h: 2, d: 10, type: 'ground' }, // Forest Entry

            // Tree platforms (Simulated)
            { x: 305, y: 1.8, w: 8, h: 1, d: 5, type: 'platform' }, // Lowered from 2.5
            { x: 315, y: 1.2, w: 8, h: 1, d: 5, type: 'platform' }, // Added to fix wide gap
            { x: 325, y: 2.5, w: 8, h: 1, d: 5, type: 'platform' }, // Adjusted progression

            { x: 335, y: -0.5, w: 40, h: 2, d: 10, type: 'ground' }, // Low ground path

            // Climb Out Fix
            { x: 350, y: 0.2, w: 6, h: 1, d: 5, type: 'platform' },

            // Final Steps
            { x: 360, y: 1.0, w: 10, h: 1, d: 5, type: 'platform' },
            { x: 370, y: 2.0, w: 6, h: 1, d: 5, type: 'platform' },

            // =========================================
            // SECTION 5: BOSS ARENA (x: 390+)
            // =========================================
            { x: 390, y: 0, w: 40, h: 2, d: 10, type: 'ground' }
        ],
        spawners: [
            // --- SECTION 1 ---
            { x: 15, type: 'ghoulShambling', triggerDist: 15 },
            { x: 30, type: 'ghoulShambling', triggerDist: 15 },
            { x: 38, type: 'ghoulCrawler', triggerDist: 12 },
            { x: 50, type: 'ghoulShambling', triggerDist: 15 },
            { x: 72, type: 'ghoulCrawler', triggerDist: 12 },
            { x: 78, type: 'ghoulShambling', triggerDist: 12 },
            { x: 85, type: 'ghoulShambling', triggerDist: 12 },

            // --- SECTION 2 ---
            { x: 100, type: 'ghoulShambling', triggerDist: 15 },
            { x: 120, type: 'orcGrunt', triggerDist: 20 },
            { x: 128, type: 'ghoulShambling', triggerDist: 12 },
            { x: 135, type: 'orcGrunt', triggerDist: 15 },
            { x: 148, type: 'ghoulCrawler', triggerDist: 10 },
            { x: 155, type: 'orcBerserker', triggerDist: 18 }, // Tower Guard
            { x: 175, type: 'ghoulShambling', triggerDist: 15 },

            // --- SECTION 3 (Bridge) ---
            // Enemies placed on platforms to make jumping harder
            { x: 200, type: 'ghoulShambling', triggerDist: 14 },
            { x: 224, type: 'ghoulShambling', triggerDist: 14 }, // On high platform
            { x: 250, type: 'orcGrunt', triggerDist: 16 }, // Blocking the safe path
            { x: 265, type: 'ghoulCrawler', triggerDist: 12 },

            // --- SECTION 4 (Forest) ---
            { x: 290, type: 'orcBerserker', triggerDist: 18 }, // Fast aggressive welcome
            { x: 305, type: 'ghoulCrawler', triggerDist: 15 }, // Tree sniper
            { x: 315, type: 'ghoulShambling', triggerDist: 12 },
            { x: 325, type: 'orcGrunt', triggerDist: 15 },
            { x: 340, type: 'ghoulShambling', triggerDist: 15 },
            { x: 345, type: 'ghoulCrawler', triggerDist: 15 },
            { x: 350, type: 'orcBerserker', triggerDist: 20 }, // Pre-boss mini-boss

            // --- BOSS ---
            { x: 400, type: 'orcWarlord', triggerDist: 30 }
        ],
        nextLevel: 'crypt'
    },

    crypt: {
        id: 'crypt',
        name: 'The Haunted Crypt',
        length: 500,
        hasBoss: true,
        platforms: [
            // =========================================
            // START: DESCENT (x: 0 - 50)
            // =========================================
            { x: -5, y: -1, w: 20, h: 2, d: 10, type: 'ground' }, // Entry (y=0 surface)

            // Bridge Descent Gap (Fix 9 unit chasm)
            { x: 9, y: -1.5, w: 10, h: 1, d: 5, type: 'platform' },

            // Stairs down
            { x: 18, y: -2, w: 8, h: 2, d: 10, type: 'ground' },   // y=-1
            { x: 28, y: -3, w: 8, h: 2, d: 10, type: 'ground' },   // y=-2
            { x: 38, y: -4, w: 8, h: 2, d: 10, type: 'ground' },   // y=-3
            { x: 48, y: -5, w: 8, h: 2, d: 10, type: 'ground' },   // y=-4

            // =========================================
            // SECTION 1: HALL OF PILLARS (x: 50 - 120)
            // =========================================
            // Floor is low (-4 surface)
            { x: 70, y: -5, w: 30, h: 2, d: 10, type: 'ground' },

            // Pillar Platforms
            { x: 60, y: -3, w: 4, h: 1, d: 5, type: 'platform' }, // Lowered to fix collision/jump
            { x: 70, y: -3, w: 4, h: 1, d: 5, type: 'platform' },
            { x: 80, y: -3, w: 4, h: 1, d: 5, type: 'platform' },

            // Transition to Pit
            { x: 92.5, y: -5, w: 15, h: 2, d: 10, type: 'ground' },

            // =========================================
            // SECTION 2: THE ABYSS (x: 100 - 180)
            // Floating platforms over death drop
            // =========================================

            // Gap 1: From x95 (Edge 100). Target x106 (w6, edge 103). Gap 3.
            { x: 105, y: -4, w: 6, h: 1, d: 5, type: 'platform' },

            // Gap 2: From 109 to 115 (w6, edge 112). Gap 3.
            { x: 114, y: -4, w: 6, h: 1, d: 5, type: 'platform' },

            // Step Up: To 123, y-3. Height diff 1. Gap 2 (Safe).
            { x: 123, y: -3, w: 6, h: 1, d: 5, type: 'platform' },

            // To 131, y-2. Gap 2 (Safe).
            { x: 131, y: -2, w: 6, h: 1, d: 5, type: 'platform' },

            // Intermediate drop platform
            { x: 140, y: -4, w: 6, h: 1, d: 5, type: 'platform' },

            // Long Drop down to Landing (Safe fall)
            { x: 155, y: -6, w: 27.5, h: 2, d: 10, type: 'ground' }, // Surface -5

            // Bridge Gap (x168)
            { x: 172, y: -5.5, w: 6, h: 1, d: 5, type: 'platform' }, // Added to close gap

            // =========================================
            // SECTION 3: THE SPIKE PIT (x: 180 - 260)
            // Low platforms, strict jumps
            // =========================================
            { x: 182, y: -5, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 190, y: -5, w: 6, h: 1, d: 5, type: 'platform' }, // Gap 2
            { x: 198, y: -4, w: 6, h: 1, d: 5, type: 'platform' }, // Step up 1
            { x: 206, y: -4, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 214, y: -5, w: 6, h: 1, d: 5, type: 'platform' }, // Step down 1
            { x: 222, y: -5, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 230, y: -4, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 238, y: -3, w: 6, h: 1, d: 5, type: 'platform' }, // Step up
            { x: 246, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 254, y: -2, w: 6, h: 1, d: 5, type: 'platform' }, // Start ascent

            // =========================================
            // SECTION 4: THE CRUMBLING STAIRCASE (x: 260 - 340)
            // High verticality
            // =========================================
            { x: 262, y: -2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 270, y: -1, w: 6, h: 1, d: 5, type: 'platform' }, // Gap 2, Up 1
            { x: 278, y: 0, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 286, y: 1, w: 6, h: 1, d: 5, type: 'platform' },  // Peak
            { x: 294, y: 0, w: 6, h: 1, d: 5, type: 'platform' },  // Descent
            { x: 302, y: -1, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 310, y: -2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 318, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 326, y: -4, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 334, y: -5, w: 8, h: 1, d: 5, type: 'platform' }, // Bottom

            // =========================================
            // SECTION 5: THE BONE BRIDGE (x: 340 - 420)
            // Long segments
            // =========================================
            { x: 348, y: -5, w: 16, h: 2, d: 10, type: 'ground' }, // Base
            { x: 362, y: -5, w: 6, h: 1, d: 5, type: 'platform' }, // Connection
            { x: 374, y: -4, w: 10, h: 1, d: 5, type: 'platform' }, // Raised
            { x: 388, y: -4, w: 10, h: 1, d: 5, type: 'platform' },
            { x: 402, y: -5, w: 18, h: 1, d: 5, type: 'platform' }, // Drop

            // =========================================
            // BOSS GATE (x: 420+)
            // =========================================
            { x: 420, y: -4, w: 10, h: 1, d: 5, type: 'platform' },
            { x: 435, y: -3, w: 16, h: 1, d: 5, type: 'platform' },
            { x: 460, y: -3, w: 40, h: 2, d: 10, type: 'ground' } // Boss Arena
        ],
        spawners: [
            // Descent
            { x: 25, type: 'ghoulCrawler', triggerDist: 10 },
            { x: 40, type: 'ghoulShambling', triggerDist: 12 },

            // Pillars
            { x: 60, type: 'ghoulCrawler', triggerDist: 15 }, // On pillar
            { x: 70, type: 'orcGrunt', triggerDist: 15 }, // Patrol ground
            { x: 80, type: 'ghoulCrawler', triggerDist: 15 }, // On pillar

            // Abyss
            { x: 115, type: 'ghoulShambling', triggerDist: 10 }, // On platform
            { x: 131, type: 'orcBerserker', triggerDist: 12 }, // Ambush on high plat (moved to 131)

            // Landing
            { x: 155, type: 'orcGrunt', triggerDist: 15 },
            { x: 160, type: 'ghoulShambling', triggerDist: 10 },

            // Spike Pit (New)
            { x: 190, type: 'ghoulCrawler', triggerDist: 12 }, // Low profile enemy
            { x: 206, type: 'gargoyle', triggerDist: 15 },     // Air harassment
            { x: 222, type: 'ghoulShambling', triggerDist: 12 },
            { x: 246, type: 'orcGrunt', triggerDist: 15 },     // Blocking path

            // Staircase (New)
            { x: 270, type: 'gargoyle', triggerDist: 18 },     // High altitude
            { x: 286, type: 'orcBerserker', triggerDist: 15 }, // King of the hill
            { x: 302, type: 'ghoulCrawler', triggerDist: 12 }, // Descent ambush
            { x: 318, type: 'ghoulShambling', triggerDist: 12 },

            // Bone Bridge (New)
            { x: 348, type: 'orcGrunt', triggerDist: 15 },
            { x: 374, type: 'orcBerserker', triggerDist: 20 },
            { x: 402, type: 'ghoulCrawler', triggerDist: 12 },

            // Boss
            { x: 465, type: 'orcWarlord', triggerDist: 25 },

            // Gargoyles (Global)
            { x: 35, type: 'gargoyle', triggerDist: 15 },  // Descent
            { x: 60, type: 'gargoyle', triggerDist: 15 },  // Pillars
            { x: 70, type: 'gargoyle', triggerDist: 15 },  // Pillars
            { x: 80, type: 'gargoyle', triggerDist: 15 },
            { x: 105, type: 'gargoyle', triggerDist: 18 }, // Abyss Start
            { x: 120, type: 'gargoyle', triggerDist: 18 }, // Abyss Mid
            { x: 135, type: 'gargoyle', triggerDist: 18 }, // Abyss High
            { x: 165, type: 'gargoyle', triggerDist: 15 }, // Boss Gate (Old)
            { x: 200, type: 'gargoyle', triggerDist: 15 }, // New Section
            { x: 350, type: 'gargoyle', triggerDist: 15 }  // New Section
        ],
        nextLevel: 'mines'
    },

    mines: {
        id: 'mines',
        name: 'The Forsaken Mines',
        length: 550,
        hasBoss: true,
        platforms: [
            // =========================================
            // SECTION 1: MINE ENTRANCE (x: 0 - 80)
            // Descending into the depths
            // =========================================
            { x: -5, y: 0, w: 26, h: 2, d: 10, type: 'ground' }, // Entry platform

            // Staircase descent
            { x: 18, y: -0.5, w: 10, h: 1, d: 5, type: 'platform' },
            { x: 28, y: -1.5, w: 8, h: 1, d: 5, type: 'platform' },
            { x: 38, y: -2.5, w: 8, h: 1, d: 5, type: 'platform' },
            { x: 48, y: -3.5, w: 10, h: 2, d: 10, type: 'ground' },

            // Lower corridor
            { x: 60, y: -4, w: 20, h: 2, d: 10, type: 'ground' },

            // =========================================
            // SECTION 2: COLLAPSED TUNNELS (x: 80 - 160)
            // Tight corridors, debris
            // =========================================
            { x: 80, y: -4, w: 15, h: 2, d: 10, type: 'ground' },

            // Rubble climb
            { x: 93, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 101, y: -2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 109, y: -3, w: 6, h: 1, d: 5, type: 'platform' },

            // Tunnel floor
            { x: 118, y: -4, w: 25, h: 2, d: 10, type: 'ground' },

            // Exit climb
            { x: 138, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 146, y: -2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 154, y: -3, w: 8, h: 1, d: 5, type: 'platform' },

            // =========================================
            // SECTION 3: THE GREAT CHASM (x: 160 - 260)
            // Floating platforms over abyss
            // =========================================
            { x: 165, y: -3, w: 10, h: 2, d: 10, type: 'ground' }, // Safe spot

            // Mine cart platforms (floating)
            { x: 178, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 186, y: -2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 194, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 202, y: -4, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 210, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 218, y: -2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 226, y: -1, w: 6, h: 1, d: 5, type: 'platform' }, // Peak
            { x: 234, y: -2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 242, y: -3, w: 8, h: 1, d: 5, type: 'platform' },

            // Landing
            { x: 252, y: -4, w: 20, h: 2, d: 10, type: 'ground' },

            // =========================================
            // SECTION 4: THE LAVA WORKS (x: 260 - 360)
            // Platforms over deadly drops
            // =========================================
            { x: 270, y: -4, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 278, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 286, y: -2, w: 8, h: 1, d: 5, type: 'platform' },
            { x: 296, y: -1, w: 8, h: 1, d: 5, type: 'platform' },
            { x: 306, y: 0, w: 10, h: 2, d: 10, type: 'ground' }, // High point

            // Descent
            { x: 318, y: -1, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 326, y: -2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 334, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 342, y: -4, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 350, y: -4, w: 12, h: 2, d: 10, type: 'ground' },

            // =========================================
            // SECTION 5: THE DEEP FORGE (x: 360 - 460)
            // Long walkways, heavy combat
            // =========================================
            { x: 365, y: -4, w: 25, h: 2, d: 10, type: 'ground' }, // Main platform

            // Upper walkway
            { x: 385, y: -2, w: 8, h: 1, d: 5, type: 'platform' },
            { x: 395, y: -2, w: 8, h: 1, d: 5, type: 'platform' },

            // Return to ground
            { x: 405, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 413, y: -4, w: 29, h: 2, d: 10, type: 'ground' },

            // Final climb
            { x: 435, y: -3, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 441, y: -2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 451, y: -1, w: 8, h: 1, d: 5, type: 'platform' },

            // =========================================
            // SECTION 6: BOSS ARENA (x: 460 - 550)
            // =========================================
            { x: 470, y: 0, w: 60, h: 0.5, d: 10, type: 'ground' } // Boss Arena
        ],
        spawners: [
            // --- SECTION 1: Mine Entrance ---
            { x: 15, type: 'ghoulShambling', triggerDist: 12 },
            { x: 30, type: 'ghoulCrawler', triggerDist: 10 },
            { x: 45, type: 'ghoulShambling', triggerDist: 12 },
            { x: 60, type: 'orcGrunt', triggerDist: 15 },

            // --- SECTION 2: Collapsed Tunnels ---
            { x: 85, type: 'ghoulShambling', triggerDist: 12 },
            { x: 95, type: 'goleling', triggerDist: 12 },
            { x: 100, type: 'ghoulCrawler', triggerDist: 10 },
            { x: 110, type: 'goleling', triggerDist: 12 },
            { x: 115, type: 'orcGrunt', triggerDist: 15 },
            { x: 130, type: 'ghoulShambling', triggerDist: 12 },
            { x: 140, type: 'goleling', triggerDist: 12 },
            { x: 145, type: 'orcBerserker', triggerDist: 18 },

            // --- SECTION 3: Great Chasm ---
            { x: 175, type: 'gargoyle', triggerDist: 20 },
            { x: 185, type: 'goleling', triggerDist: 12 },
            { x: 190, type: 'ghoulShambling', triggerDist: 10 },
            { x: 205, type: 'gargoyle', triggerDist: 20 },
            { x: 215, type: 'goleling', triggerDist: 12 },
            { x: 220, type: 'gargoyle', triggerDist: 20 },
            { x: 235, type: 'ghoulCrawler', triggerDist: 10 },
            { x: 250, type: 'orcGrunt', triggerDist: 15 },

            // --- SECTION 4: Lava Works ---
            { x: 275, type: 'ghoulShambling', triggerDist: 12 },
            { x: 285, type: 'goleling', triggerDist: 12 },
            { x: 290, type: 'orcBerserker', triggerDist: 18 },
            { x: 305, type: 'gargoyle', triggerDist: 18 },
            { x: 315, type: 'ghoulCrawler', triggerDist: 10 },
            { x: 325, type: 'goleling', triggerDist: 12 },
            { x: 330, type: 'orcGrunt', triggerDist: 15 },
            { x: 345, type: 'ghoulShambling', triggerDist: 12 },

            // --- SECTION 5: Deep Forge ---
            { x: 370, type: 'orcBerserker', triggerDist: 20 },
            { x: 380, type: 'goleling', triggerDist: 12 },
            { x: 385, type: 'ghoulShambling', triggerDist: 12 },
            { x: 395, type: 'gargoyle', triggerDist: 18 },
            { x: 405, type: 'goleling', triggerDist: 12 },
            { x: 410, type: 'orcGrunt', triggerDist: 15 },
            { x: 420, type: 'orcBerserker', triggerDist: 18 },
            { x: 430, type: 'goleling', triggerDist: 12 },
            { x: 435, type: 'ghoulCrawler', triggerDist: 10 },
            { x: 445, type: 'orcBerserker', triggerDist: 20 },

            // --- BOSS ---
            { x: 490, type: 'ogreBoss', triggerDist: 30 }
        ]
        // No nextLevel - this is the final level!
    }
};
