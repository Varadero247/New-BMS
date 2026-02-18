import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    abDueDiligence: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import dueDiligenceRouter from '../src/routes/due-diligence';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/due-diligence', dueDiligenceRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockDD = {
  id: '00000000-0000-0000-0000-000000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  thirdPartyName: 'Acme Consulting Ltd',
  thirdPartyType: 'CONSULTANT',
  level: 'STANDARD',
  status: 'PENDING',
  country: 'United Kingdom',
  industry: 'Financial Services',
  contactName: 'John Smith',
  contactEmail: 'john@acme.com',
  contractValue: 50000,
  currency: 'USD',
  riskLevel: 'MEDIUM',
  notes: null,
  referenceNumber: 'AB-DD-2602-1234',
  updatedBy: 'user-123',
  findings: null,
  recommendation: null,
  conditions: null,
  completedAt: null,
  completedBy: null,
  scopeOfEngagement: null,
};

const mockDD2 = {
  ...mockDD,
  id: '00000000-0000-0000-0000-000000000002',
  thirdPartyName: 'Global Agents Inc',
  thirdPartyType: 'AGENT',
  riskLevel: 'HIGH',
  referenceNumber: 'AB-DD-2602-5678',
};

describe('ISO 37001 Due Diligence API', () => {
  // =========================================================================
  // GET /api/due-diligence
  // =========================================================================
  describe('GET /api/due-diligence', () => {
    it('should return paginated list of due diligence assessments', async () => {
      (mockPrisma.abDueDiligence.findMany as jest.Mock).mockResolvedValueOnce([mockDD, mockDD2]);
      (mockPrisma.abDueDiligence.count as jest.Mock).mockResolvedValueOnce(2);

      const res = await request(app).get('/api/due-diligence');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(2);
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.abDueDiligence.findMany as jest.Mock).mockResolvedValueOnce([mockDD]);
      (mockPrisma.abDueDiligence.count as jest.Mock).mockResolvedValueOnce(20);

      const res = await request(app).get('/api/due-diligence?page=3&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(3);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.totalPages).toBe(4);
    });

    it('should filter by thirdPartyType', async () => {
      (mockPrisma.abDueDiligence.findMany as jest.Mock).mockResolvedValueOnce([mockDD2]);
      (mockPrisma.abDueDiligence.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/due-diligence?thirdPartyType=AGENT');

      expect(mockPrisma.abDueDiligence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ thirdPartyType: 'AGENT' }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.abDueDiligence.findMany as jest.Mock).mockResolvedValueOnce([mockDD]);
      (mockPrisma.abDueDiligence.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/due-diligence?status=PENDING');

      expect(mockPrisma.abDueDiligence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        })
      );
    });

    it('should filter by riskLevel', async () => {
      (mockPrisma.abDueDiligence.findMany as jest.Mock).mockResolvedValueOnce([mockDD2]);
      (mockPrisma.abDueDiligence.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/due-diligence?riskLevel=HIGH');

      expect(mockPrisma.abDueDiligence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ riskLevel: 'HIGH' }),
        })
      );
    });

    it('should return empty result set', async () => {
      (mockPrisma.abDueDiligence.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abDueDiligence.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/due-diligence');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abDueDiligence.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );
      (mockPrisma.abDueDiligence.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/due-diligence');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /api/due-diligence
  // =========================================================================
  describe('POST /api/due-diligence', () => {
    const validPayload = {
      thirdPartyName: 'Acme Consulting Ltd',
      thirdPartyType: 'CONSULTANT',
      level: 'STANDARD',
      country: 'United Kingdom',
    };

    it('should create a due diligence assessment and return 201', async () => {
      (mockPrisma.abDueDiligence.create as jest.Mock).mockResolvedValueOnce(mockDD);

      const res = await request(app).post('/api/due-diligence').send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.thirdPartyName).toBe('Acme Consulting Ltd');
    });

    it('should return 400 when thirdPartyName is missing', async () => {
      const res = await request(app).post('/api/due-diligence').send({
        thirdPartyType: 'CONSULTANT',
        level: 'STANDARD',
        country: 'UK',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when thirdPartyType is missing', async () => {
      const res = await request(app).post('/api/due-diligence').send({
        thirdPartyName: 'Test Company',
        level: 'STANDARD',
        country: 'UK',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when level is missing', async () => {
      const res = await request(app).post('/api/due-diligence').send({
        thirdPartyName: 'Test Company',
        thirdPartyType: 'CONSULTANT',
        country: 'UK',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when country is missing', async () => {
      const res = await request(app).post('/api/due-diligence').send({
        thirdPartyName: 'Test Company',
        thirdPartyType: 'CONSULTANT',
        level: 'STANDARD',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database create error', async () => {
      (mockPrisma.abDueDiligence.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).post('/api/due-diligence').send(validPayload);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/due-diligence/:id
  // =========================================================================
  describe('GET /api/due-diligence/:id', () => {
    it('should return a due diligence assessment by ID', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(mockDD);

      const res = await request(app).get('/api/due-diligence/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/due-diligence/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/due-diligence/:id
  // =========================================================================
  describe('PUT /api/due-diligence/:id', () => {
    it('should update a due diligence assessment', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(mockDD);
      (mockPrisma.abDueDiligence.update as jest.Mock).mockResolvedValueOnce({
        ...mockDD,
        thirdPartyName: 'Updated Company',
      });

      const res = await request(app)
        .put('/api/due-diligence/00000000-0000-0000-0000-000000000001')
        .send({ thirdPartyName: 'Updated Company' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.thirdPartyName).toBe('Updated Company');
    });

    it('should return 404 when not found for update', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/due-diligence/00000000-0000-0000-0000-000000000099')
        .send({ thirdPartyName: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/due-diligence/:id/complete
  // =========================================================================
  describe('PUT /api/due-diligence/:id/complete', () => {
    it('should complete assessment with findings', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(mockDD);
      (mockPrisma.abDueDiligence.update as jest.Mock).mockResolvedValueOnce({
        ...mockDD,
        status: 'COMPLETED',
        findings: 'No issues found',
        riskLevel: 'LOW',
      });

      const res = await request(app)
        .put('/api/due-diligence/00000000-0000-0000-0000-000000000001/complete')
        .send({ findings: 'No issues found', riskLevel: 'LOW' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(mockPrisma.abDueDiligence.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED' }),
        })
      );
    });

    it('should return 400 when findings is missing', async () => {
      const res = await request(app)
        .put('/api/due-diligence/00000000-0000-0000-0000-000000000001/complete')
        .send({ riskLevel: 'LOW' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when not found for completion', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/due-diligence/00000000-0000-0000-0000-000000000099/complete')
        .send({ findings: 'Test findings', riskLevel: 'LOW' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/due-diligence/:id/expire
  // =========================================================================
  describe('PUT /api/due-diligence/:id/expire', () => {
    it('should set status to EXPIRED', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(mockDD);
      (mockPrisma.abDueDiligence.update as jest.Mock).mockResolvedValueOnce({
        ...mockDD,
        status: 'EXPIRED',
      });

      const res = await request(app).put(
        '/api/due-diligence/00000000-0000-0000-0000-000000000001/expire'
      );

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('EXPIRED');
    });

    it('should return 404 when not found for expiry', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put(
        '/api/due-diligence/00000000-0000-0000-0000-000000000099/expire'
      );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // DELETE /api/due-diligence/:id
  // =========================================================================
  describe('DELETE /api/due-diligence/:id', () => {
    it('should soft delete a due diligence assessment', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(mockDD);
      (mockPrisma.abDueDiligence.update as jest.Mock).mockResolvedValueOnce({
        ...mockDD,
        deletedAt: new Date(),
      });

      const res = await request(app).delete(
        '/api/due-diligence/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found for deletion', async () => {
      (mockPrisma.abDueDiligence.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete(
        '/api/due-diligence/00000000-0000-0000-0000-000000000099'
      );

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
