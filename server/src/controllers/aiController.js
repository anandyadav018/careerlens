const asyncHandler = require('../utils/asyncHandler');
const aiService = require('../services/aiService');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const CoverLetter = require('../models/CoverLetter');
const InterviewPrep = require('../models/InterviewPrep');
const AppError = require('../utils/AppError');

/**
 * Helper to fetch job and active resume
 */
const getJobAndResume = async (jobId, userId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);

  const activeResume = await Resume.findOne({ userId, isActive: true });
  if (!activeResume) {
    throw new AppError('No active resume found. Please upload a resume first.', 400);
  }

  return { job, activeResume };
};

/**
 * POST /api/v1/ai/cover-letter/:jobId
 * Generate cover letter and persist to DB.
 */
const generateCoverLetter = asyncHandler(async (req, res) => {
  const { job, activeResume } = await getJobAndResume(req.params.jobId, req.user._id);
  const coverLetterText = await aiService.generateCoverLetter(activeResume, job);
  
  // Persist to DB so users can revisit
  const saved = await CoverLetter.create({
    userId: req.user._id,
    resumeId: activeResume._id,
    jobId: job._id,
    companyName: job.company?.name || '',
    roleName: job.title,
    generatedContent: coverLetterText,
  });

  res.status(200).json({
    success: true,
    data: { coverLetter: coverLetterText, id: saved._id },
  });
});

/**
 * GET /api/v1/ai/cover-letters
 * List all generated cover letters for the user.
 */
const getCoverLetters = asyncHandler(async (req, res) => {
  const letters = await CoverLetter.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('jobId', 'title company');
  res.status(200).json({ success: true, data: letters });
});

/**
 * GET /api/v1/ai/cover-letters/:id
 */
const getCoverLetterById = asyncHandler(async (req, res) => {
  const letter = await CoverLetter.findOne({ _id: req.params.id, userId: req.user._id });
  if (!letter) throw new AppError('Cover letter not found', 404);
  res.status(200).json({ success: true, data: letter });
});

/**
 * PATCH /api/v1/ai/cover-letters/:id
 * Save user's edited version.
 */
const updateCoverLetter = asyncHandler(async (req, res) => {
  const letter = await CoverLetter.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { editedContent: req.body.editedContent },
    { new: true }
  );
  if (!letter) throw new AppError('Cover letter not found', 404);
  res.status(200).json({ success: true, data: letter });
});

/**
 * POST /api/v1/ai/interview-prep/:jobId
 * Generate interview questions and persist to DB.
 */
const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { job, activeResume } = await getJobAndResume(req.params.jobId, req.user._id);
  const prepData = await aiService.generateInterviewQuestions(activeResume, job);
  
  // Map and persist
  const questions = (prepData.questions || []).map(q => ({
    category: q.type || 'technical',
    question: q.question,
    suggestedAnswer: q.hint || '',
    difficulty: 'medium',
    tips: [],
  }));

  const saved = await InterviewPrep.create({
    userId: req.user._id,
    jobId: job._id,
    jobTitle: job.title,
    companyName: job.company?.name || '',
    questions,
    userSkills: [
      ...(activeResume.skills?.technical || []),
      ...(activeResume.skills?.tools || []),
    ],
  });

  res.status(200).json({
    success: true,
    data: { ...prepData, id: saved._id },
  });
});

/**
 * GET /api/v1/ai/interview-preps
 */
const getInterviewPreps = asyncHandler(async (req, res) => {
  const preps = await InterviewPrep.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('jobId', 'title company');
  res.status(200).json({ success: true, data: preps });
});

/**
 * GET /api/v1/ai/interview-preps/:id
 */
const getInterviewPrepById = asyncHandler(async (req, res) => {
  const prep = await InterviewPrep.findOne({ _id: req.params.id, userId: req.user._id });
  if (!prep) throw new AppError('Interview prep not found', 404);
  res.status(200).json({ success: true, data: prep });
});

module.exports = {
  generateCoverLetter,
  getCoverLetters,
  getCoverLetterById,
  updateCoverLetter,
  generateInterviewQuestions,
  getInterviewPreps,
  getInterviewPrepById,
};
