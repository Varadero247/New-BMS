import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aiHumanReview: {
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

import humanReviewRouter from '../src/routes/human-review';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/human-review', humanReviewRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockReview = {
  id: '00000000-0000-0000-0000-000000000001',
  systemId: 'sys-1',
  title: 'Loan Approval Decision',
  description: 'AI recommends approving loan application #4521',
  aiDecision: 'APPROVE',
  aiConfidence: 0.92,
  aiReasoning: 'Applicant meets all credit criteria with strong income-to-debt ratio',
  status: 'PENDING',
  reviewerUserId: null,
  reviewerName: null,
  decision: null,
  justification: null,
  reviewedAt: null,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  metadata: null,
  organisationId: 'org-1',
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('Human Review Routes', () => {
  describe('GET /api/human-review', () => {
    it('should list reviews', async () => {
      (prisma.aiHumanReview.findMany as jest.Mock).mockResolvedValue([mockReview]);
      (prisma.aiHumanReview.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/human-review');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('should filter by status', async () => {
      (prisma.aiHumanReview.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.aiHumanReview.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get('/api/human-review?status=PENDING');
      expect(res.status).toBe(200);
      expect(prisma.aiHumanReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING', deletedAt: null }),
        })
      );
    });

    it('should filter by systemId', async () => {
      (prisma.aiHumanReview.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.aiHumanReview.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/human-review?systemId=sys-1');
      expect(prisma.aiHumanReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ systemId: 'sys-1' }),
        })
      );
    });

    it('should handle errors', async () => {
      (prisma.aiHumanReview.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/human-review');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/human-review/pending', () => {
    it('should list pending reviews for current user', async () => {
      (prisma.aiHumanReview.findMany as jest.Mock).mockResolvedValue([mockReview]);

      const res = await request(app).get('/api/human-review/pending');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.aiHumanReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PENDING',
            deletedAt: null,
          }),
        })
      );
    });

    it('should handle errors', async () => {
      (prisma.aiHumanReview.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/human-review/pending');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/human-review', () => {
    it('should create a human review', async () => {
      (prisma.aiHumanReview.create as jest.Mock).mockResolvedValue(mockReview);

      const res = await request(app)
        .post('/api/human-review')
        .send({
          systemId: 'sys-1',
          title: 'Loan Approval Decision',
          aiDecision: 'APPROVE',
          aiConfidence: 0.92,
          aiReasoning: 'Meets all criteria',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(prisma.aiHumanReview.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            systemId: 'sys-1',
            title: 'Loan Approval Decision',
            aiDecision: 'APPROVE',
            status: 'PENDING',
          }),
        })
      );
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/api/human-review')
        .send({ systemId: 'sys-1' });

      expect(res.status).toBe(400);
    });

    it('should reject invalid confidence', async () => {
      const res = await request(app)
        .post('/api/human-review')
        .send({
          systemId: 'sys-1',
          title: 'Test',
          aiDecision: 'APPROVE',
          aiConfidence: 1.5,
        });

      expect(res.status).toBe(400);
    });

    it('should handle errors', async () => {
      (prisma.aiHumanReview.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/api/human-review')
        .send({
          systemId: 'sys-1',
          title: 'Test',
          aiDecision: 'APPROVE',
        });

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/human-review/:id/decide', () => {
    it('should approve a review', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
      (prisma.aiHumanReview.update as jest.Mock).mockResolvedValue({
        ...mockReview,
        status: 'APPROVED',
        decision: 'APPROVED',
        justification: 'Verified manually',
      });

      const res = await request(app)
        .put('/api/human-review/00000000-0000-0000-0000-000000000001/decide')
        .send({ decision: 'APPROVED', justification: 'Verified manually' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prisma.aiHumanReview.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'APPROVED',
            decision: 'APPROVED',
            justification: 'Verified manually',
          }),
        })
      );
    });

    it('should reject a review', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
      (prisma.aiHumanReview.update as jest.Mock).mockResolvedValue({
        ...mockReview,
        status: 'REJECTED',
        decision: 'REJECTED',
      });

      const res = await request(app)
        .put('/api/human-review/00000000-0000-0000-0000-000000000001/decide')
        .send({ decision: 'REJECTED', justification: 'Credit check failed' });

      expect(res.status).toBe(200);
    });

    it('should escalate a review', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
      (prisma.aiHumanReview.update as jest.Mock).mockResolvedValue({
        ...mockReview,
        status: 'ESCALATED',
      });

      const res = await request(app)
        .put('/api/human-review/00000000-0000-0000-0000-000000000001/decide')
        .send({ decision: 'ESCALATED', justification: 'Needs senior review' });

      expect(res.status).toBe(200);
    });

    it('should return 404 for missing review', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/human-review/00000000-0000-0000-0000-000000000099/decide')
        .send({ decision: 'APPROVED', justification: 'OK' });

      expect(res.status).toBe(404);
    });

    it('should reject if already decided', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue({
        ...mockReview,
        status: 'APPROVED',
      });

      const res = await request(app)
        .put('/api/human-review/00000000-0000-0000-0000-000000000001/decide')
        .send({ decision: 'REJECTED', justification: 'Too late' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('ALREADY_DECIDED');
    });

    it('should reject expired reviews', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue({
        ...mockReview,
        expiresAt: new Date(Date.now() - 1000),
      });
      (prisma.aiHumanReview.update as jest.Mock).mockResolvedValue({
        ...mockReview,
        status: 'EXPIRED',
      });

      const res = await request(app)
        .put('/api/human-review/00000000-0000-0000-0000-000000000001/decide')
        .send({ decision: 'APPROVED', justification: 'OK' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('EXPIRED');
    });

    it('should reject missing justification', async () => {
      const res = await request(app)
        .put('/api/human-review/00000000-0000-0000-0000-000000000001/decide')
        .send({ decision: 'APPROVED' });

      expect(res.status).toBe(400);
    });

    it('should reject invalid decision', async () => {
      const res = await request(app)
        .put('/api/human-review/00000000-0000-0000-0000-000000000001/decide')
        .send({ decision: 'MAYBE', justification: 'Not sure' });

      expect(res.status).toBe(400);
    });

    it('should handle errors', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/human-review/00000000-0000-0000-0000-000000000001/decide')
        .send({ decision: 'APPROVED', justification: 'OK' });

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/human-review/:id', () => {
    it('should return a single review', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue(mockReview);

      const res = await request(app).get('/api/human-review/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for missing review', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/human-review/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('should handle errors', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/human-review/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/human-review/:id', () => {
    it('should soft delete a review', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
      (prisma.aiHumanReview.update as jest.Mock).mockResolvedValue({
        ...mockReview,
        deletedAt: new Date(),
      });

      const res = await request(app).delete('/api/human-review/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });

    it('should return 404 for missing review', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/human-review/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('should handle errors', async () => {
      (prisma.aiHumanReview.findFirst as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/human-review/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
    });
  });
});
