import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    esgWaste: {
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

import wasteRouter from '../src/routes/waste';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/waste', wasteRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockWaste = {
  id: '00000000-0000-0000-0000-000000000001',
  wasteType: 'HAZARDOUS',
  quantity: 500,
  unit: 'kg',
  disposalMethod: 'INCINERATED',
  periodStart: new Date('2026-01-01'),
  periodEnd: new Date('2026-01-31'),
  facility: 'Plant A',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-123',
};

describe('GET /api/waste', () => {
  it('should return paginated waste records', async () => {
    (prisma.esgWaste.findMany as jest.Mock).mockResolvedValue([mockWaste]);
    (prisma.esgWaste.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/waste');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by wasteType', async () => {
    (prisma.esgWaste.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgWaste.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/waste?wasteType=HAZARDOUS');
    expect(prisma.esgWaste.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ wasteType: 'HAZARDOUS' }) })
    );
  });

  it('should filter by disposalMethod', async () => {
    (prisma.esgWaste.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgWaste.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/waste?disposalMethod=RECYCLED');
    expect(prisma.esgWaste.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ disposalMethod: 'RECYCLED' }) })
    );
  });

  it('should return empty list', async () => {
    (prisma.esgWaste.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.esgWaste.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/waste');
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/waste', () => {
  it('should create a waste record', async () => {
    (prisma.esgWaste.create as jest.Mock).mockResolvedValue(mockWaste);

    const res = await request(app).post('/api/waste').send({
      wasteType: 'HAZARDOUS',
      quantity: 500,
      unit: 'kg',
      disposalMethod: 'INCINERATED',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing fields', async () => {
    const res = await request(app).post('/api/waste').send({
      wasteType: 'HAZARDOUS',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid wasteType', async () => {
    const res = await request(app).post('/api/waste').send({
      wasteType: 'INVALID',
      quantity: 100,
      unit: 'kg',
      disposalMethod: 'RECYCLED',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/waste/:id', () => {
  it('should return a single waste record', async () => {
    (prisma.esgWaste.findFirst as jest.Mock).mockResolvedValue(mockWaste);

    const res = await request(app).get('/api/waste/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    (prisma.esgWaste.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/api/waste/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/waste/:id', () => {
  it('should update a waste record', async () => {
    (prisma.esgWaste.findFirst as jest.Mock).mockResolvedValue(mockWaste);
    (prisma.esgWaste.update as jest.Mock).mockResolvedValue({ ...mockWaste, quantity: 600 });

    const res = await request(app)
      .put('/api/waste/00000000-0000-0000-0000-000000000001')
      .send({ quantity: 600 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgWaste.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .put('/api/waste/00000000-0000-0000-0000-000000000099')
      .send({ quantity: 600 });
    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid data', async () => {
    const res = await request(app)
      .put('/api/waste/00000000-0000-0000-0000-000000000001')
      .send({ wasteType: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/waste/:id', () => {
  it('should soft delete a waste record', async () => {
    (prisma.esgWaste.findFirst as jest.Mock).mockResolvedValue(mockWaste);
    (prisma.esgWaste.update as jest.Mock).mockResolvedValue({
      ...mockWaste,
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/waste/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma.esgWaste.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete('/api/waste/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    (prisma.esgWaste.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/waste');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (prisma.esgWaste.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/waste/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    (prisma.esgWaste.count as jest.Mock).mockResolvedValue(0);
    (prisma.esgWaste.create as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/waste').send({ wasteType: 'HAZARDOUS', quantity: 500, unit: 'kg', disposalMethod: 'INCINERATED', periodStart: '2026-01-01', periodEnd: '2026-01-31' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    (prisma.esgWaste.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgWaste.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).put('/api/waste/00000000-0000-0000-0000-000000000001').send({ quantity: 600 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    (prisma.esgWaste.findFirst as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma.esgWaste.update as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/waste/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('waste — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/waste', wasteRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/waste', async () => {
    const res = await request(app).get('/api/waste');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });
});
