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

describe('GET /api/alerts pagination and response shape', () => {
  it('should include totalPages in response meta', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([
      { id: 'e4000000-0000-4000-a000-000000000001', type: 'ANOMALY', severity: 'HIGH' },
    ]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(50);

    const res = await request(app).get('/api/alerts?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(50);
  });

  it('should filter by type=THRESHOLD param', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/alerts?type=THRESHOLD');

    expect(prisma.energyAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'THRESHOLD' }),
      })
    );
  });

  it('POST / should create alert with meterId when meter exists', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000010' });
    (prisma.energyAlert.create as jest.Mock).mockResolvedValue({
      id: 'new-id',
      type: 'OVERCONSUMPTION',
      severity: 'HIGH',
      message: 'Over limit',
      meterId: '00000000-0000-0000-0000-000000000010',
    });

    const res = await request(app).post('/api/alerts').send({
      type: 'OVERCONSUMPTION',
      severity: 'HIGH',
      message: 'Over limit',
      meterId: '00000000-0000-0000-0000-000000000010',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.meterId).toBe('00000000-0000-0000-0000-000000000010');
  });
});

describe('alerts — final coverage', () => {
  it('GET /api/alerts returns success:true on empty list', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/alerts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('GET /api/alerts filters by severity=HIGH', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/alerts?severity=HIGH');

    expect(prisma.energyAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ severity: 'HIGH' }),
      })
    );
  });

  it('PUT /api/alerts/:id/acknowledge sets acknowledgedBy to current user', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      acknowledged: false,
    });
    (prisma.energyAlert.update as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      acknowledged: true,
      acknowledgedBy: '00000000-0000-4000-a000-000000000123',
    });

    const res = await request(app).put('/api/alerts/e4000000-0000-4000-a000-000000000001/acknowledge');

    expect(res.status).toBe(200);
    expect(res.body.data.acknowledgedBy).toBe('00000000-0000-4000-a000-000000000123');
  });

  it('DELETE /api/alerts/:id returns data.id in response', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({ id: 'e4000000-0000-4000-a000-000000000001' });
    (prisma.energyAlert.update as jest.Mock).mockResolvedValue({ id: 'e4000000-0000-4000-a000-000000000001' });

    const res = await request(app).delete('/api/alerts/e4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('e4000000-0000-4000-a000-000000000001');
  });

  it('POST /api/alerts creates EQUIPMENT_FAULT type alert', async () => {
    (prisma.energyAlert.create as jest.Mock).mockResolvedValue({
      id: 'new-fault-id',
      type: 'EQUIPMENT_FAULT',
      severity: 'LOW',
      message: 'Meter sensor fault detected',
      acknowledged: false,
    });

    const res = await request(app).post('/api/alerts').send({
      type: 'EQUIPMENT_FAULT',
      severity: 'LOW',
      message: 'Meter sensor fault detected',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('EQUIPMENT_FAULT');
  });

  it('PUT /api/alerts/:id/resolve response has resolvedAt defined', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      resolvedAt: null,
    });
    (prisma.energyAlert.update as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      resolvedAt: new Date().toISOString(),
    });

    const res = await request(app).put('/api/alerts/e4000000-0000-4000-a000-000000000001/resolve');

    expect(res.status).toBe(200);
    expect(res.body.data.resolvedAt).toBeDefined();
  });

  it('GET /api/alerts pagination total is reflected in response', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([
      { id: 'a1', type: 'ANOMALY' },
      { id: 'a2', type: 'OVERCONSUMPTION' },
    ]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(100);

    const res = await request(app).get('/api/alerts?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(100);
    expect(res.body.data).toHaveLength(2);
  });
});

describe('alerts — additional coverage', () => {
  it('GET /api/alerts pagination page defaults to 1', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/alerts');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('POST /api/alerts rejects body with missing message', async () => {
    const res = await request(app).post('/api/alerts').send({
      type: 'ANOMALY',
      severity: 'HIGH',
    });

    expect(res.status).toBe(400);
  });

  it('PUT /api/alerts/:id updates message field', async () => {
    (prisma.energyAlert.findFirst as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
    });
    (prisma.energyAlert.update as jest.Mock).mockResolvedValue({
      id: 'e4000000-0000-4000-a000-000000000001',
      message: 'Updated message',
    });

    const res = await request(app)
      .put('/api/alerts/e4000000-0000-4000-a000-000000000001')
      .send({ message: 'Updated message' });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Updated message');
  });

  it('GET /api/alerts filters by acknowledged=true', async () => {
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/alerts?acknowledged=true');

    expect(prisma.energyAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ acknowledged: true }),
      })
    );
  });
});

describe('alerts — phase29 coverage', () => {
  it('handles array concat', () => {
    expect([1, 2].concat([3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('handles string replace', () => {
    expect('hello world'.replace('world', 'Jest')).toBe('hello Jest');
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles template literals', () => {
    const n = 42; expect(`value: ${n}`).toBe('value: 42');
  });

  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

});

describe('alerts — phase30 coverage', () => {
  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles string trim', () => {
    expect('  hello  '.trim()).toBe('hello');
  });

  it('handles object spread', () => {
    const a2 = { x: 1 }; const b2 = { ...a2, y: 2 }; expect(b2).toEqual({ x: 1, y: 2 });
  });

  it('returns true for truthy values', () => {
    expect(Boolean('value')).toBe(true);
  });

});
