// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  xor, rotateLeft32, rotateRight32,
  bytesToHex, hexToBytes, bytesToBase64, base64ToBytes,
  bytesToUtf8, utf8ToBytes, fnv1a32, djb2, adler32, crc32, murmur3,
  generateNonce, generateId, constantTimeEqual,
  padPKCS7, unpadPKCS7, splitBytes, joinBytes, zeroPad,
} from '../crypto-primitives';

describe('bytesToHex / hexToBytes round-trip', () => {
  it('round-trip #1', () => {
    const b = new Uint8Array([1, 2, 3, 4]);
    expect(bytesToHex(b)).toBe('01020304');
    expect(hexToBytes('01020304')).toEqual(b);
  });
  it('round-trip #2', () => {
    const b = new Uint8Array([2, 3, 4, 5]);
    expect(bytesToHex(b)).toBe('02030405');
    expect(hexToBytes('02030405')).toEqual(b);
  });
  it('round-trip #3', () => {
    const b = new Uint8Array([3, 4, 5, 6]);
    expect(bytesToHex(b)).toBe('03040506');
    expect(hexToBytes('03040506')).toEqual(b);
  });
  it('round-trip #4', () => {
    const b = new Uint8Array([4, 5, 6, 7]);
    expect(bytesToHex(b)).toBe('04050607');
    expect(hexToBytes('04050607')).toEqual(b);
  });
  it('round-trip #5', () => {
    const b = new Uint8Array([5, 6, 7, 8]);
    expect(bytesToHex(b)).toBe('05060708');
    expect(hexToBytes('05060708')).toEqual(b);
  });
  it('round-trip #6', () => {
    const b = new Uint8Array([6, 7, 8, 9]);
    expect(bytesToHex(b)).toBe('06070809');
    expect(hexToBytes('06070809')).toEqual(b);
  });
  it('round-trip #7', () => {
    const b = new Uint8Array([7, 8, 9, 10]);
    expect(bytesToHex(b)).toBe('0708090a');
    expect(hexToBytes('0708090a')).toEqual(b);
  });
  it('round-trip #8', () => {
    const b = new Uint8Array([8, 9, 10, 11]);
    expect(bytesToHex(b)).toBe('08090a0b');
    expect(hexToBytes('08090a0b')).toEqual(b);
  });
  it('round-trip #9', () => {
    const b = new Uint8Array([9, 10, 11, 12]);
    expect(bytesToHex(b)).toBe('090a0b0c');
    expect(hexToBytes('090a0b0c')).toEqual(b);
  });
  it('round-trip #10', () => {
    const b = new Uint8Array([10, 11, 12, 13]);
    expect(bytesToHex(b)).toBe('0a0b0c0d');
    expect(hexToBytes('0a0b0c0d')).toEqual(b);
  });
  it('round-trip #11', () => {
    const b = new Uint8Array([11, 12, 13, 14]);
    expect(bytesToHex(b)).toBe('0b0c0d0e');
    expect(hexToBytes('0b0c0d0e')).toEqual(b);
  });
  it('round-trip #12', () => {
    const b = new Uint8Array([12, 13, 14, 15]);
    expect(bytesToHex(b)).toBe('0c0d0e0f');
    expect(hexToBytes('0c0d0e0f')).toEqual(b);
  });
  it('round-trip #13', () => {
    const b = new Uint8Array([13, 14, 15, 16]);
    expect(bytesToHex(b)).toBe('0d0e0f10');
    expect(hexToBytes('0d0e0f10')).toEqual(b);
  });
  it('round-trip #14', () => {
    const b = new Uint8Array([14, 15, 16, 17]);
    expect(bytesToHex(b)).toBe('0e0f1011');
    expect(hexToBytes('0e0f1011')).toEqual(b);
  });
  it('round-trip #15', () => {
    const b = new Uint8Array([15, 16, 17, 18]);
    expect(bytesToHex(b)).toBe('0f101112');
    expect(hexToBytes('0f101112')).toEqual(b);
  });
  it('round-trip #16', () => {
    const b = new Uint8Array([16, 17, 18, 19]);
    expect(bytesToHex(b)).toBe('10111213');
    expect(hexToBytes('10111213')).toEqual(b);
  });
  it('round-trip #17', () => {
    const b = new Uint8Array([17, 18, 19, 20]);
    expect(bytesToHex(b)).toBe('11121314');
    expect(hexToBytes('11121314')).toEqual(b);
  });
  it('round-trip #18', () => {
    const b = new Uint8Array([18, 19, 20, 21]);
    expect(bytesToHex(b)).toBe('12131415');
    expect(hexToBytes('12131415')).toEqual(b);
  });
  it('round-trip #19', () => {
    const b = new Uint8Array([19, 20, 21, 22]);
    expect(bytesToHex(b)).toBe('13141516');
    expect(hexToBytes('13141516')).toEqual(b);
  });
  it('round-trip #20', () => {
    const b = new Uint8Array([20, 21, 22, 23]);
    expect(bytesToHex(b)).toBe('14151617');
    expect(hexToBytes('14151617')).toEqual(b);
  });
  it('round-trip #21', () => {
    const b = new Uint8Array([21, 22, 23, 24]);
    expect(bytesToHex(b)).toBe('15161718');
    expect(hexToBytes('15161718')).toEqual(b);
  });
  it('round-trip #22', () => {
    const b = new Uint8Array([22, 23, 24, 25]);
    expect(bytesToHex(b)).toBe('16171819');
    expect(hexToBytes('16171819')).toEqual(b);
  });
  it('round-trip #23', () => {
    const b = new Uint8Array([23, 24, 25, 26]);
    expect(bytesToHex(b)).toBe('1718191a');
    expect(hexToBytes('1718191a')).toEqual(b);
  });
  it('round-trip #24', () => {
    const b = new Uint8Array([24, 25, 26, 27]);
    expect(bytesToHex(b)).toBe('18191a1b');
    expect(hexToBytes('18191a1b')).toEqual(b);
  });
  it('round-trip #25', () => {
    const b = new Uint8Array([25, 26, 27, 28]);
    expect(bytesToHex(b)).toBe('191a1b1c');
    expect(hexToBytes('191a1b1c')).toEqual(b);
  });
  it('round-trip #26', () => {
    const b = new Uint8Array([26, 27, 28, 29]);
    expect(bytesToHex(b)).toBe('1a1b1c1d');
    expect(hexToBytes('1a1b1c1d')).toEqual(b);
  });
  it('round-trip #27', () => {
    const b = new Uint8Array([27, 28, 29, 30]);
    expect(bytesToHex(b)).toBe('1b1c1d1e');
    expect(hexToBytes('1b1c1d1e')).toEqual(b);
  });
  it('round-trip #28', () => {
    const b = new Uint8Array([28, 29, 30, 31]);
    expect(bytesToHex(b)).toBe('1c1d1e1f');
    expect(hexToBytes('1c1d1e1f')).toEqual(b);
  });
  it('round-trip #29', () => {
    const b = new Uint8Array([29, 30, 31, 32]);
    expect(bytesToHex(b)).toBe('1d1e1f20');
    expect(hexToBytes('1d1e1f20')).toEqual(b);
  });
  it('round-trip #30', () => {
    const b = new Uint8Array([30, 31, 32, 33]);
    expect(bytesToHex(b)).toBe('1e1f2021');
    expect(hexToBytes('1e1f2021')).toEqual(b);
  });
  it('round-trip #31', () => {
    const b = new Uint8Array([31, 32, 33, 34]);
    expect(bytesToHex(b)).toBe('1f202122');
    expect(hexToBytes('1f202122')).toEqual(b);
  });
  it('round-trip #32', () => {
    const b = new Uint8Array([32, 33, 34, 35]);
    expect(bytesToHex(b)).toBe('20212223');
    expect(hexToBytes('20212223')).toEqual(b);
  });
  it('round-trip #33', () => {
    const b = new Uint8Array([33, 34, 35, 36]);
    expect(bytesToHex(b)).toBe('21222324');
    expect(hexToBytes('21222324')).toEqual(b);
  });
  it('round-trip #34', () => {
    const b = new Uint8Array([34, 35, 36, 37]);
    expect(bytesToHex(b)).toBe('22232425');
    expect(hexToBytes('22232425')).toEqual(b);
  });
  it('round-trip #35', () => {
    const b = new Uint8Array([35, 36, 37, 38]);
    expect(bytesToHex(b)).toBe('23242526');
    expect(hexToBytes('23242526')).toEqual(b);
  });
  it('round-trip #36', () => {
    const b = new Uint8Array([36, 37, 38, 39]);
    expect(bytesToHex(b)).toBe('24252627');
    expect(hexToBytes('24252627')).toEqual(b);
  });
  it('round-trip #37', () => {
    const b = new Uint8Array([37, 38, 39, 40]);
    expect(bytesToHex(b)).toBe('25262728');
    expect(hexToBytes('25262728')).toEqual(b);
  });
  it('round-trip #38', () => {
    const b = new Uint8Array([38, 39, 40, 41]);
    expect(bytesToHex(b)).toBe('26272829');
    expect(hexToBytes('26272829')).toEqual(b);
  });
  it('round-trip #39', () => {
    const b = new Uint8Array([39, 40, 41, 42]);
    expect(bytesToHex(b)).toBe('2728292a');
    expect(hexToBytes('2728292a')).toEqual(b);
  });
  it('round-trip #40', () => {
    const b = new Uint8Array([40, 41, 42, 43]);
    expect(bytesToHex(b)).toBe('28292a2b');
    expect(hexToBytes('28292a2b')).toEqual(b);
  });
  it('round-trip #41', () => {
    const b = new Uint8Array([41, 42, 43, 44]);
    expect(bytesToHex(b)).toBe('292a2b2c');
    expect(hexToBytes('292a2b2c')).toEqual(b);
  });
  it('round-trip #42', () => {
    const b = new Uint8Array([42, 43, 44, 45]);
    expect(bytesToHex(b)).toBe('2a2b2c2d');
    expect(hexToBytes('2a2b2c2d')).toEqual(b);
  });
  it('round-trip #43', () => {
    const b = new Uint8Array([43, 44, 45, 46]);
    expect(bytesToHex(b)).toBe('2b2c2d2e');
    expect(hexToBytes('2b2c2d2e')).toEqual(b);
  });
  it('round-trip #44', () => {
    const b = new Uint8Array([44, 45, 46, 47]);
    expect(bytesToHex(b)).toBe('2c2d2e2f');
    expect(hexToBytes('2c2d2e2f')).toEqual(b);
  });
  it('round-trip #45', () => {
    const b = new Uint8Array([45, 46, 47, 48]);
    expect(bytesToHex(b)).toBe('2d2e2f30');
    expect(hexToBytes('2d2e2f30')).toEqual(b);
  });
  it('round-trip #46', () => {
    const b = new Uint8Array([46, 47, 48, 49]);
    expect(bytesToHex(b)).toBe('2e2f3031');
    expect(hexToBytes('2e2f3031')).toEqual(b);
  });
  it('round-trip #47', () => {
    const b = new Uint8Array([47, 48, 49, 50]);
    expect(bytesToHex(b)).toBe('2f303132');
    expect(hexToBytes('2f303132')).toEqual(b);
  });
  it('round-trip #48', () => {
    const b = new Uint8Array([48, 49, 50, 51]);
    expect(bytesToHex(b)).toBe('30313233');
    expect(hexToBytes('30313233')).toEqual(b);
  });
  it('round-trip #49', () => {
    const b = new Uint8Array([49, 50, 51, 52]);
    expect(bytesToHex(b)).toBe('31323334');
    expect(hexToBytes('31323334')).toEqual(b);
  });
  it('round-trip #50', () => {
    const b = new Uint8Array([50, 51, 52, 53]);
    expect(bytesToHex(b)).toBe('32333435');
    expect(hexToBytes('32333435')).toEqual(b);
  });
  it('hexToBytes->bytesToHex identity #1', () => { const h = '0001'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #2', () => { const h = '0002'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #3', () => { const h = '0003'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #4', () => { const h = '0004'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #5', () => { const h = '0005'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #6', () => { const h = '0006'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #7', () => { const h = '0007'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #8', () => { const h = '0008'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #9', () => { const h = '0009'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #10', () => { const h = '000a'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #11', () => { const h = '000b'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #12', () => { const h = '000c'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #13', () => { const h = '000d'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #14', () => { const h = '000e'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #15', () => { const h = '000f'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #16', () => { const h = '0010'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #17', () => { const h = '0011'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #18', () => { const h = '0012'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #19', () => { const h = '0013'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #20', () => { const h = '0014'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #21', () => { const h = '0015'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #22', () => { const h = '0016'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #23', () => { const h = '0017'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #24', () => { const h = '0018'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #25', () => { const h = '0019'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #26', () => { const h = '001a'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #27', () => { const h = '001b'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #28', () => { const h = '001c'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #29', () => { const h = '001d'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #30', () => { const h = '001e'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #31', () => { const h = '001f'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #32', () => { const h = '0020'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #33', () => { const h = '0021'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #34', () => { const h = '0022'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #35', () => { const h = '0023'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #36', () => { const h = '0024'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #37', () => { const h = '0025'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #38', () => { const h = '0026'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #39', () => { const h = '0027'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #40', () => { const h = '0028'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #41', () => { const h = '0029'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #42', () => { const h = '002a'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #43', () => { const h = '002b'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #44', () => { const h = '002c'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #45', () => { const h = '002d'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #46', () => { const h = '002e'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #47', () => { const h = '002f'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #48', () => { const h = '0030'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #49', () => { const h = '0031'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
  it('hexToBytes->bytesToHex identity #50', () => { const h = '0032'; expect(bytesToHex(hexToBytes(h))).toBe(h); });
});

describe('bytesToBase64 / base64ToBytes round-trip', () => {
  it('base64 round-trip #1', () => {
    const b = new Uint8Array([1, 2, 3, 4]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #2', () => {
    const b = new Uint8Array([2, 4, 6, 8]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #3', () => {
    const b = new Uint8Array([3, 6, 9, 12]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #4', () => {
    const b = new Uint8Array([4, 8, 12, 16]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #5', () => {
    const b = new Uint8Array([5, 10, 15, 20]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #6', () => {
    const b = new Uint8Array([6, 12, 18, 24]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #7', () => {
    const b = new Uint8Array([7, 14, 21, 28]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #8', () => {
    const b = new Uint8Array([8, 16, 24, 32]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #9', () => {
    const b = new Uint8Array([9, 18, 27, 36]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #10', () => {
    const b = new Uint8Array([10, 20, 30, 40]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #11', () => {
    const b = new Uint8Array([11, 22, 33, 44]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #12', () => {
    const b = new Uint8Array([12, 24, 36, 48]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #13', () => {
    const b = new Uint8Array([13, 26, 39, 52]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #14', () => {
    const b = new Uint8Array([14, 28, 42, 56]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #15', () => {
    const b = new Uint8Array([15, 30, 45, 60]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #16', () => {
    const b = new Uint8Array([16, 32, 48, 64]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #17', () => {
    const b = new Uint8Array([17, 34, 51, 68]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #18', () => {
    const b = new Uint8Array([18, 36, 54, 72]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #19', () => {
    const b = new Uint8Array([19, 38, 57, 76]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #20', () => {
    const b = new Uint8Array([20, 40, 60, 80]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #21', () => {
    const b = new Uint8Array([21, 42, 63, 84]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #22', () => {
    const b = new Uint8Array([22, 44, 66, 88]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #23', () => {
    const b = new Uint8Array([23, 46, 69, 92]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #24', () => {
    const b = new Uint8Array([24, 48, 72, 96]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #25', () => {
    const b = new Uint8Array([25, 50, 75, 100]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #26', () => {
    const b = new Uint8Array([26, 52, 78, 104]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #27', () => {
    const b = new Uint8Array([27, 54, 81, 108]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #28', () => {
    const b = new Uint8Array([28, 56, 84, 112]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #29', () => {
    const b = new Uint8Array([29, 58, 87, 116]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #30', () => {
    const b = new Uint8Array([30, 60, 90, 120]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #31', () => {
    const b = new Uint8Array([31, 62, 93, 124]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #32', () => {
    const b = new Uint8Array([32, 64, 96, 128]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #33', () => {
    const b = new Uint8Array([33, 66, 99, 132]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #34', () => {
    const b = new Uint8Array([34, 68, 102, 136]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #35', () => {
    const b = new Uint8Array([35, 70, 105, 140]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #36', () => {
    const b = new Uint8Array([36, 72, 108, 144]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #37', () => {
    const b = new Uint8Array([37, 74, 111, 148]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #38', () => {
    const b = new Uint8Array([38, 76, 114, 152]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #39', () => {
    const b = new Uint8Array([39, 78, 117, 156]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #40', () => {
    const b = new Uint8Array([40, 80, 120, 160]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #41', () => {
    const b = new Uint8Array([41, 82, 123, 164]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #42', () => {
    const b = new Uint8Array([42, 84, 126, 168]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #43', () => {
    const b = new Uint8Array([43, 86, 129, 172]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #44', () => {
    const b = new Uint8Array([44, 88, 132, 176]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #45', () => {
    const b = new Uint8Array([45, 90, 135, 180]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #46', () => {
    const b = new Uint8Array([46, 92, 138, 184]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #47', () => {
    const b = new Uint8Array([47, 94, 141, 188]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #48', () => {
    const b = new Uint8Array([48, 96, 144, 192]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #49', () => {
    const b = new Uint8Array([49, 98, 147, 196]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #50', () => {
    const b = new Uint8Array([50, 100, 150, 200]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #51', () => {
    const b = new Uint8Array([51, 102, 153, 204]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #52', () => {
    const b = new Uint8Array([52, 104, 156, 208]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #53', () => {
    const b = new Uint8Array([53, 106, 159, 212]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #54', () => {
    const b = new Uint8Array([54, 108, 162, 216]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #55', () => {
    const b = new Uint8Array([55, 110, 165, 220]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #56', () => {
    const b = new Uint8Array([56, 112, 168, 224]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #57', () => {
    const b = new Uint8Array([57, 114, 171, 228]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #58', () => {
    const b = new Uint8Array([58, 116, 174, 232]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #59', () => {
    const b = new Uint8Array([59, 118, 177, 236]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #60', () => {
    const b = new Uint8Array([60, 120, 180, 240]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #61', () => {
    const b = new Uint8Array([61, 122, 183, 244]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #62', () => {
    const b = new Uint8Array([62, 124, 186, 248]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #63', () => {
    const b = new Uint8Array([63, 126, 189, 252]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #64', () => {
    const b = new Uint8Array([64, 128, 192, 0]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #65', () => {
    const b = new Uint8Array([65, 130, 195, 4]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #66', () => {
    const b = new Uint8Array([66, 132, 198, 8]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #67', () => {
    const b = new Uint8Array([67, 134, 201, 12]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #68', () => {
    const b = new Uint8Array([68, 136, 204, 16]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #69', () => {
    const b = new Uint8Array([69, 138, 207, 20]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #70', () => {
    const b = new Uint8Array([70, 140, 210, 24]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #71', () => {
    const b = new Uint8Array([71, 142, 213, 28]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #72', () => {
    const b = new Uint8Array([72, 144, 216, 32]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #73', () => {
    const b = new Uint8Array([73, 146, 219, 36]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #74', () => {
    const b = new Uint8Array([74, 148, 222, 40]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #75', () => {
    const b = new Uint8Array([75, 150, 225, 44]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #76', () => {
    const b = new Uint8Array([76, 152, 228, 48]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #77', () => {
    const b = new Uint8Array([77, 154, 231, 52]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #78', () => {
    const b = new Uint8Array([78, 156, 234, 56]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #79', () => {
    const b = new Uint8Array([79, 158, 237, 60]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #80', () => {
    const b = new Uint8Array([80, 160, 240, 64]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #81', () => {
    const b = new Uint8Array([81, 162, 243, 68]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #82', () => {
    const b = new Uint8Array([82, 164, 246, 72]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #83', () => {
    const b = new Uint8Array([83, 166, 249, 76]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #84', () => {
    const b = new Uint8Array([84, 168, 252, 80]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #85', () => {
    const b = new Uint8Array([85, 170, 255, 84]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #86', () => {
    const b = new Uint8Array([86, 172, 2, 88]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #87', () => {
    const b = new Uint8Array([87, 174, 5, 92]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #88', () => {
    const b = new Uint8Array([88, 176, 8, 96]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #89', () => {
    const b = new Uint8Array([89, 178, 11, 100]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #90', () => {
    const b = new Uint8Array([90, 180, 14, 104]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #91', () => {
    const b = new Uint8Array([91, 182, 17, 108]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #92', () => {
    const b = new Uint8Array([92, 184, 20, 112]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #93', () => {
    const b = new Uint8Array([93, 186, 23, 116]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #94', () => {
    const b = new Uint8Array([94, 188, 26, 120]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #95', () => {
    const b = new Uint8Array([95, 190, 29, 124]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #96', () => {
    const b = new Uint8Array([96, 192, 32, 128]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #97', () => {
    const b = new Uint8Array([97, 194, 35, 132]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #98', () => {
    const b = new Uint8Array([98, 196, 38, 136]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #99', () => {
    const b = new Uint8Array([99, 198, 41, 140]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
  it('base64 round-trip #100', () => {
    const b = new Uint8Array([100, 200, 44, 144]);
    expect(base64ToBytes(bytesToBase64(b))).toEqual(b);
  });
});

describe('bytesToUtf8 / utf8ToBytes round-trip', () => {
  it('utf8 round-trip "world1" #1', () => {
    expect(bytesToUtf8(utf8ToBytes('world1'))).toBe('world1');
  });
  it('utf8 round-trip "nexara2" #2', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara2'))).toBe('nexara2');
  });
  it('utf8 round-trip "ims3" #3', () => {
    expect(bytesToUtf8(utf8ToBytes('ims3'))).toBe('ims3');
  });
  it('utf8 round-trip "crypto4" #4', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto4'))).toBe('crypto4');
  });
  it('utf8 round-trip "test5" #5', () => {
    expect(bytesToUtf8(utf8ToBytes('test5'))).toBe('test5');
  });
  it('utf8 round-trip "data6" #6', () => {
    expect(bytesToUtf8(utf8ToBytes('data6'))).toBe('data6');
  });
  it('utf8 round-trip "bytes7" #7', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes7'))).toBe('bytes7');
  });
  it('utf8 round-trip "utf88" #8', () => {
    expect(bytesToUtf8(utf8ToBytes('utf88'))).toBe('utf88');
  });
  it('utf8 round-trip "encode9" #9', () => {
    expect(bytesToUtf8(utf8ToBytes('encode9'))).toBe('encode9');
  });
  it('utf8 round-trip "hello10" #10', () => {
    expect(bytesToUtf8(utf8ToBytes('hello10'))).toBe('hello10');
  });
  it('utf8 round-trip "world11" #11', () => {
    expect(bytesToUtf8(utf8ToBytes('world11'))).toBe('world11');
  });
  it('utf8 round-trip "nexara12" #12', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara12'))).toBe('nexara12');
  });
  it('utf8 round-trip "ims13" #13', () => {
    expect(bytesToUtf8(utf8ToBytes('ims13'))).toBe('ims13');
  });
  it('utf8 round-trip "crypto14" #14', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto14'))).toBe('crypto14');
  });
  it('utf8 round-trip "test15" #15', () => {
    expect(bytesToUtf8(utf8ToBytes('test15'))).toBe('test15');
  });
  it('utf8 round-trip "data16" #16', () => {
    expect(bytesToUtf8(utf8ToBytes('data16'))).toBe('data16');
  });
  it('utf8 round-trip "bytes17" #17', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes17'))).toBe('bytes17');
  });
  it('utf8 round-trip "utf818" #18', () => {
    expect(bytesToUtf8(utf8ToBytes('utf818'))).toBe('utf818');
  });
  it('utf8 round-trip "encode19" #19', () => {
    expect(bytesToUtf8(utf8ToBytes('encode19'))).toBe('encode19');
  });
  it('utf8 round-trip "hello20" #20', () => {
    expect(bytesToUtf8(utf8ToBytes('hello20'))).toBe('hello20');
  });
  it('utf8 round-trip "world21" #21', () => {
    expect(bytesToUtf8(utf8ToBytes('world21'))).toBe('world21');
  });
  it('utf8 round-trip "nexara22" #22', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara22'))).toBe('nexara22');
  });
  it('utf8 round-trip "ims23" #23', () => {
    expect(bytesToUtf8(utf8ToBytes('ims23'))).toBe('ims23');
  });
  it('utf8 round-trip "crypto24" #24', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto24'))).toBe('crypto24');
  });
  it('utf8 round-trip "test25" #25', () => {
    expect(bytesToUtf8(utf8ToBytes('test25'))).toBe('test25');
  });
  it('utf8 round-trip "data26" #26', () => {
    expect(bytesToUtf8(utf8ToBytes('data26'))).toBe('data26');
  });
  it('utf8 round-trip "bytes27" #27', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes27'))).toBe('bytes27');
  });
  it('utf8 round-trip "utf828" #28', () => {
    expect(bytesToUtf8(utf8ToBytes('utf828'))).toBe('utf828');
  });
  it('utf8 round-trip "encode29" #29', () => {
    expect(bytesToUtf8(utf8ToBytes('encode29'))).toBe('encode29');
  });
  it('utf8 round-trip "hello30" #30', () => {
    expect(bytesToUtf8(utf8ToBytes('hello30'))).toBe('hello30');
  });
  it('utf8 round-trip "world31" #31', () => {
    expect(bytesToUtf8(utf8ToBytes('world31'))).toBe('world31');
  });
  it('utf8 round-trip "nexara32" #32', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara32'))).toBe('nexara32');
  });
  it('utf8 round-trip "ims33" #33', () => {
    expect(bytesToUtf8(utf8ToBytes('ims33'))).toBe('ims33');
  });
  it('utf8 round-trip "crypto34" #34', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto34'))).toBe('crypto34');
  });
  it('utf8 round-trip "test35" #35', () => {
    expect(bytesToUtf8(utf8ToBytes('test35'))).toBe('test35');
  });
  it('utf8 round-trip "data36" #36', () => {
    expect(bytesToUtf8(utf8ToBytes('data36'))).toBe('data36');
  });
  it('utf8 round-trip "bytes37" #37', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes37'))).toBe('bytes37');
  });
  it('utf8 round-trip "utf838" #38', () => {
    expect(bytesToUtf8(utf8ToBytes('utf838'))).toBe('utf838');
  });
  it('utf8 round-trip "encode39" #39', () => {
    expect(bytesToUtf8(utf8ToBytes('encode39'))).toBe('encode39');
  });
  it('utf8 round-trip "hello40" #40', () => {
    expect(bytesToUtf8(utf8ToBytes('hello40'))).toBe('hello40');
  });
  it('utf8 round-trip "world41" #41', () => {
    expect(bytesToUtf8(utf8ToBytes('world41'))).toBe('world41');
  });
  it('utf8 round-trip "nexara42" #42', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara42'))).toBe('nexara42');
  });
  it('utf8 round-trip "ims43" #43', () => {
    expect(bytesToUtf8(utf8ToBytes('ims43'))).toBe('ims43');
  });
  it('utf8 round-trip "crypto44" #44', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto44'))).toBe('crypto44');
  });
  it('utf8 round-trip "test45" #45', () => {
    expect(bytesToUtf8(utf8ToBytes('test45'))).toBe('test45');
  });
  it('utf8 round-trip "data46" #46', () => {
    expect(bytesToUtf8(utf8ToBytes('data46'))).toBe('data46');
  });
  it('utf8 round-trip "bytes47" #47', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes47'))).toBe('bytes47');
  });
  it('utf8 round-trip "utf848" #48', () => {
    expect(bytesToUtf8(utf8ToBytes('utf848'))).toBe('utf848');
  });
  it('utf8 round-trip "encode49" #49', () => {
    expect(bytesToUtf8(utf8ToBytes('encode49'))).toBe('encode49');
  });
  it('utf8 round-trip "hello50" #50', () => {
    expect(bytesToUtf8(utf8ToBytes('hello50'))).toBe('hello50');
  });
  it('utf8 round-trip "world51" #51', () => {
    expect(bytesToUtf8(utf8ToBytes('world51'))).toBe('world51');
  });
  it('utf8 round-trip "nexara52" #52', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara52'))).toBe('nexara52');
  });
  it('utf8 round-trip "ims53" #53', () => {
    expect(bytesToUtf8(utf8ToBytes('ims53'))).toBe('ims53');
  });
  it('utf8 round-trip "crypto54" #54', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto54'))).toBe('crypto54');
  });
  it('utf8 round-trip "test55" #55', () => {
    expect(bytesToUtf8(utf8ToBytes('test55'))).toBe('test55');
  });
  it('utf8 round-trip "data56" #56', () => {
    expect(bytesToUtf8(utf8ToBytes('data56'))).toBe('data56');
  });
  it('utf8 round-trip "bytes57" #57', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes57'))).toBe('bytes57');
  });
  it('utf8 round-trip "utf858" #58', () => {
    expect(bytesToUtf8(utf8ToBytes('utf858'))).toBe('utf858');
  });
  it('utf8 round-trip "encode59" #59', () => {
    expect(bytesToUtf8(utf8ToBytes('encode59'))).toBe('encode59');
  });
  it('utf8 round-trip "hello60" #60', () => {
    expect(bytesToUtf8(utf8ToBytes('hello60'))).toBe('hello60');
  });
  it('utf8 round-trip "world61" #61', () => {
    expect(bytesToUtf8(utf8ToBytes('world61'))).toBe('world61');
  });
  it('utf8 round-trip "nexara62" #62', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara62'))).toBe('nexara62');
  });
  it('utf8 round-trip "ims63" #63', () => {
    expect(bytesToUtf8(utf8ToBytes('ims63'))).toBe('ims63');
  });
  it('utf8 round-trip "crypto64" #64', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto64'))).toBe('crypto64');
  });
  it('utf8 round-trip "test65" #65', () => {
    expect(bytesToUtf8(utf8ToBytes('test65'))).toBe('test65');
  });
  it('utf8 round-trip "data66" #66', () => {
    expect(bytesToUtf8(utf8ToBytes('data66'))).toBe('data66');
  });
  it('utf8 round-trip "bytes67" #67', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes67'))).toBe('bytes67');
  });
  it('utf8 round-trip "utf868" #68', () => {
    expect(bytesToUtf8(utf8ToBytes('utf868'))).toBe('utf868');
  });
  it('utf8 round-trip "encode69" #69', () => {
    expect(bytesToUtf8(utf8ToBytes('encode69'))).toBe('encode69');
  });
  it('utf8 round-trip "hello70" #70', () => {
    expect(bytesToUtf8(utf8ToBytes('hello70'))).toBe('hello70');
  });
  it('utf8 round-trip "world71" #71', () => {
    expect(bytesToUtf8(utf8ToBytes('world71'))).toBe('world71');
  });
  it('utf8 round-trip "nexara72" #72', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara72'))).toBe('nexara72');
  });
  it('utf8 round-trip "ims73" #73', () => {
    expect(bytesToUtf8(utf8ToBytes('ims73'))).toBe('ims73');
  });
  it('utf8 round-trip "crypto74" #74', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto74'))).toBe('crypto74');
  });
  it('utf8 round-trip "test75" #75', () => {
    expect(bytesToUtf8(utf8ToBytes('test75'))).toBe('test75');
  });
  it('utf8 round-trip "data76" #76', () => {
    expect(bytesToUtf8(utf8ToBytes('data76'))).toBe('data76');
  });
  it('utf8 round-trip "bytes77" #77', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes77'))).toBe('bytes77');
  });
  it('utf8 round-trip "utf878" #78', () => {
    expect(bytesToUtf8(utf8ToBytes('utf878'))).toBe('utf878');
  });
  it('utf8 round-trip "encode79" #79', () => {
    expect(bytesToUtf8(utf8ToBytes('encode79'))).toBe('encode79');
  });
  it('utf8 round-trip "hello80" #80', () => {
    expect(bytesToUtf8(utf8ToBytes('hello80'))).toBe('hello80');
  });
  it('utf8 round-trip "world81" #81', () => {
    expect(bytesToUtf8(utf8ToBytes('world81'))).toBe('world81');
  });
  it('utf8 round-trip "nexara82" #82', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara82'))).toBe('nexara82');
  });
  it('utf8 round-trip "ims83" #83', () => {
    expect(bytesToUtf8(utf8ToBytes('ims83'))).toBe('ims83');
  });
  it('utf8 round-trip "crypto84" #84', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto84'))).toBe('crypto84');
  });
  it('utf8 round-trip "test85" #85', () => {
    expect(bytesToUtf8(utf8ToBytes('test85'))).toBe('test85');
  });
  it('utf8 round-trip "data86" #86', () => {
    expect(bytesToUtf8(utf8ToBytes('data86'))).toBe('data86');
  });
  it('utf8 round-trip "bytes87" #87', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes87'))).toBe('bytes87');
  });
  it('utf8 round-trip "utf888" #88', () => {
    expect(bytesToUtf8(utf8ToBytes('utf888'))).toBe('utf888');
  });
  it('utf8 round-trip "encode89" #89', () => {
    expect(bytesToUtf8(utf8ToBytes('encode89'))).toBe('encode89');
  });
  it('utf8 round-trip "hello90" #90', () => {
    expect(bytesToUtf8(utf8ToBytes('hello90'))).toBe('hello90');
  });
  it('utf8 round-trip "world91" #91', () => {
    expect(bytesToUtf8(utf8ToBytes('world91'))).toBe('world91');
  });
  it('utf8 round-trip "nexara92" #92', () => {
    expect(bytesToUtf8(utf8ToBytes('nexara92'))).toBe('nexara92');
  });
  it('utf8 round-trip "ims93" #93', () => {
    expect(bytesToUtf8(utf8ToBytes('ims93'))).toBe('ims93');
  });
  it('utf8 round-trip "crypto94" #94', () => {
    expect(bytesToUtf8(utf8ToBytes('crypto94'))).toBe('crypto94');
  });
  it('utf8 round-trip "test95" #95', () => {
    expect(bytesToUtf8(utf8ToBytes('test95'))).toBe('test95');
  });
  it('utf8 round-trip "data96" #96', () => {
    expect(bytesToUtf8(utf8ToBytes('data96'))).toBe('data96');
  });
  it('utf8 round-trip "bytes97" #97', () => {
    expect(bytesToUtf8(utf8ToBytes('bytes97'))).toBe('bytes97');
  });
  it('utf8 round-trip "utf898" #98', () => {
    expect(bytesToUtf8(utf8ToBytes('utf898'))).toBe('utf898');
  });
  it('utf8 round-trip "encode99" #99', () => {
    expect(bytesToUtf8(utf8ToBytes('encode99'))).toBe('encode99');
  });
  it('utf8 round-trip "hello100" #100', () => {
    expect(bytesToUtf8(utf8ToBytes('hello100'))).toBe('hello100');
  });
});

describe('xor', () => {
  it('xor with zeros is identity #1', () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #2', () => {
    const a = new Uint8Array([2, 3, 4, 5]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #3', () => {
    const a = new Uint8Array([3, 4, 5, 6]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #4', () => {
    const a = new Uint8Array([4, 5, 6, 7]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #5', () => {
    const a = new Uint8Array([5, 6, 7, 8]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #6', () => {
    const a = new Uint8Array([6, 7, 8, 9]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #7', () => {
    const a = new Uint8Array([7, 8, 9, 10]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #8', () => {
    const a = new Uint8Array([8, 9, 10, 11]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #9', () => {
    const a = new Uint8Array([9, 10, 11, 12]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #10', () => {
    const a = new Uint8Array([10, 11, 12, 13]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #11', () => {
    const a = new Uint8Array([11, 12, 13, 14]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #12', () => {
    const a = new Uint8Array([12, 13, 14, 15]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #13', () => {
    const a = new Uint8Array([13, 14, 15, 16]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #14', () => {
    const a = new Uint8Array([14, 15, 16, 17]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #15', () => {
    const a = new Uint8Array([15, 16, 17, 18]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #16', () => {
    const a = new Uint8Array([16, 17, 18, 19]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #17', () => {
    const a = new Uint8Array([17, 18, 19, 20]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #18', () => {
    const a = new Uint8Array([18, 19, 20, 21]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #19', () => {
    const a = new Uint8Array([19, 20, 21, 22]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #20', () => {
    const a = new Uint8Array([20, 21, 22, 23]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #21', () => {
    const a = new Uint8Array([21, 22, 23, 24]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #22', () => {
    const a = new Uint8Array([22, 23, 24, 25]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #23', () => {
    const a = new Uint8Array([23, 24, 25, 26]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #24', () => {
    const a = new Uint8Array([24, 25, 26, 27]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #25', () => {
    const a = new Uint8Array([25, 26, 27, 28]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #26', () => {
    const a = new Uint8Array([26, 27, 28, 29]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #27', () => {
    const a = new Uint8Array([27, 28, 29, 30]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #28', () => {
    const a = new Uint8Array([28, 29, 30, 31]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #29', () => {
    const a = new Uint8Array([29, 30, 31, 32]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #30', () => {
    const a = new Uint8Array([30, 31, 32, 33]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #31', () => {
    const a = new Uint8Array([31, 32, 33, 34]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #32', () => {
    const a = new Uint8Array([32, 33, 34, 35]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #33', () => {
    const a = new Uint8Array([33, 34, 35, 36]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #34', () => {
    const a = new Uint8Array([34, 35, 36, 37]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #35', () => {
    const a = new Uint8Array([35, 36, 37, 38]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #36', () => {
    const a = new Uint8Array([36, 37, 38, 39]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #37', () => {
    const a = new Uint8Array([37, 38, 39, 40]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #38', () => {
    const a = new Uint8Array([38, 39, 40, 41]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #39', () => {
    const a = new Uint8Array([39, 40, 41, 42]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #40', () => {
    const a = new Uint8Array([40, 41, 42, 43]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #41', () => {
    const a = new Uint8Array([41, 42, 43, 44]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #42', () => {
    const a = new Uint8Array([42, 43, 44, 45]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #43', () => {
    const a = new Uint8Array([43, 44, 45, 46]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #44', () => {
    const a = new Uint8Array([44, 45, 46, 47]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #45', () => {
    const a = new Uint8Array([45, 46, 47, 48]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #46', () => {
    const a = new Uint8Array([46, 47, 48, 49]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #47', () => {
    const a = new Uint8Array([47, 48, 49, 50]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #48', () => {
    const a = new Uint8Array([48, 49, 50, 51]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #49', () => {
    const a = new Uint8Array([49, 50, 51, 52]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with zeros is identity #50', () => {
    const a = new Uint8Array([50, 51, 52, 53]);
    const z = new Uint8Array(4);
    expect(xor(a, z)).toEqual(a);
  });
  it('xor with self is zeros #1', () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #2', () => {
    const a = new Uint8Array([2, 4, 6, 8]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #3', () => {
    const a = new Uint8Array([3, 6, 9, 12]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #4', () => {
    const a = new Uint8Array([4, 8, 12, 16]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #5', () => {
    const a = new Uint8Array([5, 10, 15, 20]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #6', () => {
    const a = new Uint8Array([6, 12, 18, 24]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #7', () => {
    const a = new Uint8Array([7, 14, 21, 28]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #8', () => {
    const a = new Uint8Array([8, 16, 24, 32]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #9', () => {
    const a = new Uint8Array([9, 18, 27, 36]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #10', () => {
    const a = new Uint8Array([10, 20, 30, 40]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #11', () => {
    const a = new Uint8Array([11, 22, 33, 44]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #12', () => {
    const a = new Uint8Array([12, 24, 36, 48]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #13', () => {
    const a = new Uint8Array([13, 26, 39, 52]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #14', () => {
    const a = new Uint8Array([14, 28, 42, 56]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #15', () => {
    const a = new Uint8Array([15, 30, 45, 60]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #16', () => {
    const a = new Uint8Array([16, 32, 48, 64]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #17', () => {
    const a = new Uint8Array([17, 34, 51, 68]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #18', () => {
    const a = new Uint8Array([18, 36, 54, 72]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #19', () => {
    const a = new Uint8Array([19, 38, 57, 76]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #20', () => {
    const a = new Uint8Array([20, 40, 60, 80]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #21', () => {
    const a = new Uint8Array([21, 42, 63, 84]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #22', () => {
    const a = new Uint8Array([22, 44, 66, 88]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #23', () => {
    const a = new Uint8Array([23, 46, 69, 92]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #24', () => {
    const a = new Uint8Array([24, 48, 72, 96]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #25', () => {
    const a = new Uint8Array([25, 50, 75, 100]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #26', () => {
    const a = new Uint8Array([26, 52, 78, 104]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #27', () => {
    const a = new Uint8Array([27, 54, 81, 108]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #28', () => {
    const a = new Uint8Array([28, 56, 84, 112]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #29', () => {
    const a = new Uint8Array([29, 58, 87, 116]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #30', () => {
    const a = new Uint8Array([30, 60, 90, 120]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #31', () => {
    const a = new Uint8Array([31, 62, 93, 124]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #32', () => {
    const a = new Uint8Array([32, 64, 96, 128]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #33', () => {
    const a = new Uint8Array([33, 66, 99, 132]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #34', () => {
    const a = new Uint8Array([34, 68, 102, 136]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #35', () => {
    const a = new Uint8Array([35, 70, 105, 140]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #36', () => {
    const a = new Uint8Array([36, 72, 108, 144]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #37', () => {
    const a = new Uint8Array([37, 74, 111, 148]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #38', () => {
    const a = new Uint8Array([38, 76, 114, 152]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #39', () => {
    const a = new Uint8Array([39, 78, 117, 156]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #40', () => {
    const a = new Uint8Array([40, 80, 120, 160]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #41', () => {
    const a = new Uint8Array([41, 82, 123, 164]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #42', () => {
    const a = new Uint8Array([42, 84, 126, 168]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #43', () => {
    const a = new Uint8Array([43, 86, 129, 172]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #44', () => {
    const a = new Uint8Array([44, 88, 132, 176]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #45', () => {
    const a = new Uint8Array([45, 90, 135, 180]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #46', () => {
    const a = new Uint8Array([46, 92, 138, 184]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #47', () => {
    const a = new Uint8Array([47, 94, 141, 188]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #48', () => {
    const a = new Uint8Array([48, 96, 144, 192]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #49', () => {
    const a = new Uint8Array([49, 98, 147, 196]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
  it('xor with self is zeros #50', () => {
    const a = new Uint8Array([50, 100, 150, 200]);
    expect(xor(a, a)).toEqual(new Uint8Array(4));
  });
});

describe('rotateLeft32 / rotateRight32', () => {
  it('rotateLeft32 #1', () => { expect(rotateLeft32(12345, 2)).toBe(49380); });
  it('rotateLeft32 #2', () => { expect(rotateLeft32(24690, 3)).toBe(197520); });
  it('rotateLeft32 #3', () => { expect(rotateLeft32(37035, 4)).toBe(592560); });
  it('rotateLeft32 #4', () => { expect(rotateLeft32(49380, 5)).toBe(1580160); });
  it('rotateLeft32 #5', () => { expect(rotateLeft32(61725, 6)).toBe(3950400); });
  it('rotateLeft32 #6', () => { expect(rotateLeft32(74070, 7)).toBe(9480960); });
  it('rotateLeft32 #7', () => { expect(rotateLeft32(86415, 8)).toBe(22122240); });
  it('rotateLeft32 #8', () => { expect(rotateLeft32(98760, 9)).toBe(50565120); });
  it('rotateLeft32 #9', () => { expect(rotateLeft32(111105, 10)).toBe(113771520); });
  it('rotateLeft32 #10', () => { expect(rotateLeft32(123450, 11)).toBe(252825600); });
  it('rotateLeft32 #11', () => { expect(rotateLeft32(135795, 12)).toBe(556216320); });
  it('rotateLeft32 #12', () => { expect(rotateLeft32(148140, 13)).toBe(1213562880); });
  it('rotateLeft32 #13', () => { expect(rotateLeft32(160485, 14)).toBe(2629386240); });
  it('rotateLeft32 #14', () => { expect(rotateLeft32(172830, 15)).toBe(1368326145); });
  it('rotateLeft32 #15', () => { expect(rotateLeft32(185175, 16)).toBe(3545694210); });
  it('rotateLeft32 #16', () => { expect(rotateLeft32(197520, 17)).toBe(119537670); });
  it('rotateLeft32 #17', () => { expect(rotateLeft32(209865, 18)).toBe(3475243020); });
  it('rotateLeft32 #18', () => { expect(rotateLeft32(222210, 19)).toBe(537919515); });
  it('rotateLeft32 #19', () => { expect(rotateLeft32(234555, 20)).toBe(1135607865); });
  it('rotateLeft32 #20', () => { expect(rotateLeft32(246900, 21)).toBe(2390753400); });
  it('rotateLeft32 #21', () => { expect(rotateLeft32(259245, 22)).toBe(725614845); });
  it('rotateLeft32 #22', () => { expect(rotateLeft32(271590, 23)).toBe(1929380370); });
  it('rotateLeft32 #23', () => { expect(rotateLeft32(283935, 24)).toBe(520094805); });
  it('rotateLeft32 #24', () => { expect(rotateLeft32(296280, 25)).toBe(2952792330); });
  it('rotateLeft32 #25', () => { expect(rotateLeft32(308625, 26)).toBe(1140855510); });
  it('rotateLeft32 #26', () => { expect(rotateLeft32(320970, 27)).toBe(1342187310); });
  it('rotateLeft32 #27', () => { expect(rotateLeft32(333315, 28)).toBe(805327200); });
  it('rotateLeft32 #28', () => { expect(rotateLeft32(345660, 29)).toBe(2147526855); });
  it('rotateLeft32 #29', () => { expect(rotateLeft32(358005, 30)).toBe(1073831325); });
  it('rotateLeft32 #30', () => { expect(rotateLeft32(370350, 31)).toBe(185175); });
  it('rotateLeft32 #31', () => { expect(rotateLeft32(382695, 1)).toBe(765390); });
  it('rotateLeft32 #32', () => { expect(rotateLeft32(395040, 2)).toBe(1580160); });
  it('rotateLeft32 #33', () => { expect(rotateLeft32(407385, 3)).toBe(3259080); });
  it('rotateLeft32 #34', () => { expect(rotateLeft32(419730, 4)).toBe(6715680); });
  it('rotateLeft32 #35', () => { expect(rotateLeft32(432075, 5)).toBe(13826400); });
  it('rotateLeft32 #36', () => { expect(rotateLeft32(444420, 6)).toBe(28442880); });
  it('rotateLeft32 #37', () => { expect(rotateLeft32(456765, 7)).toBe(58465920); });
  it('rotateLeft32 #38', () => { expect(rotateLeft32(469110, 8)).toBe(120092160); });
  it('rotateLeft32 #39', () => { expect(rotateLeft32(481455, 9)).toBe(246504960); });
  it('rotateLeft32 #40', () => { expect(rotateLeft32(493800, 10)).toBe(505651200); });
  it('rotateLeft32 #41', () => { expect(rotateLeft32(506145, 11)).toBe(1036584960); });
  it('rotateLeft32 #42', () => { expect(rotateLeft32(518490, 12)).toBe(2123735040); });
  it('rotateLeft32 #43', () => { expect(rotateLeft32(530835, 13)).toBe(53633025); });
  it('rotateLeft32 #44', () => { expect(rotateLeft32(543180, 14)).toBe(309526530); });
  it('rotateLeft32 #45', () => { expect(rotateLeft32(555525, 15)).toBe(1023574020); });
  it('rotateLeft32 #46', () => { expect(rotateLeft32(567870, 16)).toBe(2856189960); });
  it('rotateLeft32 #47', () => { expect(rotateLeft32(580215, 17)).toBe(3035496465); });
  it('rotateLeft32 #48', () => { expect(rotateLeft32(592560, 18)).toBe(717226020); });
  it('rotateLeft32 #49', () => { expect(rotateLeft32(604905, 19)).toBe(3611820105); });
  it('rotateLeft32 #50', () => { expect(rotateLeft32(617250, 20)).toBe(2988441750); });
  it('rotateRight32 #1', () => { expect(rotateRight32(54321, 2)).toBe(1073755404); });
  it('rotateRight32 #2', () => { expect(rotateRight32(108642, 3)).toBe(1073755404); });
  it('rotateRight32 #3', () => { expect(rotateRight32(162963, 4)).toBe(805316553); });
  it('rotateRight32 #4', () => { expect(rotateRight32(217284, 5)).toBe(536877702); });
  it('rotateRight32 #5', () => { expect(rotateRight32(271605, 6)).toBe(3556774035); });
  it('rotateRight32 #6', () => { expect(rotateRight32(325926, 7)).toBe(1275070962); });
  it('rotateRight32 #7', () => { expect(rotateRight32(380247, 8)).toBe(1459619277); });
  it('rotateRight32 #8', () => { expect(rotateRight32(434568, 9)).toBe(3288335184); });
  it('rotateRight32 #9', () => { expect(rotateRight32(488889, 10)).toBe(1849688541); });
  it('rotateRight32 #10', () => { expect(rotateRight32(543210, 11)).toBe(1027604745); });
  it('rotateRight32 #11', () => { expect(rotateRight32(597531, 12)).toBe(3786408081); });
  it('rotateRight32 #12', () => { expect(rotateRight32(651852, 13)).toBe(2455765071); });
  it('rotateRight32 #13', () => { expect(rotateRight32(706173, 14)).toBe(435421227); });
  it('rotateRight32 #14', () => { expect(rotateRight32(760494, 15)).toBe(895221783); });
  it('rotateRight32 #15', () => { expect(rotateRight32(814815, 16)).toBe(1860108300); });
  it('rotateRight32 #16', () => { expect(rotateRight32(869136, 17)).toBe(2710044678); });
  it('rotateRight32 #17', () => { expect(rotateRight32(923457, 18)).toBe(2245017603); });
  it('rotateRight32 #18', () => { expect(rotateRight32(977778, 19)).toBe(3714990081); });
  it('rotateRight32 #19', () => { expect(rotateRight32(1032099, 20)).toBe(4227477504); });
  it('rotateRight32 #20', () => { expect(rotateRight32(1086420, 21)).toBe(2224988160); });
  it('rotateRight32 #21', () => { expect(rotateRight32(1140741, 22)).toBe(1168118784); });
  it('rotateRight32 #22', () => { expect(rotateRight32(1195062, 23)).toBe(611871744); });
  it('rotateRight32 #23', () => { expect(rotateRight32(1249383, 24)).toBe(319842048); });
  it('rotateRight32 #24', () => { expect(rotateRight32(1303704, 25)).toBe(166874112); });
  it('rotateRight32 #25', () => { expect(rotateRight32(1358025, 26)).toBe(86913600); });
  it('rotateRight32 #26', () => { expect(rotateRight32(1412346, 27)).toBe(45195072); });
  it('rotateRight32 #27', () => { expect(rotateRight32(1466667, 28)).toBe(23466672); });
  it('rotateRight32 #28', () => { expect(rotateRight32(1520988, 29)).toBe(12167904); });
  it('rotateRight32 #29', () => { expect(rotateRight32(1575309, 30)).toBe(6301236); });
  it('rotateRight32 #30', () => { expect(rotateRight32(1629630, 31)).toBe(3259260); });
  it('rotateRight32 #31', () => { expect(rotateRight32(1683951, 1)).toBe(2148325623); });
  it('rotateRight32 #32', () => { expect(rotateRight32(1738272, 2)).toBe(434568); });
  it('rotateRight32 #33', () => { expect(rotateRight32(1792593, 3)).toBe(537094986); });
  it('rotateRight32 #34', () => { expect(rotateRight32(1846914, 4)).toBe(536986344); });
  it('rotateRight32 #35', () => { expect(rotateRight32(1901235, 5)).toBe(2550196245); });
  it('rotateRight32 #36', () => { expect(rotateRight32(1955556, 6)).toBe(2415949659); });
  it('rotateRight32 #37', () => { expect(rotateRight32(2009877, 7)).toBe(704658774); });
  it('rotateRight32 #38', () => { expect(rotateRight32(2064198, 8)).toBe(1174413183); });
  it('rotateRight32 #39', () => { expect(rotateRight32(2118519, 9)).toBe(3145732137); });
  it('rotateRight32 #40', () => { expect(rotateRight32(2172840, 10)).toBe(3925870665); });
  it('rotateRight32 #41', () => { expect(rotateRight32(2227161, 11)).toBe(2065695807); });
  it('rotateRight32 #42', () => { expect(rotateRight32(2281482, 12)).toBe(10486317); });
  it('rotateRight32 #43', () => { expect(rotateRight32(2335803, 13)).toBe(567804189); });
  it('rotateRight32 #44', () => { expect(rotateRight32(2390124, 14)).toBe(3786408081); });
  it('rotateRight32 #45', () => { expect(rotateRight32(2444445, 15)).toBe(2570715210); });
  it('rotateRight32 #46', () => { expect(rotateRight32(2498766, 16)).toBe(550371366); });
  it('rotateRight32 #47', () => { expect(rotateRight32(2553087, 17)).toBe(2055176211); });
  it('rotateRight32 #48', () => { expect(rotateRight32(2607408, 18)).toBe(4065067017); });
  it('rotateRight32 #49', () => { expect(rotateRight32(2661729, 19)).toBe(330047493); });
  it('rotateRight32 #50', () => { expect(rotateRight32(2716050, 20)).toBe(2535006210); });
});

describe('fnv1a32', () => {
  it('fnv1a32 returns number #1', () => { expect(typeof fnv1a32(new Uint8Array([1,2]))).toBe('number'); });
  it('fnv1a32 returns number #2', () => { expect(typeof fnv1a32(new Uint8Array([2,3]))).toBe('number'); });
  it('fnv1a32 returns number #3', () => { expect(typeof fnv1a32(new Uint8Array([3,4]))).toBe('number'); });
  it('fnv1a32 returns number #4', () => { expect(typeof fnv1a32(new Uint8Array([4,5]))).toBe('number'); });
  it('fnv1a32 returns number #5', () => { expect(typeof fnv1a32(new Uint8Array([5,6]))).toBe('number'); });
  it('fnv1a32 returns number #6', () => { expect(typeof fnv1a32(new Uint8Array([6,7]))).toBe('number'); });
  it('fnv1a32 returns number #7', () => { expect(typeof fnv1a32(new Uint8Array([7,8]))).toBe('number'); });
  it('fnv1a32 returns number #8', () => { expect(typeof fnv1a32(new Uint8Array([8,9]))).toBe('number'); });
  it('fnv1a32 returns number #9', () => { expect(typeof fnv1a32(new Uint8Array([9,10]))).toBe('number'); });
  it('fnv1a32 returns number #10', () => { expect(typeof fnv1a32(new Uint8Array([10,11]))).toBe('number'); });
  it('fnv1a32 returns number #11', () => { expect(typeof fnv1a32(new Uint8Array([11,12]))).toBe('number'); });
  it('fnv1a32 returns number #12', () => { expect(typeof fnv1a32(new Uint8Array([12,13]))).toBe('number'); });
  it('fnv1a32 returns number #13', () => { expect(typeof fnv1a32(new Uint8Array([13,14]))).toBe('number'); });
  it('fnv1a32 returns number #14', () => { expect(typeof fnv1a32(new Uint8Array([14,15]))).toBe('number'); });
  it('fnv1a32 returns number #15', () => { expect(typeof fnv1a32(new Uint8Array([15,16]))).toBe('number'); });
  it('fnv1a32 returns number #16', () => { expect(typeof fnv1a32(new Uint8Array([16,17]))).toBe('number'); });
  it('fnv1a32 returns number #17', () => { expect(typeof fnv1a32(new Uint8Array([17,18]))).toBe('number'); });
  it('fnv1a32 returns number #18', () => { expect(typeof fnv1a32(new Uint8Array([18,19]))).toBe('number'); });
  it('fnv1a32 returns number #19', () => { expect(typeof fnv1a32(new Uint8Array([19,20]))).toBe('number'); });
  it('fnv1a32 returns number #20', () => { expect(typeof fnv1a32(new Uint8Array([20,21]))).toBe('number'); });
  it('fnv1a32 returns number #21', () => { expect(typeof fnv1a32(new Uint8Array([21,22]))).toBe('number'); });
  it('fnv1a32 returns number #22', () => { expect(typeof fnv1a32(new Uint8Array([22,23]))).toBe('number'); });
  it('fnv1a32 returns number #23', () => { expect(typeof fnv1a32(new Uint8Array([23,24]))).toBe('number'); });
  it('fnv1a32 returns number #24', () => { expect(typeof fnv1a32(new Uint8Array([24,25]))).toBe('number'); });
  it('fnv1a32 returns number #25', () => { expect(typeof fnv1a32(new Uint8Array([25,26]))).toBe('number'); });
  it('fnv1a32 returns number #26', () => { expect(typeof fnv1a32(new Uint8Array([26,27]))).toBe('number'); });
  it('fnv1a32 returns number #27', () => { expect(typeof fnv1a32(new Uint8Array([27,28]))).toBe('number'); });
  it('fnv1a32 returns number #28', () => { expect(typeof fnv1a32(new Uint8Array([28,29]))).toBe('number'); });
  it('fnv1a32 returns number #29', () => { expect(typeof fnv1a32(new Uint8Array([29,30]))).toBe('number'); });
  it('fnv1a32 returns number #30', () => { expect(typeof fnv1a32(new Uint8Array([30,31]))).toBe('number'); });
  it('fnv1a32 returns number #31', () => { expect(typeof fnv1a32(new Uint8Array([31,32]))).toBe('number'); });
  it('fnv1a32 returns number #32', () => { expect(typeof fnv1a32(new Uint8Array([32,33]))).toBe('number'); });
  it('fnv1a32 returns number #33', () => { expect(typeof fnv1a32(new Uint8Array([33,34]))).toBe('number'); });
  it('fnv1a32 returns number #34', () => { expect(typeof fnv1a32(new Uint8Array([34,35]))).toBe('number'); });
  it('fnv1a32 returns number #35', () => { expect(typeof fnv1a32(new Uint8Array([35,36]))).toBe('number'); });
  it('fnv1a32 returns number #36', () => { expect(typeof fnv1a32(new Uint8Array([36,37]))).toBe('number'); });
  it('fnv1a32 returns number #37', () => { expect(typeof fnv1a32(new Uint8Array([37,38]))).toBe('number'); });
  it('fnv1a32 returns number #38', () => { expect(typeof fnv1a32(new Uint8Array([38,39]))).toBe('number'); });
  it('fnv1a32 returns number #39', () => { expect(typeof fnv1a32(new Uint8Array([39,40]))).toBe('number'); });
  it('fnv1a32 returns number #40', () => { expect(typeof fnv1a32(new Uint8Array([40,41]))).toBe('number'); });
  it('fnv1a32 returns number #41', () => { expect(typeof fnv1a32(new Uint8Array([41,42]))).toBe('number'); });
  it('fnv1a32 returns number #42', () => { expect(typeof fnv1a32(new Uint8Array([42,43]))).toBe('number'); });
  it('fnv1a32 returns number #43', () => { expect(typeof fnv1a32(new Uint8Array([43,44]))).toBe('number'); });
  it('fnv1a32 returns number #44', () => { expect(typeof fnv1a32(new Uint8Array([44,45]))).toBe('number'); });
  it('fnv1a32 returns number #45', () => { expect(typeof fnv1a32(new Uint8Array([45,46]))).toBe('number'); });
  it('fnv1a32 returns number #46', () => { expect(typeof fnv1a32(new Uint8Array([46,47]))).toBe('number'); });
  it('fnv1a32 returns number #47', () => { expect(typeof fnv1a32(new Uint8Array([47,48]))).toBe('number'); });
  it('fnv1a32 returns number #48', () => { expect(typeof fnv1a32(new Uint8Array([48,49]))).toBe('number'); });
  it('fnv1a32 returns number #49', () => { expect(typeof fnv1a32(new Uint8Array([49,50]))).toBe('number'); });
  it('fnv1a32 returns number #50', () => { expect(typeof fnv1a32(new Uint8Array([50,51]))).toBe('number'); });
  it('fnv1a32 empty', () => { expect(fnv1a32(new Uint8Array([]))).toBe(2166136261); });
  it('fnv1a32 consistent #1', () => { const d = new Uint8Array([1]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #2', () => { const d = new Uint8Array([2]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #3', () => { const d = new Uint8Array([3]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #4', () => { const d = new Uint8Array([4]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #5', () => { const d = new Uint8Array([5]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #6', () => { const d = new Uint8Array([6]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #7', () => { const d = new Uint8Array([7]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #8', () => { const d = new Uint8Array([8]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #9', () => { const d = new Uint8Array([9]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #10', () => { const d = new Uint8Array([10]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #11', () => { const d = new Uint8Array([11]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #12', () => { const d = new Uint8Array([12]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #13', () => { const d = new Uint8Array([13]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #14', () => { const d = new Uint8Array([14]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #15', () => { const d = new Uint8Array([15]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #16', () => { const d = new Uint8Array([16]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #17', () => { const d = new Uint8Array([17]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #18', () => { const d = new Uint8Array([18]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #19', () => { const d = new Uint8Array([19]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #20', () => { const d = new Uint8Array([20]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #21', () => { const d = new Uint8Array([21]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #22', () => { const d = new Uint8Array([22]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #23', () => { const d = new Uint8Array([23]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #24', () => { const d = new Uint8Array([24]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #25', () => { const d = new Uint8Array([25]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #26', () => { const d = new Uint8Array([26]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #27', () => { const d = new Uint8Array([27]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #28', () => { const d = new Uint8Array([28]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #29', () => { const d = new Uint8Array([29]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #30', () => { const d = new Uint8Array([30]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #31', () => { const d = new Uint8Array([31]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #32', () => { const d = new Uint8Array([32]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #33', () => { const d = new Uint8Array([33]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #34', () => { const d = new Uint8Array([34]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #35', () => { const d = new Uint8Array([35]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #36', () => { const d = new Uint8Array([36]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #37', () => { const d = new Uint8Array([37]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #38', () => { const d = new Uint8Array([38]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #39', () => { const d = new Uint8Array([39]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #40', () => { const d = new Uint8Array([40]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #41', () => { const d = new Uint8Array([41]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #42', () => { const d = new Uint8Array([42]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #43', () => { const d = new Uint8Array([43]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #44', () => { const d = new Uint8Array([44]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #45', () => { const d = new Uint8Array([45]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #46', () => { const d = new Uint8Array([46]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #47', () => { const d = new Uint8Array([47]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #48', () => { const d = new Uint8Array([48]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
  it('fnv1a32 consistent #49', () => { const d = new Uint8Array([49]); expect(fnv1a32(d)).toBe(fnv1a32(d)); });
});

describe('djb2', () => {
  it('djb2 returns number #1', () => { expect(typeof djb2('test1')).toBe('number'); });
  it('djb2 returns number #2', () => { expect(typeof djb2('test2')).toBe('number'); });
  it('djb2 returns number #3', () => { expect(typeof djb2('test3')).toBe('number'); });
  it('djb2 returns number #4', () => { expect(typeof djb2('test4')).toBe('number'); });
  it('djb2 returns number #5', () => { expect(typeof djb2('test5')).toBe('number'); });
  it('djb2 returns number #6', () => { expect(typeof djb2('test6')).toBe('number'); });
  it('djb2 returns number #7', () => { expect(typeof djb2('test7')).toBe('number'); });
  it('djb2 returns number #8', () => { expect(typeof djb2('test8')).toBe('number'); });
  it('djb2 returns number #9', () => { expect(typeof djb2('test9')).toBe('number'); });
  it('djb2 returns number #10', () => { expect(typeof djb2('test10')).toBe('number'); });
  it('djb2 returns number #11', () => { expect(typeof djb2('test11')).toBe('number'); });
  it('djb2 returns number #12', () => { expect(typeof djb2('test12')).toBe('number'); });
  it('djb2 returns number #13', () => { expect(typeof djb2('test13')).toBe('number'); });
  it('djb2 returns number #14', () => { expect(typeof djb2('test14')).toBe('number'); });
  it('djb2 returns number #15', () => { expect(typeof djb2('test15')).toBe('number'); });
  it('djb2 returns number #16', () => { expect(typeof djb2('test16')).toBe('number'); });
  it('djb2 returns number #17', () => { expect(typeof djb2('test17')).toBe('number'); });
  it('djb2 returns number #18', () => { expect(typeof djb2('test18')).toBe('number'); });
  it('djb2 returns number #19', () => { expect(typeof djb2('test19')).toBe('number'); });
  it('djb2 returns number #20', () => { expect(typeof djb2('test20')).toBe('number'); });
  it('djb2 returns number #21', () => { expect(typeof djb2('test21')).toBe('number'); });
  it('djb2 returns number #22', () => { expect(typeof djb2('test22')).toBe('number'); });
  it('djb2 returns number #23', () => { expect(typeof djb2('test23')).toBe('number'); });
  it('djb2 returns number #24', () => { expect(typeof djb2('test24')).toBe('number'); });
  it('djb2 returns number #25', () => { expect(typeof djb2('test25')).toBe('number'); });
  it('djb2 returns number #26', () => { expect(typeof djb2('test26')).toBe('number'); });
  it('djb2 returns number #27', () => { expect(typeof djb2('test27')).toBe('number'); });
  it('djb2 returns number #28', () => { expect(typeof djb2('test28')).toBe('number'); });
  it('djb2 returns number #29', () => { expect(typeof djb2('test29')).toBe('number'); });
  it('djb2 returns number #30', () => { expect(typeof djb2('test30')).toBe('number'); });
  it('djb2 returns number #31', () => { expect(typeof djb2('test31')).toBe('number'); });
  it('djb2 returns number #32', () => { expect(typeof djb2('test32')).toBe('number'); });
  it('djb2 returns number #33', () => { expect(typeof djb2('test33')).toBe('number'); });
  it('djb2 returns number #34', () => { expect(typeof djb2('test34')).toBe('number'); });
  it('djb2 returns number #35', () => { expect(typeof djb2('test35')).toBe('number'); });
  it('djb2 returns number #36', () => { expect(typeof djb2('test36')).toBe('number'); });
  it('djb2 returns number #37', () => { expect(typeof djb2('test37')).toBe('number'); });
  it('djb2 returns number #38', () => { expect(typeof djb2('test38')).toBe('number'); });
  it('djb2 returns number #39', () => { expect(typeof djb2('test39')).toBe('number'); });
  it('djb2 returns number #40', () => { expect(typeof djb2('test40')).toBe('number'); });
  it('djb2 returns number #41', () => { expect(typeof djb2('test41')).toBe('number'); });
  it('djb2 returns number #42', () => { expect(typeof djb2('test42')).toBe('number'); });
  it('djb2 returns number #43', () => { expect(typeof djb2('test43')).toBe('number'); });
  it('djb2 returns number #44', () => { expect(typeof djb2('test44')).toBe('number'); });
  it('djb2 returns number #45', () => { expect(typeof djb2('test45')).toBe('number'); });
  it('djb2 returns number #46', () => { expect(typeof djb2('test46')).toBe('number'); });
  it('djb2 returns number #47', () => { expect(typeof djb2('test47')).toBe('number'); });
  it('djb2 returns number #48', () => { expect(typeof djb2('test48')).toBe('number'); });
  it('djb2 returns number #49', () => { expect(typeof djb2('test49')).toBe('number'); });
  it('djb2 returns number #50', () => { expect(typeof djb2('test50')).toBe('number'); });
  it('djb2 consistent #1', () => { expect(djb2('word1')).toBe(djb2('word1')); });
  it('djb2 consistent #2', () => { expect(djb2('word2')).toBe(djb2('word2')); });
  it('djb2 consistent #3', () => { expect(djb2('word3')).toBe(djb2('word3')); });
  it('djb2 consistent #4', () => { expect(djb2('word4')).toBe(djb2('word4')); });
  it('djb2 consistent #5', () => { expect(djb2('word5')).toBe(djb2('word5')); });
  it('djb2 consistent #6', () => { expect(djb2('word6')).toBe(djb2('word6')); });
  it('djb2 consistent #7', () => { expect(djb2('word7')).toBe(djb2('word7')); });
  it('djb2 consistent #8', () => { expect(djb2('word8')).toBe(djb2('word8')); });
  it('djb2 consistent #9', () => { expect(djb2('word9')).toBe(djb2('word9')); });
  it('djb2 consistent #10', () => { expect(djb2('word10')).toBe(djb2('word10')); });
  it('djb2 consistent #11', () => { expect(djb2('word11')).toBe(djb2('word11')); });
  it('djb2 consistent #12', () => { expect(djb2('word12')).toBe(djb2('word12')); });
  it('djb2 consistent #13', () => { expect(djb2('word13')).toBe(djb2('word13')); });
  it('djb2 consistent #14', () => { expect(djb2('word14')).toBe(djb2('word14')); });
  it('djb2 consistent #15', () => { expect(djb2('word15')).toBe(djb2('word15')); });
  it('djb2 consistent #16', () => { expect(djb2('word16')).toBe(djb2('word16')); });
  it('djb2 consistent #17', () => { expect(djb2('word17')).toBe(djb2('word17')); });
  it('djb2 consistent #18', () => { expect(djb2('word18')).toBe(djb2('word18')); });
  it('djb2 consistent #19', () => { expect(djb2('word19')).toBe(djb2('word19')); });
  it('djb2 consistent #20', () => { expect(djb2('word20')).toBe(djb2('word20')); });
  it('djb2 consistent #21', () => { expect(djb2('word21')).toBe(djb2('word21')); });
  it('djb2 consistent #22', () => { expect(djb2('word22')).toBe(djb2('word22')); });
  it('djb2 consistent #23', () => { expect(djb2('word23')).toBe(djb2('word23')); });
  it('djb2 consistent #24', () => { expect(djb2('word24')).toBe(djb2('word24')); });
  it('djb2 consistent #25', () => { expect(djb2('word25')).toBe(djb2('word25')); });
  it('djb2 consistent #26', () => { expect(djb2('word26')).toBe(djb2('word26')); });
  it('djb2 consistent #27', () => { expect(djb2('word27')).toBe(djb2('word27')); });
  it('djb2 consistent #28', () => { expect(djb2('word28')).toBe(djb2('word28')); });
  it('djb2 consistent #29', () => { expect(djb2('word29')).toBe(djb2('word29')); });
  it('djb2 consistent #30', () => { expect(djb2('word30')).toBe(djb2('word30')); });
  it('djb2 consistent #31', () => { expect(djb2('word31')).toBe(djb2('word31')); });
  it('djb2 consistent #32', () => { expect(djb2('word32')).toBe(djb2('word32')); });
  it('djb2 consistent #33', () => { expect(djb2('word33')).toBe(djb2('word33')); });
  it('djb2 consistent #34', () => { expect(djb2('word34')).toBe(djb2('word34')); });
  it('djb2 consistent #35', () => { expect(djb2('word35')).toBe(djb2('word35')); });
  it('djb2 consistent #36', () => { expect(djb2('word36')).toBe(djb2('word36')); });
  it('djb2 consistent #37', () => { expect(djb2('word37')).toBe(djb2('word37')); });
  it('djb2 consistent #38', () => { expect(djb2('word38')).toBe(djb2('word38')); });
  it('djb2 consistent #39', () => { expect(djb2('word39')).toBe(djb2('word39')); });
  it('djb2 consistent #40', () => { expect(djb2('word40')).toBe(djb2('word40')); });
  it('djb2 consistent #41', () => { expect(djb2('word41')).toBe(djb2('word41')); });
  it('djb2 consistent #42', () => { expect(djb2('word42')).toBe(djb2('word42')); });
  it('djb2 consistent #43', () => { expect(djb2('word43')).toBe(djb2('word43')); });
  it('djb2 consistent #44', () => { expect(djb2('word44')).toBe(djb2('word44')); });
  it('djb2 consistent #45', () => { expect(djb2('word45')).toBe(djb2('word45')); });
  it('djb2 consistent #46', () => { expect(djb2('word46')).toBe(djb2('word46')); });
  it('djb2 consistent #47', () => { expect(djb2('word47')).toBe(djb2('word47')); });
  it('djb2 consistent #48', () => { expect(djb2('word48')).toBe(djb2('word48')); });
  it('djb2 consistent #49', () => { expect(djb2('word49')).toBe(djb2('word49')); });
  it('djb2 consistent #50', () => { expect(djb2('word50')).toBe(djb2('word50')); });
});

describe('constantTimeEqual', () => {
  it('equal arrays #1', () => {
    const a = new Uint8Array([1, 2, 3, 4]); const b = new Uint8Array([1, 2, 3, 4]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #2', () => {
    const a = new Uint8Array([2, 3, 4, 5]); const b = new Uint8Array([2, 3, 4, 5]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #3', () => {
    const a = new Uint8Array([3, 4, 5, 6]); const b = new Uint8Array([3, 4, 5, 6]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #4', () => {
    const a = new Uint8Array([4, 5, 6, 7]); const b = new Uint8Array([4, 5, 6, 7]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #5', () => {
    const a = new Uint8Array([5, 6, 7, 8]); const b = new Uint8Array([5, 6, 7, 8]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #6', () => {
    const a = new Uint8Array([6, 7, 8, 9]); const b = new Uint8Array([6, 7, 8, 9]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #7', () => {
    const a = new Uint8Array([7, 8, 9, 10]); const b = new Uint8Array([7, 8, 9, 10]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #8', () => {
    const a = new Uint8Array([8, 9, 10, 11]); const b = new Uint8Array([8, 9, 10, 11]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #9', () => {
    const a = new Uint8Array([9, 10, 11, 12]); const b = new Uint8Array([9, 10, 11, 12]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #10', () => {
    const a = new Uint8Array([10, 11, 12, 13]); const b = new Uint8Array([10, 11, 12, 13]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #11', () => {
    const a = new Uint8Array([11, 12, 13, 14]); const b = new Uint8Array([11, 12, 13, 14]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #12', () => {
    const a = new Uint8Array([12, 13, 14, 15]); const b = new Uint8Array([12, 13, 14, 15]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #13', () => {
    const a = new Uint8Array([13, 14, 15, 16]); const b = new Uint8Array([13, 14, 15, 16]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #14', () => {
    const a = new Uint8Array([14, 15, 16, 17]); const b = new Uint8Array([14, 15, 16, 17]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #15', () => {
    const a = new Uint8Array([15, 16, 17, 18]); const b = new Uint8Array([15, 16, 17, 18]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #16', () => {
    const a = new Uint8Array([16, 17, 18, 19]); const b = new Uint8Array([16, 17, 18, 19]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #17', () => {
    const a = new Uint8Array([17, 18, 19, 20]); const b = new Uint8Array([17, 18, 19, 20]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #18', () => {
    const a = new Uint8Array([18, 19, 20, 21]); const b = new Uint8Array([18, 19, 20, 21]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #19', () => {
    const a = new Uint8Array([19, 20, 21, 22]); const b = new Uint8Array([19, 20, 21, 22]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #20', () => {
    const a = new Uint8Array([20, 21, 22, 23]); const b = new Uint8Array([20, 21, 22, 23]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #21', () => {
    const a = new Uint8Array([21, 22, 23, 24]); const b = new Uint8Array([21, 22, 23, 24]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #22', () => {
    const a = new Uint8Array([22, 23, 24, 25]); const b = new Uint8Array([22, 23, 24, 25]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #23', () => {
    const a = new Uint8Array([23, 24, 25, 26]); const b = new Uint8Array([23, 24, 25, 26]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #24', () => {
    const a = new Uint8Array([24, 25, 26, 27]); const b = new Uint8Array([24, 25, 26, 27]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #25', () => {
    const a = new Uint8Array([25, 26, 27, 28]); const b = new Uint8Array([25, 26, 27, 28]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #26', () => {
    const a = new Uint8Array([26, 27, 28, 29]); const b = new Uint8Array([26, 27, 28, 29]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #27', () => {
    const a = new Uint8Array([27, 28, 29, 30]); const b = new Uint8Array([27, 28, 29, 30]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #28', () => {
    const a = new Uint8Array([28, 29, 30, 31]); const b = new Uint8Array([28, 29, 30, 31]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #29', () => {
    const a = new Uint8Array([29, 30, 31, 32]); const b = new Uint8Array([29, 30, 31, 32]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #30', () => {
    const a = new Uint8Array([30, 31, 32, 33]); const b = new Uint8Array([30, 31, 32, 33]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #31', () => {
    const a = new Uint8Array([31, 32, 33, 34]); const b = new Uint8Array([31, 32, 33, 34]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #32', () => {
    const a = new Uint8Array([32, 33, 34, 35]); const b = new Uint8Array([32, 33, 34, 35]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #33', () => {
    const a = new Uint8Array([33, 34, 35, 36]); const b = new Uint8Array([33, 34, 35, 36]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #34', () => {
    const a = new Uint8Array([34, 35, 36, 37]); const b = new Uint8Array([34, 35, 36, 37]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #35', () => {
    const a = new Uint8Array([35, 36, 37, 38]); const b = new Uint8Array([35, 36, 37, 38]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #36', () => {
    const a = new Uint8Array([36, 37, 38, 39]); const b = new Uint8Array([36, 37, 38, 39]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #37', () => {
    const a = new Uint8Array([37, 38, 39, 40]); const b = new Uint8Array([37, 38, 39, 40]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #38', () => {
    const a = new Uint8Array([38, 39, 40, 41]); const b = new Uint8Array([38, 39, 40, 41]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #39', () => {
    const a = new Uint8Array([39, 40, 41, 42]); const b = new Uint8Array([39, 40, 41, 42]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #40', () => {
    const a = new Uint8Array([40, 41, 42, 43]); const b = new Uint8Array([40, 41, 42, 43]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #41', () => {
    const a = new Uint8Array([41, 42, 43, 44]); const b = new Uint8Array([41, 42, 43, 44]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #42', () => {
    const a = new Uint8Array([42, 43, 44, 45]); const b = new Uint8Array([42, 43, 44, 45]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #43', () => {
    const a = new Uint8Array([43, 44, 45, 46]); const b = new Uint8Array([43, 44, 45, 46]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #44', () => {
    const a = new Uint8Array([44, 45, 46, 47]); const b = new Uint8Array([44, 45, 46, 47]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #45', () => {
    const a = new Uint8Array([45, 46, 47, 48]); const b = new Uint8Array([45, 46, 47, 48]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #46', () => {
    const a = new Uint8Array([46, 47, 48, 49]); const b = new Uint8Array([46, 47, 48, 49]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #47', () => {
    const a = new Uint8Array([47, 48, 49, 50]); const b = new Uint8Array([47, 48, 49, 50]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #48', () => {
    const a = new Uint8Array([48, 49, 50, 51]); const b = new Uint8Array([48, 49, 50, 51]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #49', () => {
    const a = new Uint8Array([49, 50, 51, 52]); const b = new Uint8Array([49, 50, 51, 52]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('equal arrays #50', () => {
    const a = new Uint8Array([50, 51, 52, 53]); const b = new Uint8Array([50, 51, 52, 53]);
    expect(constantTimeEqual(a, b)).toBe(true);
  });
  it('unequal arrays #1', () => {
    const a = new Uint8Array([1, 2]); const b = new Uint8Array([6, 7]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #2', () => {
    const a = new Uint8Array([2, 3]); const b = new Uint8Array([7, 8]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #3', () => {
    const a = new Uint8Array([3, 4]); const b = new Uint8Array([8, 9]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #4', () => {
    const a = new Uint8Array([4, 5]); const b = new Uint8Array([9, 10]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #5', () => {
    const a = new Uint8Array([5, 6]); const b = new Uint8Array([10, 11]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #6', () => {
    const a = new Uint8Array([6, 7]); const b = new Uint8Array([11, 12]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #7', () => {
    const a = new Uint8Array([7, 8]); const b = new Uint8Array([12, 13]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #8', () => {
    const a = new Uint8Array([8, 9]); const b = new Uint8Array([13, 14]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #9', () => {
    const a = new Uint8Array([9, 10]); const b = new Uint8Array([14, 15]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #10', () => {
    const a = new Uint8Array([10, 11]); const b = new Uint8Array([15, 16]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #11', () => {
    const a = new Uint8Array([11, 12]); const b = new Uint8Array([16, 17]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #12', () => {
    const a = new Uint8Array([12, 13]); const b = new Uint8Array([17, 18]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #13', () => {
    const a = new Uint8Array([13, 14]); const b = new Uint8Array([18, 19]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #14', () => {
    const a = new Uint8Array([14, 15]); const b = new Uint8Array([19, 20]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #15', () => {
    const a = new Uint8Array([15, 16]); const b = new Uint8Array([20, 21]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #16', () => {
    const a = new Uint8Array([16, 17]); const b = new Uint8Array([21, 22]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #17', () => {
    const a = new Uint8Array([17, 18]); const b = new Uint8Array([22, 23]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #18', () => {
    const a = new Uint8Array([18, 19]); const b = new Uint8Array([23, 24]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #19', () => {
    const a = new Uint8Array([19, 20]); const b = new Uint8Array([24, 25]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #20', () => {
    const a = new Uint8Array([20, 21]); const b = new Uint8Array([25, 26]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #21', () => {
    const a = new Uint8Array([21, 22]); const b = new Uint8Array([26, 27]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #22', () => {
    const a = new Uint8Array([22, 23]); const b = new Uint8Array([27, 28]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #23', () => {
    const a = new Uint8Array([23, 24]); const b = new Uint8Array([28, 29]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #24', () => {
    const a = new Uint8Array([24, 25]); const b = new Uint8Array([29, 30]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #25', () => {
    const a = new Uint8Array([25, 26]); const b = new Uint8Array([30, 31]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #26', () => {
    const a = new Uint8Array([26, 27]); const b = new Uint8Array([31, 32]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #27', () => {
    const a = new Uint8Array([27, 28]); const b = new Uint8Array([32, 33]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #28', () => {
    const a = new Uint8Array([28, 29]); const b = new Uint8Array([33, 34]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #29', () => {
    const a = new Uint8Array([29, 30]); const b = new Uint8Array([34, 35]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #30', () => {
    const a = new Uint8Array([30, 31]); const b = new Uint8Array([35, 36]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #31', () => {
    const a = new Uint8Array([31, 32]); const b = new Uint8Array([36, 37]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #32', () => {
    const a = new Uint8Array([32, 33]); const b = new Uint8Array([37, 38]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #33', () => {
    const a = new Uint8Array([33, 34]); const b = new Uint8Array([38, 39]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #34', () => {
    const a = new Uint8Array([34, 35]); const b = new Uint8Array([39, 40]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #35', () => {
    const a = new Uint8Array([35, 36]); const b = new Uint8Array([40, 41]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #36', () => {
    const a = new Uint8Array([36, 37]); const b = new Uint8Array([41, 42]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #37', () => {
    const a = new Uint8Array([37, 38]); const b = new Uint8Array([42, 43]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #38', () => {
    const a = new Uint8Array([38, 39]); const b = new Uint8Array([43, 44]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #39', () => {
    const a = new Uint8Array([39, 40]); const b = new Uint8Array([44, 45]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #40', () => {
    const a = new Uint8Array([40, 41]); const b = new Uint8Array([45, 46]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #41', () => {
    const a = new Uint8Array([41, 42]); const b = new Uint8Array([46, 47]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #42', () => {
    const a = new Uint8Array([42, 43]); const b = new Uint8Array([47, 48]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #43', () => {
    const a = new Uint8Array([43, 44]); const b = new Uint8Array([48, 49]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #44', () => {
    const a = new Uint8Array([44, 45]); const b = new Uint8Array([49, 50]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #45', () => {
    const a = new Uint8Array([45, 46]); const b = new Uint8Array([50, 51]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #46', () => {
    const a = new Uint8Array([46, 47]); const b = new Uint8Array([51, 52]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #47', () => {
    const a = new Uint8Array([47, 48]); const b = new Uint8Array([52, 53]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #48', () => {
    const a = new Uint8Array([48, 49]); const b = new Uint8Array([53, 54]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #49', () => {
    const a = new Uint8Array([49, 50]); const b = new Uint8Array([54, 55]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
  it('unequal arrays #50', () => {
    const a = new Uint8Array([50, 51]); const b = new Uint8Array([55, 56]);
    expect(constantTimeEqual(a, b)).toBe(false);
  });
});

describe('padPKCS7 / unpadPKCS7 round-trip', () => {
  it('pkcs7 round-trip length 1 #1', () => {
    const d = new Uint8Array([0]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 2 #2', () => {
    const d = new Uint8Array([0, 1]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 3 #3', () => {
    const d = new Uint8Array([0, 1, 2]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 4 #4', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 5 #5', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 6 #6', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 7 #7', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 8 #8', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 9 #9', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 10 #10', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 11 #11', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 12 #12', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 13 #13', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 14 #14', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 0 #15', () => {
    const d = new Uint8Array([]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 1 #16', () => {
    const d = new Uint8Array([0]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 2 #17', () => {
    const d = new Uint8Array([0, 1]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 3 #18', () => {
    const d = new Uint8Array([0, 1, 2]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 4 #19', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 5 #20', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 6 #21', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 7 #22', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 8 #23', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 9 #24', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 10 #25', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 11 #26', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 12 #27', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 13 #28', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 14 #29', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 0 #30', () => {
    const d = new Uint8Array([]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 1 #31', () => {
    const d = new Uint8Array([0]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 2 #32', () => {
    const d = new Uint8Array([0, 1]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 3 #33', () => {
    const d = new Uint8Array([0, 1, 2]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 4 #34', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 5 #35', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 6 #36', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 7 #37', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 8 #38', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 9 #39', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 10 #40', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 11 #41', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 12 #42', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 13 #43', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 14 #44', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 0 #45', () => {
    const d = new Uint8Array([]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 1 #46', () => {
    const d = new Uint8Array([0]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 2 #47', () => {
    const d = new Uint8Array([0, 1]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 3 #48', () => {
    const d = new Uint8Array([0, 1, 2]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 4 #49', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 5 #50', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 6 #51', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 7 #52', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 8 #53', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 9 #54', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 10 #55', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 11 #56', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 12 #57', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 13 #58', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 14 #59', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 0 #60', () => {
    const d = new Uint8Array([]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 1 #61', () => {
    const d = new Uint8Array([0]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 2 #62', () => {
    const d = new Uint8Array([0, 1]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 3 #63', () => {
    const d = new Uint8Array([0, 1, 2]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 4 #64', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 5 #65', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 6 #66', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 7 #67', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 8 #68', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 9 #69', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 10 #70', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 11 #71', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 12 #72', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 13 #73', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 14 #74', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 0 #75', () => {
    const d = new Uint8Array([]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 1 #76', () => {
    const d = new Uint8Array([0]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 2 #77', () => {
    const d = new Uint8Array([0, 1]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 3 #78', () => {
    const d = new Uint8Array([0, 1, 2]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 4 #79', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 5 #80', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 6 #81', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 7 #82', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 8 #83', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 9 #84', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 10 #85', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 11 #86', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 12 #87', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 13 #88', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 14 #89', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 0 #90', () => {
    const d = new Uint8Array([]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 1 #91', () => {
    const d = new Uint8Array([0]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 2 #92', () => {
    const d = new Uint8Array([0, 1]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 3 #93', () => {
    const d = new Uint8Array([0, 1, 2]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 4 #94', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 5 #95', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 6 #96', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 7 #97', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 8 #98', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 9 #99', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
  it('pkcs7 round-trip length 10 #100', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const padded = padPKCS7(d, 16);
    expect(padded.length % 16).toBe(0);
    expect(unpadPKCS7(padded)).toEqual(d);
  });
});

describe('splitBytes / joinBytes round-trip', () => {
  it('split/join round-trip #1', () => {
    const d = new Uint8Array([0, 1]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #2', () => {
    const d = new Uint8Array([0, 1, 2]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #3', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #4', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #5', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #6', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #7', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #8', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #9', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #10', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #11', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #12', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #13', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #14', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #15', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #16', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #17', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #18', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #19', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #20', () => {
    const d = new Uint8Array([0]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #21', () => {
    const d = new Uint8Array([0, 1]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #22', () => {
    const d = new Uint8Array([0, 1, 2]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #23', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #24', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #25', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #26', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #27', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #28', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #29', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #30', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #31', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #32', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #33', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #34', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #35', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #36', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #37', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #38', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #39', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #40', () => {
    const d = new Uint8Array([0]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #41', () => {
    const d = new Uint8Array([0, 1]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #42', () => {
    const d = new Uint8Array([0, 1, 2]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #43', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #44', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #45', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #46', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #47', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #48', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #49', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #50', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #51', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #52', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #53', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #54', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #55', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #56', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #57', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #58', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #59', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #60', () => {
    const d = new Uint8Array([0]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #61', () => {
    const d = new Uint8Array([0, 1]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #62', () => {
    const d = new Uint8Array([0, 1, 2]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #63', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #64', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #65', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #66', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #67', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #68', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #69', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #70', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #71', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #72', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #73', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #74', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #75', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #76', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #77', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #78', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #79', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #80', () => {
    const d = new Uint8Array([0]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #81', () => {
    const d = new Uint8Array([0, 1]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #82', () => {
    const d = new Uint8Array([0, 1, 2]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #83', () => {
    const d = new Uint8Array([0, 1, 2, 3]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #84', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #85', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #86', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #87', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #88', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #89', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #90', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #91', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #92', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #93', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #94', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    const chunks = splitBytes(d, 4);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #95', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const chunks = splitBytes(d, 5);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #96', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const chunks = splitBytes(d, 6);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #97', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    const chunks = splitBytes(d, 7);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #98', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    const chunks = splitBytes(d, 1);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #99', () => {
    const d = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    const chunks = splitBytes(d, 2);
    expect(joinBytes(...chunks)).toEqual(d);
  });
  it('split/join round-trip #100', () => {
    const d = new Uint8Array([0]);
    const chunks = splitBytes(d, 3);
    expect(joinBytes(...chunks)).toEqual(d);
  });
});

describe('zeroPad', () => {
  it('zeroPad to length #1', () => {
    const d = new Uint8Array([1]);
    const p = zeroPad(d, 5);
    expect(p.length).toBe(5);
    expect(p[4]).toBe(1);
  });
  it('zeroPad to length #2', () => {
    const d = new Uint8Array([2]);
    const p = zeroPad(d, 6);
    expect(p.length).toBe(6);
    expect(p[5]).toBe(2);
  });
  it('zeroPad to length #3', () => {
    const d = new Uint8Array([3]);
    const p = zeroPad(d, 7);
    expect(p.length).toBe(7);
    expect(p[6]).toBe(3);
  });
  it('zeroPad to length #4', () => {
    const d = new Uint8Array([4]);
    const p = zeroPad(d, 8);
    expect(p.length).toBe(8);
    expect(p[7]).toBe(4);
  });
  it('zeroPad to length #5', () => {
    const d = new Uint8Array([5]);
    const p = zeroPad(d, 9);
    expect(p.length).toBe(9);
    expect(p[8]).toBe(5);
  });
  it('zeroPad to length #6', () => {
    const d = new Uint8Array([6]);
    const p = zeroPad(d, 10);
    expect(p.length).toBe(10);
    expect(p[9]).toBe(6);
  });
  it('zeroPad to length #7', () => {
    const d = new Uint8Array([7]);
    const p = zeroPad(d, 11);
    expect(p.length).toBe(11);
    expect(p[10]).toBe(7);
  });
  it('zeroPad to length #8', () => {
    const d = new Uint8Array([8]);
    const p = zeroPad(d, 12);
    expect(p.length).toBe(12);
    expect(p[11]).toBe(8);
  });
  it('zeroPad to length #9', () => {
    const d = new Uint8Array([9]);
    const p = zeroPad(d, 13);
    expect(p.length).toBe(13);
    expect(p[12]).toBe(9);
  });
  it('zeroPad to length #10', () => {
    const d = new Uint8Array([10]);
    const p = zeroPad(d, 14);
    expect(p.length).toBe(14);
    expect(p[13]).toBe(10);
  });
  it('zeroPad to length #11', () => {
    const d = new Uint8Array([11]);
    const p = zeroPad(d, 15);
    expect(p.length).toBe(15);
    expect(p[14]).toBe(11);
  });
  it('zeroPad to length #12', () => {
    const d = new Uint8Array([12]);
    const p = zeroPad(d, 16);
    expect(p.length).toBe(16);
    expect(p[15]).toBe(12);
  });
  it('zeroPad to length #13', () => {
    const d = new Uint8Array([13]);
    const p = zeroPad(d, 17);
    expect(p.length).toBe(17);
    expect(p[16]).toBe(13);
  });
  it('zeroPad to length #14', () => {
    const d = new Uint8Array([14]);
    const p = zeroPad(d, 18);
    expect(p.length).toBe(18);
    expect(p[17]).toBe(14);
  });
  it('zeroPad to length #15', () => {
    const d = new Uint8Array([15]);
    const p = zeroPad(d, 19);
    expect(p.length).toBe(19);
    expect(p[18]).toBe(15);
  });
  it('zeroPad to length #16', () => {
    const d = new Uint8Array([16]);
    const p = zeroPad(d, 20);
    expect(p.length).toBe(20);
    expect(p[19]).toBe(16);
  });
  it('zeroPad to length #17', () => {
    const d = new Uint8Array([17]);
    const p = zeroPad(d, 21);
    expect(p.length).toBe(21);
    expect(p[20]).toBe(17);
  });
  it('zeroPad to length #18', () => {
    const d = new Uint8Array([18]);
    const p = zeroPad(d, 22);
    expect(p.length).toBe(22);
    expect(p[21]).toBe(18);
  });
  it('zeroPad to length #19', () => {
    const d = new Uint8Array([19]);
    const p = zeroPad(d, 23);
    expect(p.length).toBe(23);
    expect(p[22]).toBe(19);
  });
  it('zeroPad to length #20', () => {
    const d = new Uint8Array([20]);
    const p = zeroPad(d, 24);
    expect(p.length).toBe(24);
    expect(p[23]).toBe(20);
  });
  it('zeroPad to length #21', () => {
    const d = new Uint8Array([21]);
    const p = zeroPad(d, 25);
    expect(p.length).toBe(25);
    expect(p[24]).toBe(21);
  });
  it('zeroPad to length #22', () => {
    const d = new Uint8Array([22]);
    const p = zeroPad(d, 26);
    expect(p.length).toBe(26);
    expect(p[25]).toBe(22);
  });
  it('zeroPad to length #23', () => {
    const d = new Uint8Array([23]);
    const p = zeroPad(d, 27);
    expect(p.length).toBe(27);
    expect(p[26]).toBe(23);
  });
  it('zeroPad to length #24', () => {
    const d = new Uint8Array([24]);
    const p = zeroPad(d, 28);
    expect(p.length).toBe(28);
    expect(p[27]).toBe(24);
  });
  it('zeroPad to length #25', () => {
    const d = new Uint8Array([25]);
    const p = zeroPad(d, 29);
    expect(p.length).toBe(29);
    expect(p[28]).toBe(25);
  });
  it('zeroPad to length #26', () => {
    const d = new Uint8Array([26]);
    const p = zeroPad(d, 30);
    expect(p.length).toBe(30);
    expect(p[29]).toBe(26);
  });
  it('zeroPad to length #27', () => {
    const d = new Uint8Array([27]);
    const p = zeroPad(d, 31);
    expect(p.length).toBe(31);
    expect(p[30]).toBe(27);
  });
  it('zeroPad to length #28', () => {
    const d = new Uint8Array([28]);
    const p = zeroPad(d, 32);
    expect(p.length).toBe(32);
    expect(p[31]).toBe(28);
  });
  it('zeroPad to length #29', () => {
    const d = new Uint8Array([29]);
    const p = zeroPad(d, 33);
    expect(p.length).toBe(33);
    expect(p[32]).toBe(29);
  });
  it('zeroPad to length #30', () => {
    const d = new Uint8Array([30]);
    const p = zeroPad(d, 34);
    expect(p.length).toBe(34);
    expect(p[33]).toBe(30);
  });
  it('zeroPad to length #31', () => {
    const d = new Uint8Array([31]);
    const p = zeroPad(d, 35);
    expect(p.length).toBe(35);
    expect(p[34]).toBe(31);
  });
  it('zeroPad to length #32', () => {
    const d = new Uint8Array([32]);
    const p = zeroPad(d, 36);
    expect(p.length).toBe(36);
    expect(p[35]).toBe(32);
  });
  it('zeroPad to length #33', () => {
    const d = new Uint8Array([33]);
    const p = zeroPad(d, 37);
    expect(p.length).toBe(37);
    expect(p[36]).toBe(33);
  });
  it('zeroPad to length #34', () => {
    const d = new Uint8Array([34]);
    const p = zeroPad(d, 38);
    expect(p.length).toBe(38);
    expect(p[37]).toBe(34);
  });
  it('zeroPad to length #35', () => {
    const d = new Uint8Array([35]);
    const p = zeroPad(d, 39);
    expect(p.length).toBe(39);
    expect(p[38]).toBe(35);
  });
  it('zeroPad to length #36', () => {
    const d = new Uint8Array([36]);
    const p = zeroPad(d, 40);
    expect(p.length).toBe(40);
    expect(p[39]).toBe(36);
  });
  it('zeroPad to length #37', () => {
    const d = new Uint8Array([37]);
    const p = zeroPad(d, 41);
    expect(p.length).toBe(41);
    expect(p[40]).toBe(37);
  });
  it('zeroPad to length #38', () => {
    const d = new Uint8Array([38]);
    const p = zeroPad(d, 42);
    expect(p.length).toBe(42);
    expect(p[41]).toBe(38);
  });
  it('zeroPad to length #39', () => {
    const d = new Uint8Array([39]);
    const p = zeroPad(d, 43);
    expect(p.length).toBe(43);
    expect(p[42]).toBe(39);
  });
  it('zeroPad to length #40', () => {
    const d = new Uint8Array([40]);
    const p = zeroPad(d, 44);
    expect(p.length).toBe(44);
    expect(p[43]).toBe(40);
  });
  it('zeroPad to length #41', () => {
    const d = new Uint8Array([41]);
    const p = zeroPad(d, 45);
    expect(p.length).toBe(45);
    expect(p[44]).toBe(41);
  });
  it('zeroPad to length #42', () => {
    const d = new Uint8Array([42]);
    const p = zeroPad(d, 46);
    expect(p.length).toBe(46);
    expect(p[45]).toBe(42);
  });
  it('zeroPad to length #43', () => {
    const d = new Uint8Array([43]);
    const p = zeroPad(d, 47);
    expect(p.length).toBe(47);
    expect(p[46]).toBe(43);
  });
  it('zeroPad to length #44', () => {
    const d = new Uint8Array([44]);
    const p = zeroPad(d, 48);
    expect(p.length).toBe(48);
    expect(p[47]).toBe(44);
  });
  it('zeroPad to length #45', () => {
    const d = new Uint8Array([45]);
    const p = zeroPad(d, 49);
    expect(p.length).toBe(49);
    expect(p[48]).toBe(45);
  });
  it('zeroPad to length #46', () => {
    const d = new Uint8Array([46]);
    const p = zeroPad(d, 50);
    expect(p.length).toBe(50);
    expect(p[49]).toBe(46);
  });
  it('zeroPad to length #47', () => {
    const d = new Uint8Array([47]);
    const p = zeroPad(d, 51);
    expect(p.length).toBe(51);
    expect(p[50]).toBe(47);
  });
  it('zeroPad to length #48', () => {
    const d = new Uint8Array([48]);
    const p = zeroPad(d, 52);
    expect(p.length).toBe(52);
    expect(p[51]).toBe(48);
  });
  it('zeroPad to length #49', () => {
    const d = new Uint8Array([49]);
    const p = zeroPad(d, 53);
    expect(p.length).toBe(53);
    expect(p[52]).toBe(49);
  });
  it('zeroPad to length #50', () => {
    const d = new Uint8Array([50]);
    const p = zeroPad(d, 54);
    expect(p.length).toBe(54);
    expect(p[53]).toBe(50);
  });
  it('zeroPad shorter truncates #1', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #2', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #3', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #4', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #5', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #6', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #7', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #8', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #9', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #10', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #11', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #12', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #13', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #14', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #15', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #16', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #17', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #18', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #19', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #20', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #21', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #22', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #23', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #24', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #25', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #26', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #27', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #28', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #29', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #30', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #31', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #32', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #33', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #34', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #35', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #36', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #37', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #38', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #39', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #40', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #41', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #42', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #43', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #44', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #45', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #46', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #47', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #48', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #49', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
  it('zeroPad shorter truncates #50', () => {
    const d = new Uint8Array([1,2,3,4,5]);
    const p = zeroPad(d, 3);
    expect(p.length).toBe(3);
  });
});

describe('generateId', () => {
  it('generateId length 2 #1', () => { expect(generateId(1)).toHaveLength(2); });
  it('generateId length 4 #2', () => { expect(generateId(2)).toHaveLength(4); });
  it('generateId length 6 #3', () => { expect(generateId(3)).toHaveLength(6); });
  it('generateId length 8 #4', () => { expect(generateId(4)).toHaveLength(8); });
  it('generateId length 10 #5', () => { expect(generateId(5)).toHaveLength(10); });
  it('generateId length 12 #6', () => { expect(generateId(6)).toHaveLength(12); });
  it('generateId length 14 #7', () => { expect(generateId(7)).toHaveLength(14); });
  it('generateId length 16 #8', () => { expect(generateId(8)).toHaveLength(16); });
  it('generateId length 18 #9', () => { expect(generateId(9)).toHaveLength(18); });
  it('generateId length 20 #10', () => { expect(generateId(10)).toHaveLength(20); });
  it('generateId length 22 #11', () => { expect(generateId(11)).toHaveLength(22); });
  it('generateId length 24 #12', () => { expect(generateId(12)).toHaveLength(24); });
  it('generateId length 26 #13', () => { expect(generateId(13)).toHaveLength(26); });
  it('generateId length 28 #14', () => { expect(generateId(14)).toHaveLength(28); });
  it('generateId length 30 #15', () => { expect(generateId(15)).toHaveLength(30); });
  it('generateId length 32 #16', () => { expect(generateId(16)).toHaveLength(32); });
  it('generateId length 34 #17', () => { expect(generateId(17)).toHaveLength(34); });
  it('generateId length 36 #18', () => { expect(generateId(18)).toHaveLength(36); });
  it('generateId length 38 #19', () => { expect(generateId(19)).toHaveLength(38); });
  it('generateId length 2 #20', () => { expect(generateId(1)).toHaveLength(2); });
  it('generateId length 2 #21', () => { expect(generateId(1)).toHaveLength(2); });
  it('generateId length 4 #22', () => { expect(generateId(2)).toHaveLength(4); });
  it('generateId length 6 #23', () => { expect(generateId(3)).toHaveLength(6); });
  it('generateId length 8 #24', () => { expect(generateId(4)).toHaveLength(8); });
  it('generateId length 10 #25', () => { expect(generateId(5)).toHaveLength(10); });
  it('generateId length 12 #26', () => { expect(generateId(6)).toHaveLength(12); });
  it('generateId length 14 #27', () => { expect(generateId(7)).toHaveLength(14); });
  it('generateId length 16 #28', () => { expect(generateId(8)).toHaveLength(16); });
  it('generateId length 18 #29', () => { expect(generateId(9)).toHaveLength(18); });
  it('generateId length 20 #30', () => { expect(generateId(10)).toHaveLength(20); });
  it('generateId length 22 #31', () => { expect(generateId(11)).toHaveLength(22); });
  it('generateId length 24 #32', () => { expect(generateId(12)).toHaveLength(24); });
  it('generateId length 26 #33', () => { expect(generateId(13)).toHaveLength(26); });
  it('generateId length 28 #34', () => { expect(generateId(14)).toHaveLength(28); });
  it('generateId length 30 #35', () => { expect(generateId(15)).toHaveLength(30); });
  it('generateId length 32 #36', () => { expect(generateId(16)).toHaveLength(32); });
  it('generateId length 34 #37', () => { expect(generateId(17)).toHaveLength(34); });
  it('generateId length 36 #38', () => { expect(generateId(18)).toHaveLength(36); });
  it('generateId length 38 #39', () => { expect(generateId(19)).toHaveLength(38); });
  it('generateId length 2 #40', () => { expect(generateId(1)).toHaveLength(2); });
  it('generateId length 2 #41', () => { expect(generateId(1)).toHaveLength(2); });
  it('generateId length 4 #42', () => { expect(generateId(2)).toHaveLength(4); });
  it('generateId length 6 #43', () => { expect(generateId(3)).toHaveLength(6); });
  it('generateId length 8 #44', () => { expect(generateId(4)).toHaveLength(8); });
  it('generateId length 10 #45', () => { expect(generateId(5)).toHaveLength(10); });
  it('generateId length 12 #46', () => { expect(generateId(6)).toHaveLength(12); });
  it('generateId length 14 #47', () => { expect(generateId(7)).toHaveLength(14); });
  it('generateId length 16 #48', () => { expect(generateId(8)).toHaveLength(16); });
  it('generateId length 18 #49', () => { expect(generateId(9)).toHaveLength(18); });
  it('generateId length 20 #50', () => { expect(generateId(10)).toHaveLength(20); });
  it('generateId is hex string #1', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #2', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #3', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #4', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #5', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #6', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #7', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #8', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #9', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #10', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #11', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #12', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #13', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #14', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #15', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #16', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #17', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #18', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #19', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #20', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #21', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #22', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #23', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #24', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #25', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #26', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #27', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #28', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #29', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #30', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #31', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #32', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #33', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #34', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #35', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #36', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #37', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #38', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #39', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #40', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #41', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #42', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #43', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #44', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #45', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #46', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #47', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #48', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #49', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
  it('generateId is hex string #50', () => { expect(generateId(8)).toMatch(/^[0-9a-f]{16}$/); });
});
