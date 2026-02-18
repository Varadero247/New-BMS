import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    complianceDeadline: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/certifications';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/certifications', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/certifications — List compliance deadlines
// ===================================================================
describe('GET /api/certifications', () => {
  it('should return a paginated list of compliance deadlines', async () => {
    const deadlines = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'ISO 27001 Audit', category: 'COMPLIANCE', status: 'UPCOMING' },
      { id: 'dl-2', name: 'DMCC Renewal', category: 'LICENCE', status: 'UPCOMING' },
    ];
    (prisma as any).complianceDeadline.findMany.mockResolvedValue(deadlines);
    (prisma as any).complianceDeadline.count.mockResolvedValue(2);

    const res = await request(app).get('/api/certifications');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deadlines).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(2);
  });

  it('should filter by status', async () => {
    (prisma as any).complianceDeadline.findMany.mockResolvedValue([]);
    (prisma as any).complianceDeadline.count.mockResolvedValue(0);

    const res = await request(app).get('/api/certifications?status=OVERDUE');

    expect(res.status).toBe(200);
    expect((prisma as any).complianceDeadline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'OVERDUE' }) })
    );
  });

  it('should filter by category', async () => {
    (prisma as any).complianceDeadline.findMany.mockResolvedValue([]);
    (prisma as any).complianceDeadline.count.mockResolvedValue(0);

    const res = await request(app).get('/api/certifications?category=SECURITY');

    expect(res.status).toBe(200);
    expect((prisma as any).complianceDeadline.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'SECURITY' }) })
    );
  });

  it('should handle server errors', async () => {
    (prisma as any).complianceDeadline.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/certifications');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/certifications/seed — Seed compliance deadlines
// ===================================================================
describe('GET /api/certifications/seed', () => {
  it('should seed compliance deadlines and return count', async () => {
    (prisma as any).complianceDeadline.createMany.mockResolvedValue({ count: 5 });

    const res = await request(app).get('/api/certifications/seed');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.created).toBe(5);
    expect(res.body.data.total).toBe(5);
  });

  it('should handle server errors during seeding', async () => {
    (prisma as any).complianceDeadline.createMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/certifications/seed');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// GET /api/certifications/:id — Get single deadline
// ===================================================================
describe('GET /api/certifications/:id', () => {
  it('should return a compliance deadline by ID', async () => {
    const deadline = { id: '00000000-0000-0000-0000-000000000001', name: 'ISO 27001 Audit', category: 'COMPLIANCE', status: 'UPCOMING' };
    (prisma as any).complianceDeadline.findUnique.mockResolvedValue(deadline);

    const res = await request(app).get('/api/certifications/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deadline.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 for a non-existent deadline', async () => {
    (prisma as any).complianceDeadline.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/certifications/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    (prisma as any).complianceDeadline.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/certifications/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// POST /api/certifications — Create compliance deadline
// ===================================================================
describe('POST /api/certifications', () => {
  it('should create a compliance deadline', async () => {
    const created = {
      id: 'dl-new',
      name: 'CREST Pen Test',
      category: 'SECURITY',
      dueDate: new Date('2026-06-15'),
      status: 'UPCOMING',
    };
    (prisma as any).complianceDeadline.create.mockResolvedValue(created);

    const res = await request(app).post('/api/certifications').send({
      name: 'CREST Pen Test',
      category: 'SECURITY',
      dueDate: '2026-06-15',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deadline.id).toBe('dl-new');
  });

  it('should reject missing required fields', async () => {
    const res = await request(app).post('/api/certifications').send({ name: 'Test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject empty name', async () => {
    const res = await request(app).post('/api/certifications').send({
      name: '',
      category: 'COMPLIANCE',
      dueDate: '2026-06-15',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle server errors', async () => {
    (prisma as any).complianceDeadline.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/certifications').send({
      name: 'CREST Pen Test',
      category: 'SECURITY',
      dueDate: '2026-06-15',
    });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// PATCH /api/certifications/:id — Update compliance deadline
// ===================================================================
describe('PATCH /api/certifications/:id', () => {
  it('should update a compliance deadline', async () => {
    const existing = { id: '00000000-0000-0000-0000-000000000001', name: 'Old Name', category: 'COMPLIANCE', status: 'UPCOMING' };
    const updated = { ...existing, name: 'Updated Name', status: 'COMPLETED' };
    (prisma as any).complianceDeadline.findUnique.mockResolvedValue(existing);
    (prisma as any).complianceDeadline.update.mockResolvedValue(updated);

    const res = await request(app).patch('/api/certifications/00000000-0000-0000-0000-000000000001').send({ name: 'Updated Name', status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deadline.name).toBe('Updated Name');
  });

  it('should return 404 for a non-existent deadline', async () => {
    (prisma as any).complianceDeadline.findUnique.mockResolvedValue(null);

    const res = await request(app).patch('/api/certifications/00000000-0000-0000-0000-000000000099').send({ status: 'COMPLETED' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    (prisma as any).complianceDeadline.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).patch('/api/certifications/00000000-0000-0000-0000-000000000001').send({ status: 'COMPLETED' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
