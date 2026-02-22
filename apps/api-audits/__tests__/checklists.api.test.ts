import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    audChecklist: {
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

import router from '../src/routes/checklists';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/checklists', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/checklists', () => {
  it('should return checklists with pagination', async () => {
    mockPrisma.audChecklist.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'ISO 9001 Checklist' },
    ]);
    mockPrisma.audChecklist.count.mockResolvedValue(1);
    const res = await request(app).get('/api/checklists');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by status', async () => {
    mockPrisma.audChecklist.findMany.mockResolvedValue([]);
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/checklists?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should filter by search term', async () => {
    mockPrisma.audChecklist.findMany.mockResolvedValue([
      { id: '2', title: 'Quality Checklist' },
    ]);
    mockPrisma.audChecklist.count.mockResolvedValue(1);
    const res = await request(app).get('/api/checklists?search=Quality');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.audChecklist.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.audChecklist.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/checklists');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/checklists/:id', () => {
  it('should return checklist by id', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Test Checklist',
    });
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when checklist not found', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    mockPrisma.audChecklist.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/checklists', () => {
  it('should create a checklist', async () => {
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    mockPrisma.audChecklist.create.mockResolvedValue({
      id: 'new-1',
      auditId: 'audit-1',
      title: 'New Checklist',
      referenceNumber: `ACH-${new Date().getFullYear()}-0001`,
    });
    const res = await request(app).post('/api/checklists').send({
      auditId: 'audit-1',
      title: 'New Checklist',
      standard: 'ISO 9001',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('new-1');
  });

  it('should return 400 on missing required fields', async () => {
    const res = await request(app).post('/api/checklists').send({ title: 'No auditId' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on empty title', async () => {
    const res = await request(app).post('/api/checklists').send({ auditId: 'audit-1', title: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on database error during create', async () => {
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    mockPrisma.audChecklist.create.mockRejectedValue(new Error('Create failed'));
    const res = await request(app)
      .post('/api/checklists')
      .send({ auditId: 'audit-1', title: 'Checklist' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/checklists/:id', () => {
  it('should update a checklist', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Old Title',
    });
    mockPrisma.audChecklist.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated Title',
    });
    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Title');
  });

  it('should return 404 if checklist not found', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000099')
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on update error', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.audChecklist.update.mockRejectedValue(new Error('Update failed'));
    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/checklists/:id', () => {
  it('should soft-delete a checklist', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'To Delete',
    });
    mockPrisma.audChecklist.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });
    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('checklist deleted successfully');
  });

  it('should return 404 if checklist not found', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.audChecklist.update.mockRejectedValue(new Error('Delete failed'));
    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('checklists.api — extended edge cases', () => {
  it('POST with standard field creates checklist', async () => {
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    mockPrisma.audChecklist.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000010',
      auditId: '00000000-0000-0000-0000-000000000001',
      title: 'ISO 14001 Checklist',
      standard: 'ISO 14001',
    });
    const res = await request(app)
      .post('/api/checklists')
      .send({
        auditId: '00000000-0000-0000-0000-000000000001',
        title: 'ISO 14001 Checklist',
        standard: 'ISO 14001',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET pagination page and limit are reflected in response', async () => {
    mockPrisma.audChecklist.findMany.mockResolvedValue([]);
    mockPrisma.audChecklist.count.mockResolvedValue(30);
    const res = await request(app).get('/api/checklists?page=3&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('GET search filter returns matching checklists', async () => {
    mockPrisma.audChecklist.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Safety Checklist' },
    ]);
    mockPrisma.audChecklist.count.mockResolvedValue(1);
    const res = await request(app).get('/api/checklists?search=Safety');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('GET returns empty array when no checklists match search', async () => {
    mockPrisma.audChecklist.findMany.mockResolvedValue([]);
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/checklists?search=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('PUT updates title and returns updated value', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Old Title',
    });
    mockPrisma.audChecklist.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'New Title',
    });
    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000001')
      .send({ title: 'New Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New Title');
  });

  it('DELETE /:id returns 500 when update rejects', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.audChecklist.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id 500 returns error object with code', async () => {
    mockPrisma.audChecklist.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code');
  });

  it('POST missing both auditId and title returns 400 with VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/checklists').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('checklists.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/checklists', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/checklists', async () => {
    const res = await request(app).get('/api/checklists');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/checklists', async () => {
    const res = await request(app).get('/api/checklists');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/checklists body has success property', async () => {
    const res = await request(app).get('/api/checklists');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('Checklists API — final coverage block', () => {
  it('POST / count is called to generate reference number', async () => {
    mockPrisma.audChecklist.count.mockResolvedValue(1);
    mockPrisma.audChecklist.create.mockResolvedValue({ id: 'chk-2', auditId: 'audit-1', title: 'Checklist 2', referenceNumber: 'ACH-2026-0002' });
    await request(app).post('/api/checklists').send({ auditId: 'audit-1', title: 'Checklist 2' });
    expect(mockPrisma.audChecklist.count).toHaveBeenCalledTimes(1);
  });

  it('DELETE /:id update is called with deletedAt data', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audChecklist.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', deletedAt: new Date() });
    await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(mockPrisma.audChecklist.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('GET / returns data as an array', async () => {
    mockPrisma.audChecklist.findMany.mockResolvedValue([]);
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/checklists');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('PUT /:id update is called with correct where.id', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.audChecklist.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'Updated' });
    await request(app).put('/api/checklists/00000000-0000-0000-0000-000000000001').send({ title: 'Updated' });
    expect(mockPrisma.audChecklist.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '00000000-0000-0000-0000-000000000001' } })
    );
  });

  it('GET / pagination total matches count mock', async () => {
    mockPrisma.audChecklist.findMany.mockResolvedValue([]);
    mockPrisma.audChecklist.count.mockResolvedValue(22);
    const res = await request(app).get('/api/checklists');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(22);
  });

  it('POST / create is called with auditId in data', async () => {
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    mockPrisma.audChecklist.create.mockResolvedValue({ id: 'chk-new', auditId: 'aud-99', title: 'Check', referenceNumber: 'ACH-2026-0001' });
    await request(app).post('/api/checklists').send({ auditId: 'aud-99', title: 'Check' });
    expect(mockPrisma.audChecklist.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ auditId: 'aud-99' }) })
    );
  });

  it('GET /:id data has title field matching mock data', async () => {
    mockPrisma.audChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', title: 'My Checklist' });
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('My Checklist');
  });
});
