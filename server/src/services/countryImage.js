import { prisma } from '../lib/prisma.js';

const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';
const PLACEHOLDER_IMAGE_URL = '/images/placeholder-destination.svg';

// §12.3 resolution order, never skipping a step and never throwing —
// "never render a broken image" means every failure path falls through
// to the placeholder rather than surfacing an error.
export async function resolveCountryImage(country) {
  if (country.imageUrl) return country.imageUrl;
  if (country.cachedPhotoUrl) return country.cachedPhotoUrl;

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return PLACEHOLDER_IMAGE_URL;

  try {
    const query = encodeURIComponent(`${country.nameEn} landscape`);
    const res = await fetch(`${PEXELS_SEARCH_URL}?query=${query}&orientation=portrait&per_page=1`, {
      headers: { Authorization: apiKey },
    });
    if (!res.ok) return PLACEHOLDER_IMAGE_URL;

    const body = await res.json();
    const photo = body.photos?.[0];
    if (!photo) return PLACEHOLDER_IMAGE_URL;

    const url = photo.src.portrait;
    await prisma.country.update({ where: { cca2: country.cca2 }, data: { cachedPhotoUrl: url } });
    return url;
  } catch {
    return PLACEHOLDER_IMAGE_URL;
  }
}
