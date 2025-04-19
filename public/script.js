// Game state variables
let socket;
let playerName = '';
let roomId = '';
let playerNumber = 0;
let opponentName = '';
let playerScore = 0;
let opponentScore = 0;
let currentRound = 1;

// DOM elements
const loginScreen = document.getElementById('login-screen');
const waitingScreen = document.getElementById('waiting-screen');
const gameScreen = document.getElementById('game-screen');
const connectionLostScreen = document.getElementById('connection-lost');
const resultDisplay = document.getElementById('result-display');

const playerNameInput = document.getElementById('player-name');
const playButton = document.getElementById('play-button');
const findNewOpponentButton = document.getElementById('find-new-opponent');
const nextRoundButton = document.getElementById('next-round');

const playerDisplayElement = document.getElementById('player-display');
const opponentDisplayElement = document.getElementById('opponent-display');
const playerScoreElement = document.getElementById('player-score');
const opponentScoreElement = document.getElementById('opponent-score');
const roundNumberElement = document.getElementById('round-number');
const choiceMessage = document.getElementById('choice-message');
const resultMessage = document.getElementById('result-message');

const rockChoice = document.getElementById('rock');
const paperChoice = document.getElementById('paper');
const scissorsChoice = document.getElementById('scissors');

const playerChoiceImg = document.getElementById('player-choice-img');
const opponentChoiceImg = document.getElementById('opponent-choice-img');

// Initialize socket connection
function initializeSocket() {
    socket = io();
    
    // Socket event handlers
    socket.on('waiting', () => {
        loginScreen.classList.add('hidden');
        waitingScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
    });
    
    socket.on('matchFound', (data) => {
        roomId = data.roomId;
        opponentName = data.opponentName;
        playerNumber = data.playerNumber;
        
        // Update UI
        waitingScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        playerDisplayElement.innerHTML = `You (${playerName}): <span id="player-score">0</span>`;
        opponentDisplayElement.innerHTML = `${opponentName}: <span id="opponent-score">0</span>`;
        playerScoreElement.textContent = playerScore;
        opponentScoreElement.textContent = opponentScore;
        roundNumberElement.textContent = currentRound;
    });
    
    socket.on('roundResult', (data) => {
        const isPlayer1 = (playerNumber === 1);
        const playerData = isPlayer1 ? data.player1 : data.player2;
        const opponentData = isPlayer1 ? data.player2 : data.player1;
        
        // Update scores
        playerScore = playerData.score;
        opponentScore = opponentData.score;
        playerScoreElement.textContent = playerScore;
        opponentScoreElement.textContent = opponentScore;
        
        // Show result
        showResult(playerData.choice, opponentData.choice, data.result, isPlayer1);
        
        // Update round number
        currentRound = data.round;
        roundNumberElement.textContent = currentRound;
    });
    
    socket.on('opponentLeft', () => {
        gameScreen.classList.add('hidden');
        connectionLostScreen.classList.remove('hidden');
        resetGameState();
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeSocket();
    
    playButton.addEventListener('click', () => {
        if (playerNameInput.value.trim() !== '') {
            playerName = playerNameInput.value.trim();
            socket.emit('findMatch', playerName);
        }
    });
    
    rockChoice.addEventListener('click', () => makeChoice('rock'));
    paperChoice.addEventListener('click', () => makeChoice('paper'));
    scissorsChoice.addEventListener('click', () => makeChoice('scissors'));
    
    nextRoundButton.addEventListener('click', () => {
        resultDisplay.classList.add('hidden');
        choiceMessage.textContent = 'Make your choice!';
        enableChoices();
    });
    
    findNewOpponentButton.addEventListener('click', () => {
        connectionLostScreen.classList.add('hidden');
        socket.emit('findMatch', playerName);
    });
});

// Game functions
function makeChoice(choice) {
    disableChoices();
    choiceMessage.textContent = 'Waiting for opponent...';
    socket.emit('makeChoice', { roomId, choice });
}

function showResult(playerChoice, opponentChoice, result, isPlayer1) {
    // Set images
    playerChoiceImg.src = getChoiceImage(playerChoice);
    opponentChoiceImg.src = getChoiceImage(opponentChoice);
    
    // Determine result message
    let resultText = '';
    if (result === 'draw') {
        resultText = 'It\'s a draw!';
    } else if ((result === 'player1' && isPlayer1) || (result === 'player2' && !isPlayer1)) {
        resultText = 'You win this round!';
    } else {
        resultText = 'You lose this round!';
    }
    
    resultMessage.textContent = resultText;
    resultDisplay.classList.remove('hidden');
}

function getChoiceImage(choice) {
    switch (choice) {
        case 'rock':
            return 'https://cdn-icons-png.flaticon.com/512/6729/6729151.png';
        case 'paper':
            return 'https://cdn-icons-png.flaticon.com/512/5898/5898057.png';
        case 'scissors':
            return 'https://cdn-icons-png.flaticon.com/512/2928/2928853.png';
        default:
            return '';
    }
}

function enableChoices() {
    rockChoice.style.pointerEvents = 'auto';
    paperChoice.style.pointerEvents = 'auto';
    scissorsChoice.style.pointerEvents = 'auto';
}

function disableChoices() {
    rockChoice.style.pointerEvents = 'none';
    paperChoice.style.pointerEvents = 'none';
    scissorsChoice.style.pointerEvents = 'none';
}

function resetGameState() {
    roomId = '';
    playerNumber = 0;
    opponentName = '';
    playerScore = 0;
    opponentScore = 0;
    currentRound = 1;
}
