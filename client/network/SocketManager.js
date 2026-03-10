import { io } from 'socket.io-client';
import { EVENTS } from '../utils/Constants.js';

let _socket = null;

export function connect() {
  if (_socket && _socket.connected) return _socket;

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  _socket = io(serverUrl);

  // Keep FE2's board_ready intercept logic just in case
  const originalEmit = _socket.emit.bind(_socket);
  _socket.emit = function(event, data, ...args) {
    if (event === EVENTS.BOARD_READY && data?.board) {
      window._myBoard = data.board;
      console.log('[SocketManager] Board disimpan ke window._myBoard');
    }
    return originalEmit(event, data, ...args);
  };

  console.log('[SocketManager] Terhubung ke server:', serverUrl);
  return _socket;
}

export function get() { return _socket; }
export function emit(event, data) { if (_socket) _socket.emit(event, data); }
export function on(event, callback) { if (_socket) _socket.on(event, callback); }
export function off(event) { if (_socket) _socket.off(event); }
export function isConnected() { return _socket && _socket.connected; }
export function disconnect() {
  if (_socket) { _socket.disconnect(); _socket = null; }
}