import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mktPartner: { findUnique: jest.fn() },
  },
}));

jest.mock('../src/prisma-portal', () => ({
  portalPrisma: {
    mktPartnerCollateral: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import collateralRouter from '../src/routes/collateral';
import { prisma } from '../src/prisma';
import { portalPrisma } from '../src/prisma-portal';

const app = express();
app.use(express.json());
app.use((req: any, _res: any, next: any) => {
  req.partner = { id: 'partner-1' };
  next();
});
app.use('/api/collateral', collateralRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockCollateral = {
  id: '00000000-0000-0000-0000-000000000001',
  title: 'ISO 9001 Case Study',
  description: 'Manufacturing success story',
  type: 'CASE_STUDY',
  accessTier: 'ALL',
  fileUrl: 'https://storage.example.com/case-study.pdf',
  thumbnailUrl: null,
  downloadCount: 42,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('GET /api/collateral', () => {
  it('returns collateral filtered by tier', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'REFERRAL' });
    (portalPrisma.mktPartnerCollateral.findMany as jest.Mock).mockResolvedValue([mockCollateral]);

    const res = await request(app).get('/api/collateral');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);

    // Should only allow 'ALL' tier for REFERRAL partners
    expect(portalPrisma.mktPartnerCollateral.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accessTier: { in: ['ALL'] } }),
      })
    );
  });

  it('allows higher tier access for RESELLER', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'RESELLER' });
    (portalPrisma.mktPartnerCollateral.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/collateral');

    expect(portalPrisma.mktPartnerCollateral.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accessTier: { in: ['ALL', 'CO_SELL', 'RESELLER'] } }),
      })
    );
  });

  it('filters by type when query param provided', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'REFERRAL' });
    (portalPrisma.mktPartnerCollateral.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/collateral?type=WHITEPAPER');

    expect(portalPrisma.mktPartnerCollateral.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'WHITEPAPER' }),
      })
    );
  });
});

describe('GET /api/collateral/:id/download', () => {
  it('returns download URL and increments count', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'REFERRAL' });
    (portalPrisma.mktPartnerCollateral.findUnique as jest.Mock).mockResolvedValue(mockCollateral);
    (portalPrisma.mktPartnerCollateral.update as jest.Mock).mockResolvedValue({
      ...mockCollateral,
      downloadCount: 43,
    });

    const res = await request(app).get(
      '/api/collateral/00000000-0000-0000-0000-000000000001/download'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.fileUrl).toBe('https://storage.example.com/case-study.pdf');
    expect(portalPrisma.mktPartnerCollateral.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { downloadCount: { increment: 1 } },
      })
    );
  });

  it('returns 404 for nonexistent collateral', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'REFERRAL' });
    (portalPrisma.mktPartnerCollateral.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(
      '/api/collateral/00000000-0000-0000-0000-000000000099/download'
    );
    expect(res.status).toBe(404);
  });

  it('returns 403 when tier does not have access', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'REFERRAL' });
    (portalPrisma.mktPartnerCollateral.findUnique as jest.Mock).mockResolvedValue({
      ...mockCollateral,
      accessTier: 'GCC_SPECIALIST',
    });

    const res = await request(app).get(
      '/api/collateral/00000000-0000-0000-0000-000000000001/download'
    );
    expect(res.status).toBe(403);
  });
});

describe('Auth guard', () => {
  it('returns 401 without partner on request', async () => {
    const noAuthApp = express();
    noAuthApp.use(express.json());
    noAuthApp.use('/api/collateral', collateralRouter);

    const res = await request(noAuthApp).get('/api/collateral');
    expect(res.status).toBe(401);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'GCC_SPECIALIST' });
    (portalPrisma.mktPartnerCollateral.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/collateral');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id/download returns 500 on DB error', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'GCC_SPECIALIST' });
    (portalPrisma.mktPartnerCollateral.findUnique as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/collateral/00000000-0000-0000-0000-000000000001/download');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Collateral — extended', () => {
  it('GET / findMany called once per list request', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'REFERRAL' });
    (portalPrisma.mktPartnerCollateral.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/collateral');
    expect(portalPrisma.mktPartnerCollateral.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET / data is an array', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'REFERRAL' });
    (portalPrisma.mktPartnerCollateral.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/collateral');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /:id/download update called once on success', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue({ tier: 'GCC_SPECIALIST' });
    (portalPrisma.mktPartnerCollateral.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Guide',
      accessTier: 'ALL',
      fileUrl: 'https://example.com/file.pdf',
      downloadCount: 10,
    });
    (portalPrisma.mktPartnerCollateral.update as jest.Mock).mockResolvedValue({ downloadCount: 11 });
    await request(app).get('/api/collateral/00000000-0000-0000-0000-000000000001/download');
    expect(portalPrisma.mktPartnerCollateral.update).toHaveBeenCalledTimes(1);
  });
});
