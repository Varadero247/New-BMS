import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsHazard: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    fsCcp: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    fsAudit: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    fsNcr: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    fsRecall: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    fsProduct: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import dashboardRouter from '../src/routes/dashboard';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dashboard', () => {
  it('returns 200 with food safety KPI data', async () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(20);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(8);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(15);
    (prisma.fsNcr.count as jest.Mock)
      .mockResolvedValueOnce(10)  // total ncrs
      .mockResolvedValueOnce(3);  // openNcrs
    (prisma.fsRecall.count as jest.Mock)
      .mockResolvedValueOnce(2)   // total recalls
      .mockResolvedValueOnce(1);  // activeRecalls
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(50);
    (prisma.fsAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.fsNcr.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns valid JSON response structure with summary fields', async () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(20);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(8);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(15);
    (prisma.fsNcr.count as jest.Mock)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3);
    (prisma.fsRecall.count as jest.Mock)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(50);
    (prisma.fsAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.fsNcr.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.body.data).toBeDefined();
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary).toHaveProperty('hazards', 20);
    expect(res.body.data.summary).toHaveProperty('ccps', 8);
    expect(res.body.data.summary).toHaveProperty('audits', 15);
    expect(res.body.data.summary).toHaveProperty('ncrs', 10);
    expect(res.body.data.summary).toHaveProperty('openNcrs', 3);
    expect(res.body.data.summary).toHaveProperty('recalls', 2);
    expect(res.body.data.summary).toHaveProperty('activeRecalls', 1);
    expect(res.body.data.summary).toHaveProperty('products', 50);
  });

  it('returns recentAudits and recentNcrs arrays', async () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(1);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(1);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(1);
    (prisma.fsNcr.count as jest.Mock).mockResolvedValue(1).mockResolvedValueOnce(0);
    (prisma.fsRecall.count as jest.Mock).mockResolvedValue(1).mockResolvedValueOnce(0);
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(1);
    (prisma.fsAudit.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Annual Audit', type: 'INTERNAL', status: 'COMPLETED', scheduledDate: new Date() },
    ]);
    (prisma.fsNcr.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000002', title: 'Temp Deviation', severity: 'MAJOR', status: 'OPEN', createdAt: new Date() },
    ]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recentAudits)).toBe(true);
    expect(res.body.data.recentAudits).toHaveLength(1);
    expect(res.body.data.recentAudits[0].title).toBe('Annual Audit');
    expect(Array.isArray(res.body.data.recentNcrs)).toBe(true);
    expect(res.body.data.recentNcrs).toHaveLength(1);
    expect(res.body.data.recentNcrs[0].title).toBe('Temp Deviation');
  });

  it('returns 500 when a count query throws a DB error', async () => {
    (prisma.fsHazard.count as jest.Mock).mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('Failed to fetch dashboard data');
  });

  it('returns 500 when a findMany query throws', async () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(1);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(1);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(1);
    (prisma.fsNcr.count as jest.Mock).mockResolvedValue(1).mockResolvedValueOnce(0);
    (prisma.fsRecall.count as jest.Mock).mockResolvedValue(1).mockResolvedValueOnce(0);
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(1);
    (prisma.fsAudit.findMany as jest.Mock).mockRejectedValue(new Error('Query timeout'));

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('returns 0 counts for empty database', async () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsNcr.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsRecall.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.fsNcr.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.hazards).toBe(0);
    expect(res.body.data.summary.ccps).toBe(0);
    expect(res.body.data.summary.audits).toBe(0);
    expect(res.body.data.summary.ncrs).toBe(0);
    expect(res.body.data.summary.openNcrs).toBe(0);
    expect(res.body.data.summary.recalls).toBe(0);
    expect(res.body.data.summary.activeRecalls).toBe(0);
    expect(res.body.data.summary.products).toBe(0);
    expect(res.body.data.recentAudits).toHaveLength(0);
    expect(res.body.data.recentNcrs).toHaveLength(0);
  });

  it('queries fsHazard count with deletedAt: null filter', async () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(5);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsNcr.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsRecall.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.fsNcr.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/dashboard');

    expect(prisma.fsHazard.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });

  it('queries fsCcp count with isActive: true filter', async () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(3);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsNcr.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsRecall.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.fsNcr.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/dashboard');

    expect(prisma.fsCcp.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true, deletedAt: null }) })
    );
  });

  it('includes openNcrs and activeRecalls as separate counts in summary', async () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(0);
    // First fsNcr.count = total, second = openNcrs
    (prisma.fsNcr.count as jest.Mock)
      .mockResolvedValueOnce(7)
      .mockResolvedValueOnce(4);
    // First fsRecall.count = total, second = activeRecalls
    (prisma.fsRecall.count as jest.Mock)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.fsNcr.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.ncrs).toBe(7);
    expect(res.body.data.summary.openNcrs).toBe(4);
    expect(res.body.data.summary.recalls).toBe(3);
    expect(res.body.data.summary.activeRecalls).toBe(2);
  });

  it('returns error object with code and message on failure', async () => {
    (prisma.fsHazard.count as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
  });
});

describe('Food Safety Dashboard — extended', () => {
  const setupDefaultMocks = () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsNcr.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsRecall.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.fsNcr.findMany as jest.Mock).mockResolvedValue([]);
  };

  it('success is true in response', async () => {
    setupDefaultMocks();
    const res = await request(app).get('/api/dashboard');
    expect(res.body.success).toBe(true);
  });

  it('recentAudits is an array', async () => {
    setupDefaultMocks();
    const res = await request(app).get('/api/dashboard');
    expect(Array.isArray(res.body.data.recentAudits)).toBe(true);
  });

  it('recentNcrs is an array', async () => {
    setupDefaultMocks();
    const res = await request(app).get('/api/dashboard');
    expect(Array.isArray(res.body.data.recentNcrs)).toBe(true);
  });

  it('summary.products is a number', async () => {
    setupDefaultMocks();
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(25);
    const res = await request(app).get('/api/dashboard');
    expect(typeof res.body.data.summary.products).toBe('number');
    expect(res.body.data.summary.products).toBe(25);
  });

  it('fsNcr.count is called at least once', async () => {
    setupDefaultMocks();
    await request(app).get('/api/dashboard');
    expect(prisma.fsNcr.count).toHaveBeenCalled();
  });
});


describe('Food Safety Dashboard — final coverage', () => {
  const setupDefaultMocks = () => {
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsNcr.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsRecall.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsProduct.count as jest.Mock).mockResolvedValue(0);
    (prisma.fsAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.fsNcr.findMany as jest.Mock).mockResolvedValue([]);
  };

  it('summary.hazards reflects the mock count', async () => {
    setupDefaultMocks();
    (prisma.fsHazard.count as jest.Mock).mockResolvedValue(12);
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.hazards).toBe(12);
  });

  it('summary.ccps reflects the mock count', async () => {
    setupDefaultMocks();
    (prisma.fsCcp.count as jest.Mock).mockResolvedValue(6);
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.ccps).toBe(6);
  });

  it('fsRecall.count is called at least once', async () => {
    setupDefaultMocks();
    await request(app).get('/api/dashboard');
    expect(prisma.fsRecall.count).toHaveBeenCalled();
  });

  it('fsAudit.findMany is called once per request', async () => {
    setupDefaultMocks();
    await request(app).get('/api/dashboard');
    expect(prisma.fsAudit.findMany).toHaveBeenCalledTimes(1);
  });

  it('error body has both code and message keys on DB failure', async () => {
    (prisma.fsHazard.count as jest.Mock).mockRejectedValue(new Error('connection lost'));
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
  });
});
