import express from 'express';
import request from 'supertest';

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockGetPlatformStatus = jest.fn().mockReturnValue({
  status: 'operational',
  timestamp: new Date().toISOString(),
  services: [
    { name: 'api-quality', status: 'operational', latencyMs: 12 },
    { name: 'api-gateway', status: 'operational', latencyMs: 5 },
  ],
  uptime: { '24h': 99.98, '7d': 99.95, '30d': 99.91 },
});

jest.mock('@ims/status', () => ({
  getPlatformStatus: (...args: any[]) => mockGetPlatformStatus(...args),
}));

const mockGenerateOpenApiSpec = jest.fn().mockReturnValue({
  openapi: '3.0.3',
  info: { title: 'Nexara IMS API', version: '1.0.0' },
  paths: {},
});

jest.mock('@ims/openapi', () => ({
  generateOpenApiSpec: (...args: any[]) => mockGenerateOpenApiSpec(...args),
}));

import statusRouter from '../src/routes/status';
import openapiRouter from '../src/routes/openapi';

describe('Status Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/health/status', statusRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/health/status', () => {
    it('returns platform status (public, no auth)', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('status');
      expect(res.body.data).toHaveProperty('services');
      expect(res.body.data).toHaveProperty('uptime');
    });

    it('returns correct status values', async () => {
      const res = await request(app).get('/api/health/status');
      expect(['operational', 'degraded', 'outage']).toContain(res.body.data.status);
    });
  });
});

describe('OpenAPI Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/docs', openapiRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/docs/openapi.json', () => {
    it('returns OpenAPI spec (public, no auth)', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('openapi');
      expect(res.body.openapi).toBe('3.0.3');
    });
  });
});
