import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcPartUsed: {
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

import partsUsedRouter from '../src/routes/parts-used';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/parts-used', partsUsedRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/parts-used', () => {
  it('should return parts used with pagination', async () => {
    const parts = [
      { id: '00000000-0000-0000-0000-000000000001', partName: 'Filter', quantity: 2, job: {} },
    ];
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue(parts);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(1);

    const res = await request(app).get('/api/parts-used');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by jobId', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(0);

    await request(app).get('/api/parts-used?jobId=job-1');

    expect(mockPrisma.fsSvcPartUsed.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ jobId: 'job-1' }),
      })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/parts-used');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/parts-used', () => {
  it('should create a part used entry', async () => {
    const created = {
      id: 'pu-new',
      partName: 'Compressor',
      quantity: 1,
      unitCost: 150,
      totalCost: 150,
    };
    mockPrisma.fsSvcPartUsed.create.mockResolvedValue(created);

    const res = await request(app).post('/api/parts-used').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      partName: 'Compressor',
      partNumber: 'CMP-001',
      quantity: 1,
      unitCost: 150,
      totalCost: 150,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/parts-used').send({ partName: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/parts-used/:id', () => {
  it('should return a part used entry', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      partName: 'Filter',
      job: {},
    });

    const res = await request(app).get('/api/parts-used/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/parts-used/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/parts-used/:id', () => {
  it('should update a part used entry', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcPartUsed.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      quantity: 3,
    });

    const res = await request(app)
      .put('/api/parts-used/00000000-0000-0000-0000-000000000001')
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/parts-used/00000000-0000-0000-0000-000000000099')
      .send({ quantity: 3 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/parts-used/:id', () => {
  it('should soft delete a part used entry', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcPartUsed.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/parts-used/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Part used deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/parts-used/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/parts-used');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcPartUsed.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/parts-used').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      partName: 'Compressor',
      partNumber: 'CMP-001',
      quantity: 1,
      unitCost: 150,
      totalCost: 150,
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcPartUsed.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/parts-used/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
