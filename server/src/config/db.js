const mongoose = require('mongoose');
const logger = require('./logger');
const env = require('./env');

let memoryServer = null;

const autoSeed = async () => {
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@careerlens.ai',
        password: 'password123',
        isEmailVerified: true,
        skills: ['React', 'JavaScript', 'Node.js', 'Tailwind CSS', 'Git'],
        experienceLevel: '1-2',
        preferredRoles: ['Frontend Developer', 'Full Stack Developer'],
        onboardingCompleted: true,
      });
      logger.info('🌱 Demo user created (demo@careerlens.ai / password123). Jobs will be populated by scrapers.');
    }
  } catch (seedErr) {
    logger.warn(`Auto-seed skipped: ${seedErr.message}`);
  }
};

/**
 * Connect to MongoDB with retry logic and local dev fallback.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    await autoSeed();

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected.');
    });

    return conn;
  } catch (error) {
    if (env.NODE_ENV === 'development') {
      logger.warn(`Standard MongoDB connection to ${env.MONGODB_URI} failed (${error.message}).`);
      logger.info('Starting zero-config embedded MongoDB for development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();
        const conn = await mongoose.connect(memoryUri);
        logger.info(`✅ Embedded MongoDB started: ${memoryUri}`);
        await autoSeed();
        return conn;
      } catch (memErr) {
        logger.error(`Failed to start embedded MongoDB: ${memErr.message}`);
        process.exit(1);
      }
    } else {
      logger.error(`MongoDB connection failed: ${error.message}`);
      process.exit(1);
    }
  }
};

const stopMemoryServer = async () => {
  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = connectDB;
module.exports.stopMemoryServer = stopMemoryServer;
