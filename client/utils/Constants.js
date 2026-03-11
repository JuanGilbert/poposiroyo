// Constants.js
// Konstanta global berdasarkan seluruh kode FE1.

// Grid (dari Board.js & GameScene.js)
export const GRID_SIZE = 10;
export const GRID_ROWS = 10;
export const GRID_COLS = 10;

// Game State (dari GameScene.js, CombatManager.js, PlacementManager.js)
export const GAME_STATE = {
    PLACEMENT: 'PLACEMENT',
    WAITING_FOR_OPPONENT: 'WAITING_FOR_OPPONENT',
    PLAYER_TURN: 'PLAYER_TURN',
    ENEMY_TURN: 'ENEMY_TURN',
    GAME_OVER: 'GAME_OVER',
};

// Player Action (dari CombatManager.js & BattleUI.js)
export const ACTION = {
    MOVING: 'MOVING',
    ATTACKING: 'ATTACKING',
};

// Combat Action Type (dari CombatManager.js - emit ke server)
export const ACTION_TYPE = {
    MOVE: 'MOVE',
    ATTACK: 'ATTACK',
};

// Phaser Events - emit antar scene/object (dari GameScene.js & BattleUI.js)
export const EVENTS = {
    CELL_CLICKED: 'cellClicked',
    UI_ACTION_SELECTED: 'ui_action_selected',
    BOARD_READY: 'board_ready', // dari SocketManager.js FE1
};

// Socket Events - CLIENT -> SERVER (dari CombatManager.js, PlacementManager.js, LobbyScene.js)
export const SOCKET_EMIT = {
    PLAYER_READY: 'player_ready',
    COMBAT_ACTION: 'combat_action',
    GAME_OVER: 'game_over',
    LOBBY_TIMEOUT_KICK: 'lobby_timeout_kick',
};

// Socket Events - SERVER -> CLIENT (dari CombatManager.js, GameScene.js, LobbyScene.js)
export const SOCKET_ON = {
    GAME_STARTED: 'game_started',
    COMBAT_ACTION_RECEIVED: 'combat_action_received',
    GAME_OVER_RECEIVED: 'game_over_received',
    LOBBY_KICKED: 'lobby_kicked',
    PLAYER_LEFT: 'player_left',
};

// Placement (dari PlacementManager.js & LobbyScene.js)
export const PLACEMENT_TIME = 30;
export const LOBBY_TIME = 30;

// Turn (dari CombatManager.js)
export const TURN = {
    ENEMY_DELAY: 1000,
    FOG_DURATION: 4,
};

// Team (dari LobbyScene.js)
export const MAX_TEAM_SIZE = 3;