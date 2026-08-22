import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Dayflow HRMS Seed Process...');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendanceAnomaly.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.document.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedUserPassword = await bcrypt.hash('password123', 10);

  // 1. Create HR Admin User & Employee Profile
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dayflow.com',
      passwordHash: hashedAdminPassword,
      role: 'HR_ADMIN',
      employeeId: 'EMP-1000',
      employee: {
        create: {
          employeeCode: 'EMP-1000',
          firstName: 'Arjun',
          lastName: 'Mehta',
          email: 'admin@dayflow.com',
          phone: '+1 (555) 019-2831',
          department: 'Human Resources',
          designation: 'HR Director',
          dateOfJoining: new Date('2023-01-15'),
          basicSalary: 9500,
          allowances: 2000,
          deductions: 800,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          address: '742 Evergreen Terrace, Suite 400',
        }
      }
    },
    include: { employee: true }
  });

  console.log('✅ Created HR Admin: admin@dayflow.com / admin123');

  // 2. Create 9 Regular Employees across departments
  const employeeDataList = [
    {
      code: 'EMP-1001',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@dayflow.com',
      department: 'Engineering',
      designation: 'Senior Full Stack Engineer',
      salary: 8200,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      hasAnomaly: true, // Will have anomalous attendance
    },
    {
      code: 'EMP-1002',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@dayflow.com',
      department: 'Engineering',
      designation: 'Backend Developer',
      salary: 6800,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      hasAnomaly: false,
    },
    {
      code: 'EMP-1003',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@dayflow.com',
      department: 'Product Management',
      designation: 'Lead Product Manager',
      salary: 8800,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      hasAnomaly: true,
    },
    {
      code: 'EMP-1004',
      firstName: 'Alex',
      lastName: 'Chen',
      email: 'alex.chen@dayflow.com',
      department: 'Design & UX',
      designation: 'UI/UX Specialist',
      salary: 6500,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      hasAnomaly: false,
    },
    {
      code: 'EMP-1005',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@dayflow.com',
      department: 'Marketing',
      designation: 'Growth Marketing Manager',
      salary: 6200,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      hasAnomaly: false,
    },
    {
      code: 'EMP-1006',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@dayflow.com',
      department: 'Sales',
      designation: 'Account Executive',
      salary: 5900,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      hasAnomaly: true,
    },
    {
      code: 'EMP-1007',
      firstName: 'Rachel',
      lastName: 'Green',
      email: 'rachel.green@dayflow.com',
      department: 'Human Resources',
      designation: 'Talent Acquisition Lead',
      salary: 6400,
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      hasAnomaly: false,
    },
    {
      code: 'EMP-1008',
      firstName: 'Vikram',
      lastName: 'Patel',
      email: 'vikram.patel@dayflow.com',
      department: 'Engineering',
      designation: 'DevOps Lead',
      salary: 7900,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      hasAnomaly: false,
    },
    {
      code: 'EMP-1009',
      firstName: 'Lisa',
      lastName: 'Wong',
      email: 'lisa.wong@dayflow.com',
      department: 'Finance',
      designation: 'Financial Analyst',
      salary: 7100,
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
      hasAnomaly: false,
    },
  ];

  const createdEmployees = [];

  for (const empData of employeeDataList) {
    const user = await prisma.user.create({
      data: {
        email: empData.email,
        passwordHash: hashedUserPassword,
        role: 'EMPLOYEE',
        employeeId: empData.code,
        employee: {
          create: {
            employeeCode: empData.code,
            firstName: empData.firstName,
            lastName: empData.lastName,
            email: empData.email,
            phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            department: empData.department,
            designation: empData.designation,
            dateOfJoining: new Date('2023-06-01'),
            basicSalary: empData.salary,
            allowances: 1200,
            deductions: 600,
            avatarUrl: empData.avatar,
            address: '100 Tech Blvd, Innovation District',
          }
        }
      },
      include: { employee: true }
    });

    createdEmployees.push(user.employee!);

    // Add initial documents
    await prisma.document.createMany({
      data: [
        {
          employeeId: user.employee!.id,
          title: 'Employment Agreement.pdf',
          fileType: 'PDF',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        },
        {
          employeeId: user.employee!.id,
          title: 'Identity Verification Proof.png',
          fileType: 'IMAGE',
          fileUrl: empData.avatar,
        }
      ]
    });
  }

  console.log(`✅ Seeded ${createdEmployees.length} employees`);

  // 3. Generate Attendance Records & Flag Anomalies (Past 10 days)
  const today = new Date();
  const pastDates: string[] = [];

  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Skip weekends
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      pastDates.push(d.toISOString().split('T')[0]);
    }
  }

  console.log(`📅 Seeding attendance across dates: ${pastDates.join(', ')}`);

  for (const emp of createdEmployees) {
    const isAnomalousEmp = employeeDataList.find(e => e.code === emp.employeeCode)?.hasAnomaly;

    for (const dateStr of pastDates) {
      const dateObj = new Date(dateStr);

      if (isAnomalousEmp && (dateStr === pastDates[pastDates.length - 1] || dateStr === pastDates[pastDates.length - 3])) {
        // Deliberate Anomaly: Late Check-in at 11:45 AM & Short work duration
        const checkIn = new Date(`${dateStr}T11:45:00`);
        const checkOut = new Date(`${dateStr}T15:15:00`); // 3.5 hrs work
        const workHours = 3.5;

        const att = await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            date: dateStr,
            checkIn,
            checkOut,
            workHours,
            status: 'LATE',
            riskScore: 78,
            anomalyFlagged: true,
            hrReviewStatus: 'PENDING',
          }
        });

        await prisma.attendanceAnomaly.create({
          data: {
            attendanceId: att.id,
            employeeId: emp.id,
            riskScore: 78,
            riskLevel: 'HIGH',
            reason: 'Significant late check-in (165 mins past 9:00 AM) | Critically short work shift (3.5 hrs recorded vs 8.0 hrs baseline)',
            hrAction: 'NONE',
          }
        });

        // Notify HR
        await prisma.notification.create({
          data: {
            userId: adminUser.id,
            title: 'Attendance Anomaly Flagged',
            message: `High risk attendance anomaly detected for ${emp.firstName} ${emp.lastName} on ${dateStr} (Score: 78%).`,
            type: 'WARNING',
          }
        });
      } else {
        // Standard Punctual Attendance
        const checkIn = new Date(`${dateStr}T08:55:00`);
        const checkOut = new Date(`${dateStr}T17:05:00`);
        const workHours = 8.1;

        await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            date: dateStr,
            checkIn,
            checkOut,
            workHours,
            status: 'PRESENT',
            riskScore: 5,
            anomalyFlagged: false,
            hrReviewStatus: 'APPROVED',
          }
        });
      }
    }
  }

  // 4. Seed Leave Requests (Pending, Approved, Rejected)
  const leaveData = [
    {
      emp: createdEmployees[0],
      type: 'PAID',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-03'),
      totalDays: 3,
      reason: 'Attending annual Tech Developers Conference',
      status: 'PENDING',
    },
    {
      emp: createdEmployees[1],
      type: 'SICK',
      startDate: new Date('2026-08-10'),
      endDate: new Date('2026-08-11'),
      totalDays: 2,
      reason: 'Severe viral flu & fever',
      status: 'APPROVED',
      hrComment: 'Approved. Get well soon!',
    },
    {
      emp: createdEmployees[2],
      type: 'UNPAID',
      startDate: new Date('2026-08-18'),
      endDate: new Date('2026-08-18'),
      totalDays: 1,
      reason: 'Personal urgent relocation matter',
      status: 'REJECTED',
      hrComment: 'Rejected due to critical product launch deadline on this date.',
    },
    {
      emp: createdEmployees[3],
      type: 'PAID',
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-12'),
      totalDays: 3,
      reason: 'Family vacation',
      status: 'PENDING',
    }
  ];

  for (const l of leaveData) {
    await prisma.leaveRequest.create({
      data: {
        employeeId: l.emp.id,
        type: l.type,
        startDate: l.startDate,
        endDate: l.endDate,
        totalDays: l.totalDays,
        reason: l.reason,
        status: l.status,
        hrComment: l.hrComment || null,
        reviewedAt: l.status !== 'PENDING' ? new Date() : null,
        reviewedBy: l.status !== 'PENDING' ? 'admin@dayflow.com' : null,
      }
    });
  }

  console.log('✅ Seeded Leave Requests');

  // 5. Seed Payroll Records for "August 2026"
  for (const emp of [adminUser.employee!, ...createdEmployees]) {
    const gross = emp.basicSalary + emp.allowances;
    const net = gross - emp.deductions;
    const isAnomalous = employeeDataList.find(e => e.code === emp.employeeCode)?.hasAnomaly;

    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        payPeriod: 'August 2026',
        basicSalary: emp.basicSalary,
        allowances: emp.allowances,
        deductions: emp.deductions,
        grossSalary: gross,
        netSalary: net,
        status: isAnomalous ? 'PENDING' : 'PROCESSED',
        attendanceDays: isAnomalous ? 6 : 8,
        anomalyHoldCount: isAnomalous ? 2 : 0,
      }
    });
  }

  console.log('✅ Seeded Payroll Records');

  // 6. Seed System Audit Logs
  const auditLogs = [
    {
      actorId: adminUser.id,
      actorName: 'Arjun Mehta',
      action: 'SYSTEM_INITIALIZED',
      entity: 'System',
      details: 'Dayflow HRMS seed & system initialization complete.',
    },
    {
      actorId: adminUser.id,
      actorName: 'Arjun Mehta',
      action: 'EMPLOYEE_CREATED',
      entity: 'Employee',
      entityId: createdEmployees[0].id,
      details: 'Created profile for Priya Sharma (EMP-1001).',
    },
    {
      actorId: adminUser.id,
      actorName: 'Arjun Mehta',
      action: 'PAYROLL_GENERATED',
      entity: 'Payroll',
      details: 'Generated monthly payroll records for August 2026.',
    }
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log });
  }

  console.log('🎉 Dayflow HRMS database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
