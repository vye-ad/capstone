import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'name is required'),
  email: z.string().email('enter a valid email'),
  password: z.string().min(8, 'password must be at least 8 characters'),
  countryCode: z.string().length(2, 'select a country'),
});

export const loginSchema = z.object({
  email: z.string().email('enter a valid email'),
  password: z.string().min(1, 'password is required'),
});
