
// ── Grid — sama persis dengan FE1 ────────────
export const BOARD_ROWS = 10;
export const BOARD_COLS = 10;
export const TILE_SIZE  = 64;

// ── Player identifier — sama dengan FE1 ──────
export const PLAYER = {
  ONE: 'player1',
  TWO: 'player2',
};

// ── Fase permainan — sama dengan FE1 ─────────
export const GAME_PHASE = {
  WAITING:   'waiting',
  PLACEMENT: 'placement',
  PLAYING:   'playing',
  RESULT:    'result',
};

// ── Tipe aksi — sama dengan FE1 ──────────────
export const ACTION_TYPE = {
  MOVE:   'move',
  ATTACK: 'attack',
  REVEAL: 'reveal',
};

// ── Directions grid — sama dengan FE1 ────────
export const DIRECTIONS = [
  { r: -1, c:  0 }, // atas
  { r:  1, c:  0 }, // bawah
  { r:  0, c: -1 }, // kiri
  { r:  0, c:  1 }, // kanan
];

// ── Placement timer ───────────────────────────
export const PLACEMENT_TIME = 30;

// ── Fog duration ──────────────────────────────
export const FOG_DURATION_TURNS = 4;

// ── Rematch timeout ───────────────────────────
export const REMATCH_TIMEOUT = 15000;

// ── Socket event names ────────────────────────
// Disepakati bersama BE1 & BE2
export const EVENTS = {
  // Kirim ke server
  CREATE_ROOM:        'create_room',
  JOIN_ROOM:          'join_room',
  QUICK_MATCH:        'quick_match',
  CANCEL_MATCHMAKING: 'cancel_matchmaking',
  TEAM_READY:         'team_ready',
  PLAYER_ACTION:      'player_action',
  SURRENDER:          'surrender',
  REMATCH_RESPONSE:   'rematch_response',

  // Terima dari server
  ROOM_CREATED:       'room_created',
  ROOM_JOINED:        'room_joined',
  MATCH_FOUND:        'match_found',
  MATCHMAKING_SEARCH: 'matchmaking_searching',
  OPPONENT_JOINED:    'opponent_joined',
  TEAM_CONFIRMED:     'team_confirmed',
  GAME_START:         'game_start',
  ACTION_RESULT:      'action_result',
  UNIT_DAMAGED:       'unit_damaged',
  UNIT_DIED:          'unit_died',
  TURN_CHANGE:        'turn_change',
  GAME_OVER:          'game_over',
  REMATCH_START:      'rematch_start',
  REMATCH_DECLINED:   'rematch_declined',
  OPPONENT_REMATCH:   'opponent_rematch_response',
  OPPONENT_LEFT:      'opponent_left',
  OPPONENT_DC:        'opponent_disconnected',
  ERROR_MSG:          'error_msg',
};