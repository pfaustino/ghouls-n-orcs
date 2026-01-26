
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

            // Staircase up -- Reduced height diff to 1.0 per step (was 1.5)
            { x: 26, y: 1.0, w: 6, h: 1, d: 5, type: 'platform' },
            { x: 34, y: 2.0, w: 6, h: 1, d: 5, type: 'platform' },

            // Long bridge
            { x: 50, y: 2.0, w: 20, h: 1, d: 5, type: 'platform' },

            // Lower pit area
            { x: 75, y: -1, w: 30, h: 2, d: 10, type: 'ground' },

            // Step out of pit
            { x: 92, y: 0.5, w: 6, h: 1, d: 5, type: 'platform' },

            // Final ledge (Goal)
            { x: 100, y: 2.0, w: 10, h: 1, d: 5, type: 'platform' }
        ],
        spawners: [
            { x: 20, type: 'ghoulShambling', triggerDist: 15 },
            { x: 40, type: 'ghoulShambling', triggerDist: 15 },
            { x: 70, type: 'ghoulCrawler', triggerDist: 15 },
            { x: 95, type: 'ghoulShambling', triggerDist: 15 }, // Pit ambush
            { x: 98, type: 'ghoulShambling', triggerDist: 15 }
        ]
    }
};
