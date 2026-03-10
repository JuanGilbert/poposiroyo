import { on, emit }                from './SocketManager.js';
import { EVENTS, REMATCH_TIMEOUT } from '../utils/Constants.js';
import { showToast }               from '../utils/Helpers.js';

export function initNetworkEvents(sceneRef) {
  on('connect',    () => _onConnect(sceneRef));
  on('disconnect', () => _onDisconnect(sceneRef));

  on('match_found',        (data) => _onMatchFound(data, sceneRef));
  on('room_created',       (data) => _onRoomCreated(data, sceneRef));
  on('player_joined',      (data) => _onRoomJoined(data, sceneRef));
  on('room_ready',         ()     => _onOpponentJoined(sceneRef));

  // Game
  on('game_started',             (data) => _onGameStart(data, sceneRef));
  on('combat_action_received',   (data) => _onActionResult(data, sceneRef));
  on('game_finished',            (data) => _onGameOver(data, sceneRef));

  console.log('[NetworkEvents] Semua listener terdaftar');
}

// ─────────────────────────────────────────────
//  HELPER
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
  // Use the imported showToast helper
  showToast(scene, '⚡ LAWAN DITEMUKAN!', 2000);

  // Transition to Lobby
  if (scene) {
    scene.scene.start('LobbyScene', { roomId: data.roomId });
  }
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
  if (scene) {
    scene.scene.start('GameScene', {
      playerTeam: scene.selectedTeam,
      roomId: scene.roomId
    });
  }
}

function _onGameStart(data, scene) {
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
export function sendQuickMatch() {
  emit("find_match");
}
export function sendCancelMatchmaking() {
  emit("cancel_matchmaking");
}

export function sendTeam(teamChoices, sceneRef) {
  if (sceneRef) {
    sceneRef.scene.start('GameScene', {
      playerTeam: teamChoices,
      roomId: sceneRef.roomId
    });
  }
}

export function sendAction(type, unitName, targetRow, targetCol) {
  emit(EVENTS.PLAYER_ACTION, { type, unitName, targetRow, targetCol });
}

export function sendSurrender()             { emit(EVENTS.SURRENDER); }
export function sendRematchResponse(answer) { emit(EVENTS.REMATCH_RESPONSE, { answer }); }