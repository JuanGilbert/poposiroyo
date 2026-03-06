import express from "express"
import http from "http"
import { Server } from "socket.io"

import { socketHandler } from "./sockets/socketHandler.js"
import { RoomManager } from "./rooms/RoomManager.js"

const app = express()
app.use(express.json())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: "*"
  }
})

/*
========================
ROOM MANAGER INSTANCE
========================
*/
const roomManager = new RoomManager()

/*
========================
LEADERBOARD (temporary)
========================
*/
const leaderboard = []

/*
========================
HTTP API
========================
*/

app.get("/status", (req, res) => {
  res.json({
    status: "Server running",
    rooms: roomManager.getRoomCount()
  })
})

app.get("/leaderboard", (req, res) => {
  res.json({
    leaderboard
  })
})

app.post("/score", (req, res) => {

  const { player, score } = req.body

  if (!player || score === undefined) {
    return res.status(400).json({
      error: "player and score required"
    })
  }

  leaderboard.push({
    player,
    score,
    time: Date.now()
  })

  leaderboard.sort((a,b)=>b.score-a.score)

  res.json({
    success:true,
    leaderboard
  })
})

app.get("/rooms", (req,res)=>{
  res.json({
    rooms: roomManager.getRooms()
  })
})

/*
========================
SOCKET CONNECTION
========================
*/

io.on("connection",(socket)=>{
  socketHandler(io, socket, roomManager)
})

/*
========================
START SERVER
========================
*/

const PORT = 3000

server.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`)
})
