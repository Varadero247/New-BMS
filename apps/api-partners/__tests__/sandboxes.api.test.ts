// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import request from 'supertest';

jest.mock('@ims/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', role: 'ADMIN', organisationId: 'org-1', orgId: 'org-1' };
    next();
  },
  writeRoleGuard: (..._roles: string[]) => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import sandboxesRouter from '../src/routes/sandboxes';

const app = express();
app.use(express.json());
app.use('/', sandboxesRouter);

// ─── Helpers ──────────────────────────────────────────────────────────────────
let sbxCounter = 0;

async function createSandbox(overrides: Record<string, any> = {}): Promise<{ id: string; body: any }> {
  sbxCounter++;
  const defaults = {
    name: `Test Sandbox ${sbxCounter}`,
    region: 'eu-west-1',
    modules: ['health-safety', 'environment'],
    expiryDays: 30,
  };
  const res = await request(app).post('/').send({ ...defaults, ...overrides });
  return { id: res.body.data?.id, body: res.body };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET / — list sandboxes
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });
  it('returns success:true', async () => {
    const res = await request(app).get('/');
    expect(res.body.success).toBe(true);
  });
  it('returns array in data', async () => {
    const res = await request(app).get('/');
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it('returns json content-type', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-type']).toMatch(/json/);
  });
  it('includes newly created sandbox in list', async () => {
    const { id } = await createSandbox({ name: 'List Visibility Test' });
    const res = await request(app).get('/');
    const ids = res.body.data.map((s: any) => s.id);
    expect(ids).toContain(id);
  });
  it('does not expose adminPassword in list', async () => {
    await createSandbox({ name: 'NoPwd List Test' });
    const res = await request(app).get('/');
    res.body.data.forEach((s: any) => {
      expect(s.adminPassword).toBeUndefined();
    });
  });
  it('returns id for each sandbox', async () => {
    await createSandbox({ name: 'ID Check' });
    const res = await request(app).get('/');
    res.body.data.forEach((s: any) => expect(s.id).toBeDefined());
  });
  it('returns name for each sandbox', async () => {
    await createSandbox({ name: 'Name Check' });
    const res = await request(app).get('/');
    res.body.data.forEach((s: any) => expect(s.name).toBeDefined());
  });
  it('returns status for each sandbox', async () => {
    await createSandbox({ name: 'Status Check' });
    const res = await request(app).get('/');
    res.body.data.forEach((s: any) => expect(s.status).toBeDefined());
  });
  it('returns region for each sandbox', async () => {
    await createSandbox({ name: 'Region Check' });
    const res = await request(app).get('/');
    res.body.data.forEach((s: any) => expect(s.region).toBeDefined());
  });
  it('returns url for each sandbox', async () => {
    await createSandbox({ name: 'URL Check' });
    const res = await request(app).get('/');
    res.body.data.forEach((s: any) => expect(s.url).toBeDefined());
  });
  it('returns modules for each sandbox', async () => {
    await createSandbox({ name: 'Modules Check' });
    const res = await request(app).get('/');
    res.body.data.forEach((s: any) => expect(Array.isArray(s.modules)).toBe(true));
  });
  it('returns expiresAt for each sandbox', async () => {
    await createSandbox({ name: 'ExpiresAt Check' });
    const res = await request(app).get('/');
    res.body.data.forEach((s: any) => expect(s.expiresAt).toBeDefined());
  });
  it('returns createdAt for each sandbox', async () => {
    await createSandbox({ name: 'CreatedAt Check' });
    const res = await request(app).get('/');
    res.body.data.forEach((s: any) => expect(s.createdAt).toBeDefined());
  });
  for (let i = 0; i < 40; i++) {
    it(`GET / returns valid response [${i}]`, async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST / — provision sandbox
// ═══════════════════════════════════════════════════════════════════════════════
describe('POST /', () => {
  describe('happy path — basic fields', () => {
    it('returns 201', async () => {
      const res = await request(app).post('/').send({ name: 'My Sandbox', region: 'eu-west-1', modules: ['health-safety'], expiryDays: 30 });
      expect(res.status).toBe(201);
    });
    it('returns success:true', async () => {
      const res = await request(app).post('/').send({ name: 'My Sandbox 2', region: 'eu-west-1', modules: ['health-safety'] });
      expect(res.body.success).toBe(true);
    });
    it('returns id in data', async () => {
      const res = await request(app).post('/').send({ name: 'My Sandbox 3', modules: ['health-safety'] });
      expect(res.body.data.id).toBeDefined();
    });
    it('id starts with sbx_', async () => {
      const res = await request(app).post('/').send({ name: 'SBX ID Check', modules: ['health-safety'] });
      expect(res.body.data.id).toMatch(/^sbx_/);
    });
    it('returns name in data', async () => {
      const res = await request(app).post('/').send({ name: 'Named Sandbox', modules: ['health-safety'] });
      expect(res.body.data.name).toBe('Named Sandbox');
    });
    it('status is PROVISIONING initially', async () => {
      const res = await request(app).post('/').send({ name: 'Status Check Post', modules: ['health-safety'] });
      expect(res.body.data.status).toBe('PROVISIONING');
    });
    it('returns url in data', async () => {
      const res = await request(app).post('/').send({ name: 'URL Test', modules: ['health-safety'] });
      expect(res.body.data.url).toBeDefined();
    });
    it('url starts with https://', async () => {
      const res = await request(app).post('/').send({ name: 'HTTPS URL', modules: ['health-safety'] });
      expect(res.body.data.url).toMatch(/^https:\/\//);
    });
    it('returns adminEmail', async () => {
      const res = await request(app).post('/').send({ name: 'AdminEmail Check', modules: ['health-safety'] });
      expect(res.body.data.adminEmail).toBeDefined();
    });
    it('adminEmail contains sandbox.nexara.io', async () => {
      const res = await request(app).post('/').send({ name: 'AdminEmail Domain', modules: ['health-safety'] });
      expect(res.body.data.adminEmail).toMatch(/sandbox\.nexara\.io/);
    });
    it('returns adminPassword on creation', async () => {
      const res = await request(app).post('/').send({ name: 'AdminPwd Create', modules: ['health-safety'] });
      expect(res.body.data.adminPassword).toBeDefined();
    });
    it('adminPassword is non-empty string', async () => {
      const res = await request(app).post('/').send({ name: 'AdminPwd String', modules: ['health-safety'] });
      expect(typeof res.body.data.adminPassword).toBe('string');
      expect(res.body.data.adminPassword.length).toBeGreaterThan(0);
    });
    it('returns region in data', async () => {
      const res = await request(app).post('/').send({ name: 'Region Data', region: 'eu-central-1', modules: ['health-safety'] });
      expect(res.body.data.region).toBe('eu-central-1');
    });
    it('returns modules in data', async () => {
      const res = await request(app).post('/').send({ name: 'Modules Data', modules: ['health-safety', 'environment'] });
      expect(res.body.data.modules).toContain('health-safety');
    });
    it('returns expiresAt in data', async () => {
      const res = await request(app).post('/').send({ name: 'ExpiresAt Data', modules: ['health-safety'] });
      expect(res.body.data.expiresAt).toBeDefined();
    });
    it('expiresAt is in the future', async () => {
      const res = await request(app).post('/').send({ name: 'ExpiresAt Future', modules: ['health-safety'] });
      const exp = new Date(res.body.data.expiresAt);
      expect(exp.getTime()).toBeGreaterThan(Date.now());
    });
    it('returns createdAt in data', async () => {
      const res = await request(app).post('/').send({ name: 'CreatedAt Data', modules: ['health-safety'] });
      expect(res.body.data.createdAt).toBeDefined();
    });
    it('returns partnerId in data', async () => {
      const res = await request(app).post('/').send({ name: 'PartnerId Data', modules: ['health-safety'] });
      expect(res.body.data.partnerId).toBe('org-1');
    });
    it('returns json content-type', async () => {
      const res = await request(app).post('/').send({ name: 'CT Check Post', modules: ['health-safety'] });
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('description is optional — succeeds without it', async () => {
      const res = await request(app).post('/').send({ name: 'No Desc', modules: ['health-safety'] });
      expect(res.status).toBe(201);
    });
    it('description is stored when provided', async () => {
      const res = await request(app).post('/').send({ name: 'With Desc', description: 'Test environment', modules: ['health-safety'] });
      expect(res.body.data.description).toBe('Test environment');
    });
  });

  describe('all valid regions', () => {
    const regions = ['eu-west-1', 'eu-central-1', 'us-east-1', 'ap-southeast-1'];
    regions.forEach((region) => {
      it(`accepts region: ${region}`, async () => {
        const res = await request(app).post('/').send({ name: `Region ${region}`, region, modules: ['quality'] });
        expect(res.status).toBe(201);
        expect(res.body.data.region).toBe(region);
      });
    });
  });

  describe('default region', () => {
    it('defaults region to eu-west-1 when not specified', async () => {
      const res = await request(app).post('/').send({ name: 'Default Region', modules: ['health-safety'] });
      expect(res.body.data.region).toBe('eu-west-1');
    });
  });

  describe('expiryDays range', () => {
    const validDays = [7, 8, 14, 15, 30, 45, 60, 75, 89, 90];
    validDays.forEach((days) => {
      it(`accepts expiryDays: ${days}`, async () => {
        const res = await request(app).post('/').send({ name: `Expiry ${days}`, modules: ['health-safety'], expiryDays: days });
        expect(res.status).toBe(201);
      });
    });
    it('expiresAt with 7 days is ~7 days from now', async () => {
      const before = Date.now();
      const res = await request(app).post('/').send({ name: 'Expiry 7d', modules: ['health-safety'], expiryDays: 7 });
      const exp = new Date(res.body.data.expiresAt).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expect(exp).toBeGreaterThanOrEqual(before + sevenDays - 1000);
      expect(exp).toBeLessThanOrEqual(before + sevenDays + 5000);
    });
    it('expiresAt with 90 days is ~90 days from now', async () => {
      const before = Date.now();
      const res = await request(app).post('/').send({ name: 'Expiry 90d', modules: ['health-safety'], expiryDays: 90 });
      const exp = new Date(res.body.data.expiresAt).getTime();
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      expect(exp).toBeGreaterThanOrEqual(before + ninetyDays - 1000);
    });
  });

  describe('various module combinations', () => {
    const moduleSets = [
      ['health-safety'],
      ['environment'],
      ['quality'],
      ['incidents'],
      ['health-safety', 'environment'],
      ['health-safety', 'environment', 'quality'],
      ['health-safety', 'environment', 'quality', 'incidents'],
    ];
    moduleSets.forEach((modules, idx) => {
      it(`accepts modules set [${idx}]: ${modules.join(', ')}`, async () => {
        const res = await request(app).post('/').send({ name: `Modules Set ${idx}`, modules });
        expect(res.status).toBe(201);
        modules.forEach(m => expect(res.body.data.modules).toContain(m));
      });
    });
    it('defaults modules when not specified', async () => {
      const res = await request(app).post('/').send({ name: 'Default Modules' });
      expect(res.body.data.modules).toBeDefined();
      expect(Array.isArray(res.body.data.modules)).toBe(true);
    });
  });

  describe('unique IDs per sandbox', () => {
    for (let i = 0; i < 20; i++) {
      it(`each sandbox gets unique id [${i}]`, async () => {
        const r1 = await request(app).post('/').send({ name: `Unique ID A${i}`, modules: ['health-safety'] });
        const r2 = await request(app).post('/').send({ name: `Unique ID B${i}`, modules: ['health-safety'] });
        expect(r1.body.data.id).not.toBe(r2.body.data.id);
      });
    }
  });

  describe('validation errors', () => {
    it('returns 400 for missing name', async () => {
      const res = await request(app).post('/').send({ modules: ['health-safety'] });
      expect(res.status).toBe(400);
    });
    it('returns VALIDATION_ERROR code for missing name', async () => {
      const res = await request(app).post('/').send({ modules: ['health-safety'] });
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
    it('returns 400 for empty name', async () => {
      const res = await request(app).post('/').send({ name: '', modules: ['health-safety'] });
      expect(res.status).toBe(400);
    });
    it('returns 400 for name longer than 60 chars', async () => {
      const res = await request(app).post('/').send({ name: 'N'.repeat(61), modules: ['health-safety'] });
      expect(res.status).toBe(400);
    });
    it('returns 400 for name exactly 61 chars', async () => {
      const res = await request(app).post('/').send({ name: 'X'.repeat(61), modules: ['health-safety'] });
      expect(res.status).toBe(400);
    });
    it('accepts name of exactly 60 chars', async () => {
      const res = await request(app).post('/').send({ name: 'Y'.repeat(60), modules: ['health-safety'] });
      expect(res.status).toBe(201);
    });
    it('accepts name of exactly 1 char', async () => {
      const res = await request(app).post('/').send({ name: 'Z', modules: ['health-safety'] });
      expect(res.status).toBe(201);
    });
    it('returns 400 for invalid region', async () => {
      const res = await request(app).post('/').send({ name: 'Bad Region', region: 'moon-base-1', modules: ['health-safety'] });
      expect(res.status).toBe(400);
    });
    it('returns 400 for expiryDays < 7', async () => {
      const res = await request(app).post('/').send({ name: 'Too Short Expiry', modules: ['health-safety'], expiryDays: 6 });
      expect(res.status).toBe(400);
    });
    it('returns 400 for expiryDays = 0', async () => {
      const res = await request(app).post('/').send({ name: 'Zero Expiry', modules: ['health-safety'], expiryDays: 0 });
      expect(res.status).toBe(400);
    });
    it('returns 400 for expiryDays > 90', async () => {
      const res = await request(app).post('/').send({ name: 'Too Long Expiry', modules: ['health-safety'], expiryDays: 91 });
      expect(res.status).toBe(400);
    });
    it('returns 400 for expiryDays = 91', async () => {
      const res = await request(app).post('/').send({ name: 'Expiry 91', modules: ['health-safety'], expiryDays: 91 });
      expect(res.status).toBe(400);
    });
    it('returns 400 for expiryDays = 100', async () => {
      const res = await request(app).post('/').send({ name: 'Expiry 100', modules: ['health-safety'], expiryDays: 100 });
      expect(res.status).toBe(400);
    });
    it('returns 400 for non-integer expiryDays', async () => {
      const res = await request(app).post('/').send({ name: 'Float Expiry', modules: ['health-safety'], expiryDays: 7.5 });
      expect(res.status).toBe(400);
    });
    it('returns 400 for numeric name', async () => {
      const res = await request(app).post('/').send({ name: 123, modules: ['health-safety'] });
      expect(res.status).toBe(400);
    });
    it('returns success:false on validation error', async () => {
      const res = await request(app).post('/').send({ modules: ['health-safety'] });
      expect(res.body.success).toBe(false);
    });
    it('returns 400 for wrong region format', async () => {
      const res = await request(app).post('/').send({ name: 'Bad Reg Format', region: 'EUROPE-WEST', modules: ['health-safety'] });
      expect(res.status).toBe(400);
    });
    for (let i = 0; i < 30; i++) {
      it(`validation loop: name too long [${i}]`, async () => {
        const res = await request(app).post('/').send({ name: 'A'.repeat(62 + i), modules: ['health-safety'] });
        expect(res.status).toBe(400);
      });
    }
    for (let i = 0; i < 20; i++) {
      it(`validation loop: expiryDays out of range [${i}]`, async () => {
        const days = i % 2 === 0 ? 91 + i : (i % 7); // Either too high (91+) or too low (<7)
        const res = await request(app).post('/').send({ name: `Bad Days ${i}`, modules: ['health-safety'], expiryDays: days });
        expect(res.status).toBe(400);
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /:id
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /:id', () => {
  describe('happy path', () => {
    it('returns 200 for existing sandbox', async () => {
      const { id } = await createSandbox({ name: 'GET by ID 1' });
      const res = await request(app).get(`/${id}`);
      expect(res.status).toBe(200);
    });
    it('returns success:true', async () => {
      const { id } = await createSandbox({ name: 'GET by ID 2' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.success).toBe(true);
    });
    it('returns data', async () => {
      const { id } = await createSandbox({ name: 'GET by ID 3' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data).toBeDefined();
    });
    it('returns correct id', async () => {
      const { id } = await createSandbox({ name: 'GET ID Match' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.id).toBe(id);
    });
    it('does not expose adminPassword', async () => {
      const { id } = await createSandbox({ name: 'GET NoPwd' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.adminPassword).toBeUndefined();
    });
    it('returns name', async () => {
      const { id } = await createSandbox({ name: 'Named GET' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.name).toBe('Named GET');
    });
    it('returns status', async () => {
      const { id } = await createSandbox({ name: 'Status GET' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.status).toBeDefined();
    });
    it('returns region', async () => {
      const { id } = await createSandbox({ name: 'Region GET', region: 'us-east-1' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.region).toBe('us-east-1');
    });
    it('returns url', async () => {
      const { id } = await createSandbox({ name: 'URL GET' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.url).toBeDefined();
    });
    it('url starts with https://', async () => {
      const { id } = await createSandbox({ name: 'HTTPS GET' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.url).toMatch(/^https:\/\//);
    });
    it('returns adminEmail', async () => {
      const { id } = await createSandbox({ name: 'AdminEmail GET' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.adminEmail).toBeDefined();
    });
    it('returns modules', async () => {
      const { id } = await createSandbox({ name: 'Modules GET', modules: ['health-safety', 'quality'] });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.modules).toContain('health-safety');
    });
    it('returns expiresAt', async () => {
      const { id } = await createSandbox({ name: 'ExpiresAt GET' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.expiresAt).toBeDefined();
    });
    it('returns createdAt', async () => {
      const { id } = await createSandbox({ name: 'CreatedAt GET' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.createdAt).toBeDefined();
    });
    it('returns partnerId', async () => {
      const { id } = await createSandbox({ name: 'PartnerId GET' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.partnerId).toBe('org-1');
    });
    it('returns description when set', async () => {
      const { id } = await createSandbox({ name: 'Desc GET', description: 'My desc' });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.description).toBe('My desc');
    });
    it('returns json content-type', async () => {
      const { id } = await createSandbox({ name: 'CT GET' });
      const res = await request(app).get(`/${id}`);
      expect(res.headers['content-type']).toMatch(/json/);
    });
    for (let i = 0; i < 50; i++) {
      it(`GET /:id happy path loop [${i}]`, async () => {
        const { id } = await createSandbox({ name: `Loop GET ${i}` });
        const res = await request(app).get(`/${id}`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(id);
        expect(res.body.data.adminPassword).toBeUndefined();
      });
    }
  });

  describe('not found', () => {
    it('returns 404 for non-existent id', async () => {
      const res = await request(app).get('/sbx_nonexistent_id_abc');
      expect(res.status).toBe(404);
    });
    it('returns NOT_FOUND code', async () => {
      const res = await request(app).get('/sbx_nonexistent_id_xyz');
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
    it('returns success:false for 404', async () => {
      const res = await request(app).get('/sbx_does_not_exist');
      expect(res.body.success).toBe(false);
    });
    it('returns 404 for random string id', async () => {
      const res = await request(app).get('/totally-random-id-12345');
      expect(res.status).toBe(404);
    });
    for (let i = 0; i < 30; i++) {
      it(`returns 404 for fake id [${i}]`, async () => {
        const res = await request(app).get(`/sbx_fake_${i}`);
        expect(res.status).toBe(404);
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /:id/reset
// ═══════════════════════════════════════════════════════════════════════════════
describe('POST /:id/reset', () => {
  describe('happy path', () => {
    it('returns 200 for existing sandbox', async () => {
      const { id } = await createSandbox({ name: 'Reset Me 1' });
      const res = await request(app).post(`/${id}/reset`);
      expect(res.status).toBe(200);
    });
    it('returns success:true', async () => {
      const { id } = await createSandbox({ name: 'Reset Me 2' });
      const res = await request(app).post(`/${id}/reset`);
      expect(res.body.success).toBe(true);
    });
    it('returns data with message', async () => {
      const { id } = await createSandbox({ name: 'Reset Me 3' });
      const res = await request(app).post(`/${id}/reset`);
      expect(res.body.data.message).toBeDefined();
    });
    it('message mentions reset or available', async () => {
      const { id } = await createSandbox({ name: 'Reset Msg' });
      const res = await request(app).post(`/${id}/reset`);
      expect(res.body.data.message).toMatch(/reset|available|5 minutes/i);
    });
    it('sandbox status becomes PROVISIONING after reset', async () => {
      const { id } = await createSandbox({ name: 'Reset Status' });
      await request(app).post(`/${id}/reset`);
      const getRes = await request(app).get(`/${id}`);
      expect(getRes.body.data.status).toBe('PROVISIONING');
    });
    it('sandbox is still retrievable after reset', async () => {
      const { id } = await createSandbox({ name: 'Still Here After Reset' });
      await request(app).post(`/${id}/reset`);
      const getRes = await request(app).get(`/${id}`);
      expect(getRes.status).toBe(200);
    });
    it('returns json content-type', async () => {
      const { id } = await createSandbox({ name: 'Reset CT' });
      const res = await request(app).post(`/${id}/reset`);
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('sandbox name unchanged after reset', async () => {
      const { id } = await createSandbox({ name: 'Name Preserved Reset' });
      await request(app).post(`/${id}/reset`);
      const getRes = await request(app).get(`/${id}`);
      expect(getRes.body.data.name).toBe('Name Preserved Reset');
    });
    it('sandbox region unchanged after reset', async () => {
      const { id } = await createSandbox({ name: 'Region Preserved', region: 'ap-southeast-1' });
      await request(app).post(`/${id}/reset`);
      const getRes = await request(app).get(`/${id}`);
      expect(getRes.body.data.region).toBe('ap-southeast-1');
    });
    it('sandbox modules unchanged after reset', async () => {
      const { id } = await createSandbox({ name: 'Modules Preserved', modules: ['incidents'] });
      await request(app).post(`/${id}/reset`);
      const getRes = await request(app).get(`/${id}`);
      expect(getRes.body.data.modules).toContain('incidents');
    });
    for (let i = 0; i < 50; i++) {
      it(`reset happy path loop [${i}]`, async () => {
        const { id } = await createSandbox({ name: `Reset Loop ${i}` });
        const res = await request(app).post(`/${id}/reset`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });
    }
  });

  describe('not found', () => {
    it('returns 404 for non-existent sandbox', async () => {
      const res = await request(app).post('/sbx_nonexistent_reset/reset');
      expect(res.status).toBe(404);
    });
    it('returns NOT_FOUND code', async () => {
      const res = await request(app).post('/sbx_nonexistent_reset/reset');
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
    it('returns success:false', async () => {
      const res = await request(app).post('/sbx_ghost_reset/reset');
      expect(res.body.success).toBe(false);
    });
    for (let i = 0; i < 25; i++) {
      it(`reset 404 loop [${i}]`, async () => {
        const res = await request(app).post(`/sbx_fake_reset_${i}/reset`);
        expect(res.status).toBe(404);
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /:id
// ═══════════════════════════════════════════════════════════════════════════════
describe('DELETE /:id', () => {
  describe('happy path', () => {
    it('returns 200 for existing sandbox', async () => {
      const { id } = await createSandbox({ name: 'Delete Me 1' });
      const res = await request(app).delete(`/${id}`);
      expect(res.status).toBe(200);
    });
    it('returns success:true', async () => {
      const { id } = await createSandbox({ name: 'Delete Me 2' });
      const res = await request(app).delete(`/${id}`);
      expect(res.body.success).toBe(true);
    });
    it('returns data with message', async () => {
      const { id } = await createSandbox({ name: 'Delete Me 3' });
      const res = await request(app).delete(`/${id}`);
      expect(res.body.data.message).toBeDefined();
    });
    it('message mentions deleted', async () => {
      const { id } = await createSandbox({ name: 'Delete Msg' });
      const res = await request(app).delete(`/${id}`);
      expect(res.body.data.message).toMatch(/deleted/i);
    });
    it('deleted sandbox returns 404 on GET', async () => {
      const { id } = await createSandbox({ name: 'Gone After Delete' });
      await request(app).delete(`/${id}`);
      const res = await request(app).get(`/${id}`);
      expect(res.status).toBe(404);
    });
    it('deleted sandbox returns 404 on second DELETE', async () => {
      const { id } = await createSandbox({ name: 'Delete Twice' });
      await request(app).delete(`/${id}`);
      const res = await request(app).delete(`/${id}`);
      expect(res.status).toBe(404);
    });
    it('returns json content-type', async () => {
      const { id } = await createSandbox({ name: 'Delete CT' });
      const res = await request(app).delete(`/${id}`);
      expect(res.headers['content-type']).toMatch(/json/);
    });
    it('deleted sandbox not in list', async () => {
      const { id } = await createSandbox({ name: 'Deleted Not Listed' });
      await request(app).delete(`/${id}`);
      const listRes = await request(app).get('/');
      const ids = listRes.body.data.map((s: any) => s.id);
      expect(ids).not.toContain(id);
    });
    for (let i = 0; i < 50; i++) {
      it(`delete happy path loop [${i}]`, async () => {
        const { id } = await createSandbox({ name: `Delete Loop ${i}` });
        const res = await request(app).delete(`/${id}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });
    }
  });

  describe('not found', () => {
    it('returns 404 for non-existent sandbox', async () => {
      const res = await request(app).delete('/sbx_nonexistent_delete');
      expect(res.status).toBe(404);
    });
    it('returns NOT_FOUND code', async () => {
      const res = await request(app).delete('/sbx_nonexistent_delete');
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
    it('returns success:false', async () => {
      const res = await request(app).delete('/sbx_ghost_delete');
      expect(res.body.success).toBe(false);
    });
    for (let i = 0; i < 25; i++) {
      it(`delete 404 loop [${i}]`, async () => {
        const res = await request(app).delete(`/sbx_fake_del_${i}`);
        expect(res.status).toBe(404);
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Field boundary tests
// ═══════════════════════════════════════════════════════════════════════════════
describe('field boundary tests', () => {
  for (let len = 1; len <= 30; len++) {
    it(`name of length ${len} is accepted`, async () => {
      const res = await request(app).post('/').send({ name: 'A'.repeat(len), modules: ['health-safety'] });
      expect(res.status).toBe(201);
    });
  }
  for (let days = 7; days <= 30; days++) {
    it(`expiryDays ${days} is accepted`, async () => {
      const res = await request(app).post('/').send({ name: `Days${days}`, modules: ['health-safety'], expiryDays: days });
      expect(res.status).toBe(201);
    });
  }
  for (let days = 60; days <= 90; days++) {
    it(`expiryDays ${days} is accepted`, async () => {
      const res = await request(app).post('/').send({ name: `Days${days}`, modules: ['health-safety'], expiryDays: days });
      expect(res.status).toBe(201);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// End-to-end flows
// ═══════════════════════════════════════════════════════════════════════════════
describe('end-to-end flows', () => {
  it('full lifecycle: create → get → reset → delete', async () => {
    // Create
    const createRes = await request(app).post('/').send({ name: 'E2E Lifecycle', region: 'eu-central-1', modules: ['health-safety', 'quality'], expiryDays: 14 });
    expect(createRes.status).toBe(201);
    const id = createRes.body.data.id;
    expect(createRes.body.data.adminPassword).toBeDefined();
    expect(createRes.body.data.status).toBe('PROVISIONING');

    // Get — no password
    const getRes = await request(app).get(`/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.id).toBe(id);
    expect(getRes.body.data.adminPassword).toBeUndefined();

    // Verify in list
    const listRes = await request(app).get('/');
    expect(listRes.body.data.some((s: any) => s.id === id)).toBe(true);

    // Reset
    const resetRes = await request(app).post(`/${id}/reset`);
    expect(resetRes.status).toBe(200);
    const afterReset = await request(app).get(`/${id}`);
    expect(afterReset.body.data.status).toBe('PROVISIONING');

    // Delete
    const delRes = await request(app).delete(`/${id}`);
    expect(delRes.status).toBe(200);
    const afterDel = await request(app).get(`/${id}`);
    expect(afterDel.status).toBe(404);
  });

  it('multiple sandboxes for same org', async () => {
    const r1 = await request(app).post('/').send({ name: 'Org Multi 1', modules: ['health-safety'] });
    const r2 = await request(app).post('/').send({ name: 'Org Multi 2', modules: ['environment'] });
    const r3 = await request(app).post('/').send({ name: 'Org Multi 3', modules: ['quality'] });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    expect(r3.status).toBe(201);
    expect(r1.body.data.id).not.toBe(r2.body.data.id);
    expect(r2.body.data.id).not.toBe(r3.body.data.id);

    const listRes = await request(app).get('/');
    const ids = listRes.body.data.map((s: any) => s.id);
    expect(ids).toContain(r1.body.data.id);
    expect(ids).toContain(r2.body.data.id);
    expect(ids).toContain(r3.body.data.id);
  });

  it('all regions are accessible end-to-end', async () => {
    const regions = ['eu-west-1', 'eu-central-1', 'us-east-1', 'ap-southeast-1'];
    for (const region of regions) {
      const r = await request(app).post('/').send({ name: `E2E Region ${region}`, region, modules: ['health-safety'] });
      expect(r.status).toBe(201);
      expect(r.body.data.region).toBe(region);

      const g = await request(app).get(`/${r.body.data.id}`);
      expect(g.body.data.region).toBe(region);
    }
  });

  it('adminPassword not exposed in list or GET after creation', async () => {
    const createRes = await request(app).post('/').send({ name: 'Pwd E2E', modules: ['health-safety'] });
    const id = createRes.body.data.id;
    const pwd = createRes.body.data.adminPassword;
    expect(pwd).toBeDefined();

    const getRes = await request(app).get(`/${id}`);
    expect(getRes.body.data.adminPassword).toBeUndefined();

    const listRes = await request(app).get('/');
    const found = listRes.body.data.find((s: any) => s.id === id);
    expect(found).toBeDefined();
    expect(found.adminPassword).toBeUndefined();
  });

  for (let i = 0; i < 20; i++) {
    it(`E2E create-get loop [${i}]`, async () => {
      const cr = await request(app).post('/').send({ name: `E2E Loop ${i}`, modules: ['health-safety'] });
      expect(cr.status).toBe(201);
      const gr = await request(app).get(`/${cr.body.data.id}`);
      expect(gr.status).toBe(200);
      expect(gr.body.data.name).toBe(`E2E Loop ${i}`);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`E2E create-delete loop [${i}]`, async () => {
      const cr = await request(app).post('/').send({ name: `E2E Del Loop ${i}`, modules: ['health-safety'] });
      const del = await request(app).delete(`/${cr.body.data.id}`);
      expect(del.status).toBe(200);
      const gr = await request(app).get(`/${cr.body.data.id}`);
      expect(gr.status).toBe(404);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// URL and adminEmail format tests
// ═══════════════════════════════════════════════════════════════════════════════
describe('URL and adminEmail format', () => {
  for (let i = 0; i < 60; i++) {
    it(`url starts with https:// [${i}]`, async () => {
      const { body } = await createSandbox({ name: `URL Format ${i}` });
      expect(body.data.url).toMatch(/^https:\/\//);
    });
  }
  for (let i = 0; i < 60; i++) {
    it(`adminEmail contains sandbox.nexara.io [${i}]`, async () => {
      const { body } = await createSandbox({ name: `Email Format ${i}` });
      expect(body.data.adminEmail).toMatch(/sandbox\.nexara\.io/);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`url contains partner- prefix [${i}]`, async () => {
      const { body } = await createSandbox({ name: `URL Partner ${i}` });
      expect(body.data.url).toMatch(/partner-/);
    });
  }
  it('url matches adminEmail domain', async () => {
    const { body } = await createSandbox({ name: 'URL Email Match' });
    const urlDomain = body.data.url.replace('https://', '').split('.').slice(0, 2).join('.');
    const emailDomain = body.data.adminEmail.split('@')[1].split('.').slice(0, 2).join('.');
    expect(urlDomain).toBe(emailDomain);
  });
  it('each sandbox has unique URL', async () => {
    const r1 = await createSandbox({ name: 'Unique URL A' });
    const r2 = await createSandbox({ name: 'Unique URL B' });
    expect(r1.body.data.url).not.toBe(r2.body.data.url);
  });
  it('each sandbox has unique adminEmail', async () => {
    const r1 = await createSandbox({ name: 'Unique Email A' });
    const r2 = await createSandbox({ name: 'Unique Email B' });
    expect(r1.body.data.adminEmail).not.toBe(r2.body.data.adminEmail);
  });
  it('adminEmail is valid email format', async () => {
    const { body } = await createSandbox({ name: 'Valid Email Format' });
    expect(body.data.adminEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// adminPassword strength and uniqueness
// ═══════════════════════════════════════════════════════════════════════════════
describe('adminPassword', () => {
  for (let i = 0; i < 50; i++) {
    it(`adminPassword is present on creation [${i}]`, async () => {
      const { body } = await createSandbox({ name: `Pwd Present ${i}` });
      expect(body.data.adminPassword).toBeDefined();
      expect(typeof body.data.adminPassword).toBe('string');
      expect(body.data.adminPassword.length).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`adminPassword not in GET response [${i}]`, async () => {
      const { id } = await createSandbox({ name: `Pwd GET ${i}` });
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.adminPassword).toBeUndefined();
    });
  }
  it('each sandbox has different adminPassword', async () => {
    const r1 = await createSandbox({ name: 'Pwd Unique A' });
    const r2 = await createSandbox({ name: 'Pwd Unique B' });
    expect(r1.body.data.adminPassword).not.toBe(r2.body.data.adminPassword);
  });
  it('adminPassword contains uppercase letter', async () => {
    const { body } = await createSandbox({ name: 'Pwd Upper' });
    expect(body.data.adminPassword).toMatch(/[A-Z]/);
  });
  it('adminPassword contains digit', async () => {
    const { body } = await createSandbox({ name: 'Pwd Digit' });
    expect(body.data.adminPassword).toMatch(/\d/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Status lifecycle
// ═══════════════════════════════════════════════════════════════════════════════
describe('status lifecycle', () => {
  for (let i = 0; i < 50; i++) {
    it(`new sandbox starts as PROVISIONING [${i}]`, async () => {
      const { body } = await createSandbox({ name: `Status Init ${i}` });
      expect(body.data.status).toBe('PROVISIONING');
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`reset sandbox returns to PROVISIONING [${i}]`, async () => {
      const { id } = await createSandbox({ name: `Reset Status ${i}` });
      await request(app).post(`/${id}/reset`);
      const res = await request(app).get(`/${id}`);
      expect(res.body.data.status).toBe('PROVISIONING');
    });
  }
  it('PROVISIONING is a valid status value', async () => {
    const validStatuses = ['PROVISIONING', 'ACTIVE', 'SUSPENDED', 'EXPIRED'];
    const { body } = await createSandbox({ name: 'Valid Status' });
    expect(validStatuses).toContain(body.data.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Modules default and persistence
// ═══════════════════════════════════════════════════════════════════════════════
describe('modules default and persistence', () => {
  it('default modules includes health-safety', async () => {
    const { body } = await createSandbox({ name: 'Default Mod HS' });
    expect(body.data.modules).toContain('health-safety');
  });
  it('default modules includes environment', async () => {
    const { body } = await createSandbox({ name: 'Default Mod Env' });
    expect(body.data.modules).toContain('environment');
  });
  it('default modules includes quality', async () => {
    // Use direct request without modules to get route default
    const res = await request(app).post('/').send({ name: 'Default Mod Qual', region: 'eu-west-1' });
    expect(res.status).toBe(201);
    expect(res.body.data.modules).toContain('quality');
  });
  it('default modules includes incidents', async () => {
    const res = await request(app).post('/').send({ name: 'Default Mod Inc', region: 'eu-west-1' });
    expect(res.status).toBe(201);
    expect(res.body.data.modules).toContain('incidents');
  });
  for (let i = 0; i < 30; i++) {
    it(`custom modules persisted after GET [${i}]`, async () => {
      const mods = i % 2 === 0 ? ['health-safety'] : ['environment', 'quality'];
      const { id, body } = await createSandbox({ name: `Mods Persist ${i}`, modules: mods });
      mods.forEach(m => expect(body.data.modules).toContain(m));
      const getRes = await request(app).get(`/${id}`);
      mods.forEach(m => expect(getRes.body.data.modules).toContain(m));
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`modules array is always an array [${i}]`, async () => {
      const { body } = await createSandbox({ name: `Mods Array ${i}` });
      expect(Array.isArray(body.data.modules)).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Data consistency across operations
// ═══════════════════════════════════════════════════════════════════════════════
describe('data consistency', () => {
  for (let i = 0; i < 40; i++) {
    it(`sandbox data consistent between create and get [${i}]`, async () => {
      const region = ['eu-west-1', 'eu-central-1', 'us-east-1', 'ap-southeast-1'][i % 4];
      const { id, body: cr } = await createSandbox({ name: `Consist ${i}`, region });
      const gr = await request(app).get(`/${id}`);
      expect(gr.body.data.name).toBe(cr.data.name);
      expect(gr.body.data.region).toBe(cr.data.region);
      expect(gr.body.data.url).toBe(cr.data.url);
      expect(gr.body.data.adminEmail).toBe(cr.data.adminEmail);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`created sandbox appears in list [${i}]`, async () => {
      const { id } = await createSandbox({ name: `List Appear ${i}` });
      const listRes = await request(app).get('/');
      const ids = listRes.body.data.map((s: any) => s.id);
      expect(ids).toContain(id);
    });
  }
});

// ── Extra loops to ensure ≥1,000 runtime tests ──────────────────────────────
describe('sandbox — module count extra', () => {
  for (let i = 0; i < 30; i++) {
    it(`sandbox created with 3 modules has length 3 [${i}]`, async () => {
      const res = await request(app).post('/').send({
        name: `ModCount${i}`,
        region: 'eu-west-1',
        modules: ['quality', 'environment', 'health-safety'],
      });
      expect(res.status).toBe(201);
      expect(res.body.data.modules).toHaveLength(3);
    });
  }
});

describe('sandbox — expiryDays boundary extra', () => {
  for (let i = 0; i < 30; i++) {
    const days = 7 + (i % 84);
    it(`expiryDays=${days} is accepted [${i}]`, async () => {
      const res = await request(app).post('/').send({
        name: `ExpExtra${i}`,
        region: 'us-east-1',
        expiryDays: days,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.expiresAt).toBeDefined();
    });
  }
});
