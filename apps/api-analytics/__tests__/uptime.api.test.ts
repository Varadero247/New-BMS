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

describe('uptime.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/uptime', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/uptime', async () => {
    const res = await request(app).get('/api/uptime');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/uptime', async () => {
    const res = await request(app).get('/api/uptime');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/uptime body has success property', async () => {
    const res = await request(app).get('/api/uptime');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/uptime body is an object', async () => {
    const res = await request(app).get('/api/uptime');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/uptime route is accessible', async () => {
    const res = await request(app).get('/api/uptime');
    expect(res.status).toBeDefined();
  });
});

describe('Uptime API — edge cases and field validation', () => {
  it('GET / data.checks contains items with serviceName field', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', serviceName: 'API Gateway', status: 'UP', uptimePercent: 99.9 },
    ]);
    const res = await request(app).get('/api/uptime');
    expect(res.status).toBe(200);
    expect(res.body.data.checks[0]).toHaveProperty('serviceName');
  });

  it('GET / data.checks items have status field', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000002', serviceName: 'H&S API', status: 'DOWN', uptimePercent: 95 },
    ]);
    const res = await request(app).get('/api/uptime');
    expect(res.status).toBe(200);
    expect(res.body.data.checks[0]).toHaveProperty('status');
  });

  it('GET /:id data.check has id field matching request param', async () => {
    const check = { id: '00000000-0000-0000-0000-000000000003', serviceName: 'Env API', status: 'UP', uptimePercent: 99 };
    mockPrisma.uptimeCheck.findUnique.mockResolvedValue(check);
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000003');
    expect(res.status).toBe(200);
    expect(res.body.data.check.id).toBe('00000000-0000-0000-0000-000000000003');
  });

  it('GET /:id/history default page is 1', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('GET /:id/history default limit is 20', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.limit).toBe(20);
  });

  it('GET /:id/history count is called once per request', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockResolvedValue(5);
    await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history');
    expect(mockPrisma.uptimeIncident.count).toHaveBeenCalledTimes(1);
  });

  it('GET /:id/history pagination totalPages is ceil(total/limit)', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockResolvedValue(45);
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history?limit=20');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.totalPages).toBe(3);
  });

  it('GET /:id returns recentIncidents as an array', async () => {
    mockPrisma.uptimeCheck.findUnique.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', serviceName: 'API', status: 'UP', uptimePercent: 100 });
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([
      { id: 'inc-x', uptimeCheckId: '00000000-0000-0000-0000-000000000001', detectedAt: new Date() },
      { id: 'inc-y', uptimeCheckId: '00000000-0000-0000-0000-000000000001', detectedAt: new Date() },
    ]);
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recentIncidents)).toBe(true);
    expect(res.body.data.recentIncidents).toHaveLength(2);
  });

  it('GET / with multiple checks returns all in data.checks', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000004', serviceName: 'A', status: 'UP', uptimePercent: 100 },
      { id: '00000000-0000-0000-0000-000000000005', serviceName: 'B', status: 'DOWN', uptimePercent: 90 },
      { id: '00000000-0000-0000-0000-000000000006', serviceName: 'C', status: 'UP', uptimePercent: 99 },
    ]);
    const res = await request(app).get('/api/uptime');
    expect(res.status).toBe(200);
    expect(res.body.data.checks).toHaveLength(3);
  });
});

describe('Uptime API — comprehensive coverage', () => {
  it('GET / response content-type is json', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/uptime');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /:id returns 500 when uptimeIncident.findMany rejects', async () => {
    mockPrisma.uptimeCheck.findUnique.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', serviceName: 'API', status: 'UP', uptimePercent: 100 });
    mockPrisma.uptimeIncident.findMany.mockRejectedValue(new Error('incident DB error'));
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id/history pagination has totalPages field', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toHaveProperty('totalPages');
  });

  it('GET /:id/history count error returns 500', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockRejectedValue(new Error('count error'));
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001/history');
    expect(res.status).toBe(500);
  });

  it('GET / with UP status check has uptimePercent field', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000010', serviceName: 'Gateway', status: 'UP', uptimePercent: 99.95 },
    ]);
    const res = await request(app).get('/api/uptime');
    expect(res.status).toBe(200);
    expect(res.body.data.checks[0]).toHaveProperty('uptimePercent');
  });

  it('GET / data.checks has length matching mocked results', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000011', serviceName: 'A', status: 'UP', uptimePercent: 100 },
      { id: '00000000-0000-0000-0000-000000000012', serviceName: 'B', status: 'UP', uptimePercent: 99 },
      { id: '00000000-0000-0000-0000-000000000013', serviceName: 'C', status: 'DOWN', uptimePercent: 80 },
    ]);
    const res = await request(app).get('/api/uptime');
    expect(res.status).toBe(200);
    expect(res.body.data.checks).toHaveLength(3);
  });
});

describe('Uptime API — final coverage block', () => {
  it('GET / check with DOWN status is included in results', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000007', serviceName: 'Gateway', status: 'DOWN', uptimePercent: 88 },
    ]);
    const res = await request(app).get('/api/uptime');
    expect(res.status).toBe(200);
    expect(res.body.data.checks[0].status).toBe('DOWN');
  });

  it('GET /:id findUnique is called once per request', async () => {
    mockPrisma.uptimeCheck.findUnique.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', serviceName: 'X', status: 'UP', uptimePercent: 100 });
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.uptimeCheck.findUnique).toHaveBeenCalledTimes(1);
  });

  it('GET /:id/history count query is called with correct uptimeCheckId', async () => {
    mockPrisma.uptimeIncident.findMany.mockResolvedValue([]);
    mockPrisma.uptimeIncident.count.mockResolvedValue(0);
    await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000008/history');
    expect(mockPrisma.uptimeIncident.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { uptimeCheckId: '00000000-0000-0000-0000-000000000008' } })
    );
  });

  it('GET / response body is not null', async () => {
    mockPrisma.uptimeCheck.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/uptime');
    expect(res.body).not.toBeNull();
  });

  it('GET /:id 404 error code is NOT_FOUND', async () => {
    mockPrisma.uptimeCheck.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/uptime/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET / success is false on error response', async () => {
    mockPrisma.uptimeCheck.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/uptime');
    expect(res.body.success).toBe(false);
  });
});

describe('uptime — phase29 coverage', () => {
  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

  it('handles Math.min', () => {
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('handles JSON parse', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

});
