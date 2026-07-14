import { Router } from 'express';
import { generateReport } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.use(protect, authorize(
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.HOME_MANAGER
));

router.get('/', generateReport);

export default router;
