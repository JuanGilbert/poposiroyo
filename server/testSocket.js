import { io } from "socket.io-client"

const socket = io("http://localhost:3000")

socket.on("connect", () => {
  console.log("Connected:", socket.id)

  // coba random matchmaking
  socket.emit("find_match")
})

socket.on("matchmaking_wait", () => {
  console.log("Waiting for player...")
})

socket.on("match_found", (data) => {
  console.log("Match found:", data)
})

setTimeout(() => {

  socket.emit("attack", {
    roomId: "ISI_ROOM_ID",
    x: 2,
    y: 3
  })

},5000)

socket.on("room_created", (data) => {
  console.log("Room created:", data)
})

socket.on("player_joined", (data) => {
  console.log("Player joined:", data)
})

socket.on("room_ready", (data) => {
  console.log("Room ready:", data)
})

socket.on("game_started", () => {
  console.log("Game started")
})

socket.on("attack_result", (data) => {
  console.log("Attack result:", data)
})

socket.on("player_left", () => {
  console.log("Player left room")
})