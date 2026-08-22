import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles('HR_ADMIN'));

router.get('/', getAuditLogs);

export default router;
