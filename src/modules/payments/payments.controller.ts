import { Request, Response, NextFunction } from 'express';
import * as paymentsService from './payments.service';

import { getActor } from '../../shared/helpers/get-actor';

export async function listGlobal(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentsService.listGlobal(
      getActor(req),
      req.query,
    );
    res.json({ success: true, data: result.payments, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function listByCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentsService.listByCompany(
      req.params.companyId as string,
      getActor(req),
      req.query
    );
    res.json({ success: true, data: result.payments, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await paymentsService.create(
      req.params.companyId as string,
      req.body,
      getActor(req)
    );
    res.status(201).json({ success: true, data: { payment } });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await paymentsService.update(
      req.params.id as string,
      req.body,
      getActor(req)
    );
    res.json({ success: true, data: { payment } });
  } catch (err) {
    next(err);
  }
}

export async function changeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const payment = await paymentsService.changeStatus(
      req.params.id as string,
      req.body,
      getActor(req)
    );
    res.json({ success: true, data: { payment } });
  } catch (err) {
    next(err);
  }
}

export async function hardDelete(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentsService.hardDelete(
      req.params.id as string,
      getActor(req)
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
