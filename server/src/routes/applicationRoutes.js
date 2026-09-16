const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { saveApplicationSchema, updateApplicationSchema } = require('../validators/applicationValidator');

router.use(protect);

router.route('/')
  .get(applicationController.getApplications)
  .post(validate(saveApplicationSchema), applicationController.saveApplication);

router.get('/stats', applicationController.getApplicationStats);

router.route('/:id')
  .patch(validate(updateApplicationSchema), applicationController.updateApplication)
  .delete(applicationController.deleteApplication);

module.exports = router;
