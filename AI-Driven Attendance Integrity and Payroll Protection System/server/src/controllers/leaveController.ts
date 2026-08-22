import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

export const applyLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ message: 'User is not linked to an employee profile' });
    }

    const { type, startDate, endDate, reason } = req.body;

    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Leave type, start date, end date, and reason are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be earlier than start date' });
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId,
        type,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        status: 'PENDING',
      },
      include: {
        employee: true,
      }
    });

    // Notify HR
    const hrUsers = await prisma.user.findMany({ where: { role: 'HR_ADMIN' } });
    for (const hr of hrUsers) {
      await prisma.notification.create({
        data: {
          userId: hr.id,
          title: 'New Leave Request Submitted',
          message: `${leave.employee.firstName} ${leave.employee.lastName} requested ${totalDays} day(s) of ${type} leave.`,
          type: 'INFO',
        }
      });
    }

    await logAudit({
      actorId: req.user!.userId,
      actorName: `${leave.employee.firstName} ${leave.employee.lastName}`,
      action: 'LEAVE_APPLIED',
      entity: 'LeaveRequest',
      entityId: leave.id,
      details: `Applied for ${totalDays} day(s) of ${type} leave from ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}.`,
    });

    return res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to submit leave request' });
  }
};

export const getMyLeaves = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ message: 'User is not linked to an employee profile' });
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ leaves });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch leave history' });
  }
};

export const getAllLeaves = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, employeeId, type } = req.query;

    const whereClause: any = {};

    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }
    if (employeeId && typeof employeeId === 'string') {
      whereClause.employeeId = employeeId;
    }
    if (type && typeof type === 'string' && type !== 'ALL') {
      whereClause.type = type;
    }

    const leaves = await prisma.leaveRequest.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingCount = leaves.filter(l => l.status === 'PENDING').length;

    return res.json({ leaves, pendingCount });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch leave requests' });
  }
};

export const approveLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { hrComment } = req.body;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        hrComment: hrComment || 'Approved by HR',
        reviewedAt: new Date(),
        reviewedBy: req.user!.email,
      }
    });

    // Automatically create LEAVE attendance entries for each date in leave period
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      try {
        await prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: leave.employeeId,
              date: dateStr,
            }
          },
          update: {
            status: 'LEAVE',
            workHours: 8.0,
            riskScore: 0,
            anomalyFlagged: false,
          },
          create: {
            employeeId: leave.employeeId,
            date: dateStr,
            checkIn: d,
            checkOut: d,
            status: 'LEAVE',
            workHours: 8.0,
            riskScore: 0,
            anomalyFlagged: false,
          }
        });
      } catch (err) {
        // Continue if duplicate date error occurs
      }
    }

    // Notify employee
    await prisma.notification.create({
      data: {
        userId: leave.employee.userId,
        title: 'Leave Request Approved',
        message: `Your ${leave.type} leave request for ${leave.totalDays} day(s) has been approved.${hrComment ? ` Note: ${hrComment}` : ''}`,
        type: 'SUCCESS',
      }
    });

    await logAudit({
      actorId: req.user!.userId,
      actorName: req.user!.email,
      action: 'LEAVE_APPROVED',
      entity: 'LeaveRequest',
      entityId: leave.id,
      details: `Approved ${leave.type} leave for ${leave.employee.firstName} ${leave.employee.lastName} (${leave.totalDays} days).`,
    });

    return res.json({ message: 'Leave request approved successfully', leave: updatedLeave });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to approve leave request' });
  }
};

export const rejectLeave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { hrComment } = req.body;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        hrComment: hrComment || 'Rejected by HR',
        reviewedAt: new Date(),
        reviewedBy: req.user!.email,
      }
    });

    // Notify employee
    await prisma.notification.create({
      data: {
        userId: leave.employee.userId,
        title: 'Leave Request Rejected',
        message: `Your ${leave.type} leave request for ${leave.totalDays} day(s) was rejected.${hrComment ? ` Reason: ${hrComment}` : ''}`,
        type: 'WARNING',
      }
    });

    await logAudit({
      actorId: req.user!.userId,
      actorName: req.user!.email,
      action: 'LEAVE_REJECTED',
      entity: 'LeaveRequest',
      entityId: leave.id,
      details: `Rejected ${leave.type} leave for ${leave.employee.firstName} ${leave.employee.lastName}. Reason: ${hrComment || 'None'}.`,
    });

    return res.json({ message: 'Leave request rejected', leave: updatedLeave });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to reject leave request' });
  }
};
