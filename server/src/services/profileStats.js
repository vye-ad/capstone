import { prisma } from '../lib/prisma.js';
import { todayUTC } from './tripStatus.js';

// §8: single SQL aggregate query, not a JS loop over loaded rows — but must
// still honour manual overrides exactly like the §7 resolver does. The CASE
// in the subquery replicates resolveStatus()'s logic directly in SQL rather
// than loading trips into Node to run the real resolver against them.
export async function getProfileStats(userId) {
  const today = todayUTC();

  const rows = await prisma.$queryRaw`
    SELECT
      COUNT(*)::int AS "totalTrips",
      COUNT(*) FILTER (WHERE resolved_status = 'COMPLETED')::int AS "completedTrips",
      COUNT(*) FILTER (WHERE resolved_status = 'ONGOING')::int AS "ongoingTrips",
      COUNT(*) FILTER (WHERE resolved_status = 'UPCOMING')::int AS "upcomingTrips",
      COUNT(DISTINCT CASE WHEN resolved_status IN ('COMPLETED', 'ONGOING') THEN "countryCode" END)::int AS "countriesVisited",
      -- Achievements-only fields below (§ achievements) — not shown as their
      -- own "travel statistics" row, DEVELOPMENT.md's Profile section is
      -- specific that there are five stats.
      COUNT(DISTINCT CASE WHEN resolved_status IN ('COMPLETED', 'ONGOING') THEN region END)::int AS "regionsVisited",
      COUNT(DISTINCT CASE WHEN resolved_status IN ('COMPLETED', 'ONGOING') THEN "transportType" END)::int AS "transportTypesUsed",
      MAX(CASE WHEN resolved_status IN ('COMPLETED', 'ONGOING') THEN ("endDate" - "startDate" + 1) END)::int AS "longestTripDays"
    FROM (
      SELECT
        t."countryCode",
        t."transportType",
        t."startDate",
        t."endDate",
        c.region,
        CASE
          WHEN t."statusIsManual" THEN t.status::text
          WHEN ${today}::date < t."startDate" THEN 'UPCOMING'
          WHEN ${today}::date > t."endDate" THEN 'COMPLETED'
          ELSE 'ONGOING'
        END AS resolved_status
      FROM "Trip" t
      JOIN "Country" c ON c.cca2 = t."countryCode"
      WHERE t."userId" = ${userId}
    ) resolved
  `;

  return rows[0];
}
