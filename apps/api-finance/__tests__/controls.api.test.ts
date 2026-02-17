import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finControl: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'test@test.com', role: 'ADMIN', orgId: '00000000-0000-4000-a000-000000000100' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import controlsRouter from '../src/routes/controls';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/controls', controlsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/controls — List controls
// ===================================================================
describe('GET /api/controls', () => {
  it('should return a list of controls with pagination', async () => {
    const controls = [
      { id: '00000000-0000-0000-0000-000000000001', referenceNumber: 'FCR-2026-0001', name: 'Segregation of Duties', status: 'ACTIVE' },
      { id: '00000000-0000-0000-0000-000000000002', referenceNumber: 'FCR-2026-0002', name: 'Bank Reconciliation', status: 'ACTIVE' },
    ];
    (prisma as any).finControl.findMany.mockResolvedValue(controls);
    (prisma as any).finControl.count.mockResolvedValue(2);

    const res = await request(app).get('/api/controls');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    (prisma as any).finControl.findMany.mockResolvedValue([]);
    (prisma as any).finControl.count.mockResolvedValue(0);

    const res = await request(app).get('/api/controls?status=ACTIVE');

    expect(res.status).toBe(200);
    expect((prisma as any).finControl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE' }),
      })
    );
  });

  it('should apply pagination params', async () => {
    (prisma as any).finControl.findMany.mockResolvedValue([]);
    (prisma as any).finControl.count.mockResolvedValue(50);

    const res = await request(app).get('/api/controls?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finControl.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).finControl.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/controls');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/controls/:id — Single control
// ===================================================================
describe('GET /api/controls/:id', () => {
  it('should return a control when found', async () => {
    const control = {
      id: '00000000-0000-0000-0000-000000000001',
      referenceNumber: 'FCR-2026-0001',
      name: 'Segregation of Duties',
      status: 'ACTIVE',
    };
    (prisma as any).finControl.findFirst.mockResolvedValue(control);

    const res = await request(app).get('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when control not found', async () => {
    (prisma as any).finControl.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/controls/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finControl.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// POST /api/controls — Create control
// ===================================================================
describe('POST /api/controls', () => {
  const validControl = {
    title: 'Segregation of Duties',
    description: 'Ensures no single person controls all financial processes',
    controlType: 'PREVENTIVE',
    status: 'ACTIVE',
  };

  it('should create a control successfully', async () => {
    (prisma as any).finControl.count.mockResolvedValue(0);
    (prisma as any).finControl.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validControl,
      referenceNumber: 'FCR-2026-0001',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/controls').send(validControl);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceNumber).toBe('FCR-2026-0001');
  });

  it('should auto-generate a reference number based on count', async () => {
    (prisma as any).finControl.count.mockResolvedValue(5);
    (prisma as any).finControl.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000006',
      ...validControl,
      referenceNumber: 'FCR-2026-0006',
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/controls').send(validControl);

    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toBe('FCR-2026-0006');
  });

  it('should return 400 on create error', async () => {
    (prisma as any).finControl.count.mockResolvedValue(0);
    (prisma as any).finControl.create.mockRejectedValue(new Error('Validation failed'));

    const res = await request(app).post('/api/controls').send(validControl);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CREATE_ERROR');
  });
});

// ===================================================================
// PUT /api/controls/:id — Update control
// ===================================================================
describe('PUT /api/controls/:id', () => {
  it('should update a control successfully', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', name: 'Old Name', deletedAt: null };
    (prisma as any).finControl.findFirst.mockResolvedValue(existing);
    (prisma as any).finControl.update.mockResolvedValue({
      ...existing,
      name: 'Updated Name',
    });

    const res = await request(app)
      .put('/api/controls/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when control not found', async () => {
    (prisma as any).finControl.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/controls/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on update error', async () => {
    (prisma as any).finControl.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: null });
    (prisma as any).finControl.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/controls/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// DELETE /api/controls/:id — Soft delete
// ===================================================================
describe('DELETE /api/controls/:id', () => {
  it('should soft-delete a control successfully', async () => {
    (prisma as any).finControl.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });

    const res = await request(app).delete('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Deleted');
  });

  it('should call update with deletedAt set', async () => {
    (prisma as any).finControl.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });

    await request(app).delete('/api/controls/00000000-0000-0000-0000-000000000001');

    expect((prisma as any).finControl.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).finControl.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/controls/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DELETE_ERROR');
  });
});
