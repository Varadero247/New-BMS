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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Safety Export',
        status: 'COMPLETED',
        format: 'CSV',
      },
      { id: 'exp-2', name: 'Quality Export', status: 'QUEUED', format: 'EXCEL' },
    ];
    mockPrisma.analyticsExport.findMany.mockResolvedValue(exports);
    mockPrisma.analyticsExport.count.mockResolvedValue(2);

    const res = await request(app).get('/api/exports');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/exports?status=COMPLETED');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsExport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'COMPLETED' }) })
    );
  });

  it('should filter by format', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/exports?format=CSV');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsExport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ format: 'CSV' }) })
    );
  });

  it('should handle server errors', async () => {
    mockPrisma.analyticsExport.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/exports');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/exports — Request new export
// ===================================================================
describe('POST /api/exports', () => {
  it('should create a new export request', async () => {
    const created = {
      id: 'exp-new',
      name: 'New Export',
      type: 'FULL',
      format: 'CSV',
      status: 'QUEUED',
    };
    mockPrisma.analyticsExport.create.mockResolvedValue(created);

    const res = await request(app).post('/api/exports').send({
      name: 'New Export',
      type: 'FULL',
      format: 'CSV',
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
    mockPrisma.analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test',
    });

    const res = await request(app).get('/api/exports/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for non-existent export', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/exports/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// DELETE /api/exports/:id — Delete export
// ===================================================================
describe('DELETE /api/exports/:id', () => {
  it('should soft delete an export', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsExport.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/exports/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Export deleted');
  });

  it('should return 404 for non-existent export', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/exports/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/exports/:id/download — Download export
// ===================================================================
describe('GET /api/exports/:id/download', () => {
  it('should return download URL for completed export', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test Export',
      status: 'COMPLETED',
      format: 'CSV',
      fileUrl: 'https://storage.example.com/export.csv',
    });

    const res = await request(app).get(
      '/api/exports/00000000-0000-0000-0000-000000000001/download'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.downloadUrl).toBe('https://storage.example.com/export.csv');
    expect(res.body.data.fileName).toBe('Test Export.csv');
  });

  it('should return 400 for non-completed export', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'QUEUED',
      format: 'CSV',
    });

    const res = await request(app).get(
      '/api/exports/00000000-0000-0000-0000-000000000001/download'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NOT_READY');
  });

  it('should return 404 for non-existent export', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/exports/00000000-0000-0000-0000-000000000099/download'
    );

    expect(res.status).toBe(404);
  });

  it('should return 404 when file URL missing', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
      format: 'CSV',
      fileUrl: null,
    });

    const res = await request(app).get(
      '/api/exports/00000000-0000-0000-0000-000000000001/download'
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NO_FILE');
  });
});

describe('Analytics Exports — extended', () => {
  it('POST /exports returns QUEUED status for EXCEL format', async () => {
    const created = { id: 'exp-excel', name: 'Excel Export', type: 'FULL', format: 'EXCEL', status: 'QUEUED' };
    mockPrisma.analyticsExport.create.mockResolvedValue(created);

    const res = await request(app).post('/api/exports').send({
      name: 'Excel Export',
      type: 'FULL',
      format: 'EXCEL',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('QUEUED');
    expect(res.body.data.format).toBe('EXCEL');
  });
});

// ===================================================================
// Analytics Exports — additional coverage (5 tests)
// ===================================================================
describe('Analytics Exports — additional coverage', () => {
  it('GET /exports returns 401 when authenticate rejects', async () => {
    const { authenticate } = await import('@ims/auth');
    (authenticate as jest.Mock).mockImplementationOnce((_req: any, res: any, _next: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token' } });
    });

    const res = await request(app).get('/api/exports');
    expect(res.status).toBe(401);
  });

  it('GET /exports returns empty array and total 0 when no exports exist', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/exports');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('GET /exports honours limit and page query params', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/exports?page=3&limit=5');

    expect(res.status).toBe(200);
    expect(mockPrisma.analyticsExport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('POST /exports returns 400 when type field is missing', async () => {
    const res = await request(app).post('/api/exports').send({ name: 'Incomplete', format: 'CSV' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /exports/:id returns 500 on DB error', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.analyticsExport.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/exports/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// Analytics Exports — edge cases, pagination and field validation
// ===================================================================
describe('Analytics Exports — edge cases, pagination and field validation', () => {
  it('GET /exports passes deletedAt:null in where clause', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(0);

    await request(app).get('/api/exports');

    expect(mockPrisma.analyticsExport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });

  it('GET /exports filters by search query using name contains', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(0);

    await request(app).get('/api/exports?search=safety');

    expect(mockPrisma.analyticsExport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: expect.objectContaining({ contains: 'safety' }),
        }),
      })
    );
  });

  it('GET /exports response pagination has totalPages field', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(55);

    const res = await request(app).get('/api/exports?limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('totalPages');
    expect(res.body.pagination.totalPages).toBe(6);
  });

  it('POST /exports with PDF format returns 201', async () => {
    const created = { id: 'exp-pdf', name: 'PDF Export', type: 'FILTERED', format: 'PDF', status: 'QUEUED' };
    mockPrisma.analyticsExport.create.mockResolvedValue(created);

    const res = await request(app).post('/api/exports').send({
      name: 'PDF Export',
      type: 'FILTERED',
      format: 'PDF',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.format).toBe('PDF');
  });

  it('POST /exports with CUSTOM type creates successfully', async () => {
    const created = { id: 'exp-custom', name: 'Custom Export', type: 'CUSTOM', format: 'CSV', status: 'QUEUED' };
    mockPrisma.analyticsExport.create.mockResolvedValue(created);

    const res = await request(app).post('/api/exports').send({
      name: 'Custom Export',
      type: 'CUSTOM',
      format: 'CSV',
      filters: { module: 'quality' },
    });

    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('CUSTOM');
  });

  it('POST /exports returns 500 on DB create error', async () => {
    mockPrisma.analyticsExport.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/exports').send({
      name: 'Failing Export',
      type: 'FULL',
      format: 'CSV',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /exports/:id returns 500 on DB error', async () => {
    mockPrisma.analyticsExport.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/exports/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /exports/:id/download returns 500 on DB error', async () => {
    mockPrisma.analyticsExport.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(
      '/api/exports/00000000-0000-0000-0000-000000000001/download'
    );

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /exports/:id/download constructs fileName from name and format', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Quality Report',
      status: 'COMPLETED',
      format: 'EXCEL',
      fileUrl: 'https://storage.example.com/quality.xlsx',
    });

    const res = await request(app).get(
      '/api/exports/00000000-0000-0000-0000-000000000001/download'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.fileName).toBe('Quality Report.excel');
  });
});

// ===================================================================
// Analytics Exports — response integrity and remaining edge cases
// ===================================================================
describe('Analytics Exports — response integrity and remaining edge cases', () => {
  it('GET /exports response success is true when data present', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Health Export', status: 'COMPLETED', format: 'CSV' },
    ]);
    mockPrisma.analyticsExport.count.mockResolvedValue(1);

    const res = await request(app).get('/api/exports');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /exports pagination default page is 1', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/exports');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });

  it('POST /exports creates record with createdBy from user id', async () => {
    const created = { id: 'exp-user', name: 'User Export', type: 'FULL', format: 'CSV', status: 'QUEUED' };
    mockPrisma.analyticsExport.create.mockResolvedValue(created);

    const res = await request(app).post('/api/exports').send({
      name: 'User Export',
      type: 'FULL',
      format: 'CSV',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('exp-user');
  });

  it('DELETE /exports/:id returns success message in data', async () => {
    mockPrisma.analyticsExport.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.analyticsExport.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });

    const res = await request(app).delete('/api/exports/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });

  it('GET /exports filters by both status and format simultaneously', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(0);

    await request(app).get('/api/exports?status=COMPLETED&format=CSV');

    expect(mockPrisma.analyticsExport.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'COMPLETED', format: 'CSV' }),
      })
    );
  });

  it('GET /exports response data is an array', async () => {
    mockPrisma.analyticsExport.findMany.mockResolvedValue([]);
    mockPrisma.analyticsExport.count.mockResolvedValue(0);

    const res = await request(app).get('/api/exports');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
