
import { on, emit }                from './SocketManager.js';
import { EVENTS, REMATCH_TIMEOUT } from '../utils/Constants.js';


export function initNetworkEvents(sceneRef) {
  on('connect',    () => _onConnect(sceneRef));
  on('disconnect', () => _onDisconnect(sceneRef));

  // Matchmaking & Room
  on(EVENTS.MATCHMAKING_SEARCH, (data) => _onMatchmakingSearching(data, sceneRef));
  on(EVENTS.MATCH_FOUND,        (data) => _onMatchFound(data, sceneRef));
  on(EVENTS.ROOM_CREATED,       (data) => _onRoomCreated(data, sceneRef));
  on(EVENTS.ROOM_JOINED,        (data) => _onRoomJoined(data, sceneRef));
  on(EVENTS.OPPONENT_JOINED,    ()     => _onOpponentJoined(sceneRef));
  on(EVENTS.TEAM_CONFIRMED,     ()     => _onTeamConfirmed(sceneRef));

  // Game
  on(EVENTS.GAME_START,    (data) => _onGameStart(data, sceneRef));
  on(EVENTS.ACTION_RESULT, (data) => _onActionResult(data, sceneRef));
  on(EVENTS.UNIT_DAMAGED,  (data) => _onUnitDamaged(data, sceneRef));
  on(EVENTS.UNIT_DIED,     (data) => _onUnitDied(data, sceneRef));
  on(EVENTS.TURN_CHANGE,   (data) => _onTurnChange(data, sceneRef));
  on(EVENTS.GAME_OVER,     (data) => _onGameOver(data, sceneRef));

  // Rematch
  on(EVENTS.OPPONENT_REMATCH, (data) => _onOpponentRematch(data, sceneRef));
  on(EVENTS.REMATCH_START,    (data) => _onRematchStart(data, sceneRef));
  on(EVENTS.REMATCH_DECLINED, ()     => _onRematchDeclined(sceneRef));

  // Keluar
  on(EVENTS.OPPONENT_LEFT, ()     => _onOpponentLeft(sceneRef));
  on(EVENTS.OPPONENT_DC,   (data) => _onOpponentDisconnected(data, sceneRef));
  on(EVENTS.ERROR_MSG,     (msg)  => _emitToScene(sceneRef, 'showToast', { msg, duration: 3000 }));

  console.log('[NetworkEvents] Semua listener terdaftar');
}

// ─────────────────────────────────────────────
//  HELPER — emit ke GameScene FE1
//  FE1 listen via: this.events.on('namaEvent', ...)
// ─────────────────────────────────────────────
function _emitToScene(scene, eventName, data) {
  if (scene && scene.events) {
    scene.events.emit(eventName, data);
  }
}

// ─────────────────────────────────────────────
//  HANDLERS
// ─────────────────────────────────────────────

function _onConnect(scene) {
  console.log('[NetworkEvents] Socket terhubung');
  _emitToScene(scene, 'socketConnected');
}

function _onDisconnect(scene) {
  console.warn('[NetworkEvents] Terputus');
  _emitToScene(scene, 'showToast', { msg: 'KONEKSI TERPUTUS — REFRESH HALAMAN', duration: 4000 });
}

function _onMatchmakingSearching({ inQueue }, scene) {
  _emitToScene(scene, 'matchmakingSearching', { inQueue });
}

function _onMatchFound(data, scene) {
  _emitToScene(scene, 'matchFound', data);
}

function _onRoomCreated(data, scene) {
  _emitToScene(scene, 'roomCreated', data);
}

function _onRoomJoined(data, scene) {
  _emitToScene(scene, 'roomJoined', data);
}

function _onOpponentJoined(scene) {
  _emitToScene(scene, 'opponentJoined');
}

function _onTeamConfirmed(scene) {
  _emitToScene(scene, 'teamConfirmed');
}

function _onGameStart(data, scene) {
  // Langsung panggil method GameScene FE2
  if (scene && scene.onGameStart) scene.onGameStart(data);
}

function _onActionResult(data, scene) {
  if (scene && scene.onActionResult) scene.onActionResult(data);
}

function _onUnitDamaged(data, scene) {
  if (scene && scene.onUnitDamaged) scene.onUnitDamaged(data);
}

function _onUnitDied(data, scene) {
  if (scene && scene.onUnitDied) scene.onUnitDied(data);
}

function _onTurnChange(data, scene) {
  if (scene && scene.onTurnChange) scene.onTurnChange(data);
}

function _onGameOver(data, scene) {
  if (scene && scene.onGameOver) scene.onGameOver(data);
}

function _onOpponentRematch(data, scene) {
  if (scene && scene.onOpponentRematchResponse) scene.onOpponentRematchResponse(data);
}

function _onRematchStart(data, scene) {
  _emitToScene(scene, 'rematchStart', data);
}

function _onRematchDeclined(scene) {
  _emitToScene(scene, 'rematchDeclined');
}

function _onOpponentLeft(scene) {
  _emitToScene(scene, 'opponentLeft');
}

function _onOpponentDisconnected(data, scene) {
  if (scene && scene.onGameOver) {
    scene.onGameOver({
      won: true,
      score: data.score,
      reason: 'disconnect',
      rematchTimeout: REMATCH_TIMEOUT,
    });
  }
}

// ─────────────────────────────────────────────
//  EMITTERS — Kirim ke server
// ─────────────────────────────────────────────
export function sendCreateRoom()       { emit(EVENTS.CREATE_ROOM); }
export function sendJoinRoom(code)     { emit(EVENTS.JOIN_ROOM,       { code }); }
export function sendQuickMatch()       { emit(EVENTS.QUICK_MATCH); }
export function sendCancelMatchmaking(){ emit(EVENTS.CANCEL_MATCHMAKING); }

// Kirim pilihan tim karakter ke server
export function sendTeam(teamChoices) {
  emit(EVENTS.TEAM_READY, { teamChoices });
}

// Kirim action MOVE atau ATTACK ke server
// Dari GameScene FE1 handleBattleClick
export function sendAction(type, unitName, targetRow, targetCol) {
  emit(EVENTS.PLAYER_ACTION, { type, unitName, targetRow, targetCol });
}

export function sendSurrender()             { emit(EVENTS.SURRENDER); }
export function sendRematchResponse(answer) { emit(EVENTS.REMATCH_RESPONSE, { answer }); }