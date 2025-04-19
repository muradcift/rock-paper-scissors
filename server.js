const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIO(server, {
    cors: {
        origin: ["https://your-netlify-site.netlify.app", "http://localhost:3000"], // Add your Netlify URL here
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Game rooms
const rooms = {};
const usernames = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Set username
    socket.on('setUsername', (username) => {
        usernames[socket.id] = username;
        socket.emit('usernameSet', username);
    });

    // Create or join a room
    socket.on('joinGame', (roomID) => {
        let room = rooms[roomID];
        
        // Create room if it doesn't exist
        if (!room) {
            rooms[roomID] = {
                id: roomID,
                players: [socket.id],
                state: 'waiting'
            };
            socket.join(roomID);
            socket.emit('waiting', { roomID });
            console.log(`Room ${roomID} created by ${socket.id}`);
        } 
        // Join existing room if there's space
        else if (room.players.length === 1 && room.state === 'waiting') {
            room.players.push(socket.id);
            room.state = 'playing';
            socket.join(roomID);
            
            // Inform both players that game is starting
            io.to(roomID).emit('gameStart', { 
                roomID,
                players: room.players.map(id => ({
                    id,
                    username: usernames[id] || 'Player'
                }))
            });
            console.log(`${socket.id} joined room ${roomID}`);
        } else {
            socket.emit('roomFull');
        }
    });

    // Handle player choice
    socket.on('playerChoice', ({ roomID, choice }) => {
        const room = rooms[roomID];
        if (!room) return;
        
        // Store player's choice
        if (!room.choices) {
            room.choices = {};
        }
        room.choices[socket.id] = choice;
        
        // Check if both players have made their choices
        if (Object.keys(room.choices).length === 2) {
            const players = room.players;
            const choices = room.choices;
            
            // Determine the result
            let result = {};
            
            // Send results to both players
            io.to(roomID).emit('gameResult', {
                choices,
                result: determineWinner(choices[players[0]], choices[players[1]]),
                players: {
                    player1: { id: players[0], username: usernames[players[0]] || 'Player 1' },
                    player2: { id: players[1], username: usernames[players[1]] || 'Player 2' }
                }
            });
            
            // Reset choices for next round
            delete room.choices;
        } else {
            // Tell the player to wait for opponent
            socket.emit('waitingForOpponent');
        }
    });

    // Handle play again request
    socket.on('playAgain', ({ roomID }) => {
        const room = rooms[roomID];
        if (!room) return;
        
        // Track players ready for next round
        if (!room.readyPlayers) {
            room.readyPlayers = [];
        }
        
        if (!room.readyPlayers.includes(socket.id)) {
            room.readyPlayers.push(socket.id);
        }
        
        // If both players are ready, start a new round
        if (room.readyPlayers.length === 2) {
            io.to(roomID).emit('newRound');
            room.readyPlayers = [];
        } else {
            socket.emit('waitingForRematch');
        }
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Find and clean up rooms where this player was
        for (const roomID in rooms) {
            const room = rooms[roomID];
            if (room.players.includes(socket.id)) {
                io.to(roomID).emit('playerDisconnected', { 
                    id: socket.id,
                    username: usernames[socket.id] || 'Player'
                });
                
                // Remove the room if it's now empty
                if (room.players.length <= 1) {
                    delete rooms[roomID];
                } else {
                    // Remove player from the room
                    room.players = room.players.filter(id => id !== socket.id);
                    room.state = 'waiting';
                }
            }
        }
        
        // Clean up username
        delete usernames[socket.id];
    });
});

// Function to determine the winner
function determineWinner(choice1, choice2) {
    if (choice1 === choice2) {
        return 'tie';
    }
    if (
        (choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'paper' && choice2 === 'rock') ||
        (choice1 === 'scissors' && choice2 === 'paper')
    ) {
        return 'player1';
    }
    return 'player2';
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
