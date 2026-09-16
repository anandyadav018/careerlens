const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

/**
 * User Routes
 * Prefix: /api/v1/users
 * All routes require authentication.
 */
router.use(protect);

router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);
router.patch('/me/preferences', userController.updatePreferences);
router.patch('/me/onboarding', userController.completeOnboarding);
router.delete('/me', userController.deleteAccount);

module.exports = router;
