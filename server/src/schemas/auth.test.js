import { registerSchema, loginSchema } from './auth.js';

describe('registerSchema', () => {
  const valid = { name: 'Ada', email: 'ada@example.com', password: 'password123', countryCode: 'FR' };

  it('accepts a valid registration payload', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = registerSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects a country code that is not exactly 2 characters', () => {
    expect(registerSchema.safeParse({ ...valid, countryCode: 'FRA' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, countryCode: 'F' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts a valid login payload', () => {
    expect(loginSchema.safeParse({ email: 'ada@example.com', password: 'anything' }).success).toBe(true);
  });

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'ada@example.com', password: '' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'anything' }).success).toBe(false);
  });
});
