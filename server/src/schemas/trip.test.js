import { tripCreateSchema, tripUpdateSchema } from './trip.js';

const validTrip = {
  countryCode: 'JP',
  startDate: '2026-08-01',
  endDate: '2026-08-10',
  status: 'UPCOMING',
  budgetAmount: 1500.5,
  budgetCurrency: 'CAD',
};

describe('tripCreateSchema', () => {
  it('accepts a valid trip', () => {
    expect(tripCreateSchema.safeParse(validTrip).success).toBe(true);
  });

  it('rejects an end date before the start date', () => {
    const result = tripCreateSchema.safeParse({ ...validTrip, startDate: '2026-08-10', endDate: '2026-08-01' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(['endDate']);
  });

  it('accepts a same-day trip (end date equal to start date)', () => {
    const result = tripCreateSchema.safeParse({ ...validTrip, startDate: '2026-08-01', endDate: '2026-08-01' });
    expect(result.success).toBe(true);
  });

  it('rejects a negative budget', () => {
    expect(tripCreateSchema.safeParse({ ...validTrip, budgetAmount: -10 }).success).toBe(false);
  });

  it('rejects a budget with more than 2 decimal places', () => {
    expect(tripCreateSchema.safeParse({ ...validTrip, budgetAmount: 10.999 }).success).toBe(false);
  });

  it('rejects an unsupported currency', () => {
    expect(tripCreateSchema.safeParse({ ...validTrip, budgetCurrency: 'XYZ' }).success).toBe(false);
  });

  it('rejects a country code that is not exactly 2 characters', () => {
    expect(tripCreateSchema.safeParse({ ...validTrip, countryCode: 'JPN' }).success).toBe(false);
  });

  it('rejects an invalid status', () => {
    expect(tripCreateSchema.safeParse({ ...validTrip, status: 'CANCELLED' }).success).toBe(false);
  });

  it('rejects a missing required field', () => {
    const { countryCode, ...rest } = validTrip;
    expect(tripCreateSchema.safeParse(rest).success).toBe(false);
  });
});

describe('tripUpdateSchema', () => {
  it('accepts a partial update with a single field', () => {
    expect(tripUpdateSchema.safeParse({ notes: 'updated notes' }).success).toBe(true);
  });

  it('accepts an empty update', () => {
    expect(tripUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('still enforces end-not-before-start when both dates are present', () => {
    const result = tripUpdateSchema.safeParse({ startDate: '2026-08-10', endDate: '2026-08-01' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid field even when everything else is omitted', () => {
    expect(tripUpdateSchema.safeParse({ budgetCurrency: 'NOTREAL' }).success).toBe(false);
  });
});
