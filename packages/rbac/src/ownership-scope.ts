import type { Request, Response, NextFunction } from 'express';
import { PermissionLevel } from './types';

export function scopeByPermission(req: Request): Record<string, any> {
  const user = (req as any).user;
  if (!user) return {};

  // Users with APPROVE or higher see all records
  if (req.permissions) {
    const maxLevel = Math.max(...Object.values(req.permissions.modules));
    if (maxLevel >= PermissionLevel.APPROVE) {
      return {};
    }
  }

  // Others only see their own records
  return { createdBy: user.id };
}

export function ownershipFilter() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    (req as any).ownerFilter = scopeByPermission(req);
    next();
  };
}
