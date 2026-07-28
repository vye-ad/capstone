import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { serializeUser } from '../lib/serializeUser.js';
import { getProfileStats } from '../services/profileStats.js';
import { updateProfileSchema, changePasswordSchema } from '../schemas/profile.js';
import { validationError } from '../lib/errors.js';
import { clearAuthCookie } from '../lib/cookies.js';
import { uploadAvatarImage, destroyAvatarImage } from '../services/avatarUpload.js';

const BCRYPT_COST = 12;

export async function getProfile(req, res) {
  res.json({ user: serializeUser(req.user) });
}

export async function updateProfile(req, res, next) {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));

  const data = parsed.data;

  try {
    if (data.email && data.email !== req.user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        return next(
          validationError({ issues: [{ path: ['email'], message: 'email already registered' }] })
        );
      }
    }

    if (data.countryCode) {
      const country = await prisma.country.findUnique({ where: { cca2: data.countryCode } });
      if (!country) {
        return next(
          validationError({ issues: [{ path: ['countryCode'], message: 'unknown country' }] })
        );
      }
    }

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return next(validationError(parsed.error));

  const { currentPassword, newPassword } = parsed.data;

  try {
    const matches = await bcrypt.compare(currentPassword, req.user.passwordHash);
    if (!matches) {
      return next(
        validationError({ issues: [{ path: ['currentPassword'], message: 'incorrect password' }] })
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    // §9: changing the password invalidates the current token.
    clearAuthCookie(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const stats = await getProfileStats(req.user.id);
    res.json({ stats });
  } catch (err) {
    next(err);
  }
}

export async function uploadProfileAvatar(req, res, next) {
  try {
    const result = await uploadAvatarImage(req.file.buffer);
    const previousPublicId = req.user.avatarPublicId;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: result.secure_url, avatarPublicId: result.public_id },
    });

    // Destroy the old asset only after the new one is safely stored, so a
    // failed upload never leaves the user without any avatar image.
    if (previousPublicId) {
      await destroyAvatarImage(previousPublicId).catch(() => {});
    }

    res.json({ avatarUrl: result.secure_url });
  } catch (err) {
    next(err);
  }
}

export async function deleteProfileAvatar(req, res, next) {
  try {
    if (req.user.avatarPublicId) {
      await destroyAvatarImage(req.user.avatarPublicId).catch(() => {});
    }
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: null, avatarPublicId: null },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
