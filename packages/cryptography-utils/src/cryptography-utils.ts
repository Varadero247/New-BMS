// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.

export function xorEncrypt(data: string, key: string): string {
  if (!key) return data;
  return Array.from(data).map((ch, i) =>
    String.fromCharCode(ch.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
}

export function xorDecrypt(data: string, key: string): string {
  return xorEncrypt(data, key);
}

export function caesarEncrypt(text: string, shift: number): string {
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch >= 'a' ? 97 : 65;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
  });
}

export function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, -shift);
}

export function rot13(text: string): string {
  return caesarEncrypt(text, 13);
}

export function base64Encode(str: string): string {
  return Buffer.from(str).toString('base64');
}

export function base64Decode(str: string): string {
  return Buffer.from(str, 'base64').toString('utf8');
}

export function hexEncode(str: string): string {
  return Array.from(str).map(ch => ch.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

export function hexDecode(hex: string): string {
  const clean = hex.replace(/\s/g, '');
  const bytes = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return String.fromCharCode(...bytes);
}

export function generateKey(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash >>> 0;
}

export function fnv1aHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash;
}

export function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

export function vigenereEncrypt(text: string, key: string): string {
  if (!key) return text;
  const upperKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!upperKey) return text;
  let keyIdx = 0;
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch >= 'a' ? 97 : 65;
    const shift = upperKey.charCodeAt(keyIdx % upperKey.length) - 65;
    keyIdx++;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26) + base);
  });
}

export function vigenereDecrypt(text: string, key: string): string {
  if (!key) return text;
  const upperKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!upperKey) return text;
  let keyIdx = 0;
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch >= 'a' ? 97 : 65;
    const shift = upperKey.charCodeAt(keyIdx % upperKey.length) - 65;
    keyIdx++;
    return String.fromCharCode(((ch.charCodeAt(0) - base - shift + 26) % 26) + base);
  });
}

export function atbashCipher(text: string): string {
  return text.replace(/[a-zA-Z]/g, (ch) => {
    const isUpper = ch <= 'Z';
    const base = isUpper ? 65 : 97;
    return String.fromCharCode(base + 25 - (ch.charCodeAt(0) - base));
  });
}

export function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

export function isValidHex(str: string): boolean {
  return /^[0-9a-fA-F]*$/.test(str) && str.length % 2 === 0;
}

export function countBits(n: number): number {
  let count = 0;
  let num = n >>> 0;
  while (num) {
    count += num & 1;
    num >>>= 1;
  }
  return count;
}

export function reverseBits(n: number, bitCount = 32): number {
  let result = 0;
  let num = n >>> 0;
  for (let i = 0; i < bitCount; i++) {
    result = (result << 1) | (num & 1);
    num >>>= 1;
  }
  return result >>> 0;
}
