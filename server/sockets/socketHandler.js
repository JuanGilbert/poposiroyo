export function socketHandler(io, socket, roomManager) {
  console.log("Player connected:", socket.id);

  // --- MATCHMAKING LOGIC (FIXED) ---
  socket.on("find_match", () => {
    console.log(`[MATCHMAKING] Player ${socket.id} started searching...`);

    const room = roomManager.addToQueue(socket.id);

    if (room) {
      // Logic: If room is returned, a match was found!
      console.log(`[MATCHMAKING] Match Found! Room: ${room.id}`);

      room.players.forEach(pid => {
        const playerSocket = io.sockets.sockets.get(pid);
        if (playerSocket) playerSocket.join(room.id);
      });

      // Notify clients to move to LobbyScene
      io.to(room.id).emit("match_found", { roomId: room.id, players: room.players });
    } else {
      // No match yet, tell client to stay in "Searching" state
      socket.emit("matchmaking_wait");
    }
  });

  socket.on("cancel_matchmaking", () => {
    console.log(`[MATCHMAKING] Player ${socket.id} cancelled.`);
    roomManager.removeFromQueue(socket.id);
  });

  // --- ROOM LOGIC ---
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

  // --- GAMEPLAY LOGIC (KEEPS YOUR ISPLAYER1 FIX) ---
  // --- PHASE 1: LOBBY (Character Selection) ---
  socket.on("lobby_ready", (data) => {
    const { roomId, units } = data;
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    if (!room.lobbyReadyPlayers) room.lobbyReadyPlayers = {};
    room.lobbyReadyPlayers[socket.id] = units;

    // When both players lock in their characters, move to the GameScene/Placement
    if (Object.keys(room.lobbyReadyPlayers).length === 2) {
      const p1 = room.players[0].id || room.players[0];
      const p2 = room.players[1].id || room.players[1];

      io.to(p1).emit("game_started", { isPlayer1: true });
      io.to(p2).emit("game_started", { isPlayer1: false });
    }
  });

  // --- PHASE 2: PLACEMENT (Board Setup) ---
  socket.on("board_ready", (data) => {
    const { roomId, units } = data;
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    if (!room.boardReadyPlayers) room.boardReadyPlayers = {};
    room.boardReadyPlayers[socket.id] = units;

    // When both players finish dragging units, start the actual combat!
    if (Object.keys(room.boardReadyPlayers).length === 2) {
      roomManager.startGame(roomId);

      const p1 = room.players[0].id || room.players[0];
      const p2 = room.players[1].id || room.players[1];

      // Cross over the placement data to opponents
      io.to(p1).emit("combat_started", { opponentUnits: room.boardReadyPlayers[p2] });
      io.to(p2).emit("combat_started", { opponentUnits: room.boardReadyPlayers[p1] });
    }
  });

  socket.on("combat_action", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("combat_action_received", data);
  });

  socket.on("game_over", (data) => {
    const { roomId, isPlayer1Winner } = data;
    socket.to(roomId).emit("game_over_received", { isPlayer1Winner });
    roomManager.endGame(roomId);
  });

  // --- LOBBY TIMEOUT KICK (YOUR LOGIC) ---
  socket.on("lobby_timeout_kick", (data) => {
    const { roomId } = data;
    if (!roomId) return;

    console.log(`[SERVER] ⏱️ Lobby ${roomId} timed out.`);
    io.to(roomId).emit("lobby_kicked", {
      reason: "Someone failed to pick their team in time!"
    });
    roomManager.deleteRoom(roomId);
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    // Remove from matchmaking if they were searching
    if (roomManager.removeFromQueue) {
      roomManager.removeFromQueue(socket.id);
    }

    // FIXED: Use leaveRoom instead of removePlayer
    const roomId = roomManager.leaveRoom(socket.id);

    if(roomId) {
      io.to(roomId).emit("player_left");
      roomManager.deleteRoom(roomId);
    }
  });
}