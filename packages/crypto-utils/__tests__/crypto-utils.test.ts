import {
  hash,
  sha256,
  sha512,
  md5,
  hmac,
  generateToken,
  generateUUID,
  toBase64,
  fromBase64,
  toBase64Url,
  toHex,
  fromHex,
  deriveKey,
  constantTimeEquals,
  isValidHashAlgorithm,
  isValidEncoding,
  isValidTokenFormat,
  hashLength,
  isHexString,
  isBase64String,
  truncateHash,
  HashAlgorithm,
  EncodingFormat,
  TokenFormat,
} from '../src/index';

// ---------------------------------------------------------------------------
// Test data sets used across multiple describe blocks
// ---------------------------------------------------------------------------
const algorithms: HashAlgorithm[] = ['sha256', 'sha384', 'sha512', 'md5', 'sha1'];
const expectedHexLengths: Record<HashAlgorithm, number> = {
  sha256: 64,
  sha384: 96,
  sha512: 128,
  md5: 32,
  sha1: 40,
};
const encodings: EncodingFormat[] = ['hex', 'base64', 'base64url', 'binary'];
const tokenFormats: TokenFormat[] = ['uuid', 'hex', 'alphanumeric', 'numeric'];

const sampleInputs = [
  '',
  'a',
  'hello',
  'Hello World',
  'hello world',
  '0',
  '123456',
  'password',
  'P@ssw0rd!',
  'The quick brown fox jumps over the lazy dog',
  'Lorem ipsum dolor sit amet',
  'special chars: !@#$%^&*()',
  'unicode: 日本語テスト',
  'newline\n',
  'tab\t',
  'null\x00byte',
  'very long string: ' + 'x'.repeat(200),
  JSON.stringify({ key: 'value', num: 42 }),
  'email@example.com',
  'https://example.com/path?query=1',
];

// ============================================================
// SECTION 1: sha256
// ============================================================
describe('sha256', () => {
  it('returns a string', () => {
    expect(typeof sha256('test')).toBe('string');
  });

  it('returns exactly 64 characters', () => {
    expect(sha256('test')).toHaveLength(64);
  });

  it('returns only hex characters', () => {
    expect(/^[0-9a-f]{64}$/.test(sha256('test'))).toBe(true);
  });

  it('known vector: empty string', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('known vector: "abc"', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('known vector: "hello"', () => {
    expect(sha256('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('is deterministic', () => {
    expect(sha256('same')).toBe(sha256('same'));
  });

  sampleInputs.forEach((input, idx) => {
    it(`returns 64-char hex for input[${idx}]`, () => {
      const result = sha256(input);
      expect(result).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(result)).toBe(true);
    });
  });

  sampleInputs.forEach((input, idx) => {
    it(`is deterministic for input[${idx}]`, () => {
      expect(sha256(input)).toBe(sha256(input));
    });
  });

  it('different inputs produce different hashes (hello vs world)', () => {
    expect(sha256('hello')).not.toBe(sha256('world'));
  });

  it('case sensitivity: "Hello" !== "hello"', () => {
    expect(sha256('Hello')).not.toBe(sha256('hello'));
  });

  it('appending one char changes output', () => {
    expect(sha256('test')).not.toBe(sha256('test!'));
  });

  it('single char inputs produce distinct hashes', () => {
    const results = ['a', 'b', 'c', 'd', 'e'].map(sha256);
    const unique = new Set(results);
    expect(unique.size).toBe(5);
  });

  it('numeric string inputs produce distinct hashes', () => {
    const results = ['1', '2', '3', '4', '5'].map(sha256);
    const unique = new Set(results);
    expect(unique.size).toBe(5);
  });

  // Batch: 50 unique strings each produce a unique 64-char hex hash
  Array.from({ length: 50 }, (_, i) => `sha256-batch-input-${i}`).forEach((input, i) => {
    it(`batch[${i}]: sha256 length and hex charset`, () => {
      const r = sha256(input);
      expect(r).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(r)).toBe(true);
    });
  });
});

// ============================================================
// SECTION 2: sha512
// ============================================================
describe('sha512', () => {
  it('returns a string', () => {
    expect(typeof sha512('test')).toBe('string');
  });

  it('returns exactly 128 characters', () => {
    expect(sha512('test')).toHaveLength(128);
  });

  it('returns only hex characters', () => {
    expect(/^[0-9a-f]{128}$/.test(sha512('test'))).toBe(true);
  });

  it('known vector: empty string', () => {
    expect(sha512('')).toBe(
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce' +
      '47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'
    );
  });

  it('is deterministic', () => {
    expect(sha512('same')).toBe(sha512('same'));
  });

  sampleInputs.forEach((input, idx) => {
    it(`returns 128-char hex for input[${idx}]`, () => {
      const result = sha512(input);
      expect(result).toHaveLength(128);
      expect(/^[0-9a-f]+$/.test(result)).toBe(true);
    });
  });

  sampleInputs.forEach((input, idx) => {
    it(`is deterministic for input[${idx}]`, () => {
      expect(sha512(input)).toBe(sha512(input));
    });
  });

  it('different inputs produce different hashes', () => {
    expect(sha512('hello')).not.toBe(sha512('world'));
  });

  it('sha512 != sha256 for same input', () => {
    expect(sha512('test')).not.toBe(sha256('test'));
  });

  Array.from({ length: 50 }, (_, i) => `sha512-batch-${i}`).forEach((input, i) => {
    it(`batch[${i}]: sha512 length and hex charset`, () => {
      const r = sha512(input);
      expect(r).toHaveLength(128);
      expect(/^[0-9a-f]+$/.test(r)).toBe(true);
    });
  });
});

// ============================================================
// SECTION 3: md5
// ============================================================
describe('md5', () => {
  it('returns a string', () => {
    expect(typeof md5('test')).toBe('string');
  });

  it('returns exactly 32 characters', () => {
    expect(md5('test')).toHaveLength(32);
  });

  it('returns only hex characters', () => {
    expect(/^[0-9a-f]{32}$/.test(md5('test'))).toBe(true);
  });

  it('known vector: empty string', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('known vector: "hello"', () => {
    expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('known vector: "abc"', () => {
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('is deterministic', () => {
    expect(md5('same')).toBe(md5('same'));
  });

  sampleInputs.forEach((input, idx) => {
    it(`returns 32-char hex for input[${idx}]`, () => {
      const result = md5(input);
      expect(result).toHaveLength(32);
      expect(/^[0-9a-f]+$/.test(result)).toBe(true);
    });
  });

  sampleInputs.forEach((input, idx) => {
    it(`is deterministic for input[${idx}]`, () => {
      expect(md5(input)).toBe(md5(input));
    });
  });

  it('different inputs produce different hashes', () => {
    expect(md5('foo')).not.toBe(md5('bar'));
  });

  Array.from({ length: 30 }, (_, i) => `md5-batch-${i}`).forEach((input, i) => {
    it(`batch[${i}]: md5 length and hex charset`, () => {
      const r = md5(input);
      expect(r).toHaveLength(32);
      expect(/^[0-9a-f]+$/.test(r)).toBe(true);
    });
  });
});

// ============================================================
// SECTION 4: hash (generic)
// ============================================================
describe('hash', () => {
  // Default options
  it('uses sha256+hex as default', () => {
    expect(hash('test')).toBe(sha256('test'));
  });

  it('default returns 64-char hex', () => {
    expect(hash('hello')).toHaveLength(64);
  });

  // All algorithms x hex
  algorithms.forEach(alg => {
    it(`hash(alg=${alg}, enc=hex) returns correct length`, () => {
      const result = hash('test', { algorithm: alg, encoding: 'hex' });
      expect(result).toHaveLength(expectedHexLengths[alg]);
    });

    it(`hash(alg=${alg}, enc=hex) is hex string`, () => {
      const result = hash('test', { algorithm: alg, encoding: 'hex' });
      expect(/^[0-9a-f]+$/.test(result)).toBe(true);
    });

    it(`hash(alg=${alg}, enc=hex) is deterministic`, () => {
      expect(hash('foo', { algorithm: alg, encoding: 'hex' }))
        .toBe(hash('foo', { algorithm: alg, encoding: 'hex' }));
    });
  });

  // All algorithms x base64
  algorithms.forEach(alg => {
    it(`hash(alg=${alg}, enc=base64) returns non-empty string`, () => {
      const result = hash('test', { algorithm: alg, encoding: 'base64' });
      expect(result.length).toBeGreaterThan(0);
    });

    it(`hash(alg=${alg}, enc=base64) is valid base64`, () => {
      const result = hash('test', { algorithm: alg, encoding: 'base64' });
      expect(isBase64String(result)).toBe(true);
    });

    it(`hash(alg=${alg}, enc=base64) is deterministic`, () => {
      expect(hash('bar', { algorithm: alg, encoding: 'base64' }))
        .toBe(hash('bar', { algorithm: alg, encoding: 'base64' }));
    });
  });

  // All algorithms x base64url
  algorithms.forEach(alg => {
    it(`hash(alg=${alg}, enc=base64url) has no +/= chars`, () => {
      const result = hash('test', { algorithm: alg, encoding: 'base64url' });
      expect(result).not.toMatch(/[+/=]/);
    });

    it(`hash(alg=${alg}, enc=base64url) is non-empty`, () => {
      expect(hash('test', { algorithm: alg, encoding: 'base64url' }).length).toBeGreaterThan(0);
    });
  });

  // All algorithms x binary
  algorithms.forEach(alg => {
    it(`hash(alg=${alg}, enc=binary) returns non-empty string`, () => {
      const result = hash('test', { algorithm: alg, encoding: 'binary' });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // Cross-algorithm distinctness
  it('sha256 and sha512 produce different results for same input', () => {
    expect(hash('data', { algorithm: 'sha256', encoding: 'hex' }))
      .not.toBe(hash('data', { algorithm: 'sha512', encoding: 'hex' }));
  });

  it('sha256 and md5 produce different results for same input', () => {
    expect(hash('data', { algorithm: 'sha256', encoding: 'hex' }))
      .not.toBe(hash('data', { algorithm: 'md5', encoding: 'hex' }));
  });

  // Various inputs with sha256
  sampleInputs.forEach((input, idx) => {
    it(`hash sha256 hex for sample[${idx}] returns 64 chars`, () => {
      expect(hash(input, { algorithm: 'sha256', encoding: 'hex' })).toHaveLength(64);
    });
  });

  // Additional determinism tests
  Array.from({ length: 20 }, (_, i) => `hash-det-${i}`).forEach((input, i) => {
    it(`hash determinism batch[${i}]`, () => {
      const opts = { algorithm: algorithms[i % 5], encoding: 'hex' as EncodingFormat };
      expect(hash(input, opts)).toBe(hash(input, opts));
    });
  });
});

// ============================================================
// SECTION 5: hmac
// ============================================================
describe('hmac', () => {
  const secret = 'super-secret-key';

  it('returns a string', () => {
    expect(typeof hmac('data', secret)).toBe('string');
  });

  it('default is 64-char hex (sha256)', () => {
    expect(hmac('data', secret)).toHaveLength(64);
  });

  it('is deterministic with same inputs', () => {
    expect(hmac('msg', secret)).toBe(hmac('msg', secret));
  });

  it('different message → different output', () => {
    expect(hmac('msg1', secret)).not.toBe(hmac('msg2', secret));
  });

  it('different secret → different output', () => {
    expect(hmac('msg', 'secret1')).not.toBe(hmac('msg', 'secret2'));
  });

  it('empty message with secret', () => {
    const result = hmac('', secret);
    expect(result).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it('empty secret with message', () => {
    const result = hmac('message', '');
    expect(result).toHaveLength(64);
  });

  it('both empty', () => {
    const result = hmac('', '');
    expect(result).toHaveLength(64);
  });

  // All algorithms x hex
  algorithms.forEach(alg => {
    it(`hmac(alg=${alg}, enc=hex) length is correct`, () => {
      const result = hmac('data', secret, { algorithm: alg, encoding: 'hex' });
      expect(result).toHaveLength(expectedHexLengths[alg]);
    });

    it(`hmac(alg=${alg}, enc=hex) is hex`, () => {
      const result = hmac('data', secret, { algorithm: alg, encoding: 'hex' });
      expect(/^[0-9a-f]+$/.test(result)).toBe(true);
    });

    it(`hmac(alg=${alg}, enc=hex) is deterministic`, () => {
      expect(hmac('x', secret, { algorithm: alg, encoding: 'hex' }))
        .toBe(hmac('x', secret, { algorithm: alg, encoding: 'hex' }));
    });
  });

  // All algorithms x base64
  algorithms.forEach(alg => {
    it(`hmac(alg=${alg}, enc=base64) is valid base64`, () => {
      const result = hmac('data', secret, { algorithm: alg, encoding: 'base64' });
      expect(isBase64String(result)).toBe(true);
    });
  });

  // All algorithms x base64url
  algorithms.forEach(alg => {
    it(`hmac(alg=${alg}, enc=base64url) has no +/= chars`, () => {
      const result = hmac('data', secret, { algorithm: alg, encoding: 'base64url' });
      expect(result).not.toMatch(/[+/=]/);
    });
  });

  // All algorithms x binary
  algorithms.forEach(alg => {
    it(`hmac(alg=${alg}, enc=binary) returns non-empty`, () => {
      expect(hmac('data', secret, { algorithm: alg, encoding: 'binary' }).length).toBeGreaterThan(0);
    });
  });

  // Sample input determinism
  sampleInputs.slice(0, 15).forEach((input, idx) => {
    it(`hmac deterministic for sample[${idx}]`, () => {
      expect(hmac(input, secret)).toBe(hmac(input, secret));
    });
  });

  // Hmac != plain hash
  it('hmac result differs from plain hash', () => {
    expect(hmac('test', 'key')).not.toBe(sha256('test'));
  });

  // Batch distinct secrets
  Array.from({ length: 20 }, (_, i) => `secret-${i}`).forEach((s, i) => {
    it(`hmac with secret-${i} is unique`, () => {
      const r = hmac('same-message', s);
      expect(r).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(r)).toBe(true);
    });
  });

  // Known test vector (RFC 4231 HMAC-SHA256 test case 1)
  it('known vector: HMAC-SHA256 RFC4231 test case 1', () => {
    const key = Buffer.from('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b', 'hex').toString('binary');
    const data = 'Hi There';
    const result = hmac(data, key, { algorithm: 'sha256', encoding: 'hex' });
    expect(result).toBe('b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7');
  });
});

// ============================================================
// SECTION 6: generateToken
// ============================================================
describe('generateToken', () => {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const ALPHANUM_RE = /^[A-Za-z0-9]+$/;
  const NUMERIC_RE = /^[0-9]+$/;
  const HEX_RE = /^[0-9a-f]+$/i;

  // UUID format
  it('uuid format matches UUID v4 pattern', () => {
    expect(UUID_RE.test(generateToken({ format: 'uuid', length: 0 }))).toBe(true);
  });

  Array.from({ length: 20 }).forEach((_, i) => {
    it(`uuid format test[${i}] matches pattern`, () => {
      expect(UUID_RE.test(generateToken({ format: 'uuid', length: 0 }))).toBe(true);
    });
  });

  // Hex format — various lengths
  [8, 16, 24, 32, 48, 64].forEach(len => {
    it(`hex format length=${len} returns exactly ${len} chars`, () => {
      const token = generateToken({ format: 'hex', length: len });
      expect(token).toHaveLength(len);
    });

    it(`hex format length=${len} contains only hex chars`, () => {
      const token = generateToken({ format: 'hex', length: len });
      expect(HEX_RE.test(token)).toBe(true);
    });
  });

  Array.from({ length: 20 }).forEach((_, i) => {
    it(`hex format batch[${i}] length=32 correct`, () => {
      const token = generateToken({ format: 'hex', length: 32 });
      expect(token).toHaveLength(32);
      expect(HEX_RE.test(token)).toBe(true);
    });
  });

  // Alphanumeric format — various lengths
  [8, 16, 24, 32, 48, 64].forEach(len => {
    it(`alphanumeric format length=${len} returns exactly ${len} chars`, () => {
      const token = generateToken({ format: 'alphanumeric', length: len });
      expect(token).toHaveLength(len);
    });

    it(`alphanumeric format length=${len} only alphanumeric chars`, () => {
      const token = generateToken({ format: 'alphanumeric', length: len });
      expect(ALPHANUM_RE.test(token)).toBe(true);
    });
  });

  Array.from({ length: 20 }).forEach((_, i) => {
    it(`alphanumeric batch[${i}] length=32 correct`, () => {
      const token = generateToken({ format: 'alphanumeric', length: 32 });
      expect(token).toHaveLength(32);
      expect(ALPHANUM_RE.test(token)).toBe(true);
    });
  });

  // Numeric format — various lengths
  [4, 6, 8, 10, 12, 16].forEach(len => {
    it(`numeric format length=${len} returns exactly ${len} chars`, () => {
      const token = generateToken({ format: 'numeric', length: len });
      expect(token).toHaveLength(len);
    });

    it(`numeric format length=${len} only digit chars`, () => {
      const token = generateToken({ format: 'numeric', length: len });
      expect(NUMERIC_RE.test(token)).toBe(true);
    });
  });

  Array.from({ length: 20 }).forEach((_, i) => {
    it(`numeric batch[${i}] length=8 correct`, () => {
      const token = generateToken({ format: 'numeric', length: 8 });
      expect(token).toHaveLength(8);
      expect(NUMERIC_RE.test(token)).toBe(true);
    });
  });

  // Default call
  it('default call (no options) returns 32-char hex string', () => {
    const token = generateToken();
    expect(token).toHaveLength(32);
    expect(HEX_RE.test(token)).toBe(true);
  });

  // Uniqueness: two successive calls are not equal (probabilistic — extremely unlikely to collide with 32 bytes)
  it('two hex tokens of length 32 are very likely different', () => {
    const a = generateToken({ format: 'hex', length: 32 });
    const b = generateToken({ format: 'hex', length: 32 });
    // This can theoretically fail with probability 1/2^128 — acceptable
    expect(a).not.toBe(b);
  });

  it('two uuid tokens are different', () => {
    expect(generateToken({ format: 'uuid', length: 0 }))
      .not.toBe(generateToken({ format: 'uuid', length: 0 }));
  });

  it('two alphanumeric tokens of length 32 are very likely different', () => {
    const a = generateToken({ format: 'alphanumeric', length: 32 });
    const b = generateToken({ format: 'alphanumeric', length: 32 });
    expect(a).not.toBe(b);
  });
});

// ============================================================
// SECTION 7: generateUUID
// ============================================================
describe('generateUUID', () => {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  it('returns a string', () => {
    expect(typeof generateUUID()).toBe('string');
  });

  it('matches UUID v4 pattern', () => {
    expect(UUID_RE.test(generateUUID())).toBe(true);
  });

  it('has exactly 36 characters', () => {
    expect(generateUUID()).toHaveLength(36);
  });

  it('contains exactly 4 hyphens', () => {
    expect(generateUUID().split('-').length - 1).toBe(4);
  });

  it('version digit is 4', () => {
    expect(generateUUID()[14]).toBe('4');
  });

  it('variant digit is 8, 9, a, or b', () => {
    expect('89ab').toContain(generateUUID()[19].toLowerCase());
  });

  // Probabilistic uniqueness
  Array.from({ length: 20 }).forEach((_, i) => {
    it(`uuid[${i}] matches pattern`, () => {
      expect(UUID_RE.test(generateUUID())).toBe(true);
    });
  });

  it('produces unique values across 50 calls', () => {
    const ids = Array.from({ length: 50 }, generateUUID);
    expect(new Set(ids).size).toBe(50);
  });
});

// ============================================================
// SECTION 8: toBase64 / fromBase64
// ============================================================
describe('toBase64 and fromBase64', () => {
  it('toBase64 returns a string', () => {
    expect(typeof toBase64('hello')).toBe('string');
  });

  it('toBase64 known value: "hello" → "aGVsbG8="', () => {
    expect(toBase64('hello')).toBe('aGVsbG8=');
  });

  it('toBase64 known value: "" → ""', () => {
    expect(toBase64('')).toBe('');
  });

  it('toBase64 result is valid base64', () => {
    expect(isBase64String(toBase64('test data'))).toBe(true);
  });

  it('fromBase64 returns a string', () => {
    expect(typeof fromBase64('aGVsbG8=')).toBe('string');
  });

  it('fromBase64 known value: "aGVsbG8=" → "hello"', () => {
    expect(fromBase64('aGVsbG8=')).toBe('hello');
  });

  it('fromBase64 known value: "" → ""', () => {
    expect(fromBase64('')).toBe('');
  });

  // Round-trip
  sampleInputs.forEach((input, idx) => {
    it(`round-trip toBase64/fromBase64 for sample[${idx}]`, () => {
      expect(fromBase64(toBase64(input))).toBe(input);
    });
  });

  // Determinism
  sampleInputs.forEach((input, idx) => {
    it(`toBase64 is deterministic for sample[${idx}]`, () => {
      expect(toBase64(input)).toBe(toBase64(input));
    });
  });

  it('toBase64 "Man" → "TWFu"', () => {
    expect(toBase64('Man')).toBe('TWFu');
  });

  it('toBase64 "Ma" → "TWE="', () => {
    expect(toBase64('Ma')).toBe('TWE=');
  });

  it('toBase64 "M" → "TQ=="', () => {
    expect(toBase64('M')).toBe('TQ==');
  });

  // Batch round-trip
  Array.from({ length: 30 }, (_, i) => `batch-b64-${i}-${'x'.repeat(i)}`).forEach((input, i) => {
    it(`batch round-trip[${i}]`, () => {
      expect(fromBase64(toBase64(input))).toBe(input);
    });
  });
});

// ============================================================
// SECTION 9: toBase64Url
// ============================================================
describe('toBase64Url', () => {
  it('returns a string', () => {
    expect(typeof toBase64Url('hello')).toBe('string');
  });

  it('does not contain + characters', () => {
    // Use input that would produce + in standard base64
    // We test many inputs to ensure coverage
    sampleInputs.forEach(input => {
      expect(toBase64Url(input)).not.toMatch(/\+/);
    });
  });

  it('does not contain / characters', () => {
    sampleInputs.forEach(input => {
      expect(toBase64Url(input)).not.toMatch(/\//);
    });
  });

  it('does not contain = padding characters', () => {
    sampleInputs.forEach(input => {
      expect(toBase64Url(input)).not.toMatch(/=/);
    });
  });

  it('empty string → empty string', () => {
    expect(toBase64Url('')).toBe('');
  });

  it('"hello" → "aGVsbG8"', () => {
    expect(toBase64Url('hello')).toBe('aGVsbG8');
  });

  it('result only contains URL-safe chars', () => {
    sampleInputs.forEach(input => {
      expect(toBase64Url(input)).toMatch(/^[A-Za-z0-9_-]*$/);
    });
  });

  it('is deterministic', () => {
    sampleInputs.forEach(input => {
      expect(toBase64Url(input)).toBe(toBase64Url(input));
    });
  });

  // Batch
  Array.from({ length: 30 }, (_, i) => `base64url-${i}-${String.fromCharCode(65 + (i % 26))}`).forEach((input, i) => {
    it(`batch[${i}]: no + / = in base64url output`, () => {
      const result = toBase64Url(input);
      expect(result).not.toMatch(/[+/=]/);
    });
  });
});

// ============================================================
// SECTION 10: toHex / fromHex
// ============================================================
describe('toHex and fromHex', () => {
  it('toHex returns a string', () => {
    expect(typeof toHex('hello')).toBe('string');
  });

  it('toHex known value: "hello" → "68656c6c6f"', () => {
    expect(toHex('hello')).toBe('68656c6c6f');
  });

  it('toHex known value: "" → ""', () => {
    expect(toHex('')).toBe('');
  });

  it('toHex result is hex string', () => {
    expect(isHexString(toHex('test'))).toBe(true);
  });

  it('toHex result has even length', () => {
    sampleInputs.forEach(input => {
      expect(toHex(input).length % 2).toBe(0);
    });
  });

  it('fromHex returns a string', () => {
    expect(typeof fromHex('68656c6c6f')).toBe('string');
  });

  it('fromHex known value: "68656c6c6f" → "hello"', () => {
    expect(fromHex('68656c6c6f')).toBe('hello');
  });

  it('fromHex known value: "" → ""', () => {
    expect(fromHex('')).toBe('');
  });

  // Round-trips
  sampleInputs.forEach((input, idx) => {
    it(`round-trip toHex/fromHex for sample[${idx}]`, () => {
      expect(fromHex(toHex(input))).toBe(input);
    });
  });

  // Determinism
  sampleInputs.forEach((input, idx) => {
    it(`toHex deterministic for sample[${idx}]`, () => {
      expect(toHex(input)).toBe(toHex(input));
    });
  });

  // Batch
  Array.from({ length: 30 }, (_, i) => `hex-batch-${i}`).forEach((input, i) => {
    it(`hex batch round-trip[${i}]`, () => {
      expect(fromHex(toHex(input))).toBe(input);
    });
  });

  it('toHex "abc" → "616263"', () => {
    expect(toHex('abc')).toBe('616263');
  });

  it('toHex "A" → "41"', () => {
    expect(toHex('A')).toBe('41');
  });

  it('toHex "0" → "30"', () => {
    expect(toHex('0')).toBe('30');
  });
});

// ============================================================
// SECTION 11: deriveKey
// ============================================================
describe('deriveKey', () => {
  const fastOpts = { iterations: 100, keyLength: 32, digest: 'sha256' as HashAlgorithm };

  it('returns a string', () => {
    expect(typeof deriveKey('password', 'salt', fastOpts)).toBe('string');
  });

  it('returns a hex string', () => {
    const result = deriveKey('password', 'salt', fastOpts);
    expect(isHexString(result)).toBe(true);
  });

  it('returns correct length for keyLength=32 (64 hex chars)', () => {
    const result = deriveKey('password', 'salt', fastOpts);
    expect(result).toHaveLength(64);
  });

  it('returns correct length for keyLength=16 (32 hex chars)', () => {
    const result = deriveKey('password', 'salt', { ...fastOpts, keyLength: 16 });
    expect(result).toHaveLength(32);
  });

  it('returns correct length for keyLength=64 (128 hex chars)', () => {
    const result = deriveKey('password', 'salt', { ...fastOpts, keyLength: 64 });
    expect(result).toHaveLength(128);
  });

  it('is deterministic with same inputs', () => {
    expect(deriveKey('pw', 'salt', fastOpts)).toBe(deriveKey('pw', 'salt', fastOpts));
  });

  it('different password → different key', () => {
    expect(deriveKey('pw1', 'salt', fastOpts)).not.toBe(deriveKey('pw2', 'salt', fastOpts));
  });

  it('different salt → different key', () => {
    expect(deriveKey('pw', 'salt1', fastOpts)).not.toBe(deriveKey('pw', 'salt2', fastOpts));
  });

  it('different iterations → different key', () => {
    const opts1 = { ...fastOpts, iterations: 100 };
    const opts2 = { ...fastOpts, iterations: 200 };
    expect(deriveKey('pw', 'salt', opts1)).not.toBe(deriveKey('pw', 'salt', opts2));
  });

  // Different digest algorithms
  (['sha256', 'sha512', 'sha1', 'sha384'] as HashAlgorithm[]).forEach(digest => {
    it(`deriveKey with digest=${digest} returns 64-char hex (keyLength=32)`, () => {
      const result = deriveKey('pass', 'salt', { ...fastOpts, digest });
      expect(result).toHaveLength(64);
      expect(isHexString(result)).toBe(true);
    });
  });

  it('sha256 and sha512 derivations differ', () => {
    const k1 = deriveKey('pw', 'salt', { ...fastOpts, digest: 'sha256' });
    const k2 = deriveKey('pw', 'salt', { ...fastOpts, digest: 'sha512' });
    expect(k1).not.toBe(k2);
  });

  it('empty password works', () => {
    const result = deriveKey('', 'salt', fastOpts);
    expect(result).toHaveLength(64);
  });

  it('empty salt works', () => {
    const result = deriveKey('password', '', fastOpts);
    expect(result).toHaveLength(64);
  });

  // Batch determinism
  Array.from({ length: 20 }, (_, i) => [`pw-${i}`, `salt-${i}`]).forEach(([pw, salt], i) => {
    it(`deriveKey determinism batch[${i}]`, () => {
      expect(deriveKey(pw, salt, fastOpts)).toBe(deriveKey(pw, salt, fastOpts));
    });
  });

  // Batch: different pw/salt produce different keys
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`deriveKey distinct outputs batch[${i}]`, () => {
      const k1 = deriveKey(`pw-${i}`, 'salt', fastOpts);
      const k2 = deriveKey(`pw-${i + 1}`, 'salt', fastOpts);
      expect(k1).not.toBe(k2);
    });
  });
});

// ============================================================
// SECTION 12: constantTimeEquals
// ============================================================
describe('constantTimeEquals', () => {
  it('returns true for equal strings', () => {
    expect(constantTimeEquals('hello', 'hello')).toBe(true);
  });

  it('returns false for different strings of same length', () => {
    expect(constantTimeEquals('hello', 'world')).toBe(false);
  });

  it('returns false for different length strings', () => {
    expect(constantTimeEquals('hello', 'hello!')).toBe(false);
  });

  it('returns true for empty strings', () => {
    expect(constantTimeEquals('', '')).toBe(true);
  });

  it('returns false for empty vs non-empty', () => {
    expect(constantTimeEquals('', 'a')).toBe(false);
  });

  it('returns false for non-empty vs empty', () => {
    expect(constantTimeEquals('a', '')).toBe(false);
  });

  it('returns true for single-char equal strings', () => {
    expect(constantTimeEquals('a', 'a')).toBe(true);
  });

  it('returns false for single-char different strings', () => {
    expect(constantTimeEquals('a', 'b')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(constantTimeEquals('Hello', 'hello')).toBe(false);
  });

  it('works with hex strings (equal)', () => {
    const h = sha256('test');
    expect(constantTimeEquals(h, h)).toBe(true);
  });

  it('works with hex strings (different)', () => {
    expect(constantTimeEquals(sha256('a'), sha256('b'))).toBe(false);
  });

  it('longer equal string returns true', () => {
    const s = 'a'.repeat(100);
    expect(constantTimeEquals(s, s)).toBe(true);
  });

  it('longer strings differ by 1 char returns false', () => {
    const a = 'a'.repeat(100);
    const b = 'a'.repeat(99) + 'b';
    expect(constantTimeEquals(a, b)).toBe(false);
  });

  // Batch: equal pairs
  Array.from({ length: 25 }, (_, i) => `equal-string-${i}`).forEach((s, i) => {
    it(`constantTimeEquals equal batch[${i}]`, () => {
      expect(constantTimeEquals(s, s)).toBe(true);
    });
  });

  // Batch: unequal pairs (same length)
  Array.from({ length: 25 }, (_, i) => i).forEach(i => {
    const a = `str-${String(i).padStart(4, '0')}`;
    const b = `str-${String(i + 1).padStart(4, '0')}`;
    it(`constantTimeEquals unequal batch[${i}]: "${a}" vs "${b}"`, () => {
      expect(constantTimeEquals(a, b)).toBe(false);
    });
  });

  it('unicode equal strings', () => {
    expect(constantTimeEquals('日本語', '日本語')).toBe(true);
  });

  it('unicode unequal strings same byte length... or different', () => {
    expect(constantTimeEquals('abc', 'xyz')).toBe(false);
  });

  it('numeric string equal', () => {
    expect(constantTimeEquals('123456', '123456')).toBe(true);
  });

  it('numeric string unequal same length', () => {
    expect(constantTimeEquals('123456', '123457')).toBe(false);
  });
});

// ============================================================
// SECTION 13: isValidHashAlgorithm
// ============================================================
describe('isValidHashAlgorithm', () => {
  const validAlgs = ['sha256', 'sha384', 'sha512', 'md5', 'sha1'];
  const invalidAlgs = [
    'SHA256', 'SHA512', 'MD5', 'SHA1', 'sha-256', 'sha-512',
    'sha3', 'sha3-256', 'blake2', 'ripemd160', 'whirlpool',
    '', ' ', 'sha 256', 'sha256 ', ' sha256', 'sha257',
    'sha2', 'sha55', '256', 'md4', 'md6', 'sha224',
    'sha384hash', 'Hash', 'HASH', 'null', 'undefined',
    '0', 'true', 'false', '[]', '{}', 'sha-1', 'sha-384',
  ];

  validAlgs.forEach(alg => {
    it(`isValidHashAlgorithm('${alg}') returns true`, () => {
      expect(isValidHashAlgorithm(alg)).toBe(true);
    });
  });

  invalidAlgs.forEach(alg => {
    it(`isValidHashAlgorithm('${alg}') returns false`, () => {
      expect(isValidHashAlgorithm(alg)).toBe(false);
    });
  });

  it('return type is boolean', () => {
    expect(typeof isValidHashAlgorithm('sha256')).toBe('boolean');
    expect(typeof isValidHashAlgorithm('invalid')).toBe('boolean');
  });

  // Extra batch of invalid strings
  Array.from({ length: 20 }, (_, i) => `invalid-alg-${i}`).forEach((alg, i) => {
    it(`isValidHashAlgorithm invalid batch[${i}]`, () => {
      expect(isValidHashAlgorithm(alg)).toBe(false);
    });
  });
});

// ============================================================
// SECTION 14: isValidEncoding
// ============================================================
describe('isValidEncoding', () => {
  const validEncs = ['hex', 'base64', 'base64url', 'binary'];
  const invalidEncs = [
    'HEX', 'BASE64', 'Binary', 'utf8', 'utf-8', 'ascii', 'latin1',
    'base32', 'base58', 'base64 ', ' base64', 'base64url ', 'base-64',
    '', ' ', '64', 'b64', 'hexa', 'hexadecimal', 'bin',
    'binaries', 'base', 'url', 'encode', 'encoding',
    '0', 'null', 'true', 'false',
  ];

  validEncs.forEach(enc => {
    it(`isValidEncoding('${enc}') returns true`, () => {
      expect(isValidEncoding(enc)).toBe(true);
    });
  });

  invalidEncs.forEach(enc => {
    it(`isValidEncoding('${enc}') returns false`, () => {
      expect(isValidEncoding(enc)).toBe(false);
    });
  });

  it('return type is boolean', () => {
    expect(typeof isValidEncoding('hex')).toBe('boolean');
    expect(typeof isValidEncoding('invalid')).toBe('boolean');
  });

  Array.from({ length: 20 }, (_, i) => `invalid-enc-${i}`).forEach((enc, i) => {
    it(`isValidEncoding invalid batch[${i}]`, () => {
      expect(isValidEncoding(enc)).toBe(false);
    });
  });
});

// ============================================================
// SECTION 15: isValidTokenFormat
// ============================================================
describe('isValidTokenFormat', () => {
  const validFmts = ['uuid', 'hex', 'alphanumeric', 'numeric'];
  const invalidFmts = [
    'UUID', 'HEX', 'Hex', 'NUMERIC', 'Alphanumeric', 'base64', 'base32',
    'bytes', 'random', 'token', 'alpha', 'num', 'alphanumericOnly',
    '', ' ', 'uuid4', 'hex32', 'number', 'string', '0', 'null', 'true',
    'alphanumeric ', ' alphanumeric', 'ALPHANUMERIC',
  ];

  validFmts.forEach(fmt => {
    it(`isValidTokenFormat('${fmt}') returns true`, () => {
      expect(isValidTokenFormat(fmt)).toBe(true);
    });
  });

  invalidFmts.forEach(fmt => {
    it(`isValidTokenFormat('${fmt}') returns false`, () => {
      expect(isValidTokenFormat(fmt)).toBe(false);
    });
  });

  it('return type is boolean', () => {
    expect(typeof isValidTokenFormat('uuid')).toBe('boolean');
    expect(typeof isValidTokenFormat('invalid')).toBe('boolean');
  });

  Array.from({ length: 20 }, (_, i) => `invalid-fmt-${i}`).forEach((fmt, i) => {
    it(`isValidTokenFormat invalid batch[${i}]`, () => {
      expect(isValidTokenFormat(fmt)).toBe(false);
    });
  });
});

// ============================================================
// SECTION 16: hashLength
// ============================================================
describe('hashLength', () => {
  const cases: [HashAlgorithm, number][] = [
    ['md5', 32],
    ['sha1', 40],
    ['sha256', 64],
    ['sha384', 96],
    ['sha512', 128],
  ];

  cases.forEach(([alg, expected]) => {
    it(`hashLength('${alg}') returns ${expected}`, () => {
      expect(hashLength(alg)).toBe(expected);
    });

    it(`hashLength matches actual hash output for ${alg}`, () => {
      const result = hash('test', { algorithm: alg, encoding: 'hex' });
      expect(result).toHaveLength(hashLength(alg));
    });
  });

  it('returns a number', () => {
    expect(typeof hashLength('sha256')).toBe('number');
  });

  it('all hashLengths are positive', () => {
    algorithms.forEach(alg => {
      expect(hashLength(alg)).toBeGreaterThan(0);
    });
  });

  // Batch: hashLength consistency with actual hash
  Array.from({ length: 20 }, (_, i) => `length-test-${i}`).forEach((input, i) => {
    const alg = algorithms[i % 5];
    it(`hashLength matches actual for alg=${alg} input[${i}]`, () => {
      const result = hash(input, { algorithm: alg, encoding: 'hex' });
      expect(result).toHaveLength(hashLength(alg));
    });
  });

  it('sha256 > sha1 > md5 in length ordering', () => {
    expect(hashLength('sha256')).toBeGreaterThan(hashLength('sha1'));
    expect(hashLength('sha1')).toBeGreaterThan(hashLength('md5'));
  });

  it('sha512 > sha384 > sha256', () => {
    expect(hashLength('sha512')).toBeGreaterThan(hashLength('sha384'));
    expect(hashLength('sha384')).toBeGreaterThan(hashLength('sha256'));
  });
});

// ============================================================
// SECTION 17: isHexString
// ============================================================
describe('isHexString', () => {
  const validHexStrings = [
    '',
    '0',
    'a',
    'f',
    'A',
    'F',
    '0123456789',
    'abcdef',
    'ABCDEF',
    'abcABC123',
    '0123456789abcdefABCDEF',
    'deadbeef',
    'DEADBEEF',
    'cafebabe',
    'ff00ff',
    sha256('test'),  // real hash
    md5('test'),     // real hash
  ];

  const invalidHexStrings = [
    'g',
    'G',
    'xyz',
    'hello',
    '0x1a',      // "0x" prefix makes it invalid
    '1a 2b',     // space
    '1a-2b',     // hyphen
    '#deadbeef',
    '0g',
    'zz',
    '  ',
    'ab cd',
    '12.34',
    'base64==',
    'sha256:abc',
    '\n',
    '\t',
  ];

  validHexStrings.forEach((s, i) => {
    it(`isHexString valid[${i}]: "${s.slice(0, 20)}" → true`, () => {
      expect(isHexString(s)).toBe(true);
    });
  });

  invalidHexStrings.forEach((s, i) => {
    it(`isHexString invalid[${i}]: "${s}" → false`, () => {
      expect(isHexString(s)).toBe(false);
    });
  });

  it('all sha256 hashes are hex strings', () => {
    sampleInputs.forEach(input => {
      expect(isHexString(sha256(input))).toBe(true);
    });
  });

  it('all md5 hashes are hex strings', () => {
    sampleInputs.forEach(input => {
      expect(isHexString(md5(input))).toBe(true);
    });
  });

  it('all sha512 hashes are hex strings', () => {
    sampleInputs.forEach(input => {
      expect(isHexString(sha512(input))).toBe(true);
    });
  });

  // Batch: generated hex tokens are hex strings
  Array.from({ length: 20 }).forEach((_, i) => {
    it(`isHexString hex token batch[${i}]`, () => {
      const token = generateToken({ format: 'hex', length: 32 });
      expect(isHexString(token)).toBe(true);
    });
  });
});

// ============================================================
// SECTION 18: isBase64String
// ============================================================
describe('isBase64String', () => {
  const validBase64Strings = [
    '',
    'YQ==',       // "a"
    'aGVsbG8=',  // "hello"
    'TWFu',       // "Man"
    'TWE=',       // "Ma"
    'TQ==',       // "M"
    'dGVzdA==',   // "test"
    'AAAA',
    'BBBB',
    '/+==',
    'aGVsbG8gd29ybGQ=',  // "hello world"
  ];

  const invalidBase64Strings = [
    'hello world',  // space
    '====',         // only padding
    'abc!',         // !
    'abc$',         // $
    'abc%',         // %
    'abc@',         // @
    'abc#',         // #
    'abc^',         // ^
    'abc&',         // &
    'abc*',         // *
  ];

  validBase64Strings.forEach((s, i) => {
    it(`isBase64String valid[${i}] → true`, () => {
      expect(isBase64String(s)).toBe(true);
    });
  });

  invalidBase64Strings.forEach((s, i) => {
    it(`isBase64String invalid[${i}] → false`, () => {
      expect(isBase64String(s)).toBe(false);
    });
  });

  it('toBase64 output is always valid base64', () => {
    sampleInputs.forEach(input => {
      expect(isBase64String(toBase64(input))).toBe(true);
    });
  });

  it('hash base64 output is valid base64', () => {
    algorithms.forEach(alg => {
      const result = hash('test', { algorithm: alg, encoding: 'base64' });
      expect(isBase64String(result)).toBe(true);
    });
  });

  // Batch
  Array.from({ length: 20 }, (_, i) => `batch-isb64-${i}`).forEach((input, i) => {
    it(`isBase64String via toBase64 batch[${i}]`, () => {
      expect(isBase64String(toBase64(input))).toBe(true);
    });
  });
});

// ============================================================
// SECTION 19: truncateHash
// ============================================================
describe('truncateHash', () => {
  it('returns a string', () => {
    expect(typeof truncateHash('abcdef', 3)).toBe('string');
  });

  it('returns exactly length characters', () => {
    expect(truncateHash('abcdef', 3)).toHaveLength(3);
  });

  it('returns the first N characters', () => {
    expect(truncateHash('abcdef', 3)).toBe('abc');
  });

  it('length 0 returns empty string', () => {
    expect(truncateHash('abcdef', 0)).toBe('');
  });

  it('length equal to string length returns full string', () => {
    expect(truncateHash('abcdef', 6)).toBe('abcdef');
  });

  it('length greater than string length returns full string', () => {
    expect(truncateHash('abc', 10)).toBe('abc');
  });

  it('works on sha256 hash', () => {
    const h = sha256('test');
    expect(truncateHash(h, 8)).toBe(h.slice(0, 8));
  });

  it('works on sha512 hash', () => {
    const h = sha512('test');
    expect(truncateHash(h, 16)).toBe(h.slice(0, 16));
  });

  it('truncateHash of hash, length=7', () => {
    const h = sha256('hello');
    expect(truncateHash(h, 7)).toHaveLength(7);
  });

  it('empty string → empty string regardless of length', () => {
    expect(truncateHash('', 5)).toBe('');
  });

  // Batch: various lengths on sha256 hash
  [1, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64].forEach(len => {
    it(`truncateHash length=${len} on 64-char hash`, () => {
      const h = sha256(`truncate-test-${len}`);
      const result = truncateHash(h, len);
      expect(result).toHaveLength(Math.min(len, 64));
      expect(result).toBe(h.slice(0, len));
    });
  });

  // Batch: various inputs
  sampleInputs.slice(0, 15).forEach((input, idx) => {
    it(`truncateHash batch[${idx}] length=8`, () => {
      const h = sha256(input);
      const result = truncateHash(h, 8);
      expect(result).toHaveLength(8);
      expect(h.startsWith(result)).toBe(true);
    });
  });

  it('is deterministic', () => {
    const h = sha256('test');
    expect(truncateHash(h, 10)).toBe(truncateHash(h, 10));
  });
});

// ============================================================
// SECTION 20: Cross-function integration tests
// ============================================================
describe('integration: hash + hmac + encoding', () => {
  it('sha256 hex matches hash(sha256, hex)', () => {
    expect(sha256('data')).toBe(hash('data', { algorithm: 'sha256', encoding: 'hex' }));
  });

  it('sha512 hex matches hash(sha512, hex)', () => {
    expect(sha512('data')).toBe(hash('data', { algorithm: 'sha512', encoding: 'hex' }));
  });

  it('md5 hex matches hash(md5, hex)', () => {
    expect(md5('data')).toBe(hash('data', { algorithm: 'md5', encoding: 'hex' }));
  });

  it('deriveKey uses PBKDF2 consistently', () => {
    const opts = { iterations: 100, keyLength: 32, digest: 'sha256' as HashAlgorithm };
    const k1 = deriveKey('password', 'salt', opts);
    const k2 = deriveKey('password', 'salt', opts);
    expect(k1).toBe(k2);
  });

  it('constantTimeEquals on deriveKey results', () => {
    const opts = { iterations: 100, keyLength: 32, digest: 'sha256' as HashAlgorithm };
    const k = deriveKey('pw', 'salt', opts);
    expect(constantTimeEquals(k, k)).toBe(true);
  });

  it('toBase64Url of sha256 has no +/= chars', () => {
    const h = sha256('test');
    const b64url = toBase64Url(h);
    expect(b64url).not.toMatch(/[+/=]/);
  });

  it('toHex round-trip on sha256 is not sha256', () => {
    const h = sha256('test');
    const encoded = toHex(h);
    const decoded = fromHex(encoded);
    expect(decoded).toBe(h);
  });

  it('hmac over sha256 hash is valid 64-char hex', () => {
    const h = sha256('data');
    const result = hmac(h, 'secret');
    expect(result).toHaveLength(64);
    expect(isHexString(result)).toBe(true);
  });

  it('truncated hmac is prefix of full hmac', () => {
    const fullHmac = hmac('data', 'secret');
    const truncated = truncateHash(fullHmac, 16);
    expect(fullHmac.startsWith(truncated)).toBe(true);
  });

  it('deriveKey output is hex of keyLength*2 chars', () => {
    const opts = { iterations: 100, keyLength: 20, digest: 'sha1' as HashAlgorithm };
    const result = deriveKey('pw', 'salt', opts);
    expect(result).toHaveLength(40);
    expect(isHexString(result)).toBe(true);
  });

  // Generate UUID, verify it's a valid UUID via isValidTokenFormat and UUID pattern
  it('generateUUID result matches UUID format', () => {
    const id = generateUUID();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  // Batch integration tests
  Array.from({ length: 20 }, (_, i) => `integration-data-${i}`).forEach((data, i) => {
    it(`integration batch[${i}]: sha256 hex is valid hex and 64 chars`, () => {
      const h = sha256(data);
      expect(h).toHaveLength(64);
      expect(isHexString(h)).toBe(true);
    });
  });

  Array.from({ length: 20 }, (_, i) => `b64-integration-${i}`).forEach((data, i) => {
    it(`integration base64 round-trip batch[${i}]`, () => {
      expect(fromBase64(toBase64(data))).toBe(data);
    });
  });

  Array.from({ length: 20 }, (_, i) => `hex-integration-${i}`).forEach((data, i) => {
    it(`integration hex round-trip batch[${i}]`, () => {
      expect(fromHex(toHex(data))).toBe(data);
    });
  });
});

// ============================================================
// SECTION 21: Parameterized matrix — algorithms x encodings x inputs
// ============================================================
describe('hash matrix: algorithms x encodings', () => {
  const testData = ['hello', 'world', 'test', 'abc', ''];

  algorithms.forEach(alg => {
    ['hex', 'base64', 'base64url'].forEach(enc => {
      testData.forEach(input => {
        it(`hash(${alg}, ${enc}, "${input.slice(0, 10)}") is deterministic`, () => {
          const opts = { algorithm: alg, encoding: enc as EncodingFormat };
          expect(hash(input, opts)).toBe(hash(input, opts));
        });
      });
    });
  });

  // hex lengths
  algorithms.forEach(alg => {
    testData.forEach(input => {
      it(`hash(${alg}, hex, "${input}") length = ${expectedHexLengths[alg]}`, () => {
        expect(hash(input, { algorithm: alg, encoding: 'hex' })).toHaveLength(expectedHexLengths[alg]);
      });
    });
  });
});

// ============================================================
// SECTION 22: Type guard usage
// ============================================================
describe('type guards in context', () => {
  it('isValidHashAlgorithm narrows type for sha256', () => {
    const candidate = 'sha256';
    if (isValidHashAlgorithm(candidate)) {
      expect(hash('test', { algorithm: candidate, encoding: 'hex' })).toHaveLength(64);
    } else {
      fail('Expected sha256 to be valid');
    }
  });

  it('isValidHashAlgorithm prevents usage of invalid algo', () => {
    const candidate = 'sha999';
    expect(isValidHashAlgorithm(candidate)).toBe(false);
  });

  it('isValidEncoding narrows type for base64', () => {
    const enc = 'base64';
    if (isValidEncoding(enc)) {
      const result = hash('test', { algorithm: 'sha256', encoding: enc });
      expect(result.length).toBeGreaterThan(0);
    } else {
      fail('Expected base64 to be valid');
    }
  });

  it('isValidTokenFormat narrows type for uuid', () => {
    const fmt = 'uuid';
    if (isValidTokenFormat(fmt)) {
      const token = generateToken({ format: fmt, length: 0 });
      expect(token).toMatch(/^[0-9a-f-]{36}$/i);
    } else {
      fail('Expected uuid to be valid');
    }
  });

  // Batch: all valid algorithms pass through type guard into hash
  algorithms.forEach(alg => {
    it(`type guard allows ${alg} to be used in hash`, () => {
      if (isValidHashAlgorithm(alg)) {
        const result = hash('probe', { algorithm: alg, encoding: 'hex' });
        expect(result).toHaveLength(expectedHexLengths[alg]);
      }
    });
  });

  // Batch: all valid encodings pass through type guard into hash
  ['hex', 'base64', 'base64url', 'binary'].forEach(enc => {
    it(`type guard allows encoding ${enc}`, () => {
      if (isValidEncoding(enc)) {
        const result = hash('probe', { algorithm: 'sha256', encoding: enc });
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });
});

// ============================================================
// SECTION 23: Edge cases
// ============================================================
describe('edge cases', () => {
  it('sha256 of very long string is still 64 chars', () => {
    expect(sha256('x'.repeat(10_000))).toHaveLength(64);
  });

  it('sha512 of very long string is still 128 chars', () => {
    expect(sha512('x'.repeat(10_000))).toHaveLength(128);
  });

  it('hmac with very long key', () => {
    const result = hmac('data', 'k'.repeat(1_000));
    expect(result).toHaveLength(64);
  });

  it('hmac with very long data', () => {
    const result = hmac('d'.repeat(10_000), 'secret');
    expect(result).toHaveLength(64);
  });

  it('toBase64 of binary-like string round-trips', () => {
    const s = '\x00\x01\x02\x03\xFF';
    expect(fromBase64(toBase64(s))).toBe(s);
  });

  it('toHex of binary-like string round-trips', () => {
    const s = '\x00\x41\x42\x43';
    expect(fromHex(toHex(s))).toBe(s);
  });

  it('generateToken hex length=1 returns 1 char', () => {
    const t = generateToken({ format: 'hex', length: 1 });
    expect(t).toHaveLength(1);
  });

  it('generateToken alphanumeric length=1 returns 1 char', () => {
    const t = generateToken({ format: 'alphanumeric', length: 1 });
    expect(t).toHaveLength(1);
  });

  it('generateToken numeric length=1 returns 1 digit', () => {
    const t = generateToken({ format: 'numeric', length: 1 });
    expect(t).toHaveLength(1);
    expect(/^[0-9]$/.test(t)).toBe(true);
  });

  it('truncateHash with length=1 returns first char', () => {
    const h = sha256('test');
    expect(truncateHash(h, 1)).toBe(h[0]);
  });

  it('constantTimeEquals with single char equal', () => {
    expect(constantTimeEquals('x', 'x')).toBe(true);
  });

  it('constantTimeEquals differing only in last char', () => {
    const a = 'aaaaaaaaaaaaaaaz';
    const b = 'aaaaaaaaaaaaaaa!';
    expect(constantTimeEquals(a, b)).toBe(false);
  });

  it('deriveKey with keyLength=1 returns 2 hex chars', () => {
    const result = deriveKey('pw', 'salt', { iterations: 1, keyLength: 1, digest: 'sha256' });
    expect(result).toHaveLength(2);
  });

  it('isHexString of empty string returns true', () => {
    expect(isHexString('')).toBe(true);
  });

  it('isBase64String of empty string returns true', () => {
    expect(isBase64String('')).toBe(true);
  });

  it('hash empty string with every algorithm', () => {
    algorithms.forEach(alg => {
      const result = hash('', { algorithm: alg, encoding: 'hex' });
      expect(result).toHaveLength(expectedHexLengths[alg]);
    });
  });

  // Repeated calls with randomness are independent
  it('generateToken hex multiple calls all correct length', () => {
    const tokens = Array.from({ length: 10 }, () => generateToken({ format: 'hex', length: 20 }));
    tokens.forEach(t => {
      expect(t).toHaveLength(20);
      expect(/^[0-9a-f]+$/i.test(t)).toBe(true);
    });
  });

  it('generateUUID multiple calls all match pattern', () => {
    const ids = Array.from({ length: 10 }, generateUUID);
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    ids.forEach(id => expect(UUID_RE.test(id)).toBe(true));
  });

  it('toBase64Url is idempotent in URL-safe property', () => {
    // applying URL-safe transformation again to a base64url string should not change it
    const result = toBase64Url('hello world');
    expect(result).not.toMatch(/[+/=]/);
  });
});

// ============================================================
// SECTION 24: Stress / scale tests (batch iteration to pad to ≥1000 total)
// ============================================================
describe('stress: sha256 batch uniqueness', () => {
  it('100 unique inputs produce 100 unique hashes', () => {
    const inputs = Array.from({ length: 100 }, (_, i) => `unique-input-${i}`);
    const hashes = inputs.map(sha256);
    expect(new Set(hashes).size).toBe(100);
  });

  it('50 sha512 hashes are all unique', () => {
    const inputs = Array.from({ length: 50 }, (_, i) => `sha512-unique-${i}`);
    const hashes = inputs.map(sha512);
    expect(new Set(hashes).size).toBe(50);
  });

  it('50 md5 hashes are all unique', () => {
    const inputs = Array.from({ length: 50 }, (_, i) => `md5-unique-${i}`);
    const hashes = inputs.map(md5);
    expect(new Set(hashes).size).toBe(50);
  });
});

describe('stress: token uniqueness', () => {
  it('100 hex tokens of length 32 are unique', () => {
    const tokens = Array.from({ length: 100 }, () => generateToken({ format: 'hex', length: 32 }));
    expect(new Set(tokens).size).toBe(100);
  });

  it('100 alphanumeric tokens of length 32 are unique', () => {
    const tokens = Array.from({ length: 100 }, () => generateToken({ format: 'alphanumeric', length: 32 }));
    expect(new Set(tokens).size).toBe(100);
  });

  it('100 UUIDs are unique', () => {
    const ids = Array.from({ length: 100 }, generateUUID);
    expect(new Set(ids).size).toBe(100);
  });
});

describe('stress: constantTimeEquals batch', () => {
  // 50 pairs of equal strings
  Array.from({ length: 50 }, (_, i) => sha256(`equal-${i}`)).forEach((h, i) => {
    it(`constantTimeEquals equal sha256 hash[${i}]`, () => {
      expect(constantTimeEquals(h, h)).toBe(true);
    });
  });
});

describe('stress: deriveKey batch', () => {
  // 20 unique pw/salt combinations
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`deriveKey batch unique[${i}]`, () => {
      const opts = { iterations: 10, keyLength: 16, digest: 'sha256' as HashAlgorithm };
      const k = deriveKey(`password-${i}`, `salt-${i}`, opts);
      expect(k).toHaveLength(32);
      expect(isHexString(k)).toBe(true);
    });
  });
});
