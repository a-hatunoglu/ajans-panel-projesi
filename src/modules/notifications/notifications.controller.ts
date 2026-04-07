import { Request, Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationsService.list(req.user!.id, req.query);
    res.json({ success: true, data: result.notifications, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await notificationsService.getUnreadCount(req.user!.id);
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await notificationsService.markAsRead(req.params.id as string, req.user!.id);
    res.json({ success: true, data: { notification } });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await notificationsService.markAllAsRead(req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
