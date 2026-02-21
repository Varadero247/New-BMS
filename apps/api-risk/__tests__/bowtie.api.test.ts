import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: { findFirst: jest.fn() },
    riskBowtie: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
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

import router from '../src/routes/bowtie';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/risks', router);
beforeEach(() => {
  jest.clearAllMocks();
});

const validBowtie = {
  topEvent: 'Chemical spill',
  threats: [{ id: 't1', description: 'Container failure', likelihood: 3 }],
  preventionBarriers: [
    { id: 'pb1', description: 'Bunded storage', type: 'PREVENTIVE', effectiveness: 'ADEQUATE' },
  ],
  consequences: [{ id: 'c1', description: 'Environmental contamination', severity: 4 }],
  mitigationBarriers: [
    { id: 'mb1', description: 'Spill response team', type: 'REACTIVE', effectiveness: 'STRONG' },
  ],
};

describe('GET /api/risks/:id/bowtie', () => {
  it('should return bowtie or null', async () => {
    mockPrisma.riskBowtie.findUnique.mockResolvedValue(null);
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/bowtie');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  it('should return existing bowtie', async () => {
    mockPrisma.riskBowtie.findUnique.mockResolvedValue({ id: 'b1', topEvent: 'Fire' });
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/bowtie');
    expect(res.status).toBe(200);
    expect(res.body.data.topEvent).toBe('Fire');
  });
});

describe('POST /api/risks/:id/bowtie', () => {
  it('should create bowtie for HIGH risk', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      residualRiskLevel: 'HIGH',
      inherentRiskLevel: 'HIGH',
    });
    mockPrisma.riskBowtie.findUnique.mockResolvedValue(null);
    mockPrisma.riskBowtie.create.mockResolvedValue({ id: 'b1', ...validBowtie });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/bowtie')
      .send(validBowtie);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject bowtie for LOW risk', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      residualRiskLevel: 'LOW',
      inherentRiskLevel: 'LOW',
    });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/bowtie')
      .send(validBowtie);
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('HIGH');
  });

  it('should reject bowtie for MEDIUM risk', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      residualRiskLevel: 'MEDIUM',
      inherentRiskLevel: 'MEDIUM',
    });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/bowtie')
      .send(validBowtie);
    expect(res.status).toBe(400);
  });

  it('should update existing bowtie', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      residualRiskLevel: 'CRITICAL',
    });
    mockPrisma.riskBowtie.findUnique.mockResolvedValue({ id: 'b1', version: '1.0' });
    mockPrisma.riskBowtie.update.mockResolvedValue({
      id: 'b1',
      ...validBowtie,
      version: '1.1',
    });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/bowtie')
      .send(validBowtie);
    expect(res.status).toBe(200);
  });

  it('should return 404 if risk not found', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/bowtie')
      .send(validBowtie);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/risks/bowtie/all', () => {
  it('should return all bowties', async () => {
    mockPrisma.riskBowtie.findMany.mockResolvedValue([{ id: 'b1', topEvent: 'Fire' }]);
    const res = await request(app).get('/api/risks/bowtie/all');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('data is an array', async () => {
    mockPrisma.riskBowtie.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/bowtie/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('findMany is called once per request', async () => {
    mockPrisma.riskBowtie.findMany.mockResolvedValue([]);
    await request(app).get('/api/risks/bowtie/all');
    expect(mockPrisma.riskBowtie.findMany).toHaveBeenCalledTimes(1);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET /:id/bowtie returns 500 on DB error', async () => {
    mockPrisma.riskBowtie.findUnique.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/bowtie');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/bowtie returns 500 when create fails', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      residualRiskLevel: 'HIGH',
    });
    mockPrisma.riskBowtie.findUnique.mockResolvedValue(null);
    mockPrisma.riskBowtie.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/bowtie')
      .send(validBowtie);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /bowtie/all returns 500 on DB error', async () => {
    mockPrisma.riskBowtie.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/bowtie/all');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Risk Bowtie — extended', () => {
  it('POST /:id/bowtie with CRITICAL risk creates new bowtie successfully', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      residualRiskLevel: 'CRITICAL',
      inherentRiskLevel: 'CRITICAL',
    });
    mockPrisma.riskBowtie.findUnique.mockResolvedValue(null);
    mockPrisma.riskBowtie.create.mockResolvedValue({ id: 'new-bowtie', ...validBowtie });

    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/bowtie')
      .send(validBowtie);

    expect(res.status).toBe(201);
    expect(res.body.data.topEvent).toBe('Chemical spill');
  });

  it('GET /bowtie/all returns success:true with populated list', async () => {
    mockPrisma.riskBowtie.findMany.mockResolvedValue([
      { id: 'b1', topEvent: 'Fire' },
      { id: 'b2', topEvent: 'Flood' },
    ]);

    const res = await request(app).get('/api/risks/bowtie/all');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });
});
