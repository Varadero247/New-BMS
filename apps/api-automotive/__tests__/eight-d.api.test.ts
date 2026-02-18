import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    eightDReport: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import router from '../src/routes/eight-d';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/eight-d', router);

const REPORT_ID = '00000000-0000-4000-a000-000000000001';

const mockReport = {
  id: REPORT_ID,
  refNumber: '8D-2601-0001',
  title: 'Dimensional non-conformance on Part A',
  problemStatement: 'Part A outer diameter out of tolerance',
  customer: 'Ford Motor Company',
  partNumber: 'PA-12345',
  severity: 'HIGH',
  teamLeader: 'Jane Smith',
  teamMembers: ['Bob Jones', 'Alice Brown'],
  status: 'D1_TEAM_FORMATION',
  deletedAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/eight-d', () => {
  it('returns list of 8D reports', async () => {
    (mockPrisma.eightDReport.findMany as jest.Mock).mockResolvedValue([mockReport]);
    (mockPrisma.eightDReport.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/eight-d');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.total).toBe(1);
  });

  it('filters by status, customer, and severity', async () => {
    (mockPrisma.eightDReport.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.eightDReport.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get(
      '/api/eight-d?status=D1_TEAM_FORMATION&customer=Ford&severity=HIGH'
    );
    expect(res.status).toBe(200);
  });

  it('supports search query', async () => {
    (mockPrisma.eightDReport.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.eightDReport.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/eight-d?search=dimensional');
    expect(res.status).toBe(200);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.eightDReport.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/eight-d');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/eight-d/stats', () => {
  it('returns 8D statistics', async () => {
    (mockPrisma.eightDReport.count as jest.Mock).mockResolvedValue(10);
    (mockPrisma.eightDReport.groupBy as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/eight-d/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('byStatus');
    expect(res.body.data).toHaveProperty('bySeverity');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.eightDReport.count as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/eight-d/stats');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/eight-d/:id', () => {
  it('returns a single 8D report', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue(mockReport);

    const res = await request(app).get(`/api/eight-d/${REPORT_ID}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(REPORT_ID);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`/api/eight-d/${REPORT_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 when soft-deleted', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue({
      ...mockReport,
      deletedAt: new Date(),
    });

    const res = await request(app).get(`/api/eight-d/${REPORT_ID}`);
    expect(res.status).toBe(404);
  });
});

describe('POST /api/eight-d', () => {
  const validBody = {
    title: 'Dimensional non-conformance on Part A',
    problemStatement: 'Part A outer diameter out of tolerance',
    teamLeader: 'Jane Smith',
  };

  it('creates 8D report successfully', async () => {
    (mockPrisma.eightDReport.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.eightDReport.create as jest.Mock).mockResolvedValue(mockReport);

    const res = await request(app).post('/api/eight-d').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('refNumber');
  });

  it('returns 400 on validation error', async () => {
    const res = await request(app).post('/api/eight-d').send({ title: 'Missing required fields' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.eightDReport.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.eightDReport.create as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).post('/api/eight-d').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/eight-d/:id', () => {
  it('updates 8D report successfully', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue(mockReport);
    (mockPrisma.eightDReport.update as jest.Mock).mockResolvedValue({
      ...mockReport,
      status: 'D2_PROBLEM_DESCRIPTION',
    });

    const res = await request(app)
      .put(`/api/eight-d/${REPORT_ID}`)
      .send({ status: 'D2_PROBLEM_DESCRIPTION' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put(`/api/eight-d/${REPORT_ID}`)
      .send({ status: 'D2_PROBLEM_DESCRIPTION' });
    expect(res.status).toBe(404);
  });

  it('returns 400 on validation error', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue(mockReport);

    const res = await request(app)
      .put(`/api/eight-d/${REPORT_ID}`)
      .send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue(mockReport);
    (mockPrisma.eightDReport.update as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app)
      .put(`/api/eight-d/${REPORT_ID}`)
      .send({ status: 'D2_PROBLEM_DESCRIPTION' });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/eight-d/:id', () => {
  it('soft deletes 8D report', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue(mockReport);
    (mockPrisma.eightDReport.update as jest.Mock).mockResolvedValue({
      ...mockReport,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/eight-d/${REPORT_ID}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(`/api/eight-d/${REPORT_ID}`);
    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.eightDReport.findUnique as jest.Mock).mockResolvedValue(mockReport);
    (mockPrisma.eightDReport.update as jest.Mock).mockRejectedValue(new Error('fail'));

    const res = await request(app).delete(`/api/eight-d/${REPORT_ID}`);
    expect(res.status).toBe(500);
  });
});
