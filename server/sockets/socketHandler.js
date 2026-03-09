import GameManager from "../game/GameManager.js"

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

      const board1 = createBoard()
      const board2 = createBoard()

      room.game = new GameManager(room.id, board1, board2)

      io.to(room.id).emit("match_found",{
        roomId:room.id,
        players:room.players
      })

      io.to(room.id).emit("game_started")

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

    /*
    AUTO START GAME
    */

    if(result.players.length ===2){

      roomManager.startGame(roomId)

      const room = roomManager.getRoom(roomId)

      const board1 = createBoard()
      const board2 = createBoard()

      room.game = new GameManager(roomId, board1, board2)

      io.to(roomId).emit("game_started",{
        roomId
      })
    }

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

    if(!room.game) return

    const playerIndex = room.players.indexOf(socket.id)

    if(playerIndex === -1) return

    const playerId = playerIndex === 0 ? "p1" : "p2"

    const result = room.game.attack(playerId,x,y)

    io.to(roomId).emit("attack_result",result)

    if(result.gameOver){

      io.to(roomId).emit("game_finished",{
        winner:result.winner
      })

      roomManager.endGame(roomId)

    }

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



/*
========================
BOARD GENERATOR
========================
*/

function createBoard(){

  const size = 10

  const board = Array(size)
    .fill(null)
    .map(()=>Array(size).fill(0))

  return board

}