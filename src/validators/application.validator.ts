import { z } from 'zod';

// For the submitApplicationSchema, cvFile will be handled by multer and we might
// check its presence in the controller, but we can also validate req.body fields.
export const submitApplicationSchema = z.object({
  body: z.object({
    jobId: z.coerce.number().int().positive('Invalid Job ID'),
    fullName: z.string().min(3, 'Full name must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['New', 'Screening', 'Shortlisted', 'Interviewing', 'Offered', 'Hired', 'Rejected', 'Withdrawn']),
  }),
});
