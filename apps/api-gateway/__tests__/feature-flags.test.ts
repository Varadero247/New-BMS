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

const mockGetAllFlags = jest.fn().mockReturnValue([]);
const mockGetAllOrgOverrides = jest.fn().mockReturnValue([]);
const mockCreateFlag = jest.fn().mockImplementation((name: string, desc: string, enabled: boolean = false) => ({
  id: 'flag-1', name, description: desc, enabled, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
}));
const mockUpdateFlag = jest.fn().mockReturnValue({ id: 'flag-1', name: 'test_flag', description: 'Updated', enabled: true });
const mockDeleteFlag = jest.fn().mockReturnValue(true);
const mockSetOrgOverride = jest.fn().mockReturnValue({ id: 'ov-1', orgId: 'org-1', flagName: 'test_flag', enabled: true });
const mockRemoveOrgOverride = jest.fn().mockReturnValue(true);
const mockSeedInitialFlags = jest.fn().mockReturnValue([]);
const mockIsEnabled = jest.fn().mockResolvedValue(false);
const mockGetAll = jest.fn().mockResolvedValue({});

jest.mock('@ims/feature-flags', () => ({
  getAllFlags: (...args: any[]) => mockGetAllFlags(...args),
  getOrgOverrides: jest.fn().mockReturnValue([]),
  getAllOrgOverrides: (...args: any[]) => mockGetAllOrgOverrides(...args),
  createFlag: (...args: any[]) => mockCreateFlag(...args),
  updateFlag: (...args: any[]) => mockUpdateFlag(...args),
  deleteFlag: (...args: any[]) => mockDeleteFlag(...args),
  setOrgOverride: (...args: any[]) => mockSetOrgOverride(...args),
  removeOrgOverride: (...args: any[]) => mockRemoveOrgOverride(...args),
  seedInitialFlags: (...args: any[]) => mockSeedInitialFlags(...args),
  isEnabled: (...args: any[]) => mockIsEnabled(...args),
  getAll: (...args: any[]) => mockGetAll(...args),
  invalidateCache: jest.fn(),
}));

import featureFlagsRouter from '../src/routes/feature-flags';

describe('Feature Flags Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api', featureFlagsRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/feature-flags', () => {
    it('returns all flags', async () => {
      mockGetAllFlags.mockReturnValue([
        { id: 'f1', name: 'workflow_visual_builder', description: 'Visual builder', enabled: false },
      ]);
      mockGetAllOrgOverrides.mockReturnValue([{ orgId: 'org-1', flagName: 'workflow_visual_builder', enabled: true }]);

      const res = await request(app).get('/api/admin/feature-flags');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/admin/feature-flags', () => {
    it('creates a new flag', async () => {
      const res = await request(app)
        .post('/api/admin/feature-flags')
        .send({ name: 'test_flag', description: 'A test flag' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockCreateFlag).toHaveBeenCalled();
    });

    it('rejects invalid flag name', async () => {
      const res = await request(app)
        .post('/api/admin/feature-flags')
        .send({ name: 'Invalid Name!', description: 'Bad' });
      expect(res.status).toBe(400);
    });

    it('rejects missing description', async () => {
      const res = await request(app)
        .post('/api/admin/feature-flags')
        .send({ name: 'valid_name' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/admin/feature-flags/:name', () => {
    it('updates a flag', async () => {
      const res = await request(app)
        .put('/api/admin/feature-flags/test_flag')
        .send({ enabled: true });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when flag not found', async () => {
      mockUpdateFlag.mockReturnValueOnce(null);
      const res = await request(app)
        .put('/api/admin/feature-flags/nonexistent')
        .send({ enabled: true });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/admin/feature-flags/:name', () => {
    it('deletes a flag', async () => {
      const res = await request(app).delete('/api/admin/feature-flags/test_flag');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when flag not found', async () => {
      mockDeleteFlag.mockReturnValueOnce(false);
      const res = await request(app).delete('/api/admin/feature-flags/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/admin/feature-flags/:name/orgs/:orgId', () => {
    it('sets an org override', async () => {
      const res = await request(app)
        .put('/api/admin/feature-flags/test_flag/orgs/org-1')
        .send({ enabled: true });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing enabled field', async () => {
      const res = await request(app)
        .put('/api/admin/feature-flags/test_flag/orgs/org-1')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/admin/feature-flags/:name/orgs/:orgId', () => {
    it('removes an org override', async () => {
      const res = await request(app).delete('/api/admin/feature-flags/test_flag/orgs/org-1');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/feature-flags/check', () => {
    it('checks a single flag', async () => {
      mockIsEnabled.mockResolvedValueOnce(true);
      const res = await request(app).get('/api/feature-flags/check?name=test_flag');
      expect(res.status).toBe(200);
      expect(res.body.data.enabled).toBe(true);
    });

    it('rejects missing name param', async () => {
      const res = await request(app).get('/api/feature-flags/check');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/feature-flags', () => {
    it('returns all flags for current org', async () => {
      mockGetAll.mockResolvedValue({ test_flag: true, another: false });
      const res = await request(app).get('/api/feature-flags');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Auth enforcement', () => {
    it('admin routes require ADMIN role', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/api/admin/feature-flags');
      expect(res.status).toBe(403);
    });
  });
});
