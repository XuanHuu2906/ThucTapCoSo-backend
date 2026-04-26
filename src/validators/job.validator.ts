import { z } from 'zod';

export const createJobSchema = z.object({
  body: z.object({
    deptName: z.string().min(1, 'Department name is required'),
    title: z.string().min(1, 'Job title is required'),
    description: z.string().optional(),
    requirements: z.string().optional(),
    salaryRange: z.string().optional(),
    startDate: z.string().datetime({ message: 'Start date must be a valid ISO datetime string' }),
    endDate: z.string().datetime({ message: 'End date must be a valid ISO datetime string' }),
    type: z.string().optional(),
    experienceLevel: z.string().optional(),
    location: z.string().optional(),
    headcount: z.number().int().min(1).optional(),
    status: z.enum(['Draft', 'Open', 'Closed']).optional(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    deptName: z.string().min(1, 'Department name is required').optional(),
    title: z.string().min(1, 'Job title is required').optional(),
    description: z.string().optional(),
    requirements: z.string().optional(),
    salaryRange: z.string().optional(),
    startDate: z.string().datetime({ message: 'Start date must be a valid ISO datetime string' }).optional(),
    endDate: z.string().datetime({ message: 'End date must be a valid ISO datetime string' }).optional(),
    type: z.string().optional(),
    experienceLevel: z.string().optional(),
    location: z.string().optional(),
    headcount: z.number().int().min(1).optional(),
    status: z.enum(['Draft', 'Open', 'Closed']).optional(),
  }),
});

export const updateJobStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Draft', 'Open', 'Closed']),
  }),
});
