// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.

export function parityBit(data: number[]): number {
  return data.reduce((a, b) => a ^ b, 0) & 1;
}

export function addParityBit(data: number[]): number[] {
  return [...data, parityBit(data)];
}

export function checkParity(data: number[]): boolean {
  return data.reduce((a, b) => a ^ b, 0) === 0;
}

export function crc8(data: number[], poly = 0x07): number {
  let crc = 0;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x80) crc = ((crc << 1) ^ poly) & 0xff;
      else crc = (crc << 1) & 0xff;
    }
  }
  return crc;
}

export function crc16(data: number[], poly = 0x8005): number {
  let crc = 0xffff;
  for (const byte of data) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) crc = ((crc << 1) ^ poly) & 0xffff;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc;
}

export function checksumMod256(data: number[]): number {
  return data.reduce((s, b) => (s + b) % 256, 0);
}

export function luhnCheck(number: string): boolean {
  const digits = number.replace(/\D/g, '').split('').map(Number);
  if (digits.length < 2) return false;
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if ((digits.length - 1 - i) % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function luhnCalculate(number: string): string {
  const digits = number.replace(/\D/g, '').split('').map(Number);
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if ((digits.length - i) % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return number + checkDigit;
}

export function hammingWeight(n: number): number {
  let count = 0;
  let num = n >>> 0;
  while (num) { count += num & 1; num >>>= 1; }
  return count;
}

export function hammingDistance(a: number, b: number): number {
  return hammingWeight(a ^ b);
}

export function repeatCode(data: number[], n: number): number[] {
  const result: number[] = [];
  for (const bit of data) {
    for (let i = 0; i < n; i++) result.push(bit);
  }
  return result;
}

export function majorityVote(bits: number[]): number {
  const ones = bits.filter(b => b === 1).length;
  return ones > bits.length / 2 ? 1 : 0;
}

export function interleave(data: number[], depth: number): number[] {
  if (depth <= 1) return [...data];
  const result = new Array(data.length).fill(0);
  for (let i = 0; i < data.length; i++) {
    result[(i * depth) % data.length + Math.floor((i * depth) / data.length)] = data[i];
  }
  return result;
}

export function byteToBits(byte: number): number[] {
  const bits: number[] = [];
  for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
  return bits;
}

export function bitsToInt(bits: number[]): number {
  return bits.reduce((acc, bit) => (acc << 1) | bit, 0);
}

export function isValidIsbn10(isbn: string): boolean {
  const digits = isbn.replace(/[-\s]/g, '');
  if (digits.length !== 10) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    if (!/\d/.test(digits[i])) return false;
    sum += (10 - i) * parseInt(digits[i], 10);
  }
  const last = digits[9];
  sum += last === 'X' ? 10 : parseInt(last, 10);
  return sum % 11 === 0;
}

export function isValidIsbn13(isbn: string): boolean {
  const digits = isbn.replace(/[-\s]/g, '');
  if (digits.length !== 13) return false;
  if (!/^\d{13}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i], 10) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(digits[12], 10);
}

export function xorChecksum(data: number[]): number {
  return data.reduce((a, b) => a ^ b, 0);
}

export function adler32(data: number[]): number {
  let a = 1, b = 0;
  const MOD = 65521;
  for (const byte of data) {
    a = (a + byte) % MOD;
    b = (b + a) % MOD;
  }
  return (b << 16) | a;
}
