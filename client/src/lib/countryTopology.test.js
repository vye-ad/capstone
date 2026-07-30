import { describe, it, expect } from 'vitest';
import { findCountryFeature } from './countryTopology.js';

const features = [
  { properties: { ISO_A2: 'JP', ISO_A3: 'JPN', ADMIN: 'Japan' } },
  // §14: France and Norway are the documented -99 cases — ISO_A3 can't be
  // used to find them, so matching must fall back to ADMIN.
  { properties: { ISO_A2: '-99', ISO_A3: '-99', ADMIN: 'France' } },
  { properties: { ISO_A2: '-99', ISO_A3: '-99', ADMIN: 'Norway' } },
];

describe('findCountryFeature', () => {
  it('matches a normal country directly by ISO_A3', () => {
    const result = findCountryFeature(features, 'JPN', 'Japan');
    expect(result).toBe(features[0]);
  });

  it('falls back to matching by ADMIN name when ISO_A3 is -99', () => {
    const result = findCountryFeature(features, 'FRA', 'France');
    expect(result).toBe(features[1]);
  });

  it('falls back correctly for Norway too', () => {
    const result = findCountryFeature(features, 'NOR', 'Norway');
    expect(result).toBe(features[2]);
  });

  it('returns null when nothing matches either key', () => {
    expect(findCountryFeature(features, 'ZZZ', 'Nowhereland')).toBeNull();
  });

  it('returns null when features is not loaded yet', () => {
    expect(findCountryFeature(null, 'JPN', 'Japan')).toBeNull();
  });
});
