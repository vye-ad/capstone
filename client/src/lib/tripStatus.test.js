import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { deriveStatus } from './tripStatus.js';

describe('deriveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 15))); // 2026-06-15
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when either date is missing', () => {
    expect(deriveStatus('', '2026-07-01')).toBeNull();
    expect(deriveStatus('2026-07-01', '')).toBeNull();
  });

  it('returns UPCOMING when today is before the start date', () => {
    expect(deriveStatus('2026-07-01', '2026-07-10')).toBe('UPCOMING');
  });

  it('returns ONGOING when today falls within the range', () => {
    expect(deriveStatus('2026-06-10', '2026-06-20')).toBe('ONGOING');
  });

  it('returns COMPLETED when today is after the end date', () => {
    expect(deriveStatus('2026-05-01', '2026-05-10')).toBe('COMPLETED');
  });
});
