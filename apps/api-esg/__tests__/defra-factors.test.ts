import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgDefraFactor: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'test@test.com', role: 'ADMIN', orgId: 'org-001' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import defraFactorsRouter from '../src/routes/defra-factors';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/defra-factors', defraFactorsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockDefraFactor = {
  id: '00000000-0000-0000-0000-000000000001',
  orgId: 'org-001',
  category: 'Electricity',
  subCategory: 'UK Grid',
  factor: 0.233,
  unit: 'kgCO2e/kWh',
  year: 2026,
  source: 'DEFRA 2026',
  createdBy: '00000000-0000-0000-0000-000000000001',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('GET /api/defra-factors', () => {
  it('should return list of DEFRA factors', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([mockDefraFactor]);

    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return empty array when no DEFRA factors exist', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should filter by orgId from authenticated user', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockResolvedValue([mockDefraFactor]);

    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(200);
    expect(prisma.esgDefraFactor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: 'org-001', deletedAt: null }),
      })
    );
  });

  it('should return 500 when database query fails', async () => {
    (prisma.esgDefraFactor.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/defra-factors');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});

describe('POST /api/defra-factors', () => {
  it('should create a DEFRA factor entry', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(mockDefraFactor);

    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      subCategory: 'UK Grid',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
      year: 2026,
      source: 'DEFRA 2026',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should attach orgId and createdBy from authenticated user', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockResolvedValue(mockDefraFactor);

    await request(app).post('/api/defra-factors').send({
      category: 'Fuel',
      factor: 2.5,
      unit: 'kgCO2e/litre',
      year: 2026,
      source: 'DEFRA 2026',
    });

    expect(prisma.esgDefraFactor.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: 'org-001',
          createdBy: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('should return 400 when database create fails', async () => {
    (prisma.esgDefraFactor.create as jest.Mock).mockRejectedValue(new Error('Unique constraint violation'));

    const res = await request(app).post('/api/defra-factors').send({
      category: 'Electricity',
      factor: 0.233,
      unit: 'kgCO2e/kWh',
      year: 2026,
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CREATE_ERROR');
  });
});
