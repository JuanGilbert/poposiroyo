// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./sockets/socketHandler");

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ======= LEADERBOARD =======
const leaderboard = [];

// status server
app.get("/status", (req, res) => res.json({ status: "Server is running" }));

// lihat leaderboard
app.get("/leaderboard", (req, res) => res.json({ leaderboard }));

// simpan score
app.post("/score", (req, res) => {
  const { player, score } = req.body;
  if (!player || score == null) return res.status(400).json({ error: "Player & score required" });

  leaderboard.push({ player, score });
  res.json({ message: "Score saved", leaderboard });
});

// lihat semua room aktif
app.get("/rooms", (req, res) => {
  res.json({ rooms: socketHandler.getRooms() }); // ambil rooms dari handler
});

// ======= SOCKET.IO GAME LOGIC =======
socketHandler(io); // inject io ke handler

// ======= START SERVER =======
server.listen(3000, () => console.log("Server running on port 3000"));
