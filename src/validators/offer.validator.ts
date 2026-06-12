import { z } from 'zod';

export const createOfferSchema = z.object({
  body: z.object({
    appId: z.number().int().positive('Invalid Application ID'),
    baseSalary: z.number().positive('Base salary must be greater than 0'),
    allowance: z.number().min(0, 'Allowance cannot be negative').optional().default(0),
    startDate: z.string().datetime({ message: 'Start date must be a valid ISO datetime string' }),
    probationDays: z.number().int().min(1, 'Probation days must be at least 1').optional().default(60),
  }),
});

export const updateOfferSchema = z.object({
  body: z.object({
    baseSalary: z.number().positive('Base salary must be greater than 0').optional(),
    allowance: z.number().min(0, 'Allowance cannot be negative').optional(),
    startDate: z.string().datetime({ message: 'Start date must be a valid ISO datetime string' }).optional(),
    probationDays: z.number().int().min(1, 'Probation days must be at least 1').optional(),
  }),
});

export const approveOfferSchema = z.object({
  body: z.object({
    status: z.enum(['Approved', 'Rejected']),
    directorNote: z.string().optional(),
  }),
});

export const updateOfferStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Sent', 'Accepted', 'Declined']),
  }),
});
