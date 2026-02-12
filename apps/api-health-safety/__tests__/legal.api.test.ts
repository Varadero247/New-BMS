import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    legalRequirement: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import legalRoutes from '../src/routes/legal';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Health & Safety Legal Requirements API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/legal', legalRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/legal', () => {
    const mockRequirements = [
      {
        id: '14000000-0000-4000-a000-000000000001',
        referenceNumber: 'LR-001',
        title: 'Health and Safety at Work Act',
        description: 'Primary UK H&S legislation',
        category: 'PRIMARY_LEGISLATION',
        complianceStatus: 'COMPLIANT',
        status: 'ACTIVE',
      },
    ];

    it('should return list with pagination', async () => {
      (mockPrisma.legalRequirement.findMany as jest.Mock).mockResolvedValueOnce(mockRequirements);
      (mockPrisma.legalRequirement.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/legal')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('should filter by complianceStatus', async () => {
      (mockPrisma.legalRequirement.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.legalRequirement.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?complianceStatus=NON_COMPLIANT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.legalRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ complianceStatus: 'NON_COMPLIANT' }),
        })
      );
    });

    it('should filter by category', async () => {
      (mockPrisma.legalRequirement.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.legalRequirement.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?category=ACOP')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.legalRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'ACOP' }),
        })
      );
    });

    it('should support search', async () => {
      (mockPrisma.legalRequirement.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.legalRequirement.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?search=COSHH')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.legalRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: { contains: 'COSHH', mode: 'insensitive' } }),
            ]),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.legalRequirement.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/legal')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/legal/:id', () => {
    it('should return single requirement', async () => {
      (mockPrisma.legalRequirement.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '14000000-0000-4000-a000-000000000001',
        referenceNumber: 'LR-001',
        title: 'HASAWA 1974',
      });

      const response = await request(app)
        .get('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('14000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff requirement', async () => {
      (mockPrisma.legalRequirement.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/legal/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/legal', () => {
    const createPayload = {
      title: 'COSHH Regulations 2002',
      description: 'Control of Substances Hazardous to Health',
      category: 'SUBORDINATE_LEGISLATION',
      jurisdiction: 'England & Wales',
    };

    it('should create requirement with auto ref#', async () => {
      (mockPrisma.legalRequirement.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.legalRequirement.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'LR-001',
        ...createPayload,
        complianceStatus: 'NOT_ASSESSED',
        status: 'ACTIVE',
      });

      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.legalRequirement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: 'LR-001',
          complianceStatus: 'NOT_ASSESSED',
          status: 'ACTIVE',
        }),
      });
    });

    it('should increment ref# from last record', async () => {
      (mockPrisma.legalRequirement.findFirst as jest.Mock).mockResolvedValueOnce({
        referenceNumber: 'LR-005',
      });
      (mockPrisma.legalRequirement.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'LR-006',
      });

      await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.legalRequirement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ referenceNumber: 'LR-006' }),
      });
    });

    it('should default complianceStatus to NOT_ASSESSED', async () => {
      (mockPrisma.legalRequirement.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.legalRequirement.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        complianceStatus: 'NOT_ASSESSED',
      });

      await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.legalRequirement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ complianceStatus: 'NOT_ASSESSED' }),
      });
    });

    it('should accept AI fields', async () => {
      (mockPrisma.legalRequirement.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.legalRequirement.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        aiAssessmentGenerated: true,
      });

      await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send({
          ...createPayload,
          aiKeyObligations: 'Risk assessments required',
          aiAssessmentGenerated: true,
        });

      expect(mockPrisma.legalRequirement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          aiKeyObligations: 'Risk assessments required',
          aiAssessmentGenerated: true,
        }),
      });
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send({ description: 'Some desc', category: 'ACOP' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, category: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.legalRequirement.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.legalRequirement.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PATCH /api/legal/:id', () => {
    const existing = {
      id: '14000000-0000-4000-a000-000000000001',
      complianceStatus: 'NOT_ASSESSED',
    };

    it('should update requirement', async () => {
      (mockPrisma.legalRequirement.findUnique as jest.Mock).mockResolvedValueOnce(existing);
      (mockPrisma.legalRequirement.update as jest.Mock).mockResolvedValueOnce({
        ...existing,
        title: 'Updated',
      });

      const response = await request(app)
        .patch('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should auto-set lastReviewedAt when complianceStatus changes', async () => {
      (mockPrisma.legalRequirement.findUnique as jest.Mock).mockResolvedValueOnce(existing);
      (mockPrisma.legalRequirement.update as jest.Mock).mockResolvedValueOnce({
        ...existing,
        complianceStatus: 'COMPLIANT',
        lastReviewedAt: new Date(),
      });

      await request(app)
        .patch('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });

      expect(mockPrisma.legalRequirement.update).toHaveBeenCalledWith({
        where: { id: '14000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          lastReviewedAt: expect.any(Date),
        }),
      });
    });

    it('should NOT set lastReviewedAt when complianceStatus unchanged', async () => {
      (mockPrisma.legalRequirement.findUnique as jest.Mock).mockResolvedValueOnce(existing);
      (mockPrisma.legalRequirement.update as jest.Mock).mockResolvedValueOnce({
        ...existing,
        title: 'Just title change',
      });

      await request(app)
        .patch('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'NOT_ASSESSED' });

      const updateCall = (mockPrisma.legalRequirement.update as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.lastReviewedAt).toBeUndefined();
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff requirement', async () => {
      (mockPrisma.legalRequirement.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/legal/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/legal/:id', () => {
    it('should delete requirement', async () => {
      (mockPrisma.legalRequirement.findUnique as jest.Mock).mockResolvedValueOnce({ id: '14000000-0000-4000-a000-000000000001' });
      (mockPrisma.legalRequirement.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff requirement', async () => {
      (mockPrisma.legalRequirement.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/legal/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });
});
