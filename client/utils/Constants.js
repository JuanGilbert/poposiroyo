// Constants.js
// Konstanta global berdasarkan kode FE1.

// Grid (dari GameScene.js)
export const GRID_SIZE = 10;
export const GRID_ROWS = 10;
export const GRID_COLS = 10;

// Game State (dari GameScene.js & CombatManager.js)
export const GAME_STATE = {
    PLACEMENT: "PLACEMENT",
    PLAYER_TURN: "PLAYER_TURN",
    ENEMY_TURN: "ENEMY_TURN",
};

// Player Action (dari CombatManager.js & BattleUI.js)
export const ACTION = {
    MOVING: "MOVING",
    ATTACKING: "ATTACKING",
};

// Phaser Events (dari GameScene.js & BattleUI.js)
export const EVENTS = {
    CELL_CLICKED: "cellClicked",
    UI_ACTION_SELECTED: "ui_action_selected",
};

// Placement (dari PlacementManager.js)
export const PLACEMENT_TIME = 30;

// Turn (dari CombatManager.js)
export const TURN = {
    ENEMY_DELAY: 1200,
};

// Unit (dari Unit.js)
export const UNIT = {
    DEFAULT_HP: 1,
    MIN_HP: 0,
};

// Board (dari GameScene.js)
export const BOARD = {
    PLAYER: false,
    ENEMY: true,
};