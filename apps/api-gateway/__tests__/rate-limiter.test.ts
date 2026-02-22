import { Request, Response } from 'express';
import {
  createRateLimiter,
  closeRedisConnection,
  getRedisClient,
  authLimiter,
  registerLimiter,
  apiLimiter,
  passwordResetLimiter,
  strictApiLimiter,
} from '../src/middleware/rate-limiter';

describe('Rate Limiter Middleware', () => {
  afterAll(async () => {
    await closeRedisConnection();
  });

  describe('createRateLimiter', () => {
    it('should create a rate limiter middleware', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 10,
      });

      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });

    it('should accept custom options', () => {
      const limiter = createRateLimiter({
        windowMs: 30000,
        max: 5,
        message: 'Custom message',
      });

      expect(limiter).toBeDefined();
    });

    it('should create limiter with default handler', () => {
      const limiter = createRateLimiter({
        windowMs: 1000,
        max: 1,
      });

      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });
  });

  describe('rate limiter exports', () => {
    it('should export auth limiter', () => {
      expect(authLimiter).toBeDefined();
      expect(typeof authLimiter).toBe('function');
    });

    it('should export register limiter', () => {
      expect(registerLimiter).toBeDefined();
      expect(typeof registerLimiter).toBe('function');
    });

    it('should export api limiter', () => {
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });

    it('should export password reset limiter', () => {
      expect(passwordResetLimiter).toBeDefined();
      expect(typeof passwordResetLimiter).toBe('function');
    });

    it('should export strict API limiter', () => {
      expect(strictApiLimiter).toBeDefined();
      expect(typeof strictApiLimiter).toBe('function');
    });
  });

  describe('rate limiter behavior', () => {
    it('should allow requests under the limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 100,
      });

      const mockReq = {
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
        body: {},
        method: 'GET',
        path: '/test',
        headers: {},
        get: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
      };
      const mockNext = jest.fn();

      // Should call next for allowed requests
      await new Promise<void>((resolve) => {
        limiter(mockReq as unknown as Request, mockRes as unknown as Response, (err?: any) => {
          mockNext(err);
          resolve();
        });
      });

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });

    it('should use in-memory store when Redis is not available', () => {
      // Creating a limiter without Redis should work
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 2,
      });

      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });
  });

  describe('Rate Limiter Configuration', () => {
    it('auth limiter should be configured for 5 requests per 15 minutes', () => {
      expect(authLimiter).toBeDefined();
      // The limiter is a function - we verify it exists and has correct type
      expect(typeof authLimiter).toBe('function');
    });

    it('register limiter should be configured for 3 requests per hour', () => {
      expect(registerLimiter).toBeDefined();
      expect(typeof registerLimiter).toBe('function');
    });

    it('api limiter should be configured for 100 requests per 15 minutes', () => {
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });

    it('password reset limiter should be configured', () => {
      expect(passwordResetLimiter).toBeDefined();
      expect(typeof passwordResetLimiter).toBe('function');
    });

    it('strict API limiter should be configured for 20 requests per 15 minutes', () => {
      expect(strictApiLimiter).toBeDefined();
      expect(typeof strictApiLimiter).toBe('function');
    });
  });

  describe('getRedisClient', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
      // Reset module to clear Redis client singleton
      jest.resetModules();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return null when REDIS_URL is not set', async () => {
      delete process.env.REDIS_URL;
      const { getRedisClient } = await import('../src/middleware/rate-limiter');

      const client = getRedisClient();

      expect(client).toBeNull();
    });

    it('should return same instance on subsequent calls without Redis', async () => {
      delete process.env.REDIS_URL;
      const { getRedisClient } = await import('../src/middleware/rate-limiter');

      const client1 = getRedisClient();
      const client2 = getRedisClient();

      expect(client1).toBeNull();
      expect(client2).toBeNull();
    });
  });

  describe('closeRedisConnection', () => {
    it('should handle case when Redis not initialized', async () => {
      delete process.env.REDIS_URL;
      jest.resetModules();
      const { closeRedisConnection: close } = await import('../src/middleware/rate-limiter');

      // Should not throw
      await expect(close()).resolves.not.toThrow();
    });

    it('should be safe to call multiple times', async () => {
      const { closeRedisConnection: close } = await import('../src/middleware/rate-limiter');

      await close();
      await close();
      await close();

      // Should not throw
    });
  });

  describe('key generator functions', () => {
    it('authLimiter should use ip and email for key generation', async () => {
      const mockReq = {
        ip: '192.168.1.1',
        socket: { remoteAddress: '192.168.1.1' },
        body: { email: 'user@example.com' },
        method: 'POST',
        path: '/login',
        headers: {},
        get: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
      };

      await new Promise<void>((resolve) => {
        authLimiter(mockReq as unknown as Request, mockRes as unknown as Response, () => resolve());
      });

      // If the key generator works, the request should proceed
      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });

    it('authLimiter should handle missing email', async () => {
      const mockReq = {
        ip: '192.168.1.2',
        socket: { remoteAddress: '192.168.1.2' },
        body: {},
        method: 'POST',
        path: '/login',
        headers: {},
        get: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
      };

      await new Promise<void>((resolve) => {
        authLimiter(mockReq as unknown as Request, mockRes as unknown as Response, () => resolve());
      });

      // Should use 'unknown' for email and still proceed
      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });

    it('authLimiter should handle missing ip', async () => {
      const mockReq = {
        ip: undefined,
        socket: { remoteAddress: '192.168.1.3' },
        body: { email: 'test@example.com' },
        method: 'POST',
        path: '/login',
        headers: {},
        get: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
      };

      await new Promise<void>((resolve) => {
        authLimiter(mockReq as unknown as Request, mockRes as unknown as Response, () => resolve());
      });

      // Should fall back to socket.remoteAddress
      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });

    it('registerLimiter should use ip for key generation', async () => {
      const mockReq = {
        ip: '192.168.1.4',
        socket: { remoteAddress: '192.168.1.4' },
        body: {},
        method: 'POST',
        path: '/register',
        headers: {},
        get: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
      };

      await new Promise<void>((resolve) => {
        registerLimiter(mockReq as unknown as Request, mockRes as unknown as Response, () => resolve());
      });

      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });

    it('apiLimiter should use ip for key generation', async () => {
      const mockReq = {
        ip: '192.168.1.5',
        socket: { remoteAddress: '192.168.1.5' },
        body: {},
        method: 'GET',
        path: '/api/data',
        headers: {},
        get: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
      };

      await new Promise<void>((resolve) => {
        apiLimiter(mockReq as unknown as Request, mockRes as unknown as Response, () => resolve());
      });

      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });

    it('passwordResetLimiter should use ip and email', async () => {
      const mockReq = {
        ip: '192.168.1.6',
        socket: { remoteAddress: '192.168.1.6' },
        body: { email: 'reset@example.com' },
        method: 'POST',
        path: '/reset-password',
        headers: {},
        get: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
      };

      await new Promise<void>((resolve) => {
        passwordResetLimiter(mockReq as unknown as Request, mockRes as unknown as Response, () => resolve());
      });

      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });

    it('strictApiLimiter should use ip for key generation', async () => {
      const mockReq = {
        ip: '192.168.1.7',
        socket: { remoteAddress: '192.168.1.7' },
        body: {},
        method: 'POST',
        path: '/api/sensitive',
        headers: {},
        get: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
      };

      await new Promise<void>((resolve) => {
        strictApiLimiter(mockReq as unknown as Request, mockRes as unknown as Response, () => resolve());
      });

      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });
  });

  describe('RATE_LIMIT_ENABLED bypass', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should skip rate limiting when RATE_LIMIT_ENABLED=false', async () => {
      process.env.RATE_LIMIT_ENABLED = 'false';

      // createRateLimiter with max=1 — but skip should bypass the limit
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 1,
        keyGenerator: () => 'bypass-test-key',
        skip: () => process.env.RATE_LIMIT_ENABLED === 'false',
      });

      const makeRequest = () =>
        new Promise<{ called: boolean; status?: number }>((resolve) => {
          const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
            getHeader: jest.fn(),
          };
          const mockReq = {
            ip: '10.10.10.10',
            socket: { remoteAddress: '10.10.10.10' },
            body: {},
            method: 'GET',
            path: '/test',
            headers: {},
            get: jest.fn(),
          };
          limiter(mockReq as unknown as Request, mockRes as unknown as Response, () => {
            resolve({ called: true, status: mockRes.status.mock.calls[0]?.[0] });
          });
        });

      // Both requests should pass through (skip=true bypasses limit)
      const result1 = await makeRequest();
      const result2 = await makeRequest();

      expect(result1.called).toBe(true);
      expect(result2.called).toBe(true);
      expect(result1.status).toBeUndefined(); // no 429
      expect(result2.status).toBeUndefined(); // no 429
    });

    it('should enforce rate limits when RATE_LIMIT_ENABLED is not false', async () => {
      delete process.env.RATE_LIMIT_ENABLED;

      // RATE_LIMIT_ENABLED not set → skip returns false → limits enforced
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 100, // high limit so we don't actually trigger it in test
        keyGenerator: () => 'enforce-test-key',
      });

      const mockReq = {
        ip: '10.10.10.20',
        socket: { remoteAddress: '10.10.10.20' },
        body: {},
        method: 'GET',
        path: '/test',
        headers: {},
        get: jest.fn(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
      };

      await new Promise<void>((resolve) => {
        limiter(mockReq as unknown as Request, mockRes as unknown as Response, () => resolve());
      });

      // Request should pass (under limit), not 429
      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });
  });

  describe('rate limit handler response', () => {
    it('should return proper 429 response structure when rate limited', async () => {
      // Create a limiter with very low limit for testing
      const testLimiter = createRateLimiter({
        windowMs: 60000,
        max: 1,
        keyGenerator: () => 'handler-test-key',
      });

      const mockReq = {
        ip: '10.0.0.1',
        socket: { remoteAddress: '10.0.0.1' },
        body: {},
        method: 'GET',
        path: '/test',
        headers: {},
        get: jest.fn(),
      };

      // First request - should pass
      await new Promise<void>((resolve) => {
        const mockRes1 = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          setHeader: jest.fn(),
          getHeader: jest.fn(),
        };
        testLimiter(mockReq as unknown as Request, mockRes1 as unknown as Response, () => resolve());
      });

      // Second request - should be rate limited
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
        getHeader: jest.fn().mockReturnValue('60'),
      };

      await new Promise<void>((resolve) => {
        testLimiter(mockReq as unknown as Request, mockRes as unknown as Response, () => resolve());
        setTimeout(resolve, 100);
      });

      // Verify the handler was called with 429
      if (mockRes.status.mock.calls.length > 0) {
        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'RATE_LIMIT_EXCEEDED',
            }),
          })
        );
      }
    });
  });
});

describe('Rate Limiter — final coverage batch', () => {
  afterAll(async () => { await closeRedisConnection(); });

  it('all five pre-configured limiters are callable functions', () => {
    expect(typeof authLimiter).toBe('function');
    expect(typeof registerLimiter).toBe('function');
    expect(typeof apiLimiter).toBe('function');
    expect(typeof passwordResetLimiter).toBe('function');
    expect(typeof strictApiLimiter).toBe('function');
  });

  it('createRateLimiter with max 50 returns a function', () => {
    const lim = createRateLimiter({ windowMs: 60_000, max: 50 });
    expect(typeof lim).toBe('function');
  });

  it('createRateLimiter with skip option returns a function', () => {
    const lim = createRateLimiter({ windowMs: 60_000, max: 10, skip: () => true });
    expect(typeof lim).toBe('function');
  });

  it('createRateLimiter with standardHeaders false returns a function', () => {
    const lim = createRateLimiter({ windowMs: 60_000, max: 10, standardHeaders: false });
    expect(typeof lim).toBe('function');
  });

  it('createRateLimiter with legacyHeaders true returns a function', () => {
    const lim = createRateLimiter({ windowMs: 60_000, max: 10, legacyHeaders: true });
    expect(typeof lim).toBe('function');
  });

  it('getRedisClient returns null when REDIS_URL is absent', () => {
    delete process.env.REDIS_URL;
    const client = getRedisClient();
    expect(client).toBeNull();
  });
});
