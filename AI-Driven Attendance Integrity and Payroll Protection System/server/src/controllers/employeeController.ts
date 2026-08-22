import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

export const getAllEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, department } = req.query;

    const whereClause: any = {};

    if (department && typeof department === 'string' && department !== 'ALL') {
      whereClause.department = department;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { employeeCode: { contains: search } },
        { email: { contains: search } },
        { designation: { contains: search } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, email: true, role: true }
        },
        _count: {
          select: {
            attendances: true,
            leaveRequests: true,
            anomalies: true,
          }
        }
      },
      orderBy: { firstName: 'asc' },
    });

    return res.json({ employees });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch employees' });
  }
};

export const getEmployeeById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check RBAC: Employee can only view their own profile unless HR_ADMIN
    if (req.user?.role !== 'HR_ADMIN' && req.user?.employeeId !== id) {
      return res.status(403).json({ message: 'Access denied: You can only view your own profile' });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        payrolls: { orderBy: { createdAt: 'desc' }, take: 6 },
        leaveRequests: { orderBy: { createdAt: 'desc' }, take: 10 },
        attendances: { orderBy: { date: 'desc' }, take: 30 },
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.json({ employee });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch employee details' });
  }
};

export const updateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isHr = req.user?.role === 'HR_ADMIN';
    const isSelf = req.user?.employeeId === id;

    if (!isHr && !isSelf) {
      return res.status(403).json({ message: 'Access denied: You cannot update another employee profile' });
    }

    const existingEmployee = await prisma.employee.findUnique({ where: { id } });
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    let updateData: any = {};

    if (isHr) {
      // HR can update all fields
      const {
        firstName,
        lastName,
        phone,
        department,
        designation,
        basicSalary,
        allowances,
        deductions,
        address,
        avatarUrl
      } = req.body;

      updateData = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(department && { department }),
        ...(designation && { designation }),
        ...(basicSalary !== undefined && { basicSalary: parseFloat(basicSalary) }),
        ...(allowances !== undefined && { allowances: parseFloat(allowances) }),
        ...(deductions !== undefined && { deductions: parseFloat(deductions) }),
        ...(address !== undefined && { address }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      };
    } else {
      // Self employee can ONLY update phone, address, avatarUrl
      const { phone, address, avatarUrl } = req.body;
      updateData = {
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      };
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      actorId: req.user!.userId,
      actorName: req.user!.email,
      action: 'EMPLOYEE_UPDATED',
      entity: 'Employee',
      entityId: updatedEmployee.id,
      details: `Updated details for ${updatedEmployee.firstName} ${updatedEmployee.lastName} (Fields: ${Object.keys(updateData).join(', ')}).`,
    });

    return res.json({ message: 'Profile updated successfully', employee: updatedEmployee });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to update employee profile' });
  }
};

export const addDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, fileType, fileUrl } = req.body;

    const isHr = req.user?.role === 'HR_ADMIN';
    const isSelf = req.user?.employeeId === id;

    if (!isHr && !isSelf) {
      return res.status(403).json({ message: 'Access denied to add document' });
    }

    const document = await prisma.document.create({
      data: {
        employeeId: id,
        title: title || 'Employee Document',
        fileType: fileType || 'PDF',
        fileUrl: fileUrl || 'https://via.placeholder.com/150',
      }
    });

    return res.status(201).json({ message: 'Document added successfully', document });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to add document' });
  }
};
