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
