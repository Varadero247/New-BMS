// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// GF(2) -- binary field
export function gf2Add(a: number, b: number): number { return a ^ b; }
export function gf2Mul(a: number, b: number): number { return a & b; }

// GF(2^8) with irreducible polynomial x^8 + x^4 + x^3 + x + 1 (AES polynomial, 0x11B)
const GF256_POLY = 0x11b;

export function gf256Mul(a: number, b: number): number {
  let result = 0;
  let aa = a & 0xFF;
  let bb = b & 0xFF;
  while (bb > 0) {
    if (bb & 1) result ^= aa;
    const highBit = aa & 0x80;
    aa = (aa << 1) & 0xFF;
    if (highBit) aa ^= 0x1b; // reduce mod x^8+x^4+x^3+x+1 (low 8 bits of 0x11b)
    bb >>= 1;
  }
  return result;
}

export function gf256Add(a: number, b: number): number { return a ^ b; }

export function gf256Pow(base: number, exp: number): number {
  if (exp === 0) return 1;
  let result = 1;
  let b = base & 0xFF;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = gf256Mul(result, b);
    b = gf256Mul(b, b);
    e >>= 1;
  }
  return result;
}

// Build log/exp tables for GF(256) with generator 3
export function buildGF256Tables(): { exp: number[]; log: number[] } {
  const exp = new Array(512).fill(0);
  const log = new Array(256).fill(0);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    exp[i] = x;
    log[x] = i;
    x = gf256Mul(x, 3);
  }
  for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
  return { exp, log };
}

const { exp: GF256_EXP, log: GF256_LOG } = buildGF256Tables();

export function gf256FastMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[(GF256_LOG[a] + GF256_LOG[b]) % 255];
}

export function gf256Inv(a: number): number {
  if (a === 0) throw new Error('No inverse for 0');
  return GF256_EXP[255 - GF256_LOG[a]];
}

export function gf256Div(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero');
  if (a === 0) return 0;
  return GF256_EXP[(GF256_LOG[a] - GF256_LOG[b] + 255) % 255];
}

// Polynomial over GF(256) — coefficients are field elements
// poly[0] is constant, poly[i] is coefficient of x^i
export function polyAdd(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const result = new Array(len).fill(0);
  for (let i = 0; i < a.length; i++) result[i] ^= a[i];
  for (let i = 0; i < b.length; i++) result[i] ^= b[i];
  // Remove trailing zeros
  while (result.length > 0 && result[result.length - 1] === 0) result.pop();
  return result.length === 0 ? [0] : result;
}

export function polyScale(p: number[], scalar: number): number[] {
  return p.map(c => gf256FastMul(c, scalar));
}

export function polyMul(a: number[], b: number[]): number[] {
  const result = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] ^= gf256FastMul(a[i], b[j]);
    }
  }
  while (result.length > 1 && result[result.length - 1] === 0) result.pop();
  return result;
}

export function polyEval(p: number[], x: number): number {
  // Horner's method (from high degree)
  let result = 0;
  for (let i = p.length - 1; i >= 0; i--) {
    result = gf256Add(gf256FastMul(result, x), p[i]);
  }
  return result;
}

export function polyDeg(p: number[]): number {
  return p.length - 1;
}

// Reed-Solomon: encode message of length k with n-k check symbols
export function rsEncode(message: number[], nsym: number): number[] {
  // Generator polynomial = product of (x - alpha^i) for i in 0..nsym-1
  let gen: number[] = [1];
  for (let i = 0; i < nsym; i++) {
    gen = polyMul(gen, [GF256_EXP[i], 1]);
  }
  // Polynomial division remainder
  let msgPoly = [...message, ...new Array(nsym).fill(0)];
  for (let i = 0; i < message.length; i++) {
    const coeff = msgPoly[i];
    if (coeff !== 0) {
      for (let j = 1; j < gen.length; j++) {
        msgPoly[i + j] ^= gf256FastMul(gen[j], coeff);
      }
    }
  }
  return [...message, ...msgPoly.slice(message.length)];
}

// GF(2^16) with polynomial x^16 + x^5 + x^3 + x^2 + 1 (0x1002D)
const GF16_POLY = 0x1002d;

export function gf16Mul(a: number, b: number): number {
  let result = 0;
  let aa = a & 0xFFFF;
  let bb = b & 0xFFFF;
  while (bb > 0) {
    if (bb & 1) result ^= aa;
    const highBit = aa & 0x8000;
    aa = (aa << 1) & 0xFFFF;
    if (highBit) aa ^= 0x002d; // low 16 bits of GF16_POLY
    bb >>= 1;
  }
  return result;
}

export function gf16Add(a: number, b: number): number { return a ^ b; }

export function gf16Pow(base: number, exp: number): number {
  let result = 1;
  let b = base & 0xFFFF;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = gf16Mul(result, b);
    b = gf16Mul(b, b);
    e >>= 1;
  }
  return result;
}

// CRC-16 (polynomial x^16 + x^15 + x^2 + 1 = 0x8005)
export function crc16(data: number[]): number {
  let crc = 0;
  for (const byte of data) {
    crc ^= (byte << 8);
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x8005) & 0xFFFF;
      else crc = (crc << 1) & 0xFFFF;
    }
  }
  return crc;
}

// CRC-32
export function crc32(data: number[]): number {
  let crc = 0xFFFFFFFF;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      if (crc & 1) crc = (crc >>> 1) ^ 0xEDB88320;
      else crc = crc >>> 1;
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Hamming weight (popcount) over GF(2) words
export function gfHammingWeight(n: number): number {
  let count = 0;
  let x = n >>> 0;
  while (x) { count += x & 1; x >>>= 1; }
  return count;
}

// Berlekamp-Massey algorithm: find shortest LFSR for a sequence over GF(2)
export function berlekampMassey(s: number[]): number[] {
  // Returns connection polynomial C as array of bits
  let C: number[] = [1];
  let B: number[] = [1];
  let L = 0, b = 1, x = 1;
  for (let n = 0; n < s.length; n++) {
    let d = s[n];
    for (let i = 1; i <= L; i++) d ^= (C[i] || 0) & s[n - i];
    if (d === 0) { x++; continue; }
    const T = [...C];
    const scale = d; // over GF(2) this is 1
    const shifted = Array(x).fill(0).concat(B.map(v => v & scale));
    while (C.length < shifted.length) C.push(0);
    for (let i = 0; i < shifted.length; i++) C[i] = (C[i] ^ shifted[i]) & 1;
    if (2 * L <= n) { L = n + 1 - L; B = T; b = d; x = 1; }
    else x++;
  }
  return C;
}

// Helper: GF(2) polynomial from bit array
export function bitsToGF2Poly(bits: number[]): string {
  const terms: string[] = [];
  for (let i = bits.length - 1; i >= 0; i--) {
    if (bits[i]) {
      if (i === 0) terms.push('1');
      else if (i === 1) terms.push('x');
      else terms.push(`x^${i}`);
    }
  }
  return terms.length ? terms.join(' + ') : '0';
}
