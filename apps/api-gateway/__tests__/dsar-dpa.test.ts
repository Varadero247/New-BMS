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

// DSAR mocks — exact names from @ims/dsar
const mockCreateRequest = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001',
  type: 'EXPORT',
  status: 'PENDING',
  subjectEmail: 'user@example.com',
});
const mockListRequests = jest.fn().mockReturnValue([]);
const mockGetRequest = jest.fn().mockReturnValue({
  id: '00000000-0000-0000-0000-000000000001',
  type: 'EXPORT',
  status: 'PENDING',
});
const mockProcessExportRequest = jest.fn().mockResolvedValue({
  id: '00000000-0000-0000-0000-000000000001',
  status: 'COMPLETE',
  downloadUrl: '/downloads/dsar-1.zip',
});
const mockProcessErasureRequest = jest
  .fn()
  .mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETE' });
const mockUpdateRequest = jest
  .fn()
  .mockReturnValue({ id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS' });

jest.mock('@ims/dsar', () => ({
  createRequest: (...args: any[]) => mockCreateRequest(...args),
  listRequests: (...args: any[]) => mockListRequests(...args),
  getRequest: (...args: any[]) => mockGetRequest(...args),
  processExportRequest: (...args: any[]) => mockProcessExportRequest(...args),
  processErasureRequest: (...args: any[]) => mockProcessErasureRequest(...args),
  updateRequest: (...args: any[]) => mockUpdateRequest(...args),
}));

// DPA mocks — exact names from @ims/dpa
const mockGetActiveDpa = jest.fn().mockReturnValue({
  id: 'dpa-1',
  version: '1.0',
  title: 'DPA v1',
  content: '<p>Terms</p>',
  isActive: true,
});
const mockAcceptDpa = jest.fn().mockReturnValue({
  id: 'acc-1',
  orgId: 'org-1',
  dpaId: 'dpa-1',
  signedAt: new Date().toISOString(),
});
const mockGetDpaAcceptance = jest.fn().mockReturnValue(null);
const mockHasAcceptedDpa = jest.fn().mockReturnValue(false);
const mockGetDpaById = jest.fn().mockReturnValue({ id: 'dpa-1', version: '1.0' });

jest.mock('@ims/dpa', () => ({
  getActiveDpa: (...args: any[]) => mockGetActiveDpa(...args),
  acceptDpa: (...args: any[]) => mockAcceptDpa(...args),
  getDpaAcceptance: (...args: any[]) => mockGetDpaAcceptance(...args),
  hasAcceptedDpa: (...args: any[]) => mockHasAcceptedDpa(...args),
  getDpaById: (...args: any[]) => mockGetDpaById(...args),
}));

import dsarRouter from '../src/routes/dsar';
import dpaRouter from '../src/routes/dpa';

describe('DSAR Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/privacy/dsar', dsarRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/privacy/dsar', () => {
    it('lists DSAR requests', async () => {
      const res = await request(app).get('/api/admin/privacy/dsar');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/admin/privacy/dsar', () => {
    it('creates a DSAR request', async () => {
      const res = await request(app).post('/api/admin/privacy/dsar').send({
        type: 'EXPORT',
        subjectEmail: 'user@example.com',
        reason: 'User requested data export',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects invalid type', async () => {
      const res = await request(app)
        .post('/api/admin/privacy/dsar')
        .send({ type: 'INVALID', subjectEmail: 'user@example.com', reason: 'Test' });
      expect(res.status).toBe(400);
    });

    it('rejects missing email', async () => {
      const res = await request(app)
        .post('/api/admin/privacy/dsar')
        .send({ type: 'EXPORT', reason: 'Test' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/privacy/dsar/:id', () => {
    it('returns a DSAR request', async () => {
      const res = await request(app).get(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent', async () => {
      mockGetRequest.mockReturnValueOnce(undefined);
      const res = await request(app).get(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/admin/privacy/dsar/:id/process', () => {
    it('processes a DSAR request', async () => {
      const res = await request(app).post(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Auth enforcement', () => {
    it('requires ADMIN role', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/api/admin/privacy/dsar');
      expect(res.status).toBe(403);
    });
  });
});

describe('DPA Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/dpa', dpaRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/admin/dpa', () => {
    it('returns active DPA', async () => {
      const res = await request(app).get('/api/admin/dpa');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/admin/dpa/accept', () => {
    it('accepts the DPA', async () => {
      const res = await request(app)
        .post('/api/admin/dpa/accept')
        .send({ signerName: 'John Smith', signerTitle: 'DPO' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects missing signer name', async () => {
      const res = await request(app).post('/api/admin/dpa/accept').send({ signerTitle: 'DPO' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/admin/dpa/acceptance', () => {
    it('returns acceptance status', async () => {
      mockGetDpaAcceptance.mockReturnValueOnce({ id: 'acc-1', signedAt: new Date().toISOString() });
      const res = await request(app).get('/api/admin/dpa/acceptance');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

describe('DSAR + DPA — extended', () => {
  let dsarApp: express.Express;
  let dpaApp: express.Express;

  beforeEach(() => {
    dsarApp = express();
    dsarApp.use(express.json());
    dsarApp.use('/api/admin/privacy/dsar', dsarRouter);

    dpaApp = express();
    dpaApp.use(express.json());
    dpaApp.use('/api/admin/dpa', dpaRouter);

    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockGetActiveDpa.mockReturnValue({
      id: 'dpa-1',
      version: '1.0',
      title: 'DPA v1',
      content: '<p>Terms</p>',
      isActive: true,
    });
    mockAcceptDpa.mockReturnValue({
      id: 'acc-1',
      orgId: 'org-1',
      dpaId: 'dpa-1',
      signedAt: new Date().toISOString(),
    });
    mockGetDpaAcceptance.mockReturnValue(null);
    mockHasAcceptedDpa.mockReturnValue(false);
  });

  it('POST /dsar with ERASURE type creates a request', async () => {
    mockCreateRequest.mockReturnValueOnce({
      id: '00000000-0000-0000-0000-000000000002',
      type: 'ERASURE',
      status: 'PENDING',
      subjectEmail: 'erase@example.com',
    });
    const res = await request(dsarApp).post('/api/admin/privacy/dsar').send({
      type: 'ERASURE',
      subjectEmail: 'erase@example.com',
      reason: 'User requested deletion',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('GET /dpa/acceptance returns accepted=true when acceptance record exists', async () => {
    mockGetDpaAcceptance.mockReturnValueOnce({
      id: 'acc-1',
      signedAt: new Date().toISOString(),
      signerName: 'Bob',
    });
    const res = await request(dpaApp).get('/api/admin/dpa/acceptance');
    expect(res.status).toBe(200);
    expect(res.body.data.accepted).toBe(true);
    expect(res.body.data.acceptance).toHaveProperty('id', 'acc-1');
  });

  it('POST /dpa/accept returns 409 when DPA already accepted', async () => {
    mockHasAcceptedDpa.mockReturnValueOnce(true);
    const res = await request(dpaApp)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'Jane Doe', signerTitle: 'CTO' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_ACCEPTED');
  });
});
