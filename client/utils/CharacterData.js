// client/utils/CharacterData.js

export const CHARACTER_DATA = {
    "Assassin": {
        name: "Assassin",
        size: 1,        // Takes up 1 tile
        hp: 1,          // Dies in 1 hit
        speed: 90,      // Very fast (attacks often)
        attackOffsets: [
            { r: 0, c: 0 } // Hits only the clicked square
        ]
    },
    "Mage": {
        name: "Mage",
        size: 2,        // Takes up 2 tiles (e.g., 1x2 rectangle)
        hp: 2,          // Takes 2 hits to die
        speed: 50,      // Average speed
        attackOffsets: [
            { r: 0, c: 0 },   // Center
            { r: -1, c: 0 },  // Top
            { r: 1, c: 0 },   // Bottom
            { r: 0, c: -1 },  // Left
            { r: 0, c: 1 }    // Right
        ] // Creates a cross-shaped explosion
    },
    "Paladin": {
        name: "Paladin",
        size: 3,        // Takes up 3 tiles
        hp: 5,          // Massive health pool
        speed: 30,      // Very slow
        attackOffsets: [
            { r: 0, c: 0 },
            { r: 0, c: -1 },
            { r: 0, c: 1 }
        ] // Cleaves 3 tiles horizontally
    }
};