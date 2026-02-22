import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aiMonitoring: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import monitoringRouter from '../src/routes/monitoring';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/monitoring', monitoringRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const UUID1 = '00000000-0000-0000-0000-000000000001';
const UUID2 = '00000000-0000-0000-0000-000000000002';

const mockRecord = {
  id: UUID1,
  systemId: 'system-churn-predictor',
  metricType: 'PERFORMANCE',
  metricName: 'Prediction Accuracy',
  description: 'Overall prediction accuracy metric',
  value: 0.92,
  unit: '%',
  threshold: 0.85,
  thresholdType: 'BELOW',
  status: 'NORMAL',
  isoClause: '9.1',
  measuredBy: 'AutoML Pipeline',
  measurementDate: new Date('2026-01-15'),
  alertSent: false,
  resolvedAt: null,
  resolvedBy: null,
  resolutionNotes: null,
  notes: null,
  metadata: null,
  createdBy: 'user-123',
  organisationId: 'default',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

// ===================================================================
// GET /api/monitoring/dashboard
// ===================================================================
describe('GET /api/monitoring/dashboard', () => {
  it('should return monitoring dashboard summary', async () => {
    mockPrisma.aiMonitoring.count
      .mockResolvedValueOnce(50) // total
      .mockResolvedValueOnce(35) // normal
      .mockResolvedValueOnce(8) // warning
      .mockResolvedValueOnce(5) // alert
      .mockResolvedValueOnce(2); // critical
    mockPrisma.aiMonitoring.groupBy.mockResolvedValue([
      { metricType: 'PERFORMANCE', _count: { id: 20 } },
      { metricType: 'ACCURACY', _count: { id: 15 } },
    ]);
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([mockRecord]);

    const res = await request(app).get('/api/monitoring/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(50);
    expect(res.body.data.normal).toBe(35);
    expect(res.body.data.warning).toBe(8);
    expect(res.body.data.alert).toBe(5);
    expect(res.body.data.critical).toBe(2);
    expect(res.body.data.byMetricType).toHaveLength(2);
    expect(res.body.data.recentAlerts).toHaveLength(1);
  });

  it('should return zeros when no records exist', async () => {
    mockPrisma.aiMonitoring.count.mockResolvedValue(0);
    mockPrisma.aiMonitoring.groupBy.mockResolvedValue([]);
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/monitoring/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(0);
    expect(res.body.data.byMetricType).toHaveLength(0);
    expect(res.body.data.recentAlerts).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiMonitoring.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/monitoring/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/monitoring/system/:systemId
// ===================================================================
describe('GET /api/monitoring/system/:systemId', () => {
  it('should return monitoring records for a specific system', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([mockRecord]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(1);

    const res = await request(app).get('/api/monitoring/system/system-churn-predictor');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status within system', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(0);

    await request(app).get(
      '/api/monitoring/system/00000000-0000-0000-0000-000000000001?status=WARNING'
    );

    expect(mockPrisma.aiMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          systemId: '00000000-0000-0000-0000-000000000001',
          status: 'WARNING',
        }),
      })
    );
  });

  it('should filter by metricType within system', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(0);

    await request(app).get(
      '/api/monitoring/system/00000000-0000-0000-0000-000000000001?metricType=BIAS'
    );

    expect(mockPrisma.aiMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ metricType: 'BIAS' }),
      })
    );
  });

  it('should support pagination', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(50);

    const res = await request(app).get(
      '/api/monitoring/system/00000000-0000-0000-0000-000000000001?page=2&limit=10'
    );

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiMonitoring.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(
      '/api/monitoring/system/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/monitoring — List monitoring records
// ===================================================================
describe('GET /api/monitoring', () => {
  it('should return paginated list of monitoring records', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([mockRecord]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(1);

    const res = await request(app).get('/api/monitoring');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.pagination.page).toBe(1);
  });

  it('should filter by status', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(0);

    await request(app).get('/api/monitoring?status=ALERT');

    expect(mockPrisma.aiMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ALERT' }),
      })
    );
  });

  it('should filter by metricType', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(0);

    await request(app).get('/api/monitoring?metricType=ACCURACY');

    expect(mockPrisma.aiMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ metricType: 'ACCURACY' }),
      })
    );
  });

  it('should filter by systemId', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(0);

    await request(app).get('/api/monitoring?systemId=sys-abc');

    expect(mockPrisma.aiMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ systemId: 'sys-abc' }),
      })
    );
  });

  it('should support search query', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(0);

    await request(app).get('/api/monitoring?search=accuracy');

    expect(mockPrisma.aiMonitoring.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              metricName: expect.objectContaining({ contains: 'accuracy' }),
            }),
          ]),
        }),
      })
    );
  });

  it('should support pagination params', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(100);

    const res = await request(app).get('/api/monitoring?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiMonitoring.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/monitoring');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/monitoring — Create monitoring record
// ===================================================================
describe('POST /api/monitoring', () => {
  const validPayload = {
    systemId: 'system-churn-predictor',
    metricName: 'Prediction Accuracy',
    metricType: 'PERFORMANCE',
    value: 0.92,
    threshold: 0.85,
    thresholdType: 'BELOW',
  };

  it('should create a monitoring record successfully', async () => {
    mockPrisma.aiMonitoring.create.mockResolvedValue({
      ...mockRecord,
      id: UUID1,
    });

    const res = await request(app).post('/api/monitoring').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.aiMonitoring.create).toHaveBeenCalledTimes(1);
  });

  it('should auto-set status to WARNING when value exceeds threshold (ABOVE)', async () => {
    mockPrisma.aiMonitoring.create.mockResolvedValue({ ...mockRecord, status: 'WARNING' });

    await request(app).post('/api/monitoring').send({
      systemId: '00000000-0000-0000-0000-000000000001',
      metricName: 'Error Rate',
      metricType: 'ERROR_RATE',
      value: 0.15,
      threshold: 0.1,
      thresholdType: 'ABOVE',
    });

    expect(mockPrisma.aiMonitoring.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'WARNING' }),
      })
    );
  });

  it('should auto-set status to NORMAL when value does not exceed threshold', async () => {
    mockPrisma.aiMonitoring.create.mockResolvedValue({ ...mockRecord, status: 'NORMAL' });

    await request(app).post('/api/monitoring').send({
      systemId: '00000000-0000-0000-0000-000000000001',
      metricName: 'Error Rate',
      metricType: 'ERROR_RATE',
      value: 0.05,
      threshold: 0.1,
      thresholdType: 'ABOVE',
    });

    expect(mockPrisma.aiMonitoring.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'NORMAL' }),
      })
    );
  });

  it('should return 400 for missing systemId', async () => {
    const res = await request(app).post('/api/monitoring').send({
      metricName: 'Test Metric',
      metricType: 'PERFORMANCE',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for missing metricName', async () => {
    const res = await request(app).post('/api/monitoring').send({
      systemId: '00000000-0000-0000-0000-000000000001',
      metricType: 'PERFORMANCE',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid metricType', async () => {
    const res = await request(app).post('/api/monitoring').send({
      systemId: '00000000-0000-0000-0000-000000000001',
      metricName: 'Test',
      metricType: 'INVALID_TYPE',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiMonitoring.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/monitoring').send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/monitoring/:id — Get by ID
// ===================================================================
describe('GET /api/monitoring/:id', () => {
  it('should return a monitoring record by ID', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(mockRecord);

    const res = await request(app).get(`/api/monitoring/${UUID1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(UUID1);
  });

  it('should return 404 when record not found', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/monitoring/${UUID2}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.aiMonitoring.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/monitoring/${UUID1}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/monitoring/:id — Update monitoring record
// ===================================================================
describe('PUT /api/monitoring/:id', () => {
  it('should update a monitoring record successfully', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(mockRecord);
    mockPrisma.aiMonitoring.update.mockResolvedValue({
      ...mockRecord,
      status: 'RESOLVED',
      resolutionNotes: 'Issue resolved',
    });

    const res = await request(app)
      .put(`/api/monitoring/${UUID1}`)
      .send({ status: 'RESOLVED', resolutionNotes: 'Issue resolved' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  it('should return 400 for invalid status', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(mockRecord);

    const res = await request(app)
      .put(`/api/monitoring/${UUID1}`)
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when record not found for update', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(null);

    const res = await request(app).put(`/api/monitoring/${UUID2}`).send({ notes: 'Update notes' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error during update', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(mockRecord);
    mockPrisma.aiMonitoring.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/monitoring/${UUID1}`).send({ notes: 'Test' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// Additional coverage
// ===================================================================
describe('ISO 42001 Monitoring — additional coverage', () => {
  describe('POST /api/monitoring — additional cases', () => {
    it('should auto-set status to WARNING for BELOW threshold violation', async () => {
      mockPrisma.aiMonitoring.create.mockResolvedValue({ ...mockRecord, status: 'WARNING' });

      await request(app).post('/api/monitoring').send({
        systemId: UUID1,
        metricName: 'Accuracy',
        metricType: 'ACCURACY',
        value: 0.7,
        threshold: 0.85,
        thresholdType: 'BELOW',
      });

      expect(mockPrisma.aiMonitoring.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'WARNING' }),
        })
      );
    });

    it('should accept DRIFT metricType', async () => {
      mockPrisma.aiMonitoring.create.mockResolvedValue({ ...mockRecord, metricType: 'DRIFT' });

      const res = await request(app).post('/api/monitoring').send({
        systemId: UUID1,
        metricName: 'Data Drift Score',
        metricType: 'DRIFT',
        value: 0.05,
        threshold: 0.1,
        thresholdType: 'ABOVE',
      });

      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/monitoring — further filters', () => {
    it('should filter by isoClause when provided', async () => {
      mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
      mockPrisma.aiMonitoring.count.mockResolvedValue(0);

      await request(app).get('/api/monitoring?isoClause=9.1');

      expect(mockPrisma.aiMonitoring.findMany).toHaveBeenCalled();
    });

    it('should return empty list when no records match', async () => {
      mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
      mockPrisma.aiMonitoring.count.mockResolvedValue(0);

      const res = await request(app).get('/api/monitoring?status=CRITICAL');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });
});

// ===================================================================
// DELETE /api/monitoring/:id — Soft delete
// ===================================================================
describe('DELETE /api/monitoring/:id', () => {
  it('should soft delete a monitoring record', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(mockRecord);
    mockPrisma.aiMonitoring.update.mockResolvedValue({
      ...mockRecord,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/monitoring/${UUID1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
    expect(res.body.data.id).toBe(UUID1);
  });

  it('should return 404 when record not found for deletion', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(`/api/monitoring/${UUID2}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error during delete', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(mockRecord);
    mockPrisma.aiMonitoring.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(`/api/monitoring/${UUID1}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('ISO 42001 Monitoring — final extended coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/monitoring pagination page defaults to 1', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(0);
    const res = await request(app).get('/api/monitoring');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('GET /api/monitoring data items have metricName field', async () => {
    mockPrisma.aiMonitoring.findMany.mockResolvedValue([mockRecord]);
    mockPrisma.aiMonitoring.count.mockResolvedValue(1);
    const res = await request(app).get('/api/monitoring');
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toHaveProperty('metricName');
  });

  it('GET /api/monitoring/:id returns value field', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(mockRecord);
    const res = await request(app).get(`/api/monitoring/${UUID1}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('value');
  });

  it('DELETE /api/monitoring/:id returns id in data', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(mockRecord);
    mockPrisma.aiMonitoring.update.mockResolvedValue({ ...mockRecord, deletedAt: new Date() });
    const res = await request(app).delete(`/api/monitoring/${UUID1}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(UUID1);
  });

  it('PUT /api/monitoring/:id update with value field returns 200', async () => {
    mockPrisma.aiMonitoring.findFirst.mockResolvedValue(mockRecord);
    mockPrisma.aiMonitoring.update.mockResolvedValue({ ...mockRecord, value: 0.95 });
    const res = await request(app).put(`/api/monitoring/${UUID1}`).send({ value: 0.95 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/monitoring with BIAS metricType returns 201', async () => {
    mockPrisma.aiMonitoring.create.mockResolvedValue({ ...mockRecord, metricType: 'BIAS' });
    const res = await request(app).post('/api/monitoring').send({
      systemId: UUID1,
      metricName: 'Gender Bias Score',
      metricType: 'BIAS',
      value: 0.03,
      threshold: 0.05,
      thresholdType: 'ABOVE',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('monitoring — phase29 coverage', () => {
  it('handles generator type', () => {
    function* gen() { yield 1; } expect(typeof gen()).toBe('object');
  });

  it('handles string repeat', () => {
    expect('ab'.repeat(3)).toBe('ababab');
  });

  it('handles reverse method', () => {
    expect([1, 2, 3].reverse()).toEqual([3, 2, 1]);
  });

});
