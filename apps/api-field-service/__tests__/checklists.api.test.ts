import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    fsSvcChecklist: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    fsSvcChecklistResult: {
      findMany: jest.fn(),
      create: jest.fn(),
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

import checklistsRouter from '../src/routes/checklists';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/checklists', checklistsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/checklists', () => {
  it('should return checklists with pagination', async () => {
    const checklists = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Safety Checklist',
        category: 'safety',
        items: [],
      },
    ];
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue(checklists);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(1);

    const res = await request(app).get('/api/checklists');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by category', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(0);

    await request(app).get('/api/checklists?category=safety');

    expect(mockPrisma.fsSvcChecklist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ category: 'safety' }),
      })
    );
  });

  it('should filter by isActive', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(0);

    await request(app).get('/api/checklists?isActive=true');

    expect(mockPrisma.fsSvcChecklist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
      })
    );
  });
});

describe('POST /api/checklists', () => {
  it('should create a checklist', async () => {
    const created = {
      id: 'cl-new',
      name: 'New Checklist',
      category: 'maintenance',
      items: [{ question: 'OK?' }],
    };
    mockPrisma.fsSvcChecklist.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/checklists')
      .send({ name: 'New Checklist', category: 'maintenance', items: [{ question: 'OK?' }] });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should reject invalid data', async () => {
    const res = await request(app).post('/api/checklists').send({ name: '' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/checklists/:id', () => {
  it('should return a checklist', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Safety',
    });

    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/checklists/:id', () => {
  it('should update a checklist', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcChecklist.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/checklists/:id', () => {
  it('should soft delete a checklist', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcChecklist.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe('Checklist deleted');
  });

  it('should return 404 for not found', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/checklists/:id/results', () => {
  it('should submit checklist results', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const created = { id: 'cr-new', checklistId: 'cl-1', overallResult: 'PASS' };
    mockPrisma.fsSvcChecklistResult.create.mockResolvedValue(created);

    const res = await request(app)
      .post('/api/checklists/00000000-0000-0000-0000-000000000001/results')
      .send({
        jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        completedAt: '2026-02-13T10:00:00Z',
        results: [{ item: 'Check A', pass: true }],
        overallResult: 'PASS',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if checklist not found', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/checklists/00000000-0000-0000-0000-000000000099/results')
      .send({
        jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        completedAt: '2026-02-13T10:00:00Z',
        results: [],
        overallResult: 'PASS',
      });

    expect(res.status).toBe(404);
  });

  it('should reject invalid data', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .post('/api/checklists/00000000-0000-0000-0000-000000000001/results')
      .send({ overallResult: 'INVALID' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/checklists/:id/results', () => {
  it('should return checklist results', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.fsSvcChecklistResult.findMany.mockResolvedValue([
      { id: 'cr-1', overallResult: 'PASS' },
    ]);

    const res = await request(app).get(
      '/api/checklists/00000000-0000-0000-0000-000000000001/results'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 404 if checklist not found', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/checklists/00000000-0000-0000-0000-000000000099/results'
    );

    expect(res.status).toBe(404);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/checklists');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.fsSvcChecklist.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/checklists').send({
      name: 'Test Checklist',
      category: 'Safety',
      items: [{ label: 'Check fire extinguisher' }],
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcChecklist.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcChecklist.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/results returns 500 when create fails', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcChecklistResult.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/checklists/00000000-0000-0000-0000-000000000001/results')
      .send({
        jobId: '00000000-0000-0000-0000-000000000001',
        completedAt: '2026-02-21T10:00:00Z',
        results: [],
        overallResult: 'PASS',
      });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id/results returns 500 on DB error', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcChecklistResult.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001/results');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// Additional coverage: pagination, filter wiring, validation
// ===================================================================
describe('Additional checklists coverage', () => {
  it('GET /api/checklists pagination returns totalPages', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(50);

    const res = await request(app).get('/api/checklists?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(50);
    expect(res.body.pagination.totalPages).toBe(5);
    expect(res.body.pagination.page).toBe(2);
  });

  it('GET /api/checklists response has success:true and pagination object', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Safety', category: 'safety', items: [] },
    ]);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(1);

    const res = await request(app).get('/api/checklists');
    expect(res.body).toMatchObject({ success: true, pagination: expect.objectContaining({ total: 1 }) });
  });

  it('POST /api/checklists returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/checklists').send({ category: 'Safety' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/checklists filters by isActive=false wired into where', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(0);

    await request(app).get('/api/checklists?isActive=false');
    expect(mockPrisma.fsSvcChecklist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: false }) })
    );
  });

  it('POST /api/checklists/:id/results returns 400 when overallResult is missing', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app)
      .post('/api/checklists/00000000-0000-0000-0000-000000000001/results')
      .send({ jobId: '00000000-0000-0000-0000-000000000001', completedAt: '2026-01-01T10:00:00Z' });
    expect(res.status).toBe(400);
  });

  it('PUT /api/checklists/:id returns 500 when find fails', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('checklists — batch-q coverage', () => {
  it('GET / findMany called once per request', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(0);
    await request(app).get('/api/checklists');
    expect(mockPrisma.fsSvcChecklist.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST / returns 400 when items is missing', async () => {
    const res = await request(app).post('/api/checklists').send({
      name: 'Safety Check',
      category: 'safety',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET / returns data as array', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', name: 'Check A', items: [] },
    ]);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(1);
    const res = await request(app).get('/api/checklists');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /:id/results returns 500 when checklist find rejects', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001/results');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('checklists — additional coverage 2', () => {
  it('GET / response has success:true with data array', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/checklists');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /:id returns 500 when find rejects', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete('/api/checklists/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id/results returns empty array when no results', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcChecklistResult.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/checklists/00000000-0000-0000-0000-000000000001/results');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('PUT /:id updates isActive to false', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcChecklist.update.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', isActive: false });
    const res = await request(app)
      .put('/api/checklists/00000000-0000-0000-0000-000000000001')
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST / creates checklist with description field', async () => {
    mockPrisma.fsSvcChecklist.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Electrical Safety',
      category: 'electrical',
      description: 'Check all electrical panels',
      items: [],
    });
    const res = await request(app).post('/api/checklists').send({
      name: 'Electrical Safety',
      category: 'electrical',
      description: 'Check all electrical panels',
      items: [],
    });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Electrical Safety');
  });

  it('POST /:id/results with FAIL overallResult creates successfully', async () => {
    mockPrisma.fsSvcChecklist.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.fsSvcChecklistResult.create.mockResolvedValue({ id: 'cr-fail', overallResult: 'FAIL' });
    const res = await request(app)
      .post('/api/checklists/00000000-0000-0000-0000-000000000001/results')
      .send({
        jobId: '00000000-0000-0000-0000-000000000001',
        completedAt: '2026-03-01T09:00:00Z',
        results: [{ item: 'Fire ext', pass: false }],
        overallResult: 'FAIL',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET / findMany called with correct where for category filter', async () => {
    mockPrisma.fsSvcChecklist.findMany.mockResolvedValue([]);
    mockPrisma.fsSvcChecklist.count.mockResolvedValue(0);
    await request(app).get('/api/checklists?category=electrical');
    expect(mockPrisma.fsSvcChecklist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'electrical' }) })
    );
  });
});
