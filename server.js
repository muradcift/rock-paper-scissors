const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Add specific route for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Game state
const rooms = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle joining room
  socket.on('joinRoom', (roomId) => {
    // Join the socket.io room
    socket.join(roomId);
    
    // Initialize the room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: {},
        playerCount: 0
      };
    }
    
    // Add player to the room if not already there
    if (!rooms[roomId].players[socket.id]) {
      rooms[roomId].players[socket.id] = {
        id: socket.id,
        choice: null
      };
      rooms[roomId].playerCount++;
    }
    
    // Notify the player they've joined
    socket.emit('gameUpdate', { message: `You've joined room ${roomId}` });
    
    // If room is full (2 players), notify both players
    if (rooms[roomId].playerCount === 1) {
      socket.emit('gameUpdate', { message: 'Waiting for an opponent to join...' });
    } else if (rooms[roomId].playerCount === 2) {
      // Notify all players in the room
      io.to(roomId).emit('gameUpdate', { message: 'Game is ready! Make your choice.' });
    } else {
      // More than 2 players - notify that room is full
      socket.emit('gameUpdate', { message: 'Room is full, spectating only.' });
    }
    
    console.log(`Player ${socket.id} joined room ${roomId}. Players in room: ${rooms[roomId].playerCount}`);
  });
  
  // Handle player choice
  socket.on('playerChoice', (data) => {
    const { room, choice } = data;
    
    if (!rooms[room] || !rooms[room].players[socket.id]) {
      socket.emit('gameUpdate', { message: 'Invalid room or player' });
      return;
    }
    
    // Store the player's choice
    rooms[room].players[socket.id].choice = choice;
    socket.emit('gameUpdate', { message: `You chose ${choice}` });
    
    // Check if both players have made choices
    const players = Object.values(rooms[room].players);
    if (players.length === 2 && players[0].choice && players[1].choice) {
      // Both players have made choices, determine the winner
      const result = determineWinner(players[0].choice, players[1].choice);
      
      // Send the result to all players in the room
      io.to(room).emit('gameResult', { 
        message: result,
        player1: { id: players[0].id, choice: players[0].choice },
        player2: { id: players[1].id, choice: players[1].choice }
      });
      
      // Reset choices for next round
      players.forEach(player => {
        player.choice = null;
      });
      
      // After results, prompt for next round
      setTimeout(() => {
        io.to(room).emit('gameUpdate', { message: 'Ready for next round!' });
      }, 3000);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from all rooms they were in
    for (const roomId in rooms) {
      if (rooms[roomId].players && rooms[roomId].players[socket.id]) {
        delete rooms[roomId].players[socket.id];
        rooms[roomId].playerCount--;
        
        // Notify other players in the room
        socket.to(roomId).emit('gameUpdate', { message: 'Opponent has left the game.' });
        
        // Clean up empty rooms
        if (rooms[roomId].playerCount === 0) {
          delete rooms[roomId];
        }
      }
    }
  });
});

// Function to determine the winner
function determineWinner(choice1, choice2) {
  if (choice1 === choice2) {
    return "It's a tie!";
  }
  
  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) {
    return "Player 1 wins!";
  } else {
    return "Player 2 wins!";
  }
}

// Use PORT from environment variable for Render deployment
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
