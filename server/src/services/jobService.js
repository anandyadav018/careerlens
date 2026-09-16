const Job = require('../models/Job');
const Resume = require('../models/Resume');
const aiService = require('./aiService');
const AppError = require('../utils/AppError');

class JobService {
  /**
   * Upsert a job (insert if new, update if exists based on externalId + source)
   */
  async upsertJob(jobData) {
    return await Job.findOneAndUpdate(
      { externalId: jobData.externalId, source: jobData.source },
      { $set: jobData },
      { new: true, upsert: true, runValidators: true }
    );
  }

  /**
   * Search and filter jobs with pagination
   */
  async searchJobs(query) {
    const {
      q,
      location,
      isRemote,
      jobType,
      experienceLevel,
      skills,
      minSalary,
      postedWithin,
      page = 1,
      limit = 10,
      sort = '-postedAt',
    } = query;

    const filter = { isActive: true };

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    // Location & Remote. These filters are intentionally independent so a
    // user can combine a city with a work-setup preference.
    if (isRemote !== undefined) {
      filter['location.isRemote'] = isRemote;
    }

    if (location) {
      const normalizedLocation = location.trim();
      const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      if (/^(remote|wfh|work from home)$/i.test(normalizedLocation)) {
        filter['location.isRemote'] = true;
      } else {
        const locationPattern = new RegExp(escapeRegex(normalizedLocation), 'i');
        filter.$or = [
          { 'location.city': locationPattern },
          { 'location.state': locationPattern },
          { 'location.country': locationPattern },
        ];
      }
    }

    // Exact matches
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    
    // Skills (jobs must have AT LEAST ONE of the queried skills)
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim().toLowerCase());
      // Case-insensitive regex match against job skills array
      filter.skills = { $in: skillArray.map(s => new RegExp(`^${s}$`, 'i')) };
    }

    // Salary Floor
    if (minSalary) {
      filter['salary.min'] = { $gte: minSalary };
    }

    // Time filter
    if (postedWithin && postedWithin !== 'all') {
      const now = new Date();
      if (postedWithin === '24h') filter.postedAt = { $gte: new Date(now - 24 * 60 * 60 * 1000) };
      if (postedWithin === '3d') filter.postedAt = { $gte: new Date(now - 3 * 24 * 60 * 60 * 1000) };
      if (postedWithin === '7d') filter.postedAt = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
    }

    // Build sort object
    let sortObj = {};
    if (q) {
      sortObj.score = { $meta: 'textScore' }; // Sort by relevance if text search
    } else if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Job.countDocuments(filter)
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Get a single job by ID
   */
  async getJobById(jobId) {
    const job = await Job.findById(jobId).select('-__v');
    if (!job) {
      throw new AppError('Job not found', 404);
    }
    return job;
  }
  
  /**
   * Get match score for a job vs user's active resume using AI
   */
  async getMatchScore(jobId, userId) {
    const job = await Job.findById(jobId);
    if (!job) throw new AppError('Job not found', 404);

    const activeResume = await Resume.findOne({ userId, isActive: true });
    if (!activeResume) {
      throw new AppError('No active resume found. Please upload a resume first to get match scores.', 400);
    }

    return await aiService.generateJobMatchScore(activeResume, job);
  }

  /**
   * Get recommended jobs based on user's active resume skills
   */
  async getRecommendedJobs(userId) {
    const activeResume = await Resume.findOne({ userId, isActive: true });
    if (!activeResume) {
      return []; // Return empty array if no active resume
    }

    // Extract all skills from the active resume
    const { technical = [], soft = [], tools = [], languages = [] } = activeResume.skills || {};
    const allSkills = [...technical, ...soft, ...tools, ...languages];

    if (allSkills.length === 0) {
      return [];
    }

    // Convert skills to lowercase for case-insensitive matching
    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const skillRegexes = allSkills.map(s => new RegExp(`^${escapeRegex(s.trim())}$`, 'i'));

    // Find jobs that require any of the user's skills
    // We limit to 6 recommended jobs for the dashboard
    const recommendedJobs = await Job.find({
      isActive: true,
      skills: { $in: skillRegexes }
    })
      .sort({ postedAt: -1 })
      .limit(6)
      .select('-__v');

    return recommendedJobs;
  }
}

module.exports = new JobService();
