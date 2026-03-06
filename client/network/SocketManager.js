// ─────────────────────────────────────────────
//  SocketManager.js — Manajemen koneksi Socket.io
//  Front End 2: Networking
// ─────────────────────────────────────────────

const SocketManager = (() => {
  let _socket = null;

  // ── Connect ke server ──────────────────────
  function connect() {
    if (_socket && _socket.connected) return _socket;

    _socket = io(); // connect ke server yang serve file ini

    // Intercept board_ready → simpan board ke window untuk referensi
    const originalEmit = _socket.emit.bind(_socket);
    _socket.emit = function(event, data, ...args) {
      if (event === Constants.EVENTS.BOARD_READY && data?.board) {
        window._myBoard = data.board;
        console.log('[SocketManager] Board disimpan ke window._myBoard');
      }
      return originalEmit(event, data, ...args);
    };

    console.log('[SocketManager] Terhubung ke server');
    return _socket;
  }

  // ── Getter socket ──────────────────────────
  function get() {
    return _socket;
  }

  // ── Emit event ke server ───────────────────
  function emit(event, data) {
    if (!_socket) { console.warn('[SocketManager] Socket belum connect'); return; }
    _socket.emit(event, data);
  }

  // ── Daftarkan listener event dari server ───
  function on(event, callback) {
    if (!_socket) { console.warn('[SocketManager] Socket belum connect'); return; }
    _socket.on(event, callback);
  }

  // ── Hapus listener ─────────────────────────
  function off(event) {
    if (!_socket) return;
    _socket.off(event);
  }

  // ── Status koneksi ─────────────────────────
  function isConnected() {
    return _socket && _socket.connected;
  }

  // ── Disconnect ─────────────────────────────
  function disconnect() {
    if (_socket) _socket.disconnect();
    _socket = null;
  }

  return { connect, get, emit, on, off, isConnected, disconnect };
})();

if (typeof module !== 'undefined') module.exports = SocketManager;