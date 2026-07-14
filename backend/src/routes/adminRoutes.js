import { Router } from 'express';
import {
  getAdminDashboard,
  getPendingHomes,
  approveHome,
  verifyDonation,
  approveMedicalCamp,
  getAllUsers,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { isAdmin } from '../middleware/rbac.js';

const router = Router();

router.use(protect, isAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/homes/pending', getPendingHomes);
router.put('/homes/:id/approve', approveHome);
router.put('/donations/:id/verify', verifyDonation);
router.put('/medical-camps/:id/approve', approveMedicalCamp);
router.get('/users', getAllUsers);

export default router;
