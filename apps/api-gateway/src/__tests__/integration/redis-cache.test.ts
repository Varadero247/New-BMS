// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: Rate limiting + token blacklist with real Redis.
import express from 'express';
import request from 'supertest';
import Redis from 'ioredis';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';
import { waitFor } from '../../../../../packages/shared/src/test-utils/api-helpers';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: Redis;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  redis = new Redis(REDIS_URL);
});

afterAll(async () => {
  await redis.quit();
});

async function buildRateLimitedApp(maxRequests: number, windowMs: number) {
  const app = express();
  app.use(express.json());

  const rateLimit = (await import('express-rate-limit')).default;
  const RedisStore = (await import('rate-limit-redis')).default;

  const testRedis = new Redis(REDIS_URL);

  const limiter = rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: false,
    handler: (_req: express.Request, res: express.Response) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000),
        },
      });
    },
    store: new RedisStore({
      sendCommand: (...args: string[]) => (testRedis as any).call(...args),
    }),
    keyGenerator: () => 'test-client-ip',
  });

  app.use('/api/auth/login', limiter, (_req, res) => {
    res.json({ success: true, data: { message: 'ok' } });
  });

  return { app, testRedis };
}

describe('Rate limiting with real Redis', () => {
  it('allows first N requests and blocks the (N+1)th with 429', async () => {
    const MAX = 3;
    const { app, testRedis } = await buildRateLimitedApp(MAX, 60 * 1000);

    try {
      for (let i = 0; i < MAX; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'pass' });
        expect(res.status).toBe(200);
      }

      // The (MAX+1)th request should be rate-limited
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'pass' });

      expect(res.status).toBe(429);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    } finally {
      await testRedis.quit();
    }
  });

  it('rate limited response includes retryAfter field', async () => {
    const { app, testRedis } = await buildRateLimitedApp(1, 60 * 1000);

    try {
      await request(app).post('/api/auth/login').send({});
      const res = await request(app).post('/api/auth/login').send({});

      expect(res.status).toBe(429);
      expect(typeof res.body.error.retryAfter).toBe('number');
      expect(res.body.error.retryAfter).toBeGreaterThan(0);
    } finally {
      await testRedis.quit();
    }
  });
});

describe('Token blacklist in Redis', () => {
  it('after logout, the jti is stored in Redis blacklist and subsequent request fails', async () => {
    // Build a minimal app with logout that writes jti to Redis blacklist
    const app = express();
    app.use(express.json());

    const { authenticate } = await import('@ims/auth');
    const testRedis = new Redis(REDIS_URL);

    // Simulate gateway logout that blacklists the token in Redis
    app.post('/api/auth/logout-test', authenticate, async (req: any, res) => {
      const token = req.token;
      // Store in blacklist with 1h TTL
      if (token) {
        const { createHash } = await import('crypto');
        const key = `nexara:blacklist:${createHash('sha256').update(token).digest('hex')}`;
        await testRedis.set(key, '1', 'EX', 3600);
      }
      res.json({ success: true, data: { message: 'logged out' } });
    });

    // Protected endpoint that checks blacklist
    app.get('/api/protected-bl', authenticate, async (req: any, res) => {
      const token = req.token;
      if (token) {
        const { createHash } = await import('crypto');
        const key = `nexara:blacklist:${createHash('sha256').update(token).digest('hex')}`;
        const isBlacklisted = await testRedis.get(key);
        if (isBlacklisted) {
          return res.status(401).json({
            success: false,
            error: { code: 'TOKEN_BLACKLISTED', message: 'Token has been revoked' },
          });
        }
      }
      res.json({ success: true, data: { ok: true } });
    });

    const token = await generateTestToken({
      userId: TEST_IDS.users.user,
      role: 'USER',
      email: 'user@ims-test.io',
    });

    try {
      // First, access protected endpoint — should succeed
      const before = await request(app)
        .get('/api/protected-bl')
        .set('Authorization', `Bearer ${token}`);
      expect(before.status).toBe(200);

      // Logout — blacklists token
      const logoutRes = await request(app)
        .post('/api/auth/logout-test')
        .set('Authorization', `Bearer ${token}`);
      expect(logoutRes.status).toBe(200);

      // Now access protected endpoint — should be blocked
      const after = await request(app)
        .get('/api/protected-bl')
        .set('Authorization', `Bearer ${token}`);
      expect(after.status).toBe(401);
      expect(after.body.error.code).toBe('TOKEN_BLACKLISTED');
    } finally {
      await testRedis.quit();
    }
  });
});
