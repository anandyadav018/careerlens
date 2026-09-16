const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const fs = require('fs');
const path = require('path');
const startScheduler = require('./src/jobs/scheduler');

/**
 * Server Entry Point.
 *
 * 1. Connect to MongoDB
 * 2. Ensure upload directory exists
 * 3. Start Express server
 * 4. Handle graceful shutdown
 */

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start background jobs scheduler
    startScheduler();

    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, env.UPLOAD_DIR);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      logger.info(`Created upload directory: ${uploadDir}`);
    }

    // Start server
    const PORT = env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`🚀 CareerLens AI API running on port ${PORT} [${env.NODE_ENV}]`);
    });

    // ── Graceful Shutdown ──
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        const mongoose = require('mongoose');
        mongoose.connection.close(false).then(() => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        }).catch(err => {
          logger.error('Error closing MongoDB connection:', err);
          process.exit(1);
        });
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown — could not close connections in time');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION:', err);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION:', err);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
