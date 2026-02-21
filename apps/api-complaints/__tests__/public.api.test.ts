import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { compComplaint: { count: jest.fn(), create: jest.fn() } },
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

import router from '../src/routes/public';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/public', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/public/submit', () => {
  it('should submit a complaint and return reference number', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(5);
    mockPrisma.compComplaint.create.mockResolvedValue({
      id: '1',
      referenceNumber: 'CMP-2026-0006',
    });
    const res = await request(app).post('/api/public/submit').send({
      title: 'My Complaint',
      description: 'Something went wrong',
      complainantName: 'John Doe',
      complainantEmail: 'john@example.com',
      category: 'PRODUCT',
      priority: 'HIGH',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceNumber).toBe('CMP-2026-0006');
  });

  it('should return 400 when title is missing', async () => {
    const res = await request(app).post('/api/public/submit').send({
      description: 'No title provided',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when category is invalid', async () => {
    const res = await request(app).post('/api/public/submit').send({
      title: 'Test',
      category: 'INVALID_CATEGORY',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on create error', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockRejectedValue(new Error('Create failed'));
    const res = await request(app).post('/api/public/submit').send({ title: 'Complaint' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should use provided orgId', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({
      id: '2',
      referenceNumber: 'CMP-2026-0001',
    });
    const res = await request(app).post('/api/public/submit').send({
      title: 'Org-specific complaint',
      orgId: '00000000-0000-4000-a000-000000000099',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 when complainantEmail is invalid format', async () => {
    const res = await request(app).post('/api/public/submit').send({
      title: 'Email Test',
      complainantEmail: 'not-a-valid-email',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when priority is invalid', async () => {
    const res = await request(app).post('/api/public/submit').send({
      title: 'Priority Test',
      priority: 'URGENT',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('response includes referenceNumber with correct format', async () => {
    const year = new Date().getFullYear();
    mockPrisma.compComplaint.count.mockResolvedValue(9);
    mockPrisma.compComplaint.create.mockResolvedValue({
      id: '3',
      referenceNumber: `CMP-${year}-0010`,
    });
    const res = await request(app).post('/api/public/submit').send({ title: 'Format Test' });
    expect(res.status).toBe(201);
    expect(res.body.data.referenceNumber).toMatch(/^CMP-\d{4}-\d{4}$/);
  });
});
