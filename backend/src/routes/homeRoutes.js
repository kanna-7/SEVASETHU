import { Router } from 'express';
import { registerHome, getManagerDashboard, updateHome, addNeed, addMonthlyExpense, addReview } from '../controllers/homeController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.post('/register', registerHome);

router.post('/:slug/reviews', optionalAuth, addReview);

router.use(protect, authorize(ROLES.HOME_MANAGER));

router.get('/dashboard', getManagerDashboard);
router.put('/my-home', updateHome);
router.post('/needs', addNeed);
router.post('/expenses', addMonthlyExpense);

export default router;
