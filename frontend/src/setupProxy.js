const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      pathRewrite: (path) => `/api${path}`,
    })
  );
  
  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'ws://localhost:8000',
      ws: true,
      changeOrigin: true,
      pathRewrite: (path) => `/ws${path}`,
    })
  );
};
