const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidator');

/**
 * Auth Routes
 * Prefix: /api/v1/auth
 */

// Public routes (rate-limited)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', protect, authController.logout);

module.exports = router;
