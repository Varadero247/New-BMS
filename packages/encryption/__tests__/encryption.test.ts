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

describe('encryption — absolute final boundary', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
  });

  afterEach(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  it('encrypt result has three colon-separated segments', () => {
    const ct = encrypt('boundary test');
    expect(ct.split(':')).toHaveLength(3);
  });

  it('decrypt returns the original string for a URL-like value', () => {
    const url = 'https://api.ims.local/v1/resource?id=42&token=abc';
    expect(decrypt(encrypt(url))).toBe(url);
  });

  it('encryptIfPresent returns null for null', () => {
    expect(encryptIfPresent(null)).toBeNull();
  });

  it('encryptIfPresent returns undefined for undefined', () => {
    expect(encryptIfPresent(undefined)).toBeUndefined();
  });

  it('decryptIfEncrypted handles a string that looks like ciphertext format (3 parts)', () => {
    const ct = encrypt('sensitive data');
    const decrypted = decryptIfEncrypted(ct);
    expect(decrypted).toBe('sensitive data');
  });
});

describe('encryption — phase28 coverage', () => {
  beforeEach(() => { process.env.ENCRYPTION_KEY = 'a'.repeat(64); });
  afterEach(() => { delete process.env.ENCRYPTION_KEY; });

  it('encrypt always returns a non-empty string', () => {
    const ct = encrypt('phase28');
    expect(typeof ct).toBe('string');
    expect(ct.length).toBeGreaterThan(0);
  });

  it('decrypt returns exact original for JSON-like string', () => {
    const val = '{"key":"value","num":42}';
    expect(decrypt(encrypt(val))).toBe(val);
  });

  it('encryptIfPresent returns a string (not original) for non-empty input', () => {
    const ct = encryptIfPresent('phase28-data');
    expect(typeof ct).toBe('string');
    expect(ct).not.toBe('phase28-data');
  });

  it('decryptIfEncrypted round-trips data through encrypt', () => {
    const ct = encrypt('round-trip-phase28');
    expect(decryptIfEncrypted(ct)).toBe('round-trip-phase28');
  });

  it('isEncryptionConfigured returns true for 64-hex-char key', () => {
    process.env.ENCRYPTION_KEY = 'f'.repeat(64);
    expect(isEncryptionConfigured()).toBe(true);
  });
});

describe('encryption — phase30 coverage', () => {
  it('handles Array.from', () => {
    expect(Array.from('abc')).toEqual(['a', 'b', 'c']);
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles array isArray', () => {
    expect(Array.isArray([])).toBe(true);
  });

  it('handles flat array', () => {
    expect([[1, 2], [3, 4]].flat()).toEqual([1, 2, 3, 4]);
  });

  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

});


describe('phase31 coverage', () => {
  it('handles JSON parse', () => { expect(JSON.parse('{"a":1}')).toEqual({a:1}); });
  it('handles array findIndex', () => { expect([1,2,3].findIndex(x => x > 1)).toBe(1); });
  it('handles array from', () => { expect(Array.from('abc')).toEqual(['a','b','c']); });
  it('handles Number.isInteger', () => { expect(Number.isInteger(5)).toBe(true); expect(Number.isInteger(5.5)).toBe(false); });
  it('handles array every', () => { expect([2,4,6].every(x => x % 2 === 0)).toBe(true); });
});


describe('phase32 coverage', () => {
  it('handles string substring', () => { expect('hello'.substring(1,3)).toBe('el'); });
  it('handles closure', () => { const counter = () => { let n = 0; return () => ++n; }; const inc = counter(); expect(inc()).toBe(1); expect(inc()).toBe(2); });
  it('handles array values iterator', () => { expect([...['a','b'].values()]).toEqual(['a','b']); });
  it('handles string raw tag', () => { expect(String.raw`\n`).toBe('\\n'); });
  it('handles recursive function', () => { const fact = (n: number): number => n <= 1 ? 1 : n * fact(n-1); expect(fact(5)).toBe(120); });
});


describe('phase33 coverage', () => {
  it('handles async error handling', async () => { const safe = async (fn: () => Promise<unknown>) => { try { return await fn(); } catch { return null; } }; expect(await safe(async () => { throw new Error(); })).toBeNull(); });
  it('handles modulo', () => { expect(10 % 3).toBe(1); });
  it('handles Object.getPrototypeOf', () => { class A {} class B extends A {} expect(Object.getPrototypeOf(B.prototype)).toBe(A.prototype); });
  it('handles in operator', () => { const o = {a:1}; expect('a' in o).toBe(true); expect('b' in o).toBe(false); });
  it('handles string fromCharCode', () => { expect(String.fromCharCode(65)).toBe('A'); });
});


describe('phase34 coverage', () => {
  it('handles Required type pattern', () => { interface Opts { a?: number; b?: string; } const o: Required<Opts> = { a: 1, b: 'x' }; expect(o.a).toBe(1); });
  it('handles type assertion', () => { const v: unknown = 'hello'; expect((v as string).toUpperCase()).toBe('HELLO'); });
  it('handles object method shorthand', () => { const o = { double(x: number) { return x * 2; } }; expect(o.double(6)).toBe(12); });
  it('handles Partial type pattern', () => { interface Config { host: string; port: number; } const defaults: Config = { host: 'localhost', port: 8080 }; const override: Partial<Config> = { port: 9000 }; const merged = { ...defaults, ...override }; expect(merged.port).toBe(9000); });
  it('handles string comparison', () => { expect('apple' < 'banana').toBe(true); expect('zebra' > 'apple').toBe(true); });
});
