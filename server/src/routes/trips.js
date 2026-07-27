import { Router } from 'express';
import { requireAuth, requireOwner } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { listTrips, createTrip, getTrip, updateTrip, deleteTrip } from '../controllers/tripController.js';

const router = Router();

router.use(requireAuth);

router.get('/', listTrips);
router.post('/', createTrip);
router.get('/:id', requireOwner(prisma.trip), getTrip);
router.patch('/:id', requireOwner(prisma.trip), updateTrip);
router.delete('/:id', requireOwner(prisma.trip), deleteTrip);

export default router;
