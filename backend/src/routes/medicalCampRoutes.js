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
import { isAdmin, isHomeManager, isMedicalPartner, authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';
import { makeMulter } from '../config/upload.js';

const router = Router();
const upload = makeMulter();

// Public — list camps
router.get('/', getMedicalCamps);

// Admin — full camp management (isAdmin covers both ADMIN and SUPER_ADMIN)
router.get('/all', protect, isAdmin, getAllCampsAdmin);

// Create camp — admin OR medical partner
router.post('/', protect, (req, res, next) => {
  // Allow admin, super_admin, or medical_partner
  const allowed = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MEDICAL_PARTNER];
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Access denied — role '${req.user.role}' not allowed to create camps` });
  }
  next();
}, createMedicalCamp);

// Manager — register residents
router.post('/:id/register', protect, isHomeManager, registerResidentForCamp);

// Manager OR admin — mark camp complete with image upload
router.post(
  '/:id/complete',
  protect,
  (req, res, next) => {
    const allowed = [ROLES.HOME_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN];
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  },
  upload.fields([{ name: 'completionImages', maxCount: 10 }]),
  completeMedicalCamp
);

// Medical partner — upload reports
router.post('/:id/report', protect, isMedicalPartner, uploadCampReport);

export default router;
