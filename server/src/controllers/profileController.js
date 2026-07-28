import { serializeUser } from '../lib/serializeUser.js';
import { getProfileStats } from '../services/profileStats.js';

export async function getProfile(req, res) {
  res.json({ user: serializeUser(req.user) });
}

export async function getStats(req, res, next) {
  try {
    const stats = await getProfileStats(req.user.id);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}
