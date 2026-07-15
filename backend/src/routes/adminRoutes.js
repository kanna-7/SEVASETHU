import { Router } from 'express';
import {
  getAdminDashboard,
  getPendingHomes,
  getApprovedHomes,
  approveHome,
  verifyDonation,
  approveMedicalCamp,
  getAllUsers,
  getPendingNeeds,
  approveNeed,
  rejectNeed,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/rbac.js';

const router = Router();

router.use(protect, isAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/homes/pending', getPendingHomes);
router.get('/homes/approved', getApprovedHomes);
router.put('/homes/:id/approve', approveHome);
router.put('/donations/:id/verify', verifyDonation);
router.put('/medical-camps/:id/approve', approveMedicalCamp);
router.get('/users', getAllUsers);
router.get('/needs/pending', getPendingNeeds);
router.put('/needs/:homeId/:needId/approve', approveNeed);
router.put('/needs/:homeId/:needId/reject', rejectNeed);

export default router;
