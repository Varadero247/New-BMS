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
  id: 'entry-1',
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
              expect.objectContaining({ description: { contains: 'approval', mode: 'insensitive' } }),
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

      const res = await request(app)
        .post('/api/audit-log')
        .send({
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
      const res = await request(app)
        .post('/api/audit-log')
        .send({ action: 'DECISION' });

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
      (prisma.aiAuditLog.groupBy as jest.Mock).mockResolvedValue([
        { action: 'DECISION', _count: { id: 30 } },
        { action: 'OVERRIDE', _count: { id: 12 } },
      ]);
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

      const res = await request(app).get('/api/audit-log/entry-1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('entry-1');
    });

    it('should return 404 for missing entry', async () => {
      (prisma.aiAuditLog.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/audit-log/nonexistent');
      expect(res.status).toBe(404);
    });

    it('should handle errors', async () => {
      (prisma.aiAuditLog.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/audit-log/entry-1');
      expect(res.status).toBe(500);
    });
  });
});
