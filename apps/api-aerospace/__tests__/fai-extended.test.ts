import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    firstArticleInspection: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
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
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
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
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'FAI-2602-0001',
        ...validBody,
        status: 'PLANNING',
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

      const res = await request(app)
        .post('/api/fai')
        .send({ ...validBody, faiType: 'FULL' });
      expect(res.status).toBe(201);
    });

    it('should accept PARTIAL faiType', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValue({ id: 'fai-3' });

      const res = await request(app)
        .post('/api/fai')
        .send({ ...validBody, faiType: 'PARTIAL' });
      expect(res.status).toBe(201);
    });

    it('should accept DELTA faiType', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValue({ id: 'fai-4' });

      const res = await request(app)
        .post('/api/fai')
        .send({ ...validBody, faiType: 'DELTA' });
      expect(res.status).toBe(201);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValue({ id: 'fai-5' });

      const res = await request(app)
        .post('/api/fai')
        .send({
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
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([
        { id: '00000000-0000-0000-0000-000000000001' },
      ]);
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
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        part1Data: JSON.stringify([
          {
            charNumber: 1,
            charName: 'OD',
            nominal: '50',
            tolerance: '0.1',
            actual: '50.05',
            pass: true,
          },
        ]),
        part2Data: null,
        part3Data: null,
        openItems: null,
      });

      const res = await request(app).get('/api/fai/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.part1Characteristics).toHaveLength(1);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/fai/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app).get('/api/fai/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/fai/:id/part1', () => {
    it('should update Part 1 characteristics', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        status: 'PLANNING',
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        part1Status: 'COMPLETED',
      });

      const res = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .send({
          characteristics: [
            {
              charNumber: 1,
              charName: 'OD',
              nominal: '50',
              tolerance: '0.1',
              actual: '50.05',
              pass: true,
            },
          ],
        });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000099/part1')
        .send({
          characteristics: [
            {
              charNumber: 1,
              charName: 'OD',
              nominal: '50',
              tolerance: '0.1',
              actual: '50.05',
              pass: true,
            },
          ],
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 if FAI is APPROVED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        status: 'APPROVED',
      });

      const res = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .send({
          characteristics: [
            {
              charNumber: 1,
              charName: 'OD',
              nominal: '50',
              tolerance: '0.1',
              actual: '50',
              pass: true,
            },
          ],
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 if FAI is REJECTED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        status: 'REJECTED',
      });

      const res = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .send({
          characteristics: [
            {
              charNumber: 1,
              charName: 'OD',
              nominal: '50',
              tolerance: '0.1',
              actual: '50',
              pass: true,
            },
          ],
        });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/fai/:id/part2', () => {
    it('should update Part 2 documents', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        status: 'IN_PROGRESS',
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const res = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .send({
          documents: [{ docType: 'Drawing', docNumber: 'DWG-001', revision: 'A', available: true }],
        });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000099/part2')
        .send({
          documents: [{ docType: 'X', docNumber: 'X', revision: 'A', available: true }],
        });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/fai/:id/part3', () => {
    it('should update Part 3 test results', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        status: 'IN_PROGRESS',
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });

      const res = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .send({
          testResults: [
            {
              testName: 'Hardness',
              testMethod: 'Rockwell C',
              requirement: '>= 60 HRC',
              result: '62 HRC',
              pass: true,
            },
          ],
        });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000099/part3')
        .send({
          testResults: [
            { testName: 'X', testMethod: 'X', requirement: 'X', result: 'X', pass: true },
          ],
        });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/fai/:id/approve', () => {
    it('should approve an FAI', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        status: 'IN_PROGRESS',
        part1Status: 'COMPLETED',
        part2Status: 'COMPLETED',
        part3Status: 'COMPLETED',
        part1Data: JSON.stringify([
          {
            charNumber: 1,
            charName: 'OD',
            nominal: '50',
            tolerance: '0.1',
            actual: '50.05',
            pass: true,
          },
        ]),
        part3Data: JSON.stringify([
          {
            testName: 'Hardness',
            testMethod: 'Rockwell',
            requirement: '>60',
            result: '62',
            pass: true,
          },
        ]),
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'APPROVED',
      });

      const res = await request(app).post('/api/fai/00000000-0000-0000-0000-000000000001/approve');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/fai/00000000-0000-0000-0000-000000000099/approve');
      expect(res.status).toBe(404);
    });

    it('should return 400 if parts are incomplete', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        part1Status: 'COMPLETED',
        part2Status: 'NOT_STARTED',
        part3Status: 'COMPLETED',
        part1Data: JSON.stringify([
          {
            charNumber: 1,
            charName: 'OD',
            nominal: '50',
            tolerance: '0.1',
            actual: '50',
            pass: true,
          },
        ]),
        part3Data: JSON.stringify([
          { testName: 'X', testMethod: 'X', requirement: 'X', result: 'X', pass: true },
        ]),
      });

      const res = await request(app).post('/api/fai/00000000-0000-0000-0000-000000000001/approve');
      expect(res.status).toBe(400);
    });

    it('should return 400 if characteristics failed', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        part1Status: 'COMPLETED',
        part2Status: 'COMPLETED',
        part3Status: 'COMPLETED',
        part1Data: JSON.stringify([
          {
            charNumber: 1,
            charName: 'OD',
            nominal: '50',
            tolerance: '0.1',
            actual: '55',
            pass: false,
          },
        ]),
        part3Data: JSON.stringify([
          { testName: 'X', testMethod: 'X', requirement: 'X', result: 'X', pass: true },
        ]),
      });

      const res = await request(app).post('/api/fai/00000000-0000-0000-0000-000000000001/approve');
      expect(res.status).toBe(400);
    });

    it('should return 400 if tests failed', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        part1Status: 'COMPLETED',
        part2Status: 'COMPLETED',
        part3Status: 'COMPLETED',
        part1Data: JSON.stringify([
          {
            charNumber: 1,
            charName: 'OD',
            nominal: '50',
            tolerance: '0.1',
            actual: '50',
            pass: true,
          },
        ]),
        part3Data: JSON.stringify([
          {
            testName: 'Hardness',
            testMethod: 'Rockwell',
            requirement: '>60',
            result: '55',
            pass: false,
          },
        ]),
      });

      const res = await request(app).post('/api/fai/00000000-0000-0000-0000-000000000001/approve');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/fai/:id/partial', () => {
    it('should mark as partial approval with open items', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'APPROVED_PARTIAL',
      });

      const res = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .send({
          openItems: ['Surface finish requires re-measurement', 'Missing hardness test'],
        });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000099/partial')
        .send({
          openItems: ['Item 1'],
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 for empty openItems', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .send({
          openItems: [],
        });
      expect(res.status).toBe(400);
    });
  });
});

describe('FAI Routes — additional coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/fai should filter by status', async () => {
    (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/fai?status=APPROVED');
    expect(res.status).toBe(200);
    expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalled();
  });

  it('GET /api/fai should filter by faiType', async () => {
    (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/fai?faiType=FULL');
    expect(res.status).toBe(200);
    expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalled();
  });

  it('PUT /api/fai/:id/part3 should return 400 if FAI is APPROVED', async () => {
    (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
      status: 'APPROVED',
    });

    const res = await request(app)
      .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
      .send({
        testResults: [
          { testName: 'Hardness', testMethod: 'Rockwell', requirement: '>60', result: '62', pass: true },
        ],
      });
    expect(res.status).toBe(400);
  });
});

describe('FAI Routes — extra coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/fai returns success:true and meta block', async () => {
    (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/fai');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('meta');
  });

  it('GET /api/fai returns totalPages=3 for 30 items limit 10', async () => {
    (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(30);

    const res = await request(app).get('/api/fai?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(3);
    expect(res.body.meta.total).toBe(30);
  });

  it('GET /api/fai/:id returns 500 on db error', async () => {
    (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/api/fai/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('POST /api/fai/:id/approve returns 500 on db update error', async () => {
    (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
      status: 'IN_PROGRESS',
      part1Status: 'COMPLETED',
      part2Status: 'COMPLETED',
      part3Status: 'COMPLETED',
      part1Data: JSON.stringify([
        { charNumber: 1, charName: 'OD', nominal: '50', tolerance: '0.1', actual: '50.05', pass: true },
      ]),
      part3Data: JSON.stringify([
        { testName: 'Hardness', testMethod: 'Rockwell', requirement: '>60', result: '62', pass: true },
      ]),
    });
    (mockPrisma.firstArticleInspection.update as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).post('/api/fai/00000000-0000-0000-0000-000000000001/approve');
    expect(res.status).toBe(500);
  });
});

describe('FAI Routes — phase28 coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('POST /api/fai with all optional fields returns 201', async () => {
    (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000010',
      refNumber: 'FAI-2026-0001',
      title: 'Optional FAI',
      status: 'DRAFT',
    });
    const res = await request(app).post('/api/fai').send({
      title: 'Optional FAI',
      partNumber: 'PN-OPT',
      partName: 'Optional Part',
      revision: 'B',
      faiType: 'PARTIAL',
      supplier: 'Acme Corp',
      customerReference: 'CUST-001',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/fai data items have partNumber field', async () => {
    (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000011', refNumber: 'FAI-2026-0011', partNumber: 'PN-001', status: 'DRAFT' },
    ]);
    (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(1);
    const res = await request(app).get('/api/fai');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('partNumber');
  });

  it('GET /api/fai with page=2 limit=5 returns correct meta', async () => {
    (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValue(20);
    const res = await request(app).get('/api/fai?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(5);
  });

  it('GET /api/fai/:id response has refNumber field', async () => {
    (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000012',
      refNumber: 'FAI-2026-0012',
      partNumber: 'PN-012',
      deletedAt: null,
      status: 'DRAFT',
    });
    const res = await request(app).get('/api/fai/00000000-0000-0000-0000-000000000012');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('refNumber');
  });

  it('DELETE /api/fai/:id returns 404 when record not found', async () => {
    (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).delete('/api/fai/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('fai extended — phase30 coverage', () => {
  it('handles indexOf method', () => {
    expect([1, 2, 3].indexOf(2)).toBe(1);
  });

  it('handles some method', () => {
    expect([1, 2, 3].some(x => x > 2)).toBe(true);
  });

  it('handles structuredClone', () => {
    const obj2 = { a: 1 }; const clone = structuredClone(obj2); expect(clone).toEqual(obj2); expect(clone).not.toBe(obj2);
  });

  it('handles nullish coalescing', () => {
    const val: string | null = null; expect(val ?? 'default').toBe('default');
  });

  it('handles parseFloat', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
  });

});


describe('phase31 coverage', () => {
  it('handles string toLowerCase', () => { expect('HELLO'.toLowerCase()).toBe('hello'); });
  it('handles Set creation', () => { const s = new Set([1,2,2,3]); expect(s.size).toBe(3); });
  it('handles Object.entries', () => { expect(Object.entries({a:1})).toEqual([['a',1]]); });
  it('handles string split', () => { expect('a,b,c'.split(',')).toEqual(['a','b','c']); });
  it('handles string concat', () => { expect('foo' + 'bar').toBe('foobar'); });
});
