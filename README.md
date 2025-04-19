<<<<<<< HEAD
# Multiplayer Rock Paper Scissors Game

A real-time multiplayer Rock Paper Scissors game built with Socket.IO and Express.

## Features

- Create or join game rooms
- Real-time gameplay
- Username customization
- Instant results
- Play again functionality

## Technologies Used

- Node.js
- Express
- Socket.IO
- JavaScript

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/muradcift/rock-paper-scissors.git
   cd rock-paper-scissors
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. Enter your username
2. Create a new game or join an existing one
3. Make your selection (rock, paper, or scissors)
4. See the results and play again!

## Deployment Instructions

### Backend Deployment (Choose one)

#### Option 1: Deploy to Render

1. Create an account at [render.com](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Set environment variables if needed
6. Deploy

#### Option 2: Deploy to Heroku

1. Create an account at [heroku.com](https://heroku.com/)
2. Install the Heroku CLI
3. Login with `heroku login`
4. In your project directory, run:
   ```
   heroku create your-game-name
   git push heroku main
   ```
5. Your server will be running at `https://your-game-name.herokuapp.com`

#### Option 3: Deploy to Glitch

1. Create an account at [glitch.com](https://glitch.com/)
2. Create a new project
3. Import your code from GitHub or upload files
4. Your server will be running automatically

### Frontend Deployment to Netlify

1. Create an account at [netlify.com](https://netlify.com/)
2. Go to the Netlify dashboard
3. Drag and drop your project folder or connect your GitHub repository
4. If using GitHub:
   - Connect to your GitHub account
   - Select your repository
   - Configure the build settings (if needed)
   - Deploy

## Important: Connect Frontend to Backend

After deploying both frontend and backend:

1. Copy your backend URL (e.g., `https://your-game-backend.onrender.com`)
2. Update the Socket.io connection in your `index.js` file:
   ```javascript
   socket = io("https://your-game-backend.onrender.com");
   ```
3. Re-deploy your frontend to Netlify

## Local Development

To run the game locally:

1. Install dependencies: `npm install`
2. Start the server: `npm start` or `npm run dev` (for development)
3. Open your browser to `http://localhost:3000`
=======
# rock-paper-scissors
taş, makası; makas, kağıdı; kağıt, taşı yeniyor. 
>>>>>>> eb6e38bce5ca353b2954900ec97718c7af1a2229
