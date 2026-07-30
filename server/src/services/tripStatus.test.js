import { resolveStatus, resolveTrips } from './tripStatus.js';

describe('resolveStatus', () => {
  const today = new Date(Date.UTC(2026, 5, 15)); // 2026-06-15

  it('returns UPCOMING when today is before the start date', () => {
    const trip = { startDate: '2026-07-01', endDate: '2026-07-10', statusIsManual: false };
    expect(resolveStatus(trip, today)).toBe('UPCOMING');
  });

  it('returns ONGOING when today falls within the trip range', () => {
    const trip = { startDate: '2026-06-10', endDate: '2026-06-20', statusIsManual: false };
    expect(resolveStatus(trip, today)).toBe('ONGOING');
  });

  it('returns COMPLETED when today is after the end date', () => {
    const trip = { startDate: '2026-05-01', endDate: '2026-05-10', statusIsManual: false };
    expect(resolveStatus(trip, today)).toBe('COMPLETED');
  });

  it('returns ONGOING on the exact start date', () => {
    const trip = { startDate: '2026-06-15', endDate: '2026-06-20', statusIsManual: false };
    expect(resolveStatus(trip, today)).toBe('ONGOING');
  });

  it('returns ONGOING on the exact end date', () => {
    const trip = { startDate: '2026-06-10', endDate: '2026-06-15', statusIsManual: false };
    expect(resolveStatus(trip, today)).toBe('ONGOING');
  });

  it('respects a manual override regardless of the date range', () => {
    const trip = {
      startDate: '2026-01-01',
      endDate: '2026-01-10',
      statusIsManual: true,
      status: 'ONGOING',
    };
    expect(resolveStatus(trip, today)).toBe('ONGOING');
  });
});

describe('resolveTrips', () => {
  it('resolves status for every trip in the list independently', () => {
    const today = new Date(Date.UTC(2026, 5, 15));
    const trips = [
      { id: 1, startDate: '2026-07-01', endDate: '2026-07-10', statusIsManual: false },
      { id: 2, startDate: '2026-05-01', endDate: '2026-05-10', statusIsManual: false },
    ];
    const resolved = resolveTrips(trips, today);
    expect(resolved.map((t) => t.status)).toEqual(['UPCOMING', 'COMPLETED']);
    // original trips are untouched — resolveTrips returns new objects
    expect(trips[0].status).toBeUndefined();
  });
});
