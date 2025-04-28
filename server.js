const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);


const io = socketIO(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'] 
});


app.use(express.static(path.join(__dirname)));


app.get('/config.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'config.js'));
});


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});


app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Rock Paper Scissors server is running!',
    time: new Date().toISOString()
  });
});


const rooms = {};


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  

  socket.on('joinRoom', (data) => {
    const { roomId, username } = data;
    
    
    socket.join(roomId);
    
    
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: {},
        playerCount: 0
      };
    }
    
    
    if (!rooms[roomId].players[socket.id]) {
      rooms[roomId].players[socket.id] = {
        id: socket.id,
        username: username || `Player ${rooms[roomId].playerCount + 1}`,
        choice: null
      };
      rooms[roomId].playerCount++;
    }
    
    
    socket.emit('gameUpdate', { message: `You've joined room ${roomId}` });
    
    
    if (rooms[roomId].playerCount === 1) {
      socket.emit('waiting', { roomID: roomId });
      socket.emit('gameUpdate', { message: 'Waiting for an opponent to join...' });
    } else if (rooms[roomId].playerCount === 2) {
      
      const playersArray = Object.values(rooms[roomId].players);
      
      
      io.to(roomId).emit('gameStart', { 
        roomID: roomId,
        players: playersArray 
      });
      
      
    } else {
      
      socket.emit('roomFull');
      socket.emit('gameUpdate', { message: 'Room is full, spectating only.' });
    }
    
    console.log(`Player ${socket.id} (${username}) joined room ${roomId}. Players in room: ${rooms[roomId].playerCount}`);
  });
  

  socket.on('playerChoice', (data) => {
    const { room, choice } = data;
    
    if (!rooms[room] || !rooms[room].players[socket.id]) {
      socket.emit('gameUpdate', { message: 'Invalid room or player' });
      return;
    }
    
    
    rooms[room].players[socket.id].choice = choice;
    socket.emit('gameUpdate', { message: `You chose ${choice}` });
    
    
    const players = Object.values(rooms[room].players);
    if (players.length === 2 && players[0].choice && players[1].choice) {
      
      const result = determineWinner(players[0], players[1]);
      
      
      io.to(room).emit('gameResult', { 
        message: result.message,
        player1: { id: players[0].id, choice: players[0].choice, username: players[0].username },
        player2: { id: players[1].id, choice: players[1].choice, username: players[1].username },
        winner: result.winnerId
      });
      
      
      players.forEach(player => {
        player.choice = null;
      });
      
      
      setTimeout(() => {
        io.to(room).emit('gameUpdate', { message: 'Ready for next round!' });
      }, 3000);
    }
  });
  

  socket.on('leaveRoom', (roomId) => {
    handlePlayerLeaving(socket, roomId);
  });
  

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    
    for (const roomId in rooms) {
      handlePlayerLeaving(socket, roomId);
    }
  });
});


function handlePlayerLeaving(socket, roomId) {
  if (rooms[roomId] && rooms[roomId].players && rooms[roomId].players[socket.id]) {
    const username = rooms[roomId].players[socket.id].username;
    
    delete rooms[roomId].players[socket.id];
    rooms[roomId].playerCount--;
    
    
    socket.to(roomId).emit('gameUpdate', { message: `${username} has left the game.` });
    
    
    if (rooms[roomId].playerCount === 0) {
      delete rooms[roomId];
    }
    
    
    socket.leave(roomId);
  }
}


function determineWinner(player1, player2) {
  const choice1 = player1.choice;
  const choice2 = player2.choice;
  
  if (choice1 === choice2) {
    return {
      message: "It's a tie!",
      winnerId: null
    };
  }
  
  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) {
    return {
      message: `${player1.username} wins with ${choice1} against ${choice2}!`,
      winnerId: player1.id
    };
  } else {
    return {
      message: `${player2.username} wins with ${choice2} against ${choice1}!`,
      winnerId: player2.id
    };
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
