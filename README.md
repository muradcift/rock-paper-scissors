# Rock Paper Scissors 🎮

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A real-time multiplayer Rock Paper Scissors game built with Node.js, Express, and Socket.IO.

## Table of Contents

- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Game](#running-the-game)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Demo

A live demo is available at: [https://rock-paper-scissors-2rou.onrender.com/](https://rock-paper-scissors-2rou.onrender.com/)

## Tech Stack

- Node.js
- Express
- Socket.IO
- Vanilla JavaScript, HTML5 & CSS3

## Getting Started

### Prerequisites

- Node.js v14 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/muradcift/rock-paper-scissors.git
cd rock-paper-scissors

# Install dependencies
npm install
```

### Running the Game

```bash
# Start server in development mode
npm run dev
```

Open your browser and navigate to `http://localhost:3000`.

## Deployment

1. Deploy the backend 
2. Update the Socket.IO connection URL in `public/script.js`:

```js
const socket = io("https://your-backend-url.onrender.com");
```

## Project Structure

```
.
├── server.js          # Express server with Socket.IO
├── main.html          # Frontend landing page
├── style.css          # Frontend styles
├── public/            # Static assets
│   ├── index.html
│   ├── script.js
│   └── style.css
├── functions/         # Serverless functions (optional)
│   └── server.js
├── package.json
├── netlify.toml       # Netlify deployment config
├── render.yaml        # Render deployment config
└── README.md
```

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/muradcift/rock-paper-scissors/issues) or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Murad Ciftci**

- GitHub: [@muradcift](https://github.com/muradcift)
- Email: <muradcift@gmail.com>