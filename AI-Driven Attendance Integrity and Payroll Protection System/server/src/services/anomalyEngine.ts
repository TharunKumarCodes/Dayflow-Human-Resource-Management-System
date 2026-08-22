import prisma from '../utils/prisma';

export interface AnomalyAnalysisResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
  isAnomaly: boolean;
}

export interface HistoricalAttendanceRecord {
  checkIn: Date;
  checkOut?: Date | null;
  workHours: number;
}

/**
 * AI Attendance Integrity Scoring Engine (Explainable Rule-Based Engine)
 * Evaluates check-in/out patterns against standard baseline schedules & employee history.
 */
export const evaluateAttendanceAnomaly = (
  checkIn: Date,
  checkOut: Date | null | undefined,
  history: HistoricalAttendanceRecord[] = []
): AnomalyAnalysisResult => {
  let score = 0;
  const reasons: string[] = [];

  // 1. Check-in Time Analysis (Standard expected start: 09:00 AM)
  const checkInHours = checkIn.getHours() + checkIn.getMinutes() / 60;
  const expectedStartHour = 9.0; // 9:00 AM

  if (checkInHours > 9.5 && checkInHours <= 10.5) { // 9:30 AM to 10:30 AM
    score += 20;
    const minsLate = Math.round((checkInHours - expectedStartHour) * 60);
    reasons.push(`Moderate late check-in (${minsLate} mins past scheduled 9:00 AM start).`);
  } else if (checkInHours > 10.5 && checkInHours <= 12.0) { // 10:30 AM to 12:00 PM
    score += 35;
    const minsLate = Math.round((checkInHours - expectedStartHour) * 60);
    reasons.push(`Significant late arrival (${minsLate} mins past scheduled 9:00 AM start).`);
  } else if (checkInHours > 12.0 || checkInHours < 6.0) { // After 12 PM or strange early hour
    score += 45;
    reasons.push(`Unusual check-in timestamp (${checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`);
  }

  // 2. Work Duration Analysis (If checkOut is present)
  if (checkOut) {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const durationHours = diffMs / (1000 * 60 * 60);

    if (durationHours < 4.0) {
      score += 40;
      reasons.push(`Critically short work shift (${durationHours.toFixed(1)} hrs recorded vs 8.0 hrs standard).`);
    } else if (durationHours < 7.0) {
      score += 25;
      reasons.push(`Short work duration (${durationHours.toFixed(1)} hrs recorded vs 8.0 hrs standard).`);
    }
  } else {
    // Missing Checkout Check
    const hoursSinceCheckin = (new Date().getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCheckin > 12.0) {
      score += 30;
      reasons.push('Missing check-out timestamp after standard shift duration.');
    }
  }

  // 3. Historical Pattern & Frequency Analysis (Over past 5-7 records)
  if (history.length > 0) {
    // Calculate mean check-in hour
    const checkInTimes = history.map(h => h.checkIn.getHours() + h.checkIn.getMinutes() / 60);
    const avgCheckInHour = checkInTimes.reduce((acc, curr) => acc + curr, 0) / checkInTimes.length;
    
    // Variance check
    const deviation = Math.abs(checkInHours - avgCheckInHour);
    if (deviation > 1.5) {
      score += 25;
      reasons.push(`Check-in time deviates by ${deviation.toFixed(1)} hours from employee's typical 7-day average.`);
    }

    // Repeated lateness frequency check
    const lateCount = checkInTimes.filter(h => h > 9.5).length;
    if (lateCount >= 3) {
      score += 20;
      reasons.push(`Pattern detected: Employee has been late ${lateCount} times in the last ${history.length} workdays.`);
    }
  }

  // Cap score at 99%
  const finalScore = Math.min(Math.max(score, 0), 99);

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (finalScore >= 60) {
    riskLevel = 'HIGH';
  } else if (finalScore >= 35) {
    riskLevel = 'MEDIUM';
  }

  // Flag as anomaly if riskScore >= 35
  const isAnomaly = finalScore >= 35;

  if (reasons.length === 0) {
    reasons.push('Standard check-in and work duration compliant with company baseline policy.');
  }

  return {
    riskScore: finalScore,
    riskLevel,
    reasons,
    isAnomaly,
  };
};

/**
 * Analyzes and creates or updates Attendance record with AI risk assessment
 */
export const runAttendanceIntegrityCheck = async (attendanceId: string) => {
  const attendance = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: { employee: true },
  });

  if (!attendance) return null;

  // Fetch past 7 attendance records for variance analysis
  const history = await prisma.attendance.findMany({
    where: {
      employeeId: attendance.employeeId,
      id: { not: attendance.id },
    },
    orderBy: { date: 'desc' },
    take: 7,
  });

  const historyRecords: HistoricalAttendanceRecord[] = history.map(h => ({
    checkIn: h.checkIn,
    checkOut: h.checkOut,
    workHours: h.workHours,
  }));

  const result = evaluateAttendanceAnomaly(
    attendance.checkIn,
    attendance.checkOut,
    historyRecords
  );

  // Update attendance record with risk score & anomaly flag
  const updatedAttendance = await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      riskScore: result.riskScore,
      anomalyFlagged: result.isAnomaly,
      status: result.riskScore >= 35 && attendance.status !== 'LEAVE' ? 'LATE' : attendance.status,
    },
  });

  // If flagged as anomaly, create or update AttendanceAnomaly entry
  if (result.isAnomaly) {
    const existingAnomaly = await prisma.attendanceAnomaly.findFirst({
      where: { attendanceId },
    });

    if (!existingAnomaly) {
      await prisma.attendanceAnomaly.create({
        data: {
          attendanceId: attendance.id,
          employeeId: attendance.employeeId,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel,
          reason: result.reasons.join(' | '),
          hrAction: 'NONE',
        },
      });

      // Send Notification to HR Users
      const hrUsers = await prisma.user.findMany({
        where: { role: 'HR_ADMIN' },
      });

      for (const hr of hrUsers) {
        await prisma.notification.create({
          data: {
            userId: hr.id,
            title: 'Attendance Anomaly Flagged',
            message: `Attendance anomaly detected for ${attendance.employee.firstName} ${attendance.employee.lastName} on ${attendance.date} (${result.riskLevel} Risk - ${result.riskScore}%).`,
            type: 'WARNING',
          },
        });
      }
    }
  }

  return { attendance: updatedAttendance, analysis: result };
};
