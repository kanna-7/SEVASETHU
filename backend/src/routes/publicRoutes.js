import { Router } from 'express';
import {
  getPublicStats,
  getHomes,
  getHomeBySlug,
  getPublicCalendar,
  getDonationTracker,
} from '../controllers/publicController.js';

const router = Router();

router.get('/stats', getPublicStats);
router.get('/homes', getHomes);
router.get('/homes/:slug', getHomeBySlug);
router.get('/calendar', getPublicCalendar);
router.get('/donation-tracker', getDonationTracker);

export default router;
