import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemMonitoring: {
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

import router from '../src/routes/monitoring';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/monitoring', router);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockChemical = {
  id: '00000000-0000-0000-0000-000000000001',
  productName: 'Acetone',
  casNumber: '67-64-1',
  orgId: 'org-1',
  isActive: true,
  deletedAt: null,
  welTwa8hr: 10,
};

const mockMonitoring = {
  id: '00000000-0000-0000-0000-000000000040',
  chemicalId: '00000000-0000-0000-0000-000000000001',
  monitoringType: 'AIR_SAMPLE',
  location: 'Lab A',
  sampledAt: '2026-02-01T10:00:00.000Z',
  resultValue: 5,
  resultUnit: 'mg/m3',
  welTwaLimit: 10,
  percentageOfWel: 50,
  resultVsWel: 'BELOW_WEL',
  actionRequired: false,
  chemical: {
    id: '00000000-0000-0000-0000-000000000001',
    productName: 'Acetone',
    casNumber: '67-64-1',
  },
};

const validMonitoringBody = {
  chemicalId: '00000000-0000-0000-0000-000000000001',
  monitoringType: 'AIR_SAMPLE' as const,
  sampledAt: '2026-02-01T10:00:00.000Z',
  resultValue: 5,
  resultUnit: 'mg/m3',
  welTwaLimit: 10,
};

describe('GET /api/monitoring', () => {
  it('should return a list of monitoring records with pagination', async () => {
    mockPrisma.chemMonitoring.findMany.mockResolvedValue([mockMonitoring]);
    mockPrisma.chemMonitoring.count.mockResolvedValue(1);

    const res = await request(app).get('/api/monitoring');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support chemicalId filter', async () => {
    mockPrisma.chemMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/monitoring?chemicalId=00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(mockPrisma.chemMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ chemicalId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('should support welResult filter', async () => {
    mockPrisma.chemMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);

    const res = await request(app).get('/api/monitoring?welResult=ABOVE_WEL');
    expect(res.status).toBe(200);
    expect(mockPrisma.chemMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ resultVsWel: 'ABOVE_WEL' }) })
    );
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemMonitoring.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/monitoring');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/monitoring/overdue', () => {
  it('should return overdue monitoring records', async () => {
    const overdueItem = { ...mockMonitoring, nextMonitoringDue: '2025-12-01T00:00:00.000Z' };
    mockPrisma.chemMonitoring.findMany.mockResolvedValue([overdueItem]);

    const res = await request(app).get('/api/monitoring/overdue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return empty array when no overdue monitoring', async () => {
    mockPrisma.chemMonitoring.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/monitoring/overdue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on error', async () => {
    mockPrisma.chemMonitoring.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/monitoring/overdue');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/monitoring/dashboard', () => {
  it('should return WEL dashboard stats', async () => {
    mockPrisma.chemMonitoring.count
      .mockResolvedValueOnce(100) // total
      .mockResolvedValueOnce(5) // aboveWel
      .mockResolvedValueOnce(10) // atWel
      .mockResolvedValueOnce(80) // belowWel
      .mockResolvedValueOnce(3); // overdue

    const res = await request(app).get('/api/monitoring/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      total: 100,
      aboveWel: 5,
      atWel: 10,
      belowWel: 80,
      overdue: 3,
    });
  });

  it('should return zeros when no monitoring data', async () => {
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);

    const res = await request(app).get('/api/monitoring/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.chemMonitoring.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/monitoring/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/monitoring', () => {
  it('should create a monitoring record with auto-calculated WEL percentage', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemMonitoring.create.mockResolvedValue(mockMonitoring);

    const res = await request(app).post('/api/monitoring').send(validMonitoringBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // resultValue=5, welTwaLimit=10 => 50% => BELOW_WEL
    expect(mockPrisma.chemMonitoring.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          percentageOfWel: 50,
          resultVsWel: 'BELOW_WEL',
          actionRequired: false,
        }),
      })
    );
  });

  it('should auto-calculate WEL as AT_WEL when result is 90% of limit', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemMonitoring.create.mockResolvedValue({
      ...mockMonitoring,
      percentageOfWel: 95,
      resultVsWel: 'AT_WEL',
      actionRequired: true,
    });

    const res = await request(app)
      .post('/api/monitoring')
      .send({
        ...validMonitoringBody,
        resultValue: 9.5,
      });
    expect(res.status).toBe(201);
    expect(mockPrisma.chemMonitoring.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          percentageOfWel: 95,
          resultVsWel: 'AT_WEL',
          actionRequired: true,
        }),
      })
    );
  });

  it('should auto-calculate WEL as ABOVE_WEL when result exceeds limit', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemMonitoring.create.mockResolvedValue({
      ...mockMonitoring,
      percentageOfWel: 150,
      resultVsWel: 'ABOVE_WEL',
      actionRequired: true,
    });

    const res = await request(app)
      .post('/api/monitoring')
      .send({
        ...validMonitoringBody,
        resultValue: 15,
      });
    expect(res.status).toBe(201);
    expect(mockPrisma.chemMonitoring.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          percentageOfWel: 150,
          resultVsWel: 'ABOVE_WEL',
          actionRequired: true,
        }),
      })
    );
  });

  it('should use chemical welTwa8hr when welTwaLimit not provided', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemMonitoring.create.mockResolvedValue(mockMonitoring);

    const res = await request(app).post('/api/monitoring').send({
      chemicalId: '00000000-0000-0000-0000-000000000001',
      monitoringType: 'AIR_SAMPLE',
      sampledAt: '2026-02-01T10:00:00.000Z',
      resultValue: 5,
      resultUnit: 'mg/m3',
    });
    expect(res.status).toBe(201);
    expect(mockPrisma.chemMonitoring.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          welTwaLimit: 10,
        }),
      })
    );
  });

  it('should return 400 when monitoringType is invalid', async () => {
    const res = await request(app)
      .post('/api/monitoring')
      .send({
        ...validMonitoringBody,
        monitoringType: 'INVALID_TYPE',
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when chemical does not exist', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/monitoring')
      .send({
        ...validMonitoringBody,
        chemicalId: '00000000-0000-0000-0000-000000000099',
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toBe('Chemical not found');
  });

  it('should return 500 on database create error', async () => {
    mockPrisma.chemRegister.findFirst.mockResolvedValue(mockChemical);
    mockPrisma.chemMonitoring.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/monitoring').send(validMonitoringBody);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/monitoring/:id', () => {
  it('should update an existing monitoring record', async () => {
    mockPrisma.chemMonitoring.findFirst.mockResolvedValue(mockMonitoring);
    mockPrisma.chemMonitoring.update.mockResolvedValue({
      ...mockMonitoring,
      location: 'Lab B',
    });

    const res = await request(app)
      .put('/api/monitoring/00000000-0000-0000-0000-000000000040')
      .send({
        location: 'Lab B',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.location).toBe('Lab B');
  });

  it('should return 404 when monitoring record not found', async () => {
    mockPrisma.chemMonitoring.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/monitoring/00000000-0000-0000-0000-000000000099')
      .send({
        location: 'Lab B',
      });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemMonitoring.findFirst.mockResolvedValue(mockMonitoring);
    mockPrisma.chemMonitoring.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/monitoring/00000000-0000-0000-0000-000000000040')
      .send({
        location: 'Lab B',
      });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
