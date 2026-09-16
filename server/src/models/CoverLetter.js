const mongoose = require('mongoose');

const coverLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    companyName: {
      type: String,
      default: '',
    },
    roleName: {
      type: String,
      default: '',
    },
    generatedContent: {
      type: String,
      required: true,
    },
    editedContent: {
      type: String,
      default: null,
    },
    aiModel: {
      type: String,
      default: 'gemini-3.6-flash',
    },
  },
  {
    timestamps: true,
  }
);

coverLetterSchema.index({ userId: 1, createdAt: -1 });

const CoverLetter = mongoose.model('CoverLetter', coverLetterSchema);

module.exports = CoverLetter;
