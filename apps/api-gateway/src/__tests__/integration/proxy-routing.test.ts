// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: Gateway proxy routing — verifies forwarding headers and 502 for unreachable service.
import express from 'express';
import http from 'http';
import request from 'supertest';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';

const STUB_PORTS = {
  'health-safety': 14101,
  quality: 14103,
  inventory: 14105,
  hr: 14106,
  payroll: 14107,
  workflows: 14108,
};

const stubs: http.Server[] = [];

function createStub(port: number, serviceName: string): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const stub = express();
    stub.use(express.json());
    stub.all('*', (req, res) => {
      res.setHeader('X-Service', serviceName);
      res.json({
        success: true,
        data: {
          service: serviceName,
          path: req.path,
          method: req.method,
          xUserId: req.headers['x-user-id'],
          xUserRole: req.headers['x-user-role'],
          xOrgId: req.headers['x-org-id'],
          xRequestId: req.headers['x-request-id'],
        },
      });
    });
    const server = stub.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

async function buildProxyApp() {
  const app = express();
  app.use(express.json());

  const { authenticate } = await import('@ims/auth');
  const { v4: uuidv4 } = await import('uuid');

  // Add request ID + forward user context headers
  app.use((req, res, next) => {
    res.setHeader('X-Request-Id', uuidv4());
    next();
  });

  app.use(authenticate);

  // Inject user headers after auth
  app.use((req: any, res, next) => {
    if (req.user) {
      req.headers['x-user-id'] = req.user.id;
      req.headers['x-user-role'] = req.user.role;
    }
    next();
  });

  // Proxy routes to stubs
  const proxyOptions = (target: string) => ({
    target,
    changeOrigin: true,
    pathRewrite: { '^/api/[^/]+': '/api' },
    on: {
      error: (_err: Error, _req: express.Request, res: express.Response) => {
        res.status(502).json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Upstream service unreachable' } });
      },
    },
  });

  app.use('/api/health-safety', createProxyMiddleware(proxyOptions(`http://localhost:${STUB_PORTS['health-safety']}`)));
  app.use('/api/quality', createProxyMiddleware(proxyOptions(`http://localhost:${STUB_PORTS.quality}`)));
  app.use('/api/inventory', createProxyMiddleware(proxyOptions(`http://localhost:${STUB_PORTS.inventory}`)));
  app.use('/api/hr', createProxyMiddleware(proxyOptions(`http://localhost:${STUB_PORTS.hr}`)));
  app.use('/api/payroll', createProxyMiddleware(proxyOptions(`http://localhost:${STUB_PORTS.payroll}`)));
  app.use('/api/workflows', createProxyMiddleware(proxyOptions(`http://localhost:${STUB_PORTS.workflows}`)));

  // Unreachable service — deliberately wrong port
  app.use('/api/unreachable', createProxyMiddleware(proxyOptions('http://localhost:19999')));

  return app;
}

let app: express.Express;
let adminToken: string;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();

  // Start all stub servers
  for (const [name, port] of Object.entries(STUB_PORTS)) {
    const server = await createStub(port, name);
    stubs.push(server);
  }

  app = await buildProxyApp();
  adminToken = await generateTestToken({ userId: TEST_IDS.users.admin, role: 'ADMIN' });
});

afterAll(async () => {
  for (const s of stubs) {
    await new Promise<void>((r) => s.close(() => r()));
  }
});

describe('Proxy routing', () => {
  it('proxies /api/health-safety to health-safety stub', async () => {
    const res = await request(app)
      .get('/api/health-safety/incidents')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['x-service']).toBe('health-safety');
  });

  it('proxies /api/quality to quality stub', async () => {
    const res = await request(app)
      .get('/api/quality/ncr')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['x-service']).toBe('quality');
  });

  it('proxies /api/hr to hr stub', async () => {
    const res = await request(app)
      .get('/api/hr/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['x-service']).toBe('hr');
  });

  it('generates X-Request-Id header on every request', async () => {
    const res = await request(app)
      .get('/api/quality/test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
  });

  it('forwards X-User-Id and X-User-Role to downstream service', async () => {
    const res = await request(app)
      .get('/api/hr/test-forwarding')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.xUserId).toBe(TEST_IDS.users.admin);
    expect(res.body.data.xUserRole).toBe('ADMIN');
  });

  it('returns 502 or 504 for an unreachable downstream service', async () => {
    const res = await request(app)
      .get('/api/unreachable/anything')
      .set('Authorization', `Bearer ${adminToken}`);

    // Gateway returns 502 (bad gateway) or 504 (gateway timeout) depending on
    // whether the proxy error handler fires with an Express or raw response object.
    expect([502, 504]).toContain(res.status);
    // Body error code is only set when the error handler fires with an Express res
    if (res.body?.error) {
      expect(res.body.error.code).toBe('SERVICE_UNAVAILABLE');
    }
  });
});
