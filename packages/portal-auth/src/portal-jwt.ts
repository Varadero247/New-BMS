import jwt from 'jsonwebtoken';
import {
  PortalUser,
  PortalToken,
  PortalType,
  PortalAuthConfig,
  PortalRequest,
  PortalResponse,
  NextFunction,
} from './types';

const DEFAULT_EXPIRY = '8h';
const DEFAULT_ISSUER = 'ims-portal';

function getSecret(): string {
  const secret = process.env.PORTAL_JWT_SECRET;
  if (!secret) {
    throw new Error('PORTAL_JWT_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * Sign a JWT token for a portal user.
 * Uses PORTAL_JWT_SECRET (separate from the main JWT_SECRET).
 *
 * @param user - Portal user to create token for
 * @param type - Portal type ('customer' or 'supplier')
 * @param config - Optional configuration overrides
 * @returns Signed JWT token string
 */
export function signPortalToken(
  user: PortalUser,
  type: PortalType,
  config: PortalAuthConfig = {}
): string {
  const secret = config.secret ?? getSecret();
  const expiresIn = config.expiresIn ?? DEFAULT_EXPIRY;
  const issuer = config.issuer ?? DEFAULT_ISSUER;

  const payload = {
    id: user.id,
    email: user.email,
    organisationId: user.organisationId,
    portalType: type,
    permissions: user.permissions,
  };

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer,
    subject: user.id,
  });
}

/**
 * Verify and decode a portal JWT token.
 *
 * @param token - JWT token string to verify
 * @param config - Optional configuration overrides
 * @returns Decoded portal user or null if invalid
 */
export function verifyPortalToken(token: string, config: PortalAuthConfig = {}): PortalUser | null {
  try {
    const secret = config.secret ?? getSecret();
    const issuer = config.issuer ?? DEFAULT_ISSUER;

    const decoded = jwt.verify(token, secret, { issuer }) as PortalToken;

    return {
      id: decoded.id,
      email: decoded.email,
      name: '',
      organisationId: decoded.organisationId,
      organisationName: '',
      portalType: decoded.portalType,
      permissions: decoded.permissions,
    };
  } catch {
    return null;
  }
}

/**
 * Express middleware to authenticate portal users.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches the portal user to req.portalUser.
 *
 * @param config - Optional configuration overrides
 * @returns Express middleware function
 */
export function portalAuthenticate(config: PortalAuthConfig = {}) {
  return (req: PortalRequest, res: PortalResponse, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Portal authentication required',
      });
      return;
    }

    const token = authHeader.substring(7);
    const user = verifyPortalToken(token, config);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired portal token',
      });
      return;
    }

    req.portalUser = user;
    next();
  };
}

/**
 * Middleware to check if portal user has a specific permission.
 *
 * @param permission - Required permission string
 * @returns Express middleware function
 */
export function requirePortalPermission(permission: string) {
  return (req: PortalRequest, res: PortalResponse, next: NextFunction): void => {
    if (!req.portalUser) {
      res.status(401).json({
        success: false,
        error: 'Portal authentication required',
      });
      return;
    }

    if (!req.portalUser.permissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: `Missing required permission: ${permission}`,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to restrict access to a specific portal type.
 *
 * @param type - Required portal type
 * @returns Express middleware function
 */
export function requirePortalType(type: PortalType) {
  return (req: PortalRequest, res: PortalResponse, next: NextFunction): void => {
    if (!req.portalUser) {
      res.status(401).json({
        success: false,
        error: 'Portal authentication required',
      });
      return;
    }

    if (req.portalUser.portalType !== type) {
      res.status(403).json({
        success: false,
        error: `This endpoint requires ${type} portal access`,
      });
      return;
    }

    next();
  };
}
