const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const scrapeJobsTask = require('../src/jobs/tasks/scrapeJobs');
const logger = require('../src/config/logger');

const run = async () => {
  try {
    await connectDB();
    await scrapeJobsTask();
  } catch (error) {
    logger.error(`Manual job sync failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
