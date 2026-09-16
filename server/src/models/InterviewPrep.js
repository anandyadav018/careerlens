const mongoose = require('mongoose');

const interviewPrepSchema = new mongoose.Schema(
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
    },
    jobTitle: {
      type: String,
      default: '',
    },
    companyName: {
      type: String,
      default: '',
    },
    questions: [{
      category: {
        type: String,
        enum: ['behavioral', 'technical', 'system_design', 'situational'],
      },
      question: String,
      suggestedAnswer: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
      },
      tips: [String],
    }],
    userSkills: [String],
    aiModel: {
      type: String,
      default: 'gemini-3.6-flash',
    },
  },
  {
    timestamps: true,
  }
);

interviewPrepSchema.index({ userId: 1, createdAt: -1 });

const InterviewPrep = mongoose.model('InterviewPrep', interviewPrepSchema);

module.exports = InterviewPrep;
