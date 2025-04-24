// Configuration for Rock Paper Scissors game
(function(global) {
  const defaultUrl = (window.location.protocol === 'file:'
    ? 'http://localhost:3000'
    : window.location.origin);
  const renderUrl = "https://rock-paper-scissors.onrender.com"; // Replace with your Render or backend URL
  // Always use the Render backend for web hosts, use defaultUrl only when running locally via file protocol
  const SERVER_URL = (window.location.protocol === 'file:') ? defaultUrl : renderUrl;
  global.RPS_CONFIG = {
    SERVER_URL,
    VERSION: "1.0.0",
    THEME: "purple"
  };
})(window);
