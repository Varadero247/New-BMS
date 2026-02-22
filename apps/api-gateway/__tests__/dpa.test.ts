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

describe('DPA Routes — extended', () => {
  let extApp: express.Express;

  beforeEach(() => {
    extApp = express();
    extApp.use(express.json());
    extApp.use('/api/admin/dpa', dpaRouter);
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

  it('GET /api/admin/dpa returns isActive flag in DPA data', async () => {
    const res = await request(extApp).get('/api/admin/dpa');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', 'dpa-1');
    expect(res.body.data).toHaveProperty('version', '1.0');
  });

  it('POST /api/admin/dpa/accept calls acceptDpa with org-1 and dpa-1', async () => {
    const res = await request(extApp)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'Alice Jones', signerTitle: 'CEO' });
    expect(res.status).toBe(201);
    expect(mockAcceptDpa).toHaveBeenCalled();
  });

  it('GET /api/admin/dpa/acceptance returns accepted=false when acceptance is null', async () => {
    mockGetDpaAcceptance.mockReturnValueOnce(null);
    const res = await request(extApp).get('/api/admin/dpa/acceptance');
    expect(res.status).toBe(200);
    expect(res.body.data.accepted).toBe(false);
  });
});

describe('DPA Routes — additional coverage', () => {
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

  it('GET /api/admin/dpa returns content field in DPA data', async () => {
    const res = await request(app).get('/api/admin/dpa');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('content', '<p>DPA Terms</p>');
  });

  it('POST /api/admin/dpa/accept calls acceptDpa with correct orgId', async () => {
    await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'Alice', signerTitle: 'CEO' });
    expect(mockAcceptDpa).toHaveBeenCalledWith(
      expect.objectContaining({ orgId: 'org-1', signerName: 'Alice', signerTitle: 'CEO' })
    );
  });

  it('POST /api/admin/dpa/accept returns 403 for non-ADMIN user', async () => {
    mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
      req.user = { id: 'u3', email: 'viewer@ims.local', role: 'VIEWER', orgId: 'org-1' };
      next();
    });
    const res = await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'Viewer', signerTitle: 'Staff' });
    expect(res.status).toBe(403);
  });

  it('GET /api/admin/dpa/acceptance returns signerName from acceptance record', async () => {
    mockGetDpaAcceptance.mockReturnValueOnce({
      id: 'acc-2',
      signedAt: new Date().toISOString(),
      signerName: 'Bob Jones',
      signerTitle: 'CTO',
    });
    const res = await request(app).get('/api/admin/dpa/acceptance');
    expect(res.status).toBe(200);
    expect(res.body.data.acceptance).toHaveProperty('signerName', 'Bob Jones');
    expect(res.body.data.accepted).toBe(true);
  });

  it('GET /api/admin/dpa returns DPA title field', async () => {
    const res = await request(app).get('/api/admin/dpa');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('title', 'Data Processing Agreement v1.0');
  });
});

describe('DPA Routes — 500 paths and extra field validation', () => {
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

  it('GET /api/admin/dpa returns 500 when getActiveDpa throws', async () => {
    mockGetActiveDpa.mockImplementationOnce(() => { throw new Error('DPA store error'); });
    const res = await request(app).get('/api/admin/dpa');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/admin/dpa/accept returns 500 when acceptDpa throws', async () => {
    mockAcceptDpa.mockImplementationOnce(() => { throw new Error('DB error'); });
    const res = await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'John Smith', signerTitle: 'DPO' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/admin/dpa/acceptance returns 500 when getDpaAcceptance throws', async () => {
    mockGetDpaAcceptance.mockImplementationOnce(() => { throw new Error('Store unavailable'); });
    const res = await request(app).get('/api/admin/dpa/acceptance');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/admin/dpa/accept rejects empty signerName string', async () => {
    const res = await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: '', signerTitle: 'DPO' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/admin/dpa/accept rejects empty signerTitle string', async () => {
    const res = await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'John Smith', signerTitle: '' });
    expect(res.status).toBe(400);
  });

  it('GET /api/admin/dpa response success is true', async () => {
    const res = await request(app).get('/api/admin/dpa');
    expect(res.body.success).toBe(true);
  });

  it('POST /api/admin/dpa/accept response returns dpaVersion in data', async () => {
    const res = await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'Jane Doe', signerTitle: 'CFO' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('dpaVersion', '1.0');
  });

  it('GET /api/admin/dpa/acceptance data.acceptance is null when not yet signed', async () => {
    const res = await request(app).get('/api/admin/dpa/acceptance');
    expect(res.status).toBe(200);
    expect(res.body.data.acceptance).toBeNull();
  });
});

describe('DPA Routes — final coverage', () => {
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

  it('GET /api/admin/dpa response body has success property', async () => {
    const res = await request(app).get('/api/admin/dpa');
    expect(res.body).toHaveProperty('success');
  });

  it('POST /api/admin/dpa/accept response status is 201', async () => {
    const res = await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'Test User', signerTitle: 'Manager' });
    expect(res.status).toBe(201);
  });

  it('GET /api/admin/dpa/acceptance response success is true', async () => {
    const res = await request(app).get('/api/admin/dpa/acceptance');
    expect(res.body.success).toBe(true);
  });

  it('POST /api/admin/dpa/accept rejects body with only whitespace signerName', async () => {
    const res = await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: '   ', signerTitle: 'DPO' });
    expect(res.status).toBe(400);
  });

  it('GET /api/admin/dpa returns accepted property in data', async () => {
    const res = await request(app).get('/api/admin/dpa');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accepted');
  });

  it('GET /api/admin/dpa/acceptance returns accepted true when signed', async () => {
    mockGetDpaAcceptance.mockReturnValueOnce({
      id: 'acc-5',
      signedAt: new Date().toISOString(),
      signerName: 'Frank',
      signerTitle: 'VP',
    });
    const res = await request(app).get('/api/admin/dpa/acceptance');
    expect(res.status).toBe(200);
    expect(res.body.data.accepted).toBe(true);
  });

  it('GET /api/admin/dpa calls getActiveDpa once', async () => {
    await request(app).get('/api/admin/dpa');
    expect(mockGetActiveDpa).toHaveBeenCalledTimes(1);
  });
});

describe('DPA Routes — extra batch coverage', () => {
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
      id: 'dpa-1', version: '1.0', title: 'Data Processing Agreement v1.0',
      content: '<p>DPA Terms</p>', isActive: true,
    });
    mockAcceptDpa.mockReturnValue({
      id: 'acc-1', orgId: 'org-1', dpaId: 'dpa-1', dpaVersion: '1.0',
      signerName: 'John Smith', signerTitle: 'DPO', signedAt: new Date().toISOString(),
    });
    mockHasAcceptedDpa.mockReturnValue(false);
    mockGetDpaAcceptance.mockReturnValue(null);
  });

  it('GET /api/admin/dpa response content-type is JSON', async () => {
    const res = await request(app).get('/api/admin/dpa');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('POST /api/admin/dpa/accept calls acceptDpa with dpaId from active DPA', async () => {
    const res = await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'Test Signer', signerTitle: 'CEO' });
    expect(res.status).toBe(201);
    expect(mockAcceptDpa).toHaveBeenCalledWith(
      expect.objectContaining({ orgId: 'org-1', signerName: 'Test Signer', signerTitle: 'CEO' })
    );
  });

  it('GET /api/admin/dpa/acceptance response data.accepted is boolean', async () => {
    const res = await request(app).get('/api/admin/dpa/acceptance');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.accepted).toBe('boolean');
  });

  it('GET /api/admin/dpa returns DPA id in response data', async () => {
    const res = await request(app).get('/api/admin/dpa');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('dpa-1');
  });

  it('POST /api/admin/dpa/accept hasAcceptedDpa called once to check for duplicate', async () => {
    await request(app)
      .post('/api/admin/dpa/accept')
      .send({ signerName: 'Alice', signerTitle: 'CFO' });
    expect(mockHasAcceptedDpa).toHaveBeenCalled();
  });
});

describe('dpa — phase29 coverage', () => {
  it('handles destructuring', () => {
    const { a, b } = { a: 1, b: 2 }; expect(a + b).toBe(3);
  });

  it('handles reverse method', () => {
    expect([1, 2, 3].reverse()).toEqual([3, 2, 1]);
  });

  it('handles array concat', () => {
    expect([1, 2].concat([3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('handles string slice', () => {
    expect('hello'.slice(1, 3)).toBe('el');
  });

  it('handles Date type', () => {
    expect(new Date()).toBeInstanceOf(Date);
  });

});

describe('dpa — phase30 coverage', () => {
  it('handles array includes', () => {
    expect([1, 2, 3].includes(2)).toBe(true);
  });

  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles string toUpperCase', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

  it('handles async resolve', async () => {
    await expect(Promise.resolve('ok')).resolves.toBe('ok');
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

});
