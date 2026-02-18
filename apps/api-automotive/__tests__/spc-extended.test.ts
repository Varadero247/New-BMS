import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    spcChart: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    spcDataPoint: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  },
  Prisma: { SpcChartWhereInput: {} },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/spc-engine', () => ({
  xbarRChart: jest.fn().mockReturnValue({
    type: 'XBAR_R', centerLine: 50, ucl: 55, lcl: 45,
    dataPoints: [{ value: 50, outOfControl: false, violationRules: [] }],
    outOfControl: [],
  }),
  iMrChart: jest.fn().mockReturnValue({
    type: 'IMR', centerLine: 50, ucl: 55, lcl: 45,
    dataPoints: [{ value: 50, outOfControl: false, violationRules: [] }],
    outOfControl: [],
  }),
  pChart: jest.fn().mockReturnValue({
    type: 'P', centerLine: 0.05, ucl: 0.1, lcl: 0,
    dataPoints: [{ value: 0.05, outOfControl: false, violationRules: [] }],
    outOfControl: [],
  }),
  calculateCpk: jest.fn().mockReturnValue({
    cp: 1.5, cpk: 1.33, mean: 50, sigma: 1, status: 'CAPABLE',
  }),
  calculatePpk: jest.fn().mockReturnValue({
    pp: 1.4, ppk: 1.2, mean: 50, sigma: 1.1, status: 'CAPABLE',
  }),
  detectWesternElectricRules: jest.fn().mockReturnValue([]),
}));

import { prisma } from '../src/prisma';
import spcRouter from '../src/routes/spc';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/spc', spcRouter);

describe('SPC Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/spc', () => {
    const validBody = {
      title: 'Bearing Diameter Chart',
      partNumber: 'BRG-001',
      characteristic: 'OD',
      chartType: 'XBAR_R',
    };

    it('should create an SPC chart', async () => {
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.spcChart.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', refNumber: 'SPC-2602-0001', ...validBody, status: 'ACTIVE',
      });

      const res = await request(app).post('/api/spc').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const { title, ...noTitle } = validBody;
      const res = await request(app).post('/api/spc').send(noTitle);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing partNumber', async () => {
      const { partNumber, ...noPart } = validBody;
      const res = await request(app).post('/api/spc').send(noPart);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid chartType', async () => {
      const res = await request(app).post('/api/spc').send({
        ...validBody, chartType: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should accept IMR chartType', async () => {
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.spcChart.create as jest.Mock).mockResolvedValue({ id: 'spc-2' });

      const res = await request(app).post('/api/spc').send({
        ...validBody, chartType: 'IMR',
      });
      expect(res.status).toBe(201);
    });

    it('should accept P chartType', async () => {
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.spcChart.create as jest.Mock).mockResolvedValue({ id: 'spc-3' });

      const res = await request(app).post('/api/spc').send({
        ...validBody, chartType: 'P',
      });
      expect(res.status).toBe(201);
    });

    it('should accept optional spec limits', async () => {
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.spcChart.create as jest.Mock).mockResolvedValue({ id: 'spc-4' });

      const res = await request(app).post('/api/spc').send({
        ...validBody, usl: 55, lsl: 45, target: 50,
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.spcChart.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/spc').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/spc', () => {
    it('should list SPC charts', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001' }]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/spc');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/spc?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should filter by chartType', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/spc?chartType=XBAR_R');
      expect(mockPrisma.spcChart.findMany).toHaveBeenCalled();
    });

    it('should support search', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.spcChart.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/spc?search=bearing');
      expect(mockPrisma.spcChart.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.spcChart.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/spc');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/spc/alerts', () => {
    it('should list charts with OOC data', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get('/api/spc/alerts');
      expect(res.status).toBe(200);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.spcChart.findMany as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/spc/alerts');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/spc/:id', () => {
    it('should get chart with data points', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null, chartType: 'XBAR_R', subgroupSize: 5,
        dataPoints: [],
      });

      const res = await request(app).get('/api/spc/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/spc/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date(),
      });

      const res = await request(app).get('/api/spc/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/spc/:id/data', () => {
    it('should add a data point', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null, status: 'ACTIVE', chartType: 'IMR', refNumber: 'SPC-1', subgroupSize: 1,
      });
      (mockPrisma.spcDataPoint.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.spcDataPoint.create as jest.Mock).mockResolvedValue({
        id: 'dp-1', value: 50.1,
      });
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValue({});

      const res = await request(app).post('/api/spc/00000000-0000-0000-0000-000000000001/data').send({ value: 50.1 });
      expect(res.status).toBe(201);
    });

    it('should return 404 if chart not found', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/spc/00000000-0000-0000-0000-000000000099/data').send({ value: 50 });
      expect(res.status).toBe(404);
    });

    it('should return 400 if chart is inactive', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null, status: 'INACTIVE',
      });

      const res = await request(app).post('/api/spc/00000000-0000-0000-0000-000000000001/data').send({ value: 50 });
      expect(res.status).toBe(400);
    });

    it('should accept array of data points', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null, status: 'ACTIVE', chartType: 'XBAR_R', refNumber: 'SPC-1', subgroupSize: 5,
      });
      (mockPrisma.spcDataPoint.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.spcDataPoint.create as jest.Mock).mockResolvedValue({ id: 'dp-1', value: 50 });
      (mockPrisma.spcChart.update as jest.Mock).mockResolvedValue({});

      const res = await request(app).post('/api/spc/00000000-0000-0000-0000-000000000001/data').send([
        { value: 50.1 },
        { value: 50.2 },
        { value: 50.3 },
      ]);
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/spc/:id/capability', () => {
    it('should return capability indices', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null, usl: 55, lsl: 45, target: 50,
        refNumber: 'SPC-1', partNumber: 'BRG-001', characteristic: 'OD',
      });
      (mockPrisma.spcDataPoint.findMany as jest.Mock).mockResolvedValue([
        { value: 50 }, { value: 51 }, { value: 49 },
      ]);

      const res = await request(app).get('/api/spc/00000000-0000-0000-0000-000000000001/capability');
      expect(res.status).toBe(200);
      expect(res.body.data.cpk).toBeDefined();
      expect(res.body.data.ppk).toBeDefined();
    });

    it('should return 404 if chart not found', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/spc/00000000-0000-0000-0000-000000000099/capability');
      expect(res.status).toBe(404);
    });

    it('should return 400 if no spec limits', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null, usl: null, lsl: null,
      });

      const res = await request(app).get('/api/spc/00000000-0000-0000-0000-000000000001/capability');
      expect(res.status).toBe(400);
    });

    it('should return 400 if insufficient data', async () => {
      (mockPrisma.spcChart.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', deletedAt: null, usl: 55, lsl: 45,
      });
      (mockPrisma.spcDataPoint.findMany as jest.Mock).mockResolvedValue([{ value: 50 }]);

      const res = await request(app).get('/api/spc/00000000-0000-0000-0000-000000000001/capability');
      expect(res.status).toBe(400);
    });
  });
});
