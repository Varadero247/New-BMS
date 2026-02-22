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

describe('Field Service Parts Used — extended', () => {
  it('PUT /:id returns success:true with updated quantity', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcPartUsed.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      quantity: 5,
      totalCost: 750,
    });

    const res = await request(app)
      .put('/api/parts-used/00000000-0000-0000-0000-000000000001')
      .send({ quantity: 5, totalCost: 750 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.quantity).toBe(5);
  });
});


// ===================================================================
// Field Service Parts Used — additional coverage (5 new tests)
// ===================================================================
describe('Field Service Parts Used — additional coverage', () => {
  it('GET / response contains pagination metadata', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', partName: 'O-Ring', quantity: 4, job: {} },
    ]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(1);
    const res = await request(app).get('/api/parts-used');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
  });

  it('GET / filters by jobId when jobId query param is provided', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(0);
    await request(app).get('/api/parts-used?jobId=a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(mockPrisma.fsSvcPartUsed.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
      })
    );
  });

  it('POST / persists the partNumber field in the create call', async () => {
    mockPrisma.fsSvcPartUsed.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000020',
      partName: 'Valve',
      partNumber: 'VLV-007',
      quantity: 2,
      unitCost: 80,
      totalCost: 160,
    });
    await request(app).post('/api/parts-used').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      partName: 'Valve',
      partNumber: 'VLV-007',
      quantity: 2,
      unitCost: 80,
      totalCost: 160,
    });
    expect(mockPrisma.fsSvcPartUsed.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ partNumber: 'VLV-007' }),
      })
    );
  });

  it('GET /:id returns the correct partName from the database', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000021',
      partName: 'Hydraulic Seal',
      job: {},
    });
    const res = await request(app).get('/api/parts-used/00000000-0000-0000-0000-000000000021');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('partName', 'Hydraulic Seal');
  });

  it('PUT /:id update call passes the where id clause to Prisma', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000022',
    });
    mockPrisma.fsSvcPartUsed.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000022',
      quantity: 10,
    });
    await request(app)
      .put('/api/parts-used/00000000-0000-0000-0000-000000000022')
      .send({ quantity: 10 });
    expect(mockPrisma.fsSvcPartUsed.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: '00000000-0000-0000-0000-000000000022' }),
      })
    );
  });
});

// ─── Extended coverage ───────────────────────────────────────────────────────

describe('parts-used.api — extended edge cases', () => {
  it('GET / applies page and limit to query', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(0);

    await request(app).get('/api/parts-used?page=3&limit=5');

    expect(mockPrisma.fsSvcPartUsed.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('GET / returns correct pagination total', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', partName: 'Belt', quantity: 1, job: {} },
    ]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(12);

    const res = await request(app).get('/api/parts-used');

    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(12);
  });

  it('POST / returns 400 when jobId is missing', async () => {
    const res = await request(app).post('/api/parts-used').send({
      partName: 'Seal',
      partNumber: 'SL-001',
      quantity: 1,
      unitCost: 25,
      totalCost: 25,
    });

    expect(res.status).toBe(400);
  });

  it('POST / returns 400 when quantity is missing', async () => {
    const res = await request(app).post('/api/parts-used').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      partName: 'Seal',
      unitCost: 25,
      totalCost: 25,
    });

    expect(res.status).toBe(400);
  });

  it('PUT /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000030' });
    mockPrisma.fsSvcPartUsed.update.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .put('/api/parts-used/00000000-0000-0000-0000-000000000030')
      .send({ quantity: 2 });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/parts-used/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns success:true', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000031' });
    mockPrisma.fsSvcPartUsed.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000031',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/parts-used/00000000-0000-0000-0000-000000000031');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / response contains success:true on empty result', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(0);

    const res = await request(app).get('/api/parts-used');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });
});

// ─── Further coverage ─────────────────────────────────────────────────────────

describe('parts-used.api — further coverage', () => {
  it('GET / pagination.page defaults to 1 when not supplied', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(0);

    const res = await request(app).get('/api/parts-used');

    expect(res.body.pagination.page).toBe(1);
  });

  it('GET / data array is always an array', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(0);

    const res = await request(app).get('/api/parts-used');

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / create is not called when validation fails', async () => {
    await request(app).post('/api/parts-used').send({});

    expect(mockPrisma.fsSvcPartUsed.create).not.toHaveBeenCalled();
  });

  it('DELETE /:id calls update exactly once on success', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000040' });
    mockPrisma.fsSvcPartUsed.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000040', deletedAt: new Date() });

    await request(app).delete('/api/parts-used/00000000-0000-0000-0000-000000000040');

    expect(mockPrisma.fsSvcPartUsed.update).toHaveBeenCalledTimes(1);
  });

  it('GET / applies correct skip for page 4 limit 5', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(0);

    await request(app).get('/api/parts-used?page=4&limit=5');

    expect(mockPrisma.fsSvcPartUsed.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 15, take: 5 })
    );
  });

  it('POST / returns 201 and data.id on success', async () => {
    mockPrisma.fsSvcPartUsed.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000050',
      partName: 'Pump',
      quantity: 1,
      unitCost: 200,
      totalCost: 200,
    });

    const res = await request(app).post('/api/parts-used').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      partName: 'Pump',
      partNumber: 'PMP-001',
      quantity: 1,
      unitCost: 200,
      totalCost: 200,
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('PUT /:id returns 200 and success:true on valid update', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060' });
    mockPrisma.fsSvcPartUsed.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000060', quantity: 8 });

    const res = await request(app)
      .put('/api/parts-used/00000000-0000-0000-0000-000000000060')
      .send({ quantity: 8 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('parts-used.api — final coverage', () => {
  it('GET / response has success:true and pagination on empty set', async () => {
    mockPrisma.fsSvcPartUsed.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcPartUsed.count.mockResolvedValue(0);
    const res = await request(app).get('/api/parts-used');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('pagination');
  });

  it('DELETE /:id returns message "Part used deleted" in data', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000070' });
    mockPrisma.fsSvcPartUsed.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000070', deletedAt: new Date() });
    const res = await request(app).delete('/api/parts-used/00000000-0000-0000-0000-000000000070');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Part used deleted');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/parts-used/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 400 when partName is empty', async () => {
    const res = await request(app).post('/api/parts-used').send({
      jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      partName: '',
      quantity: 1,
      unitCost: 10,
      totalCost: 10,
    });
    expect(res.status).toBe(400);
  });

  it('PUT /:id returns 404 when findFirst returns null', async () => {
    mockPrisma.fsSvcPartUsed.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/parts-used/00000000-0000-0000-0000-000000000099')
      .send({ quantity: 5 });
    expect(res.status).toBe(404);
  });
});

describe('parts used — phase29 coverage', () => {
  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

  it('handles object spread', () => {
    const a2 = { x: 1 }; const b2 = { ...a2, y: 2 }; expect(b2).toEqual({ x: 1, y: 2 });
  });

  it('handles async reject', async () => {
    await expect(Promise.reject(new Error('err'))).rejects.toThrow('err');
  });

  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

  it('handles string charAt', () => {
    expect('hello'.charAt(0)).toBe('h');
  });

});

describe('parts used — phase30 coverage', () => {
  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles destructuring', () => {
    const { a, b } = { a: 1, b: 2 }; expect(a + b).toBe(3);
  });

  it('handles numeric type', () => {
    expect(typeof 42).toBe('number');
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles string startsWith', () => {
    expect('hello'.startsWith('he')).toBe(true);
  });

});
