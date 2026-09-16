const Application = require('../models/Application');
const Job = require('../models/Job');
const AppError = require('../utils/AppError');

class ApplicationService {
  /**
   * Get all applications for a user, populated with Job data.
   */
  async getUserApplications(userId) {
    return await Application.find({ userId })
      .populate({
        path: 'jobId',
        select: 'title company location salary jobType sourceUrl',
      })
      .sort({ updatedAt: -1 });
  }

  /**
   * Save a job to the tracker.
   */
  async saveJob(userId, jobId, initialStatus = 'saved') {
    const job = await Job.findById(jobId);
    if (!job) throw new AppError('Job not found', 404);

    try {
      const application = await Application.create({
        userId,
        jobId,
        status: initialStatus,
        appliedAt: initialStatus === 'applied' ? new Date() : null,
        jobSnapshot: {
          title: job.title,
          company: job.company?.name || '',
          location: job.location?.isRemote ? 'Remote' : job.location?.city || '',
          sourceUrl: job.sourceUrl || '',
        },
        statusHistory: [{
          status: initialStatus,
          changedAt: new Date(),
          note: `Job ${initialStatus === 'applied' ? 'applied to' : 'saved'}`,
        }],
      });
      return await application.populate({
        path: 'jobId',
        select: 'title company location salary jobType sourceUrl',
      });
    } catch (error) {
      if (error.code === 11000) {
        throw new AppError('You have already saved or applied to this job.', 400);
      }
      throw error;
    }
  }

  /**
   * Update application status or notes.
   */
  async updateApplication(applicationId, userId, updateData) {
    const app = await Application.findOne({ _id: applicationId, userId });
    if (!app) throw new AppError('Application not found', 404);

    if (updateData.status && app.status !== updateData.status) {
      // Track status history
      app.statusHistory.push({
        status: updateData.status,
        changedAt: new Date(),
        note: updateData.statusNote || '',
      });

      if (updateData.status === 'applied' && !app.appliedAt) {
        app.appliedAt = new Date();
      }
      app.status = updateData.status;
    }
    
    if (updateData.notes !== undefined) app.notes = updateData.notes;
    if (updateData.nextFollowUp !== undefined) app.nextFollowUp = updateData.nextFollowUp;
    
    await app.save();
    return await app.populate({
      path: 'jobId',
      select: 'title company location salary jobType sourceUrl',
    });
  }

  /**
   * Delete an application from the tracker.
   */
  async deleteApplication(applicationId, userId) {
    const result = await Application.deleteOne({ _id: applicationId, userId });
    if (result.deletedCount === 0) {
      throw new AppError('Application not found', 404);
    }
  }

  /**
   * Get application statistics for dashboard.
   */
  async getApplicationStats(userId) {
    const mongoose = require('mongoose');
    const stats = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    const byStatus = {};
    stats.forEach(s => { byStatus[s._id] = s.count; });
    return { total, byStatus };
  }
}

module.exports = new ApplicationService();
