import { getRates } from '../services/exchangeRates.js';

export async function getRatesHandler(req, res, next) {
  try {
    const snapshot = await getRates();
    res.json({ base: snapshot.base, rates: snapshot.rates, fetchedAt: snapshot.fetchedAt });
  } catch (err) {
    next(err);
  }
}
