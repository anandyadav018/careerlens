const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema — stores account credentials, profile, job preferences, and onboarding state.
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password by default
    },
    avatar: {
      type: String,
      default: '',
    },
    headline: {
      type: String,
      maxlength: [120, 'Headline cannot exceed 120 characters'],
      default: '',
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
    },

    // ── Profile Skills & Experience ──
    skills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', '0-1', '1-2', '2-5', '5+', ''],
      default: '',
    },
    preferredRoles: {
      type: [String],
      default: [],
    },
    technologies: {
      type: [String],
      default: [],
    },

    // ── Job Preferences ──
    preferences: {
      desiredRoles: [{ type: String }],
      desiredLocations: [{ type: String }],
      salaryRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: 'INR' },
      },
      jobType: [
        {
          type: String,
          enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
        },
      ],
      remotePreference: {
        type: String,
        enum: ['remote', 'hybrid', 'onsite', 'any'],
        default: 'any',
      },
    },

    // ── Auth ──
    refreshToken: {
      type: String,
      select: false, // Never return in queries by default
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },

    // ── Onboarding ──
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
    toJSON: {
      // Remove sensitive fields when converting to JSON
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Pre-save Hook: Hash password ──
userSchema.pre('save', async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Methods ──

/**
 * Compare a candidate password with the stored hash.
 * @param {string} candidatePassword - Plain text password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Get the user's full name.
 * @returns {string}
 */
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

/**
 * Calculate profile completion percentage.
 * @returns {number} 0–100
 */
userSchema.methods.getProfileCompletion = function () {
  const fields = [
    this.firstName,
    this.lastName,
    this.email,
    this.headline,
    this.location?.city,
    this.skills?.length > 0,
    this.experienceLevel,
    this.preferredRoles?.length > 0,
    this.preferences?.remotePreference,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
