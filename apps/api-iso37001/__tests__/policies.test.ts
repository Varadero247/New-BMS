import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    abPolicy: {
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

import policiesRouter from '../src/routes/policies';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/policies', policiesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockPolicy = {
  id: '00000000-0000-0000-0000-000000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  title: 'Anti-Bribery Policy',
  content: 'This policy establishes the framework for anti-bribery compliance.',
  description: 'Core anti-bribery policy document',
  version: '1.0',
  status: 'DRAFT',
  policyType: 'ANTI_BRIBERY_POLICY',
  approvedBy: null,
  approvedAt: null,
  effectiveDate: null,
  reviewDate: null,
  referenceNumber: 'AB-POL-2602-1234',
  updatedBy: 'user-123',
};

const mockPolicy2 = {
  ...mockPolicy,
  id: '00000000-0000-0000-0000-000000000002',
  title: 'Gifts & Hospitality Policy',
  policyType: 'GIFTS_HOSPITALITY_POLICY',
  referenceNumber: 'AB-POL-2602-5678',
};

describe('ISO 37001 Policies API', () => {
  // =========================================================================
  // GET /api/policies
  // =========================================================================
  describe('GET /api/policies', () => {
    it('should return paginated list of policies', async () => {
      (mockPrisma.abPolicy.findMany as jest.Mock).mockResolvedValueOnce([mockPolicy, mockPolicy2]);
      (mockPrisma.abPolicy.count as jest.Mock).mockResolvedValueOnce(2);

      const res = await request(app).get('/api/policies');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(2);
    });

    it('should support page and limit parameters', async () => {
      (mockPrisma.abPolicy.findMany as jest.Mock).mockResolvedValueOnce([mockPolicy]);
      (mockPrisma.abPolicy.count as jest.Mock).mockResolvedValueOnce(10);

      const res = await request(app).get('/api/policies?page=2&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should filter by status', async () => {
      (mockPrisma.abPolicy.findMany as jest.Mock).mockResolvedValueOnce([mockPolicy]);
      (mockPrisma.abPolicy.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/policies?status=DRAFT');

      expect(mockPrisma.abPolicy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DRAFT' }),
        })
      );
    });

    it('should filter by policyType', async () => {
      (mockPrisma.abPolicy.findMany as jest.Mock).mockResolvedValueOnce([mockPolicy]);
      (mockPrisma.abPolicy.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/policies?policyType=ANTI_BRIBERY_POLICY');

      expect(mockPrisma.abPolicy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ policyType: 'ANTI_BRIBERY_POLICY' }),
        })
      );
    });

    it('should return empty array when no policies exist', async () => {
      (mockPrisma.abPolicy.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.abPolicy.count as jest.Mock).mockResolvedValueOnce(0);

      const res = await request(app).get('/api/policies');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should filter with search query', async () => {
      (mockPrisma.abPolicy.findMany as jest.Mock).mockResolvedValueOnce([mockPolicy]);
      (mockPrisma.abPolicy.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/policies?search=anti-bribery');

      expect(mockPrisma.abPolicy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: expect.objectContaining({ contains: 'anti-bribery' }) }),
            ]),
          }),
        })
      );
    });

    it('should return 500 when database error occurs', async () => {
      (mockPrisma.abPolicy.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      (mockPrisma.abPolicy.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/policies');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // POST /api/policies
  // =========================================================================
  describe('POST /api/policies', () => {
    it('should create a policy and return 201', async () => {
      (mockPrisma.abPolicy.create as jest.Mock).mockResolvedValueOnce(mockPolicy);

      const res = await request(app).post('/api/policies').send({
        title: 'Anti-Bribery Policy',
        content: 'This policy establishes the framework for anti-bribery compliance.',
        policyType: 'ANTI_BRIBERY_POLICY',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Anti-Bribery Policy');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app).post('/api/policies').send({
        content: 'Some content',
        policyType: 'ANTI_BRIBERY_POLICY',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when content is missing', async () => {
      const res = await request(app).post('/api/policies').send({
        title: 'Anti-Bribery Policy',
        policyType: 'ANTI_BRIBERY_POLICY',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when policyType is missing', async () => {
      const res = await request(app).post('/api/policies').send({
        title: 'Anti-Bribery Policy',
        content: 'Some content',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 when database create fails', async () => {
      (mockPrisma.abPolicy.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).post('/api/policies').send({
        title: 'Anti-Bribery Policy',
        content: 'Some content',
        policyType: 'ANTI_BRIBERY_POLICY',
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // GET /api/policies/:id
  // =========================================================================
  describe('GET /api/policies/:id', () => {
    it('should return a policy by ID', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockResolvedValueOnce(mockPolicy);

      const res = await request(app).get('/api/policies/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when policy not found', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).get('/api/policies/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app).get('/api/policies/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/policies/:id
  // =========================================================================
  describe('PUT /api/policies/:id', () => {
    it('should update a policy', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockResolvedValueOnce(mockPolicy);
      (mockPrisma.abPolicy.update as jest.Mock).mockResolvedValueOnce({ ...mockPolicy, title: 'Updated Title' });

      const res = await request(app)
        .put('/api/policies/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Title');
    });

    it('should return 404 when policy not found for update', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/policies/00000000-0000-0000-0000-000000000099')
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 500 on database update error', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockResolvedValueOnce(mockPolicy);
      (mockPrisma.abPolicy.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/policies/00000000-0000-0000-0000-000000000001')
        .send({ title: 'Updated' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // PUT /api/policies/:id/approve
  // =========================================================================
  describe('PUT /api/policies/:id/approve', () => {
    it('should approve a policy and set status to APPROVED', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockResolvedValueOnce(mockPolicy);
      (mockPrisma.abPolicy.update as jest.Mock).mockResolvedValueOnce({
        ...mockPolicy,
        status: 'APPROVED',
        approvedBy: 'user-123',
        approvedAt: new Date(),
      });

      const res = await request(app).put('/api/policies/00000000-0000-0000-0000-000000000001/approve');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('APPROVED');
      expect(res.body.data.approvedBy).toBe('user-123');
      expect(res.body.data.approvedAt).toBeDefined();
      expect(mockPrisma.abPolicy.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'APPROVED',
            approvedBy: 'user-123',
          }),
        })
      );
    });

    it('should return 404 when policy not found for approval', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).put('/api/policies/00000000-0000-0000-0000-000000000099/approve');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // DELETE /api/policies/:id
  // =========================================================================
  describe('DELETE /api/policies/:id', () => {
    it('should soft delete a policy', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockResolvedValueOnce(mockPolicy);
      (mockPrisma.abPolicy.update as jest.Mock).mockResolvedValueOnce({ ...mockPolicy, deletedAt: new Date() });

      const res = await request(app).delete('/api/policies/00000000-0000-0000-0000-000000000001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.abPolicy.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should return 404 when policy not found for deletion', async () => {
      (mockPrisma.abPolicy.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app).delete('/api/policies/00000000-0000-0000-0000-000000000099');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
