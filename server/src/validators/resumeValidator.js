const { z } = require('zod');

// Schema for updating an existing resume's parsed data manually (optional feature)
const updateResumeDataSchema = z.object({
  parsedData: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    summary: z.string().optional(),
    experience: z.array(z.object({
      title: z.string().optional(),
      company: z.string().optional(),
      location: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      current: z.boolean().optional(),
      description: z.string().optional(),
    })).optional(),
    education: z.array(z.object({
      degree: z.string().optional(),
      institution: z.string().optional(),
      graduationDate: z.string().optional(),
      gpa: z.number().optional(),
    })).optional(),
  }).optional(),
  skills: z.object({
    technical: z.array(z.string()).optional(),
    soft: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  updateResumeDataSchema,
};
