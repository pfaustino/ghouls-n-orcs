
export const Levels = {
    graveyard: {
        id: 'graveyard',
        name: 'Graveyard Outskirts',
        length: 200,
        platforms: [
            // Starting area - Safe zone
            { x: -10, y: -1, w: 40, h: 2, d: 10, type: 'ground' }, // Ends at x=10

            // First jump -- Easy
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

            // -- NEW SECTION: Orc War Camp Outskirts --

            // Bridge to camp
            { x: 100, y: 1.5, w: 15, h: 1, d: 5, type: 'platform' },

            // Main Camp Ground
            { x: 125, y: 0, w: 40, h: 2, d: 10, type: 'ground' },

            // Access Steps to Tower
            { x: 146, y: 1.2, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 151, y: 2.4, w: 6, h: 1, d: 5, type: 'platform' },

            // Watchtower / Elevated platform
            { x: 155, y: 3.5, w: 10, h: 1, d: 5, type: 'platform' },

            // Descent
            { x: 168, y: 1.5, w: 8, h: 1, d: 5, type: 'platform' },

            // Final Arena
            { x: 190, y: 0, w: 40, h: 2, d: 10, type: 'ground' }
        ],
        spawners: [
            { x: 20, type: 'ghoulShambling', triggerDist: 15 },
            { x: 40, type: 'ghoulShambling', triggerDist: 15 },
            { x: 70, type: 'ghoulCrawler', triggerDist: 15 },
            { x: 95, type: 'ghoulShambling', triggerDist: 15 },

            // Orcs!
            { x: 120, type: 'orcGrunt', triggerDist: 20 }, // Guarding entrance
            { x: 135, type: 'orcGrunt', triggerDist: 15 },
            { x: 140, type: 'ghoulShambling', triggerDist: 10 }, // Fodder support

            { x: 155, type: 'orcBerserker', triggerDist: 18 }, // On tower?

            { x: 180, type: 'orcGrunt', triggerDist: 15 },
            { x: 195, type: 'orcBerserker', triggerDist: 15 },
            { x: 200, type: 'orcGrunt', triggerDist: 15 }
        ]
    }
};
