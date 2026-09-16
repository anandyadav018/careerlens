const env = require('./env');

/**
 * CORS configuration.
 * In production, only the frontend origin is allowed.
 * In development, allow the Vite dev server.
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [env.CLIENT_URL];

    // In development, allow localhost origins dynamically to prevent port mismatch issues
    if (env.NODE_ENV === 'development') {
      if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }

    // Allow requests with no origin (e.g., mobile apps, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true, // Allow cookies (refresh token)
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight for 24 hours
};

module.exports = corsOptions;
