// Configuration for Rock Paper Scissors game
(function(global) {
  const defaultUrl = (window.location.protocol === 'file:'
    ? 'http://localhost:3000'
    : window.location.origin);
  
  // Netlify Functions için socket.io endpoint yolu
  const socketEndpoint = window.location.protocol === 'file:'
    ? defaultUrl
    : `${window.location.origin}/.netlify/functions/server`;
  
  global.RPS_CONFIG = {
    SERVER_URL: socketEndpoint,
    VERSION: "1.0.0",
    THEME: "purple"
  };
})(window);
