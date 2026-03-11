export const Constants = {

    // Grid (dari GameScene.js)
    GRID_SIZE: 10,
    GRID_ROWS: 10,
    GRID_COLS: 10,

    // Game State (dari GameScene.js & CombatManager.js)
    GAME_STATE: {
        PLACEMENT: "PLACEMENT",
        PLAYER_TURN: "PLAYER_TURN",
        ENEMY_TURN: "ENEMY_TURN",
    },

    // Player Action (dari CombatManager.js & BattleUI.js)
    ACTION: {
        MOVING: "MOVING",
        ATTACKING: "ATTACKING",
    },

    // Placement (dari PlacementManager.js)
    PLACEMENT_TIME: 30,

    // Turn Queue (dari CombatManager.js)
    TURN: {
        ENEMY_DELAY: 1200, // delay ms sebelum enemy action
    },

    // Unit/Karakter (dari Unit.js)
    UNIT: {
        DEFAULT_HP: 1,
        MIN_HP: 0,
    },

    // Board (dari GameScene.js)
    BOARD: {
        PLAYER: false,
        ENEMY: true,
    },

};