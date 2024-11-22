// src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests and WebSocket connections starting with '/api'
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://192.168.41.27:8123', // Replace with your Home Assistant server URL
      changeOrigin: true,
      ws: true, // Enable proxying WebSocket connections
      secure: false, // Set to true if using HTTPS
      onProxyReq: (proxyReq, req, res) => {
        // Forward the Authorization header
        if (req.headers['authorization']) {
          proxyReq.setHeader('Authorization', req.headers['authorization']);
        }
      },
    })
  );
};
