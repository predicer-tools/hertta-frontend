// src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests and WebSocket connections starting with '/api'
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://192.168.1.110:8123', 
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
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'ws://localhost:3030', // GraphQL server
      ws: true,
      changeOrigin: true,
      secure: false,
    })
  );
};
