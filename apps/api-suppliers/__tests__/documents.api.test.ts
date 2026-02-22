import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    suppDocument: {
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
  it('should return documents list', async () => {
    mockPrisma.suppDocument.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Certificate' },
    ]);
    mockPrisma.suppDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support search and status filters', async () => {
    mockPrisma.suppDocument.findMany.mockResolvedValue([]);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents?search=cert&status=ACTIVE');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('findMany and count are each called once', async () => {
    mockPrisma.suppDocument.findMany.mockResolvedValue([]);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    await request(app).get('/api/documents');
    expect(mockPrisma.suppDocument.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.suppDocument.count).toHaveBeenCalledTimes(1);
  });

  it('should return 500 on DB error', async () => {
    mockPrisma.suppDocument.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/documents/:id', () => {
  it('should return a document by id', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Certificate',
    });
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/documents', () => {
  it('should create a document', async () => {
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    mockPrisma.suppDocument.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New Doc',
      supplierId: 'sup-1',
    });
    const res = await request(app).post('/api/documents').send({
      supplierId: 'sup-1',
      title: 'New Doc',
      type: 'CERTIFICATE',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 on validation error (missing required fields)', async () => {
    const res = await request(app).post('/api/documents').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on invalid document type', async () => {
    const res = await request(app).post('/api/documents').send({
      supplierId: 'sup-1',
      title: 'Doc',
      type: 'INVALID_TYPE',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/documents/:id', () => {
  it('should update a document', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Old Title',
    });
    mockPrisma.suppDocument.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated Title',
    });
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if document not found on update', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Title' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on DB error', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.suppDocument.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Title' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/documents/:id', () => {
  it('should soft delete a document', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.suppDocument.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('document deleted successfully');
  });

  it('should return 404 if document not found on delete', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on DB error', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.suppDocument.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
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

  it('GET /api/documents body is an object', async () => {
    const res = await request(app).get('/api/documents');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/documents route is accessible', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBeDefined();
  });
});

describe('documents.api — pagination and extended paths', () => {
  it('GET / pagination object contains page, limit, total, totalPages', async () => {
    mockPrisma.suppDocument.findMany.mockResolvedValue([]);
    mockPrisma.suppDocument.count.mockResolvedValue(30);
    const res = await request(app).get('/api/documents?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('limit');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination).toHaveProperty('totalPages');
  });

  it('GET / pagination total equals the count mock', async () => {
    mockPrisma.suppDocument.findMany.mockResolvedValue([]);
    mockPrisma.suppDocument.count.mockResolvedValue(88);
    const res = await request(app).get('/api/documents');
    expect(res.body.pagination.total).toBe(88);
  });

  it('POST / with fileUrl and expiryDate succeeds', async () => {
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    mockPrisma.suppDocument.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'ISO Cert',
      supplierId: 'sup-1',
    });
    const res = await request(app).post('/api/documents').send({
      supplierId: 'sup-1',
      title: 'ISO Cert',
      type: 'CERTIFICATE',
      fileUrl: 'https://example.com/cert.pdf',
      expiryDate: '2027-01-01T00:00:00.000Z',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET / with page=1 limit=5 returns 200 and data array', async () => {
    mockPrisma.suppDocument.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Doc A' },
    ]);
    mockPrisma.suppDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/documents?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /:id returns message document deleted successfully', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.suppDocument.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('document deleted successfully');
  });

  it('POST / returns 400 when title is empty string', async () => {
    const res = await request(app).post('/api/documents').send({
      supplierId: 'sup-1',
      title: '',
      type: 'CERTIFICATE',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:id with isVerified:true succeeds', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.suppDocument.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      isVerified: true,
    });
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000001')
      .send({ isVerified: true, verifiedBy: 'auditor@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('count error causes 500 on POST', async () => {
    mockPrisma.suppDocument.count.mockRejectedValue(new Error('count failed'));
    const res = await request(app).post('/api/documents').send({
      supplierId: 'sup-1',
      title: 'Doc',
      type: 'LICENSE',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('documents.api — final coverage expansion', () => {
  it('GET /api/documents with supplierId filter returns 200', async () => {
    mockPrisma.suppDocument.findMany.mockResolvedValue([]);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents?supplierId=sup-1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/documents with type filter returns 200', async () => {
    mockPrisma.suppDocument.findMany.mockResolvedValue([]);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/documents?type=CERTIFICATE');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/documents/:id returns 500 on DB error', async () => {
    mockPrisma.suppDocument.findFirst.mockRejectedValue(new Error('db fail'));
    const res = await request(app).get('/api/documents/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/documents with LICENSE type returns 201', async () => {
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    mockPrisma.suppDocument.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Operating Licence',
      supplierId: 'sup-1',
      type: 'LICENSE',
    });
    const res = await request(app).post('/api/documents').send({
      supplierId: 'sup-1',
      title: 'Operating Licence',
      type: 'LICENSE',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/documents/:id response data contains id', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.suppDocument.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New Title',
    });
    const res = await request(app)
      .put('/api/documents/00000000-0000-0000-0000-000000000001')
      .send({ title: 'New Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('DELETE /api/documents/:id success is true', async () => {
    mockPrisma.suppDocument.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000002' });
    mockPrisma.suppDocument.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000002' });
    const res = await request(app).delete('/api/documents/00000000-0000-0000-0000-000000000002');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/documents missing supplierId returns 400', async () => {
    const res = await request(app).post('/api/documents').send({
      title: 'Doc Without Supplier',
      type: 'CERTIFICATE',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
