import type { Response, NextFunction } from 'express';
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
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    }

    const token = authHeader.substring(7);

    // 1. Verify JWT signature and expiration
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' },
      });
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
      return res.status(401).json({
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Session has expired or been revoked' },
      });
    }

    // 3. Check user is still active
    if (!session.user.isActive) {
      // Delete the session since user is inactive
      await prisma.session.delete({ where: { id: session.id } });
      return res.status(401).json({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'Account has been deactivated' },
      });
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
    req.user = session.user;
    req.sessionId = session.id;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed' },
    });
  }
}

/**
 * Require specific role(s) for access
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
      });
    }

    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  authenticate(req, res, next);
}
