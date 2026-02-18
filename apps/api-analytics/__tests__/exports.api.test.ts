import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    analyticsExport: {
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

import exportsRouter from '../src/routes/exports';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/exports', exportsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/exports — List exports
// ===================================================================
describe('GET /api/exports', () => {
  it('should return a list of exports with pagination', async () => {
    const exports = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'Safety Export', status: 'COMPLETED', format: 'CSV' },
      { id: 'exp-2', name: 'Quality Export', status: 'QUEUED', format: 'EXCEL' },
    ];
    (prisma as any).analyticsExport.findMany.mockResolvedValue(exports);
    (prisma as any).analyticsExport.count.mockResolvedValue(2);

    const res = await request(app).get('/api/exports');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    (prisma as any).analyticsExport.findMany.mockResolvedValue([]);
    (prisma as any).analyticsExport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/exports?status=COMPLETED');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsExport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) })
    );
  });

  it('should filter by format', async () => {
    (prisma as any).analyticsExport.findMany.mockResolvedValue([]);
    (prisma as any).analyticsExport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/exports?format=CSV');

    expect(res.status).toBe(200);
    expect((prisma as any).analyticsExport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ format: 'CSV' }) })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).analyticsExport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/exports');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/exports — Request new export
// ===================================================================
describe('POST /api/exports', () => {
  it('should create a new export request', async () => {
    const created = { id: 'exp-new', name: 'New Export', type: 'FULL', format: 'CSV', status: 'QUEUED' };
    (prisma as any).analyticsExport.create.mockResolvedValue(created);

    const res = await request(app).post('/api/exports').send({
      name: 'New Export', type: 'FULL', format: 'CSV',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Export');
    expect(res.body.data.status).toBe('QUEUED');
  });

  it('should reject invalid input', async () => {
    const res = await request(app).post('/api/exports').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ===================================================================
// GET /api/exports/:id — Get by ID
// ===================================================================
describe('GET /api/exports/:id', () => {
  it('should return an export by ID', async () => {
    (prisma as any).analyticsExport.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', name: 'Test' });

    const res = await request(app).get('/api/exports/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent export', async () => {
    (prisma as any).analyticsExport.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/exports/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/exports/:id — Delete export
// ===================================================================
describe('DELETE /api/exports/:id', () => {
  it('should soft delete an export', async () => {
    (prisma as any).analyticsExport.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    (prisma as any).analyticsExport.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });

    const res = await request(app).delete('/api/exports/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Export deleted');
  });

  it('should return 404 for non-existent export', async () => {
    (prisma as any).analyticsExport.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/exports/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/exports/:id/download — Download export
// ===================================================================
describe('GET /api/exports/:id/download', () => {
  it('should return download URL for completed export', async () => {
    (prisma as any).analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001', name: 'Test Export', status: 'COMPLETED', format: 'CSV', fileUrl: 'https://storage.example.com/export.csv',
    });

    const res = await request(app).get('/api/exports/00000000-0000-0000-0000-000000000001/download');

    expect(res.status).toBe(200);
    expect(res.body.data.downloadUrl).toBe('https://storage.example.com/export.csv');
    expect(res.body.data.fileName).toBe('Test Export.csv');
  });

  it('should return 400 for non-completed export', async () => {
    (prisma as any).analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001', status: 'QUEUED', format: 'CSV',
    });

    const res = await request(app).get('/api/exports/00000000-0000-0000-0000-000000000001/download');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NOT_READY');
  });

  it('should return 404 for non-existent export', async () => {
    (prisma as any).analyticsExport.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/exports/00000000-0000-0000-0000-000000000099/download');

    expect(res.status).toBe(404);
  });

  it('should return 404 when file URL missing', async () => {
    (prisma as any).analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETED', format: 'CSV', fileUrl: null,
    });

    const res = await request(app).get('/api/exports/00000000-0000-0000-0000-000000000001/download');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NO_FILE');
  });
});
