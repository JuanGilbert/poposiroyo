// ─────────────────────────────────────────────
//  NetworkEvents.js — Semua event socket
// ─────────────────────────────────────────────

import { on, emit }                from './SocketManager.js';
import { EVENTS, REMATCH_TIMEOUT } from '../utils/Constants.js';
import { showToast }               from '../utils/Helpers.js';

// ─────────────────────────────────────────────
//  INIT — Daftarkan semua listener
// ─────────────────────────────────────────────
export function initNetworkEvents(sceneRef) {
  // Koneksi
  on('connect',    () => _onConnect());
  on('disconnect', () => _onDisconnect());

  // Matchmaking & Room
  on(EVENTS.MATCHMAKING_SEARCH, ({ inQueue }) => _onMatchmakingSearching(inQueue));
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
  on(EVENTS.ERROR_MSG,     (msg)  => showToast('⚠ ' + msg, 3000));

  console.log('[NetworkEvents] Semua listener terdaftar');
}

// ─────────────────────────────────────────────
//  HANDLERS — Terima dari server
// ─────────────────────────────────────────────

function _onConnect() {
  console.log('[NetworkEvents] Socket terhubung');
  // TODO: update UI status koneksi — tunggu FE1
}

function _onDisconnect() {
  console.warn('[NetworkEvents] Terputus');
  showToast('KONEKSI TERPUTUS — REFRESH HALAMAN', 4000);
}

function _onMatchmakingSearching(inQueue) {
  // TODO: update antrian UI — tunggu FE1
  const el = document.getElementById('queue-count');
  if (el) el.textContent = `${inQueue} PEMAIN MENUNGGU`;
}

function _onMatchFound({ code, score }, scene) {
  showToast('⚡ LAWAN DITEMUKAN!', 2000);
  if (score && scene) scene.setMyScore(score);
  // TODO: navigasi ke team select / placement — tunggu FE1
  // scene.scene.start('LobbyScene', { code })
}

function _onRoomCreated({ code }, scene) {
  // TODO: tampilkan kode room — tunggu FE1
}

function _onRoomJoined({ code }, scene) {
  // TODO: masuk lobby — tunggu FE1
}

function _onOpponentJoined(scene) {
  // TODO: update slot lawan — tunggu FE1
}

function _onTeamConfirmed(scene) {
  // Ganti dari _onBoardConfirmed
  // TODO: pindah ke waiting screen — tunggu FE1
  // scene.scene.start('WaitingScene')
}

function _onGameStart(data, scene) {
  // data berisi: { yourTurn, playerTeam, enemyTeam (samar) }
  if (scene) scene.onGameStart(data);
}

function _onActionResult(data, scene) {
  // data berisi: { type: 'MOVE'|'ATTACK', unitId, ... }
  if (scene) scene.onActionResult(data);
}

function _onUnitDamaged(data, scene) {
  // data berisi: { unitId, remainingHp, isPlayerUnit }
  if (scene) scene.onUnitDamaged(data);
}

function _onUnitDied(data, scene) {
  // data berisi: { unitId, isPlayerUnit }
  if (scene) scene.onUnitDied(data);
}

function _onTurnChange(data, scene) {
  // data berisi: { currentUnitId, isPlayerTurn, turnQueue }
  if (scene) scene.onTurnChange(data);
}

function _onGameOver(data, scene) {
  if (scene) scene.onGameOver(data);
}

function _onOpponentRematch(data, scene) {
  if (scene) scene.onOpponentRematchResponse(data);
}

function _onRematchStart({ score }, scene) {
  if (score && scene) scene.setMyScore(score);
  showToast('⚔️ TANDING ULANG!', 1500);
  // TODO: restart ke team select — tunggu FE1
}

function _onRematchDeclined(scene) {
  showToast('🔍 MENCARI LAWAN BARU...', 2000);
  // TODO: ke quick match — tunggu FE1
}

function _onOpponentLeft(scene) {
  showToast('LAWAN MENINGGALKAN PERTANDINGAN', 3000);
  // TODO: kembali ke menu — tunggu FE1
}

function _onOpponentDisconnected({ score }, scene) {
  if (score && scene) scene.setMyScore(score);
  if (scene) scene.onGameOver({
    won: true, score, reason: 'disconnect', rematchTimeout: REMATCH_TIMEOUT
  });
}

// ─────────────────────────────────────────────
//  EMITTERS — Kirim ke server
//  UPDATE: sendBoard → sendTeam, sendFire → sendAction
// ─────────────────────────────────────────────

export function sendCreateRoom()        { emit(EVENTS.CREATE_ROOM); }
export function sendJoinRoom(code)      { emit(EVENTS.JOIN_ROOM,    { code }); }
export function sendQuickMatch()        { emit(EVENTS.QUICK_MATCH); }
export function sendCancelMatchmaking() { emit(EVENTS.CANCEL_MATCHMAKING); }

// Ganti sendBoard → sendTeam: kirim pilihan karakter
// data: { teamChoices: ['Assassin', 'Mage', 'Paladin'] }
export function sendTeam(teamChoices) {
  emit(EVENTS.TEAM_READY, { teamChoices });
}

// Ganti sendFire → sendAction: kirim MOVE atau ATTACK
// data: { type: 'MOVE'|'ATTACK', unitId, targetRow, targetCol }
export function sendAction(type, unitId, targetRow, targetCol) {
  emit(EVENTS.PLAYER_ACTION, { type, unitId, targetRow, targetCol });
}

export function sendSurrender()              { emit(EVENTS.SURRENDER); }
export function sendRematchResponse(answer)  { emit(EVENTS.REMATCH_RESPONSE, { answer }); }