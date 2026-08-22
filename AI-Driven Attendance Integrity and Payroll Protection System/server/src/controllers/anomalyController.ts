import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

export const getAnomalies = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { riskLevel, hrAction, department } = req.query;

    const whereClause: any = {};

    if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'ALL') {
      whereClause.riskLevel = riskLevel;
    }

    if (hrAction && typeof hrAction === 'string' && hrAction !== 'ALL') {
      whereClause.hrAction = hrAction;
    }

    if (department && typeof department === 'string' && department !== 'ALL') {
      whereClause.employee = { department };
    }

    const anomalies = await prisma.attendanceAnomaly.findMany({
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
            email: true,
            avatarUrl: true,
          }
        },
        attendance: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingCount = anomalies.filter(a => a.hrAction === 'NONE').length;
    const highRiskCount = anomalies.filter(a => a.riskLevel === 'HIGH').length;

    return res.json({
      anomalies,
      meta: {
        total: anomalies.length,
        pendingCount,
        highRiskCount,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch attendance anomalies' });
  }
};

export const reviewAnomaly = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { hrAction, hrNotes, correctedHours, correctedStatus } = req.body;

    if (!['APPROVED', 'CORRECTED', 'REQUESTED_EXPLANATION'].includes(hrAction)) {
      return res.status(400).json({ 
        message: 'Invalid HR action. Must be one of: APPROVED, CORRECTED, REQUESTED_EXPLANATION' 
      });
    }

    const anomaly = await prisma.attendanceAnomaly.findUnique({
      where: { id },
      include: { attendance: true, employee: true }
    });

    if (!anomaly) {
      return res.status(404).json({ message: 'Attendance anomaly record not found' });
    }

    const hrUser = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const hrName = hrUser?.email || 'HR Admin';

    // 1. Update Anomaly Record
    const updatedAnomaly = await prisma.attendanceAnomaly.update({
      where: { id },
      data: {
        hrAction,
        hrNotes: hrNotes || '',
        reviewedAt: new Date(),
        reviewedBy: hrName,
      }
    });

    // 2. Update Attendance Record HR Review Status & parameters if corrected
    const attendanceUpdateData: any = {
      hrReviewStatus: hrAction,
    };

    if (hrAction === 'CORRECTED') {
      if (correctedHours !== undefined) {
        attendanceUpdateData.workHours = parseFloat(correctedHours);
      }
      if (correctedStatus !== undefined) {
        attendanceUpdateData.status = correctedStatus;
      }
    } else if (hrAction === 'APPROVED') {
      // If approved by HR, mark anomaly clear / verified for payroll
      attendanceUpdateData.anomalyFlagged = false;
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: anomaly.attendanceId },
      data: attendanceUpdateData,
    });

    // 3. Notify Employee of HR Review Action
    await prisma.notification.create({
      data: {
        userId: anomaly.employee.userId,
        title: `Attendance Anomaly Review: ${hrAction.replace('_', ' ')}`,
        message: `HR reviewed your attendance anomaly for ${anomaly.attendance.date}. Decision: ${hrAction}.${hrNotes ? ` Note: ${hrNotes}` : ''}`,
        type: hrAction === 'APPROVED' ? 'SUCCESS' : hrAction === 'CORRECTED' ? 'INFO' : 'URGENT',
      }
    });

    // 4. Log Audit Trail
    await logAudit({
      actorId: req.user!.userId,
      actorName: hrName,
      action: 'ANOMALY_REVIEWED',
      entity: 'AttendanceAnomaly',
      entityId: anomaly.id,
      details: `HR reviewed attendance anomaly for ${anomaly.employee.firstName} ${anomaly.employee.lastName} on ${anomaly.attendance.date}. Action: ${hrAction}. Notes: ${hrNotes || 'None'}.`,
    });

    return res.json({
      message: 'Anomaly review submitted successfully. Payroll protection updated.',
      anomaly: updatedAnomaly,
      attendance: updatedAttendance,
    });
  } catch (error: any) {
    console.error('Error reviewing anomaly:', error);
    return res.status(500).json({ message: error.message || 'Failed to review attendance anomaly' });
  }
};
