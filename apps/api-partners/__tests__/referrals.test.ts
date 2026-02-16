import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktPartner: { findUnique: jest.fn() },
  },
}));

jest.mock('../src/prisma-portal', () => ({
  portalPrisma: {
    mktPartnerReferral: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import referralsRouter from '../src/routes/referrals';
import { prisma } from '../src/prisma';
import { portalPrisma } from '../src/prisma-portal';

const app = express();
app.use(express.json());
app.use((req: any, _res: any, next: any) => { req.partner = { id: 'partner-1' }; next(); });
app.use('/api/referrals', referralsRouter);

beforeEach(() => { jest.clearAllMocks(); });

const mockReferral = {
  id: 'ref-1',
  partnerId: 'partner-1',
  referralCode: 'abc123',
  prospectEmail: 'prospect@test.com',
  prospectName: 'Jane Doe',
  clickedAt: null,
  signedUpAt: null,
  convertedAt: null,
  commissionPct: 0.25,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GET /api/referrals', () => {
  it('returns list of referrals for partner', async () => {
    (portalPrisma.mktPartnerReferral.findMany as jest.Mock).mockResolvedValue([mockReferral]);
    const res = await request(app).get('/api/referrals');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].prospectEmail).toBe('prospect@test.com');
  });

  it('returns empty array when no referrals', async () => {
    (portalPrisma.mktPartnerReferral.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/referrals');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/referrals/track', () => {
  it('creates a referral with valid data', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ referralCode: 'abc123' });
    (portalPrisma.mktPartnerReferral.create as jest.Mock).mockResolvedValue(mockReferral);

    const res = await request(app)
      .post('/api/referrals/track')
      .send({ prospectEmail: 'prospect@test.com', prospectName: 'Jane Doe' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/referrals/track')
      .send({ prospectEmail: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('returns 404 if partner not found', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .post('/api/referrals/track')
      .send({ prospectEmail: 'test@example.com' });
    expect(res.status).toBe(404);
  });
});

describe('GET /api/referrals/stats', () => {
  it('returns computed stats', async () => {
    (portalPrisma.mktPartnerReferral.findMany as jest.Mock).mockResolvedValue([
      { ...mockReferral, clickedAt: new Date(), convertedAt: new Date() },
      { ...mockReferral, id: 'ref-2', clickedAt: new Date(), signedUpAt: new Date() },
      { ...mockReferral, id: 'ref-3' },
    ]);

    const res = await request(app).get('/api/referrals/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.clicked).toBe(2);
    expect(res.body.data.signedUp).toBe(1);
    expect(res.body.data.converted).toBe(1);
  });

  it('handles empty referrals', async () => {
    (portalPrisma.mktPartnerReferral.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/referrals/stats');
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.conversionRate).toBe(0);
  });
});

describe('Auth guard', () => {
  it('returns 401 without partner on request', async () => {
    const noAuthApp = express();
    noAuthApp.use(express.json());
    noAuthApp.use('/api/referrals', referralsRouter);

    const res = await request(noAuthApp).get('/api/referrals');
    expect(res.status).toBe(401);
  });
});
