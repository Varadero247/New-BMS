// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Auth helpers for integration tests.
// generateTestToken() creates a real Session record so authenticate() middleware passes.
import { createHash, createHmac } from 'crypto';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../../database/generated/core';

type UserRole = 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'USER';

export interface TestTokenOptions {
  userId: string;
  email?: string;
  role?: UserRole;
  expiresIn?: string;
}

const JWT_ISSUER = process.env.JWT_ISSUER || 'ims-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'ims-client';

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'integration-test-secret-at-least-32-chars';
}

function hashTokenForStorage(token: string): string {
  const hmacKey = process.env.TOKEN_STORAGE_HMAC_KEY;
  if (hmacKey) {
    return createHmac('sha256', hmacKey).update(token).digest('hex');
  }
  return createHash('sha256').update(token).digest('hex');
}

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) _prisma = new PrismaClient();
  return _prisma;
}

/**
 * Generate a test JWT and create a matching Session in the DB.
 * This is required because authenticate() middleware does a DB session lookup.
 */
export async function generateTestToken(options: TestTokenOptions): Promise<string> {
  const { userId, email = `${options.role?.toLowerCase() || 'user'}@ims-test.io`, role = 'USER', expiresIn = '1h' } = options;

  const token = jwt.sign(
    { userId, email, role },
    getJwtSecret(),
    { expiresIn, issuer: JWT_ISSUER, audience: JWT_AUDIENCE } as jwt.SignOptions
  );

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h from now

  const prisma = getPrisma();
  await prisma.session.upsert({
    where: { token: hashTokenForStorage(token) },
    update: { expiresAt, lastActivityAt: new Date() },
    create: {
      userId,
      token: hashTokenForStorage(token),
      expiresAt,
      userAgent: 'integration-test',
      ipAddress: '127.0.0.1',
    },
  });

  return token;
}

/**
 * Generate an already-expired token (no DB session — intentionally invalid).
 */
export function generateExpiredToken(role: UserRole = 'USER'): string {
  return jwt.sign(
    { userId: 'expired-user-id', email: 'expired@ims-test.io', role },
    getJwtSecret(),
    { expiresIn: '-1s', issuer: JWT_ISSUER, audience: JWT_AUDIENCE } as jwt.SignOptions
  );
}

/**
 * Generate a token with a specific jti claim.
 */
export async function generateTokenWithJti(jti: string, role: UserRole = 'USER', userId: string): Promise<string> {
  const token = jwt.sign(
    { userId, email: `test-${jti}@ims-test.io`, role, jti },
    getJwtSecret(),
    { expiresIn: '1h', issuer: JWT_ISSUER, audience: JWT_AUDIENCE } as jwt.SignOptions
  );

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const prisma = getPrisma();
  await prisma.session.upsert({
    where: { token: hashTokenForStorage(token) },
    update: { expiresAt },
    create: {
      userId,
      token: hashTokenForStorage(token),
      expiresAt,
      userAgent: 'integration-test-jti',
      ipAddress: '127.0.0.1',
    },
  });

  return token;
}

/**
 * Returns an Authorization header object for a given role.
 * Creates a real session so authenticate() passes.
 */
export async function authHeader(role: UserRole, userId: string): Promise<{ Authorization: string }> {
  const token = await generateTestToken({ userId, role });
  return { Authorization: `Bearer ${token}` };
}

/**
 * Clean up all test sessions from the DB.
 */
export async function cleanupTestSessions(): Promise<void> {
  const prisma = getPrisma();
  await prisma.session.deleteMany({
    where: { userAgent: 'integration-test' },
  });
}
