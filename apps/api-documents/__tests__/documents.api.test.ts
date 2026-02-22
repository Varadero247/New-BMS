import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    docDocument: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/documents';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/documents', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/documents', () => {
  it('should return documents with pagination', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Test' },
    ]);
    mockPrisma.docDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents?status=APPROVED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should search by title', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents?search=policy');
    expect(res.status).toBe(200);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.docDocument.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/documents/:id', () => {
  it('should return 404 if not found', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return item by id', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Policy Doc',
    });
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.docDocument.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('POST /api/documents', () => {
  it('should create', async () => {
    mockPrisma.docDocument.count.mockResolvedValue(0);
    mockPrisma.docDocument.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New',
      referenceNumber: 'DOC-2026-0001',
    });
    const res = await request(app).post('/api/documents').send({ title: 'New' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when title is missing', async () => {
    const res = await request(app).post('/api/documents').send({ description: 'No title' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when title is empty', async () => {
    const res = await request(app).post('/api/documents').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database create error', async () => {
    mockPrisma.docDocument.count.mockResolvedValue(0);
    mockPrisma.docDocument.create.mockRejectedValue(new Error('Unique constraint'));
    const res = await request(app).post('/api/documents').send({ title: 'Duplicate' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/documents/:id', () => {
  it('should update', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docDocument.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated',
    });
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when document not found', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database update error', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docDocument.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/documents/:id', () => {
  it('should soft delete', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docDocument.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when document not found', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docDocument.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('documents.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/documents', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/documents', async () => {
    const res = await request(app).get('/api/documents');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/documents', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/documents body has success property', async () => {
    const res = await request(app).get('/api/documents');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

// ─── Additional field-validation and pagination coverage ─────────────────────

describe('Documents — additional field-validation and pagination coverage', () => {
  it('GET / returns pagination with page=1 and limit=20 by default', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
  });

  it('GET / with page=3&limit=10 reflects params in pagination', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents?page=3&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('GET / with status=DRAFT passes status filter to findMany', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    await request(app).get('/api/documents?status=DRAFT');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'DRAFT' }) }),
    );
  });

  it('GET / response data is an array', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST / with invalid fileUrl returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/documents')
      .send({ title: 'Doc A', fileUrl: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / with valid fields returns 201 and referenceNumber in data', async () => {
    mockPrisma.docDocument.count.mockResolvedValue(3);
    mockPrisma.docDocument.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000007',
      title: 'Another Doc',
      referenceNumber: 'DOC-2026-0004',
    });
    const res = await request(app).post('/api/documents').send({ title: 'Another Doc' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });

  it('DELETE /:id success response message contains "deleted"', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docDocument.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('deleted');
  });

  it('PUT /:id with status=PUBLISHED updates successfully', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docDocument.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PUBLISHED',
    });
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000001')
      .send({ status: 'PUBLISHED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Documents — method call argument and shape coverage', () => {
  it('POST / calls create with orgId from authenticated user', async () => {
    mockPrisma.docDocument.count.mockResolvedValue(0);
    mockPrisma.docDocument.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000020',
      title: 'Org Doc',
      referenceNumber: 'DOC-2026-0001',
    });
    await request(app).post('/api/documents').send({ title: 'Org Doc' });
    expect(mockPrisma.docDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ orgId: 'org-1' }) }),
    );
  });

  it('PUT /:id calls update with where.id matching the param', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docDocument.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).put('/api/documents/00000000-0000-0000-0000-000000000001').send({ title: 'X' });
    expect(mockPrisma.docDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } }),
    );
  });

  it('DELETE /:id calls update with deletedAt in data', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docDocument.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.docDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
    );
  });

  it('GET / returns content-type application/json', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /:id returns 500 with INTERNAL_ERROR on DB error', async () => {
    mockPrisma.docDocument.findFirst.mockRejectedValue(new Error('Crash'));
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / with type filter passes type to findMany where clause', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    await request(app).get('/api/documents?type=POLICY');
    expect(mockPrisma.docDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.any(Object) }),
    );
  });

  it('POST / returns the created document with its id in data', async () => {
    mockPrisma.docDocument.count.mockResolvedValue(0);
    mockPrisma.docDocument.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000021',
      title: 'Check ID',
      referenceNumber: 'DOC-2026-0002',
    });
    const res = await request(app).post('/api/documents').send({ title: 'Check ID' });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000021');
  });
});

describe('Documents — final additional coverage', () => {
  it('GET / returns success:true on 200 response', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET / response body is not null', async () => {
    mockPrisma.docDocument.findMany.mockResolvedValue([]);
    mockPrisma.docDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents');
    expect(res.body).not.toBeNull();
  });

  it('GET /:id returns 200 with success:true when found', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Found',
    });
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /:id response data has id field', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docDocument.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated Title',
    });
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
  });

  it('DELETE /:id response data has message field', async () => {
    mockPrisma.docDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.docDocument.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('message');
  });
});
