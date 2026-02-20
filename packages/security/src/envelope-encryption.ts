/**
 * Envelope Encryption
 *
 * Standard two-layer encryption pattern:
 *   1. Data Encryption Key (DEK) — unique AES-256-GCM key per plaintext
 *   2. Key Encryption Key (KEK) — master key that wraps the DEK
 *
 * The encrypted DEK is stored alongside the ciphertext, so the KEK
 * only needs to be available at encrypt/decrypt time. This enables:
 *   - DEK rotation without re-encrypting data (re-wrap DEK with new KEK)
 *   - Efficient key revocation (revoke KEK without touching data)
 *
 * Uses Node.js built-in `crypto` — no external dependencies.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// ── Constants ──────────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm' as const;
const KEY_LENGTH = 32;    // 256 bits
const IV_LENGTH = 12;     // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const SCRYPT_N = 16384;   // CPU/memory cost (2^14)
const SCRYPT_R = 8;
const SCRYPT_P = 1;

// ── Types ──────────────────────────────────────────────────────────────────

export interface EnvelopeOptions {
  /**
   * Encoding for the output envelope fields.
   * 'hex' (default) is URL-safe; 'base64' is more compact.
   */
  encoding?: 'hex' | 'base64';
}

export interface EncryptedEnvelope {
  /** Encrypted data (DEK-encrypted) */
  ciphertext: string;
  /** Authentication tag for ciphertext */
  ciphertextTag: string;
  /** IV used to encrypt the data */
  ciphertextIv: string;
  /** DEK encrypted with the KEK */
  encryptedDek: string;
  /** Authentication tag for the encrypted DEK */
  dekTag: string;
  /** IV used to encrypt the DEK */
  dekIv: string;
  /** Salt used to derive the KEK (if kek was a passphrase) */
  kekSalt?: string;
  /** Algorithm identifier for future-proofing */
  algorithm: string;
}

export interface KeyRotationResult {
  /** The same envelope but with a new encryptedDek and dekIv/dekTag */
  rotatedEnvelope: EncryptedEnvelope;
  /** The raw DEK (for audit purposes — handle with care) */
  dek: Buffer;
}

// ── Key Derivation ─────────────────────────────────────────────────────────

/**
 * Derive a 256-bit key from a passphrase using scrypt.
 * Returns both the key and the salt (salt is generated if not provided).
 */
export function deriveKey(passphrase: string | Buffer, salt?: Buffer): { key: Buffer; salt: Buffer } {
  const s = salt ?? randomBytes(SALT_LENGTH);
  const key = scryptSync(passphrase, s, KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return { key, salt: s };
}

// ── Primitive Encrypt / Decrypt ────────────────────────────────────────────

function aesgcmEncrypt(plaintext: Buffer, key: Buffer): { ciphertext: Buffer; iv: Buffer; tag: Buffer } {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: encrypted, iv, tag };
}

function aesgcmDecrypt(ciphertext: Buffer, key: Buffer, iv: Buffer, tag: Buffer): Buffer {
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Encrypt `plaintext` under a fresh randomly-generated DEK,
 * then wrap the DEK with `kek`.
 *
 * @param plaintext - Data to encrypt (string or Buffer)
 * @param kek       - Key Encryption Key (32-byte Buffer) or passphrase string
 * @param opts      - Optional encoding
 */
export function encryptEnvelope(
  plaintext: string | Buffer,
  kek: Buffer | string,
  opts: EnvelopeOptions = {}
): EncryptedEnvelope {
  const enc = opts.encoding ?? 'hex';

  // 1. Resolve / derive KEK
  let kekBuf: Buffer;
  let kekSalt: Buffer | undefined;
  if (typeof kek === 'string') {
    const derived = deriveKey(kek);
    kekBuf = derived.key;
    kekSalt = derived.salt;
  } else {
    kekBuf = kek;
  }

  // 2. Generate a fresh DEK
  const dek = randomBytes(KEY_LENGTH);

  // 3. Encrypt plaintext with DEK
  const plaintextBuf = typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf8') : plaintext;
  const { ciphertext, iv: ciphertextIv, tag: ciphertextTag } = aesgcmEncrypt(plaintextBuf, dek);

  // 4. Encrypt DEK with KEK
  const { ciphertext: encryptedDek, iv: dekIv, tag: dekTag } = aesgcmEncrypt(dek, kekBuf);

  return {
    ciphertext:     ciphertext.toString(enc),
    ciphertextTag:  ciphertextTag.toString(enc),
    ciphertextIv:   ciphertextIv.toString(enc),
    encryptedDek:   encryptedDek.toString(enc),
    dekTag:         dekTag.toString(enc),
    dekIv:          dekIv.toString(enc),
    ...(kekSalt ? { kekSalt: kekSalt.toString(enc) } : {}),
    algorithm: ALGORITHM,
  };
}

/**
 * Decrypt an envelope produced by `encryptEnvelope`.
 *
 * @param envelope - The sealed envelope
 * @param kek      - Key Encryption Key (must match the one used to encrypt)
 * @returns Decrypted plaintext as a Buffer
 */
export function decryptEnvelope(
  envelope: EncryptedEnvelope,
  kek: Buffer | string
): Buffer {
  const enc = (envelope.ciphertext.match(/^[0-9a-f]+$/i) ? 'hex' : 'base64') as BufferEncoding;

  // 1. Resolve / derive KEK
  let kekBuf: Buffer;
  if (typeof kek === 'string') {
    if (!envelope.kekSalt) {
      throw new Error('Envelope was encrypted with a derived key but kekSalt is missing');
    }
    const { key } = deriveKey(kek, Buffer.from(envelope.kekSalt, enc));
    kekBuf = key;
  } else {
    kekBuf = kek;
  }

  // 2. Decrypt DEK
  const dek = aesgcmDecrypt(
    Buffer.from(envelope.encryptedDek, enc),
    kekBuf,
    Buffer.from(envelope.dekIv, enc),
    Buffer.from(envelope.dekTag, enc)
  );

  // 3. Decrypt ciphertext
  return aesgcmDecrypt(
    Buffer.from(envelope.ciphertext, enc),
    dek,
    Buffer.from(envelope.ciphertextIv, enc),
    Buffer.from(envelope.ciphertextTag, enc)
  );
}

/**
 * Re-wrap the DEK under a new KEK without touching the ciphertext.
 * Use this for KEK rotation.
 *
 * @param envelope  - The existing envelope
 * @param oldKek    - Current KEK (needed to unwrap the DEK)
 * @param newKek    - Replacement KEK
 */
export function rotateKek(
  envelope: EncryptedEnvelope,
  oldKek: Buffer | string,
  newKek: Buffer | string,
  opts: EnvelopeOptions = {}
): EncryptedEnvelope {
  const enc = (envelope.ciphertext.match(/^[0-9a-f]+$/i) ? 'hex' : 'base64') as BufferEncoding;
  const outEnc = opts.encoding ?? enc;

  // 1. Unwrap old KEK → DEK
  let oldKekBuf: Buffer;
  if (typeof oldKek === 'string') {
    if (!envelope.kekSalt) throw new Error('Missing kekSalt for passphrase-derived old KEK');
    oldKekBuf = deriveKey(oldKek, Buffer.from(envelope.kekSalt, enc)).key;
  } else {
    oldKekBuf = oldKek;
  }
  const dek = aesgcmDecrypt(
    Buffer.from(envelope.encryptedDek, enc),
    oldKekBuf,
    Buffer.from(envelope.dekIv, enc),
    Buffer.from(envelope.dekTag, enc)
  );

  // 2. Wrap DEK with new KEK
  let newKekBuf: Buffer;
  let newKekSalt: Buffer | undefined;
  if (typeof newKek === 'string') {
    const derived = deriveKey(newKek);
    newKekBuf = derived.key;
    newKekSalt = derived.salt;
  } else {
    newKekBuf = newKek;
  }
  const { ciphertext: newEncDek, iv: newDekIv, tag: newDekTag } = aesgcmEncrypt(dek, newKekBuf);

  return {
    ...envelope,
    encryptedDek: newEncDek.toString(outEnc),
    dekIv:        newDekIv.toString(outEnc),
    dekTag:       newDekTag.toString(outEnc),
    ...(newKekSalt ? { kekSalt: newKekSalt.toString(outEnc) } : { kekSalt: undefined }),
  };
}

/**
 * Decrypt envelope and return plaintext as a UTF-8 string.
 */
export function decryptEnvelopeToString(envelope: EncryptedEnvelope, kek: Buffer | string): string {
  return decryptEnvelope(envelope, kek).toString('utf8');
}
