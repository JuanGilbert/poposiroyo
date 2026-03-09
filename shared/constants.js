// utils/Constants.js

// ukuran board game
export const BOARD_ROWS = 10
export const BOARD_COLS = 10

// ukuran tile (pixel)
export const TILE_SIZE = 64


// player identifier
export const PLAYER = {
  ONE: "player1",
  TWO: "player2"
}


// fase permainan
export const GAME_PHASE = {
  WAITING: "waiting",
  PLACEMENT: "placement",
  PLAYING: "playing",
  RESULT: "result"
}


// tipe aksi dalam game
export const ACTION_TYPE = {
  MOVE: "move",
  ATTACK: "attack",
  REVEAL: "reveal"
}


// direction movement (grid)
export const DIRECTIONS = [
  { r: -1, c: 0 }, // atas
  { r: 1, c: 0 },  // bawah
  { r: 0, c: -1 }, // kiri
  { r: 0, c: 1 }   // kanan
]