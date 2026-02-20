import {
  getActiveDpa,
  getDpaById,
  acceptDpa,
  hasAcceptedDpa,
  getDpaAcceptance,
} from '../src/index';

/**
 * dpa store is module-level with no resetStore().
 * The DPA v1.0 document is seeded at module load.
 * We use unique orgIds per test to avoid cross-test state pollution
 * from the acceptances map.
 */

let orgCounter = 0;
function uniqueOrg(): string {
  return `test-org-${++orgCounter}`;
}

// ─── getActiveDpa ────────────────────────────────────────────────────────────

describe('getActiveDpa', () => {
  it('returns a DPA document', () => {
    const doc = getActiveDpa();
    expect(doc).not.toBeNull();
  });

  it('returned document has required fields', () => {
    const doc = getActiveDpa()!;
    expect(typeof doc.id).toBe('string');
    expect(doc.version).toBe('1.0');
    expect(typeof doc.title).toBe('string');
    expect(typeof doc.content).toBe('string');
    expect(doc.isActive).toBe(true);
    expect(typeof doc.effectiveDate).toBe('string');
  });
});

// ─── getDpaById ──────────────────────────────────────────────────────────────

describe('getDpaById', () => {
  it('returns the document when ID is valid', () => {
    const active = getActiveDpa()!;
    const doc = getDpaById(active.id);
    expect(doc).toBeDefined();
    expect(doc?.id).toBe(active.id);
  });

  it('returns undefined for unknown ID', () => {
    expect(getDpaById('nonexistent-id')).toBeUndefined();
  });
});

// ─── acceptDpa ───────────────────────────────────────────────────────────────

describe('acceptDpa', () => {
  it('creates an acceptance record', () => {
    const org = uniqueOrg();
    const acceptance = acceptDpa({
      orgId: org,
      userId: 'user-1',
      signerName: 'Alice Smith',
      signerTitle: 'CEO',
    });

    expect(acceptance).not.toBeNull();
    expect(acceptance!.orgId).toBe(org);
    expect(acceptance!.userId).toBe('user-1');
    expect(acceptance!.signerName).toBe('Alice Smith');
    expect(acceptance!.signerTitle).toBe('CEO');
    expect(acceptance!.dpaVersion).toBe('1.0');
    expect(typeof acceptance!.acceptedAt).toBe('string');
    expect(acceptance!.signature).toBeNull(); // not provided
    expect(acceptance!.ipAddress).toBeNull(); // not provided
  });

  it('stores optional signature and ipAddress', () => {
    const acceptance = acceptDpa({
      orgId: uniqueOrg(),
      userId: 'user-2',
      signerName: 'Bob Jones',
      signerTitle: 'CTO',
      signature: 'data:image/png;base64,abc',
      ipAddress: '192.168.1.1',
    });

    expect(acceptance!.signature).toBe('data:image/png;base64,abc');
    expect(acceptance!.ipAddress).toBe('192.168.1.1');
  });

  it('acceptance dpaId matches the active DPA', () => {
    const org = uniqueOrg();
    const active = getActiveDpa()!;
    const acceptance = acceptDpa({ orgId: org, userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(acceptance!.dpaId).toBe(active.id);
  });

  it('overwrites previous acceptance for the same org', () => {
    const org = uniqueOrg();
    acceptDpa({ orgId: org, userId: 'u1', signerName: 'First', signerTitle: 'CEO' });
    const second = acceptDpa({ orgId: org, userId: 'u2', signerName: 'Second', signerTitle: 'CFO' });
    const stored = getDpaAcceptance(org);
    expect(stored!.signerName).toBe('Second');
    expect(second!.signerName).toBe('Second');
  });
});

// ─── hasAcceptedDpa ──────────────────────────────────────────────────────────

describe('hasAcceptedDpa', () => {
  it('returns false for an org that has not accepted', () => {
    expect(hasAcceptedDpa(uniqueOrg())).toBe(false);
  });

  it('returns true after org accepts the active DPA', () => {
    const org = uniqueOrg();
    acceptDpa({ orgId: org, userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(hasAcceptedDpa(org)).toBe(true);
  });

  it('is per-org — accepting for one org does not affect another', () => {
    const org1 = uniqueOrg();
    const org2 = uniqueOrg();
    acceptDpa({ orgId: org1, userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(hasAcceptedDpa(org2)).toBe(false);
  });
});

// ─── getDpaAcceptance ────────────────────────────────────────────────────────

describe('getDpaAcceptance', () => {
  it('returns null for an org without an acceptance', () => {
    expect(getDpaAcceptance(uniqueOrg())).toBeNull();
  });

  it('returns the acceptance record after accepting', () => {
    const org = uniqueOrg();
    acceptDpa({ orgId: org, userId: 'u', signerName: 'N', signerTitle: 'T' });
    const acc = getDpaAcceptance(org);
    expect(acc).not.toBeNull();
    expect(acc!.orgId).toBe(org);
  });
});
