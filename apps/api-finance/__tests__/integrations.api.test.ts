import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finIntegration: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    finSyncLog: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import integrationsRouter from '../src/routes/integrations';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/integrations', integrationsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// LIST INTEGRATIONS
// ===================================================================

describe('GET /api/integrations', () => {
  it('should return a list of integrations', async () => {
    const integrations = [
      {
        id: 'f5000000-0000-4000-a000-000000000001',
        name: 'Xero Sync',
        provider: 'XERO',
        isActive: true,
        _count: { syncLogs: 15 },
        syncLogs: [
          { id: 'f5100000-0000-4000-a000-000000000001', status: 'SUCCESS', startedAt: new Date() },
        ],
      },
      {
        id: 'f5000000-0000-4000-a000-000000000002',
        name: 'Stripe Payments',
        provider: 'STRIPE',
        isActive: false,
        _count: { syncLogs: 3 },
        syncLogs: [],
      },
    ];
    (prisma as any).finIntegration.findMany.mockResolvedValue(integrations);

    const res = await request(app).get('/api/integrations');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]._count.syncLogs).toBe(15);
  });

  it('should return 500 on error', async () => {
    (prisma as any).finIntegration.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/integrations');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET INTEGRATION DETAILS
// ===================================================================

describe('GET /api/integrations/:id', () => {
  it('should return integration with recent sync logs', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      name: 'Xero Sync',
      provider: 'XERO',
      isActive: true,
      direction: 'BIDIRECTIONAL',
      syncLogs: [
        {
          id: 'f5100000-0000-4000-a000-000000000001',
          status: 'SUCCESS',
          startedAt: new Date(),
          recordsProcessed: 50,
        },
        {
          id: 'f5100000-0000-4000-a000-000000000002',
          status: 'FAILED',
          startedAt: new Date(),
          errorMessage: 'Timeout',
        },
      ],
    });

    const res = await request(app).get('/api/integrations/f5000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('f5000000-0000-4000-a000-000000000001');
    expect(res.body.data.syncLogs).toHaveLength(2);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/integrations/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should return 500 on error', async () => {
    (prisma as any).finIntegration.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/integrations/f5000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// CREATE INTEGRATION
// ===================================================================

describe('POST /api/integrations', () => {
  const validIntegration = {
    provider: 'XERO',
    name: 'Xero Accounting Sync',
    direction: 'BIDIRECTIONAL',
    config: { apiKey: 'xero-key-123', tenantId: 'tenant-abc' },
  };

  it('should create an integration', async () => {
    (prisma as any).finIntegration.create.mockResolvedValue({
      id: 'int-new',
      ...validIntegration,
      isActive: false,
    });

    const res = await request(app).post('/api/integrations').send(validIntegration);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.provider).toBe('XERO');
  });

  it('should create with minimal fields', async () => {
    const minimal = { provider: 'QUICKBOOKS', name: 'QuickBooks' };
    (prisma as any).finIntegration.create.mockResolvedValue({
      id: 'int-new',
      ...minimal,
      direction: 'BIDIRECTIONAL',
      isActive: false,
    });

    const res = await request(app).post('/api/integrations').send(minimal);

    expect(res.status).toBe(201);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app)
      .post('/api/integrations')
      .send({ provider: 'INVALID', name: '' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing name', async () => {
    const res = await request(app).post('/api/integrations').send({ provider: 'XERO' });

    expect(res.status).toBe(400);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finIntegration.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/integrations').send(validIntegration);

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// UPDATE INTEGRATION
// ===================================================================

describe('PUT /api/integrations/:id', () => {
  it('should update an integration', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      name: 'Old Name',
    });
    (prisma as any).finIntegration.update.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      name: 'Updated Xero Sync',
    });

    const res = await request(app)
      .put('/api/integrations/f5000000-0000-4000-a000-000000000001')
      .send({ name: 'Updated Xero Sync' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Xero Sync');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/integrations/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 for validation error', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
    });

    const res = await request(app)
      .put('/api/integrations/f5000000-0000-4000-a000-000000000001')
      .send({ provider: 'INVALID_PROVIDER' });

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// ACTIVATE / DEACTIVATE
// ===================================================================

describe('POST /api/integrations/:id/activate', () => {
  it('should activate an integration', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      isActive: false,
    });
    (prisma as any).finIntegration.update.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      isActive: true,
    });

    const res = await request(app).post(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/activate'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/integrations/00000000-0000-0000-0000-000000000099/activate'
    );

    expect(res.status).toBe(404);
  });

  it('should return 500 on error', async () => {
    (prisma as any).finIntegration.findUnique.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/activate'
    );

    expect(res.status).toBe(500);
  });
});

describe('POST /api/integrations/:id/deactivate', () => {
  it('should deactivate an integration', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      isActive: true,
    });
    (prisma as any).finIntegration.update.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      isActive: false,
    });

    const res = await request(app).post(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/deactivate'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/integrations/00000000-0000-0000-0000-000000000099/deactivate'
    );

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// SYNC TRIGGER
// ===================================================================

describe('POST /api/integrations/:id/sync', () => {
  it('should trigger sync for an active integration', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      isActive: true,
      direction: 'BIDIRECTIONAL',
    });
    (prisma as any).finSyncLog.create.mockResolvedValue({ id: 'log-new', status: 'PENDING' });
    (prisma as any).finIntegration.update.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).post(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/sync'
    );

    expect(res.status).toBe(202);
    expect(res.body.data.message).toContain('Sync job accepted');
    expect(res.body.data.syncLogId).toBe('log-new');
  });

  it('should return 404 when integration not found', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/integrations/00000000-0000-0000-0000-000000000099/sync'
    );

    expect(res.status).toBe(404);
  });

  it('should return 400 when integration is inactive', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      isActive: false,
    });

    const res = await request(app).post(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/sync'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INACTIVE');
  });

  it('should return 500 on error during sync', async () => {
    (prisma as any).finIntegration.findUnique.mockResolvedValue({
      id: 'f5000000-0000-4000-a000-000000000001',
      isActive: true,
      direction: 'BIDIRECTIONAL',
    });
    (prisma as any).finSyncLog.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/sync'
    );

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// SYNC LOGS
// ===================================================================

describe('GET /api/integrations/:id/logs', () => {
  it('should return sync logs for an integration', async () => {
    const logs = [
      {
        id: 'f5100000-0000-4000-a000-000000000001',
        status: 'SUCCESS',
        startedAt: new Date(),
        recordsProcessed: 50,
        completedAt: new Date(),
      },
      {
        id: 'f5100000-0000-4000-a000-000000000002',
        status: 'FAILED',
        startedAt: new Date(),
        errorMessage: 'Connection timeout',
      },
    ];
    (prisma as any).finSyncLog.findMany.mockResolvedValue(logs);
    (prisma as any).finSyncLog.count.mockResolvedValue(2);

    const res = await request(app).get(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/logs'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(2);
  });

  it('should handle pagination', async () => {
    (prisma as any).finSyncLog.findMany.mockResolvedValue([]);
    (prisma as any).finSyncLog.count.mockResolvedValue(50);

    const res = await request(app).get(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/logs?page=3&limit=10'
    );

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('should return empty list when no logs exist', async () => {
    (prisma as any).finSyncLog.findMany.mockResolvedValue([]);
    (prisma as any).finSyncLog.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/logs'
    );

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it('should return 500 on error', async () => {
    (prisma as any).finSyncLog.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(
      '/api/integrations/f5000000-0000-4000-a000-000000000001/logs'
    );

    expect(res.status).toBe(500);
  });
});
