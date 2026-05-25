import { notificationRepository } from "../repositories/notification.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { prisma } from "../config/prisma.js";

export class NotificationService {
  async getUserNotifications(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    return notificationRepository.findManyByUser(userId, skip, limit);
  }

  async getUnreadCount(userId: number) {
    const count = await notificationRepository.countUnread(userId);
    return { unreadCount: count };
  }

  async markAsRead(id: number, userId: number) {
    await notificationRepository.markAsRead(id, userId);
    return { success: true };
  }

  async markAllAsRead(userId: number) {
    await notificationRepository.markAllAsRead(userId);
    return { success: true };
  }

  // Used by events
  async createNotification(data: { userId: number; title: string; message: string; type?: string; actionUrl?: string; entityType?: string; entityId?: number }) {
    return notificationRepository.create({
      ...data,
      type: data.type || "INFO",
    });
  }

  async broadcastToRole(roles: string[], data: { title: string; message: string; type?: string; actionUrl?: string; entityType?: string; entityId?: number }) {
    // Only fetch ACTIVE users for broadcasting
    const users = await prisma.user.findMany({
      where: {
        role: { in: roles },
        status: "Active"
      },
      select: { userId: true }
    });

    for (const user of users) {
      await this.createNotification({ ...data, userId: user.userId });
    }
  }
}

export const notificationService = new NotificationService();
