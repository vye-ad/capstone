import { describe, it, expect } from 'vitest';
import { convertAmount, formatCurrency } from './currency.js';

describe('convertAmount', () => {
  const rates = { CAD: 1, USD: 0.73, JPY: 108 };

  it('returns the amount unchanged when converting to the same currency', () => {
    expect(convertAmount(100, 'CAD', 'CAD', rates)).toBe(100);
  });

  it('converts between two currencies via the CAD-based rate table', () => {
    // 100 CAD -> USD: (100 / 1) * 0.73
    expect(convertAmount(100, 'CAD', 'USD', rates)).toBeCloseTo(73);
  });

  it('converts between two non-CAD currencies', () => {
    // 100 USD -> JPY: (100 / 0.73) * 108
    expect(convertAmount(100, 'USD', 'JPY', rates)).toBeCloseTo((100 / 0.73) * 108);
  });

  it('falls back to the raw amount when rates are missing', () => {
    expect(convertAmount(50, 'CAD', 'USD', null)).toBe(50);
  });

  it('falls back to the raw amount when a currency is not in the rate table', () => {
    expect(convertAmount(50, 'CAD', 'XYZ', rates)).toBe(50);
  });
});

describe('formatCurrency', () => {
  it('formats an amount using Intl.NumberFormat currency style', () => {
    const formatted = formatCurrency(1234.5, 'CAD', 'en');
    expect(formatted).toMatch(/1,234\.50/);
  });
});
