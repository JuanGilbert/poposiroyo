// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import socketHandler from './socketHandler.js';

const app = express();
const server = createServer(app);

// Inisialisasi Socket.io dengan konfigurasi High-Performance
const io = new Server(server, {
    cors: { origin: "*" },
    pingTimeout: 60000, // Menghindari pemain DC karena lag sebentar
});

// Jalankan sistem sinkronisasi
socketHandler(io);

// Middleware sederhana untuk monitoring server
app.get('/status', (req, res) => {
    res.send({ status: 'Game Server Running', time: new Date() });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`=== PO POSI ROYO SERVER READY ===`);
    console.log(`Port: ${PORT} | Mode: ESM (No Require)`);
});