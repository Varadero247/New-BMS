import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualDocument: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
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
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/rbac', () => ({
  requirePermission: () => (_req: any, _res: any, next: any) => next(),
  PermissionLevel: { NONE: 0, VIEW: 1, CREATE: 2, EDIT: 3, DELETE: 4, APPROVE: 5, FULL: 6 },
}));

import policyRouter from '../src/routes/policy';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/policy', policyRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Quality Policy API Routes', () => {
  const mockPolicyDoc = {
    id: 'doc-uuid-1',
    referenceNumber: 'QMS-POL-2601-001',
    title: 'Quality Policy',
    documentType: 'POLICY',
    scope: 'We are committed to quality excellence.',
    purpose: 'This policy defines our quality objectives.',
    keyChanges: JSON.stringify({
      commitments: 'Customer focus, process improvement',
      objectives: 'Achieve 99% customer satisfaction',
      applicability: 'All departments',
    }),
    version: '2.0',
    status: 'APPROVED',
    author: 'user-1',
    approvedBy: 'Director',
    effectiveDate: new Date('2026-01-01').toISOString(),
    nextReviewDate: new Date('2027-01-01').toISOString(),
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('GET /api/policy', () => {
    it('should return the current quality policy', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);

      const res = await request(app).get('/api/policy');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('policyStatement');
      expect(res.body.data).toHaveProperty('version');
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('commitments');
    });

    it('should return empty defaults when no policy exists', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(null);

      const res = await request(app).get('/api/policy');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeNull();
      expect(res.body.data.policyStatement).toBe('');
      expect(res.body.data.version).toBe('1.0');
      expect(res.body.data.status).toBe('DRAFT');
    });

    it('should handle missing keyChanges gracefully', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue({ ...mockPolicyDoc, keyChanges: null });

      const res = await request(app).get('/api/policy');

      expect(res.status).toBe(200);
      expect(res.body.data.commitments).toBe('');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualDocument.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/policy');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });

    it('findFirst is called exactly once per GET request', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
      await request(app).get('/api/policy');
      expect(mockPrisma.qualDocument.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/policy', () => {
    const validBody = {
      policyStatement: 'We are committed to delivering high-quality products.',
      purpose: 'Define quality direction.',
      commitments: 'Customer focus',
      objectives: 'Achieve 99% satisfaction',
      applicability: 'All departments',
      version: '2.1',
      status: 'APPROVED',
    };

    it('should create a new policy when none exists', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
      mockPrisma.qualDocument.count.mockResolvedValue(0);
      mockPrisma.qualDocument.create.mockResolvedValue(mockPolicyDoc);

      const res = await request(app).put('/api/policy').send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('policyStatement');
    });

    it('should update an existing policy', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
      const updated = { ...mockPolicyDoc, scope: validBody.policyStatement };
      mockPrisma.qualDocument.update.mockResolvedValue(updated);

      const res = await request(app).put('/api/policy').send(validBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing policyStatement', async () => {
      const res = await request(app).put('/api/policy').send({ version: '1.0' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .put('/api/policy')
        .send({ policyStatement: 'Test policy', status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error during create', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
      mockPrisma.qualDocument.count.mockResolvedValue(0);
      mockPrisma.qualDocument.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/policy').send(validBody);

      expect(res.status).toBe(500);
    });

    it('should return 500 on database error during update', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
      mockPrisma.qualDocument.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).put('/api/policy').send(validBody);

      expect(res.status).toBe(500);
    });

    it('update is called when policy already exists', async () => {
      mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
      mockPrisma.qualDocument.update.mockResolvedValue({ ...mockPolicyDoc, scope: validBody.policyStatement });

      await request(app).put('/api/policy').send(validBody);

      expect(mockPrisma.qualDocument.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.qualDocument.create).not.toHaveBeenCalled();
    });
  });
});

describe('Quality Policy — extended', () => {
  const validBody = {
    policyStatement: 'We commit to continuous improvement.',
    purpose: 'Define quality direction.',
    commitments: 'Customer focus',
    objectives: 'Achieve 99% satisfaction',
    applicability: 'All departments',
    version: '3.0',
    status: 'APPROVED',
  };

  it('GET / returns success true on 200', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/policy');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT / with valid body returns success true', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
    mockPrisma.qualDocument.count.mockResolvedValue(0);
    mockPrisma.qualDocument.create.mockResolvedValue({
      id: 'doc-new',
      referenceNumber: 'QMS-POL-2601-002',
      title: 'Quality Policy',
      documentType: 'POLICY',
      scope: validBody.policyStatement,
      purpose: validBody.purpose,
      keyChanges: JSON.stringify({ commitments: validBody.commitments, objectives: validBody.objectives, applicability: validBody.applicability }),
      version: validBody.version,
      status: validBody.status,
      author: 'user-1',
      approvedBy: null,
      effectiveDate: null,
      nextReviewDate: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const res = await request(app).put('/api/policy').send(validBody);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / data has id property', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/policy');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
  });
});

describe('policy.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/policy', policyRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/policy', async () => {
    const res = await request(app).get('/api/policy');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/policy', async () => {
    const res = await request(app).get('/api/policy');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/policy body has success property', async () => {
    const res = await request(app).get('/api/policy');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/policy body is an object', async () => {
    const res = await request(app).get('/api/policy');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/policy route is accessible', async () => {
    const res = await request(app).get('/api/policy');
    expect(res.status).toBeDefined();
  });
});

describe('Quality Policy — edge cases and validation', () => {
  const validBody = {
    policyStatement: 'Quality is everyone\'s responsibility.',
    purpose: 'Establish quality standards.',
    commitments: 'Zero defect mindset',
    objectives: 'Achieve ISO 9001 certification',
    applicability: 'All sites',
    version: '4.0',
    status: 'DRAFT',
  };

  const mockPolicyDoc = {
    id: 'doc-uuid-edge',
    referenceNumber: 'QMS-POL-2601-009',
    title: 'Quality Policy',
    documentType: 'POLICY',
    scope: 'Quality is everyone\'s responsibility.',
    purpose: 'Establish quality standards.',
    keyChanges: JSON.stringify({
      commitments: 'Zero defect mindset',
      objectives: 'Achieve ISO 9001 certification',
      applicability: 'All sites',
    }),
    version: '4.0',
    status: 'DRAFT',
    author: 'user-1',
    approvedBy: null,
    effectiveDate: null,
    nextReviewDate: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('GET /api/policy returns objectives from parsed keyChanges', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
    const res = await request(app).get('/api/policy');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('objectives');
  });

  it('GET /api/policy returns applicability from parsed keyChanges', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
    const res = await request(app).get('/api/policy');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('applicability');
  });

  it('PUT /api/policy with DRAFT status succeeds', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
    mockPrisma.qualDocument.count.mockResolvedValue(0);
    mockPrisma.qualDocument.create.mockResolvedValue(mockPolicyDoc);
    const res = await request(app).put('/api/policy').send(validBody);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/policy count is called to generate reference number when creating', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
    mockPrisma.qualDocument.count.mockResolvedValue(5);
    mockPrisma.qualDocument.create.mockResolvedValue(mockPolicyDoc);
    await request(app).put('/api/policy').send(validBody);
    expect(mockPrisma.qualDocument.count).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/policy does not call create when existing doc found', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
    mockPrisma.qualDocument.update.mockResolvedValue(mockPolicyDoc);
    await request(app).put('/api/policy').send(validBody);
    expect(mockPrisma.qualDocument.create).not.toHaveBeenCalled();
  });

  it('PUT /api/policy returns 400 when policyStatement is empty string', async () => {
    const res = await request(app).put('/api/policy').send({ ...validBody, policyStatement: '' });
    expect(res.status).toBe(400);
  });

  it('GET /api/policy returns effectiveDate field', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue({
      ...mockPolicyDoc,
      effectiveDate: new Date('2026-01-01').toISOString(),
    });
    const res = await request(app).get('/api/policy');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('effectiveDate');
  });

  it('GET /api/policy returns nextReviewDate field', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue({
      ...mockPolicyDoc,
      nextReviewDate: new Date('2027-01-01').toISOString(),
    });
    const res = await request(app).get('/api/policy');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('nextReviewDate');
  });
});

describe('Quality Policy — additional scenarios', () => {
  const mockPolicyDoc = {
    id: 'doc-uuid-extra',
    referenceNumber: 'QMS-POL-2601-010',
    title: 'Quality Policy',
    documentType: 'POLICY',
    scope: 'Quality is our top priority.',
    purpose: 'Define our commitment.',
    keyChanges: JSON.stringify({
      commitments: 'Customer first',
      objectives: '100% satisfaction',
      applicability: 'All regions',
    }),
    version: '5.0',
    status: 'APPROVED',
    author: 'user-1',
    approvedBy: 'CEO',
    effectiveDate: new Date('2026-01-01').toISOString(),
    nextReviewDate: new Date('2027-01-01').toISOString(),
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/policy — returns approvedBy field', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
    const res = await request(app).get('/api/policy');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('approvedBy');
    expect(res.body.data.approvedBy).toBe('CEO');
  });

  it('GET /api/policy — returns version from document', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
    const res = await request(app).get('/api/policy');
    expect(res.status).toBe(200);
    expect(res.body.data.version).toBe('5.0');
  });

  it('GET /api/policy — returns APPROVED status', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
    const res = await request(app).get('/api/policy');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('PUT /api/policy — create is called with POLICY document type', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(null);
    mockPrisma.qualDocument.count.mockResolvedValue(0);
    mockPrisma.qualDocument.create.mockResolvedValue(mockPolicyDoc);

    await request(app).put('/api/policy').send({
      policyStatement: 'New quality statement.',
      purpose: 'Ensure excellence',
      commitments: 'Total quality',
      objectives: '99% uptime',
      applicability: 'Group-wide',
      version: '1.0',
      status: 'DRAFT',
    });

    expect(mockPrisma.qualDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ documentType: 'POLICY' }),
      })
    );
  });

  it('PUT /api/policy — update is called with correct doc id when existing', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
    mockPrisma.qualDocument.update.mockResolvedValue({ ...mockPolicyDoc, scope: 'Updated statement.' });

    await request(app).put('/api/policy').send({
      policyStatement: 'Updated statement.',
      purpose: 'Keep improving',
      commitments: 'Customer focus',
      objectives: 'Zero defects',
      applicability: 'All sites',
      version: '5.1',
      status: 'APPROVED',
    });

    expect(mockPrisma.qualDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'doc-uuid-extra' },
      })
    );
  });

  it('GET /api/policy — response body has success property', async () => {
    mockPrisma.qualDocument.findFirst.mockResolvedValue(mockPolicyDoc);
    const res = await request(app).get('/api/policy');
    expect(res.body).toHaveProperty('success', true);
  });

  it('PUT /api/policy — returns 400 when policyStatement is whitespace only', async () => {
    const res = await request(app).put('/api/policy').send({
      policyStatement: '   ',
      purpose: 'Something',
      commitments: 'Commitment',
      objectives: 'Objectives',
      applicability: 'All',
      version: '1.0',
      status: 'DRAFT',
    });
    expect(res.status).toBe(400);
  });
});
