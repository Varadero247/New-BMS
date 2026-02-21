import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {},
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'admin@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/rbac', () => ({
  requirePermission: () => (_req: any, _res: any, next: any) => next(),
  attachPermissions: () => (_req: any, _res: any, next: any) => next(),
}));

import executiveRouter from '../src/routes/executive';

const app = express();
app.use(express.json());
app.use('/api/executive-summary', executiveRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Executive Summary Routes', () => {
  describe('GET /api/executive-summary', () => {
    it('returns executive dashboard data', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('myActions');
      expect(res.body.data).toHaveProperty('health');
      expect(res.body.data).toHaveProperty('generatedAt');
    });

    it('includes module counts', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(res.body.data).toHaveProperty('moduleCounts');
    });

    it('includes certification status', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(res.body.data).toHaveProperty('certifications');
    });

    it('includes recent activity', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(res.body.data).toHaveProperty('recentActivity');
    });

    it('returns myActions with overdue, dueToday, thisWeek counts', async () => {
      const res = await request(app).get('/api/executive-summary');
      const { myActions } = res.body.data;
      expect(myActions).toHaveProperty('overdue');
      expect(myActions).toHaveProperty('dueToday');
      expect(typeof myActions.overdue).toBe('number');
    });

    it('certifications is an array', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(Array.isArray(res.body.data.certifications)).toBe(true);
    });

    it('recentActivity is an array', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(Array.isArray(res.body.data.recentActivity)).toBe(true);
    });

    it('health has isoReadiness and openCapas fields', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(res.body.data.health).toHaveProperty('isoReadiness');
      expect(res.body.data.health).toHaveProperty('openCapas');
    });

    it('generatedAt is a string in response', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(typeof res.body.data.generatedAt).toBe('string');
    });

    it('moduleCounts is an object', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(typeof res.body.data.moduleCounts).toBe('object');
    });

    it('myActions has dueThisWeek field', async () => {
      const res = await request(app).get('/api/executive-summary');
      expect(res.body.data.myActions).toHaveProperty('dueThisWeek');
    });
  });
});

describe('Executive Summary — extended', () => {
  it('myActions.overdue is a number', async () => {
    const res = await request(app).get('/api/executive-summary');
    expect(typeof res.body.data.myActions.overdue).toBe('number');
  });

  it('health.isoReadiness is a number', async () => {
    const res = await request(app).get('/api/executive-summary');
    expect(typeof res.body.data.health.isoReadiness).toBe('number');
  });

  it('certifications array length is at least 0', async () => {
    const res = await request(app).get('/api/executive-summary');
    expect(res.body.data.certifications.length).toBeGreaterThanOrEqual(0);
  });

  it('recentActivity array length is at least 0', async () => {
    const res = await request(app).get('/api/executive-summary');
    expect(res.body.data.recentActivity.length).toBeGreaterThanOrEqual(0);
  });
});

// ===================================================================
// Executive Summary — additional coverage (5 tests)
// ===================================================================
describe('Executive Summary — additional coverage', () => {
  it('GET /executive-summary returns 401 when authenticate rejects', async () => {
    const { authenticate } = await import('@ims/auth');
    (authenticate as jest.Mock).mockImplementationOnce((_req: any, res: any, _next: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' } });
    });

    const res = await request(app).get('/api/executive-summary');
    expect(res.status).toBe(401);
  });

  it('GET /executive-summary health.openCapas is a non-negative number', async () => {
    const res = await request(app).get('/api/executive-summary');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.health.openCapas).toBe('number');
    expect(res.body.data.health.openCapas).toBeGreaterThanOrEqual(0);
  });

  it('GET /executive-summary moduleCounts includes healthSafety section', async () => {
    const res = await request(app).get('/api/executive-summary');
    expect(res.status).toBe(200);
    expect(res.body.data.moduleCounts).toHaveProperty('healthSafety');
    expect(typeof res.body.data.moduleCounts.healthSafety).toBe('object');
  });

  it('GET /executive-summary certifications each have a standard and status field', async () => {
    const res = await request(app).get('/api/executive-summary');
    expect(res.status).toBe(200);
    const certs = res.body.data.certifications as Array<Record<string, unknown>>;
    certs.forEach((cert) => {
      expect(cert).toHaveProperty('standard');
      expect(cert).toHaveProperty('status');
    });
  });

  it('GET /executive-summary recentActivity each entry has id, type and timestamp', async () => {
    const res = await request(app).get('/api/executive-summary');
    expect(res.status).toBe(200);
    const activity = res.body.data.recentActivity as Array<Record<string, unknown>>;
    expect(activity.length).toBeGreaterThan(0);
    activity.forEach((entry) => {
      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('type');
      expect(entry).toHaveProperty('timestamp');
    });
  });
});
