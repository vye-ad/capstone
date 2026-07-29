import { z } from 'zod';

export const roleUpdateSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], { message: 'invalid role' }),
});

export const countryUpdateSchema = z.object({
  isFeatured: z.boolean().optional(),
  capital: z.string().min(1, 'capital cannot be empty').optional(),
});

export const cityCreateSchema = z.object({
  name: z.string().min(1, 'name is required'),
  sortOrder: z.number().int().optional(),
});

export const attractionCreateSchema = z.object({
  name: z.string().min(1, 'name is required'),
  sortOrder: z.number().int().optional(),
});
