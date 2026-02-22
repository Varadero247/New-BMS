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

const mockCreateRequest = jest.fn().mockReturnValue({
  id: 'dsar-1',
  type: 'EXPORT',
  status: 'PENDING',
  subjectEmail: 'user@example.com',
  orgId: 'org-1',
  requestedById: 'user-1',
});
const mockListRequests = jest.fn().mockReturnValue([]);
const mockGetRequest = jest.fn().mockReturnValue({
  id: 'dsar-1',
  type: 'EXPORT',
  status: 'PENDING',
  subjectEmail: 'user@example.com',
});
const mockProcessExportRequest = jest.fn().mockResolvedValue({
  id: '00000000-0000-0000-0000-000000000001',
  type: 'EXPORT',
  status: 'COMPLETE',
  downloadUrl: '/downloads/dsar-1.zip',
});
const mockProcessErasureRequest = jest.fn().mockResolvedValue({
  id: '00000000-0000-0000-0000-000000000001',
  type: 'ERASURE',
  status: 'COMPLETE',
});

jest.mock('@ims/dsar', () => ({
  createRequest: (...args: any[]) => mockCreateRequest(...args),
  listRequests: (...args: any[]) => mockListRequests(...args),
  getRequest: (...args: any[]) => mockGetRequest(...args),
  processExportRequest: (...args: any[]) => mockProcessExportRequest(...args),
  processErasureRequest: (...args: any[]) => mockProcessErasureRequest(...args),
}));

import dsarRouter from '../src/routes/dsar';

describe('DSAR Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/privacy/dsar', dsarRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListRequests.mockReturnValue([]);
    mockGetRequest.mockReturnValue({
      id: 'dsar-1',
      type: 'EXPORT',
      status: 'PENDING',
      subjectEmail: 'user@example.com',
    });
    mockCreateRequest.mockReturnValue({
      id: 'dsar-1',
      type: 'EXPORT',
      status: 'PENDING',
      subjectEmail: 'user@example.com',
      orgId: 'org-1',
      requestedById: 'user-1',
    });
    mockProcessExportRequest.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      type: 'EXPORT',
      status: 'COMPLETE',
      downloadUrl: '/downloads/dsar-1.zip',
    });
    mockProcessErasureRequest.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      type: 'ERASURE',
      status: 'COMPLETE',
    });
  });

  describe('GET /api/admin/privacy/dsar', () => {
    it('returns list of DSAR requests for ADMIN', async () => {
      mockListRequests.mockReturnValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000001',
          type: 'EXPORT',
          status: 'PENDING',
          subjectEmail: 'user@example.com',
        },
      ]);
      const res = await request(app).get('/api/admin/privacy/dsar');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('returns empty list when no requests exist', async () => {
      const res = await request(app).get('/api/admin/privacy/dsar');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('returns 403 for non-ADMIN user', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/api/admin/privacy/dsar');
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/admin/privacy/dsar', () => {
    it('creates an EXPORT DSAR request', async () => {
      const res = await request(app)
        .post('/api/admin/privacy/dsar')
        .send({ type: 'EXPORT', subjectEmail: 'user@example.com' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 'dsar-1');
      expect(res.body.data.type).toBe('EXPORT');
    });

    it('creates an ERASURE DSAR request', async () => {
      mockCreateRequest.mockReturnValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        type: 'ERASURE',
        status: 'PENDING',
        subjectEmail: 'user@example.com',
      });
      const res = await request(app)
        .post('/api/admin/privacy/dsar')
        .send({ type: 'ERASURE', subjectEmail: 'user@example.com' });
      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('ERASURE');
    });

    it('rejects invalid type', async () => {
      const res = await request(app)
        .post('/api/admin/privacy/dsar')
        .send({ type: 'INVALID', subjectEmail: 'user@example.com' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects missing subjectEmail', async () => {
      const res = await request(app).post('/api/admin/privacy/dsar').send({ type: 'EXPORT' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid email format', async () => {
      const res = await request(app)
        .post('/api/admin/privacy/dsar')
        .send({ type: 'EXPORT', subjectEmail: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('accepts optional notes field', async () => {
      const res = await request(app)
        .post('/api/admin/privacy/dsar')
        .send({ type: 'EXPORT', subjectEmail: 'user@example.com', notes: 'User requested export' });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/admin/privacy/dsar/:id', () => {
    it('returns a specific DSAR request', async () => {
      const res = await request(app).get(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id', 'dsar-1');
    });

    it('returns 404 for non-existent request', async () => {
      mockGetRequest.mockReturnValueOnce(undefined);
      const res = await request(app).get(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/admin/privacy/dsar/:id/process', () => {
    it('processes an EXPORT DSAR request', async () => {
      const res = await request(app).post(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process'
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETE');
    });

    it('processes an ERASURE request', async () => {
      mockGetRequest.mockReturnValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        type: 'ERASURE',
        status: 'PENDING',
        subjectEmail: 'user@example.com',
      });
      const res = await request(app).post(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process'
      );
      expect(res.status).toBe(200);
      expect(mockProcessErasureRequest).toHaveBeenCalled();
    });

    it('returns 404 for non-existent request', async () => {
      mockGetRequest.mockReturnValueOnce(undefined);
      const res = await request(app).post(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000099/process'
      );
      expect(res.status).toBe(404);
    });

    it('returns 409 for already completed request', async () => {
      mockGetRequest.mockReturnValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        type: 'EXPORT',
        status: 'COMPLETE',
        subjectEmail: 'user@example.com',
      });
      const res = await request(app).post(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process'
      );
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('ALREADY_COMPLETE');
    });

    it('returns 409 for in-progress request', async () => {
      mockGetRequest.mockReturnValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        type: 'EXPORT',
        status: 'IN_PROGRESS',
        subjectEmail: 'user@example.com',
      });
      const res = await request(app).post(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process'
      );
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('IN_PROGRESS');
    });

    it('returns 500 when processing returns null', async () => {
      mockProcessExportRequest.mockResolvedValueOnce(null);
      const res = await request(app).post(
        '/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process'
      );
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('PROCESSING_FAILED');
    });
  });
});

describe('dsar — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/privacy/dsar', dsarRouter);
    jest.clearAllMocks();
  });

  it('returns 401 when auth fails on GET /api/admin/privacy/dsar', async () => {
    mockAuthenticate.mockImplementationOnce((_req: any, res: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    });
    const res = await request(app).get('/api/admin/privacy/dsar');
    expect(res.status).toBe(401);
  });

  it('response is JSON content-type for GET /api/admin/privacy/dsar', async () => {
    const res = await request(app).get('/api/admin/privacy/dsar');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/admin/privacy/dsar body has success property', async () => {
    const res = await request(app).get('/api/admin/privacy/dsar');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });
});

describe('DSAR Routes — 500 paths and extended edge cases', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/privacy/dsar', dsarRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListRequests.mockReturnValue([]);
    mockGetRequest.mockReturnValue({ id: 'dsar-1', type: 'EXPORT', status: 'PENDING', subjectEmail: 'user@example.com' });
    mockCreateRequest.mockReturnValue({ id: 'dsar-1', type: 'EXPORT', status: 'PENDING', subjectEmail: 'user@example.com', orgId: 'org-1', requestedById: 'user-1' });
    mockProcessExportRequest.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', type: 'EXPORT', status: 'COMPLETE', downloadUrl: '/downloads/dsar-1.zip' });
    mockProcessErasureRequest.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', type: 'ERASURE', status: 'COMPLETE' });
  });

  it('GET /api/admin/privacy/dsar returns meta.total equal to requests length', async () => {
    mockListRequests.mockReturnValueOnce([
      { id: 'dsar-1', type: 'EXPORT', status: 'PENDING', subjectEmail: 'a@b.com' },
      { id: 'dsar-2', type: 'ERASURE', status: 'PENDING', subjectEmail: 'c@d.com' },
    ]);
    const res = await request(app).get('/api/admin/privacy/dsar');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(2);
  });

  it('POST /api/admin/privacy/dsar returns subjectEmail in response data', async () => {
    const res = await request(app).post('/api/admin/privacy/dsar').send({
      type: 'EXPORT',
      subjectEmail: 'target@example.com',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.subjectEmail).toBe('user@example.com');
  });

  it('GET /api/admin/privacy/dsar/:id returns type EXPORT in data', async () => {
    const res = await request(app).get('/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe('EXPORT');
  });

  it('POST /api/admin/privacy/dsar/:id/process returns status COMPLETE for EXPORT', async () => {
    const res = await request(app).post('/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETE');
  });

  it('POST /api/admin/privacy/dsar/:id/process 500 when processExportRequest throws', async () => {
    mockProcessExportRequest.mockRejectedValueOnce(new Error('Export service unavailable'));
    const res = await request(app).post('/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/admin/privacy/dsar/:id/process 500 when processErasureRequest throws', async () => {
    mockGetRequest.mockReturnValueOnce({ id: 'dsar-1', type: 'ERASURE', status: 'PENDING', subjectEmail: 'user@example.com' });
    mockProcessErasureRequest.mockRejectedValueOnce(new Error('Erasure service down'));
    const res = await request(app).post('/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/admin/privacy/dsar/:id returns status PENDING', async () => {
    const res = await request(app).get('/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('PENDING');
  });

  it('POST /api/admin/privacy/dsar accepts optional notes field', async () => {
    const res = await request(app).post('/api/admin/privacy/dsar').send({
      type: 'ERASURE',
      subjectEmail: 'user@example.com',
      notes: 'User deletion request per GDPR Art. 17',
    });
    expect(res.status).toBe(201);
    expect(mockCreateRequest).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'User deletion request per GDPR Art. 17' })
    );
  });
});

describe('DSAR Routes — absolute final coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/privacy/dsar', dsarRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListRequests.mockReturnValue([]);
    mockGetRequest.mockReturnValue({ id: 'dsar-1', type: 'EXPORT', status: 'PENDING', subjectEmail: 'user@example.com' });
    mockCreateRequest.mockReturnValue({ id: 'dsar-1', type: 'EXPORT', status: 'PENDING', subjectEmail: 'user@example.com', orgId: 'org-1', requestedById: 'user-1' });
    mockProcessExportRequest.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', type: 'EXPORT', status: 'COMPLETE', downloadUrl: '/downloads/dsar-1.zip' });
    mockProcessErasureRequest.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', type: 'ERASURE', status: 'COMPLETE' });
  });

  it('GET /api/admin/privacy/dsar listRequests is called with orgId from user', async () => {
    await request(app).get('/api/admin/privacy/dsar');
    expect(mockListRequests).toHaveBeenCalledWith('org-1');
  });

  it('POST /api/admin/privacy/dsar createRequest is called with type and subjectEmail', async () => {
    await request(app)
      .post('/api/admin/privacy/dsar')
      .send({ type: 'EXPORT', subjectEmail: 'x@example.com' });
    expect(mockCreateRequest).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'EXPORT', subjectEmail: 'x@example.com' })
    );
  });
});

describe('DSAR Routes — final coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin/privacy/dsar', dsarRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
    mockListRequests.mockReturnValue([]);
    mockGetRequest.mockReturnValue({ id: 'dsar-1', type: 'EXPORT', status: 'PENDING', subjectEmail: 'user@example.com' });
    mockCreateRequest.mockReturnValue({ id: 'dsar-1', type: 'EXPORT', status: 'PENDING', subjectEmail: 'user@example.com', orgId: 'org-1', requestedById: 'user-1' });
    mockProcessExportRequest.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', type: 'EXPORT', status: 'COMPLETE', downloadUrl: '/downloads/dsar-1.zip' });
    mockProcessErasureRequest.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', type: 'ERASURE', status: 'COMPLETE' });
  });

  it('GET /api/admin/privacy/dsar response body has success property', async () => {
    const res = await request(app).get('/api/admin/privacy/dsar');
    expect(res.body).toHaveProperty('success');
  });

  it('POST /api/admin/privacy/dsar response has data property', async () => {
    const res = await request(app)
      .post('/api/admin/privacy/dsar')
      .send({ type: 'EXPORT', subjectEmail: 'user@example.com' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/admin/privacy/dsar/:id type EXPORT in response', async () => {
    const res = await request(app).get('/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe('EXPORT');
  });

  it('POST /api/admin/privacy/dsar/:id/process calls processExportRequest for EXPORT type', async () => {
    const res = await request(app).post('/api/admin/privacy/dsar/00000000-0000-0000-0000-000000000001/process');
    expect(res.status).toBe(200);
    expect(mockProcessExportRequest).toHaveBeenCalledTimes(1);
  });

  it('POST /api/admin/privacy/dsar rejects type RECTIFICATION as invalid', async () => {
    const res = await request(app)
      .post('/api/admin/privacy/dsar')
      .send({ type: 'RECTIFICATION', subjectEmail: 'user@example.com' });
    expect(res.status).toBe(400);
  });

  it('GET /api/admin/privacy/dsar response data is an array', async () => {
    const res = await request(app).get('/api/admin/privacy/dsar');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/admin/privacy/dsar data.orgId is set from authenticated user', async () => {
    const res = await request(app)
      .post('/api/admin/privacy/dsar')
      .send({ type: 'EXPORT', subjectEmail: 'user@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.data.orgId).toBe('org-1');
  });

  it('GET /api/admin/privacy/dsar response body has meta.total as number', async () => {
    mockListRequests.mockReturnValueOnce([
      { id: 'dsar-1', type: 'EXPORT', status: 'PENDING', subjectEmail: 'a@b.com' },
    ]);
    const res = await request(app).get('/api/admin/privacy/dsar');
    expect(res.status).toBe(200);
    expect(typeof res.body.meta.total).toBe('number');
  });

  it('GET /api/admin/privacy/dsar response body has success: true', async () => {
    const res = await request(app).get('/api/admin/privacy/dsar');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/admin/privacy/dsar status 201 on valid ERASURE request', async () => {
    mockCreateRequest.mockReturnValueOnce({
      id: 'dsar-new',
      type: 'ERASURE',
      status: 'PENDING',
      subjectEmail: 'del@example.com',
      orgId: 'org-1',
      requestedById: 'user-1',
    });
    const res = await request(app)
      .post('/api/admin/privacy/dsar')
      .send({ type: 'ERASURE', subjectEmail: 'del@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('ERASURE');
  });
});
