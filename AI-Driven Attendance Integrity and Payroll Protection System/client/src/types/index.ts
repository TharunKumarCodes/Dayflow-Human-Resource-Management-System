export type Role = 'EMPLOYEE' | 'HR_ADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  employeeId?: string;
  employee?: Employee;
}

export interface Employee {
  id: string;
  userId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  avatarUrl?: string;
  address?: string;
  createdAt?: string;
  user?: User;
  documents?: Document[];
  payrolls?: Payroll[];
  leaveRequests?: LeaveRequest[];
  attendances?: Attendance[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string | null;
  workHours: number;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'LATE';
  riskScore: number;
  anomalyFlagged: boolean;
  hrReviewStatus: 'PENDING' | 'APPROVED' | 'CORRECTED' | 'REQUESTED_EXPLANATION';
  employee?: Employee;
  anomalies?: AttendanceAnomaly[];
}

export interface AttendanceAnomaly {
  id: string;
  attendanceId: string;
  employeeId: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  hrAction: 'NONE' | 'APPROVED' | 'CORRECTED' | 'REQUESTED_EXPLANATION';
  hrNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  employee?: Employee;
  attendance?: Attendance;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'PAID' | 'SICK' | 'UNPAID';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  hrComment?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt: string;
  employee?: Employee;
}

export interface Payroll {
  id: string;
  employeeId: string;
  payPeriod: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  status: 'PENDING' | 'PROCESSED' | 'PAID';
  attendanceDays: number;
  anomalyHoldCount: number;
  generatedAt: string;
  employee?: Employee;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface Document {
  id: string;
  employeeId: string;
  title: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: string;
}
