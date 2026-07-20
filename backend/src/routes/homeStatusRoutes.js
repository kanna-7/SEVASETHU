import { Router } from 'express';
import {
  getMyHomeStatus,
  upsertHomeStatus,
  getPublicHomeStatus,
  getHomeStatusAdmin,
  getAllHomeStatuses,
} from '../controllers/homeStatusController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin, isHomeManager } from '../middleware/rbac.js';

const router = Router();

// Public — view home status by slug
router.get('/public/:slug', getPublicHomeStatus);

// Manager — view and update their home's status
router.get('/my', protect, isHomeManager, getMyHomeStatus);
router.put('/my', protect, isHomeManager, upsertHomeStatus);

// Admin — view all / individual
router.get('/', protect, isAdmin, getAllHomeStatuses);
router.get('/:homeId', protect, isAdmin, getHomeStatusAdmin);

export default router;
