const Alert = require('../../models/Alert');
const User = require('../../models/User');
const alertService = require('../../services/alertService');
const emailService = require('../../services/emailService');
const logger = require('../../config/logger');

const sendJobAlertsTask = async () => {
  logger.info('Starting scheduled job alerts task...');
  let emailsSent = 0;

  try {
    // 1. Get all active alerts for daily digest
    const activeAlerts = await Alert.find({ isActive: true, frequency: 'daily' });

    for (const alert of activeAlerts) {
      // 2. Find jobs matching the alert criteria
      const matchingJobs = await alertService.findMatchingJobs(alert);

      if (matchingJobs.length > 0) {
        const user = await User.findById(alert.userId);
        if (user) {
          // 3. Send email digest
          await emailService.sendJobAlerts(user, matchingJobs);
          emailsSent++;
          
          // 4. Update alert history
          alert.lastTriggeredAt = new Date();
          alert.matchedJobIds.push(...matchingJobs.map(j => j._id));
          await alert.save();
        }
      }
    }

    logger.info(`Scheduled job alerts task completed. Sent ${emailsSent} emails.`);
  } catch (error) {
    logger.error(`Error in sendJobAlertsTask: ${error.message}`);
  }
};

module.exports = sendJobAlertsTask;
