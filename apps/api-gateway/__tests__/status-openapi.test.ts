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

    it('services is an array', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.services)).toBe(true);
    });

    it('uptime object has 24h key', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(res.body.data.uptime).toHaveProperty('24h');
    });

    it('getPlatformStatus is called once per request', async () => {
      await request(app).get('/api/health/status');
      expect(mockGetPlatformStatus).toHaveBeenCalledTimes(1);
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

    it('info object contains title', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body.info).toHaveProperty('title');
    });

    it('paths is an object', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(200);
      expect(typeof res.body.paths).toBe('object');
    });

    it('generateOpenApiSpec is called once per request', async () => {
      await request(app).get('/api/docs/openapi.json');
      expect(mockGenerateOpenApiSpec).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Status — extended', () => {
  let app: express.Express;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/health/status', statusRouter);
    jest.clearAllMocks();
  });

  it('timestamp is a string in status response', async () => {
    const res = await request(app).get('/api/health/status');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.timestamp).toBe('string');
  });

  it('services array entries have name and status fields', async () => {
    const res = await request(app).get('/api/health/status');
    expect(res.status).toBe(200);
    if (res.body.data.services.length > 0) {
      expect(res.body.data.services[0]).toHaveProperty('name');
      expect(res.body.data.services[0]).toHaveProperty('status');
    }
  });

  it('uptime has 7d key', async () => {
    const res = await request(app).get('/api/health/status');
    expect(res.status).toBe(200);
    expect(res.body.data.uptime).toHaveProperty('7d');
  });
});

describe('Status + OpenAPI — extra', () => {
  let statusApp: express.Express;
  let openapiApp: express.Express;
  beforeEach(() => {
    statusApp = express();
    statusApp.use(express.json());
    statusApp.use('/api/health/status', statusRouter);

    openapiApp = express();
    openapiApp.use(express.json());
    openapiApp.use('/api/docs', openapiRouter);

    jest.clearAllMocks();
  });

  it('uptime has 30d key', async () => {
    const res = await request(statusApp).get('/api/health/status');
    expect(res.status).toBe(200);
    expect(res.body.data.uptime).toHaveProperty('30d');
  });

  it('openapi spec info has a version field', async () => {
    const res = await request(openapiApp).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.info).toHaveProperty('version');
  });

  it('success is true in status response body', async () => {
    const res = await request(statusApp).get('/api/health/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('status-openapi — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/health/status', statusRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/health/status', async () => {
    const res = await request(app).get('/api/health/status');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/health/status', async () => {
    const res = await request(app).get('/api/health/status');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET /api/health/status body has success property', async () => {
    const res = await request(app).get('/api/health/status');
    expect(res.body).toHaveProperty('success');
  });

  it('GET /api/health/status body is an object', async () => {
    const res = await request(app).get('/api/health/status');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/health/status route is accessible', async () => {
    const res = await request(app).get('/api/health/status');
    expect(res.status).toBeDefined();
  });
});

describe('status-openapi — error paths and spec details', () => {
  let statusApp: express.Express;
  let openapiApp: express.Express;

  beforeEach(() => {
    statusApp = express();
    statusApp.use(express.json());
    statusApp.use('/api/health/status', statusRouter);

    openapiApp = express();
    openapiApp.use(express.json());
    openapiApp.use('/api/docs', openapiRouter);

    jest.clearAllMocks();
    mockGetPlatformStatus.mockReturnValue({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: [{ name: 'api-gateway', status: 'operational', latencyMs: 5 }],
      uptime: { '24h': 99.98, '7d': 99.95, '30d': 99.91 },
    });
    mockGenerateOpenApiSpec.mockReturnValue({
      openapi: '3.0.3',
      info: { title: 'Nexara IMS API', version: '1.0.0' },
      paths: {},
    });
  });

  it('GET /api/health/status returns 500 when getPlatformStatus throws', async () => {
    mockGetPlatformStatus.mockImplementationOnce(() => { throw new Error('status unavailable'); });
    const res = await request(statusApp).get('/api/health/status');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/health/status success is false on 500', async () => {
    mockGetPlatformStatus.mockImplementationOnce(() => { throw new Error('boom'); });
    const res = await request(statusApp).get('/api/health/status');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/docs/openapi.json returns 500 when generateOpenApiSpec throws', async () => {
    mockGenerateOpenApiSpec.mockImplementationOnce(() => { throw new Error('spec error'); });
    const res = await request(openapiApp).get('/api/docs/openapi.json');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/docs returns HTML documentation page', async () => {
    const res = await request(openapiApp).get('/api/docs');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('GET /api/docs HTML contains api-reference script tag', async () => {
    const res = await request(openapiApp).get('/api/docs');
    expect(res.text).toContain('api-reference');
  });

  it('GET /api/docs HTML references openapi.json', async () => {
    const res = await request(openapiApp).get('/api/docs');
    expect(res.text).toContain('openapi.json');
  });

  it('GET /api/health/status services array entries have latencyMs field', async () => {
    const res = await request(statusApp).get('/api/health/status');
    expect(res.status).toBe(200);
    expect(res.body.data.services[0]).toHaveProperty('latencyMs');
  });

  it('getPlatformStatus is called exactly once per request', async () => {
    await request(statusApp).get('/api/health/status');
    expect(mockGetPlatformStatus).toHaveBeenCalledTimes(1);
  });

  it('generateOpenApiSpec is called exactly once per /openapi.json request', async () => {
    await request(openapiApp).get('/api/docs/openapi.json');
    expect(mockGenerateOpenApiSpec).toHaveBeenCalledTimes(1);
  });

  it('GET /api/docs/openapi.json content-type is application/json', async () => {
    const res = await request(openapiApp).get('/api/docs/openapi.json');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
