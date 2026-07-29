import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getRatesHandler } from '../controllers/rateController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getRatesHandler);

export default router;
