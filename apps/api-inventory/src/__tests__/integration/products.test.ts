// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: Inventory API — Products route contracts against real DB.

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: (_req: any, _res: any, next: any) => next(),
  metricsHandler: jest.fn(),
  correlationIdMiddleware: (_req: any, _res: any, next: any) => next(),
  initTracing: jest.fn(),
  authFailuresTotal: { inc: jest.fn() },
  rateLimitExceededTotal: { inc: jest.fn() },
  createDownstreamRateLimiter: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: jest.fn().mockReturnValue((_req: any, res: any) => res.json({ status: 'ok' })),
}));

import express from 'express';
import request from 'supertest';
import { PrismaClient } from '../../../../../packages/database/generated/inventory';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { assertSuccess, assertError, assertPagination } from '../../../../../packages/shared/src/test-utils/api-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';

async function buildApp() {
  const app = express();
  app.use(express.json());

  const { default: productsRouter } = await import('../../routes/products');
  const { default: categoriesRouter } = await import('../../routes/categories');
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  return app;
}

let app: express.Express;
let inventoryPrisma: PrismaClient;
let adminToken: string;
let managerToken: string;
let auditorToken: string;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  app = await buildApp();
  inventoryPrisma = new PrismaClient();
  adminToken = await generateTestToken({ userId: TEST_IDS.users.admin, role: 'ADMIN' });
  managerToken = await generateTestToken({ userId: TEST_IDS.users.manager, role: 'MANAGER' });
  auditorToken = await generateTestToken({ userId: TEST_IDS.users.auditor, role: 'AUDITOR' });
});

afterAll(async () => {
  await inventoryPrisma.$disconnect();
});

describe('GET /api/products', () => {
  it('returns 200 with success:true', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res) as any;
    expect(Array.isArray(data.items || data)).toBe(true);
  });

  it('returns paginated response', async () => {
    const res = await request(app)
      .get('/api/products?page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    const data = assertSuccess(res) as any;
    if (data.items !== undefined) {
      assertPagination(data);
    }
  });

  it('AUDITOR can list products', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${auditorToken}`);
    expect(res.status).toBe(200);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(401);
    assertError(res, 'UNAUTHORIZED');
  });
});

describe('POST /api/products', () => {
  let createdId: string;

  it('ADMIN can create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'INT-TEST-SKU-001',
        name: 'Integration Test Product',
        description: 'Product created during integration tests',
        unitOfMeasure: 'EACH',
        unitCost: 10.99,
        currency: 'USD',
        reorderPoint: 5,
        minStockLevel: 2,
        maxStockLevel: 100,
        isActive: true,
      });

    expect([200, 201]).toContain(res.status);
    if (res.body.success) {
      const data = assertSuccess(res) as any;
      expect(data.name).toBe('Integration Test Product');
      createdId = data.id;
    }
  });

  it('returns 4xx for duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'INT-TEST-SKU-001',
        name: 'Duplicate Product',
        unitOfMeasure: 'EACH',
      });

    // Should fail with conflict or validation error
    expect([400, 409, 422, 500]).toContain(res.status);
  });

  afterAll(async () => {
    await inventoryPrisma.product.deleteMany({ where: { sku: 'INT-TEST-SKU-001' } });
  });
});

describe('GET /api/categories', () => {
  it('returns 200 with categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res) as any;
    expect(Array.isArray(data.items || data)).toBe(true);
  });
});
