import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    isControl: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/controls';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/controls', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('InfoSec Controls API', () => {
  const mockControl = {
    id: 'ctrl-1',
    controlId: 'A.5.1',
    domain: 'ORGANISATIONAL',
    title: 'Policies for information security',
    description: 'A set of policies for information security shall be defined',
    applicability: 'APPLICABLE',
    justification: 'Required for ISMS',
    implementationStatus: 'FULLY_IMPLEMENTED',
    implementationNotes: 'Policy document approved',
    evidence: 'Policy_v3.pdf',
    owner: 'CISO',
    reviewDate: null,
    lastReviewedAt: null,
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  const mockControl2 = {
    ...mockControl,
    id: 'ctrl-2',
    controlId: 'A.5.2',
    title: 'Information security roles and responsibilities',
    implementationStatus: 'PARTIALLY_IMPLEMENTED',
  };

  // ---- GET /api/controls ----

  describe('GET /api/controls', () => {
    it('should return all controls with pagination', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([mockControl, mockControl2]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(2);

      const res = await request(app).get('/api/controls');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    it('should filter by domain', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([mockControl]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/controls?domain=ORGANISATIONAL');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.domain).toBe('ORGANISATIONAL');
    });

    it('should filter by implementationStatus', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/controls?implementationStatus=NOT_IMPLEMENTED');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.implementationStatus).toBe('NOT_IMPLEMENTED');
    });

    it('should support search across title and controlId', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/controls?search=policy');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.where.OR).toBeDefined();
    });

    it('should order by controlId ascending', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/controls');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.orderBy).toEqual({ controlId: 'asc' });
    });

    it('should default to limit 50 and page 1', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.isControl.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/controls');

      const findCall = (mockPrisma.isControl.findMany as jest.Mock).mock.calls[0][0];
      expect(findCall.skip).toBe(0);
      expect(findCall.take).toBe(50);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/controls');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/controls/soa ----

  describe('GET /api/controls/soa', () => {
    it('should return Statement of Applicability', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([mockControl, mockControl2]);

      const res = await request(app).get('/api/controls/soa');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.controls).toBeDefined();
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.total).toBe(2);
    });

    it('should calculate summary counts correctly', async () => {
      const notApplicable = { ...mockControl, id: 'ctrl-3', applicability: 'NOT_APPLICABLE', implementationStatus: 'NOT_APPLICABLE' };
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([mockControl, notApplicable]);

      const res = await request(app).get('/api/controls/soa');

      expect(res.body.data.summary.applicable).toBe(1);
      expect(res.body.data.summary.notApplicable).toBe(1);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/controls/soa');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- GET /api/controls/soa/pdf ----

  describe('GET /api/controls/soa/pdf', () => {
    it('should return PDF mock data', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([mockControl]);

      const res = await request(app).get('/api/controls/soa/pdf');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.format).toBe('pdf');
      expect(res.body.data.controlCount).toBe(1);
    });

    it('should include generatedAt timestamp', async () => {
      (mockPrisma.isControl.findMany as jest.Mock).mockResolvedValueOnce([]);

      const res = await request(app).get('/api/controls/soa/pdf');

      expect(res.body.data.generatedAt).toBeDefined();
    });
  });

  // ---- GET /api/controls/:id ----

  describe('GET /api/controls/:id', () => {
    it('should return control detail', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);

      const res = await request(app).get('/api/controls/ctrl-1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.controlId).toBe('A.5.1');
    });

    it('should return 404 when control not found', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/controls/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/controls/ctrl-1');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- PUT /api/controls/:id/status ----

  describe('PUT /api/controls/:id/status', () => {
    it('should update applicability to APPLICABLE', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce({ ...mockControl, applicability: 'APPLICABLE' });

      const res = await request(app)
        .put('/api/controls/ctrl-1/status')
        .send({ applicability: 'APPLICABLE', justification: 'Required' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should update applicability to NOT_APPLICABLE with justification', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce({
        ...mockControl,
        applicability: 'NOT_APPLICABLE',
        justification: 'Not relevant to scope',
      });

      const res = await request(app)
        .put('/api/controls/ctrl-1/status')
        .send({ applicability: 'NOT_APPLICABLE', justification: 'Not relevant to scope' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for invalid applicability value', async () => {
      const res = await request(app)
        .put('/api/controls/ctrl-1/status')
        .send({ applicability: 'MAYBE', justification: 'test' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when justification is missing', async () => {
      const res = await request(app)
        .put('/api/controls/ctrl-1/status')
        .send({ applicability: 'APPLICABLE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when control not found', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/controls/nonexistent/status')
        .send({ applicability: 'APPLICABLE', justification: 'Required' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/controls/ctrl-1/status')
        .send({ applicability: 'APPLICABLE', justification: 'Required' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // ---- PUT /api/controls/:id/implementation ----

  describe('PUT /api/controls/:id/implementation', () => {
    it('should update implementation status', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce({
        ...mockControl,
        implementationStatus: 'FULLY_IMPLEMENTED',
      });

      const res = await request(app)
        .put('/api/controls/ctrl-1/implementation')
        .send({ implementationStatus: 'FULLY_IMPLEMENTED', evidence: 'Evidence.pdf' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when control not found', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/controls/nonexistent/implementation')
        .send({ implementationStatus: 'NOT_IMPLEMENTED' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid implementationStatus', async () => {
      const res = await request(app)
        .put('/api/controls/ctrl-1/implementation')
        .send({ implementationStatus: 'SORT_OF_DONE' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should accept optional fields like evidence, owner, reviewDate', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce(mockControl);

      const res = await request(app)
        .put('/api/controls/ctrl-1/implementation')
        .send({
          implementationStatus: 'PARTIALLY_IMPLEMENTED',
          implementationNotes: 'In progress',
          evidence: 'Doc.pdf',
          owner: 'IT Team',
          reviewDate: '2026-06-01',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should set updatedBy from authenticated user', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockResolvedValueOnce(mockControl);

      await request(app)
        .put('/api/controls/ctrl-1/implementation')
        .send({ implementationStatus: 'FULLY_IMPLEMENTED' });

      const updateCall = (mockPrisma.isControl.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.updatedBy).toBe('user-123');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.isControl.findUnique as jest.Mock).mockResolvedValueOnce(mockControl);
      (mockPrisma.isControl.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/controls/ctrl-1/implementation')
        .send({ implementationStatus: 'FULLY_IMPLEMENTED' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
