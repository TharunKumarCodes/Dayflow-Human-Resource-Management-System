import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getHRAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. KPI Counts
    const totalEmployees = await prisma.employee.count();
    const todayAttendances = await prisma.attendance.findMany({
      where: { date: todayStr }
    });

    const activeTodayCount = todayAttendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const onLeaveTodayCount = todayAttendances.filter(a => a.status === 'LEAVE').length;
    
    const unreviewedAnomaliesCount = await prisma.attendanceAnomaly.count({
      where: { hrAction: 'NONE' }
    });

    const pendingLeaveCount = await prisma.leaveRequest.count({
      where: { status: 'PENDING' }
    });

    // 2. Department Breakdown
    const employees = await prisma.employee.findMany();
    const departmentMap: { [key: string]: { count: number; totalSalary: number } } = {};

    employees.forEach(emp => {
      const dept = emp.department || 'General';
      if (!departmentMap[dept]) {
        departmentMap[dept] = { count: 0, totalSalary: 0 };
      }
      departmentMap[dept].count += 1;
      departmentMap[dept].totalSalary += (emp.basicSalary + emp.allowances);
    });

    const departmentStats = Object.keys(departmentMap).map(dept => ({
      name: dept,
      employees: departmentMap[dept].count,
      totalSalary: departmentMap[dept].totalSalary,
    }));

    // 3. Attendance Status Breakdown (Last 30 days)
    const recentAttendances = await prisma.attendance.findMany({
      take: 200,
      orderBy: { date: 'desc' },
    });

    const statusCounts = {
      PRESENT: recentAttendances.filter(a => a.status === 'PRESENT').length,
      LATE: recentAttendances.filter(a => a.status === 'LATE').length,
      HALF_DAY: recentAttendances.filter(a => a.status === 'HALF_DAY').length,
      LEAVE: recentAttendances.filter(a => a.status === 'LEAVE').length,
      ABSENT: recentAttendances.filter(a => a.status === 'ABSENT').length,
    };

    // 4. Anomaly Risk Distribution
    const anomalies = await prisma.attendanceAnomaly.findMany();
    const riskDistribution = {
      HIGH: anomalies.filter(a => a.riskLevel === 'HIGH').length,
      MEDIUM: anomalies.filter(a => a.riskLevel === 'MEDIUM').length,
      LOW: anomalies.filter(a => a.riskLevel === 'LOW').length,
    };

    // 5. Leave Type Breakdown
    const leaves = await prisma.leaveRequest.findMany();
    const leaveBreakdown = {
      PAID: leaves.filter(l => l.type === 'PAID').length,
      SICK: leaves.filter(l => l.type === 'SICK').length,
      UNPAID: leaves.filter(l => l.type === 'UNPAID').length,
    };

    return res.json({
      kpis: {
        totalEmployees,
        activeTodayCount,
        onLeaveTodayCount,
        unreviewedAnomaliesCount,
        pendingLeaveCount,
        attendanceRateToday: totalEmployees > 0 ? Math.round((activeTodayCount / totalEmployees) * 100) : 100,
      },
      departmentStats,
      statusCounts,
      riskDistribution,
      leaveBreakdown,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch HR analytics' });
  }
};
