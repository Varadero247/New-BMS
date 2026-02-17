import { Request, Response, NextFunction, RequestHandler } from 'express';
import crypto from 'crypto';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('csrf');

/**
 * CSRF Protection using the double-submit cookie pattern
 *
 * This implementation:
 * 1. Generates a random token and stores it in a cookie
 * 2. Expects the same token in a header (X-CSRF-Token) for state-changing requests
 * 3. Validates that both match
 *
 * This is secure because:
 * - Cookies are sent automatically but attackers can't read them (same-origin policy)
 * - Attackers can't set custom headers in cross-origin requests
 * - The token must match both the cookie and the header
 */

export interface CsrfOptions {
  /** Cookie name (default: '_csrf') */
  cookieName?: string;
  /** Header name (default: 'X-CSRF-Token') */
  headerName?: string;
  /** Cookie options */
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
    maxAge?: number;
  };
  /** Routes to skip CSRF validation */
  ignorePaths?: string[];
  /** Methods that require CSRF validation */
  protectedMethods?: string[];
}

function getDefaultOptions(): Required<CsrfOptions> {
  return {
    cookieName: '_csrf',
    headerName: 'X-CSRF-Token',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour
    },
    ignorePaths: ['/auth/login', '/auth/register', '/v1/auth/login', '/v1/auth/register', '/health', '/metrics'],
    protectedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  };
}

/**
 * Generate a cryptographically secure CSRF token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF token storage (in-memory for now, could be Redis-backed for production)
 */
class CsrfTokenStore {
  private tokens: Map<string, { createdAt: number }> = new Map();
  private readonly TTL = 60 * 60 * 1000; // 1 hour

  set(token: string): void {
    this.tokens.set(token, { createdAt: Date.now() });
  }

  isValid(token: string): boolean {
    const entry = this.tokens.get(token);
    if (!entry) return false;

    // Check if token has expired
    if (Date.now() - entry.createdAt > this.TTL) {
      this.tokens.delete(token);
      return false;
    }

    return true;
  }

  delete(token: string): void {
    this.tokens.delete(token);
  }

  // Cleanup expired tokens periodically
  cleanup(): void {
    const now = Date.now();
    for (const [token, entry] of this.tokens.entries()) {
      if (now - entry.createdAt > this.TTL) {
        this.tokens.delete(token);
      }
    }
  }
}

// Shared token store
const tokenStore = new CsrfTokenStore();

// Cleanup expired tokens every 10 minutes
setInterval(() => tokenStore.cleanup(), 10 * 60 * 1000).unref();

/**
 * CSRF protection middleware
 */
export function csrfProtection(options: CsrfOptions = {}): RequestHandler {
  const config = {
    ...getDefaultOptions(),
    ...options,
    cookieOptions: { ...getDefaultOptions().cookieOptions, ...options.cookieOptions },
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip if path is ignored
    if (config.ignorePaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // For non-protected methods, just ensure a token exists
    if (!config.protectedMethods.includes(req.method)) {
      ensureCsrfCookie(req, res, config);
      return next();
    }

    // For protected methods, validate the token
    const cookieToken = req.cookies?.[config.cookieName];
    const headerToken = req.headers[config.headerName.toLowerCase()] as string;

    // Check if both tokens exist
    if (!cookieToken || !headerToken) {
      logger.warn('CSRF validation failed - missing token', {
        hasCookie: !!cookieToken,
        hasHeader: !!headerToken,
        path: req.path,
        method: req.method,
      });
      res.status(403).json({
        error: {
          code: 'CSRF_TOKEN_MISSING',
          message: 'CSRF token is required for this request',
        },
      });
      return;
    }

    // Check if tokens match and are valid
    if (cookieToken !== headerToken || !tokenStore.isValid(cookieToken)) {
      logger.warn('CSRF validation failed - invalid token', {
        tokensMatch: cookieToken === headerToken,
        isValid: tokenStore.isValid(cookieToken),
        path: req.path,
        method: req.method,
      });
      res.status(403).json({
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'Invalid CSRF token',
        },
      });
      return;
    }

    next();
  };
}

/**
 * Ensure a CSRF cookie exists, generate one if not
 */
function ensureCsrfCookie(req: Request, res: Response, config: Required<CsrfOptions>): void {
  if (!req.cookies?.[config.cookieName]) {
    const token = generateToken();
    tokenStore.set(token);
    res.cookie(config.cookieName, token, config.cookieOptions);
  }
}

/**
 * Generate a new CSRF token and set it in the response
 */
export function generateCsrfToken(options: CsrfOptions = {}): RequestHandler {
  const config = {
    ...getDefaultOptions(),
    ...options,
    cookieOptions: { ...getDefaultOptions().cookieOptions, ...options.cookieOptions },
  };

  return (req: Request, res: Response): void => {
    // Generate new token
    const token = generateToken();
    tokenStore.set(token);

    // Set cookie
    res.cookie(config.cookieName, token, config.cookieOptions);

    // Return token in response (client can read this and include in headers)
    res.json({
      success: true,
      data: {
        csrfToken: token,
      },
    });
  };
}

/**
 * Middleware to attach CSRF token to request for templates
 */
export function csrfTokenAttacher(options: CsrfOptions = {}): RequestHandler {
  const config = {
    ...getDefaultOptions(),
    ...options,
    cookieOptions: { ...getDefaultOptions().cookieOptions, ...options.cookieOptions },
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    let token = req.cookies?.[config.cookieName];

    if (!token || !tokenStore.isValid(token)) {
      token = generateToken();
      tokenStore.set(token);
      res.cookie(config.cookieName, token, config.cookieOptions);
    }

    // Attach to request for use in templates
    (req as Request & { csrfToken: string }).csrfToken = token;

    // Add helper method to get token
    res.locals.csrfToken = token;

    next();
  };
}

// Export token store for testing
export { tokenStore };
