import { Request, Response, NextFunction } from 'express';
import * as systemHealthService from './system-health.service';
import { getActor } from '../../shared/helpers/get-actor';

export async function getFullReport(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = getActor(req);
    const authCookie = req.headers.cookie || '';
    const bypassCache = req.query.refresh === 'true';

    const report = await systemHealthService.runFullScan(actor, authCookie, bypassCache);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

export async function getRegistryCounts(req: Request, res: Response, next: NextFunction) {
  try {
    const actor = getActor(req);
    const counts = systemHealthService.getRegistryCounts(actor);
    res.json({ success: true, data: counts });
  } catch (err) {
    next(err);
  }
}
