const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    locations: {
      type: [String],
      default: [],
    },
    jobTypes: {
      type: [String],
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: [],
    },
    experienceLevels: {
      type: [String],
      enum: ['entry', 'mid', 'senior', 'lead', 'executive'],
      default: [],
    },
    minSalary: {
      type: Number,
      default: null,
    },
    frequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly'],
      default: 'daily',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastTriggeredAt: {
      type: Date,
      default: null,
    },
    matchedJobIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    }],
  },
  {
    timestamps: true,
  }
);

// For efficient cron queries
alertSchema.index({ isActive: 1, frequency: 1 });
alertSchema.index({ userId: 1, isActive: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
