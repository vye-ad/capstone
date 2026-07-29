import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { uploadImage } from '../middleware/imageUpload.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  getStats,
  uploadProfileAvatar,
  deleteProfileAvatar,
} from '../controllers/profileController.js';

const router = Router();

router.use(requireAuth);
router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/password', changePassword);
router.post('/avatar', uploadImage, uploadProfileAvatar);
router.delete('/avatar', deleteProfileAvatar);
router.get('/stats', getStats);

export default router;
