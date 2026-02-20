/**
 * @ims/encryption — AES-256-GCM field-level encryption for PII at rest.
 *
 * Requires ENCRYPTION_KEY env var: 64 hex chars (32 bytes).
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Ciphertext format: <ivHex>:<authTagHex>:<encryptedHex>
 * All three segments are colon-separated hex strings.
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Lazily resolve and validate the encryption key from environment.
 * Throws at call time (not module load) to allow services that don't use
 * encryption to start without the key set.
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required for field-level encryption. ' +
        'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  if (keyHex.length !== 64) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). Got ${keyHex.length} characters.`
    );
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a colon-delimited hex string: ivHex:authTagHex:encryptedHex
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a ciphertext produced by encrypt().
 * Throws if the ciphertext is malformed or the auth tag fails (tamper detection).
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format — expected ivHex:authTagHex:encryptedHex');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encryptedData = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  return decipher.update(encryptedData).toString('utf8') + decipher.final('utf8');
}

/**
 * Encrypt a value only if it is non-null/non-undefined and non-empty.
 * Returns null/undefined unchanged, empty string unchanged.
 * Useful for optional PII fields.
 */
export function encryptIfPresent(value: string | null | undefined): string | null | undefined {
  if (value == null || value === '') return value;
  return encrypt(value);
}

/**
 * Decrypt a value only if it looks like an encrypted ciphertext (contains two colons).
 * Returns null/undefined/empty unchanged.
 * Allows graceful handling during migration when some rows are still plaintext.
 */
export function decryptIfEncrypted(value: string | null | undefined): string | null | undefined {
  if (value == null || value === '') return value;
  // Encrypted values always contain exactly two colons
  if ((value.match(/:/g) || []).length !== 2) return value;
  return decrypt(value);
}

/**
 * Check if ENCRYPTION_KEY is configured (without throwing).
 * Useful for health-check endpoints.
 */
export function isEncryptionConfigured(): boolean {
  const keyHex = process.env.ENCRYPTION_KEY;
  return typeof keyHex === 'string' && keyHex.length === 64;
}
