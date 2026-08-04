// Achievements are derived entirely from server/src/services/profileStats.js's
// `stats` object — no separate persisted "unlocked" state. Each one is just a
// threshold check against numbers already computed server-side, so whether an
// achievement is earned can never drift out of sync with the trips it's
// actually based on.
export const ACHIEVEMENTS = [
  { id: 'first-trip', check: (s) => s.totalTrips >= 1 },
  { id: 'five-trips', check: (s) => s.totalTrips >= 5 },
  { id: 'ten-trips', check: (s) => s.totalTrips >= 10 },
  { id: 'trip-veteran', check: (s) => s.totalTrips >= 25 },

  { id: 'first-completed', check: (s) => s.completedTrips >= 1 },
  { id: 'five-completed', check: (s) => s.completedTrips >= 5 },
  { id: 'ten-completed', check: (s) => s.completedTrips >= 10 },
  { id: 'seasoned-traveler', check: (s) => s.completedTrips >= 20 },

  { id: 'first-country', check: (s) => s.countriesVisited >= 1 },
  { id: 'three-countries', check: (s) => s.countriesVisited >= 3 },
  { id: 'five-countries', check: (s) => s.countriesVisited >= 5 },
  { id: 'ten-countries', check: (s) => s.countriesVisited >= 10 },
  { id: 'fifteen-countries', check: (s) => s.countriesVisited >= 15 },
  { id: 'twenty-countries', check: (s) => s.countriesVisited >= 20 },

  { id: 'two-continents', check: (s) => s.regionsVisited >= 2 },
  { id: 'three-continents', check: (s) => s.regionsVisited >= 3 },
  { id: 'four-continents', check: (s) => s.regionsVisited >= 4 },
  { id: 'globetrotter', check: (s) => s.regionsVisited >= 5 },

  { id: 'week-away', check: (s) => s.longestTripDays >= 7 },
  { id: 'proper-holiday', check: (s) => s.longestTripDays >= 14 },
  { id: 'long-term-traveler', check: (s) => s.longestTripDays >= 30 },

  { id: 'on-the-road', check: (s) => s.ongoingTrips >= 1 },
  { id: 'next-adventure', check: (s) => s.upcomingTrips >= 1 },
  { id: 'planner', check: (s) => s.upcomingTrips >= 3 },

  { id: 'any-way-that-travels', check: (s) => s.transportTypesUsed >= 3 },
  { id: 'master-of-transit', check: (s) => s.transportTypesUsed >= 6 },
];
