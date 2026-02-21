import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyAlert: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    energyMeter: {
      findFirst: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
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

describe('GET /api/alerts', () => {
  it('should return paginated alerts', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([
      { id: 'e4000000-0000-4000-a000-000000000001', type: 'OVERCONSUMPTION' },
    ]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/alerts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/alerts?type=ANOMALY');

    expect(prisma.energyAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'ANOMALY' }),
      })
    );
  });

  it('should filter by severity', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/alerts?severity=CRITICAL');

    expect(prisma.energyAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ severity: 'CRITICAL' }),
      })
    );
  });

  it('should filter by acknowledged', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/alerts?acknowledged=false');

    expect(prisma.energyAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ acknowledged: false }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyAlert.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/alerts', () => {
  const validBody = {
    type: 'OVERCONSUMPTION',
    severity: 'HIGH',
    message: 'Building A electricity consumption exceeded threshold',
  };

  it('should create an alert', async () => {
    (prisma.energyAlert.create as jest.Mock).mockResolvedValue({
      id: 'new-id',
      ...validBody,
      acknowledged: false,
    });

    const res = await request(app).post('/api/alerts').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('OVERCONSUMPTION');
  });

  it('should validate meter if provided', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/alerts')
      .send({ ...validBody, meterId: '00000000-0000-0000-0000-000000000099' });

    expect(res.status).toBe(404);
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/alerts').send({ type: 'INVALID' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/alerts/:id', () => {
  it('should return an alert', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      type: 'ANOMALY',
    });

    const res = await request(app).get('/api/alerts/e4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('e4000000-0000-4000-a000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/alerts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/alerts/:id', () => {
  it('should update an alert', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
    });
    (prisma.energyAlert.update as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      severity: 'CRITICAL',
    });

    const res = await request(app)
      .put('/api/alerts/e4000000-0000-4000-a000-000000000001')
      .send({ severity: 'CRITICAL' });

    expect(res.status).toBe(200);
    expect(res.body.data.severity).toBe('CRITICAL');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/alerts/00000000-0000-0000-0000-000000000099')
      .send({ severity: 'HIGH' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/alerts/:id', () => {
  it('should soft delete an alert', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
    });
    (prisma.energyAlert.update as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete('/api/alerts/e4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/alerts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/alerts/:id/acknowledge', () => {
  it('should acknowledge an alert', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      acknowledged: false,
    });
    (prisma.energyAlert.update as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      acknowledged: true,
      acknowledgedBy: '00000000-0000-4000-a000-000000000123',
    });

    const res = await request(app).put(
      '/api/alerts/e4000000-0000-4000-a000-000000000001/acknowledge'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.acknowledged).toBe(true);
  });

  it('should reject if already acknowledged', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      acknowledged: true,
    });

    const res = await request(app).put(
      '/api/alerts/e4000000-0000-4000-a000-000000000001/acknowledge'
    );

    expect(res.status).toBe(400);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put(
      '/api/alerts/00000000-0000-0000-0000-000000000099/acknowledge'
    );

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/alerts/:id/resolve', () => {
  it('should resolve an alert', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      resolvedAt: null,
      acknowledgedAt: null,
      acknowledgedBy: null,
    });
    (prisma.energyAlert.update as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      resolvedAt: new Date(),
    });

    const res = await request(app).put('/api/alerts/e4000000-0000-4000-a000-000000000001/resolve');

    expect(res.status).toBe(200);
    expect(res.body.data.resolvedAt).toBeDefined();
  });

  it('should reject if already resolved', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      resolvedAt: new Date(),
    });

    const res = await request(app).put('/api/alerts/e4000000-0000-4000-a000-000000000001/resolve');

    expect(res.status).toBe(400);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/alerts/00000000-0000-0000-0000-000000000099/resolve');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST / returns 500 when create fails', async () => {
    (prisma.energyAlert.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/alerts').send({
      type: 'ANOMALY',
      message: 'Test alert',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/alerts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.energyAlert.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/alerts/00000000-0000-0000-0000-000000000001')
      .send({ severity: 'HIGH' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.energyAlert.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/alerts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id/acknowledge returns 500 when update fails', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', acknowledgedAt: null });
    (prisma.energyAlert.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/alerts/00000000-0000-0000-0000-000000000001/acknowledge');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id/resolve returns 500 when update fails', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', resolvedAt: null });
    (prisma.energyAlert.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/alerts/00000000-0000-0000-0000-000000000001/resolve');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
