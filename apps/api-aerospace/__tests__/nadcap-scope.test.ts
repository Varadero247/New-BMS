import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aeroNadcapScope: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>) => {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || 20), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import router from '../src/routes/nadcap-scope';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/nadcap-scope', router);

beforeEach(() => jest.clearAllMocks());

const mockRecord = {
  id: '00000000-0000-0000-0000-000000000001',
  supplierName: 'Acme Heat Treat',
  supplierCode: 'ACME-001',
  nadcapCertRef: 'NADCAP-2026-12345',
  certExpiryDate: new Date('2027-03-01'),
  issuedByPri: true,
  commodityCodes: ['AC7102', 'AC7004'],
  commodityCodesRequired: ['AC7102', 'AC7004'],
  processDescription: 'Heat treatment and NDT',
  verifiedBy: 'Jane Smith',
  verificationDate: new Date('2026-02-01'),
  scopeGaps: [],
  status: 'VERIFIED_COMPLIANT',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

// ── GET / ─────────────────────────────────────────────────────────────────

describe('GET /api/nadcap-scope', () => {
  it('returns paginated scope verifications', async () => {
    (mockPrisma.aeroNadcapScope.findMany as jest.Mock).mockResolvedValue([mockRecord]);
    (mockPrisma.aeroNadcapScope.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/nadcap-scope');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('filters by supplierName', async () => {
    (mockPrisma.aeroNadcapScope.findMany as jest.Mock).mockResolvedValue([mockRecord]);
    (mockPrisma.aeroNadcapScope.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/nadcap-scope?supplierName=Acme');
    expect(res.status).toBe(200);
    const [call] = (mockPrisma.aeroNadcapScope.findMany as jest.Mock).mock.calls;
    expect(call[0].where.supplierName).toBe('Acme');
  });

  it('filters by status', async () => {
    (mockPrisma.aeroNadcapScope.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.aeroNadcapScope.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/nadcap-scope?status=SCOPE_GAP_IDENTIFIED');
    expect(res.status).toBe(200);
    const [call] = (mockPrisma.aeroNadcapScope.findMany as jest.Mock).mock.calls;
    expect(call[0].where.status).toBe('SCOPE_GAP_IDENTIFIED');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.aeroNadcapScope.findMany as jest.Mock).mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/api/nadcap-scope');
    expect(res.status).toBe(500);
  });
});

// ── POST / ────────────────────────────────────────────────────────────────

describe('POST /api/nadcap-scope', () => {
  const validBody = {
    supplierName: 'Acme Heat Treat',
    nadcapCertRef: 'NADCAP-2026-12345',
    certExpiryDate: '2027-03-01',
    commodityCodes: ['AC7102', 'AC7004'],
    commodityCodesRequired: ['AC7102', 'AC7004'],
    processDescription: 'Heat treatment',
    verifiedBy: 'Jane Smith',
    verificationDate: '2026-02-01',
  };

  it('creates a compliant scope record', async () => {
    (mockPrisma.aeroNadcapScope.create as jest.Mock).mockResolvedValue({ ...mockRecord });
    const res = await request(app).post('/api/nadcap-scope').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const [call] = (mockPrisma.aeroNadcapScope.create as jest.Mock).mock.calls;
    expect(call[0].data.status).toBe('VERIFIED_COMPLIANT');
    expect(call[0].data.scopeGaps).toEqual([]);
  });

  it('detects scope gaps when required codes are missing from certified', async () => {
    const bodyWithGap = { ...validBody, commodityCodes: ['AC7102'], commodityCodesRequired: ['AC7102', 'AC7004'] };
    const gapRecord = { ...mockRecord, scopeGaps: ['AC7004'], status: 'SCOPE_GAP_IDENTIFIED' };
    (mockPrisma.aeroNadcapScope.create as jest.Mock).mockResolvedValue(gapRecord);
    const res = await request(app).post('/api/nadcap-scope').send(bodyWithGap);
    expect(res.status).toBe(201);
    const [call] = (mockPrisma.aeroNadcapScope.create as jest.Mock).mock.calls;
    expect(call[0].data.scopeGaps).toContain('AC7004');
    expect(call[0].data.status).toBe('SCOPE_GAP_IDENTIFIED');
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/nadcap-scope').send({ supplierName: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when commodityCodes is empty array', async () => {
    const res = await request(app).post('/api/nadcap-scope').send({ ...validBody, commodityCodes: [] });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid certExpiryDate', async () => {
    const res = await request(app).post('/api/nadcap-scope').send({ ...validBody, certExpiryDate: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.aeroNadcapScope.create as jest.Mock).mockRejectedValue(new Error('DB fail'));
    const res = await request(app).post('/api/nadcap-scope').send(validBody);
    expect(res.status).toBe(500);
  });
});

// ── GET /gaps ─────────────────────────────────────────────────────────────

describe('GET /api/nadcap-scope/gaps', () => {
  it('returns scope gaps and expiring soon records', async () => {
    (mockPrisma.aeroNadcapScope.findMany as jest.Mock)
      .mockResolvedValueOnce([{ ...mockRecord, status: 'SCOPE_GAP_IDENTIFIED' }])
      .mockResolvedValueOnce([mockRecord]);
    const res = await request(app).get('/api/nadcap-scope/gaps');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('scopeGaps');
    expect(res.body.data).toHaveProperty('expiringSoon');
    expect(res.body.data.scopeGaps).toHaveLength(1);
  });

  it('returns empty arrays when no gaps', async () => {
    (mockPrisma.aeroNadcapScope.findMany as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const res = await request(app).get('/api/nadcap-scope/gaps');
    expect(res.status).toBe(200);
    expect(res.body.data.scopeGaps).toHaveLength(0);
    expect(res.body.data.expiringSoon).toHaveLength(0);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.aeroNadcapScope.findMany as jest.Mock).mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/api/nadcap-scope/gaps');
    expect(res.status).toBe(500);
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────

describe('GET /api/nadcap-scope/:id', () => {
  it('returns a single scope record', async () => {
    (mockPrisma.aeroNadcapScope.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    const res = await request(app).get('/api/nadcap-scope/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.nadcapCertRef).toBe('NADCAP-2026-12345');
  });

  it('returns 404 for missing record', async () => {
    (mockPrisma.aeroNadcapScope.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/nadcap-scope/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('returns 404 for soft-deleted record', async () => {
    (mockPrisma.aeroNadcapScope.findUnique as jest.Mock).mockResolvedValue({ ...mockRecord, deletedAt: new Date() });
    const res = await request(app).get('/api/nadcap-scope/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
  });
});

// ── PUT /:id ──────────────────────────────────────────────────────────────

describe('PUT /api/nadcap-scope/:id', () => {
  it('updates status and recalculates scope gaps', async () => {
    (mockPrisma.aeroNadcapScope.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    (mockPrisma.aeroNadcapScope.update as jest.Mock).mockResolvedValue({ ...mockRecord, status: 'UNDER_REVIEW' });
    const res = await request(app)
      .put('/api/nadcap-scope/00000000-0000-0000-0000-000000000001')
      .send({ status: 'UNDER_REVIEW' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('UNDER_REVIEW');
  });

  it('recalculates gaps when codes updated', async () => {
    (mockPrisma.aeroNadcapScope.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    (mockPrisma.aeroNadcapScope.update as jest.Mock).mockResolvedValue({
      ...mockRecord, commodityCodes: ['AC7102'], scopeGaps: ['AC7004'], status: 'SCOPE_GAP_IDENTIFIED',
    });
    const res = await request(app)
      .put('/api/nadcap-scope/00000000-0000-0000-0000-000000000001')
      .send({ commodityCodes: ['AC7102'] });
    expect(res.status).toBe(200);
    const [call] = (mockPrisma.aeroNadcapScope.update as jest.Mock).mock.calls;
    expect(call[0].data.scopeGaps).toContain('AC7004');
  });

  it('returns 404 when record not found', async () => {
    (mockPrisma.aeroNadcapScope.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/nadcap-scope/00000000-0000-0000-0000-000000000099')
      .send({ status: 'EXPIRED' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid status value', async () => {
    (mockPrisma.aeroNadcapScope.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    const res = await request(app)
      .put('/api/nadcap-scope/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
  });
});
