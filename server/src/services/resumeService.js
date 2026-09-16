const Resume = require('../models/Resume');
const aiService = require('./aiService');
const { parsePdf } = require('../utils/resumeParser');
const AppError = require('../utils/AppError');
const fs = require('fs');

class ResumeService {
  /**
   * Process an uploaded resume file: parse text, analyze via AI, and save to DB.
   * @param {Object} file - Multer file object
   * @param {string} userId - ID of the user uploading the resume
   */
  async processAndSaveResume(file, userId) {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    let rawText = '';
    try {
      // 1. Extract raw text from PDF
      rawText = await parsePdf(file.path);

      // 2. Pass raw text to AI Service for structured extraction and analysis
      const aiResult = await aiService.analyzeResume(rawText);

      // 3. Deactivate previous active resumes for this user
      await Resume.updateMany({ userId, isActive: true }, { isActive: false });

      // Determine version number
      const existingResumesCount = await Resume.countDocuments({ userId });

      // 4. Sanitize and prepare document data
      const sanitizedParsedData = {
        name: aiResult.parsedData?.name || '',
        email: aiResult.parsedData?.email || '',
        phone: aiResult.parsedData?.phone || '',
        summary: aiResult.parsedData?.summary || '',
        experience: Array.isArray(aiResult.parsedData?.experience)
          ? aiResult.parsedData.experience.map((exp) => ({
              title: exp.title || '',
              company: exp.company || '',
              location: exp.location || '',
              startDate: String(exp.startDate || ''),
              endDate: String(exp.endDate || ''),
              current: Boolean(exp.current),
              description: exp.description || '',
            }))
          : [],
        education: Array.isArray(aiResult.parsedData?.education)
          ? aiResult.parsedData.education.map((edu) => ({
              degree: edu.degree || '',
              institution: edu.institution || '',
              graduationDate: String(edu.graduationDate || ''),
              gpa: edu.gpa != null ? String(edu.gpa) : null,
            }))
          : [],
        certifications: Array.isArray(aiResult.parsedData?.certifications)
          ? aiResult.parsedData.certifications
          : [],
        projects: Array.isArray(aiResult.parsedData?.projects)
          ? aiResult.parsedData.projects
          : [],
      };

      const sanitizedSkills = {
        technical: Array.isArray(aiResult.skills?.technical) ? aiResult.skills.technical : [],
        soft: Array.isArray(aiResult.skills?.soft) ? aiResult.skills.soft : [],
        tools: Array.isArray(aiResult.skills?.tools) ? aiResult.skills.tools : [],
        languages: Array.isArray(aiResult.skills?.languages) ? aiResult.skills.languages : [],
      };

      const rawOverall = Number(aiResult.aiAnalysis?.overallScore);
      const rawAts = Number(aiResult.aiAnalysis?.atsScore);

      const sanitizedAiAnalysis = {
        overallScore: isNaN(rawOverall) ? 75 : Math.max(0, Math.min(100, Math.round(rawOverall))),
        atsScore: isNaN(rawAts) ? 75 : Math.max(0, Math.min(100, Math.round(rawAts))),
        sections: aiResult.aiAnalysis?.sections || {},
        strengths: Array.isArray(aiResult.aiAnalysis?.strengths) ? aiResult.aiAnalysis.strengths : [],
        improvements: Array.isArray(aiResult.aiAnalysis?.improvements) ? aiResult.aiAnalysis.improvements : [],
        keywords: {
          present: Array.isArray(aiResult.aiAnalysis?.keywords?.present) ? aiResult.aiAnalysis.keywords.present : [],
          missing: Array.isArray(aiResult.aiAnalysis?.keywords?.missing) ? aiResult.aiAnalysis.keywords.missing : [],
        },
        recommendations: Array.isArray(aiResult.aiAnalysis?.recommendations) ? aiResult.aiAnalysis.recommendations : [],
      };

      // 5. Save to Database
      const resume = await Resume.create({
        userId,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        rawText,
        parsedData: sanitizedParsedData,
        skills: sanitizedSkills,
        aiAnalysis: sanitizedAiAnalysis,
        isActive: true,
        version: existingResumesCount + 1,
      });

      // 6. Sync extracted technical skills to user profile
      try {
        const User = require('../models/User');
        const user = await User.findById(userId);
        if (user && sanitizedSkills.technical.length > 0) {
          user.skills = Array.from(new Set([...(user.skills || []), ...sanitizedSkills.technical]));
          await user.save();
        }
      } catch (_) {
        // Non-blocking sync error
      }

      return resume;
    } catch (error) {
      // Clean up file if processing failed
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  /**
   * Get all resumes for a user
   */
  async getUserResumes(userId) {
    return await Resume.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Get a specific resume by ID, ensuring it belongs to the user
   */
  async getResumeById(resumeId, userId) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }
    return resume;
  }

  /**
   * Delete a resume
   */
  async deleteResume(resumeId, userId) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    // Try to remove local file if it exists
    const localFilePath = `../..${resume.fileUrl}`;
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (err) {
      // ignore file deletion errors
    }

    await Resume.deleteOne({ _id: resumeId });
  }

  /**
   * Set a resume as active
   */
  async activateResume(resumeId, userId) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    await Resume.updateMany({ userId, isActive: true }, { isActive: false });
    resume.isActive = true;
    await resume.save();

    return resume;
  }

  /**
   * Update the label of a resume
   */
  async updateResumeLabel(resumeId, userId, label) {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new AppError('Resume not found', 404);
    }
    resume.label = label || '';
    await resume.save();
    return resume;
  }
}

module.exports = new ResumeService();
