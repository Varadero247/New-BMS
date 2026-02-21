import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finSodRule: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@test.com',
      role: 'ADMIN',
      orgId: '00000000-0000-4000-a000-000000000100',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import sodMatrixRouter from '../src/routes/sod-matrix';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/sod-matrix', sodMatrixRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/sod-matrix — List SoD rules
// ===================================================================
describe('GET /api/sod-matrix', () => {
  it('should return a list of SoD rules', async () => {
    const rules = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        roleA: 'Accounts Payable',
        roleB: 'Payment Approval',
        conflictLevel: 'HIGH',
        orgId: '00000000-0000-4000-a000-000000000100',
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        roleA: 'Purchase Order Creation',
        roleB: 'Goods Receipt',
        conflictLevel: 'MEDIUM',
        orgId: '00000000-0000-4000-a000-000000000100',
      },
    ];
    mockPrisma.finSodRule.findMany.mockResolvedValue(rules);

    const res = await request(app).get('/api/sod-matrix');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should filter by orgId from the authenticated user', async () => {
    mockPrisma.finSodRule.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/sod-matrix');

    expect(res.status).toBe(200);
    expect(mockPrisma.finSodRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          orgId: '00000000-0000-4000-a000-000000000100',
          deletedAt: null,
        }),
      })
    );
  });

  it('should return an empty array when no rules exist', async () => {
    mockPrisma.finSodRule.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/sod-matrix');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finSodRule.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/sod-matrix');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// POST /api/sod-matrix — Create SoD rule
// ===================================================================
describe('POST /api/sod-matrix', () => {
  const validRule = {
    role1: 'Accounts Payable',
    role2: 'Payment Approval',
    conflictType: 'HIGH',
    description: 'Prevents single person from creating and approving payments',
    mitigatingControl: 'Dual approval required for payments above £1,000',
  };

  it('should create a SoD rule successfully', async () => {
    mockPrisma.finSodRule.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validRule,
      orgId: '00000000-0000-4000-a000-000000000100',
      createdBy: '00000000-0000-0000-0000-000000000001',
    });

    const res = await request(app).post('/api/sod-matrix').send(validRule);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role1).toBe('Accounts Payable');
  });

  it('should set orgId and createdBy from authenticated user', async () => {
    mockPrisma.finSodRule.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validRule,
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    await request(app).post('/api/sod-matrix').send(validRule);

    expect(mockPrisma.finSodRule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: '00000000-0000-4000-a000-000000000100',
          createdBy: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('should return 500 on create error', async () => {
    mockPrisma.finSodRule.create.mockRejectedValue(new Error('Validation failed'));

    const res = await request(app).post('/api/sod-matrix').send(validRule);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should include the request body fields in the created record', async () => {
    mockPrisma.finSodRule.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validRule,
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/sod-matrix').send(validRule);

    expect(res.status).toBe(201);
    expect(mockPrisma.finSodRule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role1: 'Accounts Payable',
          role2: 'Payment Approval',
          conflictType: 'HIGH',
        }),
      })
    );
  });
});

describe('SoD Matrix — extended', () => {
  it('GET data is an array', async () => {
    mockPrisma.finSodRule.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/sod-matrix');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('findMany called once per GET request', async () => {
    mockPrisma.finSodRule.findMany.mockResolvedValue([]);
    await request(app).get('/api/sod-matrix');
    expect(mockPrisma.finSodRule.findMany).toHaveBeenCalledTimes(1);
  });

  it('create called once per POST request', async () => {
    const validRule = { role1: 'AP', role2: 'Approval', conflictType: 'HIGH', description: 'desc', mitigatingControl: 'dual' };
    mockPrisma.finSodRule.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', ...validRule });
    await request(app).post('/api/sod-matrix').send(validRule);
    expect(mockPrisma.finSodRule.create).toHaveBeenCalledTimes(1);
  });
});

describe('SoD Matrix — further extended', () => {
  it('GET success is true on 200', async () => {
    mockPrisma.finSodRule.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/sod-matrix');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST success is true on 201', async () => {
    const rule = { role1: 'Cashier', role2: 'Controller', conflictType: 'MEDIUM', description: 'Cash control', mitigatingControl: 'Review' };
    mockPrisma.finSodRule.create.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000002', ...rule });
    const res = await request(app).post('/api/sod-matrix').send(rule);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('data length matches the number of mock rules returned', async () => {
    mockPrisma.finSodRule.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', roleA: 'R1', roleB: 'R2', conflictLevel: 'HIGH' },
      { id: '00000000-0000-0000-0000-000000000002', roleA: 'R3', roleB: 'R4', conflictLevel: 'LOW' },
    ]);
    const res = await request(app).get('/api/sod-matrix');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET returns 500 and INTERNAL_ERROR on DB failure', async () => {
    mockPrisma.finSodRule.findMany.mockRejectedValue(new Error('DB unreachable'));
    const res = await request(app).get('/api/sod-matrix');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});


// ===================================================================
// SoD Matrix — additional coverage (5 new tests)
// ===================================================================
describe('SoD Matrix — additional coverage', () => {
  const validRule = {
    role1: 'Treasury Manager',
    role2: 'Bank Reconciliation',
    conflictType: 'HIGH',
    description: 'Prevents treasury manager from self-reconciling',
    mitigatingControl: 'Independent reconciliation review required',
  };

  it('GET / response has a success property equal to true', async () => {
    mockPrisma.finSodRule.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/sod-matrix');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('GET / data array length matches number returned by findMany', async () => {
    mockPrisma.finSodRule.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000010', roleA: 'AP', roleB: 'GL', conflictLevel: 'HIGH' },
      { id: '00000000-0000-0000-0000-000000000011', roleA: 'Treasury', roleB: 'Payments', conflictLevel: 'MEDIUM' },
      { id: '00000000-0000-0000-0000-000000000012', roleA: 'PO', roleB: 'GRN', conflictLevel: 'LOW' },
    ]);
    const res = await request(app).get('/api/sod-matrix');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('POST / includes mitigatingControl in the create data', async () => {
    mockPrisma.finSodRule.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000013',
      ...validRule,
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    await request(app).post('/api/sod-matrix').send(validRule);
    expect(mockPrisma.finSodRule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mitigatingControl: 'Independent reconciliation review required',
        }),
      })
    );
  });

  it('POST / response data has id field after successful creation', async () => {
    mockPrisma.finSodRule.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000014',
      ...validRule,
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    const res = await request(app).post('/api/sod-matrix').send(validRule);
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id', '00000000-0000-0000-0000-000000000014');
  });

  it('POST / passes description field to create data', async () => {
    mockPrisma.finSodRule.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000015',
      ...validRule,
      orgId: '00000000-0000-4000-a000-000000000100',
    });
    await request(app).post('/api/sod-matrix').send(validRule);
    expect(mockPrisma.finSodRule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: 'Prevents treasury manager from self-reconciling',
        }),
      })
    );
  });
});
