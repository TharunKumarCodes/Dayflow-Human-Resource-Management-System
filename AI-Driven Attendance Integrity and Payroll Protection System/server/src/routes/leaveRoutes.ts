import { Router } from 'express';
import { applyLeave, getMyLeaves, getAllLeaves, approveLeave, rejectLeave } from '../controllers/leaveController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.get('/all', authorizeRoles('HR_ADMIN'), getAllLeaves);
router.put('/:id/approve', authorizeRoles('HR_ADMIN'), approveLeave);
router.put('/:id/reject', authorizeRoles('HR_ADMIN'), rejectLeave);

export default router;
