// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function setBit(n: number, pos: number): number { return n | (1 << pos); }
export function clearBit(n: number, pos: number): number { return n & ~(1 << pos); }
export function toggleBit(n: number, pos: number): number { return n ^ (1 << pos); }
export function isBitSet(n: number, pos: number): boolean { return (n & (1 << pos)) !== 0; }
export function popcount(n: number): number {
  let count = 0; let x = n >>> 0;
  while (x) { x &= x - 1; count++; }
  return count;
}
export function isPowerOf2(n: number): boolean { return n > 0 && (n & (n - 1)) === 0; }
export function lowestSetBit(n: number): number { return n & (-n); }
export function clearLowestSetBit(n: number): number { return n & (n - 1); }
export function reverseBits(n: number): number {
  let result = 0; let x = n >>> 0;
  for (let i = 0; i < 32; i++) { result = (result << 1) | (x & 1); x >>>= 1; }
  return result >>> 0;
}
export function highestSetBit(n: number): number { if (n <= 0) return -1; return 31 - Math.clz32(n); }
export function countLeadingZeros(n: number): number { return Math.clz32(n); }
export function countTrailingZeros(n: number): number {
  if (n === 0) return 32;
  let count = 0; let x = n >>> 0;
  while ((x & 1) === 0) { x >>>= 1; count++; }
  return count;
}
export function rotateLeft(n: number, k: number): number {
  const shift = k % 32; if (shift === 0) return n >>> 0;
  return (((n >>> 0) << shift) | ((n >>> 0) >>> (32 - shift))) >>> 0;
}
export function rotateRight(n: number, k: number): number {
  const shift = k % 32; if (shift === 0) return n >>> 0;
  return (((n >>> 0) >>> shift) | ((n >>> 0) << (32 - shift))) >>> 0;
}
export function swapBits(n: number, i: number, j: number): number {
  const bi = (n >>> i) & 1; const bj = (n >>> j) & 1;
  if (bi === bj) return n;
  return n ^ ((1 << i) | (1 << j));
}
export function extractBits(n: number, start: number, length: number): number {
  const mask = (1 << length) - 1; return (n >>> start) & mask;
}
export function insertBits(n: number, value: number, start: number, length: number): number {
  const mask = ((1 << length) - 1) << start;
  return (n & ~mask) | ((value << start) & mask);
}
export function toBinaryString(n: number, bits = 8): string { return (n >>> 0).toString(2).padStart(bits, '0'); }
export function fromBinaryString(s: string): number { return parseInt(s, 2); }
export function toHexString(n: number): string { return (n >>> 0).toString(16); }
export function fromHexString(s: string): number { return parseInt(s, 16); }
export function parity(n: number): number {
  let x = n >>> 0; x ^= x >> 16; x ^= x >> 8; x ^= x >> 4; x ^= x >> 2; x ^= x >> 1; return x & 1;
}
export function nextPowerOf2(n: number): number {
  if (n <= 1) return 1;
  let v = n - 1; v |= v >> 1; v |= v >> 2; v |= v >> 4; v |= v >> 8; v |= v >> 16;
  return v + 1;
}
export function prevPowerOf2(n: number): number {
  if (n <= 0) return 0;
  let v = n >>> 0; v |= v >> 1; v |= v >> 2; v |= v >> 4; v |= v >> 8; v |= v >> 16;
  return v - (v >> 1);
}
export function xorUpTo(n: number): number {
  switch (n % 4) { case 0: return n; case 1: return 1; case 2: return n + 1; case 3: return 0; default: return 0; }
}
export function bitAbs(n: number): number { const mask = n >> 31; return (n + mask) ^ mask; }
export function bitSign(n: number): number { if (n === 0) return 0; return 1 | (n >> 31); }
export function xorSwap(a: number, b: number): [number, number] {
  if (a === b) return [a, b]; a ^= b; b ^= a; a ^= b; return [a, b];
}
export function bitMax(a: number, b: number): number { const diff = a - b; const sign = (diff >> 31) & 1; return a - sign * diff; }
export function bitMin(a: number, b: number): number { const diff = a - b; const sign = (diff >> 31) & 1; return b + sign * diff; }
export function haveOppositeSigns(a: number, b: number): boolean { return (a ^ b) < 0; }
export function roundUpPow2(n: number, p: number): number { return (n + p - 1) & ~(p - 1); }
export function getNthBit(n: number, pos: number): 0 | 1 { return ((n >>> pos) & 1) as 0 | 1; }
export function hammingDistance(a: number, b: number): number { return popcount(a ^ b); }
export function lowBitMask(n: number): number { if (n >= 32) return 0xffffffff >>> 0; return (1 << n) - 1; }
export function isEven(n: number): boolean { return (n & 1) === 0; }
export function isOdd(n: number): boolean { return (n & 1) === 1; }
export function multiplyByPow2(n: number, k: number): number { return n << k; }
export function divideByPow2(n: number, k: number): number { return n >> k; }
export function toGrayCode(n: number): number { return n ^ (n >> 1); }
export function fromGrayCode(g: number): number {
  let n = g; let mask = n >> 1;
  while (mask) { n ^= mask; mask >>= 1; }
  return n;
}
export function bitsNeeded(n: number): number { if (n <= 0) return 1; return highestSetBit(n) + 1; }
export function interleaveBits(x: number, y: number): number {
  let result = 0;
  for (let i = 0; i < 16; i++) { result |= ((x & (1 << i)) << i) | ((y & (1 << i)) << (i + 1)); }
  return result >>> 0;
}
