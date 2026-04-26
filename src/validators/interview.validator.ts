import { z } from 'zod';

export const scheduleInterviewSchema = z.object({
  body: z.object({
    appId: z.number().int().positive('Invalid Application ID'),
    interviewerId: z.number().int().positive('Invalid Interviewer ID'),
    interviewDate: z.string().datetime({ message: 'Interview date must be a valid ISO datetime string' }),
    type: z.enum(['HR', 'Technical', 'Final']),
    location: z.string().optional(),
  }),
});

export const updateInterviewSchema = z.object({
  body: z.object({
    interviewerId: z.number().int().positive('Invalid Interviewer ID').optional(),
    interviewDate: z.string().datetime({ message: 'Interview date must be a valid ISO datetime string' }).optional(),
    type: z.enum(['HR', 'Technical', 'Final']).optional(),
    location: z.string().optional(),
  }),
});

export const confirmInterviewSchema = z.object({
  body: z.object({
    confirmStatus: z.enum(['Confirmed', 'Declined']),
  }),
});

export const evaluateInterviewSchema = z.object({
  body: z.object({
    technicalScore: z.number().min(0).max(10).optional(),
    softScore: z.number().min(0).max(10).optional(),
    attitudeScore: z.number().min(0).max(10).optional(),
    result: z.enum(['Pass', 'Fail']),
    feedback: z.string().optional(),
  }),
});
