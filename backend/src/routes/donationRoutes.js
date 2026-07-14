import { Router } from 'express';
import { createDonation, getDonations, uploadUtilization } from '../controllers/donationController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.post('/', optionalAuth, createDonation);
router.get('/', protect, getDonations);
router.post('/:id/utilization', protect, authorize(ROLES.HOME_MANAGER), uploadUtilization);

export default router;
