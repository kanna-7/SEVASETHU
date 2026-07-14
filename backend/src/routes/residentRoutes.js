import { Router } from 'express';
import {
  getResidents,
  getResident,
  createResident,
  updateResident,
  removeResident,
  addDailyRecord,
  updateSchemeStatus,
} from '../controllers/residentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(protect, authorize(
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.HOME_MANAGER,
  ROLES.MEDICAL_PARTNER
));

router.get('/', getResidents);
router.get('/:id', getResident);
router.post('/', authorize(ROLES.HOME_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN), createResident);
router.put('/:id', authorize(ROLES.HOME_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN), updateResident);
router.delete('/:id', authorize(ROLES.HOME_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN), removeResident);
router.post('/:id/daily-records', authorize(ROLES.HOME_MANAGER), addDailyRecord);
router.put('/:id/schemes', authorize(ROLES.HOME_MANAGER, ROLES.ADMIN), updateSchemeStatus);

export default router;
