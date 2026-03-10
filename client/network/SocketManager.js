import { io } from 'socket.io-client';

class SocketManagerClass {
  constructor() {
    this._socket = null;
  }

  connect() {
    if (this._socket && this._socket.connected) return this._socket;

    // Automatically uses localhost for dev, but safe for mobile/production builds
    const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
    this._socket = io(serverUrl);

    this._socket.on('connect', () => {
      console.log(`[SocketManager] Connected to server: ${serverUrl}`);
    });

    return this._socket;
  }

  get() { return this._socket; }
  emit(event, data) { if (this._socket) this._socket.emit(event, data); }
  on(event, callback) { if (this._socket) this._socket.on(event, callback); }
  off(event) { if (this._socket) this._socket.off(event); }
  isConnected() { return this._socket && this._socket.connected; }
  disconnect() {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
  }
}

export const SocketManager = new SocketManagerClass();