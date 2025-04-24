// Configuration for Rock Paper Scissors game
(function(global) {
  const defaultUrl = (window.location.protocol === 'file:'
    ? 'http://localhost:3000'
    : window.location.origin);
  // Choose server URL: localhost for file protocol, otherwise proxy via current origin (Netlify)
  const SERVER_URL = window.location.protocol === 'file:'
    ? defaultUrl
    : window.location.origin;
  global.RPS_CONFIG = {
    SERVER_URL,
    VERSION: "1.0.0",
    THEME: "purple"
  };
})(window);
