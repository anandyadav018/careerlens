const asyncHandler = require('../utils/asyncHandler');
const resumeService = require('../services/resumeService');

/**
 * POST /api/v1/resumes/upload
 * Upload a resume (PDF), parse it, and get AI analysis.
 */
const uploadResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.processAndSaveResume(req.file, req.user._id);
  
  res.status(201).json({
    success: true,
    data: resume,
  });
});

/**
 * GET /api/v1/resumes
 * Get all resumes for the logged-in user.
 */
const getUserResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.getUserResumes(req.user._id);
  
  res.status(200).json({
    success: true,
    data: resumes,
  });
});

/**
 * GET /api/v1/resumes/:id
 * Get a specific resume by ID.
 */
const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResumeById(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    data: resume,
  });
});

/**
 * DELETE /api/v1/resumes/:id
 * Delete a specific resume.
 */
const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    data: { message: 'Resume deleted successfully' },
  });
});

/**
 * PATCH /api/v1/resumes/:id/activate
 * Set a specific resume as active.
 */
const activateResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.activateResume(req.params.id, req.user._id);
  
  res.status(200).json({
    success: true,
    data: resume,
  });
});

/**
 * PATCH /api/v1/resumes/:id/label
 * Update a resume's label/name.
 */
const updateResumeLabel = asyncHandler(async (req, res) => {
  const { label } = req.body;
  const resume = await resumeService.updateResumeLabel(req.params.id, req.user._id, label);
  
  res.status(200).json({
    success: true,
    data: resume,
  });
});

module.exports = {
  uploadResume,
  getUserResumes,
  getResume,
  deleteResume,
  activateResume,
  updateResumeLabel,
};
