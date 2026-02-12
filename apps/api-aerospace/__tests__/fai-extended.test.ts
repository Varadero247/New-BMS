import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    firstArticleInspection: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
  },
  Prisma: { FirstArticleInspectionWhereInput: {} },
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
import faiRouter from '../src/routes/fai';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/fai', faiRouter);

describe('FAI Routes (AS9102)', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/fai', () => {
    const validBody = {
      title: 'Turbine Blade FAI',
      partNumber: 'TB-001',
      partName: 'Turbine Blade',
      revision: 'A',
    };

    it('should create an FAI', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValue({
        id: 'fai-1', refNumber: 'FAI-2602-0001', ...validBody, status: 'PLANNING',
      });

      const res = await request(app).post('/api/fai').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const { title, ...no } = validBody;
      const res = await request(app).post('/api/fai').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing partNumber', async () => {
      const { partNumber, ...no } = validBody;
      const res = await request(app).post('/api/fai').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing partName', async () => {
      const { partName, ...no } = validBody;
      const res = await request(app).post('/api/fai').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing revision', async () => {
      const { revision, ...no } = validBody;
      const res = await request(app).post('/api/fai').send(no);
      expect(res.status).toBe(400);
    });

    it('should accept FULL faiType', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValue({ id: 'fai-2' });

      const res = await request(app).post('/api/fai').send({ ...validBody, faiType: 'FULL' });
      expect(res.status).toBe(201);
    });

    it('should accept PARTIAL faiType', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValue({ id: 'fai-3' });

      const res = await request(app).post('/api/fai').send({ ...validBody, faiType: 'PARTIAL' });
      expect(res.status).toBe(201);
    });

    it('should accept DELTA faiType', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValue({ id: 'fai-4' });

      const res = await request(app).post('/api/fai').send({ ...validBody, faiType: 'DELTA' });
      expect(res.status).toBe(201);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValue({ id: 'fai-5' });

      const res = await request(app).post('/api/fai').send({
        ...validBody,
        drawingNumber: 'DWG-TB-001',
        customer: 'Boeing',
        poNumber: 'PO-12345',
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/fai').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/fai', () => {
    it('should list FAIs', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([{ id: 'fai-1' }]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/fai');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/fai?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should support search', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/fai?search=turbine');
      expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/fai');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/fai/:id', () => {
    it('should get FAI with parsed part data', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null,
        part1Data: JSON.stringify([{ charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '50.05', pass: true }]),
        part2Data: null,
        part3Data: null,
        openItems: null,
      });

      const res = await request(app).get('/api/fai/fai-1');
      expect(res.status).toBe(200);
      expect(res.body.data.part1Characteristics).toHaveLength(1);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/fai/fake');
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: new Date(),
      });

      const res = await request(app).get('/api/fai/fai-1');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/fai/:id/part1', () => {
    it('should update Part 1 characteristics', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null, status: 'PLANNING',
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({ id: 'fai-1', part1Status: 'COMPLETED' });

      const res = await request(app).put('/api/fai/fai-1/part1').send({
        characteristics: [
          { charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '50.05', pass: true },
        ],
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/fai/fake/part1').send({
        characteristics: [{ charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '50.05', pass: true }],
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 if FAI is APPROVED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null, status: 'APPROVED',
      });

      const res = await request(app).put('/api/fai/fai-1/part1').send({
        characteristics: [{ charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '50', pass: true }],
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 if FAI is REJECTED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null, status: 'REJECTED',
      });

      const res = await request(app).put('/api/fai/fai-1/part1').send({
        characteristics: [{ charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '50', pass: true }],
      });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/fai/:id/part2', () => {
    it('should update Part 2 documents', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null, status: 'IN_PROGRESS',
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({ id: 'fai-1' });

      const res = await request(app).put('/api/fai/fai-1/part2').send({
        documents: [
          { docType: 'Drawing', docNumber: 'DWG-001', revision: 'A', available: true },
        ],
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/fai/fake/part2').send({
        documents: [{ docType: 'X', docNumber: 'X', revision: 'A', available: true }],
      });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/fai/:id/part3', () => {
    it('should update Part 3 test results', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null, status: 'IN_PROGRESS',
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({ id: 'fai-1' });

      const res = await request(app).put('/api/fai/fai-1/part3').send({
        testResults: [
          { testName: 'Hardness', testMethod: 'Rockwell C', requirement: '>= 60 HRC', result: '62 HRC', pass: true },
        ],
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put('/api/fai/fake/part3').send({
        testResults: [{ testName: 'X', testMethod: 'X', requirement: 'X', result: 'X', pass: true }],
      });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/fai/:id/approve', () => {
    it('should approve an FAI', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null, status: 'IN_PROGRESS',
        part1Status: 'COMPLETED', part2Status: 'COMPLETED', part3Status: 'COMPLETED',
        part1Data: JSON.stringify([{ charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '50.05', pass: true }]),
        part3Data: JSON.stringify([{ testName: 'Hardness', testMethod: 'Rockwell', requirement: '>60', result: '62', pass: true }]),
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({ id: 'fai-1', status: 'APPROVED' });

      const res = await request(app).post('/api/fai/fai-1/approve');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/fai/fake/approve');
      expect(res.status).toBe(404);
    });

    it('should return 400 if parts are incomplete', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null,
        part1Status: 'COMPLETED', part2Status: 'NOT_STARTED', part3Status: 'COMPLETED',
        part1Data: JSON.stringify([{ charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '50', pass: true }]),
        part3Data: JSON.stringify([{ testName: 'X', testMethod: 'X', requirement: 'X', result: 'X', pass: true }]),
      });

      const res = await request(app).post('/api/fai/fai-1/approve');
      expect(res.status).toBe(400);
    });

    it('should return 400 if characteristics failed', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null,
        part1Status: 'COMPLETED', part2Status: 'COMPLETED', part3Status: 'COMPLETED',
        part1Data: JSON.stringify([{ charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '55', pass: false }]),
        part3Data: JSON.stringify([{ testName: 'X', testMethod: 'X', requirement: 'X', result: 'X', pass: true }]),
      });

      const res = await request(app).post('/api/fai/fai-1/approve');
      expect(res.status).toBe(400);
    });

    it('should return 400 if tests failed', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null,
        part1Status: 'COMPLETED', part2Status: 'COMPLETED', part3Status: 'COMPLETED',
        part1Data: JSON.stringify([{ charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '50', pass: true }]),
        part3Data: JSON.stringify([{ testName: 'Hardness', testMethod: 'Rockwell', requirement: '>60', result: '55', pass: false }]),
      });

      const res = await request(app).post('/api/fai/fai-1/approve');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/fai/:id/partial', () => {
    it('should mark as partial approval with open items', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: 'fai-1', deletedAt: null,
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({
        id: 'fai-1', status: 'APPROVED_PARTIAL',
      });

      const res = await request(app).post('/api/fai/fai-1/partial').send({
        openItems: ['Surface finish requires re-measurement', 'Missing hardness test'],
      });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/fai/fake/partial').send({
        openItems: ['Item 1'],
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 for empty openItems', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({ id: 'fai-1', deletedAt: null });

      const res = await request(app).post('/api/fai/fai-1/partial').send({
        openItems: [],
      });
      expect(res.status).toBe(400);
    });
  });
});
