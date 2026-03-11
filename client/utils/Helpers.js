// ─────────────────────────────────────────────
//  Helpers.js — Fungsi utilitas FE2
//  BERSIH dari DOM — semua pakai Phaser events
//  Visual ditangani FE1, FE2 hanya emit event
// ─────────────────────────────────────────────

import { BOARD_ROWS, BOARD_COLS } from './Constants.js';

// ── Emit toast ke FE1 via Phaser events ───────
// FE1 listen: scene.events.on('showToast', ...)
export function showToast(scene, msg, duration = 2000) {
  if (scene && scene.events) {
    scene.events.emit('showToast', { msg, duration });
  }
}

// ── Emit log ke FE1 via Phaser events ─────────
// FE1 listen: scene.events.on('addLog', ...)
export function addLog(scene, msg, cls = '') {
  if (scene && scene.events) {
    scene.events.emit('addLog', { msg, cls });
  }
}

// ── Cek koordinat valid ───────────────────────
export function isValidCoord(row, col) {
  return row >= 0 && row < BOARD_ROWS &&
         col >= 0 && col < BOARD_COLS;
}

// ── Hitung jarak Manhattan ────────────────────
// Dari GameScene FE1:
// Math.abs(cell.row - startCoord.row) + Math.abs(cell.col - startCoord.col)
export function getManhattanDistance(coord1, coord2) {
  return Math.abs(coord1.row - coord2.row) +
         Math.abs(coord1.col - coord2.col);
}

// ── Hitung footprint unit ─────────────────────
// Dari GameScene FE1 spawnPlayerTeam:
// for (let i = 0; i < blueprint.tileSize; i++)
//   footprint.push({ row: currentRow + i, col: 1 })
export function getUnitFootprint(startRow, startCol, tileSize) {
  const footprint = [];
  for (let i = 0; i < tileSize; i++) {
    footprint.push({ row: startRow + i, col: startCol });
  }
  return footprint;
}

// ── Hitung sel yang terkena attack ───────────
// Dari GameScene FE1 handleBattleClick attackOffsets:
// unit.attackOffsets.forEach(offset => {
//   const r = cell.row + offset.r
//   const c = cell.col + offset.c
// })
export function getAttackCells(originRow, originCol, attackOffsets) {
  const cells = [];
  attackOffsets.forEach(offset => {
    const r = originRow + offset.r;
    const c = originCol + offset.c;
    if (isValidCoord(r, c)) cells.push({ row: r, col: c });
  });
  return cells;
}

// ── Hitung sel yang ter-reveal ────────────────
// Dari GameScene FE1 handleBattleClick revealOffsets:
// unit.revealOffsets.forEach(offset => { ... })
export function getRevealCells(originRow, originCol, revealOffsets) {
  const cells = [];
  revealOffsets.forEach(offset => {
    const r = originRow + offset.r;
    const c = originCol + offset.c;
    if (isValidCoord(r, c)) cells.push({ row: r, col: c });
  });
  return cells;
}

// ── Sort unit berdasarkan speed ───────────────
// Dari GameScene FE1 buildTurnQueue:
// this.turnQueue.sort((a, b) => b.speed - a.speed)
export function sortBySpeed(units) {
  return [...units].sort((a, b) => b.speed - a.speed);
}

// ── Format HP ─────────────────────────────────
export function formatHP(current, max) {
  return `${current}/${max}`;
}