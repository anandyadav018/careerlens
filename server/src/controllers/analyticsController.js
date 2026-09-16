const asyncHandler = require('../utils/asyncHandler');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const mongoose = require('mongoose');

/**
 * Analytics Controller
 * Provides aggregated stats for the dashboard and career insights.
 */

/**
 * GET /api/v1/analytics/dashboard
 * Returns aggregate stats for the authenticated user's dashboard.
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [appStats, activeResume, freshJobCount] = await Promise.all([
    // Application stats aggregated by status
    Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    // User's active resume for ATS score
    Resume.findOne({ userId, isActive: true }).select('aiAnalysis.atsScore aiAnalysis.overallScore aiAnalysis.keywords fileName label'),
    // Fresh jobs count (last 24h)
    Job.countDocuments({
      isActive: true,
      postedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);

  const byStatus = {};
  let total = 0;
  appStats.forEach((s) => {
    byStatus[s._id] = s.count;
    total += s.count;
  });

  res.status(200).json({
    success: true,
    data: {
      applications: {
        total,
        byStatus,
        active: (byStatus.applied || 0) + (byStatus.phone_screen || 0) + (byStatus.interview || 0),
        interviews: byStatus.interview || 0,
        offers: byStatus.offer || 0,
      },
      resume: activeResume
        ? {
            atsScore: activeResume.aiAnalysis?.atsScore || 0,
            overallScore: activeResume.aiAnalysis?.overallScore || 0,
            missingKeywords: activeResume.aiAnalysis?.keywords?.missing || [],
            fileName: activeResume.label || activeResume.fileName,
          }
        : null,
      freshJobsToday: freshJobCount,
    },
  });
});

/**
 * GET /api/v1/analytics/skills
 * Returns trending skills from the job database.
 */
const getTrendingSkills = asyncHandler(async (req, res) => {
  const skills = await Job.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
    {
      $project: {
        skill: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: skills,
  });
});

/**
 * GET /api/v1/analytics/skill-gaps
 * Compares user's skills with skills required by jobs matching their preferences.
 */
const getSkillGaps = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const activeResume = await Resume.findOne({ userId, isActive: true }).select('skills aiAnalysis.keywords');
  if (!activeResume) {
    return res.status(200).json({
      success: true,
      data: { userSkills: [], missingSkills: [], topDemandedSkills: [] },
    });
  }

  const userSkills = [
    ...(activeResume.skills?.technical || []),
    ...(activeResume.skills?.tools || []),
    ...(activeResume.skills?.languages || []),
  ].map((s) => s.toLowerCase());

  const missingFromResume = activeResume.aiAnalysis?.keywords?.missing || [];

  // Get top demanded skills from jobs
  const trendingSkills = await Job.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$skills' },
    { $group: { _id: '$skills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 30 },
  ]);

  // Skills from job database that the user doesn't have
  const skillGaps = trendingSkills
    .filter((s) => !userSkills.includes(s._id.toLowerCase()))
    .slice(0, 10)
    .map((s) => ({ skill: s._id, demandCount: s.count }));

  res.status(200).json({
    success: true,
    data: {
      userSkills: activeResume.skills,
      missingFromResume,
      skillGaps,
      topDemandedSkills: trendingSkills.slice(0, 10).map((s) => ({ skill: s._id, count: s.count })),
    },
  });
});

module.exports = { getDashboardStats, getTrendingSkills, getSkillGaps };
