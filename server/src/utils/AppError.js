/**
 * Custom application error class.
 * Extends the native Error with an HTTP status code and
 * an operational flag to distinguish expected errors from bugs.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (default: 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Expected errors (vs. programming bugs)

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
