// socketHandler.js
import { roomManager } from './RoomManager.js';

export default function socketHandler(io) {
    io.on('connection', (socket) => {
        
        // 1. Join & Sync Initial State
        socket.on('join-game', (data) => {
            const result = roomManager.joinRoom(data.roomId, socket.id, data);
            
            if (result.error) {
                socket.emit('error', result.error);
                return;
            }

            socket.join(data.roomId);
            // Broadcast ke semua di room (termasuk pemain baru)
            io.to(data.roomId).emit('sync-world', result.room);
        });

        // 2. Sinkronisasi Gerakan (Sangat Penting untuk Game Kompleks)
        socket.on('move', (moveData) => {
            // moveData: { roomId, x, y }
            const updatedRoom = roomManager.updatePlayerAction(moveData.roomId, socket.id, moveData);
            
            if (updatedRoom) {
                // Gunakan broadcast.to agar tidak mengirim balik ke pengirim (mengurangi lag)
                socket.to(moveData.roomId).emit('player-moved', {
                    id: socket.id,
                    x: moveData.x,
                    y: moveData.y
                });
            }
        });

        // 3. Sinkronisasi Aksi/Serangan
        socket.on('attack', (attackData) => {
            // attackData: { roomId, targetId, damage }
            io.to(attackData.roomId).emit('player-attacked', {
                attacker: socket.id,
                target: attackData.targetId,
                damage: attackData.damage
            });
        });

        // 4. Sinkronisasi Chat/Emote (Fitur Sosial)
        socket.on('send-chat', (chatData) => {
            io.to(chatData.roomId).emit('new-chat', {
                sender: socket.id,
                message: chatData.message
            });
        });

        socket.on('disconnect', () => {
            const roomId = roomManager.leaveRoom(socket.id);
            if (roomId) {
                io.to(roomId).emit('player-left', socket.id);
            }
        });
    });
}