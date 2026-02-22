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
    (prisma.mgmtReview.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

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

  it('findFirst called once per generate request', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(prisma.mgmtReview.findFirst).toHaveBeenCalledTimes(1);
  });

  it('generated agenda items are defined and non-empty', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    for (const item of res.body.data.items) {
      expect(item).toBeDefined();
    }
  });

  it('generatedAt is a string in the response', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(200);
    expect(typeof res.body.data.generatedAt).toBe('string');
  });
});

describe('Agenda — extended', () => {
  const reviewId = '00000000-0000-0000-0000-000000000001';
  const mockReview = { id: reviewId, title: 'Q2 Management Review', deletedAt: null };

  it('update is called once on successful generate', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(prisma.mgmtReview.update).toHaveBeenCalledTimes(1);
  });

  it('data.title contains the review title string', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue({ ...mockReview, title: 'Special Review' });
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toContain('Special Review');
  });

  it('data.items has at least 14 agenda items', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(14);
  });
});

describe('Agenda — extra', () => {
  const reviewId = '00000000-0000-0000-0000-000000000001';
  const mockReview = { id: reviewId, title: 'Q3 Management Review', deletedAt: null };

  it('success is true on 200 response', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('error code is NOT_FOUND when review does not exist', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('update where clause contains correct reviewId', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    await request(app).post(`/api/agenda/${reviewId}/generate`);
    const updateCall = (prisma.mgmtReview.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.where.id).toBe(reviewId);
  });
});

describe('Agenda — additional coverage', () => {
  const reviewId = '00000000-0000-0000-0000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('customItems are appended after base agenda items', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue({
      id: reviewId,
      title: 'Q4 Review',
      deletedAt: null,
    });
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/agenda/${reviewId}/generate`)
      .send({ customItems: ['Sustainability review'] });

    expect(res.status).toBe(200);
    const items: string[] = res.body.data.items;
    const customFound = items.some((item) => item.includes('Sustainability review'));
    expect(customFound).toBe(true);
  });

  it('returns 400 when customItems contains a non-string element', async () => {
    const res = await request(app)
      .post(`/api/agenda/${reviewId}/generate`)
      .send({ customItems: [123] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when includeAiNote is not a boolean', async () => {
    const res = await request(app)
      .post(`/api/agenda/${reviewId}/generate`)
      .send({ includeAiNote: 'yes' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('saved JSON agenda has a title property', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue({
      id: reviewId,
      title: 'Bi-Annual Review',
      deletedAt: null,
    });
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    await request(app).post(`/api/agenda/${reviewId}/generate`);

    const updateCall = (prisma.mgmtReview.update as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(updateCall.data.aiGeneratedAgenda);
    expect(parsed).toHaveProperty('title');
  });

  it('last agenda item mentions next review date', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue({
      id: reviewId,
      title: 'Year-End Review',
      deletedAt: null,
    });
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(200);
    const items: string[] = res.body.data.items;
    const lastItem = items[items.length - 1];
    expect(lastItem).toMatch(/next review/i);
  });
});

describe('Agenda — validation and serialisation', () => {
  const reviewId = '00000000-0000-0000-0000-000000000001';
  const mockReview = { id: reviewId, title: 'Validation Review', deletedAt: null };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saved JSON agenda items array is non-empty', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    await request(app).post(`/api/agenda/${reviewId}/generate`);

    const updateCall = (prisma.mgmtReview.update as jest.Mock).mock.calls[0][0];
    const parsed = JSON.parse(updateCall.data.aiGeneratedAgenda);
    expect(parsed.items.length).toBeGreaterThan(0);
  });

  it('data.reviewType defaults to ANNUAL when review has no reviewType', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue({ ...mockReview, reviewType: undefined });
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(200);
    expect(res.body.data.reviewType).toBe('ANNUAL');
  });

  it('data.location is null when review has no location', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue({ ...mockReview, location: undefined });
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(200);
    expect(res.body.data.location).toBeNull();
  });

  it('data.chairperson is null when review has no chairperson', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue({ ...mockReview, chairperson: undefined });
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(200);
    expect(res.body.data.chairperson).toBeNull();
  });

  it('multiple customItems each appear in generated agenda items', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/agenda/${reviewId}/generate`)
      .send({ customItems: ['Vendor review', 'Budget overview'] });

    expect(res.status).toBe(200);
    const items: string[] = res.body.data.items;
    expect(items.some((i) => i.includes('Vendor review'))).toBe(true);
    expect(items.some((i) => i.includes('Budget overview'))).toBe(true);
  });

  it('agenda has 14 base items when no customItems provided', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(14);
  });

  it('agenda with 2 customItems has 16 total items', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post(`/api/agenda/${reviewId}/generate`)
      .send({ customItems: ['Topic A', 'Topic B'] });

    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(16);
  });

  it('returns 400 when customItems is not an array', async () => {
    const res = await request(app)
      .post(`/api/agenda/${reviewId}/generate`)
      .send({ customItems: 'not-an-array' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Agenda — final coverage', () => {
  const reviewId = '00000000-0000-0000-0000-000000000001';
  const mockReview = { id: reviewId, title: 'Final Coverage Review', deletedAt: null };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('response body has both data and success fields on 200', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('findFirst query uses orgId from auth user', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    await request(app).post(`/api/agenda/${reviewId}/generate`);
    const findCall = (prisma.mgmtReview.findFirst as jest.Mock).mock.calls[0][0];
    expect(findCall.where.orgId).toBe('org-1');
  });

  it('error message is Failed to generate resource on 500 from findFirst', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockRejectedValue(new Error('db error'));
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe('Failed to generate resource');
  });

  it('data.items are all strings', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(200);
    for (const item of res.body.data.items) {
      expect(typeof item).toBe('string');
    }
  });

  it('generatedAt is an ISO date string', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    const res = await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(res.status).toBe(200);
    expect(new Date(res.body.data.generatedAt).toString()).not.toBe('Invalid Date');
  });

  it('update is NOT called when review is not found', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(null);
    await request(app).post(`/api/agenda/${reviewId}/generate`);
    expect(prisma.mgmtReview.update).not.toHaveBeenCalled();
  });

  it('customItems of empty array yields exactly 14 items', async () => {
    (prisma.mgmtReview.findFirst as jest.Mock).mockResolvedValue(mockReview);
    (prisma.mgmtReview.update as jest.Mock).mockResolvedValue({});
    const res = await request(app)
      .post(`/api/agenda/${reviewId}/generate`)
      .send({ customItems: [] });
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(14);
  });
});
