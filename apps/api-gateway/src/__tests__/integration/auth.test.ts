// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: Gateway auth routes — real DB (Prisma), real bcrypt, real JWT, real Redis.
// Only external side-effect services (email, sentry, monitoring/tracing) are stubbed.

// Stub services that have module-level side effects unrelated to auth logic
jest.mock('@ims/sentry', () => ({
  initSentry: jest.fn(),
  sentryErrorHandler: (_req: any, _res: any, next: any) => next(),
  Sentry: { captureException: jest.fn() },
}));

jest.mock('@ims/email', () => ({
  getEmailService: jest.fn().mockReturnValue({
    sendEmail: jest.fn().mockResolvedValue({ success: true }),
  }),
  templates: { passwordReset: jest.fn().mockReturnValue({ subject: 'Reset', html: '<p>reset</p>' }) },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: (_req: any, _res: any, next: any) => next(),
  metricsHandler: jest.fn(),
  correlationIdMiddleware: (_req: any, _res: any, next: any) => next(),
  initTracing: jest.fn(),
  authFailuresTotal: { inc: jest.fn() },
  rateLimitExceededTotal: { inc: jest.fn() },
}));

jest.mock('@ims/secrets', () => ({
  validateStartupSecrets: jest.fn(),
}));

import express from 'express';
import request from 'supertest';
import { PrismaClient } from '../../../../../packages/database/generated/core';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken, generateExpiredToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';

async function buildTestApp() {
  const app = express();
  app.use(express.json());

  // Real auth middleware from @ims/auth
  const { authenticate } = await import('@ims/auth');

  // Protected endpoint to test middleware
  app.get('/api/protected', authenticate, (req: any, res) => {
    res.json({ success: true, data: { userId: req.user?.id, role: req.user?.role } });
  });

  // Real auth router
  const authModule = await import('../../routes/auth');
  const authRouter = (authModule as any).default || (authModule as any).router;
  app.use('/api/auth', authRouter);

  return app;
}

let app: express.Express;
let prisma: PrismaClient;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  app = await buildTestApp();
  prisma = new PrismaClient();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  it('returns 200 with accessToken + refreshToken + user for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ims-test.io', password: 'Test@1234!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).toMatchObject({
      email: 'admin@ims-test.io',
      role: 'ADMIN',
    });
    // password must never appear in response
    expect(JSON.stringify(res.body)).not.toContain('"password"');
  });

  it('returns 401 INVALID_CREDENTIALS for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ims-test.io', password: 'totally-wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for non-existent user email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@ims-test.io', password: 'anything' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 4xx for malformed email (validation rejection)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'password' });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe('Protected route — authenticate middleware', () => {
  it('returns 401 UNAUTHORIZED when no Authorization header', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 TOKEN_INVALID for a malformed JWT', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer this-is-not-a-jwt');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_INVALID');
  });

  it('returns 401 for an expired JWT (no DB session, fails JWT verify)', async () => {
    const expiredToken = generateExpiredToken('ADMIN');
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(['TOKEN_INVALID', 'SESSION_EXPIRED']).toContain(res.body.error.code);
  });

  it('returns 200 for a valid token with a real DB session', async () => {
    const token = await generateTestToken({
      userId: TEST_IDS.users.admin,
      email: 'admin@ims-test.io',
      role: 'ADMIN',
    });

    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.userId).toBe(TEST_IDS.users.admin);
    expect(res.body.data.role).toBe('ADMIN');
  });

  it('returns 401 SESSION_EXPIRED for a valid JWT with no matching DB session', async () => {
    // Sign a JWT with a unique jti so it never matches an existing session.
    // Without jti, rapid test execution means iat/exp land on the same second as a
    // previously-created token, producing identical bytes and the same SHA-256 hash.
    const jwt = await import('jsonwebtoken');
    const token = jwt.default.sign(
      { userId: TEST_IDS.users.admin, email: 'admin@ims-test.io', role: 'ADMIN', jti: `no-session-${Date.now()}` },
      process.env.JWT_SECRET || 'integration-test-secret-at-least-32-chars',
      { expiresIn: '1h', issuer: 'ims-api', audience: 'ims-client' }
    );

    // Don't create a DB session for this token
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('SESSION_EXPIRED');
  });
});

describe('POST /api/auth/logout', () => {
  it('invalidates session — subsequent request with same token → 401', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@ims-test.io', password: 'Test@1234!' });

    expect(loginRes.status).toBe(200);
    const { accessToken, refreshToken } = loginRes.body.data;

    // Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect([200, 204]).toContain(logoutRes.status);

    // Token should now be invalid
    const afterLogout = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(afterLogout.status).toBe(401);
    expect(['SESSION_EXPIRED', 'TOKEN_INVALID']).toContain(afterLogout.body.error.code);
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns 200 with new accessToken for valid refresh token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'auditor@ims-test.io', password: 'Test@1234!' });

    expect(loginRes.status).toBe(200);
    const { refreshToken } = loginRes.body.data;

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data).toHaveProperty('accessToken');
  });

  it('returns 401 for a fake/malformed refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'not-a-real-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
