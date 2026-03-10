import { io } from 'socket.io-client';

let _socket = null;

export function connect() {
  if (_socket && _socket.connected) return _socket;

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  _socket = io(serverUrl);

  console.log('[SocketManager] Terhubung ke server');
  return _socket;
}

export function get() { return _socket; }

export function emit(event, data) {
  if (!_socket) { console.warn('[SocketManager] Socket belum connect'); return; }
  _socket.emit(event, data);
}

export function on(event, callback) {
  if (!_socket) { console.warn('[SocketManager] Socket belum connect'); return; }
  _socket.on(event, callback);
}

export function off(event) {
  if (!_socket) return;
  _socket.off(event);
}

export function isConnected() {
  return _socket && _socket.connected;
}

export function disconnect() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}