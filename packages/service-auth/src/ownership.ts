// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Request, Response, NextFunction } from 'express';

/**
 * RBAC ownership middleware for IMS microservices
 * Provides role-based access control and resource ownership checks
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';

/** Numeric weight for each role – higher means more privileges. */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  VIEWER: 0,
  USER: 1,
  MANAGER: 2,
  ADMIN: 3,
};

/**
 * Minimal interface for a Prisma model delegate that supports `findUnique`.
 * We only require the subset of fields the ownership middleware actually uses.
 */
export interface PrismaModelDelegate {
  findUnique(args: {
    where: { id: string };
    select: Record<string, boolean>;
  }): Promise<Record<string, unknown> | null>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: UserRole };
  ownerFilter?: Record<string, string>;
}

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string; roles?: string[] };
      ownerFilter?: Record<string, string>;
    }
  }
}

function getUser(req: Request): { id: string; role: UserRole } | undefined {
  return (req as AuthenticatedRequest).user;
}

function roleValue(role: string): number {
  return ROLE_HIERARCHY[role as UserRole] ?? -1;
}

// ---------------------------------------------------------------------------
// requireRole
// ---------------------------------------------------------------------------

/**
 * Middleware factory that enforces a minimum role level.
 *
 * Role hierarchy (ascending): VIEWER(0) < USER(1) < MANAGER(2) < ADMIN(3)
 *
 * - Returns 401 if no authenticated user is present on the request.
 * - Returns 403 if the user's role is below the required minimum.
 *
 * @example
 *   router.delete('/items/:id', requireRole('MANAGER'), deleteHandler);
 */
export function requireRole(minimumRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = getUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        },
      });
      return;
    }

    const requiredLevel = roleValue(minimumRole);
    const userLevel = roleValue(user.role);

    if (userLevel < requiredLevel) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_ROLE',
          message: `Minimum role required: ${minimumRole}`,
        },
      });
      return;
    }

    next();
  };
}

// ---------------------------------------------------------------------------
// checkOwnership
// ---------------------------------------------------------------------------

/**
 * Middleware factory that verifies the authenticated user owns the resource
 * identified by `req.params.id`.
 *
 * - ADMIN and MANAGER roles bypass the ownership check entirely.
 * - For USER and VIEWER roles the middleware queries the database and compares
 *   the value of `ownerField` against the authenticated user's id.
 * - Returns 401 if no user, 404 if the record does not exist, 403 if the
 *   user is not the owner.
 *
 * @param model   A Prisma model delegate (e.g. `prisma.risk`).
 * @param ownerField  The column that stores the owner's user id (default `'createdBy'`).
 *
 * @example
 *   router.put('/risks/:id', checkOwnership(prisma.risk), updateHandler);
 *   router.put('/items/:id', checkOwnership(prisma.item, 'ownerId'), updateHandler);
 */
export function checkOwnership(model: PrismaModelDelegate, ownerField: string = 'createdBy') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = getUser(req);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        },
      });
      return;
    }

    // ADMIN and MANAGER bypass ownership checks
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      next();
      return;
    }

    const recordId = req.params.id;

    try {
      const record = await model.findUnique({
        where: { id: recordId },
        select: { [ownerField]: true },
      });

      if (!record) {
        res.status(404).json({
          success: false,
          error: {
            code: 'RECORD_NOT_FOUND',
            message: 'Record not found',
          },
        });
        return;
      }

      if (record[ownerField] !== user.id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'OWNERSHIP_REQUIRED',
            message: 'You do not have permission to access this resource',
          },
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'OWNERSHIP_CHECK_FAILED',
          message: 'Failed to verify resource ownership',
        },
      });
    }
  };
}

// ---------------------------------------------------------------------------
// scopeToUser
// ---------------------------------------------------------------------------

/**
 * Middleware that attaches an `ownerFilter` object to the request.
 *
 * - ADMIN and MANAGER get an empty filter (`{}`), meaning no ownership
 *   restriction – they can see all records.
 * - USER and VIEWER get `{ createdBy: user.id }`, restricting queries to
 *   records they own.
 *
 * Route handlers should spread this into their Prisma `where` clause:
 *
 * ```ts
 * const items = await prisma.item.findMany({
 *   where: { ...req.ownerFilter },
 * });
 * ```
 *
 * Returns 401 if no authenticated user is present.
 *
 * @example
 *   router.get('/items', scopeToUser, listHandler);
 */
export function scopeToUser(req: Request, res: Response, next: NextFunction): void {
  const user = getUser(req);

  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Authentication required',
      },
    });
    return;
  }

  if (user.role === 'ADMIN' || user.role === 'MANAGER') {
    req.ownerFilter = {};
  } else {
    req.ownerFilter = { createdBy: user.id };
  }

  next();
}
