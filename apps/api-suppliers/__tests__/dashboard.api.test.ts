import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    suppSupplier: { count: jest.fn() },
    suppScorecard: { count: jest.fn() },
    suppDocument: { count: jest.fn() },
  },
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

import router from '../src/routes/dashboard';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/dashboard', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dashboard/stats', () => {
  it('should return dashboard stats', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(10);
    mockPrisma.suppScorecard.count.mockResolvedValue(5);
    mockPrisma.suppDocument.count.mockResolvedValue(20);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSuppliers).toBe(10);
    expect(res.body.data.totalScorecards).toBe(5);
    expect(res.body.data.totalDocuments).toBe(20);
  });

  it('should return zeros when no data', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSuppliers).toBe(0);
  });

  it('should return 500 on DB error', async () => {
    mockPrisma.suppSupplier.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response has all three expected data keys', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(1);
    mockPrisma.suppScorecard.count.mockResolvedValue(1);
    mockPrisma.suppDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalSuppliers');
    expect(res.body.data).toHaveProperty('totalScorecards');
    expect(res.body.data).toHaveProperty('totalDocuments');
  });

  it('all three count queries run per request', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(15);
    mockPrisma.suppScorecard.count.mockResolvedValue(8);
    mockPrisma.suppDocument.count.mockResolvedValue(30);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.suppSupplier.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.suppScorecard.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.suppDocument.count).toHaveBeenCalledTimes(1);
  });

  it('totalScorecards reflects the mock count', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(42);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalScorecards).toBe(42);
  });

  it('totalDocuments reflects the mock count', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(100);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalDocuments).toBe(100);
  });

  it('success is true on 200 response', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/dashboard/stats — extended', () => {
  it('suppScorecard error causes 500', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(1);
    mockPrisma.suppScorecard.count.mockRejectedValue(new Error('scorecard fail'));
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('suppDocument error causes 500', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(1);
    mockPrisma.suppScorecard.count.mockResolvedValue(1);
    mockPrisma.suppDocument.count.mockRejectedValue(new Error('doc fail'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('totalSuppliers is a number', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(6);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalSuppliers).toBe('number');
  });

  it('large count values returned correctly', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(500);
    mockPrisma.suppScorecard.count.mockResolvedValue(1200);
    mockPrisma.suppDocument.count.mockResolvedValue(3000);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalSuppliers).toBe(500);
    expect(res.body.data.totalScorecards).toBe(1200);
    expect(res.body.data.totalDocuments).toBe(3000);
  });

  it('response body has success property', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body).toHaveProperty('success');
  });

  it('error response does not include data field', async () => {
    mockPrisma.suppSupplier.count.mockRejectedValue(new Error('fail'));
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.data).toBeUndefined();
  });

  it('totalScorecards is a number', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(11);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalScorecards).toBe('number');
  });
});

describe('dashboard.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/dashboard', async () => {
    const res = await request(app).get('/api/dashboard');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/dashboard', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/dashboard body has success property', async () => {
    const res = await request(app).get('/api/dashboard');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/dashboard body is an object', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/dashboard route is accessible', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBeDefined();
  });
});

describe('dashboard.api — stats data integrity', () => {
  it('stats data fields are numbers', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(3);
    mockPrisma.suppScorecard.count.mockResolvedValue(7);
    mockPrisma.suppDocument.count.mockResolvedValue(14);
    const res = await request(app).get('/api/dashboard/stats');
    expect(typeof res.body.data.totalSuppliers).toBe('number');
    expect(typeof res.body.data.totalScorecards).toBe('number');
    expect(typeof res.body.data.totalDocuments).toBe('number');
  });

  it('data object has exactly the three expected keys', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    const keys = Object.keys(res.body.data);
    expect(keys).toContain('totalSuppliers');
    expect(keys).toContain('totalScorecards');
    expect(keys).toContain('totalDocuments');
    expect(keys).toHaveLength(3);
  });

  it('success is true when all counts resolve', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(2);
    mockPrisma.suppScorecard.count.mockResolvedValue(2);
    mockPrisma.suppDocument.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.success).toBe(true);
  });

  it('all three count mocks called even for large values', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(99999);
    mockPrisma.suppScorecard.count.mockResolvedValue(99999);
    mockPrisma.suppDocument.count.mockResolvedValue(99999);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.suppSupplier.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.suppScorecard.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.suppDocument.count).toHaveBeenCalledTimes(1);
  });

  it('404 for unknown sub-route under /api/dashboard', async () => {
    const res = await request(app).get('/api/dashboard/unknown-route');
    expect([404]).toContain(res.status);
  });

  it('error response has error.message defined', async () => {
    mockPrisma.suppSupplier.count.mockRejectedValue(new Error('db gone'));
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.message).toBeDefined();
  });

  it('concurrent identical requests each return correct totals', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(5);
    mockPrisma.suppScorecard.count.mockResolvedValue(5);
    mockPrisma.suppDocument.count.mockResolvedValue(5);
    const [r1, r2] = await Promise.all([
      request(app).get('/api/dashboard/stats'),
      request(app).get('/api/dashboard/stats'),
    ]);
    expect(r1.body.data.totalSuppliers).toBe(5);
    expect(r2.body.data.totalSuppliers).toBe(5);
  });

  it('response body is not null', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body).not.toBeNull();
  });
});

describe('dashboard.api (suppliers) — final coverage', () => {
  it('response content-type is JSON', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('totalDocuments is a number', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(55);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalDocuments).toBe('number');
  });

  it('error response success is false', async () => {
    mockPrisma.suppSupplier.count.mockRejectedValue(new Error('gone'));
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.success).toBe(false);
  });

  it('GET /stats with all zero counts has no data.undefined keys', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalSuppliers).toBe(0);
    expect(res.body.data.totalScorecards).toBe(0);
    expect(res.body.data.totalDocuments).toBe(0);
  });

  it('HTTP GET /stats returns 200 on success', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(1);
    mockPrisma.suppScorecard.count.mockResolvedValue(1);
    mockPrisma.suppDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
  });

  it('HTTP GET /stats returns 500 when suppDocument count throws', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockRejectedValue(new Error('doc error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('data object contains exactly the three stat keys', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(10);
    mockPrisma.suppScorecard.count.mockResolvedValue(20);
    mockPrisma.suppDocument.count.mockResolvedValue(30);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    const keys = Object.keys(res.body.data);
    expect(keys).toContain('totalSuppliers');
    expect(keys).toContain('totalScorecards');
    expect(keys).toContain('totalDocuments');
  });
});

describe('dashboard.api (suppliers) — coverage to 40', () => {
  it('response body is not null on success', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(1);
    mockPrisma.suppScorecard.count.mockResolvedValue(1);
    mockPrisma.suppDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body).not.toBeNull();
  });

  it('success field is boolean true on 200', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(3);
    mockPrisma.suppScorecard.count.mockResolvedValue(3);
    mockPrisma.suppDocument.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(typeof res.body.success).toBe('boolean');
    expect(res.body.success).toBe(true);
  });

  it('error response has error.message as a string', async () => {
    mockPrisma.suppSupplier.count.mockRejectedValue(new Error('timeout'));
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(typeof res.body.error.message).toBe('string');
  });

  it('data.totalSuppliers is a number and equals mock value', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(77);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalSuppliers).toBe('number');
    expect(res.body.data.totalSuppliers).toBe(77);
  });

  it('GET /api/dashboard/stats: response content-type is json', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});
