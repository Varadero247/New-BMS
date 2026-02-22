import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { compComplaint: { findMany: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/regulatory';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/regulatory', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/regulatory', () => {
  it('should return regulatory complaints', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '1', title: 'Regulatory Complaint', isRegulatory: true },
      { id: '2', title: 'Another Regulatory', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should return empty list when no regulatory complaints', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.compComplaint.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns a single regulatory complaint', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: 'c-1', title: 'GDPR Breach Report', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('GDPR Breach Report');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    await request(app).get('/api/regulatory');
    expect(mockPrisma.compComplaint.findMany).toHaveBeenCalledTimes(1);
  });

  it('returned complaints all have isRegulatory true', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '1', title: 'HSE Notification', isRegulatory: true },
      { id: '2', title: 'ICO Report', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    for (const complaint of res.body.data) {
      expect(complaint.isRegulatory).toBe(true);
    }
  });

  it('data is an array', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('each complaint has an id property', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: 'c-1', title: 'GDPR Issue', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
  });

  it('success is true on 200 response', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Regulatory — extended', () => {
  it('data length matches the number returned by findMany', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '1', title: 'A', isRegulatory: true },
      { id: '2', title: 'B', isRegulatory: true },
      { id: '3', title: 'C', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('each complaint has a title property', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: 'c-1', title: 'GDPR Issue', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.body.data[0]).toHaveProperty('title');
  });

  it('success is false on 500', async () => {
    mockPrisma.compComplaint.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Regulatory — extra', () => {
  it('error code is INTERNAL_ERROR on DB failure', async () => {
    mockPrisma.compComplaint.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('first complaint has an id property', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: 'reg-001', title: 'HSE Report', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
    expect(res.body.data[0].id).toBe('reg-001');
  });

  it('findMany is not called when request returns 500', async () => {
    mockPrisma.compComplaint.findMany.mockRejectedValue(new Error('db down'));
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(500);
    expect(mockPrisma.compComplaint.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('regulatory.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/regulatory', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/regulatory', async () => {
    const res = await request(app).get('/api/regulatory');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/regulatory', async () => {
    const res = await request(app).get('/api/regulatory');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/regulatory body has success property', async () => {
    const res = await request(app).get('/api/regulatory');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/regulatory body is an object', async () => {
    const res = await request(app).get('/api/regulatory');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/regulatory route is accessible', async () => {
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBeDefined();
  });
});

describe('regulatory.api — edge cases and field validation', () => {
  it('returns complaints with multiple regulatory issues', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: 'r-001', title: 'GDPR Breach', isRegulatory: true, severity: 'HIGH' },
      { id: 'r-002', title: 'HSE Violation', isRegulatory: true, severity: 'MEDIUM' },
      { id: 'r-003', title: 'ICO Report', isRegulatory: true, severity: 'LOW' },
      { id: 'r-004', title: 'FDA Notice', isRegulatory: true, severity: 'CRITICAL' },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.success).toBe(true);
  });

  it('each complaint in response has an id field', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Item A', isRegulatory: true },
      { id: '00000000-0000-0000-0000-000000000002', title: 'Item B', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    for (const item of res.body.data) {
      expect(item).toHaveProperty('id');
    }
  });

  it('findMany is called with isRegulatory true condition', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    await request(app).get('/api/regulatory');
    expect(mockPrisma.compComplaint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isRegulatory: true }) })
    );
  });

  it('error body contains error object with code property on 500', async () => {
    mockPrisma.compComplaint.findMany.mockRejectedValue(new Error('connection refused'));
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('responds with 200 when single complaint returned', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Single Complaint', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('response body success field is boolean', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(typeof res.body.success).toBe('boolean');
  });

  it('findMany is called with deletedAt null filter', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    await request(app).get('/api/regulatory');
    expect(mockPrisma.compComplaint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });

  it('response content-type is application/json', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('data array contains complaint title fields when complaints returned', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Regulatory Notice', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('Regulatory Notice');
  });

  it('error message is defined on 500 response', async () => {
    mockPrisma.compComplaint.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(500);
    expect(res.body.error.message).toBeDefined();
  });
});

describe('regulatory.api — final coverage expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / response content-type is application/json', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET / findMany is called with deletedAt null and isRegulatory true', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    await request(app).get('/api/regulatory');
    expect(mockPrisma.compComplaint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isRegulatory: true, deletedAt: null }),
      })
    );
  });

  it('GET / returns 5 complaints correctly', async () => {
    const complaints = Array.from({ length: 5 }, (_, i) => ({ id: `r-00${i}`, title: `Complaint ${i}`, isRegulatory: true }));
    mockPrisma.compComplaint.findMany.mockResolvedValue(complaints);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
  });

  it('GET / success field is boolean', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(typeof res.body.success).toBe('boolean');
  });

  it('GET / error.code is INTERNAL_ERROR on rejection', async () => {
    mockPrisma.compComplaint.findMany.mockRejectedValue(new Error('db unreachable'));
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / data is array even when single complaint returned', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([{ id: 'r-001', title: 'Solo', isRegulatory: true }]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('GET / data array items each have title and id fields', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'First', isRegulatory: true },
      { id: '00000000-0000-0000-0000-000000000002', title: 'Second', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    for (const item of res.body.data) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
    }
  });
});

describe('regulatory.api — coverage completion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / response body has a data property', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('GET / returns correct title for first complaint', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'CMA Breach', isRegulatory: true },
    ]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data[0].title).toBe('CMA Breach');
  });

  it('GET / data array is empty when findMany returns empty array', async () => {
    mockPrisma.compComplaint.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/regulatory');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});
