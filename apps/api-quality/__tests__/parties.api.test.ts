import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualInterestedParty: {
      findMany: jest.fn(),
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
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '../src/prisma';
import partiesRoutes from '../src/routes/parties';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Quality Interested Parties API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/parties', partiesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/parties', () => {
    const mockParties = [
      {
        id: 'party-1',
        referenceNumber: 'QMS-PTY-2026-001',
        partyName: 'Acme Corp',
        partyType: 'EXTERNAL',
        reasonForInclusion: 'Key customer',
        status: 'ACTIVE',
        _count: { issues: 2 },
      },
      {
        id: 'party-2',
        referenceNumber: 'QMS-PTY-2026-002',
        partyName: 'Internal Team',
        partyType: 'INTERNAL',
        reasonForInclusion: 'Core department',
        status: 'ACTIVE',
        _count: { issues: 0 },
      },
    ];

    it('should return list of interested parties with pagination', async () => {
      (mockPrisma.qualInterestedParty.findMany as jest.Mock).mockResolvedValueOnce(mockParties);
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/parties')
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
      (mockPrisma.qualInterestedParty.findMany as jest.Mock).mockResolvedValueOnce([mockParties[0]]);
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/parties?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(10);
    });

    it('should filter by partyType', async () => {
      (mockPrisma.qualInterestedParty.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/parties?partyType=EXTERNAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualInterestedParty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            partyType: 'EXTERNAL',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.qualInterestedParty.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/parties?status=ACTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualInterestedParty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should filter by search on partyName', async () => {
      (mockPrisma.qualInterestedParty.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/parties?search=Acme')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualInterestedParty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            partyName: { contains: 'Acme', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.qualInterestedParty.findMany as jest.Mock).mockResolvedValueOnce(mockParties);
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/parties')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualInterestedParty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should include issue count', async () => {
      (mockPrisma.qualInterestedParty.findMany as jest.Mock).mockResolvedValueOnce(mockParties);
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/parties')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualInterestedParty.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { _count: { select: { issues: true } } },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualInterestedParty.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/parties')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/parties/:id', () => {
    const mockParty = {
      id: 'party-1',
      referenceNumber: 'QMS-PTY-2026-001',
      partyName: 'Acme Corp',
      partyType: 'EXTERNAL',
      reasonForInclusion: 'Key customer',
      status: 'ACTIVE',
      issues: [],
    };

    it('should return a single interested party', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(mockParty);

      const response = await request(app)
        .get('/api/parties/party-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('party-1');
    });

    it('should include issues in single party response', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(mockParty);

      await request(app)
        .get('/api/parties/party-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualInterestedParty.findUnique).toHaveBeenCalledWith({
        where: { id: 'party-1' },
        include: { issues: { orderBy: { createdAt: 'desc' } } },
      });
    });

    it('should return 404 for non-existent party', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/parties/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/parties/party-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/parties', () => {
    const createPayload = {
      partyName: 'New Partner',
      partyType: 'EXTERNAL',
      reasonForInclusion: 'Strategic partnership',
    };

    it('should create an interested party successfully', async () => {
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualInterestedParty.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        referenceNumber: 'QMS-PTY-2026-001',
        ...createPayload,
        status: 'ACTIVE',
        reviewFrequency: 'ANNUALLY',
      });

      const response = await request(app)
        .post('/api/parties')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.partyName).toBe('New Partner');
    });

    it('should generate a reference number on create', async () => {
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.qualInterestedParty.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        referenceNumber: 'QMS-PTY-2026-006',
        ...createPayload,
      });

      await request(app)
        .post('/api/parties')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualInterestedParty.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringContaining('QMS-PTY-'),
        }),
      });
    });

    it('should return 400 for missing partyName', async () => {
      const response = await request(app)
        .post('/api/parties')
        .set('Authorization', 'Bearer token')
        .send({ partyType: 'EXTERNAL', reasonForInclusion: 'Reason' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing partyType', async () => {
      const response = await request(app)
        .post('/api/parties')
        .set('Authorization', 'Bearer token')
        .send({ partyName: 'Name', reasonForInclusion: 'Reason' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing reasonForInclusion', async () => {
      const response = await request(app)
        .post('/api/parties')
        .set('Authorization', 'Bearer token')
        .send({ partyName: 'Name', partyType: 'INTERNAL' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid partyType enum', async () => {
      const response = await request(app)
        .post('/api/parties')
        .set('Authorization', 'Bearer token')
        .send({ partyName: 'Name', partyType: 'INVALID', reasonForInclusion: 'Reason' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualInterestedParty.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualInterestedParty.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/parties')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/parties/:id', () => {
    const existingParty = {
      id: 'party-1',
      partyName: 'Existing Partner',
      partyType: 'EXTERNAL',
      reasonForInclusion: 'Key customer',
      status: 'ACTIVE',
    };

    it('should update an interested party successfully', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(existingParty);
      (mockPrisma.qualInterestedParty.update as jest.Mock).mockResolvedValueOnce({
        ...existingParty,
        partyName: 'Updated Partner',
      });

      const response = await request(app)
        .put('/api/parties/party-1')
        .set('Authorization', 'Bearer token')
        .send({ partyName: 'Updated Partner' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent party', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/parties/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ partyName: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status value', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(existingParty);

      const response = await request(app)
        .put('/api/parties/party-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid reviewFrequency', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(existingParty);

      const response = await request(app)
        .put('/api/parties/party-1')
        .set('Authorization', 'Bearer token')
        .send({ reviewFrequency: 'WEEKLY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/parties/party-1')
        .set('Authorization', 'Bearer token')
        .send({ partyName: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/parties/:id', () => {
    it('should delete an interested party successfully', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'party-1' });
      (mockPrisma.qualInterestedParty.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/parties/party-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualInterestedParty.delete).toHaveBeenCalledWith({
        where: { id: 'party-1' },
      });
    });

    it('should return 404 for non-existent party', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/parties/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualInterestedParty.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/parties/party-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
