// Mirrors the derivation half of server/src/services/tripStatus.js (§7) —
// used to pre-select the status radio as the user picks dates, before the
// trip exists server-side to resolve against.
export function deriveStatus(startDate, endDate) {
  if (!startDate || !endDate) return null;

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (today < start) return 'UPCOMING';
  if (today > end) return 'COMPLETED';
  return 'ONGOING';
}
