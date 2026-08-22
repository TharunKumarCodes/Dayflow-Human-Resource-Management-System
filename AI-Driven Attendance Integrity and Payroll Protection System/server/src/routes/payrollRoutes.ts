import { Router } from 'express';
import { getMyPayroll, getAllPayrolls, generateMonthlyPayroll, updatePayrollStatus } from '../controllers/payrollController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/my', getMyPayroll);
router.get('/all', authorizeRoles('HR_ADMIN'), getAllPayrolls);
router.post('/generate', authorizeRoles('HR_ADMIN'), generateMonthlyPayroll);
router.put('/:id/status', authorizeRoles('HR_ADMIN'), updatePayrollStatus);

export default router;
