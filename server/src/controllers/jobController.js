const asyncHandler = require('../utils/asyncHandler');
const jobService = require('../services/jobService');

/**
 * GET /api/v1/jobs
 * Search and filter jobs.
 */
const searchJobs = asyncHandler(async (req, res) => {
  const result = await jobService.searchJobs(req.query);
  
  res.status(200).json({
    success: true,
    data: result.jobs,
    pagination: result.pagination,
  });
});

/**
 * GET /api/v1/jobs/:id
 * Get single job details.
 */
const getJob = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  
  res.status(200).json({
    success: true,
    data: job,
  });
});

/**
 * GET /api/v1/jobs/:id/match
 * Get match score for a specific job against the user's active resume.
 */
const getJobMatch = asyncHandler(async (req, res) => {
  const matchResult = await jobService.getMatchScore(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    data: matchResult,
  });
});

/**
 * GET /api/v1/jobs/recommended
 * Get recommended jobs based on user's active resume.
 */
const getRecommendedJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getRecommendedJobs(req.user._id);
  
  res.status(200).json({
    success: true,
    data: jobs,
  });
});

module.exports = {
  searchJobs,
  getJob,
  getJobMatch,
  getRecommendedJobs,
};
