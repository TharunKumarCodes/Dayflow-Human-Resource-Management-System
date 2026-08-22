import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, entity, search } = req.query;

    const whereClause: any = {};

    if (action && typeof action === 'string' && action !== 'ALL') {
      whereClause.action = action;
    }
    if (entity && typeof entity === 'string' && entity !== 'ALL') {
      whereClause.entity = entity;
    }
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { actorName: { contains: search } },
        { action: { contains: search } },
        { entity: { contains: search } },
        { details: { contains: search } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return res.json({ logs });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch audit logs' });
  }
};
