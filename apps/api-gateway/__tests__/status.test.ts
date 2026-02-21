import express from 'express';
import request from 'supertest';

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockGetPlatformStatus = jest.fn().mockReturnValue({
  status: 'operational',
  timestamp: new Date().toISOString(),
  services: [
    { name: 'api-gateway', status: 'operational', latencyMs: 5 },
    { name: 'api-quality', status: 'operational', latencyMs: 12 },
    { name: 'api-health-safety', status: 'operational', latencyMs: 8 },
  ],
  uptime: {
    '24h': 99.98,
    '7d': 99.95,
    '30d': 99.91,
  },
  incidents: [],
});

jest.mock('@ims/status', () => ({
  getPlatformStatus: (...args: any[]) => mockGetPlatformStatus(...args),
}));

import statusRouter from '../src/routes/status';

describe('Status Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/health/status', statusRouter);
    jest.clearAllMocks();
    mockGetPlatformStatus.mockReturnValue({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: [
        { name: 'api-gateway', status: 'operational', latencyMs: 5 },
        { name: 'api-quality', status: 'operational', latencyMs: 12 },
      ],
      uptime: { '24h': 99.98, '7d': 99.95, '30d': 99.91 },
      incidents: [],
    });
  });

  describe('GET /api/health/status', () => {
    it('returns platform status (public, no auth required)', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns status field in data', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.body.data).toHaveProperty('status');
      expect(['operational', 'degraded', 'outage']).toContain(res.body.data.status);
    });

    it('returns services array in data', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.body.data).toHaveProperty('services');
      expect(res.body.data.services).toBeInstanceOf(Array);
    });

    it('returns uptime metrics in data', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.body.data).toHaveProperty('uptime');
      expect(res.body.data.uptime).toHaveProperty('24h');
      expect(res.body.data.uptime).toHaveProperty('7d');
      expect(res.body.data.uptime).toHaveProperty('30d');
    });

    it('returns correct status when all services operational', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.body.data.status).toBe('operational');
    });

    it('returns degraded status when some services are down', async () => {
      mockGetPlatformStatus.mockReturnValueOnce({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        services: [
          { name: 'api-gateway', status: 'operational', latencyMs: 5 },
          { name: 'api-quality', status: 'degraded', latencyMs: 500 },
        ],
        uptime: { '24h': 98.5, '7d': 99.0, '30d': 99.5 },
        incidents: [{ id: 'inc-1', title: 'Quality API slow', status: 'investigating' }],
      });
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('degraded');
    });

    it('returns outage status when critical services are down', async () => {
      mockGetPlatformStatus.mockReturnValueOnce({
        status: 'outage',
        timestamp: new Date().toISOString(),
        services: [{ name: 'api-gateway', status: 'outage', latencyMs: null }],
        uptime: { '24h': 95.0, '7d': 99.0, '30d': 99.5 },
        incidents: [{ id: 'inc-2', title: 'Gateway down', status: 'identified' }],
      });
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('outage');
    });

    it('includes timestamp in response', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.body.data).toHaveProperty('timestamp');
    });

    it('returns 500 when getPlatformStatus throws', async () => {
      mockGetPlatformStatus.mockImplementationOnce(() => {
        throw new Error('Status service unavailable');
      });
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('does not require Authorization header', async () => {
      const res = await request(app).get('/api/health/status');
      // No auth needed — public endpoint
      expect(res.status).toBe(200);
    });
  });

  describe('Status — extended', () => {
    it('services array entries have name and status fields', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(res.body.data.services[0]).toHaveProperty('name');
      expect(res.body.data.services[0]).toHaveProperty('status');
    });

    it('uptime 24h value is a number', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(typeof res.body.data.uptime['24h']).toBe('number');
    });

    it('getPlatformStatus is called once per request', async () => {
      await request(app).get('/api/health/status');
      expect(mockGetPlatformStatus).toHaveBeenCalledTimes(1);
    });

    it('success is true on 200 response', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('incidents field is present in data', async () => {
      const res = await request(app).get('/api/health/status');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('incidents');
    });
  });
});
