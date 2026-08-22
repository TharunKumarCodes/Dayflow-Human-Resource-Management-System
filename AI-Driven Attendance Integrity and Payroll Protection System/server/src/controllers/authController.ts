import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, employeeCode, department, designation } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Email, password, first name, and last name are required' });
    }

    const assignedRole = role === 'HR_ADMIN' ? 'HR_ADMIN' : 'EMPLOYEE';
    const code = employeeCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check duplicate email or code
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { employeeId: code }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or Employee Code already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: assignedRole,
        employeeId: code,
        employee: {
          create: {
            employeeCode: code,
            firstName,
            lastName,
            email: email.toLowerCase(),
            department: department || 'General',
            designation: designation || 'Staff Member',
            dateOfJoining: new Date(),
            basicSalary: assignedRole === 'HR_ADMIN' ? 7500 : 5000,
            allowances: 1000,
            deductions: 500,
          }
        }
      },
      include: {
        employee: true,
      }
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee?.id,
    });

    await logAudit({
      actorId: user.id,
      actorName: `${firstName} ${lastName}`,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      details: `New ${user.role} user registered (${user.email}).`,
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employee?.id,
        employee: user.employee,
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { employee: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee?.id,
    });

    await logAudit({
      actorId: user.id,
      actorName: user.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user.email,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      details: `User logged in (${user.email}).`,
    });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employee?.id,
        employee: user.employee,
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { employee: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employee?.id,
        employee: user.employee,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Error fetching user profile' });
  }
};
