import { z } from 'zod';

export const createProbationSchema = z.object({
  body: z.object({
    offerId: z.number().int().positive('Invalid Offer ID'),
    supervisorId: z.number().int().positive('Invalid Supervisor ID').optional(),
    startDate: z.string().datetime({ message: 'Start date must be a valid ISO datetime string' }),
    endDate: z.string().datetime({ message: 'End date must be a valid ISO datetime string' }),
  }),
});

export const updateProbationSchema = z.object({
  body: z.object({
    supervisorId: z.number().int().positive('Invalid Supervisor ID').optional(),
    startDate: z.string().datetime({ message: 'Start date must be a valid ISO datetime string' }).optional(),
    endDate: z.string().datetime({ message: 'End date must be a valid ISO datetime string' }).optional(),
  }),
});

export const evaluateProbationSchema = z.object({
  body: z.object({
    kpiScore: z.number().min(0).max(100).optional(),
    comment: z.string().optional(),
    recommendation: z.enum(['Pass', 'Fail']).optional(),
    isSubmit: z.boolean().default(false), // true if submitting for approval, false if just saving draft
  }),
});

export const approveEvaluationSchema = z.object({
  body: z.object({
    status: z.enum(['Approved', 'Rejected']),
    directorNote: z.string().optional(),
  }),
});
