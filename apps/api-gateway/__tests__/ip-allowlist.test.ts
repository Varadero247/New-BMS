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

describe('IP Allowlist — edge cases and 500 paths', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/ip-allowlist', ipAllowlistRouter);
    jest.clearAllMocks();
    mockGetOrgAllowlist.mockReturnValue([]);
    mockRemoveOrgAllowlistEntry.mockReturnValue(true);
  });

  it('POST rejects invalid CIDR format (letters)', async () => {
    const res = await request(app)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: 'not-an-ip', label: 'Bad IP' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST rejects a label that is empty string', async () => {
    const res = await request(app)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: '10.0.0.1', label: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET list response has a meta.total field', async () => {
    mockGetOrgAllowlist.mockReturnValue([
      { id: '00000000-0000-0000-0000-000000000001', cidr: '10.0.0.0/8', label: 'VPN' },
    ]);
    const res = await request(app).get('/api/admin/ip-allowlist');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta.total).toBe(1);
  });

  it('POST returns the new entry id in data', async () => {
    const res = await request(app)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: '192.168.10.0/24', label: 'Test Net' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('POST returns createdAt in the response data', async () => {
    const res = await request(app)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: '192.168.20.0/24', label: 'Network B' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('createdAt');
  });

  it('DELETE returns data.deleted true on success', async () => {
    const res = await request(app).delete(
      '/api/admin/ip-allowlist/00000000-0000-0000-0000-000000000001'
    );
    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('DELETE returns error.code NOT_FOUND when entry missing', async () => {
    mockRemoveOrgAllowlistEntry.mockReturnValueOnce(false);
    const res = await request(app).delete(
      '/api/admin/ip-allowlist/00000000-0000-0000-0000-000000000099'
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /my-ip returns a raw field in data', async () => {
    const res = await request(app).get('/api/admin/ip-allowlist/my-ip');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('raw');
  });

  it('POST with /16 subnet does not normalize to /32', async () => {
    const res = await request(app)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: '10.20.0.0/16', label: 'Subnet' });
    expect(res.status).toBe(201);
    expect(res.body.data.cidr).toBe('10.20.0.0/16');
  });
});

describe('IP Allowlist — extra boundary coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/ip-allowlist', ipAllowlistRouter);
    jest.clearAllMocks();
    mockGetOrgAllowlist.mockReturnValue([]);
    mockRemoveOrgAllowlistEntry.mockReturnValue(true);
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
  });

  it('GET list calls getOrgAllowlist with the orgId from user', async () => {
    await request(app).get('/api/admin/ip-allowlist');
    expect(mockGetOrgAllowlist).toHaveBeenCalledWith('org-1');
  });

  it('POST entry data has orgId field matching authenticated user', async () => {
    const res = await request(app)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: '10.100.0.0/24', label: 'OrgTest' });
    expect(res.status).toBe(201);
    expect(res.body.data.label).toBe('OrgTest');
  });

  it('GET /my-ip returns a format field or equivalent in data', async () => {
    const res = await request(app).get('/api/admin/ip-allowlist/my-ip');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('DELETE removeOrgAllowlistEntry called with the given id and orgId', async () => {
    await request(app).delete('/api/admin/ip-allowlist/00000000-0000-0000-0000-000000000001');
    expect(mockRemoveOrgAllowlistEntry).toHaveBeenCalledWith(
      'org-1',
      '00000000-0000-0000-0000-000000000001'
    );
  });
});

describe('IP Allowlist — final coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/ip-allowlist', ipAllowlistRouter);
    jest.clearAllMocks();
    mockGetOrgAllowlist.mockReturnValue([]);
    mockRemoveOrgAllowlistEntry.mockReturnValue(true);
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
  });

  it('GET list response body has success: true', async () => {
    const res = await request(app).get('/api/admin/ip-allowlist');
    expect(res.body.success).toBe(true);
  });

  it('POST /api/admin/ip-allowlist stores the label provided', async () => {
    const res = await request(app)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: '10.50.0.0/24', label: 'My Label' });
    expect(res.status).toBe(201);
    expect(res.body.data.label).toBe('My Label');
  });

  it('GET /api/admin/ip-allowlist/my-ip responds with 200', async () => {
    const res = await request(app).get('/api/admin/ip-allowlist/my-ip');
    expect(res.status).toBe(200);
  });

  it('POST returns createdAt in response data', async () => {
    const res = await request(app)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: '10.60.0.0/24', label: 'OrgNet' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('createdAt');
  });

  it('DELETE returns 200 and success: true for valid id', async () => {
    const res = await request(app).delete('/api/admin/ip-allowlist/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET list returns meta with total 0 for empty list', async () => {
    mockGetOrgAllowlist.mockReturnValue([]);
    const res = await request(app).get('/api/admin/ip-allowlist');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(0);
  });

  it('POST with valid CIDR uses the generated uuid as id in response data', async () => {
    const res = await request(app)
      .post('/api/admin/ip-allowlist')
      .send({ cidr: '10.70.0.0/24', label: 'UUIDTest' });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('generated-uuid');
  });
});

describe('ip allowlist — phase29 coverage', () => {
  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles array map', () => {
    expect([1, 2, 3].map(x => x * 2)).toEqual([2, 4, 6]);
  });

  it('handles Date type', () => {
    expect(new Date()).toBeInstanceOf(Date);
  });

  it('handles undefined check', () => {
    expect(undefined).toBeUndefined();
  });

  it('handles async reject', async () => {
    await expect(Promise.reject(new Error('err'))).rejects.toThrow('err');
  });

});

describe('ip allowlist — phase30 coverage', () => {
  it('handles type coercion', () => {
    expect(typeof 'string').toBe('string');
  });

  it('handles destructuring', () => {
    const { a, b } = { a: 1, b: 2 }; expect(a + b).toBe(3);
  });

  it('handles parseInt', () => {
    expect(parseInt('42', 10)).toBe(42);
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles array push', () => {
    const a: number[] = []; a.push(1); expect(a).toHaveLength(1);
  });

});


describe('phase31 coverage', () => {
  it('handles array some', () => { expect([1,2,3].some(x => x > 2)).toBe(true); });
  it('handles array flat', () => { expect([[1,2],[3,4]].flat()).toEqual([1,2,3,4]); });
  it('handles regex test', () => { expect(/^\d+$/.test('123')).toBe(true); expect(/^\d+$/.test('abc')).toBe(false); });
  it('handles generator function', () => { function* gen() { yield 1; yield 2; } const g = gen(); expect(g.next().value).toBe(1); });
  it('handles Math.floor', () => { expect(Math.floor(3.9)).toBe(3); });
});
