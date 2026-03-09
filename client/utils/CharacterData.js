// client/utils/CharacterData.js

export const CHARACTER_DATA = {
    "Assassin": {
        name: "Assassin",
        tileSize: 1,       // Fixed name
        hp: 1,
        speed: 90,
        moveRange: 4,      // Added
        attackRange: 1,    // Added
        attackOffsets: [
            { r: 0, c: 0 }
        ]
    },
    "Mage": {
        name: "Mage",
        tileSize: 2,       // Fixed name
        hp: 2,
        speed: 50,
        moveRange: 2,      // Added
        attackRange: 3,    // Added
        attackOffsets: [
            { r: 0, c: 0 }, { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
        ]
    },
        "Paladin": {
            name: "Paladin",
            tileSize: 3,       // Make sure this says tileSize, NOT size!
            hp: 5,
            speed: 30,
            moveRange: 2,      // Paladins are heavy and slow
            attackRange: 1,    // Melee only
            attackOffsets: [
                { r: 0, c: 0 },
                { r: 0, c: -1 },
                { r: 0, c: 1 }
            ]
        },
    "Scout": {
        name: "Scout",
        tileSize: 1,
        hp: 2,
        speed: 100,        // Fastest unit in the game
        moveRange: 5,
        attackRange: 4,
        attackOffsets: [
            { r: 0, c: 0 } // Only hits the exact square clicked
        ],
        // NEW: The "Flare" effect. Reveals a huge diamond shape!
        revealOffsets: [
            { r: 0, c: 0 }, { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 },
            { r: -2, c: 0 }, { r: 2, c: 0 }, { r: 0, c: -2 }, { r: 0, c: 2 },
            { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 }
        ]
    },
};