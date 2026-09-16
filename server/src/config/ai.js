const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('./env');
const AppError = require('../utils/AppError');

/**
 * Initializes and exports the AI provider (Gemini).
 */
const getAiInstance = () => {
  if (!env.GEMINI_API_KEY) {
    throw new AppError('AI provider is not configured. Missing GEMINI_API_KEY.', 500);
  }
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
};

module.exports = { getAiInstance };
