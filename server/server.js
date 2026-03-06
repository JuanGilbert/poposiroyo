const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const rooms = {};

function checkWin(board) {
  for (let row of board) {
    for (let cell of row) {
      if (cell === 1) return false;
    }
  }
  return true;
}

io.on("connection", (socket) => {

  console.log("Player connected:", socket.id);

  // CREATE ROOM
  socket.on("create_room", () => {

    const roomId = "room_" + Date.now();

    rooms[roomId] = {
      players: [socket.id],
      boards: {},
      turn: null,
      shots: {}
    };

    socket.join(roomId);

    socket.emit("room_created", roomId);
  });

  // JOIN ROOM
  socket.on("join_room", (roomId) => {

    const room = rooms[roomId];

    if (!room) return socket.emit("error", "Room tidak ditemukan");

    if (room.players.length >= 2)
      return socket.emit("error", "Room penuh");

    room.players.push(socket.id);
    socket.join(roomId);

    io.to(roomId).emit("player_joined");

    if (room.players.length === 2) {
      room.turn = room.players[0];
      io.to(roomId).emit("start_game", room.turn);
    }
  });

  // SAVE BOARD
  socket.on("set_board", ({ roomId, board }) => {

    const room = rooms[roomId];
    if (!room) return;

    room.boards[socket.id] = board;
    room.shots[socket.id] = [];

  });

  // ATTACK
  socket.on("attack", ({ roomId, x, y }) => {

    const room = rooms[roomId];
    if (!room) return;

    if (room.turn !== socket.id) return;

    if (x < 0 || x > 7 || y < 0 || y > 7) return;

    const enemy = room.players.find(p => p !== socket.id);

    const board = room.boards[enemy];

    const shotKey = `${x},${y}`;

    if (room.shots[socket.id].includes(shotKey)) return;

    room.shots[socket.id].push(shotKey);

    let result = "miss";

    if (board[y][x] === 1) {
      result = "hit";
      board[y][x] = "hit";
    }

    io.to(roomId).emit("attack_result", {
      attacker: socket.id,
      x,
      y,
      result
    });

    if (checkWin(board)) {

      io.to(roomId).emit("game_over", {
        winner: socket.id
      });

      delete rooms[roomId];
      return;
    }

    room.turn = enemy;

    io.to(roomId).emit("next_turn", room.turn);

  });

  // DISCONNECT
  socket.on("disconnect", () => {

    console.log("Player disconnected:", socket.id);

    for (const roomId in rooms) {

      const room = rooms[roomId];

      if (room.players.includes(socket.id)) {

        io.to(roomId).emit("player_left");

        delete rooms[roomId];
      }

    }

  });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});