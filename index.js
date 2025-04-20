// ROCK PAPER SCISSORS - MULTIPLAYER VERSION

// DOM Elements
const playerDisplay = document.getElementById("playerDisplay");
const computerDisplay = document.getElementById("computerDisplay");
const resultDisplay = document.getElementById("resultDisplay");
const playerScoreDisplay = document.getElementById("playerScoreDisplay");
const computerScoreDisplay = document.getElementById("computerScoreDisplay");
const playerScoreLabel = document.getElementById("playerScoreLabel");
const computerScoreLabel = document.getElementById("computerScoreLabel");
const playerTitle = document.getElementById("playerTitle");
const computerTitle = document.getElementById("computerTitle");
const resetButton = document.getElementById("resetGame");
const changeModeButton = document.getElementById("changeMode");
const connectionStatus = document.getElementById("connectionStatus");
const gameSetupModal = document.getElementById("gameSetupModal");
const usernameInput = document.getElementById("username");
const roomIdInput = document.getElementById("roomId");
const generateRoomIdBtn = document.getElementById("generateRoomId");
const joinGameBtn = document.getElementById("joinGameBtn");
const playOfflineBtn = document.getElementById("playOffline");
const setupMessage = document.getElementById("setupMessage");
const waitingOverlay = document.getElementById("waitingOverlay");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const copyRoomCodeBtn = document.getElementById("copyRoomCode");
const cancelWaitingBtn = document.getElementById("cancelWaiting");
const onlineInfo = document.getElementById("onlineInfo");
const playerName = document.getElementById("playerName");
const currentRoom = document.getElementById("currentRoom");
const opponentName = document.getElementById("opponentName");
const gamePrompt = document.getElementById("gamePrompt");

// Game state
const choices = ["rock", "paper", "scissors"];
let playerScore = 0;
let computerScore = 0;
let isOnlineGame = false;
let socket;
let currentRoomId = null;
let username = "";
let opponentUsername = "";
let waitingForOpponent = false;
let playerChoice = null;

// Initialize the game
window.onload = function() {
    gameSetupModal.style.display = "flex";
    setupEventListeners();
};

// Setup all event listeners
function setupEventListeners() {
    resetButton.addEventListener('click', resetGame);
    changeModeButton.addEventListener('click', showGameSetup);
    generateRoomIdBtn.addEventListener('click', generateRandomRoomId);
    joinGameBtn.addEventListener('click', handleJoinGame);
    playOfflineBtn.addEventListener('click', startOfflineGame);
    copyRoomCodeBtn.addEventListener('click', copyRoomCodeToClipboard);
    cancelWaitingBtn.addEventListener('click', cancelWaiting);
}

// Generate a random room ID
function generateRandomRoomId() {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    roomIdInput.value = roomId;
}

// Handle joining an online game
function handleJoinGame() {
    username = usernameInput.value.trim();
    const roomId = roomIdInput.value.trim();
    
    if (!username) {
        setupMessage.textContent = "Please enter your name";
        return;
    }
    
    if (!roomId) {
        setupMessage.textContent = "Please enter a room code or generate one";
        return;
    }
    
    setupMessage.textContent = "Connecting...";
    connectToServer();
    
    // Wait for connection before joining
    setTimeout(() => {
        if (socket && socket.connected) {
            socket.emit('setUsername', username);
            socket.emit('joinGame', roomId);
            currentRoomId = roomId;
        } else {
            setupMessage.textContent = "Connection failed. Please try again.";
        }
    }, 1000);
}

// Connect to the Socket.io server
function connectToServer() {
    updateConnectionStatus('connecting');
    
    try {
        // Replace the hardcoded URL with the current origin
        socket = io(window.location.origin);
        
        socket.on('connect', () => {
            updateConnectionStatus('online');
            
            // Socket event handlers
            socket.on('waiting', handleWaiting);
            socket.on('gameStart', handleGameStart);
            socket.on('usernameSet', handleUsernameSet);
            socket.on('gameResult', handleGameResult);
            socket.on('waitingForOpponent', () => {
                gamePrompt.textContent = "Waiting for opponent's choice...";
            });
            socket.on('playerDisconnected', handlePlayerDisconnected);
            socket.on('roomFull', () => {
                setupMessage.textContent = "Room is full. Please try another room.";
            });
            socket.on('newRound', startNewRound);
            socket.on('waitingForRematch', () => {
                gamePrompt.textContent = "Waiting for opponent to play again...";
            });
        });
        
        socket.on('disconnect', () => {
            updateConnectionStatus('offline');
            if (isOnlineGame) {
                showGameSetup();
                alert("Disconnected from server. Please reconnect.");
            }
        });
        
        socket.on('connect_error', () => {
            updateConnectionStatus('offline');
            setupMessage.textContent = "Server connection error. Is the server running?";
        });
    } catch (error) {
        console.error("Connection error:", error);
        updateConnectionStatus('offline');
        setupMessage.textContent = "Failed to connect to server: " + error.message;
    }
}

// Display waiting screen when waiting for opponent
function handleWaiting(data) {
    gameSetupModal.style.display = "none";
    waitingOverlay.classList.remove('hidden');
    roomCodeDisplay.textContent = data.roomID;
    waitingForOpponent = true;
}

// Handle game start when opponent joins
function handleGameStart(data) {
    waitingOverlay.classList.add('hidden');
    onlineInfo.classList.remove('hidden');
    waitingForOpponent = false;
    isOnlineGame = true;
    
    // Find opponent
    const players = data.players;
    for (let player of players) {
        if (player.id !== socket.id) {
            opponentUsername = player.username;
            opponentName.textContent = opponentUsername;
            break;
        }
    }
    
    playerName.textContent = username;
    currentRoom.textContent = data.roomID;
    
    // Update UI for online game
    playerScoreLabel.textContent = "You";
    computerScoreLabel.textContent = "Opponent";
    playerTitle.textContent = "You chose";
    computerTitle.textContent = "Opponent chose";
    resetGame();
    
    gamePrompt.textContent = "Make your choice";
}

// Handle username confirmation
function handleUsernameSet(confirmedUsername) {
    username = confirmedUsername;
}

// Start offline game
function startOfflineGame() {
    gameSetupModal.style.display = "none";
    isOnlineGame = false;
    onlineInfo.classList.add('hidden');
    
    // Set UI for offline game
    playerScoreLabel.textContent = "Player";
    computerScoreLabel.textContent = "Computer";
    playerTitle.textContent = "You chose";
    computerTitle.textContent = "Computer chose";
    resetGame();
}

// Show game setup modal
function showGameSetup() {
    gameSetupModal.style.display = "flex";
    setupMessage.textContent = "";
    
    // Disconnect from current game if online
    if (socket && isOnlineGame) {
        socket.disconnect();
    }
    
    // Reset the game state
    isOnlineGame = false;
    currentRoomId = null;
    waitingForOpponent = false;
    playerChoice = null;
    resetGame();
}

// Update connection status in UI
function updateConnectionStatus(status) {
    const statusDot = connectionStatus.querySelector('.status-dot');
    const statusText = connectionStatus.querySelector('span:last-child');
    
    statusDot.className = 'status-dot ' + status;
    
    if (status === 'online') {
        statusText.textContent = 'Online';
    } else if (status === 'offline') {
        statusText.textContent = 'Offline';
    } else if (status === 'connecting') {
        statusText.textContent = 'Connecting...';
    }
}

// Copy room code to clipboard
function copyRoomCodeToClipboard() {
    const roomCode = roomCodeDisplay.textContent;
    navigator.clipboard.writeText(roomCode).then(() => {
        copyRoomCodeBtn.textContent = "Copied!";
        setTimeout(() => {
            copyRoomCodeBtn.textContent = "Copy";
        }, 2000);
    });
}

// Cancel waiting for opponent
function cancelWaiting() {
    waitingOverlay.classList.add('hidden');
    gameSetupModal.style.display = "flex";
    
    if (socket) {
        socket.disconnect();
    }
    
    updateConnectionStatus('offline');
    waitingForOpponent = false;
}

// Handle player disconnection
function handlePlayerDisconnected(data) {
    resultDisplay.textContent = `${data.username || 'Opponent'} disconnected`;
    resultDisplay.classList.remove('greenText', "redText");
    gamePrompt.textContent = "Opponent left the game";
    
    // Disable choices
    document.querySelectorAll('.choices button').forEach(btn => {
        btn.disabled = true;
    });
}

// Handle player's choice
function handleChoice(choice) {
    if (isOnlineGame) {
        // In online mode, send choice to server
        if (waitingForOpponent || playerChoice) return;
        
        playerChoice = choice;
        socket.emit('playerChoice', { roomID: currentRoomId, choice });
        
        // Update player's display
        updatePlayerDisplay(choice);
        gamePrompt.textContent = "Waiting for opponent...";
    } else {
        // In offline mode, play against computer
        playGame(choice);
    }
}

// Play game in offline mode
function playGame(playerChoice) {
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    let result = "";

    if(playerChoice === computerChoice) {
        result = "IT'S A TIE!";
    } else {
        switch(playerChoice) {
            case "rock":
               result = (computerChoice === "scissors") ? "YOU WIN!" : "YOU LOSE!";
               break;
            case "paper":
               result = (computerChoice === "rock") ? "YOU WIN!" : "YOU LOSE!";
               break;
            case "scissors":
               result = (computerChoice === "paper") ? "YOU WIN!" : "YOU LOSE!";
               break;
        }
    }

    updateDisplays(playerChoice, computerChoice);
    resultDisplay.textContent = result;

    resultDisplay.classList.remove("greenText", "redText");

    switch(result) {
        case "YOU WIN!":
            resultDisplay.classList.add("greenText");
            playerScore++;
            playerScoreDisplay.textContent = playerScore;
            break;
        case "YOU LOSE!":
            resultDisplay.classList.add("redText");
            computerScore++;
            computerScoreDisplay.textContent = computerScore;
            break;
    }
}

// Handle game result in online mode
function handleGameResult(data) {
    const choices = data.choices;
    const result = data.result;
    const players = data.players;
    
    // Find opponent's ID
    let opponentId;
    for (let id in choices) {
        if (id !== socket.id) {
            opponentId = id;
            break;
        }
    }
    
    // Update displays
    updatePlayerDisplay(choices[socket.id]);
    updateOpponentDisplay(choices[opponentId]);
    
    // Update result text
    let resultText;
    if (result === 'tie') {
        resultText = "IT'S A TIE!";
        resultDisplay.classList.remove("greenText", "redText");
    } else if (result === 'player1' && socket.id === players.player1.id ||
               result === 'player2' && socket.id === players.player2.id) {
        resultText = "YOU WIN!";
        resultDisplay.classList.remove("redText");
        resultDisplay.classList.add("greenText");
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
    } else {
        resultText = "YOU LOSE!";
        resultDisplay.classList.remove("greenText");
        resultDisplay.classList.add("redText");
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
    }
    
    resultDisplay.textContent = resultText;
    playerChoice = null;
    gamePrompt.textContent = "Make your choice";
    
    // Enable play again
    resetButton.disabled = false;
}

// Update player's display with choice
function updatePlayerDisplay(choice) {
    playerDisplay.innerHTML = '';
    
    let icon = document.createElement('span');
    icon.className = 'choice-icon';
    
    if (choice === 'rock') {
        icon.textContent = '👊';
    } else if (choice === 'paper') {
        icon.textContent = '✋';
    } else if (choice === 'scissors') {
        icon.textContent = '✌';
    }
    
    playerDisplay.appendChild(icon);
}

// Update opponent's display with choice
function updateOpponentDisplay(choice) {
    computerDisplay.innerHTML = '';
    
    let icon = document.createElement('span');
    icon.className = 'choice-icon';
    
    if (choice === 'rock') {
        icon.textContent = '👊';
    } else if (choice === 'paper') {
        icon.textContent = '✋';
    } else if (choice === 'scissors') {
        icon.textContent = '✌';
    }
    
    computerDisplay.appendChild(icon);
}

// Update both displays (for offline mode)
function updateDisplays(playerChoice, computerChoice) {
    updatePlayerDisplay(playerChoice);
    updateOpponentDisplay(computerChoice);
}

// Start a new round in online mode
function startNewRound() {
    playerDisplay.innerHTML = '<span class="choice-icon">?</span>';
    computerDisplay.innerHTML = '<span class="choice-icon">?</span>';
    resultDisplay.textContent = "NEW ROUND!";
    resultDisplay.classList.remove("greenText", "redText");
    playerChoice = null;
    gamePrompt.textContent = "Make your choice";
}

// Reset the game
function resetGame() {
    if (isOnlineGame && socket) {
        socket.emit('playAgain', { roomID: currentRoomId });
        gamePrompt.textContent = "Waiting for opponent...";
    } else {
        // Offline reset
        playerScore = 0;
        computerScore = 0;
        playerScoreDisplay.textContent = '0';
        computerScoreDisplay.textContent = '0';
        playerDisplay.innerHTML = '<span class="choice-icon">?</span>';
        computerDisplay.innerHTML = '<span class="choice-icon">?</span>';
        resultDisplay.textContent = 'READY TO PLAY!';
        resultDisplay.classList.remove("greenText", "redText");
        gamePrompt.textContent = "Make your choice";
    }
}

// Handle global errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global error:", error);
    return false;
};