import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@ims/database';
import { verifyToken } from './jwt';
import type { AuthRequest } from './types';

/**
 * Authenticate requests by validating JWT and session
 *
 * This middleware:
 * 1. Extracts and verifies the JWT token
 * 2. Validates the session exists in the database
 * 3. Checks the session hasn't expired
 * 4. Checks the user is still active
 * 5. Updates the session's lastActivityAt timestamp
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authReq = req as AuthRequest;
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
      return;
    }

    const token = authHeader.substring(7);

    // 1. Verify JWT signature and expiration
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' },
      });
      return;
    }

    // 2. Validate session exists in database and is not expired
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        userId: decoded.userId,
        expiresAt: { gte: new Date() },
      },
      include: { user: true },
    });

    if (!session) {
      res.status(401).json({
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Session has expired or been revoked' },
      });
      return;
    }

    // 3. Check user is still active
    if (!session.user.isActive) {
      // Delete the session since user is inactive
      await prisma.session.delete({ where: { id: session.id } });
      res.status(401).json({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'Account has been deactivated' },
      });
      return;
    }

    // 4. Update last activity timestamp (fire and forget for performance)
    prisma.session
      .update({
        where: { id: session.id },
        data: { lastActivityAt: new Date() },
      })
      .catch(() => {
        // Silently ignore errors - this is non-critical
      });

    // 5. Attach user and session info to request
    authReq.user = session.user;
    authReq.sessionId = session.id;
    authReq.token = token;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed' },
    });
  }
}

/**
 * Require specific role(s) for access
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  authenticate(req, res, next).catch(() => next());
}
