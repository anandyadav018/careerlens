const logger = require('../config/logger');

/**
 * Global error handler middleware.
 * Catches all errors forwarded via next(error) and sends
 * a standardized JSON error response.
 *
 * Must be registered AFTER all routes in app.js.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose Validation Error ──
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = 'Validation failed';
    return res.status(statusCode).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message, details },
    });
  }

  // ── Mongoose Duplicate Key Error ──
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    return res.status(statusCode).json({
      success: false,
      error: { code: 'DUPLICATE_ERROR', message },
    });
  }

  // ── Mongoose Cast Error (invalid ObjectId) ──
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    return res.status(statusCode).json({
      success: false,
      error: { code: 'CAST_ERROR', message },
    });
  }

  // ── JWT Errors ──
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // ── Log the error ──
  if (statusCode >= 500) {
    logger.error(`${statusCode} - ${message}`, {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      stack: err.stack,
    });
  } else {
    logger.warn(`${statusCode} - ${message}`, {
      url: req.originalUrl,
      method: req.method,
    });
  }

  // ── Send response ──
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.isOperational ? 'APP_ERROR' : 'INTERNAL_ERROR',
      message: statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
