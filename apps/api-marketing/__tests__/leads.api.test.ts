import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktLead: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import leadsRouter from '../src/routes/leads';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/leads', leadsRouter);

beforeEach(() => { jest.clearAllMocks(); });

// ===================================================================
// POST /api/leads/capture
// ===================================================================

describe('POST /api/leads/capture', () => {
  it('creates a lead with valid data', async () => {
    const mockLead = { id: '00000000-0000-0000-0000-000000000001', email: 'test@test.com', name: 'Test', source: 'DIRECT' };
    (prisma.mktLead.create as jest.Mock).mockResolvedValue(mockLead);

    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'test@test.com', name: 'Test User', source: 'DIRECT' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Route returns { captured: true } (not the full DB record) to avoid exposing internals
    expect(res.body.data.captured).toBe(true);
  });

  it('returns 400 for missing email', async () => {
    const res = await request(app)
      .post('/api/leads/capture')
      .send({ name: 'Test', source: 'DIRECT' });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid source', async () => {
    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'test@test.com', name: 'Test', source: 'INVALID_SOURCE' });

    expect(res.status).toBe(400);
  });

  it('accepts all valid sources', async () => {
    const sources = ['ROI_CALCULATOR', 'CHATBOT', 'LANDING_PAGE', 'PARTNER_REFERRAL', 'ORGANIC_SEARCH', 'PAID_ADS', 'DIRECT', 'LINKEDIN'];
    for (const source of sources) {
      (prisma.mktLead.create as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', source });
      const res = await request(app)
        .post('/api/leads/capture')
        .send({ email: 'test@test.com', name: 'Test', source });
      expect(res.status).toBe(201);
    }
  });

  it('returns 500 on database error', async () => {
    (prisma.mktLead.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/leads/capture')
      .send({ email: 'test@test.com', name: 'Test', source: 'DIRECT' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/leads
// ===================================================================

describe('GET /api/leads', () => {
  it('returns paginated leads', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001' }]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/leads');

    expect(res.status).toBe(200);
    expect(res.body.data.leads).toHaveLength(1);
    expect(res.body.data.total).toBe(1);
  });

  it('filters by source', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?source=CHATBOT');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { source: 'CHATBOT' } })
    );
  });

  it('paginates correctly', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.mktLead.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/leads?page=2&limit=10');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });
});

// ===================================================================
// GET /api/leads/:id
// ===================================================================

describe('GET /api/leads/:id', () => {
  it('returns a lead by ID', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', email: 'test@test.com' });

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('returns 404 for non-existent lead', async () => {
    (prisma.mktLead.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/leads/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});
