import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemCoshh: {
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

import router from '../src/routes/coshh';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/coshh', router);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockChemical = {
  id: '00000000-0000-0000-0000-000000000001',
  productName: 'Acetone',
  casNumber: '67-64-1',
  isCmr: false,
  deletedAt: null,
};

const mockCmrChemical = {
  ...mockChemical,
  id: '00000000-0000-0000-0000-000000000002',
  productName: 'Benzene',
  isCmr: true,
};

const mockCoshh = {
  id: '00000000-0000-0000-0000-000000000020',
  chemicalId: '00000000-0000-0000-0000-000000000001',
  referenceNumber: 'COSHH-2026-0001',
  activityDescription: 'Cleaning with acetone',
  orgId: 'org-1',
  status: 'ACTIVE',
  inherentLikelihood: 3,
  inherentSeverity: 4,
  inherentRiskScore: 12,
  inherentRiskLevel: 'HIGH',
  residualLikelihood: 2,
  residualSeverity: 3,
  residualRiskScore: 6,
  residualRiskLevel: 'MEDIUM',
  healthSurveillanceReq: false,
  recordRetentionYears: null,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  chemical: {
    id: '00000000-0000-0000-0000-000000000001',
    productName: 'Acetone',
    casNumber: '67-64-1',
    signalWord: 'DANGER',
    pictograms: [],
  },
};

const validCoshhBody = {
  chemicalId: '00000000-0000-0000-0000-000000000001',
  activityDescription: 'Cleaning with acetone',
  inherentLikelihood: 3,
  inherentSeverity: 4,
  residualLikelihood: 2,
  residualSeverity: 3,
  controlMeasures: { localExhaust: true },
  assessmentDate: '2026-02-01T00:00:00.000Z',
  reviewDate: '2027-02-01T00:00:00.000Z',
};

describe('GET /api/coshh', () => {
  it('should return a list of COSHH assessments with pagination', async () => {
    mockPrisma.chemCoshh.findMany.mockResolvedValue([mockCoshh]);
    mockPrisma.chemCoshh.count.mockResolvedValue(1);

    const res = await request(app).get('/api/coshh');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].referenceNumber).toBe('COSHH-2026-0001');
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status filter', async () => {
    mockPrisma.chemCoshh.findMany.mockResolvedValue([]);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);

    const res = await request(app).get('/api/coshh?status=ACTIVE');
    expect(res.status).toBe(200);
    expect(mockPrisma.chemCoshh.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) })
    );
  });

  it('should support riskLevel filter', async () => {
    mockPrisma.chemCoshh.findMany.mockResolvedValue([]);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);

    const res = await request(app).get('/api/coshh?riskLevel=HIGH');
    expect(res.status).toBe(200);
    expect(mockPrisma.chemCoshh.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ residualRiskLevel: 'HIGH' }) })
    );
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemCoshh.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/coshh');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/coshh/due-review', () => {
  it('should return assessments due for review', async () => {
    const dueItem = { ...mockCoshh, reviewDate: '2026-02-20T00:00:00.000Z' };
    mockPrisma.chemCoshh.findMany.mockResolvedValue([dueItem]);

    const res = await request(app).get('/api/coshh/due-review');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should support days query parameter', async () => {
    mockPrisma.chemCoshh.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/coshh/due-review?days=60');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on error', async () => {
    mockPrisma.chemCoshh.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/coshh/due-review');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/coshh/:id', () => {
  it('should return a single COSHH assessment', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue({ ...mockCoshh, exposureMonitoring: [] });

    const res = await request(app).get('/api/coshh/00000000-0000-0000-0000-000000000020');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceNumber).toBe('COSHH-2026-0001');
  });

  it('should return 404 when assessment not found', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/coshh/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemCoshh.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/coshh/00000000-0000-0000-0000-000000000020');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/coshh', () => {
  it('should create a COSHH assessment with auto-calculated risk scores', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.create.mockResolvedValue(mockCoshh);

    const res = await request(app).post('/api/coshh').send(validCoshhBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Verify risk score auto-calculation: 3*4=12 => HIGH
    expect(mockPrisma.chemCoshh.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inherentRiskScore: 12,
          inherentRiskLevel: 'HIGH',
          residualRiskScore: 6,
          residualRiskLevel: 'MEDIUM',
          orgId: 'org-1',
          createdBy: 'user-1',
        }),
      })
    );
  });

  it('should auto-generate reference number', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemCoshh.count.mockResolvedValue(5);
    mockPrisma.chemCoshh.create.mockResolvedValue({
      ...mockCoshh,
      referenceNumber: 'COSHH-2026-0006',
    });

    const res = await request(app).post('/api/coshh').send(validCoshhBody);
    expect(res.status).toBe(201);
    expect(mockPrisma.chemCoshh.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^COSHH-\d{4}-\d{4}$/),
        }),
      })
    );
  });

  it('should auto-set healthSurveillanceReq and recordRetentionYears=40 for CMR chemicals', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockCmrChemical);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.create.mockResolvedValue({
      ...mockCoshh,
      healthSurveillanceReq: true,
      recordRetentionYears: 40,
    });

    const res = await request(app)
      .post('/api/coshh')
      .send({
        ...validCoshhBody,
        chemicalId: '00000000-0000-0000-0000-000000000002',
      });
    expect(res.status).toBe(201);
    expect(mockPrisma.chemCoshh.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          healthSurveillanceReq: true,
          recordRetentionYears: 40,
        }),
      })
    );
  });

  it('should return 400 when activityDescription is missing', async () => {
    const res = await request(app).post('/api/coshh').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      inherentLikelihood: 3,
      inherentSeverity: 4,
      residualLikelihood: 2,
      residualSeverity: 3,
      controlMeasures: {},
      assessmentDate: '2026-02-01T00:00:00.000Z',
      reviewDate: '2027-02-01T00:00:00.000Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when chemical does not exist', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/coshh')
      .send({
        ...validCoshhBody,
        chemicalId: '00000000-0000-0000-0000-000000000099',
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Chemical not found');
  });

  it('should return 400 when inherentLikelihood is out of range', async () => {
    const res = await request(app)
      .post('/api/coshh')
      .send({
        ...validCoshhBody,
        inherentLikelihood: 6,
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database create error', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/coshh').send(validCoshhBody);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/coshh/:id', () => {
  it('should update an existing COSHH assessment', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);
    mockPrisma.chemCoshh.update.mockResolvedValue({
      ...mockCoshh,
      activityDescription: 'Updated activity',
    });

    const res = await request(app).put('/api/coshh/00000000-0000-0000-0000-000000000020').send({
      activityDescription: 'Updated activity',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.activityDescription).toBe('Updated activity');
  });

  it('should recalculate risk scores when likelihood and severity are updated', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);
    mockPrisma.chemCoshh.update.mockResolvedValue({
      ...mockCoshh,
      inherentRiskScore: 25,
      inherentRiskLevel: 'UNACCEPTABLE',
      residualRiskScore: 20,
      residualRiskLevel: 'UNACCEPTABLE',
    });

    const res = await request(app).put('/api/coshh/00000000-0000-0000-0000-000000000020').send({
      inherentLikelihood: 5,
      inherentSeverity: 5,
      residualLikelihood: 5,
      residualSeverity: 4,
    });
    expect(res.status).toBe(200);
    expect(mockPrisma.chemCoshh.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          inherentRiskScore: 25,
          inherentRiskLevel: 'UNACCEPTABLE',
          residualRiskScore: 20,
          residualRiskLevel: 'UNACCEPTABLE',
        }),
      })
    );
  });

  it('should return 404 when assessment not found', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/coshh/00000000-0000-0000-0000-000000000099').send({
      activityDescription: 'Nope',
    });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);
    mockPrisma.chemCoshh.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/coshh/00000000-0000-0000-0000-000000000020').send({
      activityDescription: 'Fail',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/coshh/:id/sign-off', () => {
  it('should allow assessor sign-off', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);
    mockPrisma.chemCoshh.update.mockResolvedValue({
      ...mockCoshh,
      assessorName: 'John Doe',
      assessorSignedAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/api/coshh/00000000-0000-0000-0000-000000000020/sign-off')
      .send({
        role: 'assessor',
        name: 'John Doe',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.chemCoshh.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          assessorName: 'John Doe',
          assessorSignedAt: expect.any(Date),
        }),
      })
    );
  });

  it('should allow supervisor sign-off', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);
    mockPrisma.chemCoshh.update.mockResolvedValue({
      ...mockCoshh,
      supervisorName: 'Jane Smith',
      supervisorSignedAt: new Date().toISOString(),
    });

    const res = await request(app)
      .post('/api/coshh/00000000-0000-0000-0000-000000000020/sign-off')
      .send({
        role: 'supervisor',
        name: 'Jane Smith',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.chemCoshh.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          supervisorName: 'Jane Smith',
          supervisorSignedAt: expect.any(Date),
        }),
      })
    );
  });

  it('should return 400 when role is missing', async () => {
    const res = await request(app)
      .post('/api/coshh/00000000-0000-0000-0000-000000000020/sign-off')
      .send({
        name: 'John Doe',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/coshh/00000000-0000-0000-0000-000000000020/sign-off')
      .send({
        role: 'assessor',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid role', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);

    const res = await request(app)
      .post('/api/coshh/00000000-0000-0000-0000-000000000020/sign-off')
      .send({
        role: 'manager',
        name: 'Bob',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toMatch(/assessor|supervisor/);
  });

  it('should return 404 when assessment not found', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/coshh/00000000-0000-0000-0000-000000000099/sign-off')
      .send({
        role: 'assessor',
        name: 'John Doe',
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);
    mockPrisma.chemCoshh.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/coshh/00000000-0000-0000-0000-000000000020/sign-off')
      .send({
        role: 'assessor',
        name: 'John Doe',
      });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('COSHH — additional coverage 2', () => {
  it('GET /coshh returns pagination with total field', async () => {
    mockPrisma.chemCoshh.findMany.mockResolvedValue([mockCoshh]);
    mockPrisma.chemCoshh.count.mockResolvedValue(1);
    const res = await request(app).get('/api/coshh');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('total', 1);
  });

  it('POST /coshh sets orgId and createdBy from authenticated user', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.create.mockResolvedValue(mockCoshh);
    await request(app).post('/api/coshh').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      activityDescription: 'Test activity',
      inherentLikelihood: 2,
      inherentSeverity: 3,
      residualLikelihood: 1,
      residualSeverity: 2,
      controlMeasures: {},
      assessmentDate: '2026-02-01T00:00:00.000Z',
      reviewDate: '2027-02-01T00:00:00.000Z',
    });
    expect(mockPrisma.chemCoshh.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ orgId: 'org-1', createdBy: 'user-1' }) })
    );
  });

  it('GET /coshh/:id includes chemical relation in response', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue({ ...mockCoshh, exposureMonitoring: [] });
    const res = await request(app).get('/api/coshh/00000000-0000-0000-0000-000000000020');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('chemical');
  });

  it('GET /coshh/due-review returns array even when empty', async () => {
    mockPrisma.chemCoshh.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/coshh/due-review');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /coshh/:id calls update with correct id in where clause', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);
    mockPrisma.chemCoshh.update.mockResolvedValue({ ...mockCoshh, activityDescription: 'Updated' });
    await request(app).put('/api/coshh/00000000-0000-0000-0000-000000000020').send({ activityDescription: 'Updated' });
    expect(mockPrisma.chemCoshh.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000020' } })
    );
  });

  it('POST /coshh/:id/sign-off returns 200 with success:true on valid supervisor sign-off', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);
    mockPrisma.chemCoshh.update.mockResolvedValue({ ...mockCoshh, supervisorName: 'Supervisor A', supervisorSignedAt: new Date() });
    const res = await request(app)
      .post('/api/coshh/00000000-0000-0000-0000-000000000020/sign-off')
      .send({ role: 'supervisor', name: 'Supervisor A' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /coshh count is called once per list request', async () => {
    mockPrisma.chemCoshh.findMany.mockResolvedValue([]);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    await request(app).get('/api/coshh');
    expect(mockPrisma.chemCoshh.count).toHaveBeenCalledTimes(1);
  });
});

describe('COSHH — additional coverage 3', () => {
  it('GET /coshh response is JSON content-type', async () => {
    mockPrisma.chemCoshh.findMany.mockResolvedValue([]);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    const res = await request(app).get('/api/coshh');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /coshh with page=2&limit=5 passes skip:5 to findMany', async () => {
    mockPrisma.chemCoshh.findMany.mockResolvedValue([]);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    await request(app).get('/api/coshh?page=2&limit=5');
    expect(mockPrisma.chemCoshh.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('POST /coshh returns 400 when assessmentDate is missing', async () => {
    const res = await request(app).post('/api/coshh').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      activityDescription: 'Test activity',
      inherentLikelihood: 2,
      inherentSeverity: 3,
      residualLikelihood: 1,
      residualSeverity: 2,
      controlMeasures: {},
      reviewDate: '2027-02-01T00:00:00.000Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /coshh is not a defined route, returns 404', async () => {
    const res = await request(app).delete('/api/coshh/00000000-0000-0000-0000-000000000020');
    expect([404, 405]).toContain(res.status);
  });

  it('PUT /coshh/:id 500 has success:false in body', async () => {
    mockPrisma.chemCoshh.findFirst.mockResolvedValue(mockCoshh);
    mockPrisma.chemCoshh.update.mockRejectedValue(new Error('DB crash'));
    const res = await request(app)
      .put('/api/coshh/00000000-0000-0000-0000-000000000020')
      .send({ activityDescription: 'Fail' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
