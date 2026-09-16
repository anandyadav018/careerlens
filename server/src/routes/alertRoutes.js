const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createAlertSchema, updateAlertSchema } = require('../validators/alertValidator');

router.use(protect);

router.route('/')
  .get(alertController.getAlerts)
  .post(validate(createAlertSchema), alertController.createAlert);

router.route('/:id')
  .patch(validate(updateAlertSchema), alertController.updateAlert)
  .delete(alertController.deleteAlert);

router.patch('/:id/toggle', alertController.toggleAlert);

module.exports = router;
