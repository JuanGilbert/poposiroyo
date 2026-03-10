import express from "express"
import http from "http"
import { Server } from "socket.io"

import { socketHandler } from "./sockets/socketHandler.js"
import { RoomManager } from "./rooms/RoomManager.js"

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()

app.use(express.json())

const server = http.createServer(app)

const io = new Server(server,{
  cors:{
    origin:"*"
  }
})



/*
========================
ROOM MANAGER
========================
*/

const roomManager = new RoomManager()



/*
========================
TEMP LEADERBOARD
========================
*/

const leaderboard = []



/*
========================
SERVER STATUS
========================
*/

app.get("/status",(req,res)=>{

  res.json({
    status:"Server running",
    rooms:roomManager.getRoomCount()
  })

})



/*
========================
LEADERBOARD
========================
*/

app.get("/leaderboard",(req,res)=>{

  res.json({
    leaderboard
  })

})


app.post("/score",(req,res)=>{

  const {player,score} = req.body

  if(!player || score === undefined){

    return res.status(400).json({
      error:"player and score required"
    })

  }

  leaderboard.push({
    player,
    score,
    time:Date.now()
  })

  leaderboard.sort((a,b)=>b.score-a.score)

  res.json({
    success:true,
    leaderboard
  })

})



/*
========================
ROOM LIST
========================
*/

app.get("/rooms",(req,res)=>{

  res.json({
    rooms:roomManager.getRooms()
  })

})



/*
========================
GAME CONFIG ENDPOINT
========================
*/

app.get("/game-config",(req,res)=>{

  const configPath = path.join(__dirname,"../client/public/game-config.json")

  try{

    const config = JSON.parse(
      fs.readFileSync(configPath,"utf8")
    )

    res.json(config)

  }catch(err){

    res.status(500).json({
      error:"Failed to load game config"
    })

  }

})



/*
========================
SOCKET CONNECTION
========================
*/

io.on("connection",(socket)=>{

  console.log("Player connected:",socket.id)

  socketHandler(io,socket,roomManager)

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