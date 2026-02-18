import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualRelease: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

import { prisma } from '../src/prisma';
import releasesRouter from '../src/routes/releases';

const app = express();
app.use(express.json());
app.use('/api/releases', releasesRouter);

const mockRelease = {
  id: '00000000-0000-0000-0000-000000000001',
  referenceNumber: 'REL-2026-001',
  productName: 'Widget Assembly A',
  batchNumber: 'BATCH-2026-0042',
  decision: 'ON_HOLD',
  releaseDate: null,
  authorisedBy: null,
  authorisedAt: null,
  organisationId: 'org-1',
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

describe('Releases Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/releases', () => {
    it('should return a list of releases', async () => {
      (prisma.qualRelease.findMany as jest.Mock).mockResolvedValue([mockRelease]);
      (prisma.qualRelease.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/releases');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].productName).toBe('Widget Assembly A');
    });

    it('should filter by decision', async () => {
      (prisma.qualRelease.findMany as jest.Mock).mockResolvedValue([mockRelease]);
      (prisma.qualRelease.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/releases?decision=ON_HOLD');
      expect(res.status).toBe(200);
      expect(prisma.qualRelease.findMany).toHaveBeenCalled();
    });

    it('should support pagination', async () => {
      (prisma.qualRelease.findMany as jest.Mock).mockResolvedValue([mockRelease]);
      (prisma.qualRelease.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/releases?page=1&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle errors', async () => {
      (prisma.qualRelease.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/releases');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/releases', () => {
    it('should create a release', async () => {
      (prisma.qualRelease.count as jest.Mock).mockResolvedValue(0);
      (prisma.qualRelease.create as jest.Mock).mockResolvedValue(mockRelease);

      const res = await request(app).post('/api/releases').send({
        productName: 'Widget Assembly A',
        batchNumber: 'BATCH-2026-0042',
        decision: 'ON_HOLD',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.batchNumber).toBe('BATCH-2026-0042');
    });

    it('should validate required fields', async () => {
      const res = await request(app).post('/api/releases').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should handle creation errors', async () => {
      (prisma.qualRelease.count as jest.Mock).mockResolvedValue(0);
      (prisma.qualRelease.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/releases').send({
        productName: 'Widget Assembly A',
        batchNumber: 'BATCH-2026-0042',
        decision: 'ON_HOLD',
      });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/releases/:id', () => {
    it('should return a release by id', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(mockRelease);

      const res = await request(app).get('/api/releases/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.decision).toBe('ON_HOLD');
    });

    it('should return 404 if not found', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/releases/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle errors', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/releases/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/releases/:id', () => {
    it('should update a release', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(mockRelease);
      (prisma.qualRelease.update as jest.Mock).mockResolvedValue({
        ...mockRelease,
        decision: 'APPROVED',
      });

      const res = await request(app)
        .put('/api/releases/00000000-0000-0000-0000-000000000001')
        .send({
          decision: 'APPROVED',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.decision).toBe('APPROVED');
    });

    it('should return 404 if not found', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/releases/00000000-0000-0000-0000-000000000099')
        .send({
          decision: 'APPROVED',
        });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle update errors', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(mockRelease);
      (prisma.qualRelease.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/releases/00000000-0000-0000-0000-000000000001')
        .send({
          decision: 'APPROVED',
        });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/releases/:id/authorise', () => {
    it('should authorise a release', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(mockRelease);
      (prisma.qualRelease.update as jest.Mock).mockResolvedValue({
        ...mockRelease,
        decision: 'APPROVED',
        authorisedBy: 'user-123',
        authorisedAt: '2026-02-13T00:00:00.000Z',
      });

      const res = await request(app)
        .put('/api/releases/00000000-0000-0000-0000-000000000001/authorise')
        .send({
          decision: 'APPROVED',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.authorisedBy).toBe('user-123');
    });

    it('should return 404 if release not found for authorise', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/releases/00000000-0000-0000-0000-000000000099/authorise')
        .send({
          decision: 'APPROVED',
        });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle authorise errors', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(mockRelease);
      (prisma.qualRelease.update as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/releases/00000000-0000-0000-0000-000000000001/authorise')
        .send({
          decision: 'APPROVED',
        });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/releases/:id', () => {
    it('should soft delete a release', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(mockRelease);
      (prisma.qualRelease.update as jest.Mock).mockResolvedValue({
        ...mockRelease,
        deletedAt: new Date().toISOString(),
      });

      const res = await request(app).delete('/api/releases/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.qualRelease.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
      );
    });

    it('should return 404 if not found', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/releases/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should handle delete errors', async () => {
      (prisma.qualRelease.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/releases/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
