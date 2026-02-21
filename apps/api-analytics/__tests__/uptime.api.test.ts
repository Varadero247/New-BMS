import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    uptimeCheck: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    uptimeIncident: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/uptime';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/uptime', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/uptime — List all uptime checks
// ===================================================================
describe('GET /api/uptime', () => {
  it('should return a list of uptime checks', async () => {
    const checks = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        serviceName: 'API Gateway',
        status: 'UP',
        uptimePercent: 99.9,
      },
      { id: 'uc-2', serviceName: 'H&S API', status: 'UP', uptimePercent: 99.8 },
    ];
    mockPrisma.uptimeCheck.findMany.mockResolvedValue(checks);

    const res = await request(app).get('/api/uptime');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.checks).toHaveLength(2);
  });

  it('should return an empty list when no checks exist', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/uptime');

    expect(res.status).toBe(200);
    expect(res.body.data.checks).toHaveLength(0);
  });

  it('checks is an array', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/uptime');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.checks)).toBe(true);
  });

  it('findMany called once per GET request', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([]);
    await request(app).get('/api/uptime');
    expect(mockPrisma.uptimeCheck.findMany).toHaveBeenCalledTimes(1);
  });

  it('should handle server errors', async () => {
    mockPrisma.uptimeCheck.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/uptime');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/uptime/:id/history — List incidents for a check
// ===================================================================
describe('GET /api/uptime/:id/history', () => {
  it('should return paginated incidents for a check', async () => {
    const incidents = [
      {
        id: 'inc-1',
        uptimeCheckId: '00000000-0000-0000-0000-000000000001',
        detectedAt: new Date(),
        resolvedAt: new Date(),
      },
      {
        id: 'inc-2',
        uptimeCheckId: '00000000-0000-0000-0000-000000000001',
        detectedAt: new Date(),
        resolvedAt: null,
      },
    ];
    mockPrisma.uptimeIncident.findMany.mockResolvedValue(incidents);
    mockPrisma.uptimeIncident.count.mockResolvedValue(2);

    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.incidents).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
  });

  it('should support pagination query params', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/uptime/00000000-0000-0000-0000-000000000001/history?page=2&limit=5'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(2);
    expect(res.body.data.pagination.limit).toBe(5);
  });

  it('should filter incidents by uptimeCheckId', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockResolvedValue(0);

    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history');

    expect(res.status).toBe(200);
    expect(mockPrisma.uptimeIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { uptimeCheckId: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.uptimeIncident.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/uptime/:id — Get single uptime check with recent incidents
// ===================================================================
describe('GET /api/uptime/:id', () => {
  it('should return a check with recent incidents', async () => {
    const check = {
      id: '00000000-0000-0000-0000-000000000001',
      serviceName: 'API Gateway',
      status: 'UP',
      uptimePercent: 99.9,
    };
    const recentIncidents = [
      {
        id: 'inc-1',
        uptimeCheckId: '00000000-0000-0000-0000-000000000001',
        detectedAt: new Date(),
      },
    ];
    mockPrisma.uptimeCheck.findUnique.mockResolvedValue(check);
    mockPrisma.uptimeIncident.findMany.mockResolvedValue(recentIncidents);

    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.check.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(res.body.data.recentIncidents).toHaveLength(1);
  });

  it('should return 404 for a non-existent check', async () => {
    mockPrisma.uptimeCheck.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return empty recent incidents when none exist', async () => {
    const check = {
      id: '00000000-0000-0000-0000-000000000001',
      serviceName: 'API Gateway',
      status: 'UP',
      uptimePercent: 100,
    };
    mockPrisma.uptimeCheck.findUnique.mockResolvedValue(check);
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.recentIncidents).toHaveLength(0);
  });

  it('should handle server errors', async () => {
    mockPrisma.uptimeCheck.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Uptime API — extended', () => {
  it('GET / returns success true on 200', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/uptime');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id/history incidents is an array', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.incidents)).toBe(true);
  });
});
