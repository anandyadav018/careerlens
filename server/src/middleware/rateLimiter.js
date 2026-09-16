const rateLimit = require('express-rate-limit');

/**
 * Rate limiters for different endpoint groups.
 * Prevents abuse and brute-force attacks.
 */

// General API rate limiter — 100 requests per minute
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests. Please try again later.',
    },
  },
});

// Auth endpoints — 5 requests per minute (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many authentication attempts. Please try again in a minute.',
    },
  },
});

// AI endpoints — 10 requests per minute (cost control)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'AI request limit reached. Please try again later.',
    },
  },
});

module.exports = { generalLimiter, authLimiter, aiLimiter };
