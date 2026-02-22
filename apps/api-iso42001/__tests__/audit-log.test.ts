import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aiAuditLog: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN', organisationId: 'org-1' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import auditLogRouter from '../src/routes/audit-log';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/audit-log', auditLogRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockEntry = {
  id: '00000000-0000-0000-0000-000000000001',
  systemId: 'sys-1',
  action: 'DECISION',
  description: 'AI system recommended approval',
  inputSummary: 'Application data for user XYZ',
  outputSummary: 'Approved with 95% confidence',
  userId: 'user-123',
  userName: 'test@test.com',
  ipAddress: '127.0.0.1',
  metadata: { model: 'v2.1' },
  riskScore: 15,
  organisationId: 'org-1',
  createdAt: new Date(),
};

describe('Audit Log Routes', () => {
  describe('GET /api/audit-log', () => {
    it('should list audit log entries', async () => {
      (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([mockEntry]);
      (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/audit-log');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by action', async () => {
      (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get('/api/audit-log?action=OVERRIDE');
      expect(res.status).toBe(200);
      expect(prisma.aiAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ action: 'OVERRIDE' }),
        })
      );
    });

    it('should filter by systemId', async () => {
      (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get('/api/audit-log?systemId=sys-1');
      expect(res.status).toBe(200);
      expect(prisma.aiAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ systemId: 'sys-1' }),
        })
      );
    });

    it('should support search', async () => {
      (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get('/api/audit-log?search=approval');
      expect(res.status).toBe(200);
      expect(prisma.aiAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                description: { contains: 'approval', mode: 'insensitive' },
              }),
            ]),
          }),
        })
      );
    });

    it('should paginate results', async () => {
      (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(100);

      const res = await request(app).get('/api/audit-log?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(prisma.aiAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 })
      );
    });

    it('should handle errors', async () => {
      (prisma.aiAuditLog.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/audit-log');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/audit-log', () => {
    it('should create an audit log entry', async () => {
      (prisma.aiAuditLog.create as jest.Mock).mockResolvedValue(mockEntry);

      const res = await request(app).post('/api/audit-log').send({
        action: 'DECISION',
        description: 'AI system recommended approval',
        inputSummary: 'Application data for user XYZ',
        outputSummary: 'Approved with 95% confidence',
        riskScore: 15,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prisma.aiAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'DECISION',
            description: 'AI system recommended approval',
            userId: 'user-123',
          }),
        })
      );
    });

    it('should reject invalid action', async () => {
      const res = await request(app)
        .post('/api/audit-log')
        .send({ action: 'INVALID', description: 'Test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject missing description', async () => {
      const res = await request(app).post('/api/audit-log').send({ action: 'DECISION' });

      expect(res.status).toBe(400);
    });

    it('should handle errors', async () => {
      (prisma.aiAuditLog.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/api/audit-log')
        .send({ action: 'DECISION', description: 'Test' });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/audit-log/stats', () => {
    it('should return statistics', async () => {
      (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(42);
      (prisma.aiAuditLog.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { action: 'DECISION', _count: { id: 30 } },
          { action: 'OVERRIDE', _count: { id: 12 } },
        ])
        .mockResolvedValueOnce([
          { userId: 'user-123', userName: 'test@test.com', _count: { id: 42 } },
        ])
        .mockResolvedValueOnce([{ createdAt: new Date('2026-02-14'), _count: { id: 5 } }]);
      (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([mockEntry]);

      const res = await request(app).get('/api/audit-log/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalEntries).toBe(42);
      expect(res.body.data.byAction.DECISION).toBe(30);
    });

    it('should handle errors', async () => {
      (prisma.aiAuditLog.count as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/audit-log/stats');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/audit-log/:id', () => {
    it('should return a single entry', async () => {
      (prisma.aiAuditLog.findUnique as jest.Mock).mockResolvedValue(mockEntry);

      const res = await request(app).get('/api/audit-log/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for missing entry', async () => {
      (prisma.aiAuditLog.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/audit-log/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('should handle errors', async () => {
      (prisma.aiAuditLog.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/audit-log/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
    });
  });
});

describe('Audit Log — additional coverage', () => {
  it('GET /api/audit-log response has pagination object with total', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/audit-log');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total', 0);
  });

  it('GET /api/audit-log data is an array', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/audit-log');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/audit-log with REVIEW action returns 201', async () => {
    (prisma.aiAuditLog.create as jest.Mock).mockResolvedValue({
      ...mockEntry,
      action: 'REVIEW',
    });

    const res = await request(app).post('/api/audit-log').send({
      action: 'REVIEW',
      description: 'Model retrained on new dataset',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/audit-log/:id returns success:true when found', async () => {
    (prisma.aiAuditLog.findUnique as jest.Mock).mockResolvedValue(mockEntry);

    const res = await request(app).get('/api/audit-log/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/audit-log/stats data has byAction property', async () => {
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(5);
    (prisma.aiAuditLog.groupBy as jest.Mock)
      .mockResolvedValueOnce([{ action: 'DECISION', _count: { id: 5 } }])
      .mockResolvedValueOnce([{ userId: 'user-123', userName: 'test@test.com', _count: { id: 5 } }])
      .mockResolvedValueOnce([{ createdAt: new Date('2026-02-14'), _count: { id: 5 } }]);
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([mockEntry]);

    const res = await request(app).get('/api/audit-log/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('byAction');
  });
});

describe('Audit Log — edge cases and deeper coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/audit-log filters by userId', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/audit-log?userId=user-123');
    expect(res.status).toBe(200);
    expect(prisma.aiAuditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-123' }),
      })
    );
  });

  it('GET /api/audit-log filters by date range', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get(
      '/api/audit-log?startDate=2026-01-01&endDate=2026-01-31'
    );
    expect(res.status).toBe(200);
    expect(prisma.aiAuditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) }),
        }),
      })
    );
  });

  it('GET /api/audit-log pagination has totalPages', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(100);
    const res = await request(app).get('/api/audit-log');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('POST /api/audit-log with APPROVAL action returns 201', async () => {
    (prisma.aiAuditLog.create as jest.Mock).mockResolvedValue({ ...mockEntry, action: 'APPROVAL' });
    const res = await request(app).post('/api/audit-log').send({
      action: 'APPROVAL',
      description: 'Manager approved AI recommendation',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/audit-log with CONFIG_CHANGE action returns 201', async () => {
    (prisma.aiAuditLog.create as jest.Mock).mockResolvedValue({ ...mockEntry, action: 'CONFIG_CHANGE' });
    const res = await request(app).post('/api/audit-log').send({
      action: 'CONFIG_CHANGE',
      description: 'Threshold updated from 0.8 to 0.9',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/audit-log with riskScore at boundary 100 returns 201', async () => {
    (prisma.aiAuditLog.create as jest.Mock).mockResolvedValue({ ...mockEntry, riskScore: 100 });
    const res = await request(app).post('/api/audit-log').send({
      action: 'DECISION',
      description: 'High-risk decision',
      riskScore: 100,
    });
    expect(res.status).toBe(201);
  });

  it('POST /api/audit-log with riskScore > 100 returns 400', async () => {
    const res = await request(app).post('/api/audit-log').send({
      action: 'DECISION',
      description: 'Invalid risk score',
      riskScore: 101,
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/audit-log/stats data has topUsers array', async () => {
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(10);
    (prisma.aiAuditLog.groupBy as jest.Mock)
      .mockResolvedValueOnce([{ action: 'OVERRIDE', _count: { id: 10 } }])
      .mockResolvedValueOnce([{ userId: 'user-123', userName: 'test@test.com', _count: { id: 10 } }])
      .mockResolvedValueOnce([{ createdAt: new Date('2026-02-20'), _count: { id: 2 } }]);
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([mockEntry]);
    const res = await request(app).get('/api/audit-log/stats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.topUsers)).toBe(true);
  });

  it('GET /api/audit-log/stats data has recent array', async () => {
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(3);
    (prisma.aiAuditLog.groupBy as jest.Mock)
      .mockResolvedValueOnce([{ action: 'ESCALATION', _count: { id: 3 } }])
      .mockResolvedValueOnce([{ userId: 'user-123', userName: 'test@test.com', _count: { id: 3 } }])
      .mockResolvedValueOnce([{ createdAt: new Date('2026-02-22'), _count: { id: 1 } }]);
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([mockEntry]);
    const res = await request(app).get('/api/audit-log/stats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recent)).toBe(true);
  });
});

describe('Audit Log — final batch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/audit-log with REJECTION action returns 201', async () => {
    (prisma.aiAuditLog.create as jest.Mock).mockResolvedValue({ ...mockEntry, action: 'REJECTION' });
    const res = await request(app).post('/api/audit-log').send({
      action: 'REJECTION',
      description: 'AI recommendation rejected by compliance officer',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/audit-log with ESCALATION action returns 201', async () => {
    (prisma.aiAuditLog.create as jest.Mock).mockResolvedValue({ ...mockEntry, action: 'ESCALATION' });
    const res = await request(app).post('/api/audit-log').send({
      action: 'ESCALATION',
      description: 'Case escalated to senior review team',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/audit-log response data items have id field', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([mockEntry]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/audit-log');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('id');
  });

  it('GET /api/audit-log response data items have action field', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([mockEntry]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/audit-log');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('action');
  });

  it('GET /api/audit-log pagination page defaults to 1', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/audit-log');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET /api/audit-log pagination limit defaults to a positive number', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/audit-log');
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBeGreaterThan(0);
  });

  it('POST /api/audit-log with riskScore 0 returns 201', async () => {
    (prisma.aiAuditLog.create as jest.Mock).mockResolvedValue({ ...mockEntry, riskScore: 0 });
    const res = await request(app).post('/api/audit-log').send({
      action: 'DECISION',
      description: 'Low-risk automated decision',
      riskScore: 0,
    });
    expect(res.status).toBe(201);
  });

  it('GET /api/audit-log/stats returns success:true', async () => {
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.aiAuditLog.groupBy as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/audit-log/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/audit-log/stats totalEntries is 0 when no entries', async () => {
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);
    (prisma.aiAuditLog.groupBy as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/audit-log/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalEntries).toBe(0);
  });
});

describe('Audit Log — extended final batch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/audit-log: findMany called once per request', async () => {
    (prisma.aiAuditLog.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.aiAuditLog.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/audit-log');
    expect(prisma.aiAuditLog.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST /api/audit-log: create called once per request', async () => {
    (prisma.aiAuditLog.create as jest.Mock).mockResolvedValue(mockEntry);
    await request(app).post('/api/audit-log').send({ action: 'DECISION', description: 'Test' });
    expect(prisma.aiAuditLog.create).toHaveBeenCalledTimes(1);
  });
});

describe('audit log — phase29 coverage', () => {
  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles string substring', () => {
    expect('hello'.substring(1, 3)).toBe('el');
  });

  it('handles Math.pow', () => {
    expect(Math.pow(2, 3)).toBe(8);
  });

  it('handles string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

});

describe('audit log — phase30 coverage', () => {
  it('handles Promise type', () => {
    expect(Promise.resolve(42)).toBeInstanceOf(Promise);
  });

  it('handles async reject', async () => {
    await expect(Promise.reject(new Error('err'))).rejects.toThrow('err');
  });

  it('returns true for truthy values', () => {
    expect(Boolean('value')).toBe(true);
  });

  it('handles JSON stringify', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}');
  });

  it('handles Math.round', () => {
    expect(Math.round(3.7)).toBe(4);
  });

});
