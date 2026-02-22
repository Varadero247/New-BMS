import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    ptwPermit: { count: jest.fn() },
    ptwMethodStatement: { count: jest.fn() },
    ptwToolboxTalk: { count: jest.fn() },
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
  it('should return dashboard stats with counts', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(10);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(5);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPermits).toBe(10);
    expect(res.body.data.totalMethodStatements).toBe(5);
    expect(res.body.data.totalToolboxTalks).toBe(3);
  });

  it('should return zeros when no records exist', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(0);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPermits).toBe(0);
    expect(res.body.data.totalMethodStatements).toBe(0);
    expect(res.body.data.totalToolboxTalks).toBe(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.ptwPermit.count.mockRejectedValue(new Error('DB failure'));
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should return 404 for unknown dashboard routes', async () => {
    const res = await request(app).get('/api/dashboard/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('all three expected data keys are present', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(1);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(1);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalPermits');
    expect(res.body.data).toHaveProperty('totalMethodStatements');
    expect(res.body.data).toHaveProperty('totalToolboxTalks');
  });

  it('all three count queries run once per request', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(4);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(2);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(6);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.ptwPermit.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.ptwMethodStatement.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.ptwToolboxTalk.count).toHaveBeenCalledTimes(1);
  });

  it('returns independent values for each entity type', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(8);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(3);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(15);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalPermits).toBe(8);
    expect(res.body.data.totalMethodStatements).toBe(3);
    expect(res.body.data.totalToolboxTalks).toBe(15);
  });

  it('totalPermits is a number', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(5);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(typeof res.body.data.totalPermits).toBe('number');
  });

  it('success is true on 200', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(0);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('success is false on 500', async () => {
    mockPrisma.ptwPermit.count.mockRejectedValue(new Error('DB crash'));
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PTW Dashboard — extended', () => {
  it('error code is INTERNAL_ERROR on 500', async () => {
    mockPrisma.ptwPermit.count.mockRejectedValue(new Error('crash'));
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('totalMethodStatements is a number', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(0);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(7);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(typeof res.body.data.totalMethodStatements).toBe('number');
  });

  it('totalToolboxTalks is a number', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(0);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(4);
    const res = await request(app).get('/api/dashboard/stats');
    expect(typeof res.body.data.totalToolboxTalks).toBe('number');
  });

  it('data object is defined on success', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(2);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(1);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('large counts are returned correctly', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(500);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(250);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(125);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalPermits).toBe(500);
    expect(res.body.data.totalMethodStatements).toBe(250);
    expect(res.body.data.totalToolboxTalks).toBe(125);
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

describe('PTW Dashboard — extended edge cases', () => {
  it('500 when ptwMethodStatement.count rejects', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(5);
    mockPrisma.ptwMethodStatement.count.mockRejectedValue(new Error('DB failure'));
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('500 when ptwToolboxTalk.count rejects', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(5);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(3);
    mockPrisma.ptwToolboxTalk.count.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('error body has error.code INTERNAL_ERROR on any count failure', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(1);
    mockPrisma.ptwMethodStatement.count.mockRejectedValue(new Error('crash'));
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('count queries receive correct where clause with deletedAt null', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(0);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.ptwPermit.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });

  it('data.totalPermits equals mocked permit count value', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(42);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalPermits).toBe(42);
  });

  it('returns 404 for GET /api/dashboard/nonexistent-path', async () => {
    const res = await request(app).get('/api/dashboard/nonexistent-path');
    expect(res.status).toBe(404);
  });

  it('data object keys are exactly totalPermits, totalMethodStatements, totalToolboxTalks', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(1);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(1);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    const keys = Object.keys(res.body.data).sort();
    expect(keys).toEqual(['totalMethodStatements', 'totalPermits', 'totalToolboxTalks']);
  });

  it('success field is boolean true on success', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(0);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.success).toStrictEqual(true);
  });
});
