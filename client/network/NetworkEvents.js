
import { on, emit }                from './SocketManager.js';
import { EVENTS, REMATCH_TIMEOUT } from '../utils/Constants.js';


export function initNetworkEvents(sceneRef) {
  on('connect',    () => _onConnect());
  on('disconnect', () => _onDisconnect());

  // FIX: Use exact strings to match socketHandler.js!
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
  showToast('⚡ LAWAN DITEMUKAN!', 2000);

  // FIX: Catch data.roomId from the server and pass it to Lobby
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
  // FIX: Pass the room ID to the GameScene so CombatManager can use it
  if (scene) {
    scene.scene.start('GameScene', {
      playerTeam: scene.selectedTeam,
      roomId: scene.roomId
    });
  }
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
export function sendQuickMatch() {
  emit("find_match"); // The server listens for "find_match"
}
export function sendCancelMatchmaking() {
  emit("cancel_matchmaking");
}

// Kirim pilihan tim karakter ke server
export function sendTeam(teamChoices) {
  // We will let PlacementManager handle this later,
  // but we'll leave it here to trigger FE2's confirmed transition for now.
  _onTeamConfirmed(window.currentSceneRef);
}

// Kirim action MOVE atau ATTACK ke server
// Dari GameScene FE1 handleBattleClick
export function sendAction(type, unitName, targetRow, targetCol) {
  emit(EVENTS.PLAYER_ACTION, { type, unitName, targetRow, targetCol });
}

export function sendSurrender()             { emit(EVENTS.SURRENDER); }
export function sendRematchResponse(answer) { emit(EVENTS.REMATCH_RESPONSE, { answer }); }