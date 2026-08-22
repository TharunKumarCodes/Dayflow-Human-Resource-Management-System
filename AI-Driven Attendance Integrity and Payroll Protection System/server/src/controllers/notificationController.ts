import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAudit } from '../utils/auditLogger';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.json({ notifications, unreadCount });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (id === 'ALL') {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return res.json({ message: 'All notifications marked as read' });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({ message: 'Notification marked as read', notification });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to update notification' });
  }
};

export const sendAnnouncement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, message, targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const users = await prisma.user.findMany({
      where: targetRole ? { role: targetRole } : undefined,
    });

    const notificationsData = users.map(u => ({
      userId: u.id,
      title: `[HR Announcement] ${title}`,
      message,
      type: 'INFO',
    }));

    await prisma.notification.createMany({
      data: notificationsData,
    });

    await logAudit({
      actorId: req.user!.userId,
      actorName: req.user!.email,
      action: 'ANNOUNCEMENT_SENT',
      entity: 'Notification',
      details: `Sent announcement "${title}" to ${users.length} users.`,
    });

    return res.status(201).json({
      message: `Announcement broadcasted to ${users.length} users successfully`,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to send announcement' });
  }
};
