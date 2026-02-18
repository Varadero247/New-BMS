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
    req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'test@test.com', role: 'ADMIN', orgId: '00000000-0000-4000-a000-000000000100' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import sodMatrixRouter from '../src/routes/sod-matrix';
import { prisma } from '../src/prisma';

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
    (prisma as any).finSodRule.findMany.mockResolvedValue(rules);

    const res = await request(app).get('/api/sod-matrix');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('should filter by orgId from the authenticated user', async () => {
    (prisma as any).finSodRule.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/sod-matrix');

    expect(res.status).toBe(200);
    expect((prisma as any).finSodRule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: '00000000-0000-4000-a000-000000000100', deletedAt: null }),
      })
    );
  });

  it('should return an empty array when no rules exist', async () => {
    (prisma as any).finSodRule.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/sod-matrix');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finSodRule.findMany.mockRejectedValue(new Error('DB error'));

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
    (prisma as any).finSodRule.create.mockResolvedValue({
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
    (prisma as any).finSodRule.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validRule,
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    await request(app).post('/api/sod-matrix').send(validRule);

    expect((prisma as any).finSodRule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          orgId: '00000000-0000-4000-a000-000000000100',
          createdBy: '00000000-0000-0000-0000-000000000001',
        }),
      })
    );
  });

  it('should return 500 on create error', async () => {
    (prisma as any).finSodRule.create.mockRejectedValue(new Error('Validation failed'));

    const res = await request(app).post('/api/sod-matrix').send(validRule);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should include the request body fields in the created record', async () => {
    (prisma as any).finSodRule.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      ...validRule,
      orgId: '00000000-0000-4000-a000-000000000100',
    });

    const res = await request(app).post('/api/sod-matrix').send(validRule);

    expect(res.status).toBe(201);
    expect((prisma as any).finSodRule.create).toHaveBeenCalledWith(
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
