const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateTokenPair, verifyRefreshToken } = require('../utils/tokenUtils');
const logger = require('../config/logger');

/**
 * Authentication service — handles all auth business logic.
 */
class AuthService {
  /**
   * Register a new user.
   * @param {Object} userData - { firstName, lastName, email, password }
   * @returns {Object} { user, accessToken, refreshToken }
   */
  async register({ firstName, lastName, email, password }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    // Create user (password is hashed by the pre-save hook)
    const user = await User.create({ firstName, lastName, email, password });

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Store hashed refresh token in DB
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    logger.info(`New user registered: ${email}`);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login with email and password.
   * @param {Object} credentials - { email, password }
   * @returns {Object} { user, accessToken, refreshToken }
   */
  async login({ email, password }) {
    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Update refresh token and last login
    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh the access token using a valid refresh token.
   * @param {string} refreshToken - Current refresh token
   * @returns {Object} { accessToken, refreshToken }
   */
  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 401);
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Find user and verify stored refresh token matches
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Rotate tokens (issue new pair, invalidate old)
    const tokens = generateTokenPair(user);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    logger.info(`Token refreshed for user: ${user.email}`);

    return tokens;
  }

  /**
   * Logout — invalidate the refresh token.
   * @param {string} userId - User ID
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    logger.info(`User logged out: ${userId}`);
  }

  /**
   * Get user profile by ID.
   * @param {string} userId
   * @returns {Object} User document
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * Update user profile.
   * @param {string} userId
   * @param {Object} updates
   * @returns {Object} Updated user document
   */
  async updateProfile(userId, updates) {
    // Prevent updating sensitive fields through this method
    const forbiddenFields = ['password', 'email', 'refreshToken', 'isEmailVerified'];
    forbiddenFields.forEach((field) => delete updates[field]);

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

module.exports = new AuthService();
