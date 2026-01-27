
export const Levels = {
    graveyard: {
        id: 'graveyard',
        name: 'Graveyard Outskirts',
        length: 200,
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

            // Mid-bridge Safety
            { x: 250, y: 1.5, w: 15, h: 1, d: 5, type: 'platform' },

            // Bridge Gap Fix 2
            { x: 257.5, y: 2.0, w: 6, h: 1, d: 5, type: 'platform' },

            // More Jumps
            { x: 265, y: 2.5, w: 5, h: 1, d: 5, type: 'platform' },
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
            { x: 325, y: 2.5, w: 8, h: 1, d: 5, type: 'platform' }, // Adjusted progression

            { x: 335, y: -0.5, w: 40, h: 2, d: 10, type: 'ground' }, // Low ground path

            // Climb Out Fix
            { x: 350, y: 0.2, w: 6, h: 1, d: 5, type: 'platform' },

            // Final Steps
            { x: 360, y: 1.0, w: 6, h: 1, d: 5, type: 'platform' },
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
        ]
    }
};
