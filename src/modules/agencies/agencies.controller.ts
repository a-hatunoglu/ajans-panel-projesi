import { Request, Response, NextFunction } from 'express';
import * as agenciesService from './agencies.service';

export async function listAgencies(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await agenciesService.listAgencies(
      { userId: req.user!.id, role: req.user!.role },
      req.query as Record<string, unknown>,
    );
    res.json({ success: true, data: result.agencies, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getAgency(req: Request, res: Response, next: NextFunction) {
  try {
    const agency = await agenciesService.getAgency(
      { userId: req.user!.id, role: req.user!.role, agencyId: req.agencyId, agencyRole: req.agencyRole },
      req.params.id as string,
    );
    res.json({ success: true, data: { agency } });
  } catch (err) {
    next(err);
  }
}

export async function createAgency(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await agenciesService.createAgency(
      { userId: req.user!.id, role: req.user!.role },
      req.body,
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateAgency(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await agenciesService.updateAgency(
      { userId: req.user!.id, role: req.user!.role },
      req.params.id as string,
      req.body,
    );
    res.json({ success: true, data: { agency: result } });
  } catch (err) {
    next(err);
  }
}

export async function deleteAgency(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await agenciesService.softDeleteAgency(
      { userId: req.user!.id, role: req.user!.role },
      req.params.id as string,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function restoreAgency(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await agenciesService.restoreAgency(
      { userId: req.user!.id, role: req.user!.role },
      req.params.id as string,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function addAgencyUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await agenciesService.addAgencyUser(
      { userId: req.user!.id, role: req.user!.role, agencyId: req.agencyId, agencyRole: req.agencyRole },
      req.params.id as string,
      req.body,
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateAgencyUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await agenciesService.updateAgencyUserRole(
      { userId: req.user!.id, role: req.user!.role, agencyId: req.agencyId, agencyRole: req.agencyRole },
      req.params.id as string,
      req.params.userId as string,
      req.body,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function removeAgencyUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await agenciesService.removeAgencyUser(
      { userId: req.user!.id, role: req.user!.role, agencyId: req.agencyId, agencyRole: req.agencyRole },
      req.params.id as string,
      req.params.userId as string,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
