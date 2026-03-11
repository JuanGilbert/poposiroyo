export function socketHandler(io, socket, roomManager) {
  console.log("Player connected:", socket.id);

  socket.on("find_match", () => {
    const room = roomManager.addToQueue(socket.id);
    if(room){
      room.players.forEach(player => io.sockets.sockets.get(player)?.join(room.id));
      io.to(room.id).emit("match_found", { roomId: room.id, players: room.players });
    } else {
      socket.emit("matchmaking_wait");
    }
  });

  socket.on("cancel_matchmaking", () => {
    roomManager.removeFromQueue(socket.id);
  });

  socket.on("create_room", () => {
    const room = roomManager.createRoom(socket.id);
    socket.join(room.id);
    socket.emit("room_created", { roomId: room.id });
  });

  socket.on("join_room", (roomId) => {
    const result = roomManager.joinRoom(roomId, socket.id);
    if(result?.error){ socket.emit("room_error", result.error); return; }

    socket.join(roomId);
    io.to(roomId).emit("player_joined", { players: result.players });
    if(result.players.length === 2) io.to(roomId).emit("room_ready", { roomId });
  });

  socket.on("player_ready", (data) => {
    const { roomId, units } = data;
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    if (!room.readyPlayers) room.readyPlayers = {};
    room.readyPlayers[socket.id] = units;

    if (Object.keys(room.readyPlayers).length === 2) {
      roomManager.startGame(roomId);
      const p1 = room.players[0];
      const p2 = room.players[1];

      // FIX: Tell the clients who is Player 1 and who is Player 2!
      io.to(p1).emit("game_started", { opponentUnits: room.readyPlayers[p2], isPlayer1: true });
      io.to(p2).emit("game_started", { opponentUnits: room.readyPlayers[p1], isPlayer1: false });
    }
  });

  socket.on("combat_action", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("combat_action_received", data);
  });

  // --- ADD THIS BLOCK ---
  socket.on("game_over", (data) => {
    const { roomId, isPlayer1Winner } = data;
    socket.to(roomId).emit("game_over_received", { isPlayer1Winner });
    roomManager.endGame(roomId);
  });
  // ----------------------

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    const roomId = roomManager.removePlayer(socket.id);
    if(roomId) {
      io.to(roomId).emit("player_left");
      roomManager.deleteRoom(roomId);
    }
  });

  // --- LOBBY TIMEOUT KICK ---
  socket.on("lobby_timeout_kick", (data) => {
    const { roomId } = data;

    // If the client sent a broken ID, stop here to prevent crashes
    if (!roomId) {
      console.log("[SERVER] ❌ Received a kick request but roomId was undefined!");
      return;
    }

    console.log(`[SERVER] ⏱️ Lobby ${roomId} timed out. Kicking players.`);

    // Tell everyone in the room they are kicked
    io.to(roomId).emit("lobby_kicked", {
      reason: "Someone failed to pick their team in time!"
    });

    // Destroy the ghost room
    roomManager.deleteRoom(roomId);
  });
}