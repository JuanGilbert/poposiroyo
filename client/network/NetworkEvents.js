import { on, emit }                from './SocketManager.js';
import { EVENTS, REMATCH_TIMEOUT } from '../utils/Constants.js';
import { showToast }               from '../utils/Helpers.js';

export function initNetworkEvents(sceneRef) {
    on('connect',    () => _onConnect(sceneRef));
    on('disconnect', () => _onDisconnect(sceneRef));

    on('match_found',   (data) => _onMatchFound(data, sceneRef));
    on('room_created',  (data) => _onRoomCreated(data, sceneRef));
    on('player_joined', (data) => _onRoomJoined(data, sceneRef));
    on('room_ready',    ()     => _onOpponentJoined(sceneRef));

    // Game
    on('game_started',           (data) => _onGameStart(data, sceneRef));
    on('combat_action_received', (data) => _onActionResult(data, sceneRef));
    on('game_over_received',     (data) => _onGameOver(data, sceneRef));
    on('game_finished',          (data) => _onGameOver(data, sceneRef));

    // Lobby
    on('lobby_kicked',  (data) => _onLobbyKicked(data, sceneRef));
    on('player_left',   ()     => _onOpponentLeft(sceneRef));

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

function _onMatchFound(data, scene) {
    showToast(scene, '⚡ LAWAN DITEMUKAN!', 2000);
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

function _onGameStart(data, scene) {
    if (scene && scene.onGameStart) scene.onGameStart(data);
}

function _onActionResult(data, scene) {
    if (scene && scene.onActionResult) scene.onActionResult(data);
}

function _onGameOver(data, scene) {
    if (scene && scene.onGameOver) scene.onGameOver(data);
}

function _onLobbyKicked(data, scene) {
    console.warn('[NetworkEvents] Kicked from lobby:', data?.reason);
    if (scene) scene.scene.start('MenuScene');
}

function _onOpponentLeft(scene) {
    _emitToScene(scene, 'opponentLeft');
    if (scene) {
        alert('Your opponent disconnected!');
        scene.scene.start('MenuScene');
    }
}

// ─────────────────────────────────────────────
//  EMITTERS — Kirim ke server
// ─────────────────────────────────────────────

export function sendCreateRoom()       { emit(EVENTS.CREATE_ROOM); }
export function sendJoinRoom(code)     { emit(EVENTS.JOIN_ROOM, { code }); }

export function sendQuickMatch() {
    emit('find_match');
}

export function sendCancelMatchmaking() {
    emit('cancel_matchmaking');
}

// Kirim team ke server lalu pindah ke GameScene
// Dipanggil dari LobbyScene.js
export function sendTeam(teamChoices, sceneRef) {
    const roomId = sceneRef?.roomId || sceneRef?.registry.get('roomId');
    emit('player_ready', {
        roomId,
        units: teamChoices
    });
}

export function sendCombatAction(roomId, actionType, targetCoord) {
    emit('combat_action', { roomId, actionType, targetCoord });
}

export function sendGameOver(roomId, isPlayer1Winner) {
    emit('game_over', { roomId, isPlayer1Winner });
}

export function sendLobbyTimeoutKick(roomId) {
    emit('lobby_timeout_kick', { roomId });
}

export function sendAction(type, unitName, targetRow, targetCol) {
    emit(EVENTS.PLAYER_ACTION, { type, unitName, targetRow, targetCol });
}

export function sendSurrender()             { emit(EVENTS.SURRENDER); }
export function sendRematchResponse(answer) { emit(EVENTS.REMATCH_RESPONSE, { answer }); }