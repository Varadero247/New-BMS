import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyMeter: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    energyReading: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '00000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import metersRouter from '../src/routes/meters';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/meters', metersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/meters', () => {
  it('should return paginated meters', async () => {
    const mockMeters = [{ id: 'e1000000-0000-4000-a000-000000000001', name: 'Main Electricity', code: 'M001', type: 'ELECTRICITY' }];
    (prisma.energyMeter.findMany as jest.Mock).mockResolvedValue(mockMeters);
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/meters');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    (prisma.energyMeter.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/meters?type=GAS');

    expect(prisma.energyMeter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'GAS' }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma.energyMeter.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/meters?status=ACTIVE');

    expect(prisma.energyMeter.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('should handle errors', async () => {
    (prisma.energyMeter.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.energyMeter.count as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/meters');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/meters', () => {
  const validBody = {
    name: 'Main Electricity',
    code: 'M001',
    type: 'ELECTRICITY',
    unit: 'kWh',
    facility: 'Building A',
  };

  it('should create a meter', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.energyMeter.create as jest.Mock).mockResolvedValue({ id: 'new-id', ...validBody, status: 'ACTIVE' });

    const res = await request(app).post('/api/meters').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('M001');
  });

  it('should reject duplicate code', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({ id: 'e1000000-0000-4000-a000-000000000099', code: 'M001' });

    const res = await request(app).post('/api/meters').send(validBody);

    expect(res.status).toBe(409);
  });

  it('should reject invalid body', async () => {
    const res = await request(app).post('/api/meters').send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('should validate parent meter if provided', async () => {
    (prisma.energyMeter.findFirst as jest.Mock)
      .mockResolvedValueOnce(null) // code check
      .mockResolvedValueOnce(null); // parent check

    const res = await request(app).post('/api/meters').send({ ...validBody, parentMeterId: '00000000-0000-0000-0000-000000000099' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Parent meter');
  });
});

describe('GET /api/meters/:id', () => {
  it('should return a meter', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({ id: 'e1000000-0000-4000-a000-000000000001', name: 'Meter 1', children: [] });

    const res = await request(app).get('/api/meters/e1000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('e1000000-0000-4000-a000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/meters/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/meters/:id', () => {
  it('should update a meter', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({ id: 'e1000000-0000-4000-a000-000000000001', deletedAt: null });
    (prisma.energyMeter.update as jest.Mock).mockResolvedValue({ id: 'e1000000-0000-4000-a000-000000000001', name: 'Updated' });

    const res = await request(app).put('/api/meters/e1000000-0000-4000-a000-000000000001').send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 if not found', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put('/api/meters/nonexistent').send({ name: 'X' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/meters/:id', () => {
  it('should soft delete a meter', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({ id: 'e1000000-0000-4000-a000-000000000001', deletedAt: null });
    (prisma.energyMeter.update as jest.Mock).mockResolvedValue({ id: 'e1000000-0000-4000-a000-000000000001', deletedAt: new Date() });

    const res = await request(app).delete('/api/meters/e1000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/meters/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/meters/:id/readings', () => {
  it('should return readings for a meter', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue({ id: 'e1000000-0000-4000-a000-000000000001' });
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([{ id: 'e1100000-0000-4000-a000-000000000001', value: 100 }]);
    (prisma.energyReading.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/meters/e1000000-0000-4000-a000-000000000001/readings');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 if meter not found', async () => {
    (prisma.energyMeter.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/meters/nonexistent/readings');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/meters/hierarchy', () => {
  it('should return meter tree structure', async () => {
    const mockMeters = [
      { id: 'e1000000-0000-4000-a000-000000000001', name: 'Parent', parentMeterId: null },
      { id: 'e1000000-0000-4000-a000-000000000002', name: 'Child', parentMeterId: 'e1000000-0000-4000-a000-000000000001' },
    ];
    (prisma.energyMeter.findMany as jest.Mock).mockResolvedValue(mockMeters);

    const res = await request(app).get('/api/meters/hierarchy');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].children).toHaveLength(1);
  });
});
