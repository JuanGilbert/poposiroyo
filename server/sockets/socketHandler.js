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

  // --- SETUP PHASE SYNC ---
  socket.on("player_ready", (data) => {
    const { roomId, units } = data;
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    if (!room.readyPlayers) room.readyPlayers = {};
    room.readyPlayers[socket.id] = units;

    // When both players have placed their units on the board:
    if (Object.keys(room.readyPlayers).length === 2) {
      roomManager.startGame(roomId);
      const p1 = room.players[0];
      const p2 = room.players[1];

      // Give P1 the data for P2's units, and vice versa
      io.to(p1).emit("game_started", { opponentUnits: room.readyPlayers[p2] });
      io.to(p2).emit("game_started", { opponentUnits: room.readyPlayers[p1] });
    }
  });

  // --- COMBAT RELAY ---
  socket.on("combat_action", (data) => {
    const { roomId } = data;
    // Broadcast the exact move to the opponent
    socket.to(roomId).emit("combat_action_received", data);
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    const roomId = roomManager.removePlayer(socket.id);
    if(roomId) {
      io.to(roomId).emit("player_left");
      roomManager.deleteRoom(roomId);
    }
  });
}