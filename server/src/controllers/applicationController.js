const asyncHandler = require('../utils/asyncHandler');
const applicationService = require('../services/applicationService');

/**
 * GET /api/v1/applications
 */
const getApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.getUserApplications(req.user._id);
  res.status(200).json({ success: true, data: applications });
});

/**
 * POST /api/v1/applications
 */
const saveApplication = asyncHandler(async (req, res) => {
  const { jobId, status } = req.body;
  const application = await applicationService.saveJob(req.user._id, jobId, status);
  res.status(201).json({ success: true, data: application });
});

/**
 * PATCH /api/v1/applications/:id
 */
const updateApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplication(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, data: application });
});

/**
 * DELETE /api/v1/applications/:id
 */
const deleteApplication = asyncHandler(async (req, res) => {
  await applicationService.deleteApplication(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: {} });
});

/**
 * GET /api/v1/applications/stats
 */
const getApplicationStats = asyncHandler(async (req, res) => {
  const stats = await applicationService.getApplicationStats(req.user._id);
  res.status(200).json({ success: true, data: stats });
});

module.exports = {
  getApplications,
  saveApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats,
};
