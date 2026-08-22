import { Router } from 'express';
import { getHRAnalytics } from '../controllers/analyticsController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles('HR_ADMIN'));

router.get('/hr', getHRAnalytics);

export default router;
