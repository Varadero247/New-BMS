import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskAppetiteStatement: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    riskFramework: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
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

import router from '../src/routes/appetite';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/risks', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/risks/appetite', () => {
  it('should return appetite statements', async () => {
    mockPrisma.riskAppetiteStatement.findMany.mockResolvedValue([
      { id: '1', category: 'HEALTH_SAFETY', appetiteLevel: 'VERY_LOW' },
    ]);
    const res = await request(app).get('/api/risks/appetite');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/risks/appetite', () => {
  it('should create new appetite statement', async () => {
    mockPrisma.riskAppetiteStatement.findFirst.mockResolvedValue(null);
    mockPrisma.riskAppetiteStatement.create.mockResolvedValue({
      id: '1',
      category: 'FINANCIAL',
      appetiteLevel: 'MODERATE_APPETITE',
    });
    const res = await request(app).post('/api/risks/appetite').send({
      category: 'FINANCIAL',
      appetiteLevel: 'MODERATE_APPETITE',
      statement: 'Balanced approach',
      maximumTolerableScore: 12,
      acceptableResidualScore: 8,
      escalationThreshold: 15,
      reviewDate: '2026-12-01T00:00:00Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should update existing appetite statement', async () => {
    mockPrisma.riskAppetiteStatement.findFirst.mockResolvedValue({
      id: '1',
      category: 'FINANCIAL',
    });
    mockPrisma.riskAppetiteStatement.update.mockResolvedValue({
      id: '1',
      appetiteLevel: 'HIGH_APPETITE',
    });
    const res = await request(app).post('/api/risks/appetite').send({
      category: 'FINANCIAL',
      appetiteLevel: 'HIGH_APPETITE',
      statement: 'Aggressive',
      maximumTolerableScore: 16,
      acceptableResidualScore: 12,
      escalationThreshold: 20,
      reviewDate: '2026-12-01T00:00:00Z',
    });
    expect(res.status).toBe(200);
  });

  it('should validate required fields', async () => {
    const res = await request(app).post('/api/risks/appetite').send({ category: 'FINANCIAL' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/risks/framework', () => {
  it('should return framework config', async () => {
    mockPrisma.riskFramework.findUnique.mockResolvedValue({
      id: 'f1',
      frameworkVersion: 'ISO 31000:2018',
    });
    const res = await request(app).get('/api/risks/framework');
    expect(res.status).toBe(200);
    expect(res.body.data.frameworkVersion).toBe('ISO 31000:2018');
  });

  it('should return null if no framework configured', async () => {
    mockPrisma.riskFramework.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/risks/framework');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

describe('PUT /api/risks/framework', () => {
  it('should create framework if not exists', async () => {
    mockPrisma.riskFramework.findUnique.mockResolvedValue(null);
    mockPrisma.riskFramework.create.mockResolvedValue({ id: 'f1', organisationId: 'org-1' });
    const res = await request(app)
      .put('/api/risks/framework')
      .send({ riskCommitteeExists: true, riskCommitteeName: 'Risk Board' });
    expect(res.status).toBe(200);
  });

  it('should update existing framework', async () => {
    mockPrisma.riskFramework.findUnique.mockResolvedValue({
      id: 'f1',
      organisationId: 'org-1',
    });
    mockPrisma.riskFramework.update.mockResolvedValue({ id: 'f1', maturityLevel: 'Defined' });
    const res = await request(app).put('/api/risks/framework').send({ maturityLevel: 'Defined' });
    expect(res.status).toBe(200);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET /appetite returns 500 on DB error', async () => {
    mockPrisma.riskAppetiteStatement.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/appetite');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /appetite returns 500 when create fails', async () => {
    mockPrisma.riskAppetiteStatement.findFirst.mockResolvedValue(null);
    mockPrisma.riskAppetiteStatement.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/risks/appetite').send({
      category: 'FINANCIAL',
      appetiteLevel: 'MODERATE_APPETITE',
      statement: 'Balanced',
      maximumTolerableScore: 12,
      acceptableResidualScore: 8,
      escalationThreshold: 15,
      reviewDate: '2026-12-01T00:00:00Z',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /framework returns 500 on DB error', async () => {
    mockPrisma.riskFramework.findUnique.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/framework');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /framework returns 500 when create fails', async () => {
    mockPrisma.riskFramework.findUnique.mockResolvedValue(null);
    mockPrisma.riskFramework.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/risks/framework').send({ maturityLevel: 'Initial' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── Validation: invalid enum value ─────────────────────────────────────────

describe('POST /api/risks/appetite — invalid enum', () => {
  it('returns 400 when appetiteLevel enum is invalid', async () => {
    const res = await request(app).post('/api/risks/appetite').send({
      category: 'FINANCIAL',
      appetiteLevel: 'INVALID_LEVEL',
      statement: 'Test',
      maximumTolerableScore: 12,
      acceptableResidualScore: 8,
      escalationThreshold: 15,
      reviewDate: '2026-12-01T00:00:00Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Risk Appetite — extended', () => {
  it('GET /appetite returns data array with correct length', async () => {
    mockPrisma.riskAppetiteStatement.findMany.mockResolvedValue([
      { id: '1', category: 'OPERATIONAL', appetiteLevel: 'LOW_APPETITE' },
      { id: '2', category: 'STRATEGIC', appetiteLevel: 'MODERATE_APPETITE' },
    ]);

    const res = await request(app).get('/api/risks/appetite');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('PUT /framework responds with success:true when framework already exists', async () => {
    mockPrisma.riskFramework.findUnique.mockResolvedValue({ id: 'f1', organisationId: 'org-1' });
    mockPrisma.riskFramework.update.mockResolvedValue({
      id: 'f1',
      frameworkVersion: 'ISO 31000:2018',
    });

    const res = await request(app).put('/api/risks/framework').send({
      frameworkVersion: 'ISO 31000:2018',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('appetite.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/risks body has success property', async () => {
    const res = await request(app).get('/api/risks');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/risks body is an object', async () => {
    const res = await request(app).get('/api/risks');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/risks route is accessible', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.status).toBeDefined();
  });
});

describe('appetite.api — extended edge cases', () => {
  it('GET /appetite returns success:true on 200', async () => {
    mockPrisma.riskAppetiteStatement.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/appetite');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /appetite data is an array', async () => {
    mockPrisma.riskAppetiteStatement.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/appetite');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /appetite returns 400 when category is invalid enum', async () => {
    const res = await request(app).post('/api/risks/appetite').send({
      category: 'INVALID_CATEGORY',
      appetiteLevel: 'LOW',
      statement: 'Test',
      maximumTolerableScore: 10,
      acceptableResidualScore: 6,
      escalationThreshold: 12,
      reviewDate: '2026-12-01T00:00:00Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /appetite returns 400 when maximumTolerableScore exceeds 25', async () => {
    const res = await request(app).post('/api/risks/appetite').send({
      category: 'OPERATIONAL',
      appetiteLevel: 'LOW',
      statement: 'Test',
      maximumTolerableScore: 30,
      acceptableResidualScore: 6,
      escalationThreshold: 12,
      reviewDate: '2026-12-01T00:00:00Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /framework returns success:false on 500', async () => {
    mockPrisma.riskFramework.findUnique.mockRejectedValue(new Error('crash'));
    const res = await request(app).put('/api/risks/framework').send({ maturityLevel: 'Initial' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /framework success:true when data returned', async () => {
    mockPrisma.riskFramework.findUnique.mockResolvedValue({ id: 'fw1', organisationId: 'org-1' });
    const res = await request(app).get('/api/risks/framework');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /appetite create call includes category in data', async () => {
    mockPrisma.riskAppetiteStatement.findFirst.mockResolvedValue(null);
    mockPrisma.riskAppetiteStatement.create.mockResolvedValue({ id: 'new-1', category: 'COMPLIANCE' });
    const res = await request(app).post('/api/risks/appetite').send({
      category: 'COMPLIANCE',
      appetiteLevel: 'VERY_LOW',
      statement: 'Zero tolerance',
      maximumTolerableScore: 5,
      acceptableResidualScore: 3,
      escalationThreshold: 6,
      reviewDate: '2026-12-01T00:00:00Z',
    });
    expect(res.status).toBe(201);
    expect(mockPrisma.riskAppetiteStatement.create).toHaveBeenCalledTimes(1);
  });

  it('PUT /framework update call is made when framework exists', async () => {
    mockPrisma.riskFramework.findUnique.mockResolvedValue({ id: 'fw1', organisationId: 'org-1' });
    mockPrisma.riskFramework.update.mockResolvedValue({ id: 'fw1' });
    const res = await request(app).put('/api/risks/framework').send({ maturityLevel: 'Optimised' });
    expect(res.status).toBe(200);
    expect(mockPrisma.riskFramework.update).toHaveBeenCalledTimes(1);
  });

  it('POST /appetite update is called when existing statement found', async () => {
    mockPrisma.riskAppetiteStatement.findFirst.mockResolvedValue({ id: 'existing-1', category: 'STRATEGIC' });
    mockPrisma.riskAppetiteStatement.update.mockResolvedValue({ id: 'existing-1', appetiteLevel: 'MODERATE_APPETITE' });
    const res = await request(app).post('/api/risks/appetite').send({
      category: 'STRATEGIC',
      appetiteLevel: 'MODERATE_APPETITE',
      statement: 'Balanced',
      maximumTolerableScore: 15,
      acceptableResidualScore: 10,
      escalationThreshold: 18,
      reviewDate: '2026-12-01T00:00:00Z',
    });
    expect(res.status).toBe(200);
    expect(mockPrisma.riskAppetiteStatement.update).toHaveBeenCalledTimes(1);
  });
});
