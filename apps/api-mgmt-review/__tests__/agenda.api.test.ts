import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mgmtReview: {
      findFirst: jest.fn(),
      update: jest.fn(),
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

import router from '../src/routes/agenda';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/agenda', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/agenda/:id/generate', () => {
  const reviewId = '00000000-0000-0000-0000-000000000001';
  const mockReview = {
    id: reviewId,
    title: 'Q1 Management Review',
    deletedAt: null,
  };

  it('should generate an agenda for a valid review', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({
      ...mockReview,
      aiGeneratedAgenda: '{}',
    });

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('items');
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(14);
    expect(res.body.data).toHaveProperty('generatedAt');
    expect(prisma.mgmtReview.findFirst as jest.Mock).toHaveBeenCalledWith({
      where: { id: reviewId, orgId: 'org-1', deletedAt: null },
    });
    expect(prisma.mgmtReview.update as jest.Mock).toHaveBeenCalled();
  });

  it('should return 404 when review is not found', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Review not found');
    expect(prisma.mgmtReview.update as jest.Mock).not.toHaveBeenCalled();
  });

  it('should return 500 when findFirst throws an error', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('Failed to generate resource');
  });

  it('should return 500 when update throws an error', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockRejectedValue(
      new Error('Update failed')
    );

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('Failed to generate resource');
  });

  it('should include the review title in the generated agenda title', async () => {
    const reviewWithCustomTitle = { ...mockReview, title: 'Annual Review 2026' };
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(reviewWithCustomTitle);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toContain('Annual Review 2026');
  });

  it('should save the agenda as JSON string via update', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    await request(app).post(`/api/agenda/${reviewId}/generate`);

    const updateCall = (prisma.mgmtReview.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.where.id).toBe(reviewId);
    expect(typeof updateCall.data.aiGeneratedAgenda).toBe('string');
    const parsed = JSON.parse(updateCall.data.aiGeneratedAgenda);
    expect(parsed).toHaveProperty('items');
  });
});
