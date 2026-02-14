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
      mockGetOrgAllowlist.mockReturnValue([{ id: 'ip-1', cidr: '10.0.0.0/8', label: 'VPN' }]);
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
      const res = await request(app)
        .post('/api/admin/ip-allowlist')
        .send({ cidr: '10.0.0.0/8' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/admin/ip-allowlist/:id', () => {
    it('removes an entry', async () => {
      const res = await request(app).delete('/api/admin/ip-allowlist/ip-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent', async () => {
      mockRemoveOrgAllowlistEntry.mockReturnValueOnce(false);
      const res = await request(app).delete('/api/admin/ip-allowlist/nonexistent');
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
});
