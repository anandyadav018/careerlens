const { IndiaJobBoardScraper, INDIA_JOB_BOARDS } = require('./indiaJobBoardScraper');

/**
 * Default sources: all 4 India boards.
 * Override with env: JOB_SOURCES=internshala,timesjobs
 */
const DEFAULT_SOURCES = Object.keys(INDIA_JOB_BOARDS).join(',');

const createScrapers = () => {
  const selected = (process.env.JOB_SOURCES || DEFAULT_SOURCES)
    .split(',')
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);

  const scrapers = [];
  for (const source of selected) {
    if (INDIA_JOB_BOARDS[source]) {
      scrapers.push(new IndiaJobBoardScraper(source));
    } else {
      const logger = require('../../config/logger');
      logger.warn(`[Scrapers] Unknown source: "${source}" — skipped.`);
    }
  }

  return scrapers;
};

module.exports = { createScrapers, INDIA_JOB_BOARDS };
