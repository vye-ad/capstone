import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadImage } from '../middleware/imageUpload.js';
import {
  listUsers,
  updateUserRole,
  deleteUser,
  listCountriesAdmin,
  updateCountry,
  uploadCountryImage,
  createCity,
  deleteCity,
  createAttraction,
  deleteAttraction,
} from '../controllers/adminController.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', listUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/countries', listCountriesAdmin);
router.patch('/countries/:cca2', updateCountry);
router.post('/countries/:cca2/image', uploadImage, uploadCountryImage);
router.post('/countries/:cca2/cities', createCity);
router.delete('/cities/:id', deleteCity);
router.post('/countries/:cca2/attractions', createAttraction);
router.delete('/attractions/:id', deleteAttraction);

export default router;
