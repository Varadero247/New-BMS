import jwt from 'jsonwebtoken';
import type { JWTPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export interface GenerateTokenOptions {
  userId: string;
  email?: string;
  role?: string;
  expiresIn?: string;
}

export function generateToken(options: GenerateTokenOptions): string {
  const { userId, email, role, expiresIn = '7d' } = options;
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
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
