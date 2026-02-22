import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    isCloudService: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    isIctReadiness: {
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

import router from '../src/routes/cloud-security';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/cloud-security', router);

beforeEach(() => jest.clearAllMocks());

const mockService = {
  id: '00000000-0000-0000-0000-000000000001',
  serviceName: 'AWS S3',
  provider: 'Amazon',
  serviceType: 'IAAS',
  dataClassification: 'CONFIDENTIAL',
  personalDataProcessed: true,
  encryptionAtRest: true,
  encryptionInTransit: true,
  businessOwner: 'John Smith',
  status: 'ACTIVE',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
};

const mockIctRecord = {
  id: '00000000-0000-0000-0000-000000000010',
  systemName: 'ERP System',
  criticality: 'CRITICAL',
  ictOwner: 'IT Director',
  rto: 60,
  rpo: 15,
  status: 'OPERATIONAL',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
};

// ── Cloud Services ────────────────────────────────────────────────────────

describe('GET /api/cloud-security/cloud-services', () => {
  it('returns paginated cloud services', async () => {
    (mockPrisma.isCloudService.findMany as jest.Mock).mockResolvedValue([mockService]);
    (mockPrisma.isCloudService.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/cloud-security/cloud-services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by serviceType', async () => {
    (mockPrisma.isCloudService.findMany as jest.Mock).mockResolvedValue([mockService]);
    (mockPrisma.isCloudService.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/cloud-security/cloud-services?serviceType=IAAS');
    const [call] = (mockPrisma.isCloudService.findMany as jest.Mock).mock.calls;
    expect(call[0].where.serviceType).toBe('IAAS');
  });

  it('filters by dataClassification', async () => {
    (mockPrisma.isCloudService.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.isCloudService.count as jest.Mock).mockResolvedValue(0);
    await request(app).get('/api/cloud-security/cloud-services?dataClassification=RESTRICTED');
    const [call] = (mockPrisma.isCloudService.findMany as jest.Mock).mock.calls;
    expect(call[0].where.dataClassification).toBe('RESTRICTED');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isCloudService.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/cloud-security/cloud-services');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/cloud-security/cloud-services', () => {
  const validBody = {
    serviceName: 'AWS S3',
    provider: 'Amazon',
    serviceType: 'IAAS',
    dataClassification: 'CONFIDENTIAL',
    businessOwner: 'John Smith',
  };

  it('creates a cloud service record with ACTIVE status', async () => {
    (mockPrisma.isCloudService.create as jest.Mock).mockResolvedValue(mockService);
    const res = await request(app).post('/api/cloud-security/cloud-services').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const [call] = (mockPrisma.isCloudService.create as jest.Mock).mock.calls;
    expect(call[0].data.status).toBe('ACTIVE');
  });

  it('accepts all serviceType values', async () => {
    for (const serviceType of ['IAAS', 'PAAS', 'SAAS', 'CAAS', 'OTHER']) {
      (mockPrisma.isCloudService.create as jest.Mock).mockResolvedValue({ ...mockService, serviceType });
      const res = await request(app).post('/api/cloud-security/cloud-services').send({ ...validBody, serviceType });
      expect(res.status).toBe(201);
    }
  });

  it('accepts all dataClassification values', async () => {
    for (const dc of ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']) {
      (mockPrisma.isCloudService.create as jest.Mock).mockResolvedValue({ ...mockService, dataClassification: dc });
      const res = await request(app).post('/api/cloud-security/cloud-services').send({ ...validBody, dataClassification: dc });
      expect(res.status).toBe(201);
    }
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/cloud-security/cloud-services').send({ serviceName: 'AWS' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid serviceType', async () => {
    const res = await request(app).post('/api/cloud-security/cloud-services').send({ ...validBody, serviceType: 'UNKNOWN' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isCloudService.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/cloud-security/cloud-services').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('GET /api/cloud-security/cloud-services/:id', () => {
  it('returns a single cloud service', async () => {
    (mockPrisma.isCloudService.findUnique as jest.Mock).mockResolvedValue(mockService);
    const res = await request(app).get('/api/cloud-security/cloud-services/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.serviceName).toBe('AWS S3');
  });

  it('returns 404 for missing service', async () => {
    (mockPrisma.isCloudService.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/cloud-security/cloud-services/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });

  it('returns 404 for soft-deleted service', async () => {
    (mockPrisma.isCloudService.findUnique as jest.Mock).mockResolvedValue({ ...mockService, deletedAt: new Date() });
    const res = await request(app).get('/api/cloud-security/cloud-services/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/cloud-security/cloud-services/:id', () => {
  it('updates a cloud service', async () => {
    (mockPrisma.isCloudService.findUnique as jest.Mock).mockResolvedValue(mockService);
    (mockPrisma.isCloudService.update as jest.Mock).mockResolvedValue({ ...mockService, status: 'UNDER_REVIEW' });
    const res = await request(app)
      .put('/api/cloud-security/cloud-services/00000000-0000-0000-0000-000000000001')
      .send({ status: 'UNDER_REVIEW' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.isCloudService.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/cloud-security/cloud-services/00000000-0000-0000-0000-000000000099')
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(404);
  });
});

// ── ICT Readiness ─────────────────────────────────────────────────────────

describe('GET /api/cloud-security/ict-readiness', () => {
  it('returns paginated ICT readiness records', async () => {
    (mockPrisma.isIctReadiness.findMany as jest.Mock).mockResolvedValue([mockIctRecord]);
    (mockPrisma.isIctReadiness.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/cloud-security/ict-readiness');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isIctReadiness.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/cloud-security/ict-readiness');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/cloud-security/ict-readiness', () => {
  const validBody = {
    systemName: 'ERP System',
    criticality: 'CRITICAL',
    ictOwner: 'IT Director',
  };

  it('creates an ICT readiness record', async () => {
    (mockPrisma.isIctReadiness.create as jest.Mock).mockResolvedValue(mockIctRecord);
    const res = await request(app).post('/api/cloud-security/ict-readiness').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('accepts all criticality values', async () => {
    for (const criticality of ['NON_CRITICAL', 'IMPORTANT', 'CRITICAL', 'VITAL']) {
      (mockPrisma.isIctReadiness.create as jest.Mock).mockResolvedValue({ ...mockIctRecord, criticality });
      const res = await request(app).post('/api/cloud-security/ict-readiness').send({ ...validBody, criticality });
      expect(res.status).toBe(201);
    }
  });

  it('accepts optional RTO and RPO', async () => {
    (mockPrisma.isIctReadiness.create as jest.Mock).mockResolvedValue(mockIctRecord);
    const res = await request(app).post('/api/cloud-security/ict-readiness').send({ ...validBody, rto: 60, rpo: 15 });
    expect(res.status).toBe(201);
  });

  it('returns 400 when ictOwner missing', async () => {
    const { ictOwner, ...body } = validBody;
    const res = await request(app).post('/api/cloud-security/ict-readiness').send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for invalid criticality', async () => {
    const res = await request(app).post('/api/cloud-security/ict-readiness').send({ ...validBody, criticality: 'EXTREME' });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isIctReadiness.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/cloud-security/ict-readiness').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/cloud-security/ict-readiness/:id', () => {
  it('updates an ICT readiness record', async () => {
    (mockPrisma.isIctReadiness.findUnique as jest.Mock).mockResolvedValue(mockIctRecord);
    (mockPrisma.isIctReadiness.update as jest.Mock).mockResolvedValue({ ...mockIctRecord, failoverCapability: true });
    const res = await request(app)
      .put('/api/cloud-security/ict-readiness/00000000-0000-0000-0000-000000000010')
      .send({ failoverCapability: true });
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.isIctReadiness.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/cloud-security/ict-readiness/00000000-0000-0000-0000-000000000099')
      .send({ criticality: 'VITAL' });
    expect(res.status).toBe(404);
  });
});
