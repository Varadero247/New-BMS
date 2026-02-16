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

import samlRouter from '../src/routes/saml';

describe('SAML Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/', samlRouter);
    jest.clearAllMocks();
    mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
      req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-1' };
      next();
    });
  });

  describe('GET /auth/saml/metadata', () => {
    it('returns SP metadata XML (public, no auth required)', async () => {
      const res = await request(app).get('/auth/saml/metadata');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/xml/);
      expect(res.text).toContain('EntityDescriptor');
    });

    it('contains SPSSODescriptor in metadata', async () => {
      const res = await request(app).get('/auth/saml/metadata');
      expect(res.text).toContain('SPSSODescriptor');
    });

    it('contains AssertionConsumerService in metadata', async () => {
      const res = await request(app).get('/auth/saml/metadata');
      expect(res.text).toContain('AssertionConsumerService');
    });
  });

  describe('GET /auth/saml/login', () => {
    it('returns 400 when orgId is missing', async () => {
      const res = await request(app).get('/auth/saml/login');
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when SSO is not configured for org', async () => {
      const res = await request(app).get('/auth/saml/login').query({ orgId: 'unknown-org' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('SSO_NOT_CONFIGURED');
    });
  });

  describe('POST /auth/saml/callback', () => {
    it('returns 400 when SAMLResponse is missing', async () => {
      const res = await request(app)
        .post('/auth/saml/callback')
        .send({ RelayState: 'org-1' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('processes SAML callback with SAMLResponse', async () => {
      const res = await request(app)
        .post('/auth/saml/callback')
        .send({ SAMLResponse: 'base64-encoded-assertion', RelayState: 'org-1' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('relayState', 'org-1');
    });
  });

  describe('GET /admin/security/sso', () => {
    it('returns unconfigured SSO state when no config exists', async () => {
      const res = await request(app).get('/admin/security/sso');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.configured).toBe(false);
      expect(res.body.data).toHaveProperty('spMetadataUrl');
      expect(res.body.data).toHaveProperty('spEntityId');
    });

    it('returns 403 for non-ADMIN user', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).get('/admin/security/sso');
      expect(res.status).toBe(403);
    });
  });

  describe('POST /admin/security/sso', () => {
    const validConfig = {
      entryPoint: 'https://idp.example.com/sso/saml',
      issuer: 'https://app.ims.local',
      cert: '-----BEGIN CERTIFICATE-----\nMIICert123\n-----END CERTIFICATE-----',
      signatureAlgorithm: 'sha256',
      enabled: true,
    };

    it('creates a new SAML configuration', async () => {
      const res = await request(app)
        .post('/admin/security/sso')
        .send(validConfig);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('entryPoint', validConfig.entryPoint);
    });

    it('rejects invalid entryPoint URL', async () => {
      const res = await request(app)
        .post('/admin/security/sso')
        .send({ ...validConfig, entryPoint: 'not-a-url' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects missing issuer', async () => {
      const res = await request(app)
        .post('/admin/security/sso')
        .send({ ...validConfig, issuer: '' });
      expect(res.status).toBe(400);
    });

    it('rejects missing certificate', async () => {
      const res = await request(app)
        .post('/admin/security/sso')
        .send({ ...validConfig, cert: '' });
      expect(res.status).toBe(400);
    });

    it('rejects invalid signatureAlgorithm', async () => {
      const res = await request(app)
        .post('/admin/security/sso')
        .send({ ...validConfig, signatureAlgorithm: 'md5' });
      expect(res.status).toBe(400);
    });

    it('updates existing SAML config (returns 200)', async () => {
      // First create
      await request(app).post('/admin/security/sso').send(validConfig);
      // Then update
      const res = await request(app)
        .post('/admin/security/sso')
        .send({ ...validConfig, issuer: 'https://updated.ims.local' });
      expect(res.status).toBe(200);
      expect(res.body.data.issuer).toBe('https://updated.ims.local');
    });

    it('returns 403 for non-ADMIN user', async () => {
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = { id: 'u2', email: 'user@ims.local', role: 'USER', orgId: 'org-1' };
        next();
      });
      const res = await request(app).post('/admin/security/sso').send(validConfig);
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /admin/security/sso', () => {
    it('creates a config then deletes it successfully', async () => {
      const validConfig = {
        entryPoint: 'https://idp.example.com/sso/saml',
        issuer: 'https://app.ims.local',
        cert: '-----BEGIN CERTIFICATE-----\nMIICert456\n-----END CERTIFICATE-----',
      };
      // Use a unique org to avoid collisions
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-delete-unique' };
        next();
      });
      // Create first
      const createRes = await request(app).post('/admin/security/sso').send(validConfig);
      expect(createRes.status).toBe(201);
      // Then delete
      const res = await request(app).delete('/admin/security/sso');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('message');
    });

    it('returns 404 after deleting (config is gone)', async () => {
      // Use a fresh org with no config
      mockAuthenticate.mockImplementation((req: any, _res: any, next: any) => {
        req.user = { id: 'user-1', email: 'admin@ims.local', role: 'ADMIN', orgId: 'org-no-config-xyz' };
        next();
      });
      const res = await request(app).delete('/admin/security/sso');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
