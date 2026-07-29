import { useEffect, useState } from 'react';
import { getRates } from './rates.js';

// §11: show a stale-rate indicator if fetchedAt is more than 48h old — the
// server itself already falls back to serving a stale snapshot rather than
// failing when the provider is down, this just surfaces that to the UI.
const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000;

export function useRates() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getRates()
      .then(setData)
      .catch(() => {});
  }, []);

  const isStale = data ? Date.now() - new Date(data.fetchedAt).getTime() > STALE_THRESHOLD_MS : false;

  return { rates: data?.rates ?? null, base: data?.base ?? null, isStale, loading: !data };
}
