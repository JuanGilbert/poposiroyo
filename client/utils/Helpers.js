// ─────────────────────────────────────────────
//  Helpers.js — Fungsi utilitas umum
//  Front End 2: Game Logic Client
// ─────────────────────────────────────────────

const Helpers = (() => {

  // ── Konversi index → koordinat (misal: 0 → A1, 11 → B2) ──
  function idxToCoord(idx) {
    const col = Constants.COLS_LABEL[idx % Constants.GRID_COLS];
    const row = Constants.ROWS_LABEL[Math.floor(idx / Constants.GRID_COLS)];
    return col + row;
  }

  // ── Konversi koordinat → index (misal: "A1" → 0) ──
  function coordToIdx(coord) {
    const col = Constants.COLS_LABEL.indexOf(coord[0].toUpperCase());
    const row = parseInt(coord.slice(1)) - 1;
    if (col < 0 || row < 0) return -1;
    return row * Constants.GRID_COLS + col;
  }

  // ── Dapatkan semua index yang ditempati kapal ──
  // startIdx: index awal, size: panjang kapal, horizontal: arah
  function getShipCells(startIdx, size, horizontal) {
    const cells = [];
    const col   = startIdx % Constants.GRID_COLS;
    const row   = Math.floor(startIdx / Constants.GRID_COLS);

    for (let i = 0; i < size; i++) {
      if (horizontal) {
        if (col + i >= Constants.GRID_COLS) return null; // keluar batas
        cells.push(startIdx + i);
      } else {
        if (row + i >= Constants.GRID_ROWS) return null; // keluar batas
        cells.push(startIdx + i * Constants.GRID_COLS);
      }
    }
    return cells;
  }

  // ── Validasi posisi kapal (tidak bertabrakan, tidak keluar batas) ──
  function isValidPlacement(board, cells) {
    if (!cells) return false;
    return cells.every(idx => board[idx] === undefined);
  }

  // ── Generate penempatan kapal secara acak ──
  function autoPlaceShips() {
    const board = new Array(100).fill(undefined);

    for (let s = 0; s < Constants.SHIPS.length; s++) {
      const ship = Constants.SHIPS[s];
      let placed = false;
      let tries  = 0;

      while (!placed && tries < 500) {
        tries++;
        const horizontal = Math.random() > 0.5;
        const startIdx   = Math.floor(Math.random() * 100);
        const cells      = getShipCells(startIdx, ship.size, horizontal);

        if (isValidPlacement(board, cells)) {
          cells.forEach(idx => { board[idx] = ship.id; });
          placed = true;
        }
      }

      if (!placed) {
        console.warn(`[Helpers] Gagal menempatkan kapal ${ship.name}`);
        return null;
      }
    }

    return board;
  }

  // ── Tampilkan toast notifikasi ──
  function showToast(msg, duration = 2500) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), duration);
  }

  // ── Tambah log ke battle log ──
  function addLog(msg, cssClass = '') {
    const log = document.getElementById('battle-log');
    if (!log) return;
    const line = document.createElement('div');
    line.className = 'log-line ' + cssClass;
    line.textContent = msg;
    log.prepend(line);
    // Batasi 20 baris
    while (log.children.length > 20) log.removeChild(log.lastChild);
  }

  // ── Deep clone object ──
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ── Format waktu (ms → "12s") ──
  function formatCountdown(ms) {
    return Math.max(0, Math.floor(ms / 1000)) + 's';
  }

  return {
    idxToCoord,
    coordToIdx,
    getShipCells,
    isValidPlacement,
    autoPlaceShips,
    showToast,
    addLog,
    clone,
    formatCountdown,
  };
})();

if (typeof module !== 'undefined') module.exports = Helpers;