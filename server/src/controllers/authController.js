const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

/**
 * Auth Controller — thin handlers that delegate to AuthService.
 */

// Cookie options for refresh token
const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth', // Only sent to auth endpoints
});

/**
 * POST /api/v1/auth/register
 * Create a new user account.
 */
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.register({
    firstName,
    lastName,
    email,
    password,
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

  res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * POST /api/v1/auth/login
 * Login with email and password.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * POST /api/v1/auth/refresh
 * Refresh the access token using the refresh cookie.
 */
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  const tokens = await authService.refresh(refreshToken);

  // Rotate the refresh cookie
  res.cookie('refreshToken', tokens.refreshToken, getRefreshCookieOptions());

  res.status(200).json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
    },
  });
});

/**
 * POST /api/v1/auth/logout
 * Invalidate refresh token and clear cookie.
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id);

  // Clear the refresh cookie
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });

  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
});

module.exports = { register, login, refresh, logout };
