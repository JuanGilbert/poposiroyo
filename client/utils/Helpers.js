// ─────────────────────────────────────────────
//  Helpers.js — Fungsi utilitas umum


import { GRID_ROWS, GRID_COLS } from './Constants.js';

// ── Toast notifikasi ──────────────────────────
// Sama seperti sebelumnya
export function showToast(msg, duration = 2000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// ── Battle log ────────────────────────────────
export function addLog(msg, cls = '') {
  const log = document.getElementById('battle-log');
  if (!log) return;
  const div = document.createElement('div');
  div.className   = 'log-entry ' + cls;
  div.textContent = msg;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// ── Koordinat {row, col} → string "R2C5" ──────
// Ganti idxToCoord karena sistem sekarang pakai {row, col}
// bukan index 0-99
export function coordToString({ row, col }) {
  return `R${row}C${col}`;
}

// ── Cek apakah koordinat valid di dalam grid ──
export function isValidCoord(row, col) {
  return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
}

// ── Hitung jarak Manhattan antar dua koordinat ──
// Dipakai untuk validasi move range
// Dari GameScene: Math.abs(cell.row - startCoord.row) + Math.abs(cell.col - startCoord.col)
export function getManhattanDistance(coord1, coord2) {
  return Math.abs(coord1.row - coord2.row) + Math.abs(coord1.col - coord2.col);
}

// ── Hitung footprint unit (koordinat yang ditempati) ──
// Dari GameScene spawnPlayerTeam: footprint berdasarkan tileSize secara vertikal
export function getUnitFootprint(startRow, startCol, tileSize) {
  const footprint = [];
  for (let i = 0; i < tileSize; i++) {
    footprint.push({ row: startRow + i, col: startCol });
  }
  return footprint;
}

// ── Hitung sel yang terkena attack berdasarkan offsets ──
// Dari GameScene handleBattleClick attackOffsets
export function getAttackCells(originRow, originCol, attackOffsets) {
  const cells = [];
  attackOffsets.forEach(offset => {
    const r = originRow + offset.r;
    const c = originCol + offset.c;
    if (isValidCoord(r, c)) {
      cells.push({ row: r, col: c });
    }
  });
  return cells;
}

// ── Hitung sel yang ter-reveal berdasarkan offsets ──
// Dari GameScene handleBattleClick revealOffsets
export function getRevealCells(originRow, originCol, revealOffsets) {
  const cells = [];
  revealOffsets.forEach(offset => {
    const r = originRow + offset.r;
    const c = originCol + offset.c;
    if (isValidCoord(r, c)) {
      cells.push({ row: r, col: c });
    }
  });
  return cells;
}

// ── Sort unit berdasarkan speed (untuk turn queue) ──
// Dari GameScene buildTurnQueue: sort((a,b) => b.speed - a.speed)
export function sortBySpeed(units) {
  return [...units].sort((a, b) => b.speed - a.speed);
}

// ── Format HP display ─────────────────────────
export function formatHP(current, max) {
  return `${current}/${max}`;
}