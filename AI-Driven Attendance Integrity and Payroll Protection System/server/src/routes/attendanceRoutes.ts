import { Router } from 'express';
import { checkIn, checkOut, getMyAttendance, getAllAttendance } from '../controllers/attendanceController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my', getMyAttendance);
router.get('/all', authorizeRoles('HR_ADMIN'), getAllAttendance);

export default router;
