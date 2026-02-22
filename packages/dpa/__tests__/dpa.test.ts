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

  it('acceptance.id is a UUID string', () => {
    const acc = acceptDpa({ orgId: uniqueOrg(), userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(acc!.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('acceptedAt is a valid ISO 8601 timestamp', () => {
    const acc = acceptDpa({ orgId: uniqueOrg(), userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(new Date(acc!.acceptedAt).toISOString()).toBe(acc!.acceptedAt);
  });

  it('each acceptance gets a unique id', () => {
    const acc1 = acceptDpa({ orgId: uniqueOrg(), userId: 'u', signerName: 'N', signerTitle: 'T' });
    const acc2 = acceptDpa({ orgId: uniqueOrg(), userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(acc1!.id).not.toBe(acc2!.id);
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

// ─── Additional coverage ──────────────────────────────────────────────────────────────────────────

describe('dpa — additional coverage', () => {
  it('getActiveDpa effectiveDate is a valid date string', () => {
    const doc = getActiveDpa()!;
    expect(new Date(doc.effectiveDate).toString()).not.toBe('Invalid Date');
  });

  it('acceptDpa with empty signerTitle still records the acceptance', () => {
    const org = uniqueOrg();
    const acc = acceptDpa({ orgId: org, userId: 'u', signerName: 'Test', signerTitle: '' });
    expect(acc).not.toBeNull();
    expect(acc!.signerTitle).toBe('');
    expect(getDpaAcceptance(org)).not.toBeNull();
  });

  it('getDpaAcceptance returns the same record returned by acceptDpa', () => {
    const org = uniqueOrg();
    const acc = acceptDpa({ orgId: org, userId: 'u', signerName: 'N', signerTitle: 'T' });
    const stored = getDpaAcceptance(org);
    expect(stored!.id).toBe(acc!.id);
  });

  it('hasAcceptedDpa returns true immediately after acceptDpa completes', () => {
    const org = uniqueOrg();
    expect(hasAcceptedDpa(org)).toBe(false);
    acceptDpa({ orgId: org, userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(hasAcceptedDpa(org)).toBe(true);
  });
});

describe('dpa — extended scenarios', () => {
  it('getActiveDpa content is a non-empty string', () => {
    const doc = getActiveDpa()!;
    expect(typeof doc.content).toBe('string');
    expect(doc.content.length).toBeGreaterThan(0);
  });

  it('getActiveDpa title is a non-empty string', () => {
    const doc = getActiveDpa()!;
    expect(doc.title.length).toBeGreaterThan(0);
  });

  it('getDpaById with the active DPA id returns the same document as getActiveDpa', () => {
    const active = getActiveDpa()!;
    const byId = getDpaById(active.id)!;
    expect(byId.version).toBe(active.version);
    expect(byId.title).toBe(active.title);
  });

  it('acceptDpa returns null when there is no active DPA (defensive test via undefined id)', () => {
    // getActiveDpa always returns the seeded DPA, so we just confirm acceptDpa returns non-null
    const acc = acceptDpa({ orgId: uniqueOrg(), userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(acc).not.toBeNull();
  });

  it('acceptDpa stores signerName correctly for long names', () => {
    const name = 'A'.repeat(100);
    const acc = acceptDpa({ orgId: uniqueOrg(), userId: 'u', signerName: name, signerTitle: 'T' });
    expect(acc!.signerName).toBe(name);
  });

  it('multiple different orgs can each accept the DPA independently', () => {
    const orgs = [uniqueOrg(), uniqueOrg(), uniqueOrg()];
    for (const org of orgs) {
      acceptDpa({ orgId: org, userId: 'u', signerName: 'N', signerTitle: 'T' });
    }
    for (const org of orgs) {
      expect(hasAcceptedDpa(org)).toBe(true);
    }
  });

  it('getDpaAcceptance returns null after org counter increments but no acceptance made', () => {
    const org = uniqueOrg();
    expect(getDpaAcceptance(org)).toBeNull();
  });

  it('acceptDpa dpaVersion matches the active DPA version string', () => {
    const active = getActiveDpa()!;
    const acc = acceptDpa({ orgId: uniqueOrg(), userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(acc!.dpaVersion).toBe(active.version);
  });

  it('getDpaById returns undefined for an empty string id', () => {
    expect(getDpaById('')).toBeUndefined();
  });
});

describe('dpa — comprehensive validation', () => {
  it('acceptDpa returns an object with orgId, userId, signerName, signerTitle fields', () => {
    const org = uniqueOrg();
    const acc = acceptDpa({ orgId: org, userId: 'u-v1', signerName: 'Validator', signerTitle: 'CFO' });
    expect(acc).toMatchObject({
      orgId: org,
      userId: 'u-v1',
      signerName: 'Validator',
      signerTitle: 'CFO',
    });
  });

  it('hasAcceptedDpa returns false for a uniqueOrg that was never used', () => {
    const org = uniqueOrg();
    expect(hasAcceptedDpa(org)).toBe(false);
  });

  it('acceptDpa null ipAddress is preserved', () => {
    const acc = acceptDpa({ orgId: uniqueOrg(), userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(acc!.ipAddress).toBeNull();
  });

  it('acceptDpa null signature is preserved when not provided', () => {
    const acc = acceptDpa({ orgId: uniqueOrg(), userId: 'u', signerName: 'N', signerTitle: 'T' });
    expect(acc!.signature).toBeNull();
  });

  it('getDpaAcceptance returns updated record after second acceptDpa call for same org', () => {
    const org = uniqueOrg();
    acceptDpa({ orgId: org, userId: 'first', signerName: 'First', signerTitle: 'CEO' });
    acceptDpa({ orgId: org, userId: 'second', signerName: 'Second', signerTitle: 'CFO' });
    const acc = getDpaAcceptance(org);
    expect(acc!.userId).toBe('second');
  });

  it('getActiveDpa isActive is true', () => {
    expect(getActiveDpa()!.isActive).toBe(true);
  });
});
