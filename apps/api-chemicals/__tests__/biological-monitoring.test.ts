import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemBiologicalMonitoring: {
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

import router from '../src/routes/biological-monitoring';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/biological-monitoring', router);

beforeEach(() => jest.clearAllMocks());

const mockRecord = {
  id: '00000000-0000-0000-0000-000000000001',
  employeeId: 'EMP-001',
  employeeName: 'John Doe',
  substanceName: 'Lead',
  substanceCasNumber: '7439-92-1',
  biomarker: 'Blood Lead Level',
  sampleType: 'BLOOD',
  collectionDate: new Date('2026-01-20'),
  measuredValue: 120,
  unit: 'µg/L',
  biologicalGuidanceValue: 200,
  exceedsBGV: false,
  collectedBy: 'Occ Health Nurse',
  deletedAt: null,
  createdAt: new Date('2026-01-20'),
};

// ── GET / ─────────────────────────────────────────────────────────────────

describe('GET /api/biological-monitoring', () => {
  it('returns paginated monitoring records', async () => {
    (mockPrisma.chemBiologicalMonitoring.findMany as jest.Mock).mockResolvedValue([mockRecord]);
    (mockPrisma.chemBiologicalMonitoring.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/biological-monitoring');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by substanceName', async () => {
    (mockPrisma.chemBiologicalMonitoring.findMany as jest.Mock).mockResolvedValue([mockRecord]);
    (mockPrisma.chemBiologicalMonitoring.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/biological-monitoring?substanceName=Lead');
    const [call] = (mockPrisma.chemBiologicalMonitoring.findMany as jest.Mock).mock.calls;
    expect(call[0].where.substanceName).toBe('Lead');
  });

  it('filters by exceedsBGV=true', async () => {
    (mockPrisma.chemBiologicalMonitoring.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.chemBiologicalMonitoring.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/biological-monitoring?exceedsBGV=true');
    const [call] = (mockPrisma.chemBiologicalMonitoring.findMany as jest.Mock).mock.calls;
    expect(call[0].where.exceedsBGV).toBe(true);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.chemBiologicalMonitoring.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/biological-monitoring');
    expect(res.status).toBe(500);
  });
});

// ── POST / ────────────────────────────────────────────────────────────────

describe('POST /api/biological-monitoring', () => {
  const validBody = {
    employeeId: 'EMP-001',
    employeeName: 'John Doe',
    substanceName: 'Lead',
    biomarker: 'Blood Lead Level',
    sampleType: 'BLOOD',
    collectionDate: '2026-01-20',
    measuredValue: 120,
    unit: 'µg/L',
    collectedBy: 'Occ Health Nurse',
  };

  it('creates a biological monitoring record', async () => {
    (mockPrisma.chemBiologicalMonitoring.create as jest.Mock).mockResolvedValue(mockRecord);
    const res = await request(app).post('/api/biological-monitoring').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('auto-calculates exceedsBGV=false when value is below BGV', async () => {
    const bodyWithBGV = { ...validBody, biologicalGuidanceValue: 200, measuredValue: 120 };
    (mockPrisma.chemBiologicalMonitoring.create as jest.Mock).mockResolvedValue({ ...mockRecord, exceedsBGV: false });
    await request(app).post('/api/biological-monitoring').send(bodyWithBGV);
    const [call] = (mockPrisma.chemBiologicalMonitoring.create as jest.Mock).mock.calls;
    expect(call[0].data.exceedsBGV).toBe(false);
  });

  it('auto-calculates exceedsBGV=true when value exceeds BGV', async () => {
    const bodyExceeding = { ...validBody, biologicalGuidanceValue: 200, measuredValue: 350 };
    (mockPrisma.chemBiologicalMonitoring.create as jest.Mock).mockResolvedValue({ ...mockRecord, exceedsBGV: true });
    const res = await request(app).post('/api/biological-monitoring').send(bodyExceeding);
    expect(res.status).toBe(201);
    const [call] = (mockPrisma.chemBiologicalMonitoring.create as jest.Mock).mock.calls;
    expect(call[0].data.exceedsBGV).toBe(true);
  });

  it('accepts all sampleType enum values', async () => {
    const types = ['BLOOD', 'URINE', 'EXHALED_AIR', 'SALIVA', 'HAIR', 'OTHER'];
    for (const sampleType of types) {
      (mockPrisma.chemBiologicalMonitoring.create as jest.Mock).mockResolvedValue({ ...mockRecord, sampleType });
      const res = await request(app).post('/api/biological-monitoring').send({ ...validBody, sampleType });
      expect(res.status).toBe(201);
    }
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/biological-monitoring').send({ employeeId: 'EMP-001' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid sampleType', async () => {
    const res = await request(app).post('/api/biological-monitoring').send({ ...validBody, sampleType: 'SWAB' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for negative measuredValue', async () => {
    const res = await request(app).post('/api/biological-monitoring').send({ ...validBody, measuredValue: -1 });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.chemBiologicalMonitoring.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/biological-monitoring').send(validBody);
    expect(res.status).toBe(500);
  });
});

// ── GET /alerts ───────────────────────────────────────────────────────────

describe('GET /api/biological-monitoring/alerts', () => {
  it('returns exceeding BGV and overdue monitoring', async () => {
    (mockPrisma.chemBiologicalMonitoring.findMany as jest.Mock)
      .mockResolvedValueOnce([{ ...mockRecord, exceedsBGV: true }])
      .mockResolvedValueOnce([{ ...mockRecord, nextMonitoringDue: new Date('2026-01-01') }]);
    const res = await request(app).get('/api/biological-monitoring/alerts');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('exceedingBGV');
    expect(res.body.data).toHaveProperty('overdueMonitoring');
  });

  it('returns empty arrays when no alerts', async () => {
    (mockPrisma.chemBiologicalMonitoring.findMany as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const res = await request(app).get('/api/biological-monitoring/alerts');
    expect(res.status).toBe(200);
    expect(res.body.data.exceedingBGV).toHaveLength(0);
    expect(res.body.data.overdueMonitoring).toHaveLength(0);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.chemBiologicalMonitoring.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/biological-monitoring/alerts');
    expect(res.status).toBe(500);
  });
});

// ── GET /:id ──────────────────────────────────────────────────────────────

describe('GET /api/biological-monitoring/:id', () => {
  it('returns a single record', async () => {
    (mockPrisma.chemBiologicalMonitoring.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    const res = await request(app).get('/api/biological-monitoring/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.biomarker).toBe('Blood Lead Level');
  });

  it('returns 404 for missing record', async () => {
    (mockPrisma.chemBiologicalMonitoring.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/biological-monitoring/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('returns 404 for soft-deleted record', async () => {
    (mockPrisma.chemBiologicalMonitoring.findUnique as jest.Mock).mockResolvedValue({ ...mockRecord, deletedAt: new Date() });
    const res = await request(app).get('/api/biological-monitoring/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
  });
});

// ── PUT /:id ──────────────────────────────────────────────────────────────

describe('PUT /api/biological-monitoring/:id', () => {
  it('updates a record', async () => {
    (mockPrisma.chemBiologicalMonitoring.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    (mockPrisma.chemBiologicalMonitoring.update as jest.Mock).mockResolvedValue({ ...mockRecord, correctionActions: 'Reduced exposure time' });
    const res = await request(app)
      .put('/api/biological-monitoring/00000000-0000-0000-0000-000000000001')
      .send({ correctionActions: 'Reduced exposure time' });
    expect(res.status).toBe(200);
    expect(res.body.data.correctionActions).toBe('Reduced exposure time');
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.chemBiologicalMonitoring.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/biological-monitoring/00000000-0000-0000-0000-000000000099')
      .send({ correctionActions: 'Review' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid sampleType on update', async () => {
    (mockPrisma.chemBiologicalMonitoring.findUnique as jest.Mock).mockResolvedValue(mockRecord);
    const res = await request(app)
      .put('/api/biological-monitoring/00000000-0000-0000-0000-000000000001')
      .send({ sampleType: 'INVALID' });
    expect(res.status).toBe(400);
  });
});
