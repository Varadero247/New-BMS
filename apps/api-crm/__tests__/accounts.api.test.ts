import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    crmAccount: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    crmContact: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    crmDeal: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/service-auth', () => ({
  createServiceHeaders: jest.fn(() => ({ 'X-Service-Token': 'mock-token' })),
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

import accountsRouter from '../src/routes/accounts';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/accounts', accountsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const mockAccount = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Acme Corp',
  type: 'CUSTOMER',
  industry: 'Manufacturing',
  website: 'https://acme.com',
  phone: '+1234567890',
  email: 'info@acme.com',
  annualRevenue: 5000000,
  employeeCount: 200,
  tags: ['enterprise'],
  qualitySupplierScore: 85,
  openNCRCount: 2,
  openComplaintCount: 1,
  createdBy: 'user-123',
  updatedBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// ===================================================================
// POST /api/accounts
// ===================================================================

describe('POST /api/accounts', () => {
  it('should create an account with valid data', async () => {
    mockPrisma.crmAccount.create.mockResolvedValue(mockAccount);

    const res = await request(app).post('/api/accounts').send({
      name: 'Acme Corp',
      type: 'CUSTOMER',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Acme Corp');
  });

  it('should create an account with all optional fields', async () => {
    mockPrisma.crmAccount.create.mockResolvedValue(mockAccount);

    const res = await request(app)
      .post('/api/accounts')
      .send({
        name: 'Acme Corp',
        type: 'CUSTOMER',
        industry: 'Manufacturing',
        website: 'https://acme.com',
        phone: '+1234567890',
        email: 'info@acme.com',
        annualRevenue: 5000000,
        employeeCount: 200,
        tags: ['enterprise'],
        qualitySupplierScore: 85,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for missing name', async () => {
    const res = await request(app).post('/api/accounts').send({
      type: 'CUSTOMER',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing type', async () => {
    const res = await request(app).post('/api/accounts').send({
      name: 'Acme Corp',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for empty name', async () => {
    const res = await request(app).post('/api/accounts').send({
      name: '',
      type: 'CUSTOMER',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for empty type', async () => {
    const res = await request(app).post('/api/accounts').send({
      name: 'Acme Corp',
      type: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmAccount.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/accounts').send({
      name: 'Acme Corp',
      type: 'CUSTOMER',
    });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/accounts
// ===================================================================

describe('GET /api/accounts', () => {
  it('should return paginated list', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([mockAccount]);
    mockPrisma.crmAccount.count.mockResolvedValue(1);

    const res = await request(app).get('/api/accounts');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should return empty array when no accounts', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([]);
    mockPrisma.crmAccount.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should search by name', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([]);
    mockPrisma.crmAccount.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts?search=acme');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'acme' }) }),
          ]),
        }),
      })
    );
  });

  it('should filter by type', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([]);
    mockPrisma.crmAccount.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts?type=PROSPECT');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'PROSPECT' }),
      })
    );
  });

  it('should filter by tags', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([]);
    mockPrisma.crmAccount.count.mockResolvedValue(0);

    const res = await request(app).get('/api/accounts?tags=enterprise,vip');

    expect(res.status).toBe(200);
    expect(mockPrisma.crmAccount.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tags: { hasSome: ['enterprise', 'vip'] } }),
      })
    );
  });

  it('should handle pagination', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([]);
    mockPrisma.crmAccount.count.mockResolvedValue(100);

    const res = await request(app).get('/api/accounts?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.totalPages).toBe(10);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmAccount.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/accounts');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/accounts/:id
// ===================================================================

describe('GET /api/accounts/:id', () => {
  it('should return account detail', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);

    const res = await request(app).get('/api/accounts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/accounts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// PUT /api/accounts/:id
// ===================================================================

describe('PUT /api/accounts/:id', () => {
  it('should update account', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    mockPrisma.crmAccount.update.mockResolvedValue({ ...mockAccount, name: 'Acme Inc' });

    const res = await request(app)
      .put('/api/accounts/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Acme Inc' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Acme Inc');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/accounts/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should update multiple fields', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    mockPrisma.crmAccount.update.mockResolvedValue({
      ...mockAccount,
      name: 'New Name',
      industry: 'Technology',
    });

    const res = await request(app).put('/api/accounts/00000000-0000-0000-0000-000000000001').send({
      name: 'New Name',
      industry: 'Technology',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    mockPrisma.crmAccount.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/accounts/00000000-0000-0000-0000-000000000001')
      .send({ name: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// DELETE /api/accounts/:id
// ===================================================================

describe('DELETE /api/accounts/:id', () => {
  it('should soft delete account', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    mockPrisma.crmAccount.update.mockResolvedValue({ ...mockAccount, deletedAt: new Date() });

    const res = await request(app).delete('/api/accounts/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('Account deleted');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/accounts/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/accounts/:id/contacts
// ===================================================================

describe('GET /api/accounts/:id/contacts', () => {
  it('should return contacts for account', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    mockPrisma.crmContact.findMany.mockResolvedValue([
      { id: 'c-1', firstName: 'John', lastName: 'Doe', email: 'john@acme.com' },
    ]);

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000001/contacts'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return empty array when no contacts', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    mockPrisma.crmContact.findMany.mockResolvedValue([]);

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000001/contacts'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 404 when account not found', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000099/contacts'
    );

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/accounts/:id/deals
// ===================================================================

describe('GET /api/accounts/:id/deals', () => {
  it('should return deals for account', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { id: 'd-1', title: 'Enterprise Deal', value: 50000 },
    ]);

    const res = await request(app).get('/api/accounts/00000000-0000-0000-0000-000000000001/deals');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return empty array when no deals', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/accounts/00000000-0000-0000-0000-000000000001/deals');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 404 when account not found', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/accounts/00000000-0000-0000-0000-000000000099/deals');

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// GET /api/accounts/:id/compliance
// ===================================================================

describe('GET /api/accounts/:id/compliance', () => {
  it('should return compliance data with LOW risk', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Acme Corp',
      qualitySupplierScore: 90,
      openNCRCount: 1,
      openComplaintCount: 0,
    });

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000001/compliance'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.riskLevel).toBe('LOW');
    expect(res.body.data.qualitySupplierScore).toBe(90);
  });

  it('should return MEDIUM risk for moderate issues', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Acme Corp',
      qualitySupplierScore: 70,
      openNCRCount: 2,
      openComplaintCount: 1,
    });

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000001/compliance'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.riskLevel).toBe('MEDIUM');
  });

  it('should return HIGH risk for many issues', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Acme Corp',
      qualitySupplierScore: 40,
      openNCRCount: 4,
      openComplaintCount: 3,
    });

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000001/compliance'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.riskLevel).toBe('HIGH');
  });

  it('should return 404 when account not found', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000099/compliance'
    );

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// Additional coverage
// ===================================================================

describe('CRM Accounts — additional coverage', () => {
  it('GET / returns content-type application/json', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([]);
    mockPrisma.crmAccount.count.mockResolvedValue(0);
    const res = await request(app).get('/api/accounts');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET / data is an array', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([]);
    mockPrisma.crmAccount.count.mockResolvedValue(0);
    const res = await request(app).get('/api/accounts');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('DELETE /:id returns 500 on database error', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    mockPrisma.crmAccount.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/accounts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('GET / response has success:true on 200', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([]);
    mockPrisma.crmAccount.count.mockResolvedValue(0);
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /:id response data has name property when found', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);
    const res = await request(app).get('/api/accounts/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name');
  });
});

// ===================================================================
// GET /api/accounts/:id/invoices
// ===================================================================

describe('GET /api/accounts/:id/invoices', () => {
  it('should return invoices from Finance service', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);

    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [{ id: 'inv-1', amount: 1000 }] }),
    } as Response);

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000001/invoices'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta.source).toBe('finance-service');
    fetchMock.mockRestore();
  });

  it('should return empty array when Finance service is unavailable', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(mockAccount);

    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
    } as Response);

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000001/invoices'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.source).toBe('finance-unavailable');
    fetchMock.mockRestore();
  });

  it('should return 404 when account not found', async () => {
    mockPrisma.crmAccount.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/accounts/00000000-0000-0000-0000-000000000099/invoices'
    );

    expect(res.status).toBe(404);
  });
});
