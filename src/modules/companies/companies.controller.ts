import { Request, Response, NextFunction } from 'express';
import * as companiesService from './companies.service';

import { getActor } from '../../shared/helpers/get-actor';

export async function listCompanies(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await companiesService.listCompanies(getActor(req), req.query);
    res.json({ success: true, data: result.companies, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function createCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const company = await companiesService.createCompany(req.body, getActor(req));
    res.status(201).json({ success: true, data: { company } });
  } catch (err) {
    next(err);
  }
}

export async function getCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const company = await companiesService.getCompany(req.params.id as string);
    res.json({ success: true, data: { company } });
  } catch (err) {
    next(err);
  }
}

export async function getCompanyAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await companiesService.getCompanyAnalytics(req.params.id as string, getActor(req));
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
}

export async function updateCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const company = await companiesService.updateCompany(req.params.id as string, req.body, getActor(req));
    res.json({ success: true, data: { company } });
  } catch (err) {
    next(err);
  }
}

export async function softDeleteCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await companiesService.softDeleteCompany(req.params.id as string, getActor(req));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function restoreCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const company = await companiesService.restoreCompany(req.params.id as string, getActor(req));
    res.json({ success: true, data: { company } });
  } catch (err) {
    next(err);
  }
}

export async function permanentDeleteCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await companiesService.permanentDeleteCompany(req.params.id as string, getActor(req));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listTrash(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await companiesService.listTrash(getActor(req), req.query);
    res.json({ success: true, data: result.companies, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function listCompanyUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await companiesService.listCompanyUsers(
      req.params.id as string,
      getActor(req),
    );
    res.json({ success: true, data: { members } });
  } catch (err) {
    next(err);
  }
}

export async function addCompanyUser(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await companiesService.addUserToCompany(
      req.params.id as string,
      req.body.userId,
      getActor(req),
      req.body.roles || []
    );
    res.status(201).json({ success: true, data: { member } });
  } catch (err) {
    next(err);
  }
}

export async function removeCompanyUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await companiesService.removeUserFromCompany(
      req.params.id as string,
      req.params.userId as string,
      getActor(req)
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyUserRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await companiesService.updateCompanyUserRoles(
      req.params.id as string,
      req.params.userId as string,
      req.body.roles || [],
      getActor(req)
    );
    res.json({ success: true, data: { member } });
  } catch (err) {
    next(err);
  }
}
