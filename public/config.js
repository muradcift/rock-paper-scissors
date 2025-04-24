// Configuration for Rock Paper Scissors game
(function(global) {
  const defaultUrl = (window.location.protocol === 'file:'
    ? 'http://localhost:3000'
    : window.location.origin);
  const renderUrl = "https://rock-paper-scissors.onrender.com"; // Replace with your Render or backend URL
  const staticHostPatterns = [/\.netlify\.app$/, /\.vercel\.app$/];
  const isStaticHost = staticHostPatterns.some(pattern => pattern.test(window.location.hostname));
  const SERVER_URL = isStaticHost ? renderUrl : defaultUrl;
  global.RPS_CONFIG = {
    SERVER_URL,
    VERSION: "1.0.0",
    THEME: "purple"
  };
})(window);
