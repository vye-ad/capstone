import { describe, it, expect } from 'vitest';
import { localizedCountryName } from './countryName.js';

const country = { nameEn: 'Japan', nameFr: 'Japon', nameEs: 'Japón' };

describe('localizedCountryName', () => {
  it('returns an empty string when country is missing', () => {
    expect(localizedCountryName(null, 'en')).toBe('');
  });

  it('returns the English name for the en locale', () => {
    expect(localizedCountryName(country, 'en')).toBe('Japan');
  });

  it('returns the French name for the fr locale', () => {
    expect(localizedCountryName(country, 'fr')).toBe('Japon');
  });

  it('returns the Spanish name for the es locale', () => {
    expect(localizedCountryName(country, 'es')).toBe('Japón');
  });

  it('falls back to the English name when a translated name is missing', () => {
    expect(localizedCountryName({ nameEn: 'Testland' }, 'fr')).toBe('Testland');
  });
});
