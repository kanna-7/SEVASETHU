import { Router } from 'express';
import {
  getInventory,
  createInventoryItem,
  updateStock,
  getLowStockAlerts,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.get('/', protect, getInventory);
router.get('/alerts', protect, getLowStockAlerts);
router.post('/', protect, authorize(ROLES.HOME_MANAGER), createInventoryItem);
router.put('/:id/stock', protect, authorize(ROLES.HOME_MANAGER), updateStock);

export default router;
