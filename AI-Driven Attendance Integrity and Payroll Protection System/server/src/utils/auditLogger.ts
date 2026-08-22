import prisma from './prisma';

export interface AuditLogInput {
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
}

export const logAudit = async (input: AuditLogInput) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId,
        actorName: input.actorName,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: input.details,
      },
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};
