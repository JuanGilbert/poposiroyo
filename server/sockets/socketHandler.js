// socketHandler.js
let rooms = {}; // semua room aktif

module.exports = (io) => {

  function checkWin(board) {
    for (let row of board) for (let cell of row) if (cell === 1) return false;
    return true;
  }

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // ===== FRIEND MATCH =====
    socket.on("create_room", () => {
      const roomId = "room_" + Date.now();
      rooms[roomId] = { players: [socket.id], boards: {}, turn: null, shots: {} };
      socket.join(roomId);
      socket.emit("room_created", roomId);
    });

    socket.on("join_room", (roomId) => {
      const room = rooms[roomId];
      if (!room) return socket.emit("error", "Room tidak ditemukan");
      if (room.players.length >= 2) return socket.emit("error", "Room penuh");

      room.players.push(socket.id);
      socket.join(roomId);
      io.to(roomId).emit("player_joined");

      if (room.players.length === 2) {
        room.turn = room.players[0];
        io.to(roomId).emit("start_game", room.turn);
      }
    });

    // ===== RANDOM MATCH =====
    socket.on("find_match", () => {
      let roomEntry = Object.entries(rooms).find(([id, r]) => r.players.length < 2);
      if (!roomEntry) {
        const roomId = "room_" + Date.now();
        rooms[roomId] = { players: [socket.id], boards: {}, turn: null, shots: {} };
        socket.join(roomId);
        socket.emit("room_created", roomId);
      } else {
        const [roomId, room] = roomEntry;
        room.players.push(socket.id);
        socket.join(roomId);
        io.to(roomId).emit("player_joined");
        if (room.players.length === 2) {
          room.turn = room.players[0];
          io.to(roomId).emit("start_game", room.turn);
        }
      }
    });

    // ===== SET BOARD =====
    socket.on("set_board", ({ roomId, board }) => {
      const room = rooms[roomId];
      if (!room) return socket.emit("error", "Room tidak ditemukan");
      room.boards[socket.id] = board;
      room.shots[socket.id] = [];
    });

    // ===== ATTACK =====
    socket.on("attack", ({ roomId, x, y }) => {
      const room = rooms[roomId];
      if (!room) return socket.emit("error", "Room tidak ditemukan");
      if (room.turn !== socket.id) return socket.emit("error", "Bukan giliranmu");
      if (x < 0 || x >= 8 || y < 0 || y >= 8) return socket.emit("error", "Koordinat tidak valid");

      const enemy = room.players.find(p => p !== socket.id);
      if (!room.boards[enemy]) return socket.emit("error", "Enemy board belum disiapkan");

      const board = room.boards[enemy];
      const shotKey = `${x},${y}`;
      if (room.shots[socket.id].includes(shotKey)) return;

      room.shots[socket.id].push(shotKey);

      let result = "miss";
      if (board[y][x] === 1) {
        result = "hit";
        board[y][x] = "hit";
      }

      io.to(roomId).emit("attack_result", { attacker: socket.id, x, y, result });

      if (checkWin(board)) {
        io.to(roomId).emit("game_over", { winner: socket.id });
        delete rooms[roomId];
        return;
      }

      room.turn = enemy;
      io.to(roomId).emit("next_turn", room.turn);
    });

    // ===== DISCONNECT =====
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
};

// untuk HTTP GET rooms
module.exports.getRooms = () => rooms;