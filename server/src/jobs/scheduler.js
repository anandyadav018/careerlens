const cron = require('node-cron');
const logger = require('../config/logger');
const scrapeJobsTask = require('./tasks/scrapeJobs');
const sendJobAlertsTask = require('./tasks/jobAlerts');

/**
 * Job Scheduler Registry
 * Registers and starts all background cron jobs.
 */
const startScheduler = () => {
  logger.info('Starting cron scheduler...');

  // 1. Scrape India job boards every 6 hours to keep listings fresh
  //    With 24h TTL, scraping every 6h ensures the board is never empty.
  cron.schedule('0 */6 * * *', async () => {
    logger.info('[Scheduler] Running scheduled 6-hour job scrape...');
    await scrapeJobsTask();
  });

  // 2. Send Job Alerts: Daily at 8 AM
  cron.schedule('0 8 * * *', async () => {
    await sendJobAlertsTask();
  });

  // 3. Run one scrape 15 seconds after server start so the board is
  //    populated immediately on first boot (not empty for 6 hours).
  setTimeout(async () => {
    logger.info('[Scheduler] Running initial startup scrape...');
    try {
      await scrapeJobsTask();
    } catch (err) {
      logger.error(`[Scheduler] Startup scrape failed: ${err.message}`);
    }
  }, 15000);
};

module.exports = startScheduler;
