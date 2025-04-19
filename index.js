// ROCK PAPER SCISSORS

const choices = ["rock", "paper", "scissors"];
const playerDisplay = document.getElementById("playerDisplay");
const computerDisplay = document.getElementById("computerDisplay");
const resultDisplay = document.getElementById("resultDisplay");
const playerScoreDisplay = document.getElementById("playerScoreDisplay");
const computerScoreDisplay = document.getElementById("computerScoreDisplay");
const resetButton = document.getElementById("resetGame");
let playerScore = 0;
let computerScore = 0;

function updateDisplays(playerChoice, computerChoice) {
    // Clear previous content
    playerDisplay.innerHTML = '';
    computerDisplay.innerHTML = '';
    
    // Create icon elements based on choices
    let playerIcon = document.createElement('span');
    playerIcon.className = 'choice-icon';
    
    let computerIcon = document.createElement('span');
    computerIcon.className = 'choice-icon';
    
    // Set icons based on choices
    if (playerChoice === 'rock') {
        playerIcon.textContent = '👊';
    } else if (playerChoice === 'paper') {
        playerIcon.textContent = '✋';
    } else if (playerChoice === 'scissors') {
        playerIcon.textContent = '✌';
    }
    
    if (computerChoice === 'rock') {
        computerIcon.textContent = '👊';
    } else if (computerChoice === 'paper') {
        computerIcon.textContent = '✋';
    } else if (computerChoice === 'scissors') {
        computerIcon.textContent = '✌';
    }
    
    // Add icons to displays
    playerDisplay.appendChild(playerIcon);
    computerDisplay.appendChild(computerIcon);
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

resetButton.addEventListener('click', function() {
    playerScore = 0;
    computerScore = 0;
    playerScoreDisplay.textContent = '0';
    computerScoreDisplay.textContent = '0';
    playerDisplay.innerHTML = '<span class="choice-icon">?</span>';
    computerDisplay.innerHTML = '<span class="choice-icon">?</span>';
    resultDisplay.textContent = 'READY TO PLAY!';
    resultDisplay.classList.remove("greenText", "redText");
});