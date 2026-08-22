import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { runAttendanceIntegrityCheck } from '../services/anomalyEngine';
import { logAudit } from '../utils/auditLogger';

// Helper to get local YYYY-MM-DD string
const getTodayString = (dateObj: Date = new Date()): string => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const checkIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ message: 'User is not linked to an employee profile' });
    }

    const todayStr = getTodayString();
    const now = new Date();

    // Check existing attendance for today
    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: todayStr,
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        message: 'Duplicate check-in rejected: You have already checked in for today',
        attendance: existing,
      });
    }

    const checkInHours = now.getHours() + now.getMinutes() / 60;
    const initialStatus = checkInHours > 9.5 ? 'LATE' : 'PRESENT';

    const newAttendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: todayStr,
        checkIn: now,
        status: initialStatus,
        workHours: 0,
      },
      include: {
        employee: true,
      }
    });

    // Run AI Integrity Engine assessment
    const integrityResult = await runAttendanceIntegrityCheck(newAttendance.id);

    await logAudit({
      actorId: req.user!.userId,
      actorName: `${newAttendance.employee.firstName} ${newAttendance.employee.lastName}`,
      action: 'ATTENDANCE_CHECK_IN',
      entity: 'Attendance',
      entityId: newAttendance.id,
      details: `Checked in at ${now.toLocaleTimeString()} (Date: ${todayStr}, Initial Status: ${initialStatus}).`,
    });

    return res.status(201).json({
      message: 'Check-in recorded successfully',
      attendance: integrityResult?.attendance || newAttendance,
      analysis: integrityResult?.analysis,
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return res.status(500).json({ message: error.message || 'Failed to record check-in' });
  }
};

export const checkOut = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ message: 'User is not linked to an employee profile' });
    }

    const todayStr = getTodayString();
    const now = new Date();

    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: todayStr,
        }
      },
      include: { employee: true }
    });

    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today. Please check in first.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: 'Duplicate check-out rejected: You have already checked out for today',
        attendance,
      });
    }

    // Calculate work hours
    const diffMs = now.getTime() - attendance.checkIn.getTime();
    const workHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);

    let status = attendance.status;
    if (workHours < 4.0 && status !== 'LEAVE') {
      status = 'HALF_DAY';
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        workHours,
        status,
      }
    });

    // Re-evaluate integrity score with checkout duration
    const integrityResult = await runAttendanceIntegrityCheck(updatedAttendance.id);

    await logAudit({
      actorId: req.user!.userId,
      actorName: `${attendance.employee.firstName} ${attendance.employee.lastName}`,
      action: 'ATTENDANCE_CHECK_OUT',
      entity: 'Attendance',
      entityId: attendance.id,
      details: `Checked out at ${now.toLocaleTimeString()} (Work hours: ${workHours} hrs).`,
    });

    return res.json({
      message: 'Check-out recorded successfully',
      attendance: integrityResult?.attendance || updatedAttendance,
      analysis: integrityResult?.analysis,
    });
  } catch (error: any) {
    console.error('Check-out error:', error);
    return res.status(500).json({ message: error.message || 'Failed to record check-out' });
  }
};

export const getMyAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ message: 'User is not linked to an employee profile' });
    }

    const { startDate, endDate } = req.query;

    const whereClause: any = { employeeId };
    if (startDate && typeof startDate === 'string') {
      whereClause.date = { gte: startDate };
    }
    if (endDate && typeof endDate === 'string') {
      whereClause.date = { ...whereClause.date, lte: endDate };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: 60,
    });

    // Calculate summary statistics
    const totalDays = attendances.length;
    const totalHours = attendances.reduce((acc, curr) => acc + curr.workHours, 0);
    const presentDays = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const lateDays = attendances.filter(a => a.status === 'LATE').length;
    const anomalyCount = attendances.filter(a => a.anomalyFlagged).length;

    return res.json({
      attendances,
      summary: {
        totalDays,
        totalHours: Math.round(totalHours * 10) / 10,
        presentDays,
        lateDays,
        anomalyCount,
        attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch attendance history' });
  }
};

export const getAllAttendance = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, employeeId, status, flaggedOnly } = req.query;

    const whereClause: any = {};

    if (date && typeof date === 'string') {
      whereClause.date = date;
    }
    if (employeeId && typeof employeeId === 'string') {
      whereClause.employeeId = employeeId;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }
    if (flaggedOnly === 'true') {
      whereClause.anomalyFlagged = true;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
            designation: true,
            avatarUrl: true,
          }
        },
        anomalies: true,
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    return res.json({ attendances });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch overall attendance' });
  }
};
