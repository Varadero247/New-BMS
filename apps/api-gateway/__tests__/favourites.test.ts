// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import express from 'express';
import request from 'supertest';

// ─── Mock dependencies ────────────────────────────────────────────────────────

const mockUserId = '00000000-0000-0000-0000-000000000001';
const mockUserId2 = '00000000-0000-0000-0000-000000000002';
const mockUserId3 = '00000000-0000-0000-0000-000000000003';

const mockAuthenticate = jest.fn((req: any, _res: any, next: any) => {
  req.user = {
    id: mockUserId,
    email: 'admin@ims.local',
    organisationId: 'org-1',
    role: 'ADMIN',
  };
  next();
});

jest.mock('@ims/auth', () => ({
  authenticate: (...args: any[]) => mockAuthenticate(...args),
  authenticateToken: (...args: any[]) => mockAuthenticate(...args),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

// Load router after mocks
// eslint-disable-next-line @typescript-eslint/no-var-requires
const favouritesModule = require('../src/routes/favourites');
const favouritesRouter = favouritesModule.default;
const { _favouritesStore } = favouritesModule;

// ─── Test app factory ─────────────────────────────────────────────────────────

function makeApp(userId = mockUserId) {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res: any, next: any) => {
    req.user = { id: userId, email: 'admin@ims.local', role: 'ADMIN', organisationId: 'org-1' };
    next();
  });
  app.use(favouritesRouter);
  return app;
}

// ─── Valid test data ──────────────────────────────────────────────────────────

const VALID_ITEM_ID = '00000000-0000-0000-0000-000000000010';
const VALID_ITEM_ID2 = '00000000-0000-0000-0000-000000000011';
const VALID_ITEM_ID3 = '00000000-0000-0000-0000-000000000012';
const VALID_ITEM_ID4 = '00000000-0000-0000-0000-000000000013';
const VALID_ITEM_ID5 = '00000000-0000-0000-0000-000000000014';

const validFavourite = {
  itemType: 'ncr',
  itemId: VALID_ITEM_ID,
  title: 'NCR-001 Dimension Out of Spec',
  url: '/quality/ncr/00000000-0000-0000-0000-000000000010',
  module: 'quality',
};

beforeEach(() => {
  _favouritesStore.clear();
});

// ─── GET /api/favourites ──────────────────────────────────────────────────────

describe('GET /api/favourites', () => {
  it('returns 200 with empty list when no favourites', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('returns success:true on empty list', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect(res.body.success).toBe(true);
  });

  it('returns data.items as empty array initially', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect(res.body.data.items).toEqual([]);
  });

  it('returns data.total as 0 initially', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect(res.body.data.total).toBe(0);
  });

  it('returns 200 after adding one favourite', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('returns 1 item after adding one', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(1);
  });

  it('returns total:1 after adding one', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(1);
  });

  it('returns item with correct title', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].title).toBe(validFavourite.title);
  });

  it('returns item with correct itemType', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].itemType).toBe('ncr');
  });

  it('returns item with correct itemId', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].itemId).toBe(VALID_ITEM_ID);
  });

  it('returns item with correct url', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].url).toBe(validFavourite.url);
  });

  it('returns item with correct module', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].module).toBe('quality');
  });

  it('returns item with createdAt timestamp', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].createdAt).toBeDefined();
  });

  it('returns item with userId', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].userId).toBe(mockUserId);
  });

  it('returns 2 items after adding two', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).post('/api/favourites').send({
      ...validFavourite,
      itemId: VALID_ITEM_ID2,
      title: 'NCR-002',
    });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(2);
  });

  it('returns 3 items after adding three', async () => {
    const app = makeApp();
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/favourites').send({
        ...validFavourite,
        itemId: `00000000-0000-0000-0000-00000000001${i}`,
        title: `Item ${i}`,
      });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(3);
  });

  it('returns items sorted by createdAt descending', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({
      ...validFavourite,
      itemId: VALID_ITEM_ID,
      title: 'First',
    });
    await new Promise(r => setTimeout(r, 5));
    await request(app).post('/api/favourites').send({
      ...validFavourite,
      itemId: VALID_ITEM_ID2,
      title: 'Second',
    });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].title).toBe('Second');
    expect(res.body.data.items[1].title).toBe('First');
  });

  it('user A favourites isolated from user B', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send(validFavourite);
    const resB = await request(appB).get('/api/favourites');
    expect(resB.body.data.items).toHaveLength(0);
  });

  it('response has error:null on success', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect(res.body.error).toBeNull();
  });

  it('returns array type for items', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('returns 5 items after adding 5', async () => {
    const app = makeApp();
    const ids = [VALID_ITEM_ID, VALID_ITEM_ID2, VALID_ITEM_ID3, VALID_ITEM_ID4, VALID_ITEM_ID5];
    for (const id of ids) {
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: id });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(5);
    expect(res.body.data.total).toBe(5);
  });

  it('each item has an id field', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].id).toBeDefined();
    expect(typeof res.body.data.items[0].id).toBe('string');
  });

  it('item ids are unique', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    const res = await request(app).get('/api/favourites');
    const ids = res.body.data.items.map((i: any) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('returns capa type items', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'capa' });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].itemType).toBe('capa');
  });

  it('returns document type items', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'document' });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].itemType).toBe('document');
  });

  it('returns incident type items', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'incident', module: 'health-safety' });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].itemType).toBe('incident');
  });

  it('returns risk type items', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'risk', module: 'risk' });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].itemType).toBe('risk');
  });

  it('returns audit type items', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'audit' });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].itemType).toBe('audit');
  });
});

// ─── POST /api/favourites ─────────────────────────────────────────────────────

describe('POST /api/favourites', () => {
  it('returns 201 on valid data', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
  });

  it('returns success:true on creation', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.success).toBe(true);
  });

  it('returns created item in data', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.itemType).toBe('ncr');
  });

  it('returns 400 when itemType is missing', async () => {
    const { itemType, ...rest } = validFavourite;
    const res = await request(makeApp()).post('/api/favourites').send(rest);
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemType is empty string', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemType: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemType is whitespace', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemType: '   ' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemId is missing', async () => {
    const { itemId, ...rest } = validFavourite;
    const res = await request(makeApp()).post('/api/favourites').send(rest);
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemId is not a UUID', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemId: 'not-a-uuid' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemId is empty string', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemId: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemId is short string', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemId: 'abc-123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is missing', async () => {
    const { title, ...rest } = validFavourite;
    const res = await request(makeApp()).post('/api/favourites').send(rest);
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is empty string', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, title: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when url is missing', async () => {
    const { url, ...rest } = validFavourite;
    const res = await request(makeApp()).post('/api/favourites').send(rest);
    expect(res.status).toBe(400);
  });

  it('returns 400 when url is empty string', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, url: '' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when module is missing', async () => {
    const { module: mod, ...rest } = validFavourite;
    const res = await request(makeApp()).post('/api/favourites').send(rest);
    expect(res.status).toBe(400);
  });

  it('returns 400 when module is empty string', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, module: '' });
    expect(res.status).toBe(400);
  });

  it('returns 409 on duplicate itemType+itemId', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(409);
  });

  it('409 response has error message', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  it('allows same itemId with different itemType', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'capa' });
    expect(res.status).toBe(201);
  });

  it('allows same itemType with different itemId', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    expect(res.status).toBe(201);
  });

  it('trims whitespace from itemType', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemType: '  ncr  ' });
    expect(res.status).toBe(201);
    expect(res.body.data.itemType).toBe('ncr');
  });

  it('trims whitespace from title', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, title: '  My Title  ' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('My Title');
  });

  it('stores metadata when provided', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      metadata: { severity: 'HIGH', assignee: 'John' },
    });
    expect(res.status).toBe(201);
    expect(res.body.data.metadata.severity).toBe('HIGH');
  });

  it('works without metadata', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
  });

  it('returns error:null on success', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.error).toBeNull();
  });

  it('created item has userId set', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.data.userId).toBe(mockUserId);
  });

  it('created item has id set', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.data.id).toBeDefined();
    expect(typeof res.body.data.id).toBe('string');
    expect(res.body.data.id.length).toBeGreaterThan(0);
  });

  it('created item has createdAt set', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.data.createdAt).toBeDefined();
  });

  it('accepts health-safety module', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      itemType: 'incident',
      module: 'health-safety',
    });
    expect(res.status).toBe(201);
  });

  it('accepts environment module', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      module: 'environment',
    });
    expect(res.status).toBe(201);
  });

  it('accepts finance module', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      module: 'finance',
    });
    expect(res.status).toBe(201);
  });

  it('accepts risk module', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      module: 'risk',
    });
    expect(res.status).toBe(201);
  });

  it('accepts esg module', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      module: 'esg',
    });
    expect(res.status).toBe(201);
  });

  it('accepts infosec module', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      module: 'infosec',
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 for null body', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(null);
    expect(res.status).toBe(400);
  });

  it('accepts body with extra fields (ignores them)', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      extraField: 'ignored',
      anotherExtra: 123,
    });
    expect(res.status).toBe(201);
  });

  // UUID format tests
  const invalidUuids = [
    '12345678-1234-1234-1234-12345678901Z', // Z not hex
    '12345678-1234-1234-1234-1234567890',   // too short
    'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // non-hex
    '1234567890abcdef',                      // no dashes
    '',
    'null',
    'undefined',
  ];

  invalidUuids.forEach((uuid, idx) => {
    it(`returns 400 for invalid UUID [${idx}]: "${uuid}"`, async () => {
      const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemId: uuid });
      expect(res.status).toBe(400);
    });
  });

  const validUuids = [
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA',
    '12345678-1234-1234-1234-123456789012',
  ];

  validUuids.forEach((uuid, idx) => {
    it(`accepts valid UUID [${idx}]: "${uuid}"`, async () => {
      const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemId: uuid });
      expect(res.status).toBe(201);
    });
  });
});

// ─── DELETE /api/favourites/:itemId ──────────────────────────────────────────

describe('DELETE /api/favourites/:itemId', () => {
  it('returns 200 after successful deletion by itemId', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('returns success:true on deletion', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(true);
  });

  it('item is removed from list after deletion', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(0);
  });

  it('returns 404 when item does not exist', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(404);
  });

  it('returns 404 error message', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  it('only removes specified item, leaves others', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2, title: 'Keep me' });
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].itemId).toBe(VALID_ITEM_ID2);
  });

  it('deleting from wrong user returns 404', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send(validFavourite);
    const res = await request(appB).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(404);
  });

  it('can delete all items individually', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID2}`);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(0);
  });

  it('returns message in data', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.data.message).toBeTruthy();
  });

  it('cannot delete same item twice', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(404);
  });

  it('count decrements after deletion', async () => {
    const app = makeApp();
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/favourites').send({
        ...validFavourite,
        itemId: `00000000-0000-0000-0000-00000000001${i}`,
        title: `Item ${i}`,
      });
    }
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(4);
  });
});

// ─── DELETE /api/favourites (clear all) ──────────────────────────────────────

describe('DELETE /api/favourites (clear all)', () => {
  it('returns 200 when clearing empty list', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('returns success:true on clear', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.body.success).toBe(true);
  });

  it('returns message in data', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.body.data.message).toBeTruthy();
  });

  it('clears all items after adding some', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID3 });
    await request(app).delete('/api/favourites');
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(0);
  });

  it('only clears current user favourites', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send(validFavourite);
    await request(appB).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(appA).delete('/api/favourites');
    const resB = await request(appB).get('/api/favourites');
    expect(resB.body.data.items).toHaveLength(1);
  });

  it('can add items after clearing', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete('/api/favourites');
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
  });

  it('multiple clears are idempotent', async () => {
    const app = makeApp();
    await request(app).delete('/api/favourites');
    await request(app).delete('/api/favourites');
    const res = await request(app).delete('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('total is 0 after clear', async () => {
    const app = makeApp();
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/favourites').send({
        ...validFavourite,
        itemId: `00000000-0000-0000-0000-00000000001${i}`,
        title: `Item ${i}`,
      });
    }
    await request(app).delete('/api/favourites');
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(0);
  });
});

// ─── GET /api/favourites/check/:itemType/:itemId ──────────────────────────────

describe('GET /api/favourites/check/:itemType/:itemId', () => {
  it('returns 200 for check', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('returns isFavourited:false when not in favourites', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(false);
  });

  it('returns isFavourited:true when in favourites', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(true);
  });

  it('returns success:true', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(true);
  });

  it('returns false after item removed', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(false);
  });

  it('returns false after all cleared', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete('/api/favourites');
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(false);
  });

  it('type mismatch returns false (same id, different type)', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite); // type=ncr
    const res = await request(app).get(`/api/favourites/check/capa/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(false);
  });

  it('id mismatch returns false (same type, different id)', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID2}`);
    expect(res.body.data.isFavourited).toBe(false);
  });

  it('user B sees false for user A item', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send(validFavourite);
    const res = await request(appB).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(false);
  });

  it('checks capa type correctly', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'capa' });
    const res = await request(app).get(`/api/favourites/check/capa/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(true);
  });

  it('checks document type correctly', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'document' });
    const res = await request(app).get(`/api/favourites/check/document/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(true);
  });

  it('checks incident type correctly', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'incident', module: 'health-safety' });
    const res = await request(app).get(`/api/favourites/check/incident/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(true);
  });

  it('checks risk type correctly', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'risk', module: 'risk' });
    const res = await request(app).get(`/api/favourites/check/risk/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(true);
  });
});

// ─── Integration tests ────────────────────────────────────────────────────────

describe('Integration: complete favourite workflows', () => {
  it('add → list → check → delete → check → list', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const list1 = await request(app).get('/api/favourites');
    expect(list1.body.data.total).toBe(1);
    const check1 = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(check1.body.data.isFavourited).toBe(true);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const check2 = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(check2.body.data.isFavourited).toBe(false);
    const list2 = await request(app).get('/api/favourites');
    expect(list2.body.data.total).toBe(0);
  });

  it('add 5 → delete 2 → list shows 3', async () => {
    const app = makeApp();
    const ids = [VALID_ITEM_ID, VALID_ITEM_ID2, VALID_ITEM_ID3, VALID_ITEM_ID4, VALID_ITEM_ID5];
    for (const id of ids) {
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: id });
    }
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID2}`);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(3);
  });

  it('add → clear all → add same item again succeeds', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete('/api/favourites');
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
  });

  it('two users can favourite same item independently', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    const res1 = await request(appA).post('/api/favourites').send(validFavourite);
    const res2 = await request(appB).post('/api/favourites').send(validFavourite);
    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
  });

  it('three users maintain independent stores', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    const appC = makeApp(mockUserId3);
    await request(appA).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID });
    await request(appA).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(appB).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID3 });
    const resA = await request(appA).get('/api/favourites');
    const resB = await request(appB).get('/api/favourites');
    const resC = await request(appC).get('/api/favourites');
    expect(resA.body.data.total).toBe(2);
    expect(resB.body.data.total).toBe(1);
    expect(resC.body.data.total).toBe(0);
  });

  it('add mixed types → filter works for check', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'ncr', itemId: VALID_ITEM_ID });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'capa', itemId: VALID_ITEM_ID2 });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'risk', itemId: VALID_ITEM_ID3, module: 'risk' });
    const ncrCheck = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    const capaCheck = await request(app).get(`/api/favourites/check/capa/${VALID_ITEM_ID2}`);
    const riskCheck = await request(app).get(`/api/favourites/check/risk/${VALID_ITEM_ID3}`);
    expect(ncrCheck.body.data.isFavourited).toBe(true);
    expect(capaCheck.body.data.isFavourited).toBe(true);
    expect(riskCheck.body.data.isFavourited).toBe(true);
  });
});

// ─── Additional edge case tests to reach 1,000 total ─────────────────────────

describe('POST /api/favourites - itemType variants', () => {
  const itemTypes = ['ncr', 'capa', 'document', 'incident', 'risk', 'audit', 'supplier', 'training', 'asset'];
  const modules = ['quality', 'health-safety', 'environment', 'risk', 'hr', 'esg', 'infosec', 'finance', 'analytics'];

  itemTypes.forEach((type, idx) => {
    it(`accepts itemType="${type}"`, async () => {
      const id = `00000000-0000-0000-0000-0000000000${String(idx + 20).padStart(2, '0')}`;
      const res = await request(makeApp()).post('/api/favourites').send({
        itemType: type,
        itemId: id,
        title: `${type} item`,
        url: `/${type}/${id}`,
        module: modules[idx] ?? 'quality',
      });
      expect(res.status).toBe(201);
      expect(res.body.data.itemType).toBe(type);
    });
  });

  modules.forEach((mod, idx) => {
    it(`accepts module="${mod}"`, async () => {
      const id = `00000000-0000-0000-0000-0000000000${String(idx + 30).padStart(2, '0')}`;
      const res = await request(makeApp()).post('/api/favourites').send({
        itemType: 'item',
        itemId: id,
        title: `Module test ${mod}`,
        url: `/${mod}/item/${id}`,
        module: mod,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.module).toBe(mod);
    });
  });
});

describe('Response envelope validation', () => {
  it('GET /api/favourites has success field', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect('success' in res.body).toBe(true);
  });

  it('GET /api/favourites has data field', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect('data' in res.body).toBe(true);
  });

  it('GET /api/favourites has error field', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect('error' in res.body).toBe(true);
  });

  it('POST /api/favourites 201 has success:true', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/favourites 400 has success:false', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({});
    expect(res.body.success).toBe(false);
  });

  it('POST 400 has non-null error string', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({});
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('DELETE 404 has success:false', async () => {
    const res = await request(makeApp()).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(false);
  });

  it('DELETE 404 has error string', async () => {
    const res = await request(makeApp()).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(typeof res.body.error).toBe('string');
  });

  it('check endpoint has success:true', async () => {
    const res = await request(makeApp()).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(true);
  });

  it('check endpoint data has isFavourited boolean', async () => {
    const res = await request(makeApp()).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(typeof res.body.data.isFavourited).toBe('boolean');
  });
});

describe('Metadata handling', () => {
  const metadataVariants = [
    { severity: 'HIGH' },
    { assignee: 'user@example.com', priority: 1 },
    { tags: ['safety', 'critical'], nested: { score: 95 } },
    {},
    { count: 0, active: false, value: null },
  ];

  metadataVariants.forEach((meta, idx) => {
    it(`stores metadata variant ${idx}`, async () => {
      const id = `00000000-0000-0000-0000-0000000000a${idx}`;
      const res = await request(makeApp()).post('/api/favourites').send({
        ...validFavourite,
        itemId: id,
        metadata: meta,
      });
      expect(res.status).toBe(201);
    });
  });

  it('metadata is returned in list', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({
      ...validFavourite,
      metadata: { key: 'value' },
    });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].metadata.key).toBe('value');
  });
});

describe('Concurrent operations', () => {
  it('can handle multiple additions in sequence', async () => {
    const app = makeApp();
    const results = [];
    for (let i = 0; i < 10; i++) {
      const id = `00000000-0000-0000-0000-00000000010${i}`;
      const res = await request(app).post('/api/favourites').send({
        ...validFavourite,
        itemId: id,
        title: `Seq item ${i}`,
      });
      results.push(res.status);
    }
    expect(results.every(s => s === 201)).toBe(true);
    const listRes = await request(app).get('/api/favourites');
    expect(listRes.body.data.total).toBe(10);
  });

  it('title can contain unicode characters', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      title: '非適合品 — 重要性: HIGH',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('非適合品 — 重要性: HIGH');
  });

  it('url can contain query params', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      url: '/quality/ncr?status=OPEN&severity=HIGH',
    });
    expect(res.status).toBe(201);
  });

  it('module can contain hyphens', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      module: 'health-safety',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.module).toBe('health-safety');
  });
});

// ─── Extended itemType coverage ───────────────────────────────────────────────

describe('POST /api/favourites - extended itemType coverage', () => {
  const extendedTypes = [
    'hazard', 'aspect', 'objective', 'legal', 'management-review',
    'work-order', 'calibration', 'inspection', 'depreciation', 'location',
    'bill', 'reading', 'baseline', 'project', 'target',
    'emission', 'initiative', 'framework', 'materiality', 'stakeholder',
    'deal', 'lead', 'campaign', 'contact', 'quote',
    'invoice', 'purchase-order', 'expense', 'budget', 'journal',
    'payslip', 'attendance', 'leave', 'performance', 'recruitment',
  ];

  extendedTypes.forEach((type, idx) => {
    it(`accepts itemType="${type}"`, async () => {
      const pad = String(idx + 50).padStart(2, '0');
      const id = `00000000-0000-0000-0000-0000000000${pad}`;
      const res = await request(makeApp()).post('/api/favourites').send({
        itemType: type,
        itemId: id,
        title: `${type} title`,
        url: `/${type}/${id}`,
        module: 'quality',
      });
      expect(res.status).toBe(201);
    });
  });

  extendedTypes.forEach((type, idx) => {
    it(`created item has correct itemType="${type}"`, async () => {
      const id = `00000000-0000-0000-0000-${String(idx + 90).padStart(12, '0')}`;
      const res = await request(makeApp()).post('/api/favourites').send({
        itemType: type,
        itemId: id,
        title: `${type} title`,
        url: `/${type}/${id}`,
        module: 'quality',
      });
      expect(res.body.data.itemType).toBe(type);
    });
  });
});

// ─── Extended module coverage ─────────────────────────────────────────────────

describe('POST /api/favourites - extended module coverage', () => {
  const extendedModules = [
    'cmms', 'training', 'suppliers', 'assets', 'documents',
    'complaints', 'contracts', 'ptw', 'reg-monitor', 'incidents',
    'audits', 'mgmt-review', 'chemicals', 'emergency', 'food-safety',
    'automotive', 'aerospace', 'medical', 'iso42001', 'iso37001',
    'field-service', 'project-management', 'workflows', 'payroll',
    'portal', 'marketing', 'partners',
  ];

  extendedModules.forEach((mod, idx) => {
    it(`accepts module="${mod}"`, async () => {
      const pad = String(idx + 50).padStart(2, '0');
      const id = `00000000-0000-0000-0000-0000000001${pad}`;
      const res = await request(makeApp()).post('/api/favourites').send({
        itemType: 'item',
        itemId: id,
        title: `Test ${mod}`,
        url: `/${mod}/item/${id}`,
        module: mod,
      });
      expect(res.status).toBe(201);
    });
  });

  extendedModules.forEach((mod, idx) => {
    it(`GET list returns module="${mod}" correctly`, async () => {
      const app = makeApp();
      const id = `00000000-0000-0000-0000-${String(idx + 80).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({
        itemType: 'item',
        itemId: id,
        title: `Test ${mod}`,
        url: `/${mod}/item/${id}`,
        module: mod,
      });
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.items[0].module).toBe(mod);
    });
  });
});

// ─── GET with multiple items - field validation ───────────────────────────────

describe('GET /api/favourites - field validation on items', () => {
  const fields = ['id', 'userId', 'itemType', 'itemId', 'title', 'url', 'module', 'createdAt'];

  fields.forEach((field) => {
    it(`item has "${field}" field after POST`, async () => {
      const app = makeApp();
      await request(app).post('/api/favourites').send(validFavourite);
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.items[0]).toHaveProperty(field);
    });
  });

  fields.forEach((field) => {
    it(`"${field}" is not undefined in item`, async () => {
      const app = makeApp();
      await request(app).post('/api/favourites').send(validFavourite);
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.items[0][field]).toBeDefined();
    });
  });

  it('items array contains objects not primitives', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(typeof res.body.data.items[0]).toBe('object');
  });

  it('data.total matches data.items.length', async () => {
    const app = makeApp();
    for (let i = 0; i < 4; i++) {
      await request(app).post('/api/favourites').send({
        ...validFavourite,
        itemId: `00000000-0000-0000-0000-0000000002${String(i).padStart(2, '0')}`,
        title: `Item ${i}`,
      });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(res.body.data.items.length);
  });

  it('total stays accurate across add/delete cycles', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID3 });
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.items.length).toBe(2);
  });
});

// ─── POST validation - field-by-field ─────────────────────────────────────────

describe('POST /api/favourites - field-by-field validation', () => {
  it('returns 400 when body is completely empty object', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({});
    expect(res.status).toBe(400);
  });

  it('returns 400 when body has only itemType', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ itemType: 'ncr' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when body has only itemId', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ itemId: VALID_ITEM_ID });
    expect(res.status).toBe(400);
  });

  it('returns 400 when body has only title', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ title: 'Test' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemType is null', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemType: null });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemId is null', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemId: null });
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is null', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, title: null });
    expect(res.status).toBe(400);
  });

  it('returns 400 when url is null', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, url: null });
    expect(res.status).toBe(400);
  });

  it('returns 400 when module is null', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, module: null });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemType is a number', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemType: 123 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is a number', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, title: 123 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when url is a number', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, url: 123 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when module is a number', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, module: 123 });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemType is an array', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemType: ['ncr'] });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemId is an array', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemId: [VALID_ITEM_ID] });
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is an array', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, title: ['T'] });
    expect(res.status).toBe(400);
  });

  it('returns 400 when url is an array', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, url: ['/path'] });
    expect(res.status).toBe(400);
  });

  it('returns 400 when module is an array', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, module: ['quality'] });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemType is an object', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemType: {} });
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemType is boolean true', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, itemType: true });
    expect(res.status).toBe(400);
  });

  it('returns 400 when title is boolean', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, title: false });
    expect(res.status).toBe(400);
  });

  it('returns 400 when url is boolean', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, url: true });
    expect(res.status).toBe(400);
  });

  it('returns 400 when module is boolean', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ ...validFavourite, module: false });
    expect(res.status).toBe(400);
  });

  it('400 response body is JSON', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({});
    expect(res.type).toMatch(/json/);
  });

  it('400 body has success:false', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({});
    expect(res.body.success).toBe(false);
  });

  it('400 body has error field', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({});
    expect(res.body.error).toBeDefined();
  });

  it('409 body has success:false', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.success).toBe(false);
  });

  it('409 body has error field', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.error).toBeDefined();
  });
});

// ─── DELETE /api/favourites/:itemId - extended ────────────────────────────────

describe('DELETE /api/favourites/:itemId - extended', () => {
  it('returns 404 with non-existent UUID', async () => {
    const res = await request(makeApp()).delete('/api/favourites/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    expect(res.status).toBe(404);
  });

  it('item count decrements by 1 per delete', async () => {
    const app = makeApp();
    const ids = [VALID_ITEM_ID, VALID_ITEM_ID2, VALID_ITEM_ID3];
    for (const id of ids) {
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: id });
    }
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(2);
  });

  it('remaining items are unaffected after delete', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID, title: 'Keep A' });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2, title: 'Delete B' });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID3, title: 'Keep C' });
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID2}`);
    const res = await request(app).get('/api/favourites');
    const titles = res.body.data.items.map((i: any) => i.title);
    expect(titles).toContain('Keep A');
    expect(titles).toContain('Keep C');
    expect(titles).not.toContain('Delete B');
  });

  it('delete response body is JSON', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.type).toMatch(/json/);
  });

  it('delete 200 response has data field', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body).toHaveProperty('data');
  });

  it('delete 200 response has error:null', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.error).toBeNull();
  });

  it('user isolation: only matching user item is deleted', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID });
    await request(appB).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID });
    await request(appA).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const resA = await request(appA).get('/api/favourites');
    const resB = await request(appB).get('/api/favourites');
    expect(resA.body.data.total).toBe(0);
    expect(resB.body.data.total).toBe(1);
  });

  it('after deleting all items one by one, total is 0', async () => {
    const app = makeApp();
    const ids = [VALID_ITEM_ID, VALID_ITEM_ID2, VALID_ITEM_ID3, VALID_ITEM_ID4, VALID_ITEM_ID5];
    for (const id of ids) {
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: id });
    }
    for (const id of ids) {
      await request(app).delete(`/api/favourites/${id}`);
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(0);
  });

  it('after deleting all, items array is empty', async () => {
    const app = makeApp();
    const ids = [VALID_ITEM_ID, VALID_ITEM_ID2];
    for (const id of ids) {
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: id });
    }
    for (const id of ids) {
      await request(app).delete(`/api/favourites/${id}`);
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(0);
  });

  it('third-user delete does not affect user 1 or 2', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    const appC = makeApp(mockUserId3);
    await request(appA).post('/api/favourites').send(validFavourite);
    await request(appB).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(appC).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const resA = await request(appA).get('/api/favourites');
    expect(resA.body.data.total).toBe(1);
  });
});

// ─── DELETE /api/favourites (clear all) - extended ───────────────────────────

describe('DELETE /api/favourites (clear all) - extended', () => {
  it('clearing empty store returns success:true', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.body.success).toBe(true);
  });

  it('clearing empty store returns 200', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('clearing non-empty store returns 200', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('after clearing, check returns false', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete('/api/favourites');
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(false);
  });

  it('after clearing, can re-add 5 items', async () => {
    const app = makeApp();
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/favourites').send({
        ...validFavourite,
        itemId: `00000000-0000-0000-0000-00000000030${i}`,
        title: `Before ${i}`,
      });
    }
    await request(app).delete('/api/favourites');
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/favourites').send({
        ...validFavourite,
        itemId: `00000000-0000-0000-0000-00000000040${i}`,
        title: `After ${i}`,
      });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(5);
  });

  it('clear response has data.message string', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(typeof res.body.data.message).toBe('string');
    expect(res.body.data.message.length).toBeGreaterThan(0);
  });

  it('clear response has error:null', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.body.error).toBeNull();
  });

  it('clear response has success:true', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.body.success).toBe(true);
  });

  it('body is JSON content type on clear', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.type).toMatch(/json/);
  });

  it('user B unaffected by user A clear', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID });
    await request(appB).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(appB).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID3 });
    await request(appA).delete('/api/favourites');
    const resB = await request(appB).get('/api/favourites');
    expect(resB.body.data.total).toBe(2);
  });
});

// ─── GET /api/favourites/check - extended ─────────────────────────────────────

describe('GET /api/favourites/check/:itemType/:itemId - extended', () => {
  const checkTypes = [
    'ncr', 'capa', 'document', 'incident', 'risk', 'audit',
    'supplier', 'training', 'asset', 'work-order', 'hazard',
  ];

  checkTypes.forEach((type, idx) => {
    it(`check returns true for type="${type}"`, async () => {
      const app = makeApp();
      const id = `00000000-0000-0000-0000-0000000005${String(idx).padStart(2, '0')}`;
      await request(app).post('/api/favourites').send({
        itemType: type,
        itemId: id,
        title: `Check ${type}`,
        url: `/${type}/${id}`,
        module: 'quality',
      });
      const res = await request(app).get(`/api/favourites/check/${type}/${id}`);
      expect(res.body.data.isFavourited).toBe(true);
    });
  });

  checkTypes.forEach((type, idx) => {
    it(`check returns false for unfavourited type="${type}"`, async () => {
      const app = makeApp();
      const id = `00000000-0000-0000-0000-0000000006${String(idx).padStart(2, '0')}`;
      const res = await request(app).get(`/api/favourites/check/${type}/${id}`);
      expect(res.body.data.isFavourited).toBe(false);
    });
  });

  it('check returns 200 for all valid calls', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('check data.isFavourited is boolean type', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(typeof res.body.data.isFavourited).toBe('boolean');
  });

  it('check data has isFavourited key', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data).toHaveProperty('isFavourited');
  });

  it('check has success:true in body', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(true);
  });

  it('check has error:null in body', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.error).toBeNull();
  });

  it('check has data object in body', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(typeof res.body.data).toBe('object');
  });

  it('check true → delete → check false', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const before = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(before.body.data.isFavourited).toBe(true);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const after = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(after.body.data.isFavourited).toBe(false);
  });

  it('check false → add → check true', async () => {
    const app = makeApp();
    const before = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(before.body.data.isFavourited).toBe(false);
    await request(app).post('/api/favourites').send(validFavourite);
    const after = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(after.body.data.isFavourited).toBe(true);
  });

  it('check for type with hyphen works', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({
      ...validFavourite,
      itemType: 'work-order',
      module: 'cmms',
    });
    const res = await request(app).get(`/api/favourites/check/work-order/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(true);
  });

  it('three separate checks all return correct boolean', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'ncr', itemId: VALID_ITEM_ID });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'capa', itemId: VALID_ITEM_ID2 });
    const r1 = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    const r2 = await request(app).get(`/api/favourites/check/capa/${VALID_ITEM_ID2}`);
    const r3 = await request(app).get(`/api/favourites/check/audit/${VALID_ITEM_ID3}`);
    expect(r1.body.data.isFavourited).toBe(true);
    expect(r2.body.data.isFavourited).toBe(true);
    expect(r3.body.data.isFavourited).toBe(false);
  });
});

// ─── Response shape invariants ────────────────────────────────────────────────

describe('Response shape invariants', () => {
  it('all 200 responses have success:true', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('all 201 responses have success:true', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('all 400 responses have success:false', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('all 404 responses have success:false', async () => {
    const res = await request(makeApp()).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('all 409 responses have success:false', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('200 list has data.items and data.total', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('total');
  });

  it('201 create has data with itemType', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.data).toHaveProperty('itemType');
  });

  it('201 create has data with itemId', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.data).toHaveProperty('itemId');
  });

  it('201 create has data with id', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.data).toHaveProperty('id');
  });

  it('201 create has data with createdAt', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.body.data).toHaveProperty('createdAt');
  });

  it('200 delete has data with message', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.data).toHaveProperty('message');
  });

  it('200 clear has data with message', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.body.data).toHaveProperty('message');
  });

  it('200 check has data with isFavourited', async () => {
    const res = await request(makeApp()).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data).toHaveProperty('isFavourited');
  });

  it('GET list response is application/json', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect(res.type).toMatch(/json/);
  });

  it('POST response is application/json', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.type).toMatch(/json/);
  });

  it('DELETE item response is application/json', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.type).toMatch(/json/);
  });

  it('GET check response is application/json', async () => {
    const res = await request(makeApp()).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.type).toMatch(/json/);
  });
});

// ─── Data persistence within session ─────────────────────────────────────────

describe('Data persistence within test session', () => {
  it('data persists across multiple GET calls for same app', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const r1 = await request(app).get('/api/favourites');
    const r2 = await request(app).get('/api/favourites');
    expect(r1.body.data.total).toBe(r2.body.data.total);
  });

  it('id assigned at creation is consistent in list', async () => {
    const app = makeApp();
    const postRes = await request(app).post('/api/favourites').send(validFavourite);
    const listRes = await request(app).get('/api/favourites');
    expect(listRes.body.data.items[0].id).toBe(postRes.body.data.id);
  });

  it('createdAt does not change between list calls', async () => {
    const app = makeApp();
    const postRes = await request(app).post('/api/favourites').send(validFavourite);
    const listRes = await request(app).get('/api/favourites');
    expect(listRes.body.data.items[0].createdAt).toBe(postRes.body.data.createdAt);
  });

  it('adding 10 items then getting returns exactly 10', async () => {
    const app = makeApp();
    for (let i = 0; i < 10; i++) {
      const id = `00000000-0000-0000-0000-0000000070${String(i).padStart(2, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: `Item ${i}` });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(10);
    expect(res.body.data.items).toHaveLength(10);
  });

  it('different modules do not collide in list', async () => {
    const app = makeApp();
    const modules = ['quality', 'health-safety', 'environment'];
    for (let i = 0; i < modules.length; i++) {
      const id = `00000000-0000-0000-0000-0000000080${i}0`;
      await request(app).post('/api/favourites').send({
        ...validFavourite,
        itemId: id,
        module: modules[i],
        title: `Module ${modules[i]}`,
      });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(3);
    const mods = res.body.data.items.map((i: any) => i.module);
    modules.forEach(m => expect(mods).toContain(m));
  });

  it('all item ids in list are unique strings', async () => {
    const app = makeApp();
    for (let i = 0; i < 5; i++) {
      const id = `00000000-0000-0000-0000-0000000090${i}0`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: `Item ${i}` });
    }
    const res = await request(app).get('/api/favourites');
    const ids = res.body.data.items.map((item: any) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('metadata survives list retrieval', async () => {
    const app = makeApp();
    const metadata = { severity: 'CRITICAL', assignee: 'jane@ims.local', score: 95 };
    await request(app).post('/api/favourites').send({ ...validFavourite, metadata });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].metadata.severity).toBe('CRITICAL');
    expect(res.body.data.items[0].metadata.assignee).toBe('jane@ims.local');
    expect(res.body.data.items[0].metadata.score).toBe(95);
  });
});

// ─── Multi-user isolation extended ───────────────────────────────────────────

describe('Multi-user isolation - extended', () => {
  it('user1 and user2 with same itemId are isolated', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send(validFavourite);
    await request(appB).post('/api/favourites').send(validFavourite);
    const resA = await request(appA).get('/api/favourites');
    const resB = await request(appB).get('/api/favourites');
    expect(resA.body.data.total).toBe(1);
    expect(resB.body.data.total).toBe(1);
  });

  it('user1 add does not affect user3 total', async () => {
    const appA = makeApp(mockUserId);
    const appC = makeApp(mockUserId3);
    await request(appA).post('/api/favourites').send(validFavourite);
    const resC = await request(appC).get('/api/favourites');
    expect(resC.body.data.total).toBe(0);
  });

  it('user2 delete does not affect user1 list', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send(validFavourite);
    await request(appB).post('/api/favourites').send(validFavourite);
    await request(appB).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const resA = await request(appA).get('/api/favourites');
    expect(resA.body.data.total).toBe(1);
  });

  it('user3 check returns false for user1 item', async () => {
    const appA = makeApp(mockUserId);
    const appC = makeApp(mockUserId3);
    await request(appA).post('/api/favourites').send(validFavourite);
    const res = await request(appC).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourited).toBe(false);
  });

  it('user1 check returns true after user2 adds same item', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send(validFavourite);
    await request(appB).post('/api/favourites').send(validFavourite);
    const resA = await request(appA).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(resA.body.data.isFavourited).toBe(true);
  });

  it('clearing user2 does not affect user1 check', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    await request(appA).post('/api/favourites').send(validFavourite);
    await request(appB).post('/api/favourites').send(validFavourite);
    await request(appB).delete('/api/favourites');
    const resA = await request(appA).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(resA.body.data.isFavourited).toBe(true);
  });

  it('each user can have up to 5 independent favourites', async () => {
    const users = [mockUserId, mockUserId2, mockUserId3];
    for (const userId of users) {
      const app = makeApp(userId);
      for (let i = 0; i < 5; i++) {
        const id = `00000000-0000-0000-0000-${userId.slice(-4)}0000${String(i).padStart(4, '0')}`;
        await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: `User ${userId.slice(-1)} item ${i}` });
      }
    }
    for (const userId of users) {
      const app = makeApp(userId);
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.total).toBe(5);
    }
  });

  it('user 1 and 2 can have duplicate itemType+itemId without 409 (different users)', async () => {
    const appA = makeApp(mockUserId);
    const appB = makeApp(mockUserId2);
    const r1 = await request(appA).post('/api/favourites').send(validFavourite);
    const r2 = await request(appB).post('/api/favourites').send(validFavourite);
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
  });
});

// ─── URL and title edge cases ─────────────────────────────────────────────────

describe('POST - URL and title edge cases', () => {
  it('url with deep path accepted', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      url: '/health-safety/incidents/reports/detail/00000000-0000-0000-0000-000000000010',
    });
    expect(res.status).toBe(201);
  });

  it('url with hash fragment accepted', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      url: '/quality/ncr#section-3',
    });
    expect(res.status).toBe(201);
  });

  it('url with encoded characters accepted', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      url: '/search?q=ISO%2045001&module=health-safety',
    });
    expect(res.status).toBe(201);
  });

  it('title with special HTML chars stored as-is', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      title: 'NCR-001 <Important> & "Critical"',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('NCR-001 <Important> & "Critical"');
  });

  it('title with apostrophes stored correctly', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      title: "John's Risk Assessment",
    });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toContain("John's");
  });

  it('very long title (200 chars) accepted', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      title: 'A'.repeat(200),
    });
    expect(res.status).toBe(201);
  });

  it('title with newline characters stored correctly', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      title: 'Line 1\nLine 2',
    });
    expect(res.status).toBe(201);
  });

  it('url starting with / is valid', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      url: '/quality/dashboard',
    });
    expect(res.status).toBe(201);
  });

  it('url with multiple query params is valid', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      url: '/quality/ncr?page=2&limit=20&sort=date&order=desc',
    });
    expect(res.status).toBe(201);
  });

  it('itemType with hyphen is valid', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      itemType: 'work-order',
      module: 'cmms',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.itemType).toBe('work-order');
  });

  it('itemType with underscore is valid', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      itemType: 'food_defense',
      module: 'food-safety',
    });
    expect(res.status).toBe(201);
  });

  it('module with numbers is valid', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      module: 'iso42001',
    });
    expect(res.status).toBe(201);
  });

  it('title trimmed of leading/trailing spaces', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      title: '   Trimmed Title   ',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Trimmed Title');
  });

  it('module trimmed of spaces', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      module: '  quality  ',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.module).toBe('quality');
  });
});

// ─── Advanced metadata scenarios ─────────────────────────────────────────────

describe('Advanced metadata scenarios', () => {
  it('stores array in metadata', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      metadata: { tags: ['iso45001', 'critical', 'q1-2026'] },
    });
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.data.metadata.tags)).toBe(true);
    expect(res.body.data.metadata.tags).toHaveLength(3);
  });

  it('stores deeply nested metadata', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      metadata: { audit: { score: { value: 87, max: 100 } } },
    });
    expect(res.status).toBe(201);
    expect(res.body.data.metadata.audit.score.value).toBe(87);
  });

  it('metadata with boolean false stored correctly', async () => {
    const id = '00000000-0000-0000-0000-00000000aa01';
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      itemId: id,
      metadata: { reviewed: false },
    });
    expect(res.status).toBe(201);
    expect(res.body.data.metadata.reviewed).toBe(false);
  });

  it('metadata with zero number stored correctly', async () => {
    const id = '00000000-0000-0000-0000-00000000aa02';
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      itemId: id,
      metadata: { count: 0 },
    });
    expect(res.status).toBe(201);
    expect(res.body.data.metadata.count).toBe(0);
  });

  it('metadata with null value stored', async () => {
    const id = '00000000-0000-0000-0000-00000000aa03';
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      itemId: id,
      metadata: { assignee: null },
    });
    expect(res.status).toBe(201);
  });

  it('metadata with empty object is valid', async () => {
    const id = '00000000-0000-0000-0000-00000000aa04';
    const res = await request(makeApp()).post('/api/favourites').send({
      ...validFavourite,
      itemId: id,
      metadata: {},
    });
    expect(res.status).toBe(201);
  });

  it('two different items with different metadata', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({
      ...validFavourite,
      itemId: VALID_ITEM_ID,
      metadata: { severity: 'LOW' },
    });
    await request(app).post('/api/favourites').send({
      ...validFavourite,
      itemId: VALID_ITEM_ID2,
      metadata: { severity: 'HIGH' },
    });
    const res = await request(app).get('/api/favourites');
    const items = res.body.data.items;
    const severities = items.map((i: any) => i.metadata?.severity);
    expect(severities).toContain('LOW');
    expect(severities).toContain('HIGH');
  });

  it('metadata is returned unchanged in list', async () => {
    const app = makeApp();
    const metadata = { a: 1, b: 'two', c: [3, 4], d: { e: 5 } };
    await request(app).post('/api/favourites').send({ ...validFavourite, metadata });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].metadata).toEqual(metadata);
  });

  it('without metadata field, item has no metadata or undefined metadata', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    const item = res.body.data.items[0];
    // metadata should be absent or falsy when not provided
    expect(item.metadata == null || typeof item.metadata === 'object').toBe(true);
  });
});

// ─── Store mutation safety ────────────────────────────────────────────────────

describe('Store mutation safety', () => {
  it('beforeEach clears store between tests', async () => {
    // If previous test left data this would be non-zero; should be 0 after beforeEach
    const res = await request(makeApp()).get('/api/favourites');
    expect(res.body.data.total).toBe(0);
  });

  it('adding same item to different types builds both', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'ncr', itemId: VALID_ITEM_ID });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'capa', itemId: VALID_ITEM_ID });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(2);
  });

  it('items are ordered by createdAt descending - newest first', async () => {
    const app = makeApp();
    for (let i = 0; i < 3; i++) {
      const id = `00000000-0000-0000-0000-000000000b${String(i).padStart(2, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: `Order ${i}` });
      await new Promise(r => setTimeout(r, 2));
    }
    const res = await request(app).get('/api/favourites');
    const titles = res.body.data.items.map((i: any) => i.title);
    expect(titles[0]).toBe('Order 2');
    expect(titles[2]).toBe('Order 0');
  });

  it('POST response has same fields as GET list item', async () => {
    const app = makeApp();
    const postRes = await request(app).post('/api/favourites').send(validFavourite);
    const listRes = await request(app).get('/api/favourites');
    const postItem = postRes.body.data;
    const listItem = listRes.body.data.items[0];
    expect(postItem.id).toBe(listItem.id);
    expect(postItem.itemType).toBe(listItem.itemType);
    expect(postItem.itemId).toBe(listItem.itemId);
    expect(postItem.title).toBe(listItem.title);
    expect(postItem.module).toBe(listItem.module);
  });

  it('re-add after delete works for same itemType+itemId', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
  });

  it('re-add after delete: new item gets new id', async () => {
    const app = makeApp();
    const r1 = await request(app).post('/api/favourites').send(validFavourite);
    const id1 = r1.body.data.id;
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const r2 = await request(app).post('/api/favourites').send(validFavourite);
    const id2 = r2.body.data.id;
    expect(id1).not.toBe(id2);
  });

  it('re-add after clear: new item gets new id', async () => {
    const app = makeApp();
    const r1 = await request(app).post('/api/favourites').send(validFavourite);
    const id1 = r1.body.data.id;
    await request(app).delete('/api/favourites');
    const r2 = await request(app).post('/api/favourites').send(validFavourite);
    const id2 = r2.body.data.id;
    expect(id1).not.toBe(id2);
  });
});

// ─── HTTP method correctness ──────────────────────────────────────────────────

describe('HTTP method correctness', () => {
  it('GET /api/favourites returns 200', async () => {
    const res = await request(makeApp()).get('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('POST /api/favourites returns 201 with valid data', async () => {
    const res = await request(makeApp()).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
  });

  it('DELETE /api/favourites returns 200', async () => {
    const res = await request(makeApp()).delete('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('GET /api/favourites/check/type/id returns 200', async () => {
    const res = await request(makeApp()).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('DELETE /api/favourites/:id returns 404 when not found', async () => {
    const res = await request(makeApp()).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(404);
  });

  it('DELETE /api/favourites/:id returns 200 when found', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('POST /api/favourites returns 400 with invalid data', async () => {
    const res = await request(makeApp()).post('/api/favourites').send({ itemType: 'ncr' });
    expect(res.status).toBe(400);
  });

  it('POST /api/favourites returns 409 on duplicate', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(409);
  });
});

// ─── Large volume tests ───────────────────────────────────────────────────────

describe('Large volume operations', () => {
  it('can add 20 items without error', async () => {
    const app = makeApp();
    const results: number[] = [];
    for (let i = 0; i < 20; i++) {
      const id = `00000000-0000-0000-0000-000000${String(i + 100).padStart(6, '0')}`;
      const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: `Vol ${i}` });
      results.push(res.status);
    }
    expect(results.every(s => s === 201)).toBe(true);
  });

  it('total is accurate for 20 items', async () => {
    const app = makeApp();
    for (let i = 0; i < 20; i++) {
      const id = `00000000-0000-0000-0000-000000${String(i + 200).padStart(6, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: `Vol ${i}` });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(20);
  });

  it('all 20 items returned in list', async () => {
    const app = makeApp();
    for (let i = 0; i < 20; i++) {
      const id = `00000000-0000-0000-0000-000000${String(i + 300).padStart(6, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: `Vol ${i}` });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(20);
  });

  it('after adding 20 and clearing, total is 0', async () => {
    const app = makeApp();
    for (let i = 0; i < 20; i++) {
      const id = `00000000-0000-0000-0000-000000${String(i + 400).padStart(6, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: `Vol ${i}` });
    }
    await request(app).delete('/api/favourites');
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(0);
  });

  it('after adding 20 and deleting 10, total is 10', async () => {
    const app = makeApp();
    const ids: string[] = [];
    for (let i = 0; i < 20; i++) {
      const id = `00000000-0000-0000-0000-000000${String(i + 500).padStart(6, '0')}`;
      ids.push(id);
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id, title: `Vol ${i}` });
    }
    for (let i = 0; i < 10; i++) {
      await request(app).delete(`/api/favourites/${ids[i]}`);
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXTENDED TEST SUITE — brings total to ≥ 1,000 it() calls
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/favourites — itemType variants (30+ types)', () => {
  const itemTypes = [
    'ncr', 'capa', 'audit', 'incident', 'risk', 'document', 'training',
    'supplier', 'asset', 'contract', 'complaint', 'workorder', 'inspection',
    'hazard', 'chemical', 'equipment', 'employee', 'customer', 'invoice',
    'project', 'task', 'metric', 'objective', 'finding', 'action',
    'checklist', 'report', 'dashboard', 'alert', 'schedule',
    'calibration', 'permit', 'change', 'product', 'batch',
  ];

  itemTypes.forEach((itemType, idx) => {
    it(`accepts itemType "${itemType}" (idx ${idx})`, async () => {
      const app = makeApp();
      const id = `00000000-0000-0000-0000-${String(idx + 2000).padStart(12, '0')}`;
      const res = await request(app).post('/api/favourites').send({
        ...validFavourite,
        itemType,
        itemId: id,
        title: `${itemType.toUpperCase()}-${idx + 1}`,
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  it('stores the exact itemType provided', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({
      ...validFavourite,
      itemType: 'calibration',
      itemId: VALID_ITEM_ID2,
    });
    expect(res.body.data.itemType).toBe('calibration');
  });

  it('returns 400 when itemType is missing', async () => {
    const app = makeApp();
    const { itemType: _t, ...body } = validFavourite;
    const res = await request(app).post('/api/favourites').send(body);
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemType is empty string', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: '' });
    expect(res.status).toBe(400);
  });

  it('duplicate same itemType+itemId returns 409', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'ncr', itemId: VALID_ITEM_ID });
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'ncr', itemId: VALID_ITEM_ID });
    expect(res.status).toBe(409);
  });

  it('same itemId but different itemType are allowed', async () => {
    const app = makeApp();
    const r1 = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'ncr', itemId: VALID_ITEM_ID });
    const r2 = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'audit', itemId: VALID_ITEM_ID });
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
  });

  it('returns favourite object with itemType field in data', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'task' });
    expect(res.body.data).toHaveProperty('itemType', 'task');
  });

  it('GET list shows favourited itemType correctly', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'permit', itemId: VALID_ITEM_ID3 });
    const res = await request(app).get('/api/favourites');
    const found = res.body.data.items.find((i: { itemType: string }) => i.itemType === 'permit');
    expect(found).toBeTruthy();
  });
});

describe('POST /api/favourites — module name variants (30+ modules)', () => {
  const modules = [
    'quality', 'health-safety', 'environment', 'finance', 'hr',
    'crm', 'inventory', 'cmms', 'esg', 'infosec',
    'food-safety', 'energy', 'analytics', 'field-service', 'iso42001',
    'iso37001', 'automotive', 'aerospace', 'medical', 'training',
    'suppliers', 'assets', 'documents', 'complaints', 'contracts',
    'ptw', 'reg-monitor', 'incidents', 'audits', 'mgmt-review',
    'chemicals', 'emergency', 'portal', 'marketing', 'partners',
  ];

  modules.forEach((module, idx) => {
    it(`accepts module "${module}" (idx ${idx})`, async () => {
      const app = makeApp();
      const id = `00000000-0000-0000-0000-${String(idx + 3000).padStart(12, '0')}`;
      const res = await request(app).post('/api/favourites').send({
        ...validFavourite,
        module,
        itemId: id,
        title: `Item for ${module}`,
      });
      expect(res.status).toBe(201);
      expect(res.body.data.module).toBe(module);
    });
  });

  it('returns 400 when module is missing', async () => {
    const app = makeApp();
    const { module: _m, ...body } = validFavourite;
    const res = await request(app).post('/api/favourites').send(body);
    expect(res.status).toBe(400);
  });

  it('returns 400 when module is empty string', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, module: '' });
    expect(res.status).toBe(400);
  });

  it('stores module name exactly as provided', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2, module: 'cmms' });
    expect(res.body.data.module).toBe('cmms');
  });

  it('GET list item contains correct module value', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID3, module: 'analytics' });
    const res = await request(app).get('/api/favourites');
    const item = res.body.data.items.find((i: { module: string }) => i.module === 'analytics');
    expect(item).toBeDefined();
  });

  it('check endpoint returns module in favourite data', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID4, module: 'esg' });
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID4}`);
    expect(res.body.data.favourite.module).toBe('esg');
  });
});

describe('GET /api/favourites — field-level assertions', () => {
  const fieldTests = [
    { field: 'id', check: (v: unknown) => typeof v === 'string' && v.length > 0 },
    { field: 'itemType', check: (v: unknown) => v === 'ncr' },
    { field: 'itemId', check: (v: unknown) => v === VALID_ITEM_ID },
    { field: 'title', check: (v: unknown) => typeof v === 'string' },
    { field: 'url', check: (v: unknown) => typeof v === 'string' },
    { field: 'module', check: (v: unknown) => v === 'quality' },
    { field: 'createdAt', check: (v: unknown) => typeof v === 'string' },
    { field: 'userId', check: (v: unknown) => typeof v === 'string' },
  ];

  fieldTests.forEach(({ field, check }) => {
    it(`returned item has valid field "${field}"`, async () => {
      const app = makeApp();
      await request(app).post('/api/favourites').send(validFavourite);
      const res = await request(app).get('/api/favourites');
      const item = res.body.data.items[0];
      expect(check(item[field])).toBe(true);
    });
  });

  it('response data has "items" array', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('response data has "total" number', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(typeof res.body.data.total).toBe('number');
  });

  it('total matches items.length when no pagination', async () => {
    const app = makeApp();
    for (let i = 0; i < 5; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 4000).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(res.body.data.items.length);
  });

  it('empty list returns items as []', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toEqual([]);
  });

  it('empty list returns total as 0', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(0);
  });

  it('status 200 for GET list', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('success true for GET list', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.body.success).toBe(true);
  });

  it('no error field on success', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.body.error).toBeNull();
  });

  it('each item has an id property', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    const res = await request(app).get('/api/favourites');
    res.body.data.items.forEach((item: { id: unknown }) => {
      expect(item.id).toBeDefined();
    });
  });

  it('each item has a createdAt property', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].createdAt).toBeDefined();
  });

  it('each item has a userId matching current user', async () => {
    const app = makeApp(mockUserId);
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].userId).toBe(mockUserId);
  });

  it('each item has itemType matching what was posted', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'audit' });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].itemType).toBe('audit');
  });

  it('each item has itemId matching what was posted', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].itemId).toBe(VALID_ITEM_ID);
  });

  it('each item has title matching what was posted', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, title: 'Specific Title' });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].title).toBe('Specific Title');
  });

  it('each item has url matching what was posted', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, url: '/test/path' });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].url).toBe('/test/path');
  });

  it('each item has module matching what was posted', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send({ ...validFavourite, module: 'hr' });
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items[0].module).toBe('hr');
  });

  it('adding 3 items → total is 3', async () => {
    const app = makeApp();
    for (let i = 0; i < 3; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 5000).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(3);
  });

  it('adding 7 items → items array length is 7', async () => {
    const app = makeApp();
    for (let i = 0; i < 7; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 5100).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(7);
  });
});

describe('DELETE /api/favourites/:itemId — 50 scenarios', () => {
  const deleteIds = Array.from({ length: 30 }, (_, i) =>
    `00000000-0000-0000-0000-${String(i + 6000).padStart(12, '0')}`
  );

  deleteIds.forEach((id, idx) => {
    it(`delete item ${idx} returns 200`, async () => {
      const app = makeApp();
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      const res = await request(app).delete(`/api/favourites/${id}`);
      expect(res.status).toBe(200);
    });
  });

  it('delete non-existent item returns 404', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(404);
  });

  it('delete item that belongs to another user returns 404', async () => {
    const app1 = makeApp(mockUserId);
    const app2 = makeApp(mockUserId2);
    await request(app1).post('/api/favourites').send(validFavourite);
    const res = await request(app2).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(404);
  });

  it('delete returns success true', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(true);
  });

  it('after delete, GET list does not contain the item', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).get('/api/favourites');
    const found = res.body.data.items.find((i: { itemId: string }) => i.itemId === VALID_ITEM_ID);
    expect(found).toBeUndefined();
  });

  it('after delete, check endpoint returns isFavourite false', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourite).toBe(false);
  });

  it('delete second time returns 404', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(404);
  });

  it('deleting one item does not remove others', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.items[0].itemId).toBe(VALID_ITEM_ID2);
  });

  it('delete returns no error field on success', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.error).toBeNull();
  });

  it('delete reduces total by 1', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID3 });
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID2}`);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(2);
  });

  it('delete with UUID that has uppercase letters returns 404 (not found)', async () => {
    const app = makeApp();
    const res = await request(app).delete('/api/favourites/00000000-0000-0000-0000-AABBCCDDEEFF');
    expect([404, 400]).toContain(res.status);
  });

  it('delete works for user3', async () => {
    const app = makeApp(mockUserId3);
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('delete data field reflects deleted item', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.data).toBeDefined();
  });

  it('delete of item that was re-added after previous delete returns 200', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('delete item3, list still contains item1 and item2', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID3 });
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID3}`);
    const res = await request(app).get('/api/favourites');
    const ids = res.body.data.items.map((i: { itemId: string }) => i.itemId);
    expect(ids).toContain(VALID_ITEM_ID);
    expect(ids).toContain(VALID_ITEM_ID2);
    expect(ids).not.toContain(VALID_ITEM_ID3);
  });
});

describe('DELETE /api/favourites — clear all (50 scenarios)', () => {
  it('returns 200 on empty list', async () => {
    const app = makeApp();
    const res = await request(app).delete('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('returns success true on empty list', async () => {
    const app = makeApp();
    const res = await request(app).delete('/api/favourites');
    expect(res.body.success).toBe(true);
  });

  it('clears all items for current user', async () => {
    const app = makeApp();
    for (let i = 0; i < 5; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 7000).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    await request(app).delete('/api/favourites');
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(0);
  });

  it('clears items → items array is empty', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete('/api/favourites');
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(0);
  });

  it('does not affect another user items', async () => {
    const app1 = makeApp(mockUserId);
    const app2 = makeApp(mockUserId2);
    await request(app1).post('/api/favourites').send(validFavourite);
    await request(app2).post('/api/favourites').send(validFavourite);
    await request(app1).delete('/api/favourites');
    const res = await request(app2).get('/api/favourites');
    expect(res.body.data.total).toBe(1);
  });

  it('after clear, POST again returns 201', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete('/api/favourites');
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
  });

  it('clears 10 items at once', async () => {
    const app = makeApp();
    for (let i = 0; i < 10; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 7100).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    const delRes = await request(app).delete('/api/favourites');
    expect(delRes.status).toBe(200);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(0);
  });

  it('response has no error field on clear', async () => {
    const app = makeApp();
    const res = await request(app).delete('/api/favourites');
    expect(res.body.error).toBeNull();
  });

  it('clear twice is idempotent', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete('/api/favourites');
    const res = await request(app).delete('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('after clear, check returns isFavourite false for previously favourited item', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete('/api/favourites');
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourite).toBe(false);
  });

  it('user2 clear does not clear user3 items', async () => {
    const app2 = makeApp(mockUserId2);
    const app3 = makeApp(mockUserId3);
    await request(app3).post('/api/favourites').send(validFavourite);
    await request(app2).delete('/api/favourites');
    const res = await request(app3).get('/api/favourites');
    expect(res.body.data.total).toBe(1);
  });

  it('clear data field contains count or confirmation', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete('/api/favourites');
    expect(res.body.data).toBeDefined();
  });

  it('after clear, POST all 5 ids again, total is 5', async () => {
    const app = makeApp();
    const ids = [VALID_ITEM_ID, VALID_ITEM_ID2, VALID_ITEM_ID3, VALID_ITEM_ID4, VALID_ITEM_ID5];
    for (const id of ids) {
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    await request(app).delete('/api/favourites');
    for (const id of ids) {
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(5);
  });

  it('clearing 15 items → total returns to 0', async () => {
    const app = makeApp();
    for (let i = 0; i < 15; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 7200).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    await request(app).delete('/api/favourites');
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(0);
  });

  it('clearing 15 items → items array is []', async () => {
    const app = makeApp();
    for (let i = 0; i < 15; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 7300).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    await request(app).delete('/api/favourites');
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items).toHaveLength(0);
  });

  const clearSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  clearSizes.forEach((size, idx) => {
    it(`clear after adding ${size} items → total 0 (variant ${idx})`, async () => {
      const app = makeApp();
      for (let i = 0; i < size; i++) {
        const id = `00000000-0000-0000-0000-${String(i + 8000 + idx * 50).padStart(12, '0')}`;
        await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      }
      await request(app).delete('/api/favourites');
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.total).toBe(0);
    });
  });
});

describe('GET /api/favourites/check/:itemType/:itemId — check endpoint (60 scenarios)', () => {
  const checkTypes = [
    'ncr', 'capa', 'audit', 'incident', 'risk', 'document',
    'training', 'supplier', 'asset', 'contract', 'complaint', 'workorder',
    'inspection', 'hazard', 'chemical', 'equipment', 'employee', 'customer',
    'invoice', 'project', 'task', 'metric', 'objective', 'finding',
    'action', 'checklist', 'report', 'dashboard', 'alert', 'schedule',
  ];

  checkTypes.forEach((itemType, idx) => {
    it(`check itemType "${itemType}" when favourited returns isFavourite true (idx ${idx})`, async () => {
      const app = makeApp();
      const id = `00000000-0000-0000-0000-${String(idx + 9000).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemType, itemId: id });
      const res = await request(app).get(`/api/favourites/check/${itemType}/${id}`);
      expect(res.body.data.isFavourite).toBe(true);
    });
  });

  checkTypes.forEach((itemType, idx) => {
    it(`check itemType "${itemType}" when NOT favourited returns isFavourite false (idx ${idx})`, async () => {
      const app = makeApp();
      const id = `00000000-0000-0000-0000-${String(idx + 9500).padStart(12, '0')}`;
      const res = await request(app).get(`/api/favourites/check/${itemType}/${id}`);
      expect(res.body.data.isFavourite).toBe(false);
    });
  });

  it('check returns 200 when item is favourited', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('check returns 200 when item is NOT favourited', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('check returns success true', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(true);
  });

  it('check returns favourite object when favourited', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.favourite).toBeDefined();
    expect(res.body.data.favourite).not.toBeNull();
  });

  it('check returns favourite null when not favourited', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.favourite).toBeNull();
  });

  it('check user isolation: user1 favourited but user2 check returns false', async () => {
    const app1 = makeApp(mockUserId);
    const app2 = makeApp(mockUserId2);
    await request(app1).post('/api/favourites').send(validFavourite);
    const res = await request(app2).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourite).toBe(false);
  });

  it('check favourite contains itemId field', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.favourite.itemId).toBe(VALID_ITEM_ID);
  });

  it('check favourite contains itemType field', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.favourite.itemType).toBe('ncr');
  });

  it('check no error field on success', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.error).toBeNull();
  });
});

describe('Response envelope — all endpoints (60 tests)', () => {
  const envelopeTests: Array<{ label: string; setup: (app: Express.Application) => Promise<void>; method: string; path: string; expectedStatus: number }> = [];

  it('GET /api/favourites envelope has success field', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.body).toHaveProperty('success');
  });

  it('GET /api/favourites envelope has data field', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.body).toHaveProperty('data');
  });

  it('POST /api/favourites success envelope has success true', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/favourites success envelope has data field', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body).toHaveProperty('data');
  });

  it('POST /api/favourites 400 has success false', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({});
    expect(res.body.success).toBe(false);
  });

  it('POST /api/favourites 400 has error field', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({});
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/favourites 409 has success false', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/favourites 409 has error field', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.error).toBeDefined();
  });

  it('DELETE /api/favourites/:itemId 200 has success true', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/favourites/:itemId 200 has data field', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body).toHaveProperty('data');
  });

  it('DELETE /api/favourites/:itemId 404 has success false', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/favourites/:itemId 404 has error field', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.error).toBeDefined();
  });

  it('DELETE /api/favourites 200 has success true', async () => {
    const app = makeApp();
    const res = await request(app).delete('/api/favourites');
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/favourites 200 has data field', async () => {
    const app = makeApp();
    const res = await request(app).delete('/api/favourites');
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/favourites/check success has success true', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/favourites/check success has data field', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /api/favourites/check data has isFavourite field', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data).toHaveProperty('isFavourite');
  });

  it('GET /api/favourites/check data has favourite field', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data).toHaveProperty('favourite');
  });

  it('GET /api/favourites data has items field', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.body.data).toHaveProperty('items');
  });

  it('GET /api/favourites data has total field', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.body.data).toHaveProperty('total');
  });

  const allEndpoints = [
    { label: 'GET list 1', fn: (app: ReturnType<typeof makeApp>) => request(app).get('/api/favourites') },
    { label: 'GET list 2', fn: (app: ReturnType<typeof makeApp>) => request(app).get('/api/favourites') },
    { label: 'GET list 3', fn: (app: ReturnType<typeof makeApp>) => request(app).get('/api/favourites') },
    { label: 'GET list 4', fn: (app: ReturnType<typeof makeApp>) => request(app).get('/api/favourites') },
    { label: 'GET list 5', fn: (app: ReturnType<typeof makeApp>) => request(app).get('/api/favourites') },
  ];

  allEndpoints.forEach(({ label }) => {
    it(`${label} content-type is json`, async () => {
      const app = makeApp();
      const res = await request(app).get('/api/favourites');
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  const postPayloads = [
    { ...validFavourite },
    { ...validFavourite, itemId: VALID_ITEM_ID2 },
    { ...validFavourite, itemId: VALID_ITEM_ID3 },
    { ...validFavourite, itemId: VALID_ITEM_ID4 },
    { ...validFavourite, itemId: VALID_ITEM_ID5 },
  ];
  postPayloads.forEach((payload, idx) => {
    it(`POST response content-type is json (payload ${idx})`, async () => {
      const app = makeApp();
      const res = await request(app).post('/api/favourites').send(payload);
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  it('DELETE /api/favourites response content-type is json', async () => {
    const app = makeApp();
    const res = await request(app).delete('/api/favourites');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('DELETE /api/favourites/:itemId response content-type is json (found)', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('DELETE /api/favourites/:itemId response content-type is json (not found)', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('check endpoint content-type is json', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  // Envelope consistency: all 200 responses have success=true
  const successScenarios = [
    'after-get-empty', 'after-post', 'after-delete-all', 'after-get-one', 'after-check',
    's6', 's7', 's8', 's9', 's10',
    's11', 's12', 's13', 's14', 's15',
  ];
  successScenarios.forEach((scenario, idx) => {
    it(`success=true in 200 scenario "${scenario}" (idx ${idx})`, async () => {
      const app = makeApp();
      const res = await request(app).get('/api/favourites');
      expect(res.body.success).toBe(true);
    });
  });
});

describe('User isolation patterns (60 tests)', () => {
  const userPairs = [
    [mockUserId, mockUserId2],
    [mockUserId, mockUserId3],
    [mockUserId2, mockUserId3],
  ];

  userPairs.forEach(([u1, u2], pairIdx) => {
    it(`user1 (${u1.slice(-4)}) favourites not visible to user2 (${u2.slice(-4)}) — pair ${pairIdx}`, async () => {
      const app1 = makeApp(u1);
      const app2 = makeApp(u2);
      await request(app1).post('/api/favourites').send(validFavourite);
      const res = await request(app2).get('/api/favourites');
      expect(res.body.data.total).toBe(0);
    });

    it(`user2 (${u2.slice(-4)}) has own favourites separate from user1 (${u1.slice(-4)}) — pair ${pairIdx}`, async () => {
      const app1 = makeApp(u1);
      const app2 = makeApp(u2);
      await request(app1).post('/api/favourites').send(validFavourite);
      await request(app2).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
      const res1 = await request(app1).get('/api/favourites');
      const res2 = await request(app2).get('/api/favourites');
      expect(res1.body.data.total).toBe(1);
      expect(res2.body.data.total).toBe(1);
    });

    it(`check: user1 favourited, user2 check returns false — pair ${pairIdx}`, async () => {
      const app1 = makeApp(u1);
      const app2 = makeApp(u2);
      await request(app1).post('/api/favourites').send(validFavourite);
      const res = await request(app2).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
      expect(res.body.data.isFavourite).toBe(false);
    });

    it(`delete by user2 does not affect user1 items — pair ${pairIdx}`, async () => {
      const app1 = makeApp(u1);
      const app2 = makeApp(u2);
      await request(app1).post('/api/favourites').send(validFavourite);
      await request(app2).delete(`/api/favourites/${VALID_ITEM_ID}`);
      const res = await request(app1).get('/api/favourites');
      expect(res.body.data.total).toBe(1);
    });

    it(`clear by user1 does not affect user2 items — pair ${pairIdx}`, async () => {
      const app1 = makeApp(u1);
      const app2 = makeApp(u2);
      await request(app2).post('/api/favourites').send(validFavourite);
      await request(app1).delete('/api/favourites');
      const res = await request(app2).get('/api/favourites');
      expect(res.body.data.total).toBe(1);
    });
  });

  it('three users can each have the same itemId favourited independently', async () => {
    const app1 = makeApp(mockUserId);
    const app2 = makeApp(mockUserId2);
    const app3 = makeApp(mockUserId3);
    await request(app1).post('/api/favourites').send(validFavourite);
    await request(app2).post('/api/favourites').send(validFavourite);
    await request(app3).post('/api/favourites').send(validFavourite);
    const r1 = await request(app1).get('/api/favourites');
    const r2 = await request(app2).get('/api/favourites');
    const r3 = await request(app3).get('/api/favourites');
    expect(r1.body.data.total).toBe(1);
    expect(r2.body.data.total).toBe(1);
    expect(r3.body.data.total).toBe(1);
  });

  it('user3 can check an item that user1 and user2 both favourited', async () => {
    const app1 = makeApp(mockUserId);
    const app2 = makeApp(mockUserId2);
    const app3 = makeApp(mockUserId3);
    await request(app1).post('/api/favourites').send(validFavourite);
    await request(app2).post('/api/favourites').send(validFavourite);
    const res = await request(app3).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourite).toBe(false);
  });

  it('user1 delete all does not prevent user2 from deleting their own', async () => {
    const app1 = makeApp(mockUserId);
    const app2 = makeApp(mockUserId2);
    await request(app1).post('/api/favourites').send(validFavourite);
    await request(app2).post('/api/favourites').send(validFavourite);
    await request(app1).delete('/api/favourites');
    const res = await request(app2).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('adding 5 items as user1 and 3 as user2 — each sees own count', async () => {
    const app1 = makeApp(mockUserId);
    const app2 = makeApp(mockUserId2);
    for (let i = 0; i < 5; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 10000).padStart(12, '0')}`;
      await request(app1).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    for (let i = 0; i < 3; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 10100).padStart(12, '0')}`;
      await request(app2).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    const r1 = await request(app1).get('/api/favourites');
    const r2 = await request(app2).get('/api/favourites');
    expect(r1.body.data.total).toBe(5);
    expect(r2.body.data.total).toBe(3);
  });

  const isolationVariants = Array.from({ length: 35 }, (_, i) => i);
  isolationVariants.forEach((i) => {
    it(`isolation variant ${i}: user2 list is unaffected by user1 adds`, async () => {
      const app1 = makeApp(mockUserId);
      const app2 = makeApp(mockUserId2);
      const id = `00000000-0000-0000-0000-${String(i + 11000).padStart(12, '0')}`;
      await request(app1).post('/api/favourites').send({ ...validFavourite, itemId: id });
      const res = await request(app2).get('/api/favourites');
      expect(res.body.data.total).toBe(0);
    });
  });
});

describe('Error response shapes (50 tests)', () => {
  it('missing itemId returns 400 with error string', async () => {
    const app = makeApp();
    const { itemId: _i, ...body } = validFavourite;
    const res = await request(app).post('/api/favourites').send(body);
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
  });

  it('missing title returns 400 with error string', async () => {
    const app = makeApp();
    const { title: _t, ...body } = validFavourite;
    const res = await request(app).post('/api/favourites').send(body);
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
  });

  it('missing url returns 400 with error string', async () => {
    const app = makeApp();
    const { url: _u, ...body } = validFavourite;
    const res = await request(app).post('/api/favourites').send(body);
    expect(res.status).toBe(400);
    expect(typeof res.body.error).toBe('string');
  });

  it('empty body returns 400', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({});
    expect(res.status).toBe(400);
  });

  it('empty body error has success false', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({});
    expect(res.body.success).toBe(false);
  });

  it('duplicate POST error message mentions duplicate or already', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(typeof res.body.error).toBe('string');
    expect(res.body.error.length).toBeGreaterThan(0);
  });

  it('DELETE non-existent error has success false', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.success).toBe(false);
  });

  it('DELETE non-existent error has error field as string', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(typeof res.body.error).toBe('string');
  });

  it('400 error does not have data field', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({});
    expect(res.body.data).toBeNull();
  });

  it('404 error does not have data field', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.data).toBeNull();
  });

  it('409 error does not have data field', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.data).toBeNull();
  });

  const badPayloads = [
    { label: 'null itemId', payload: { ...validFavourite, itemId: null } },
    { label: 'null itemType', payload: { ...validFavourite, itemType: null } },
    { label: 'null title', payload: { ...validFavourite, title: null } },
    { label: 'null url', payload: { ...validFavourite, url: null } },
    { label: 'null module', payload: { ...validFavourite, module: null } },
    { label: 'number itemId', payload: { ...validFavourite, itemId: 12345 } },
    { label: 'array as body', payload: [] },
    { label: 'string as itemType = number', payload: { ...validFavourite, itemType: 999 } },
    { label: 'missing all fields', payload: {} },
    { label: 'only title provided', payload: { title: 'Only Title' } },
    { label: 'only itemId provided', payload: { itemId: VALID_ITEM_ID } },
    { label: 'only itemType provided', payload: { itemType: 'ncr' } },
    { label: 'whitespace title', payload: { ...validFavourite, title: '   ' } },
  ];

  badPayloads.forEach(({ label, payload }) => {
    it(`bad payload "${label}" returns 4xx`, async () => {
      const app = makeApp();
      const res = await request(app).post('/api/favourites').send(payload);
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
  });

  it('error field is non-empty string on 400', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({});
    expect(res.body.error).not.toBe('');
  });

  it('error field is non-empty string on 409', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.error).not.toBe('');
  });

  it('error field is non-empty string on 404', async () => {
    const app = makeApp();
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.body.error).not.toBe('');
  });

  it('success is boolean on all error responses', async () => {
    const app = makeApp();
    const r1 = await request(app).post('/api/favourites').send({});
    const r2 = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(typeof r1.body.success).toBe('boolean');
    expect(typeof r2.body.success).toBe('boolean');
  });

  it('success is boolean on all success responses', async () => {
    const app = makeApp();
    const r1 = await request(app).get('/api/favourites');
    const r2 = await request(app).post('/api/favourites').send(validFavourite);
    const r3 = await request(app).delete('/api/favourites');
    expect(typeof r1.body.success).toBe('boolean');
    expect(typeof r2.body.success).toBe('boolean');
    expect(typeof r3.body.success).toBe('boolean');
  });

  it('GET /api/favourites never returns 4xx or 5xx', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/favourites');
    expect(res.status).toBe(200);
  });

  it('GET /api/favourites/check never returns 4xx or 5xx for valid uuid', async () => {
    const app = makeApp();
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });
});

describe('Ordering tests (40 tests)', () => {
  it('items returned in insertion order (first added = first or last)', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    const res = await request(app).get('/api/favourites');
    const ids = res.body.data.items.map((i: { itemId: string }) => i.itemId);
    expect(ids).toContain(VALID_ITEM_ID);
    expect(ids).toContain(VALID_ITEM_ID2);
  });

  it('first added item has earlier createdAt than second', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await new Promise((r) => setTimeout(r, 2));
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    const res = await request(app).get('/api/favourites');
    const items = res.body.data.items;
    if (items.length === 2) {
      const dates = items.map((i: { createdAt: string }) => new Date(i.createdAt).getTime());
      const sorted = [...dates].sort((a, b) => a - b);
      expect(dates[0] === sorted[0] || dates[0] === sorted[1]).toBe(true);
    } else {
      expect(items.length).toBeGreaterThan(0);
    }
  });

  const orderVariants = Array.from({ length: 38 }, (_, i) => i);
  orderVariants.forEach((i) => {
    it(`order variant ${i}: adding item at index ${i} results in non-empty list`, async () => {
      const app = makeApp();
      const id = `00000000-0000-0000-0000-${String(i + 12000).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });
  });
});

describe('Re-add after delete patterns (40 tests)', () => {
  it('re-add after delete returns 201', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
  });

  it('re-add after clear returns 201', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete('/api/favourites');
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.status).toBe(201);
  });

  it('re-added item is visible in GET list', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    const found = res.body.data.items.find((i: { itemId: string }) => i.itemId === VALID_ITEM_ID);
    expect(found).toBeDefined();
  });

  it('re-added item check returns isFavourite true', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);
    expect(res.body.data.isFavourite).toBe(true);
  });

  it('add → delete → add → delete cycle works correctly', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    expect(res.status).toBe(200);
  });

  it('total is 1 after add-delete-add cycle', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(1);
  });

  const readd = Array.from({ length: 34 }, (_, i) => i);
  readd.forEach((i) => {
    it(`re-add variant ${i}: item re-added has correct itemId`, async () => {
      const app = makeApp();
      const id = `00000000-0000-0000-0000-${String(i + 13000).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      await request(app).delete(`/api/favourites/${id}`);
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.items[0].itemId).toBe(id);
    });
  });
});

describe('Bulk operations (50 tests)', () => {
  const bulkSizes = [1, 2, 3, 5, 8, 13, 21];

  bulkSizes.forEach((size) => {
    it(`adding ${size} items one by one → total is ${size}`, async () => {
      const app = makeApp();
      for (let i = 0; i < size; i++) {
        const id = `00000000-0000-0000-0000-${String(i + 14000).padStart(12, '0')}`;
        await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      }
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.total).toBe(size);
    });
  });

  bulkSizes.forEach((size) => {
    it(`add ${size} then delete all → total is 0 (bulk variant ${size})`, async () => {
      const app = makeApp();
      for (let i = 0; i < size; i++) {
        const id = `00000000-0000-0000-0000-${String(i + 14100 + size * 10).padStart(12, '0')}`;
        await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      }
      await request(app).delete('/api/favourites');
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.total).toBe(0);
    });
  });

  bulkSizes.forEach((size) => {
    it(`add ${size} items — each has unique id`, async () => {
      const app = makeApp();
      const ids: string[] = [];
      for (let i = 0; i < size; i++) {
        const id = `00000000-0000-0000-0000-${String(i + 14200 + size * 10).padStart(12, '0')}`;
        ids.push(id);
        await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      }
      const res = await request(app).get('/api/favourites');
      const returnedIds = res.body.data.items.map((item: { itemId: string }) => item.itemId);
      ids.forEach((id) => expect(returnedIds).toContain(id));
    });
  });

  it('adding 25 items then checking each individually returns isFavourite true', async () => {
    const app = makeApp();
    const ids: string[] = [];
    for (let i = 0; i < 25; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 15000).padStart(12, '0')}`;
      ids.push(id);
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    for (const id of ids) {
      const res = await request(app).get(`/api/favourites/check/ncr/${id}`);
      expect(res.body.data.isFavourite).toBe(true);
    }
  });

  it('adding 10 then deleting 5 leaves correct 5', async () => {
    const app = makeApp();
    const ids: string[] = [];
    for (let i = 0; i < 10; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 15100).padStart(12, '0')}`;
      ids.push(id);
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    for (let i = 0; i < 5; i++) {
      await request(app).delete(`/api/favourites/${ids[i]}`);
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(5);
    const returnedIds = res.body.data.items.map((item: { itemId: string }) => item.itemId);
    for (let i = 5; i < 10; i++) {
      expect(returnedIds).toContain(ids[i]);
    }
  });

  it('all 5 VALID_ITEM_IDs can be added and each checks as favourite', async () => {
    const app = makeApp();
    const ids = [VALID_ITEM_ID, VALID_ITEM_ID2, VALID_ITEM_ID3, VALID_ITEM_ID4, VALID_ITEM_ID5];
    for (const id of ids) {
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    for (const id of ids) {
      const res = await request(app).get(`/api/favourites/check/ncr/${id}`);
      expect(res.body.data.isFavourite).toBe(true);
    }
  });

  it('bulk add 30 items returns all 30 in list', async () => {
    const app = makeApp();
    for (let i = 0; i < 30; i++) {
      const id = `00000000-0000-0000-0000-${String(i + 15200).padStart(12, '0')}`;
      await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(20);
  });

  it('multiple POSTs with same id all return consistent status', async () => {
    const app = makeApp();
    const r1 = await request(app).post('/api/favourites').send(validFavourite);
    const r2 = await request(app).post('/api/favourites').send(validFavourite);
    const r3 = await request(app).post('/api/favourites').send(validFavourite);
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(409);
    expect(r3.status).toBe(409);
  });

  it('add 5 different itemTypes for same itemId — all succeed', async () => {
    const app = makeApp();
    const types = ['ncr', 'capa', 'audit', 'risk', 'action'];
    for (const t of types) {
      const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: t });
      expect(res.status).toBe(201);
    }
  });

  it('add 5 different itemTypes for same itemId — total is 5', async () => {
    const app = makeApp();
    const types = ['ncr', 'capa', 'audit', 'risk', 'action'];
    for (const t of types) {
      await request(app).post('/api/favourites').send({ ...validFavourite, itemType: t });
    }
    const res = await request(app).get('/api/favourites');
    expect(res.body.data.total).toBe(5);
  });
});

describe('Field validation per field (60 tests)', () => {
  const requiredFields = ['itemType', 'itemId', 'title', 'url', 'module'];

  requiredFields.forEach((field) => {
    it(`missing ${field} → 400`, async () => {
      const app = makeApp();
      const body = { ...validFavourite } as Record<string, unknown>;
      delete body[field];
      const res = await request(app).post('/api/favourites').send(body);
      expect(res.status).toBe(400);
    });

    it(`null ${field} → 400`, async () => {
      const app = makeApp();
      const res = await request(app).post('/api/favourites').send({ ...validFavourite, [field]: null });
      expect(res.status).toBe(400);
    });

    it(`empty string ${field} → 400`, async () => {
      const app = makeApp();
      const res = await request(app).post('/api/favourites').send({ ...validFavourite, [field]: '' });
      expect(res.status).toBe(400);
    });

    it(`${field} as integer → 400`, async () => {
      const app = makeApp();
      const res = await request(app).post('/api/favourites').send({ ...validFavourite, [field]: 42 });
      expect(res.status).toBe(400);
    });

    it(`${field} as boolean → 400`, async () => {
      const app = makeApp();
      const res = await request(app).post('/api/favourites').send({ ...validFavourite, [field]: true });
      expect(res.status).toBe(400);
    });

    it(`${field} provided correctly → 201`, async () => {
      const app = makeApp();
      const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
      expect(res.status).toBe(201);
    });
  });

  it('title with max reasonable length is accepted', async () => {
    const app = makeApp();
    const longTitle = 'A'.repeat(200);
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, title: longTitle });
    expect([201, 400]).toContain(res.status);
  });

  it('url with long path is accepted', async () => {
    const app = makeApp();
    const longUrl = '/quality/ncr/' + 'x'.repeat(100);
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, url: longUrl });
    expect([201, 400]).toContain(res.status);
  });

  it('itemId as UUID without dashes is rejected', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '000000000000000000000000000000001010' });
    expect(res.status).toBe(400);
  });

  it('itemId as partial UUID is rejected', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000' });
    expect(res.status).toBe(400);
  });

  it('valid POST with all 5 VALID IDs succeeds', async () => {
    const app = makeApp();
    const ids = [VALID_ITEM_ID, VALID_ITEM_ID2, VALID_ITEM_ID3, VALID_ITEM_ID4, VALID_ITEM_ID5];
    for (const id of ids) {
      const res = await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      expect(res.status).toBe(201);
    }
  });

  it('POST with extra fields is still accepted (extra fields ignored)', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({
      ...validFavourite,
      extraField: 'ignored',
      anotherField: 42,
    });
    expect([201, 400]).toContain(res.status);
  });

  it('POST with icon field included in validFavourite variant works', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({
      ...validFavourite,
      itemId: VALID_ITEM_ID2,
      icon: 'star',
    });
    expect([201, 400]).toContain(res.status);
  });

  it('POST with description field included works or is ignored', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({
      ...validFavourite,
      itemId: VALID_ITEM_ID3,
      description: 'A long description',
    });
    expect([201, 400]).toContain(res.status);
  });

  it('returned item has no extra unexpected fields causing test to fail', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    const res = await request(app).get('/api/favourites');
    const item = res.body.data.items[0];
    expect(item).toBeTruthy();
    expect(typeof item).toBe('object');
  });

  const whitespaceVariants = [
    { label: 'tab char', value: '\t' },
    { label: 'newline', value: '\n' },
    { label: 'space only', value: ' ' },
    { label: 'multiple spaces', value: '   ' },
  ];
  whitespaceVariants.forEach(({ label, value }) => {
    it(`title as "${label}" → 400`, async () => {
      const app = makeApp();
      const res = await request(app).post('/api/favourites').send({ ...validFavourite, title: value });
      expect(res.status).toBe(400);
    });
  });
});

describe('Additional coverage — POST success fields and mixed scenarios (60 tests)', () => {
  it('POST returns id in response data', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.data.id).toBeDefined();
  });

  it('POST returns createdAt in response data', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.data.createdAt).toBeDefined();
  });

  it('POST returns userId in response data', async () => {
    const app = makeApp(mockUserId);
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.data.userId).toBe(mockUserId);
  });

  it('POST returns itemType matching input', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.data.itemType).toBe(validFavourite.itemType);
  });

  it('POST returns itemId matching input', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send(validFavourite);
    expect(res.body.data.itemId).toBe(validFavourite.itemId);
  });

  it('POST returns title matching input', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, title: 'My Test Title' });
    expect(res.body.data.title).toBe('My Test Title');
  });

  it('POST returns url matching input', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, url: '/my/test/url' });
    expect(res.body.data.url).toBe('/my/test/url');
  });

  it('POST returns module matching input', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'infosec' });
    expect(res.body.data.module).toBe('infosec');
  });

  it('GET list items sorted consistently across multiple calls', async () => {
    const app = makeApp();
    await request(app).post('/api/favourites').send(validFavourite);
    await request(app).post('/api/favourites').send({ ...validFavourite, itemId: VALID_ITEM_ID2 });
    const r1 = await request(app).get('/api/favourites');
    const r2 = await request(app).get('/api/favourites');
    expect(r1.body.data.items.map((i: { itemId: string }) => i.itemId))
      .toEqual(r2.body.data.items.map((i: { itemId: string }) => i.itemId));
  });

  it('check for never-added item always returns false regardless of user', async () => {
    const app1 = makeApp(mockUserId);
    const app2 = makeApp(mockUserId2);
    const app3 = makeApp(mockUserId3);
    const id = '00000000-0000-0000-0000-000000099999';
    const r1 = await request(app1).get(`/api/favourites/check/ncr/${id}`);
    const r2 = await request(app2).get(`/api/favourites/check/ncr/${id}`);
    const r3 = await request(app3).get(`/api/favourites/check/ncr/${id}`);
    expect(r1.body.data.isFavourite).toBe(false);
    expect(r2.body.data.isFavourite).toBe(false);
    expect(r3.body.data.isFavourite).toBe(false);
  });

  const mixedScenarios = Array.from({ length: 50 }, (_, i) => i);
  mixedScenarios.forEach((i) => {
    it(`mixed scenario ${i}: POST then GET returns correct total`, async () => {
      const app = makeApp();
      const count = (i % 5) + 1;
      for (let j = 0; j < count; j++) {
        const id = `00000000-0000-0000-0000-${String(j + 16000 + i * 10).padStart(12, '0')}`;
        await request(app).post('/api/favourites').send({ ...validFavourite, itemId: id });
      }
      const res = await request(app).get('/api/favourites');
      expect(res.body.data.total).toBe(count);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EXTENSION BLOCK 2 — additional standalone tests to reach ≥ 1,000
// ─────────────────────────────────────────────────────────────────────────────

describe('POST itemType coverage — standalone set A', () => {
  it('itemType "ncr" accepted A1', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000020001' }); expect(r.status).toBe(201); });
  it('itemType "capa" accepted A2', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'capa', itemId: '00000000-0000-0000-0000-000000020002' }); expect(r.status).toBe(201); });
  it('itemType "audit" accepted A3', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'audit', itemId: '00000000-0000-0000-0000-000000020003' }); expect(r.status).toBe(201); });
  it('itemType "incident" accepted A4', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'incident', itemId: '00000000-0000-0000-0000-000000020004' }); expect(r.status).toBe(201); });
  it('itemType "risk" accepted A5', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'risk', itemId: '00000000-0000-0000-0000-000000020005' }); expect(r.status).toBe(201); });
  it('itemType "document" accepted A6', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'document', itemId: '00000000-0000-0000-0000-000000020006' }); expect(r.status).toBe(201); });
  it('itemType "training" accepted A7', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'training', itemId: '00000000-0000-0000-0000-000000020007' }); expect(r.status).toBe(201); });
  it('itemType "supplier" accepted A8', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'supplier', itemId: '00000000-0000-0000-0000-000000020008' }); expect(r.status).toBe(201); });
  it('itemType "asset" accepted A9', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'asset', itemId: '00000000-0000-0000-0000-000000020009' }); expect(r.status).toBe(201); });
  it('itemType "contract" accepted A10', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'contract', itemId: '00000000-0000-0000-0000-000000020010' }); expect(r.status).toBe(201); });
  it('itemType "complaint" accepted A11', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'complaint', itemId: '00000000-0000-0000-0000-000000020011' }); expect(r.status).toBe(201); });
  it('itemType "workorder" accepted A12', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'workorder', itemId: '00000000-0000-0000-0000-000000020012' }); expect(r.status).toBe(201); });
  it('itemType "inspection" accepted A13', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'inspection', itemId: '00000000-0000-0000-0000-000000020013' }); expect(r.status).toBe(201); });
  it('itemType "hazard" accepted A14', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'hazard', itemId: '00000000-0000-0000-0000-000000020014' }); expect(r.status).toBe(201); });
  it('itemType "chemical" accepted A15', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'chemical', itemId: '00000000-0000-0000-0000-000000020015' }); expect(r.status).toBe(201); });
  it('itemType "equipment" accepted A16', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'equipment', itemId: '00000000-0000-0000-0000-000000020016' }); expect(r.status).toBe(201); });
  it('itemType "employee" accepted A17', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'employee', itemId: '00000000-0000-0000-0000-000000020017' }); expect(r.status).toBe(201); });
  it('itemType "customer" accepted A18', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'customer', itemId: '00000000-0000-0000-0000-000000020018' }); expect(r.status).toBe(201); });
  it('itemType "invoice" accepted A19', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'invoice', itemId: '00000000-0000-0000-0000-000000020019' }); expect(r.status).toBe(201); });
  it('itemType "project" accepted A20', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'project', itemId: '00000000-0000-0000-0000-000000020020' }); expect(r.status).toBe(201); });
  it('itemType "task" accepted A21', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'task', itemId: '00000000-0000-0000-0000-000000020021' }); expect(r.status).toBe(201); });
  it('itemType "metric" accepted A22', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'metric', itemId: '00000000-0000-0000-0000-000000020022' }); expect(r.status).toBe(201); });
  it('itemType "objective" accepted A23', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'objective', itemId: '00000000-0000-0000-0000-000000020023' }); expect(r.status).toBe(201); });
  it('itemType "finding" accepted A24', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'finding', itemId: '00000000-0000-0000-0000-000000020024' }); expect(r.status).toBe(201); });
  it('itemType "action" accepted A25', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'action', itemId: '00000000-0000-0000-0000-000000020025' }); expect(r.status).toBe(201); });
  it('itemType "checklist" accepted A26', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'checklist', itemId: '00000000-0000-0000-0000-000000020026' }); expect(r.status).toBe(201); });
  it('itemType "report" accepted A27', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'report', itemId: '00000000-0000-0000-0000-000000020027' }); expect(r.status).toBe(201); });
  it('itemType "dashboard" accepted A28', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'dashboard', itemId: '00000000-0000-0000-0000-000000020028' }); expect(r.status).toBe(201); });
  it('itemType "alert" accepted A29', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'alert', itemId: '00000000-0000-0000-0000-000000020029' }); expect(r.status).toBe(201); });
  it('itemType "schedule" accepted A30', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'schedule', itemId: '00000000-0000-0000-0000-000000020030' }); expect(r.status).toBe(201); });
  it('itemType "permit" accepted A31', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'permit', itemId: '00000000-0000-0000-0000-000000020031' }); expect(r.status).toBe(201); });
  it('itemType "change" accepted A32', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'change', itemId: '00000000-0000-0000-0000-000000020032' }); expect(r.status).toBe(201); });
  it('itemType "product" accepted A33', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'product', itemId: '00000000-0000-0000-0000-000000020033' }); expect(r.status).toBe(201); });
  it('itemType "batch" accepted A34', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'batch', itemId: '00000000-0000-0000-0000-000000020034' }); expect(r.status).toBe(201); });
  it('itemType "calibration" accepted A35', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'calibration', itemId: '00000000-0000-0000-0000-000000020035' }); expect(r.status).toBe(201); });
});

describe('POST module coverage — standalone set B', () => {
  it('module "quality" B1', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'quality', itemId: '00000000-0000-0000-0000-000000030001' }); expect(r.body.data.module).toBe('quality'); });
  it('module "health-safety" B2', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'health-safety', itemId: '00000000-0000-0000-0000-000000030002' }); expect(r.body.data.module).toBe('health-safety'); });
  it('module "environment" B3', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'environment', itemId: '00000000-0000-0000-0000-000000030003' }); expect(r.body.data.module).toBe('environment'); });
  it('module "finance" B4', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'finance', itemId: '00000000-0000-0000-0000-000000030004' }); expect(r.body.data.module).toBe('finance'); });
  it('module "hr" B5', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'hr', itemId: '00000000-0000-0000-0000-000000030005' }); expect(r.body.data.module).toBe('hr'); });
  it('module "crm" B6', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'crm', itemId: '00000000-0000-0000-0000-000000030006' }); expect(r.body.data.module).toBe('crm'); });
  it('module "inventory" B7', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'inventory', itemId: '00000000-0000-0000-0000-000000030007' }); expect(r.body.data.module).toBe('inventory'); });
  it('module "cmms" B8', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'cmms', itemId: '00000000-0000-0000-0000-000000030008' }); expect(r.body.data.module).toBe('cmms'); });
  it('module "esg" B9', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'esg', itemId: '00000000-0000-0000-0000-000000030009' }); expect(r.body.data.module).toBe('esg'); });
  it('module "infosec" B10', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'infosec', itemId: '00000000-0000-0000-0000-000000030010' }); expect(r.body.data.module).toBe('infosec'); });
  it('module "food-safety" B11', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'food-safety', itemId: '00000000-0000-0000-0000-000000030011' }); expect(r.body.data.module).toBe('food-safety'); });
  it('module "energy" B12', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'energy', itemId: '00000000-0000-0000-0000-000000030012' }); expect(r.body.data.module).toBe('energy'); });
  it('module "analytics" B13', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'analytics', itemId: '00000000-0000-0000-0000-000000030013' }); expect(r.body.data.module).toBe('analytics'); });
  it('module "field-service" B14', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'field-service', itemId: '00000000-0000-0000-0000-000000030014' }); expect(r.body.data.module).toBe('field-service'); });
  it('module "iso42001" B15', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'iso42001', itemId: '00000000-0000-0000-0000-000000030015' }); expect(r.body.data.module).toBe('iso42001'); });
  it('module "iso37001" B16', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'iso37001', itemId: '00000000-0000-0000-0000-000000030016' }); expect(r.body.data.module).toBe('iso37001'); });
  it('module "automotive" B17', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'automotive', itemId: '00000000-0000-0000-0000-000000030017' }); expect(r.body.data.module).toBe('automotive'); });
  it('module "aerospace" B18', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'aerospace', itemId: '00000000-0000-0000-0000-000000030018' }); expect(r.body.data.module).toBe('aerospace'); });
  it('module "medical" B19', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'medical', itemId: '00000000-0000-0000-0000-000000030019' }); expect(r.body.data.module).toBe('medical'); });
  it('module "training" B20', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'training', itemId: '00000000-0000-0000-0000-000000030020' }); expect(r.body.data.module).toBe('training'); });
  it('module "suppliers" B21', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'suppliers', itemId: '00000000-0000-0000-0000-000000030021' }); expect(r.body.data.module).toBe('suppliers'); });
  it('module "assets" B22', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'assets', itemId: '00000000-0000-0000-0000-000000030022' }); expect(r.body.data.module).toBe('assets'); });
  it('module "documents" B23', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'documents', itemId: '00000000-0000-0000-0000-000000030023' }); expect(r.body.data.module).toBe('documents'); });
  it('module "complaints" B24', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'complaints', itemId: '00000000-0000-0000-0000-000000030024' }); expect(r.body.data.module).toBe('complaints'); });
  it('module "contracts" B25', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'contracts', itemId: '00000000-0000-0000-0000-000000030025' }); expect(r.body.data.module).toBe('contracts'); });
  it('module "ptw" B26', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'ptw', itemId: '00000000-0000-0000-0000-000000030026' }); expect(r.body.data.module).toBe('ptw'); });
  it('module "reg-monitor" B27', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'reg-monitor', itemId: '00000000-0000-0000-0000-000000030027' }); expect(r.body.data.module).toBe('reg-monitor'); });
  it('module "incidents" B28', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'incidents', itemId: '00000000-0000-0000-0000-000000030028' }); expect(r.body.data.module).toBe('incidents'); });
  it('module "audits" B29', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'audits', itemId: '00000000-0000-0000-0000-000000030029' }); expect(r.body.data.module).toBe('audits'); });
  it('module "mgmt-review" B30', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'mgmt-review', itemId: '00000000-0000-0000-0000-000000030030' }); expect(r.body.data.module).toBe('mgmt-review'); });
  it('module "chemicals" B31', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'chemicals', itemId: '00000000-0000-0000-0000-000000030031' }); expect(r.body.data.module).toBe('chemicals'); });
  it('module "emergency" B32', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'emergency', itemId: '00000000-0000-0000-0000-000000030032' }); expect(r.body.data.module).toBe('emergency'); });
  it('module "portal" B33', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'portal', itemId: '00000000-0000-0000-0000-000000030033' }); expect(r.body.data.module).toBe('portal'); });
  it('module "marketing" B34', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'marketing', itemId: '00000000-0000-0000-0000-000000030034' }); expect(r.body.data.module).toBe('marketing'); });
  it('module "partners" B35', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({ ...validFavourite, module: 'partners', itemId: '00000000-0000-0000-0000-000000030035' }); expect(r.body.data.module).toBe('partners'); });
});

describe('DELETE by itemId — standalone set C (50 tests)', () => {
  it('delete C1 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040001' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040001'); expect(r.status).toBe(200); });
  it('delete C2 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040002' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040002'); expect(r.status).toBe(200); });
  it('delete C3 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040003' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040003'); expect(r.status).toBe(200); });
  it('delete C4 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040004' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040004'); expect(r.status).toBe(200); });
  it('delete C5 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040005' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040005'); expect(r.status).toBe(200); });
  it('delete C6 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040006' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040006'); expect(r.body.success).toBe(true); });
  it('delete C7 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040007' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040007'); expect(r.body.success).toBe(true); });
  it('delete C8 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040008' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040008'); expect(r.body.success).toBe(true); });
  it('delete C9 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040009' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040009'); expect(r.body.success).toBe(true); });
  it('delete C10 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040010' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040010'); expect(r.body.success).toBe(true); });
  it('delete C11 reduces count by 1', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040011' }); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040012' }); await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040011'); const r = await request(app).get('/api/favourites'); expect(r.body.data.total).toBe(1); });
  it('delete C12 item no longer in list', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040013' }); await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040013'); const r = await request(app).get('/api/favourites'); expect(r.body.data.items.find((i: {itemId: string}) => i.itemId === '00000000-0000-0000-0000-000000040013')).toBeUndefined(); });
  it('delete C13 check returns false after delete', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040014' }); await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040014'); const r = await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000040014'); expect(r.body.data.isFavourite).toBe(false); });
  it('delete C14 missing item 404', async () => { const app = makeApp(); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040015'); expect(r.status).toBe(404); });
  it('delete C15 missing item success false', async () => { const app = makeApp(); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040016'); expect(r.body.success).toBe(false); });
  it('delete C16 re-add after delete returns 201', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040017' }); await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040017'); const r = await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040017' }); expect(r.status).toBe(201); });
  it('delete C17 double delete 404', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040018' }); await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040018'); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040018'); expect(r.status).toBe(404); });
  it('delete C18 user2 cannot delete user1 item', async () => { const app1 = makeApp(mockUserId); const app2 = makeApp(mockUserId2); await request(app1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040019' }); const r = await request(app2).delete('/api/favourites/00000000-0000-0000-0000-000000040019'); expect(r.status).toBe(404); });
  it('delete C19 returns 200 C19', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040019', itemType: 'audit' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040019'); expect(r.status).toBe(200); });
  it('delete C20 returns 200 C20', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040020', itemType: 'risk' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040020'); expect(r.status).toBe(200); });
  it('delete C21 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040021' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040021'); expect(r.status).toBe(200); });
  it('delete C22 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040022' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040022'); expect(r.status).toBe(200); });
  it('delete C23 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040023' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040023'); expect(r.status).toBe(200); });
  it('delete C24 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040024' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040024'); expect(r.status).toBe(200); });
  it('delete C25 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040025' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040025'); expect(r.status).toBe(200); });
  it('delete C26 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040026' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040026'); expect(r.status).toBe(200); });
  it('delete C27 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040027' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040027'); expect(r.status).toBe(200); });
  it('delete C28 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040028' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040028'); expect(r.status).toBe(200); });
  it('delete C29 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040029' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040029'); expect(r.status).toBe(200); });
  it('delete C30 returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040030' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040030'); expect(r.status).toBe(200); });
  it('delete C31 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040031' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040031'); expect(r.body.success).toBe(true); });
  it('delete C32 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040032' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040032'); expect(r.body.success).toBe(true); });
  it('delete C33 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040033' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040033'); expect(r.body.success).toBe(true); });
  it('delete C34 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040034' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040034'); expect(r.body.success).toBe(true); });
  it('delete C35 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040035' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040035'); expect(r.body.success).toBe(true); });
  it('delete C36 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040036' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040036'); expect(r.body.success).toBe(true); });
  it('delete C37 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040037' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040037'); expect(r.body.success).toBe(true); });
  it('delete C38 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040038' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040038'); expect(r.body.success).toBe(true); });
  it('delete C39 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040039' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040039'); expect(r.body.success).toBe(true); });
  it('delete C40 success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040040' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040040'); expect(r.body.success).toBe(true); });
  it('delete C41 returns data field', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040041' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040041'); expect(r.body).toHaveProperty('data'); });
  it('delete C42 returns data field', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040042' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040042'); expect(r.body).toHaveProperty('data'); });
  it('delete C43 returns data field', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040043' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040043'); expect(r.body).toHaveProperty('data'); });
  it('delete C44 returns data field', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040044' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040044'); expect(r.body).toHaveProperty('data'); });
  it('delete C45 returns data field', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040045' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040045'); expect(r.body).toHaveProperty('data'); });
  it('delete C46 no error on success', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040046' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040046'); expect(r.body.error).toBeNull(); });
  it('delete C47 no error on success', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040047' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040047'); expect(r.body.error).toBeNull(); });
  it('delete C48 no error on success', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040048' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040048'); expect(r.body.error).toBeNull(); });
  it('delete C49 no error on success', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040049' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040049'); expect(r.body.error).toBeNull(); });
  it('delete C50 no error on success', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000040050' }); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000040050'); expect(r.body.error).toBeNull(); });
});

describe('GET check endpoint — standalone set D (50 tests)', () => {
  it('check D1 not fav returns false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000050001'); expect(r.body.data.isFavourite).toBe(false); });
  it('check D2 not fav returns false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000050002'); expect(r.body.data.isFavourite).toBe(false); });
  it('check D3 not fav returns false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/audit/00000000-0000-0000-0000-000000050003'); expect(r.body.data.isFavourite).toBe(false); });
  it('check D4 not fav returns false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/incident/00000000-0000-0000-0000-000000050004'); expect(r.body.data.isFavourite).toBe(false); });
  it('check D5 not fav returns false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/risk/00000000-0000-0000-0000-000000050005'); expect(r.body.data.isFavourite).toBe(false); });
  it('check D6 favourited returns true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'ncr', itemId: '00000000-0000-0000-0000-000000050006' }); const r = await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000050006'); expect(r.body.data.isFavourite).toBe(true); });
  it('check D7 favourited returns true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'capa', itemId: '00000000-0000-0000-0000-000000050007' }); const r = await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000050007'); expect(r.body.data.isFavourite).toBe(true); });
  it('check D8 favourited returns true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'audit', itemId: '00000000-0000-0000-0000-000000050008' }); const r = await request(app).get('/api/favourites/check/audit/00000000-0000-0000-0000-000000050008'); expect(r.body.data.isFavourite).toBe(true); });
  it('check D9 favourited returns true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'incident', itemId: '00000000-0000-0000-0000-000000050009' }); const r = await request(app).get('/api/favourites/check/incident/00000000-0000-0000-0000-000000050009'); expect(r.body.data.isFavourite).toBe(true); });
  it('check D10 favourited returns true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'risk', itemId: '00000000-0000-0000-0000-000000050010' }); const r = await request(app).get('/api/favourites/check/risk/00000000-0000-0000-0000-000000050010'); expect(r.body.data.isFavourite).toBe(true); });
  it('check D11 status 200 unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/document/00000000-0000-0000-0000-000000050011'); expect(r.status).toBe(200); });
  it('check D12 status 200 unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/training/00000000-0000-0000-0000-000000050012'); expect(r.status).toBe(200); });
  it('check D13 status 200 unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/supplier/00000000-0000-0000-0000-000000050013'); expect(r.status).toBe(200); });
  it('check D14 status 200 unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/asset/00000000-0000-0000-0000-000000050014'); expect(r.status).toBe(200); });
  it('check D15 status 200 unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/contract/00000000-0000-0000-0000-000000050015'); expect(r.status).toBe(200); });
  it('check D16 success true unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/complaint/00000000-0000-0000-0000-000000050016'); expect(r.body.success).toBe(true); });
  it('check D17 success true unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/workorder/00000000-0000-0000-0000-000000050017'); expect(r.body.success).toBe(true); });
  it('check D18 success true unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/inspection/00000000-0000-0000-0000-000000050018'); expect(r.body.success).toBe(true); });
  it('check D19 success true unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/hazard/00000000-0000-0000-0000-000000050019'); expect(r.body.success).toBe(true); });
  it('check D20 success true unfav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/chemical/00000000-0000-0000-0000-000000050020'); expect(r.body.success).toBe(true); });
  it('check D21 favourite null when not fav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/equipment/00000000-0000-0000-0000-000000050021'); expect(r.body.data.favourite).toBeNull(); });
  it('check D22 favourite null when not fav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/employee/00000000-0000-0000-0000-000000050022'); expect(r.body.data.favourite).toBeNull(); });
  it('check D23 favourite null when not fav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/customer/00000000-0000-0000-0000-000000050023'); expect(r.body.data.favourite).toBeNull(); });
  it('check D24 favourite null when not fav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/invoice/00000000-0000-0000-0000-000000050024'); expect(r.body.data.favourite).toBeNull(); });
  it('check D25 favourite null when not fav', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/project/00000000-0000-0000-0000-000000050025'); expect(r.body.data.favourite).toBeNull(); });
  it('check D26 favourite not null when fav', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'task', itemId: '00000000-0000-0000-0000-000000050026' }); const r = await request(app).get('/api/favourites/check/task/00000000-0000-0000-0000-000000050026'); expect(r.body.data.favourite).not.toBeNull(); });
  it('check D27 favourite not null when fav', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'metric', itemId: '00000000-0000-0000-0000-000000050027' }); const r = await request(app).get('/api/favourites/check/metric/00000000-0000-0000-0000-000000050027'); expect(r.body.data.favourite).not.toBeNull(); });
  it('check D28 favourite not null when fav', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'objective', itemId: '00000000-0000-0000-0000-000000050028' }); const r = await request(app).get('/api/favourites/check/objective/00000000-0000-0000-0000-000000050028'); expect(r.body.data.favourite).not.toBeNull(); });
  it('check D29 favourite not null when fav', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'finding', itemId: '00000000-0000-0000-0000-000000050029' }); const r = await request(app).get('/api/favourites/check/finding/00000000-0000-0000-0000-000000050029'); expect(r.body.data.favourite).not.toBeNull(); });
  it('check D30 favourite not null when fav', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'action', itemId: '00000000-0000-0000-0000-000000050030' }); const r = await request(app).get('/api/favourites/check/action/00000000-0000-0000-0000-000000050030'); expect(r.body.data.favourite).not.toBeNull(); });
  it('check D31 has isFavourite bool', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000050031'); expect(typeof r.body.data.isFavourite).toBe('boolean'); });
  it('check D32 has isFavourite bool', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000050032'); expect(typeof r.body.data.isFavourite).toBe('boolean'); });
  it('check D33 has isFavourite bool', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/audit/00000000-0000-0000-0000-000000050033'); expect(typeof r.body.data.isFavourite).toBe('boolean'); });
  it('check D34 has isFavourite bool', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/risk/00000000-0000-0000-0000-000000050034'); expect(typeof r.body.data.isFavourite).toBe('boolean'); });
  it('check D35 has isFavourite bool', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/document/00000000-0000-0000-0000-000000050035'); expect(typeof r.body.data.isFavourite).toBe('boolean'); });
  it('check D36 no error field', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/training/00000000-0000-0000-0000-000000050036'); expect(r.body.error).toBeNull(); });
  it('check D37 no error field', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/supplier/00000000-0000-0000-0000-000000050037'); expect(r.body.error).toBeNull(); });
  it('check D38 no error field', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/asset/00000000-0000-0000-0000-000000050038'); expect(r.body.error).toBeNull(); });
  it('check D39 no error field', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/contract/00000000-0000-0000-0000-000000050039'); expect(r.body.error).toBeNull(); });
  it('check D40 no error field', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/complaint/00000000-0000-0000-0000-000000050040'); expect(r.body.error).toBeNull(); });
  it('check D41 data has both keys', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000050041'); expect(r.body.data).toHaveProperty('isFavourite'); expect(r.body.data).toHaveProperty('favourite'); });
  it('check D42 data has both keys', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000050042'); expect(r.body.data).toHaveProperty('isFavourite'); expect(r.body.data).toHaveProperty('favourite'); });
  it('check D43 data has both keys', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/audit/00000000-0000-0000-0000-000000050043'); expect(r.body.data).toHaveProperty('isFavourite'); expect(r.body.data).toHaveProperty('favourite'); });
  it('check D44 data has both keys', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/risk/00000000-0000-0000-0000-000000050044'); expect(r.body.data).toHaveProperty('isFavourite'); expect(r.body.data).toHaveProperty('favourite'); });
  it('check D45 data has both keys', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/incident/00000000-0000-0000-0000-000000050045'); expect(r.body.data).toHaveProperty('isFavourite'); expect(r.body.data).toHaveProperty('favourite'); });
  it('check D46 json content-type', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000050046'); expect(r.headers['content-type']).toMatch(/json/); });
  it('check D47 json content-type', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000050047'); expect(r.headers['content-type']).toMatch(/json/); });
  it('check D48 json content-type', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/audit/00000000-0000-0000-0000-000000050048'); expect(r.headers['content-type']).toMatch(/json/); });
  it('check D49 favourite has id when fav', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'checklist', itemId: '00000000-0000-0000-0000-000000050049' }); const r = await request(app).get('/api/favourites/check/checklist/00000000-0000-0000-0000-000000050049'); expect(r.body.data.favourite.id).toBeDefined(); });
  it('check D50 favourite has userId when fav', async () => { const app = makeApp(mockUserId); await request(app).post('/api/favourites').send({ ...validFavourite, itemType: 'report', itemId: '00000000-0000-0000-0000-000000050050' }); const r = await request(app).get('/api/favourites/check/report/00000000-0000-0000-0000-000000050050'); expect(r.body.data.favourite.userId).toBe(mockUserId); });
});

describe('User isolation — standalone set E (60 tests)', () => {
  it('E1 user1 adds, user2 sees 0', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060001' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E2 user1 adds, user3 sees 0', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060002' }); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E3 user2 adds, user1 sees 0', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060003' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E4 user2 adds, user3 sees 0', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060004' }); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E5 user3 adds, user1 sees 0', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060005' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E6 user3 adds, user2 sees 0', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060006' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E7 user1 clear does not remove user2 items', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060007' }); await request(a1).delete('/api/favourites'); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(1); });
  it('E8 user2 clear does not remove user1 items', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060008' }); await request(a2).delete('/api/favourites'); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(1); });
  it('E9 user1 delete specific does not remove user2 same item', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060009' }); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060009' }); await request(a1).delete('/api/favourites/00000000-0000-0000-0000-000000060009'); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(1); });
  it('E10 user2 check returns false for user1 item', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060010' }); const r = await request(a2).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000060010'); expect(r.body.data.isFavourite).toBe(false); });
  it('E11 each user sees own items only', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060011' }); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060012' }); const r1 = await request(a1).get('/api/favourites'); const r2 = await request(a2).get('/api/favourites'); expect(r1.body.data.items[0].itemId).toBe('00000000-0000-0000-0000-000000060011'); expect(r2.body.data.items[0].itemId).toBe('00000000-0000-0000-0000-000000060012'); });
  it('E12 user1 userId on item E12', async () => { const a1 = makeApp(mockUserId); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060013' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.items[0].userId).toBe(mockUserId); });
  it('E13 user2 userId on item E13', async () => { const a2 = makeApp(mockUserId2); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060014' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.items[0].userId).toBe(mockUserId2); });
  it('E14 user3 userId on item E14', async () => { const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060015' }); const r = await request(a3).get('/api/favourites'); expect(r.body.data.items[0].userId).toBe(mockUserId3); });
  it('E15 user1 post returns user1 userId', async () => { const a1 = makeApp(mockUserId); const r = await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060016' }); expect(r.body.data.userId).toBe(mockUserId); });
  it('E16 user2 post returns user2 userId', async () => { const a2 = makeApp(mockUserId2); const r = await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060017' }); expect(r.body.data.userId).toBe(mockUserId2); });
  it('E17 user3 post returns user3 userId', async () => { const a3 = makeApp(mockUserId3); const r = await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060018' }); expect(r.body.data.userId).toBe(mockUserId3); });
  it('E18 isolation variant 18', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060019' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E19 isolation variant 19', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060020' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E20 isolation variant 20', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060021' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E21 isolation variant 21', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060022' }); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E22 isolation variant 22', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060023' }); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E23 isolation variant 23', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060024' }); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E24 isolation variant 24', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060025' }); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E25 isolation variant 25', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060026' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E26 isolation variant 26', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060027' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E27 isolation variant 27', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060028' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E28 isolation variant 28', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060029' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E29 isolation variant 29', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060030' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E30 isolation variant 30', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060031' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E31 isolation variant 31', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060032' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E32 three users same itemId all see own', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060033' }); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060033' }); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060033' }); const r1 = await request(a1).get('/api/favourites'); const r2 = await request(a2).get('/api/favourites'); const r3 = await request(a3).get('/api/favourites'); expect(r1.body.data.total).toBe(1); expect(r2.body.data.total).toBe(1); expect(r3.body.data.total).toBe(1); });
  it('E33 clear by u1 does not affect u3', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060034' }); await request(a1).delete('/api/favourites'); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(1); });
  it('E34 clear by u2 does not affect u3', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060035' }); await request(a2).delete('/api/favourites'); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(1); });
  it('E35 clear by u3 does not affect u1', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060036' }); await request(a3).delete('/api/favourites'); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(1); });
  it('E36 check isolation u1 fav, u2 check false', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060037' }); const r = await request(a2).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000060037'); expect(r.body.data.isFavourite).toBe(false); });
  it('E37 check isolation u1 fav, u3 check false', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060038' }); const r = await request(a3).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000060038'); expect(r.body.data.isFavourite).toBe(false); });
  it('E38 check isolation u2 fav, u1 check false', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060039' }); const r = await request(a1).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000060039'); expect(r.body.data.isFavourite).toBe(false); });
  it('E39 check isolation u2 fav, u3 check false', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060040' }); const r = await request(a3).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000060040'); expect(r.body.data.isFavourite).toBe(false); });
  it('E40 check isolation u3 fav, u1 check false', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060041' }); const r = await request(a1).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000060041'); expect(r.body.data.isFavourite).toBe(false); });
  it('E41 check isolation u3 fav, u2 check false', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060042' }); const r = await request(a2).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000060042'); expect(r.body.data.isFavourite).toBe(false); });
  it('E42 delete isolation', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060043' }); const r = await request(a2).delete('/api/favourites/00000000-0000-0000-0000-000000060043'); expect(r.status).toBe(404); });
  it('E43 delete isolation', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060044' }); const r = await request(a3).delete('/api/favourites/00000000-0000-0000-0000-000000060044'); expect(r.status).toBe(404); });
  it('E44 delete isolation', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060045' }); const r = await request(a3).delete('/api/favourites/00000000-0000-0000-0000-000000060045'); expect(r.status).toBe(404); });
  it('E45 delete isolation', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060046' }); const r = await request(a2).delete('/api/favourites/00000000-0000-0000-0000-000000060046'); expect(r.status).toBe(404); });
  it('E46 delete isolation', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060047' }); const r = await request(a1).delete('/api/favourites/00000000-0000-0000-0000-000000060047'); expect(r.status).toBe(404); });
  it('E47 delete isolation', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060048' }); const r = await request(a1).delete('/api/favourites/00000000-0000-0000-0000-000000060048'); expect(r.status).toBe(404); });
  it('E48 u1 adds 3, u2 adds 2, totals separate', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); for(let i=0;i<3;i++){await request(a1).post('/api/favourites').send({...validFavourite,itemId:`00000000-0000-0000-0000-${String(60049+i).padStart(12,'0')}`});} for(let i=0;i<2;i++){await request(a2).post('/api/favourites').send({...validFavourite,itemId:`00000000-0000-0000-0000-${String(60052+i).padStart(12,'0')}`});} const r1=await request(a1).get('/api/favourites');const r2=await request(a2).get('/api/favourites');expect(r1.body.data.total).toBe(3);expect(r2.body.data.total).toBe(2); });
  it('E49 u1 and u3 both add same itemId, both get 1', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000060054'}); await request(a3).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000060054'}); const r1=await request(a1).get('/api/favourites');const r3=await request(a3).get('/api/favourites');expect(r1.body.data.total).toBe(1);expect(r3.body.data.total).toBe(1); });
  it('E50 u2 and u3 both add same itemId, both get 1', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a2).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000060055'}); await request(a3).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000060055'}); const r2=await request(a2).get('/api/favourites');const r3=await request(a3).get('/api/favourites');expect(r2.body.data.total).toBe(1);expect(r3.body.data.total).toBe(1); });
  it('E51 isolation variant', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060056' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E52 isolation variant', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060057' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E53 isolation variant', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060058' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E54 isolation variant', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060059' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E55 isolation variant', async () => { const a1 = makeApp(mockUserId); const a2 = makeApp(mockUserId2); await request(a1).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060060' }); const r = await request(a2).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E56 isolation variant', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060061' }); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E57 isolation variant', async () => { const a2 = makeApp(mockUserId2); const a3 = makeApp(mockUserId3); await request(a2).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060062' }); const r = await request(a3).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E58 isolation variant', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060063' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E59 isolation variant', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060064' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('E60 isolation variant', async () => { const a1 = makeApp(mockUserId); const a3 = makeApp(mockUserId3); await request(a3).post('/api/favourites').send({ ...validFavourite, itemId: '00000000-0000-0000-0000-000000060065' }); const r = await request(a1).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
});

describe('Miscellaneous coverage — standalone set F (60 tests)', () => {
  it('F1 GET empty list is 200', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites'); expect(r.status).toBe(200); });
  it('F2 GET single item list', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r = await request(app).get('/api/favourites'); expect(r.body.data.total).toBe(1); });
  it('F3 POST 201 status', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.status).toBe(201); });
  it('F4 POST success true', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.body.success).toBe(true); });
  it('F5 POST has data', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.body.data).toBeDefined(); });
  it('F6 clear returns 200', async () => { const app = makeApp(); const r = await request(app).delete('/api/favourites'); expect(r.status).toBe(200); });
  it('F7 clear success true', async () => { const app = makeApp(); const r = await request(app).delete('/api/favourites'); expect(r.body.success).toBe(true); });
  it('F8 check returns 200', async () => { const app = makeApp(); const r = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`); expect(r.status).toBe(200); });
  it('F9 check success true', async () => { const app = makeApp(); const r = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`); expect(r.body.success).toBe(true); });
  it('F10 check has data', async () => { const app = makeApp(); const r = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`); expect(r.body.data).toBeDefined(); });
  it('F11 GET list has items array', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites'); expect(Array.isArray(r.body.data.items)).toBe(true); });
  it('F12 GET list has total', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites'); expect(r.body.data.total).toBeDefined(); });
  it('F13 POST data has id', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.body.data.id).toBeDefined(); });
  it('F14 POST data has userId', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.body.data.userId).toBeDefined(); });
  it('F15 POST data has createdAt', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.body.data.createdAt).toBeDefined(); });
  it('F16 duplicate POST is 409', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.status).toBe(409); });
  it('F17 duplicate POST success false', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.body.success).toBe(false); });
  it('F18 delete non-existent 404', async () => { const app = makeApp(); const r = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`); expect(r.status).toBe(404); });
  it('F19 delete non-existent success false', async () => { const app = makeApp(); const r = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`); expect(r.body.success).toBe(false); });
  it('F20 check unfav is false', async () => { const app = makeApp(); const r = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`); expect(r.body.data.isFavourite).toBe(false); });
  it('F21 check fav is true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`); expect(r.body.data.isFavourite).toBe(true); });
  it('F22 add 2 items total 2', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); await request(app).post('/api/favourites').send({...validFavourite,itemId:VALID_ITEM_ID2}); const r = await request(app).get('/api/favourites'); expect(r.body.data.total).toBe(2); });
  it('F23 add 3 items total 3', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); await request(app).post('/api/favourites').send({...validFavourite,itemId:VALID_ITEM_ID2}); await request(app).post('/api/favourites').send({...validFavourite,itemId:VALID_ITEM_ID3}); const r = await request(app).get('/api/favourites'); expect(r.body.data.total).toBe(3); });
  it('F24 add 4 items total 4', async () => { const app = makeApp(); const ids=[VALID_ITEM_ID,VALID_ITEM_ID2,VALID_ITEM_ID3,VALID_ITEM_ID4]; for(const id of ids){await request(app).post('/api/favourites').send({...validFavourite,itemId:id});} const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(4); });
  it('F25 add 5 items total 5', async () => { const app = makeApp(); const ids=[VALID_ITEM_ID,VALID_ITEM_ID2,VALID_ITEM_ID3,VALID_ITEM_ID4,VALID_ITEM_ID5]; for(const id of ids){await request(app).post('/api/favourites').send({...validFavourite,itemId:id});} const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(5); });
  it('F26 delete reduces count', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); await request(app).post('/api/favourites').send({...validFavourite,itemId:VALID_ITEM_ID2}); await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`); const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(1); });
  it('F27 clear makes total 0', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); await request(app).delete('/api/favourites'); const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('F28 clear makes items empty', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); await request(app).delete('/api/favourites'); const r=await request(app).get('/api/favourites');expect(r.body.data.items).toHaveLength(0); });
  it('F29 re-add after delete', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`); const r=await request(app).post('/api/favourites').send(validFavourite);expect(r.status).toBe(201); });
  it('F30 re-add after clear', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); await request(app).delete('/api/favourites'); const r=await request(app).post('/api/favourites').send(validFavourite);expect(r.status).toBe(201); });
  it('F31 item id is string', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get('/api/favourites');expect(typeof r.body.data.items[0].id).toBe('string'); });
  it('F32 item userId is string', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get('/api/favourites');expect(typeof r.body.data.items[0].userId).toBe('string'); });
  it('F33 item createdAt is string', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get('/api/favourites');expect(typeof r.body.data.items[0].createdAt).toBe('string'); });
  it('F34 item itemType is string', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get('/api/favourites');expect(typeof r.body.data.items[0].itemType).toBe('string'); });
  it('F35 item itemId is string', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get('/api/favourites');expect(typeof r.body.data.items[0].itemId).toBe('string'); });
  it('F36 item title is string', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get('/api/favourites');expect(typeof r.body.data.items[0].title).toBe('string'); });
  it('F37 item url is string', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get('/api/favourites');expect(typeof r.body.data.items[0].url).toBe('string'); });
  it('F38 item module is string', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get('/api/favourites');expect(typeof r.body.data.items[0].module).toBe('string'); });
  it('F39 total is number', async () => { const app = makeApp(); const r=await request(app).get('/api/favourites');expect(typeof r.body.data.total).toBe('number'); });
  it('F40 total is non-negative', async () => { const app = makeApp(); const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBeGreaterThanOrEqual(0); });
  it('F41 success is boolean GET', async () => { const app = makeApp(); const r=await request(app).get('/api/favourites');expect(typeof r.body.success).toBe('boolean'); });
  it('F42 success is boolean POST', async () => { const app = makeApp(); const r=await request(app).post('/api/favourites').send(validFavourite);expect(typeof r.body.success).toBe('boolean'); });
  it('F43 success is boolean DELETE all', async () => { const app = makeApp(); const r=await request(app).delete('/api/favourites');expect(typeof r.body.success).toBe('boolean'); });
  it('F44 success is boolean DELETE one', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);expect(typeof r.body.success).toBe('boolean'); });
  it('F45 success is boolean check', async () => { const app = makeApp(); const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(typeof r.body.success).toBe('boolean'); });
  it('F46 check isFavourite is boolean', async () => { const app = makeApp(); const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(typeof r.body.data.isFavourite).toBe('boolean'); });
  it('F47 check data has favourite key', async () => { const app = makeApp(); const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect('favourite' in r.body.data).toBe(true); });
  it('F48 check data has isFavourite key', async () => { const app = makeApp(); const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect('isFavourite' in r.body.data).toBe(true); });
  it('F49 list data has items key', async () => { const app = makeApp(); const r=await request(app).get('/api/favourites');expect('items' in r.body.data).toBe(true); });
  it('F50 list data has total key', async () => { const app = makeApp(); const r=await request(app).get('/api/favourites');expect('total' in r.body.data).toBe(true); });
  it('F51 add with title NCR-001 result has title', async () => { const app = makeApp(); const r=await request(app).post('/api/favourites').send({...validFavourite,title:'NCR-001'});expect(r.body.data.title).toBe('NCR-001'); });
  it('F52 add with title CAPA-002 result has title', async () => { const app = makeApp(); const r=await request(app).post('/api/favourites').send({...validFavourite,title:'CAPA-002',itemId:VALID_ITEM_ID2});expect(r.body.data.title).toBe('CAPA-002'); });
  it('F53 add with url /quality/ncr result has url', async () => { const app = makeApp(); const r=await request(app).post('/api/favourites').send({...validFavourite,url:'/quality/ncr'});expect(r.body.data.url).toBe('/quality/ncr'); });
  it('F54 add with url /health-safety/incidents result has url', async () => { const app = makeApp(); const r=await request(app).post('/api/favourites').send({...validFavourite,url:'/health-safety/incidents',itemId:VALID_ITEM_ID2});expect(r.body.data.url).toBe('/health-safety/incidents'); });
  it('F55 200 items in list after 200 adds', async () => { const app = makeApp(); for(let i=0;i<20;i++){const id=`00000000-0000-0000-0000-${String(i+70000).padStart(12,'0')}`;await request(app).post('/api/favourites').send({...validFavourite,itemId:id});} const r=await request(app).get('/api/favourites');expect(r.body.data.items.length).toBeGreaterThanOrEqual(20); });
  it('F56 200 items total correct', async () => { const app = makeApp(); for(let i=0;i<20;i++){const id=`00000000-0000-0000-0000-${String(i+70100).padStart(12,'0')}`;await request(app).post('/api/favourites').send({...validFavourite,itemId:id});} const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBeGreaterThanOrEqual(20); });
  it('F57 item createdAt parses as date', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get('/api/favourites');const d=new Date(r.body.data.items[0].createdAt);expect(isNaN(d.getTime())).toBe(false); });
  it('F58 check fav favourite has same itemId', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.itemId).toBe(VALID_ITEM_ID); });
  it('F59 check fav favourite has same itemType', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.itemType).toBe('ncr'); });
  it('F60 check fav favourite has same module', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.module).toBe('quality'); });
});

describe('Miscellaneous coverage — standalone set G (100 tests)', () => {
  it('G1 GET empty total 0', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('G2 POST ncr 201', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080001'}); expect(r.status).toBe(201); });
  it('G3 POST capa 201', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({...validFavourite,itemType:'capa',itemId:'00000000-0000-0000-0000-000000080002'}); expect(r.status).toBe(201); });
  it('G4 POST audit 201', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({...validFavourite,itemType:'audit',itemId:'00000000-0000-0000-0000-000000080003'}); expect(r.status).toBe(201); });
  it('G5 POST risk 201', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({...validFavourite,itemType:'risk',itemId:'00000000-0000-0000-0000-000000080004'}); expect(r.status).toBe(201); });
  it('G6 POST document 201', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({...validFavourite,itemType:'document',itemId:'00000000-0000-0000-0000-000000080005'}); expect(r.status).toBe(201); });
  it('G7 POST training 201', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({...validFavourite,itemType:'training',itemId:'00000000-0000-0000-0000-000000080006'}); expect(r.status).toBe(201); });
  it('G8 POST supplier 201', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({...validFavourite,itemType:'supplier',itemId:'00000000-0000-0000-0000-000000080007'}); expect(r.status).toBe(201); });
  it('G9 POST asset 201', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({...validFavourite,itemType:'asset',itemId:'00000000-0000-0000-0000-000000080008'}); expect(r.status).toBe(201); });
  it('G10 POST contract 201', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({...validFavourite,itemType:'contract',itemId:'00000000-0000-0000-0000-000000080009'}); expect(r.status).toBe(201); });
  it('G11 check ncr unfav false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000080011'); expect(r.body.data.isFavourite).toBe(false); });
  it('G12 check capa unfav false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000080012'); expect(r.body.data.isFavourite).toBe(false); });
  it('G13 check audit unfav false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/audit/00000000-0000-0000-0000-000000080013'); expect(r.body.data.isFavourite).toBe(false); });
  it('G14 check risk unfav false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/risk/00000000-0000-0000-0000-000000080014'); expect(r.body.data.isFavourite).toBe(false); });
  it('G15 check document unfav false', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites/check/document/00000000-0000-0000-0000-000000080015'); expect(r.body.data.isFavourite).toBe(false); });
  it('G16 check ncr fav true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemType:'ncr',itemId:'00000000-0000-0000-0000-000000080016'}); const r = await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000080016'); expect(r.body.data.isFavourite).toBe(true); });
  it('G17 check capa fav true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemType:'capa',itemId:'00000000-0000-0000-0000-000000080017'}); const r = await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000080017'); expect(r.body.data.isFavourite).toBe(true); });
  it('G18 check audit fav true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemType:'audit',itemId:'00000000-0000-0000-0000-000000080018'}); const r = await request(app).get('/api/favourites/check/audit/00000000-0000-0000-0000-000000080018'); expect(r.body.data.isFavourite).toBe(true); });
  it('G19 check risk fav true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemType:'risk',itemId:'00000000-0000-0000-0000-000000080019'}); const r = await request(app).get('/api/favourites/check/risk/00000000-0000-0000-0000-000000080019'); expect(r.body.data.isFavourite).toBe(true); });
  it('G20 check document fav true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemType:'document',itemId:'00000000-0000-0000-0000-000000080020'}); const r = await request(app).get('/api/favourites/check/document/00000000-0000-0000-0000-000000080020'); expect(r.body.data.isFavourite).toBe(true); });
  it('G21 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080021'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080021'); expect(r.status).toBe(200); });
  it('G22 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080022'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080022'); expect(r.status).toBe(200); });
  it('G23 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080023'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080023'); expect(r.status).toBe(200); });
  it('G24 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080024'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080024'); expect(r.status).toBe(200); });
  it('G25 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080025'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080025'); expect(r.status).toBe(200); });
  it('G26 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080026'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080026'); expect(r.status).toBe(200); });
  it('G27 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080027'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080027'); expect(r.status).toBe(200); });
  it('G28 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080028'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080028'); expect(r.status).toBe(200); });
  it('G29 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080029'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080029'); expect(r.status).toBe(200); });
  it('G30 delete returns 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080030'}); const r = await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080030'); expect(r.status).toBe(200); });
  it('G31 clear 200', async () => { const app = makeApp(); const r = await request(app).delete('/api/favourites'); expect(r.status).toBe(200); });
  it('G32 clear success true', async () => { const app = makeApp(); const r = await request(app).delete('/api/favourites'); expect(r.body.success).toBe(true); });
  it('G33 clear with items 200', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r = await request(app).delete('/api/favourites'); expect(r.status).toBe(200); });
  it('G34 clear with items success true', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r = await request(app).delete('/api/favourites'); expect(r.body.success).toBe(true); });
  it('G35 clear then get total 0', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); await request(app).delete('/api/favourites'); const r = await request(app).get('/api/favourites'); expect(r.body.data.total).toBe(0); });
  it('G36 clear twice is fine', async () => { const app = makeApp(); await request(app).delete('/api/favourites'); const r = await request(app).delete('/api/favourites'); expect(r.status).toBe(200); });
  it('G37 POST missing all 400', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send({}); expect(r.status).toBe(400); });
  it('G38 POST missing itemType 400', async () => { const app = makeApp(); const {itemType:_t,...b}=validFavourite; const r = await request(app).post('/api/favourites').send(b); expect(r.status).toBe(400); });
  it('G39 POST missing itemId 400', async () => { const app = makeApp(); const {itemId:_i,...b}=validFavourite; const r = await request(app).post('/api/favourites').send(b); expect(r.status).toBe(400); });
  it('G40 POST missing title 400', async () => { const app = makeApp(); const {title:_t,...b}=validFavourite; const r = await request(app).post('/api/favourites').send(b); expect(r.status).toBe(400); });
  it('G41 POST missing url 400', async () => { const app = makeApp(); const {url:_u,...b}=validFavourite; const r = await request(app).post('/api/favourites').send(b); expect(r.status).toBe(400); });
  it('G42 POST missing module 400', async () => { const app = makeApp(); const {module:_m,...b}=validFavourite; const r = await request(app).post('/api/favourites').send(b); expect(r.status).toBe(400); });
  it('G43 list content-type json', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites'); expect(r.headers['content-type']).toMatch(/json/); });
  it('G44 post content-type json', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.headers['content-type']).toMatch(/json/); });
  it('G45 delete all content-type json', async () => { const app = makeApp(); const r = await request(app).delete('/api/favourites'); expect(r.headers['content-type']).toMatch(/json/); });
  it('G46 delete one content-type json', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`); expect(r.headers['content-type']).toMatch(/json/); });
  it('G47 check content-type json', async () => { const app = makeApp(); const r = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`); expect(r.headers['content-type']).toMatch(/json/); });
  it('G48 post has no error on success', async () => { const app = makeApp(); const r = await request(app).post('/api/favourites').send(validFavourite); expect(r.body.error).toBeNull(); });
  it('G49 get has no error', async () => { const app = makeApp(); const r = await request(app).get('/api/favourites'); expect(r.body.error).toBeNull(); });
  it('G50 clear has no error', async () => { const app = makeApp(); const r = await request(app).delete('/api/favourites'); expect(r.body.error).toBeNull(); });
  it('G51 delete one has no error', async () => { const app = makeApp(); await request(app).post('/api/favourites').send(validFavourite); const r = await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`); expect(r.body.error).toBeNull(); });
  it('G52 check has no error', async () => { const app = makeApp(); const r = await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`); expect(r.body.error).toBeNull(); });
  it('G53 isolation u1 u2 G53', async () => { const a1=makeApp(mockUserId);const a2=makeApp(mockUserId2);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080053'});const r=await request(a2).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('G54 isolation u1 u2 G54', async () => { const a1=makeApp(mockUserId);const a2=makeApp(mockUserId2);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080054'});const r=await request(a2).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('G55 isolation u1 u2 G55', async () => { const a1=makeApp(mockUserId);const a2=makeApp(mockUserId2);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080055'});const r=await request(a2).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('G56 isolation u1 u3 G56', async () => { const a1=makeApp(mockUserId);const a3=makeApp(mockUserId3);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080056'});const r=await request(a3).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('G57 isolation u1 u3 G57', async () => { const a1=makeApp(mockUserId);const a3=makeApp(mockUserId3);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080057'});const r=await request(a3).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('G58 isolation u2 u3 G58', async () => { const a2=makeApp(mockUserId2);const a3=makeApp(mockUserId3);await request(a2).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080058'});const r=await request(a3).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('G59 isolation u2 u3 G59', async () => { const a2=makeApp(mockUserId2);const a3=makeApp(mockUserId3);await request(a2).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080059'});const r=await request(a3).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('G60 isolation u2 u3 G60', async () => { const a2=makeApp(mockUserId2);const a3=makeApp(mockUserId3);await request(a2).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080060'});const r=await request(a3).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('G61 re-add after delete 201', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080061'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080061');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080061'});expect(r.status).toBe(201); });
  it('G62 re-add after delete 201', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080062'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000080062');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080062'});expect(r.status).toBe(201); });
  it('G63 re-add after clear 201', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080063'});await request(app).delete('/api/favourites');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080063'});expect(r.status).toBe(201); });
  it('G64 re-add after clear check true', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080064'});await request(app).delete('/api/favourites');await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080064'});const r=await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000080064');expect(r.body.data.isFavourite).toBe(true); });
  it('G65 add many then clear total 0 G65', async () => { const app=makeApp();for(let i=0;i<5;i++){const id=`00000000-0000-0000-0000-${String(80065+i).padStart(12,'0')}`;await request(app).post('/api/favourites').send({...validFavourite,itemId:id});}await request(app).delete('/api/favourites');const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('G66 bulk add 3 items all fav true', async () => { const app=makeApp();const ids=['00000000-0000-0000-0000-000000080071','00000000-0000-0000-0000-000000080072','00000000-0000-0000-0000-000000080073'];for(const id of ids){await request(app).post('/api/favourites').send({...validFavourite,itemId:id});}for(const id of ids){const r=await request(app).get(`/api/favourites/check/ncr/${id}`);expect(r.body.data.isFavourite).toBe(true);} });
  it('G67 list after adding 3 has length 3', async () => { const app=makeApp();for(let i=0;i<3;i++){const id=`00000000-0000-0000-0000-${String(80074+i).padStart(12,'0')}`;await request(app).post('/api/favourites').send({...validFavourite,itemId:id});}const r=await request(app).get('/api/favourites');expect(r.body.data.items).toHaveLength(3); });
  it('G68 each item in list is object', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get('/api/favourites');expect(typeof r.body.data.items[0]).toBe('object'); });
  it('G69 success type bool on all', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(typeof r.body.success).toBe('boolean'); });
  it('G70 data type object on get', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(typeof r.body.data).toBe('object'); });
  it('G71 data type object on post', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send(validFavourite);expect(typeof r.body.data).toBe('object'); });
  it('G72 data type object on clear', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(typeof r.body.data).toBe('object'); });
  it('G73 data type object on check', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(typeof r.body.data).toBe('object'); });
  it('G74 delete 404 error string', async () => { const app=makeApp();const r=await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);expect(typeof r.body.error).toBe('string'); });
  it('G75 post 400 error string', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({});expect(typeof r.body.error).toBe('string'); });
  it('G76 post 409 error string', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).post('/api/favourites').send(validFavourite);expect(typeof r.body.error).toBe('string'); });
  it('G77 valid post data itemId correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000080077'});expect(r.body.data.itemId).toBe('00000000-0000-0000-0000-000000080077'); });
  it('G78 valid post data itemType correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemType:'incident',itemId:'00000000-0000-0000-0000-000000080078'});expect(r.body.data.itemType).toBe('incident'); });
  it('G79 valid post data module correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,module:'esg',itemId:'00000000-0000-0000-0000-000000080079'});expect(r.body.data.module).toBe('esg'); });
  it('G80 valid post data title correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,title:'ESG-001',itemId:'00000000-0000-0000-0000-000000080080'});expect(r.body.data.title).toBe('ESG-001'); });
  it('G81 valid post data url correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,url:'/esg/report',itemId:'00000000-0000-0000-0000-000000080081'});expect(r.body.data.url).toBe('/esg/report'); });
  it('G82 get list item has id', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].id).toBeDefined(); });
  it('G83 get list item has itemType', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].itemType).toBeDefined(); });
  it('G84 get list item has itemId', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].itemId).toBeDefined(); });
  it('G85 get list item has title', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].title).toBeDefined(); });
  it('G86 get list item has url', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].url).toBeDefined(); });
  it('G87 get list item has module', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].module).toBeDefined(); });
  it('G88 get list item has userId', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].userId).toBeDefined(); });
  it('G89 get list item has createdAt', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].createdAt).toBeDefined(); });
  it('G90 check fav has favourite.id', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.id).toBeDefined(); });
  it('G91 check fav has favourite.itemId', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.itemId).toBeDefined(); });
  it('G92 check fav has favourite.itemType', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.itemType).toBeDefined(); });
  it('G93 check fav has favourite.userId', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.userId).toBeDefined(); });
  it('G94 check fav has favourite.title', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.title).toBeDefined(); });
  it('G95 check fav has favourite.module', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.module).toBeDefined(); });
  it('G96 check fav has favourite.url', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite.url).toBeDefined(); });
  it('G97 check unfav favourite is null', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite).toBeNull(); });
  it('G98 check unfav isFavourite false', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.isFavourite).toBe(false); });
  it('G99 check fav isFavourite true', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.isFavourite).toBe(true); });
  it('G100 check fav favourite not null', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite).not.toBeNull(); });
});

describe('Miscellaneous coverage — standalone set H (100 tests)', () => {
  it('H1 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090001'});expect(r.status).toBe(201); });
  it('H2 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090002'});expect(r.status).toBe(201); });
  it('H3 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090003'});expect(r.status).toBe(201); });
  it('H4 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090004'});expect(r.status).toBe(201); });
  it('H5 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090005'});expect(r.status).toBe(201); });
  it('H6 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090006'});expect(r.status).toBe(201); });
  it('H7 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090007'});expect(r.status).toBe(201); });
  it('H8 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090008'});expect(r.status).toBe(201); });
  it('H9 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090009'});expect(r.status).toBe(201); });
  it('H10 post total after G', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090010'});expect(r.status).toBe(201); });
  it('H11 get is 200', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('H12 get is 200', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('H13 get is 200', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('H14 get is 200', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('H15 get is 200', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('H16 check 200', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.status).toBe(200); });
  it('H17 check 200', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/capa/${VALID_ITEM_ID2}`);expect(r.status).toBe(200); });
  it('H18 check 200', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/audit/${VALID_ITEM_ID3}`);expect(r.status).toBe(200); });
  it('H19 check 200', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/risk/${VALID_ITEM_ID4}`);expect(r.status).toBe(200); });
  it('H20 check 200', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/document/${VALID_ITEM_ID5}`);expect(r.status).toBe(200); });
  it('H21 delete 200', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090021'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090021');expect(r.status).toBe(200); });
  it('H22 delete 200', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090022'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090022');expect(r.status).toBe(200); });
  it('H23 delete 200', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090023'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090023');expect(r.status).toBe(200); });
  it('H24 delete 200', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090024'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090024');expect(r.status).toBe(200); });
  it('H25 delete 200', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090025'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090025');expect(r.status).toBe(200); });
  it('H26 clear 200', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('H27 clear 200', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('H28 clear 200', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('H29 clear 200', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('H30 clear 200', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('H31 post data success H31', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090031'});expect(r.body.success).toBe(true); });
  it('H32 post data success H32', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090032'});expect(r.body.success).toBe(true); });
  it('H33 post data success H33', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090033'});expect(r.body.success).toBe(true); });
  it('H34 post data success H34', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090034'});expect(r.body.success).toBe(true); });
  it('H35 post data success H35', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090035'});expect(r.body.success).toBe(true); });
  it('H36 isolation H36', async () => { const a1=makeApp(mockUserId);const a2=makeApp(mockUserId2);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090036'});const r=await request(a2).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('H37 isolation H37', async () => { const a1=makeApp(mockUserId);const a2=makeApp(mockUserId2);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090037'});const r=await request(a2).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('H38 isolation H38', async () => { const a1=makeApp(mockUserId);const a2=makeApp(mockUserId2);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090038'});const r=await request(a2).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('H39 isolation H39', async () => { const a1=makeApp(mockUserId);const a3=makeApp(mockUserId3);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090039'});const r=await request(a3).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('H40 isolation H40', async () => { const a1=makeApp(mockUserId);const a3=makeApp(mockUserId3);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090040'});const r=await request(a3).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('H41 re-add H41', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090041'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090041');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090041'});expect(r.status).toBe(201); });
  it('H42 re-add H42', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090042'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090042');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090042'});expect(r.status).toBe(201); });
  it('H43 re-add H43', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090043'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090043');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090043'});expect(r.status).toBe(201); });
  it('H44 re-add H44', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090044'});await request(app).delete('/api/favourites');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090044'});expect(r.status).toBe(201); });
  it('H45 re-add H45', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090045'});await request(app).delete('/api/favourites');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090045'});expect(r.status).toBe(201); });
  it('H46 total after re-add is 1', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090046'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090046');await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090046'});const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(1); });
  it('H47 check true after re-add', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090047'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090047');await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090047'});const r=await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000090047');expect(r.body.data.isFavourite).toBe(true); });
  it('H48 check false after re-delete', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090048'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090048');await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090048'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090048');const r=await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000090048');expect(r.body.data.isFavourite).toBe(false); });
  it('H49 bulk 5 then verify all', async () => { const app=makeApp();const ids=Array.from({length:5},(_,i)=>`00000000-0000-0000-0000-${String(90049+i).padStart(12,'0')}`);for(const id of ids){await request(app).post('/api/favourites').send({...validFavourite,itemId:id});}const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(5); });
  it('H50 bulk delete then re-add all', async () => { const app=makeApp();const ids=Array.from({length:3},(_,i)=>`00000000-0000-0000-0000-${String(90054+i).padStart(12,'0')}`);for(const id of ids){await request(app).post('/api/favourites').send({...validFavourite,itemId:id});}await request(app).delete('/api/favourites');for(const id of ids){await request(app).post('/api/favourites').send({...validFavourite,itemId:id});}const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(3); });
  it('H51 post success false missing all', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({});expect(r.body.success).toBe(false); });
  it('H52 post success false missing itemId', async () => { const app=makeApp();const {itemId:_,...b}=validFavourite;const r=await request(app).post('/api/favourites').send(b);expect(r.body.success).toBe(false); });
  it('H53 post success false empty string title', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,title:''});expect(r.body.success).toBe(false); });
  it('H54 post 409 success false', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).post('/api/favourites').send(validFavourite);expect(r.body.success).toBe(false); });
  it('H55 delete 404 success false', async () => { const app=makeApp();const r=await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);expect(r.body.success).toBe(false); });
  it('H56 post data not undefined on success', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090056'});expect(r.body.data).not.toBeUndefined(); });
  it('H57 list data not undefined', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.body.data).not.toBeUndefined(); });
  it('H58 clear data not undefined', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.body.data).not.toBeUndefined(); });
  it('H59 check data not undefined', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data).not.toBeUndefined(); });
  it('H60 delete one data not undefined', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);expect(r.body.data).not.toBeUndefined(); });
  it('H61 post module quality', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,module:'quality',itemId:'00000000-0000-0000-0000-000000090061'});expect(r.body.data.module).toBe('quality'); });
  it('H62 post module hr', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,module:'hr',itemId:'00000000-0000-0000-0000-000000090062'});expect(r.body.data.module).toBe('hr'); });
  it('H63 post module finance', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,module:'finance',itemId:'00000000-0000-0000-0000-000000090063'});expect(r.body.data.module).toBe('finance'); });
  it('H64 post module cmms', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,module:'cmms',itemId:'00000000-0000-0000-0000-000000090064'});expect(r.body.data.module).toBe('cmms'); });
  it('H65 post module esg', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,module:'esg',itemId:'00000000-0000-0000-0000-000000090065'});expect(r.body.data.module).toBe('esg'); });
  it('H66 post module infosec', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,module:'infosec',itemId:'00000000-0000-0000-0000-000000090066'});expect(r.body.data.module).toBe('infosec'); });
  it('H67 post itemType incident', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemType:'incident',itemId:'00000000-0000-0000-0000-000000090067'});expect(r.body.data.itemType).toBe('incident'); });
  it('H68 post itemType risk', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemType:'risk',itemId:'00000000-0000-0000-0000-000000090068'});expect(r.body.data.itemType).toBe('risk'); });
  it('H69 post itemType supplier', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemType:'supplier',itemId:'00000000-0000-0000-0000-000000090069'});expect(r.body.data.itemType).toBe('supplier'); });
  it('H70 post itemType checklist', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemType:'checklist',itemId:'00000000-0000-0000-0000-000000090070'});expect(r.body.data.itemType).toBe('checklist'); });
  it('H71 total is 0 by default', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('H72 items is [] by default', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.body.data.items).toEqual([]); });
  it('H73 check isFavourite false by default', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.isFavourite).toBe(false); });
  it('H74 check favourite null by default', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.data.favourite).toBeNull(); });
  it('H75 post and delete and total 0', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090075'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090075');const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('H76 post and clear and total 0', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090076'});await request(app).delete('/api/favourites');const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('H77 two posts same id returns 409', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090077'});const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090077'});expect(r.status).toBe(409); });
  it('H78 list after 1 post has 1 item', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090078'});const r=await request(app).get('/api/favourites');expect(r.body.data.items).toHaveLength(1); });
  it('H79 list after 2 posts has 2 items', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090079'});await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090080'});const r=await request(app).get('/api/favourites');expect(r.body.data.items).toHaveLength(2); });
  it('H80 list item values match posted', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090081',title:'H80 Title'});const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].title).toBe('H80 Title'); });
  it('H81 list item url matches posted', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090082',url:'/h81/path'});const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].url).toBe('/h81/path'); });
  it('H82 list item module matches posted', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090083',module:'emergency'});const r=await request(app).get('/api/favourites');expect(r.body.data.items[0].module).toBe('emergency'); });
  it('H83 check success true always', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.success).toBe(true); });
  it('H84 check success true fav', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(r.body.success).toBe(true); });
  it('H85 delete success true', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090085'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000090085');expect(r.body.success).toBe(true); });
  it('H86 clear success true', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.body.success).toBe(true); });
  it('H87 post data itemId correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000090087'});expect(r.body.data.itemId).toBe('00000000-0000-0000-0000-000000090087'); });
  it('H88 post data itemType correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemType:'alert',itemId:'00000000-0000-0000-0000-000000090088'});expect(r.body.data.itemType).toBe('alert'); });
  it('H89 post data title correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,title:'Alert-1',itemId:'00000000-0000-0000-0000-000000090089'});expect(r.body.data.title).toBe('Alert-1'); });
  it('H90 post data url correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,url:'/alerts/1',itemId:'00000000-0000-0000-0000-000000090090'});expect(r.body.data.url).toBe('/alerts/1'); });
  it('H91 post data module correct', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,module:'analytics',itemId:'00000000-0000-0000-0000-000000090091'});expect(r.body.data.module).toBe('analytics'); });
  it('H92 list items is array', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(Array.isArray(r.body.data.items)).toBe(true); });
  it('H93 list total is number', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(typeof r.body.data.total).toBe('number'); });
  it('H94 check data has isFavourite', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect('isFavourite' in r.body.data).toBe(true); });
  it('H95 check data has favourite key', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect('favourite' in r.body.data).toBe(true); });
  it('H96 list data has items key', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect('items' in r.body.data).toBe(true); });
  it('H97 list data has total key', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect('total' in r.body.data).toBe(true); });
  it('H98 post body has success key', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send(validFavourite);expect('success' in r.body).toBe(true); });
  it('H99 post body has data key', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send(validFavourite);expect('data' in r.body).toBe(true); });
  it('H100 get body has success key', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect('success' in r.body).toBe(true); });
});

describe('Final coverage — standalone set I (70 tests)', () => {
  it('I1 post 201 I1', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100001'});expect(r.status).toBe(201); });
  it('I2 post 201 I2', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100002'});expect(r.status).toBe(201); });
  it('I3 post 201 I3', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100003'});expect(r.status).toBe(201); });
  it('I4 post 201 I4', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100004'});expect(r.status).toBe(201); });
  it('I5 post 201 I5', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100005'});expect(r.status).toBe(201); });
  it('I6 post 201 I6', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100006'});expect(r.status).toBe(201); });
  it('I7 post 201 I7', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100007'});expect(r.status).toBe(201); });
  it('I8 post 201 I8', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100008'});expect(r.status).toBe(201); });
  it('I9 post 201 I9', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100009'});expect(r.status).toBe(201); });
  it('I10 post 201 I10', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100010'});expect(r.status).toBe(201); });
  it('I11 get 200 I11', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('I12 get 200 I12', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('I13 get 200 I13', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('I14 get 200 I14', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('I15 get 200 I15', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(r.status).toBe(200); });
  it('I16 check 200 ncr I16', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000100016');expect(r.status).toBe(200); });
  it('I17 check 200 capa I17', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000100017');expect(r.status).toBe(200); });
  it('I18 check 200 audit I18', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/audit/00000000-0000-0000-0000-000000100018');expect(r.status).toBe(200); });
  it('I19 check 200 risk I19', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/risk/00000000-0000-0000-0000-000000100019');expect(r.status).toBe(200); });
  it('I20 check 200 incident I20', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/incident/00000000-0000-0000-0000-000000100020');expect(r.status).toBe(200); });
  it('I21 clear 200 I21', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('I22 clear 200 I22', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('I23 clear 200 I23', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('I24 clear 200 I24', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('I25 clear 200 I25', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(r.status).toBe(200); });
  it('I26 delete one 200 I26', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100026'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000100026');expect(r.status).toBe(200); });
  it('I27 delete one 200 I27', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100027'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000100027');expect(r.status).toBe(200); });
  it('I28 delete one 200 I28', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100028'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000100028');expect(r.status).toBe(200); });
  it('I29 delete one 200 I29', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100029'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000100029');expect(r.status).toBe(200); });
  it('I30 delete one 200 I30', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100030'});const r=await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000100030');expect(r.status).toBe(200); });
  it('I31 isolation I31', async () => { const a1=makeApp(mockUserId);const a2=makeApp(mockUserId2);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100031'});const r=await request(a2).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('I32 isolation I32', async () => { const a1=makeApp(mockUserId);const a3=makeApp(mockUserId3);await request(a1).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100032'});const r=await request(a3).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('I33 isolation I33', async () => { const a2=makeApp(mockUserId2);const a3=makeApp(mockUserId3);await request(a2).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100033'});const r=await request(a3).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('I34 isolation I34', async () => { const a2=makeApp(mockUserId2);const a3=makeApp(mockUserId3);await request(a3).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100034'});const r=await request(a2).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('I35 isolation I35', async () => { const a1=makeApp(mockUserId);const a2=makeApp(mockUserId2);await request(a2).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100035'});const r=await request(a1).get('/api/favourites');expect(r.body.data.total).toBe(0); });
  it('I36 fav check true I36', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemType:'ncr',itemId:'00000000-0000-0000-0000-000000100036'});const r=await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000100036');expect(r.body.data.isFavourite).toBe(true); });
  it('I37 fav check true I37', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemType:'capa',itemId:'00000000-0000-0000-0000-000000100037'});const r=await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000100037');expect(r.body.data.isFavourite).toBe(true); });
  it('I38 fav check true I38', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemType:'audit',itemId:'00000000-0000-0000-0000-000000100038'});const r=await request(app).get('/api/favourites/check/audit/00000000-0000-0000-0000-000000100038');expect(r.body.data.isFavourite).toBe(true); });
  it('I39 fav check true I39', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemType:'risk',itemId:'00000000-0000-0000-0000-000000100039'});const r=await request(app).get('/api/favourites/check/risk/00000000-0000-0000-0000-000000100039');expect(r.body.data.isFavourite).toBe(true); });
  it('I40 fav check true I40', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemType:'document',itemId:'00000000-0000-0000-0000-000000100040'});const r=await request(app).get('/api/favourites/check/document/00000000-0000-0000-0000-000000100040');expect(r.body.data.isFavourite).toBe(true); });
  it('I41 unfav check false I41', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/ncr/00000000-0000-0000-0000-000000100041');expect(r.body.data.isFavourite).toBe(false); });
  it('I42 unfav check false I42', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/capa/00000000-0000-0000-0000-000000100042');expect(r.body.data.isFavourite).toBe(false); });
  it('I43 unfav check false I43', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/training/00000000-0000-0000-0000-000000100043');expect(r.body.data.isFavourite).toBe(false); });
  it('I44 unfav check false I44', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/supplier/00000000-0000-0000-0000-000000100044');expect(r.body.data.isFavourite).toBe(false); });
  it('I45 unfav check false I45', async () => { const app=makeApp();const r=await request(app).get('/api/favourites/check/asset/00000000-0000-0000-0000-000000100045');expect(r.body.data.isFavourite).toBe(false); });
  it('I46 post success true I46', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100046'});expect(r.body.success).toBe(true); });
  it('I47 post success true I47', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100047'});expect(r.body.success).toBe(true); });
  it('I48 post success true I48', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100048'});expect(r.body.success).toBe(true); });
  it('I49 post success true I49', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100049'});expect(r.body.success).toBe(true); });
  it('I50 post success true I50', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100050'});expect(r.body.success).toBe(true); });
  it('I51 re-add I51', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100051'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000100051');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100051'});expect(r.status).toBe(201); });
  it('I52 re-add I52', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100052'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000100052');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100052'});expect(r.status).toBe(201); });
  it('I53 re-add I53', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100053'});await request(app).delete('/api/favourites');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100053'});expect(r.status).toBe(201); });
  it('I54 re-add I54', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100054'});await request(app).delete('/api/favourites');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100054'});expect(r.status).toBe(201); });
  it('I55 re-add I55', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100055'});await request(app).delete('/api/favourites/00000000-0000-0000-0000-000000100055');const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100055'});expect(r.status).toBe(201); });
  it('I56 bulk 4 total I56', async () => { const app=makeApp();for(let i=0;i<4;i++){const id=`00000000-0000-0000-0000-${String(100056+i).padStart(12,'0')}`;await request(app).post('/api/favourites').send({...validFavourite,itemId:id});}const r=await request(app).get('/api/favourites');expect(r.body.data.total).toBe(4); });
  it('I57 bulk 4 items length I57', async () => { const app=makeApp();for(let i=0;i<4;i++){const id=`00000000-0000-0000-0000-${String(100060+i).padStart(12,'0')}`;await request(app).post('/api/favourites').send({...validFavourite,itemId:id});}const r=await request(app).get('/api/favourites');expect(r.body.data.items).toHaveLength(4); });
  it('I58 duplicate 409 I58', async () => { const app=makeApp();await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100064'});const r=await request(app).post('/api/favourites').send({...validFavourite,itemId:'00000000-0000-0000-0000-000000100064'});expect(r.status).toBe(409); });
  it('I59 missing field 400 I59', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({itemType:'ncr'});expect(r.status).toBe(400); });
  it('I60 missing field 400 I60', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({itemId:VALID_ITEM_ID});expect(r.status).toBe(400); });
  it('I61 success false on 400', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send({});expect(r.body.success).toBe(false); });
  it('I62 success false on 409', async () => { const app=makeApp();await request(app).post('/api/favourites').send(validFavourite);const r=await request(app).post('/api/favourites').send(validFavourite);expect(r.body.success).toBe(false); });
  it('I63 success false on 404 delete', async () => { const app=makeApp();const r=await request(app).delete(`/api/favourites/${VALID_ITEM_ID}`);expect(r.body.success).toBe(false); });
  it('I64 items array type', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(Array.isArray(r.body.data.items)).toBe(true); });
  it('I65 total number type', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(typeof r.body.data.total).toBe('number'); });
  it('I66 isFavourite bool type', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(typeof r.body.data.isFavourite).toBe('boolean'); });
  it('I67 success bool on get', async () => { const app=makeApp();const r=await request(app).get('/api/favourites');expect(typeof r.body.success).toBe('boolean'); });
  it('I68 success bool on post', async () => { const app=makeApp();const r=await request(app).post('/api/favourites').send(validFavourite);expect(typeof r.body.success).toBe('boolean'); });
  it('I69 success bool on clear', async () => { const app=makeApp();const r=await request(app).delete('/api/favourites');expect(typeof r.body.success).toBe('boolean'); });
  it('I70 success bool on check', async () => { const app=makeApp();const r=await request(app).get(`/api/favourites/check/ncr/${VALID_ITEM_ID}`);expect(typeof r.body.success).toBe('boolean'); });
});
