import { Router } from 'express';
import {
  getMedicalCamps,
  createMedicalCamp,
  registerResidentForCamp,
  uploadCampReport,
  completeMedicalCamp,
  getAllCampsAdmin,
} from '../controllers/medicalCampController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';
import { makeMulter } from '../config/upload.js';

const router = Router();
const upload = makeMulter();

// Public — list camps
router.get('/', getMedicalCamps);

// Admin — full camp management
router.get('/all', protect, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getAllCampsAdmin);
router.post(
  '/',
  protect,
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MEDICAL_PARTNER),
  createMedicalCamp
);

// Manager — register residents and complete camps
router.post('/:id/register', protect, authorize(ROLES.HOME_MANAGER), registerResidentForCamp);
router.post(
  '/:id/complete',
  protect,
  authorize(ROLES.HOME_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  upload.fields([{ name: 'completionImages', maxCount: 10 }]),
  completeMedicalCamp
);

// Medical partner — upload reports
router.post('/:id/report', protect, authorize(ROLES.MEDICAL_PARTNER), uploadCampReport);

export default router;
