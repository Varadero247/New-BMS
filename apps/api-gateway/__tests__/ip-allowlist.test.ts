import express from 'express';
import request from 'supertest';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
  next();
});

const mockRequireRole = jest.fn((...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN' } });
    }
    next();
  };
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  requireRole: (...args: any[]) => mockRequireRole(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

const mockGetOrgAllowlist = jest.fn().mockReturnValue([]);
const mockAddOrgAllowlistEntry = jest.fn();
const mockRemoveOrgAllowlistEntry = jest.fn().mockReturnValue(true);

jest.mock('../src/middleware/ipAllowlist', () => ({
  ipAllowlistMiddleware: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  getOrgAllowlist: (...args: any[]) => mockGetOrgAllowlist(...args),
  addOrgAllowlistEntry: (...args: any[]) => mockAddOrgAllowlistEntry(...args),
  removeOrgAllowlistEntry: (...args: any[]) => mockRemoveOrgAllowlistEntry(...args),
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('generated-uuid'),
}));

import ipAllowlistRouter from '../src/routes/ip-allowlist';

describe('IP Allowlist Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/ip-allowlist', ipAllowlistRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/ip-allowlist', () => {
    it('lists allowlist entries', async () => {
      mockGetOrgAllowlist.mockReturnValue([
        { id: '00000000-0000-0000-0000-000000000001', cidr: '10.0.0.0/8', label: 'VPN' },
      ]);
      const res = await request(app).get('/api/admin/ip-allowlist');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/admin/ip-allowlist', () => {
    it('adds a CIDR entry', async () => {
      const res = await request(app)
        .post('/api/admin/ip-allowlist')
        .send({ cidr: '192.168.1.0/24', label: 'Office Network' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('normalizes bare IP to /32', async () => {
      const res = await request(app)
        .post('/api/admin/ip-allowlist')
        .send({ cidr: '203.0.113.42', label: 'Single IP' });
      expect(res.status).toBe(201);
      expect(res.body.data.cidr).toBe('203.0.113.42/32');
    });

    it('rejects missing label', async () => {
      const res = await request(app).post('/api/admin/ip-allowlist').send({ cidr: '10.0.0.0/8' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/admin/ip-allowlist/:id', () => {
    it('removes an entry', async () => {
      const res = await request(app).delete(
        '/api/admin/ip-allowlist/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent', async () => {
      mockRemoveOrgAllowlistEntry.mockReturnValueOnce(false);
      const res = await request(app).delete(
        '/api/admin/ip-allowlist/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/admin/ip-allowlist/my-ip', () => {
    it('returns caller IP', async () => {
      const res = await request(app).get('/api/admin/ip-allowlist/my-ip');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('ip');
    });
  });

  describe('Auth enforcement', () => {
    it('CRUD requires ADMIN role', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/api/admin/ip-allowlist');
      expect(res.status).toBe(403);
    });
  });

  describe('IP Allowlist — extended', () => {
    it('GET list returns success true', async () => {
      const res = await request(app).get('/api/admin/ip-allowlist');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET list returns data as array', async () => {
      const res = await request(app).get('/api/admin/ip-allowlist');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('my-ip returns an ip field', async () => {
      const res = await request(app).get('/api/admin/ip-allowlist/my-ip');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('ip');
    });
  });

  describe('IP Allowlist — further extended', () => {
    it('POST returns 201 on valid CIDR entry', async () => {
      const res = await request(app)
        .post('/api/admin/ip-allowlist')
        .send({ cidr: '10.10.0.0/16', label: 'Internal' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('DELETE success is true', async () => {
      const res = await request(app).delete(
        '/api/admin/ip-allowlist/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('addOrgAllowlistEntry is called once per POST', async () => {
      await request(app)
        .post('/api/admin/ip-allowlist')
        .send({ cidr: '172.16.0.0/12', label: 'Private Range' });
      expect(mockAddOrgAllowlistEntry).toHaveBeenCalledTimes(1);
    });

    it('bare IP normalises to /32 CIDR', async () => {
      const res = await request(app)
        .post('/api/admin/ip-allowlist')
        .send({ cidr: '8.8.8.8', label: 'Google DNS' });
      expect(res.status).toBe(201);
      expect(res.body.data.cidr).toBe('8.8.8.8/32');
    });
  });
});


describe('IP Allowlist — additional coverage', () => {
  let appExtra: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default return values after clearAllMocks
    mockGetOrgAllowlist.mockReturnValue([]);
    mockRemoveOrgAllowlistEntry.mockReturnValue(true);

    const express = require('express');
    appExtra = express();
    appExtra.use(express.json());
    const ipAllowlistRouter = require('../src/routes/ip-allowlist').default;
    appExtra.use('/api/admin/ip-allowlist', ipAllowlistRouter);
  });

  it('GET returns an empty list when no entries exist', async () => {
    const request = require('supertest');
    mockGetOrgAllowlist.mockReturnValue([]);
    const res = await request(appExtra).get('/api/admin/ip-allowlist');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET returns multiple entries with cidr and label fields', async () => {
    const request = require('supertest');
    mockGetOrgAllowlist.mockReturnValue([
      { id: '00000000-0000-0000-0000-000000000001', cidr: '10.0.0.0/8', label: 'VPN' },
      { id: '00000000-0000-0000-0000-000000000002', cidr: '192.168.0.0/16', label: 'Office' },
    ]);
    const res = await request(appExtra).get('/api/admin/ip-allowlist');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0]).toHaveProperty('cidr');
    expect(res.body.data[0]).toHaveProperty('label');
  });

  it('POST rejects a request with missing cidr field', async () => {
    const request = require('supertest');
    const res = await request(appExtra)
      .post('/api/admin/ip-allowlist')
      .send({ label: 'No CIDR' });
    expect(res.status).toBe(400);
  });

  it('POST calls addOrgAllowlistEntry exactly once with the entry data', async () => {
    const request = require('supertest');
    await request(appExtra)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: '172.16.0.0/12', label: 'Private' });
    expect(mockAddOrgAllowlistEntry).toHaveBeenCalledTimes(1);
  });

  it('DELETE returns 404 when removeOrgAllowlistEntry returns false', async () => {
    const request = require('supertest');
    mockRemoveOrgAllowlistEntry.mockReturnValueOnce(false);
    const res = await request(appExtra).delete(
      '/api/admin/ip-allowlist/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
  });
});
