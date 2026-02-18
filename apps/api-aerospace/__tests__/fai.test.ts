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
