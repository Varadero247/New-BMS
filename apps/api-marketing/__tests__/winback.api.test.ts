import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktWinBackSequence: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    mktEmailJob: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import winbackRouter from '../src/routes/winback';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/winback', winbackRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/winback/start/:orgId', () => {
  it('creates win-back sequence', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktWinBackSequence.create as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-1',
      token: 'token-1',
    });
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'admin@org.com' });

    expect(res.status).toBe(201);
    expect(prisma.mktWinBackSequence.create).toHaveBeenCalled();
    expect(prisma.mktEmailJob.create).toHaveBeenCalled();
  });

  it('returns 409 if sequence already exists', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({ id: 'wb-1' });

    const res = await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'admin@org.com' });

    expect(res.status).toBe(409);
  });

  it('schedules day 3 email', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktWinBackSequence.create as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-1',
    });
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'a@b.com' });

    expect(prisma.mktEmailJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ template: 'winback_day3_reason' }),
      })
    );
  });
});

describe('GET /api/winback/reason/:reason', () => {
  it('records cancellation reason with valid token', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-1',
    });
    (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    const res = await request(app).get('/api/winback/reason/price?token=valid-token');

    expect(res.status).toBe(200);
    expect(prisma.mktWinBackSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ cancellationReason: 'price' }) })
    );
  });

  it('returns 400 for missing token', async () => {
    const res = await request(app).get('/api/winback/reason/price');

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid reason', async () => {
    const res = await request(app).get('/api/winback/reason/invalid_reason?token=t');

    expect(res.status).toBe(400);
  });

  it('returns 404 for invalid token', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/winback/reason/price?token=bad-token');

    expect(res.status).toBe(404);
  });

  it('accepts all valid reasons', async () => {
    for (const reason of ['price', 'features', 'time', 'competitor', 'business']) {
      (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({
        id: 'wb-1',
        orgId: 'org-1',
      });
      (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
      (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

      const res = await request(app).get(`/api/winback/reason/${reason}?token=t`);
      expect(res.status).toBe(200);
    }
  });

  it('schedules reason-specific day 7 email', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue({
      id: 'wb-1',
      orgId: 'org-1',
    });
    (prisma.mktWinBackSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    await request(app).get('/api/winback/reason/features?token=t');

    expect(prisma.mktEmailJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ template: 'winback_day7_features' }),
      })
    );
  });
});

describe('GET /api/winback/active', () => {
  it('returns active win-back sequences', async () => {
    const sequences = [{ id: 'wb-1', orgId: 'org-1', reactivatedAt: null }];
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockResolvedValue(sequences);

    const res = await request(app).get('/api/winback/active');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST /start/:orgId returns 500 when create fails', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.mktWinBackSequence.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/winback/start/00000000-0000-0000-0000-000000000001')
      .send({ email: 'admin@org.com' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /reason/:reason returns 500 when DB fails', async () => {
    (prisma.mktWinBackSequence.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/winback/reason/price?token=some-token');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /active returns 500 when DB fails', async () => {
    (prisma.mktWinBackSequence.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/winback/active');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
