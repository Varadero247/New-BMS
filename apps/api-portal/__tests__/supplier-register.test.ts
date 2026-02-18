import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    portalUser: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import supplierRegisterRouter from '../src/routes/supplier-register';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/supplier/register', supplierRegisterRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/supplier/register', () => {
  it('should register a new supplier', async () => {
    (prisma as any).portalUser.findFirst.mockResolvedValue(null);
    const user = { id: 'u-1', email: 'supplier@test.com', name: 'Acme', status: 'PENDING' };
    (prisma as any).portalUser.create.mockResolvedValue(user);

    const res = await request(app)
      .post('/api/supplier/register')
      .send({ email: 'supplier@test.com', name: 'John', company: 'Acme' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('should return 409 if email already registered', async () => {
    (prisma as any).portalUser.findFirst.mockResolvedValue({
      id: 'u-1',
      email: 'supplier@test.com',
    });

    const res = await request(app)
      .post('/api/supplier/register')
      .send({ email: 'supplier@test.com', name: 'John', company: 'Acme' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/supplier/register')
      .send({ email: 'not-an-email', name: 'John', company: 'Acme' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing name', async () => {
    const res = await request(app)
      .post('/api/supplier/register')
      .send({ email: 'supplier@test.com', company: 'Acme' });

    expect(res.status).toBe(400);
  });

  it('should handle server error', async () => {
    (prisma as any).portalUser.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post('/api/supplier/register')
      .send({ email: 'supplier@test.com', name: 'John', company: 'Acme' });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/supplier/register/status', () => {
  it('should return registration status', async () => {
    const user = {
      id: 'user-123',
      email: 'test@test.com',
      name: 'John',
      company: 'Acme',
      status: 'PENDING',
      role: 'SUPPLIER_USER',
      createdAt: new Date(),
    };
    (prisma as any).portalUser.findFirst.mockResolvedValue(user);

    const res = await request(app).get('/api/supplier/register/status');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('should return 404 if user not found', async () => {
    (prisma as any).portalUser.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/supplier/register/status');

    expect(res.status).toBe(404);
  });

  it('should handle server error on status', async () => {
    (prisma as any).portalUser.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/supplier/register/status');

    expect(res.status).toBe(500);
  });
});
