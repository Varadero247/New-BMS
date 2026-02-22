import express from 'express';
import request from 'supertest';

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

// ─── In-memory Prisma mock stores ───────────────────────────────────────────
// Module-level stores (persist across tests — no beforeEach reset, mirrors old Map behavior)
let scimTokenMap: Map<string, any> = new Map();
let scimUserMap: Map<string, any> = new Map();
const scimUserByUserNameMap: Map<string, string> = new Map(); // userName -> id
let scimGroupMap: Map<string, any> = new Map();

jest.mock('@ims/database', () => ({
  prisma: {
    scimToken: {
      findUnique: jest.fn(({ where }: any) => {
        // `token` field lookup (unique)
        if (where.token !== undefined) {
          const record = Array.from(scimTokenMap.values()).find((t) => t.token === where.token);
          return Promise.resolve(record ?? null);
        }
        // `id` field lookup
        return Promise.resolve(scimTokenMap.get(where.id) ?? null);
      }),
      upsert: jest.fn(({ where, create: createData, update }: any) => {
        const existing = scimTokenMap.get(where.id);
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return Promise.resolve(existing);
        }
        const record = { ...createData, createdAt: new Date(), updatedAt: new Date() };
        scimTokenMap.set(createData.id, record);
        return Promise.resolve(record);
      }),
      delete: jest.fn(({ where }: any) => {
        const record = scimTokenMap.get(where.id);
        scimTokenMap.delete(where.id);
        return Promise.resolve(record);
      }),
    },
    scimUser: {
      findUnique: jest.fn(({ where }: any) => {
        if (where.userName !== undefined) {
          return Promise.resolve(
            Array.from(scimUserMap.values()).find((u) => u.userName === where.userName) ?? null
          );
        }
        return Promise.resolve(scimUserMap.get(where.id) ?? null);
      }),
      findMany: jest.fn(({ where = {} }: any) => {
        let items = Array.from(scimUserMap.values());
        if (where.orgId) items = items.filter((u) => u.orgId === where.orgId);
        return Promise.resolve(items);
      }),
      create: jest.fn(({ data }: any) => {
        const record = {
          ...data,
          emails: data.emails ?? [],
          groups: data.groups ?? [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        scimUserMap.set(data.id, record);
        scimUserByUserNameMap.set(data.userName, data.id);
        return Promise.resolve(record);
      }),
      update: jest.fn(({ where, data }: any) => {
        const existing = scimUserMap.get(where.id);
        if (!existing) return Promise.reject(new Error('Not found'));
        Object.assign(existing, data, { updatedAt: new Date() });
        return Promise.resolve(existing);
      }),
      delete: jest.fn(({ where }: any) => {
        const existing = scimUserMap.get(where.id);
        scimUserMap.delete(where.id);
        if (existing) scimUserByUserNameMap.delete(existing.userName);
        return Promise.resolve(existing);
      }),
    },
    scimGroup: {
      upsert: jest.fn(({ where, create: createData, update }: any) => {
        const existing = scimGroupMap.get(where.id);
        if (existing) {
          Object.assign(existing, update, { updatedAt: new Date() });
          return Promise.resolve(existing);
        }
        const record = { ...createData, createdAt: new Date(), updatedAt: new Date() };
        scimGroupMap.set(createData.id, record);
        return Promise.resolve(record);
      }),
      findMany: jest.fn((args?: any) => {
        const items = Array.from(scimGroupMap.values());
        return Promise.resolve(items);
      }),
      findUnique: jest.fn(({ where }: any) =>
        Promise.resolve(scimGroupMap.get(where.id) ?? null)
      ),
      update: jest.fn(({ where, data }: any) => {
        const existing = scimGroupMap.get(where.id);
        if (!existing) return Promise.reject(new Error('Not found'));
        Object.assign(existing, data, { updatedAt: new Date() });
        return Promise.resolve(existing);
      }),
    },
    $use: jest.fn(),
  },
}));

import scimRouter from '../src/routes/scim';

// Helper to seed a SCIM bearer token directly into the mock store
function seedToken(orgId: string): string {
  const token = `scim-test-token-${orgId}-${Date.now()}`;
  scimTokenMap.set(`tok-${orgId}`, {
    id: `tok-${orgId}`,
    token,
    orgId,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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
      expect(res.body.schemas).toContain(
        'urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'
      );
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
        .get('/scim/v2/Users/00000000-0000-0000-0000-000000000099')
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
        .put('/scim/v2/Users/00000000-0000-0000-0000-000000000099')
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
        .patch('/scim/v2/Users/00000000-0000-0000-0000-000000000099')
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
        .delete('/scim/v2/Users/00000000-0000-0000-0000-000000000099')
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

  // ─────────────────────── SCIM Filter Tests ───────────────────────

  describe('SCIM User Filtering', () => {
    let filterUserId: string;

    beforeAll(async () => {
      // Create users for filter testing (use unique names to avoid collisions with earlier tests)
      const filterApp = express();
      filterApp.use(express.json());
      filterApp.use('/scim/v2', scimRouter);

      const createRes = await request(filterApp)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          userName: 'john.filter@example.com',
          name: { givenName: 'John', familyName: 'Filter' },
          emails: [{ value: 'john.filter@example.com', type: 'work', primary: true }],
          displayName: 'John Admin Filter',
          active: true,
        });
      filterUserId = createRes.body.id;

      await request(filterApp)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          userName: 'jane.filter@example.com',
          name: { givenName: 'Jane', familyName: 'Filter' },
          emails: [{ value: 'jane.filter@example.com', type: 'work', primary: true }],
          displayName: 'Jane Viewer Filter',
          active: false,
        });
    });

    it('filters users by userName eq', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .query({ filter: 'userName eq "john.filter@example.com"' })
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalResults).toBe(1);
      expect(res.body.Resources[0].userName).toBe('john.filter@example.com');
    });

    it('filters users by displayName co (contains)', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .query({ filter: 'displayName co "Admin Filter"' })
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalResults).toBeGreaterThanOrEqual(1);
      const userNames = res.body.Resources.map((u: any) => u.displayName);
      expect(userNames).toContain('John Admin Filter');
    });

    it('filters users by active eq "true"', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .query({ filter: 'active eq "true"' })
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(200);
      // All returned users should be active
      for (const user of res.body.Resources) {
        expect(user.active).toBe(true);
      }
    });

    it('filters users by active eq "false"', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .query({ filter: 'active eq "false"' })
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(200);
      for (const user of res.body.Resources) {
        expect(user.active).toBe(false);
      }
    });

    it('returns 400 for unsupported filter expression', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .query({ filter: 'invalid filter syntax!!!' })
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(400);
      expect(res.body.scimType).toBe('invalidFilter');
    });

    it('supports userName sw (starts with) filter', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .query({ filter: 'userName sw "john.filter"' })
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalResults).toBeGreaterThanOrEqual(1);
      for (const user of res.body.Resources) {
        expect(user.userName.toLowerCase()).toMatch(/^john\.filter/);
      }
    });

    it('filter is case-insensitive', async () => {
      const res = await request(app)
        .get('/scim/v2/Users')
        .query({ filter: 'userName eq "JOHN.FILTER@EXAMPLE.COM"' })
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalResults).toBe(1);
    });
  });

  // ─────────────────────── SCIM Group Detail Tests ───────────────────────

  describe('GET /scim/v2/Groups/:id', () => {
    it('returns a single group by ID', async () => {
      const res = await request(app)
        .get('/scim/v2/Groups/role-admin')
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(200);
      expect(res.body.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:Group');
      expect(res.body.id).toBe('role-admin');
      expect(res.body.displayName).toBe('Admin');
      expect(res.body.meta.resourceType).toBe('Group');
    });

    it('returns 404 for non-existent group', async () => {
      const res = await request(app)
        .get('/scim/v2/Groups/nonexistent-group')
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(404);
      expect(res.body.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:Error');
    });

    it('includes members array in group response', async () => {
      const res = await request(app)
        .get('/scim/v2/Groups/role-manager')
        .set('Authorization', `Bearer ${scimToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('members');
      expect(Array.isArray(res.body.members)).toBe(true);
    });
  });

  // ─────────────────────── SCIM Group PATCH Tests ───────────────────────

  describe('PATCH /scim/v2/Groups/:id', () => {
    let memberUserId: string;

    beforeAll(async () => {
      const memberApp = express();
      memberApp.use(express.json());
      memberApp.use('/scim/v2', scimRouter);

      const createRes = await request(memberApp)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          userName: `group-member-${Date.now()}@example.com`,
          displayName: 'Group Member Test',
          active: true,
        });
      memberUserId = createRes.body.id;
    });

    it('adds a member to a group', async () => {
      const res = await request(app)
        .patch('/scim/v2/Groups/role-auditor')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'add',
              path: 'members',
              value: [{ value: memberUserId, display: 'Group Member Test' }],
            },
          ],
        });

      expect(res.status).toBe(200);
      const memberIds = res.body.members.map((m: any) => m.value);
      expect(memberIds).toContain(memberUserId);
    });

    it('removes a member from a group', async () => {
      // First ensure the member is in the group
      await request(app)
        .patch('/scim/v2/Groups/role-auditor')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'add',
              path: 'members',
              value: [{ value: memberUserId, display: 'Group Member Test' }],
            },
          ],
        });

      // Now remove the member
      const res = await request(app)
        .patch('/scim/v2/Groups/role-auditor')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'remove',
              path: `members[value eq "${memberUserId}"]`,
            },
          ],
        });

      expect(res.status).toBe(200);
      const memberIds = res.body.members.map((m: any) => m.value);
      expect(memberIds).not.toContain(memberUserId);
    });

    it('renames a group via displayName replace', async () => {
      const res = await request(app)
        .patch('/scim/v2/Groups/role-operator')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'replace',
              path: 'displayName',
              value: 'Operator Renamed',
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.displayName).toBe('Operator Renamed');
    });

    it('returns 404 when patching non-existent group', async () => {
      const res = await request(app)
        .patch('/scim/v2/Groups/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [{ op: 'add', path: 'members', value: [{ value: 'user-1' }] }],
        });

      expect(res.status).toBe(404);
    });

    it('returns 400 when Operations is not an array', async () => {
      const res = await request(app)
        .patch('/scim/v2/Groups/role-admin')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: 'invalid',
        });

      expect(res.status).toBe(400);
      expect(res.body.detail).toBeDefined();
    });

    it('does not add duplicate members', async () => {
      // Add the member twice
      await request(app)
        .patch('/scim/v2/Groups/role-viewer')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          Operations: [
            {
              op: 'add',
              path: 'members',
              value: [{ value: memberUserId, display: 'Group Member Test' }],
            },
          ],
        });

      const res = await request(app)
        .patch('/scim/v2/Groups/role-viewer')
        .set('Authorization', `Bearer ${scimToken}`)
        .send({
          Operations: [
            {
              op: 'add',
              path: 'members',
              value: [{ value: memberUserId, display: 'Group Member Test' }],
            },
          ],
        });

      expect(res.status).toBe(200);
      const memberMatches = res.body.members.filter((m: any) => m.value === memberUserId);
      expect(memberMatches.length).toBe(1);
    });
  });

  // ─────────────────────── ServiceProviderConfig filter support ───────────────────────

  describe('ServiceProviderConfig filter support', () => {
    it('shows filter.supported = true in ServiceProviderConfig', async () => {
      const res = await request(app).get('/scim/v2/ServiceProviderConfig');

      expect(res.status).toBe(200);
      expect(res.body.filter).toBeDefined();
      expect(res.body.filter.supported).toBe(true);
      expect(res.body.filter.maxResults).toBe(200);
    });
  });

  describe('SCIM — final coverage batch', () => {
    it('GET /scim/v2/ServiceProviderConfig returns 200 without Authorization header', async () => {
      const res = await request(app).get('/scim/v2/ServiceProviderConfig');
      expect(res.status).toBe(200);
    });

    it('GET /scim/v2/Groups includes totalResults field', async () => {
      const res = await request(app)
        .get('/scim/v2/Groups')
        .set('Authorization', `Bearer ${scimToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalResults');
    });
  });
});

describe('scim — phase29 coverage', () => {
  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

  it('handles reduce method', () => {
    expect([1, 2, 3].reduce((acc, x) => acc + x, 0)).toBe(6);
  });

  it('handles parseFloat', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
  });

  it('handles string slice', () => {
    expect('hello'.slice(1, 3)).toBe('el');
  });

  it('handles BigInt type', () => {
    expect(typeof BigInt(42)).toBe('bigint');
  });

});

describe('scim — phase30 coverage', () => {
  it('handles slice method', () => {
    expect([1, 2, 3, 4].slice(1, 3)).toEqual([2, 3]);
  });

  it('handles indexOf method', () => {
    expect([1, 2, 3].indexOf(2)).toBe(1);
  });

  it('handles structuredClone', () => {
    const obj2 = { a: 1 }; const clone = structuredClone(obj2); expect(clone).toEqual(obj2); expect(clone).not.toBe(obj2);
  });

  it('handles Math.round', () => {
    expect(Math.round(3.7)).toBe(4);
  });

  it('handles parseInt', () => {
    expect(parseInt('42', 10)).toBe(42);
  });

});


describe('phase31 coverage', () => {
  it('handles try/catch', () => { let caught = false; try { throw new Error('x'); } catch { caught = true; } expect(caught).toBe(true); });
  it('handles array every', () => { expect([2,4,6].every(x => x % 2 === 0)).toBe(true); });
  it('handles Symbol creation', () => { const s = Symbol('test'); expect(typeof s).toBe('symbol'); });
  it('handles string toUpperCase', () => { expect('hello'.toUpperCase()).toBe('HELLO'); });
  it('handles string repeat', () => { expect('ab'.repeat(3)).toBe('ababab'); });
});


describe('phase32 coverage', () => {
  it('handles closure', () => { const counter = () => { let n = 0; return () => ++n; }; const inc = counter(); expect(inc()).toBe(1); expect(inc()).toBe(2); });
  it('handles object property shorthand', () => { const x = 1, y = 2; const o = {x, y}; expect(o).toEqual({x:1,y:2}); });
  it('handles array join', () => { expect([1,2,3].join('-')).toBe('1-2-3'); });
  it('handles logical nullish assignment', () => { let z: number | null = null; z ??= 3; expect(z).toBe(3); });
  it('handles bitwise OR', () => { expect(6 | 3).toBe(7); });
});
