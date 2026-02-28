// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import jwt from 'jsonwebtoken';
import type { JWTPayload } from './types';

// JWT Configuration
const JWT_ISSUER = process.env.JWT_ISSUER || 'ims-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'ims-client';

/**
 * Get JWT secret from environment
 * Throws if JWT_SECRET is not set (required in all environments)
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  if (secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    console.warn(
      '[SECURITY WARNING] JWT_SECRET is shorter than 32 characters. Use a stronger secret in production.'
    );
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

export interface TokenPairResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Generate an access token with issuer/audience claims
 */
export function generateToken(options: GenerateTokenOptions): string {
  const { userId, email, role, expiresIn = '15m' } = options;
  return jwt.sign({ userId, email, role }, getJwtSecret(), {
    expiresIn,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  } as jwt.SignOptions);
}

/**
 * Generate a refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, getJwtRefreshSecret(), {
    expiresIn: '24h', // Reduced from 7d to limit exposure window on token theft
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(options: GenerateTokenOptions): TokenPairResult {
  const accessToken = generateToken(options);
  const refreshToken = generateRefreshToken(options.userId);
  const expiresAt = getTokenExpiry(options.expiresIn || '15m');

  return { accessToken, refreshToken, expiresAt };
}

/**
 * Verify an access token with issuer/audience validation
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as JWTPayload;
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  const payload = jwt.verify(token, getJwtRefreshSecret(), {
    algorithms: ['HS256'],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  }) as JWTPayload & { type?: string };

  // Ensure it's actually a refresh token
  if (payload.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  return payload;
}

/**
 * Decode a token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Calculate token expiry date from duration string
 */
export function getTokenExpiry(expiresIn: string = '15m'): Date {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([dhms])$/);

  if (!match) {
    // Default to 15 minutes
    now.setMinutes(now.getMinutes() + 15);
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

/**
 * Refresh an access token using a refresh token
 */
export function refreshAccessToken(refreshToken: string): { accessToken: string; expiresAt: Date } {
  const payload = verifyRefreshToken(refreshToken);

  const accessToken = generateToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });

  return {
    accessToken,
    expiresAt: getTokenExpiry('15m'),
  };
}
