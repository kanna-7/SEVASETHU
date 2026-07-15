import { Router } from 'express';
import { registerHome, getManagerDashboard, updateHome, addNeed, addMonthlyExpense, addReview } from '../controllers/homeController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';
import { makeMulter } from '../config/upload.js';

const router = Router();
const upload = makeMulter();

router.post('/register', upload.fields([{ name: 'homeImages', maxCount: 10 }, { name: 'guardianPhoto', maxCount: 1 }]), registerHome);

router.post('/:slug/reviews', optionalAuth, addReview);

router.use(protect, authorize(ROLES.HOME_MANAGER));

router.get('/dashboard', getManagerDashboard);
router.put('/my-home', upload.fields([{ name: 'homeImages', maxCount: 10 }, { name: 'guardianPhoto', maxCount: 1 }]), updateHome);
router.post('/needs', addNeed);
router.post('/expenses', addMonthlyExpense);

export default router;
