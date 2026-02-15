import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktRenewalSequence: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
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

import renewalRouter from '../src/routes/renewal';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/renewal', renewalRouter);

beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/renewal/upcoming', () => {
  it('returns upcoming renewals within 90 days by default', async () => {
    const sequences = [{ id: 'rs-1', orgId: 'org-1', renewalDate: new Date() }];
    (prisma.mktRenewalSequence.findMany as jest.Mock).mockResolvedValue(sequences);

    const res = await request(app).get('/api/renewal/upcoming');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('accepts custom days parameter', async () => {
    (prisma.mktRenewalSequence.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/renewal/upcoming?days=30');

    expect(prisma.mktRenewalSequence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ renewedAt: null }) })
    );
  });

  it('excludes already renewed orgs', async () => {
    (prisma.mktRenewalSequence.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/renewal/upcoming');

    expect(prisma.mktRenewalSequence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ renewedAt: null }) })
    );
  });

  it('returns 500 on database error', async () => {
    (prisma.mktRenewalSequence.findMany as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/api/renewal/upcoming');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/renewal/:orgId/send-reminder', () => {
  it('sends day90 reminder', async () => {
    (prisma.mktRenewalSequence.findUnique as jest.Mock).mockResolvedValue({ orgId: 'org-1' });
    (prisma.mktRenewalSequence.update as jest.Mock).mockResolvedValue({});
    (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

    const res = await request(app)
      .post('/api/renewal/org-1/send-reminder')
      .send({ type: 'day90' });

    expect(res.status).toBe(200);
    expect(prisma.mktRenewalSequence.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { day90Sent: true } })
    );
  });

  it('returns 404 for non-existent sequence', async () => {
    (prisma.mktRenewalSequence.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/renewal/nonexistent/send-reminder')
      .send({ type: 'day30' });

    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid reminder type', async () => {
    (prisma.mktRenewalSequence.findUnique as jest.Mock).mockResolvedValue({ orgId: 'org-1' });

    const res = await request(app)
      .post('/api/renewal/org-1/send-reminder')
      .send({ type: 'day999' });

    expect(res.status).toBe(400);
  });

  it('handles all valid reminder types', async () => {
    for (const type of ['day90', 'day60', 'day30', 'day7']) {
      (prisma.mktRenewalSequence.findUnique as jest.Mock).mockResolvedValue({ orgId: 'org-1' });
      (prisma.mktRenewalSequence.update as jest.Mock).mockResolvedValue({});
      (prisma.mktEmailJob.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/renewal/org-1/send-reminder')
        .send({ type });

      expect(res.status).toBe(200);
    }
  });
});
