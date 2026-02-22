import {
  createRequest,
  listRequests,
  getRequest,
  updateRequest,
  processExportRequest,
  processErasureRequest,
} from '../src/index';

/**
 * dsar store is module-level with no resetStore().
 * Tests use unique orgIds to avoid cross-test pollution.
 * processExportRequest/processErasureRequest use setTimeout(2000) —
 * we use jest.useFakeTimers() to advance time instantly.
 */

let orgCounter = 0;
function uniqueOrg(): string {
  return `dsar-org-${++orgCounter}`;
}

const BASE = {
  type: 'EXPORT' as const,
  subjectEmail: 'user@example.com',
  requestedById: 'admin-1',
};

// ─── createRequest ────────────────────────────────────────────────────────────

describe('createRequest', () => {
  it('creates a PENDING EXPORT request with required fields', () => {
    const org = uniqueOrg();
    const req = createRequest({ orgId: org, ...BASE });

    expect(req.id).toBeTruthy();
    expect(req.orgId).toBe(org);
    expect(req.type).toBe('EXPORT');
    expect(req.subjectEmail).toBe('user@example.com');
    expect(req.requestedById).toBe('admin-1');
    expect(req.status).toBe('PENDING');
    expect(req.completedAt).toBeNull();
    expect(req.downloadUrl).toBeNull();
    expect(req.downloadExpiry).toBeNull();
    expect(typeof req.createdAt).toBe('string');
  });

  it('creates an ERASURE request', () => {
    const req = createRequest({ orgId: uniqueOrg(), type: 'ERASURE', subjectEmail: 'x@y.com', requestedById: 'u' });
    expect(req.type).toBe('ERASURE');
  });

  it('stores optional notes', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE, notes: 'GDPR Article 15 request' });
    expect(req.notes).toBe('GDPR Article 15 request');
  });

  it('starts without notes when none provided', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(req.notes).toBeNull();
  });

  it('assigns unique IDs to each request', () => {
    const org = uniqueOrg();
    const r1 = createRequest({ orgId: org, ...BASE });
    const r2 = createRequest({ orgId: org, ...BASE });
    expect(r1.id).not.toBe(r2.id);
  });
});

// ─── listRequests ─────────────────────────────────────────────────────────────

describe('listRequests', () => {
  it('returns empty array for org with no requests', () => {
    expect(listRequests(uniqueOrg())).toEqual([]);
  });

  it('returns only requests belonging to the specified org', () => {
    const org = uniqueOrg();
    const other = uniqueOrg();
    createRequest({ orgId: org, ...BASE });
    createRequest({ orgId: other, ...BASE });
    const results = listRequests(org);
    expect(results).toHaveLength(1);
    expect(results[0].orgId).toBe(org);
  });

  it('returns multiple requests for same org', () => {
    const org = uniqueOrg();
    createRequest({ orgId: org, ...BASE });
    createRequest({ orgId: org, type: 'ERASURE', subjectEmail: 'a@b.com', requestedById: 'u' });
    expect(listRequests(org)).toHaveLength(2);
  });

  it('returns requests sorted newest-first', async () => {
    const org = uniqueOrg();
    const r1 = createRequest({ orgId: org, ...BASE });
    await new Promise((r) => setTimeout(r, 5));
    const r2 = createRequest({ orgId: org, ...BASE });
    const list = listRequests(org);
    expect(list[0].id).toBe(r2.id);
    expect(list[1].id).toBe(r1.id);
  });
});

// ─── getRequest ───────────────────────────────────────────────────────────────

describe('getRequest', () => {
  it('returns the request by ID', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(getRequest(req.id)).toBeDefined();
    expect(getRequest(req.id)?.id).toBe(req.id);
  });

  it('returns undefined for unknown ID', () => {
    expect(getRequest('nonexistent')).toBeUndefined();
  });
});

// ─── updateRequest ────────────────────────────────────────────────────────────

describe('updateRequest', () => {
  it('returns null for unknown ID', () => {
    expect(updateRequest('bad-id', { status: 'COMPLETE' })).toBeNull();
  });

  it('updates status', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const updated = updateRequest(req.id, { status: 'IN_PROGRESS' });
    expect(updated!.status).toBe('IN_PROGRESS');
  });

  it('updates notes', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const updated = updateRequest(req.id, { notes: 'Processing...' });
    expect(updated!.notes).toBe('Processing...');
  });

  it('updates downloadUrl and downloadExpiry', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const expiry = new Date().toISOString();
    const updated = updateRequest(req.id, { downloadUrl: 'https://example.com/file.zip', downloadExpiry: expiry });
    expect(updated!.downloadUrl).toBe('https://example.com/file.zip');
    expect(updated!.downloadExpiry).toBe(expiry);
  });

  it('updates updatedAt timestamp', async () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const before = req.updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    updateRequest(req.id, { status: 'IN_PROGRESS' });
    const after = getRequest(req.id)!.updatedAt;
    expect(after).not.toBe(before);
  });
});

// ─── processExportRequest ─────────────────────────────────────────────────────

describe('processExportRequest', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns null for unknown ID', async () => {
    const promise = processExportRequest('nonexistent');
    jest.runAllTimers();
    expect(await promise).toBeNull();
  });

  it('sets status to IN_PROGRESS immediately, COMPLETE after timer', async () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });

    // Check it transitions through IN_PROGRESS
    const promise = processExportRequest(req.id);
    // After calling, it should be IN_PROGRESS (sync mutation before setTimeout)
    expect(getRequest(req.id)!.status).toBe('IN_PROGRESS');

    jest.runAllTimers();
    const result = await promise;

    expect(result!.status).toBe('COMPLETE');
    expect(result!.completedAt).not.toBeNull();
    expect(result!.downloadUrl).toMatch(/dsar/);
    expect(result!.downloadExpiry).not.toBeNull();
  });
});

// ─── processErasureRequest ────────────────────────────────────────────────────

describe('processErasureRequest', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns null for unknown ID', async () => {
    const promise = processErasureRequest('nonexistent');
    jest.runAllTimers();
    expect(await promise).toBeNull();
  });

  it('sets status to COMPLETE after erasure', async () => {
    const req = createRequest({ orgId: uniqueOrg(), type: 'ERASURE', subjectEmail: 'erase@me.com', requestedById: 'u' });

    const promise = processErasureRequest(req.id);
    expect(getRequest(req.id)!.status).toBe('IN_PROGRESS');

    jest.runAllTimers();
    const result = await promise;

    expect(result!.status).toBe('COMPLETE');
    expect(result!.completedAt).not.toBeNull();
    expect(result!.notes).toContain('erasure completed');
    expect(result!.notes).toContain('erase@me.com');
  });
});

// ─── Extended scenarios ───────────────────────────────────────────────────────

describe('dsar — extended scenarios', () => {
  it('createRequest id is a valid UUID', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(req.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('createRequest createdAt is a valid ISO 8601 string', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(new Date(req.createdAt).toISOString()).toBe(req.createdAt);
  });

  it('createRequest updatedAt equals createdAt initially', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    expect(req.updatedAt).toBe(req.createdAt);
  });

  it('updateRequest sets completedAt when provided', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const completedAt = new Date().toISOString();
    const updated = updateRequest(req.id, { completedAt });
    expect(updated!.completedAt).toBe(completedAt);
  });

  it('getRequest returns the same object as returned by createRequest', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const fetched = getRequest(req.id);
    expect(fetched!.id).toBe(req.id);
    expect(fetched!.orgId).toBe(req.orgId);
  });

  it('listRequests returns ERASURE request type correctly', () => {
    const org = uniqueOrg();
    createRequest({ orgId: org, type: 'ERASURE', subjectEmail: 'a@b.com', requestedById: 'u' });
    const list = listRequests(org);
    expect(list[0].type).toBe('ERASURE');
  });

  it('updateRequest does not affect other fields not mentioned in update', () => {
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    updateRequest(req.id, { status: 'IN_PROGRESS' });
    const after = getRequest(req.id)!;
    expect(after.subjectEmail).toBe(BASE.subjectEmail);
    expect(after.type).toBe(BASE.type);
  });

  it('processExportRequest downloadUrl contains the request id', async () => {
    jest.useFakeTimers();
    const req = createRequest({ orgId: uniqueOrg(), ...BASE });
    const promise = processExportRequest(req.id);
    jest.runAllTimers();
    const result = await promise;
    expect(result!.downloadUrl).toContain(req.id);
    jest.useRealTimers();
  });

  it('processErasureRequest does not set downloadUrl (erasures have no file)', async () => {
    jest.useFakeTimers();
    const req = createRequest({ orgId: uniqueOrg(), type: 'ERASURE', subjectEmail: 'del@ims.local', requestedById: 'u' });
    const promise = processErasureRequest(req.id);
    jest.runAllTimers();
    const result = await promise;
    expect(result!.downloadUrl).toBeNull();
    jest.useRealTimers();
  });
});
