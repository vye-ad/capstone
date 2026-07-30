import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { zodFieldErrors } from './zodFieldErrors.js';

describe('zodFieldErrors', () => {
  it('maps each issue to its field name', () => {
    const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
    const result = schema.safeParse({ email: 'not-an-email', password: 'short' });
    const fields = zodFieldErrors(result.error);
    expect(Object.keys(fields).sort()).toEqual(['email', 'password']);
  });

  it('keeps only the first issue when a field has multiple', () => {
    const schema = z.object({ name: z.string().min(1).max(3) });
    const result = schema.safeParse({ name: '' });
    const fields = zodFieldErrors(result.error);
    expect(Object.keys(fields)).toEqual(['name']);
  });

  it('falls back to _root for issues with no field path', () => {
    const schema = z.object({ a: z.string() }).refine(() => false, { message: 'form-level error' });
    const result = schema.safeParse({ a: 'x' });
    const fields = zodFieldErrors(result.error);
    expect(fields._root).toBe('form-level error');
  });
});
