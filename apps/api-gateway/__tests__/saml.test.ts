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

// ─── In-memory SAML config store for tests ──────────────────────────────────
let samlConfigStore: Map<string, any> = new Map();

const mockSamlConfig = {
  findUnique: jest.fn(({ where }: { where: { orgId: string } }) => {
    return Promise.resolve(samlConfigStore.get(where.orgId) ?? null);
  }),
  create: jest.fn(({ data }: { data: any }) => {
    const record = {
      id: `saml-${data.orgId}-${Date.now()}`,
      orgId: data.orgId,
      entryPoint: data.entryPoint,
      issuer: data.issuer,
      cert: data.cert,
      signatureAlgorithm: data.signatureAlgorithm ?? 'sha256',
      enabled: data.enabled ?? true,
      entityId: data.entityId ?? null,
      assertionConsumerUrl: data.assertionConsumerUrl ?? null,
      idpMetadataUrl: data.idpMetadataUrl ?? null,
      nameIdFormat: data.nameIdFormat ?? null,
      allowUnencryptedAssertions: data.allowUnencryptedAssertions ?? false,
      createdBy: data.createdBy ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    samlConfigStore.set(data.orgId, record);
    return Promise.resolve(record);
  }),
  update: jest.fn(({ where, data }: { where: { orgId: string }; data: any }) => {
    const existing = samlConfigStore.get(where.orgId);
    if (!existing) return Promise.reject(new Error('Record not found'));
    const updated = { ...existing, ...data, updatedAt: new Date() };
    samlConfigStore.set(where.orgId, updated);
    return Promise.resolve(updated);
  }),
  delete: jest.fn(({ where }: { where: { orgId: string } }) => {
    const existing = samlConfigStore.get(where.orgId);
    if (!existing) return Promise.reject(new Error('Record not found'));
    samlConfigStore.delete(where.orgId);
    return Promise.resolve(existing);
  }),
};

jest.mock('@ims/database', () => ({
  prisma: {
    samlConfig: mockSamlConfig,
    $use: jest.fn(),
  },
}));

import samlRouter from '../src/routes/saml';

describe('SAML Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    samlConfigStore = new Map();
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/', samlRouter);
    jest.clearAllMocks();
    // Re-wire mock implementations after clearAllMocks (clearAllMocks resets call counts only,
    // but mock.fn(impl) implementations survive — re-assign store access for safety)
    mockSamlConfig.findUnique.mockImplementation(({ where }: { where: { orgId: string } }) =>
      Promise.resolve(samlConfigStore.get(where.orgId) ?? null)
    );
    mockSamlConfig.create.mockImplementation(({ data }: { data: any }) => {
      const record = {
        id: `saml-${data.orgId}-${Date.now()}`,
        orgId: data.orgId,
        entryPoint: data.entryPoint,
        issuer: data.issuer,
        cert: data.cert,
        signatureAlgorithm: data.signatureAlgorithm ?? 'sha256',
        enabled: data.enabled ?? true,
        entityId: data.entityId ?? null,
        assertionConsumerUrl: data.assertionConsumerUrl ?? null,
        idpMetadataUrl: data.idpMetadataUrl ?? null,
        nameIdFormat: data.nameIdFormat ?? null,
        allowUnencryptedAssertions: data.allowUnencryptedAssertions ?? false,
        createdBy: data.createdBy ?? '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      samlConfigStore.set(data.orgId, record);
      return Promise.resolve(record);
    });
    mockSamlConfig.update.mockImplementation(
      ({ where, data }: { where: { orgId: string }; data: any }) => {
        const existing = samlConfigStore.get(where.orgId);
        if (!existing) return Promise.reject(new Error('Record not found'));
        const updated = { ...existing, ...data, updatedAt: new Date() };
        samlConfigStore.set(where.orgId, updated);
        return Promise.resolve(updated);
      }
    );
    mockSamlConfig.delete.mockImplementation(({ where }: { where: { orgId: string } }) => {
      const existing = samlConfigStore.get(where.orgId);
      if (!existing) return Promise.reject(new Error('Record not found'));
      samlConfigStore.delete(where.orgId);
      return Promise.resolve(existing);
    });
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
      const res = await request(app).post('/auth/saml/callback').send({ RelayState: 'org-1' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when org has no SSO config', async () => {
      const samlB64 = Buffer.from('<saml>test</saml>').toString('base64');
      const res = await request(app)
        .post('/auth/saml/callback')
        .send({ SAMLResponse: samlB64, RelayState: 'unknown-org' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('SSO_NOT_CONFIGURED');
    });

    it('processes SAML callback with valid SAMLResponse', async () => {
      // First create a SAML config for callback-test-org
      mockAuthenticate.mockImplementationOnce((req: any, _res: any, next: any) => {
        req.user = {
          id: 'user-1',
          email: 'admin@ims.local',
          role: 'ADMIN',
          orgId: 'callback-test-org',
        };
        next();
      });
      await request(app).post('/admin/security/sso').send({
        entryPoint: 'https://idp.example.com/sso',
        issuer: 'https://idp.example.com',
        cert: 'MIIC...',
        allowUnencryptedAssertions: true,
      });

      // Build a minimal SAML response with NameID
      const samlXml =
        '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Assertion><saml:Subject><saml:NameID>admin@ims.local</saml:NameID></saml:Subject></saml:Assertion></samlp:Response>';
      const samlB64 = Buffer.from(samlXml).toString('base64');

      const res = await request(app)
        .post('/auth/saml/callback')
        .send({ SAMLResponse: samlB64, RelayState: 'callback-test-org' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('relayState', 'callback-test-org');
      expect(res.body.data).toHaveProperty('nameId', 'admin@ims.local');
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

    it('returns configured SSO state when config exists', async () => {
      // Pre-populate the store
      samlConfigStore.set('org-1', {
        id: 'saml-org-1',
        orgId: 'org-1',
        entryPoint: 'https://idp.example.com/sso',
        issuer: 'https://idp.example.com',
        cert: 'MIIC...',
        signatureAlgorithm: 'sha256',
        enabled: true,
        entityId: null,
        assertionConsumerUrl: null,
        idpMetadataUrl: null,
        nameIdFormat: null,
        allowUnencryptedAssertions: false,
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const res = await request(app).get('/admin/security/sso');
      expect(res.status).toBe(200);
      expect(res.body.data.configured).toBe(true);
      expect(res.body.data).toHaveProperty('entryPoint');
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
      const res = await request(app).post('/admin/security/sso').send(validConfig);
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
        req.user = {
          id: 'user-1',
          email: 'admin@ims.local',
          role: 'ADMIN',
          orgId: 'org-delete-unique',
        };
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
        req.user = {
          id: 'user-1',
          email: 'admin@ims.local',
          role: 'ADMIN',
          orgId: 'org-no-config-xyz',
        };
        next();
      });
      const res = await request(app).delete('/admin/security/sso');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
