import { Request, Response, NextFunction } from 'express';
import * as socialAccountsService from './social-accounts.service';

import { getActor } from '../../shared/helpers/get-actor';

export async function listByCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const accounts = await socialAccountsService.listByCompany(
      req.params.id as string,
      getActor(req)
    );
    res.json({ success: true, data: { accounts } });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await socialAccountsService.create(
      req.params.id as string,
      req.body,
      getActor(req)
    );
    res.status(201).json({ success: true, data: { account } });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await socialAccountsService.getById(
      req.params.id as string,
      getActor(req)
    );
    res.json({ success: true, data: { account } });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const account = await socialAccountsService.update(
      req.params.id as string,
      req.body,
      getActor(req)
    );
    res.json({ success: true, data: { account } });
  } catch (err) {
    next(err);
  }
}

export async function softDelete(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await socialAccountsService.softDelete(
      req.params.id as string,
      getActor(req)
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
