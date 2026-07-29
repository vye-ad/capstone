import { prisma } from '../lib/prisma.js';
import { apiError, validationError } from '../lib/errors.js';
import { serializeUser } from '../lib/serializeUser.js';
import { uploadImage, destroyImage } from '../services/cloudinaryUpload.js';
import {
  roleUpdateSchema,
  countryUpdateSchema,
  cityCreateSchema,
  attractionCreateSchema,
} from '../schemas/admin.js';

const COUNTRY_IMAGE_OPTIONS = { folder: 'expeditor/countries' };

export async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      include: { country: { select: { nameEn: true } }, _count: { select: { trips: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        countryCode: u.countryCode,
        countryName: u.country.nameEn,
        role: u.role,
        createdAt: u.createdAt,
        tripCount: u._count.trips,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// §10.10: an admin cannot demote or delete themselves — otherwise every
// admin could lock themselves (and everyone else) out of the system.
function assertNotSelf(req, next) {
  if (req.params.id === req.user.id) {
    next(apiError(400, 'cannot_modify_self'));
    return false;
  }
  return true;
}

export async function updateUserRole(req, res, next) {
  const parsed = roleUpdateSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));
  if (!assertNotSelf(req, next)) return;

  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(apiError(404, 'not_found'));

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: parsed.data.role },
    });
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  if (!assertNotSelf(req, next)) return;

  try {
    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(apiError(404, 'not_found'));

    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function listCountriesAdmin(req, res, next) {
  try {
    const countries = await prisma.country.findMany({
      include: { _count: { select: { cities: true, attractions: true } } },
      orderBy: { nameEn: 'asc' },
    });

    res.json({
      countries: countries.map((c) => ({
        cca2: c.cca2,
        nameEn: c.nameEn,
        flagSvgUrl: c.flagSvgUrl,
        isFeatured: c.isFeatured,
        imageUrl: c.imageUrl,
        cityCount: c._count.cities,
        attractionCount: c._count.attractions,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCountry(req, res, next) {
  const parsed = countryUpdateSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));

  try {
    const existing = await prisma.country.findUnique({ where: { cca2: req.params.cca2 } });
    if (!existing) return next(apiError(404, 'not_found'));

    const country = await prisma.country.update({
      where: { cca2: req.params.cca2 },
      data: parsed.data,
    });
    res.json({ country });
  } catch (err) {
    next(err);
  }
}

export async function uploadCountryImage(req, res, next) {
  try {
    const country = await prisma.country.findUnique({ where: { cca2: req.params.cca2 } });
    if (!country) return next(apiError(404, 'not_found'));

    const result = await uploadImage(req.file.buffer, COUNTRY_IMAGE_OPTIONS);

    await prisma.country.update({
      where: { cca2: req.params.cca2 },
      data: { imageUrl: result.secure_url, imagePublicId: result.public_id },
    });

    if (country.imagePublicId) {
      await destroyImage(country.imagePublicId).catch(() => {});
    }

    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    next(err);
  }
}

export async function createCity(req, res, next) {
  const parsed = cityCreateSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));

  try {
    const country = await prisma.country.findUnique({ where: { cca2: req.params.cca2 } });
    if (!country) return next(apiError(404, 'not_found'));

    const city = await prisma.city.create({
      data: { countryCode: req.params.cca2, name: parsed.data.name, sortOrder: parsed.data.sortOrder ?? 0 },
    });
    res.status(201).json({ city });
  } catch (err) {
    next(err);
  }
}

export async function deleteCity(req, res, next) {
  try {
    const existing = await prisma.city.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(apiError(404, 'not_found'));

    await prisma.city.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function createAttraction(req, res, next) {
  const parsed = attractionCreateSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));

  try {
    const country = await prisma.country.findUnique({ where: { cca2: req.params.cca2 } });
    if (!country) return next(apiError(404, 'not_found'));

    const attraction = await prisma.attraction.create({
      data: { countryCode: req.params.cca2, name: parsed.data.name, sortOrder: parsed.data.sortOrder ?? 0 },
    });
    res.status(201).json({ attraction });
  } catch (err) {
    next(err);
  }
}

export async function deleteAttraction(req, res, next) {
  try {
    const existing = await prisma.attraction.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(apiError(404, 'not_found'));

    await prisma.attraction.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
