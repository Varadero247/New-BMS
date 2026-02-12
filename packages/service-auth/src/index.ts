import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

/**
 * Service-to-service authentication for IMS microservices
 * Uses JWT tokens with service-specific claims
 */

export interface ServicePayload {
  serviceId: string;
  serviceName: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface ServiceAuthRequest extends Request {
  service?: ServicePayload;
}

export interface ServiceAuthConfig {
  secret?: string;
  tokenExpiry?: string;
  issuer?: string;
  audience?: string;
}

const DEFAULT_CONFIG: Required<ServiceAuthConfig> = {
  secret: process.env.SERVICE_SECRET || process.env.JWT_SECRET || '',
  tokenExpiry: '1h',
  issuer: 'ims-api-gateway',
  audience: 'ims-services',
};

let config: Required<ServiceAuthConfig> = { ...DEFAULT_CONFIG };

/**
 * Configure service auth settings
 */
export function configureServiceAuth(options: ServiceAuthConfig): void {
  config = { ...DEFAULT_CONFIG, ...options };
}

/**
 * Get the current service secret
 */
function getServiceSecret(): string {
  const secret = config.secret || process.env.SERVICE_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('SERVICE_SECRET or JWT_SECRET environment variable must be set');
  }
  if (secret.length < 32) {
    throw new Error('Service secret must be at least 32 characters');
  }
  return secret;
}

/**
 * Generate a service-to-service JWT token
 */
export function generateServiceToken(
  serviceName: string,
  permissions: string[] = []
): string {
  const secret = getServiceSecret();

  const payload: ServicePayload = {
    serviceId: `service-${serviceName}`,
    serviceName,
    permissions,
  };

  return jwt.sign(payload, secret, {
    algorithm: 'HS256' as const,
    expiresIn: config.tokenExpiry as jwt.SignOptions['expiresIn'],
    issuer: config.issuer,
    audience: config.audience,
  });
}

/**
 * Verify a service token and return the payload
 */
export function verifyServiceToken(token: string): ServicePayload {
  const secret = getServiceSecret();

  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: config.issuer,
      audience: config.audience,
    }) as ServicePayload;

    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Service token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid service token');
    }
    throw error;
  }
}

/**
 * Middleware to require service authentication
 * Use this on microservices to validate requests from the API gateway
 */
export function requireServiceAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers['x-service-token'] as string;

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'SERVICE_AUTH_REQUIRED',
        message: 'Service authentication required',
      },
    });
    return;
  }

  try {
    const payload = verifyServiceToken(token);
    (req as ServiceAuthRequest).service = payload;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid service token';
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_SERVICE_TOKEN',
        message,
      },
    });
  }
}

/**
 * Optional service auth middleware - allows requests without tokens but attaches service info if present
 */
export function optionalServiceAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers['x-service-token'] as string;

  if (token) {
    try {
      const payload = verifyServiceToken(token);
      (req as ServiceAuthRequest).service = payload;
    } catch {
      // Token invalid but optional, continue without service info
    }
  }

  next();
}

/**
 * Check if request has specific service permission
 */
export function hasServicePermission(req: ServiceAuthRequest, permission: string): boolean {
  return req.service?.permissions?.includes(permission) ?? false;
}

/**
 * Middleware factory to require specific service permissions
 */
export function requireServicePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const serviceReq = req as ServiceAuthRequest;

    if (!serviceReq.service) {
      res.status(401).json({
        success: false,
        error: {
          code: 'SERVICE_AUTH_REQUIRED',
          message: 'Service authentication required',
        },
      });
      return;
    }

    const hasPermission = permissions.every(
      (p) => serviceReq.service?.permissions?.includes(p)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Required permissions: ${permissions.join(', ')}`,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Create headers object with service token for HTTP client
 */
export function createServiceHeaders(serviceName: string): Record<string, string> {
  const token = generateServiceToken(serviceName);
  return {
    'X-Service-Token': token,
  };
}

/**
 * Proxy request modifier to add service token
 * Use with http-proxy-middleware onProxyReq
 */
export function addServiceTokenToProxy(serviceName: string) {
  const token = generateServiceToken(serviceName);

  return (proxyReq: any): void => {
    proxyReq.setHeader('X-Service-Token', token);
  };
}

/**
 * Reset configuration to defaults (for testing)
 */
export function resetServiceAuthConfig(): void {
  config = { ...DEFAULT_CONFIG };
}

export default {
  configureServiceAuth,
  generateServiceToken,
  verifyServiceToken,
  requireServiceAuth,
  optionalServiceAuth,
  hasServicePermission,
  requireServicePermission,
  createServiceHeaders,
  addServiceTokenToProxy,
  resetServiceAuthConfig,
};

export * from './ownership';
