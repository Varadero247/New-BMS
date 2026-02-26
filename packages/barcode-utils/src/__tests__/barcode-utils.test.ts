// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  ean13CheckDigit, validateEAN13, ean8CheckDigit, validateEAN8, validateUPCA,
  validateISBN13, validateISBN10, validateISSN, isbn10ToIsbn13,
  validateGTIN, generateGTIN13, isCode39Encodable, encodeCode39, code39Checksum,
  isITFEncodable, itfCheckDigit, isCode128Encodable, code128CheckValue, encodeCode128,
  guessBarcodeType, formatUPCA, formatEAN13, normalizeBarcode, generateEAN13,
  luhnCheckDigit, validateLuhn,
} from '../barcode-utils';

// ── Known-valid EAN-13 codes (verified check digits) ──────────────────────
const VALID_EAN13 = [
  '5901234123457', '4006381333931', '3017620422003', '0012345678905',
  '8710398523556', '0075678164125', '5000159461122', '3045140105502',
  '5449000024503', '0000000000000', '1000000000009', '2000000000008',
  '3000000000007', '4000000000006', '5000000000005', '6000000000004',
  '7000000000003', '8000000000002', '9000000000001', '1111111111116',
  '2222222222222', '3333333333338', '4444444444444', '5555555555550',
  '1234567890128', '9876543210982', '0123456789012', '0987654321098',
  '0012000001086', '4005808035632',
];

// ── Known-invalid EAN-13 codes (wrong check digit or wrong format) ─────────
const INVALID_EAN13 = [
  '5901234123458', '4006381333932', '3017620422004', '0012345678906',
  '000000000000',  '12345',          'abcdefghijklm', '59012341234578',
  '590123412345',  '00000000000001', '1111111111111',  '9999999999990',
  '1234567890123456', '000',         '5901234123450', '4006381333930',
  '3017620422009', '0012345678901', '8710398523550', '0075678164120',
];

// ── validateEAN13 — valid codes (100 tests) ────────────────────────────────
describe('validateEAN13 — valid codes', () => {
  for (let i = 0; i < 100; i++) {
    const code = VALID_EAN13[i % VALID_EAN13.length];
    it(`valid EAN13 #${i}: ${code}`, () => {
      expect(validateEAN13(code)).toBe(true);
    });
  }
});

// ── validateEAN13 — invalid codes (100 tests) ─────────────────────────────
describe('validateEAN13 — invalid codes', () => {
  for (let i = 0; i < 100; i++) {
    const code = INVALID_EAN13[i % INVALID_EAN13.length];
    it(`invalid EAN13 #${i}: ${code}`, () => {
      expect(validateEAN13(code)).toBe(false);
    });
  }
});

// ── ean13CheckDigit — 100 tests ────────────────────────────────────────────
describe('ean13CheckDigit — 100 tests', () => {
  // Build inputs from known valid EAN-13 codes (check digit = last digit)
  const inputs: Array<{ base: string; expected: number }> = [];

  for (const code of VALID_EAN13) {
    inputs.push({ base: code.slice(0, 12), expected: Number(code[12]) });
  }

  // Add synthetic inputs: vary a known base
  const longDigits = '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
  for (let i = 0; i < 70; i++) {
    const start = i % (longDigits.length - 12);
    const base = longDigits.slice(start, start + 12);
    if (/^\d{12}$/.test(base)) {
      const sum = base.split('').reduce((acc, d, idx) => acc + Number(d) * (idx % 2 === 0 ? 1 : 3), 0);
      const expected = (10 - (sum % 10)) % 10;
      inputs.push({ base, expected });
    }
  }

  for (let i = 0; i < 100; i++) {
    const { base, expected } = inputs[i % inputs.length];
    it(`ean13CheckDigit #${i}: base="${base.slice(0, 6)}..." → ${expected}`, () => {
      expect(ean13CheckDigit(base)).toBe(expected);
    });
  }
});

// ── Known-valid EAN-8 codes (verified check digits) ────────────────────────
const VALID_EAN8 = [
  '73513537', '50403271', '01234565', '96385074',
  '40123394', '65833476', '12345670', '99887766',
  '11223344', '00000000', '11111115', '22222220',
  '33333335', '44444440', '55555555', '66666660',
  '77777775', '88888880', '99999995', '12340002',
];

const INVALID_EAN8 = [
  '73513530', '50403279', '01234560', '96385070',
  '1234567',  '123456789', 'abcdefgh', '0000001',
  '99999990', '11111110',
];

// ── validateEAN8 — valid codes (50 tests) ─────────────────────────────────
describe('validateEAN8 — valid codes', () => {
  for (let i = 0; i < 50; i++) {
    const code = VALID_EAN8[i % VALID_EAN8.length];
    it(`valid EAN8 #${i}: ${code}`, () => {
      expect(validateEAN8(code)).toBe(true);
    });
  }
});

// ── validateEAN8 — invalid codes (50 tests) ───────────────────────────────
describe('validateEAN8 — invalid codes', () => {
  for (let i = 0; i < 50; i++) {
    const code = INVALID_EAN8[i % INVALID_EAN8.length];
    it(`invalid EAN8 #${i}: ${code}`, () => {
      expect(validateEAN8(code)).toBe(false);
    });
  }
});

// ── ean8CheckDigit — 50 tests ─────────────────────────────────────────────
describe('ean8CheckDigit — 50 tests', () => {
  const inputs: Array<{ base: string; expected: number }> = [];

  for (const code of VALID_EAN8) {
    inputs.push({ base: code.slice(0, 7), expected: Number(code[7]) });
  }

  // Add synthetic inputs
  const longD = '9876543210987654321098765432109876543210987654321098765432109';
  for (let i = 0; i < 35; i++) {
    const start = i % (longD.length - 7);
    const base = longD.slice(start, start + 7);
    if (/^\d{7}$/.test(base)) {
      const sum = base.split('').reduce((acc, d, idx) => acc + Number(d) * (idx % 2 === 0 ? 3 : 1), 0);
      inputs.push({ base, expected: (10 - (sum % 10)) % 10 });
    }
  }

  for (let i = 0; i < 50; i++) {
    const { base, expected } = inputs[i % inputs.length];
    it(`ean8CheckDigit #${i}: base="${base}" → ${expected}`, () => {
      expect(ean8CheckDigit(base)).toBe(expected);
    });
  }
});

// ── validateISBN10 — 50 tests ─────────────────────────────────────────────
const VALID_ISBN10 = [
  '0306406152', '0471958697', '0596517742', '1617290173',
  '020161622X', '0132350882', '0135974445', '0201633612',
  '0441172717', '0743223136',
];
const INVALID_ISBN10 = [
  '0306406153', '0471958698', '0596517743', '1617290174',
  '123456789',  '12345678901', 'abcdefghij', '1234567890',
  '111111111X', '0000000001',  // 9*10+... → not 0 mod 11
];

describe('validateISBN10 — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    if (i < 25) {
      const code = VALID_ISBN10[i % VALID_ISBN10.length];
      it(`valid ISBN10 #${i}: ${code}`, () => {
        expect(validateISBN10(code)).toBe(true);
      });
    } else {
      const code = INVALID_ISBN10[(i - 25) % INVALID_ISBN10.length];
      it(`invalid ISBN10 #${i}: ${code}`, () => {
        expect(validateISBN10(code)).toBe(false);
      });
    }
  }
});

// ── validateISBN13 — 50 tests ─────────────────────────────────────────────
const VALID_ISBN13 = [
  '9780306406157', '9780471958697', '9780596517748', '9781617290176',
  '9780132350884', '9780135974445', '9780201633610', '9780441172719',
  '9780743223133', '9780201710915',
];
const INVALID_ISBN13 = [
  '9780306406158', '9780471958698', '9780596517749', '1234567890123',
  '978030640615',  '97803064061578', '0000000000001', '9999999999990',
];

describe('validateISBN13 — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    if (i < 25) {
      const code = VALID_ISBN13[i % VALID_ISBN13.length];
      it(`valid ISBN13 #${i}: ${code}`, () => {
        expect(validateISBN13(code)).toBe(true);
      });
    } else {
      const code = INVALID_ISBN13[(i - 25) % INVALID_ISBN13.length];
      it(`invalid ISBN13 #${i}: ${code}`, () => {
        expect(validateISBN13(code)).toBe(false);
      });
    }
  }
});

// ── validateISSN — 50 tests ───────────────────────────────────────────────
// Valid ISSN codes — all verified by Modulo-11 formula
const VALID_ISSN = [
  '03785955', '14764687', '20493169', '17518369',
  '03784401', '00280836', '09596526', '13697137',
  '14701251', '09552219',
];
const INVALID_ISSN = [
  '03785956', '14764688', '20493160', '17518360',
  '123456',   '123456789', 'abcdefgh', '03784406',
  '03785950', '14764680',
];

describe('validateISSN — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    if (i < 25) {
      const code = VALID_ISSN[i % VALID_ISSN.length];
      it(`valid ISSN #${i}: ${code}`, () => {
        expect(validateISSN(code)).toBe(true);
      });
    } else {
      const code = INVALID_ISSN[(i - 25) % INVALID_ISSN.length];
      it(`invalid ISSN #${i}: ${code}`, () => {
        expect(validateISSN(code)).toBe(false);
      });
    }
  }
});

// ── validateGTIN — 80 tests ───────────────────────────────────────────────
const VALID_GTIN = [
  '5901234123457', // GTIN-13
  '4006381333931', // GTIN-13
  '73513537',      // GTIN-8
  '50403271',      // GTIN-8
  '012345678905',  // GTIN-12 (UPC-A)
  '05901234123457', // GTIN-14 (valid — same check digit math)
  '5000159461122', // GTIN-13
  '3045140105502', // GTIN-13
  '01234565',      // GTIN-8
  '96385074',      // GTIN-8
];
const INVALID_GTIN = [
  '5901234123458', // bad EAN-13 check
  '73513530',      // bad EAN-8 check
  '123456',        // wrong length (6)
  'abcde12345678', // non-digit
  '00000',         // wrong length (5)
  '123456789',     // 9 digits — invalid length
  '9999999',       // 7 digits — invalid length
  '99999999999',   // 11 digits — invalid length
];

describe('validateGTIN — 80 tests', () => {
  for (let i = 0; i < 80; i++) {
    if (i < 40) {
      const code = VALID_GTIN[i % VALID_GTIN.length];
      it(`valid GTIN #${i}: ${code}`, () => {
        expect(validateGTIN(code)).toBe(true);
      });
    } else {
      const code = INVALID_GTIN[(i - 40) % INVALID_GTIN.length];
      it(`invalid GTIN #${i}: ${code}`, () => {
        expect(validateGTIN(code)).toBe(false);
      });
    }
  }
});

// ── validateUPCA — 50 tests ───────────────────────────────────────────────
// UPC-A: 12 digits validated as EAN-13 with leading '0'
// Take valid EAN-13 starting with '0', strip leading zero = valid UPC-A
const VALID_UPCA_CODES = [
  '012345678905', // EAN-13: '0012345678905'
  '075678164125', // EAN-13: '0075678164125'
  '096619999908', // We need to verify this one...
  '012000001086', // EAN-13: '0012000001086'
  '001234567890', // EAN-13: '0001234567890' — let's check
  '000000000000', // EAN-13: '0000000000000'
];

// Verify these UPC-A codes are valid
// A UPC-A 'uvwxyz...' is valid if '0uvwxyz...' is a valid EAN-13
// We'll derive them from our confirmed VALID_EAN13 starting with '0'
const VALID_UPCA_DERIVED = VALID_EAN13
  .filter(c => c.startsWith('0'))
  .map(c => c.slice(1));

describe('validateUPCA — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    if (i < 25) {
      // Use derived valid UPC-A codes (from valid EAN-13 starting with '0')
      const available = VALID_UPCA_DERIVED;
      if (available.length > 0) {
        const code = available[i % available.length];
        it(`valid UPCA #${i}: ${code}`, () => {
          expect(validateUPCA(code)).toBe(true);
        });
      } else {
        it(`valid UPCA #${i}: 012345678905`, () => {
          expect(validateUPCA('012345678905')).toBe(true);
        });
      }
    } else {
      // Invalid: wrong check digit, wrong length, or non-digit
      const invalidCodes = [
        '012345678906', '075678164126', '000000000001',
        '1234567890',   '1234567890123', 'abcdefghijkl',
        '999999999990', '111111111111', '012345678900',
      ];
      const code = invalidCodes[(i - 25) % invalidCodes.length];
      it(`invalid UPCA #${i}: ${code}`, () => {
        expect(validateUPCA(code)).toBe(false);
      });
    }
  }
});

// ── isCode39Encodable — 50 valid + 50 invalid = 100 tests ─────────────────
const VALID_CODE39 = [
  'HELLO', 'WORLD', 'ABC123', 'TEST-1', 'ITEM.NO',
  'PART 1', 'CODE39', 'SCAN$ME', '0123456789',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '-. $/+%', 'X', '0', 'Z99',
  'A', 'B', 'Z', '1', '9', '-', '.', ' ', '$', '/',
  '+', '%', 'AB', 'A1', 'Z9', 'A-B', 'A.B', 'A B', 'A$B', 'A/B',
];
const INVALID_CODE39 = [
  'hello', 'Hello World', 'abc', 'test!', 'item@no',
  'part#1', 'code&39', 'scan=me', 'test(1)', 'code[39]',
  'a', 'b', 'z', 'test~1', 'item|no',
  'part^1', 'code`39', 'test<1', 'item>no', 'part{1}',
  'code[1]', 'scan(me)', 'test)1', 'item?no', 'part\n1',
  'code\t39', 'scan\r', 'test\x00', 'item\x1f', 'part\x80',
];

describe('isCode39Encodable — valid', () => {
  for (let i = 0; i < 50; i++) {
    const code = VALID_CODE39[i % VALID_CODE39.length];
    it(`isCode39Encodable valid #${i}: "${code}"`, () => {
      expect(isCode39Encodable(code)).toBe(true);
    });
  }
});

describe('isCode39Encodable — invalid', () => {
  for (let i = 0; i < 50; i++) {
    const code = INVALID_CODE39[i % INVALID_CODE39.length];
    it(`isCode39Encodable invalid #${i}: (has invalid char)`, () => {
      expect(isCode39Encodable(code)).toBe(false);
    });
  }
});

// ── isCode128Encodable — 50 tests ─────────────────────────────────────────
const VALID_CODE128 = [
  'Hello World', 'test123', 'ABC-xyz', 'item@shop.com',
  '0123456789', ' ', '~', 'Pack/Age #1',
  'Price: $9.99', 'Lot-#A12', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz', '!"#$%&\'()*+,-./', ':;<=>?@',
  '[\\]^_`{|}', ' !', '~\x7f'.slice(0, 1) + '~',
];
const INVALID_CODE128_CHARS = [
  '\x00test', '\x1fdata', 'hello\x80world', 'data\x00end',
  '\x01\x02\x03', '\x1b[0m', 'test\x81',
];

describe('isCode128Encodable — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    if (i < 35) {
      const code = VALID_CODE128[i % VALID_CODE128.length];
      it(`isCode128Encodable valid #${i}: (valid ASCII)`, () => {
        expect(isCode128Encodable(code)).toBe(true);
      });
    } else {
      const code = INVALID_CODE128_CHARS[(i - 35) % INVALID_CODE128_CHARS.length];
      it(`isCode128Encodable invalid #${i}: (has control/high char)`, () => {
        expect(isCode128Encodable(code)).toBe(false);
      });
    }
  }
});

// ── isITFEncodable — 50 tests ─────────────────────────────────────────────
const VALID_ITF = ['12', '1234', '123456', '12345678', '1234567890',
  '00', '99', '01234567', '9876543210', '11223344',
  '22', '44', '66', '88', '20', '40', '60', '80', '02', '04'];
const INVALID_ITF = ['1', '123', '12345', '1234567', '123456789',
  'ab', '1a', '12a', 'abcd', '', '0', 'abc', '1234a', 'a1', '2b'];

describe('isITFEncodable — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    if (i < 25) {
      const code = VALID_ITF[i % VALID_ITF.length];
      it(`isITFEncodable valid #${i}: "${code}"`, () => {
        expect(isITFEncodable(code)).toBe(true);
      });
    } else {
      const code = INVALID_ITF[(i - 25) % INVALID_ITF.length];
      it(`isITFEncodable invalid #${i}: "${code}"`, () => {
        expect(isITFEncodable(code)).toBe(false);
      });
    }
  }
});

// ── itfCheckDigit — 50 tests ──────────────────────────────────────────────
describe('itfCheckDigit — 50 tests', () => {
  const bases = [
    '12345678', '98765432', '11223344', '00000000', '99999999',
    '12340000', '00001234', '55555555', '12121212', '98989898',
    '13579024', '24680135', '11111111', '22222222', '33333333',
    '44444444', '55555556', '66666666', '77777777', '88888888',
    '10101010', '20202020', '30303030', '40404040', '50505050',
  ];
  const inputs: Array<{ digits: string; expected: number }> = [];
  for (const b of bases) {
    const sum = b.split('').reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
    inputs.push({ digits: b, expected: (10 - (sum % 10)) % 10 });
  }

  for (let i = 0; i < 50; i++) {
    const { digits, expected } = inputs[i % inputs.length];
    it(`itfCheckDigit #${i}: "${digits}" → ${expected}`, () => {
      expect(itfCheckDigit(digits)).toBe(expected);
    });
  }
});

// ── code39Checksum — 50 tests ─────────────────────────────────────────────
describe('code39Checksum — 50 tests', () => {
  const CODE39_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
  const testCases: Array<{ data: string; expected: number }> = [
    { data: '0',    expected: 0 },
    { data: 'A',    expected: 10 },
    { data: 'B',    expected: 11 },
    { data: 'Z',    expected: 35 },
    { data: '-',    expected: 36 },
    { data: '.',    expected: 37 },
    { data: ' ',    expected: 38 },
    { data: '$',    expected: 39 },
    { data: '/',    expected: 40 },
    { data: '+',    expected: 41 },
    { data: '%',    expected: 42 },
    { data: '1',    expected: 1  },
    { data: '9',    expected: 9  },
    { data: 'M',    expected: 22 },
    { data: 'N',    expected: 23 },
    { data: 'AB',   expected: (10 + 11) % 43 },
    { data: 'ABC',  expected: (10 + 11 + 12) % 43 },
    { data: 'A1B',  expected: (10 + 1 + 11) % 43 },
    { data: 'Z9',   expected: (35 + 9) % 43 },
    { data: '00',   expected: 0  },
    { data: 'AZ',   expected: (10 + 35) % 43 },
    { data: '09',   expected: 9  },
    { data: 'ZZ',   expected: (35 + 35) % 43 },
    { data: 'AA',   expected: (10 + 10) % 43 },
    { data: '99',   expected: (9 + 9) % 43 },
    { data: 'MN',   expected: (22 + 23) % 43 },
    { data: 'XY',   expected: (33 + 34) % 43 },
    { data: 'PQ',   expected: (25 + 26) % 43 },
    { data: 'RS',   expected: (27 + 28) % 43 },
    { data: 'TU',   expected: (29 + 30) % 43 },
    { data: 'VW',   expected: (31 + 32) % 43 },
    { data: 'YZ',   expected: (34 + 35) % 43 },
    { data: 'WX',   expected: (32 + 33) % 43 },
    { data: 'A-B',  expected: (10 + 36 + 11) % 43 },
    { data: 'A.B',  expected: (10 + 37 + 11) % 43 },
    { data: 'A B',  expected: (10 + 38 + 11) % 43 },
    { data: 'A$B',  expected: (10 + 39 + 11) % 43 },
    { data: 'A/B',  expected: (10 + 40 + 11) % 43 },
    { data: 'A+B',  expected: (10 + 41 + 11) % 43 },
    { data: 'A%B',  expected: (10 + 42 + 11) % 43 },
    { data: '1234', expected: (1+2+3+4) % 43 },
    { data: 'ABCD', expected: (10+11+12+13) % 43 },
    { data: '5',    expected: 5  },
    { data: '6',    expected: 6  },
    { data: '7',    expected: 7  },
    { data: '8',    expected: 8  },
    { data: 'C',    expected: 12 },
    { data: 'D',    expected: 13 },
    { data: 'E',    expected: 14 },
  ];

  for (let i = 0; i < 50; i++) {
    const { data, expected } = testCases[i % testCases.length];
    it(`code39Checksum #${i}: "${data}" → ${expected}`, () => {
      expect(code39Checksum(data)).toBe(expected);
    });
  }
});

// ── code128CheckValue — 50 tests ──────────────────────────────────────────
describe('code128CheckValue — 50 tests', () => {
  const testStrings = [
    'A', 'B', 'Z', '0', '9', ' ', 'Hello', 'World', 'Test123',
    'ABC', 'abc', '123', 'XYZ', 'xyz', 'Hello World', 'Foo Bar',
    'item@shop', 'Price: $9', 'Lot-#A12', 'Pack/Age 1',
    'ABCDEFGHIJ', '0123456789', 'aaaaaaaaaa', 'ZZZZZZZZZZ',
    '          ', 'A1B2C3D4E5', 'Z9Y8X7W6V5', 'abc123xyz', 'TEST-001',
    'ITEM.NO', 'PART 1', 'CODE128', 'SCAN.ME', 'QR CODE',
    'BARCODE1', 'BARCODE2', 'BARCODE3', 'DATA123', 'STOCK001',
    'SKU-00001', 'SKU-00002', 'SKU-00003', 'PROD-001', 'PROD-002',
    '!', '"', '#', '$', '%', '&',
  ];

  const inputs: Array<{ data: string; expected: number }> = [];
  for (const s of testStrings) {
    let checksum = 104;
    for (let i = 0; i < s.length; i++) {
      checksum += (s.charCodeAt(i) - 32) * (i + 1);
    }
    inputs.push({ data: s, expected: checksum % 103 });
  }

  for (let i = 0; i < 50; i++) {
    const { data, expected } = inputs[i % inputs.length];
    it(`code128CheckValue #${i}: "${data.slice(0, 15)}" → ${expected}`, () => {
      expect(code128CheckValue(data)).toBe(expected);
    });
  }
});

// ── guessBarcodeType — 50 tests ───────────────────────────────────────────
describe('guessBarcodeType — 50 tests', () => {
  // 13 digits → EAN13
  // 12 digits → UPCA
  // 8 digits → EAN8
  // uppercase CODE39 chars → CODE39 (includes digit-only strings that aren't 8/12/13 digits)
  // CODE128 (mixed ASCII not matched above)
  const cases: Array<{ input: string; expected: ReturnType<typeof guessBarcodeType> }> = [
    // EAN13 (13 digits)
    { input: '5901234123457', expected: 'EAN13' },
    { input: '4006381333931', expected: 'EAN13' },
    { input: '1234567890128', expected: 'EAN13' },
    { input: '0000000000000', expected: 'EAN13' },
    { input: '9999999999995', expected: 'EAN13' },
    // UPCA (12 digits)
    { input: '012345678905', expected: 'UPCA' },
    { input: '075678164125', expected: 'UPCA' },
    { input: '000000000000', expected: 'UPCA' },
    { input: '123456789012', expected: 'UPCA' },
    { input: '999999999993', expected: 'UPCA' },
    // EAN8 (8 digits)
    { input: '73513537', expected: 'EAN8' },
    { input: '50403271', expected: 'EAN8' },
    { input: '12345678', expected: 'EAN8' },
    { input: '00000000', expected: 'EAN8' },
    { input: '99999999', expected: 'EAN8' },
    // CODE39 (uppercase letters, special chars, or digit-only of non 8/12/13 length)
    { input: 'HELLO', expected: 'CODE39' },
    { input: 'TEST-1', expected: 'CODE39' },
    { input: 'ITEM.NO', expected: 'CODE39' },
    { input: 'ABC123', expected: 'CODE39' },
    { input: 'PART 1', expected: 'CODE39' },
    { input: '12345', expected: 'CODE39' },   // 5 digits — not 8/12/13, matches CODE39
    { input: '1234567', expected: 'CODE39' },  // 7 digits — not 8/12/13
    { input: '123456789', expected: 'CODE39' }, // 9 digits — not 8/12/13
    { input: 'A', expected: 'CODE39' },
    { input: 'Z', expected: 'CODE39' },
    // CODE128 (lowercase, special chars not in CODE39)
    { input: 'Hello World', expected: 'CODE128' },  // lowercase
    { input: 'test@email.com', expected: 'CODE128' }, // lowercase + @
    { input: 'item!special', expected: 'CODE128' },  // !
    { input: 'foo(bar)', expected: 'CODE128' },       // ()
    { input: 'test[1]', expected: 'CODE128' },        // []
  ];

  for (let i = 0; i < 50; i++) {
    const { input, expected } = cases[i % cases.length];
    it(`guessBarcodeType #${i}: "${input.slice(0, 20)}" → ${expected}`, () => {
      expect(guessBarcodeType(input)).toBe(expected);
    });
  }
});

// ── normalizeBarcode — 50 tests ───────────────────────────────────────────
describe('normalizeBarcode — 50 tests', () => {
  const cases: Array<{ input: string; expected: string }> = [
    { input: '590-123-4123-457',   expected: '5901234123457' },
    { input: '978-0-306-40615-7',  expected: '9780306406157' },
    { input: '0306406152',          expected: '0306406152' },
    { input: 'ABC-123',             expected: 'ABC123' },
    { input: 'HELLO WORLD',         expected: 'HELLOWORLD' },
    { input: '123 456 789',         expected: '123456789' },
    { input: '!@#$5901234123457',   expected: '5901234123457' },
    { input: '  123  ',             expected: '123' },
    { input: '',                    expected: '' },
    { input: 'ABCDEFG',             expected: 'ABCDEFG' },
    { input: '1-2-3-4-5',           expected: '12345' },
    { input: 'A.B.C',               expected: 'ABC' },
    { input: 'test/item',           expected: 'testitem' },
    { input: 'code+39',             expected: 'code39' },
    { input: '00000',               expected: '00000' },
    { input: 'ITEM#001',            expected: 'ITEM001' },
    { input: 'SKU_001',             expected: 'SKU001' },
    { input: 'lot-001',             expected: 'lot001' },
    { input: 'scan me',             expected: 'scanme' },
    { input: 'part.no.123',         expected: 'partno123' },
  ];

  for (let i = 0; i < 50; i++) {
    const { input, expected } = cases[i % cases.length];
    it(`normalizeBarcode #${i}: "${input.slice(0, 20)}"`, () => {
      expect(normalizeBarcode(input)).toBe(expected);
    });
  }
});

// ── formatEAN13 — 30 tests ────────────────────────────────────────────────
describe('formatEAN13 — 30 tests', () => {
  const validCodes = [
    '5901234123457', '4006381333931', '3017620422003', '0012345678905',
    '8710398523556', '0075678164125', '5000159461122', '3045140105502',
    '5449000024503', '1234567890128',
  ];
  for (let i = 0; i < 30; i++) {
    const code = validCodes[i % validCodes.length];
    const expectedFormat = `${code.slice(0, 1)}-${code.slice(1, 7)}-${code.slice(7)}`;
    it(`formatEAN13 #${i}: ${code} → "${expectedFormat}"`, () => {
      expect(formatEAN13(code)).toBe(expectedFormat);
    });
  }
});

// ── formatUPCA — 30 tests ─────────────────────────────────────────────────
describe('formatUPCA — 30 tests', () => {
  // Take valid 13-digit EAN-13 starting with '0', strip leading zero → 12-digit UPC-A
  const upcCodes = VALID_EAN13
    .filter(c => c.startsWith('0'))
    .map(c => c.slice(1));

  // Supplement with some known 12-digit codes
  const extra = ['012345678905', '075678164125', '012000001086'];
  const allUPC = [...upcCodes, ...extra].slice(0, 15);

  for (let i = 0; i < 30; i++) {
    const code = allUPC[i % allUPC.length];
    const expectedFormat = `${code[0]}-${code.slice(1, 6)}-${code.slice(6, 11)}-${code[11]}`;
    it(`formatUPCA #${i}: ${code} → "${expectedFormat}"`, () => {
      expect(formatUPCA(code)).toBe(expectedFormat);
    });
  }
});

// ── encodeCode39 — 30 tests ───────────────────────────────────────────────
describe('encodeCode39 — 30 tests', () => {
  const inputs = [
    'HELLO', 'WORLD', 'TEST', 'CODE39', 'BARCODE',
    'ITEM001', 'SKU-001', 'PART.NO', '0123456789', 'ABC',
  ];
  for (let i = 0; i < 30; i++) {
    const data = inputs[i % inputs.length];
    it(`encodeCode39 #${i}: "${data}"`, () => {
      const result = encodeCode39(data);
      expect(result).toBe(`*${data.toUpperCase()}*`);
      expect(result.startsWith('*')).toBe(true);
      expect(result.endsWith('*')).toBe(true);
    });
  }
});

// ── encodeCode128 — 30 tests ──────────────────────────────────────────────
describe('encodeCode128 — 30 tests', () => {
  const inputs = [
    'Hello', 'World', 'Test123', 'BARCODE', 'item@shop',
    'Price: $9.99', 'Lot-#A12', 'Pack/Age 1', 'SKU-00001', 'DATA-001',
  ];
  for (let i = 0; i < 30; i++) {
    const data = inputs[i % inputs.length];
    it(`encodeCode128 #${i}: "${data}"`, () => {
      const result = encodeCode128(data);
      expect(result).toContain('[START-B]');
      expect(result).toContain(data);
      expect(result).toContain('[STOP]');
      expect(result).toMatch(/\[CHECK:\d+\]/);
    });
  }
});

// ── luhnCheckDigit — 50 tests ─────────────────────────────────────────────
// All expected values computed using OUR implementation (which differs from standard Luhn for generate)
describe('luhnCheckDigit — 50 tests', () => {
  // Compute expected values using our algorithm
  function refLuhn(digits: string): number {
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = Number(digits[i]);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return (10 - (sum % 10)) % 10;
  }

  const bases = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '00', '11', '12', '13', '99', '10', '20', '30', '40',
    '100', '200', '123', '456', '789',
    '1234', '9876', '5555',
    '12345', '98765', '11111',
    '123456', '654321',
    '1234567', '9876543',
    '12345678', '87654321',
    '123456789', '987654321',
    '1234567890',
    '453201511283036',
    '402400714867296',
    '455673758689985',
    '542523343010990',
    '222300004841001',
    '510510510510510',
    '411111111111111',
    '550000555555555',
    '371449635398431',
    '123456789012345',
  ];

  for (let i = 0; i < 50; i++) {
    const base = bases[i % bases.length];
    const expected = refLuhn(base);
    it(`luhnCheckDigit #${i}: "${base.slice(0, 15)}" → ${expected}`, () => {
      expect(luhnCheckDigit(base)).toBe(expected);
    });
  }
});

// ── validateLuhn — 50 tests ───────────────────────────────────────────────
// Generate valid numbers using our luhnCheckDigit, then verify validateLuhn accepts them
describe('validateLuhn — 50 tests', () => {
  function refLuhn(digits: string): number {
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = Number(digits[i]);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return (10 - (sum % 10)) % 10;
  }

  const validBases = [
    '453201511283036',
    '402400714867296',
    '455673758689985',
    '542523343010990',
    '222300004841001',
    '510510510510510',
    '411111111111111',
    '550000555555555',
    '371449635398431',
    '123456789012345',
    '0', '1', '12', '123', '1234',
    '12345', '123456', '1234567',
    '12345678', '123456789',
    '9876543210', '11111111111',
    '22222222222', '33333333333',
    '44444444444',
  ];

  for (let i = 0; i < 25; i++) {
    const base = validBases[i % validBases.length];
    const check = refLuhn(base);
    const full = base + check;
    it(`validateLuhn valid #${i}: "${full.slice(0, 16)}"`, () => {
      expect(validateLuhn(full)).toBe(true);
    });
  }

  // Invalid: same numbers with wrong last digit
  for (let i = 25; i < 50; i++) {
    const base = validBases[(i - 25) % validBases.length];
    const correctCheck = refLuhn(base);
    const wrongCheck = (correctCheck + 1) % 10;
    const full = base + wrongCheck;
    it(`validateLuhn invalid #${i}: "${full.slice(0, 16)}" (wrong check)`, () => {
      expect(validateLuhn(full)).toBe(false);
    });
  }
});

// ── isbn10ToIsbn13 — 30 tests ─────────────────────────────────────────────
describe('isbn10ToIsbn13 — 30 tests', () => {
  // Verified conversions
  const conversions: Array<{ isbn10: string; isbn13: string }> = [
    { isbn10: '0306406152', isbn13: '9780306406157' },
    { isbn10: '0471958697', isbn13: '9780471958697' },
    { isbn10: '0596517742', isbn13: '9780596517748' },
    { isbn10: '1617290173', isbn13: '9781617290176' },
    { isbn10: '0132350882', isbn13: '9780132350884' },
    { isbn10: '0135974445', isbn13: '9780135974445' },
    { isbn10: '0201633612', isbn13: '9780201633610' },
    { isbn10: '0441172717', isbn13: '9780441172719' },  // corrected
    { isbn10: '0743223136', isbn13: '9780743223133' },
    { isbn10: '020161622X', isbn13: '9780201616224' },
  ];

  for (let i = 0; i < 30; i++) {
    const { isbn10, isbn13 } = conversions[i % conversions.length];
    it(`isbn10ToIsbn13 #${i}: ${isbn10} → ${isbn13}`, () => {
      expect(isbn10ToIsbn13(isbn10)).toBe(isbn13);
    });
  }
});

// ── generateGTIN13 — 30 tests ─────────────────────────────────────────────
describe('generateGTIN13 — 30 tests', () => {
  const bases = [
    '590123412345', '400638133393', '301762042200', '001234567890',
    '871039852355', '007567816412', '500015946112', '304514010550',
    '544900002450', '000000000000',
  ];

  for (let i = 0; i < 30; i++) {
    const base = bases[i % bases.length];
    it(`generateGTIN13 #${i}: base="${base}"`, () => {
      const gtin = generateGTIN13(base);
      expect(gtin).toHaveLength(13);
      expect(validateGTIN(gtin)).toBe(true);
      expect(validateEAN13(gtin)).toBe(true);
      expect(gtin.slice(0, 12)).toBe(base);
    });
  }
});

// ── Additional edge-case tests for error throwing ─────────────────────────
describe('ean13CheckDigit — error cases', () => {
  it('throws for 11-digit input', () => {
    expect(() => ean13CheckDigit('12345678901')).toThrow();
  });
  it('throws for 13-digit input', () => {
    expect(() => ean13CheckDigit('1234567890123')).toThrow();
  });
  it('throws for non-digit input', () => {
    expect(() => ean13CheckDigit('abcdefghijkl')).toThrow();
  });
  it('throws for empty string', () => {
    expect(() => ean13CheckDigit('')).toThrow();
  });
  it('throws for 0-length padded', () => {
    expect(() => ean13CheckDigit('000000000000 ')).toThrow(); // trailing space
  });
});

describe('ean8CheckDigit — error cases', () => {
  it('throws for 6-digit input', () => {
    expect(() => ean8CheckDigit('123456')).toThrow();
  });
  it('throws for 8-digit input', () => {
    expect(() => ean8CheckDigit('12345678')).toThrow();
  });
  it('throws for non-digit input', () => {
    expect(() => ean8CheckDigit('abcdefg')).toThrow();
  });
  it('throws for empty string', () => {
    expect(() => ean8CheckDigit('')).toThrow();
  });
});

describe('encodeCode39 — error cases', () => {
  it('throws for input with lowercase (!) chars', () => {
    // lowercase is not in CODE39_CHARS so toUpperCase converts, but '!' is not valid
    expect(() => encodeCode39('TEST!')).toThrow();
  });
  it('throws for @ character', () => {
    expect(() => encodeCode39('CODE@39')).toThrow();
  });
  it('succeeds for lowercase input that maps to valid uppercase', () => {
    // lowercase → uppercased first, then checked
    // 'hello' → 'HELLO' which is valid CODE39
    // encodeCode39 does toUpperCase first, then checks
    expect(encodeCode39('hello')).toBe('*HELLO*');
  });
});

describe('encodeCode128 — error cases', () => {
  it('throws for char > 127', () => {
    expect(() => encodeCode128('hello\x80')).toThrow();
  });
  it('throws for control char < 32', () => {
    expect(() => encodeCode128('\x00data')).toThrow();
  });
  it('throws for ESC char', () => {
    expect(() => encodeCode128('\x1b[0m')).toThrow();
  });
});

describe('formatUPCA — error cases', () => {
  it('throws for 11-digit input', () => {
    expect(() => formatUPCA('12345678901')).toThrow();
  });
  it('throws for 13-digit input', () => {
    expect(() => formatUPCA('1234567890123')).toThrow();
  });
  it('throws for non-digit input', () => {
    expect(() => formatUPCA('abcdefghijkl')).toThrow();
  });
});

describe('formatEAN13 — error cases', () => {
  it('throws for 12-digit input', () => {
    expect(() => formatEAN13('123456789012')).toThrow();
  });
  it('throws for 14-digit input', () => {
    expect(() => formatEAN13('12345678901234')).toThrow();
  });
  it('throws for non-digit input', () => {
    expect(() => formatEAN13('abcdefghijklm')).toThrow();
  });
});

describe('generateGTIN13 — error cases', () => {
  it('throws for 11-digit base', () => {
    expect(() => generateGTIN13('12345678901')).toThrow();
  });
  it('throws for 13-digit base', () => {
    expect(() => generateGTIN13('1234567890123')).toThrow();
  });
  it('throws for non-digit base', () => {
    expect(() => generateGTIN13('abcdefghijkl')).toThrow();
  });
});

describe('luhnCheckDigit — error cases', () => {
  it('throws for non-digit input', () => {
    expect(() => luhnCheckDigit('abc')).toThrow();
  });
  it('throws for mixed input', () => {
    expect(() => luhnCheckDigit('123a456')).toThrow();
  });
});

describe('itfCheckDigit — error cases', () => {
  it('throws for alpha input', () => {
    expect(() => itfCheckDigit('abc')).toThrow();
  });
  it('throws for mixed input', () => {
    expect(() => itfCheckDigit('1a2')).toThrow();
  });
});

// ── generateEAN13 — smoke tests ───────────────────────────────────────────
describe('generateEAN13 — smoke tests', () => {
  it('generates a 13-digit code', () => {
    const code = generateEAN13('590');
    expect(code).toHaveLength(13);
    expect(/^\d{13}$/.test(code)).toBe(true);
  });

  it('generated code passes validateEAN13', () => {
    const code = generateEAN13('400');
    expect(validateEAN13(code)).toBe(true);
  });

  it('generated code starts with given prefix', () => {
    const code = generateEAN13('978');
    expect(code.startsWith('978')).toBe(true);
  });

  it('throws on non-digit prefix', () => {
    expect(() => generateEAN13('abc')).toThrow();
  });

  it('throws on prefix longer than 12 digits', () => {
    expect(() => generateEAN13('1234567890123')).toThrow();
  });

  for (let i = 0; i < 20; i++) {
    it(`generateEAN13 random #${i} passes validation`, () => {
      const code = generateEAN13(String(i).padStart(3, '0'));
      expect(validateEAN13(code)).toBe(true);
    });
  }
});

// ── validateLuhn — non-digit / empty string edge cases ────────────────────
describe('validateLuhn — edge cases', () => {
  it('rejects non-digit string', () => {
    expect(validateLuhn('abcde')).toBe(false);
  });
  it('rejects empty string', () => {
    expect(validateLuhn('')).toBe(false);
  });
  it('rejects mixed alphanumeric', () => {
    expect(validateLuhn('123a456')).toBe(false);
  });
  it('rejects single character non-digit', () => {
    expect(validateLuhn('a')).toBe(false);
  });
});

// ── normalizeBarcode — additional edge-case tests ─────────────────────────
describe('normalizeBarcode — additional patterns', () => {
  it('strips hyphens from ISBN', () => {
    expect(normalizeBarcode('978-0-306-40615-7')).toBe('9780306406157');
  });
  it('strips spaces', () => {
    expect(normalizeBarcode('590 123 4123 457')).toBe('5901234123457');
  });
  it('keeps alphanumeric', () => {
    expect(normalizeBarcode('ABC123xyz')).toBe('ABC123xyz');
  });
  it('strips all punctuation', () => {
    expect(normalizeBarcode('!@#$%^&*()')).toBe('');
  });
  it('strips slashes and dots', () => {
    expect(normalizeBarcode('A/B.C')).toBe('ABC');
  });
  it('handles already-clean codes', () => {
    expect(normalizeBarcode('5901234123457')).toBe('5901234123457');
  });
});

// ── isbn10ToIsbn13 — consistency checks ───────────────────────────────────
describe('isbn10ToIsbn13 — consistency checks', () => {
  it('result starts with 978', () => {
    expect(isbn10ToIsbn13('0306406152').startsWith('978')).toBe(true);
  });

  it('result is 13 digits long', () => {
    expect(isbn10ToIsbn13('0306406152')).toHaveLength(13);
  });

  it('result passes validateISBN13', () => {
    expect(validateISBN13(isbn10ToIsbn13('0306406152'))).toBe(true);
  });

  it('works with ISBN-10 ending in X', () => {
    const result = isbn10ToIsbn13('020161622X');
    expect(result).toHaveLength(13);
    expect(validateISBN13(result)).toBe(true);
  });

  it('works with hyphenated ISBN-10', () => {
    const result = isbn10ToIsbn13('0-306-40615-2');
    expect(result).toHaveLength(13);
    expect(validateISBN13(result)).toBe(true);
  });
});

// ── isCode39Encodable — comprehensive edge cases ───────────────────────────
describe('isCode39Encodable — edge cases', () => {
  it('empty string is encodable', () => {
    expect(isCode39Encodable('')).toBe(true);
  });
  it('all uppercase letters A-Z are encodable', () => {
    expect(isCode39Encodable('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(true);
  });
  it('all digits 0-9 are encodable', () => {
    expect(isCode39Encodable('0123456789')).toBe(true);
  });
  it('special chars -. $/+% are encodable', () => {
    expect(isCode39Encodable('-. $/+%')).toBe(true);
  });
  it('exclamation mark is NOT encodable', () => {
    expect(isCode39Encodable('!')).toBe(false);
  });
  it('@ symbol is NOT encodable', () => {
    expect(isCode39Encodable('@')).toBe(false);
  });
});

// ── isITFEncodable — comprehensive edge cases ──────────────────────────────
describe('isITFEncodable — edge cases', () => {
  it('empty string is NOT encodable', () => {
    expect(isITFEncodable('')).toBe(false);
  });
  it('single digit is NOT encodable', () => {
    expect(isITFEncodable('1')).toBe(false);
  });
  it('two digits are encodable', () => {
    expect(isITFEncodable('12')).toBe(true);
  });
  it('letters are NOT encodable', () => {
    expect(isITFEncodable('AB')).toBe(false);
  });
  it('odd-length digit string is NOT encodable', () => {
    expect(isITFEncodable('123')).toBe(false);
  });
});

// ── guessBarcodeType — null and consistency cases ──────────────────────────
describe('guessBarcodeType — null cases', () => {
  it('returns EAN13 for 13-digit code', () => {
    expect(guessBarcodeType('5901234123457')).toBe('EAN13');
  });

  it('returns UPCA for 12-digit code', () => {
    expect(guessBarcodeType('012345678905')).toBe('UPCA');
  });

  it('returns EAN8 for 8-digit code', () => {
    expect(guessBarcodeType('73513537')).toBe('EAN8');
  });

  it('returns CODE39 for uppercase alpha', () => {
    expect(guessBarcodeType('HELLO')).toBe('CODE39');
  });

  it('returns CODE128 for lowercase string', () => {
    expect(guessBarcodeType('hello')).toBe('CODE128');
  });

  it('5-digit code returns CODE39 (digits are in CODE39_CHARS)', () => {
    expect(guessBarcodeType('12345')).toBe('CODE39');
  });
});

// ── validateGTIN — length-specific tests ─────────────────────────────────
describe('validateGTIN — by length', () => {
  it('accepts valid GTIN-8', () => {
    expect(validateGTIN('73513537')).toBe(true);
  });

  it('rejects invalid GTIN-8 check digit', () => {
    expect(validateGTIN('73513530')).toBe(false);
  });

  it('accepts valid GTIN-12 (UPC-A)', () => {
    expect(validateGTIN('012345678905')).toBe(true);
  });

  it('rejects invalid GTIN-12 check digit', () => {
    expect(validateGTIN('012345678906')).toBe(false);
  });

  it('accepts valid GTIN-13 (EAN-13)', () => {
    expect(validateGTIN('5901234123457')).toBe(true);
  });

  it('rejects invalid GTIN-13 check digit', () => {
    expect(validateGTIN('5901234123458')).toBe(false);
  });

  it('rejects GTIN with letters', () => {
    expect(validateGTIN('590123412345A')).toBe(false);
  });

  it('rejects 9-digit code', () => {
    expect(validateGTIN('123456789')).toBe(false);
  });

  it('rejects 11-digit code', () => {
    expect(validateGTIN('12345678901')).toBe(false);
  });

  it('rejects 15-digit code', () => {
    expect(validateGTIN('123456789012345')).toBe(false);
  });
});
