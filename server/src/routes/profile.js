import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword, getStats } from '../controllers/profileController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/password', changePassword);
router.get('/stats', getStats);

export default router;
