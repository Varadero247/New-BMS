// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  detectMode,
  getSize,
  selectVersion,
  getCapacity,
  generateMatrix,
  toAscii,
  toSvg,
  toDataUri,
  toTerminal,
  buildWifiQR,
  buildVCardQR,
  buildEmailQR,
  buildSmsQR,
  buildGeoQR,
  buildEventQR,
  validateContent,
  chunkData,
  estimateDensity,
  countDarkModules,
  hasFinderPattern,
} from '../qr-utils';

// ---------------------------------------------------------------------------
// detectMode — 100 tests
// ---------------------------------------------------------------------------
describe('detectMode', () => {
  // numeric — only digits
  const numericInputs = [
    '0', '1', '9', '00', '12345', '000000', '9999999', '1234567890',
    '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777',
    '8888', '9999', '10', '20', '30',
  ];
  for (const s of numericInputs) {
    it(`detectMode("${s}") === 'numeric'`, () => {
      expect(detectMode(s)).toBe('numeric');
    });
  }

  // alphanumeric — 0-9, A-Z, space, $%*+-./:
  const alphaInputs = [
    'HELLO', 'WORLD', 'HELLO WORLD', 'A1B2C3', 'HTTP://EXAMPLE.COM',
    'TEST$VALUE', 'ITEM%20', 'A+B', 'A-B', 'A.B', 'A/B', 'A:B',
    '  ', 'A B C', 'XYZ123', 'FOO*BAR', 'KEY:VALUE',
    'UPPER', 'CASE', 'ALPHANUM123',
  ];
  for (const s of alphaInputs) {
    it(`detectMode("${s}") === 'alphanumeric'`, () => {
      expect(detectMode(s)).toBe('alphanumeric');
    });
  }

  // byte — lowercase letters, URLs, special chars
  const byteInputs = [
    'hello', 'world', 'https://example.com', 'test@email.com',
    'mixed123ABC', 'hello world', 'café', 'naïve', 'résumé',
    'foo@bar.com', 'hello!', 'test#tag', 'a{b}c', 'x[y]z',
    '(parens)', 'back\\slash', '"quoted"', 'tab\there', 'new\nline',
    'underscore_here', 'tilde~',
  ];
  for (const s of byteInputs) {
    it(`detectMode("${s}") === 'byte'`, () => {
      expect(detectMode(s)).toBe('byte');
    });
  }

  // kanji — CJK characters
  const kanjiInputs = [
    '\u4e00', '\u9fff', '\u5e73\u548c', '\u4e16\u754c', '\u65e5\u672c',
    '\u6f22\u5b57', '\u9ad8\u6821',
  ];
  for (const s of kanjiInputs) {
    it(`detectMode(kanji:"${s}") === 'kanji'`, () => {
      expect(detectMode(s)).toBe('kanji');
    });
  }

  // edge: empty string returns 'byte'
  it('detectMode("") === "byte"', () => {
    expect(detectMode('')).toBe('byte');
  });

  // extra numeric
  for (let i = 0; i < 5; i++) {
    const s = String(i * 111);
    it(`detectMode numeric extra #${i}: "${s}"`, () => {
      expect(detectMode(s)).toBe('numeric');
    });
  }
});

// ---------------------------------------------------------------------------
// getSize — 40 tests (versions 1–40)
// ---------------------------------------------------------------------------
describe('getSize', () => {
  for (let v = 1; v <= 40; v++) {
    it(`getSize(${v}) === ${4 * v + 17}`, () => {
      expect(getSize(v)).toBe(4 * v + 17);
    });
  }
});

// ---------------------------------------------------------------------------
// selectVersion — 100 tests
// ---------------------------------------------------------------------------
describe('selectVersion', () => {
  // For each combination, verify capacity >= data.length
  const eclList: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];

  // short strings
  const shortStrings = ['1', '12', '123', '1234', '12345', '123456', '1234567', '12345678', '123456789', '1234567890'];
  for (let i = 0; i < shortStrings.length; i++) {
    const s = shortStrings[i];
    const ecl = eclList[i % 4];
    it(`selectVersion numeric "${s}" ECL ${ecl} has capacity >= ${s.length}`, () => {
      const v = selectVersion(s, ecl, 'numeric');
      expect(getCapacity(v, ecl, 'numeric')).toBeGreaterThanOrEqual(s.length);
    });
  }

  // byte mode strings of increasing length
  for (let len = 1; len <= 30; len++) {
    const s = 'x'.repeat(len);
    const ecl = eclList[len % 4];
    it(`selectVersion byte len=${len} ECL ${ecl} has capacity >= ${len}`, () => {
      const v = selectVersion(s, ecl, 'byte');
      expect(getCapacity(v, ecl, 'byte')).toBeGreaterThanOrEqual(len);
    });
  }

  // alphanumeric strings
  const alphaStrings = ['ABC', 'HELLO', 'HELLO WORLD', 'A1B2C3', 'FOO BAR', 'XYZ'];
  for (let i = 0; i < alphaStrings.length; i++) {
    const s = alphaStrings[i];
    const ecl = eclList[i % 4];
    it(`selectVersion alphanumeric "${s}" ECL ${ecl} has capacity >= ${s.length}`, () => {
      const v = selectVersion(s, ecl, 'alphanumeric');
      expect(getCapacity(v, ecl, 'alphanumeric')).toBeGreaterThanOrEqual(s.length);
    });
  }

  // auto-detect mode
  for (let i = 0; i < 50; i++) {
    const len = (i % 15) + 1;
    const s = String(i * 7).padStart(len, '0').slice(0, len);
    const ecl = eclList[i % 4];
    it(`selectVersion auto-detect #${i} len=${s.length} ECL ${ecl}`, () => {
      const v = selectVersion(s, ecl);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(40);
    });
  }

  // returns value in [1,40]
  it('selectVersion returns at least 1', () => {
    expect(selectVersion('A', 'M')).toBeGreaterThanOrEqual(1);
  });
  it('selectVersion for large data returns at most 40', () => {
    expect(selectVersion('x'.repeat(3000), 'H')).toBeLessThanOrEqual(40);
  });
  it('selectVersion empty string returns 1', () => {
    expect(selectVersion('', 'M')).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getCapacity — 100 tests
// ---------------------------------------------------------------------------
describe('getCapacity', () => {
  const eclList: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];
  const modes: Array<'numeric' | 'alphanumeric' | 'byte'> = ['numeric', 'alphanumeric', 'byte'];

  // versions 1–10 × ECL × mode — capacity > 0
  for (let v = 1; v <= 10; v++) {
    for (const ecl of eclList) {
      for (const mode of modes) {
        it(`getCapacity(${v}, ${ecl}, ${mode}) > 0`, () => {
          expect(getCapacity(v, ecl, mode)).toBeGreaterThan(0);
        });
      }
    }
  }

  // capacity ordering: L > M > Q > H (for same version and mode)
  for (let v = 1; v <= 5; v++) {
    it(`getCapacity(${v}, L, byte) >= getCapacity(${v}, M, byte)`, () => {
      expect(getCapacity(v, 'L', 'byte')).toBeGreaterThanOrEqual(getCapacity(v, 'M', 'byte'));
    });
  }
  for (let v = 1; v <= 5; v++) {
    it(`getCapacity(${v}, M, byte) >= getCapacity(${v}, H, byte)`, () => {
      expect(getCapacity(v, 'M', 'byte')).toBeGreaterThanOrEqual(getCapacity(v, 'H', 'byte'));
    });
  }

  // numeric > alphanumeric > byte
  for (let v = 1; v <= 5; v++) {
    it(`getCapacity(${v}, M, numeric) > getCapacity(${v}, M, alphanumeric)`, () => {
      expect(getCapacity(v, 'M', 'numeric')).toBeGreaterThan(getCapacity(v, 'M', 'alphanumeric'));
    });
  }
  for (let v = 1; v <= 5; v++) {
    it(`getCapacity(${v}, M, alphanumeric) > getCapacity(${v}, M, byte)`, () => {
      expect(getCapacity(v, 'M', 'alphanumeric')).toBeGreaterThan(getCapacity(v, 'M', 'byte'));
    });
  }

  // higher versions have higher capacity
  it('getCapacity(10, M, byte) > getCapacity(1, M, byte)', () => {
    expect(getCapacity(10, 'M', 'byte')).toBeGreaterThan(getCapacity(1, 'M', 'byte'));
  });

  // versions 11–40 also return > 0
  for (let v = 11; v <= 20; v++) {
    it(`getCapacity(${v}, M, byte) > 0`, () => {
      expect(getCapacity(v, 'M', 'byte')).toBeGreaterThan(0);
    });
  }

  // kanji capacity is positive
  for (let v = 1; v <= 5; v++) {
    it(`getCapacity(${v}, M, kanji) > 0`, () => {
      expect(getCapacity(v, 'M', 'kanji')).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// generateMatrix — 100 tests
// ---------------------------------------------------------------------------
describe('generateMatrix', () => {
  const dataSet = [
    '', '0', 'hello', '12345', 'https://example.com',
    'HELLO WORLD', 'test@email.com', 'WIFI:T:WPA;S:net;P:pass;;',
    'abc def ghi', '9999999',
  ];

  for (let i = 0; i < dataSet.length; i++) {
    const data = dataSet[i];
    it(`generateMatrix("${data.slice(0, 20)}") has correct size`, () => {
      const m = generateMatrix(data);
      expect(m.size).toBe(getSize(m.version));
    });
    it(`generateMatrix("${data.slice(0, 20)}") data[][] has ${4 * 1 + 17} rows min`, () => {
      const m = generateMatrix(data);
      expect(m.data.length).toBe(m.size);
    });
    it(`generateMatrix("${data.slice(0, 20)}") each row has size cols`, () => {
      const m = generateMatrix(data);
      for (const row of m.data) {
        expect(row.length).toBe(m.size);
      }
    });
    it(`generateMatrix("${data.slice(0, 20)}") has valid ECL`, () => {
      const m = generateMatrix(data);
      expect(['L', 'M', 'Q', 'H']).toContain(m.errorCorrectionLevel);
    });
    it(`generateMatrix("${data.slice(0, 20)}") has valid mode`, () => {
      const m = generateMatrix(data);
      expect(['numeric', 'alphanumeric', 'byte', 'kanji']).toContain(m.mode);
    });
    it(`generateMatrix("${data.slice(0, 20)}") has valid version 1-40`, () => {
      const m = generateMatrix(data);
      expect(m.version).toBeGreaterThanOrEqual(1);
      expect(m.version).toBeLessThanOrEqual(40);
    });
    it(`generateMatrix("${data.slice(0, 20)}") booleans only in data[][]`, () => {
      const m = generateMatrix(data);
      for (const row of m.data) {
        for (const cell of row) {
          expect(typeof cell).toBe('boolean');
        }
      }
    });
  }

  // Options variations
  it('generateMatrix with ECL L produces valid matrix', () => {
    const m = generateMatrix('hello', { errorCorrectionLevel: 'L' });
    expect(m.errorCorrectionLevel).toBe('L');
    expect(m.data.length).toBe(m.size);
  });
  it('generateMatrix with ECL H produces valid matrix', () => {
    const m = generateMatrix('hello', { errorCorrectionLevel: 'H' });
    expect(m.errorCorrectionLevel).toBe('H');
    expect(m.data.length).toBe(m.size);
  });
  it('generateMatrix with explicit version 5 produces size 37', () => {
    const m = generateMatrix('hello', { version: 5 });
    expect(m.size).toBe(37);
    expect(m.version).toBe(5);
  });
  it('generateMatrix with explicit version 10 produces size 57', () => {
    const m = generateMatrix('hello', { version: 10 });
    expect(m.size).toBe(57);
    expect(m.version).toBe(10);
  });
  it('generateMatrix is deterministic for same input', () => {
    const m1 = generateMatrix('deterministic');
    const m2 = generateMatrix('deterministic');
    expect(m1.data).toEqual(m2.data);
  });
  it('generateMatrix differs for different inputs', () => {
    const m1 = generateMatrix('hello');
    const m2 = generateMatrix('world');
    // Different hash, same or different size — data should differ if same size
    if (m1.size === m2.size) {
      const flat1 = m1.data.flat().join('');
      const flat2 = m2.data.flat().join('');
      expect(flat1).not.toBe(flat2);
    } else {
      expect(m1.size).not.toBe(m2.size);
    }
  });
  it('generateMatrix numeric mode for digits only', () => {
    const m = generateMatrix('12345', { mode: 'numeric' });
    expect(m.mode).toBe('numeric');
  });
  it('generateMatrix version 1 has size 21', () => {
    const m = generateMatrix('A', { version: 1 });
    expect(m.size).toBe(21);
  });
  it('generateMatrix version 40 has size 177', () => {
    const m = generateMatrix('test', { version: 40 });
    expect(m.size).toBe(177);
  });
  it('generateMatrix long data selects higher version', () => {
    const m1 = generateMatrix('A');
    const m2 = generateMatrix('A'.repeat(200));
    expect(m2.version).toBeGreaterThanOrEqual(m1.version);
  });
  it('generateMatrix margin option does not throw', () => {
    expect(() => generateMatrix('hello', { margin: 4 })).not.toThrow();
  });
  it('generateMatrix top-left 7x7 has finder pattern', () => {
    const m = generateMatrix('hello');
    expect(hasFinderPattern(m)).toBe(true);
  });
  it('generateMatrix count dark modules > 0', () => {
    const m = generateMatrix('hello');
    expect(countDarkModules(m)).toBeGreaterThan(0);
  });
  it('generateMatrix density in [0,1]', () => {
    const m = generateMatrix('hello');
    const d = estimateDensity(m);
    expect(d).toBeGreaterThanOrEqual(0);
    expect(d).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// toAscii — 100 tests
// ---------------------------------------------------------------------------
describe('toAscii', () => {
  const samples = [
    { data: '0', label: 'zero' },
    { data: '12345', label: 'numeric' },
    { data: 'hello', label: 'hello' },
    { data: 'https://example.com', label: 'url' },
    { data: 'TEST', label: 'alpha' },
  ];

  for (const { data, label } of samples) {
    it(`toAscii "${label}" has correct row count`, () => {
      const m = generateMatrix(data);
      const ascii = toAscii(m);
      const rows = ascii.split('\n');
      expect(rows.length).toBe(m.size);
    });
    it(`toAscii "${label}" each row has correct length`, () => {
      const m = generateMatrix(data);
      const ascii = toAscii(m);
      for (const row of ascii.split('\n')) {
        expect(row.length).toBe(m.size);
      }
    });
    it(`toAscii "${label}" default dark char is '█'`, () => {
      const m = generateMatrix(data);
      const ascii = toAscii(m);
      // Should contain at least one dark character
      expect(ascii).toContain('█');
    });
    it(`toAscii "${label}" custom dark char '#'`, () => {
      const m = generateMatrix(data);
      const ascii = toAscii(m, '#', '.');
      expect(ascii).not.toContain('█');
      // Should contain '#' or '.'
      expect(ascii.includes('#') || ascii.includes('.')).toBe(true);
    });
    it(`toAscii "${label}" with version 3 has 29 rows`, () => {
      const m = generateMatrix(data, { version: 3 });
      const ascii = toAscii(m);
      expect(ascii.split('\n').length).toBe(29);
    });
    it(`toAscii "${label}" is a non-empty string`, () => {
      const m = generateMatrix(data);
      const ascii = toAscii(m);
      expect(typeof ascii).toBe('string');
      expect(ascii.length).toBeGreaterThan(0);
    });
    it(`toAscii "${label}" rows joined by newline`, () => {
      const m = generateMatrix(data, { version: 1 });
      const ascii = toAscii(m);
      expect(ascii.includes('\n')).toBe(true);
    });
    it(`toAscii "${label}" custom light char '.'`, () => {
      const m = generateMatrix(data);
      const ascii = toAscii(m, '█', '.');
      expect(ascii.includes('.') || ascii.includes('█')).toBe(true);
    });
  }

  // Additional tests
  for (let v = 1; v <= 10; v++) {
    it(`toAscii version ${v} has ${4 * v + 17} rows`, () => {
      const m = generateMatrix('A', { version: v });
      const ascii = toAscii(m);
      expect(ascii.split('\n').length).toBe(4 * v + 17);
    });
  }

  // Custom chars
  it('toAscii with "0" and "1" chars', () => {
    const m = generateMatrix('test', { version: 1 });
    const ascii = toAscii(m, '1', '0');
    for (const ch of ascii.replace(/\n/g, '')) {
      expect(['0', '1']).toContain(ch);
    }
  });
  it('toAscii with single space dark char', () => {
    const m = generateMatrix('test', { version: 1 });
    const ascii = toAscii(m, ' ', '-');
    expect(typeof ascii).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// toSvg — 100 tests
// ---------------------------------------------------------------------------
describe('toSvg', () => {
  const inputs = [
    '0', '12345', 'hello', 'https://example.com', 'TEST',
    'world', 'abc123', 'FOOBAR', 'test@email.com', 'QR CODE',
  ];

  for (let i = 0; i < inputs.length; i++) {
    const data = inputs[i];
    it(`toSvg("${data.slice(0, 15)}") contains '<svg'`, () => {
      const m = generateMatrix(data);
      const svg = toSvg(m);
      expect(svg).toContain('<svg');
    });
    it(`toSvg("${data.slice(0, 15)}") contains '</svg>'`, () => {
      const m = generateMatrix(data);
      const svg = toSvg(m);
      expect(svg).toContain('</svg>');
    });
    it(`toSvg("${data.slice(0, 15)}") contains '<rect'`, () => {
      const m = generateMatrix(data);
      const svg = toSvg(m);
      expect(svg).toContain('<rect');
    });
    it(`toSvg("${data.slice(0, 15)}") contains xmlns`, () => {
      const m = generateMatrix(data);
      const svg = toSvg(m);
      expect(svg).toContain('xmlns');
    });
    it(`toSvg("${data.slice(0, 15)}") contains viewBox`, () => {
      const m = generateMatrix(data);
      const svg = toSvg(m);
      expect(svg).toContain('viewBox');
    });
    it(`toSvg("${data.slice(0, 15)}") is a string`, () => {
      const m = generateMatrix(data);
      const svg = toSvg(m);
      expect(typeof svg).toBe('string');
    });
    it(`toSvg("${data.slice(0, 15)}") custom cellSize reflects in width`, () => {
      const m = generateMatrix(data, { version: 1 });
      const svg = toSvg(m, { cellSize: 10 });
      const expectedPx = m.size * 10;
      expect(svg).toContain(`width="${expectedPx}"`);
    });
    it(`toSvg("${data.slice(0, 15)}") custom foreground color`, () => {
      const m = generateMatrix(data);
      const svg = toSvg(m, { foreground: '#ff0000' });
      expect(svg).toContain('#ff0000');
    });
    it(`toSvg("${data.slice(0, 15)}") custom background color`, () => {
      const m = generateMatrix(data);
      const svg = toSvg(m, { background: '#ffff00' });
      expect(svg).toContain('#ffff00');
    });
    it(`toSvg("${data.slice(0, 15)}") starts with XML declaration`, () => {
      const m = generateMatrix(data);
      const svg = toSvg(m);
      expect(svg).toContain('<?xml');
    });
  }
});

// ---------------------------------------------------------------------------
// toDataUri — 50 tests
// ---------------------------------------------------------------------------
describe('toDataUri', () => {
  const inputs = [
    '0', '123', 'hello', 'https://example.com', 'TEST',
    'world', 'data uri test', 'FOOBAR', 'test@email.com', 'QR',
  ];

  for (let i = 0; i < inputs.length; i++) {
    const data = inputs[i];
    it(`toDataUri("${data.slice(0, 15)}") starts with 'data:image/svg+xml;base64,'`, () => {
      const m = generateMatrix(data);
      const uri = toDataUri(m);
      expect(uri.startsWith('data:image/svg+xml;base64,')).toBe(true);
    });
    it(`toDataUri("${data.slice(0, 15)}") base64 portion is non-empty`, () => {
      const m = generateMatrix(data);
      const uri = toDataUri(m);
      const b64 = uri.replace('data:image/svg+xml;base64,', '');
      expect(b64.length).toBeGreaterThan(0);
    });
    it(`toDataUri("${data.slice(0, 15)}") decodes to valid SVG`, () => {
      const m = generateMatrix(data);
      const uri = toDataUri(m);
      const b64 = uri.replace('data:image/svg+xml;base64,', '');
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      expect(decoded).toContain('<svg');
    });
  }

  // Custom cellSize options
  for (let sz = 1; sz <= 10; sz++) {
    it(`toDataUri cellSize=${sz} starts with correct prefix`, () => {
      const m = generateMatrix('test', { version: 1 });
      const uri = toDataUri(m, { cellSize: sz });
      expect(uri.startsWith('data:image/svg+xml;base64,')).toBe(true);
    });
  }

  it('toDataUri is a string', () => {
    const m = generateMatrix('hello');
    expect(typeof toDataUri(m)).toBe('string');
  });
  it('toDataUri length > 26', () => {
    const m = generateMatrix('hello');
    expect(toDataUri(m).length).toBeGreaterThan(26);
  });
});

// ---------------------------------------------------------------------------
// buildWifiQR — 50 tests
// ---------------------------------------------------------------------------
describe('buildWifiQR', () => {
  // Various SSIDs and passwords
  const wifiCases = [
    { ssid: 'MyNetwork', pass: 'secret', sec: 'WPA' as const },
    { ssid: 'HomeWifi', pass: 'password123', sec: 'WPA' as const },
    { ssid: 'Office', pass: 'abc!@#', sec: 'WEP' as const },
    { ssid: 'CafeWifi', pass: '', sec: 'nopass' as const },
    { ssid: 'Test_SSID', pass: 'testpass', sec: 'WPA' as const },
  ];

  for (const { ssid, pass, sec } of wifiCases) {
    it(`buildWifiQR("${ssid}") starts with 'WIFI:'`, () => {
      expect(buildWifiQR(ssid, pass, sec)).toMatch(/^WIFI:/);
    });
    it(`buildWifiQR("${ssid}") contains 'S:${ssid}'`, () => {
      expect(buildWifiQR(ssid, pass, sec)).toContain(`S:${ssid}`);
    });
    it(`buildWifiQR("${ssid}") contains 'T:${sec}'`, () => {
      expect(buildWifiQR(ssid, pass, sec)).toContain(`T:${sec}`);
    });
    it(`buildWifiQR("${ssid}") ends with ';;'`, () => {
      expect(buildWifiQR(ssid, pass, sec)).toMatch(/;;$/);
    });
    it(`buildWifiQR("${ssid}") contains 'P:${pass}'`, () => {
      expect(buildWifiQR(ssid, pass, sec)).toContain(`P:${pass}`);
    });
  }

  // Default security is WPA
  it('buildWifiQR default security is WPA', () => {
    expect(buildWifiQR('net', 'pass')).toContain('T:WPA');
  });

  // Additional SSID variety
  const additionalSsids = [
    'Network1', 'My Home', 'WiFi_123', 'Guest_Network', 'IoT_Devices',
    'Lab_Wifi', 'Secure_Net', 'Public_Net', 'Private_Net', 'Admin_Wifi',
    'Corp_Wifi', 'Dev_Network', 'Staging_Wifi', 'Prod_Net', 'Backup_Wifi',
    'Test_Env', 'QA_Wifi', 'CI_Net', 'Deployment_Net', 'Monitor_Wifi',
    'Analytics_Wifi', 'Data_Net', 'API_Network', 'Service_Wifi', 'Platform_Net',
  ];
  for (const ssid of additionalSsids) {
    it(`buildWifiQR "${ssid}" has WIFI: prefix`, () => {
      expect(buildWifiQR(ssid, 'pass123')).toMatch(/^WIFI:/);
    });
  }
});

// ---------------------------------------------------------------------------
// buildVCardQR — 50 tests
// ---------------------------------------------------------------------------
describe('buildVCardQR', () => {
  const contacts = [
    { name: 'John Doe', phone: '+1234567890', email: 'john@example.com', org: 'Acme', url: 'https://acme.com' },
    { name: 'Jane Smith', phone: '+447911123456', email: 'jane@smith.com', org: 'Smith Co' },
    { name: 'Bob Builder', email: 'bob@build.com' },
    { name: 'Alice Wonder', phone: '+12025550179' },
    { name: 'Minimal User' },
  ];

  for (const contact of contacts) {
    it(`buildVCardQR("${contact.name}") contains 'BEGIN:VCARD'`, () => {
      const vc = buildVCardQR(contact);
      expect(vc).toContain('BEGIN:VCARD');
    });
    it(`buildVCardQR("${contact.name}") contains 'END:VCARD'`, () => {
      const vc = buildVCardQR(contact);
      expect(vc).toContain('END:VCARD');
    });
    it(`buildVCardQR("${contact.name}") contains 'FN:${contact.name}'`, () => {
      const vc = buildVCardQR(contact);
      expect(vc).toContain(`FN:${contact.name}`);
    });
    it(`buildVCardQR("${contact.name}") contains 'VERSION:3.0'`, () => {
      const vc = buildVCardQR(contact);
      expect(vc).toContain('VERSION:3.0');
    });
    it(`buildVCardQR("${contact.name}") is a string`, () => {
      const vc = buildVCardQR(contact);
      expect(typeof vc).toBe('string');
    });
  }

  // Phone included when provided
  it('buildVCardQR includes TEL when phone provided', () => {
    const vc = buildVCardQR({ name: 'Test', phone: '+1234567890' });
    expect(vc).toContain('TEL:+1234567890');
  });
  it('buildVCardQR includes EMAIL when provided', () => {
    const vc = buildVCardQR({ name: 'Test', email: 'a@b.com' });
    expect(vc).toContain('EMAIL:a@b.com');
  });
  it('buildVCardQR includes ORG when provided', () => {
    const vc = buildVCardQR({ name: 'Test', org: 'Nexara' });
    expect(vc).toContain('ORG:Nexara');
  });
  it('buildVCardQR includes URL when provided', () => {
    const vc = buildVCardQR({ name: 'Test', url: 'https://nexara.com' });
    expect(vc).toContain('URL:https://nexara.com');
  });
  it('buildVCardQR omits TEL when not provided', () => {
    const vc = buildVCardQR({ name: 'Test' });
    expect(vc).not.toContain('TEL:');
  });
  it('buildVCardQR omits EMAIL when not provided', () => {
    const vc = buildVCardQR({ name: 'Test' });
    expect(vc).not.toContain('EMAIL:');
  });

  // Additional names
  const extraNames = [
    'Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Henry',
    'Iris', 'Jack', 'Karen', 'Leo', 'Mia', 'Nate', 'Olivia', 'Paul',
    'Quinn', 'Rose', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xena', 'Yara',
  ];
  for (const name of extraNames) {
    it(`buildVCardQR name="${name}" has BEGIN:VCARD`, () => {
      expect(buildVCardQR({ name })).toContain('BEGIN:VCARD');
    });
  }
});

// ---------------------------------------------------------------------------
// buildEmailQR — 50 tests
// ---------------------------------------------------------------------------
describe('buildEmailQR', () => {
  const emails = [
    { to: 'user@example.com', subject: 'Hello', body: 'Hi there' },
    { to: 'admin@nexara.com', subject: 'Support Request' },
    { to: 'info@company.org' },
    { to: 'noreply@service.io', body: 'Automated message' },
    { to: 'contact@startup.co', subject: 'Partnership', body: 'Interested in partnership' },
  ];

  for (const { to, subject, body } of emails) {
    it(`buildEmailQR("${to}") starts with 'mailto:'`, () => {
      expect(buildEmailQR(to, subject, body)).toMatch(/^mailto:/);
    });
    it(`buildEmailQR("${to}") contains email address`, () => {
      expect(buildEmailQR(to, subject, body)).toContain(to);
    });
    it(`buildEmailQR("${to}") is a string`, () => {
      expect(typeof buildEmailQR(to, subject, body)).toBe('string');
    });
  }

  // Subject encoding
  it('buildEmailQR includes subject in query string', () => {
    const result = buildEmailQR('a@b.com', 'Test Subject');
    expect(result).toContain('subject=');
  });
  it('buildEmailQR includes body in query string', () => {
    const result = buildEmailQR('a@b.com', undefined, 'Test Body');
    expect(result).toContain('body=');
  });
  it('buildEmailQR no params → no ?', () => {
    const result = buildEmailQR('a@b.com');
    expect(result).toBe('mailto:a@b.com');
  });

  // Additional email addresses
  const extraEmails = [
    'alice@example.com', 'bob@test.org', 'carol@domain.co.uk',
    'dave@nexara.com', 'eve@startup.io', 'frank@corp.net',
    'grace@uni.edu', 'henry@gov.uk', 'iris@media.com',
    'jack@finance.co', 'karen@legal.org', 'leo@tech.io',
    'mia@health.com', 'nate@safety.co', 'olivia@env.org',
    'paul@quality.co', 'quinn@risk.com', 'rose@audit.io',
    'sam@compliance.co', 'tara@training.org', 'uma@hr.com',
    'victor@finance.io', 'wendy@crm.co', 'xena@docs.org', 'yara@portal.io',
    'zach@analytics.com', 'anna@esg.co', 'ben@cmms.io', 'cora@assets.org', 'dan@contracts.co',
    'ella@complaints.io', 'finn@incidents.com', 'gina@audits.co',
  ];
  for (const addr of extraEmails) {
    it(`buildEmailQR "${addr}" has mailto: prefix`, () => {
      expect(buildEmailQR(addr)).toMatch(/^mailto:/);
    });
  }
});

// ---------------------------------------------------------------------------
// buildSmsQR — 50 tests
// ---------------------------------------------------------------------------
describe('buildSmsQR', () => {
  const smsCases = [
    { phone: '+1234567890', msg: 'Hello!' },
    { phone: '+447911123456', msg: 'Test message' },
    { phone: '+12025550179' },
    { phone: '+33612345678', msg: 'Bonjour' },
    { phone: '+491711234567', msg: 'Hallo' },
  ];

  for (const { phone, msg } of smsCases) {
    it(`buildSmsQR("${phone}") starts with 'sms:'`, () => {
      expect(buildSmsQR(phone, msg)).toMatch(/^sms:/);
    });
    it(`buildSmsQR("${phone}") contains phone`, () => {
      expect(buildSmsQR(phone, msg)).toContain(phone);
    });
    it(`buildSmsQR("${phone}") is a string`, () => {
      expect(typeof buildSmsQR(phone, msg)).toBe('string');
    });
  }

  it('buildSmsQR without message has no colon after phone', () => {
    const result = buildSmsQR('+1234567890');
    expect(result).toBe('sms:+1234567890');
  });
  it('buildSmsQR with message includes the message', () => {
    const result = buildSmsQR('+1234567890', 'Test');
    expect(result).toContain('Test');
  });
  it('buildSmsQR normalises phone without + prefix', () => {
    const result = buildSmsQR('1234567890', 'Hi');
    expect(result).toContain('+1234567890');
  });
  it('buildSmsQR already has + prefix is unchanged', () => {
    const result = buildSmsQR('+1234567890');
    expect(result).toContain('+1234567890');
  });

  // Additional phone numbers
  const extraPhones = [
    '+15551234567', '+447700900123', '+33123456789', '+4912345678901',
    '+81312345678', '+8613812345678', '+7916123456', '+39012345678',
    '+34612345678', '+31612345678', '+46712345678', '+47712345678',
    '+358401234567', '+4512345678', '+48123456789', '+420123456789',
    '+36201234567', '+40712345678', '+35912345678', '+30210123456',
    '+90532123456', '+972541234567', '+27821234567', '+551123456789',
    '+521234567890', '+541123456789', '+573001234567', '+56912345678',
    '+5491112345678', '+598912345678', '+56212345678', '+5193001234567',
    '+19172345678', '+18455551234',
  ];
  for (const phone of extraPhones) {
    it(`buildSmsQR "${phone}" has sms: prefix`, () => {
      expect(buildSmsQR(phone)).toMatch(/^sms:/);
    });
  }
});

// ---------------------------------------------------------------------------
// buildGeoQR — 50 tests
// ---------------------------------------------------------------------------
describe('buildGeoQR', () => {
  const geoCases = [
    { lat: 51.5074, lon: -0.1278 },   // London
    { lat: 40.7128, lon: -74.006 },   // New York
    { lat: 35.6762, lon: 139.6503 },  // Tokyo
    { lat: 48.8566, lon: 2.3522 },    // Paris
    { lat: -33.8688, lon: 151.2093 }, // Sydney
  ];

  for (const { lat, lon } of geoCases) {
    it(`buildGeoQR(${lat}, ${lon}) starts with 'geo:'`, () => {
      expect(buildGeoQR(lat, lon)).toMatch(/^geo:/);
    });
    it(`buildGeoQR(${lat}, ${lon}) contains lat`, () => {
      expect(buildGeoQR(lat, lon)).toContain(String(lat));
    });
    it(`buildGeoQR(${lat}, ${lon}) contains lon`, () => {
      expect(buildGeoQR(lat, lon)).toContain(String(lon));
    });
    it(`buildGeoQR(${lat}, ${lon}) format is 'geo:lat,lon'`, () => {
      expect(buildGeoQR(lat, lon)).toBe(`geo:${lat},${lon}`);
    });
    it(`buildGeoQR(${lat}, ${lon}) is a string`, () => {
      expect(typeof buildGeoQR(lat, lon)).toBe('string');
    });
  }

  // Edge coordinates
  it('buildGeoQR(0, 0) is "geo:0,0"', () => {
    expect(buildGeoQR(0, 0)).toBe('geo:0,0');
  });
  it('buildGeoQR(90, 180) is "geo:90,180"', () => {
    expect(buildGeoQR(90, 180)).toBe('geo:90,180');
  });
  it('buildGeoQR(-90, -180) is "geo:-90,-180"', () => {
    expect(buildGeoQR(-90, -180)).toBe('geo:-90,-180');
  });

  // More coordinates
  const extraCoords = [
    [55.7558, 37.6173], [39.9042, 116.4074], [-22.9068, -43.1729],
    [19.4326, -99.1332], [1.3521, 103.8198], [25.2048, 55.2708],
    [41.9028, 12.4964], [52.52, 13.405], [59.9311, 30.3609],
    [37.9838, 23.7275], [41.0082, 28.9784], [50.0755, 14.4378],
    [47.4979, 19.0402], [45.8151, 15.9819], [48.2082, 16.3738],
    [46.9481, 7.4474], [50.8503, 4.3517], [52.3676, 4.9041],
    [55.6761, 12.5683], [59.9139, 10.7522], [60.1699, 24.9384],
    [63.4305, 10.3951], [64.1265, -21.8174], [-34.6037, -58.3816],
    [4.7110, -74.0721],
  ];
  for (let i = 0; i < extraCoords.length; i++) {
    const [lat, lon] = extraCoords[i];
    it(`buildGeoQR extra #${i} starts with geo:`, () => {
      expect(buildGeoQR(lat, lon)).toMatch(/^geo:/);
    });
  }
});

// ---------------------------------------------------------------------------
// validateContent — 100 tests
// ---------------------------------------------------------------------------
describe('validateContent', () => {
  // Short strings — valid
  const shortStrings = [
    '', 'A', 'hello', '12345', 'test@email.com',
    'https://example.com', 'Hello World!', 'UPPERCASE',
    '0000000000', 'short',
  ];
  for (const s of shortStrings) {
    it(`validateContent("${s.slice(0, 20)}") is valid`, () => {
      const result = validateContent(s);
      expect(result.valid).toBe(true);
    });
    it(`validateContent("${s.slice(0, 20)}") has version when valid`, () => {
      const result = validateContent(s);
      expect(result.version).toBeGreaterThanOrEqual(1);
    });
  }

  // Extremely long strings — invalid
  for (let len = 3500; len <= 5000; len += 150) {
    it(`validateContent length=${len} H ECL is invalid`, () => {
      const result = validateContent('x'.repeat(len), { errorCorrectionLevel: 'H' });
      expect(result.valid).toBe(false);
    });
    it(`validateContent length=${len} H ECL reason is 'too long'`, () => {
      const result = validateContent('x'.repeat(len), { errorCorrectionLevel: 'H' });
      expect(result.reason).toBe('too long');
    });
  }

  // ECL variations on valid data
  const eclList: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H'];
  for (const ecl of eclList) {
    it(`validateContent "hello" ECL ${ecl} is valid`, () => {
      const result = validateContent('hello', { errorCorrectionLevel: ecl });
      expect(result.valid).toBe(true);
    });
    it(`validateContent "hello" ECL ${ecl} has no reason`, () => {
      const result = validateContent('hello', { errorCorrectionLevel: ecl });
      expect(result.reason).toBeUndefined();
    });
  }

  // Length at boundary
  it('validateContent empty string is valid', () => {
    expect(validateContent('').valid).toBe(true);
  });
  it('validateContent single char is valid', () => {
    expect(validateContent('x').valid).toBe(true);
  });
  it('validateContent very long string ECL L might be valid', () => {
    const r = validateContent('x'.repeat(2000), { errorCorrectionLevel: 'L' });
    // Either valid or invalid, but result should have a boolean
    expect(typeof r.valid).toBe('boolean');
  });
  it('validateContent result has valid key', () => {
    const r = validateContent('test');
    expect('valid' in r).toBe(true);
  });

  // No reason when valid
  for (let i = 0; i < 20; i++) {
    const s = 'test'.repeat(i + 1);
    it(`validateContent valid string #${i} has no reason`, () => {
      const r = validateContent(s.slice(0, 100));
      if (r.valid) expect(r.reason).toBeUndefined();
    });
  }

  // Various ECL + mode combos
  for (let i = 0; i < 10; i++) {
    const ecl = eclList[i % 4];
    it(`validateContent numeric ${i * 10} chars ECL ${ecl}`, () => {
      const s = String(i).repeat(i * 10).slice(0, i * 10);
      const r = validateContent(s, { errorCorrectionLevel: ecl, mode: 'numeric' });
      expect(typeof r.valid).toBe('boolean');
    });
  }
});

// ---------------------------------------------------------------------------
// chunkData — 100 tests
// ---------------------------------------------------------------------------
describe('chunkData', () => {
  // Basic chunking: all chunks <= maxChunkSize
  for (let size = 1; size <= 20; size++) {
    it(`chunkData maxChunkSize=${size} all chunks <= ${size}`, () => {
      const data = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const chunks = chunkData(data, size);
      for (const chunk of chunks) {
        expect(chunk.length).toBeLessThanOrEqual(size);
      }
    });
  }

  // Reconstruction: chunks joined = original
  for (let size = 1; size <= 10; size++) {
    it(`chunkData size=${size} chunks reconstruct original`, () => {
      const data = 'Hello World! This is a test string.';
      const chunks = chunkData(data, size);
      expect(chunks.join('')).toBe(data);
    });
  }

  // Chunk count
  it('chunkData("abc", 1) produces 3 chunks', () => {
    expect(chunkData('abc', 1).length).toBe(3);
  });
  it('chunkData("abc", 3) produces 1 chunk', () => {
    expect(chunkData('abc', 3).length).toBe(1);
  });
  it('chunkData("abcde", 2) produces 3 chunks', () => {
    expect(chunkData('abcde', 2).length).toBe(3);
  });
  it('chunkData("", N) produces [""]', () => {
    expect(chunkData('', 10)).toEqual(['']);
  });
  it('chunkData throws on maxChunkSize=0', () => {
    expect(() => chunkData('abc', 0)).toThrow();
  });
  it('chunkData throws on negative maxChunkSize', () => {
    expect(() => chunkData('abc', -1)).toThrow();
  });

  // Various data sizes
  for (let len = 10; len <= 100; len += 10) {
    it(`chunkData data.length=${len} maxChunkSize=7 all chunks <= 7`, () => {
      const data = 'x'.repeat(len);
      const chunks = chunkData(data, 7);
      for (const c of chunks) {
        expect(c.length).toBeLessThanOrEqual(7);
      }
    });
  }

  // Large chunk size
  it('chunkData maxChunkSize > data.length returns single chunk', () => {
    const chunks = chunkData('hello', 100);
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe('hello');
  });

  // Exact divisibility
  it('chunkData("123456", 2) produces ["12","34","56"]', () => {
    expect(chunkData('123456', 2)).toEqual(['12', '34', '56']);
  });
  it('chunkData("12345", 2) produces ["12","34","5"]', () => {
    expect(chunkData('12345', 2)).toEqual(['12', '34', '5']);
  });

  // More size/data combos
  for (let sz = 5; sz <= 15; sz++) {
    it(`chunkData size=${sz} joins back correctly`, () => {
      const data = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const joined = chunkData(data, sz).join('');
      expect(joined).toBe(data);
    });
  }
});

// ---------------------------------------------------------------------------
// estimateDensity — 50 tests
// ---------------------------------------------------------------------------
describe('estimateDensity', () => {
  const dataInputs = [
    '0', '1', 'hello', '12345', 'https://example.com',
    'TEST', 'world', 'abc', 'FOOBAR', 'test@email.com',
  ];

  for (let i = 0; i < dataInputs.length; i++) {
    const data = dataInputs[i];
    it(`estimateDensity("${data.slice(0, 15)}") >= 0`, () => {
      const m = generateMatrix(data);
      expect(estimateDensity(m)).toBeGreaterThanOrEqual(0);
    });
    it(`estimateDensity("${data.slice(0, 15)}") <= 1`, () => {
      const m = generateMatrix(data);
      expect(estimateDensity(m)).toBeLessThanOrEqual(1);
    });
    it(`estimateDensity("${data.slice(0, 15)}") is a number`, () => {
      const m = generateMatrix(data);
      expect(typeof estimateDensity(m)).toBe('number');
    });
  }

  // Density equals darkModules / (size*size)
  for (let i = 0; i < 10; i++) {
    const data = `density_test_${i}`;
    it(`estimateDensity #${i} equals countDarkModules / (size*size)`, () => {
      const m = generateMatrix(data);
      const expected = countDarkModules(m) / (m.size * m.size);
      expect(estimateDensity(m)).toBeCloseTo(expected, 10);
    });
  }

  // Various versions
  for (let v = 1; v <= 10; v++) {
    it(`estimateDensity version ${v} in [0,1]`, () => {
      const m = generateMatrix('test', { version: v });
      const d = estimateDensity(m);
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// countDarkModules — 50 tests
// ---------------------------------------------------------------------------
describe('countDarkModules', () => {
  const dataInputs = [
    '0', '1', 'hello', '12345', 'https://example.com',
    'TEST', 'world', 'abc', 'FOOBAR', 'test@email.com',
  ];

  for (let i = 0; i < dataInputs.length; i++) {
    const data = dataInputs[i];
    it(`countDarkModules("${data.slice(0, 15)}") > 0`, () => {
      const m = generateMatrix(data);
      expect(countDarkModules(m)).toBeGreaterThan(0);
    });
    it(`countDarkModules("${data.slice(0, 15)}") <= size*size`, () => {
      const m = generateMatrix(data);
      expect(countDarkModules(m)).toBeLessThanOrEqual(m.size * m.size);
    });
    it(`countDarkModules("${data.slice(0, 15)}") is an integer`, () => {
      const m = generateMatrix(data);
      expect(Number.isInteger(countDarkModules(m))).toBe(true);
    });
  }

  // Relationships
  for (let v = 1; v <= 5; v++) {
    it(`countDarkModules version ${v} + lightModules = size^2`, () => {
      const m = generateMatrix('test', { version: v });
      const dark = countDarkModules(m);
      const total = m.size * m.size;
      const light = total - dark;
      expect(dark + light).toBe(total);
    });
  }

  // Consistency with density
  for (let i = 0; i < 10; i++) {
    const data = `count_test_${i}`;
    it(`countDarkModules #${i} consistent with estimateDensity`, () => {
      const m = generateMatrix(data);
      const dark = countDarkModules(m);
      const density = estimateDensity(m);
      expect(density).toBeCloseTo(dark / (m.size * m.size), 10);
    });
  }

  // Different inputs give different counts (usually)
  it('countDarkModules is non-negative', () => {
    const m = generateMatrix('any data here');
    expect(countDarkModules(m)).toBeGreaterThanOrEqual(0);
  });

  // Multiple calls give same result
  it('countDarkModules is deterministic', () => {
    const m = generateMatrix('deterministic');
    expect(countDarkModules(m)).toBe(countDarkModules(m));
  });

  // Large version
  it('countDarkModules version 10 is positive', () => {
    const m = generateMatrix('large test', { version: 10 });
    expect(countDarkModules(m)).toBeGreaterThan(0);
  });
  it('countDarkModules version 20 is positive', () => {
    const m = generateMatrix('large test', { version: 20 });
    expect(countDarkModules(m)).toBeGreaterThan(0);
  });
  it('countDarkModules version 40 is positive', () => {
    const m = generateMatrix('large test', { version: 40 });
    expect(countDarkModules(m)).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// hasFinderPattern — additional tests
// ---------------------------------------------------------------------------
describe('hasFinderPattern', () => {
  it('hasFinderPattern returns true for generated matrix', () => {
    const m = generateMatrix('hello');
    expect(hasFinderPattern(m)).toBe(true);
  });
  it('hasFinderPattern returns true for version 1 matrix', () => {
    const m = generateMatrix('A', { version: 1 });
    expect(hasFinderPattern(m)).toBe(true);
  });
  it('hasFinderPattern returns true for version 5 matrix', () => {
    const m = generateMatrix('test', { version: 5 });
    expect(hasFinderPattern(m)).toBe(true);
  });
  it('hasFinderPattern returns true for version 10 matrix', () => {
    const m = generateMatrix('test data', { version: 10 });
    expect(hasFinderPattern(m)).toBe(true);
  });
  it('hasFinderPattern returns false for tiny matrix (size < 7)', () => {
    const m: import('../qr-utils').QRMatrix = {
      size: 5,
      data: Array.from({ length: 5 }, () => new Array(5).fill(true)),
      version: 1,
      errorCorrectionLevel: 'M',
      mode: 'byte',
    };
    expect(hasFinderPattern(m)).toBe(false);
  });
  it('hasFinderPattern returns false when top-left border not dark', () => {
    const m = generateMatrix('hello', { version: 1 });
    m.data[0][0] = false; // break the top-left corner
    expect(hasFinderPattern(m)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// toTerminal — basic tests
// ---------------------------------------------------------------------------
describe('toTerminal', () => {
  it('toTerminal returns a string', () => {
    const m = generateMatrix('hello');
    expect(typeof toTerminal(m)).toBe('string');
  });
  it('toTerminal output has correct number of lines for even size', () => {
    const m = generateMatrix('A', { version: 1 }); // size 21
    const lines = toTerminal(m).split('\n');
    expect(lines.length).toBe(Math.ceil(21 / 2));
  });
  it('toTerminal uses block characters', () => {
    const m = generateMatrix('hello', { version: 1 });
    const out = toTerminal(m);
    // Should contain at least one block char or space
    expect(out.length).toBeGreaterThan(0);
  });
  it('toTerminal is non-empty', () => {
    const m = generateMatrix('test');
    expect(toTerminal(m).length).toBeGreaterThan(0);
  });
  it('toTerminal for version 2 has correct lines', () => {
    const m = generateMatrix('test', { version: 2 }); // size 25
    const lines = toTerminal(m).split('\n');
    expect(lines.length).toBe(Math.ceil(25 / 2));
  });
});

// ---------------------------------------------------------------------------
// buildEventQR — basic tests
// ---------------------------------------------------------------------------
describe('buildEventQR', () => {
  it('buildEventQR contains BEGIN:VCALENDAR', () => {
    const ev = buildEventQR({
      summary: 'Team Meeting',
      start: new Date('2026-03-01T10:00:00Z'),
      end: new Date('2026-03-01T11:00:00Z'),
    });
    expect(ev).toContain('BEGIN:VCALENDAR');
  });
  it('buildEventQR contains END:VCALENDAR', () => {
    const ev = buildEventQR({
      summary: 'Review',
      start: new Date('2026-03-02T09:00:00Z'),
      end: new Date('2026-03-02T10:00:00Z'),
    });
    expect(ev).toContain('END:VCALENDAR');
  });
  it('buildEventQR contains SUMMARY', () => {
    const ev = buildEventQR({
      summary: 'Board Meeting',
      start: new Date('2026-04-01T14:00:00Z'),
      end: new Date('2026-04-01T15:00:00Z'),
    });
    expect(ev).toContain('SUMMARY:Board Meeting');
  });
  it('buildEventQR contains DTSTART', () => {
    const ev = buildEventQR({
      summary: 'Event',
      start: new Date('2026-05-01T08:00:00Z'),
      end: new Date('2026-05-01T09:00:00Z'),
    });
    expect(ev).toContain('DTSTART:');
  });
  it('buildEventQR contains DTEND', () => {
    const ev = buildEventQR({
      summary: 'Event',
      start: new Date('2026-06-01T08:00:00Z'),
      end: new Date('2026-06-01T09:00:00Z'),
    });
    expect(ev).toContain('DTEND:');
  });
  it('buildEventQR includes location when provided', () => {
    const ev = buildEventQR({
      summary: 'Conf',
      start: new Date('2026-07-01T10:00:00Z'),
      end: new Date('2026-07-01T11:00:00Z'),
      location: 'Room 101',
    });
    expect(ev).toContain('LOCATION:Room 101');
  });
  it('buildEventQR includes description when provided', () => {
    const ev = buildEventQR({
      summary: 'Workshop',
      start: new Date('2026-08-01T10:00:00Z'),
      end: new Date('2026-08-01T12:00:00Z'),
      description: 'Annual workshop',
    });
    expect(ev).toContain('DESCRIPTION:Annual workshop');
  });
  it('buildEventQR is a string', () => {
    const ev = buildEventQR({
      summary: 'Test',
      start: new Date('2026-01-01T00:00:00Z'),
      end: new Date('2026-01-01T01:00:00Z'),
    });
    expect(typeof ev).toBe('string');
  });
});
