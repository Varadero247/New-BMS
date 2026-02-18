import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    csrRequirement: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    CsrRequirementWhereInput: {},
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
import csrRoutes from '../src/routes/csr';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockCsr1 = {
  id: '30000000-0000-4000-a000-000000000001',
  oem: 'Toyota',
  iatfClause: '8.3.2.1',
  requirementTitle: 'Product Design Skills',
  description: 'Personnel involved in product design shall be competent',
  complianceStatus: 'COMPLIANT',
  gapNotes: null,
  actionRequired: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-20'),
};

const mockCsr2 = {
  id: '30000000-0000-4000-a000-000000000002',
  oem: 'Toyota',
  iatfClause: '9.1.1.1',
  requirementTitle: 'Monitoring and Measurement',
  description: 'Statistical tools for monitoring manufacturing processes',
  complianceStatus: 'PARTIAL',
  gapNotes: 'SPC implementation in progress',
  actionRequired: 'Complete SPC deployment on Line 4',
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-20'),
  updatedAt: new Date('2026-02-01'),
};

const mockCsr3 = {
  id: '30000000-0000-4000-a000-000000000003',
  oem: 'Ford',
  iatfClause: '7.1.5.3.2',
  requirementTitle: 'External Laboratory',
  description: 'External lab used for inspection shall be accredited',
  complianceStatus: 'NON_COMPLIANT',
  gapNotes: 'Lab accreditation expired',
  actionRequired: 'Renew ILAC accreditation immediately',
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-05'),
};

const mockCsr4 = {
  id: '30000000-0000-4000-a000-000000000004',
  oem: 'GM',
  iatfClause: '8.5.6.1',
  requirementTitle: 'Management of Production Tooling',
  description: 'Tooling management system shall be established',
  complianceStatus: 'NOT_ASSESSED',
  gapNotes: null,
  actionRequired: null,
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-05'),
};

// ==========================================
// Tests
// ==========================================

describe('Automotive CSR API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/csr', csrRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // GET /oems - List distinct OEM names
  // ==========================================
  describe('GET /api/csr/oems', () => {
    it('should return a list of distinct OEM names', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([
        { oem: 'Ford' },
        { oem: 'GM' },
        { oem: 'Toyota' },
      ]);

      const response = await request(app).get('/api/csr/oems').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(['Ford', 'GM', 'Toyota']);
      expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith({
        distinct: ['oem'],
        select: { oem: true },
        orderBy: { oem: 'asc' },
        take: 200,
      });
    });

    it('should return an empty array when no OEMs exist', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app).get('/api/csr/oems').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockRejectedValue(
        new Error('DB connection lost')
      );

      const response = await request(app).get('/api/csr/oems').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /gaps - Non-compliant CSRs
  // ==========================================
  describe('GET /api/csr/gaps', () => {
    it('should return non-compliant CSRs with pagination', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([mockCsr2, mockCsr3]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app).get('/api/csr/gaps').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });

      // Verify the where clause excludes COMPLIANT and NOT_ASSESSED
      expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            complianceStatus: {
              notIn: ['COMPLIANT', 'NOT_ASSESSED'],
            },
          },
          skip: 0,
          take: 20,
        })
      );
    });

    it('should respect page and limit query parameters', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([mockCsr3]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(5);

      const response = await request(app)
        .get('/api/csr/gaps?page=2&limit=2')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(2);
      expect(response.body.meta.totalPages).toBe(3);
      expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 2,
          take: 2,
        })
      );
    });

    it('should return empty data when no gaps exist', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app).get('/api/csr/gaps').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockRejectedValue(
        new Error('Query timeout')
      );

      const response = await request(app).get('/api/csr/gaps').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /oems/:oem - CSRs for a specific OEM
  // ==========================================
  describe('GET /api/csr/oems/:oem', () => {
    it('should return CSRs for a given OEM with pagination', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([mockCsr1, mockCsr2]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/csr/oems/Toyota')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);

      expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            oem: { equals: 'Toyota', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should filter by complianceStatus query param', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([mockCsr1]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/csr/oems/Toyota?complianceStatus=COMPLIANT')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            complianceStatus: 'COMPLIANT',
          }),
        })
      );
    });

    it('should filter by iatfClause query param', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([mockCsr1]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/csr/oems/Toyota?iatfClause=8.3')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            iatfClause: { contains: '8.3', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should apply both complianceStatus and iatfClause filters', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/csr/oems/Ford?complianceStatus=NON_COMPLIANT&iatfClause=7.1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(mockPrisma.csrRequirement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            oem: { equals: 'Ford', mode: 'insensitive' },
            complianceStatus: 'NON_COMPLIANT',
            iatfClause: { contains: '7.1', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should return empty data for an OEM with no CSRs', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.csrRequirement.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/csr/oems/Stellantis')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.csrRequirement.findMany as jest.Mock).mockRejectedValue(
        new Error('Connection refused')
      );

      const response = await request(app)
        .get('/api/csr/oems/Toyota')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // PUT /:id/status - Update compliance status
  // ==========================================
  describe('PUT /api/csr/:id/status', () => {
    it('should update compliance status successfully', async () => {
      const updatedCsr = { ...mockCsr2, complianceStatus: 'COMPLIANT' };
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue(mockCsr2);
      (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue(updatedCsr);

      const response = await request(app)
        .put(`/api/csr/${mockCsr2.id}/status`)
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.complianceStatus).toBe('COMPLIANT');
      expect(mockPrisma.csrRequirement.update).toHaveBeenCalledWith({
        where: { id: mockCsr2.id },
        data: { complianceStatus: 'COMPLIANT' },
      });
    });

    it('should update status with gapNotes and actionRequired', async () => {
      const updatedCsr = {
        ...mockCsr3,
        complianceStatus: 'PARTIAL',
        gapNotes: 'Lab renewal in progress',
        actionRequired: 'Follow up with accreditation body',
      };
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue(mockCsr3);
      (mockPrisma.csrRequirement.update as jest.Mock).mockResolvedValue(updatedCsr);

      const response = await request(app)
        .put(`/api/csr/${mockCsr3.id}/status`)
        .set('Authorization', 'Bearer token')
        .send({
          complianceStatus: 'PARTIAL',
          gapNotes: 'Lab renewal in progress',
          actionRequired: 'Follow up with accreditation body',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.csrRequirement.update).toHaveBeenCalledWith({
        where: { id: mockCsr3.id },
        data: {
          complianceStatus: 'PARTIAL',
          gapNotes: 'Lab renewal in progress',
          actionRequired: 'Follow up with accreditation body',
        },
      });
    });

    it('should return 404 when CSR requirement not found', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/csr/00000000-0000-0000-0000-000000000099/status')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.csrRequirement.update).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid complianceStatus value', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue(mockCsr1);

      const response = await request(app)
        .put(`/api/csr/${mockCsr1.id}/status`)
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when complianceStatus is missing', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue(mockCsr1);

      const response = await request(app)
        .put(`/api/csr/${mockCsr1.id}/status`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when complianceStatus is empty string', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue(mockCsr1);

      const response = await request(app)
        .put(`/api/csr/${mockCsr1.id}/status`)
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error during update', async () => {
      (mockPrisma.csrRequirement.findUnique as jest.Mock).mockResolvedValue(mockCsr1);
      (mockPrisma.csrRequirement.update as jest.Mock).mockRejectedValue(
        new Error('Deadlock detected')
      );

      const response = await request(app)
        .put(`/api/csr/${mockCsr1.id}/status`)
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
