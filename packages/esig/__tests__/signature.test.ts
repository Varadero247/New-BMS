import bcrypt from 'bcryptjs';
import { createSignature, verifySignature, isValidMeaning, getValidMeanings } from '../src';
import type { SignatureRequest, ElectronicSignature, SignatureMeaning } from '../src';

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

describe('createSignature — comprehensive', () => {
  const testPassword = 'SecurePassword123!';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(testPassword, 10);
  });

  const baseRequest: SignatureRequest = {
    userId: 'user-001',
    userEmail: 'test@ims.local',
    userFullName: 'Test User',
    password: testPassword,
    meaning: 'APPROVED',
    reason: 'Document reviewed and approved',
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
    expect(result.signature!.valid).toBe(true);
  });

  it('should populate all fields on the signature', async () => {
    const result = await createSignature(baseRequest, passwordHash);
    const sig = result.signature!;
    expect(sig.userId).toBe('user-001');
    expect(sig.userEmail).toBe('test@ims.local');
    expect(sig.userFullName).toBe('Test User');
    expect(sig.meaning).toBe('APPROVED');
    expect(sig.reason).toBe('Document reviewed and approved');
    expect(sig.resourceType).toBe('DeviceMasterRecord');
    expect(sig.resourceId).toBe('dmr-001');
    expect(sig.resourceRef).toBe('DMR-2602-0001');
    expect(sig.ipAddress).toBe('192.168.1.1');
    expect(sig.userAgent).toBe('Mozilla/5.0');
  });

  it('should generate UUID for signature id', async () => {
    const result = await createSignature(baseRequest, passwordHash);
    expect(result.signature!.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('should generate SHA-256 checksum (64 hex chars)', async () => {
    const result = await createSignature(baseRequest, passwordHash);
    expect(result.signature!.checksum).toHaveLength(64);
    expect(result.signature!.checksum).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should set timestamp to current time', async () => {
    const before = new Date();
    const result = await createSignature(baseRequest, passwordHash);
    const after = new Date();
    expect(result.signature!.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.signature!.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should generate unique IDs for each call', async () => {
    const r1 = await createSignature(baseRequest, passwordHash);
    const r2 = await createSignature(baseRequest, passwordHash);
    expect(r1.signature!.id).not.toBe(r2.signature!.id);
  });

  it('should reject wrong password', async () => {
    const request = { ...baseRequest, password: 'WrongPassword!' };
    const result = await createSignature(request, passwordHash);
    expect(result.signature).toBeNull();
    expect(result.error).toBe('Password re-authentication failed');
  });

  it('should reject empty password', async () => {
    const request = { ...baseRequest, password: '' };
    const result = await createSignature(request, passwordHash);
    expect(result.signature).toBeNull();
    expect(result.error).toBe('Password re-authentication failed');
  });

  it('should reject invalid meaning', async () => {
    const request = { ...baseRequest, meaning: 'INVALID_MEANING' as unknown as import('../src/types').SignatureMeaning };
    const result = await createSignature(request, passwordHash);
    expect(result.signature).toBeNull();
    expect(result.error).toContain('Invalid signature meaning');
  });

  it('should accept all 8 valid meanings', async () => {
    const meanings = getValidMeanings();
    for (const meaning of meanings) {
      const request = { ...baseRequest, meaning };
      const result = await createSignature(request, passwordHash);
      expect(result.signature).not.toBeNull();
      expect(result.signature!.meaning).toBe(meaning);
    }
  });

  it('should reject lowercase meaning', async () => {
    const request = { ...baseRequest, meaning: 'approved' as unknown as import('../src/types').SignatureMeaning };
    const result = await createSignature(request, passwordHash);
    expect(result.signature).toBeNull();
  });

  it('should handle WITNESSED meaning', async () => {
    const request = { ...baseRequest, meaning: 'WITNESSED' as SignatureMeaning };
    const result = await createSignature(request, passwordHash);
    expect(result.signature!.meaning).toBe('WITNESSED');
  });

  it('should handle AUTHORED meaning', async () => {
    const request = { ...baseRequest, meaning: 'AUTHORED' as SignatureMeaning };
    const result = await createSignature(request, passwordHash);
    expect(result.signature!.meaning).toBe('AUTHORED');
  });

  it('should handle ACKNOWLEDGED meaning', async () => {
    const request = { ...baseRequest, meaning: 'ACKNOWLEDGED' as SignatureMeaning };
    const result = await createSignature(request, passwordHash);
    expect(result.signature!.meaning).toBe('ACKNOWLEDGED');
  });
});

describe('verifySignature — comprehensive', () => {
  const testPassword = 'SecurePassword123!';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(testPassword, 10);
  });

  const baseRequest: SignatureRequest = {
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
  };

  it('should verify a valid untampered signature', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const verification = verifySignature(signature!);
    expect(verification.valid).toBe(true);
    expect(verification.checksumMatch).toBe(true);
  });

  it('should return correct fields in verification', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const verification = verifySignature(signature!);
    expect(verification.signatureId).toBe(signature!.id);
    expect(verification.userId).toBe('user-001');
    expect(verification.userEmail).toBe('test@ims.local');
    expect(verification.meaning).toBe('APPROVED');
    expect(verification.resourceType).toBe('Document');
    expect(verification.resourceId).toBe('doc-001');
  });

  it('should detect tampered userId', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const tampered = { ...signature!, userId: 'attacker' };
    const verification = verifySignature(tampered);
    expect(verification.valid).toBe(false);
    expect(verification.checksumMatch).toBe(false);
  });

  it('should detect tampered meaning', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const tampered = { ...signature!, meaning: 'REJECTED' as SignatureMeaning };
    const verification = verifySignature(tampered);
    expect(verification.valid).toBe(false);
    expect(verification.checksumMatch).toBe(false);
  });

  it('should detect tampered resourceType', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const tampered = { ...signature!, resourceType: 'Tampered' };
    const verification = verifySignature(tampered);
    expect(verification.valid).toBe(false);
  });

  it('should detect tampered resourceId', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const tampered = { ...signature!, resourceId: 'fake-id' };
    const verification = verifySignature(tampered);
    expect(verification.valid).toBe(false);
  });

  it('should detect tampered timestamp', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const tampered = { ...signature!, timestamp: new Date('2020-01-01') };
    const verification = verifySignature(tampered);
    expect(verification.valid).toBe(false);
  });

  it('should detect invalidated signature (valid=false)', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const invalidated = { ...signature!, valid: false };
    const verification = verifySignature(invalidated);
    expect(verification.valid).toBe(false);
    expect(verification.checksumMatch).toBe(true); // checksum still matches
  });

  it('should detect tampered checksum', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const tampered = { ...signature!, checksum: 'a'.repeat(64) };
    const verification = verifySignature(tampered);
    expect(verification.valid).toBe(false);
    expect(verification.checksumMatch).toBe(false);
  });

  it('should return timestamp in verification result', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const verification = verifySignature(signature!);
    expect(verification.timestamp).toBeInstanceOf(Date);
  });
});

describe('isValidMeaning — comprehensive', () => {
  it('should return true for APPROVED', () => {
    expect(isValidMeaning('APPROVED')).toBe(true);
  });

  it('should return true for REVIEWED', () => {
    expect(isValidMeaning('REVIEWED')).toBe(true);
  });

  it('should return true for RELEASED', () => {
    expect(isValidMeaning('RELEASED')).toBe(true);
  });

  it('should return true for VERIFIED', () => {
    expect(isValidMeaning('VERIFIED')).toBe(true);
  });

  it('should return true for REJECTED', () => {
    expect(isValidMeaning('REJECTED')).toBe(true);
  });

  it('should return true for WITNESSED', () => {
    expect(isValidMeaning('WITNESSED')).toBe(true);
  });

  it('should return true for AUTHORED', () => {
    expect(isValidMeaning('AUTHORED')).toBe(true);
  });

  it('should return true for ACKNOWLEDGED', () => {
    expect(isValidMeaning('ACKNOWLEDGED')).toBe(true);
  });

  it('should return false for lowercase', () => {
    expect(isValidMeaning('approved')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidMeaning('')).toBe(false);
  });

  it('should return false for arbitrary string', () => {
    expect(isValidMeaning('SIGNED')).toBe(false);
  });

  it('should return false for partial match', () => {
    expect(isValidMeaning('APPROVE')).toBe(false);
  });
});

describe('getValidMeanings — comprehensive', () => {
  it('should return exactly 8 meanings', () => {
    expect(getValidMeanings()).toHaveLength(8);
  });

  it('should include all expected meanings', () => {
    const meanings = getValidMeanings();
    expect(meanings).toContain('APPROVED');
    expect(meanings).toContain('REVIEWED');
    expect(meanings).toContain('RELEASED');
    expect(meanings).toContain('VERIFIED');
    expect(meanings).toContain('REJECTED');
    expect(meanings).toContain('WITNESSED');
    expect(meanings).toContain('AUTHORED');
    expect(meanings).toContain('ACKNOWLEDGED');
  });

  it('should return a new array each time (not mutable reference)', () => {
    const m1 = getValidMeanings();
    const m2 = getValidMeanings();
    expect(m1).not.toBe(m2);
    expect(m1).toEqual(m2);
  });
});

describe('esig — additional coverage', () => {
  const testPassword = 'SecurePassword123!';
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(testPassword, 10);
  });

  const baseRequest: SignatureRequest = {
    userId: 'user-extra',
    userEmail: 'extra@ims.local',
    userFullName: 'Extra User',
    password: testPassword,
    meaning: 'VERIFIED',
    reason: 'Extra coverage',
    resourceType: 'Report',
    resourceId: 'rpt-001',
    resourceRef: 'RPT-2602-0001',
    ipAddress: '10.10.10.1',
    userAgent: 'TestAgent/2.0',
  };

  it('isValidMeaning returns false for numeric string', () => {
    expect(isValidMeaning('12345')).toBe(false);
  });

  it('createSignature with VERIFIED meaning populates correct meaning', async () => {
    const result = await createSignature(baseRequest, passwordHash);
    expect(result.signature).not.toBeNull();
    expect(result.signature!.meaning).toBe('VERIFIED');
  });

  it('verifySignature: tampering reason field does not affect validity (reason is not hashed)', async () => {
    const { signature } = await createSignature(baseRequest, passwordHash);
    const tampered = { ...signature!, reason: 'Tampered reason' };
    const verification = verifySignature(tampered);
    // reason is not included in the checksum, so the signature remains valid
    expect(verification.valid).toBe(true);
    expect(verification.checksumMatch).toBe(true);
  });

  it('createSignature returns error message for invalid meaning', async () => {
    const request = { ...baseRequest, meaning: 'NOT_A_MEANING' as unknown as import('../src/types').SignatureMeaning };
    const result = await createSignature(request, passwordHash);
    expect(result.error).toBeDefined();
    expect(result.signature).toBeNull();
  });
});
