const { createScrapers } = require('../scrapers');
const jobService = require('../../services/jobService');
const logger = require('../../config/logger');

/**
 * Task: Scrape Jobs
 * Orchestrates all configured scrapers and upserts results to the database.
 */
const scrapeJobsTask = async () => {
  logger.info('Starting scheduled job scraping task...');
  const startTime = Date.now();
  let totalUpserted = 0;

  const scrapers = createScrapers();

  if (scrapers.length === 0) {
    logger.warn('No valid job sources configured. Set JOB_SOURCES to supported India boards.');
    return;
  }

  for (const scraper of scrapers) {
    try {
      const jobs = await scraper.scrape();
      
      for (const job of jobs) {
        await jobService.upsertJob(job);
        totalUpserted++;
      }
      
      logger.info(`[${scraper.sourceName}] Successfully scraped and upserted ${jobs.length} jobs.`);
    } catch (error) {
      logger.error(`[${scraper.sourceName}] Scraping failed: ${error.message}`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  logger.info(`Scheduled job scraping task completed in ${duration}s. Total upserted: ${totalUpserted}`);
};

module.exports = scrapeJobsTask;
