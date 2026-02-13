import type { Request, Response, NextFunction } from 'express';
import { PermissionLevel, ImsModule, ResolvedPermissions } from './types';
import { resolvePermissions, hasPermission, mapLegacyRole } from './permissions';

declare global {
  namespace Express {
    interface Request {
      permissions?: ResolvedPermissions;
    }
  }
}

function getUserFromRequest(req: Request): { id: string; role: string; roles?: string[] } | undefined {
  return (req as any).user;
}

export function attachPermissions() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = getUserFromRequest(req);
    if (!user) {
      next();
      return;
    }

    // Support multi-role (user.roles array) or fallback to legacy single role
    const roleIds = user.roles && user.roles.length > 0
      ? user.roles
      : mapLegacyRole(user.role);

    req.permissions = resolvePermissions(roleIds);
    next();
  };
}

export function requirePermission(module: ImsModule, level: PermissionLevel) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = getUserFromRequest(req);

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication required' },
      });
      return;
    }

    // Resolve permissions if not already attached
    if (!req.permissions) {
      const roleIds = user.roles && user.roles.length > 0
        ? user.roles
        : mapLegacyRole(user.role);
      req.permissions = resolvePermissions(roleIds);
    }

    if (!hasPermission(req.permissions, module, level)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSION',
          message: `Requires ${PermissionLevel[level]} permission on ${module}`,
        },
      });
      return;
    }

    next();
  };
}

export function requireOwnership(ownerField: string = 'createdBy') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = getUserFromRequest(req);

    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication required' },
      });
      return;
    }

    // Users with FULL permission bypass ownership checks
    if (req.permissions) {
      const hasFullOnAny = Object.values(req.permissions.modules).some(
        level => level >= PermissionLevel.FULL
      );
      if (hasFullOnAny) {
        next();
        return;
      }
    }

    // Users with APPROVE level bypass ownership checks
    if (req.permissions) {
      const hasApproveOnAny = Object.values(req.permissions.modules).some(
        level => level >= PermissionLevel.APPROVE
      );
      if (hasApproveOnAny) {
        next();
        return;
      }
    }

    // Store ownership context for route handlers to check
    (req as any).ownershipCheck = { field: ownerField, userId: user.id };
    next();
  };
}
