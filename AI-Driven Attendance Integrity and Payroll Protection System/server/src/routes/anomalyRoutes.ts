import { Router } from 'express';
import { getAnomalies, reviewAnomaly } from '../controllers/anomalyController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles('HR_ADMIN'));

router.get('/', getAnomalies);
router.put('/:id/review', reviewAnomaly);

export default router;
