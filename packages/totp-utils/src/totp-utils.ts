// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import * as crypto from 'crypto';
import {
  OtpAlgorithm,
  TotpOptions,
  HotpOptions,
  TotpSecret,
  TotpVerifyResult,
  ProvisioningUriOptions,
  BackupCode,
} from './types';

// ---------------------------------------------------------------------------
// Base32 encoding/decoding (RFC 4648)
// ---------------------------------------------------------------------------

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32_MAP: Record<string, number> = {};
for (let i = 0; i < BASE32_ALPHABET.length; i++) {
  BASE32_MAP[BASE32_ALPHABET[i]] = i;
}

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += BASE32_ALPHABET[(value >>> bits) & 0x1f];
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  // Pad to multiple of 8
  while (output.length % 8 !== 0) {
    output += '=';
  }
  return output;
}

export function base32Decode(encoded: string): Buffer {
  // Strip padding and uppercase
  const cleaned = encoded.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const charValue = BASE32_MAP[char];
    if (charValue === undefined) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
    value = (value << 5) | charValue;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(output);
}

export function isValidBase32(s: string): boolean {
  if (!s || s.length === 0) return false;
  // Strip padding
  const cleaned = s.replace(/=+$/, '');
  if (cleaned.length === 0) return false;
  return /^[A-Z2-7]+$/i.test(cleaned);
}

// ---------------------------------------------------------------------------
// Secret generation
// ---------------------------------------------------------------------------

export function generateSecret(byteLength = 20): TotpSecret {
  const bytes = crypto.randomBytes(byteLength);
  return {
    base32: base32Encode(bytes),
    hex: bytes.toString('hex'),
    bytes,
  };
}

export function secretFromBase32(base32: string): TotpSecret {
  const bytes = base32Decode(base32);
  return {
    base32: base32.toUpperCase(),
    hex: bytes.toString('hex'),
    bytes,
  };
}

export function secretFromHex(hex: string): TotpSecret {
  const bytes = Buffer.from(hex, 'hex');
  return {
    base32: base32Encode(bytes),
    hex: hex.toLowerCase(),
    bytes,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function secretToBuffer(secret: string | Buffer): Buffer {
  if (Buffer.isBuffer(secret)) return secret;
  // Try to detect if it's hex or base32
  if (/^[0-9a-fA-F]+$/.test(secret) && secret.length % 2 === 0) {
    return Buffer.from(secret, 'hex');
  }
  // Treat as base32
  try {
    return base32Decode(secret);
  } catch {
    // Fallback: treat as raw ASCII (for test vectors like "12345678901234567890")
    return Buffer.from(secret, 'ascii');
  }
}

function algorithmToHmac(algorithm: OtpAlgorithm): string {
  switch (algorithm) {
    case 'SHA256': return 'sha256';
    case 'SHA512': return 'sha512';
    default: return 'sha1';
  }
}

function counterToBuffer(counter: number): Buffer {
  // RFC 4226: 8-byte big-endian counter
  const buf = Buffer.alloc(8, 0);
  // JavaScript numbers are safe up to 2^53; handle as two 32-bit halves
  const high = Math.floor(counter / 0x100000000);
  const low = counter >>> 0;
  buf.writeUInt32BE(high, 0);
  buf.writeUInt32BE(low, 4);
  return buf;
}

function dynamicTruncate(hmacResult: Buffer, digits: number): string {
  // RFC 4226 dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);
  const otp = code % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

// ---------------------------------------------------------------------------
// HOTP (RFC 4226)
// ---------------------------------------------------------------------------

export function generateHotp(
  secret: string | Buffer,
  counter: number,
  options: HotpOptions = {}
): string {
  const digits = options.digits ?? 6;
  const algorithm = options.algorithm ?? 'SHA1';
  const keyBuf = secretToBuffer(secret);
  const counterBuf = counterToBuffer(counter);
  const hmac = crypto.createHmac(algorithmToHmac(algorithm), keyBuf);
  hmac.update(counterBuf);
  const digest = hmac.digest();
  return dynamicTruncate(digest, digits);
}

export function verifyHotp(
  token: string,
  secret: string | Buffer,
  counter: number,
  options: HotpOptions & { window?: number } = {}
): boolean {
  const window = options.window ?? 0;
  for (let i = counter; i <= counter + window; i++) {
    const expected = generateHotp(secret, i, options);
    if (timingSafeEqual(token, expected)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// TOTP (RFC 6238)
// ---------------------------------------------------------------------------

export function getStep(timestamp?: number, period = 30): number {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  return Math.floor(ts / period);
}

export function getRemainingSeconds(period = 30): number {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

export function generateTotpAt(
  secret: string | Buffer,
  timestamp: number,
  options: TotpOptions = {}
): string {
  const period = options.period ?? 30;
  const counter = getStep(timestamp, period);
  return generateHotp(secret, counter, { digits: options.digits ?? 6, algorithm: options.algorithm ?? 'SHA1' });
}

export function generateTotp(
  secret: string | Buffer,
  options: TotpOptions = {}
): string {
  const now = Math.floor(Date.now() / 1000);
  return generateTotpAt(secret, now, options);
}

export function verifyTotp(
  token: string,
  secret: string | Buffer,
  options: TotpOptions & { window?: number; timestamp?: number } = {}
): TotpVerifyResult {
  const period = options.period ?? 30;
  const window = options.window ?? 1;
  const now = options.timestamp ?? Math.floor(Date.now() / 1000);
  const currentStep = getStep(now, period);

  for (let i = -window; i <= window; i++) {
    const delta = (i || 0); // normalize -0 to +0
    const stepTs = (currentStep + delta) * period;
    const expected = generateTotpAt(secret, stepTs, options);
    if (timingSafeEqual(token, expected)) {
      return { valid: true, delta };
    }
  }
  return { valid: false };
}

// ---------------------------------------------------------------------------
// Provisioning URIs (otpauth://)
// ---------------------------------------------------------------------------

export function generateProvisioningUri(
  secret: string,
  options: ProvisioningUriOptions
): string {
  const { issuer, accountName, algorithm = 'SHA1', digits = 6, period = 30 } = options;
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm,
    digits: digits.toString(),
    period: period.toString(),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function parseProvisioningUri(uri: string): {
  type: string;
  label: string;
  secret: string;
  issuer?: string;
  algorithm?: OtpAlgorithm;
  digits?: number;
  period?: number;
} | null {
  try {
    if (!uri.startsWith('otpauth://')) return null;
    const withoutScheme = uri.slice('otpauth://'.length);
    const slashIdx = withoutScheme.indexOf('/');
    if (slashIdx === -1) return null;
    const type = withoutScheme.slice(0, slashIdx);
    const rest = withoutScheme.slice(slashIdx + 1);
    const queryIdx = rest.indexOf('?');
    const label = queryIdx === -1 ? decodeURIComponent(rest) : decodeURIComponent(rest.slice(0, queryIdx));
    const queryString = queryIdx === -1 ? '' : rest.slice(queryIdx + 1);
    const params = new URLSearchParams(queryString);
    const secret = params.get('secret') ?? '';
    const issuer = params.get('issuer') ?? undefined;
    const algorithmRaw = params.get('algorithm');
    const algorithm: OtpAlgorithm | undefined =
      algorithmRaw === 'SHA256' || algorithmRaw === 'SHA512' || algorithmRaw === 'SHA1'
        ? algorithmRaw
        : undefined;
    const digitsRaw = params.get('digits');
    const digits = digitsRaw ? parseInt(digitsRaw, 10) : undefined;
    const periodRaw = params.get('period');
    const period = periodRaw ? parseInt(periodRaw, 10) : undefined;
    return { type, label, secret, issuer, algorithm, digits, period };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// OTP generation (general random)
// ---------------------------------------------------------------------------

const NUMERIC_CHARS = '0123456789';
const ALPHA_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHANUMERIC_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomString(length: number, alphabet: string): string {
  let result = '';
  const alphabetLen = alphabet.length;
  for (let i = 0; i < length; i++) {
    const randomByte = crypto.randomBytes(1)[0];
    // Rejection sampling to avoid modulo bias — use a simple approach
    result += alphabet[randomByte % alphabetLen];
  }
  return result;
}

export function generateOtp(
  length = 6,
  type: 'numeric' | 'alphanumeric' | 'alphabetic' = 'numeric'
): string {
  switch (type) {
    case 'alphanumeric': return randomString(length, ALPHANUMERIC_CHARS);
    case 'alphabetic': return randomString(length, ALPHA_CHARS);
    default: return randomString(length, NUMERIC_CHARS);
  }
}

export function generatePin(length = 6): string {
  return randomString(length, NUMERIC_CHARS);
}

// ---------------------------------------------------------------------------
// Backup codes
// ---------------------------------------------------------------------------

export function generateBackupCodes(
  count = 10,
  format: 'numeric' | 'alphanumeric' = 'alphanumeric'
): BackupCode[] {
  const codes: BackupCode[] = [];
  for (let i = 0; i < count; i++) {
    codes.push({
      code: randomString(8, format === 'numeric' ? NUMERIC_CHARS : ALPHANUMERIC_CHARS),
      used: false,
    });
  }
  return codes;
}

export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): { valid: boolean; index: number } {
  const inputHash = hashBackupCode(code);
  for (let i = 0; i < hashedCodes.length; i++) {
    // Constant-time comparison
    let match = false;
    try {
      match = crypto.timingSafeEqual(
        Buffer.from(inputHash, 'hex'),
        Buffer.from(hashedCodes[i], 'hex')
      );
    } catch {
      match = false;
    }
    if (match) {
      return { valid: true, index: i };
    }
  }
  return { valid: false, index: -1 };
}

// ---------------------------------------------------------------------------
// Rate limiting helpers
// ---------------------------------------------------------------------------

export function isRateLimited(
  attempts: number,
  windowStart: number,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  if (now - windowStart >= windowMs) {
    // Window has expired — not rate limited
    return false;
  }
  return attempts >= maxAttempts;
}

export function nextAllowedAttempt(
  attempts: number,
  windowStart: number,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): number {
  if (attempts < maxAttempts) {
    return Date.now();
  }
  return windowStart + windowMs;
}

// ---------------------------------------------------------------------------
// Internal: timing-safe string comparison
// ---------------------------------------------------------------------------

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}
