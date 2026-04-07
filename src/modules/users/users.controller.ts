import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getMe(req.user!.id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateMe(req.user!.id, req.body);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await usersService.changePassword(req.user!.id, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function inviteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await usersService.inviteUser(req.body, req.user!.role);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await usersService.listUsers(req.query);
    res.json({ success: true, data: result.users, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserById(req.params.id as string);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateUser(
      req.params.id as string,
      req.body,
      req.user!.id,
      req.user!.role,
    );
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.deactivateUser(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
    );
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function sendResetLink(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await usersService.sendResetLink(req.params.id as string, req.user!.role);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
