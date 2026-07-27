import { prisma } from '../lib/prisma.js';
import { tripCreateSchema, tripUpdateSchema } from '../schemas/trip.js';
import { validationError } from '../lib/errors.js';
import { resolveStatus, resolveTrips, todayUTC } from '../services/tripStatus.js';

const COUNTRY_SELECT = { nameEn: true, nameFr: true, nameEs: true, flagSvgUrl: true };

function unknownCountryError() {
  return validationError({ issues: [{ path: ['countryCode'], message: 'unknown country' }] });
}

function endDateError() {
  return validationError({
    issues: [{ path: ['endDate'], message: 'end date must be on or after start date' }],
  });
}

export async function listTrips(req, res, next) {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.user.id },
      include: { country: { select: COUNTRY_SELECT } },
      orderBy: { startDate: 'desc' },
    });

    const today = todayUTC();
    let resolved = resolveTrips(trips, today);

    if (req.query.status) {
      const wanted = req.query.status.toUpperCase();
      resolved = resolved.filter((trip) => trip.status === wanted);
    }

    res.json({ trips: resolved });
  } catch (err) {
    next(err);
  }
}

export async function createTrip(req, res, next) {
  const parsed = tripCreateSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));

  const data = parsed.data;

  try {
    const country = await prisma.country.findUnique({ where: { cca2: data.countryCode } });
    if (!country) return next(unknownCountryError());

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const today = todayUTC();
    const derived = resolveStatus({ startDate, endDate, statusIsManual: false }, today);
    const statusIsManual = data.status !== derived;

    const trip = await prisma.trip.create({
      data: {
        userId: req.user.id,
        countryCode: data.countryCode,
        startDate,
        endDate,
        status: data.status,
        statusIsManual,
        budgetAmount: data.budgetAmount,
        budgetCurrency: data.budgetCurrency,
        transportType: data.transportType,
        accommodationType: data.accommodationType,
        notes: data.notes,
      },
      include: { country: { select: COUNTRY_SELECT } },
    });

    res.status(201).json({ trip: { ...trip, status: resolveStatus(trip, today) } });
  } catch (err) {
    next(err);
  }
}

export async function getTrip(req, res, next) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.resource.id },
      include: { country: { select: COUNTRY_SELECT } },
    });
    const today = todayUTC();
    res.json({ trip: { ...trip, status: resolveStatus(trip, today) } });
  } catch (err) {
    next(err);
  }
}

export async function updateTrip(req, res, next) {
  const parsed = tripUpdateSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));

  const data = parsed.data;
  const existing = req.resource;

  try {
    if (data.countryCode) {
      const country = await prisma.country.findUnique({ where: { cca2: data.countryCode } });
      if (!country) return next(unknownCountryError());
    }

    const mergedStart = data.startDate ? new Date(data.startDate) : existing.startDate;
    const mergedEnd = data.endDate ? new Date(data.endDate) : existing.endDate;
    if (mergedEnd < mergedStart) return next(endDateError());

    const today = todayUTC();
    const updateData = {
      ...(data.countryCode && { countryCode: data.countryCode }),
      ...(data.startDate && { startDate: mergedStart }),
      ...(data.endDate && { endDate: mergedEnd }),
      ...(data.budgetAmount !== undefined && { budgetAmount: data.budgetAmount }),
      ...(data.budgetCurrency && { budgetCurrency: data.budgetCurrency }),
      ...(data.transportType && { transportType: data.transportType }),
      ...(data.accommodationType && { accommodationType: data.accommodationType }),
      ...(data.notes !== undefined && { notes: data.notes }),
    };

    // §7: editing dates alone must not reset statusIsManual — only recompute
    // it when the client actually submitted a status value.
    if ('status' in data) {
      const derived = resolveStatus({ startDate: mergedStart, endDate: mergedEnd, statusIsManual: false }, today);
      updateData.status = data.status;
      updateData.statusIsManual = data.status !== derived;
    }

    const trip = await prisma.trip.update({
      where: { id: existing.id },
      data: updateData,
      include: { country: { select: COUNTRY_SELECT } },
    });

    res.json({ trip: { ...trip, status: resolveStatus(trip, today) } });
  } catch (err) {
    next(err);
  }
}

export async function deleteTrip(req, res, next) {
  try {
    await prisma.trip.delete({ where: { id: req.resource.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
