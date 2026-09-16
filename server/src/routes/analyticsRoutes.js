const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(protect);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/skills', analyticsController.getTrendingSkills);
router.get('/skill-gaps', analyticsController.getSkillGaps);

module.exports = router;
