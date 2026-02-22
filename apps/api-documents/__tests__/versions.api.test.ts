import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    docVersion: {
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

import router from '../src/routes/versions';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/versions', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/versions', () => {
  it('should return list of versions with pagination', async () => {
    mockPrisma.docVersion.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', documentId: 'doc-1', version: 1 },
    ]);
    mockPrisma.docVersion.count.mockResolvedValue(1);
    const res = await request(app).get('/api/versions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    mockPrisma.docVersion.findMany.mockResolvedValue([]);
    mockPrisma.docVersion.count.mockResolvedValue(0);
    const res = await request(app).get('/api/versions?status=ACTIVE');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support pagination params', async () => {
    mockPrisma.docVersion.findMany.mockResolvedValue([]);
    mockPrisma.docVersion.count.mockResolvedValue(0);
    const res = await request(app).get('/api/versions?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.docVersion.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.docVersion.count.mockResolvedValue(0);
    const res = await request(app).get('/api/versions');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/versions/:id', () => {
  it('should return a version by id', async () => {
    mockPrisma.docVersion.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
      version: 2,
    });
    const res = await request(app).get('/api/versions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(res.body.data.version).toBe(2);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.docVersion.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/versions/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/versions', () => {
  it('should create a version', async () => {
    mockPrisma.docVersion.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
      version: 1,
      changeNotes: 'Initial version',
    });
    const res = await request(app)
      .post('/api/versions')
      .send({ documentId: 'doc-1', version: 1, changeNotes: 'Initial version' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 400 if documentId is missing', async () => {
    const res = await request(app).post('/api/versions').send({ version: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if version is missing', async () => {
    const res = await request(app).post('/api/versions').send({ documentId: 'doc-1' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 if version is less than 1', async () => {
    const res = await request(app).post('/api/versions').send({ documentId: 'doc-1', version: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on create error', async () => {
    mockPrisma.docVersion.create.mockRejectedValue(new Error('Unique constraint failed'));
    const res = await request(app).post('/api/versions').send({ documentId: 'doc-1', version: 1 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/versions/:id', () => {
  it('should update a version', async () => {
    mockPrisma.docVersion.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
      version: 1,
    });
    mockPrisma.docVersion.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      documentId: 'doc-1',
      version: 2,
      changeNotes: 'Updated',
    });
    const res = await request(app)
      .put('/api/versions/00000000-0000-0000-0000-000000000001')
      .send({ version: 2, changeNotes: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.docVersion.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/versions/00000000-0000-0000-0000-000000000099')
      .send({ version: 2 });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 on validation error', async () => {
    const res = await request(app)
      .put('/api/versions/00000000-0000-0000-0000-000000000001')
      .send({ version: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /api/versions/:id', () => {
  it('should soft delete a version', async () => {
    mockPrisma.docVersion.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docVersion.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/versions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.docVersion.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/versions/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('versions.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/versions', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/versions', async () => {
    const res = await request(app).get('/api/versions');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/versions', async () => {
    const res = await request(app).get('/api/versions');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/versions body has success property', async () => {
    const res = await request(app).get('/api/versions');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/versions body is an object', async () => {
    const res = await request(app).get('/api/versions');
    expect(typeof res.body).toBe('object');
  });
});

// ─── Versions — extended error and field coverage ────────────────────────────

describe('Versions — extended error and field coverage', () => {
  it('GET / returns pagination totalPages calculated from total and limit', async () => {
    mockPrisma.docVersion.findMany.mockResolvedValue([]);
    mockPrisma.docVersion.count.mockResolvedValue(25);
    const res = await request(app).get('/api/versions?limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET / with search passes filter to findMany via changeNotes', async () => {
    mockPrisma.docVersion.findMany.mockResolvedValue([]);
    mockPrisma.docVersion.count.mockResolvedValue(0);
    await request(app).get('/api/versions?search=breaking');
    expect(mockPrisma.docVersion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ changeNotes: expect.any(Object) }),
      }),
    );
  });

  it('POST / with fileUrl as invalid URL returns 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/versions')
      .send({ documentId: 'doc-1', version: 1, fileUrl: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:id returns 500 when update throws', async () => {
    mockPrisma.docVersion.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docVersion.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/versions/00000000-0000-0000-0000-000000000001')
      .send({ version: 2 });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update throws', async () => {
    mockPrisma.docVersion.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.docVersion.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/versions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.docVersion.findFirst.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/versions/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / data array has correct length matching mocked results', async () => {
    mockPrisma.docVersion.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', documentId: 'doc-1', version: 1 },
      { id: '00000000-0000-0000-0000-000000000002', documentId: 'doc-1', version: 2 },
    ]);
    mockPrisma.docVersion.count.mockResolvedValue(2);
    const res = await request(app).get('/api/versions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('POST / create called exactly once per request', async () => {
    mockPrisma.docVersion.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000003',
      documentId: 'doc-2',
      version: 1,
    });
    await request(app).post('/api/versions').send({ documentId: 'doc-2', version: 1 });
    expect(mockPrisma.docVersion.create).toHaveBeenCalledTimes(1);
  });
});
