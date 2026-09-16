/**
 * Wraps an async Express route handler to catch errors
 * and forward them to the global error handler.
 *
 * Usage:
 *   router.get('/example', asyncHandler(async (req, res) => { ... }));
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
