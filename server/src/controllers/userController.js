const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');

/**
 * User Controller — profile management endpoints.
 */

/**
 * GET /api/v1/users/me
 * Get current user's profile.
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * PATCH /api/v1/users/me
 * Update current user's profile.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * PATCH /api/v1/users/me/preferences
 * Update job preferences.
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, {
    preferences: req.body,
  });

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * DELETE /api/v1/users/me
 * Delete current user's account.
 */
const deleteAccount = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  await User.findByIdAndDelete(req.user._id);

  res.clearCookie('refreshToken', { path: '/api/v1/auth' });

  res.status(200).json({
    success: true,
    data: { message: 'Account deleted successfully' },
  });
});

/**
 * PATCH /api/v1/users/me/onboarding
 * Complete the onboarding flow — saves preferences and marks onboarding as done.
 */
const completeOnboarding = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const {
    preferredRoles,
    skills,
    experienceLevel,
    desiredLocations,
    remotePreference,
    jobType,
    technologies,
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      preferredRoles: preferredRoles || [],
      skills: skills || [],
      experienceLevel: experienceLevel || '',
      technologies: technologies || [],
      'preferences.desiredLocations': desiredLocations || [],
      'preferences.remotePreference': remotePreference || 'any',
      'preferences.jobType': jobType || [],
      onboardingCompleted: true,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: { user },
  });
});

module.exports = { getProfile, updateProfile, updatePreferences, deleteAccount, completeOnboarding };
