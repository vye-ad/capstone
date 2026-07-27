import { z } from 'zod';

export const SUPPORTED_CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CHF', 'MXN', 'INR', 'BRL'];
export const TRANSPORT_TYPES = ['PLANE', 'TRAIN', 'CAR', 'BUS', 'FERRY', 'OTHER'];
export const ACCOMMODATION_TYPES = ['HOTEL', 'HOSTEL', 'APARTMENT', 'GUESTHOUSE', 'CAMPING', 'FRIENDS', 'OTHER'];
export const TRIP_STATUSES = ['UPCOMING', 'ONGOING', 'COMPLETED'];

const isoDate = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'must be a valid date');

const budgetAmount = z
  .number()
  .nonnegative('must be 0 or greater')
  .refine((v) => Number(v.toFixed(2)) === v, 'max 2 decimal places');

const baseFields = {
  countryCode: z.string().length(2, 'select a country'),
  startDate: isoDate,
  endDate: isoDate,
  status: z.enum(TRIP_STATUSES, { message: 'invalid status' }),
  budgetAmount,
  budgetCurrency: z.enum(SUPPORTED_CURRENCIES, { message: 'unsupported currency' }),
  transportType: z.enum(TRANSPORT_TYPES, { message: 'invalid transport type' }).optional(),
  accommodationType: z.enum(ACCOMMODATION_TYPES, { message: 'invalid accommodation type' }).optional(),
  notes: z.string().max(2000, 'max 2000 characters').optional(),
};

function endNotBeforeStart(data) {
  if (!data.startDate || !data.endDate) return true;
  return new Date(data.endDate) >= new Date(data.startDate);
}

export const tripCreateSchema = z.object(baseFields).refine(endNotBeforeStart, {
  message: 'end date must be on or after start date',
  path: ['endDate'],
});

export const tripUpdateSchema = z
  .object(
    Object.fromEntries(Object.entries(baseFields).map(([key, schema]) => [key, schema.optional()]))
  )
  .refine(endNotBeforeStart, {
    message: 'end date must be on or after start date',
    path: ['endDate'],
  });
