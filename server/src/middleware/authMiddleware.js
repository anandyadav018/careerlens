const { verifyAccessToken } = require('../utils/tokenUtils');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * Authentication middleware.
 * Extracts the JWT from the Authorization header, verifies it,
 * and attaches the user document to req.user.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authenticated. Please log in.', 401);
    }

    // 2. Verify token
    const decoded = verifyAccessToken(token);

    // 3. Check if user still exists (hasn't been deleted since token was issued)
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Forward JWT-specific errors with proper status code
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(error);
    }
    next(error);
  }
};

module.exports = { protect };
