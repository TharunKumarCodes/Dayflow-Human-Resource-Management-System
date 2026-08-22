import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

export const getMyPayroll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      return res.status(400).json({ message: 'User is not linked to an employee profile' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        payrolls: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    return res.json({
      currentSalaryStructure: {
        basicSalary: employee.basicSalary,
        allowances: employee.allowances,
        deductions: employee.deductions,
        grossSalary: employee.basicSalary + employee.allowances,
        netSalary: employee.basicSalary + employee.allowances - employee.deductions,
      },
      payrolls: employee.payrolls,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch payroll information' });
  }
};

export const getAllPayrolls = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { payPeriod, department, status } = req.query;

    const whereClause: any = {};
    if (payPeriod && typeof payPeriod === 'string' && payPeriod !== 'ALL') {
      whereClause.payPeriod = payPeriod;
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }
    if (department && typeof department === 'string' && department !== 'ALL') {
      whereClause.employee = { department };
    }

    const payrolls = await prisma.payroll.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalPayout = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const holdCount = payrolls.reduce((sum, p) => sum + p.anomalyHoldCount, 0);

    return res.json({
      payrolls,
      meta: {
        totalRecords: payrolls.length,
        totalPayout: Math.round(totalPayout * 100) / 100,
        unreviewedAnomalyHolds: holdCount,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch payroll list' });
  }
};

export const generateMonthlyPayroll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { payPeriod } = req.body;
    const period = payPeriod || 'August 2026';

    const employees = await prisma.employee.findMany();
    const createdPayrolls = [];

    for (const emp of employees) {
      // Calculate attendance statistics for period
      const attendances = await prisma.attendance.findMany({
        where: { employeeId: emp.id }
      });

      const totalWorkedDays = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'LEAVE').length;
      
      // Count unreviewed anomalies (Human-In-The-Loop Payroll Protection)
      const unreviewedAnomalies = await prisma.attendanceAnomaly.count({
        where: {
          employeeId: emp.id,
          hrAction: 'NONE',
        }
      });

      const grossSalary = emp.basicSalary + emp.allowances;
      let totalDeductions = emp.deductions;

      // Add deduction for unexcused absent days if work days < 15
      const absentDays = attendances.filter(a => a.status === 'ABSENT').length;
      if (absentDays > 0) {
        const perDayRate = emp.basicSalary / 30;
        totalDeductions += Math.round(absentDays * perDayRate);
      }

      const netSalary = Math.max(0, grossSalary - totalDeductions);

      // Upsert payroll record for this employee and period
      const existingPayroll = await prisma.payroll.findFirst({
        where: {
          employeeId: emp.id,
          payPeriod: period,
        }
      });

      let payroll;
      if (existingPayroll) {
        payroll = await prisma.payroll.update({
          where: { id: existingPayroll.id },
          data: {
            basicSalary: emp.basicSalary,
            allowances: emp.allowances,
            deductions: totalDeductions,
            grossSalary,
            netSalary,
            attendanceDays: totalWorkedDays,
            anomalyHoldCount: unreviewedAnomalies,
            generatedAt: new Date(),
          }
        });
      } else {
        payroll = await prisma.payroll.create({
          data: {
            employeeId: emp.id,
            payPeriod: period,
            basicSalary: emp.basicSalary,
            allowances: emp.allowances,
            deductions: totalDeductions,
            grossSalary,
            netSalary,
            status: 'PENDING',
            attendanceDays: totalWorkedDays,
            anomalyHoldCount: unreviewedAnomalies,
          }
        });
      }

      // Notify employee
      await prisma.notification.create({
        data: {
          userId: emp.userId,
          title: `Payslip Generated: ${period}`,
          message: `Your salary slip for ${period} has been generated. Net Salary: $${netSalary.toLocaleString()}.${unreviewedAnomalies > 0 ? ` Note: ${unreviewedAnomalies} unreviewed attendance anomaly hold(s) pending HR clearance.` : ''}`,
          type: 'INFO',
        }
      });

      createdPayrolls.push(payroll);
    }

    await logAudit({
      actorId: req.user!.userId,
      actorName: req.user!.email,
      action: 'PAYROLL_GENERATED',
      entity: 'Payroll',
      details: `Generated monthly payroll for period ${period} (${employees.length} employees).`,
    });

    return res.status(201).json({
      message: `Payroll for ${period} generated successfully across ${createdPayrolls.length} employees`,
      payrolls: createdPayrolls,
    });
  } catch (error: any) {
    console.error('Payroll generation error:', error);
    return res.status(500).json({ message: error.message || 'Failed to generate monthly payroll' });
  }
};

export const updatePayrollStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, PROCESSED, PAID

    if (!['PENDING', 'PROCESSED', 'PAID'].includes(status)) {
      return res.status(400).json({ message: 'Invalid payroll status' });
    }

    const payroll = await prisma.payroll.update({
      where: { id },
      data: { status },
      include: { employee: true }
    });

    await prisma.notification.create({
      data: {
        userId: payroll.employee.userId,
        title: `Payroll Status Updated`,
        message: `Your payslip status for ${payroll.payPeriod} has been updated to ${status}.`,
        type: 'SUCCESS',
      }
    });

    await logAudit({
      actorId: req.user!.userId,
      actorName: req.user!.email,
      action: 'PAYROLL_STATUS_UPDATED',
      entity: 'Payroll',
      entityId: payroll.id,
      details: `Updated payroll status to ${status} for ${payroll.employee.firstName} ${payroll.employee.lastName} (${payroll.payPeriod}).`,
    });

    return res.json({ message: 'Payroll status updated successfully', payroll });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to update payroll status' });
  }
};
