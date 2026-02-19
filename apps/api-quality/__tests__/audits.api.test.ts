import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualAudit: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
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

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

import auditsRouter from '../src/routes/audits';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/audits', auditsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Quality Audits API Routes', () => {
  const mockAudit = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-AUD-2026-001',
    title: 'Internal QMS Audit',
    auditType: 'INTERNAL',
    scope: 'Full QMS scope review',
    isoClause: '9.2',
    department: 'Quality',
    leadAuditor: 'Jane Auditor',
    auditTeam: 'Jane, John',
    auditee: 'Production',
    scheduledDate: new Date('2026-03-01').toISOString(),
    status: 'PLANNED',
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/audits', () => {
    it('should return list of audits with pagination', async () => {
      mockPrisma.qualAudit.findMany.mockResolvedValue([mockAudit]);
      mockPrisma.qualAudit.count.mockResolvedValue(1);

      const res = await request(app).get('/api/audits');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockPrisma.qualAudit.findMany.mockResolvedValue([mockAudit]);
      mockPrisma.qualAudit.count.mockResolvedValue(1);

      const res = await request(app).get('/api/audits?status=PLANNED');

      expect(res.status).toBe(200);
    });

    it('should filter by auditType', async () => {
      mockPrisma.qualAudit.findMany.mockResolvedValue([mockAudit]);
      mockPrisma.qualAudit.count.mockResolvedValue(1);

      const res = await request(app).get('/api/audits?auditType=INTERNAL');

      expect(res.status).toBe(200);
    });

    it('should support search', async () => {
      mockPrisma.qualAudit.findMany.mockResolvedValue([mockAudit]);
      mockPrisma.qualAudit.count.mockResolvedValue(1);

      const res = await request(app).get('/api/audits?search=QMS');

      expect(res.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualAudit.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.qualAudit.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/audits');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/audits', () => {
    const validBody = {
      title: 'Internal QMS Audit',
      auditType: 'INTERNAL',
      scope: 'Full QMS scope review',
      leadAuditor: 'Jane Auditor',
    };

    it('should create a new audit', async () => {
      mockPrisma.qualAudit.count.mockResolvedValue(0);
      mockPrisma.qualAudit.create.mockResolvedValue(mockAudit);

      const res = await request(app).post('/api/audits').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/audits')
        .send({ title: 'Missing scope and auditor' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid auditType', async () => {
      const res = await request(app)
        .post('/api/audits')
        .send({ ...validBody, auditType: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualAudit.count.mockResolvedValue(0);
      mockPrisma.qualAudit.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/audits').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/audits/:id', () => {
    it('should return a single audit', async () => {
      mockPrisma.qualAudit.findFirst.mockResolvedValue(mockAudit);

      const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when audit not found', async () => {
      mockPrisma.qualAudit.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualAudit.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/audits/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/audits/:id', () => {
    it('should update an audit', async () => {
      mockPrisma.qualAudit.findFirst.mockResolvedValue(mockAudit);
      const updated = { ...mockAudit, status: 'IN_PROGRESS' };
      mockPrisma.qualAudit.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/audits/00000000-0000-0000-0000-000000000001')
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when audit not found', async () => {
      mockPrisma.qualAudit.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/audits/00000000-0000-0000-0000-000000000099')
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.qualAudit.findFirst.mockResolvedValue(mockAudit);

      const res = await request(app)
        .put('/api/audits/00000000-0000-0000-0000-000000000001')
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualAudit.findFirst.mockResolvedValue(mockAudit);
      mockPrisma.qualAudit.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/audits/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/audits/:id', () => {
    it('should soft delete an audit', async () => {
      mockPrisma.qualAudit.findFirst.mockResolvedValue(mockAudit);
      mockPrisma.qualAudit.update.mockResolvedValue({ ...mockAudit, deletedAt: new Date() });

      const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });

    it('should return 404 when audit not found', async () => {
      mockPrisma.qualAudit.findFirst.mockResolvedValue(null);

      const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualAudit.findFirst.mockResolvedValue(mockAudit);
      mockPrisma.qualAudit.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/audits/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
    });
  });
});
