const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: [100, 'Label cannot exceed 100 characters'],
      default: '',
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String, // Store path for local, or URL for S3
      required: true,
    },
    fileSize: {
      type: Number, // In bytes
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    parsedData: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      summary: { type: String, default: '' },
      experience: [
        {
          title: String,
          company: String,
          location: String,
          startDate: String,
          endDate: String,
          current: Boolean,
          description: String,
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          graduationDate: String,
          gpa: mongoose.Schema.Types.Mixed,
        },
      ],
      certifications: [String],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          url: String,
        },
      ],
    },
    skills: {
      technical: [String],
      soft: [String],
      tools: [String],
      languages: [String],
    },
    aiAnalysis: {
      overallScore: { type: Number, min: 0, max: 100 },
      atsScore: { type: Number, min: 0, max: 100 },
      sections: {
        summary: { score: Number, feedback: String },
        experience: { score: Number, feedback: String },
        skills: { score: Number, feedback: String },
        education: { score: Number, feedback: String },
        formatting: { score: Number, feedback: String },
        projects: { score: Number, feedback: String },
      },
      strengths: [String],
      improvements: [String],
      keywords: {
        present: [String],
        missing: [String],
      },
      recommendations: [
        {
          section: String,
          before: String,
          after: String,
          reason: String,
        },
      ],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding a user's active resume quickly
resumeSchema.index({ userId: 1, isActive: 1 });
// Index for sorting a user's resumes by creation date
resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
