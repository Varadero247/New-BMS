import express from 'express';
import request from 'supertest';

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import scimRouter, { getScimTokenStore } from '../src/routes/scim';

// Helper to register a SCIM bearer token
function seedToken(orgId: string): string {
  const tokenStore = getScimTokenStore();
  const token = `scim-test-token-${orgId}-${Date.now()}`;
  tokenStore.set(`tok-${orgId}`, {
    id: `tok-${orgId}`,
    token,
    orgId,
    createdAt: new Date().toISOString(),
    active: true,
  });
  return token;
}

describe('SCIM Routes', () => {
  let app: express.Express;
  let scimToken: string;

  beforeAll(() => {
    // Seed a valid SCIM token before all tests
    scimToken = seedToken('org-scim');
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/scim/v2', scimRouter);
  });

  describe('GET /scim/v2/ServiceProviderConfig', () => {
    it('returns SCIM service provider config (public, no auth)', async () => {
      const res = await request(app).get('/scim/v2/ServiceProviderConfig');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('schemas');
      expect(res.body.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig');
    });

    it('includes patch support information', async () => {
      const res = await request(app).get('/scim/v2/ServiceProviderConfig');
      expect(res.body.patch).toHaveProperty('supported', true);
    });

    it('includes authentication schemes', async () => {
      const res = await request(app).get('/scim/v2/ServiceProviderConfig');
      expect(res.body.authenticationSchemes).toBeInstanceOf(Array);
      expect(res.body.authenticationSchemes.length).toBeGreaterThan(0);
    });
  });

  describe('SCIM Authentication', () => {
    it('returns 401 when no Authorization header is provided', async () => {
      const res = await request(app).get('/scim/v2/Users');
      expect(res.status).toBe(401);
      expect(res.body.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:Error');
    });

    it('returns 401 for invalid bearer token', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .set('Authorization', 'Bearer invalid-token-xyz');
      expect(res.status).toBe(401);
    });

    it('returns 401 when Authorization is not Bearer format', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .set('Authorization', 'Basic dXNlcjpwYXNz');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /scim/v2/Users', () => {
    it('returns SCIM list response with valid token', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('schemas');
      expect(res.body.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:ListResponse');
      expect(res.body).toHaveProperty('totalResults');
      expect(res.body).toHaveProperty('Resources');
    });

    it('accepts startIndex and count query params', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .query({ startIndex: '1', count: '10' })
        .set('Authorization', `Bearer ${scimToken}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /scim/v2/Users', () => {
    it('creates a new SCIM user', async () => {
      const userName = `jdoe-${Date.now()}@example.com`;
      const res = await request(app)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          userName,
          name: { givenName: 'John', familyName: 'Doe' },
          emails: [{ value: userName, type: 'work', primary: true }],
          active: true,
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.userName).toBe(userName);
      expect(res.body.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:User');
    });

    it('rejects missing userName', async () => {
      const res = await request(app)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({ name: { givenName: 'John', familyName: 'Doe' } });
      expect(res.status).toBe(400);
      expect(res.body.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:Error');
    });

    it('returns 409 for duplicate userName', async () => {
      const userName = `duplicate-${Date.now()}@example.com`;
      await request(app)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({ userName });

      const res = await request(app)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({ userName });
      expect(res.status).toBe(409);
      expect(res.body.scimType).toBe('uniqueness');
    });
  });

  describe('GET /scim/v2/Users/:id', () => {
    it('returns a specific user by ID', async () => {
      const userName = `getuser-${Date.now()}@example.com`;
      const createRes = await request(app)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({ userName, active: true });

      const userId = createRes.body.id;
      const res = await request(app)
        .get(`/scim/v2/Users/${userId}`)
        .set('Authorization', `Bearer ${scimToken}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(userId);
      expect(res.body.userName).toBe(userName);
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/scim/v2/Users/nonexistent-user-id')
        .set('Authorization', `Bearer ${scimToken}`);
      expect(res.status).toBe(404);
      expect(res.body.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:Error');
    });
  });

  describe('PUT /scim/v2/Users/:id', () => {
    it('replaces a user', async () => {
      const userName = `putuser-${Date.now()}@example.com`;
      const createRes = await request(app)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({ userName });
      const userId = createRes.body.id;

      const res = await request(app)
        .put(`/scim/v2/Users/${userId}`)
        .set('Authorization', `Bearer ${scimToken}`)
        .send({ userName, displayName: 'Updated Name', active: false });
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(false);
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app)
        .put('/scim/v2/Users/nonexistent')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({ userName: 'test@test.com' });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /scim/v2/Users/:id', () => {
    it('deactivates a user via PATCH', async () => {
      const userName = `patchuser-${Date.now()}@example.com`;
      const createRes = await request(app)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({ userName, active: true });
      const userId = createRes.body.id;

      const res = await request(app)
        .patch(`/scim/v2/Users/${userId}`)
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [{ op: 'replace', path: 'active', value: false }],
        });
      expect(res.status).toBe(200);
      expect(res.body.active).toBe(false);
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app)
        .patch('/scim/v2/Users/nonexistent')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [{ op: 'replace', path: 'active', value: false }],
        });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /scim/v2/Users/:id', () => {
    it('deprovisions a user (204 No Content)', async () => {
      const userName = `deleteuser-${Date.now()}@example.com`;
      const createRes = await request(app)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({ userName });
      const userId = createRes.body.id;

      const res = await request(app)
        .delete(`/scim/v2/Users/${userId}`)
        .set('Authorization', `Bearer ${scimToken}`);
      expect(res.status).toBe(204);
    });

    it('returns 404 for non-existent user', async () => {
      const res = await request(app)
        .delete('/scim/v2/Users/nonexistent')
        .set('Authorization', `Bearer ${scimToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /scim/v2/Groups', () => {
    it('returns SCIM groups list with default Nexara role groups', async () => {
      const res = await request(app)
        .get('/scim/v2/Groups')
        .set('Authorization', `Bearer ${scimToken}`);
      expect(res.status).toBe(200);
      expect(res.body.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:ListResponse');
      expect(res.body.totalResults).toBeGreaterThanOrEqual(4);
      expect(res.body.Resources).toBeInstanceOf(Array);
    });

    it('contains expected default role groups', async () => {
      const res = await request(app)
        .get('/scim/v2/Groups')
        .set('Authorization', `Bearer ${scimToken}`);
      const groupNames = res.body.Resources.map((g: any) => g.displayName);
      expect(groupNames).toContain('Admin');
      expect(groupNames).toContain('Manager');
    });
  });
});
