const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobSnapshot: {
      title: String,
      company: String,
      location: String,
      sourceUrl: String,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: false,
    },
    coverLetterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoverLetter',
      required: false,
    },
    status: {
      type: String,
      enum: ['saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'withdrawn'],
      default: 'saved',
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: null,
    },
    statusHistory: [{
      status: String,
      changedAt: { type: Date, default: Date.now },
      note: { type: String, default: '' },
    }],
    nextFollowUp: {
      type: Date,
      default: null,
    },
    contacts: [{
      name: String,
      role: String,
      email: String,
      linkedIn: String,
    }],
    matchScore: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent users from saving/applying to the same job twice
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
