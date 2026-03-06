export class RoomManager {

  constructor(){
    this.rooms = {}
    this.waitingQueue = []
  }

  generateRoomId(){
    return "room_" + Math.random().toString(36).substring(2,8)
  }

  createRoom(hostId){

    const roomId = this.generateRoomId()

    const room = {
      id: roomId,
      players: [hostId],
      host: hostId,
      gameStarted:false,
      createdAt: Date.now(),
      state:"waiting"
    }

    this.rooms[roomId] = room

    return room
  }

  joinRoom(roomId, playerId){

    const room = this.rooms[roomId]

    if(!room) return {error:"ROOM_NOT_FOUND"}

    if(room.players.length >=2){
      return {error:"ROOM_FULL"}
    }

    room.players.push(playerId)

    if(room.players.length ===2){
      room.state = "ready"
    }

    return room
  }

  /*
  RANDOM MATCHMAKING
  */

  addToQueue(playerId){

    if(!this.waitingQueue.includes(playerId)){
      this.waitingQueue.push(playerId)
    }

    if(this.waitingQueue.length >=2){

      const p1 = this.waitingQueue.shift()
      const p2 = this.waitingQueue.shift()

      const room = this.createRoom(p1)

      room.players.push(p2)
      room.state = "ready"

      return room
    }

    return null
  }

  removeFromQueue(playerId){
    this.waitingQueue = this.waitingQueue.filter(p=>p!==playerId)
  }

  getRoom(roomId){
    return this.rooms[roomId]
  }

  startGame(roomId){

    const room = this.rooms[roomId]

    if(!room) return false

    room.gameStarted = true
    room.state = "playing"

    return true
  }

  endGame(roomId){

    const room = this.rooms[roomId]

    if(!room) return

    room.state = "finished"
  }

  removePlayer(playerId){

    for(const roomId in this.rooms){

      const room = this.rooms[roomId]

      if(room.players.includes(playerId)){

        room.players = room.players.filter(p=>p!==playerId)

        if(room.players.length ===0){
          delete this.rooms[roomId]
        }

        return roomId
      }
    }

    this.removeFromQueue(playerId)

    return null
  }

  deleteRoom(roomId){
    delete this.rooms[roomId]
  }

  getRooms(){
    return this.rooms
  }

  getRoomCount(){
    return Object.keys(this.rooms).length
  }

}