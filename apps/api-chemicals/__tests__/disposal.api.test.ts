import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemDisposal: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    chemRegister: { findFirst: jest.fn() },
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

import router from '../src/routes/disposal';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/disposal', router);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockChemical = {
  id: '00000000-0000-0000-0000-000000000001',
  productName: 'Acetone',
  casNumber: '67-64-1',
  wasteClassification: 'HAZARDOUS',
  deletedAt: null,
};

const mockDisposal = {
  id: '00000000-0000-0000-0000-000000000060',
  chemicalId: '00000000-0000-0000-0000-000000000001',
  quantityDisposed: 10,
  unit: 'L',
  disposalDate: '2026-02-15T00:00:00.000Z',
  disposalMethod: 'Licensed waste contractor',
  wasteContractorName: 'Waste Corp Ltd',
  consignmentNoteRef: 'CN-2026-001',
  ewcCode: '07 01 04',
  disposedBy: 'user-1',
  createdBy: 'user-1',
  chemical: {
    id: '00000000-0000-0000-0000-000000000001',
    productName: 'Acetone',
    casNumber: '67-64-1',
    wasteClassification: 'HAZARDOUS',
  },
};

const validDisposalBody = {
  chemicalId: '00000000-0000-0000-0000-000000000001',
  quantityDisposed: 10,
  unit: 'L',
  disposalDate: '2026-02-15T00:00:00.000Z',
  disposalMethod: 'Licensed waste contractor',
};

describe('GET /api/disposal', () => {
  it('should return a list of disposal records with pagination', async () => {
    mockPrisma.chemDisposal.findMany.mockResolvedValue([mockDisposal]);
    mockPrisma.chemDisposal.count.mockResolvedValue(1);

    const res = await request(app).get('/api/disposal');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].disposalMethod).toBe('Licensed waste contractor');
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support chemicalId filter', async () => {
    mockPrisma.chemDisposal.findMany.mockResolvedValue([]);
    mockPrisma.chemDisposal.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/disposal?chemicalId=00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(mockPrisma.chemDisposal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ chemicalId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('should return empty data when no disposal records', async () => {
    mockPrisma.chemDisposal.findMany.mockResolvedValue([]);
    mockPrisma.chemDisposal.count.mockResolvedValue(0);

    const res = await request(app).get('/api/disposal');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemDisposal.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/disposal');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/disposal', () => {
  it('should create a disposal record', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemDisposal.create.mockResolvedValue(mockDisposal);

    const res = await request(app).post('/api/disposal').send(validDisposalBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.disposalMethod).toBe('Licensed waste contractor');
    expect(mockPrisma.chemDisposal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          disposedBy: 'user-1',
          createdBy: 'user-1',
        }),
      })
    );
  });

  it('should create disposal with full details', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemDisposal.create.mockResolvedValue(mockDisposal);

    const res = await request(app)
      .post('/api/disposal')
      .send({
        ...validDisposalBody,
        wasteContractorName: 'Waste Corp Ltd',
        consignmentNoteRef: 'CN-2026-001',
        ewcCode: '07 01 04',
        collectionSite: 'Main plant',
        disposalFacility: 'Licensed incinerator',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when disposalMethod is missing', async () => {
    const res = await request(app).post('/api/disposal').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      quantityDisposed: 10,
      unit: 'L',
      disposalDate: '2026-02-15T00:00:00.000Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when quantityDisposed is negative', async () => {
    const res = await request(app)
      .post('/api/disposal')
      .send({
        ...validDisposalBody,
        quantityDisposed: -5,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when unit is missing', async () => {
    const res = await request(app).post('/api/disposal').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      quantityDisposed: 10,
      disposalDate: '2026-02-15T00:00:00.000Z',
      disposalMethod: 'Licensed waste contractor',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when chemical does not exist', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/disposal')
      .send({
        ...validDisposalBody,
        chemicalId: '00000000-0000-0000-0000-000000000099',
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Chemical not found');
  });

  it('should return 500 on database create error', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemDisposal.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/disposal').send(validDisposalBody);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/disposal/:id', () => {
  it('should update an existing disposal record', async () => {
    mockPrisma.chemDisposal.findFirst.mockResolvedValue(mockDisposal);
    mockPrisma.chemDisposal.update.mockResolvedValue({
      ...mockDisposal,
      certificateRef: 'CERT-2026-001',
    });

    const res = await request(app).put('/api/disposal/00000000-0000-0000-0000-000000000060').send({
      certificateRef: 'CERT-2026-001',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.certificateRef).toBe('CERT-2026-001');
  });

  it('should return 404 when disposal record not found', async () => {
    mockPrisma.chemDisposal.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/disposal/00000000-0000-0000-0000-000000000099').send({
      certificateRef: 'CERT-X',
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemDisposal.findFirst.mockResolvedValue(mockDisposal);
    mockPrisma.chemDisposal.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/disposal/00000000-0000-0000-0000-000000000060').send({
      certificateRef: 'Fail',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Chemicals Disposal — extended', () => {
  it('GET /disposal filters records via nested chemical.orgId', async () => {
    mockPrisma.chemDisposal.findMany.mockResolvedValue([]);
    mockPrisma.chemDisposal.count.mockResolvedValue(0);

    await request(app).get('/api/disposal');

    expect(mockPrisma.chemDisposal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          chemical: expect.objectContaining({ orgId: 'org-1' }),
        }),
      })
    );
  });
});
