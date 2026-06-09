// src/setupProxy.js

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const herttaBackendTarget = process.env.REACT_APP_HERTTA_BACKEND_URL || 'http://localhost:4001';
  const herttaBackendProxy = createProxyMiddleware({
    target: herttaBackendTarget,
    changeOrigin: true,
  });

  const herttaBackendPaths = new Set([
    '/graphql',
    '/ha-api',
    '/ha-states',
    '/set-ha-api-key',
    '/hertta-health',
    '/start-hourly-optimization',
    '/stop-hourly-optimization',
    '/refresh-optimization',
    '/control-signals',
    '/weather',
    '/start-weather',
    '/prices',
    '/start-prices',
  ]);

  app.use((req, res, next) => {
    if (herttaBackendPaths.has(req.path) || req.path.startsWith('/ha-state/')) {
      return herttaBackendProxy(req, res, next);
    }
    return next();
  });

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
