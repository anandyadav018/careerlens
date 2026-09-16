const { z } = require('zod');

// Schema for job search query params
const jobQuerySchema = z.object({
  q: z.string().optional(),
  location: z.string().optional(),
  // Preserve an omitted value. Previously it became `false`, which made every
  // request filter to on-site jobs and skipped the location query entirely.
  isRemote: z.enum(['true', 'false']).optional().transform((val) => {
    if (val === undefined) return undefined;
    return val === 'true';
  }),
  jobType: z.string().optional(),
  experienceLevel: z.string().optional(),
  skills: z.string().optional(), // Comma-separated
  minSalary: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
  postedWithin: z.enum(['24h', '3d', '7d', 'all']).optional().default('all'),
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  sort: z.enum(['-postedAt', 'postedAt', 'salary', '-salary']).optional().default('-postedAt'),
});

module.exports = {
  jobQuerySchema,
};
