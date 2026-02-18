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

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'admin@test.com', role: 'ADMIN' };
    next();
  }),
}));

// Mock fetch for HubSpot
global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) as any;

import roiRouter, { calculateROI } from '../src/routes/roi';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/roi', roiRouter);

beforeEach(() => { jest.clearAllMocks(); });

// ===================================================================
// ROI Calculation Logic
// ===================================================================

describe('calculateROI', () => {
  it('recommends Professional for 1-3 ISO standards', () => {
    const result = calculateROI({ isoCount: 2 });
    expect(result.recommendedTier).toBe('Professional');
    expect(result.pricePerUser).toBe(29);
  });

  it('recommends Enterprise for 4+ ISO standards', () => {
    const result = calculateROI({ isoCount: 5 });
    expect(result.recommendedTier).toBe('Enterprise');
    expect(result.pricePerUser).toBe(19);
  });

  it('calculates monthly cost correctly for Professional', () => {
    const result = calculateROI({ isoCount: 1 });
    expect(result.monthlyCost).toBe(15 * 29); // 435
    expect(result.annualCost).toBe(15 * 29 * 12); // 5220
  });

  it('calculates monthly cost correctly for Enterprise', () => {
    const result = calculateROI({ isoCount: 4 });
    expect(result.monthlyCost).toBe(15 * 19); // 285
    expect(result.annualCost).toBe(15 * 19 * 12); // 3420
  });

  it('calculates software saving vs industry benchmark', () => {
    const result = calculateROI({ isoCount: 1 });
    const benchmark = 15 * 180 * 12; // 32400
    expect(result.softwareSaving).toBe(benchmark - result.annualCost);
  });

  it('calculates time saving based on ISO count', () => {
    const result = calculateROI({ isoCount: 3 });
    expect(result.timeSavingAnnual).toBe(3 * 8 * 35 * 52); // 43680
  });

  it('calculates total ROI as sum of savings', () => {
    const result = calculateROI({ isoCount: 2 });
    expect(result.totalROI).toBe(result.softwareSaving + result.timeSavingAnnual);
  });

  it('defaults to 1 ISO standard when not provided', () => {
    const result = calculateROI({});
    expect(result.timeSavingAnnual).toBe(1 * 8 * 35 * 52);
  });
});

// ===================================================================
// POST /api/roi/calculate
// ===================================================================

describe('POST /api/roi/calculate', () => {
  it('returns ROI calculation for valid input', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ id: 'lead-1' });

    const res = await request(app)
      .post('/api/roi/calculate')
      .send({
        companyName: 'TechCorp',
        name: 'Jane Smith',
        email: 'jane@techcorp.com',
        isoCount: 3,
        industry: 'Manufacturing',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recommendedTier).toBe('Professional');
    expect(res.body.data.totalROI).toBeGreaterThan(0);
  });

  it('saves lead to database', async () => {
    (prisma.mktLead.create as jest.Mock).mockResolvedValue({ id: 'lead-1' });

    await request(app)
      .post('/api/roi/calculate')
      .send({
        companyName: 'TechCorp',
        name: 'Jane Smith',
        email: 'jane@techcorp.com',
        isoCount: 2,
      });

    expect(prisma.mktLead.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'jane@techcorp.com',
          source: 'ROI_CALCULATOR',
        }),
      })
    );
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/roi/calculate')
      .send({ companyName: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/roi/calculate')
      .send({
        companyName: 'Test',
        name: 'Test User',
        email: 'not-an-email',
      });

    expect(res.status).toBe(400);
  });

  it('still returns success even if DB save fails', async () => {
    (prisma.mktLead.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/roi/calculate')
      .send({
        companyName: 'TechCorp',
        name: 'Jane Smith',
        email: 'jane@techcorp.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ===================================================================
// GET /api/roi/history
// ===================================================================

describe('GET /api/roi/history', () => {
  it('returns ROI lead history', async () => {
    const mockLeads = [
      { id: 'lead-1', email: 'a@b.com', source: 'ROI_CALCULATOR', roiEstimate: 50000 },
    ];
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue(mockLeads);

    const res = await request(app).get('/api/roi/history');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by ROI_CALCULATOR source', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/roi/history');

    expect(prisma.mktLead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { source: 'ROI_CALCULATOR' },
      })
    );
  });

  it('returns 500 on database error', async () => {
    (prisma.mktLead.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/roi/history');

    expect(res.status).toBe(500);
  });
});
