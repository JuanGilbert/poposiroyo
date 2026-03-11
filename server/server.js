// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketHandler } from './sockets/socketHandler.js'; // Pastikan path benar
import { roomManager } from './rooms/RoomManager.js'; // Impor roomManager

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Pindahkan logika connection ke sini
io.on('connection', (socket) => {
    socketHandler(io, socket, roomManager);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`=== SERVER RUNNING ON PORT ${PORT} ===`);
});