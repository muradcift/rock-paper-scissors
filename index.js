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


window.onload = function() {
    gameSetupModal.style.display = "flex";
    setupEventListeners();
};


function setupEventListeners() {
    resetButton.addEventListener('click', resetGame);
    changeModeButton.addEventListener('click', showGameSetup);
    generateRoomIdBtn.addEventListener('click', generateRandomRoomId);
    joinGameBtn.addEventListener('click', handleJoinGame);
    playOfflineBtn.addEventListener('click', startOfflineGame);
    copyRoomCodeBtn.addEventListener('click', copyRoomCodeToClipboard);
    cancelWaitingBtn.addEventListener('click', cancelWaiting);
}


function generateRandomRoomId() {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    roomIdInput.value = roomId;
}


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
    
    
    if (typeof io === 'undefined') {
        setupMessage.textContent = "Error: Socket.io not loaded. Please open via a server (http://localhost:3000)";
        console.error("Socket.io not loaded. Running from file:// directly?");
        return;
    }
    
    connectToServer();
    
    
    if (socket) {
        
        if (socket.connected) {
            socket.emit('joinRoom', { roomId, username });
            currentRoomId = roomId;
        } else {
            
            socket.once('connect', () => {
                socket.emit('joinRoom', { roomId, username });
                currentRoomId = roomId;
            });
        }
    } else {
        setupMessage.textContent = "Failed to create socket connection";
    }
}


function connectToServer() {
    updateConnectionStatus('connecting');
    try {
        
        const serverUrl = (window.RPS_CONFIG && window.RPS_CONFIG.SERVER_URL) || 
                          (window.location.protocol === 'file:' ? 'http://localhost:3000' : window.location.origin);
        
        console.log("Connecting to server:", serverUrl);
        
        
        if (socket) {
            socket.disconnect();
        }
        
        
        const connectionTimeout = setTimeout(() => {
            console.error("Connection timed out");
            setupMessage.textContent = "Connection timed out. Server may be down.";
            updateConnectionStatus('offline');
        }, 5000);
        
        socket = io(serverUrl, { transports: ['polling'] });

        socket.on('connect', () => {
            clearTimeout(connectionTimeout);
            console.log("Connected to server with ID:", socket.id);
            updateConnectionStatus('online');
        });

        
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
        
        
        socket.on('gameUpdate', (data) => {
            console.log("Game update:", data.message);
            setupMessage.textContent = data.message;
        });

        socket.on('disconnect', () => {
            updateConnectionStatus('offline');
            console.log("Disconnected from server");
            if (isOnlineGame) {
                showGameSetup();
                alert("Disconnected from server. Please reconnect.");
            }
        });

        socket.on('connect_error', (error) => {
            clearTimeout(connectionTimeout);
            console.error("Connection error:", error);
            updateConnectionStatus('offline');
            setupMessage.textContent = "Server connection error: " + error.message;
        });
        
        socket.io.on("error", (error) => {
            console.error("Transport error:", error);
            setupMessage.textContent = "Connection transport error";
        });
        
    } catch (error) {
        console.error("Connection error:", error);
        updateConnectionStatus('offline');
        setupMessage.textContent = "Failed to connect to server: " + error.message;
    }
}


function handleWaiting(data) {
    gameSetupModal.style.display = "none";
    waitingOverlay.classList.remove('hidden');
    roomCodeDisplay.textContent = data.roomID;
    waitingForOpponent = true;
}


function handleGameStart(data) {
    console.log("Game start event received:", data);
    try {
        
        gameSetupModal.style.display = "none";
        
        
        waitingOverlay.classList.add('hidden');
        onlineInfo.classList.remove('hidden');
        
        
        const gameArea = document.getElementById('gameArea');
        if (gameArea) {
            console.log("Game area found, making it visible");
            gameArea.classList.remove('hidden');
            
            gameArea.style.display = "block";
        } else {
            console.error("Game area element not found!");
        }
        
        
        waitingForOpponent = false;
        isOnlineGame = true;
        
        
        const players = data.players || [];
        console.log("Players in room:", players);
        
        if (players.length === 2) {
            for (let player of players) {
                if (player.id !== socket.id) {
                    opponentUsername = player.username || "Opponent";
                    opponentName.textContent = opponentUsername;
                    console.log("Found opponent:", opponentUsername);
                    break;
                }
            }
        } else {
            console.warn("Expected 2 players but got:", players.length);
        }
        
        
        playerName.textContent = username;
        currentRoom.textContent = data.roomID || currentRoomId;
        
        
        playerScoreLabel.textContent = "You";
        computerScoreLabel.textContent = "Opponent";
        playerTitle.textContent = "You chose";
        computerTitle.textContent = "Opponent chose";
        
        
        resetGame();
        
        gamePrompt.textContent = "Make your choice";
        
        console.log("Game started successfully!");
    } catch (error) {
        console.error("Error in handleGameStart:", error);
        alert("Error starting game: " + error.message);
    }
}


function handleUsernameSet(confirmedUsername) {
    username = confirmedUsername;
}


function startOfflineGame() {
    gameSetupModal.style.display = "none";
    
    document.getElementById('gameArea').classList.remove('hidden');
    isOnlineGame = false;
    onlineInfo.classList.add('hidden');
    
    
    playerScoreLabel.textContent = "Player";
    computerScoreLabel.textContent = "Computer";
    playerTitle.textContent = "You chose";
    computerTitle.textContent = "Computer chose";
    resetGame();
}


function showGameSetup() {
    gameSetupModal.style.display = "flex";
    setupMessage.textContent = "";
    
    
    if (socket && isOnlineGame) {
        socket.disconnect();
    }
    
    
    isOnlineGame = false;
    currentRoomId = null;
    waitingForOpponent = false;
    playerChoice = null;
    resetGame();
}


function updateConnectionStatus(status) {
    const statusDot = connectionStatus.querySelector('.status-dot');
    const statusText = connectionStatus.querySelector('.status-text');

    statusDot.className = 'status-dot ' + status;

    if (status === 'online') {
        statusText.textContent = 'Online';
    } else if (status === 'offline') {
        statusText.textContent = 'Offline';
    } else if (status === 'connecting') {
        statusText.textContent = 'Connecting...';
    }
}


function copyRoomCodeToClipboard() {
    const roomCode = roomCodeDisplay.textContent;
    navigator.clipboard.writeText(roomCode).then(() => {
        copyRoomCodeBtn.textContent = "Copied!";
        setTimeout(() => {
            copyRoomCodeBtn.textContent = "Copy";
        }, 2000);
    });
}


function cancelWaiting() {
    waitingOverlay.classList.add('hidden');
    gameSetupModal.style.display = "flex";
    
    if (socket) {
        socket.disconnect();
    }
    
    updateConnectionStatus('offline');
    waitingForOpponent = false;
}


function handlePlayerDisconnected(data) {
    resultDisplay.textContent = `${data.username || 'Opponent'} disconnected`;
    resultDisplay.classList.remove('greenText', "redText");
    gamePrompt.textContent = "Opponent left the game";
    
    
    document.querySelectorAll('.choices button').forEach(btn => {
        btn.disabled = true;
    });
}


function handleChoice(choice) {
    if (isOnlineGame) {
        if (playerChoice) return;
        playerChoice = choice;
        socket.emit('playerChoice', { room: currentRoomId, choice });
        
        
        gamePrompt.textContent = "Choice made. Waiting...";
    } else {
        
        playGame(choice);
    }
}


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


function handleGameResult(data) {
    
    if (data.player1 && data.player2) {
        
        const currentPlayer = data.player1.id === socket.id ? data.player1 : data.player2;
        const opponentPlayer = data.player1.id === socket.id ? data.player2 : data.player1;
        
        
        updatePlayerDisplay(currentPlayer.choice);
        updateOpponentDisplay(opponentPlayer.choice);
        
        
        let resultText;
        if (!data.winner) {
            resultText = "IT'S A TIE!";
            resultDisplay.classList.remove("greenText", "redText");
        } else if (data.winner === socket.id) {
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
        
        
        resetButton.disabled = false;
    } else {
        console.error("Unexpected game result format:", data);
    }
}


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


function updateDisplays(playerChoice, computerChoice) {
    updatePlayerDisplay(playerChoice);
    updateOpponentDisplay(computerChoice);
}


function startNewRound() {
    playerDisplay.innerHTML = '<span class="choice-icon">?</span>';
    computerDisplay.innerHTML = '<span class="choice-icon">?</span>';
    resultDisplay.textContent = "NEW ROUND!";
    resultDisplay.classList.remove("greenText", "redText");
    playerChoice = null;
    gamePrompt.textContent = "Make your choice";
}


function resetGame() {
    if (isOnlineGame && socket) {
        socket.emit('playAgain', { roomID: currentRoomId });
        gamePrompt.textContent = "Waiting for opponent...";
    } else {
        
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


window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global error:", error);
    return false;
};