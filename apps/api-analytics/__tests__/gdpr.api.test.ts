import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    gdprDataCategory: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    dataProcessingAgreement: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    dataRequest: {
      findMany: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/gdpr';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/gdpr', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/gdpr/categories — List GDPR data categories
// ===================================================================
describe('GET /api/gdpr/categories', () => {
  it('should return a list of GDPR data categories', async () => {
    const categories = [
      {
        id: 'cat-1',
        category: 'Personal Data',
        legalBasis: 'CONSENT',
        complianceStatus: 'COMPLIANT',
      },
      {
        id: 'cat-2',
        category: 'Health Data',
        legalBasis: 'VITAL_INTERESTS',
        complianceStatus: 'AT_RISK',
      },
    ];
    mockPrisma.gdprDataCategory.findMany.mockResolvedValue(categories);

    const res = await request(app).get('/api/gdpr/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.categories).toHaveLength(2);
  });

  it('should return an empty list when no categories exist', async () => {
    mockPrisma.gdprDataCategory.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/gdpr/categories');

    expect(res.status).toBe(200);
    expect(res.body.data.categories).toHaveLength(0);
  });

  it('should handle server errors', async () => {
    mockPrisma.gdprDataCategory.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/gdpr/categories');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/gdpr/dpas — List data processing agreements
// ===================================================================
describe('GET /api/gdpr/dpas', () => {
  it('should return a list of DPAs', async () => {
    const dpas = [
      { id: 'dpa-1', processorName: 'AWS', purpose: 'Cloud hosting', isActive: true },
      { id: 'dpa-2', processorName: 'Stripe', purpose: 'Payment processing', isActive: true },
    ];
    mockPrisma.dataProcessingAgreement.findMany.mockResolvedValue(dpas);

    const res = await request(app).get('/api/gdpr/dpas');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dpas).toHaveLength(2);
  });

  it('should handle server errors', async () => {
    mockPrisma.dataProcessingAgreement.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/gdpr/dpas');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/gdpr/report — GDPR compliance report
// ===================================================================
describe('GET /api/gdpr/report', () => {
  it('should return a GDPR compliance report', async () => {
    const categories = [
      { id: 'cat-1', category: 'Personal Data', complianceStatus: 'COMPLIANT' },
      { id: 'cat-2', category: 'Health Data', complianceStatus: 'AT_RISK' },
    ];
    const dpas = [
      { id: 'dpa-1', processorName: 'AWS', isActive: true },
      { id: 'dpa-2', processorName: 'Old Vendor', isActive: false },
    ];
    const dataRequests = [
      { id: 'dr-1', status: 'RECEIVED' },
      { id: 'dr-2', status: 'COMPLETED' },
      { id: 'dr-3', status: 'PROCESSING' },
    ];
    mockPrisma.gdprDataCategory.findMany.mockResolvedValue(categories);
    mockPrisma.dataProcessingAgreement.findMany.mockResolvedValue(dpas);
    mockPrisma.dataRequest.findMany.mockResolvedValue(dataRequests);

    const res = await request(app).get('/api/gdpr/report');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalCategories).toBe(2);
    expect(res.body.data.summary.atRiskCategories).toBe(1);
    expect(res.body.data.summary.totalDpas).toBe(2);
    expect(res.body.data.summary.activeDpas).toBe(1);
    expect(res.body.data.summary.totalRequests).toBe(3);
    expect(res.body.data.summary.pendingRequests).toBe(2);
    expect(res.body.data.requestStats.completed).toBe(1);
  });

  it('should handle empty data', async () => {
    mockPrisma.gdprDataCategory.findMany.mockResolvedValue([]);
    mockPrisma.dataProcessingAgreement.findMany.mockResolvedValue([]);
    mockPrisma.dataRequest.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/gdpr/report');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalCategories).toBe(0);
    expect(res.body.data.summary.totalRequests).toBe(0);
  });

  it('should handle server errors', async () => {
    mockPrisma.gdprDataCategory.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/gdpr/report');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// POST /api/gdpr/categories — Create data category
// ===================================================================
describe('POST /api/gdpr/categories', () => {
  it('should create a GDPR data category', async () => {
    const created = {
      id: 'cat-new',
      category: 'Financial Data',
      legalBasis: 'CONTRACT',
      retentionDays: 730,
      complianceStatus: 'COMPLIANT',
    };
    mockPrisma.gdprDataCategory.create.mockResolvedValue(created);

    const res = await request(app).post('/api/gdpr/categories').send({
      category: 'Financial Data',
      legalBasis: 'CONTRACT',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category.id).toBe('cat-new');
  });

  it('should reject missing category field', async () => {
    const res = await request(app).post('/api/gdpr/categories').send({ legalBasis: 'CONTRACT' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject missing legalBasis field', async () => {
    const res = await request(app)
      .post('/api/gdpr/categories')
      .send({ category: 'Financial Data' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle server errors', async () => {
    mockPrisma.gdprDataCategory.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/gdpr/categories').send({
      category: 'Financial Data',
      legalBasis: 'CONTRACT',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// POST /api/gdpr/dpas — Create data processing agreement
// ===================================================================
describe('POST /api/gdpr/dpas', () => {
  it('should create a DPA', async () => {
    const created = {
      id: 'dpa-new',
      processorName: 'Cloudflare',
      purpose: 'CDN and DDoS protection',
      isActive: true,
    };
    mockPrisma.dataProcessingAgreement.create.mockResolvedValue(created);

    const res = await request(app).post('/api/gdpr/dpas').send({
      processorName: 'Cloudflare',
      purpose: 'CDN and DDoS protection',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dpa.id).toBe('dpa-new');
  });

  it('should reject missing processorName', async () => {
    const res = await request(app).post('/api/gdpr/dpas').send({ purpose: 'CDN' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject missing purpose', async () => {
    const res = await request(app).post('/api/gdpr/dpas').send({ processorName: 'Cloudflare' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle server errors', async () => {
    mockPrisma.dataProcessingAgreement.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/gdpr/dpas').send({
      processorName: 'Cloudflare',
      purpose: 'CDN',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
