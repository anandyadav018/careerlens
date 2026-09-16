const { z } = require('zod');

const createAlertSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50),
    keywords: z.array(z.string()).min(1, 'At least one keyword is required'),
    locations: z.array(z.string()).optional(),
    jobTypes: z.array(z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance'])).optional(),
    experienceLevels: z.array(z.enum(['entry', 'mid', 'senior', 'lead', 'executive'])).optional(),
    minSalary: z.number().min(0).optional(),
    frequency: z.enum(['instant', 'daily', 'weekly']).default('daily'),
  }),
});

const updateAlertSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Alert ID'),
  }),
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    keywords: z.array(z.string()).min(1).optional(),
    locations: z.array(z.string()).optional(),
    jobTypes: z.array(z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance'])).optional(),
    experienceLevels: z.array(z.enum(['entry', 'mid', 'senior', 'lead', 'executive'])).optional(),
    minSalary: z.number().min(0).optional(),
    frequency: z.enum(['instant', 'daily', 'weekly']).optional(),
  }),
});

module.exports = {
  createAlertSchema,
  updateAlertSchema,
};
