import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    safetyMetric: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/calculations', () => ({
  calculateSafetyMetrics: jest.fn((input: any) => ({
    ltifr:
      input.hoursWorked > 0
        ? Number(((input.lostTimeInjuries * 1_000_000) / input.hoursWorked).toFixed(2))
        : 0,
    trir:
      input.hoursWorked > 0
        ? Number(((input.totalRecordableInjuries * 200_000) / input.hoursWorked).toFixed(2))
        : 0,
    severityRate:
      input.hoursWorked > 0
        ? Number(((input.daysLost * 1_000_000) / input.hoursWorked).toFixed(2))
        : 0,
  })),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import metricsRoutes from '../src/routes/metrics';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Health & Safety Metrics API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/metrics/safety', metricsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/metrics/safety', () => {
    const mockMetrics = [
      {
        id: 'metric-1',
        year: 2025,
        month: 1,
        hoursWorked: 50000,
        lostTimeInjuries: 1,
        totalRecordableInjuries: 3,
        daysLost: 10,
        nearMisses: 15,
        firstAidCases: 5,
        ltifr: 20.0,
        trir: 12.0,
        severityRate: 200.0,
      },
      {
        id: 'metric-2',
        year: 2025,
        month: 2,
        hoursWorked: 48000,
        lostTimeInjuries: 0,
        totalRecordableInjuries: 2,
        daysLost: 5,
        nearMisses: 12,
        firstAidCases: 3,
        ltifr: 0,
        trir: 8.33,
        severityRate: 104.17,
      },
    ];

    it('should return list of safety metrics for current year by default', async () => {
      (mockPrisma.safetyMetric.findMany as jest.Mock).mockResolvedValueOnce(mockMetrics);

      const response = await request(app)
        .get('/api/metrics/safety')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by year parameter', async () => {
      (mockPrisma.safetyMetric.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/metrics/safety?year=2024').set('Authorization', 'Bearer token');

      expect(mockPrisma.safetyMetric.findMany).toHaveBeenCalledWith({
        where: { year: 2024 },
        orderBy: { month: 'asc' },
        take: 100,
      });
    });

    it('should order metrics by month ascending', async () => {
      (mockPrisma.safetyMetric.findMany as jest.Mock).mockResolvedValueOnce(mockMetrics);

      await request(app).get('/api/metrics/safety').set('Authorization', 'Bearer token');

      expect(mockPrisma.safetyMetric.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { month: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.safetyMetric.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/metrics/safety')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/metrics/safety/summary', () => {
    const mockMetrics = [
      {
        id: 'metric-1',
        year: 2025,
        month: 1,
        hoursWorked: 50000,
        lostTimeInjuries: 1,
        totalRecordableInjuries: 3,
        daysLost: 10,
        nearMisses: 15,
      },
      {
        id: 'metric-2',
        year: 2025,
        month: 2,
        hoursWorked: 48000,
        lostTimeInjuries: 0,
        totalRecordableInjuries: 2,
        daysLost: 5,
        nearMisses: 12,
      },
    ];

    it('should return summary with calculated totals', async () => {
      (mockPrisma.safetyMetric.findMany as jest.Mock).mockResolvedValueOnce(mockMetrics);

      const response = await request(app)
        .get('/api/metrics/safety/summary')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('year');
      expect(response.body.data).toHaveProperty('totalHoursWorked');
      expect(response.body.data).toHaveProperty('totalLTIs');
      expect(response.body.data).toHaveProperty('totalTRIs');
      expect(response.body.data).toHaveProperty('totalDaysLost');
      expect(response.body.data.totalHoursWorked).toBe(98000);
      expect(response.body.data.totalLTIs).toBe(1);
      expect(response.body.data.totalTRIs).toBe(5);
      expect(response.body.data.totalDaysLost).toBe(15);
    });

    it('should return zero summary when no metrics exist', async () => {
      (mockPrisma.safetyMetric.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/metrics/safety/summary')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalHoursWorked).toBe(0);
      expect(response.body.data.totalLTIs).toBe(0);
      expect(response.body.data.totalTRIs).toBe(0);
      expect(response.body.data.totalDaysLost).toBe(0);
      expect(response.body.data.averageLTIFR).toBe(0);
      expect(response.body.data.averageTRIR).toBe(0);
      expect(response.body.data.averageSeverityRate).toBe(0);
    });

    it('should include calculated safety rates', async () => {
      (mockPrisma.safetyMetric.findMany as jest.Mock).mockResolvedValueOnce(mockMetrics);

      const response = await request(app)
        .get('/api/metrics/safety/summary')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('ltifr');
      expect(response.body.data).toHaveProperty('trir');
      expect(response.body.data).toHaveProperty('severityRate');
    });

    it('should handle database errors', async () => {
      (mockPrisma.safetyMetric.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/metrics/safety/summary')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/metrics/safety', () => {
    const createPayload = {
      year: 2025,
      month: 3,
      hoursWorked: 52000,
      lostTimeInjuries: 1,
      totalRecordableInjuries: 4,
      daysLost: 8,
      nearMisses: 20,
      firstAidCases: 6,
    };

    it('should create or upsert a monthly safety metric', async () => {
      (mockPrisma.safetyMetric.upsert as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        ltifr: 19.23,
        trir: 15.38,
        severityRate: 153.85,
      });

      const response = await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.year).toBe(2025);
      expect(response.body.data.month).toBe(3);
    });

    it('should upsert using year_month compound key', async () => {
      (mockPrisma.safetyMetric.upsert as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
      });

      await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.safetyMetric.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            year_month: { year: 2025, month: 3 },
          },
        })
      );
    });

    it('should calculate rates from input data', async () => {
      (mockPrisma.safetyMetric.upsert as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
      });

      await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.safetyMetric.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            ltifr: expect.any(Number),
            trir: expect.any(Number),
            severityRate: expect.any(Number),
          }),
          update: expect.objectContaining({
            ltifr: expect.any(Number),
            trir: expect.any(Number),
            severityRate: expect.any(Number),
          }),
        })
      );
    });

    it('should return 400 for missing year', async () => {
      const response = await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send({ month: 3, hoursWorked: 52000 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing month', async () => {
      const response = await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send({ year: 2025, hoursWorked: 52000 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing hoursWorked', async () => {
      const response = await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send({ year: 2025, month: 3 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid month (0)', async () => {
      const response = await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send({ year: 2025, month: 0, hoursWorked: 52000 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid month (13)', async () => {
      const response = await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send({ year: 2025, month: 13, hoursWorked: 52000 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for negative hoursWorked', async () => {
      const response = await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send({ year: 2025, month: 3, hoursWorked: -100 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.safetyMetric.upsert as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/metrics/safety')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
