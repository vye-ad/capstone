import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listCountries, getCountry } from '../controllers/countryController.js';

const router = Router();

router.use(requireAuth);
router.get('/', listCountries);
router.get('/:cca2', getCountry);

export default router;
