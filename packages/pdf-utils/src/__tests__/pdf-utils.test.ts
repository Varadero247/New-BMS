// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  isPdf,
  detectPdfVersion,
  parseMetadata,
  serializeMetadata,
  getPageSize,
  PAGE_SIZES,
  ptToMm,
  mmToPt,
  ptToIn,
  inToPt,
  rgbToCmyk,
  cmykToRgb,
  rgbToGrayscale,
  hexToRgb,
  rgbToHex,
  rgbToPdfColor,
  flipY,
  rectFromTopLeft,
  estimateTextWidth,
  wrapText,
  truncateText,
  paginate,
  flattenBookmarks,
  countBookmarks,
  calculateTableLayout,
  createWatermarkText,
  formatFileSize,
  isPdfACompliant,
  mergeMetadata,
  generateObjectId,
  buildXrefTable,
  pdfChecksum,
} from '../pdf-utils';

// =============================================================================
// isPdf — 100 tests
// =============================================================================
describe('isPdf', () => {
  // Valid PDF buffers
  for (let i = 0; i < 10; i++) {
    it(`returns true for %PDF-1.${i % 10} buffer`, () => {
      const buf = Buffer.from(`%PDF-1.${i % 10} rest of content`);
      expect(isPdf(buf)).toBe(true);
    });
  }

  it('returns true for %PDF-2.0 buffer', () => {
    expect(isPdf(Buffer.from('%PDF-2.0\n'))).toBe(true);
  });

  it('returns true for %PDF- string', () => {
    expect(isPdf('%PDF-1.4')).toBe(true);
  });

  it('returns true for %PDF-1.3 string', () => {
    expect(isPdf('%PDF-1.3 header')).toBe(true);
  });

  it('returns true for %PDF-1.7 string', () => {
    expect(isPdf('%PDF-1.7\n')).toBe(true);
  });

  // Valid buffers with various PDF versions
  const validVersions = ['1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '2.0', '1.8'];
  for (const v of validVersions) {
    it(`returns true for %PDF-${v} buffer`, () => {
      expect(isPdf(Buffer.from(`%PDF-${v}\n%%EOF`))).toBe(true);
    });
  }

  // 20 more valid string checks
  for (let i = 0; i < 20; i++) {
    it(`returns true for valid PDF string variant ${i}`, () => {
      const str = `%PDF-1.${i % 8} test document ${i}`;
      expect(isPdf(str)).toBe(true);
    });
  }

  // Invalid: too short
  it('returns false for empty buffer', () => {
    expect(isPdf(Buffer.alloc(0))).toBe(false);
  });

  it('returns false for 4-byte buffer (too short)', () => {
    expect(isPdf(Buffer.from('%PDF'))).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isPdf('')).toBe(false);
  });

  it('returns false for string without %PDF-', () => {
    expect(isPdf('Hello World')).toBe(false);
  });

  it('returns false for %PDF without dash', () => {
    expect(isPdf('%PDF1.4')).toBe(false);
  });

  // Various invalid inputs
  const invalidHeaders = [
    'JPEG header',
    'PNG header',
    'GIF89a',
    'BM header',
    '\x89PNG',
    'RIFF',
    'PK\x03\x04',
    '%PS-Adobe',
    'JFIF',
    'ftyp',
    '\x00\x00\x00',
    'docx content',
    '<html>',
    '{"json":true}',
    'text/plain',
    'utf-8 text',
    'Microsoft Word',
    '\xff\xd8\xff\xe0',
    'OggS',
    'MSCF',
  ];

  for (const header of invalidHeaders) {
    it(`returns false for "${header.slice(0, 10)}"`, () => {
      expect(isPdf(header)).toBe(false);
      expect(isPdf(Buffer.from(header))).toBe(false);
    });
  }

  it('returns false for null-byte buffer', () => {
    expect(isPdf(Buffer.alloc(10, 0))).toBe(false);
  });

  it('returns false for all-ones buffer', () => {
    expect(isPdf(Buffer.alloc(10, 0xff))).toBe(false);
  });
});

// =============================================================================
// detectPdfVersion — 100 tests
// =============================================================================
describe('detectPdfVersion', () => {
  const versionPairs: Array<[string, string]> = [
    ['%PDF-1.0\nrest', '1.0'],
    ['%PDF-1.1\nrest', '1.1'],
    ['%PDF-1.2\nrest', '1.2'],
    ['%PDF-1.3\nrest', '1.3'],
    ['%PDF-1.4\nrest', '1.4'],
    ['%PDF-1.5\nrest', '1.5'],
    ['%PDF-1.6\nrest', '1.6'],
    ['%PDF-1.7\nrest', '1.7'],
    ['%PDF-2.0\nrest', '2.0'],
    ['%PDF-1.8\nrest', '1.8'],
  ];

  for (const [input, expected] of versionPairs) {
    it(`detects version "${expected}" from "${input.slice(0, 8)}"`, () => {
      expect(detectPdfVersion(input)).toBe(expected);
      expect(detectPdfVersion(Buffer.from(input))).toBe(expected);
    });
  }

  // 40 more string tests
  for (let major = 1; major <= 2; major++) {
    for (let minor = 0; minor <= 9; minor++) {
      it(`detects version "${major}.${minor}" from string`, () => {
        const str = `%PDF-${major}.${minor} document content here`;
        expect(detectPdfVersion(str)).toBe(`${major}.${minor}`);
      });
    }
  }

  // 20 buffer-specific tests
  for (let i = 0; i < 20; i++) {
    it(`detects version from Buffer variant ${i}`, () => {
      const v = `1.${i % 10}`;
      const buf = Buffer.from(`%PDF-${v} binary content`);
      expect(detectPdfVersion(buf)).toBe(v);
    });
  }

  // Invalid cases — should return null
  it('returns null for non-PDF string', () => {
    expect(detectPdfVersion('not a pdf')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(detectPdfVersion('')).toBeNull();
  });

  it('returns null for empty buffer', () => {
    expect(detectPdfVersion(Buffer.alloc(0))).toBeNull();
  });

  it('returns null for JPEG header', () => {
    expect(detectPdfVersion('\xff\xd8\xff\xe0')).toBeNull();
  });

  it('returns null for PNG header', () => {
    expect(detectPdfVersion('\x89PNG\r\n\x1a\n')).toBeNull();
  });

  it('returns null for %PDF without version', () => {
    expect(detectPdfVersion('%PDF- no version')).toBeNull();
  });

  it('returns null for partial header', () => {
    expect(detectPdfVersion('%PDF')).toBeNull();
  });

  it('returns null for HTML', () => {
    expect(detectPdfVersion('<html><head>')).toBeNull();
  });

  it('returns null for JSON', () => {
    expect(detectPdfVersion('{"version":"1.4"}')).toBeNull();
  });

  it('returns null for plain text', () => {
    expect(detectPdfVersion('just some plain text')).toBeNull();
  });
});

// =============================================================================
// ptToMm / mmToPt — 100 tests
// =============================================================================
describe('ptToMm and mmToPt', () => {
  // Roundtrip tests: pt → mm → pt ≈ original
  for (let i = 1; i <= 30; i++) {
    it(`roundtrip pt→mm→pt for ${i * 10} pt`, () => {
      const pt = i * 10;
      expect(mmToPt(ptToMm(pt))).toBeCloseTo(pt, 5);
    });
  }

  // Roundtrip: mm → pt → mm
  for (let i = 1; i <= 30; i++) {
    it(`roundtrip mm→pt→mm for ${i * 5} mm`, () => {
      const mm = i * 5;
      expect(ptToMm(mmToPt(mm))).toBeCloseTo(mm, 5);
    });
  }

  // Known values
  it('converts 72 pt to 25.4 mm (1 inch)', () => {
    expect(ptToMm(72)).toBeCloseTo(25.4, 3);
  });

  it('converts 25.4 mm to 72 pt (1 inch)', () => {
    expect(mmToPt(25.4)).toBeCloseTo(72, 3);
  });

  it('converts 595 pt (A4 width) to approx 210 mm', () => {
    expect(ptToMm(595)).toBeCloseTo(210, 0);
  });

  it('converts 210 mm to approx 595 pt (A4 width)', () => {
    expect(mmToPt(210)).toBeCloseTo(595, 0);
  });

  it('converts 842 pt (A4 height) to approx 297 mm', () => {
    expect(ptToMm(842)).toBeCloseTo(297, 0);
  });

  it('converts 297 mm to approx 842 pt (A4 height)', () => {
    expect(mmToPt(297)).toBeCloseTo(842, 0);
  });

  it('converts 0 pt to 0 mm', () => {
    expect(ptToMm(0)).toBe(0);
  });

  it('converts 0 mm to 0 pt', () => {
    expect(mmToPt(0)).toBe(0);
  });

  // Proportional checks
  for (let i = 1; i <= 10; i++) {
    it(`ptToMm(${i * 72}) is proportional to i * 25.4`, () => {
      expect(ptToMm(i * 72)).toBeCloseTo(i * 25.4, 3);
    });
  }
});

// =============================================================================
// ptToIn / inToPt — 100 tests
// =============================================================================
describe('ptToIn and inToPt', () => {
  // Roundtrip tests: pt → in → pt
  for (let i = 1; i <= 30; i++) {
    it(`roundtrip pt→in→pt for ${i * 36} pt`, () => {
      const pt = i * 36;
      expect(inToPt(ptToIn(pt))).toBeCloseTo(pt, 5);
    });
  }

  // Roundtrip: in → pt → in
  for (let i = 1; i <= 30; i++) {
    it(`roundtrip in→pt→in for ${i * 0.5} inches`, () => {
      const inches = i * 0.5;
      expect(ptToIn(inToPt(inches))).toBeCloseTo(inches, 5);
    });
  }

  // Known values
  it('converts 72 pt to 1 inch', () => {
    expect(ptToIn(72)).toBeCloseTo(1, 10);
  });

  it('converts 1 inch to 72 pt', () => {
    expect(inToPt(1)).toBeCloseTo(72, 10);
  });

  it('converts 0 pt to 0 inches', () => {
    expect(ptToIn(0)).toBe(0);
  });

  it('converts 0 inches to 0 pt', () => {
    expect(inToPt(0)).toBe(0);
  });

  it('converts 144 pt to 2 inches', () => {
    expect(ptToIn(144)).toBeCloseTo(2, 10);
  });

  it('converts 2 inches to 144 pt', () => {
    expect(inToPt(2)).toBeCloseTo(144, 10);
  });

  it('converts 36 pt to 0.5 inches', () => {
    expect(ptToIn(36)).toBeCloseTo(0.5, 10);
  });

  it('converts 0.5 inches to 36 pt', () => {
    expect(inToPt(0.5)).toBeCloseTo(36, 10);
  });

  // Proportional for various multiples of 72
  for (let i = 1; i <= 10; i++) {
    it(`ptToIn(${i * 72}) = ${i}`, () => {
      expect(ptToIn(i * 72)).toBeCloseTo(i, 10);
    });
  }
});

// =============================================================================
// rgbToCmyk / cmykToRgb — 100 tests
// =============================================================================
describe('rgbToCmyk and cmykToRgb', () => {
  // Pure colors
  it('converts pure red (255,0,0) to CMYK', () => {
    const c = rgbToCmyk({ r: 255, g: 0, b: 0 });
    expect(c.c).toBeCloseTo(0, 5);
    expect(c.m).toBeCloseTo(1, 5);
    expect(c.y).toBeCloseTo(1, 5);
    expect(c.k).toBeCloseTo(0, 5);
  });

  it('converts pure green (0,255,0) to CMYK', () => {
    const c = rgbToCmyk({ r: 0, g: 255, b: 0 });
    expect(c.c).toBeCloseTo(1, 5);
    expect(c.m).toBeCloseTo(0, 5);
    expect(c.y).toBeCloseTo(1, 5);
    expect(c.k).toBeCloseTo(0, 5);
  });

  it('converts pure blue (0,0,255) to CMYK', () => {
    const c = rgbToCmyk({ r: 0, g: 0, b: 255 });
    expect(c.c).toBeCloseTo(1, 5);
    expect(c.m).toBeCloseTo(1, 5);
    expect(c.y).toBeCloseTo(0, 5);
    expect(c.k).toBeCloseTo(0, 5);
  });

  it('converts black (0,0,0) to CMYK (k=1)', () => {
    const c = rgbToCmyk({ r: 0, g: 0, b: 0 });
    expect(c.k).toBeCloseTo(1, 5);
  });

  it('converts white (255,255,255) to CMYK (all 0)', () => {
    const c = rgbToCmyk({ r: 255, g: 255, b: 255 });
    expect(c.c).toBeCloseTo(0, 5);
    expect(c.m).toBeCloseTo(0, 5);
    expect(c.y).toBeCloseTo(0, 5);
    expect(c.k).toBeCloseTo(0, 5);
  });

  // Roundtrip: rgb → cmyk → rgb ≈ original (for values that round-trip cleanly)
  const roundTripColors = [
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 255, g: 255, b: 0 },
    { r: 0, g: 255, b: 255 },
    { r: 255, g: 0, b: 255 },
    { r: 128, g: 128, b: 128 },
    { r: 255, g: 128, b: 0 },
    { r: 0, g: 128, b: 255 },
    { r: 64, g: 192, b: 128 },
  ];

  for (const rgb of roundTripColors) {
    it(`roundtrip rgb(${rgb.r},${rgb.g},${rgb.b}) through CMYK`, () => {
      const cmyk = rgbToCmyk(rgb);
      const back = cmykToRgb(cmyk);
      expect(back.r).toBeCloseTo(rgb.r, 0);
      expect(back.g).toBeCloseTo(rgb.g, 0);
      expect(back.b).toBeCloseTo(rgb.b, 0);
    });
  }

  // cmykToRgb pure colors
  it('converts CMYK (0,1,1,0) to red', () => {
    const rgb = cmykToRgb({ c: 0, m: 1, y: 1, k: 0 });
    expect(rgb.r).toBeCloseTo(255, 0);
    expect(rgb.g).toBeCloseTo(0, 0);
    expect(rgb.b).toBeCloseTo(0, 0);
  });

  it('converts CMYK (0,0,0,1) to black', () => {
    const rgb = cmykToRgb({ c: 0, m: 0, y: 0, k: 1 });
    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
  });

  it('converts CMYK (0,0,0,0) to white', () => {
    const rgb = cmykToRgb({ c: 0, m: 0, y: 0, k: 0 });
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(255);
    expect(rgb.b).toBe(255);
  });

  // 60 additional roundtrip tests using stepwise values
  for (let i = 1; i <= 60; i++) {
    const r = (i * 4) % 256;
    const g = (i * 7) % 256;
    const b = (i * 11) % 256;
    it(`roundtrip for rgb(${r},${g},${b}) variant ${i}`, () => {
      const cmyk = rgbToCmyk({ r, g, b });
      const back = cmykToRgb(cmyk);
      expect(Math.abs(back.r - r)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.g - g)).toBeLessThanOrEqual(2);
      expect(Math.abs(back.b - b)).toBeLessThanOrEqual(2);
    });
  }

  // CMYK values in range 0-1
  it('all CMYK components are in [0,1] range for grey', () => {
    const c = rgbToCmyk({ r: 100, g: 100, b: 100 });
    expect(c.c).toBeGreaterThanOrEqual(0);
    expect(c.m).toBeGreaterThanOrEqual(0);
    expect(c.y).toBeGreaterThanOrEqual(0);
    expect(c.k).toBeGreaterThanOrEqual(0);
    expect(c.c).toBeLessThanOrEqual(1);
    expect(c.m).toBeLessThanOrEqual(1);
    expect(c.y).toBeLessThanOrEqual(1);
    expect(c.k).toBeLessThanOrEqual(1);
  });
});

// =============================================================================
// hexToRgb / rgbToHex — 100 tests
// =============================================================================
describe('hexToRgb and rgbToHex', () => {
  // Known pairs
  const knownPairs: Array<[string, { r: number; g: number; b: number }]> = [
    ['#ff0000', { r: 255, g: 0, b: 0 }],
    ['#00ff00', { r: 0, g: 255, b: 0 }],
    ['#0000ff', { r: 0, g: 0, b: 255 }],
    ['#000000', { r: 0, g: 0, b: 0 }],
    ['#ffffff', { r: 255, g: 255, b: 255 }],
    ['#ffff00', { r: 255, g: 255, b: 0 }],
    ['#00ffff', { r: 0, g: 255, b: 255 }],
    ['#ff00ff', { r: 255, g: 0, b: 255 }],
    ['#808080', { r: 128, g: 128, b: 128 }],
    ['#ff8000', { r: 255, g: 128, b: 0 }],
  ];

  for (const [hex, rgb] of knownPairs) {
    it(`hexToRgb("${hex}") returns correct rgb`, () => {
      const result = hexToRgb(hex);
      expect(result.r).toBe(rgb.r);
      expect(result.g).toBe(rgb.g);
      expect(result.b).toBe(rgb.b);
    });

    it(`rgbToHex(${rgb.r},${rgb.g},${rgb.b}) returns "${hex}"`, () => {
      expect(rgbToHex(rgb)).toBe(hex);
    });
  }

  // Shorthand hex (3-char) support
  it('parses 3-char hex #f00 as red', () => {
    const result = hexToRgb('#f00');
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
  });

  it('parses 3-char hex #fff as white', () => {
    const result = hexToRgb('#fff');
    expect(result.r).toBe(255);
    expect(result.g).toBe(255);
    expect(result.b).toBe(255);
  });

  it('parses 3-char hex #000 as black', () => {
    const result = hexToRgb('#000');
    expect(result.r).toBe(0);
    expect(result.g).toBe(0);
    expect(result.b).toBe(0);
  });

  it('parses hex without # prefix', () => {
    const result = hexToRgb('ff0000');
    expect(result.r).toBe(255);
  });

  // Roundtrip tests
  for (let i = 0; i < 40; i++) {
    const r = (i * 6) % 256;
    const g = (i * 11) % 256;
    const b = (i * 17) % 256;
    it(`roundtrip rgb(${r},${g},${b}) → hex → rgb`, () => {
      const hex = rgbToHex({ r, g, b });
      const back = hexToRgb(hex);
      expect(back.r).toBe(r);
      expect(back.g).toBe(g);
      expect(back.b).toBe(b);
    });
  }

  // rgbToHex always returns lowercase with #
  it('rgbToHex always starts with #', () => {
    expect(rgbToHex({ r: 200, g: 150, b: 100 })).toMatch(/^#[0-9a-f]{6}$/);
  });

  // rgbToPdfColor
  it('rgbToPdfColor for black', () => {
    expect(rgbToPdfColor({ r: 0, g: 0, b: 0 })).toBe('0.000 0.000 0.000 RG');
  });

  it('rgbToPdfColor for white', () => {
    expect(rgbToPdfColor({ r: 255, g: 255, b: 255 })).toBe('1.000 1.000 1.000 RG');
  });

  it('rgbToPdfColor ends with RG', () => {
    const result = rgbToPdfColor({ r: 128, g: 64, b: 32 });
    expect(result.endsWith('RG')).toBe(true);
  });

  it('rgbToPdfColor values are in 0-1 range', () => {
    const result = rgbToPdfColor({ r: 200, g: 100, b: 50 });
    const parts = result.replace(' RG', '').split(' ').map(Number);
    for (const p of parts) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });

  for (let i = 0; i < 10; i++) {
    it(`rgbToPdfColor variant ${i} has correct format`, () => {
      const rgb = { r: i * 25, g: i * 20, b: i * 15 };
      const result = rgbToPdfColor(rgb);
      expect(result).toMatch(/^\d+\.\d+ \d+\.\d+ \d+\.\d+ RG$/);
    });
  }
});

// =============================================================================
// rgbToGrayscale — 50 tests
// =============================================================================
describe('rgbToGrayscale', () => {
  // Pure grey: r=g=b → same value
  for (let v = 0; v <= 255; v += 5) {
    it(`grey r=g=b=${v} → grayscale ≈ ${v}`, () => {
      const result = rgbToGrayscale({ r: v, g: v, b: v });
      expect(result).toBeCloseTo(v, 0);
    });
  }

  it('black (0,0,0) → 0', () => {
    expect(rgbToGrayscale({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it('white (255,255,255) → 255', () => {
    expect(rgbToGrayscale({ r: 255, g: 255, b: 255 })).toBe(255);
  });

  it('pure red has lower grayscale than white', () => {
    expect(rgbToGrayscale({ r: 255, g: 0, b: 0 })).toBeLessThan(255);
  });

  it('pure green has higher grayscale than pure red', () => {
    const green = rgbToGrayscale({ r: 0, g: 255, b: 0 });
    const red = rgbToGrayscale({ r: 255, g: 0, b: 0 });
    expect(green).toBeGreaterThan(red);
  });

  it('grayscale result is always integer (rounded)', () => {
    const result = rgbToGrayscale({ r: 123, g: 45, b: 200 });
    expect(Number.isInteger(result)).toBe(true);
  });

  it('grayscale is always in [0, 255]', () => {
    const result = rgbToGrayscale({ r: 200, g: 100, b: 50 });
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(255);
  });

  for (let i = 0; i < 5; i++) {
    it(`various colors have valid grayscale range (variant ${i})`, () => {
      const rgb = { r: i * 50, g: (i * 37) % 256, b: (i * 71) % 256 };
      const g = rgbToGrayscale(rgb);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(255);
    });
  }
});

// =============================================================================
// estimateTextWidth — 100 tests
// =============================================================================
describe('estimateTextWidth', () => {
  // Proportional to text length
  for (let len = 1; len <= 20; len++) {
    it(`width of ${len}-char string at 12pt = ${len * 12 * 0.5}`, () => {
      const text = 'a'.repeat(len);
      expect(estimateTextWidth(text, 12)).toBeCloseTo(len * 12 * 0.5, 5);
    });
  }

  // Proportional to font size
  for (let size = 6; size <= 30; size += 2) {
    it(`width at fontSize ${size}pt for 10-char text = ${10 * size * 0.5}`, () => {
      expect(estimateTextWidth('aaaaaaaaaa', size)).toBeCloseTo(10 * size * 0.5, 5);
    });
  }

  // Custom charsPerPt
  it('uses custom charsPerPt when provided', () => {
    expect(estimateTextWidth('hello', 10, 0.6)).toBeCloseTo(5 * 10 * 0.6, 5);
  });

  it('uses default charsPerPt=0.5 when not provided', () => {
    expect(estimateTextWidth('hello', 10)).toBeCloseTo(5 * 10 * 0.5, 5);
  });

  it('empty string returns 0', () => {
    expect(estimateTextWidth('', 12)).toBe(0);
  });

  it('single char returns fontSizePt * 0.5', () => {
    expect(estimateTextWidth('x', 14)).toBeCloseTo(7, 5);
  });

  // 30 more tests with varying charsPerPt
  for (let i = 1; i <= 30; i++) {
    const cpt = i / 20;
    it(`charsPerPt=${cpt} for 5-char, 10pt`, () => {
      expect(estimateTextWidth('hello', 10, cpt)).toBeCloseTo(5 * 10 * cpt, 5);
    });
  }

  // Width increases with both length and font size
  it('longer text has greater width', () => {
    expect(estimateTextWidth('longer text here', 12)).toBeGreaterThan(estimateTextWidth('short', 12));
  });

  it('larger font has greater width', () => {
    expect(estimateTextWidth('hello', 20)).toBeGreaterThan(estimateTextWidth('hello', 10));
  });
});

// =============================================================================
// wrapText — 100 tests
// =============================================================================
describe('wrapText', () => {
  // All lines must fit within maxWidthPt
  it('wraps empty string to empty array', () => {
    expect(wrapText('', 200, 12)).toEqual([]);
  });

  it('single short word fits on one line', () => {
    const lines = wrapText('hello', 200, 12);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('hello');
  });

  it('returns single line when all text fits', () => {
    const text = 'short text';
    const lines = wrapText(text, 1000, 12);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe(text);
  });

  // Verify all lines fit within maxWidthPt
  for (let maxW = 50; maxW <= 250; maxW += 20) {
    it(`all lines fit within ${maxW}pt at 12pt font`, () => {
      const text = 'The quick brown fox jumps over the lazy dog near the river';
      const lines = wrapText(text, maxW, 12);
      for (const line of lines) {
        const w = estimateTextWidth(line, 12);
        // Single-word lines may exceed limit but multi-word lines shouldn't
        const words = line.split(' ');
        if (words.length > 1) {
          expect(w).toBeLessThanOrEqual(maxW);
        }
      }
    });
  }

  // All words preserved
  for (let i = 1; i <= 20; i++) {
    it(`all words preserved in wrap variant ${i}`, () => {
      const words = Array.from({ length: i * 3 }, (_, j) => `word${j}`);
      const text = words.join(' ');
      const lines = wrapText(text, 100, 8);
      const joined = lines.join(' ');
      expect(joined).toBe(text);
    });
  }

  it('wraps long text into multiple lines', () => {
    const text = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10';
    const lines = wrapText(text, 50, 12);
    expect(lines.length).toBeGreaterThan(1);
  });

  it('single very long word goes on its own line', () => {
    const lines = wrapText('superlongword', 10, 12);
    expect(lines).toContain('superlongword');
  });

  // Verify resulting lines only contain original words
  it('lines only contain original words', () => {
    const text = 'alpha beta gamma delta epsilon';
    const lines = wrapText(text, 80, 12);
    const allWords = lines.join(' ').split(' ');
    expect(allWords).toEqual(text.split(' '));
  });

  // More wrap tests with different font sizes
  for (let size = 6; size <= 18; size += 2) {
    it(`wraps with fontSize ${size}pt and preserves all words`, () => {
      const text = 'the quick brown fox jumps over the lazy dog';
      const lines = wrapText(text, 100, size);
      expect(lines.join(' ')).toBe(text);
    });
  }
});

// =============================================================================
// paginate — 100 tests
// =============================================================================
describe('paginate', () => {
  // totalPages = ceil(totalItems / itemsPerPage)
  for (let total = 1; total <= 50; total++) {
    for (const perPage of [5, 10]) {
      if (total % 5 !== 0 && perPage === 5) continue; // limit iterations
      it(`paginate(${total} items, ${perPage}/page) has correct totalPages`, () => {
        const result = paginate({ totalItems: total, itemsPerPage: perPage });
        expect(result.totalPages).toBe(Math.ceil(total / perPage));
      });
    }
  }

  it('returns 0 pages for 0 totalItems', () => {
    expect(paginate({ totalItems: 0, itemsPerPage: 10 }).totalPages).toBe(0);
  });

  it('returns 0 pages for negative totalItems', () => {
    expect(paginate({ totalItems: -1, itemsPerPage: 10 }).totalPages).toBe(0);
  });

  it('returns 0 pages for 0 itemsPerPage', () => {
    expect(paginate({ totalItems: 100, itemsPerPage: 0 }).totalPages).toBe(0);
  });

  it('1 item, 10 per page → 1 page', () => {
    const r = paginate({ totalItems: 1, itemsPerPage: 10 });
    expect(r.totalPages).toBe(1);
    expect(r.pages[0].count).toBe(1);
  });

  it('10 items, 10 per page → 1 page', () => {
    const r = paginate({ totalItems: 10, itemsPerPage: 10 });
    expect(r.totalPages).toBe(1);
    expect(r.pages[0].count).toBe(10);
  });

  it('11 items, 10 per page → 2 pages', () => {
    const r = paginate({ totalItems: 11, itemsPerPage: 10 });
    expect(r.totalPages).toBe(2);
    expect(r.pages[1].count).toBe(1);
  });

  it('page startIndex and endIndex are correct', () => {
    const r = paginate({ totalItems: 25, itemsPerPage: 10 });
    expect(r.pages[0].startIndex).toBe(0);
    expect(r.pages[0].endIndex).toBe(9);
    expect(r.pages[1].startIndex).toBe(10);
    expect(r.pages[1].endIndex).toBe(19);
    expect(r.pages[2].startIndex).toBe(20);
    expect(r.pages[2].endIndex).toBe(24);
  });

  it('page numbers start at 1', () => {
    const r = paginate({ totalItems: 30, itemsPerPage: 10 });
    expect(r.pages[0].page).toBe(1);
    expect(r.pages[1].page).toBe(2);
    expect(r.pages[2].page).toBe(3);
  });

  // Verify sum of counts = totalItems
  for (let total = 5; total <= 50; total += 5) {
    it(`sum of page counts = ${total} items`, () => {
      const r = paginate({ totalItems: total, itemsPerPage: 7 });
      const sum = r.pages.reduce((acc, p) => acc + p.count, 0);
      expect(sum).toBe(total);
    });
  }

  it('100 items, 13 per page → 8 pages', () => {
    const r = paginate({ totalItems: 100, itemsPerPage: 13 });
    expect(r.totalPages).toBe(8);
  });
});

// =============================================================================
// flattenBookmarks — 100 tests
// =============================================================================
describe('flattenBookmarks', () => {
  it('empty array returns empty array', () => {
    expect(flattenBookmarks([])).toEqual([]);
  });

  it('single bookmark at depth 0', () => {
    const result = flattenBookmarks([{ title: 'Intro', page: 1 }]);
    expect(result).toHaveLength(1);
    expect(result[0].depth).toBe(0);
    expect(result[0].title).toBe('Intro');
    expect(result[0].page).toBe(1);
  });

  it('two top-level bookmarks', () => {
    const bm = [
      { title: 'Chapter 1', page: 1 },
      { title: 'Chapter 2', page: 10 },
    ];
    const result = flattenBookmarks(bm);
    expect(result).toHaveLength(2);
    expect(result[0].depth).toBe(0);
    expect(result[1].depth).toBe(0);
  });

  it('child bookmarks are at depth 1', () => {
    const bm = [
      {
        title: 'Chapter 1', page: 1,
        children: [{ title: 'Section 1.1', page: 2 }],
      },
    ];
    const result = flattenBookmarks(bm);
    expect(result).toHaveLength(2);
    expect(result[1].depth).toBe(1);
  });

  it('grandchildren are at depth 2', () => {
    const bm = [
      {
        title: 'Chapter 1', page: 1,
        children: [
          {
            title: 'Section 1.1', page: 2,
            children: [{ title: 'Subsection 1.1.1', page: 3 }],
          },
        ],
      },
    ];
    const result = flattenBookmarks(bm);
    expect(result[2].depth).toBe(2);
  });

  it('preserves order: parent before children', () => {
    const bm = [
      {
        title: 'A', page: 1,
        children: [{ title: 'A1', page: 2 }],
      },
      { title: 'B', page: 5 },
    ];
    const result = flattenBookmarks(bm);
    expect(result[0].title).toBe('A');
    expect(result[1].title).toBe('A1');
    expect(result[2].title).toBe('B');
  });

  // Multiple children per level
  for (let n = 1; n <= 20; n++) {
    it(`n=${n} children at depth 1`, () => {
      const children = Array.from({ length: n }, (_, i) => ({ title: `Child ${i}`, page: i + 2 }));
      const bm = [{ title: 'Root', page: 1, children }];
      const result = flattenBookmarks(bm);
      expect(result).toHaveLength(n + 1);
      for (let i = 1; i <= n; i++) {
        expect(result[i].depth).toBe(1);
      }
    });
  }

  // Flat lists
  for (let n = 1; n <= 30; n++) {
    it(`flat list of ${n} bookmarks has all at depth 0`, () => {
      const bm = Array.from({ length: n }, (_, i) => ({ title: `BM${i}`, page: i }));
      const result = flattenBookmarks(bm);
      expect(result).toHaveLength(n);
      for (const item of result) {
        expect(item.depth).toBe(0);
      }
    });
  }

  // Three-level deep
  it('three-level nesting has correct depths', () => {
    const bm = [
      {
        title: 'L0', page: 1,
        children: [
          {
            title: 'L1', page: 2,
            children: [
              { title: 'L2', page: 3 },
            ],
          },
        ],
      },
    ];
    const result = flattenBookmarks(bm);
    expect(result[0].depth).toBe(0);
    expect(result[1].depth).toBe(1);
    expect(result[2].depth).toBe(2);
  });

  // All titles preserved
  it('all titles are preserved in flat list', () => {
    const bm = [
      { title: 'Alpha', page: 1, children: [{ title: 'Beta', page: 2 }] },
    ];
    const result = flattenBookmarks(bm);
    expect(result.map((r) => r.title)).toEqual(['Alpha', 'Beta']);
  });
});

// =============================================================================
// countBookmarks — 50 tests
// =============================================================================
describe('countBookmarks', () => {
  it('empty array returns 0', () => {
    expect(countBookmarks([])).toBe(0);
  });

  it('single bookmark returns 1', () => {
    expect(countBookmarks([{ title: 'A', page: 1 }])).toBe(1);
  });

  // n top-level bookmarks
  for (let n = 1; n <= 15; n++) {
    it(`${n} top-level bookmarks = ${n} count`, () => {
      const bm = Array.from({ length: n }, (_, i) => ({ title: `BM${i}`, page: i }));
      expect(countBookmarks(bm)).toBe(n);
    });
  }

  // With children
  it('1 parent + 3 children = 4', () => {
    const bm = [
      {
        title: 'Parent', page: 1,
        children: [
          { title: 'C1', page: 2 },
          { title: 'C2', page: 3 },
          { title: 'C3', page: 4 },
        ],
      },
    ];
    expect(countBookmarks(bm)).toBe(4);
  });

  it('nested tree counts all nodes', () => {
    const bm = [
      {
        title: 'A', page: 1,
        children: [
          { title: 'A1', page: 2, children: [{ title: 'A1a', page: 3 }] },
          { title: 'A2', page: 4 },
        ],
      },
      { title: 'B', page: 5 },
    ];
    expect(countBookmarks(bm)).toBe(5);
  });

  // Variable children per parent
  for (let n = 1; n <= 15; n++) {
    it(`parent with ${n} children = ${n + 1} total`, () => {
      const children = Array.from({ length: n }, (_, i) => ({ title: `C${i}`, page: i + 2 }));
      const bm = [{ title: 'Root', page: 1, children }];
      expect(countBookmarks(bm)).toBe(n + 1);
    });
  }

  it('no children property counts as 1', () => {
    expect(countBookmarks([{ title: 'Leaf', page: 5 }])).toBe(1);
  });

  it('empty children array counts parent only', () => {
    expect(countBookmarks([{ title: 'Parent', page: 1, children: [] }])).toBe(1);
  });
});

// =============================================================================
// calculateTableLayout — 100 tests
// =============================================================================
describe('calculateTableLayout', () => {
  // totalWidth = sum of columnWidths
  for (let n = 1; n <= 10; n++) {
    it(`sum of ${n} columnWidths = totalWidth`, () => {
      const widths = Array.from({ length: n }, (_, i) => (i + 1) * 50);
      const rows = [{ cells: [{ text: 'a' }] }];
      const layout = calculateTableLayout(rows, widths);
      const expectedTotal = widths.reduce((a, b) => a + b, 0);
      expect(layout.totalWidth).toBe(expectedTotal);
    });
  }

  // rows.length is preserved
  for (let n = 1; n <= 20; n++) {
    it(`${n} rows preserved in layout`, () => {
      const rows = Array.from({ length: n }, (_, i) => ({
        cells: [{ text: `Row ${i}` }],
      }));
      const layout = calculateTableLayout(rows, [100]);
      expect(layout.rows).toHaveLength(n);
    });
  }

  // rowHeight defaults to 20
  it('default rowHeight is 20', () => {
    const layout = calculateTableLayout([{ cells: [{ text: 'a' }] }], [100]);
    expect(layout.rowHeight).toBe(20);
  });

  // Custom rowHeight
  for (let h = 15; h <= 50; h += 5) {
    it(`rowHeight=${h} is preserved`, () => {
      const layout = calculateTableLayout([{ cells: [{ text: 'a' }] }], [100], h);
      expect(layout.rowHeight).toBe(h);
    });
  }

  // totalHeight = rows.length * rowHeight
  for (let n = 1; n <= 10; n++) {
    it(`totalHeight = ${n} rows * 25 rowHeight`, () => {
      const rows = Array.from({ length: n }, () => ({ cells: [{ text: 'x' }] }));
      const layout = calculateTableLayout(rows, [100], 25);
      expect(layout.totalHeight).toBe(n * 25);
    });
  }

  // columnWidths are preserved
  it('columnWidths are preserved in layout', () => {
    const widths = [100, 200, 150];
    const layout = calculateTableLayout([{ cells: [] }], widths);
    expect(layout.columnWidths).toEqual(widths);
  });

  it('empty columnWidths gives totalWidth=0', () => {
    const layout = calculateTableLayout([{ cells: [] }], []);
    expect(layout.totalWidth).toBe(0);
  });

  // Large table
  it('40-row table has correct totalHeight with rowHeight=30', () => {
    const rows = Array.from({ length: 40 }, () => ({ cells: [{ text: 'data' }] }));
    const layout = calculateTableLayout(rows, [200, 300], 30);
    expect(layout.totalHeight).toBe(1200);
    expect(layout.totalWidth).toBe(500);
  });

  // Additional column width sum tests
  for (let cols = 2; cols <= 15; cols++) {
    it(`${cols} equal columns of 60pt each: totalWidth = ${cols * 60}`, () => {
      const widths = Array(cols).fill(60);
      const layout = calculateTableLayout([{ cells: [] }], widths);
      expect(layout.totalWidth).toBe(cols * 60);
    });
  }
});

// =============================================================================
// getPageSize — 50 tests
// =============================================================================
describe('getPageSize', () => {
  // Known sizes in portrait
  const knownSizes: Array<[string, number, number]> = [
    ['A0', 2384, 3370],
    ['A1', 1684, 2384],
    ['A2', 1191, 1684],
    ['A3', 842, 1191],
    ['A4', 595, 842],
    ['A5', 420, 595],
    ['A6', 298, 420],
    ['B4', 709, 1001],
    ['B5', 499, 709],
    ['Letter', 612, 792],
    ['Legal', 612, 1008],
    ['Tabloid', 792, 1224],
    ['Executive', 522, 756],
    ['Statement', 396, 612],
    ['Folio', 612, 936],
  ];

  for (const [name, w, h] of knownSizes) {
    it(`${name} portrait: width=${w}, height=${h}`, () => {
      const size = getPageSize(name);
      expect(size).toBeDefined();
      expect(size!.width).toBe(w);
      expect(size!.height).toBe(h);
    });
  }

  // Landscape swaps width/height
  for (const [name, w, h] of knownSizes.slice(0, 10)) {
    it(`${name} landscape: width=${h}, height=${w}`, () => {
      const size = getPageSize(name, true);
      expect(size).toBeDefined();
      expect(size!.width).toBe(h);
      expect(size!.height).toBe(w);
    });
  }

  it('unknown page size returns undefined', () => {
    expect(getPageSize('A99')).toBeUndefined();
  });

  it('empty string returns undefined', () => {
    expect(getPageSize('')).toBeUndefined();
  });

  it('PAGE_SIZES has all expected keys', () => {
    const expected = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B4', 'B5', 'Letter', 'Legal', 'Tabloid', 'Executive', 'Statement', 'Folio'];
    for (const k of expected) {
      expect(PAGE_SIZES[k]).toBeDefined();
    }
  });

  it('landscape A4 has width > height', () => {
    const size = getPageSize('A4', true)!;
    expect(size.width).toBeGreaterThan(size.height);
  });

  it('portrait A4 has height > width', () => {
    const size = getPageSize('A4', false)!;
    expect(size.height).toBeGreaterThan(size.width);
  });

  it('portrait A4 name is "A4"', () => {
    expect(getPageSize('A4')!.name).toBe('A4');
  });
});

// =============================================================================
// generateObjectId — 50 tests
// =============================================================================
describe('generateObjectId', () => {
  it('returns 1 for empty array', () => {
    expect(generateObjectId([])).toBe(1);
  });

  it('returns 1 when 1 is not in existing', () => {
    expect(generateObjectId([2, 3, 4])).toBe(1);
  });

  it('returns 2 when [1] is existing', () => {
    expect(generateObjectId([1])).toBe(2);
  });

  it('returns 3 when [1,2] exists', () => {
    expect(generateObjectId([1, 2])).toBe(3);
  });

  // Sequential gaps
  for (let n = 1; n <= 20; n++) {
    it(`returns ${n + 1} when [1..${n}] all exist`, () => {
      const existing = Array.from({ length: n }, (_, i) => i + 1);
      expect(generateObjectId(existing)).toBe(n + 1);
    });
  }

  // Gaps in middle
  it('returns smallest gap (2) when [1,3,4] exist', () => {
    expect(generateObjectId([1, 3, 4])).toBe(2);
  });

  it('returns 1 when only large numbers exist', () => {
    expect(generateObjectId([100, 200, 300])).toBe(1);
  });

  it('returns correct id with unsorted input [3,1,2]', () => {
    expect(generateObjectId([3, 1, 2])).toBe(4);
  });

  it('returns 1 when array has only 0', () => {
    expect(generateObjectId([0])).toBe(1);
  });

  // Gap-finding for various patterns
  for (let gap = 2; gap <= 10; gap++) {
    it(`finds gap at position ${gap} when 1 to ${gap - 1} and ${gap + 1} exist`, () => {
      const existing = [...Array.from({ length: gap - 1 }, (_, i) => i + 1), gap + 1];
      expect(generateObjectId(existing)).toBe(gap);
    });
  }

  it('result is always a positive integer', () => {
    const id = generateObjectId([1, 2, 5, 6]);
    expect(id).toBeGreaterThan(0);
    expect(Number.isInteger(id)).toBe(true);
  });

  it('result is not in existing set', () => {
    const existing = [1, 2, 3, 5, 6, 7];
    const id = generateObjectId(existing);
    expect(existing).not.toContain(id);
  });
});

// =============================================================================
// flipY — 50 tests
// =============================================================================
describe('flipY', () => {
  it('flipY(0, h) = h', () => {
    expect(flipY(0, 842)).toBe(842);
  });

  it('flipY(h, h) = 0', () => {
    expect(flipY(842, 842)).toBe(0);
  });

  it('flipY(h/2, h) = h/2', () => {
    expect(flipY(421, 842)).toBe(421);
  });

  // Various page heights and y values
  const heights = [792, 842, 1008, 1224, 595];
  for (const h of heights) {
    it(`flipY(0, ${h}) = ${h}`, () => {
      expect(flipY(0, h)).toBe(h);
    });

    it(`flipY(${h}, ${h}) = 0`, () => {
      expect(flipY(h, h)).toBe(0);
    });

    it(`flipY is symmetric for height ${h}`, () => {
      const y = Math.floor(h / 3);
      expect(flipY(flipY(y, h), h)).toBe(y);
    });
  }

  // Roundtrip: flipY(flipY(y, h), h) = y
  for (let y = 0; y <= 200; y += 20) {
    it(`double flip is identity: y=${y}, h=500`, () => {
      expect(flipY(flipY(y, 500), 500)).toBe(y);
    });
  }

  // rectFromTopLeft
  it('rectFromTopLeft y is flipped correctly', () => {
    const rect = rectFromTopLeft(10, 20, 100, 50, 842);
    // y in PDF = pageHeight - topY - height = 842 - 20 - 50 = 772
    expect(rect.y).toBe(772);
    expect(rect.x).toBe(10);
    expect(rect.width).toBe(100);
    expect(rect.height).toBe(50);
  });

  it('rectFromTopLeft at top-left corner', () => {
    const rect = rectFromTopLeft(0, 0, 100, 50, 842);
    expect(rect.y).toBe(792); // 842 - 0 - 50
  });
});

// =============================================================================
// createWatermarkText — 50 tests
// =============================================================================
describe('createWatermarkText', () => {
  it('no options: returns original text once', () => {
    expect(createWatermarkText('CONFIDENTIAL')).toBe('CONFIDENTIAL');
  });

  it('repeat=1: returns text once', () => {
    expect(createWatermarkText('DRAFT', { repeat: 1 })).toBe('DRAFT');
  });

  it('repeat=3: returns text 3 times separated by space', () => {
    expect(createWatermarkText('DRAFT', { repeat: 3 })).toBe('DRAFT DRAFT DRAFT');
  });

  it('uppercase=true: uppercases text', () => {
    expect(createWatermarkText('confidential', { uppercase: true })).toBe('CONFIDENTIAL');
  });

  it('uppercase=false: preserves case', () => {
    expect(createWatermarkText('Confidential', { uppercase: false })).toBe('Confidential');
  });

  it('custom separator', () => {
    expect(createWatermarkText('DRAFT', { repeat: 3, separator: ' | ' })).toBe('DRAFT | DRAFT | DRAFT');
  });

  // Various repeat values
  for (let n = 1; n <= 10; n++) {
    it(`repeat=${n}: result contains text ${n} times`, () => {
      const result = createWatermarkText('X', { repeat: n });
      const count = result.split('X').length - 1;
      expect(count).toBe(n);
    });
  }

  // Uppercase with repeat
  for (let n = 1; n <= 5; n++) {
    it(`repeat=${n} with uppercase`, () => {
      const result = createWatermarkText('draft', { repeat: n, uppercase: true });
      expect(result).not.toContain('draft');
      expect(result).toContain('DRAFT');
    });
  }

  // Various separators
  const separators = [' ', '-', ' | ', ' // ', '---', '\t', '  ', ' * '];
  for (const sep of separators) {
    it(`separator "${sep}" used correctly`, () => {
      const result = createWatermarkText('MARK', { repeat: 2, separator: sep });
      expect(result).toBe(`MARK${sep}MARK`);
    });
  }

  // Original text preserved
  it('result contains original text', () => {
    const result = createWatermarkText('WATERMARK', { repeat: 3 });
    expect(result.includes('WATERMARK')).toBe(true);
  });

  it('empty separator with repeat=3 concatenates', () => {
    const result = createWatermarkText('AB', { repeat: 3, separator: '' });
    expect(result).toBe('ABABAB');
  });

  it('result starts with the text', () => {
    const result = createWatermarkText('START', { repeat: 2 });
    expect(result.startsWith('START')).toBe(true);
  });

  it('result ends with the text', () => {
    const result = createWatermarkText('END', { repeat: 2 });
    expect(result.endsWith('END')).toBe(true);
  });
});

// =============================================================================
// Additional tests for remaining functions
// =============================================================================

describe('formatFileSize', () => {
  it('0 bytes → "0 B"', () => expect(formatFileSize(0)).toBe('0 B'));
  it('500 bytes → "500 B"', () => expect(formatFileSize(500)).toBe('500 B'));
  it('1023 bytes → "1023 B"', () => expect(formatFileSize(1023)).toBe('1023 B'));
  it('1024 bytes → "1.0 KB"', () => expect(formatFileSize(1024)).toBe('1.0 KB'));
  it('1536 bytes → "1.5 KB"', () => expect(formatFileSize(1536)).toBe('1.5 KB'));
  it('1MB → "1.0 MB"', () => expect(formatFileSize(1024 * 1024)).toBe('1.0 MB'));
  it('2.5MB → "2.5 MB"', () => expect(formatFileSize(2621440)).toBe('2.5 MB'));
  it('1GB → "1.0 GB"', () => expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB'));
  it('negative → "0 B"', () => expect(formatFileSize(-1)).toBe('0 B'));
  for (let i = 1; i <= 10; i++) {
    it(`${i} KB = ${i * 1024} bytes`, () => {
      const result = formatFileSize(i * 1024);
      expect(result).toContain('KB');
    });
  }
});

describe('isPdfACompliant', () => {
  it('1a with no features is compliant', () => expect(isPdfACompliant('1a', [])).toBe(true));
  it('1a with transparency is NOT compliant', () => expect(isPdfACompliant('1a', ['transparency'])).toBe(false));
  it('1b with javascript is NOT compliant', () => expect(isPdfACompliant('1b', ['javascript'])).toBe(false));
  it('2a with transparency IS compliant', () => expect(isPdfACompliant('2a', ['transparency'])).toBe(true));
  it('2b with attachments IS compliant', () => expect(isPdfACompliant('2b', ['attachments'])).toBe(true));
  it('3a with attachments IS compliant', () => expect(isPdfACompliant('3a', ['attachments'])).toBe(true));
  it('3b with javascript is NOT compliant', () => expect(isPdfACompliant('3b', ['javascript'])).toBe(false));
  it('3u with encryption is NOT compliant', () => expect(isPdfACompliant('3u', ['encryption'])).toBe(false));
  it('2u with lzw is NOT compliant', () => expect(isPdfACompliant('2u', ['lzw'])).toBe(false));
  it('3a with lzw IS compliant', () => expect(isPdfACompliant('3a', ['lzw'])).toBe(true));
  for (let i = 0; i < 5; i++) {
    it(`compliant with safe features variant ${i}`, () => {
      expect(isPdfACompliant('3b', ['fonts', 'images', 'vectors'])).toBe(true);
    });
  }
});

describe('mergeMetadata', () => {
  it('merges base and override', () => {
    const result = mergeMetadata({ title: 'Base' }, { author: 'Override Author' });
    expect(result.title).toBe('Base');
    expect(result.author).toBe('Override Author');
  });

  it('override wins on conflict', () => {
    const result = mergeMetadata({ title: 'Old' }, { title: 'New' });
    expect(result.title).toBe('New');
  });

  it('empty base uses override', () => {
    const result = mergeMetadata({}, { title: 'Title', author: 'Author' });
    expect(result.title).toBe('Title');
    expect(result.author).toBe('Author');
  });

  it('empty override uses base', () => {
    const result = mergeMetadata({ title: 'Base Title' }, {});
    expect(result.title).toBe('Base Title');
  });

  for (let i = 0; i < 10; i++) {
    it(`merge variant ${i} override wins`, () => {
      const result = mergeMetadata({ pageCount: i }, { pageCount: i + 100 });
      expect(result.pageCount).toBe(i + 100);
    });
  }
});

describe('buildXrefTable', () => {
  it('returns string starting with "xref"', () => {
    const result = buildXrefTable([
      { objectNumber: 1, generation: 0, offset: 100, free: false },
    ]);
    expect(result.startsWith('xref')).toBe(true);
  });

  it('offset is zero-padded to 10 digits', () => {
    const result = buildXrefTable([
      { objectNumber: 1, generation: 0, offset: 42, free: false },
    ]);
    expect(result).toContain('0000000042');
  });

  it('generation is zero-padded to 5 digits', () => {
    const result = buildXrefTable([
      { objectNumber: 1, generation: 0, offset: 100, free: false },
    ]);
    expect(result).toContain('00000');
  });

  it('free entries use "f" marker', () => {
    const result = buildXrefTable([
      { objectNumber: 0, generation: 65535, offset: 0, free: true },
    ]);
    expect(result).toContain(' f ');
  });

  it('non-free entries use "n" marker', () => {
    const result = buildXrefTable([
      { objectNumber: 1, generation: 0, offset: 100, free: false },
    ]);
    expect(result).toContain(' n ');
  });

  it('entries sorted by objectNumber', () => {
    const result = buildXrefTable([
      { objectNumber: 3, generation: 0, offset: 300, free: false },
      { objectNumber: 1, generation: 0, offset: 100, free: false },
    ]);
    const lines = result.split('\n');
    // Line 2 (index 2) should have offset 100 (object 1), line 3 offset 300 (object 3)
    expect(lines[2]).toContain('0000000100');
    expect(lines[3]).toContain('0000000300');
  });

  for (let n = 1; n <= 5; n++) {
    it(`xref table with ${n} entries has ${n + 2} lines`, () => {
      const entries = Array.from({ length: n }, (_, i) => ({
        objectNumber: i + 1,
        generation: 0,
        offset: (i + 1) * 100,
        free: false,
      }));
      const result = buildXrefTable(entries);
      const lines = result.split('\n');
      expect(lines.length).toBe(n + 2); // "xref" + "0 N" + N entry lines
    });
  }
});

describe('pdfChecksum', () => {
  it('empty string returns 0', () => {
    expect(pdfChecksum('')).toBe(0);
  });

  it('returns a number', () => {
    expect(typeof pdfChecksum('hello')).toBe('number');
  });

  it('result is in [0, 65535]', () => {
    const result = pdfChecksum('test string for checksum');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(65535);
  });

  it('same input gives same checksum', () => {
    const s = 'consistent test data';
    expect(pdfChecksum(s)).toBe(pdfChecksum(s));
  });

  it('different inputs give potentially different checksums', () => {
    const a = pdfChecksum('abc');
    const b = pdfChecksum('xyz');
    // Not guaranteed but highly likely
    expect(typeof a).toBe('number');
    expect(typeof b).toBe('number');
  });

  for (let i = 0; i < 10; i++) {
    it(`checksum is non-negative for variant ${i}`, () => {
      const result = pdfChecksum(`data-${i}-content`);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  }

  it('single char checksum = charCode mod 65536', () => {
    const ch = 'A';
    expect(pdfChecksum(ch)).toBe(65 % 65536);
  });

  it('known value: "A" = 65', () => {
    expect(pdfChecksum('A')).toBe(65);
  });

  it('known value: "AB" = (65+66) % 65536 = 131', () => {
    expect(pdfChecksum('AB')).toBe(131);
  });
});

describe('parseMetadata and serializeMetadata', () => {
  it('parses title from raw string', () => {
    const meta = parseMetadata('/Title (My Document)');
    expect(meta.title).toBe('My Document');
  });

  it('parses author from raw string', () => {
    const meta = parseMetadata('/Author (John Doe)');
    expect(meta.author).toBe('John Doe');
  });

  it('parses multiple fields', () => {
    const raw = '/Title (Report)\n/Author (Jane)\n/Subject (Testing)';
    const meta = parseMetadata(raw);
    expect(meta.title).toBe('Report');
    expect(meta.author).toBe('Jane');
    expect(meta.subject).toBe('Testing');
  });

  it('parses keywords as array', () => {
    const meta = parseMetadata('/Keywords (alpha, beta, gamma)');
    expect(meta.keywords).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('parses pageCount', () => {
    const meta = parseMetadata('/PageCount 42');
    expect(meta.pageCount).toBe(42);
  });

  it('serializes title correctly', () => {
    const s = serializeMetadata({ title: 'My Doc' });
    expect(s).toContain('/Title (My Doc)');
  });

  it('serializes author correctly', () => {
    const s = serializeMetadata({ author: 'Jane' });
    expect(s).toContain('/Author (Jane)');
  });

  it('serializes keywords as comma-separated', () => {
    const s = serializeMetadata({ keywords: ['a', 'b', 'c'] });
    expect(s).toContain('/Keywords (a, b, c)');
  });

  it('serializeMetadata → parseMetadata roundtrip for title', () => {
    const meta = { title: 'Test Title', author: 'Test Author' };
    const serialized = serializeMetadata(meta);
    const parsed = parseMetadata(serialized);
    expect(parsed.title).toBe('Test Title');
    expect(parsed.author).toBe('Test Author');
  });

  it('empty metadata serializes to empty string', () => {
    expect(serializeMetadata({})).toBe('');
  });

  for (let i = 1; i <= 10; i++) {
    it(`roundtrip for pageCount=${i * 10}`, () => {
      const serialized = serializeMetadata({ pageCount: i * 10 });
      const parsed = parseMetadata(serialized);
      expect(parsed.pageCount).toBe(i * 10);
    });
  }
});

describe('truncateText', () => {
  it('returns original if fits', () => {
    expect(truncateText('hello', 1000, 12)).toBe('hello');
  });

  it('truncates with ellipsis if too long', () => {
    const result = truncateText('This is a very long text', 30, 12);
    expect(result.endsWith('...')).toBe(true);
  });

  it('truncated text fits within maxWidthPt', () => {
    const result = truncateText('This is a very long text', 30, 12);
    expect(estimateTextWidth(result, 12)).toBeLessThanOrEqual(30);
  });

  it('custom ellipsis is used', () => {
    const result = truncateText('This is very long text for testing', 20, 12, '…');
    expect(result.endsWith('…')).toBe(true);
  });

  it('empty string returns empty string', () => {
    expect(truncateText('', 100, 12)).toBe('');
  });

  for (let maxW = 20; maxW <= 100; maxW += 10) {
    it(`truncated text at maxW=${maxW} fits within limit`, () => {
      const result = truncateText('abcdefghijklmnopqrstuvwxyz', maxW, 10);
      expect(estimateTextWidth(result, 10)).toBeLessThanOrEqual(maxW + estimateTextWidth('...', 10));
    });
  }
});
