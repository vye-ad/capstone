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
      COUNT(DISTINCT CASE WHEN resolved_status IN ('COMPLETED', 'ONGOING') THEN "countryCode" END)::int AS "countriesVisited"
    FROM (
      SELECT
        "countryCode",
        CASE
          WHEN "statusIsManual" THEN status::text
          WHEN ${today}::date < "startDate" THEN 'UPCOMING'
          WHEN ${today}::date > "endDate" THEN 'COMPLETED'
          ELSE 'ONGOING'
        END AS resolved_status
      FROM "Trip"
      WHERE "userId" = ${userId}
    ) resolved
  `;

  return rows[0];
}
