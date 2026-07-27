import { Router } from 'express';
import { listCountries, getCountry } from '../controllers/countryController.js';

const router = Router();

// Public — Sign Up needs the country list before the user is authenticated.
// See §8: originally "user" auth, corrected after this actually broke Sign Up.
router.get('/', listCountries);
router.get('/:cca2', getCountry);

export default router;
