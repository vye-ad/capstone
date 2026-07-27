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

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') return next(apiError(403, 'forbidden'));
  next();
}

// §8: a resource owned by someone else returns 404, not 403 — a 403 would
// confirm the resource exists. Use after requireAuth: requireOwner(prisma.trip).
export function requireOwner(model) {
  return async function (req, res, next) {
    const resource = await model.findUnique({ where: { id: req.params.id } });
    if (!resource || resource.userId !== req.user.id) {
      return next(apiError(404, 'not_found'));
    }
    req.resource = resource;
    next();
  };
}
