import { Router } from 'express';
import { getAllEmployees, getEmployeeById, updateEmployee, addDocument } from '../controllers/employeeController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// HR only can get all employees
router.get('/', authorizeRoles('HR_ADMIN'), getAllEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.post('/:id/documents', addDocument);

export default router;
