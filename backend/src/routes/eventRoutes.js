import { Router } from 'express';
import {
  getEvents,
  createEvent,
  registerVolunteer,
  getNotifications,
  markNotificationRead,
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.post('/volunteers/register', registerVolunteer);

router.use(protect);

router.get('/events', getEvents);
router.post('/events', authorize(ROLES.HOME_MANAGER, ROLES.ADMIN), createEvent);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
