const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
    },
    source: {
      type: String, // 'linkedin', 'indeed', 'glassdoor', 'remoteok', etc.
      required: true,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      name: { type: String, required: true, trim: true },
      logo: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      isRemote: { type: Boolean, default: false },
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    skills: [{ type: String }], // Extracted/normalized skills
    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, default: 'USD' },
      period: { type: String, default: 'yearly' }, // yearly, monthly, hourly
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'other'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead', 'executive', 'any'],
      default: 'any',
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    scrapedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      // Auto-delete 24 hours after scraping — forces fresh data on every cycle
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Prevent duplicate jobs from the same source
jobSchema.index({ externalId: 1, source: 1 }, { unique: true });

// Text search indexes for filtering
jobSchema.index({ title: 'text', description: 'text', 'company.name': 'text' });

// Regular indexes for common filters
jobSchema.index({ skills: 1 });
jobSchema.index({ postedAt: -1 });
jobSchema.index({ 'location.isRemote': 1, jobType: 1 });

// TTL index to automatically delete expired jobs
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
