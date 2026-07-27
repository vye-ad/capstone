import { prisma } from '../lib/prisma.js';
import { apiError } from '../lib/errors.js';
import { resolveCountryImage } from '../services/countryImage.js';

const LIST_SELECT = {
  cca2: true,
  nameEn: true,
  nameFr: true,
  nameEs: true,
  flagSvgUrl: true,
  flagAlt: true,
  region: true,
  subregion: true,
  isFeatured: true,
};

export async function listCountries(req, res, next) {
  try {
    const { featured, q, region } = req.query;
    const where = {};

    if (featured === 'true') where.isFeatured = true;
    if (region) where.region = region;
    if (q) {
      where.OR = [
        { nameEn: { contains: q, mode: 'insensitive' } },
        { nameFr: { contains: q, mode: 'insensitive' } },
        { nameEs: { contains: q, mode: 'insensitive' } },
      ];
    }

    const countries = await prisma.country.findMany({
      where,
      select: LIST_SELECT,
      orderBy: { nameEn: 'asc' },
    });

    res.json({ countries });
  } catch (err) {
    next(err);
  }
}

export async function getCountry(req, res, next) {
  try {
    const country = await prisma.country.findUnique({
      where: { cca2: req.params.cca2.toUpperCase() },
      include: {
        cities: { orderBy: { sortOrder: 'asc' } },
        attractions: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!country) return next(apiError(404, 'not_found'));

    const imageUrl = await resolveCountryImage(country);

    res.json({ country: { ...country, imageUrl } });
  } catch (err) {
    next(err);
  }
}
