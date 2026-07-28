import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from './trip.js';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'name is required').optional(),
  email: z.string().email('enter a valid email').optional(),
  countryCode: z.string().length(2, 'select a country').optional(),
  locale: z.enum(['en', 'fr', 'es'], { message: 'invalid locale' }).optional(),
  currency: z.enum(SUPPORTED_CURRENCIES, { message: 'unsupported currency' }).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'current password is required'),
  newPassword: z.string().min(8, 'password must be at least 8 characters'),
});
