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
      { id: 'alrt-1', name: 'High TRIR', metric: 'trir', status: 'ACTIVE' },
      { id: 'alrt-2', name: 'Low FPY', metric: 'fpy', status: 'TRIGGERED' },
    ];
    (prisma as any).analyticsAlert.findMany.mockResolvedValue(alerts);
    (prisma as any).analyticsAlert.count.mockResolvedValue(2);

    const res = await request(app).get('/api/alerts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    (prisma as any).analyticsAlert.findMany.mockResolvedValue([]);
    (prisma as any).analyticsAlert.count.mockResolvedValue(0);

    const res = await request(app).get('/api/alerts?status=TRIGGERED');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'TRIGGERED' }) })
    );
  });

  it('should filter by condition', async () => {
    (prisma as any).analyticsAlert.findMany.mockResolvedValue([]);
    (prisma as any).analyticsAlert.count.mockResolvedValue(0);

    const res = await request(app).get('/api/alerts?condition=ABOVE');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ condition: 'ABOVE' }) })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).analyticsAlert.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/alerts');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/alerts — Create alert
// ===================================================================
describe('POST /api/alerts', () => {
  it('should create a new alert', async () => {
    const created = { id: 'alrt-new', name: 'New Alert', metric: 'trir', condition: 'ABOVE', threshold: 3.0, status: 'ACTIVE' };
    (prisma as any).analyticsAlert.create.mockResolvedValue(created);

    const res = await request(app).post('/api/alerts').send({
      name: 'New Alert', metric: 'trir', condition: 'ABOVE', threshold: 3.0,
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
    const alerts = [{ id: 'alrt-1', status: 'TRIGGERED', triggeredAt: new Date() }];
    (prisma as any).analyticsAlert.findMany.mockResolvedValue(alerts);

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
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue({ id: 'alrt-1', name: 'Test' });

    const res = await request(app).get('/api/alerts/alrt-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('alrt-1');
  });

  it('should return 404 for non-existent alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/alerts/nonexistent');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/alerts/:id — Update
// ===================================================================
describe('PUT /api/alerts/:id', () => {
  it('should update an alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue({ id: 'alrt-1' });
    (prisma as any).analyticsAlert.update.mockResolvedValue({ id: 'alrt-1', name: 'Updated' });

    const res = await request(app).put('/api/alerts/alrt-1').send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 for non-existent alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/alerts/nonexistent').send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/alerts/:id — Soft delete
// ===================================================================
describe('DELETE /api/alerts/:id', () => {
  it('should soft delete an alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue({ id: 'alrt-1' });
    (prisma as any).analyticsAlert.update.mockResolvedValue({ id: 'alrt-1', deletedAt: new Date() });

    const res = await request(app).delete('/api/alerts/alrt-1');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Alert deleted');
  });

  it('should return 404 for non-existent alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/alerts/nonexistent');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/alerts/:id/acknowledge — Acknowledge
// ===================================================================
describe('PUT /api/alerts/:id/acknowledge', () => {
  it('should acknowledge a triggered alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue({ id: 'alrt-1', status: 'TRIGGERED' });
    (prisma as any).analyticsAlert.update.mockResolvedValue({ id: 'alrt-1', status: 'ACKNOWLEDGED', acknowledgedBy: 'user-123' });

    const res = await request(app).put('/api/alerts/alrt-1/acknowledge');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACKNOWLEDGED');
  });

  it('should reject acknowledge for non-triggered alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue({ id: 'alrt-1', status: 'ACTIVE' });

    const res = await request(app).put('/api/alerts/alrt-1/acknowledge');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('should return 404 for non-existent alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/alerts/nonexistent/acknowledge');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// PUT /api/alerts/:id/resolve — Resolve
// ===================================================================
describe('PUT /api/alerts/:id/resolve', () => {
  it('should resolve an alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue({ id: 'alrt-1', status: 'ACKNOWLEDGED' });
    (prisma as any).analyticsAlert.update.mockResolvedValue({ id: 'alrt-1', status: 'RESOLVED' });

    const res = await request(app).put('/api/alerts/alrt-1/resolve');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESOLVED');
  });

  it('should reject resolve for already resolved alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue({ id: 'alrt-1', status: 'RESOLVED' });

    const res = await request(app).put('/api/alerts/alrt-1/resolve');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  it('should return 404 for non-existent alert', async () => {
    (prisma as any).analyticsAlert.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/alerts/nonexistent/resolve');

    expect(res.status).toBe(404);
  });
});
