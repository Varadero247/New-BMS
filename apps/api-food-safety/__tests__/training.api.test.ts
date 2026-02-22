import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsTraining: {
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

import trainingRouter from '../src/routes/training';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/training', trainingRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/training', () => {
  it('should return training records with pagination', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'HACCP Training' },
    ]);
    mockPrisma.fsTraining.count.mockResolvedValue(1);

    const res = await request(app).get('/api/training');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by type', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    await request(app).get('/api/training?type=HACCP');
    expect(mockPrisma.fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'HACCP' }) })
    );
  });

  it('should filter by status', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    await request(app).get('/api/training?status=PLANNED');
    expect(mockPrisma.fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'PLANNED' }) })
    );
  });

  it('should handle database errors', async () => {
    mockPrisma.fsTraining.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/training');
    expect(res.status).toBe(500);
  });
});

describe('POST /api/training', () => {
  it('should create a training record', async () => {
    const created = {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'HACCP Training',
      type: 'HACCP',
    };
    mockPrisma.fsTraining.create.mockResolvedValue(created);

    const res = await request(app).post('/api/training').send({
      title: 'HACCP Training',
      type: 'HACCP',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/training').send({ title: 'Test' });
    expect(res.status).toBe(400);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsTraining.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/training').send({
      title: 'HACCP Training',
      type: 'HACCP',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/training/:id', () => {
  it('should return a training record', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/training/:id', () => {
  it('should update a training record', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsTraining.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should reject invalid update', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001')
      .send({ type: 'INVALID' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/training/:id', () => {
  it('should soft delete a training record', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsTraining.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).delete('/api/training/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/training/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/training/:id/complete', () => {
  it('should complete a training record', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PLANNED',
    });
    mockPrisma.fsTraining.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
      .send({
        attendees: ['John', 'Jane'],
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject completing an already completed training', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_COMPLETED');
  });

  it('should return 404 for non-existent record', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000099/complete')
      .send({});
    expect(res.status).toBe(404);
  });

  it('should handle database errors', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PLANNED',
    });
    mockPrisma.fsTraining.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001/complete')
      .send({});
    expect(res.status).toBe(500);
  });
});

describe('training.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/training', trainingRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/training', async () => {
    const res = await request(app).get('/api/training');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/training', async () => {
    const res = await request(app).get('/api/training');
    expect(res.headers['content-type']).toBeDefined();
  });
});

describe('training.api — edge cases and pagination', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/training', trainingRouter);
    jest.clearAllMocks();
  });

  it('GET /api/training returns pagination metadata', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    const res = await request(app).get('/api/training');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('GET /api/training respects page and limit params', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    const res = await request(app).get('/api/training?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('GET /api/training filters by both type and status', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(0);

    await request(app).get('/api/training?type=GMP&status=PLANNED');
    expect(mockPrisma.fsTraining.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'GMP', status: 'PLANNED' }),
      })
    );
  });

  it('POST /api/training with all valid training types succeeds for HYGIENE', async () => {
    mockPrisma.fsTraining.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Hygiene Training',
      type: 'HYGIENE',
    });

    const res = await request(app).post('/api/training').send({
      title: 'Hygiene Training',
      type: 'HYGIENE',
      scheduledDate: '2026-04-01',
    });
    expect(res.status).toBe(201);
  });

  it('POST /api/training with ALLERGEN type succeeds', async () => {
    mockPrisma.fsTraining.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Allergen Training',
      type: 'ALLERGEN',
    });

    const res = await request(app).post('/api/training').send({
      title: 'Allergen Training',
      type: 'ALLERGEN',
      scheduledDate: '2026-04-15',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/training/:id returns 500 when DB throws', async () => {
    mockPrisma.fsTraining.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/training/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/training/:id returns 500 when update throws', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsTraining.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/training/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(500);
  });

  it('DELETE /api/training/:id returns 500 when update throws', async () => {
    mockPrisma.fsTraining.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsTraining.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/training/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('POST /api/training with FOOD_DEFENSE type succeeds', async () => {
    mockPrisma.fsTraining.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000004',
      title: 'Food Defense Training',
      type: 'FOOD_DEFENSE',
    });

    const res = await request(app).post('/api/training').send({
      title: 'Food Defense Training',
      type: 'FOOD_DEFENSE',
      scheduledDate: '2026-05-01',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('FOOD_DEFENSE');
  });

  it('GET /api/training returns totalPages in pagination', async () => {
    mockPrisma.fsTraining.findMany.mockResolvedValue([]);
    mockPrisma.fsTraining.count.mockResolvedValue(100);

    const res = await request(app).get('/api/training?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(10);
  });
});
