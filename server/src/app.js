const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const corsOptions = require('./config/cors');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

/**
 * Express Application Assembly.
 *
 * Middleware order matters:
 * 1. Security headers (Helmet)
 * 2. CORS
 * 3. Body parsers
 * 4. Cookie parser
 * 5. Request logging
 * 6. Rate limiting
 * 7. Routes
 * 8. Error handler (must be LAST)
 */
const app = express();

// ── Security Headers ──
app.set('trust proxy', 1); // Trust first proxy (for rate limiter behind reverse proxy)
app.use(helmet());

// ── CORS ──
app.use(cors(corsOptions));

// ── Body Parsers ──
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Cookie Parser ──
app.use(cookieParser());

// ── Request Logging ──
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ── Rate Limiting ──
app.use('/api/', generalLimiter);

// ── Static Files (uploaded resumes — dev only) ──
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API Routes ──
app.use('/api/v1', routes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// ── Global Error Handler (must be last) ──
app.use(errorHandler);

module.exports = app;
