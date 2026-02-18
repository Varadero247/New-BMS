import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    msaStudy: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    msaMeasurement: { create: jest.fn() },
    $transaction: jest.fn(),
  },
  Prisma: { MsaStudyWhereInput: {} },
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

import { prisma } from '../src/prisma';
import msaRouter from '../src/routes/msa';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/msa', msaRouter);

describe('MSA Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/msa', () => {
    const validBody = {
      title: 'Caliper GR&R Study',
      studyType: 'GRR_CROSSED',
      gageName: 'Digital Caliper #5',
      characteristic: 'Length',
      operatorCount: 3,
    };

    it('should create an MSA study', async () => {
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.msaStudy.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'MSA-2602-0001',
        ...validBody,
        status: 'DRAFT',
      });

      const res = await request(app).post('/api/msa').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const { title, ...noTitle } = validBody;
      const res = await request(app).post('/api/msa').send(noTitle);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing gageName', async () => {
      const { gageName, ...noGage } = validBody;
      const res = await request(app).post('/api/msa').send(noGage);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing characteristic', async () => {
      const { characteristic, ...noChar } = validBody;
      const res = await request(app).post('/api/msa').send(noChar);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid studyType', async () => {
      const res = await request(app)
        .post('/api/msa')
        .send({
          ...validBody,
          studyType: 'INVALID',
        });
      expect(res.status).toBe(400);
    });

    it('should accept BIAS studyType', async () => {
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.msaStudy.create as jest.Mock).mockResolvedValue({ id: 'msa-2' });

      const res = await request(app)
        .post('/api/msa')
        .send({
          ...validBody,
          studyType: 'BIAS',
        });
      expect(res.status).toBe(201);
    });

    it('should accept ATTRIBUTE studyType', async () => {
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.msaStudy.create as jest.Mock).mockResolvedValue({ id: 'msa-3' });

      const res = await request(app)
        .post('/api/msa')
        .send({
          ...validBody,
          studyType: 'ATTRIBUTE',
        });
      expect(res.status).toBe(201);
    });

    it('should return 400 for operatorCount 0', async () => {
      const res = await request(app)
        .post('/api/msa')
        .send({
          ...validBody,
          operatorCount: 0,
        });
      expect(res.status).toBe(400);
    });

    it('should accept optional specification and tolerance', async () => {
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.msaStudy.create as jest.Mock).mockResolvedValue({ id: 'msa-4' });

      const res = await request(app)
        .post('/api/msa')
        .send({
          ...validBody,
          specification: '50.0 +/- 0.1mm',
          tolerance: '0.2mm',
        });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.msaStudy.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/msa').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/msa', () => {
    it('should list MSA studies', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValue([
        { id: '00000000-0000-0000-0000-000000000001' },
      ]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/msa');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValue(30);

      const res = await request(app).get('/api/msa?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should filter by studyType', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.msaStudy.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/msa?studyType=GRR_CROSSED');
      expect(mockPrisma.msaStudy.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.msaStudy.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.msaStudy.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/msa');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/msa/:id', () => {
    it('should get study with measurements', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        measurements: [],
      });

      const res = await request(app).get('/api/msa/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/msa/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/msa/:id/data', () => {
    it('should enter measurement data', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
        return cb({
          msaMeasurement: { create: jest.fn().mockResolvedValue({}) },
          msaStudy: { update: jest.fn().mockResolvedValue({}) },
        });
      });

      const res = await request(app)
        .post('/api/msa/00000000-0000-0000-0000-000000000001/data')
        .send({
          measurements: [
            { operator: 'Op1', partNumber: 1, trial: 1, value: 50.1 },
            { operator: 'Op1', partNumber: 1, trial: 2, value: 50.2 },
          ],
        });
      expect(res.status).toBe(201);
    });

    it('should return 404 if study not found', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/msa/00000000-0000-0000-0000-000000000099/data')
        .send({
          measurements: [{ operator: 'Op1', partNumber: 1, trial: 1, value: 50 }],
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 for empty measurements', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/msa/00000000-0000-0000-0000-000000000001/data')
        .send({
          measurements: [],
        });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/msa/:id/results', () => {
    it('should return 404 if not found', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/msa/00000000-0000-0000-0000-000000000099/results');
      expect(res.status).toBe(404);
    });

    it('should return 400 if no data', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        studyType: 'GRR_CROSSED',
        measurements: [],
      });

      const res = await request(app).get('/api/msa/00000000-0000-0000-0000-000000000001/results');
      expect(res.status).toBe(400);
    });

    it('should compute GRR results for crossed study', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        studyType: 'GRR_CROSSED',
        numTrials: 3,
        measurements: [
          { operator: 'A', partNumber: 1, trial: 1, value: 10 },
          { operator: 'A', partNumber: 1, trial: 2, value: 11 },
          { operator: 'A', partNumber: 1, trial: 3, value: 10 },
          { operator: 'A', partNumber: 2, trial: 1, value: 20 },
          { operator: 'A', partNumber: 2, trial: 2, value: 21 },
          { operator: 'A', partNumber: 2, trial: 3, value: 20 },
          { operator: 'B', partNumber: 1, trial: 1, value: 11 },
          { operator: 'B', partNumber: 1, trial: 2, value: 12 },
          { operator: 'B', partNumber: 1, trial: 3, value: 11 },
          { operator: 'B', partNumber: 2, trial: 1, value: 21 },
          { operator: 'B', partNumber: 2, trial: 2, value: 22 },
          { operator: 'B', partNumber: 2, trial: 3, value: 21 },
        ],
      });
      (mockPrisma.msaStudy.update as jest.Mock).mockResolvedValue({});

      const res = await request(app).get('/api/msa/00000000-0000-0000-0000-000000000001/results');
      expect(res.status).toBe(200);
      expect(res.body.data.result).toBeDefined();
      expect(res.body.data.gageRR).toBeDefined();
    });

    it('should compute simple stats for non-GRR study', async () => {
      (mockPrisma.msaStudy.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        studyType: 'BIAS',
        numTrials: 1,
        measurements: [
          { operator: 'A', partNumber: 1, trial: 1, value: 50.1 },
          { operator: 'A', partNumber: 1, trial: 2, value: 50.2 },
          { operator: 'A', partNumber: 1, trial: 3, value: 49.9 },
        ],
      });
      (mockPrisma.msaStudy.update as jest.Mock).mockResolvedValue({});

      const res = await request(app).get('/api/msa/00000000-0000-0000-0000-000000000001/results');
      expect(res.status).toBe(200);
      expect(res.body.data.statistics).toBeDefined();
      expect(res.body.data.statistics.mean).toBeDefined();
    });
  });
});
