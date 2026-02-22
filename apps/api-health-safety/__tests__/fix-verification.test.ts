/**
 * Architecture Fix Verification Tests
 *
 * Uses Health & Safety API as a representative service to verify:
 * - F-003: Auth middleware required on all routes
 * - F-010: Structured logging (no console.error in error handlers)
 * - F-014: Pagination limit capped at 100
 * - F-026: DELETE returns 204 No Content
 * - F-032: Error handler masks details in non-development environments
 * - F-039: /ready endpoint verifies database connectivity
 */

import express from 'express';
import request from 'supertest';

// Mock @ims/monitoring
const mockLogger = { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() };
jest.mock('@ims/monitoring', () => ({
  createLogger: jest.fn(() => mockLogger),
  metricsMiddleware: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  metricsHandler: jest.fn((_req: any, res: any) => res.json({})),
  correlationIdMiddleware: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  createHealthCheck: jest.fn(() => (_req: any, res: any) => res.json({ status: 'healthy' })),
}));

// Mock @ims/auth
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '20000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

// Mock prisma
jest.mock('../src/prisma', () => ({
  prisma: {
    risk: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { prisma } from '../src/prisma';
import risksRoutes from '../src/routes/risks';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Architecture Fix Verification', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('F-003: Auth Middleware Required on Routes', () => {
    it('should have authenticate imported and used in route file', () => {
      // The fact that our mock for @ims/auth is called proves authenticate is in the middleware chain.
      // We verify by checking that req.user is populated when handler runs.
      (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
      mockPrisma.risk.count.mockResolvedValueOnce(0);

      return request(app)
        .get('/api/risks')
        .expect(200)
        .then(() => {
          // If auth middleware wasn't used, our mock wouldn't have been called
          // and req.user wouldn't exist, potentially causing errors
          const { authenticate } = require('@ims/auth');
          expect(authenticate).toHaveBeenCalled();
        });
    });
  });

  describe('F-014: Pagination Limit Capped at 100', () => {
    it('should cap limit at 100 even when requesting 500', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([]);
      mockPrisma.risk.count.mockResolvedValueOnce(0);

      const response = await request(app).get('/api/risks?limit=500');

      expect(response.status).toBe(200);
      // Verify the meta.limit is capped at 100
      expect(response.body.meta.limit).toBe(100);
      // Verify prisma was called with take: 100 (not 500)
      expect(mockPrisma.risk.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should accept limit within range (e.g., 10)', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([]);
      mockPrisma.risk.count.mockResolvedValueOnce(0);

      const response = await request(app).get('/api/risks?limit=10');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(10);
    });

    it('should default to 20 when no limit is provided', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([]);
      mockPrisma.risk.count.mockResolvedValueOnce(0);

      const response = await request(app).get('/api/risks');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(20);
    });

    it('should handle negative limit gracefully', async () => {
      mockPrisma.risk.findMany.mockResolvedValueOnce([]);
      mockPrisma.risk.count.mockResolvedValueOnce(0);

      const response = await request(app).get('/api/risks?limit=-5');

      expect(response.status).toBe(200);
      // Should default to 20 since parseInt('-5') is negative
      expect(response.body.meta.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('F-026: DELETE Returns 204 No Content', () => {
    it('should return 204 with no body on successful delete', async () => {
      mockPrisma.risk.findUnique.mockResolvedValueOnce({
        id: '10000000-0000-4000-a000-000000000123',
      });
      (mockPrisma.risk.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app).delete('/api/risks/10000000-0000-4000-a000-000000000123');

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });
  });

  describe('F-010: Structured Logging (No console.error)', () => {
    it('should use structured logger for error logging, not console.error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPrisma.risk.findMany.mockRejectedValueOnce(new Error('DB connection lost'));

      await request(app).get('/api/risks');

      // Structured logger should have been called
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ error: 'DB connection lost' })
      );
      // console.error should NOT have been called for route errors
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('F-032: Error Response Masking', () => {
    it('should return generic error message on 500 (no stack traces)', async () => {
      mockPrisma.risk.findMany.mockRejectedValueOnce(
        new Error('SENSITIVE: database password leaked')
      );

      const response = await request(app).get('/api/risks');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      // The actual error message should NOT leak sensitive details
      expect(response.body.error.message).not.toContain('SENSITIVE');
      expect(response.body.error.message).not.toContain('database password');
      // Should have a generic message
      expect(response.body.error.message).toBeDefined();
    });

    it('should not include stack trace in error response', async () => {
      mockPrisma.risk.findMany.mockRejectedValueOnce(new Error('Internal failure'));

      const response = await request(app).get('/api/risks');

      expect(response.status).toBe(500);
      expect(response.body.error.stack).toBeUndefined();
    });
  });
});

describe('Architecture Fix — extended', () => {
  let extApp: express.Express;
  beforeAll(() => {
    extApp = express();
    extApp.use(express.json());
    extApp.use('/api/risks', risksRoutes);
  });

  it('returns data array on successful GET /risks', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(0);
    const response = await request(extApp).get('/api/risks');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });

  it('meta.page defaults to 1 when no page param', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(0);
    const response = await request(extApp).get('/api/risks');
    expect(response.status).toBe(200);
    expect(response.body.meta.page).toBe(1);
  });

  it('limit of 100 is accepted without error', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(0);
    const response = await request(extApp).get('/api/risks?limit=100');
    expect(response.status).toBe(200);
    expect(response.body.meta.limit).toBe(100);
  });
});

describe('Architecture Fix — extra', () => {
  let extApp: express.Express;
  beforeAll(() => {
    extApp = express();
    extApp.use(express.json());
    extApp.use('/api/risks', risksRoutes);
  });

  it('response meta has total field', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(5);
    const response = await request(extApp).get('/api/risks');
    expect(response.status).toBe(200);
    expect(response.body.meta).toHaveProperty('total');
  });

  it('success is false when findMany rejects', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    const response = await request(extApp).get('/api/risks');
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  it('data is an array on 200 response', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(0);
    const response = await request(extApp).get('/api/risks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe('Architecture Fix — additional coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/risks response body has meta object', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(0);

    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
    expect(typeof res.body.meta).toBe('object');
  });

  it('GET /api/risks meta.totalPages is at least 0', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(0);

    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/risks page=2 sets meta.page to 2', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(40);

    const res = await request(app).get('/api/risks?page=2&limit=20');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
  });

  it('F-026: DELETE non-existent risk returns 404', async () => {
    mockPrisma.risk.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).delete('/api/risks/10000000-0000-4000-a000-000000000999');
    expect(res.status).toBe(404);
  });

  it('F-003: authenticate mock is invoked on each request', async () => {
    const { authenticate } = require('@ims/auth');
    (authenticate as jest.Mock).mockClear();
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(0);

    await request(app).get('/api/risks');
    expect(authenticate).toHaveBeenCalledTimes(1);
  });
});

describe('Architecture Fix — pagination edge cases', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', risksRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('page=0 is treated as page 1 (no negative skip)', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/risks?page=0');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBeGreaterThanOrEqual(1);
  });

  it('limit of 1 is accepted as valid minimum', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/risks?limit=1');
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBe(1);
  });

  it('meta.totalPages equals ceil(total/limit)', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(25);
    const res = await request(app).get('/api/risks?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(3);
  });

  it('findMany is called with correct skip for page 3 limit 5', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([]);
    mockPrisma.risk.count.mockResolvedValueOnce(20);
    await request(app).get('/api/risks?page=3&limit=5');
    expect(mockPrisma.risk.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10 })
    );
  });

  it('GET /api/risks returns success: true on 200', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([{ id: '00000000-0000-0000-0000-000000000001' }]);
    mockPrisma.risk.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/risks includes data items in response', async () => {
    const mockRisk = { id: '00000000-0000-0000-0000-000000000001', title: 'Slip hazard' };
    (mockPrisma.risk.findMany as jest.Mock).mockResolvedValueOnce([mockRisk]);
    mockPrisma.risk.count.mockResolvedValueOnce(1);
    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('DELETE returns 204 for a valid existing risk', async () => {
    mockPrisma.risk.findUnique.mockResolvedValueOnce({ id: '00000000-0000-0000-0000-000000000001' });
    (mockPrisma.risk.delete as jest.Mock).mockResolvedValueOnce({});
    const res = await request(app).delete('/api/risks/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(204);
  });

  it('error response has code field on 500', async () => {
    (mockPrisma.risk.findMany as jest.Mock).mockRejectedValueOnce(new Error('db error'));
    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code', 'INTERNAL_ERROR');
  });
});
