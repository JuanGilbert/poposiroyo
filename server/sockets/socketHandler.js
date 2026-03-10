export function socketHandler(io, socket, roomManager){
  console.log("Player connected:", socket.id);

  /* --- RANDOM MATCH --- */
  socket.on("find_match", () => {
    const room = roomManager.addToQueue(socket.id);
    if(room){
      room.players.forEach(player => {
        io.sockets.sockets.get(player)?.join(room.id);
      });
      // ONLY emit match_found. Do not start the game yet!
      io.to(room.id).emit("match_found", { roomId: room.id, players: room.players });
    } else {
      socket.emit("matchmaking_wait");
    }
  });

  /* --- FRIEND MATCH --- */
  socket.on("create_room", () => {
    const room = roomManager.createRoom(socket.id);
    socket.join(room.id);
    socket.emit("room_created", { roomId: room.id });
  });

  socket.on("join_room", (roomId) => {
    const result = roomManager.joinRoom(roomId, socket.id);
    if(result?.error){
      socket.emit("room_error", result.error);
      return;
    }
    socket.join(roomId);
    io.to(roomId).emit("player_joined", { players: result.players });

    if(result.players.length === 2){
      // Again, just say the room is ready. Do not start the game yet!
      io.to(roomId).emit("room_ready", { roomId });
    }
  });

  /* --- SETUP PHASE SYNC (NEW!) --- */
  socket.on("player_ready", (data) => {
    const { roomId, units } = data;
    const room = roomManager.getRoom(roomId);

    if (!room) return;
    if (!room.readyPlayers) room.readyPlayers = {};

    // Save this player's specific RPG units and grid coordinates
    room.readyPlayers[socket.id] = units;

    // If both players have submitted their boards, START THE COMBAT!
    if (Object.keys(room.readyPlayers).length === 2) {
      roomManager.startGame(roomId);
      const p1 = room.players[0];
      const p2 = room.players[1];

      // Swap the boards: Give P1 the data for P2's units, and vice versa
      io.to(p1).emit("game_started", { opponentUnits: room.readyPlayers[p2], myTurn: true });
      io.to(p2).emit("game_started", { opponentUnits: room.readyPlayers[p1], myTurn: false });
    }
  });

  /* --- DISCONNECT --- */
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    const roomId = roomManager.removePlayer(socket.id);
    if(roomId){
      io.to(roomId).emit("player_left");
      roomManager.deleteRoom(roomId);
    }
  });
}