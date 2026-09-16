const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * JWT token utilities.
 * Generates access and refresh tokens, and verifies them.
 */

/**
 * Generate a short-lived access token.
 * @param {Object} payload - Data to encode (userId, email)
 * @returns {string} Signed JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

/**
 * Generate a long-lived refresh token.
 * @param {Object} payload - Data to encode (userId)
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify an access token.
 * @param {string} token - JWT string
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

/**
 * Verify a refresh token.
 * @param {string} token - JWT string
 * @returns {Object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

/**
 * Generate both access and refresh tokens for a user.
 * @param {Object} user - User document (must have _id and email)
 * @returns {{ accessToken: string, refreshToken: string }}
 */
const generateTokenPair = (user) => {
  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
  });

  return { accessToken, refreshToken };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
};
