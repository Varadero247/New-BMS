import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    regLegalRegister: {
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

import router from '../src/routes/legal-register';
import { prisma } from '../src/prisma';
const app = express();
app.use(express.json());
app.use('/api/legal-register', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/legal-register', () => {
  it('should return list of legal register entries with pagination', async () => {
    (prisma as any).regLegalRegister.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'GDPR' },
    ]);
    (prisma as any).regLegalRegister.count.mockResolvedValue(1);
    const res = await request(app).get('/api/legal-register');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support filtering by status', async () => {
    (prisma as any).regLegalRegister.findMany.mockResolvedValue([]);
    (prisma as any).regLegalRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/legal-register?status=COMPLIANT');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support search query', async () => {
    (prisma as any).regLegalRegister.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'ISO 9001' },
    ]);
    (prisma as any).regLegalRegister.count.mockResolvedValue(1);
    const res = await request(app).get('/api/legal-register?search=ISO');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).regLegalRegister.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).regLegalRegister.count.mockResolvedValue(0);
    const res = await request(app).get('/api/legal-register');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/legal-register/:id', () => {
  it('should return a legal register entry by id', async () => {
    (prisma as any).regLegalRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'GDPR',
    });
    const res = await request(app).get('/api/legal-register/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if entry not found', async () => {
    (prisma as any).regLegalRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/legal-register/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).regLegalRegister.findFirst.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/legal-register/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/legal-register', () => {
  it('should create a new legal register entry', async () => {
    (prisma as any).regLegalRegister.count.mockResolvedValue(0);
    (prisma as any).regLegalRegister.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'GDPR',
      referenceNumber: 'RLR-2026-0001',
    });
    const res = await request(app).post('/api/legal-register').send({ title: 'GDPR' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('GDPR');
  });

  it('should create entry with all optional fields', async () => {
    (prisma as any).regLegalRegister.count.mockResolvedValue(1);
    (prisma as any).regLegalRegister.create.mockResolvedValue({
      id: '2',
      title: 'ISO 14001',
      jurisdiction: 'UK',
    });
    const res = await request(app).post('/api/legal-register').send({
      title: 'ISO 14001',
      legislation: 'Environmental Act',
      jurisdiction: 'UK',
      applicability: 'All sites',
      requirements: 'Annual audit',
      complianceStatus: 'COMPLIANT',
      responsiblePerson: 'Jane Doe',
      reviewDate: '2026-12-01',
      lastReviewDate: '2025-12-01',
      notes: 'Reviewed',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when title is missing', async () => {
    const res = await request(app).post('/api/legal-register').send({ jurisdiction: 'UK' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on create error', async () => {
    (prisma as any).regLegalRegister.count.mockResolvedValue(0);
    (prisma as any).regLegalRegister.create.mockRejectedValue(new Error('Create failed'));
    const res = await request(app).post('/api/legal-register').send({ title: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('PUT /api/legal-register/:id', () => {
  it('should update an existing entry', async () => {
    (prisma as any).regLegalRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Old Title',
    });
    (prisma as any).regLegalRegister.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Updated Title',
    });
    const res = await request(app)
      .put('/api/legal-register/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Title');
  });

  it('should return 404 if entry not found for update', async () => {
    (prisma as any).regLegalRegister.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/legal-register/00000000-0000-0000-0000-000000000099')
      .send({ title: 'New' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).regLegalRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).regLegalRegister.update.mockRejectedValue(new Error('Update failed'));
    const res = await request(app)
      .put('/api/legal-register/00000000-0000-0000-0000-000000000001')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('DELETE /api/legal-register/:id', () => {
  it('should soft delete a legal register entry', async () => {
    (prisma as any).regLegalRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      title: 'GDPR',
    });
    (prisma as any).regLegalRegister.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete(
      '/api/legal-register/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toContain('deleted successfully');
  });

  it('should return 404 if entry not found for delete', async () => {
    (prisma as any).regLegalRegister.findFirst.mockResolvedValue(null);
    const res = await request(app).delete(
      '/api/legal-register/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).regLegalRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).regLegalRegister.update.mockRejectedValue(new Error('Delete failed'));
    const res = await request(app).delete(
      '/api/legal-register/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
