const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { jobQuerySchema } = require('../validators/jobValidator');

// All job routes require authentication
router.use(protect);

router.get('/', validate(jobQuerySchema, 'query'), jobController.searchJobs);
router.get('/recommended', jobController.getRecommendedJobs);
router.get('/:id', jobController.getJob);
router.get('/:id/match', jobController.getJobMatch);

module.exports = router;
