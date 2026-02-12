import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualIssue: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    qualInterestedParty: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import issuesRoutes from '../src/routes/issues';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Quality Issues API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/issues', issuesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/issues', () => {
    const mockIssues = [
      {
        id: '22000000-0000-4000-a000-000000000001',
        referenceNumber: 'QMS-ISS-2026-001',
        issueOfConcern: 'Supply chain disruption',
        bias: 'RISK',
        priority: 'HIGH',
        status: 'OPEN',
        treatmentMethod: 'Diversify suppliers',
        party: { id: 'p1', partyName: 'Supplier A', partyType: 'EXTERNAL', referenceNumber: 'QMS-PTY-2026-001' },
      },
      {
        id: 'issue-2',
        referenceNumber: 'QMS-ISS-2026-002',
        issueOfConcern: 'Market expansion potential',
        bias: 'OPPORTUNITY',
        priority: 'MEDIUM',
        status: 'UNDER_REVIEW',
        treatmentMethod: 'Pursue new markets',
        party: null,
      },
    ];

    it('should return list of issues with pagination', async () => {
      (mockPrisma.qualIssue.findMany as jest.Mock).mockResolvedValueOnce(mockIssues);
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/issues')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.qualIssue.findMany as jest.Mock).mockResolvedValueOnce([mockIssues[0]]);
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/issues?page=3&limit=5')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(3);
      expect(response.body.data.limit).toBe(5);
      expect(response.body.data.totalPages).toBe(10);
    });

    it('should filter by bias', async () => {
      (mockPrisma.qualIssue.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/issues?bias=RISK')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualIssue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            bias: 'RISK',
          }),
        })
      );
    });

    it('should filter by priority', async () => {
      (mockPrisma.qualIssue.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/issues?priority=HIGH')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualIssue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priority: 'HIGH',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.qualIssue.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/issues?status=OPEN')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualIssue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'OPEN',
          }),
        })
      );
    });

    it('should filter by search on issueOfConcern', async () => {
      (mockPrisma.qualIssue.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/issues?search=supply')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualIssue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            issueOfConcern: { contains: 'supply', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.qualIssue.findMany as jest.Mock).mockResolvedValueOnce(mockIssues);
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/issues')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualIssue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should include party relation in list', async () => {
      (mockPrisma.qualIssue.findMany as jest.Mock).mockResolvedValueOnce(mockIssues);
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/issues')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualIssue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            party: { select: { id: true, partyName: true, partyType: true, referenceNumber: true } },
          },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualIssue.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/issues')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/issues/:id', () => {
    const mockIssue = {
      id: '22000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-ISS-2026-001',
      issueOfConcern: 'Supply chain disruption',
      bias: 'RISK',
      priority: 'HIGH',
      status: 'OPEN',
      party: null,
    };

    it('should return a single issue', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockResolvedValueOnce(mockIssue);

      const response = await request(app)
        .get('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('22000000-0000-4000-a000-000000000001');
    });

    it('should include party in single issue response', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockResolvedValueOnce(mockIssue);

      await request(app)
        .get('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualIssue.findUnique).toHaveBeenCalledWith({
        where: { id: '22000000-0000-4000-a000-000000000001' },
        include: { party: true },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff issue', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/issues/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/issues', () => {
    const createPayload = {
      issueOfConcern: 'New quality issue',
      bias: 'RISK',
      treatmentMethod: 'Mitigation plan',
    };

    it('should create an issue successfully', async () => {
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualIssue.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-ISS-2026-001',
        ...createPayload,
        priority: 'MEDIUM',
        status: 'OPEN',
        party: null,
      });

      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.issueOfConcern).toBe('New quality issue');
    });

    it('should create an issue with a valid partyId', async () => {
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce({ id: '24000000-0000-4000-a000-000000000001', partyName: 'Valid Party' });
      (mockPrisma.qualIssue.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-ISS-2026-001',
        ...createPayload,
        partyId: '24000000-0000-4000-a000-000000000001',
        party: { id: '24000000-0000-4000-a000-000000000001', partyName: 'Valid Party' },
      });

      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, partyId: '24000000-0000-4000-a000-000000000001' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid partyId reference', async () => {
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, partyId: 'invalid-party' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing issueOfConcern', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send({ bias: 'RISK', treatmentMethod: 'Plan' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing bias', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send({ issueOfConcern: 'Issue', treatmentMethod: 'Plan' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing treatmentMethod', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send({ issueOfConcern: 'Issue', bias: 'RISK' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid bias enum', async () => {
      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send({ issueOfConcern: 'Issue', bias: 'INVALID', treatmentMethod: 'Plan' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualIssue.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualIssue.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/issues')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/issues/:id', () => {
    const existingIssue = {
      id: '22000000-0000-4000-a000-000000000001',
      issueOfConcern: 'Existing issue',
      bias: 'RISK',
      priority: 'MEDIUM',
      status: 'OPEN',
    };

    it('should update an issue successfully', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockResolvedValueOnce(existingIssue);
      (mockPrisma.qualIssue.update as jest.Mock).mockResolvedValueOnce({
        ...existingIssue,
        priority: 'HIGH',
        party: null,
      });

      const response = await request(app)
        .put('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ priority: 'HIGH' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff issue', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/issues/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ priority: 'HIGH' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockResolvedValueOnce(existingIssue);

      const response = await request(app)
        .put('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate partyId on update', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockResolvedValueOnce(existingIssue);
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ partyId: 'invalid-party' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ priority: 'HIGH' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/issues/:id', () => {
    it('should delete an issue successfully', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockResolvedValueOnce({ id: '22000000-0000-4000-a000-000000000001' });
      (mockPrisma.qualIssue.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualIssue.delete).toHaveBeenCalledWith({
        where: { id: '22000000-0000-4000-a000-000000000001' },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff issue', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/issues/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualIssue.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/issues/22000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
