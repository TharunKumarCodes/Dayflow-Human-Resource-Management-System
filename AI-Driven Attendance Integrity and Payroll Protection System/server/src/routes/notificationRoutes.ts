import { Router } from 'express';
import { getNotifications, markAsRead, sendAnnouncement } from '../controllers/notificationController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/announcement', authorizeRoles('HR_ADMIN'), sendAnnouncement);

export default router;
