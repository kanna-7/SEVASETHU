import { Router } from 'express';
import {
  getEvents,
  createEvent,
  registerVolunteer,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getPublicEvents,
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { ROLES } from '../config/roles.js';

const router = Router();

// Public routes (no auth)
router.post('/volunteers/register', registerVolunteer);
router.get('/events/public/:slug', getPublicEvents);

// Protected routes
router.use(protect);

router.get('/events', getEvents);
router.post('/events', authorize(ROLES.HOME_MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN), createEvent);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

export default router;
