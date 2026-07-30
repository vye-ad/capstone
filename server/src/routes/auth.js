import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // The test suite legitimately makes far more than 10 auth requests per
  // run — this only ever skips in NODE_ENV=test, never in dev or prod.
  skip: () => process.env.NODE_ENV === 'test',
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
