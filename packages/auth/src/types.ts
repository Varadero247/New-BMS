import type { Request } from 'express';
import type { User } from '@ims/database';

export interface AuthRequest extends Request {
  user?: User;
  sessionId?: string;
  token?: string;
}

export interface JWTPayload {
  userId: string;
  /** Standard JWT subject claim — used as userId fallback for OIDC compatibility */
  sub?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}
