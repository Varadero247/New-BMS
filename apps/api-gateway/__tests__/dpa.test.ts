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

const mockGetActiveDpa = jest.fn().mockReturnValue({
  id: 'dpa-1',
  version: '1.0',
  title: 'Data Processing Agreement v1.0',
  content: '<p>DPA Terms</p>',
  isActive: true,
});
const mockAcceptDpa = jest.fn().mockReturnValue({
  id: 'acc-1',
  orgId: 'org-1',
  dpaId: 'dpa-1',
  dpaVersion: '1.0',
  signerName: 'John Smith',
  signerTitle: 'DPO',
  signedAt: new Date().toISOString(),
});
const mockHasAcceptedDpa = jest.fn().mockReturnValue(false);
const mockGetDpaAcceptance = jest.fn().mockReturnValue(null);

jest.mock('@ims/dpa', () => ({
  getActiveDpa: (...args: any[]) => mockGetActiveDpa(...args),
  acceptDpa: (...args: any[]) => mockAcceptDpa(...args),
  hasAcceptedDpa: (...args: any[]) => mockHasAcceptedDpa(...args),
  getDpaAcceptance: (...args: any[]) => mockGetDpaAcceptance(...args),
}));

import dpaRouter from '../src/routes/dpa';

describe('DPA Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/dpa', dpaRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockGetActiveDpa.mockReturnValue({
      id: 'dpa-1',
      version: '1.0',
      title: 'Data Processing Agreement v1.0',
      content: '<p>DPA Terms</p>',
      isActive: true,
    });
    mockAcceptDpa.mockReturnValue({
      id: 'acc-1',
      orgId: 'org-1',
      dpaId: 'dpa-1',
      dpaVersion: '1.0',
      signerName: 'John Smith',
      signerTitle: 'DPO',
      signedAt: new Date().toISOString(),
    });
    mockHasAcceptedDpa.mockReturnValue(false);
    mockGetDpaAcceptance.mockReturnValue(null);
  });

  describe('GET /api/admin/dpa', () => {
    it('returns the active DPA for ADMIN', async () => {
      const res = await request(app).get('/api/admin/dpa');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 'dpa-1');
      expect(res.body.data).toHaveProperty('accepted', false);
    });

    it('returns accepted=true if DPA already accepted', async () => {
      mockHasAcceptedDpa.mockReturnValueOnce(true);
      const res = await request(app).get('/api/admin/dpa');
      expect(res.status).toBe(200);
      expect(res.body.data.accepted).toBe(true);
    });

    it('returns 404 when no active DPA exists', async () => {
      mockGetActiveDpa.mockReturnValueOnce(null);
      const res = await request(app).get('/api/admin/dpa');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 403 for non-ADMIN user', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/api/admin/dpa');
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/admin/dpa/accept', () => {
    it('accepts the active DPA', async () => {
      const res = await request(app)
        .post('/api/admin/dpa/accept')
        .send({ signerName: 'John Smith', signerTitle: 'DPO' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 'acc-1');
    });

    it('rejects missing signerName', async () => {
      const res = await request(app).post('/api/admin/dpa/accept').send({ signerTitle: 'DPO' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects missing signerTitle', async () => {
      const res = await request(app)
        .post('/api/admin/dpa/accept')
        .send({ signerName: 'John Smith' });
      expect(res.status).toBe(400);
    });

    it('returns 409 if DPA already accepted', async () => {
      mockHasAcceptedDpa.mockReturnValueOnce(true);
      const res = await request(app)
        .post('/api/admin/dpa/accept')
        .send({ signerName: 'John Smith', signerTitle: 'DPO' });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('ALREADY_ACCEPTED');
    });

    it('returns 404 if no active DPA to accept', async () => {
      mockAcceptDpa.mockReturnValueOnce(null);
      const res = await request(app)
        .post('/api/admin/dpa/accept')
        .send({ signerName: 'John Smith', signerTitle: 'DPO' });
      expect(res.status).toBe(404);
    });

    it('accepts optional signature field', async () => {
      const res = await request(app)
        .post('/api/admin/dpa/accept')
        .send({ signerName: 'John Smith', signerTitle: 'DPO', signature: 'sig-data' });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/admin/dpa/acceptance', () => {
    it('returns accepted=false when no acceptance exists', async () => {
      const res = await request(app).get('/api/admin/dpa/acceptance');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accepted).toBe(false);
      expect(res.body.data.acceptance).toBeNull();
    });

    it('returns acceptance record when DPA is accepted', async () => {
      const acceptance = {
        id: 'acc-1',
        signedAt: new Date().toISOString(),
        signerName: 'John Smith',
      };
      mockGetDpaAcceptance.mockReturnValueOnce(acceptance);
      const res = await request(app).get('/api/admin/dpa/acceptance');
      expect(res.status).toBe(200);
      expect(res.body.data.accepted).toBe(true);
      expect(res.body.data.acceptance).toHaveProperty('id', 'acc-1');
    });
  });
});
