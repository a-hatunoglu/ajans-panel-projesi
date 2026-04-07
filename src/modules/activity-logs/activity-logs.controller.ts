import { Request, Response, NextFunction } from 'express';
import * as activityLogsService from './activity-logs.service';

export async function listGlobal(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await activityLogsService.listGlobal(req.user!.role, req.query);
    res.json({ success: true, data: result.logs, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function listByCompany(req: Request, res: Response, next: NextFunction) {
  try {
    // Note: The prompt explicitly asked client to not access GET /companies/:companyId/activity-logs. 
    // This is already protected by the service level requirement checking OWNER and ADMIN roles.
    const result = await activityLogsService.listByCompany(req.params.companyId as string, req.user!.role, req.query);
    res.json({ success: true, data: result.logs, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function listMe(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await activityLogsService.listMe(req.user!.id, req.query);
    res.json({ success: true, data: result.logs, meta: result.meta });
  } catch (err) {
    next(err);
  }
}
