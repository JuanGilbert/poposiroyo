export function socketHandler(io, socket, roomManager){

  console.log("Player connected:", socket.id)

  /*
  ========================
  RANDOM MATCH
  ========================
  */

  socket.on("find_match",()=>{

    const room = roomManager.addToQueue(socket.id)

    if(room){

      room.players.forEach(player=>{
        io.sockets.sockets.get(player)?.join(room.id)
      })

      io.to(room.id).emit("match_found",{
        roomId:room.id,
        players:room.players
      })
    }else{

      socket.emit("matchmaking_wait")
    }

  })

  /*
  ========================
  FRIEND MATCH
  ========================
  */

  socket.on("create_room",()=>{

    const room = roomManager.createRoom(socket.id)

    socket.join(room.id)

    socket.emit("room_created",{
      roomId:room.id
    })
  })

  socket.on("join_room",(roomId)=>{

    const result = roomManager.joinRoom(roomId, socket.id)

    if(result?.error){
      socket.emit("room_error",result.error)
      return
    }

    socket.join(roomId)

    io.to(roomId).emit("player_joined",{
      players: result.players
    })

    if(result.players.length ===2){

      io.to(roomId).emit("room_ready",{
        roomId
      })
    }

  })

  /*
  ========================
  START GAME
  ========================
  */

  socket.on("start_game",(roomId)=>{

    const success = roomManager.startGame(roomId)

    if(!success) return

    io.to(roomId).emit("game_started")
  })

  /*
  ========================
  PLAYER ATTACK
  ========================
  */

  socket.on("attack",(data)=>{

    const {roomId,x,y} = data

    const room = roomManager.getRoom(roomId)

    if(!room) return

    const enemy = room.players.find(p=>p!==socket.id)

    io.to(roomId).emit("attack_result",{
      attacker: socket.id,
      x,
      y
    })

  })

  /*
  ========================
  GAME OVER
  ========================
  */

  socket.on("game_over",(roomId)=>{

    roomManager.endGame(roomId)

    io.to(roomId).emit("game_finished")

  })

  /*
  ========================
  PLAYER DISCONNECT
  ========================
  */

  socket.on("disconnect",()=>{

    console.log("Player disconnected:", socket.id)

    const roomId = roomManager.removePlayer(socket.id)

    if(roomId){

      io.to(roomId).emit("player_left")

      roomManager.deleteRoom(roomId)
    }

  })

}