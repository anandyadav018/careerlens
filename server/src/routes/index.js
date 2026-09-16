const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

/**
 * Route aggregator — mounts all route modules under their prefix.
 * New route files are added here as new phases are built.
 */

// Health check (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resumes', require('./resumeRoutes'));
router.use('/jobs', require('./jobRoutes'));
router.use('/ai', require('./aiRoutes'));
router.use('/applications', require('./applicationRoutes'));
router.use('/alerts', require('./alertRoutes'));
router.use('/analytics', require('./analyticsRoutes'));

module.exports = router;
