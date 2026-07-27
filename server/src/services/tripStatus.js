export function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function resolveStatus(trip, today) {
  if (trip.statusIsManual) return trip.status;

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  if (today < start) return 'UPCOMING';
  if (today > end) return 'COMPLETED';
  return 'ONGOING';
}

export function resolveTrips(trips, today) {
  return trips.map((trip) => ({ ...trip, status: resolveStatus(trip, today) }));
}
