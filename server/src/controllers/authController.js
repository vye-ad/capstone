import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { validationError, apiError } from '../lib/errors.js';
import { signToken } from '../lib/jwt.js';
import { setAuthCookie, clearAuthCookie } from '../lib/cookies.js';
import { serializeUser } from '../lib/serializeUser.js';

const BCRYPT_COST = 12;

// §11 — the ten currencies the app supports for display/conversion.
const SUPPORTED_CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CHF', 'MXN', 'INR', 'BRL'];

export async function register(req, res, next) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));

  const { name, email, password, countryCode } = parsed.data;

  try {
    const country = await prisma.country.findUnique({ where: { cca2: countryCode } });
    if (!country) {
      return next(validationError({ issues: [{ path: ['countryCode'], message: 'unknown country' }] }));
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(validationError({ issues: [{ path: ['email'], message: 'email already registered' }] }));
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const currency = SUPPORTED_CURRENCIES.includes(country.currencyCode) ? country.currencyCode : 'CAD';
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        countryCode,
        currency,
      },
    });

    setAuthCookie(res, signToken(user));
    res.status(201).json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      return next(apiError(401, 'invalid_credentials'));
    }

    setAuthCookie(res, signToken(user));
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  clearAuthCookie(res);
  res.status(204).end();
}

export async function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}
