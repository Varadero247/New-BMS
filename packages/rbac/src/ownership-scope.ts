import type { Request, Response, NextFunction } from 'express';
import { PermissionLevel } from './types';

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string; roles?: string[] };
  ownerFilter?: Record<string, string>;
}

declare global {
  namespace Express {
    interface Request {
      ownerFilter?: Record<string, string>;
    }
  }
}

export function scopeByPermission(req: Request): Record<string, string> {
  const user = (req as AuthenticatedRequest).user;
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
    req.ownerFilter = scopeByPermission(req);
    next();
  };
}
