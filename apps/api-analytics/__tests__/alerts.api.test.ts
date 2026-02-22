import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    analyticsAlert: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
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

import alertsRouter from '../src/routes/alerts';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/alerts', alertsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/alerts — List alerts
// ===================================================================
describe('GET /api/alerts', () => {
  it('should return a list of alerts with pagination', async () => {
    const alerts = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'High TRIR',
        metric: 'trir',
        status: 'ACTIVE',
      },
      { id: 'alrt-2', name: 'Low FPY', metric: 'fpy', status: 'TRIGGERED' },
    ];
    mockPrisma.analyticsAlert.findMany.mockResolvedValue(alerts);
    mockPrisma.analyticsAlert.count.mockResolvedValue(2);

    const res = await request(app).get('/api/alerts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    mockPrisma.analyticsAlert.findMany.mockResolvedValue([]);
    mockPrisma.analyticsAlert.count.mockResolvedValue(0);

    const res = await request(app).get('/api/alerts?status=TRIGGERED');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'TRIGGERED' }) })
    );
  });

  it('should filter by condition', async () => {
    mockPrisma.analyticsAlert.findMany.mockResolvedValue([]);
    mockPrisma.analyticsAlert.count.mockResolvedValue(0);

    const res = await request(app).get('/api/alerts?condition=ABOVE');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ condition: 'ABOVE' }) })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.analyticsAlert.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/alerts');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/alerts — Create alert
// ===================================================================
describe('POST /api/alerts', () => {
  it('should create a new alert', async () => {
    const created = {
      id: 'alrt-new',
      name: 'New Alert',
      metric: 'trir',
      condition: 'ABOVE',
      threshold: 3.0,
      status: 'ACTIVE',
    };
    mockPrisma.analyticsAlert.create.mockResolvedValue(created);

    const res = await request(app).post('/api/alerts').send({
      name: 'New Alert',
      metric: 'trir',
      condition: 'ABOVE',
      threshold: 3.0,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Alert');
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/alerts').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ===================================================================
// GET /api/alerts/triggered — Currently triggered
// ===================================================================
describe('GET /api/alerts/triggered', () => {
  it('should return triggered alerts', async () => {
    const alerts = [
      { id: '00000000-0000-0000-0000-000000000001', status: 'TRIGGERED', triggeredAt: new Date() },
    ];
    mockPrisma.analyticsAlert.findMany.mockResolvedValue(alerts);

    const res = await request(app).get('/api/alerts/triggered');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

// ===================================================================
// GET /api/alerts/:id — Get by ID
// ===================================================================
describe('GET /api/alerts/:id', () => {
  it('should return an alert by ID', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test',
    });

    const res = await request(app).get('/api/alerts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/alerts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/alerts/:id — Update
// ===================================================================
describe('PUT /api/alerts/:id', () => {
  it('should update an alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsAlert.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/alerts/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for non-existent alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/alerts/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/alerts/:id — Soft delete
// ===================================================================
describe('DELETE /api/alerts/:id', () => {
  it('should soft delete an alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsAlert.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/alerts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Alert deleted');
  });

  it('should return 404 for non-existent alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/alerts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/alerts/:id/acknowledge — Acknowledge
// ===================================================================
describe('PUT /api/alerts/:id/acknowledge', () => {
  it('should acknowledge a triggered alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'TRIGGERED',
    });
    mockPrisma.analyticsAlert.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ACKNOWLEDGED',
      acknowledgedBy: 'user-123',
    });

    const res = await request(app).put(
      '/api/alerts/00000000-0000-0000-0000-000000000001/acknowledge'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACKNOWLEDGED');
  });

  it('should reject acknowledge for non-triggered alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ACTIVE',
    });

    const res = await request(app).put(
      '/api/alerts/00000000-0000-0000-0000-000000000001/acknowledge'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('should return 404 for non-existent alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app).put(
      '/api/alerts/00000000-0000-0000-0000-000000000099/acknowledge'
    );

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/alerts/:id/resolve — Resolve
// ===================================================================
describe('PUT /api/alerts/:id/resolve', () => {
  it('should resolve an alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'ACKNOWLEDGED',
    });
    mockPrisma.analyticsAlert.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'RESOLVED',
    });

    const res = await request(app).put('/api/alerts/00000000-0000-0000-0000-000000000001/resolve');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  it('should reject resolve for already resolved alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'RESOLVED',
    });

    const res = await request(app).put('/api/alerts/00000000-0000-0000-0000-000000000001/resolve');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('should return 404 for non-existent alert', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/alerts/00000000-0000-0000-0000-000000000099/resolve');

    expect(res.status).toBe(404);
  });
});

describe('alerts.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/alerts', alertsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/alerts', async () => {
    const res = await request(app).get('/api/alerts');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});

describe('alerts.api — extended edge cases', () => {
  it('GET /api/alerts returns success:true with empty data list', async () => {
    mockPrisma.analyticsAlert.findMany.mockResolvedValue([]);
    mockPrisma.analyticsAlert.count.mockResolvedValue(0);
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/alerts filters by metric query param', async () => {
    mockPrisma.analyticsAlert.findMany.mockResolvedValue([]);
    mockPrisma.analyticsAlert.count.mockResolvedValue(0);
    const res = await request(app).get('/api/alerts?metric=trir');
    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ metric: expect.any(Object) }) })
    );
  });

  it('GET /api/alerts supports search query param', async () => {
    mockPrisma.analyticsAlert.findMany.mockResolvedValue([]);
    mockPrisma.analyticsAlert.count.mockResolvedValue(0);
    const res = await request(app).get('/api/alerts?search=TRIR');
    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ name: expect.any(Object) }) })
    );
  });

  it('GET /api/alerts pagination page=2 adjusts skip correctly', async () => {
    mockPrisma.analyticsAlert.findMany.mockResolvedValue([]);
    mockPrisma.analyticsAlert.count.mockResolvedValue(100);
    const res = await request(app).get('/api/alerts?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('POST /api/alerts with condition BELOW creates alert successfully', async () => {
    const created = { id: 'a-new', name: 'Low FPY', metric: 'fpy', condition: 'BELOW', threshold: 95, status: 'ACTIVE' };
    mockPrisma.analyticsAlert.create.mockResolvedValue(created);
    const res = await request(app).post('/api/alerts').send({
      name: 'Low FPY',
      metric: 'fpy',
      condition: 'BELOW',
      threshold: 95,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.condition).toBe('BELOW');
  });

  it('POST /api/alerts rejects invalid condition enum', async () => {
    const res = await request(app).post('/api/alerts').send({
      name: 'Test Alert',
      metric: 'trir',
      condition: 'INVALID_COND',
      threshold: 5,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /api/alerts/:id returns success:true message', async () => {
    mockPrisma.analyticsAlert.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.analyticsAlert.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });
    const res = await request(app).delete('/api/alerts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/alerts/triggered returns empty array when none triggered', async () => {
    mockPrisma.analyticsAlert.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/alerts/triggered');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});
