import type { Request, Response } from "express";
import { notificationService } from "../services/notification.service.js";

export class NotificationController {
  async getUserNotifications(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = Number(req.user?.id);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const notifications = await notificationService.getUserNotifications(userId, page, limit);
      res.status(200).json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = Number(req.user?.id);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await notificationService.getUnreadCount(userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = Number(req.user?.id);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const id = parseInt(req.params.id as string);

      const result = await notificationService.markAsRead(id, userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = Number(req.user?.id);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await notificationService.markAllAsRead(userId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const notificationController = new NotificationController();
