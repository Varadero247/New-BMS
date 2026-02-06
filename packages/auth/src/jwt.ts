import jwt from 'jsonwebtoken';
import type { JWTPayload } from './types';

/**
 * Get JWT secret from environment
 * Throws in production if not properly configured
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    // Development fallback with warning
    console.warn(
      '[SECURITY WARNING] JWT_SECRET not set - using insecure default. Do not use in production!'
    );
    return 'INSECURE_DEV_SECRET_DO_NOT_USE_IN_PRODUCTION';
  }
  return secret;
}

/**
 * Get JWT refresh secret from environment
 * Falls back to main JWT secret if not set
 */
function getJwtRefreshSecret(): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (refreshSecret) {
    return refreshSecret;
  }
  // Fall back to main secret (not ideal but acceptable)
  return getJwtSecret();
}

export interface GenerateTokenOptions {
  userId: string;
  email?: string;
  role?: string;
  expiresIn?: string;
}

export function generateToken(options: GenerateTokenOptions): string {
  const { userId, email, role, expiresIn = '7d' } = options;
  return jwt.sign({ userId, email, role }, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, getJwtRefreshSecret(), { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, getJwtSecret()) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, getJwtRefreshSecret()) as JWTPayload;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiry(expiresIn: string = '7d'): Date {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([dhms])$/);

  if (!match) {
    // Default to 7 days
    now.setDate(now.getDate() + 7);
    return now;
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  switch (unit) {
    case 'd':
      now.setDate(now.getDate() + numValue);
      break;
    case 'h':
      now.setHours(now.getHours() + numValue);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + numValue);
      break;
    case 's':
      now.setSeconds(now.getSeconds() + numValue);
      break;
  }

  return now;
}
