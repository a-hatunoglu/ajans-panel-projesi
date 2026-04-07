import { Request } from 'express';
import { ActorContext } from '../types/actor-context';

export const getActor = (req: Request): ActorContext => ({
  userId: req.user!.id,
  role: req.user!.role,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});
