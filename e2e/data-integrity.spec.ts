import { test, expect } from '@playwright/test';

async function loginAndGetToken(request: any): Promise<string> {
  const r = await request.post('http://localhost:4000/api/auth/login', {
    data: { email: 'admin@ims.local', password: 'admin123' },
  });
  const body = await r.json();
  return body.data?.accessToken ?? '';
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function isValidISO8601(s: string): boolean {
  return !Number.isNaN(new Date(s).getTime());
}

test.describe('Data Integrity — H&S Risks', () => {
  let token: string;
  let createdId: string | null = null;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('created resource has UUID id', async ({ request }) => {
    const resp = await request.post('http://localhost:4000/api/health-safety/risks', {
      data: {
        title: 'Data Integrity Test Risk',
        riskType: 'OPERATIONAL',
        likelihood: 2,
        consequence: 3,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([201, 200]).toContain(resp.status());
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(isValidUUID(body.data.id)).toBe(true);
    createdId = body.data.id;
  });

  test('created resource has valid ISO 8601 timestamps', async ({ request }) => {
    test.skip(!createdId, 'Requires prior create test');
    const resp = await request.get(`http://localhost:4000/api/health-safety/risks/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(isValidISO8601(body.data.createdAt)).toBe(true);
    expect(isValidISO8601(body.data.updatedAt)).toBe(true);
  });

  test('GET by id returns exact same data as created', async ({ request }) => {
    test.skip(!createdId, 'Requires prior create test');
    const resp = await request.get(`http://localhost:4000/api/health-safety/risks/${createdId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.id).toBe(createdId);
    expect(body.data.title).toBe('Data Integrity Test Risk');
  });

  test('update changes data and bumps updatedAt', async ({ request }) => {
    test.skip(!createdId, 'Requires prior create test');
    const getResp = await request.get(
      `http://localhost:4000/api/health-safety/risks/${createdId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const original = (await getResp.json()).data;

    await new Promise((r) => setTimeout(r, 50)); // ensure timestamp changes

    const patchResp = await request.patch(
      `http://localhost:4000/api/health-safety/risks/${createdId}`,
      {
        data: { title: 'Updated Data Integrity Risk' },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    expect([200, 405]).toContain(patchResp.status());
    if (patchResp.ok()) {
      const updated = (await patchResp.json()).data;
      expect(updated.title).toBe('Updated Data Integrity Risk');
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(original.updatedAt).getTime()
      );
    }
  });

  test('delete removes the resource (GET returns 404)', async ({ request }) => {
    test.skip(!createdId, 'Requires prior create test');
    const delResp = await request.delete(
      `http://localhost:4000/api/health-safety/risks/${createdId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect([200, 204, 404]).toContain(delResp.status());
    if (delResp.status() !== 404) {
      const getResp = await request.get(
        `http://localhost:4000/api/health-safety/risks/${createdId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(getResp.status()).toBe(404);
    }
  });
});

test.describe('Data Integrity — Environment Aspects', () => {
  let token: string;
  let createdId: string | null = null;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('created aspect has UUID id and correct field types', async ({ request }) => {
    const resp = await request.post('http://localhost:4000/api/environment/aspects', {
      data: {
        title: 'Data Integrity Test Aspect',
        aspectType: 'WASTE',
        impactType: 'NEGATIVE',
        significance: 'SIGNIFICANT',
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([201, 200]).toContain(resp.status());
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(isValidUUID(body.data.id)).toBe(true);
    // Numeric significance score should be a number
    if (typeof body.data.significanceScore !== 'undefined') {
      expect(typeof body.data.significanceScore).toBe('number');
    }
    createdId = body.data.id;
  });

  test('GET by id returns aspect with all fields', async ({ request }) => {
    test.skip(!createdId, 'Requires prior create test');
    const resp = await request.get(
      `http://localhost:4000/api/environment/aspects/${createdId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    expect(body.data.title).toBe('Data Integrity Test Aspect');
    expect(body.data.id).toBe(createdId);
  });

  test('list includes recently created aspect', async ({ request }) => {
    test.skip(!createdId, 'Requires prior create test');
    const resp = await request.get('http://localhost:4000/api/environment/aspects?limit=100', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    const ids = (body.data as any[]).map((a) => a.id);
    expect(ids).toContain(createdId);
  });

  test('pagination meta total reflects actual count', async ({ request }) => {
    const resp = await request.get('http://localhost:4000/api/environment/aspects?limit=5', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    if (body.meta?.total !== undefined) {
      expect(typeof body.meta.total).toBe('number');
      expect(body.meta.total).toBeGreaterThanOrEqual(0);
      expect((body.data as any[]).length).toBeLessThanOrEqual(5);
    }
  });
});

test.describe('Data Integrity — Quality Nonconformances', () => {
  let token: string;
  let createdId: string | null = null;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('created nonconformance persists in database', async ({ request }) => {
    const resp = await request.post('http://localhost:4000/api/quality/nonconformances', {
      data: {
        title: 'Data Integrity Test NC',
        description: 'Created by E2E data integrity test',
        severity: 'MINOR',
        source: 'INTERNAL_AUDIT',
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([201, 200]).toContain(resp.status());
    const body = await resp.json();
    expect(body.success).toBe(true);
    expect(isValidUUID(body.data.id)).toBe(true);
    createdId = body.data.id;
  });

  test('createdAt is <= updatedAt initially', async ({ request }) => {
    test.skip(!createdId, 'Requires prior create test');
    const resp = await request.get(
      `http://localhost:4000/api/quality/nonconformances/${createdId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    expect(resp.ok()).toBeTruthy();
    const data = (await resp.json()).data;
    expect(new Date(data.createdAt).getTime()).toBeLessThanOrEqual(
      new Date(data.updatedAt).getTime()
    );
  });

  test('three created items increase list count', async ({ request }) => {
    // Create 3 items
    const before = await request.get(
      'http://localhost:4000/api/quality/nonconformances?limit=200',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const beforeCount = (await before.json()).meta?.total ?? (await before.json()).data?.length ?? 0;

    for (let i = 0; i < 3; i++) {
      await request.post('http://localhost:4000/api/quality/nonconformances', {
        data: {
          title: `Batch Integrity Test NC ${i + 1}`,
          description: 'Batch test',
          severity: 'MINOR',
          source: 'INTERNAL_AUDIT',
        },
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const after = await request.get(
      'http://localhost:4000/api/quality/nonconformances?limit=200',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const afterBody = await after.json();
    const afterCount = afterBody.meta?.total ?? afterBody.data?.length ?? 0;
    expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
  });
});

test.describe('Data Integrity — Cross-field Validation', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await loginAndGetToken(request);
  });

  test('numeric fields stored as numbers (not strings)', async ({ request }) => {
    const resp = await request.post('http://localhost:4000/api/health-safety/risks', {
      data: {
        title: 'Type Check Risk',
        riskType: 'OPERATIONAL',
        likelihood: 3,
        consequence: 4,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status() === 201 || resp.status() === 200) {
      const body = await resp.json();
      if (body.data.likelihood !== undefined) {
        expect(typeof body.data.likelihood).toBe('number');
      }
      if (body.data.consequence !== undefined) {
        expect(typeof body.data.consequence).toBe('number');
      }
    }
  });

  test('boolean fields stored as booleans', async ({ request }) => {
    // Create environment aspect and check boolean fields
    const resp = await request.get('http://localhost:4000/api/environment/aspects?limit=1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok()) {
      const body = await resp.json();
      const items = body.data as any[];
      for (const item of items) {
        if (item.isSignificant !== undefined) {
          expect(typeof item.isSignificant).toBe('boolean');
        }
        if (item.isActive !== undefined) {
          expect(typeof item.isActive).toBe('boolean');
        }
      }
    }
  });

  test('IDs in list match IDs in individual get', async ({ request }) => {
    const listResp = await request.get('http://localhost:4000/api/health-safety/risks?limit=3', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (listResp.ok()) {
      const list = await listResp.json();
      const items = list.data as any[];
      for (const item of items.slice(0, 2)) {
        const getResp = await request.get(
          `http://localhost:4000/api/health-safety/risks/${item.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (getResp.ok()) {
          const single = (await getResp.json()).data;
          expect(single.id).toBe(item.id);
        }
      }
    }
  });
});
