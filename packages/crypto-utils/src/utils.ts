import { createHash, createHmac, randomBytes, pbkdf2Sync, randomUUID } from 'crypto';
import { EncodingFormat, HashAlgorithm, HashOptions, HmacOptions, KeyDerivationOptions, TokenFormat, TokenOptions } from './types';

export function hash(data: string, options: HashOptions = { algorithm: 'sha256', encoding: 'hex' }): string {
  const h = createHash(options.algorithm);
  h.update(data);
  if (options.encoding === 'base64url') {
    return h.digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
  return h.digest(options.encoding === 'binary' ? 'binary' : options.encoding as BufferEncoding);
}

export function sha256(data: string): string {
  return hash(data, { algorithm: 'sha256', encoding: 'hex' });
}

export function sha512(data: string): string {
  return hash(data, { algorithm: 'sha512', encoding: 'hex' });
}

export function md5(data: string): string {
  return hash(data, { algorithm: 'md5', encoding: 'hex' });
}

export function hmac(data: string, secret: string, options: HmacOptions = { algorithm: 'sha256', encoding: 'hex' }): string {
  const h = createHmac(options.algorithm, secret);
  h.update(data);
  if (options.encoding === 'base64url') {
    return h.digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }
  return h.digest(options.encoding === 'binary' ? 'binary' : options.encoding as BufferEncoding);
}

export function generateToken(options: TokenOptions = { format: 'hex', length: 32 }): string {
  switch (options.format) {
    case 'uuid': return randomUUID();
    case 'hex': return randomBytes(Math.ceil(options.length / 2)).toString('hex').slice(0, options.length);
    case 'base64': return randomBytes(Math.ceil(options.length * 3 / 4)).toString('base64').slice(0, options.length);
    case 'alphanumeric': {
      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const bytes = randomBytes(options.length);
      return Array.from(bytes).map(b => charset[b % charset.length]).join('');
    }
    case 'numeric': {
      const bytes = randomBytes(options.length);
      return Array.from(bytes).map(b => String(b % 10)).join('');
    }
    default: return randomBytes(options.length).toString('hex');
  }
}

export function generateUUID(): string {
  return randomUUID();
}

export function toBase64(data: string): string {
  return Buffer.from(data, 'utf8').toString('base64');
}

export function fromBase64(data: string): string {
  return Buffer.from(data, 'base64').toString('utf8');
}

export function toBase64Url(data: string): string {
  return toBase64(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function toHex(data: string): string {
  return Buffer.from(data, 'utf8').toString('hex');
}

export function fromHex(hex: string): string {
  return Buffer.from(hex, 'hex').toString('utf8');
}

export function deriveKey(password: string, salt: string, options: KeyDerivationOptions = { iterations: 100_000, keyLength: 32, digest: 'sha256' }): string {
  return pbkdf2Sync(password, salt, options.iterations, options.keyLength, options.digest).toString('hex');
}

export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export function isValidHashAlgorithm(alg: string): alg is HashAlgorithm {
  return ['sha256', 'sha384', 'sha512', 'md5', 'sha1'].includes(alg);
}

export function isValidEncoding(enc: string): enc is EncodingFormat {
  return ['hex', 'base64', 'base64url', 'binary'].includes(enc);
}

export function isValidTokenFormat(fmt: string): fmt is TokenFormat {
  return ['uuid', 'hex', 'alphanumeric', 'numeric'].includes(fmt);
}

export function hashLength(algorithm: HashAlgorithm): number {
  const lengths: Record<HashAlgorithm, number> = { md5: 32, sha1: 40, sha256: 64, sha384: 96, sha512: 128 };
  return lengths[algorithm] ?? 0;
}

export function isHexString(s: string): boolean {
  return /^[0-9a-f]*$/i.test(s);
}

export function isBase64String(s: string): boolean {
  return /^[A-Za-z0-9+/]*(={0,2})$/.test(s);
}

export function truncateHash(hashValue: string, length: number): string {
  return hashValue.slice(0, length);
}
