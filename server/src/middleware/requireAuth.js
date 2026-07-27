import { verifyToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { apiError } from '../lib/errors.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next(apiError(401, 'unauthenticated'));

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return next(apiError(401, 'unauthenticated'));
    req.user = user;
    next();
  } catch {
    next(apiError(401, 'unauthenticated'));
  }
}
