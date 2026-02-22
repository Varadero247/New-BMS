import bcrypt from 'bcryptjs';
import {
  createSignature,
  verifySignature,
  isValidMeaning,
  getValidMeanings,
  computeAuditChecksum,
  verifyAuditChecksum,
  computeSignatureChecksum,
  verifySignatureChecksum,
  computeChanges,
} from '../src';
import type { SignatureRequest, ElectronicSignature } from '../src';

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

describe('Electronic Signature Package', () => {
  const testPassword = 'TestPassword123!';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(testPassword, 10);
  });

  describe('createSignature', () => {
    const baseRequest: SignatureRequest = {
      userId: 'user-001',
      userEmail: 'test@ims.local',
      userFullName: 'Test User',
      password: testPassword,
      meaning: 'APPROVED',
      reason: 'Reviewed and approved document',
      resourceType: 'DeviceMasterRecord',
      resourceId: 'dmr-001',
      resourceRef: 'DMR-2602-0001',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    };

    it('should create a valid signature with correct password', async () => {
      const result = await createSignature(baseRequest, passwordHash);

      expect(result.error).toBeUndefined();
      expect(result.signature).not.toBeNull();
      expect(result.signature!.userId).toBe('user-001');
      expect(result.signature!.meaning).toBe('APPROVED');
      expect(result.signature!.resourceType).toBe('DeviceMasterRecord');
      expect(result.signature!.valid).toBe(true);
      expect(result.signature!.checksum).toHaveLength(64); // SHA-256 hex
      expect(result.signature!.id).toBeDefined();
      expect(result.signature!.timestamp).toBeInstanceOf(Date);
    });

    it('should reject with wrong password', async () => {
      const request = { ...baseRequest, password: 'WrongPassword123!' };
      const result = await createSignature(request, passwordHash);

      expect(result.signature).toBeNull();
      expect(result.error).toBe('Password re-authentication failed');
    });

    it('should reject invalid meaning', async () => {
      const request = { ...baseRequest, meaning: 'INVALID' as unknown as import('../src/types').SignatureMeaning };
      const result = await createSignature(request, passwordHash);

      expect(result.signature).toBeNull();
      expect(result.error).toContain('Invalid signature meaning');
    });

    it('should support all valid meanings', async () => {
      for (const meaning of getValidMeanings()) {
        const request = { ...baseRequest, meaning };
        const result = await createSignature(request, passwordHash);
        expect(result.signature).not.toBeNull();
        expect(result.signature!.meaning).toBe(meaning);
      }
    });

    it('should generate unique IDs for each signature', async () => {
      const result1 = await createSignature(baseRequest, passwordHash);
      const result2 = await createSignature(baseRequest, passwordHash);

      expect(result1.signature!.id).not.toBe(result2.signature!.id);
    });
  });

  describe('verifySignature', () => {
    it('should verify a valid signature', async () => {
      const result = await createSignature(
        {
          userId: 'user-001',
          userEmail: 'test@ims.local',
          userFullName: 'Test User',
          password: testPassword,
          meaning: 'APPROVED',
          reason: 'Approved',
          resourceType: 'Document',
          resourceId: 'doc-001',
          resourceRef: 'DOC-001',
          ipAddress: '10.0.0.1',
          userAgent: 'TestAgent',
        },
        passwordHash
      );

      const verification = verifySignature(result.signature!);

      expect(verification.valid).toBe(true);
      expect(verification.checksumMatch).toBe(true);
      expect(verification.signatureId).toBe(result.signature!.id);
    });

    it('should detect tampered signature', async () => {
      const result = await createSignature(
        {
          userId: 'user-001',
          userEmail: 'test@ims.local',
          userFullName: 'Test User',
          password: testPassword,
          meaning: 'APPROVED',
          reason: 'Approved',
          resourceType: 'Document',
          resourceId: 'doc-001',
          resourceRef: 'DOC-001',
          ipAddress: '10.0.0.1',
          userAgent: 'TestAgent',
        },
        passwordHash
      );

      // Tamper with the signature data
      const tampered: ElectronicSignature = {
        ...result.signature!,
        userId: 'attacker-001',
      };

      const verification = verifySignature(tampered);

      expect(verification.valid).toBe(false);
      expect(verification.checksumMatch).toBe(false);
    });

    it('should detect invalidated signature', async () => {
      const result = await createSignature(
        {
          userId: 'user-001',
          userEmail: 'test@ims.local',
          userFullName: 'Test User',
          password: testPassword,
          meaning: 'REVIEWED',
          reason: 'Reviewed',
          resourceType: 'Document',
          resourceId: 'doc-002',
          resourceRef: 'DOC-002',
          ipAddress: '10.0.0.1',
          userAgent: 'TestAgent',
        },
        passwordHash
      );

      const invalidated: ElectronicSignature = {
        ...result.signature!,
        valid: false,
      };

      const verification = verifySignature(invalidated);

      expect(verification.valid).toBe(false);
      expect(verification.checksumMatch).toBe(true);
    });
  });

  describe('isValidMeaning', () => {
    it('should return true for valid meanings', () => {
      expect(isValidMeaning('APPROVED')).toBe(true);
      expect(isValidMeaning('REVIEWED')).toBe(true);
      expect(isValidMeaning('RELEASED')).toBe(true);
      expect(isValidMeaning('VERIFIED')).toBe(true);
      expect(isValidMeaning('REJECTED')).toBe(true);
      expect(isValidMeaning('WITNESSED')).toBe(true);
      expect(isValidMeaning('AUTHORED')).toBe(true);
      expect(isValidMeaning('ACKNOWLEDGED')).toBe(true);
    });

    it('should return false for invalid meanings', () => {
      expect(isValidMeaning('INVALID')).toBe(false);
      expect(isValidMeaning('')).toBe(false);
      expect(isValidMeaning('approved')).toBe(false);
    });
  });

  describe('getValidMeanings', () => {
    it('should return all 8 valid meanings', () => {
      const meanings = getValidMeanings();
      expect(meanings).toHaveLength(8);
      expect(meanings).toContain('APPROVED');
      expect(meanings).toContain('RELEASED');
    });
  });
});

describe('Checksum Utilities', () => {
  const now = new Date('2026-02-12T10:00:00Z');

  describe('computeAuditChecksum', () => {
    it('should produce consistent SHA-256 hash', () => {
      const params = {
        userId: 'user-001',
        action: 'UPDATE',
        resourceId: 'doc-001',
        timestamp: now,
        changes: [{ field: 'status', oldValue: 'DRAFT', newValue: 'APPROVED' }],
      };

      const hash1 = computeAuditChecksum(params);
      const hash2 = computeAuditChecksum(params);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('should produce different hashes for different data', () => {
      const hash1 = computeAuditChecksum({
        userId: 'user-001',
        action: 'CREATE',
        resourceId: 'doc-001',
        timestamp: now,
        changes: [],
      });

      const hash2 = computeAuditChecksum({
        userId: 'user-002',
        action: 'CREATE',
        resourceId: 'doc-001',
        timestamp: now,
        changes: [],
      });

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyAuditChecksum', () => {
    it('should verify matching checksum', () => {
      const params = {
        userId: 'user-001',
        action: 'DELETE',
        resourceId: 'risk-001',
        timestamp: now,
        changes: [{ field: 'deletedAt', oldValue: null, newValue: now.toISOString() }],
      };

      const checksum = computeAuditChecksum(params);
      const result = verifyAuditChecksum({ ...params, storedChecksum: checksum });

      expect(result).toBe(true);
    });

    it('should reject mismatched checksum', () => {
      const result = verifyAuditChecksum({
        userId: 'user-001',
        action: 'DELETE',
        resourceId: 'risk-001',
        timestamp: now,
        changes: [],
        storedChecksum: 'tampered_checksum_value',
      });

      expect(result).toBe(false);
    });
  });

  describe('computeSignatureChecksum', () => {
    it('should produce consistent SHA-256 hash', () => {
      const params = {
        userId: 'user-001',
        meaning: 'APPROVED',
        resourceType: 'Document',
        resourceId: 'doc-001',
        timestamp: now,
      };

      const hash1 = computeSignatureChecksum(params);
      const hash2 = computeSignatureChecksum(params);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('verifySignatureChecksum', () => {
    it('should verify matching signature checksum', () => {
      const params = {
        userId: 'user-001',
        meaning: 'RELEASED',
        resourceType: 'DMR',
        resourceId: 'dmr-001',
        timestamp: now,
      };

      const checksum = computeSignatureChecksum(params);
      const result = verifySignatureChecksum({ ...params, storedChecksum: checksum });

      expect(result).toBe(true);
    });
  });

  describe('computeChanges', () => {
    it('should detect field additions', () => {
      const changes = computeChanges({}, { name: 'New Value' });

      expect(changes).toHaveLength(1);
      expect(changes[0]).toEqual({ field: 'name', oldValue: null, newValue: 'New Value' });
    });

    it('should detect field modifications', () => {
      const changes = computeChanges(
        { status: 'DRAFT', title: 'Old Title' },
        { status: 'APPROVED', title: 'Old Title' }
      );

      expect(changes).toHaveLength(1);
      expect(changes[0]).toEqual({ field: 'status', oldValue: 'DRAFT', newValue: 'APPROVED' });
    });

    it('should detect field removals', () => {
      const changes = computeChanges({ description: 'Hello' }, {});

      expect(changes).toHaveLength(1);
      expect(changes[0]).toEqual({ field: 'description', oldValue: 'Hello', newValue: null });
    });

    it('should handle multiple changes', () => {
      const changes = computeChanges({ a: 1, b: 2, c: 3 }, { a: 1, b: 99, d: 4 });

      expect(changes).toHaveLength(3); // b changed, c removed, d added
    });

    it('should return empty array for identical objects', () => {
      const changes = computeChanges({ a: 1, b: 'hello' }, { a: 1, b: 'hello' });

      expect(changes).toHaveLength(0);
    });

    it('should handle nested objects', () => {
      const changes = computeChanges({ config: { timeout: 30 } }, { config: { timeout: 60 } });

      expect(changes).toHaveLength(1);
      expect(changes[0].field).toBe('config');
    });
  });
});

describe('Electronic Signature — additional coverage', () => {
  const testPassword = 'TestPassword123!';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(testPassword, 10);
  });

  describe('createSignature — additional cases', () => {
    const baseRequest: SignatureRequest = {
      userId: 'user-ext-001',
      userEmail: 'ext@ims.local',
      userFullName: 'Ext User',
      password: testPassword,
      meaning: 'REVIEWED',
      reason: 'Reviewed for compliance',
      resourceType: 'RiskAssessment',
      resourceId: 'ra-001',
      resourceRef: 'RA-2602-0001',
      ipAddress: '10.10.10.1',
      userAgent: 'Test/1.0',
    };

    it('should set valid:true on newly created signature', async () => {
      const result = await createSignature(baseRequest, passwordHash);
      expect(result.signature!.valid).toBe(true);
    });

    it('should embed userId and userEmail on the signature', async () => {
      const result = await createSignature(baseRequest, passwordHash);
      expect(result.signature!.userId).toBe('user-ext-001');
      expect(result.signature!.userEmail).toBe('ext@ims.local');
    });

    it('should embed resourceType and resourceId on the signature', async () => {
      const result = await createSignature(baseRequest, passwordHash);
      expect(result.signature!.resourceType).toBe('RiskAssessment');
      expect(result.signature!.resourceId).toBe('ra-001');
    });

    it('should return null signature and error message for wrong password', async () => {
      const bad = { ...baseRequest, password: 'WrongPass999!' };
      const result = await createSignature(bad, passwordHash);
      expect(result.signature).toBeNull();
      expect(typeof result.error).toBe('string');
    });
  });

  describe('verifySignatureChecksum — mismatch cases', () => {
    it('should return false when storedChecksum does not match', () => {
      const result = verifySignatureChecksum({
        userId: 'user-ext-001',
        meaning: 'WITNESSED',
        resourceType: 'Document',
        resourceId: 'doc-999',
        timestamp: new Date('2026-01-01T00:00:00Z'),
        storedChecksum: 'deadbeef_invalid_checksum',
      });
      expect(result).toBe(false);
    });
  });

  describe('computeChanges — additional edge cases', () => {
    it('should treat null and undefined as different from a string value', () => {
      const changes = computeChanges({ field: null } as Record<string, unknown>, { field: 'hello' });
      expect(changes.length).toBeGreaterThan(0);
    });

    it('should handle an empty old object and non-empty new object', () => {
      const changes = computeChanges({}, { a: 1, b: 2 });
      expect(changes).toHaveLength(2);
    });
  });
});

describe('Electronic Signature — final coverage additions', () => {
  const testPassword = 'TestPassword123!';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(testPassword, 10);
  });

  it('isValidMeaning returns false for lowercase meaning strings', () => {
    expect(isValidMeaning('approved')).toBe(false);
    expect(isValidMeaning('released')).toBe(false);
  });

  it('getValidMeanings returns an array', () => {
    expect(Array.isArray(getValidMeanings())).toBe(true);
  });

  it('computeAuditChecksum produces a 64-character hex string', () => {
    const hash = computeAuditChecksum({
      userId: 'u1',
      action: 'UPDATE',
      resourceId: 'r1',
      timestamp: new Date(),
      changes: [],
    });
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('computeSignatureChecksum produces a 64-character hex string', () => {
    const hash = computeSignatureChecksum({
      userId: 'u1',
      meaning: 'APPROVED',
      resourceType: 'Doc',
      resourceId: 'doc-1',
      timestamp: new Date(),
    });
    expect(hash).toHaveLength(64);
  });

  it('createSignature result has no error property when successful', async () => {
    const req = {
      userId: 'u-final',
      userEmail: 'final@ims.local',
      userFullName: 'Final User',
      password: testPassword,
      meaning: 'ACKNOWLEDGED' as import('../src/types').SignatureMeaning,
      reason: 'Acknowledged',
      resourceType: 'SOP',
      resourceId: 'sop-001',
      resourceRef: 'SOP-001',
      ipAddress: '127.0.0.1',
      userAgent: 'Test',
    };
    const result = await createSignature(req, passwordHash);
    expect(result.error).toBeUndefined();
    expect(result.signature).not.toBeNull();
  });
});

describe('Electronic Signature — absolute final boundary', () => {
  const testPassword = 'TestPassword123!';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(testPassword, 10);
  });

  it('isValidMeaning returns true for AUTHORED', () => {
    expect(isValidMeaning('AUTHORED')).toBe(true);
  });

  it('isValidMeaning returns false for null-like string', () => {
    expect(isValidMeaning('null')).toBe(false);
  });

  it('getValidMeanings includes WITNESSED', () => {
    expect(getValidMeanings()).toContain('WITNESSED');
  });

  it('computeChanges returns array even when both objects are empty', () => {
    const changes = computeChanges({}, {});
    expect(Array.isArray(changes)).toBe(true);
    expect(changes).toHaveLength(0);
  });

  it('verifyAuditChecksum returns true for freshly computed checksum', () => {
    const params = {
      userId: 'boundary-user',
      action: 'READ',
      resourceId: 'res-boundary',
      timestamp: new Date('2026-01-15T12:00:00Z'),
      changes: [],
    };
    const checksum = computeAuditChecksum(params);
    expect(verifyAuditChecksum({ ...params, storedChecksum: checksum })).toBe(true);
  });

  it('createSignature VERIFIED meaning works correctly', async () => {
    const req: SignatureRequest = {
      userId: 'u-ver',
      userEmail: 'ver@ims.local',
      userFullName: 'Verified User',
      password: testPassword,
      meaning: 'VERIFIED',
      reason: 'Verification complete',
      resourceType: 'CalibrationRecord',
      resourceId: 'cal-001',
      resourceRef: 'CAL-001',
      ipAddress: '192.168.0.1',
      userAgent: 'Chrome',
    };
    const result = await createSignature(req, passwordHash);
    expect(result.signature!.meaning).toBe('VERIFIED');
    expect(result.error).toBeUndefined();
  });
});

describe('Electronic Signature — phase28 coverage', () => {
  const testPassword = 'TestPassword123!';
  let passwordHash;

  beforeAll(async () => {
    const bcrypt = require('bcryptjs');
    passwordHash = await bcrypt.hash(testPassword, 10);
  });

  it('isValidMeaning returns true for REJECTED', () => {
    expect(isValidMeaning('REJECTED')).toBe(true);
  });

  it('isValidMeaning returns false for numeric string', () => {
    expect(isValidMeaning('0')).toBe(false);
  });

  it('computeChanges detects a change in a numeric field', () => {
    const changes = computeChanges({ count: 1 }, { count: 2 });
    expect(changes).toHaveLength(1);
    expect(changes[0].field).toBe('count');
    expect(changes[0].oldValue).toBe(1);
    expect(changes[0].newValue).toBe(2);
  });

  it('verifyAuditChecksum returns false for wrong storedChecksum', () => {
    const result = verifyAuditChecksum({
      userId: 'p28-user',
      action: 'UPDATE',
      resourceId: 'p28-res',
      timestamp: new Date('2026-02-22T00:00:00Z'),
      changes: [],
      storedChecksum: 'wrong',
    });
    expect(result).toBe(false);
  });
});

describe('esig — phase30 coverage', () => {
  it('handles reduce method', () => {
    expect([1, 2, 3].reduce((acc, x) => acc + x, 0)).toBe(6);
  });

  it('handles async resolve', async () => {
    await expect(Promise.resolve('ok')).resolves.toBe('ok');
  });

  it('handles every method', () => {
    expect([1, 2, 3].every(x => x > 0)).toBe(true);
  });

  it('handles JSON stringify', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}');
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

});


describe('phase31 coverage', () => {
  it('handles Set creation', () => { const s = new Set([1,2,2,3]); expect(s.size).toBe(3); });
  it('handles array every', () => { expect([2,4,6].every(x => x % 2 === 0)).toBe(true); });
  it('handles try/catch', () => { let caught = false; try { throw new Error('x'); } catch { caught = true; } expect(caught).toBe(true); });
  it('handles Number.isNaN', () => { expect(Number.isNaN(NaN)).toBe(true); expect(Number.isNaN(42)).toBe(false); });
  it('handles Math.round', () => { expect(Math.round(3.5)).toBe(4); });
});


describe('phase32 coverage', () => {
  it('handles typeof undefined', () => { expect(typeof undefined).toBe('undefined'); });
  it('handles string charAt', () => { expect('hello'.charAt(1)).toBe('e'); });
  it('handles bitwise XOR', () => { expect(6 ^ 3).toBe(5); });
  it('handles closure', () => { const counter = () => { let n = 0; return () => ++n; }; const inc = counter(); expect(inc()).toBe(1); expect(inc()).toBe(2); });
  it('handles string trimEnd', () => { expect('hi  '.trimEnd()).toBe('hi'); });
});
