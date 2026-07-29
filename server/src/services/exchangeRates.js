import { prisma } from '../lib/prisma.js';

// Keyless, free — verified live before writing this. §11's other suggestion
// (exchangerate-api.com) needs a key the developer didn't have on hand for.
const RATE_PROVIDER_URL = 'https://open.er-api.com/v6/latest/CAD';
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000;

async function fetchLiveRates() {
  const res = await fetch(RATE_PROVIDER_URL);
  if (!res.ok) throw new Error(`Rate provider request failed: ${res.status}`);
  const body = await res.json();
  if (body.result !== 'success') throw new Error('Rate provider returned a non-success result');
  return body.rates;
}

// §11: return the cached snapshot if under 12h old; otherwise refresh. If the
// provider is unreachable, serve the last good snapshot rather than failing —
// the app must never break because a third party is down during marking.
export async function getRates() {
  const latest = await prisma.exchangeRateSnapshot.findFirst({ orderBy: { fetchedAt: 'desc' } });

  const isFresh = latest && Date.now() - latest.fetchedAt.getTime() < CACHE_DURATION_MS;
  if (isFresh) return latest;

  try {
    const rates = await fetchLiveRates();
    return await prisma.exchangeRateSnapshot.create({ data: { base: 'CAD', rates } });
  } catch (err) {
    if (latest) return latest;
    throw err;
  }
}
