const asyncHandler = require('../utils/asyncHandler');
const alertService = require('../services/alertService');

/**
 * POST /api/v1/alerts
 */
const createAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.createAlert(req.user._id, req.body);
  res.status(201).json({ success: true, data: alert });
});

/**
 * GET /api/v1/alerts
 */
const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await alertService.getUserAlerts(req.user._id);
  res.status(200).json({ success: true, data: alerts });
});

/**
 * PATCH /api/v1/alerts/:id
 */
const updateAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.updateAlert(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, data: alert });
});

/**
 * PATCH /api/v1/alerts/:id/toggle
 */
const toggleAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.toggleAlert(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: alert });
});

/**
 * DELETE /api/v1/alerts/:id
 */
const deleteAlert = asyncHandler(async (req, res) => {
  await alertService.deleteAlert(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: {} });
});

module.exports = {
  createAlert,
  getAlerts,
  updateAlert,
  toggleAlert,
  deleteAlert,
};
