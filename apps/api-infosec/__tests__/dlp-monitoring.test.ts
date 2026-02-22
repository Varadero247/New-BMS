import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    isDlpPolicy: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    isDlpIncident: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    isConfigBaseline: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    isInfoDeletion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    isMonitoringReview: {
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

import router from '../src/routes/dlp-monitoring';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/dlp', router);

beforeEach(() => jest.clearAllMocks());

const mockPolicy = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Credit Card Data',
  scope: 'EMAIL',
  dataTypes: ['PAN', 'CVV'],
  action: 'BLOCK',
  description: 'Prevents credit card data exfiltration via email',
  owner: 'CISO',
  enabled: true,
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
};

const mockIncident = {
  id: '00000000-0000-0000-0000-000000000010',
  policyName: 'Credit Card Data',
  eventDate: new Date('2026-02-01'),
  dataType: 'PAN',
  channel: 'EMAIL',
  userIdentifier: 'user@example.com',
  blocked: true,
  severity: 'HIGH',
  detectedBy: 'DLP Engine',
  falsePositive: false,
  deletedAt: null,
};

const mockBaseline = {
  id: '00000000-0000-0000-0000-000000000020',
  systemName: 'Windows Server 2022',
  systemType: 'SERVER',
  baselineVersion: 'v2.1',
  baselineDate: new Date('2026-01-01'),
  configurationItems: ['TLS 1.2 enabled', 'SMBv1 disabled'],
  reviewedBy: 'IT Security',
  deletedAt: null,
};

// ── DLP Policies ──────────────────────────────────────────────────────────

describe('GET /api/dlp/dlp-policies', () => {
  it('returns paginated DLP policies', async () => {
    (mockPrisma.isDlpPolicy.findMany as jest.Mock).mockResolvedValue([mockPolicy]);
    (mockPrisma.isDlpPolicy.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/dlp/dlp-policies');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by scope', async () => {
    (mockPrisma.isDlpPolicy.findMany as jest.Mock).mockResolvedValue([mockPolicy]);
    (mockPrisma.isDlpPolicy.count as jest.Mock).mockResolvedValue(1);
    await request(app).get('/api/dlp/dlp-policies?scope=EMAIL');
    const [call] = (mockPrisma.isDlpPolicy.findMany as jest.Mock).mock.calls;
    expect(call[0].where.scope).toBe('EMAIL');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isDlpPolicy.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/dlp/dlp-policies');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/dlp/dlp-policies', () => {
  const validBody = {
    name: 'Credit Card Data',
    scope: 'EMAIL',
    dataTypes: ['PAN'],
    action: 'BLOCK',
    description: 'Prevents CC exfiltration',
    owner: 'CISO',
  };

  it('creates a DLP policy', async () => {
    (mockPrisma.isDlpPolicy.create as jest.Mock).mockResolvedValue(mockPolicy);
    const res = await request(app).post('/api/dlp/dlp-policies').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('accepts all scope values', async () => {
    for (const scope of ['ENDPOINT', 'EMAIL', 'CLOUD', 'NETWORK', 'ALL']) {
      (mockPrisma.isDlpPolicy.create as jest.Mock).mockResolvedValue({ ...mockPolicy, scope });
      const res = await request(app).post('/api/dlp/dlp-policies').send({ ...validBody, scope });
      expect(res.status).toBe(201);
    }
  });

  it('accepts all action values', async () => {
    for (const action of ['MONITOR', 'ALERT', 'BLOCK', 'QUARANTINE']) {
      (mockPrisma.isDlpPolicy.create as jest.Mock).mockResolvedValue({ ...mockPolicy, action });
      const res = await request(app).post('/api/dlp/dlp-policies').send({ ...validBody, action });
      expect(res.status).toBe(201);
    }
  });

  it('returns 400 when dataTypes is empty', async () => {
    const res = await request(app).post('/api/dlp/dlp-policies').send({ ...validBody, dataTypes: [] });
    expect(res.status).toBe(400);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/dlp/dlp-policies').send({ name: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isDlpPolicy.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/dlp/dlp-policies').send(validBody);
    expect(res.status).toBe(500);
  });
});

describe('GET /api/dlp/dlp-policies/:id', () => {
  it('returns a single policy', async () => {
    (mockPrisma.isDlpPolicy.findUnique as jest.Mock).mockResolvedValue(mockPolicy);
    const res = await request(app).get('/api/dlp/dlp-policies/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Credit Card Data');
  });

  it('returns 404 for missing policy', async () => {
    (mockPrisma.isDlpPolicy.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/dlp/dlp-policies/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/dlp/dlp-policies/:id', () => {
  it('updates a policy', async () => {
    (mockPrisma.isDlpPolicy.findUnique as jest.Mock).mockResolvedValue(mockPolicy);
    (mockPrisma.isDlpPolicy.update as jest.Mock).mockResolvedValue({ ...mockPolicy, enabled: false });
    const res = await request(app)
      .put('/api/dlp/dlp-policies/00000000-0000-0000-0000-000000000001')
      .send({ enabled: false });
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    (mockPrisma.isDlpPolicy.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .put('/api/dlp/dlp-policies/00000000-0000-0000-0000-000000000099')
      .send({ enabled: false });
    expect(res.status).toBe(404);
  });
});

// ── DLP Incidents ─────────────────────────────────────────────────────────

describe('GET /api/dlp/dlp-incidents', () => {
  it('returns paginated DLP incidents', async () => {
    (mockPrisma.isDlpIncident.findMany as jest.Mock).mockResolvedValue([mockIncident]);
    (mockPrisma.isDlpIncident.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/dlp/dlp-incidents');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isDlpIncident.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/dlp/dlp-incidents');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/dlp/dlp-incidents', () => {
  const validBody = {
    policyName: 'Credit Card Data',
    eventDate: '2026-02-01',
    dataType: 'PAN',
    channel: 'EMAIL',
    userIdentifier: 'user@example.com',
    severity: 'HIGH',
    detectedBy: 'DLP Engine',
  };

  it('creates a DLP incident', async () => {
    (mockPrisma.isDlpIncident.create as jest.Mock).mockResolvedValue(mockIncident);
    const res = await request(app).post('/api/dlp/dlp-incidents').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('accepts all channel values', async () => {
    const channels = ['EMAIL', 'USB', 'CLOUD_UPLOAD', 'PRINT', 'COPY_PASTE', 'SCREENSHOT', 'OTHER'];
    for (const channel of channels) {
      (mockPrisma.isDlpIncident.create as jest.Mock).mockResolvedValue({ ...mockIncident, channel });
      const res = await request(app).post('/api/dlp/dlp-incidents').send({ ...validBody, channel });
      expect(res.status).toBe(201);
    }
  });

  it('returns 400 for invalid channel', async () => {
    const res = await request(app).post('/api/dlp/dlp-incidents').send({ ...validBody, channel: 'FAX' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/dlp/dlp-incidents').send({ policyName: 'Test' });
    expect(res.status).toBe(400);
  });
});

// ── Config Baselines ──────────────────────────────────────────────────────

describe('GET /api/dlp/config-baselines', () => {
  it('returns paginated baselines', async () => {
    (mockPrisma.isConfigBaseline.findMany as jest.Mock).mockResolvedValue([mockBaseline]);
    (mockPrisma.isConfigBaseline.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/dlp/config-baselines');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/dlp/config-baselines', () => {
  const validBody = {
    systemName: 'Windows Server 2022',
    systemType: 'SERVER',
    baselineVersion: 'v2.1',
    baselineDate: '2026-01-01',
    configurationItems: ['TLS 1.2 enabled', 'SMBv1 disabled'],
    reviewedBy: 'IT Security',
  };

  it('creates a config baseline', async () => {
    (mockPrisma.isConfigBaseline.create as jest.Mock).mockResolvedValue(mockBaseline);
    const res = await request(app).post('/api/dlp/config-baselines').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/dlp/config-baselines').send({ systemName: 'Win' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when configurationItems is empty', async () => {
    const res = await request(app).post('/api/dlp/config-baselines').send({ ...validBody, configurationItems: [] });
    expect(res.status).toBe(400);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isConfigBaseline.create as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).post('/api/dlp/config-baselines').send(validBody);
    expect(res.status).toBe(500);
  });
});

// ── Info Deletion ─────────────────────────────────────────────────────────

describe('POST /api/dlp/info-deletion', () => {
  const validBody = {
    assetDescription: 'Old laptop HDD',
    assetType: 'HDD',
    dataClassification: 'CONFIDENTIAL',
    deletionMethod: 'PHYSICAL_DESTRUCTION',
    deletionDate: '2026-01-10',
    performedBy: 'IT Team',
  };

  it('creates an info deletion record', async () => {
    (mockPrisma.isInfoDeletion.create as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000030', ...validBody });
    const res = await request(app).post('/api/dlp/info-deletion').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/dlp/info-deletion').send({ assetDescription: 'HDD' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/dlp/info-deletion', () => {
  it('returns paginated info deletion records', async () => {
    const mockDeletion = {
      id: '00000000-0000-0000-0000-000000000030',
      assetDescription: 'Old laptop HDD',
      assetType: 'HDD',
      dataClassification: 'CONFIDENTIAL',
      deletionMethod: 'PHYSICAL_DESTRUCTION',
      deletedAt: null,
    };
    (mockPrisma.isInfoDeletion.findMany as jest.Mock).mockResolvedValue([mockDeletion]);
    (mockPrisma.isInfoDeletion.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/dlp/info-deletion');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isInfoDeletion.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/dlp/info-deletion');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/dlp/monitoring-reviews', () => {
  it('returns paginated monitoring reviews', async () => {
    const mockReview = {
      id: '00000000-0000-0000-0000-000000000040',
      reviewType: 'WEEKLY',
      reviewDate: new Date('2026-01-15'),
      reviewedBy: 'Security Team',
      findings: 'No anomalies detected',
      deletedAt: null,
    };
    (mockPrisma.isMonitoringReview.findMany as jest.Mock).mockResolvedValue([mockReview]);
    (mockPrisma.isMonitoringReview.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/dlp/monitoring-reviews');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns 500 on DB error', async () => {
    (mockPrisma.isMonitoringReview.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/dlp/monitoring-reviews');
    expect(res.status).toBe(500);
  });
});
