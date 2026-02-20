import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt';

/**
 * Continuously re-verify JWT token health on every request.
 *
 * Beyond the standard signature check done by `authenticate()`, this
 * middleware optionally cross-checks:
 *   1. The user's account is still active (via `isUserActive` callback)
 *   2. Token is not in a revocation list (via `isTokenRevoked` callback)
 *
 * Use after `authenticate()` so `req.user` is already populated.
 */

export interface ContinuousVerificationOptions {
  /**
   * Optional async check — return `false` to reject.
   * E.g. look up the user in DB and confirm `isActive === true`.
   */
  isUserActive?: (userId: string) => Promise<boolean>;

  /**
   * Optional async check — return `true` if the token (jti or raw token)
   * should be rejected (e.g. it was manually revoked / logged out).
   */
  isTokenRevoked?: (token: string, userId: string) => Promise<boolean>;
}

/**
 * Returns an Express middleware that performs continuous verification.
 *
 * @example
 * ```ts
 * app.use(authenticate);
 * app.use(continuousVerification({
 *   isUserActive: (id) => prisma.user.findUnique({ where: { id } })
 *     .then(u => Boolean(u?.isActive && !u.deletedAt)),
 *   isTokenRevoked: (token) => redis.exists(`revoked:${token}`).then(n => n > 0),
 * }));
 * ```
 */
export function continuousVerification(opts: ContinuousVerificationOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only run if there is a bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.slice(7);

    try {
      const payload = verifyToken(token);
      const userId = payload.userId || payload.sub;

      if (!userId) {
        res.status(401).json({ error: 'TOKEN_INVALID', message: 'Token has no subject' });
        return;
      }

      // Check user is still active
      if (opts.isUserActive) {
        const active = await opts.isUserActive(userId);
        if (!active) {
          res
            .status(401)
            .json({ error: 'ACCOUNT_INACTIVE', message: 'Account is disabled or deleted' });
          return;
        }
      }

      // Check token revocation
      if (opts.isTokenRevoked) {
        const revoked = await opts.isTokenRevoked(token, userId);
        if (revoked) {
          res.status(401).json({
            error: 'TOKEN_REVOKED',
            message: 'Token has been revoked — please re-authenticate',
          });
          return;
        }
      }

      next();
    } catch {
      // Token already failed signature / expiry check — let authenticate() handle the 401
      next();
    }
  };
}

/**
 * Simple in-memory token revocation list (for testing / small deployments).
 * Production deployments should use Redis with TTL matching the token expiry.
 */
export class InMemoryRevocationList {
  private revoked = new Set<string>();

  revoke(token: string): void {
    this.revoked.add(token);
  }

  isRevoked(token: string): boolean {
    return this.revoked.has(token);
  }

  /** Remove a previously revoked token (e.g. after its natural expiry). */
  clear(token: string): void {
    this.revoked.delete(token);
  }

  get size(): number {
    return this.revoked.size;
  }
}
