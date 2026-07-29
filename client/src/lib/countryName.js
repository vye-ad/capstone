// §11: country names are the one content exception that translates —
// REST Countries supplies nameFr/nameEs for free at seed time.
export function localizedCountryName(country, locale) {
  if (!country) return '';
  if (locale === 'fr') return country.nameFr ?? country.nameEn;
  if (locale === 'es') return country.nameEs ?? country.nameEn;
  return country.nameEn;
}
