import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsAllergen: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import allergensRouter from '../src/routes/allergens';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/allergens', allergensRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/allergens', () => {
  it('should return allergens with pagination', async () => {
    (prisma as any).fsAllergen.findMany.mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001', name: 'Peanuts' }]);
    (prisma as any).fsAllergen.count.mockResolvedValue(1);

    const res = await request(app).get('/api/allergens');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    (prisma as any).fsAllergen.findMany.mockResolvedValue([]);
    (prisma as any).fsAllergen.count.mockResolvedValue(0);

    await request(app).get('/api/allergens?type=MAJOR');
    expect((prisma as any).fsAllergen.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'MAJOR' }) })
    );
  });

  it('should filter by isActive', async () => {
    (prisma as any).fsAllergen.findMany.mockResolvedValue([]);
    (prisma as any).fsAllergen.count.mockResolvedValue(0);

    await request(app).get('/api/allergens?isActive=true');
    expect((prisma as any).fsAllergen.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('should handle database errors', async () => {
    (prisma as any).fsAllergen.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/allergens');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/allergens', () => {
  it('should create an allergen with auto-generated code', async () => {
    const created = { id: '00000000-0000-0000-0000-000000000001', name: 'Peanuts', code: 'ALG-123', type: 'MAJOR' };
    (prisma as any).fsAllergen.create.mockResolvedValue(created);

    const res = await request(app).post('/api/allergens').send({
      name: 'Peanuts', type: 'MAJOR',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/allergens').send({ name: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    (prisma as any).fsAllergen.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/allergens').send({
      name: 'Peanuts', type: 'MAJOR',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/allergens/:id', () => {
  it('should return an allergen by id', async () => {
    (prisma as any).fsAllergen.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Peanuts' });

    const res = await request(app).get('/api/allergens/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent allergen', async () => {
    (prisma as any).fsAllergen.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/allergens/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/allergens/:id', () => {
  it('should update an allergen', async () => {
    (prisma as any).fsAllergen.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsAllergen.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Updated' });

    const res = await request(app).put('/api/allergens/00000000-0000-0000-0000-000000000001').send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent allergen', async () => {
    (prisma as any).fsAllergen.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/allergens/00000000-0000-0000-0000-000000000099').send({ name: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update', async () => {
    (prisma as any).fsAllergen.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app).put('/api/allergens/00000000-0000-0000-0000-000000000001').send({ type: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/allergens/:id', () => {
  it('should soft delete an allergen', async () => {
    (prisma as any).fsAllergen.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).fsAllergen.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    const res = await request(app).delete('/api/allergens/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent allergen', async () => {
    (prisma as any).fsAllergen.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/allergens/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});
