const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// MATCHMAKING QUEUE
let queue = []; 

io.on('connection', (socket) => {
  console.log('User Connected:', socket.id);

  // 1. Handle Join Queue
  socket.on('join_queue', (userData) => {
    console.log(`${userData.name} joined queue`);
    
    // Add to queue with socket ID and user info
    queue.push({ socketId: socket.id, userData });

    // Check if we can make a match
    if (queue.length >= 2) {
      const p1 = queue.shift();
      const p2 = queue.shift();

      const roomId = `room_${p1.socketId}_${p2.socketId}`;

      // Join both to a unique room
      io.to(p1.socketId).socketsJoin(roomId);
      io.to(p2.socketId).socketsJoin(roomId);

      // Notify P1 (You are Player A)
      io.to(p1.socketId).emit('match_found', {
        roomId,
        opponent: p2.userData,
        role: 'host' // Host starts on Left side logic usually
      });

      // Notify P2 (You are Player B)
      io.to(p2.socketId).emit('match_found', {
        roomId,
        opponent: p1.userData,
        role: 'challenger'
      });

      console.log(`Match created: ${p1.userData.name} vs ${p2.userData.name}`);
    }
  });

  // 2. Handle Game Actions (Tug of War)
  socket.on('send_damage', ({ roomId, damage }) => {
    // Broadcast to the OTHER person in the room
    socket.to(roomId).emit('receive_damage', damage);
  });

  // 3. Handle Game Over / Finisher
  socket.on('send_finisher', ({ roomId, type }) => {
    socket.to(roomId).emit('receive_finisher', type); // 'roasted' or 'spared'
  });

  // 4. Disconnect
  socket.on('disconnect', () => {
    // Remove from queue if they leave before matching
    queue = queue.filter(p => p.socketId !== socket.id);
    console.log('User Disconnected', socket.id);
  });
});

server.listen(3001, () => {
  console.log('SERVER RUNNING ON PORT 3001');
});