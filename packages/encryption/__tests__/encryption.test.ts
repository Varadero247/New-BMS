import { encrypt, decrypt, encryptIfPresent, decryptIfEncrypted, isEncryptionConfigured } from '../src/index';

const TEST_KEY = 'a'.repeat(64); // 32 bytes of 0xAA

beforeEach(() => {
  process.env.ENCRYPTION_KEY = TEST_KEY;
});

afterEach(() => {
  delete process.env.ENCRYPTION_KEY;
});

describe('encrypt/decrypt', () => {
  it('round-trips a simple string', () => {
    const plaintext = 'GB12-3456-7890';
    const ciphertext = encrypt(plaintext);
    expect(decrypt(ciphertext)).toBe(plaintext);
  });

  it('produces different ciphertext each call (random IV)', () => {
    const c1 = encrypt('same');
    const c2 = encrypt('same');
    expect(c1).not.toBe(c2);
    expect(decrypt(c1)).toBe('same');
    expect(decrypt(c2)).toBe('same');
  });

  it('ciphertext has exactly two colons', () => {
    const ct = encrypt('hello');
    expect((ct.match(/:/g) || []).length).toBe(2);
  });

  it('throws on tampered ciphertext (auth tag mismatch)', () => {
    const ct = encrypt('secret');
    const tampered = ct.replace(/.$/, ct.slice(-1) === 'a' ? 'b' : 'a');
    expect(() => decrypt(tampered)).toThrow();
  });

  it('throws on malformed ciphertext', () => {
    expect(() => decrypt('notvalid')).toThrow('Invalid ciphertext format');
  });

  it('handles unicode and special characters', () => {
    const value = 'Ångström £500 🔒 tab\there';
    expect(decrypt(encrypt(value))).toBe(value);
  });
});

describe('encryptIfPresent', () => {
  it('returns null unchanged', () => {
    expect(encryptIfPresent(null)).toBeNull();
  });

  it('returns undefined unchanged', () => {
    expect(encryptIfPresent(undefined)).toBeUndefined();
  });

  it('returns empty string unchanged', () => {
    expect(encryptIfPresent('')).toBe('');
  });

  it('encrypts non-empty strings', () => {
    const ct = encryptIfPresent('GB12-3456');
    expect(ct).not.toBe('GB12-3456');
    expect(decrypt(ct as string)).toBe('GB12-3456');
  });
});

describe('decryptIfEncrypted', () => {
  it('returns plaintext (no colons) unchanged — migration compatibility', () => {
    expect(decryptIfEncrypted('plaintext')).toBe('plaintext');
  });

  it('decrypts encrypted values', () => {
    const ct = encrypt('sensitive');
    expect(decryptIfEncrypted(ct)).toBe('sensitive');
  });

  it('returns null/undefined unchanged', () => {
    expect(decryptIfEncrypted(null)).toBeNull();
    expect(decryptIfEncrypted(undefined)).toBeUndefined();
  });
});

describe('isEncryptionConfigured', () => {
  it('returns true when key is set', () => {
    expect(isEncryptionConfigured()).toBe(true);
  });

  it('returns false when key is absent', () => {
    delete process.env.ENCRYPTION_KEY;
    expect(isEncryptionConfigured()).toBe(false);
  });

  it('returns false when key is wrong length', () => {
    process.env.ENCRYPTION_KEY = 'tooshort';
    expect(isEncryptionConfigured()).toBe(false);
  });
});

describe('error conditions', () => {
  it('throws when ENCRYPTION_KEY is not set', () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => encrypt('anything')).toThrow('ENCRYPTION_KEY');
  });

  it('throws when ENCRYPTION_KEY is wrong length', () => {
    process.env.ENCRYPTION_KEY = 'short';
    expect(() => encrypt('anything')).toThrow('64 hex characters');
  });
});

// ─── Additional coverage ─────────────────────────────────────────────────────

describe('encryption — additional coverage', () => {
  it('encrypt produces a string with ivHex:authTagHex:encryptedHex format', () => {
    const ct = encrypt('test value');
    const parts = ct.split(':');
    expect(parts).toHaveLength(3);
    // IV is 16 bytes = 32 hex chars
    expect(parts[0]).toHaveLength(32);
    // Auth tag is 16 bytes = 32 hex chars
    expect(parts[1]).toHaveLength(32);
    // Encrypted payload exists
    expect(parts[2].length).toBeGreaterThan(0);
  });

  it('decryptIfEncrypted returns empty string unchanged', () => {
    expect(decryptIfEncrypted('')).toBe('');
  });
});

describe('encryption — extended scenarios', () => {
  it('encrypt produces only hex characters in each segment', () => {
    const ct = encrypt('data');
    for (const part of ct.split(':')) {
      expect(part).toMatch(/^[0-9a-f]+$/);
    }
  });

  it('decrypt round-trips an empty string', () => {
    const ct = encrypt('');
    expect(decrypt(ct)).toBe('');
  });

  it('decrypt round-trips a very long string', () => {
    const long = 'x'.repeat(10000);
    expect(decrypt(encrypt(long))).toBe(long);
  });

  it('encryptIfPresent encrypts strings containing spaces', () => {
    const ct = encryptIfPresent('hello world');
    expect(typeof ct).toBe('string');
    expect(decryptIfEncrypted(ct as string)).toBe('hello world');
  });

  it('decryptIfEncrypted passes through a string with one colon (not encrypted)', () => {
    const plain = 'key:value';
    expect(decryptIfEncrypted(plain)).toBe('key:value');
  });

  it('decryptIfEncrypted passes through a string with three or more colons as-is (not exactly 2)', () => {
    const plain = 'a:b:c:d';
    expect(decryptIfEncrypted(plain)).toBe('a:b:c:d');
  });

  it('isEncryptionConfigured returns false when key is exactly 63 chars', () => {
    process.env.ENCRYPTION_KEY = 'a'.repeat(63);
    expect(isEncryptionConfigured()).toBe(false);
  });

  it('isEncryptionConfigured returns false when key is exactly 65 chars', () => {
    process.env.ENCRYPTION_KEY = 'a'.repeat(65);
    expect(isEncryptionConfigured()).toBe(false);
  });

  it('isEncryptionConfigured returns true when key is exactly 64 chars', () => {
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
    expect(isEncryptionConfigured()).toBe(true);
  });
});

describe('encryption — final edge case coverage', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  it('encrypt output is a string', () => {
    expect(typeof encrypt('any value')).toBe('string');
  });

  it('decrypt handles a null-byte in plaintext', () => {
    const val = 'before\x00after';
    expect(decrypt(encrypt(val))).toBe(val);
  });

  it('encryptIfPresent with whitespace-only string encrypts it', () => {
    const ct = encryptIfPresent('   ');
    expect(typeof ct).toBe('string');
    expect(ct).not.toBe('   ');
  });

  it('decryptIfEncrypted returns original for text with no colons', () => {
    expect(decryptIfEncrypted('nocolons')).toBe('nocolons');
  });

  it('encrypt called twice with same input produces different IV segments', () => {
    const c1 = encrypt('same-text');
    const c2 = encrypt('same-text');
    // IV is first segment (different each time)
    expect(c1.split(':')[0]).not.toBe(c2.split(':')[0]);
  });

  it('decrypt result matches original plaintext for numeric string', () => {
    const val = '1234567890';
    expect(decrypt(encrypt(val))).toBe(val);
  });
});
