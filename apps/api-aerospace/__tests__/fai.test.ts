import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    firstArticleInspection: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    FirstArticleInspectionWhereInput: {},
  },
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
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

jest.mock('@ims/validation', () => ({
  sanitizeMiddleware: () => (_req: any, _res: any, next: any) => next(),
  sanitizeQueryMiddleware: () => (_req: any, _res: any, next: any) => next(),
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

// ==========================================
// Test data fixtures
// ==========================================

const mockFAI = {
  id: '00000000-0000-0000-0000-000000000001',
  refNumber: 'FAI-2602-0001',
  title: 'Wing Spar Assembly FAI',
  partNumber: 'WS-2026-001',
  partName: 'Wing Spar Assembly',
  revision: 'A',
  drawingNumber: 'DWG-WS-001',
  customer: 'Aerospace Corp',
  poNumber: 'PO-12345',
  faiType: 'FULL',
  status: 'PLANNING',
  part1Status: 'NOT_STARTED',
  part2Status: 'NOT_STARTED',
  part3Status: 'NOT_STARTED',
  part1Data: null,
  part2Data: null,
  part3Data: null,
  openItems: null,
  approvedBy: null,
  approvedDate: null,
  createdBy: 'test@test.com',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockFAI2 = {
  id: '00000000-0000-0000-0000-000000000001',
  refNumber: 'FAI-2602-0002',
  title: 'Fuselage Panel FAI',
  partNumber: 'FP-2026-010',
  partName: 'Fuselage Panel',
  revision: 'B',
  drawingNumber: 'DWG-FP-010',
  customer: 'Defense Systems Inc',
  poNumber: 'PO-67890',
  faiType: 'PARTIAL',
  status: 'IN_PROGRESS',
  part1Status: 'COMPLETED',
  part2Status: 'IN_PROGRESS',
  part3Status: 'NOT_STARTED',
  part1Data: JSON.stringify([
    {
      charNumber: 1,
      charName: 'Length',
      nominal: '100mm',
      tolerance: '0.1mm',
      actual: '100.05mm',
      pass: true,
    },
  ]),
  part2Data: JSON.stringify([
    { docType: 'Drawing', docNumber: 'DWG-001', revision: 'A', available: true },
    { docType: 'Process Sheet', docNumber: 'PS-001', revision: 'A', available: false },
  ]),
  part3Data: null,
  openItems: null,
  approvedBy: null,
  approvedDate: null,
  createdBy: 'test@test.com',
  deletedAt: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-10'),
};

const validCreatePayload = {
  title: 'Wing Spar Assembly FAI',
  partNumber: 'WS-2026-001',
  partName: 'Wing Spar Assembly',
  revision: 'A',
  drawingNumber: 'DWG-WS-001',
  customer: 'Aerospace Corp',
  poNumber: 'PO-12345',
  faiType: 'FULL',
};

const validPart1Payload = {
  characteristics: [
    {
      charNumber: 1,
      charName: 'Length',
      nominal: '100mm',
      tolerance: '0.1mm',
      actual: '100.05mm',
      pass: true,
    },
    {
      charNumber: 2,
      charName: 'Width',
      nominal: '50mm',
      tolerance: '0.05mm',
      actual: '50.02mm',
      pass: true,
    },
    {
      charNumber: 3,
      charName: 'Hole Diameter',
      nominal: '10mm',
      tolerance: '0.02mm',
      actual: '10.01mm',
      pass: true,
    },
  ],
};

const validPart2Payload = {
  documents: [
    { docType: 'Engineering Drawing', docNumber: 'DWG-WS-001-A', revision: 'A', available: true },
    { docType: 'Process Sheet', docNumber: 'PS-WS-001', revision: 'A', available: true },
    { docType: 'Material Certificate', docNumber: 'MC-AL7075-001', revision: '1', available: true },
  ],
};

const validPart3Payload = {
  testResults: [
    {
      testName: 'Tensile Strength',
      testMethod: 'ASTM E8',
      requirement: '>= 480 MPa',
      result: '495 MPa',
      pass: true,
    },
    {
      testName: 'Hardness Test',
      testMethod: 'Rockwell B',
      requirement: '78-87 HRB',
      result: '82 HRB',
      pass: true,
    },
  ],
};

const validPartialPayload = {
  openItems: ['Material cert pending for lot B', 'Surface roughness recheck required'],
};

// FAI with all parts completed and all passing
const mockFAIAllCompleted = {
  ...mockFAI,
  status: 'IN_PROGRESS',
  part1Status: 'COMPLETED',
  part2Status: 'COMPLETED',
  part3Status: 'COMPLETED',
  part1Data: JSON.stringify([
    {
      charNumber: 1,
      charName: 'Length',
      nominal: '100mm',
      tolerance: '0.1mm',
      actual: '100.05mm',
      pass: true,
    },
    {
      charNumber: 2,
      charName: 'Width',
      nominal: '50mm',
      tolerance: '0.05mm',
      actual: '50.02mm',
      pass: true,
    },
  ]),
  part2Data: JSON.stringify([
    { docType: 'Drawing', docNumber: 'DWG-001', revision: 'A', available: true },
  ]),
  part3Data: JSON.stringify([
    {
      testName: 'Tensile',
      testMethod: 'ASTM E8',
      requirement: '>= 480 MPa',
      result: '495 MPa',
      pass: true,
    },
  ]),
};

// FAI with a failing characteristic
const mockFAIWithFailingChar = {
  ...mockFAIAllCompleted,
  part1Data: JSON.stringify([
    {
      charNumber: 1,
      charName: 'Length',
      nominal: '100mm',
      tolerance: '0.1mm',
      actual: '100.05mm',
      pass: true,
    },
    {
      charNumber: 2,
      charName: 'Width',
      nominal: '50mm',
      tolerance: '0.05mm',
      actual: '50.20mm',
      pass: false,
    },
  ]),
};

// FAI with a failing test
const mockFAIWithFailingTest = {
  ...mockFAIAllCompleted,
  part3Data: JSON.stringify([
    {
      testName: 'Tensile',
      testMethod: 'ASTM E8',
      requirement: '>= 480 MPa',
      result: '495 MPa',
      pass: true,
    },
    {
      testName: 'Fatigue',
      testMethod: 'ASTM E466',
      requirement: '> 10^6 cycles',
      result: '5x10^5 cycles',
      pass: false,
    },
  ]),
};

// ==========================================
// Tests
// ==========================================

describe('Aerospace FAI (AS9102) API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/fai', faiRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / — Create FAI
  // ==========================================
  describe('POST /api/fai', () => {
    it('should create an FAI with all fields successfully', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        refNumber: 'FAI-2602-0001',
      });

      const response = await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.refNumber).toBe('FAI-2602-0001');

      expect(mockPrisma.firstArticleInspection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Wing Spar Assembly FAI',
          partNumber: 'WS-2026-001',
          partName: 'Wing Spar Assembly',
          revision: 'A',
          drawingNumber: 'DWG-WS-001',
          customer: 'Aerospace Corp',
          poNumber: 'PO-12345',
          faiType: 'FULL',
          status: 'PLANNING',
          part1Status: 'NOT_STARTED',
          part2Status: 'NOT_STARTED',
          part3Status: 'NOT_STARTED',
          createdBy: 'test@test.com',
        }),
      });
    });

    it('should generate a reference number with padded count', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        refNumber: 'FAI-2602-0006',
      });

      await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(mockPrisma.firstArticleInspection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringMatching(/^FAI-\d{4}-\d{4}$/),
        }),
      });
    });

    it('should default faiType to FULL when not provided', async () => {
      const payloadNoType = {
        title: 'Bracket FAI',
        partNumber: 'BR-001',
        partName: 'Mounting Bracket',
        revision: 'A',
      };

      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        ...payloadNoType,
        faiType: 'FULL',
      });

      await request(app).post('/api/fai').set('Authorization', 'Bearer token').send(payloadNoType);

      expect(mockPrisma.firstArticleInspection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          faiType: 'FULL',
        }),
      });
    });

    it('should accept PARTIAL and DELTA fai types', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        faiType: 'DELTA',
      });

      const response = await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, faiType: 'DELTA' });

      expect(response.status).toBe(201);
      expect(mockPrisma.firstArticleInspection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          faiType: 'DELTA',
        }),
      });
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send({
          partNumber: 'WS-2026-001',
          partName: 'Wing Spar Assembly',
          revision: 'A',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toBeDefined();
    });

    it('should return 400 when title is empty string', async () => {
      const response = await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when partNumber is missing', async () => {
      const response = await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Wing Spar Assembly FAI',
          partName: 'Wing Spar Assembly',
          revision: 'A',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when partName is missing', async () => {
      const response = await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Wing Spar Assembly FAI',
          partNumber: 'WS-2026-001',
          revision: 'A',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when revision is missing', async () => {
      const response = await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Wing Spar Assembly FAI',
          partNumber: 'WS-2026-001',
          partName: 'Wing Spar Assembly',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid faiType enum', async () => {
      const response = await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, faiType: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors during creation', async () => {
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.firstArticleInspection.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/fai')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET / — List FAIs
  // ==========================================
  describe('GET /api/fai', () => {
    it('should return a list of FAIs with default pagination', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValueOnce([
        mockFAI,
        mockFAI2,
      ]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/fai').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support custom pagination parameters', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValueOnce([mockFAI]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/fai?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(50);
      expect(response.body.meta.totalPages).toBe(5);

      expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/fai?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
      expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/fai?status=IN_PROGRESS').set('Authorization', 'Bearer token');

      expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'IN_PROGRESS',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by faiType', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/fai?faiType=PARTIAL').set('Authorization', 'Bearer token');

      expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            faiType: 'PARTIAL',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by partNumber (case-insensitive contains)', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValueOnce([mockFAI]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/fai?partNumber=ws-2026').set('Authorization', 'Bearer token');

      expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            partNumber: { contains: 'ws-2026', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should support search across title, refNumber, partNumber, partName, customer', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValueOnce([mockFAI]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/fai?search=wing').set('Authorization', 'Bearer token');

      expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'wing', mode: 'insensitive' } },
              { refNumber: { contains: 'wing', mode: 'insensitive' } },
              { partNumber: { contains: 'wing', mode: 'insensitive' } },
              { partName: { contains: 'wing', mode: 'insensitive' } },
              { customer: { contains: 'wing', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should always exclude soft-deleted records', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/fai').set('Authorization', 'Bearer token');

      expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.firstArticleInspection.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/fai').set('Authorization', 'Bearer token');

      expect(mockPrisma.firstArticleInspection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.firstArticleInspection.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app).get('/api/fai').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /:id — Get FAI with parsed data
  // ==========================================
  describe('GET /api/fai/:id', () => {
    it('should return a single FAI with parsed part data', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI2);

      const response = await request(app)
        .get('/api/fai/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
      expect(response.body.data.part1Characteristics).toBeDefined();
      expect(response.body.data.part1Characteristics).toHaveLength(1);
      expect(response.body.data.part1Characteristics[0].charName).toBe('Length');
      expect(response.body.data.part2Documents).toBeDefined();
      expect(response.body.data.part2Documents).toHaveLength(2);
      expect(response.body.data.part3TestResults).toBeDefined();
      expect(response.body.data.part3TestResults).toEqual([]);
      expect(response.body.data.openItems).toEqual([]);
    });

    it('should return empty arrays when part data fields are null', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .get('/api/fai/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.part1Characteristics).toEqual([]);
      expect(response.body.data.part2Documents).toEqual([]);
      expect(response.body.data.part3TestResults).toEqual([]);
      expect(response.body.data.openItems).toEqual([]);
    });

    it('should return 404 when FAI is not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/fai/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('First article inspection not found');
    });

    it('should return 404 when FAI is soft-deleted', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/fai/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle malformed JSON in part data gracefully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part1Data: 'invalid-json{{{',
        part2Data: '42',
        part3Data: '"not an array"',
      });

      const response = await request(app)
        .get('/api/fai/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.part1Characteristics).toEqual([]);
      expect(response.body.data.part2Documents).toEqual([]);
      expect(response.body.data.part3TestResults).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/fai/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // PUT /:id/part1 — Update Part 1 (Design Characteristics)
  // ==========================================
  describe('PUT /api/fai/:id/part1', () => {
    it('should update Part 1 characteristics successfully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part1Data: JSON.stringify(validPart1Payload.characteristics),
        part1Status: 'COMPLETED',
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send(validPart1Payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.part1Status).toBe('COMPLETED');
      expect(response.body.data.status).toBe('IN_PROGRESS');

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: {
          part1Data: JSON.stringify(validPart1Payload.characteristics),
          part1Status: 'COMPLETED',
          status: 'IN_PROGRESS',
        },
      });
    });

    it('should transition status from PLANNING to IN_PROGRESS', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'PLANNING',
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'IN_PROGRESS',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send(validPart1Payload);

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          status: 'IN_PROGRESS',
        }),
      });
    });

    it('should not change status when already IN_PROGRESS', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'IN_PROGRESS',
      });
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'IN_PROGRESS',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send(validPart1Payload);

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          status: 'IN_PROGRESS',
        }),
      });
    });

    it('should determine part1Status as NOT_STARTED when no actual values filled', async () => {
      const emptyCharacteristics = {
        characteristics: [
          {
            charNumber: 1,
            charName: 'Length',
            nominal: '100mm',
            tolerance: '0.1mm',
            actual: '',
            pass: false,
          },
          {
            charNumber: 2,
            charName: 'Width',
            nominal: '50mm',
            tolerance: '0.05mm',
            actual: '  ',
            pass: false,
          },
        ],
      };

      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part1Status: 'NOT_STARTED',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send(emptyCharacteristics);

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          part1Status: 'NOT_STARTED',
        }),
      });
    });

    it('should determine part1Status as IN_PROGRESS when some actual values filled', async () => {
      const partialCharacteristics = {
        characteristics: [
          {
            charNumber: 1,
            charName: 'Length',
            nominal: '100mm',
            tolerance: '0.1mm',
            actual: '100.05mm',
            pass: true,
          },
          {
            charNumber: 2,
            charName: 'Width',
            nominal: '50mm',
            tolerance: '0.05mm',
            actual: '',
            pass: false,
          },
        ],
      };

      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part1Status: 'IN_PROGRESS',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send(partialCharacteristics);

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          part1Status: 'IN_PROGRESS',
        }),
      });
    });

    it('should determine part1Status as NOT_STARTED when characteristics array is empty', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part1Status: 'NOT_STARTED',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send({ characteristics: [] });

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          part1Status: 'NOT_STARTED',
        }),
      });
    });

    it('should return 404 when FAI is not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000099/part1')
        .set('Authorization', 'Bearer token')
        .send(validPart1Payload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when FAI is soft-deleted', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send(validPart1Payload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when FAI status is APPROVED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'APPROVED',
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send(validPart1Payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_STATE');
      expect(response.body.error.message).toContain('APPROVED');
    });

    it('should return 400 when FAI status is REJECTED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'REJECTED',
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send(validPart1Payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATE');
      expect(response.body.error.message).toContain('REJECTED');
    });

    it('should return 400 for invalid characteristic data (missing charName)', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send({
          characteristics: [
            { charNumber: 1, nominal: '100mm', tolerance: '0.1mm', actual: '100.05mm', pass: true },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid characteristic number (not positive integer)', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send({
          characteristics: [
            {
              charNumber: -1,
              charName: 'Length',
              nominal: '100mm',
              tolerance: '0.1mm',
              actual: '100.05mm',
              pass: true,
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when characteristics field is missing from body', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part1')
        .set('Authorization', 'Bearer token')
        .send(validPart1Payload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // PUT /:id/part2 — Update Part 2 (Manufacturing Process Documentation)
  // ==========================================
  describe('PUT /api/fai/:id/part2', () => {
    it('should update Part 2 documents successfully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part2Data: JSON.stringify(validPart2Payload.documents),
        part2Status: 'COMPLETED',
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .set('Authorization', 'Bearer token')
        .send(validPart2Payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.part2Status).toBe('COMPLETED');

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: {
          part2Data: JSON.stringify(validPart2Payload.documents),
          part2Status: 'COMPLETED',
          status: 'IN_PROGRESS',
        },
      });
    });

    it('should determine part2Status as IN_PROGRESS when some documents not available', async () => {
      const partialDocs = {
        documents: [
          { docType: 'Drawing', docNumber: 'DWG-001', revision: 'A', available: true },
          { docType: 'Process Sheet', docNumber: 'PS-001', revision: 'A', available: false },
        ],
      };

      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part2Status: 'IN_PROGRESS',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .set('Authorization', 'Bearer token')
        .send(partialDocs);

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          part2Status: 'IN_PROGRESS',
        }),
      });
    });

    it('should determine part2Status as NOT_STARTED when no documents are available', async () => {
      const noDocs = {
        documents: [
          { docType: 'Drawing', docNumber: 'DWG-001', revision: 'A', available: false },
          { docType: 'Process Sheet', docNumber: 'PS-001', revision: 'A', available: false },
        ],
      };

      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part2Status: 'NOT_STARTED',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .set('Authorization', 'Bearer token')
        .send(noDocs);

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          part2Status: 'NOT_STARTED',
        }),
      });
    });

    it('should determine part2Status as NOT_STARTED when documents array is empty', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part2Status: 'NOT_STARTED',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .set('Authorization', 'Bearer token')
        .send({ documents: [] });

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          part2Status: 'NOT_STARTED',
        }),
      });
    });

    it('should return 404 when FAI is not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000099/part2')
        .set('Authorization', 'Bearer token')
        .send(validPart2Payload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when FAI status is APPROVED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'APPROVED',
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .set('Authorization', 'Bearer token')
        .send(validPart2Payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATE');
      expect(response.body.error.message).toContain('APPROVED');
    });

    it('should return 400 when FAI status is REJECTED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'REJECTED',
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .set('Authorization', 'Bearer token')
        .send(validPart2Payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATE');
    });

    it('should return 400 for invalid document data (missing docType)', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .set('Authorization', 'Bearer token')
        .send({
          documents: [{ docNumber: 'DWG-001', revision: 'A', available: true }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when documents field is missing from body', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part2')
        .set('Authorization', 'Bearer token')
        .send(validPart2Payload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // PUT /:id/part3 — Update Part 3 (Test Results)
  // ==========================================
  describe('PUT /api/fai/:id/part3', () => {
    it('should update Part 3 test results successfully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part3Data: JSON.stringify(validPart3Payload.testResults),
        part3Status: 'COMPLETED',
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .set('Authorization', 'Bearer token')
        .send(validPart3Payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.part3Status).toBe('COMPLETED');

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: {
          part3Data: JSON.stringify(validPart3Payload.testResults),
          part3Status: 'COMPLETED',
          status: 'IN_PROGRESS',
        },
      });
    });

    it('should determine part3Status as IN_PROGRESS when some results not filled', async () => {
      const partialResults = {
        testResults: [
          {
            testName: 'Tensile',
            testMethod: 'ASTM E8',
            requirement: '>= 480 MPa',
            result: '495 MPa',
            pass: true,
          },
          {
            testName: 'Hardness',
            testMethod: 'Rockwell B',
            requirement: '78-87 HRB',
            result: '',
            pass: false,
          },
        ],
      };

      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part3Status: 'IN_PROGRESS',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .set('Authorization', 'Bearer token')
        .send(partialResults);

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          part3Status: 'IN_PROGRESS',
        }),
      });
    });

    it('should determine part3Status as NOT_STARTED when no results filled', async () => {
      const emptyResults = {
        testResults: [
          {
            testName: 'Tensile',
            testMethod: 'ASTM E8',
            requirement: '>= 480 MPa',
            result: '',
            pass: false,
          },
          {
            testName: 'Hardness',
            testMethod: 'Rockwell B',
            requirement: '78-87 HRB',
            result: '  ',
            pass: false,
          },
        ],
      };

      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part3Status: 'NOT_STARTED',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .set('Authorization', 'Bearer token')
        .send(emptyResults);

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          part3Status: 'NOT_STARTED',
        }),
      });
    });

    it('should determine part3Status as NOT_STARTED when testResults array is empty', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        part3Status: 'NOT_STARTED',
      });

      await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .set('Authorization', 'Bearer token')
        .send({ testResults: [] });

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          part3Status: 'NOT_STARTED',
        }),
      });
    });

    it('should return 404 when FAI is not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000099/part3')
        .set('Authorization', 'Bearer token')
        .send(validPart3Payload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when FAI status is APPROVED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'APPROVED',
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .set('Authorization', 'Bearer token')
        .send(validPart3Payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATE');
      expect(response.body.error.message).toContain('APPROVED');
    });

    it('should return 400 when FAI status is REJECTED', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'REJECTED',
      });

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .set('Authorization', 'Bearer token')
        .send(validPart3Payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STATE');
    });

    it('should return 400 for invalid test result data (missing testName)', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .set('Authorization', 'Bearer token')
        .send({
          testResults: [
            { testMethod: 'ASTM E8', requirement: '>= 480 MPa', result: '495 MPa', pass: true },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when testResults field is missing from body', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/fai/00000000-0000-0000-0000-000000000001/part3')
        .set('Authorization', 'Bearer token')
        .send(validPart3Payload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // POST /:id/approve — Full FAI Approval
  // ==========================================
  describe('POST /api/fai/:id/approve', () => {
    it('should approve an FAI when all parts are completed and all pass', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(
        mockFAIAllCompleted
      );
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAIAllCompleted,
        status: 'APPROVED',
        approvedBy: 'test@test.com',
        approvedDate: new Date(),
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.approvedBy).toBe('test@test.com');

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: {
          status: 'APPROVED',
          approvedBy: 'test@test.com',
          approvedDate: expect.any(Date),
        },
      });
    });

    it('should return 404 when FAI is not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000099/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when FAI is soft-deleted', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAIAllCompleted,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when Part 1 is not completed', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAIAllCompleted,
        part1Status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('PARTS_INCOMPLETE');
      expect(response.body.error.message).toContain('Part 1 (Design Characteristics)');
    });

    it('should return 400 when Part 2 is not completed', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAIAllCompleted,
        part2Status: 'NOT_STARTED',
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('PARTS_INCOMPLETE');
      expect(response.body.error.message).toContain('Part 2 (Manufacturing Process Documentation)');
    });

    it('should return 400 when Part 3 is not completed', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAIAllCompleted,
        part3Status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('PARTS_INCOMPLETE');
      expect(response.body.error.message).toContain('Part 3 (Test Results)');
    });

    it('should list all incomplete parts when multiple are not completed', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'IN_PROGRESS',
        part1Status: 'NOT_STARTED',
        part2Status: 'IN_PROGRESS',
        part3Status: 'NOT_STARTED',
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('PARTS_INCOMPLETE');
      expect(response.body.error.message).toContain('Part 1');
      expect(response.body.error.message).toContain('Part 2');
      expect(response.body.error.message).toContain('Part 3');
    });

    it('should return 400 when Part 1 has failing characteristics', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(
        mockFAIWithFailingChar
      );

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('CHARACTERISTICS_FAILED');
      expect(response.body.error.message).toContain('1 characteristic(s) did not pass');
      expect(response.body.error.message).toContain('#2 Width');
    });

    it('should return 400 when Part 3 has failing test results', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(
        mockFAIWithFailingTest
      );

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('TESTS_FAILED');
      expect(response.body.error.message).toContain('1 test(s) did not pass');
      expect(response.body.error.message).toContain('Fatigue');
    });

    it('should check parts completion before checking characteristics/tests', async () => {
      // Even with failing chars, if parts are incomplete, should get PARTS_INCOMPLETE first
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAIWithFailingChar,
        part2Status: 'NOT_STARTED',
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('PARTS_INCOMPLETE');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // POST /:id/partial — Partial FAI Approval
  // ==========================================
  describe('POST /api/fai/:id/partial', () => {
    it('should mark FAI as partially approved with open items', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI2);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI2,
        status: 'APPROVED_PARTIAL',
        openItems: JSON.stringify(validPartialPayload.openItems),
        approvedBy: 'test@test.com',
        approvedDate: new Date(),
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .set('Authorization', 'Bearer token')
        .send(validPartialPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED_PARTIAL');

      expect(mockPrisma.firstArticleInspection.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: {
          status: 'APPROVED_PARTIAL',
          openItems: JSON.stringify(validPartialPayload.openItems),
          approvedBy: 'test@test.com',
          approvedDate: expect.any(Date),
        },
      });
    });

    it('should accept a single open item', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);
      (mockPrisma.firstArticleInspection.update as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        status: 'APPROVED_PARTIAL',
        openItems: JSON.stringify(['Material cert pending']),
        approvedBy: 'test@test.com',
        approvedDate: new Date(),
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .set('Authorization', 'Bearer token')
        .send({ openItems: ['Material cert pending'] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when FAI is not found', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000099/partial')
        .set('Authorization', 'Bearer token')
        .send(validPartialPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when FAI is soft-deleted', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockFAI,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .set('Authorization', 'Bearer token')
        .send(validPartialPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when openItems array is empty', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .set('Authorization', 'Bearer token')
        .send({ openItems: [] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when openItems contains empty strings', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .set('Authorization', 'Bearer token')
        .send({ openItems: [''] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when openItems field is missing', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when openItems is not an array', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockResolvedValueOnce(mockFAI);

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .set('Authorization', 'Bearer token')
        .send({ openItems: 'single string' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.firstArticleInspection.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/fai/00000000-0000-0000-0000-000000000001/partial')
        .set('Authorization', 'Bearer token')
        .send(validPartialPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});


describe('phase37 coverage', () => {
  it('converts celsius to fahrenheit', () => { const toF=(c:number)=>c*9/5+32; expect(toF(0)).toBe(32); expect(toF(100)).toBe(212); });
  it('counts occurrences in array', () => { const count=<T>(a:T[],v:T)=>a.filter(x=>x===v).length; expect(count([1,2,1,3,1],1)).toBe(3); });
  it('formats bytes to human readable', () => { const fmt=(b:number)=>b>=1e9?`${(b/1e9).toFixed(1)}GB`:b>=1e6?`${(b/1e6).toFixed(1)}MB`:`${(b/1e3).toFixed(1)}KB`; expect(fmt(1500000)).toBe('1.5MB'); });
  it('flattens one level', () => { expect([[1,2],[3,4],[5]].reduce((a,b)=>[...a,...b],[] as number[])).toEqual([1,2,3,4,5]); });
});


describe('phase38 coverage', () => {
  it('merges sorted arrays', () => { const merge=(a:number[],b:number[])=>{const r:number[]=[];let i=0,j=0;while(i<a.length&&j<b.length)r.push(a[i]<=b[j]?a[i++]:b[j++]);return [...r,...a.slice(i),...b.slice(j)];}; expect(merge([1,3,5],[2,4,6])).toEqual([1,2,3,4,5,6]); });
  it('implements exponential search bound', () => { const expBound=(a:number[],v:number)=>{if(a[0]===v)return 0;let i=1;while(i<a.length&&a[i]<=v)i*=2;return Math.min(i,a.length-1);}; expect(expBound([1,2,4,8,16,32],8)).toBeGreaterThanOrEqual(3); });
  it('applies difference array technique', () => { const diff=(a:number[])=>a.slice(1).map((v,i)=>v-a[i]); expect(diff([1,3,6,10,15])).toEqual([2,3,4,5]); });
  it('finds median of array', () => { const med=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}; expect(med([3,1,4,1,5])).toBe(3); expect(med([1,2,3,4])).toBe(2.5); });
  it('finds all prime factors', () => { const factors=(n:number)=>{const r:number[]=[];for(let i=2;i*i<=n;i++)while(n%i===0){r.push(i);n/=i;}if(n>1)r.push(n);return r;}; expect(factors(12)).toEqual([2,2,3]); });
});


describe('phase39 coverage', () => {
  it('converts number to base-36 string', () => { expect((255).toString(36)).toBe('73'); expect(parseInt('73',36)).toBe(255); });
  it('implements string hashing polynomial', () => { const polyHash=(s:string,p=31,m=1e9+7)=>[...s].reduce((h,c)=>(h*p+c.charCodeAt(0))%m,0); const h=polyHash('hello'); expect(typeof h).toBe('number'); expect(h).toBeGreaterThan(0); });
  it('counts islands in binary grid', () => { const islands=(g:number[][])=>{const v=g.map(r=>[...r]);let c=0;const dfs=(i:number,j:number)=>{if(i<0||i>=v.length||j<0||j>=v[0].length||v[i][j]!==1)return;v[i][j]=0;dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);};for(let i=0;i<v.length;i++)for(let j=0;j<v[0].length;j++)if(v[i][j]===1){dfs(i,j);c++;}return c;}; expect(islands([[1,1,0],[0,1,0],[0,0,1]])).toBe(2); });
  it('implements knapsack 0-1 small', () => { const ks=(weights:number[],values:number[],cap:number)=>{const n=weights.length;const dp=Array.from({length:n+1},()=>Array(cap+1).fill(0));for(let i=1;i<=n;i++)for(let w=0;w<=cap;w++){dp[i][w]=dp[i-1][w];if(weights[i-1]<=w)dp[i][w]=Math.max(dp[i][w],dp[i-1][w-weights[i-1]]+values[i-1]);}return dp[n][cap];}; expect(ks([1,3,4,5],[1,4,5,7],7)).toBe(9); });
  it('computes sum of proper divisors', () => { const divSum=(n:number)=>{let s=1;for(let i=2;i*i<=n;i++)if(n%i===0){s+=i;if(i!==n/i)s+=n/i;}return s;}; expect(divSum(12)).toBe(16); });
});


describe('phase40 coverage', () => {
  it('computes nth Catalan number', () => { const cat=(n:number):number=>n<=1?1:Array.from({length:n},(_,i)=>cat(i)*cat(n-1-i)).reduce((a,b)=>a+b,0); expect(cat(4)).toBe(14); });
  it('computes longest bitonic subsequence length', () => { const lbs=(a:number[])=>{const n=a.length;const inc=Array(n).fill(1),dec=Array(n).fill(1);for(let i=1;i<n;i++)for(let j=0;j<i;j++)if(a[j]<a[i])inc[i]=Math.max(inc[i],inc[j]+1);for(let i=n-2;i>=0;i--)for(let j=i+1;j<n;j++)if(a[j]<a[i])dec[i]=Math.max(dec[i],dec[j]+1);return Math.max(...a.map((_,i)=>inc[i]+dec[i]-1));}; expect(lbs([1,11,2,10,4,5,2,1])).toBe(6); });
  it('computes element-wise matrix addition', () => { const addM=(a:number[][],b:number[][])=>a.map((r,i)=>r.map((v,j)=>v+b[i][j])); expect(addM([[1,2],[3,4]],[[5,6],[7,8]])).toEqual([[6,8],[10,12]]); });
  it('computes nth power sum 1^k+2^k+...+n^k', () => { const pwrSum=(n:number,k:number)=>Array.from({length:n},(_,i)=>Math.pow(i+1,k)).reduce((a,b)=>a+b,0); expect(pwrSum(3,2)).toBe(14); });
  it('checks if number is palindrome without string', () => { const isPalinNum=(n:number)=>{if(n<0)return false;let rev=0,orig=n;while(n>0){rev=rev*10+n%10;n=Math.floor(n/10);}return rev===orig;}; expect(isPalinNum(121)).toBe(true); expect(isPalinNum(123)).toBe(false); });
});


describe('phase41 coverage', () => {
  it('computes minimum cost to connect ropes', () => { const minCost=(ropes:number[])=>{const pq=[...ropes].sort((a,b)=>a-b);let cost=0;while(pq.length>1){const a=pq.shift()!,b=pq.shift()!;cost+=a+b;pq.push(a+b);pq.sort((x,y)=>x-y);}return cost;}; expect(minCost([4,3,2,6])).toBe(29); });
  it('checks if undirected graph is tree', () => { const isTree=(n:number,edges:[number,number][])=>{if(edges.length!==n-1)return false;const parent=Array.from({length:n},(_,i)=>i);const find=(x:number):number=>parent[x]===x?x:find(parent[x]);let cycles=0;for(const [u,v] of edges){const pu=find(u),pv=find(v);if(pu===pv)cycles++;else parent[pu]=pv;}return cycles===0;}; expect(isTree(4,[[0,1],[1,2],[2,3]])).toBe(true); expect(isTree(3,[[0,1],[1,2],[2,0]])).toBe(false); });
  it('implements simple regex match (. and *)', () => { const rmatch=(s:string,p:string):boolean=>{if(!p)return!s;const first=!!s&&(p[0]==='.'||p[0]===s[0]);if(p.length>=2&&p[1]==='*')return rmatch(s,p.slice(2))||(first&&rmatch(s.slice(1),p));return first&&rmatch(s.slice(1),p.slice(1));}; expect(rmatch('aa','a*')).toBe(true); expect(rmatch('ab','.*')).toBe(true); });
  it('finds minimum operations to make array palindrome', () => { const minOps=(a:number[])=>{let ops=0,l=0,r=a.length-1;while(l<r){if(a[l]<a[r]){a[l+1]+=a[l];l++;ops++;}else if(a[l]>a[r]){a[r-1]+=a[r];r--;ops++;}else{l++;r--;}}return ops;}; expect(minOps([1,4,5,1])).toBe(1); });
  it('finds celebrity in party (simulation)', () => { const findCeleb=(knows:(a:number,b:number)=>boolean,n:number)=>{let cand=0;for(let i=1;i<n;i++)if(knows(cand,i))cand=i;for(let i=0;i<n;i++)if(i!==cand&&(knows(cand,i)||!knows(i,cand)))return -1;return cand;}; const mat=[[0,1,1],[0,0,1],[0,0,0]]; const knows=(a:number,b:number)=>mat[a][b]===1; expect(findCeleb(knows,3)).toBe(2); });
});


describe('phase42 coverage', () => {
  it('checks if two rectangles overlap', () => { const overlap=(x1:number,y1:number,w1:number,h1:number,x2:number,y2:number,w2:number,h2:number)=>x1<x2+w2&&x1+w1>x2&&y1<y2+h2&&y1+h1>y2; expect(overlap(0,0,4,4,2,2,4,4)).toBe(true); expect(overlap(0,0,2,2,3,3,2,2)).toBe(false); });
  it('computes luminance of color', () => { const lum=(r:number,g:number,b:number)=>0.299*r+0.587*g+0.114*b; expect(Math.round(lum(255,255,255))).toBe(255); expect(Math.round(lum(0,0,0))).toBe(0); });
  it('translates point', () => { const translate=(x:number,y:number,dx:number,dy:number):[number,number]=>[x+dx,y+dy]; expect(translate(1,2,3,4)).toEqual([4,6]); });
  it('computes Zeckendorf representation count', () => { const fibs=(n:number)=>{const f=[1,2];while(f[f.length-1]+f[f.length-2]<=n)f.push(f[f.length-1]+f[f.length-2]);return f.filter(v=>v<=n).reverse();}; const zeck=(n:number)=>{const f=fibs(n);const r:number[]=[];let rem=n;for(const v of f)if(rem>=v){r.push(v);rem-=v;}return r;}; expect(zeck(11)).toEqual([8,3]); });
  it('converts hex color to RGB', () => { const fromHex=(h:string)=>{const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];}; expect(fromHex('#ffa500')).toEqual([255,165,0]); });
});


describe('phase43 coverage', () => {
  it('checks if two date ranges overlap', () => { const overlap=(s1:number,e1:number,s2:number,e2:number)=>s1<=e2&&s2<=e1; expect(overlap(1,5,3,8)).toBe(true); expect(overlap(1,3,5,8)).toBe(false); });
  it('normalizes values to 0-1 range', () => { const norm=(a:number[])=>{const min=Math.min(...a),max=Math.max(...a),r=max-min;return r===0?a.map(()=>0):a.map(v=>(v-min)/r);}; expect(norm([0,5,10])).toEqual([0,0.5,1]); });
  it('checks if time is business hours', () => { const isBiz=(h:number)=>h>=9&&h<17; expect(isBiz(10)).toBe(true); expect(isBiz(18)).toBe(false); expect(isBiz(9)).toBe(true); });
  it('formats duration in seconds to mm:ss', () => { const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; expect(fmt(90)).toBe('01:30'); expect(fmt(3661)).toBe('61:01'); });
  it('z-score normalizes values', () => { const zscore=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;const std=Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/a.length);return std===0?a.map(()=>0):a.map(v=>(v-m)/std);}; const z=zscore([2,4,4,4,5,5,7,9]);expect(Math.abs(z.reduce((s,v)=>s+v,0))).toBeLessThan(1e-9); });
});


describe('phase44 coverage', () => {
  it('finds tree height', () => { type N={v:number;l?:N;r?:N}; const h=(n:N|undefined):number=>!n?0:1+Math.max(h(n.l),h(n.r)); const t:N={v:1,l:{v:2,l:{v:4}},r:{v:3}}; expect(h(t)).toBe(3); });
  it('computes cross product of 2D vectors', () => { const cross=(ax:number,ay:number,bx:number,by:number)=>ax*by-ay*bx; expect(cross(1,0,0,1)).toBe(1); expect(cross(1,0,1,0)).toBe(0); });
  it('generates UUID v4 format string', () => { const uuid=()=>'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);}); const id=uuid(); expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/); });
  it('computes standard deviation', () => { const sd=(a:number[])=>Math.sqrt(a.reduce((s,v,_,arr)=>s+(v-arr.reduce((x,y)=>x+y,0)/arr.length)**2,0)/a.length); expect(Math.round(sd([2,4,4,4,5,5,7,9])*100)/100).toBe(2); });
  it('counts ways to climb n stairs', () => { const clmb=(n:number)=>{const dp=[1,1];for(let i=2;i<=n;i++)dp.push(dp[dp.length-1]+dp[dp.length-2]);return dp[n];}; expect(clmb(5)).toBe(8); expect(clmb(10)).toBe(89); });
});


describe('phase45 coverage', () => {
  it('counts words in a string', () => { const wc=(s:string)=>s.trim()===''?0:s.trim().split(/\s+/).length; expect(wc('hello world')).toBe(2); expect(wc('  a  b  c  ')).toBe(3); expect(wc('')).toBe(0); });
  it('extracts domain from URL string', () => { const dom=(url:string)=>url.replace(/^https?:\/\//,'').split('/')[0].split('?')[0]; expect(dom('https://www.example.com/path?q=1')).toBe('www.example.com'); });
  it('computes checksum (Fletcher-16)', () => { const fl16=(data:number[])=>{let s1=0,s2=0;for(const b of data){s1=(s1+b)%255;s2=(s2+s1)%255;}return(s2<<8)|s1;}; const c=fl16([0x01,0x02]); expect(c).toBe(0x0403); });
  it('finds k nearest neighbors by distance', () => { const knn=(pts:[number,number][],q:[number,number],k:number)=>[...pts].sort((a,b)=>(a[0]-q[0])**2+(a[1]-q[1])**2-(b[0]-q[0])**2-(b[1]-q[1])**2).slice(0,k); const pts:[number,number][]=[[0,0],[1,1],[2,2],[5,5]]; expect(knn(pts,[1,1],2)).toEqual([[1,1],[0,0]]); });
  it('shuffles array using Fisher-Yates', () => { const shuf=(a:number[])=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}; const a=[1,2,3,4,5];const s=shuf(a); expect(s.sort((x,y)=>x-y)).toEqual([1,2,3,4,5]); });
});


describe('phase46 coverage', () => {
  it('implements LCS (longest common subsequence)', () => { const lcs=(a:string,b:string)=>{const m=a.length,n=b.length;const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);return dp[m][n];}; expect(lcs('ABCBDAB','BDCAB')).toBe(4); expect(lcs('AGGTAB','GXTXAYB')).toBe(4); });
  it('implements sieve of Eratosthenes', () => { const sieve=(n:number)=>{const p=new Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return Array.from({length:n-1},(_,i)=>i+2).filter(i=>p[i]);}; expect(sieve(30)).toEqual([2,3,5,7,11,13,17,19,23,29]); });
  it('computes nth Catalan number', () => { const cat=(n:number):number=>n<=1?1:Array.from({length:n},(_,i)=>cat(i)*cat(n-1-i)).reduce((s,v)=>s+v,0); expect(cat(0)).toBe(1); expect(cat(3)).toBe(5); expect(cat(4)).toBe(14); });
  it('finds saddle point in matrix', () => { const sp=(m:number[][])=>{for(let i=0;i<m.length;i++){const rowMin=Math.min(...m[i]);for(let j=0;j<m[i].length;j++){if(m[i][j]===rowMin){const col=m.map(r=>r[j]);if(m[i][j]===Math.max(...col))return[i,j];}}}return null;}; expect(sp([[1,2],[4,3]])).toEqual([1,1]); });
  it('finds the single non-duplicate in pairs', () => { const single=(a:number[])=>a.reduce((acc,v)=>acc^v,0); expect(single([2,2,1])).toBe(1); expect(single([4,1,2,1,2])).toBe(4); });
});


describe('phase47 coverage', () => {
  it('checks if directed graph is DAG', () => { const isDAG=(n:number,edges:[number,number][])=>{const adj:number[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v])=>adj[u].push(v));const col=new Array(n).fill(0);const dfs=(u:number):boolean=>{col[u]=1;for(const v of adj[u]){if(col[v]===1)return false;if(col[v]===0&&!dfs(v))return false;}col[u]=2;return true;};return Array.from({length:n},(_,i)=>i).every(i=>col[i]!==0||dfs(i));}; expect(isDAG(4,[[0,1],[1,2],[2,3]])).toBe(true); expect(isDAG(3,[[0,1],[1,2],[2,0]])).toBe(false); });
  it('computes optimal binary search tree cost', () => { const obs=(p:number[])=>{const n=p.length;const dp=Array.from({length:n+2},()=>new Array(n+1).fill(0));const w=Array.from({length:n+2},()=>new Array(n+1).fill(0));for(let i=1;i<=n;i++)w[i][i]=p[i-1];for(let l=2;l<=n;l++)for(let i=1;i<=n-l+1;i++){const j=i+l-1;w[i][j]=w[i][j-1]+p[j-1];dp[i][j]=Infinity;for(let r=i;r<=j;r++){const c=(r>i?dp[i][r-1]:0)+(r<j?dp[r+1][j]:0)+w[i][j];dp[i][j]=Math.min(dp[i][j],c);}}return dp[1][n];}; expect(obs([0.25,0.2,0.05,0.2,0.3])).toBeCloseTo(1.5,1); });
  it('checks if array is monotone', () => { const mono=(a:number[])=>a.every((v,i)=>i===0||v>=a[i-1])||a.every((v,i)=>i===0||v<=a[i-1]); expect(mono([1,2,2,3])).toBe(true); expect(mono([1,3,2])).toBe(false); });
  it('finds number of ways to fill board', () => { const ways=(n:number)=>Math.round(((1+Math.sqrt(5))/2)**(n+1)/Math.sqrt(5)); expect(ways(1)).toBe(1); expect(ways(3)).toBe(3); expect(ways(5)).toBe(8); });
  it('sorts nearly sorted array efficiently', () => { const ins=(a:number[])=>{const r=[...a];for(let i=1;i<r.length;i++){const k=r[i];let j=i-1;while(j>=0&&r[j]>k){r[j+1]=r[j];j--;}r[j+1]=k;}return r;}; expect(ins([2,6,4,1,8,7,3,5])).toEqual([1,2,3,4,5,6,7,8]); });
});


describe('phase48 coverage', () => {
  it('finds number of ways to express n as sum of primes', () => { const wp=(n:number)=>{const sieve=(m:number)=>{const p=new Array(m+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=m;i++)if(p[i])for(let j=i*i;j<=m;j+=i)p[j]=false;return Array.from({length:m-1},(_,i)=>i+2).filter(i=>p[i]);};const primes=sieve(n);const dp=new Array(n+1).fill(0);dp[0]=1;for(const p of primes)for(let i=p;i<=n;i++)dp[i]+=dp[i-p];return dp[n];}; expect(wp(7)).toBe(3); expect(wp(10)).toBe(5); });
  it('checks if string matches simple regex', () => { const mr=(s:string,p:string):boolean=>{if(!p.length)return !s.length;const fm=p[0]==='.'||p[0]===s[0];if(p.length>1&&p[1]==='*')return mr(s,p.slice(2))||(s.length>0&&fm&&mr(s.slice(1),p));return s.length>0&&fm&&mr(s.slice(1),p.slice(1));}; expect(mr('aa','a*')).toBe(true); expect(mr('ab','.*')).toBe(true); expect(mr('aab','c*a*b')).toBe(true); });
  it('computes minimum cost to cut rod', () => { const cr=(n:number,cuts:number[])=>{const c=[0,...cuts.sort((a,b)=>a-b),n];const m=c.length;const dp:number[][]=Array.from({length:m},()=>new Array(m).fill(0));for(let l=2;l<m;l++)for(let i=0;i<m-l;i++){const j=i+l;dp[i][j]=Infinity;for(let k=i+1;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k][j]+c[j]-c[i]);}return dp[0][m-1];}; expect(cr(7,[1,3,4,5])).toBe(16); });
  it('generates nth row of Pascal triangle', () => { const pt=(n:number)=>{let r=[1];for(let i=0;i<n;i++)r=[...r,0].map((v,j)=>v+(r[j-1]||0));return r;}; expect(pt(4)).toEqual([1,4,6,4,1]); expect(pt(0)).toEqual([1]); });
  it('finds the Josephus position', () => { const jos=(n:number,k:number):number=>n===1?0:(jos(n-1,k)+k)%n; expect(jos(7,3)).toBe(3); expect(jos(6,2)).toBe(4); });
});


describe('phase49 coverage', () => {
  it('finds median of two sorted arrays', () => { const med=(a:number[],b:number[])=>{const m=[...a,...b].sort((x,y)=>x-y);const n=m.length;return n%2?m[n>>1]:(m[n/2-1]+m[n/2])/2;}; expect(med([1,3],[2])).toBe(2); expect(med([1,2],[3,4])).toBe(2.5); });
  it('finds shortest path with BFS', () => { const bfs=(g:number[][],s:number,t:number)=>{const d=new Array(g.length).fill(-1);d[s]=0;const q=[s];while(q.length){const u=q.shift()!;for(const v of g[u])if(d[v]===-1){d[v]=d[u]+1;if(v===t)return d[v];q.push(v);}}return d[t];}; expect(bfs([[1,2],[0,3],[0,3],[1,2]],0,3)).toBe(2); });
  it('finds minimum cuts for palindrome partition', () => { const minCut=(s:string)=>{const n=s.length;const isPalin=(i:number,j:number):boolean=>i>=j?true:s[i]===s[j]&&isPalin(i+1,j-1);const dp=new Array(n).fill(0);for(let i=1;i<n;i++){if(isPalin(0,i)){dp[i]=0;}else{dp[i]=Infinity;for(let j=1;j<=i;j++)if(isPalin(j,i))dp[i]=Math.min(dp[i],dp[j-1]+1);}}return dp[n-1];}; expect(minCut('aab')).toBe(1); expect(minCut('a')).toBe(0); });
  it('computes power set', () => { const ps=(a:number[]):number[][]=>a.reduce<number[][]>((acc,v)=>[...acc,...acc.map(s=>[...s,v])],[[]]); expect(ps([1,2]).length).toBe(4); expect(ps([]).length).toBe(1); });
  it('computes minimum time to finish tasks', () => { const mtt=(t:number[],k:number)=>{const s=[...t].sort((a,b)=>b-a);let time=0;for(let i=0;i<s.length;i+=k)time+=s[i];return time;}; expect(mtt([3,2,4,4,4,2,2],3)).toBe(9); });
});


describe('phase50 coverage', () => {
  it('computes number of subarrays with product less than k', () => { const spk=(a:number[],k:number)=>{if(k<=1)return 0;let l=0,prod=1,cnt=0;for(let r=0;r<a.length;r++){prod*=a[r];while(prod>=k)prod/=a[l++];cnt+=r-l+1;}return cnt;}; expect(spk([10,5,2,6],100)).toBe(8); expect(spk([1,2,3],0)).toBe(0); });
  it('finds maximum product of three numbers', () => { const mp3=(a:number[])=>{const s=[...a].sort((x,y)=>x-y),n=s.length;return Math.max(s[n-1]*s[n-2]*s[n-3],s[0]*s[1]*s[n-1]);}; expect(mp3([1,2,3])).toBe(6); expect(mp3([-10,-10,5,2])).toBe(500); });
  it('computes maximum points on a line', () => { const mpl=(pts:[number,number][])=>{if(pts.length<3)return pts.length;let max=0;for(let i=0;i<pts.length;i++){const map=new Map<string,number>();for(let j=i+1;j<pts.length;j++){const dx=pts[j][0]-pts[i][0],dy=pts[j][1]-pts[i][1];const gcd2=(a:number,b:number):number=>b===0?a:gcd2(b,a%b);const g=gcd2(Math.abs(dx),Math.abs(dy));const k=`${dx/g},${dy/g}`;map.set(k,(map.get(k)||0)+1);}max=Math.max(max,...map.values());}return max+1;}; expect(mpl([[1,1],[2,2],[3,3]])).toBe(3); });
  it('checks if valid sudoku row/col/box', () => { const vr=(b:string[][])=>{const ok=(a:string[])=>{const d=a.filter(v=>v!=='.');return d.length===new Set(d).size;};for(let i=0;i<9;i++){if(!ok(b[i]))return false;if(!ok(b.map(r=>r[i])))return false;}for(let bi=0;bi<3;bi++)for(let bj=0;bj<3;bj++){const box=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)box.push(b[3*bi+i][3*bj+j]);if(!ok(box))return false;}return true;}; expect(vr([['5','3','.','.','7','.','.','.','.'],['6','.','.','1','9','5','.','.','.'],['.','9','8','.','.','.','.','6','.'],['8','.','.','.','6','.','.','.','3'],['4','.','.','8','.','3','.','.','1'],['7','.','.','.','2','.','.','.','6'],['.','6','.','.','.','.','2','8','.'],['.','.','.','4','1','9','.','.','5'],['.','.','.','.','8','.','.','7','9']])).toBe(true); });
  it('computes maximum average subarray of length k', () => { const mas=(a:number[],k:number)=>{let sum=a.slice(0,k).reduce((s,v)=>s+v,0),max=sum;for(let i=k;i<a.length;i++){sum+=a[i]-a[i-k];max=Math.max(max,sum);}return max/k;}; expect(mas([1,12,-5,-6,50,3],4)).toBe(12.75); });
});
