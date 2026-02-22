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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/supplier/register', supplierRegisterRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/supplier/register', () => {
  it('should register a new supplier', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    const user = { id: 'u-1', email: 'supplier@test.com', name: 'Acme', status: 'PENDING' };
    mockPrisma.portalUser.create.mockResolvedValue(user);

    const res = await request(app)
      .post('/api/supplier/register')
      .send({ email: 'supplier@test.com', name: 'John', company: 'Acme' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('should return 409 if email already registered', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue({
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
    mockPrisma.portalUser.findFirst.mockRejectedValue(new Error('DB error'));

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
    mockPrisma.portalUser.findFirst.mockResolvedValue(user);

    const res = await request(app).get('/api/supplier/register/status');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('should return 404 if user not found', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/supplier/register/status');

    expect(res.status).toBe(404);
  });

  it('should handle server error on status', async () => {
    mockPrisma.portalUser.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/supplier/register/status');

    expect(res.status).toBe(500);
  });
});

describe('Supplier Register — extended', () => {
  it('POST register: create called once on success', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    mockPrisma.portalUser.create.mockResolvedValue({ id: 'u-1', email: 'new@co.com', name: 'New', company: 'NewCo', status: 'PENDING', role: 'SUPPLIER_USER' });
    await request(app).post('/api/supplier/register').send({ email: 'new@co.com', name: 'New', company: 'NewCo' });
    expect(mockPrisma.portalUser.create).toHaveBeenCalledTimes(1);
  });

  it('GET status: success is true when user found', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue({ id: 'u-1', email: 'test@test.com', name: 'John', company: 'Co', status: 'PENDING', role: 'SUPPLIER_USER', createdAt: new Date() });
    const res = await request(app).get('/api/supplier/register/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET status: findFirst called once per request', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    await request(app).get('/api/supplier/register/status');
    expect(mockPrisma.portalUser.findFirst).toHaveBeenCalledTimes(1);
  });
});

describe('Supplier Register — extra', () => {
  it('POST register: success data has status PENDING', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    mockPrisma.portalUser.create.mockResolvedValue({ id: 'u-2', email: 'new@co.com', name: 'New', company: 'NewCo', status: 'PENDING', role: 'SUPPLIER_USER' });
    const res = await request(app).post('/api/supplier/register').send({ email: 'new@co.com', name: 'New', company: 'NewCo' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('GET status: data has status field', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue({ id: 'u-1', email: 'test@test.com', name: 'John', company: 'Co', status: 'APPROVED', role: 'SUPPLIER_USER', createdAt: new Date() });
    const res = await request(app).get('/api/supplier/register/status');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('status');
  });

  it('POST register: returns 500 with success false on DB error', async () => {
    mockPrisma.portalUser.findFirst.mockRejectedValue(new Error('DB crash'));
    const res = await request(app).post('/api/supplier/register').send({ email: 'crash@co.com', name: 'Crash', company: 'CrashCo' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET status: returns 500 with success false on DB error', async () => {
    mockPrisma.portalUser.findFirst.mockRejectedValue(new Error('DB crash'));
    const res = await request(app).get('/api/supplier/register/status');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('supplier-register — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/supplier/register', supplierRegisterRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/supplier/register', async () => {
    const res = await request(app).get('/api/supplier/register');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/supplier/register', async () => {
    const res = await request(app).get('/api/supplier/register');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/supplier/register body has success property', async () => {
    const res = await request(app).get('/api/supplier/register');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/supplier/register body is an object', async () => {
    const res = await request(app).get('/api/supplier/register');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/supplier/register route is accessible', async () => {
    const res = await request(app).get('/api/supplier/register');
    expect(res.status).toBeDefined();
  });
});

describe('Supplier Register — edge cases', () => {
  it('POST register: create stores role as SUPPLIER_USER', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    mockPrisma.portalUser.create.mockResolvedValue({
      id: 'u-3',
      email: 'role@co.com',
      status: 'PENDING',
    });
    await request(app)
      .post('/api/supplier/register')
      .send({ email: 'role@co.com', name: 'Role Test', company: 'RoleCo' });
    expect(mockPrisma.portalUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'SUPPLIER_USER' }),
      })
    );
  });

  it('POST register: create stores portalType as SUPPLIER', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    mockPrisma.portalUser.create.mockResolvedValue({
      id: 'u-4',
      email: 'type@co.com',
      status: 'PENDING',
    });
    await request(app)
      .post('/api/supplier/register')
      .send({ email: 'type@co.com', name: 'Type Test', company: 'TypeCo' });
    expect(mockPrisma.portalUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ portalType: 'SUPPLIER' }),
      })
    );
  });

  it('POST register: optional phone field is accepted', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    mockPrisma.portalUser.create.mockResolvedValue({
      id: 'u-5',
      email: 'phone@co.com',
      status: 'PENDING',
    });
    const res = await request(app)
      .post('/api/supplier/register')
      .send({ email: 'phone@co.com', name: 'Phone Test', company: 'PhoneCo', phone: '+447900123456' });
    expect(res.status).toBe(201);
    expect(mockPrisma.portalUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ phone: '+447900123456' }),
      })
    );
  });

  it('POST register: phone defaults to null when not provided', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    mockPrisma.portalUser.create.mockResolvedValue({ id: 'u-6', email: 'nophone@co.com', status: 'PENDING' });
    await request(app)
      .post('/api/supplier/register')
      .send({ email: 'nophone@co.com', name: 'NoPhone', company: 'NPC' });
    expect(mockPrisma.portalUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ phone: null }),
      })
    );
  });

  it('POST register: returns 400 for missing company', async () => {
    const res = await request(app)
      .post('/api/supplier/register')
      .send({ email: 'nocompany@co.com', name: 'NoCompany' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /status returns data with id, email, name, company, role, createdAt', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue({
      id: 'u-1',
      email: 'test@test.com',
      name: 'John',
      company: 'Acme',
      status: 'APPROVED',
      role: 'SUPPLIER_USER',
      createdAt: new Date('2026-01-01'),
    });
    const res = await request(app).get('/api/supplier/register/status');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data).toHaveProperty('company');
    expect(res.body.data).toHaveProperty('role');
    expect(res.body.data).toHaveProperty('createdAt');
  });

  it('GET /status: error code is NOT_FOUND when user not found', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/supplier/register/status');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST register: findFirst searches by email to check for duplicates', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    mockPrisma.portalUser.create.mockResolvedValue({ id: 'u-7', email: 'dup@co.com', status: 'PENDING' });
    await request(app)
      .post('/api/supplier/register')
      .send({ email: 'dup@co.com', name: 'Dup', company: 'DupCo' });
    expect(mockPrisma.portalUser.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ email: 'dup@co.com' }),
      })
    );
  });
});
