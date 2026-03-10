// shared/constants.js

const GAME_STATE = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    FINISHED: 'finished'
};

const TILE_STATE = {
    EMPTY: 0,
    SHIP: 1,
    HIT: 2,
    MISS: 3
};

const PLAYER_ROLE = {
    PLAYER1: 'player1',
    PLAYER2: 'player2'
};

module.exports = {
    GAME_STATE,
    TILE_STATE,
    PLAYER_ROLE
};