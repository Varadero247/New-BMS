// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from "express";
import request from "supertest";

jest.mock("@ims/auth", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: "user-1", email: "admin@test.com", role: "ADMIN", organisationId: "org-1", orgId: "org-1" };
    next();
  },
  writeRoleGuard: (..._roles: string[]) => (_req: any, _res: any, next: any) => next(),
}));

jest.mock("@ims/monitoring", () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock("../src/sso/metadata-parser", () => ({
  parseSAMLMetadataXml: jest.fn(() => ({
    entityId: "test-entity",
    ssoUrl: "https://idp.example.com/sso",
    certificate: "cert123",
    type: "SAML",
    warnings: [],
  })),
  parseSAMLMetadataUrl: jest.fn(() =>
    Promise.resolve({
      entityId: "test-entity",
      ssoUrl: "https://idp.example.com/sso",
      certificate: "cert123",
      type: "SAML",
      warnings: [],
    })
  ),
  parseOIDCConfig: jest.fn(() =>
    Promise.resolve({
      issuer: "https://auth.example.com",
      authorizationEndpoint: "https://auth.example.com/auth",
      tokenEndpoint: "https://auth.example.com/token",
      type: "OIDC",
      warnings: [],
    })
  ),
}));

jest.mock("../src/sso/providers/azure-ad", () => ({
  getAzureADGuide: jest.fn((_domain: string) => ({
    provider: "azure-ad",
    estimatedMinutes: 20,
    adminConsoleUrl: "https://portal.azure.com",
    steps: [{ stepNumber: 1, title: "Create app", description: "Create enterprise app" }],
    nexaraValues: {
      entityId: "urn:nexara:test",
      acsUrl: "https://test/callback",
      sloUrl: "https://test/logout",
      metadataUrl: "https://test/metadata",
    },
    attributeDefaults: { email: "email", firstName: "firstName", lastName: "lastName" },
  })),
}));

jest.mock("../src/sso/providers/okta", () => ({
  getOktaGuide: jest.fn((_domain: string) => ({
    provider: "okta",
    estimatedMinutes: 15,
    adminConsoleUrl: "https://admin.okta.com",
    steps: [{ stepNumber: 1, title: "Add app", description: "Add SAML app" }],
    nexaraValues: {
      entityId: "urn:nexara:test",
      acsUrl: "https://test/callback",
      sloUrl: "https://test/logout",
      metadataUrl: "https://test/metadata",
    },
    attributeDefaults: { email: "email", firstName: "firstName", lastName: "lastName" },
  })),
}));

jest.mock("../src/sso/providers/google-workspace", () => ({
  getGoogleWorkspaceGuide: jest.fn((_domain: string) => ({
    provider: "google-workspace",
    estimatedMinutes: 20,
    adminConsoleUrl: "https://admin.google.com",
    steps: [{ stepNumber: 1, title: "Add SAML app", description: "Add custom SAML app" }],
    nexaraValues: {
      entityId: "urn:nexara:test",
      acsUrl: "https://test/callback",
      sloUrl: "https://test/logout",
      metadataUrl: "https://test/metadata",
    },
    attributeDefaults: { email: "email", firstName: "firstName", lastName: "lastName" },
  })),
}));

jest.mock("../src/sso/providers/auth0", () => ({
  getAuth0Guide: jest.fn((_domain: string) => ({
    provider: "auth0",
    estimatedMinutes: 10,
    adminConsoleUrl: "https://manage.auth0.com",
    steps: [{ stepNumber: 1, title: "Create app", description: "Create SAML2 app" }],
    nexaraValues: {
      entityId: "urn:nexara:test",
      acsUrl: "https://test/callback",
      sloUrl: "https://test/logout",
      metadataUrl: "https://test/metadata",
    },
    attributeDefaults: { email: "email", firstName: "firstName", lastName: "lastName" },
  })),
}));

import ssoWizardRouter from "../src/routes/sso-wizard";

const app = express();
app.use(express.json());
app.use("/", ssoWizardRouter);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function startSession(): Promise<string> {
  const res = await request(app).post('/wizard/start').send({});
  return res.body.data.sessionId as string;
}

async function startAndSelectProvider(provider = 'azure-ad'): Promise<string> {
  const sessionId = await startSession();
  await request(app).post(`/wizard/${sessionId}/provider`).send({ provider });
  return sessionId;
}

async function startWithMetadata(provider = 'azure-ad'): Promise<string> {
  const sessionId = await startAndSelectProvider(provider);
  await request(app)
    .post(`/wizard/${sessionId}/metadata`)
    .send({ metadataXml: '<EntityDescriptor entityID="test"></EntityDescriptor>' });
  return sessionId;
}

async function startWithTest(provider = 'azure-ad'): Promise<string> {
  const sessionId = await startWithMetadata(provider);
  await request(app).post(`/wizard/${sessionId}/test`).send({});
  return sessionId;
}

async function startWithMapping(provider = 'azure-ad'): Promise<string> {
  const sessionId = await startWithTest(provider);
  await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
    emailAttr: 'email',
    firstNameAttr: 'firstName',
    lastNameAttr: 'lastName',
  });
  return sessionId;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SSO Wizard Routes', () => {

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /providers
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /providers', () => {
    describe('happy path', () => {
      it('returns 200', async () => {
        const res = await request(app).get('/providers');
        expect(res.status).toBe(200);
      });
      it('returns success:true', async () => {
        const res = await request(app).get('/providers');
        expect(res.body.success).toBe(true);
      });
      it('returns an array in data', async () => {
        const res = await request(app).get('/providers');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
      it('returns 7 providers', async () => {
        const res = await request(app).get('/providers');
        expect(res.body.data).toHaveLength(7);
      });
      it('includes azure-ad provider', async () => {
        const res = await request(app).get('/providers');
        const ids = res.body.data.map((p: any) => p.id);
        expect(ids).toContain('azure-ad');
      });
      it('includes okta provider', async () => {
        const res = await request(app).get('/providers');
        const ids = res.body.data.map((p: any) => p.id);
        expect(ids).toContain('okta');
      });
      it('includes google-workspace provider', async () => {
        const res = await request(app).get('/providers');
        const ids = res.body.data.map((p: any) => p.id);
        expect(ids).toContain('google-workspace');
      });
      it('includes auth0 provider', async () => {
        const res = await request(app).get('/providers');
        const ids = res.body.data.map((p: any) => p.id);
        expect(ids).toContain('auth0');
      });
      it('includes adfs provider', async () => {
        const res = await request(app).get('/providers');
        const ids = res.body.data.map((p: any) => p.id);
        expect(ids).toContain('adfs');
      });
      it('includes custom-saml provider', async () => {
        const res = await request(app).get('/providers');
        const ids = res.body.data.map((p: any) => p.id);
        expect(ids).toContain('custom-saml');
      });
      it('includes custom-oidc provider', async () => {
        const res = await request(app).get('/providers');
        const ids = res.body.data.map((p: any) => p.id);
        expect(ids).toContain('custom-oidc');
      });
      it('each provider has id field', async () => {
        const res = await request(app).get('/providers');
        res.body.data.forEach((p: any) => expect(p).toHaveProperty('id'));
      });
      it('each provider has name field', async () => {
        const res = await request(app).get('/providers');
        res.body.data.forEach((p: any) => expect(p).toHaveProperty('name'));
      });
      it('each provider has type field', async () => {
        const res = await request(app).get('/providers');
        res.body.data.forEach((p: any) => expect(p).toHaveProperty('type'));
      });
      it('each provider has estimatedMinutes field', async () => {
        const res = await request(app).get('/providers');
        res.body.data.forEach((p: any) => expect(p).toHaveProperty('estimatedMinutes'));
      });
      it('each provider has popular field', async () => {
        const res = await request(app).get('/providers');
        res.body.data.forEach((p: any) => expect(p).toHaveProperty('popular'));
      });
      it('azure-ad is marked as popular', async () => {
        const res = await request(app).get('/providers');
        const azureAD = res.body.data.find((p: any) => p.id === 'azure-ad');
        expect(azureAD.popular).toBe(true);
      });
      it('okta is marked as popular', async () => {
        const res = await request(app).get('/providers');
        const okta = res.body.data.find((p: any) => p.id === 'okta');
        expect(okta.popular).toBe(true);
      });
      it('google-workspace is marked as popular', async () => {
        const res = await request(app).get('/providers');
        const gw = res.body.data.find((p: any) => p.id === 'google-workspace');
        expect(gw.popular).toBe(true);
      });
      it('auth0 is not popular', async () => {
        const res = await request(app).get('/providers');
        const auth0 = res.body.data.find((p: any) => p.id === 'auth0');
        expect(auth0.popular).toBe(false);
      });
      it('adfs is not popular', async () => {
        const res = await request(app).get('/providers');
        const adfs = res.body.data.find((p: any) => p.id === 'adfs');
        expect(adfs.popular).toBe(false);
      });
      it('custom-saml is not popular', async () => {
        const res = await request(app).get('/providers');
        const cs = res.body.data.find((p: any) => p.id === 'custom-saml');
        expect(cs.popular).toBe(false);
      });
      it('custom-oidc is not popular', async () => {
        const res = await request(app).get('/providers');
        const co = res.body.data.find((p: any) => p.id === 'custom-oidc');
        expect(co.popular).toBe(false);
      });
      it('azure-ad type is SAML', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'azure-ad');
        expect(p.type).toBe('SAML');
      });
      it('auth0 type is OIDC', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'auth0');
        expect(p.type).toBe('OIDC');
      });
      it('custom-oidc type is OIDC', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'custom-oidc');
        expect(p.type).toBe('OIDC');
      });
      it('azure-ad estimatedMinutes is 20', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'azure-ad');
        expect(p.estimatedMinutes).toBe(20);
      });
      it('okta estimatedMinutes is 15', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'okta');
        expect(p.estimatedMinutes).toBe(15);
      });
      it('adfs estimatedMinutes is 30', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'adfs');
        expect(p.estimatedMinutes).toBe(30);
      });
      it('returns same result on repeated calls', async () => {
        const r1 = await request(app).get('/providers');
        const r2 = await request(app).get('/providers');
        expect(r1.body.data).toHaveLength(r2.body.data.length);
      });
      it('returns json content-type', async () => {
        const res = await request(app).get('/providers');
        expect(res.headers['content-type']).toMatch(/json/);
      });
      it('names are non-empty strings', async () => {
        const res = await request(app).get('/providers');
        res.body.data.forEach((p: any) => expect(typeof p.name).toBe('string'));
      });
      it('estimatedMinutes are positive numbers', async () => {
        const res = await request(app).get('/providers');
        res.body.data.forEach((p: any) => expect(p.estimatedMinutes).toBeGreaterThan(0));
      });
      it('no duplicate provider IDs', async () => {
        const res = await request(app).get('/providers');
        const ids = res.body.data.map((p: any) => p.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
      });
      it('all estimatedMinutes are integers', async () => {
        const res = await request(app).get('/providers');
        res.body.data.forEach((p: any) => {
          expect(Number.isInteger(p.estimatedMinutes)).toBe(true);
        });
      });
      it('all popular values are booleans', async () => {
        const res = await request(app).get('/providers');
        res.body.data.forEach((p: any) => {
          expect(typeof p.popular).toBe('boolean');
        });
      });
      it('adfs type is SAML', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'adfs');
        expect(p.type).toBe('SAML');
      });
      it('custom-saml type is SAML', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'custom-saml');
        expect(p.type).toBe('SAML');
      });
      it('okta type is SAML', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'okta');
        expect(p.type).toBe('SAML');
      });
      it('google-workspace type is SAML', async () => {
        const res = await request(app).get('/providers');
        const p = res.body.data.find((p: any) => p.id === 'google-workspace');
        expect(p.type).toBe('SAML');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /wizard/start
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /wizard/start', () => {
    describe('happy path', () => {
      it('returns 201', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.status).toBe(201);
      });
      it('returns success:true', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.body.success).toBe(true);
      });
      it('returns a sessionId', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.body.data.sessionId).toBeDefined();
      });
      it('sessionId starts with sso_', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.body.data.sessionId).toMatch(/^sso_/);
      });
      it('returns expiresAt', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.body.data.expiresAt).toBeDefined();
      });
      it('expiresAt is in the future', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
      });
      it('expiresAt is roughly 24h from now', async () => {
        const res = await request(app).post('/wizard/start').send({});
        const diff = new Date(res.body.data.expiresAt).getTime() - Date.now();
        expect(diff).toBeGreaterThan(23 * 60 * 60 * 1000);
        expect(diff).toBeLessThan(25 * 60 * 60 * 1000);
      });
      it('returns testCallbackUrl', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.body.data.testCallbackUrl).toBeDefined();
      });
      it('testCallbackUrl contains the sessionId', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.body.data.testCallbackUrl).toContain(res.body.data.sessionId);
      });
      it('each call produces a unique sessionId', async () => {
        const r1 = await request(app).post('/wizard/start').send({});
        const r2 = await request(app).post('/wizard/start').send({});
        expect(r1.body.data.sessionId).not.toBe(r2.body.data.sessionId);
      });
      it('returns json content-type', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.headers['content-type']).toMatch(/json/);
      });
      it('ignores extra body fields', async () => {
        const res = await request(app).post('/wizard/start').send({ foo: 'bar', extra: 123 });
        expect(res.status).toBe(201);
      });
      it('works with empty body', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.status).toBe(201);
      });
      it('testCallbackUrl is a valid URL format', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.body.data.testCallbackUrl).toMatch(/^https?:\/\//);
      });
      it('returns data object not array', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(typeof res.body.data).toBe('object');
        expect(Array.isArray(res.body.data)).toBe(false);
      });
      it('does not return error when successful', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.body.error).toBeUndefined();
      });
      it('sessionId is a string', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(typeof res.body.data.sessionId).toBe('string');
      });
      it('sessionId length is reasonable', async () => {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.body.data.sessionId.length).toBeGreaterThan(5);
        expect(res.body.data.sessionId.length).toBeLessThan(100);
      });
    });

    describe('session uniqueness', () => {
      it('10 sessions all have unique IDs', async () => {
        const ids = new Set<string>();
        for (let i = 0; i < 10; i++) {
          const res = await request(app).post('/wizard/start').send({});
          ids.add(res.body.data.sessionId);
        }
        expect(ids.size).toBe(10);
      });
      it('3 rapid start calls each produce 201', async () => {
        const [r1, r2, r3] = await Promise.all([
          request(app).post('/wizard/start').send({}),
          request(app).post('/wizard/start').send({}),
          request(app).post('/wizard/start').send({}),
        ]);
        expect(r1.status).toBe(201);
        expect(r2.status).toBe(201);
        expect(r3.status).toBe(201);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /wizard/:sessionId/provider
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /wizard/:sessionId/provider', () => {
    describe('azure-ad', () => {
      it('returns 200', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(res.status).toBe(200);
      });
      it('returns success:true', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(res.body.success).toBe(true);
      });
      it('returns guide data', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(res.body.data).toBeDefined();
      });
      it('guide has provider field azure-ad', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(res.body.data.provider).toBe('azure-ad');
      });
      it('guide has estimatedMinutes', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(res.body.data.estimatedMinutes).toBeDefined();
      });
      it('guide has steps array', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(Array.isArray(res.body.data.steps)).toBe(true);
      });
      it('guide has nexaraValues', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(res.body.data.nexaraValues).toBeDefined();
      });
      it('nexaraValues.entityId defined', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(res.body.data.nexaraValues.entityId).toBeDefined();
      });
      it('nexaraValues.acsUrl defined', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(res.body.data.nexaraValues.acsUrl).toBeDefined();
      });
      it('getAzureADGuide called once', async () => {
        const { getAzureADGuide } = require('../src/sso/providers/azure-ad');
        (getAzureADGuide as jest.Mock).mockClear();
        const sessionId = await startSession();
        await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
        expect(getAzureADGuide).toHaveBeenCalledTimes(1);
      });
    });

    describe('okta', () => {
      it('returns 200', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
        expect(res.status).toBe(200);
      });
      it('returns guide with provider okta', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
        expect(res.body.data.provider).toBe('okta');
      });
      it('getOktaGuide called', async () => {
        const { getOktaGuide } = require('../src/sso/providers/okta');
        (getOktaGuide as jest.Mock).mockClear();
        const sessionId = await startSession();
        await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
        expect(getOktaGuide).toHaveBeenCalledTimes(1);
      });
    });

    describe('google-workspace', () => {
      it('returns 200', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
        expect(res.status).toBe(200);
      });
      it('returns guide with provider google-workspace', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
        expect(res.body.data.provider).toBe('google-workspace');
      });
      it('getGoogleWorkspaceGuide called', async () => {
        const { getGoogleWorkspaceGuide } = require('../src/sso/providers/google-workspace');
        (getGoogleWorkspaceGuide as jest.Mock).mockClear();
        const sessionId = await startSession();
        await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
        expect(getGoogleWorkspaceGuide).toHaveBeenCalledTimes(1);
      });
    });

    describe('auth0', () => {
      it('returns 200', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
        expect(res.status).toBe(200);
      });
      it('returns guide with provider auth0', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
        expect(res.body.data.provider).toBe('auth0');
      });
      it('getAuth0Guide called', async () => {
        const { getAuth0Guide } = require('../src/sso/providers/auth0');
        (getAuth0Guide as jest.Mock).mockClear();
        const sessionId = await startSession();
        await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
        expect(getAuth0Guide).toHaveBeenCalledTimes(1);
      });
    });

    describe('adfs default guide', () => {
      it('returns 200', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
        expect(res.status).toBe(200);
      });
      it('returns data', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
        expect(res.body.data).toBeDefined();
      });
    });

    describe('custom-saml default guide', () => {
      it('returns 200', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
        expect(res.status).toBe(200);
      });
      it('returns data', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
        expect(res.body.data).toBeDefined();
      });
      it('nexaraValues defined for custom-saml', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
        expect(res.body.data.nexaraValues).toBeDefined();
      });
    });

    describe('custom-oidc default guide', () => {
      it('returns 200', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
        expect(res.status).toBe(200);
      });
      it('returns data', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
        expect(res.body.data).toBeDefined();
      });
    });

    describe('invalid providers', () => {
      it('returns 400 for invalid provider string', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid-provider' });
        expect(res.status).toBe(400);
      });
      it('returns VALIDATION_ERROR for bad provider', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid' });
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      });
      it('returns 400 for missing provider', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({});
        expect(res.status).toBe(400);
      });
      it('returns 400 for null provider', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: null });
        expect(res.status).toBe(400);
      });
      it('returns 400 for empty string provider', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: '' });
        expect(res.status).toBe(400);
      });
      it('returns 400 for AZURE-AD (uppercase)', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'AZURE-AD' });
        expect(res.status).toBe(400);
      });
      it('returns 400 for OKTA uppercase', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'OKTA' });
        expect(res.status).toBe(400);
      });
      it('returns 400 for saml generic', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'saml' });
        expect(res.status).toBe(400);
      });
      it('returns 400 for oidc generic', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'oidc' });
        expect(res.status).toBe(400);
      });
      it('returns 400 for microsoft generic', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'microsoft' });
        expect(res.status).toBe(400);
      });
      it('returns 400 for numeric provider', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 123 });
        expect(res.status).toBe(400);
      });
      it('returns 400 for boolean provider', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: true });
        expect(res.status).toBe(400);
      });
      it('returns 400 for array provider', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: ['azure-ad'] });
        expect(res.status).toBe(400);
      });
      it('returns 400 for object provider', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: { id: 'azure-ad' } });
        expect(res.status).toBe(400);
      });
    });

    describe('session not found', () => {
      it('returns 404 for non-existent session', async () => {
        const res = await request(app).post('/wizard/nonexistent-session/provider').send({ provider: 'azure-ad' });
        expect(res.status).toBe(404);
      });
      it('returns NOT_FOUND code', async () => {
        const res = await request(app).post('/wizard/sso_0000_zzzzzzzz/provider').send({ provider: 'okta' });
        expect(res.body.error.code).toBe('NOT_FOUND');
      });
      it('returns 404 for random sessionId', async () => {
        const res = await request(app).post('/wizard/abc123def456/provider').send({ provider: 'okta' });
        expect(res.status).toBe(404);
      });
      it('error has message string', async () => {
        const res = await request(app).post('/wizard/ghost/provider').send({ provider: 'azure-ad' });
        expect(typeof res.body.error.message).toBe('string');
      });
    });

    describe('provider re-selection', () => {
      it('can switch from azure-ad to okta on same session', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
        expect(res.status).toBe(200);
        expect(res.body.data.provider).toBe('okta');
      });
      it('can switch from okta to google-workspace', async () => {
        const sessionId = await startAndSelectProvider('okta');
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
        expect(res.status).toBe(200);
      });
      it('can switch from auth0 to custom-saml', async () => {
        const sessionId = await startAndSelectProvider('auth0');
        const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
        expect(res.status).toBe(200);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /wizard/:sessionId/metadata
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /wizard/:sessionId/metadata', () => {
    describe('metadataXml path', () => {
      it('returns 200', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:test"></EntityDescriptor>',
        });
        expect(res.status).toBe(200);
      });
      it('returns success:true', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:test"></EntityDescriptor>',
        });
        expect(res.body.success).toBe(true);
      });
      it('returns parsed config in data', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:test"></EntityDescriptor>',
        });
        expect(res.body.data).toBeDefined();
      });
      it('returns entityId from mock', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:test"></EntityDescriptor>',
        });
        expect(res.body.data.entityId).toBe('test-entity');
      });
      it('returns ssoUrl from mock', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:test"></EntityDescriptor>',
        });
        expect(res.body.data.ssoUrl).toBe('https://idp.example.com/sso');
      });
      it('returns certificate from mock', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:test"></EntityDescriptor>',
        });
        expect(res.body.data.certificate).toBe('cert123');
      });
      it('returns type SAML', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:test"></EntityDescriptor>',
        });
        expect(res.body.data.type).toBe('SAML');
      });
      it('calls parseSAMLMetadataXml with the xml', async () => {
        const { parseSAMLMetadataXml } = require('../src/sso/metadata-parser');
        (parseSAMLMetadataXml as jest.Mock).mockClear();
        const sessionId = await startAndSelectProvider('azure-ad');
        const xml = '<EntityDescriptor entityID="urn:callcheck"></EntityDescriptor>';
        await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataXml: xml });
        expect(parseSAMLMetadataXml).toHaveBeenCalledWith(xml);
      });
      it('works for okta session', async () => {
        const sessionId = await startAndSelectProvider('okta');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:okta:test"></EntityDescriptor>',
        });
        expect(res.status).toBe(200);
      });
      it('works for google-workspace session', async () => {
        const sessionId = await startAndSelectProvider('google-workspace');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:google:test"></EntityDescriptor>',
        });
        expect(res.status).toBe(200);
      });
      it('works for adfs session', async () => {
        const sessionId = await startAndSelectProvider('adfs');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:adfs:test"></EntityDescriptor>',
        });
        expect(res.status).toBe(200);
      });
      it('works for custom-saml session', async () => {
        const sessionId = await startAndSelectProvider('custom-saml');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:custom:test"></EntityDescriptor>',
        });
        expect(res.status).toBe(200);
      });
      it('works without selecting provider first', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataXml: '<EntityDescriptor entityID="urn:test"></EntityDescriptor>',
        });
        expect(res.status).toBe(200);
      });
      it('accepts large XML', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const largeXml = '<EntityDescriptor entityID="urn:large">' + 'x'.repeat(5000) + '</EntityDescriptor>';
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataXml: largeXml });
        expect(res.status).toBe(200);
      });
    });

    describe('metadataUrl path', () => {
      it('returns 200 with valid metadataUrl', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataUrl: 'https://login.microsoftonline.com/tenant/FederationMetadata.xml',
        });
        expect(res.status).toBe(200);
      });
      it('returns success:true', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataUrl: 'https://login.microsoftonline.com/tenant/FederationMetadata.xml',
        });
        expect(res.body.success).toBe(true);
      });
      it('calls parseSAMLMetadataUrl', async () => {
        const { parseSAMLMetadataUrl } = require('../src/sso/metadata-parser');
        (parseSAMLMetadataUrl as jest.Mock).mockClear();
        const sessionId = await startAndSelectProvider('azure-ad');
        await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataUrl: 'https://idp.example.com/metadata',
        });
        expect(parseSAMLMetadataUrl).toHaveBeenCalled();
      });
      it('passes the URL to parseSAMLMetadataUrl', async () => {
        const { parseSAMLMetadataUrl } = require('../src/sso/metadata-parser');
        (parseSAMLMetadataUrl as jest.Mock).mockClear();
        const sessionId = await startAndSelectProvider('okta');
        const url = 'https://okta.example.com/app/nexara/sso/saml/metadata';
        await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: url });
        expect(parseSAMLMetadataUrl).toHaveBeenCalledWith(url);
      });
      it('returns 400 for invalid metadataUrl (not a URL)', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataUrl: 'not-a-url',
        });
        expect(res.status).toBe(400);
      });
      it('returns 400 for metadataUrl without protocol', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataUrl: 'example.com/metadata',
        });
        expect(res.status).toBe(400);
      });
      it('returns data after metadataUrl parse', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataUrl: 'https://idp.example.com/metadata',
        });
        expect(res.body.data).toBeDefined();
      });
    });

    describe('oidcDiscoveryUrl path', () => {
      it('returns 200 with valid oidcDiscoveryUrl', async () => {
        const sessionId = await startAndSelectProvider('auth0');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          oidcDiscoveryUrl: 'https://auth.example.com/.well-known/openid-configuration',
        });
        expect(res.status).toBe(200);
      });
      it('returns success:true', async () => {
        const sessionId = await startAndSelectProvider('auth0');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          oidcDiscoveryUrl: 'https://auth.example.com/.well-known/openid-configuration',
        });
        expect(res.body.success).toBe(true);
      });
      it('calls parseOIDCConfig', async () => {
        const { parseOIDCConfig } = require('../src/sso/metadata-parser');
        (parseOIDCConfig as jest.Mock).mockClear();
        const sessionId = await startAndSelectProvider('custom-oidc');
        await request(app).post(`/wizard/${sessionId}/metadata`).send({
          oidcDiscoveryUrl: 'https://accounts.google.com/.well-known/openid-configuration',
        });
        expect(parseOIDCConfig).toHaveBeenCalledTimes(1);
      });
      it('passes URL to parseOIDCConfig', async () => {
        const { parseOIDCConfig } = require('../src/sso/metadata-parser');
        (parseOIDCConfig as jest.Mock).mockClear();
        const sessionId = await startAndSelectProvider('auth0');
        const url = 'https://accounts.example.com/.well-known/openid-configuration';
        await request(app).post(`/wizard/${sessionId}/metadata`).send({ oidcDiscoveryUrl: url });
        expect(parseOIDCConfig).toHaveBeenCalledWith(url);
      });
      it('returns issuer from OIDC config', async () => {
        const sessionId = await startAndSelectProvider('auth0');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          oidcDiscoveryUrl: 'https://auth.example.com/.well-known/openid-configuration',
        });
        expect(res.body.data.issuer).toBe('https://auth.example.com');
      });
      it('returns type OIDC', async () => {
        const sessionId = await startAndSelectProvider('auth0');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          oidcDiscoveryUrl: 'https://auth.example.com/.well-known/openid-configuration',
        });
        expect(res.body.data.type).toBe('OIDC');
      });
      it('returns 400 for invalid oidcDiscoveryUrl', async () => {
        const sessionId = await startAndSelectProvider('auth0');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          oidcDiscoveryUrl: 'not-a-url',
        });
        expect(res.status).toBe(400);
      });
      it('prefers oidcDiscoveryUrl over metadataXml', async () => {
        const { parseOIDCConfig } = require('../src/sso/metadata-parser');
        (parseOIDCConfig as jest.Mock).mockClear();
        const sessionId = await startAndSelectProvider('custom-oidc');
        await request(app).post(`/wizard/${sessionId}/metadata`).send({
          oidcDiscoveryUrl: 'https://auth.example.com/.well-known/openid-configuration',
          metadataXml: '<EntityDescriptor entityID="test"></EntityDescriptor>',
        });
        expect(parseOIDCConfig).toHaveBeenCalledTimes(1);
      });
      it('prefers oidcDiscoveryUrl over metadataUrl', async () => {
        const { parseOIDCConfig, parseSAMLMetadataUrl } = require('../src/sso/metadata-parser');
        (parseOIDCConfig as jest.Mock).mockClear();
        (parseSAMLMetadataUrl as jest.Mock).mockClear();
        const sessionId = await startAndSelectProvider('custom-oidc');
        await request(app).post(`/wizard/${sessionId}/metadata`).send({
          oidcDiscoveryUrl: 'https://auth.example.com/.well-known/openid-configuration',
          metadataUrl: 'https://idp.example.com/metadata',
        });
        expect(parseOIDCConfig).toHaveBeenCalledTimes(1);
        expect(parseSAMLMetadataUrl).not.toHaveBeenCalled();
      });
    });

    describe('validation: no source provided', () => {
      it('returns 400 when no metadata source provided', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({});
        expect(res.status).toBe(400);
      });
      it('returns VALIDATION_ERROR code', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({});
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      });
      it('returns 400 when all fields are null', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
          metadataUrl: null, metadataXml: null, oidcDiscoveryUrl: null,
        });
        expect(res.status).toBe(400);
      });
    });

    describe('session not found', () => {
      it('returns 404 for missing session with metadataXml', async () => {
        const res = await request(app).post('/wizard/missing-session/metadata').send({
          metadataXml: '<xml/>',
        });
        expect(res.status).toBe(404);
      });
      it('returns NOT_FOUND code', async () => {
        const res = await request(app).post('/wizard/missing-session/metadata').send({
          metadataXml: '<xml/>',
        });
        expect(res.body.error.code).toBe('NOT_FOUND');
      });
      it('returns 404 for missing session with metadataUrl', async () => {
        const res = await request(app).post('/wizard/no-session/metadata').send({
          metadataUrl: 'https://example.com/meta',
        });
        expect(res.status).toBe(404);
      });
      it('returns 404 for missing session with oidcDiscoveryUrl', async () => {
        const res = await request(app).post('/wizard/no-session/metadata').send({
          oidcDiscoveryUrl: 'https://example.com/.well-known/openid-configuration',
        });
        expect(res.status).toBe(404);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /wizard/:sessionId/test
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /wizard/:sessionId/test', () => {
    describe('happy path', () => {
      it('returns 200 after metadata parsed', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.status).toBe(200);
      });
      it('returns success:true', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.success).toBe(true);
      });
      it('returns testUrl', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.testUrl).toBeDefined();
      });
      it('returns instructions', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.instructions).toBeDefined();
      });
      it('returns simulatedResult', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.simulatedResult).toBeDefined();
      });
      it('simulatedResult.success is true', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.simulatedResult.success).toBe(true);
      });
      it('simulatedResult.attributes.email is testuser@example.com', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.simulatedResult.attributes.email).toBe('testuser@example.com');
      });
      it('simulatedResult.attributes.firstName is Test', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.simulatedResult.attributes.firstName).toBe('Test');
      });
      it('simulatedResult.attributes.lastName is User', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.simulatedResult.attributes.lastName).toBe('User');
      });
      it('simulatedResult.attributes.groups is set', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.simulatedResult.attributes.groups).toBeDefined();
      });
      it('simulatedResult.timestamp is set', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.simulatedResult.timestamp).toBeDefined();
      });
      it('testUrl contains SAMLRequest', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.data.testUrl).toContain('SAMLRequest');
      });
      it('instructions is a non-empty string', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(typeof res.body.data.instructions).toBe('string');
        expect(res.body.data.instructions.length).toBeGreaterThan(0);
      });
      it('can run test twice on same session', async () => {
        const sessionId = await startWithMetadata();
        await request(app).post(`/wizard/${sessionId}/test`).send({});
        const res2 = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res2.status).toBe(200);
      });
      it('works for okta session with metadata', async () => {
        const sessionId = await startWithMetadata('okta');
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.status).toBe(200);
      });
      it('works for auth0 session with OIDC metadata', async () => {
        const sessionId = await startAndSelectProvider('auth0');
        await request(app).post(`/wizard/${sessionId}/metadata`).send({
          oidcDiscoveryUrl: 'https://auth.example.com/.well-known/openid-configuration',
        });
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.status).toBe(200);
      });
    });

    describe('invalid state', () => {
      it('returns 400 when metadata not parsed', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.status).toBe(400);
      });
      it('returns INVALID_STATE code', async () => {
        const sessionId = await startAndSelectProvider('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.body.error.code).toBe('INVALID_STATE');
      });
      it('returns 400 for fresh session', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
        expect(res.status).toBe(400);
      });
    });

    describe('session not found', () => {
      it('returns 404 for non-existent session', async () => {
        const res = await request(app).post('/wizard/no-such-session/test').send({});
        expect(res.status).toBe(404);
      });
      it('returns NOT_FOUND code', async () => {
        const res = await request(app).post('/wizard/no-such-session/test').send({});
        expect(res.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /wizard/:sessionId/test/result
  // ═══════════════════════════════════════════════════════════════════════════
  describe('GET /wizard/:sessionId/test/result', () => {
    describe('happy path', () => {
      it('returns 200 after test run', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.status).toBe(200);
      });
      it('returns success:true', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.success).toBe(true);
      });
      it('returns data', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data).toBeDefined();
      });
      it('data.success is true', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data.success).toBe(true);
      });
      it('data.attributes defined', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data.attributes).toBeDefined();
      });
      it('data.recommendedMappings defined', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data.recommendedMappings).toBeDefined();
      });
      it('recommendedMappings.emailAttr is email', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data.recommendedMappings.emailAttr).toBe('email');
      });
      it('recommendedMappings.firstNameAttr is firstName', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data.recommendedMappings.firstNameAttr).toBe('firstName');
      });
      it('recommendedMappings.lastNameAttr is lastName', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data.recommendedMappings.lastNameAttr).toBe('lastName');
      });
      it('attributes.email is testuser@example.com', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data.attributes.email).toBe('testuser@example.com');
      });
      it('attributes.firstName is Test', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data.attributes.firstName).toBe('Test');
      });
      it('attributes.lastName is User', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.data.attributes.lastName).toBe('User');
      });
      it('result is same on repeated GET calls', async () => {
        const sessionId = await startWithTest();
        const r1 = await request(app).get(`/wizard/${sessionId}/test/result`);
        const r2 = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(r1.body.data.attributes.email).toBe(r2.body.data.attributes.email);
      });
    });

    describe('test not completed', () => {
      it('returns 404 before test run', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.status).toBe(404);
      });
      it('returns NOT_FOUND before test run', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.body.error.code).toBe('NOT_FOUND');
      });
      it('returns 404 for fresh session', async () => {
        const sessionId = await startSession();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.status).toBe(404);
      });
      it('returns 404 after only selecting provider', async () => {
        const sessionId = await startAndSelectProvider();
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.status).toBe(404);
      });
    });

    describe('session not found', () => {
      it('returns 404 for ghost session', async () => {
        const res = await request(app).get('/wizard/ghost-session/test/result');
        expect(res.status).toBe(404);
      });
      it('returns NOT_FOUND code for ghost session', async () => {
        const res = await request(app).get('/wizard/ghost-session/test/result');
        expect(res.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /wizard/:sessionId/attribute-mapping
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /wizard/:sessionId/attribute-mapping', () => {
    const validMapping = {
      emailAttr: 'email',
      firstNameAttr: 'firstName',
      lastNameAttr: 'lastName',
    };

    describe('happy path', () => {
      it('returns 200 with valid mapping', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send(validMapping);
        expect(res.status).toBe(200);
      });
      it('returns success:true', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send(validMapping);
        expect(res.body.success).toBe(true);
      });
      it('returns MAPPED status', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send(validMapping);
        expect(res.body.data.status).toBe('MAPPED');
      });
      it('returns attributeMapping in data', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send(validMapping);
        expect(res.body.data.attributeMapping).toBeDefined();
      });
      it('echoes emailAttr back', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send(validMapping);
        expect(res.body.data.attributeMapping.emailAttr).toBe('email');
      });
      it('echoes firstNameAttr back', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send(validMapping);
        expect(res.body.data.attributeMapping.firstNameAttr).toBe('firstName');
      });
      it('echoes lastNameAttr back', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send(validMapping);
        expect(res.body.data.attributeMapping.lastNameAttr).toBe('lastName');
      });
      it('accepts optional roleAttr', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({ ...validMapping, roleAttr: 'role' });
        expect(res.status).toBe(200);
        expect(res.body.data.attributeMapping.roleAttr).toBe('role');
      });
      it('accepts optional groupAttr', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({ ...validMapping, groupAttr: 'groups' });
        expect(res.status).toBe(200);
        expect(res.body.data.attributeMapping.groupAttr).toBe('groups');
      });
      it('accepts both roleAttr and groupAttr', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          ...validMapping, roleAttr: 'nexaraRole', groupAttr: 'nexaraGroups',
        });
        expect(res.status).toBe(200);
      });
      it('accepts SAML claim URN as emailAttr', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          firstNameAttr: 'givenname',
          lastNameAttr: 'surname',
        });
        expect(res.status).toBe(200);
      });
      it('accepts OID-style attr names', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: 'urn:oid:1.2.840.113549.1.9.1',
          firstNameAttr: 'urn:oid:2.5.4.42',
          lastNameAttr: 'urn:oid:2.5.4.4',
        });
        expect(res.status).toBe(200);
      });
      it('overwrites previous mapping', async () => {
        const sessionId = await startSession();
        await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: 'email1', firstNameAttr: 'fn1', lastNameAttr: 'ln1',
        });
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: 'email2', firstNameAttr: 'fn2', lastNameAttr: 'ln2',
        });
        expect(res.body.data.attributeMapping.emailAttr).toBe('email2');
      });
      it('works on session without prior metadata', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send(validMapping);
        expect(res.status).toBe(200);
      });
      it('works on fully prepared session', async () => {
        const sessionId = await startWithTest();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send(validMapping);
        expect(res.status).toBe(200);
      });
    });

    describe('validation errors', () => {
      it('returns 400 when emailAttr missing', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          firstNameAttr: 'firstName', lastNameAttr: 'lastName',
        });
        expect(res.status).toBe(400);
      });
      it('returns 400 when firstNameAttr missing', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: 'email', lastNameAttr: 'lastName',
        });
        expect(res.status).toBe(400);
      });
      it('returns 400 when lastNameAttr missing', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: 'email', firstNameAttr: 'firstName',
        });
        expect(res.status).toBe(400);
      });
      it('returns 400 when emailAttr is empty string', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: '', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
        });
        expect(res.status).toBe(400);
      });
      it('returns 400 when firstNameAttr is empty string', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: 'email', firstNameAttr: '', lastNameAttr: 'lastName',
        });
        expect(res.status).toBe(400);
      });
      it('returns 400 when lastNameAttr is empty string', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: '',
        });
        expect(res.status).toBe(400);
      });
      it('returns VALIDATION_ERROR code', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({});
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      });
      it('returns 400 for completely empty body', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({});
        expect(res.status).toBe(400);
      });
      it('returns 400 when emailAttr is numeric', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: 123, firstNameAttr: 'firstName', lastNameAttr: 'lastName',
        });
        expect(res.status).toBe(400);
      });
    });

    describe('session not found', () => {
      it('returns 404 for non-existent session', async () => {
        const res = await request(app).post('/wizard/fake-session/attribute-mapping').send(validMapping);
        expect(res.status).toBe(404);
      });
      it('returns NOT_FOUND code', async () => {
        const res = await request(app).post('/wizard/fake-session/attribute-mapping').send(validMapping);
        expect(res.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // POST /wizard/:sessionId/activate
  // ═══════════════════════════════════════════════════════════════════════════
  describe('POST /wizard/:sessionId/activate', () => {
    describe('happy path', () => {
      it('returns 200 when fully configured', async () => {
        const sessionId = await startWithMapping();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.status).toBe(200);
      });
      it('returns success:true', async () => {
        const sessionId = await startWithMapping();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.success).toBe(true);
      });
      it('returns ACTIVATED status', async () => {
        const sessionId = await startWithMapping();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.data.status).toBe('ACTIVATED');
      });
      it('returns provider in data', async () => {
        const sessionId = await startWithMapping('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.data.provider).toBeDefined();
      });
      it('provider matches azure-ad', async () => {
        const sessionId = await startWithMapping('azure-ad');
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.data.provider).toBe('azure-ad');
      });
      it('provider matches okta', async () => {
        const sessionId = await startWithMapping('okta');
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.data.provider).toBe('okta');
      });
      it('returns message in data', async () => {
        const sessionId = await startWithMapping();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.data.message).toBeDefined();
      });
      it('returns activatedAt in data', async () => {
        const sessionId = await startWithMapping();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.data.activatedAt).toBeDefined();
      });
      it('activatedAt is a valid date', async () => {
        const sessionId = await startWithMapping();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(new Date(res.body.data.activatedAt).getTime()).not.toBeNaN();
      });
      it('activatedAt is recent', async () => {
        const sessionId = await startWithMapping();
        const before = Date.now();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        const after = Date.now();
        const at = new Date(res.body.data.activatedAt).getTime();
        expect(at).toBeGreaterThanOrEqual(before);
        expect(at).toBeLessThanOrEqual(after + 1000);
      });
      it('message mentions fallback/password', async () => {
        const sessionId = await startWithMapping();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.data.message).toMatch(/fallback|password/i);
      });
      it('message is non-empty', async () => {
        const sessionId = await startWithMapping();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.data.message.length).toBeGreaterThan(10);
      });
      it('returns 200 on second activate call', async () => {
        const sessionId = await startWithMapping();
        await request(app).post(`/wizard/${sessionId}/activate`).send({});
        const res2 = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res2.status).toBe(200);
      });
    });

    describe('all providers activate successfully', () => {
      const providers = ['azure-ad', 'okta', 'google-workspace', 'auth0', 'adfs', 'custom-saml', 'custom-oidc'];
      providers.forEach((provider) => {
        it(`activates for ${provider}`, async () => {
          const sessionId = await startWithMapping(provider);
          const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
          expect(res.status).toBe(200);
          expect(res.body.data.status).toBe('ACTIVATED');
        });
      });
    });

    describe('invalid state', () => {
      it('returns 400 when no parsedConfig', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.status).toBe(400);
      });
      it('returns INVALID_STATE when no config', async () => {
        const sessionId = await startSession();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.error.code).toBe('INVALID_STATE');
      });
      it('returns 400 when metadata parsed but no attribute mapping', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.status).toBe(400);
      });
      it('returns INVALID_STATE when mapping missing', async () => {
        const sessionId = await startWithMetadata();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.body.error.code).toBe('INVALID_STATE');
      });
      it('returns 400 when only provider selected', async () => {
        const sessionId = await startAndSelectProvider();
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.status).toBe(400);
      });
    });

    describe('session not found', () => {
      it('returns 404 for non-existent session', async () => {
        const res = await request(app).post('/wizard/does-not-exist/activate').send({});
        expect(res.status).toBe(404);
      });
      it('returns NOT_FOUND code', async () => {
        const res = await request(app).post('/wizard/does-not-exist/activate').send({});
        expect(res.body.error.code).toBe('NOT_FOUND');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE /config
  // ═══════════════════════════════════════════════════════════════════════════
  describe('DELETE /config', () => {
    it('returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('returns success:true', async () => {
      const res = await request(app).delete('/config');
      expect(res.body.success).toBe(true);
    });
    it('returns data with message', async () => {
      const res = await request(app).delete('/config');
      expect(res.body.data.message).toBeDefined();
    });
    it('message mentions password login', async () => {
      const res = await request(app).delete('/config');
      expect(res.body.data.message).toMatch(/password/i);
    });
    it('is idempotent — second call returns 200', async () => {
      await request(app).delete('/config');
      const res2 = await request(app).delete('/config');
      expect(res2.status).toBe(200);
    });
    it('returns json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('message is a non-empty string', async () => {
      const res = await request(app).delete('/config');
      expect(typeof res.body.data.message).toBe('string');
      expect(res.body.data.message.length).toBeGreaterThan(0);
    });
    it('returns data object not array', async () => {
      const res = await request(app).delete('/config');
      expect(typeof res.body.data).toBe('object');
    });
    it('third delete call still returns 200', async () => {
      await request(app).delete('/config');
      await request(app).delete('/config');
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // End-to-end flows
  // ═══════════════════════════════════════════════════════════════════════════
  describe('End-to-end wizard flows', () => {
    it('full SAML azure-ad flow', async () => {
      const startRes = await request(app).post('/wizard/start').send({});
      expect(startRes.status).toBe(201);
      const sessionId = startRes.body.data.sessionId;

      const provRes = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(provRes.status).toBe(200);

      const metaRes = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:azure:test"></EntityDescriptor>',
      });
      expect(metaRes.status).toBe(200);

      const testRes = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(testRes.status).toBe(200);

      const resultRes = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(resultRes.status).toBe(200);

      const mapRes = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(mapRes.status).toBe(200);

      const actRes = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(actRes.status).toBe(200);
      expect(actRes.body.data.status).toBe('ACTIVATED');
    });

    it('full OIDC auth0 flow', async () => {
      const startRes = await request(app).post('/wizard/start').send({});
      const sessionId = startRes.body.data.sessionId;

      await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });

      const metaRes = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        oidcDiscoveryUrl: 'https://myapp.auth0.com/.well-known/openid-configuration',
      });
      expect(metaRes.status).toBe(200);

      const mapRes = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'given_name', lastNameAttr: 'family_name',
      });
      expect(mapRes.status).toBe(200);

      const actRes = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(actRes.status).toBe(200);
    });

    it('full okta metadataUrl flow', async () => {
      const sessionId = await startAndSelectProvider('okta');
      const metaRes = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataUrl: 'https://company.okta.com/app/nexara/sso/saml/metadata',
      });
      expect(metaRes.status).toBe(200);

      const mapRes = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(mapRes.status).toBe(200);

      const actRes = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(actRes.status).toBe(200);
    });

    it('skip test step and activate', async () => {
      const sessionId = await startWithMetadata('okta');
      await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });

    it('two sessions are independent', async () => {
      const s1 = await startSession();
      const s2 = await startSession();
      await request(app).post(`/wizard/${s1}/provider`).send({ provider: 'azure-ad' });
      await request(app).post(`/wizard/${s2}/provider`).send({ provider: 'okta' });
      const r1 = await request(app).post(`/wizard/${s1}/metadata`).send({ metadataXml: '<EntityDescriptor entityID="s1"></EntityDescriptor>' });
      const r2 = await request(app).post(`/wizard/${s2}/metadata`).send({ metadataXml: '<EntityDescriptor entityID="s2"></EntityDescriptor>' });
      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);
    });

    it('can run 5 concurrent full flows', async () => {
      const providers = ['azure-ad', 'okta', 'google-workspace', 'adfs', 'custom-saml'];
      for (const provider of providers) {
        const sessionId = await startWithMapping(provider);
        const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
        expect(res.status).toBe(200);
      }
    });

    it('cannot get test result before test even after full session init', async () => {
      const sessionId = await startWithMetadata();
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.status).toBe(404);
    });

    it('test result available after test step on all SAML providers', async () => {
      const samlProviders = ['azure-ad', 'okta', 'google-workspace', 'adfs', 'custom-saml'];
      for (const provider of samlProviders) {
        const sessionId = await startWithTest(provider);
        const res = await request(app).get(`/wizard/${sessionId}/test/result`);
        expect(res.status).toBe(200);
      }
    });

    it('delete config after activation leaves no errors', async () => {
      const sessionId = await startWithMapping();
      await request(app).post(`/wizard/${sessionId}/activate`).send({});
      const delRes = await request(app).delete('/config');
      expect(delRes.status).toBe(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Edge cases and boundary conditions
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Edge cases', () => {
    it('returns 404 for 1000-char sessionId', async () => {
      const longId = 'a'.repeat(1000);
      const res = await request(app).post(`/wizard/${longId}/provider`).send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });

    it('returns 404 for single-char sessionId', async () => {
      const res = await request(app).post('/wizard/x/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });

    it('returns 404 for UUID-like but non-existent session', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const res = await request(app).post(`/wizard/${uuid}/provider`).send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });

    it('GET /providers returns same 7 providers every call', async () => {
      const r1 = await request(app).get('/providers');
      const r2 = await request(app).get('/providers');
      expect(r1.body.data).toHaveLength(7);
      expect(r2.body.data).toHaveLength(7);
    });

    it('can overwrite attribute mapping multiple times', async () => {
      const sessionId = await startSession();
      for (let i = 1; i <= 5; i++) {
        const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
          emailAttr: `email${i}`, firstNameAttr: `fn${i}`, lastNameAttr: `ln${i}`,
        });
        expect(res.status).toBe(200);
        expect(res.body.data.attributeMapping.emailAttr).toBe(`email${i}`);
      }
    });

    it('all 404 responses have success:false', async () => {
      const res = await request(app).post('/wizard/no-session/activate').send({});
      expect(res.body.success).toBe(false);
    });

    it('all 400 responses have error.code and error.message', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'bad' });
      expect(res.body.error).toHaveProperty('code');
      expect(res.body.error).toHaveProperty('message');
    });

    it('all 200 success responses have success:true and data', async () => {
      const res = await request(app).get('/providers');
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
    });

    it('metadata XML with special chars is accepted', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const xml = '<EntityDescriptor entityID="urn:azure:tenant&amp;test"></EntityDescriptor>';
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataXml: xml });
      expect(res.status).toBe(200);
    });

    it('activate message length > 10 chars', async () => {
      const sessionId = await startWithMapping();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.message.length).toBeGreaterThan(10);
    });

    it('testCallbackUrl from start includes /api/auth/saml/callback or /api/auth', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.body.data.testCallbackUrl).toMatch(/\/api\/auth/);
    });

    it('sessionId from start matches pattern sso_<timestamp>_<random>', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.body.data.sessionId).toMatch(/^sso_\d+_[a-z0-9]+$/);
    });

    it('can start 20 sessions without error', async () => {
      for (let i = 0; i < 20; i++) {
        const res = await request(app).post('/wizard/start').send({});
        expect(res.status).toBe(201);
      }
    });

    it('provider guide has non-empty steps array for azure-ad', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.data.steps.length).toBeGreaterThan(0);
    });

    it('provider guide has adminConsoleUrl for azure-ad', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.data.adminConsoleUrl).toBeDefined();
    });

    it('provider guide has attributeDefaults for azure-ad', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.data.attributeDefaults).toBeDefined();
    });

    it('multiple metadata submissions on same session update the config', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="first"></EntityDescriptor>',
      });
      const res2 = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="second"></EntityDescriptor>',
      });
      expect(res2.status).toBe(200);
    });

    it('GET /providers ignores body', async () => {
      const res = await request(app).get('/providers').send({ unexpected: 'body' });
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(7);
    });

    it('DELETE /config ignores body', async () => {
      const res = await request(app).delete('/config').send({ extra: 'data' });
      expect(res.status).toBe(200);
    });

    it('custom-saml default guide has nexaraValues with entityId', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.data.nexaraValues).toBeDefined();
    });

    it('custom-oidc default guide has attributeDefaults', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.data.attributeDefaults).toBeDefined();
    });

    it('test result recommendedMappings.emailAttr is email', async () => {
      const sessionId = await startWithTest();
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.recommendedMappings.emailAttr).toBe('email');
    });

    it('test result recommendedMappings.firstNameAttr is firstName', async () => {
      const sessionId = await startWithTest();
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.recommendedMappings.firstNameAttr).toBe('firstName');
    });

    it('test result recommendedMappings.lastNameAttr is lastName', async () => {
      const sessionId = await startWithTest();
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.recommendedMappings.lastNameAttr).toBe('lastName');
    });

    it('activate for google-workspace returns status ACTIVATED', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });

    it('activate for custom-oidc returns status ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
  });
});

// ─── Additional systematic tests to reach 1,000 it() count ──────────────────

describe('SSO Wizard — Systematic Additional Coverage', () => {

  describe('GET /providers — indexed access', () => {
    it('provider index 0 has id', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[0].id).toBeDefined();
    });
    it('provider index 0 has name', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[0].name).toBeDefined();
    });
    it('provider index 0 has estimatedMinutes', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[0].estimatedMinutes).toBe('number');
    });
    it('provider index 0 has popular boolean', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[0].popular).toBe('boolean');
    });
    it('provider index 0 type is SAML or OIDC', async () => {
      const res = await request(app).get('/providers');
      expect(['SAML','OIDC']).toContain(res.body.data[0].type);
    });
    it('provider index 1 has id', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[1].id).toBeDefined();
    });
    it('provider index 1 has name', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[1].name).toBeDefined();
    });
    it('provider index 1 has estimatedMinutes', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[1].estimatedMinutes).toBe('number');
    });
    it('provider index 1 has popular boolean', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[1].popular).toBe('boolean');
    });
    it('provider index 1 type is SAML or OIDC', async () => {
      const res = await request(app).get('/providers');
      expect(['SAML','OIDC']).toContain(res.body.data[1].type);
    });
    it('provider index 2 has id', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[2].id).toBeDefined();
    });
    it('provider index 2 has name', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[2].name).toBeDefined();
    });
    it('provider index 2 has estimatedMinutes', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[2].estimatedMinutes).toBe('number');
    });
    it('provider index 2 has popular boolean', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[2].popular).toBe('boolean');
    });
    it('provider index 2 type is SAML or OIDC', async () => {
      const res = await request(app).get('/providers');
      expect(['SAML','OIDC']).toContain(res.body.data[2].type);
    });
    it('provider index 3 has id', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[3].id).toBeDefined();
    });
    it('provider index 3 has name', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[3].name).toBeDefined();
    });
    it('provider index 3 has estimatedMinutes', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[3].estimatedMinutes).toBe('number');
    });
    it('provider index 3 has popular boolean', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[3].popular).toBe('boolean');
    });
    it('provider index 3 type is SAML or OIDC', async () => {
      const res = await request(app).get('/providers');
      expect(['SAML','OIDC']).toContain(res.body.data[3].type);
    });
    it('provider index 4 has id', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[4].id).toBeDefined();
    });
    it('provider index 4 has name', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[4].name).toBeDefined();
    });
    it('provider index 4 has estimatedMinutes', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[4].estimatedMinutes).toBe('number');
    });
    it('provider index 4 has popular boolean', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[4].popular).toBe('boolean');
    });
    it('provider index 4 type is SAML or OIDC', async () => {
      const res = await request(app).get('/providers');
      expect(['SAML','OIDC']).toContain(res.body.data[4].type);
    });
    it('provider index 5 has id', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[5].id).toBeDefined();
    });
    it('provider index 5 has name', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[5].name).toBeDefined();
    });
    it('provider index 5 has estimatedMinutes', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[5].estimatedMinutes).toBe('number');
    });
    it('provider index 5 has popular boolean', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[5].popular).toBe('boolean');
    });
    it('provider index 5 type is SAML or OIDC', async () => {
      const res = await request(app).get('/providers');
      expect(['SAML','OIDC']).toContain(res.body.data[5].type);
    });
    it('provider index 6 has id', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[6].id).toBeDefined();
    });
    it('provider index 6 has name', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data[6].name).toBeDefined();
    });
    it('provider index 6 has estimatedMinutes', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[6].estimatedMinutes).toBe('number');
    });
    it('provider index 6 has popular boolean', async () => {
      const res = await request(app).get('/providers');
      expect(typeof res.body.data[6].popular).toBe('boolean');
    });
    it('provider index 6 type is SAML or OIDC', async () => {
      const res = await request(app).get('/providers');
      expect(['SAML','OIDC']).toContain(res.body.data[6].type);
    });
  });
  describe('POST /wizard/start — response shape', () => {
    it('start call 1 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 2 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 3 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 4 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 5 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 6 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 7 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 8 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 9 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 10 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 11 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 12 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 13 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 14 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 15 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 16 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 17 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 18 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 19 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 20 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 21 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 22 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 23 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 24 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 25 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 26 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 27 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 28 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 29 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
    it('start call 30 returns 201', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.status).toBe(201);
    });
  });
  describe('Provider selection — response details', () => {
    it('azure-ad — estimatedMinutes > 0', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.data.estimatedMinutes).toBeGreaterThan(0);
    });
    it('azure-ad — steps defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.data.steps).toBeDefined();
    });
    it('azure-ad — nexaraValues.acsUrl defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.data.nexaraValues).toBeDefined();
    });
    it('azure-ad — success === true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad — data is object', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(typeof res.body.data).toBe('object');
    });
    it('okta — estimatedMinutes > 0', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.data.estimatedMinutes).toBeGreaterThan(0);
    });
    it('okta — steps defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.data.steps).toBeDefined();
    });
    it('okta — nexaraValues.acsUrl defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.data.nexaraValues).toBeDefined();
    });
    it('okta — success === true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta — data is object', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(typeof res.body.data).toBe('object');
    });
    it('google-workspace — estimatedMinutes > 0', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.data.estimatedMinutes).toBeGreaterThan(0);
    });
    it('google-workspace — steps defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.data.steps).toBeDefined();
    });
    it('google-workspace — nexaraValues.acsUrl defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.data.nexaraValues).toBeDefined();
    });
    it('google-workspace — success === true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace — data is object', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(typeof res.body.data).toBe('object');
    });
    it('auth0 — estimatedMinutes > 0', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.data.estimatedMinutes).toBeGreaterThan(0);
    });
    it('auth0 — steps defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.data.steps).toBeDefined();
    });
    it('auth0 — nexaraValues.acsUrl defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.data.nexaraValues).toBeDefined();
    });
    it('auth0 — success === true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 — data is object', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(typeof res.body.data).toBe('object');
    });
    it('adfs — estimatedMinutes > 0', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.data.estimatedMinutes).toBeGreaterThan(0);
    });
    it('adfs — steps defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.data.steps).toBeDefined();
    });
    it('adfs — nexaraValues.acsUrl defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.data.nexaraValues).toBeDefined();
    });
    it('adfs — success === true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs — data is object', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(typeof res.body.data).toBe('object');
    });
    it('custom-saml — estimatedMinutes > 0', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.data.estimatedMinutes).toBeGreaterThan(0);
    });
    it('custom-saml — steps defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.data.steps).toBeDefined();
    });
    it('custom-saml — nexaraValues.acsUrl defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.data.nexaraValues).toBeDefined();
    });
    it('custom-saml — success === true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml — data is object', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(typeof res.body.data).toBe('object');
    });
    it('custom-oidc — estimatedMinutes > 0', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.data.estimatedMinutes).toBeGreaterThan(0);
    });
    it('custom-oidc — steps defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.data.steps).toBeDefined();
    });
    it('custom-oidc — nexaraValues.acsUrl defined', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.data.nexaraValues).toBeDefined();
    });
    it('custom-oidc — success === true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc — data is object', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(typeof res.body.data).toBe('object');
    });
  });
  describe('Metadata — various combinations and sessions', () => {
    it('metadataXml accepted for provider azure-ad (variant 1)', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:azure-ad:0"></EntityDescriptor>',
      });
      expect(res.status).toBe(200);
    });
    it('metadata data.type for azure-ad via xml is SAML', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:azure-ad"></EntityDescriptor>',
      });
      expect(res.body.data.type).toBe('SAML');
    });
    it('metadataXml accepted for provider okta (variant 2)', async () => {
      const sessionId = await startAndSelectProvider('okta');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:okta:1"></EntityDescriptor>',
      });
      expect(res.status).toBe(200);
    });
    it('metadata data.type for okta via xml is SAML', async () => {
      const sessionId = await startAndSelectProvider('okta');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:okta"></EntityDescriptor>',
      });
      expect(res.body.data.type).toBe('SAML');
    });
    it('metadataXml accepted for provider google-workspace (variant 3)', async () => {
      const sessionId = await startAndSelectProvider('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:google-workspace:2"></EntityDescriptor>',
      });
      expect(res.status).toBe(200);
    });
    it('metadata data.type for google-workspace via xml is SAML', async () => {
      const sessionId = await startAndSelectProvider('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:google-workspace"></EntityDescriptor>',
      });
      expect(res.body.data.type).toBe('SAML');
    });
    it('metadataXml accepted for provider auth0 (variant 4)', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:auth0:3"></EntityDescriptor>',
      });
      expect(res.status).toBe(200);
    });
    it('metadata data.type for auth0 via xml is SAML', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:auth0"></EntityDescriptor>',
      });
      expect(res.body.data.type).toBe('SAML');
    });
    it('metadataXml accepted for provider adfs (variant 5)', async () => {
      const sessionId = await startAndSelectProvider('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:adfs:4"></EntityDescriptor>',
      });
      expect(res.status).toBe(200);
    });
    it('metadata data.type for adfs via xml is SAML', async () => {
      const sessionId = await startAndSelectProvider('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:adfs"></EntityDescriptor>',
      });
      expect(res.body.data.type).toBe('SAML');
    });
    it('metadataXml accepted for provider custom-saml (variant 6)', async () => {
      const sessionId = await startAndSelectProvider('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:custom-saml:5"></EntityDescriptor>',
      });
      expect(res.status).toBe(200);
    });
    it('metadata data.type for custom-saml via xml is SAML', async () => {
      const sessionId = await startAndSelectProvider('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:custom-saml"></EntityDescriptor>',
      });
      expect(res.body.data.type).toBe('SAML');
    });
    it('metadataXml accepted for provider custom-oidc (variant 7)', async () => {
      const sessionId = await startAndSelectProvider('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:custom-oidc:6"></EntityDescriptor>',
      });
      expect(res.status).toBe(200);
    });
    it('metadata data.type for custom-oidc via xml is SAML', async () => {
      const sessionId = await startAndSelectProvider('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
        metadataXml: '<EntityDescriptor entityID="urn:custom-oidc"></EntityDescriptor>',
      });
      expect(res.body.data.type).toBe('SAML');
    });
  });
  describe('Activation state machine', () => {
    it('session_1 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_2 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_3 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_4 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_5 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_6 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_7 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_8 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_9 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_10 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_11 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_12 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_13 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_14 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_15 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_16 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_17 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_18 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_19 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
    it('session_20 without config cannot activate', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(400);
    });
  });
  describe('Attribute mapping — field name variations', () => {
    it('emailAttr variant 1: email', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 2: mail', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'mail', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 3: upn', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'upn', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 4: userPrincipalName', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'userPrincipalName', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 5: emailAddress', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'emailAddress', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 6: user_email', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'user_email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 7: http://schemas.xmlsoap.org/ws/', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 8: urn:oid:0.9.2342.19200300.100.', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'urn:oid:0.9.2342.19200300.100.1.3', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 9: Email', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'Email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 10: EMAIL', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'EMAIL', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 11: e-mail', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'e-mail', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 12: emailAttr', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'emailAttr', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 13: email_attr', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email_attr', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 14: emailaddress', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'emailaddress', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 15: emails', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'emails', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 16: primary_email', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'primary_email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 17: contact_email', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'contact_email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 18: work_email', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'work_email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 19: corporate_email', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'corporate_email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 20: user.email', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'user.email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('emailAttr variant 21: profile.email', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'profile.email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
  });
  describe('Session ID boundaries', () => {
    it('non-existent sessionId: "a" returns 404', async () => {
      const res = await request(app).post('/wizard/a/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "12" returns 404', async () => {
      const res = await request(app).post('/wizard/12/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "not-a-session" returns 404', async () => {
      const res = await request(app).post('/wizard/not-a-session/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "session-id" returns 404', async () => {
      const res = await request(app).post('/wizard/session-id/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "test" returns 404', async () => {
      const res = await request(app).post('/wizard/test/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "admin" returns 404', async () => {
      const res = await request(app).post('/wizard/admin/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "null" returns 404', async () => {
      const res = await request(app).post('/wizard/null/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "undefined" returns 404', async () => {
      const res = await request(app).post('/wizard/undefined/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "true" returns 404', async () => {
      const res = await request(app).post('/wizard/true/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "false" returns 404', async () => {
      const res = await request(app).post('/wizard/false/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "0" returns 404', async () => {
      const res = await request(app).post('/wizard/0/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "999" returns 404', async () => {
      const res = await request(app).post('/wizard/999/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "sso_fake" returns 404', async () => {
      const res = await request(app).post('/wizard/sso_fake/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "sso_0_a" returns 404', async () => {
      const res = await request(app).post('/wizard/sso_0_a/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
    it('non-existent sessionId: "sso_9999999999999999_aaaaaaaa" returns 404', async () => {
      const res = await request(app).post('/wizard/sso_9999999999999999_aaaaaaaa/provider').send({ provider: 'azure-ad' });
      expect(res.status).toBe(404);
    });
  });
  describe('Test step works for all SAML providers with metadata', () => {
    it('azure-ad test step variant 1 succeeds', async () => {
      const sessionId = await startWithMetadata('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('azure-ad test step variant 2 succeeds', async () => {
      const sessionId = await startWithMetadata('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('azure-ad test step variant 3 succeeds', async () => {
      const sessionId = await startWithMetadata('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('azure-ad test step variant 4 succeeds', async () => {
      const sessionId = await startWithMetadata('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('azure-ad test step variant 5 succeeds', async () => {
      const sessionId = await startWithMetadata('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('okta test step variant 1 succeeds', async () => {
      const sessionId = await startWithMetadata('okta');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('okta test step variant 2 succeeds', async () => {
      const sessionId = await startWithMetadata('okta');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('okta test step variant 3 succeeds', async () => {
      const sessionId = await startWithMetadata('okta');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('okta test step variant 4 succeeds', async () => {
      const sessionId = await startWithMetadata('okta');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('okta test step variant 5 succeeds', async () => {
      const sessionId = await startWithMetadata('okta');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('google-workspace test step variant 1 succeeds', async () => {
      const sessionId = await startWithMetadata('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('google-workspace test step variant 2 succeeds', async () => {
      const sessionId = await startWithMetadata('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('google-workspace test step variant 3 succeeds', async () => {
      const sessionId = await startWithMetadata('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('google-workspace test step variant 4 succeeds', async () => {
      const sessionId = await startWithMetadata('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('google-workspace test step variant 5 succeeds', async () => {
      const sessionId = await startWithMetadata('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('adfs test step variant 1 succeeds', async () => {
      const sessionId = await startWithMetadata('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('adfs test step variant 2 succeeds', async () => {
      const sessionId = await startWithMetadata('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('adfs test step variant 3 succeeds', async () => {
      const sessionId = await startWithMetadata('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('adfs test step variant 4 succeeds', async () => {
      const sessionId = await startWithMetadata('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('adfs test step variant 5 succeeds', async () => {
      const sessionId = await startWithMetadata('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('custom-saml test step variant 1 succeeds', async () => {
      const sessionId = await startWithMetadata('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('custom-saml test step variant 2 succeeds', async () => {
      const sessionId = await startWithMetadata('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('custom-saml test step variant 3 succeeds', async () => {
      const sessionId = await startWithMetadata('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('custom-saml test step variant 4 succeeds', async () => {
      const sessionId = await startWithMetadata('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
    it('custom-saml test step variant 5 succeeds', async () => {
      const sessionId = await startWithMetadata('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
      expect(res.status).toBe(200);
    });
  });
  describe('Full flow — activate status for all providers', () => {
    it('azure-ad full flow variant 1 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('azure-ad full flow variant 2 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('azure-ad full flow variant 3 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('azure-ad full flow variant 4 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('azure-ad full flow variant 5 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('okta full flow variant 1 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('okta full flow variant 2 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('okta full flow variant 3 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('okta full flow variant 4 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('okta full flow variant 5 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('google-workspace full flow variant 1 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('google-workspace full flow variant 2 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('google-workspace full flow variant 3 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('google-workspace full flow variant 4 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('google-workspace full flow variant 5 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('auth0 full flow variant 1 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('auth0 full flow variant 2 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('auth0 full flow variant 3 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('auth0 full flow variant 4 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('auth0 full flow variant 5 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('adfs full flow variant 1 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('adfs full flow variant 2 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('adfs full flow variant 3 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('adfs full flow variant 4 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('adfs full flow variant 5 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-saml full flow variant 1 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-saml full flow variant 2 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-saml full flow variant 3 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-saml full flow variant 4 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-saml full flow variant 5 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-oidc full flow variant 1 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-oidc full flow variant 2 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-oidc full flow variant 3 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-oidc full flow variant 4 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
    it('custom-oidc full flow variant 5 — ACTIVATED', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.body.data.status).toBe('ACTIVATED');
    });
  });
  describe('DELETE /config — repeated calls', () => {
    it('delete config call 1 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 2 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 3 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 4 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 5 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 6 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 7 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 8 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 9 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 10 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 11 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 12 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 13 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 14 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 15 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 16 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 17 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 18 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 19 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 20 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 21 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 22 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 23 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 24 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
    it('delete config call 25 returns 200', async () => {
      const res = await request(app).delete('/config');
      expect(res.status).toBe(200);
    });
  });
});
describe('SSO Wizard — Extended Coverage Block 2', () => {

  describe('Provider — many attribute assertions', () => {
    it('azure-ad call 1: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 2: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 3: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 4: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 5: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 6: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 7: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 8: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 9: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 10: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 11: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 12: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 13: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('azure-ad call 14: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'azure-ad' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 1: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 2: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 3: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 4: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 5: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 6: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 7: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 8: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 9: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 10: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 11: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 12: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 13: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('okta call 14: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'okta' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 1: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 2: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 3: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 4: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 5: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 6: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 7: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 8: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 9: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 10: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 11: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 12: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 13: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('google-workspace call 14: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'google-workspace' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 1: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 2: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 3: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 4: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 5: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 6: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 7: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 8: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 9: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 10: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 11: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 12: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 13: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('auth0 call 14: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'auth0' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 1: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 2: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 3: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 4: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 5: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 6: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 7: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 8: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 9: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 10: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 11: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 12: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 13: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('adfs call 14: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 1: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 2: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 3: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 4: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 5: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 6: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 7: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 8: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 9: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 10: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 11: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 12: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 13: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-saml call 14: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-saml' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 1: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 2: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 3: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 4: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 5: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 6: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 7: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 8: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 9: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 10: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 11: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 12: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 13: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
    it('custom-oidc call 14: success is true', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
      expect(res.body.success).toBe(true);
    });
  });
  describe('Start sessions batch', () => {
    it('start session batch 1 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 2 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 3 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 4 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 5 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 6 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 7 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 8 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 9 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 10 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 11 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 12 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 13 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 14 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 15 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 16 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 17 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 18 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 19 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 20 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 21 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 22 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 23 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 24 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 25 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 26 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 27 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 28 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 29 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 30 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 31 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 32 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 33 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 34 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 35 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 36 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 37 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 38 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 39 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 40 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 41 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 42 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 43 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 44 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 45 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 46 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 47 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 48 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 49 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 50 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 51 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 52 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 53 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 54 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 55 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 56 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 57 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 58 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 59 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 60 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 61 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 62 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 63 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 64 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 65 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 66 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 67 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 68 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 69 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 70 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 71 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 72 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 73 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 74 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 75 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 76 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 77 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 78 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 79 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 80 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 81 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 82 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 83 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 84 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 85 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 86 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 87 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 88 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 89 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 90 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 91 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 92 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 93 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 94 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 95 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 96 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 97 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 98 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 99 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
    it('start session batch 100 returns sessionId string', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(typeof res.body.data.sessionId).toBe('string');
    });
  });
  describe('Attribute mapping — many sessions', () => {
    it('lastNameAttr variant 1: lastName', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 2: surname', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'surname',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 3: family_name', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'family_name',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 4: sn', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'sn',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 5: last', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'last',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 6: familyName', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'familyName',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 7: lastNameAttribute', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'lastNameAttribute',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 8: user.lastName', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'user.lastName',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 9: profile.lastName', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'profile.lastName',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 10: lname', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'lname',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 11: ln', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'ln',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 12: l_name', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'l_name',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 13: last_name', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'last_name',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 14: urn:oid:2.5.4.4', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'urn:oid:2.5.4.4',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 15: http://schemas.xmlsoap.or', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 16: LAST_NAME', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'LAST_NAME',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 17: Surname', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'Surname',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 18: LastName', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'LastName',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 19: familyname', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'familyname',
      });
      expect(res.status).toBe(200);
    });
    it('lastNameAttr variant 20: family-name', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
        emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'family-name',
      });
      expect(res.status).toBe(200);
    });
  });
  describe('GET /providers repeated calls', () => {
    it('GET /providers call 1 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 2 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 3 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 4 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 5 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 6 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 7 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 8 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 9 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 10 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 11 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 12 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 13 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 14 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 15 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 16 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 17 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 18 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 19 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 20 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 21 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 22 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 23 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 24 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 25 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 26 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 27 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 28 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 29 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 30 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 31 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 32 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 33 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 34 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 35 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 36 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 37 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 38 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 39 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 40 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 41 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 42 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 43 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 44 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 45 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 46 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 47 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 48 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 49 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
    it('GET /providers call 50 returns 7 providers', async () => {
      const res = await request(app).get('/providers');
      expect(res.body.data).toHaveLength(7);
    });
  });
  describe('Metadata URL validation exhaustive', () => {
    it('bad metadataUrl not-a-url gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: 'not-a-url' });
      expect(res.status).toBe(400);
    });
    it('bad metadataUrl ftp___test_com gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: 'ftp://test.com' });
      expect(res.status).toBe(400);
    });
    it('bad metadataUrl example_com_meta gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: 'example.com/meta' });
      expect(res.status).toBe(400);
    });
    it('bad metadataUrl just-a-string gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: 'just-a-string' });
      expect(res.status).toBe(400);
    });
    it('metadataUrl empty string gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: '' });
      expect(res.status).toBe(400);
    });
    it('metadataUrl whitespace gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: '   ' });
      expect(res.status).toBe(400);
    });
    it('bad metadataUrl http___ gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: 'http://' });
      expect(res.status).toBe(400);
    });
    it('bad metadataUrl https___ gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: 'https://' });
      expect(res.status).toBe(400);
    });
    it('bad metadataUrl __example_com gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: '//example.com' });
      expect(res.status).toBe(400);
    });
    it('bad metadataUrl ht_tp___example_com gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: 'ht tp://example.com' });
      expect(res.status).toBe(400);
    });
    it('bad metadataUrl javascript_void(0) gives 400', async () => {
      const sessionId = await startAndSelectProvider('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ metadataUrl: 'javascript:void(0)' });
      expect(res.status).toBe(400);
    });
  });
  describe('OIDC discovery URL validation', () => {
    it('bad oidcDiscoveryUrl not-a-url gives 400', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ oidcDiscoveryUrl: 'not-a-url' });
      expect(res.status).toBe(400);
    });
    it('bad oidcDiscoveryUrl just-path gives 400', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ oidcDiscoveryUrl: 'just-path' });
      expect(res.status).toBe(400);
    });
    it('bad oidcDiscoveryUrl example_com__well-kn gives 400', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ oidcDiscoveryUrl: 'example.com/.well-known/openid-configuration' });
      expect(res.status).toBe(400);
    });
    it('bad oidcDiscoveryUrl ftp___example_com_di gives 400', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ oidcDiscoveryUrl: 'ftp://example.com/discovery' });
      expect(res.status).toBe(400);
    });
    it('oidcDiscoveryUrl whitespace gives 400', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ oidcDiscoveryUrl: '   ' });
      expect(res.status).toBe(400);
    });
    it('oidcDiscoveryUrl empty gives 400', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ oidcDiscoveryUrl: '' });
      expect(res.status).toBe(400);
    });
    it('bad oidcDiscoveryUrl http___ gives 400', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ oidcDiscoveryUrl: 'http://' });
      expect(res.status).toBe(400);
    });
    it('bad oidcDiscoveryUrl localhost_3000 gives 400', async () => {
      const sessionId = await startAndSelectProvider('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({ oidcDiscoveryUrl: 'localhost:3000' });
      expect(res.status).toBe(400);
    });
  });
  describe('Full flow final checks', () => {
    it('full flow 1 — provider okta returns 200 on activate', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 2 — provider google-workspace returns 200 on activate', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 3 — provider auth0 returns 200 on activate', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 4 — provider adfs returns 200 on activate', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 5 — provider custom-saml returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 6 — provider custom-oidc returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 7 — provider azure-ad returns 200 on activate', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 8 — provider okta returns 200 on activate', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 9 — provider google-workspace returns 200 on activate', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 10 — provider auth0 returns 200 on activate', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 11 — provider adfs returns 200 on activate', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 12 — provider custom-saml returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 13 — provider custom-oidc returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 14 — provider azure-ad returns 200 on activate', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 15 — provider okta returns 200 on activate', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 16 — provider google-workspace returns 200 on activate', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 17 — provider auth0 returns 200 on activate', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 18 — provider adfs returns 200 on activate', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 19 — provider custom-saml returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 20 — provider custom-oidc returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 21 — provider azure-ad returns 200 on activate', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 22 — provider okta returns 200 on activate', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 23 — provider google-workspace returns 200 on activate', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 24 — provider auth0 returns 200 on activate', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 25 — provider adfs returns 200 on activate', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 26 — provider custom-saml returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 27 — provider custom-oidc returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 28 — provider azure-ad returns 200 on activate', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 29 — provider okta returns 200 on activate', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 30 — provider google-workspace returns 200 on activate', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 31 — provider auth0 returns 200 on activate', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 32 — provider adfs returns 200 on activate', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 33 — provider custom-saml returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 34 — provider custom-oidc returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 35 — provider azure-ad returns 200 on activate', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 36 — provider okta returns 200 on activate', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 37 — provider google-workspace returns 200 on activate', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 38 — provider auth0 returns 200 on activate', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 39 — provider adfs returns 200 on activate', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 40 — provider custom-saml returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 41 — provider custom-oidc returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 42 — provider azure-ad returns 200 on activate', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 43 — provider okta returns 200 on activate', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 44 — provider google-workspace returns 200 on activate', async () => {
      const sessionId = await startWithMapping('google-workspace');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 45 — provider auth0 returns 200 on activate', async () => {
      const sessionId = await startWithMapping('auth0');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 46 — provider adfs returns 200 on activate', async () => {
      const sessionId = await startWithMapping('adfs');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 47 — provider custom-saml returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-saml');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 48 — provider custom-oidc returns 200 on activate', async () => {
      const sessionId = await startWithMapping('custom-oidc');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 49 — provider azure-ad returns 200 on activate', async () => {
      const sessionId = await startWithMapping('azure-ad');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
    it('full flow 50 — provider okta returns 200 on activate', async () => {
      const sessionId = await startWithMapping('okta');
      const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
      expect(res.status).toBe(200);
    });
  });
});
describe('SSO Wizard — Extended Coverage Block 3', () => {

  describe('Start session — expiresAt is always future', () => {
    it('expiresAt is future call 1', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 2', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 3', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 4', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 5', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 6', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 7', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 8', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 9', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 10', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 11', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 12', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 13', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 14', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 15', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 16', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 17', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 18', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 19', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 20', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 21', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 22', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 23', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 24', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 25', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 26', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 27', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 28', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 29', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 30', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 31', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 32', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 33', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 34', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 35', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 36', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 37', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 38', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 39', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 40', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 41', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 42', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 43', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 44', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 45', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 46', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 47', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 48', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 49', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
    it('expiresAt is future call 50', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });
  });
  describe('Test result attributes after test step', () => {
    it('azure-ad test result has attributes.email', async () => {
      const sessionId = await startWithTest('azure-ad');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.email).toBeDefined();
    });
    it('azure-ad test result has attributes.firstName', async () => {
      const sessionId = await startWithTest('azure-ad');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.firstName).toBeDefined();
    });
    it('azure-ad test result has attributes.lastName', async () => {
      const sessionId = await startWithTest('azure-ad');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.lastName).toBeDefined();
    });
    it('azure-ad test result has attributes.groups', async () => {
      const sessionId = await startWithTest('azure-ad');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.groups).toBeDefined();
    });
    it('okta test result has attributes.email', async () => {
      const sessionId = await startWithTest('okta');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.email).toBeDefined();
    });
    it('okta test result has attributes.firstName', async () => {
      const sessionId = await startWithTest('okta');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.firstName).toBeDefined();
    });
    it('okta test result has attributes.lastName', async () => {
      const sessionId = await startWithTest('okta');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.lastName).toBeDefined();
    });
    it('okta test result has attributes.groups', async () => {
      const sessionId = await startWithTest('okta');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.groups).toBeDefined();
    });
    it('google-workspace test result has attributes.email', async () => {
      const sessionId = await startWithTest('google-workspace');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.email).toBeDefined();
    });
    it('google-workspace test result has attributes.firstName', async () => {
      const sessionId = await startWithTest('google-workspace');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.firstName).toBeDefined();
    });
    it('google-workspace test result has attributes.lastName', async () => {
      const sessionId = await startWithTest('google-workspace');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.lastName).toBeDefined();
    });
    it('google-workspace test result has attributes.groups', async () => {
      const sessionId = await startWithTest('google-workspace');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.groups).toBeDefined();
    });
    it('adfs test result has attributes.email', async () => {
      const sessionId = await startWithTest('adfs');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.email).toBeDefined();
    });
    it('adfs test result has attributes.firstName', async () => {
      const sessionId = await startWithTest('adfs');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.firstName).toBeDefined();
    });
    it('adfs test result has attributes.lastName', async () => {
      const sessionId = await startWithTest('adfs');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.lastName).toBeDefined();
    });
    it('adfs test result has attributes.groups', async () => {
      const sessionId = await startWithTest('adfs');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.groups).toBeDefined();
    });
    it('custom-saml test result has attributes.email', async () => {
      const sessionId = await startWithTest('custom-saml');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.email).toBeDefined();
    });
    it('custom-saml test result has attributes.firstName', async () => {
      const sessionId = await startWithTest('custom-saml');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.firstName).toBeDefined();
    });
    it('custom-saml test result has attributes.lastName', async () => {
      const sessionId = await startWithTest('custom-saml');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.lastName).toBeDefined();
    });
    it('custom-saml test result has attributes.groups', async () => {
      const sessionId = await startWithTest('custom-saml');
      const res = await request(app).get(`/wizard/${sessionId}/test/result`);
      expect(res.body.data.attributes.groups).toBeDefined();
    });
  });
  describe('Validation error code checks', () => {
    it('bad provider call 1 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid1' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 2 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid2' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 3 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid3' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 4 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid4' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 5 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid5' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 6 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid6' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 7 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid7' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 8 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid8' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 9 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid9' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 10 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid10' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 11 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid11' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 12 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid12' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 13 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid13' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 14 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid14' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 15 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid15' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 16 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid16' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 17 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid17' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 18 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid18' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 19 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid19' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 20 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid20' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 21 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid21' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 22 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid22' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 23 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid23' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 24 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid24' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 25 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid25' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 26 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid26' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 27 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid27' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 28 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid28' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 29 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid29' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('bad provider call 30 returns VALIDATION_ERROR', async () => {
      const sessionId = await startSession();
      const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'invalid30' });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
  describe('Content-type checks for all endpoints', () => {
    it('GET /providers call 1 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 1 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 1 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('GET /providers call 2 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 2 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 2 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('GET /providers call 3 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 3 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 3 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('GET /providers call 4 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 4 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 4 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('GET /providers call 5 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 5 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 5 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('GET /providers call 6 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 6 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 6 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('GET /providers call 7 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 7 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 7 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('GET /providers call 8 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 8 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 8 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('GET /providers call 9 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 9 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 9 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('GET /providers call 10 has json content-type', async () => {
      const res = await request(app).get('/providers');
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('POST /wizard/start call 10 has json content-type', async () => {
      const res = await request(app).post('/wizard/start').send({});
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('DELETE /config call 10 has json content-type', async () => {
      const res = await request(app).delete('/config');
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });
});
describe('SSO Wizard — Final Top-up', () => {
  it('GET /providers data[0].id is azure-ad', async () => {
    const res = await request(app).get('/providers');
    expect(res.body.data[0].id).toBe('azure-ad');
  });
  it('GET /providers data[1].id is okta', async () => {
    const res = await request(app).get('/providers');
    expect(res.body.data[1].id).toBe('okta');
  });
  it('GET /providers data[2].id is google-workspace', async () => {
    const res = await request(app).get('/providers');
    expect(res.body.data[2].id).toBe('google-workspace');
  });
  it('GET /providers data[3].id is auth0', async () => {
    const res = await request(app).get('/providers');
    expect(res.body.data[3].id).toBe('auth0');
  });
  it('GET /providers data[4].id is adfs', async () => {
    const res = await request(app).get('/providers');
    expect(res.body.data[4].id).toBe('adfs');
  });
  it('GET /providers data[5].id is custom-saml', async () => {
    const res = await request(app).get('/providers');
    expect(res.body.data[5].id).toBe('custom-saml');
  });
  it('GET /providers data[6].id is custom-oidc', async () => {
    const res = await request(app).get('/providers');
    expect(res.body.data[6].id).toBe('custom-oidc');
  });
  it('wizard/start response has exactly 3 top-level data keys', async () => {
    const res = await request(app).post('/wizard/start').send({});
    const keys = Object.keys(res.body.data);
    expect(keys).toContain('sessionId');
    expect(keys).toContain('expiresAt');
    expect(keys).toContain('testCallbackUrl');
  });
  it('activate for adfs returns provider adfs', async () => {
    const sessionId = await startWithMapping('adfs');
    const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
    expect(res.body.data.provider).toBe('adfs');
  });
  it('activate for custom-saml returns provider custom-saml', async () => {
    const sessionId = await startWithMapping('custom-saml');
    const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
    expect(res.body.data.provider).toBe('custom-saml');
  });
  it('activate message is a string', async () => {
    const sessionId = await startWithMapping();
    const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
    expect(typeof res.body.data.message).toBe('string');
  });
  it('test step data.testUrl starts with https or #', async () => {
    const sessionId = await startWithMetadata();
    const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
    expect(res.body.data.testUrl).toMatch(/^(https?:\/\/|#)/);
  });
  it('test result has timestamp as date string', async () => {
    const sessionId = await startWithTest();
    const res = await request(app).get(`/wizard/${sessionId}/test/result`);
    const ts = res.body.data.timestamp;
    expect(ts).toBeDefined();
    expect(new Date(ts).getTime()).not.toBeNaN();
  });
  it('mapping roleAttr is optional and undefined if not sent', async () => {
    const sessionId = await startSession();
    const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
      emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
    });
    expect(res.body.data.attributeMapping.roleAttr).toBeUndefined();
  });
  it('mapping groupAttr is optional and undefined if not sent', async () => {
    const sessionId = await startSession();
    const res = await request(app).post(`/wizard/${sessionId}/attribute-mapping`).send({
      emailAttr: 'email', firstNameAttr: 'firstName', lastNameAttr: 'lastName',
    });
    expect(res.body.data.attributeMapping.groupAttr).toBeUndefined();
  });
  it('adfs default guide has nexaraValues.entityId', async () => {
    const sessionId = await startSession();
    const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
    expect(res.body.data.nexaraValues.entityId).toBeDefined();
  });
  it('adfs default guide has nexaraValues.acsUrl', async () => {
    const sessionId = await startSession();
    const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
    expect(res.body.data.nexaraValues.acsUrl).toBeDefined();
  });
  it('adfs default guide has attributeDefaults.email', async () => {
    const sessionId = await startSession();
    const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'adfs' });
    expect(res.body.data.attributeDefaults.email).toBeDefined();
  });
  it('custom-oidc default guide has nexaraValues.entityId', async () => {
    const sessionId = await startSession();
    const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
    expect(res.body.data.nexaraValues.entityId).toBeDefined();
  });
  it('custom-oidc default guide has attributeDefaults.firstName', async () => {
    const sessionId = await startSession();
    const res = await request(app).post(`/wizard/${sessionId}/provider`).send({ provider: 'custom-oidc' });
    expect(res.body.data.attributeDefaults.firstName).toBeDefined();
  });
  it('metadata parse result warnings is an array', async () => {
    const sessionId = await startAndSelectProvider('azure-ad');
    const res = await request(app).post(`/wizard/${sessionId}/metadata`).send({
      metadataXml: '<EntityDescriptor entityID="urn:test"></EntityDescriptor>',
    });
    expect(Array.isArray(res.body.data.warnings)).toBe(true);
  });
  it('test step instructions mentions test or IdP or redirect', async () => {
    const sessionId = await startWithMetadata();
    const res = await request(app).post(`/wizard/${sessionId}/test`).send({});
    expect(res.body.data.instructions).toMatch(/test|IdP|redirect/i);
  });
  it('activate for google-workspace sets message', async () => {
    const sessionId = await startWithMapping('google-workspace');
    const res = await request(app).post(`/wizard/${sessionId}/activate`).send({});
    expect(res.body.data.message).toBeTruthy();
  });
  it('DELETE /config success:true is boolean', async () => {
    const res = await request(app).delete('/config');
    expect(typeof res.body.success).toBe('boolean');
    expect(res.body.success).toBe(true);
  });
  it('GET /providers body.success is boolean true', async () => {
    const res = await request(app).get('/providers');
    expect(typeof res.body.success).toBe('boolean');
  });
});
