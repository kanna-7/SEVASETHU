import { Router } from 'express';
import {
  getMedicalCamps,
  createMedicalCamp,
  registerResidentForCamp,
  uploadCampReport,
} from '../controllers/medicalCampController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.get('/', getMedicalCamps);
router.post('/', protect, authorize(ROLES.MEDICAL_PARTNER, ROLES.ADMIN), createMedicalCamp);
router.post('/:id/register', protect, authorize(ROLES.HOME_MANAGER), registerResidentForCamp);
router.post('/:id/report', protect, authorize(ROLES.MEDICAL_PARTNER), uploadCampReport);

export default router;
