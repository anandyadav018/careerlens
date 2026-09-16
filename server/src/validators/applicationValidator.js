const { z } = require('zod');

const saveApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Job ID'),
    status: z.enum(['saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'withdrawn']).optional(),
  }),
});

const updateApplicationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Application ID'),
  }),
  body: z.object({
    status: z.enum(['saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'withdrawn']).optional(),
    notes: z.string().max(1000).optional(),
    nextFollowUp: z.string().datetime().optional().nullable(),
  }),
});

module.exports = {
  saveApplicationSchema,
  updateApplicationSchema,
};
