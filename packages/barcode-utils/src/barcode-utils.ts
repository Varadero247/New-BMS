// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { BarcodeSymbology } from './types';

// ── EAN / GTIN check digit ──────────────────────────────────────────────────

/** Compute EAN-13 check digit for the first 12 digits (returns 0–9). */
export function ean13CheckDigit(digits: string): number {
  if (!/^\d{12}$/.test(digits)) throw new Error('EAN-13 requires exactly 12 digits');
  const sum = digits.split('').reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

/** Validate a full 13-digit EAN-13 barcode. */
export function validateEAN13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;
  const check = ean13CheckDigit(code.slice(0, 12));
  return check === Number(code[12]);
}

/** Compute EAN-8 check digit for the first 7 digits (returns 0–9). */
export function ean8CheckDigit(digits: string): number {
  if (!/^\d{7}$/.test(digits)) throw new Error('EAN-8 requires exactly 7 digits');
  const sum = digits.split('').reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10;
}

/** Validate a full 8-digit EAN-8 barcode. */
export function validateEAN8(code: string): boolean {
  if (!/^\d{8}$/.test(code)) return false;
  const check = ean8CheckDigit(code.slice(0, 7));
  return check === Number(code[7]);
}

/** Validate a UPC-A barcode (12 digits, same as EAN-13 with leading 0). */
export function validateUPCA(code: string): boolean {
  if (!/^\d{12}$/.test(code)) return false;
  return validateEAN13('0' + code);
}

// ── ISBN / ISSN ─────────────────────────────────────────────────────────────

/** Validate ISBN-13 (same algorithm as EAN-13). */
export function validateISBN13(isbn: string): boolean {
  const clean = isbn.replace(/[- ]/g, '');
  return validateEAN13(clean);
}

/** Validate ISBN-10 (ten-digit Modulo-11). */
export function validateISBN10(isbn: string): boolean {
  const clean = isbn.replace(/[- ]/g, '');
  if (!/^\d{9}[\dX]$/.test(clean)) return false;
  const sum = clean.split('').reduce((acc, c, i) => {
    const val = c === 'X' ? 10 : Number(c);
    return acc + val * (10 - i);
  }, 0);
  return sum % 11 === 0;
}

/** Validate ISSN (8-digit, Modulo-11). */
export function validateISSN(issn: string): boolean {
  const clean = issn.replace(/[- ]/g, '');
  if (!/^\d{7}[\dX]$/.test(clean)) return false;
  const sum = clean.split('').reduce((acc, c, i) => {
    const val = c === 'X' ? 10 : Number(c);
    return acc + val * (8 - i);
  }, 0);
  return sum % 11 === 0;
}

/** Convert ISBN-10 to ISBN-13. */
export function isbn10ToIsbn13(isbn10: string): string {
  const clean = isbn10.replace(/[- ]/g, '').slice(0, 9);
  const base = '978' + clean;
  const check = ean13CheckDigit(base);
  return base + check;
}

// ── GTIN ─────────────────────────────────────────────────────────────────────

/** Validate GTIN-8, GTIN-12, GTIN-13, or GTIN-14. */
export function validateGTIN(gtin: string): boolean {
  if (!/^\d+$/.test(gtin)) return false;
  const len = gtin.length;
  if (![8, 12, 13, 14].includes(len)) return false;
  // Pad to 14 digits
  const padded = gtin.padStart(14, '0');
  const sum = padded.slice(0, 13).split('').reduce((acc, d, i) => {
    return acc + Number(d) * (i % 2 === 0 ? 3 : 1);
  }, 0);
  const check = (10 - (sum % 10)) % 10;
  return check === Number(padded[13]);
}

/** Generate a valid GTIN-13 from a 12-digit base. */
export function generateGTIN13(base12: string): string {
  if (!/^\d{12}$/.test(base12)) throw new Error('Requires 12 digits');
  return base12 + ean13CheckDigit(base12);
}

// ── Code 39 ─────────────────────────────────────────────────────────────────

const CODE39_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';

/** Check whether a string is encodable in Code 39. */
export function isCode39Encodable(data: string): boolean {
  return data.split('').every(c => CODE39_CHARS.includes(c));
}

/** Encode data as Code 39 bar pattern (simplified: returns encoded string representation). */
export function encodeCode39(data: string): string {
  const upper = data.toUpperCase();
  if (!isCode39Encodable(upper)) throw new Error('Invalid Code 39 character');
  return `*${upper}*`;
}

/** Compute Code 39 checksum value (0–43). */
export function code39Checksum(data: string): number {
  const upper = data.toUpperCase();
  return upper.split('').reduce((sum, c) => {
    const idx = CODE39_CHARS.indexOf(c);
    if (idx < 0) throw new Error(`Invalid Code 39 char: ${c}`);
    return sum + idx;
  }, 0) % 43;
}

// ── ITF (Interleaved 2 of 5) ─────────────────────────────────────────────────

/** Check whether a string can be encoded as ITF (even number of digits). */
export function isITFEncodable(data: string): boolean {
  return /^\d+$/.test(data) && data.length % 2 === 0;
}

/** Compute ITF check digit (Luhn-style). */
export function itfCheckDigit(digits: string): number {
  if (!/^\d+$/.test(digits)) throw new Error('ITF requires digits only');
  const sum = digits.split('').reduce((acc, d, i) => {
    return acc + Number(d) * (i % 2 === 0 ? 1 : 3);
  }, 0);
  return (10 - (sum % 10)) % 10;
}

// ── Code 128 ─────────────────────────────────────────────────────────────────

/** Check whether a string is encodable in Code 128B (ASCII 32–127). */
export function isCode128Encodable(data: string): boolean {
  return data.split('').every(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) <= 127);
}

/** Compute Code 128 check character value. */
export function code128CheckValue(data: string): number {
  let checksum = 104; // Start B value
  for (let i = 0; i < data.length; i++) {
    checksum += (data.charCodeAt(i) - 32) * (i + 1);
  }
  return checksum % 103;
}

/** Encode data into a simplified Code 128 representation. */
export function encodeCode128(data: string): string {
  if (!isCode128Encodable(data)) throw new Error('Non-ASCII character');
  const check = code128CheckValue(data);
  return `[START-B]${data}[CHECK:${check}][STOP]`;
}

// ── Barcode detection / format ───────────────────────────────────────────────

/** Guess the barcode symbology from its format. */
export function guessBarcodeType(code: string): BarcodeSymbology | null {
  const c = code.replace(/[- ]/g, '');
  if (/^\d{13}$/.test(c)) return 'EAN13';
  if (/^\d{12}$/.test(c)) return 'UPCA';
  if (/^\d{8}$/.test(c)) return 'EAN8';
  if (/^[A-Z0-9\- .$/+%]+$/.test(c)) return 'CODE39';
  if (/^\d+$/.test(c) && c.length % 2 === 0) return 'ITF';
  if (code.split('').every(ch => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 127)) return 'CODE128';
  return null;
}

/** Format a raw 12-digit UPC-A for display (X-XXXXX-XXXXX-X). */
export function formatUPCA(code: string): string {
  if (!/^\d{12}$/.test(code)) throw new Error('UPC-A requires 12 digits');
  return `${code[0]}-${code.slice(1, 6)}-${code.slice(6, 11)}-${code[11]}`;
}

/** Format a raw 13-digit EAN-13 for display (X-XXXXXX-XXXXXX). */
export function formatEAN13(code: string): string {
  if (!/^\d{13}$/.test(code)) throw new Error('EAN-13 requires 13 digits');
  return `${code.slice(0, 1)}-${code.slice(1, 7)}-${code.slice(7)}`;
}

/** Strip non-digit characters from a barcode string. */
export function normalizeBarcode(code: string): string {
  return code.replace(/[^0-9A-Za-z]/g, '');
}

/** Generate a random 12-digit EAN-13 base and append its check digit. */
export function generateEAN13(prefix: string = '590'): string {
  if (!/^\d{1,12}$/.test(prefix)) throw new Error('prefix must be 1–12 digits');
  const remaining = 12 - prefix.length;
  const rand = Array.from({ length: remaining }, () => Math.floor(Math.random() * 10)).join('');
  const base = prefix + rand;
  return base + ean13CheckDigit(base);
}

/** Luhn check digit (used for credit cards and some barcodes). */
export function luhnCheckDigit(digits: string): number {
  if (!/^\d+$/.test(digits)) throw new Error('Digits only');
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}

/** Validate a number with Luhn check. */
export function validateLuhn(code: string): boolean {
  if (!/^\d+$/.test(code)) return false;
  const base = code.slice(0, -1);
  const check = Number(code[code.length - 1]);
  return luhnCheckDigit(base) === check;
}
