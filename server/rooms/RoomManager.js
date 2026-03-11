// server/rooms/RoomManager.js
class RoomManager {
    constructor() {
        this.rooms = new Map();
        this.matchmakingQueue = [];
    }

    addToQueue(socketId) {
        if (!this.matchmakingQueue.includes(socketId)) {
            this.matchmakingQueue.push(socketId);
        }

        // If we have 2 players, create a match
        if (this.matchmakingQueue.length >= 2) {
            const player1 = this.matchmakingQueue.shift();
            const player2 = this.matchmakingQueue.shift();
            const roomId = `room_${Date.now()}`;

            const room = this.createRoom(roomId);
            // Storing socket IDs directly so socketHandler can use io.to(player1)
            room.players = [player1, player2];
            room.status = 'waiting_for_units'; // Give it a specific state
            this.rooms.set(roomId, room);

            return room;
        }
        return null;
    }

    removeFromQueue(socketId) {
        const index = this.matchmakingQueue.indexOf(socketId);
        if (index !== -1) {
            this.matchmakingQueue.splice(index, 1);
        }
    }

    createRoom(roomId) {
        return {
            id: roomId,
            players: [], // Maksimal 2 atau 4
            status: 'waiting', // waiting, waiting_for_units, playing, finished
            gridSize: 10,
            turn: 0,
            lastAction: Date.now()
        };
    }

    joinRoom(roomId, socketId, userData) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, this.createRoom(roomId));
        }

        const room = this.rooms.get(roomId);

        // Cek jika game sudah mulai atau penuh
        if (room.status !== 'waiting' || room.players.length >= 4) {
            return { error: 'Room tidak tersedia atau penuh' };
        }

        // Tambahkan pemain dengan atribut game lengkap
        const player = {
            id: socketId,
            username: userData?.username || 'Player',
            hp: 100,
            x: Math.floor(Math.random() * 5),
            y: Math.floor(Math.random() * 5),
            score: 0,
            isReady: false
        };

        room.players.push(player);
        return { room, player };
    }

    updatePlayerAction(roomId, socketId, moveData) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        // FIXED: Handles if player is an object or just a socket ID string
        const player = room.players.find(p => p.id === socketId || p === socketId);
        if (player && typeof player === 'object') {
            player.x = moveData.x;
            player.y = moveData.y;
            room.lastAction = Date.now();
        }
        return room;
    }

    leaveRoom(socketId) {
        let affectedRoomId = null;
        this.rooms.forEach((room, roomId) => {
            // FIXED: Check both string format (matchmaking) and object format (joinRoom)
            const index = room.players.findIndex(p => p.id === socketId || p === socketId);
            if (index !== -1) {
                room.players.splice(index, 1);
                affectedRoomId = roomId;
                if (room.players.length === 0) this.rooms.delete(roomId);
            }
        });
        return affectedRoomId;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    deleteRoom(roomId) {
        this.rooms.delete(roomId);
    }

    // --- NEW: REQUIRED FOR GAME START (PREVENTS SERVER CRASH) ---
    startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.status = 'playing';
            console.log(`[SERVER] Match started in room: ${roomId}`);
        }
    }

    endGame(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.status = 'finished';
            console.log(`[SERVER] Match finished in room: ${roomId}`);
            // You can choose to automatically delete the room here,
            // or wait for players to disconnect.
            this.deleteRoom(roomId);
        }
    }
}

export const roomManager = new RoomManager();