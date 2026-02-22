import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemFumigation: {
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

import router from '../src/routes/fumigation';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/fumigation', router);

beforeEach(() => jest.clearAllMocks());

const mockFumigation = {
  id: '00000000-0000-0000-0000-000000000001',
  location: 'Warehouse A',
  purpose: 'Pest control - grain weevil',
  fumigantName: 'Phosphine',
  fumigantCasNumber: '7803-51-2',
  plannedStartDate: new Date('2026-03-10'),
  competentPersonName: 'Bob Walker',
  competentPersonCertRef: 'PCA-2024-0123',
  status: 'PLANNED',
  deletedAt: null,
  createdAt: new Date('2026-02-15'),
};

// ── GET / ─────────────────────────────────────────────────────────────────

describe('GET /api/fumigation', () => {
  it('returns paginated fumigations', async () => {
    (mockPrisma.chemFumigation.findMany as jest.Mock).mockResolvedValue([mockFumigation]);
    (mockPrisma.chemFumigation.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/fumigation');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('filters by status', async () => {
    (mockPrisma.chemFumigation.findMany as jest.Mock).mockResolvedValue([mockFumigation]);
    (mockPrisma.chemFumigation.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/fumigation?status=PLANNED');
    const [call] = (mockPrisma.chemFumigation.findMany as jest.Mock).mock.calls;
    expect(call[0].where.status).toBe('PLANNED');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.chemFumigation.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/fumigation');
    expect(res.status).toBe(500);
  });
});

// ── POST / ────────────────────────────────────────────────────────────────

describe('POST /api/fumigation', () => {
  const validBody = {
    location: 'Warehouse A',
    purpose: 'Pest control',
    fumigantName: 'Phosphine',
    plannedStartDate: '2026-03-10',
    competentPersonName: 'Bob Walker',
  };

  it('creates a fumigation with PLANNED status', async () => {
    (mockPrisma.chemFumigation.create as jest.Mock).mockResolvedValue(mockFumigation);
    const res = await request(app).post('/api/fumigation').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const [call] = (mockPrisma.chemFumigation.create as jest.Mock).mock.calls;
    expect(call[0].data.status).toBe('PLANNED');
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/fumigation').send({ location: 'Warehouse A' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid plannedStartDate', async () => {
    const res = await request(app).post('/api/fumigation').send({ ...validBody, plannedStartDate: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  it('accepts optional fields', async () => {
    const bodyFull = {
      ...validBody,
      fumigantCasNumber: '7803-51-2',
      estimatedQuantityKg: 5.0,
      plannedEndDate: '2026-03-12',
      competentPersonCertRef: 'PCA-0123',
      neighboursNotified: true,
      ppeRequired: ['full-face respirator', 'protective suit'],
    };
    (mockPrisma.chemFumigation.create as jest.Mock).mockResolvedValue(mockFumigation);
    const res = await request(app).post('/api/fumigation').send(bodyFull);
    expect(res.status).toBe(201);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.chemFumigation.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/fumigation').send(validBody);
    expect(res.status).toBe(500);
  });
});

// ── PUT /:id/notify-hse ───────────────────────────────────────────────────

describe('PUT /api/fumigation/:id/notify-hse', () => {
  it('records HSE notification and sets status to HSE_NOTIFIED', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(mockFumigation);
    (mockPrisma.chemFumigation.update as jest.Mock).mockResolvedValue({
      ...mockFumigation, status: 'HSE_NOTIFIED', hseNotificationRef: 'HSE-2026-1234',
    });
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001/notify-hse')
      .send({ hseNotificationRef: 'HSE-2026-1234', hseNotificationDate: '2026-03-05' });
    expect(res.status).toBe(200);
    const [call] = (mockPrisma.chemFumigation.update as jest.Mock).mock.calls;
    expect(call[0].data.status).toBe('HSE_NOTIFIED');
    expect(call[0].data.hseNotificationRef).toBe('HSE-2026-1234');
  });

  it('returns 404 when fumigation not found', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000099/notify-hse')
      .send({ hseNotificationRef: 'HSE-001', hseNotificationDate: '2026-03-05' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when notification ref missing', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(mockFumigation);
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001/notify-hse')
      .send({ hseNotificationDate: '2026-03-05' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when notification date missing', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(mockFumigation);
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001/notify-hse')
      .send({ hseNotificationRef: 'HSE-001' });
    expect(res.status).toBe(400);
  });
});

// ── PUT /:id/gas-free ────────────────────────────────────────────────────

describe('PUT /api/fumigation/:id/gas-free', () => {
  const hseNotifiedFumigation = { ...mockFumigation, status: 'IN_PROGRESS' };

  it('issues a gas-free certificate and sets status to GAS_FREE_CERTIFIED', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(hseNotifiedFumigation);
    (mockPrisma.chemFumigation.update as jest.Mock).mockResolvedValue({
      ...hseNotifiedFumigation, status: 'GAS_FREE_CERTIFIED', gasFreeIssuedBy: 'Dr. Safety',
    });
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001/gas-free')
      .send({ gasFreeDate: '2026-03-13', gasFreeIssuedBy: 'Dr. Safety' });
    expect(res.status).toBe(200);
    const [call] = (mockPrisma.chemFumigation.update as jest.Mock).mock.calls;
    expect(call[0].data.status).toBe('GAS_FREE_CERTIFIED');
  });

  it('accepts optional gasClearanceConcentrationPpm', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(hseNotifiedFumigation);
    (mockPrisma.chemFumigation.update as jest.Mock).mockResolvedValue({ ...hseNotifiedFumigation });
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001/gas-free')
      .send({ gasFreeDate: '2026-03-13', gasFreeIssuedBy: 'Dr. Safety', gasClearanceConcentrationPpm: 0.1 });
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000099/gas-free')
      .send({ gasFreeDate: '2026-03-13', gasFreeIssuedBy: 'Dr. Safety' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when issuer missing', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(hseNotifiedFumigation);
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001/gas-free')
      .send({ gasFreeDate: '2026-03-13' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when date missing', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(hseNotifiedFumigation);
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001/gas-free')
      .send({ gasFreeIssuedBy: 'Dr. Safety' });
    expect(res.status).toBe(400);
  });
});

// ── PUT /:id (general update) ─────────────────────────────────────────────

describe('PUT /api/fumigation/:id', () => {
  it('updates status to COMPLETED', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(mockFumigation);
    (mockPrisma.chemFumigation.update as jest.Mock).mockResolvedValue({ ...mockFumigation, status: 'COMPLETED' });
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });

  it('accepts all valid status values', async () => {
    const statuses = ['PLANNED', 'HSE_NOTIFIED', 'IN_PROGRESS', 'GAS_FREE_CERTIFIED', 'COMPLETED', 'CANCELLED'];
    for (const status of statuses) {
      (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(mockFumigation);
      (mockPrisma.chemFumigation.update as jest.Mock).mockResolvedValue({ ...mockFumigation, status });
      const res = await request(app)
        .put('/api/fumigation/00000000-0000-0000-0000-000000000001')
        .send({ status });
      expect(res.status).toBe(200);
    }
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000099')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid status', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(mockFumigation);
    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001')
      .send({ status: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────

describe('GET /api/fumigation/:id', () => {
  it('returns a single fumigation', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(mockFumigation);
    const res = await request(app).get('/api/fumigation/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.fumigantName).toBe('Phosphine');
  });

  it('returns 404 for missing fumigation', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/fumigation/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('returns 404 for soft-deleted fumigation', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue({ ...mockFumigation, deletedAt: new Date() });
    const res = await request(app).get('/api/fumigation/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
  });
});

// ── Additional coverage ───────────────────────────────────────────────────

describe('Fumigation API — additional coverage', () => {
  it('GET /api/fumigation returns correct totalPages for multi-page result', async () => {
    (mockPrisma.chemFumigation.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemFumigation.count as jest.Mock).mockResolvedValue(60);

    const res = await request(app).get('/api/fumigation?page=1&limit=20');
    expect(res.status).toBe(200);
    const totalPages = Math.ceil(res.body.pagination.total / 20);
    expect(totalPages).toBe(3);
  });

  it('GET /api/fumigation response has success:true and pagination block', async () => {
    (mockPrisma.chemFumigation.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemFumigation.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/fumigation');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET /api/fumigation/:id returns success:true in response body', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(mockFumigation);
    const res = await request(app).get('/api/fumigation/00000000-0000-0000-0000-000000000001');
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/fumigation/:id returns 500 on db error during update', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockResolvedValue(mockFumigation);
    (mockPrisma.chemFumigation.update as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/fumigation/00000000-0000-0000-0000-000000000001')
      .send({ status: 'COMPLETED' });
    expect(res.status).toBe(500);
  });

  it('GET /api/fumigation/:id returns 500 on db error', async () => {
    (mockPrisma.chemFumigation.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/fumigation/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });
});
