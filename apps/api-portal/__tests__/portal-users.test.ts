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
    portalInvitation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

jest.mock('uuid', () => ({ v4: () => 'mock-uuid-token' }));

import portalUsersRouter from '../src/routes/portal-users';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/portal/users', portalUsersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/portal/users', () => {
  it('should list portal users with pagination', async () => {
    const users = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'cust@test.com',
        name: 'Customer',
        portalType: 'CUSTOMER',
        status: 'ACTIVE',
      },
    ];
    mockPrisma.portalUser.findMany.mockResolvedValue(users);
    mockPrisma.portalUser.count.mockResolvedValue(1);

    const res = await request(app).get('/api/portal/users');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by portalType', async () => {
    mockPrisma.portalUser.findMany.mockResolvedValue([]);
    mockPrisma.portalUser.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/users?portalType=SUPPLIER');

    expect(res.status).toBe(200);
    expect(mockPrisma.portalUser.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ portalType: 'SUPPLIER' }) })
    );
  });

  it('should handle search', async () => {
    mockPrisma.portalUser.findMany.mockResolvedValue([]);
    mockPrisma.portalUser.count.mockResolvedValue(0);

    const res = await request(app).get('/api/portal/users?search=acme');

    expect(res.status).toBe(200);
  });

  it('should handle server error', async () => {
    mockPrisma.portalUser.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/portal/users');

    expect(res.status).toBe(500);
  });
});

describe('POST /api/portal/users', () => {
  it('should create a portal user', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);
    const user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'new@test.com',
      name: 'New User',
      portalType: 'CUSTOMER',
      role: 'CUSTOMER_USER',
      status: 'PENDING',
    };
    mockPrisma.portalUser.create.mockResolvedValue(user);

    const res = await request(app).post('/api/portal/users').send({
      email: 'new@test.com',
      name: 'New User',
      company: 'Acme',
      role: 'CUSTOMER_USER',
      portalType: 'CUSTOMER',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe('new@test.com');
  });

  it('should return 409 for duplicate email', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/portal/users').send({
      email: 'existing@test.com',
      name: 'User',
      company: 'Acme',
      role: 'CUSTOMER_USER',
      portalType: 'CUSTOMER',
    });

    expect(res.status).toBe(409);
  });

  it('should return 400 for invalid role', async () => {
    const res = await request(app).post('/api/portal/users').send({
      email: 'new@test.com',
      name: 'User',
      company: 'Acme',
      role: 'INVALID',
      portalType: 'CUSTOMER',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/portal/users/invite', () => {
  it('should send an invitation', async () => {
    const invitation = { id: 'inv-1', email: 'invite@test.com', token: 'mock-uuid-token' };
    mockPrisma.portalInvitation.create.mockResolvedValue(invitation);

    const res = await request(app).post('/api/portal/users/invite').send({
      email: 'invite@test.com',
      name: 'Invitee',
      company: 'Acme',
      role: 'SUPPLIER_USER',
      portalType: 'SUPPLIER',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBe('mock-uuid-token');
  });
});

describe('GET /api/portal/users/:id', () => {
  it('should return a user', async () => {
    const user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'user@test.com',
      name: 'User',
    };
    mockPrisma.portalUser.findFirst.mockResolvedValue(user);

    const res = await request(app).get('/api/portal/users/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/portal/users/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/portal/users/:id', () => {
  it('should update a user', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalUser.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Updated',
    });

    const res = await request(app)
      .put('/api/portal/users/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated');
  });

  it('should return 404 if user not found for update', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/portal/users/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/portal/users/:id', () => {
  it('should deactivate a user', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.portalUser.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'INACTIVE',
    });

    const res = await request(app).delete('/api/portal/users/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('INACTIVE');
  });

  it('should return 404 if user not found for delete', async () => {
    mockPrisma.portalUser.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/portal/users/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('Portal Users — extended', () => {
  it('POST /invite returns token in response for SUPPLIER portal type', async () => {
    const invitation = { id: 'inv-2', email: 'supplier2@test.com', token: 'mock-uuid-token' };
    mockPrisma.portalInvitation.create.mockResolvedValue(invitation);

    const res = await request(app).post('/api/portal/users/invite').send({
      email: 'supplier2@test.com',
      name: 'Supplier Two',
      company: 'Suppliers Ltd',
      role: 'SUPPLIER_ADMIN',
      portalType: 'SUPPLIER',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('mock-uuid-token');
  });
});
