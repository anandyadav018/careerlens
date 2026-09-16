const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// All resume routes require authentication
router.use(protect);

router.post('/upload', upload.single('resume'), resumeController.uploadResume);
router.get('/', resumeController.getUserResumes);
router.get('/:id', resumeController.getResume);
router.delete('/:id', resumeController.deleteResume);
router.patch('/:id/activate', resumeController.activateResume);
router.patch('/:id/label', resumeController.updateResumeLabel);

module.exports = router;
