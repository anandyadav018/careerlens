const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// All AI routes require authentication + rate limiting
router.use(protect);
router.use(aiLimiter);

// Cover Letter routes
router.post('/cover-letter/:jobId', aiController.generateCoverLetter);
router.get('/cover-letters', aiController.getCoverLetters);
router.get('/cover-letters/:id', aiController.getCoverLetterById);
router.patch('/cover-letters/:id', aiController.updateCoverLetter);

// Interview Prep routes
router.post('/interview-prep/:jobId', aiController.generateInterviewQuestions);
router.get('/interview-preps', aiController.getInterviewPreps);
router.get('/interview-preps/:id', aiController.getInterviewPrepById);

module.exports = router;
