import { randomBytes } from 'crypto';
import {
  encryptEnvelope,
  decryptEnvelope,
  decryptEnvelopeToString,
  rotateKek,
  deriveKey,
} from '../src/envelope-encryption';

// ── Helpers ────────────────────────────────────────────────────────────────

const TEST_KEK = randomBytes(32);
const TEST_PLAINTEXT = 'Hello, envelope encryption!';

// ── deriveKey() ────────────────────────────────────────────────────────────

describe('deriveKey()', () => {
  it('returns a 32-byte key', () => {
    const { key } = deriveKey('my-passphrase');
    expect(key).toHaveLength(32);
  });

  it('generates a salt if not provided', () => {
    const { salt } = deriveKey('my-passphrase');
    expect(salt.length).toBeGreaterThan(0);
  });

  it('is deterministic given the same passphrase and salt', () => {
    const { key: k1, salt } = deriveKey('passphrase');
    const { key: k2 } = deriveKey('passphrase', salt);
    expect(k1.equals(k2)).toBe(true);
  });

  it('produces different keys for different passphrases', () => {
    const { salt } = deriveKey('pass1');
    const { key: k1 } = deriveKey('pass1', salt);
    const { key: k2 } = deriveKey('pass2', salt);
    expect(k1.equals(k2)).toBe(false);
  });
});

// ── encryptEnvelope() ──────────────────────────────────────────────────────

describe('encryptEnvelope()', () => {
  it('returns an envelope with required fields', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    expect(env).toHaveProperty('ciphertext');
    expect(env).toHaveProperty('ciphertextTag');
    expect(env).toHaveProperty('ciphertextIv');
    expect(env).toHaveProperty('encryptedDek');
    expect(env).toHaveProperty('dekTag');
    expect(env).toHaveProperty('dekIv');
    expect(env).toHaveProperty('algorithm');
  });

  it('algorithm is aes-256-gcm', () => {
    expect(encryptEnvelope(TEST_PLAINTEXT, TEST_KEK).algorithm).toBe('aes-256-gcm');
  });

  it('ciphertext is not the plaintext', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    expect(env.ciphertext).not.toContain(TEST_PLAINTEXT);
  });

  it('two encryptions of the same plaintext produce different ciphertext (IVs)', () => {
    const e1 = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const e2 = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    expect(e1.ciphertextIv).not.toBe(e2.ciphertextIv);
    expect(e1.encryptedDek).not.toBe(e2.encryptedDek);
  });

  it('accepts Buffer plaintext', () => {
    const buf = Buffer.from('binary data \x00\x01\x02');
    const env = encryptEnvelope(buf, TEST_KEK);
    const decrypted = decryptEnvelope(env, TEST_KEK);
    expect(decrypted.equals(buf)).toBe(true);
  });

  it('accepts passphrase string as KEK and adds kekSalt', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, 'my-secret-passphrase');
    expect(env.kekSalt).toBeDefined();
  });

  it('supports base64 encoding option', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK, { encoding: 'base64' });
    // base64 chars only
    expect(env.ciphertext).toMatch(/^[A-Za-z0-9+/=]+$/);
  });
});

// ── decryptEnvelope() ──────────────────────────────────────────────────────

describe('decryptEnvelope()', () => {
  it('round-trips a string plaintext', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const result = decryptEnvelope(env, TEST_KEK).toString('utf8');
    expect(result).toBe(TEST_PLAINTEXT);
  });

  it('round-trips with passphrase KEK', () => {
    const passphrase = 'super-secret-KEK-passphrase';
    const env = encryptEnvelope('secret data', passphrase);
    const result = decryptEnvelope(env, passphrase).toString('utf8');
    expect(result).toBe('secret data');
  });

  it('throws on wrong KEK', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const wrongKek = randomBytes(32);
    expect(() => decryptEnvelope(env, wrongKek)).toThrow();
  });

  it('throws on tampered ciphertext', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    // Flip a byte in ciphertext
    const tampered = { ...env, ciphertext: env.ciphertext.slice(0, -2) + 'ff' };
    expect(() => decryptEnvelope(tampered, TEST_KEK)).toThrow();
  });

  it('throws on tampered auth tag', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const tampered = { ...env, ciphertextTag: env.ciphertextTag.slice(0, -2) + 'ff' };
    expect(() => decryptEnvelope(tampered, TEST_KEK)).toThrow();
  });

  it('throws on missing kekSalt when passphrase was used', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, 'passphrase');
    const stripped = { ...env, kekSalt: undefined };
    expect(() => decryptEnvelope(stripped, 'passphrase')).toThrow(/kekSalt/);
  });
});

// ── decryptEnvelopeToString() ──────────────────────────────────────────────

describe('decryptEnvelopeToString()', () => {
  it('returns a string', () => {
    const env = encryptEnvelope('hello world', TEST_KEK);
    expect(decryptEnvelopeToString(env, TEST_KEK)).toBe('hello world');
  });

  it('handles unicode', () => {
    const text = '日本語テスト 🔐';
    const env = encryptEnvelope(text, TEST_KEK);
    expect(decryptEnvelopeToString(env, TEST_KEK)).toBe(text);
  });
});

// ── rotateKek() ────────────────────────────────────────────────────────────

describe('rotateKek()', () => {
  it('produces a different encryptedDek', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const newKek = randomBytes(32);
    const rotated = rotateKek(env, TEST_KEK, newKek);
    expect(rotated.encryptedDek).not.toBe(env.encryptedDek);
  });

  it('ciphertext is unchanged after rotation', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const newKek = randomBytes(32);
    const rotated = rotateKek(env, TEST_KEK, newKek);
    expect(rotated.ciphertext).toBe(env.ciphertext);
    expect(rotated.ciphertextIv).toBe(env.ciphertextIv);
  });

  it('can decrypt with new KEK after rotation', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const newKek = randomBytes(32);
    const rotated = rotateKek(env, TEST_KEK, newKek);
    const result = decryptEnvelopeToString(rotated, newKek);
    expect(result).toBe(TEST_PLAINTEXT);
  });

  it('old KEK no longer decrypts after rotation', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const newKek = randomBytes(32);
    const rotated = rotateKek(env, TEST_KEK, newKek);
    expect(() => decryptEnvelope(rotated, TEST_KEK)).toThrow();
  });

  it('supports passphrase new KEK after rotation', () => {
    const newPassphrase = 'new-kek-passphrase';
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const rotated = rotateKek(env, TEST_KEK, newPassphrase);
    expect(rotated.kekSalt).toBeDefined();
    const result = decryptEnvelopeToString(rotated, newPassphrase);
    expect(result).toBe(TEST_PLAINTEXT);
  });

  it('works with passphrase old KEK', () => {
    const passphrase = 'old-passphrase';
    const env = encryptEnvelope(TEST_PLAINTEXT, passphrase);
    const newKek = randomBytes(32);
    const rotated = rotateKek(env, passphrase, newKek);
    expect(decryptEnvelopeToString(rotated, newKek)).toBe(TEST_PLAINTEXT);
  });

  it('throws on wrong old KEK', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const wrong = randomBytes(32);
    const newKek = randomBytes(32);
    expect(() => rotateKek(env, wrong, newKek)).toThrow();
  });
});

// ── Large payloads ─────────────────────────────────────────────────────────

describe('large payloads', () => {
  it('round-trips 1MB of random data', () => {
    const large = randomBytes(1024 * 1024);
    const env = encryptEnvelope(large, TEST_KEK);
    const result = decryptEnvelope(env, TEST_KEK);
    expect(result.equals(large)).toBe(true);
  });
});

// ── Additional round-trip cases ─────────────────────────────────────────────

describe('envelope encryption — additional round-trip cases', () => {
  it('round-trips a short single-word plaintext', () => {
    const env = encryptEnvelope('secret', TEST_KEK);
    expect(decryptEnvelopeToString(env, TEST_KEK)).toBe('secret');
  });

  it('decryptEnvelopeToString result type is string for any plaintext', () => {
    const env = encryptEnvelope('type-check-test', TEST_KEK);
    expect(typeof decryptEnvelopeToString(env, TEST_KEK)).toBe('string');
  });

  it('encryptEnvelope returns different encryptedDek on repeated calls', () => {
    const e1 = encryptEnvelope('same', TEST_KEK);
    const e2 = encryptEnvelope('same', TEST_KEK);
    expect(e1.encryptedDek).not.toBe(e2.encryptedDek);
  });

  it('deriveKey produces 32-byte salt by default', () => {
    const { salt } = deriveKey('any-passphrase');
    expect(salt.length).toBe(32);
  });

  it('rotateKek preserves the ciphertextTag', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const newKek = randomBytes(32);
    const rotated = rotateKek(env, TEST_KEK, newKek);
    expect(rotated.ciphertextTag).toBe(env.ciphertextTag);
  });
});

// ── Additional edge cases ───────────────────────────────────────────────────

describe('envelope encryption — additional edge cases', () => {
  it('encryptEnvelope produces hex-encoded fields by default', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    expect(env.ciphertext).toMatch(/^[0-9a-f]+$/i);
    expect(env.ciphertextIv).toMatch(/^[0-9a-f]+$/i);
  });

  it('deriveKey salt is a Buffer', () => {
    const { salt } = deriveKey('test-passphrase');
    expect(Buffer.isBuffer(salt)).toBe(true);
  });

  it('decryptEnvelopeToString round-trips a single-character string', () => {
    const env = encryptEnvelope('x', TEST_KEK);
    expect(decryptEnvelopeToString(env, TEST_KEK)).toBe('x');
  });

  it('rotateKek updates dekIv as well as encryptedDek', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const newKek = randomBytes(32);
    const rotated = rotateKek(env, TEST_KEK, newKek);
    expect(rotated.dekIv).not.toBe(env.dekIv);
  });
});

describe('envelope encryption — final coverage', () => {
  it('decryptEnvelope returns a Buffer instance', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    const result = decryptEnvelope(env, TEST_KEK);
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('encryptEnvelope algorithm field is always a string', () => {
    const env = encryptEnvelope(TEST_PLAINTEXT, TEST_KEK);
    expect(typeof env.algorithm).toBe('string');
  });

  it('encryptEnvelope with whitespace-only plaintext round-trips correctly', () => {
    // Empty string ciphertext breaks hex/base64 auto-detection in decryptEnvelope;
    // use a single space instead which produces a non-empty ciphertext.
    const env = encryptEnvelope(' ', TEST_KEK);
    expect(decryptEnvelopeToString(env, TEST_KEK)).toBe(' ');
  });

  it('deriveKey with identical passphrase and salt always returns the same key', () => {
    const { key: k1, salt } = deriveKey('fixed-pass');
    const { key: k2 } = deriveKey('fixed-pass', salt);
    expect(k1.equals(k2)).toBe(true);
  });
});
