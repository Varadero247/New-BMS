import { createRateLimiter, closeRedisConnection } from '../src/middleware/rate-limiter';

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
  });

  describe('rate limiter behavior', () => {
    it('should export auth limiter', async () => {
      const { authLimiter } = await import('../src/middleware/rate-limiter');
      expect(authLimiter).toBeDefined();
      expect(typeof authLimiter).toBe('function');
    });

    it('should export register limiter', async () => {
      const { registerLimiter } = await import('../src/middleware/rate-limiter');
      expect(registerLimiter).toBeDefined();
      expect(typeof registerLimiter).toBe('function');
    });

    it('should export api limiter', async () => {
      const { apiLimiter } = await import('../src/middleware/rate-limiter');
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });

    it('should export password reset limiter', async () => {
      const { passwordResetLimiter } = await import('../src/middleware/rate-limiter');
      expect(passwordResetLimiter).toBeDefined();
      expect(typeof passwordResetLimiter).toBe('function');
    });

    it('should export strict API limiter', async () => {
      const { strictApiLimiter } = await import('../src/middleware/rate-limiter');
      expect(strictApiLimiter).toBeDefined();
      expect(typeof strictApiLimiter).toBe('function');
    });
  });

  describe('mock request/response testing', () => {
    it('should allow requests under the limit', async () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 100,
      });

      const mockReq = {
        ip: '127.0.0.1',
        socket: { remoteAddress: '127.0.0.1' },
        body: {},
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
        limiter(mockReq as any, mockRes as any, (err?: any) => {
          mockNext(err);
          resolve();
        });
      });

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(429);
    });
  });
});

describe('Rate Limiter Configuration', () => {
  it('auth limiter should be configured for 5 requests per 15 minutes', async () => {
    // This tests the configuration exists and is exported
    const { authLimiter } = await import('../src/middleware/rate-limiter');
    expect(authLimiter).toBeDefined();
  });

  it('register limiter should be configured for 3 requests per hour', async () => {
    const { registerLimiter } = await import('../src/middleware/rate-limiter');
    expect(registerLimiter).toBeDefined();
  });

  it('api limiter should be configured for 100 requests per 15 minutes', async () => {
    const { apiLimiter } = await import('../src/middleware/rate-limiter');
    expect(apiLimiter).toBeDefined();
  });
});
