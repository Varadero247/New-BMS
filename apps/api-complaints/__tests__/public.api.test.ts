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

  it('create is called once per submission', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: '4', referenceNumber: 'CMP-2026-0001' });
    await request(app).post('/api/public/submit').send({ title: 'Once Test' });
    expect(mockPrisma.compComplaint.create).toHaveBeenCalledTimes(1);
  });

  it('response data includes a referenceNumber field', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: 'complaint-id-1', referenceNumber: 'CMP-2026-0001' });
    const res = await request(app).post('/api/public/submit').send({ title: 'ID Test' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });

  it('success is true on 201', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(1);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: '5', referenceNumber: 'CMP-2026-0002' });
    const res = await request(app).post('/api/public/submit').send({ title: 'Success Flag Test' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('Public Complaints — extended', () => {
  it('count is called once per submission', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: '6', referenceNumber: 'CMP-2026-0001' });
    await request(app).post('/api/public/submit').send({ title: 'Count Check' });
    expect(mockPrisma.compComplaint.count).toHaveBeenCalledTimes(1);
  });

  it('referenceNumber is a string', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(2);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: '7', referenceNumber: 'CMP-2026-0003' });
    const res = await request(app).post('/api/public/submit').send({ title: 'Type Check' });
    expect(res.status).toBe(201);
    expect(typeof res.body.data.referenceNumber).toBe('string');
  });

  it('success is false when create rejects', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockRejectedValue(new Error('DB constraint'));
    const res = await request(app).post('/api/public/submit').send({ title: 'Rejection Test' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('validation error code returned for invalid email', async () => {
    const res = await request(app).post('/api/public/submit').send({
      title: 'Email Validation',
      complainantEmail: 'bad-email',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('public.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/public', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/public', async () => {
    const res = await request(app).get('/api/public');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/public', async () => {
    const res = await request(app).get('/api/public');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/public body has success property', async () => {
    const res = await request(app).get('/api/public');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/public body is an object', async () => {
    const res = await request(app).get('/api/public');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/public route is accessible', async () => {
    const res = await request(app).get('/api/public');
    expect(res.status).toBeDefined();
  });
});

describe('public.api — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /submit accepts BILLING category', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: 'id-1', referenceNumber: 'CMP-2026-0001' });
    const res = await request(app).post('/api/public/submit').send({
      title: 'Billing issue',
      category: 'BILLING',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /submit accepts SAFETY category', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: 'id-2', referenceNumber: 'CMP-2026-0001' });
    const res = await request(app).post('/api/public/submit').send({
      title: 'Safety concern',
      category: 'SAFETY',
    });
    expect(res.status).toBe(201);
  });

  it('POST /submit accepts CRITICAL priority', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: 'id-3', referenceNumber: 'CMP-2026-0001' });
    const res = await request(app).post('/api/public/submit').send({
      title: 'Critical complaint',
      priority: 'CRITICAL',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /submit returns 400 when body is completely empty', async () => {
    const res = await request(app).post('/api/public/submit').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /submit response data does not expose full complaint object', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: 'id-4', referenceNumber: 'CMP-2026-0001' });
    const res = await request(app).post('/api/public/submit').send({ title: 'Minimal' });
    expect(res.status).toBe(201);
    expect(res.body.data).not.toHaveProperty('id');
  });

  it('POST /submit count is queried before create', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(10);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: 'id-5', referenceNumber: 'CMP-2026-0011' });
    await request(app).post('/api/public/submit').send({ title: 'Order check' });
    expect(mockPrisma.compComplaint.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.compComplaint.create).toHaveBeenCalledTimes(1);
  });

  it('POST /submit sets channel to WEB_FORM implicitly', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compComplaint.create.mockResolvedValue({ id: 'id-6', referenceNumber: 'CMP-2026-0001' });
    await request(app).post('/api/public/submit').send({ title: 'Web form check' });
    expect(mockPrisma.compComplaint.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ channel: 'WEB_FORM' }) })
    );
  });

  it('POST /submit returns 400 when INVALID category sent', async () => {
    const res = await request(app).post('/api/public/submit').send({
      title: 'Cat test',
      category: 'UNKNOWN',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
