const Alert = require('../models/Alert');
const Job = require('../models/Job');
const AppError = require('../utils/AppError');

class AlertService {
  /**
   * Create a new alert for a user.
   */
  async createAlert(userId, alertData) {
    const alert = await Alert.create({ userId, ...alertData });
    return alert;
  }

  /**
   * Get all alerts for a user.
   */
  async getUserAlerts(userId) {
    return await Alert.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Update an alert.
   */
  async updateAlert(alertId, userId, updateData) {
    const alert = await Alert.findOneAndUpdate(
      { _id: alertId, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!alert) throw new AppError('Alert not found', 404);
    return alert;
  }

  /**
   * Toggle alert active status.
   */
  async toggleAlert(alertId, userId) {
    const alert = await Alert.findOne({ _id: alertId, userId });
    if (!alert) throw new AppError('Alert not found', 404);
    alert.isActive = !alert.isActive;
    await alert.save();
    return alert;
  }

  /**
   * Delete an alert.
   */
  async deleteAlert(alertId, userId) {
    const result = await Alert.deleteOne({ _id: alertId, userId });
    if (result.deletedCount === 0) {
      throw new AppError('Alert not found', 404);
    }
  }

  /**
   * Find matching jobs for an alert (used by cron job).
   */
  async findMatchingJobs(alert) {
    const filter = { isActive: true };

    // Keyword matching via text search
    if (alert.keywords && alert.keywords.length > 0) {
      filter.$text = { $search: alert.keywords.join(' ') };
    }

    // Location filter
    if (alert.locations && alert.locations.length > 0) {
      const locationRegexes = alert.locations.map(l => new RegExp(l, 'i'));
      filter.$or = [
        { 'location.city': { $in: locationRegexes } },
        { 'location.state': { $in: locationRegexes } },
        { 'location.country': { $in: locationRegexes } },
      ];
      // If "Remote" is in locations, also match isRemote
      if (alert.locations.some(l => l.toLowerCase() === 'remote')) {
        filter.$or.push({ 'location.isRemote': true });
      }
    }

    // Job type filter
    if (alert.jobTypes && alert.jobTypes.length > 0) {
      filter.jobType = { $in: alert.jobTypes };
    }

    // Experience level filter
    if (alert.experienceLevels && alert.experienceLevels.length > 0) {
      filter.experienceLevel = { $in: alert.experienceLevels };
    }

    // Salary floor
    if (alert.minSalary) {
      filter['salary.min'] = { $gte: alert.minSalary };
    }

    // Exclude already-sent jobs
    if (alert.matchedJobIds && alert.matchedJobIds.length > 0) {
      filter._id = { $nin: alert.matchedJobIds };
    }

    return await Job.find(filter).sort({ postedAt: -1 }).limit(10);
  }
}

module.exports = new AlertService();
