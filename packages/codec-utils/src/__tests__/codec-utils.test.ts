// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  toBase64, fromBase64, toBase64Url, fromBase64Url, isValidBase64, isValidBase64Url,
  toHex, fromHex, isValidHex, toHexBytes,
  encodeUri, decodeUri, encodeUriComponent, decodeUriComponent, encodeFormData, decodeFormData,
  encodeHtml, decodeHtml, stripHtmlTags,
  rot13, rot47, reverseString, toBinary, fromBinary,
  hash, sha256, sha512, md5, hmac, checksum,
  bytesToHuman, isAscii, isPrintable, countBytes,
} from '../codec-utils';

// ─── helpers ────────────────────────────────────────────────────────────────

function makeStr(len: number): string {
  // Reproducible string of printable ASCII characters of the given length
  let s = '';
  for (let i = 0; i < len; i++) {
    s += String.fromCharCode(32 + (i % 95));
  }
  return s;
}

// ─── BASE64 roundtrip ────────────────────────────────────────────────────────

describe('toBase64 / fromBase64 roundtrip (100 iterations)', () => {
  for (let i = 0; i < 100; i++) {
    it(`roundtrip length ${i}`, () => {
      const input = makeStr(i);
      expect(fromBase64(toBase64(input))).toBe(input);
    });
  }
});

describe('toBase64Url / fromBase64Url roundtrip (100 iterations)', () => {
  for (let i = 0; i < 100; i++) {
    it(`url-safe roundtrip length ${i}`, () => {
      const input = makeStr(i);
      expect(fromBase64Url(toBase64Url(input))).toBe(input);
    });
  }
});

// ─── HEX roundtrip ───────────────────────────────────────────────────────────

describe('toHex / fromHex roundtrip (100 iterations)', () => {
  for (let i = 0; i < 100; i++) {
    it(`hex roundtrip length ${i}`, () => {
      const input = makeStr(i);
      expect(fromHex(toHex(input))).toBe(input);
    });
  }
});

// ─── encodeUriComponent / decodeUriComponent roundtrip (100 iterations) ──────

describe('encodeUriComponent / decodeUriComponent roundtrip (100 iterations)', () => {
  const special = ['', ' ', 'hello world', 'a&b=c', '#hash?q=1', 'café', '日本語',
    'path/to/file', 'key=val&other=x', '!@#$%^&*()', '<script>', '1+2=3',
    'name=John Doe', '/api/v1/search?q=test', 'https://example.com',
    'user@example.com', '"quoted"', "'single'", '\t\n\r', '%already%encoded%',
    'a'.repeat(20), 'z'.repeat(20), '0123456789', 'UPPER CASE', 'lower case'];
  for (let i = 0; i < 100; i++) {
    const s = special[i % special.length] + (i > special.length ? String(i) : '');
    it(`uri-component roundtrip #${i}: ${s.slice(0, 20)}`, () => {
      expect(decodeUriComponent(encodeUriComponent(s))).toBe(s);
    });
  }
});

// ─── encodeHtml / decodeHtml roundtrip (100 iterations) ──────────────────────

describe('encodeHtml / decodeHtml roundtrip (100 iterations)', () => {
  const htmlInputs = [
    '', 'plain text', '<b>bold</b>', '&amp;', '"quote"', "'apos'",
    '<script>alert("xss")</script>', 'a < b && b > c', '5 > 3 & 2 < 4',
    'He said "hello" & she said \'hi\'', '<img src="x" onerror="y">',
    'A&B', 'C<D>E', 'F"G\'H', 'a&b&c', '<><>', '&&', '""', "''",
    'mix & <match>', 'no specials here',
  ];
  for (let i = 0; i < 100; i++) {
    const s = htmlInputs[i % htmlInputs.length] + (i >= htmlInputs.length ? i.toString() : '');
    it(`html encode/decode roundtrip #${i}`, () => {
      expect(decodeHtml(encodeHtml(s))).toBe(s);
    });
  }
});

// ─── ROT13 is its own inverse (50 iterations) ─────────────────────────────────

describe('rot13 is its own inverse (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`rot13 involution #${i}`, () => {
      const input = makeStr(i);
      expect(rot13(rot13(input))).toBe(input);
    });
  }
});

// ─── ROT47 is its own inverse (50 iterations) ─────────────────────────────────

describe('rot47 is its own inverse (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`rot47 involution #${i}`, () => {
      const input = makeStr(i);
      expect(rot47(rot47(input))).toBe(input);
    });
  }
});

// ─── toBinary / fromBinary roundtrip (50 iterations) ──────────────────────────

describe('toBinary / fromBinary roundtrip (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`binary roundtrip length ${i}`, () => {
      const input = makeStr(i);
      expect(fromBinary(toBinary(input))).toBe(input);
    });
  }
});

// ─── reverseString double reverse (50 iterations) ─────────────────────────────

describe('reverseString double-reverse is identity (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`double-reverse length ${i}`, () => {
      const input = makeStr(i);
      expect(reverseString(reverseString(input))).toBe(input);
    });
  }
});

// ─── sha256 determinism (50 iterations) ───────────────────────────────────────

describe('sha256 is deterministic (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`sha256 determinism #${i}`, () => {
      const input = makeStr(i + 1);
      expect(sha256(input)).toBe(sha256(input));
    });
  }
});

// ─── hmac determinism (50 iterations) ────────────────────────────────────────

describe('hmac is deterministic (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`hmac determinism #${i}`, () => {
      const input = makeStr(i + 1);
      const secret = 'secret-' + i;
      expect(hmac(input, secret)).toBe(hmac(input, secret));
    });
  }
});

// ─── checksum determinism (50 iterations) ────────────────────────────────────

describe('checksum is deterministic (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`checksum determinism #${i}`, () => {
      const input = makeStr(i);
      expect(checksum(input)).toBe(checksum(input));
    });
  }
});

// ─── toHexBytes consistency (50 iterations) ───────────────────────────────────

describe('toHexBytes is consistent with toHex (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`toHexBytes consistent #${i}`, () => {
      const input = makeStr(i);
      const hexFull = toHex(input);
      const bytes = toHexBytes(input);
      expect(bytes.join('')).toBe(hexFull);
      expect(bytes.every((b) => b.length === 2)).toBe(true);
    });
  }
});

// ─── countBytes / isAscii / isPrintable (50 iterations) ───────────────────────

describe('countBytes, isAscii, isPrintable on ASCII strings (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    it(`utility functions on ASCII string of length ${i}`, () => {
      const input = makeStr(i);
      expect(countBytes(input)).toBe(i); // all chars are single-byte ASCII
      expect(isAscii(input)).toBe(true);
      expect(isPrintable(input)).toBe(true);
    });
  }
});

// ─── Correctness tests — Base64 ───────────────────────────────────────────────

describe('Base64 correctness', () => {
  it('toBase64 empty string', () => expect(toBase64('')).toBe(''));
  it('toBase64 "hello"', () => expect(toBase64('hello')).toBe('aGVsbG8='));
  it('fromBase64 "aGVsbG8="', () => expect(fromBase64('aGVsbG8=')).toBe('hello'));
  it('toBase64 "Man"', () => expect(toBase64('Man')).toBe('TWFu'));
  it('toBase64Url has no + / =', () => {
    const r = toBase64Url('hello world test string for base64');
    expect(r).not.toContain('+');
    expect(r).not.toContain('/');
    expect(r).not.toContain('=');
  });
  it('fromBase64Url decodes back', () => {
    expect(fromBase64Url(toBase64Url('hello world'))).toBe('hello world');
  });
  it('isValidBase64 valid', () => expect(isValidBase64('aGVsbG8=')).toBe(true));
  it('isValidBase64 invalid', () => expect(isValidBase64('not!!valid')).toBe(false));
  it('isValidBase64Url valid', () => expect(isValidBase64Url('aGVsbG8')).toBe(true));
  it('isValidBase64Url invalid with =', () => expect(isValidBase64Url('aGVsbG8=')).toBe(false));
  it('toBase64 accepts Buffer', () => {
    expect(toBase64(Buffer.from('hello'))).toBe('aGVsbG8=');
  });
});

// ─── Correctness tests — Hex ──────────────────────────────────────────────────

describe('Hex correctness', () => {
  it('toHex empty', () => expect(toHex('')).toBe(''));
  it('toHex "A"', () => expect(toHex('A')).toBe('41'));
  it('fromHex "41"', () => expect(fromHex('41')).toBe('A'));
  it('toHex "hello"', () => expect(toHex('hello')).toBe('68656c6c6f'));
  it('fromHex "68656c6c6f"', () => expect(fromHex('68656c6c6f')).toBe('hello'));
  it('isValidHex valid lower', () => expect(isValidHex('deadbeef')).toBe(true));
  it('isValidHex valid upper', () => expect(isValidHex('DEADBEEF')).toBe(true));
  it('isValidHex odd length', () => expect(isValidHex('abc')).toBe(false));
  it('isValidHex invalid char', () => expect(isValidHex('gg')).toBe(false));
  it('isValidHex empty', () => expect(isValidHex('')).toBe(true));
  it('toHexBytes "AB"', () => {
    const bytes = toHexBytes('AB');
    expect(bytes).toEqual(['41', '42']);
  });
  it('toHexBytes accepts Buffer', () => {
    expect(toHexBytes(Buffer.from([0x0a, 0xff]))).toEqual(['0a', 'ff']);
  });
});

// ─── Correctness tests — URI ──────────────────────────────────────────────────

describe('URI correctness', () => {
  it('encodeUri preserves colon', () => expect(encodeUri('https://example.com')).toBe('https://example.com'));
  it('encodeUri encodes space', () => expect(encodeUri('hello world')).toBe('hello%20world'));
  it('decodeUri decodes %20', () => expect(decodeUri('hello%20world')).toBe('hello world'));
  it('encodeUriComponent encodes &', () => expect(encodeUriComponent('a&b')).toBe('a%26b'));
  it('encodeUriComponent encodes =', () => expect(encodeUriComponent('a=b')).toBe('a%3Db'));
  it('decodeUriComponent decodes', () => expect(decodeUriComponent('a%3Db')).toBe('a=b'));
  it('encodeFormData basic', () => {
    expect(encodeFormData({ key: 'val', foo: 'bar' })).toBe('key=val&foo=bar');
  });
  it('encodeFormData encodes spaces', () => {
    expect(encodeFormData({ name: 'John Doe' })).toBe('name=John%20Doe');
  });
  it('decodeFormData basic', () => {
    expect(decodeFormData('key=val&foo=bar')).toEqual({ key: 'val', foo: 'bar' });
  });
  it('decodeFormData handles +', () => {
    expect(decodeFormData('name=John+Doe')).toEqual({ name: 'John Doe' });
  });
  it('decodeFormData empty', () => expect(decodeFormData('')).toEqual({}));
  it('encodeFormData / decodeFormData roundtrip', () => {
    const obj = { a: 'hello world', b: 'foo&bar=baz' };
    expect(decodeFormData(encodeFormData(obj))).toEqual(obj);
  });
});

// ─── Correctness tests — HTML ─────────────────────────────────────────────────

describe('HTML entity correctness', () => {
  it('encodeHtml encodes &', () => expect(encodeHtml('&')).toBe('&amp;'));
  it('encodeHtml encodes <', () => expect(encodeHtml('<')).toBe('&lt;'));
  it('encodeHtml encodes >', () => expect(encodeHtml('>')).toBe('&gt;'));
  it('encodeHtml encodes "', () => expect(encodeHtml('"')).toBe('&quot;'));
  it('encodeHtml encodes \'', () => expect(encodeHtml("'")).toBe('&#39;'));
  it('encodeHtml multiple', () => expect(encodeHtml('<b>bold & "strong"</b>')).toBe('&lt;b&gt;bold &amp; &quot;strong&quot;&lt;/b&gt;'));
  it('decodeHtml decodes &amp;', () => expect(decodeHtml('&amp;')).toBe('&'));
  it('decodeHtml decodes &lt;', () => expect(decodeHtml('&lt;')).toBe('<'));
  it('decodeHtml decodes &gt;', () => expect(decodeHtml('&gt;')).toBe('>'));
  it('decodeHtml decodes &quot;', () => expect(decodeHtml('&quot;')).toBe('"'));
  it('decodeHtml decodes &#39;', () => expect(decodeHtml('&#39;')).toBe("'"));
  it('decodeHtml decodes &apos;', () => expect(decodeHtml('&apos;')).toBe("'"));
  it('stripHtmlTags removes tags', () => expect(stripHtmlTags('<b>bold</b>')).toBe('bold'));
  it('stripHtmlTags handles nested', () => expect(stripHtmlTags('<div><p>text</p></div>')).toBe('text'));
  it('stripHtmlTags no tags', () => expect(stripHtmlTags('plain text')).toBe('plain text'));
  it('stripHtmlTags empty', () => expect(stripHtmlTags('')).toBe(''));
});

// ─── Correctness tests — Ciphers ─────────────────────────────────────────────

describe('Cipher correctness', () => {
  it('rot13 "Hello"', () => expect(rot13('Hello')).toBe('Uryyb'));
  it('rot13 "Uryyb"', () => expect(rot13('Uryyb')).toBe('Hello'));
  it('rot13 leaves non-alpha', () => expect(rot13('123!?')).toBe('123!?'));
  it('rot13 uppercase', () => expect(rot13('ABC')).toBe('NOP'));
  it('rot13 lowercase', () => expect(rot13('xyz')).toBe('klm'));
  it('rot47 involution "Hello!"', () => expect(rot47(rot47('Hello!'))).toBe('Hello!'));
  it('rot47 transforms printable', () => expect(rot47('Hello!')).not.toBe('Hello!'));
  it('rot47 leaves non-printable (space vs 0x20)', () => {
    // space (0x20=32) is below 33 and not in ROT47 range, but our range includes 33..126
    // space char code 32 is not in [33-126], so it stays
    expect(rot47(' ')).toBe(' ');
  });
  it('reverseString "hello"', () => expect(reverseString('hello')).toBe('olleh'));
  it('reverseString empty', () => expect(reverseString('')).toBe(''));
  it('reverseString single char', () => expect(reverseString('a')).toBe('a'));
  it('reverseString palindrome', () => expect(reverseString('racecar')).toBe('racecar'));
  it('toBinary "A"', () => expect(toBinary('A')).toBe('01000001'));
  it('toBinary "AB"', () => expect(toBinary('AB')).toBe('01000001 01000010'));
  it('fromBinary "01000001"', () => expect(fromBinary('01000001')).toBe('A'));
  it('toBinary empty', () => expect(toBinary('')).toBe(''));
  it('fromBinary empty', () => expect(fromBinary('')).toBe(''));
});

// ─── Correctness tests — Hashing ─────────────────────────────────────────────

describe('Hashing correctness', () => {
  it('sha256 known value', () => {
    expect(sha256('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });
  it('sha256 empty string', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
  it('sha512 returns 128-char hex', () => {
    expect(sha512('hello').length).toBe(128);
  });
  it('md5 known value', () => {
    expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  it('hash sha1', () => {
    expect(hash('hello', 'sha1')).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });
  it('hmac deterministic', () => {
    const r = hmac('message', 'key');
    expect(r).toBe(hmac('message', 'key'));
    expect(typeof r).toBe('string');
    expect(r.length).toBe(64); // sha256 = 32 bytes = 64 hex chars
  });
  it('hmac sha512', () => {
    expect(hmac('msg', 'secret', 'sha512').length).toBe(128);
  });
  it('hmac differs with different secrets', () => {
    expect(hmac('msg', 'a')).not.toBe(hmac('msg', 'b'));
  });
  it('checksum type', () => {
    expect(typeof checksum('hello')).toBe('number');
  });
  it('checksum known value for empty string', () => {
    expect(checksum('')).toBe(0);
  });
  it('checksum deterministic', () => {
    expect(checksum('hello world')).toBe(checksum('hello world'));
  });
  it('checksum different inputs differ', () => {
    expect(checksum('hello')).not.toBe(checksum('world'));
  });
  it('checksum accepts Buffer', () => {
    expect(checksum(Buffer.from('hello'))).toBe(checksum('hello'));
  });
});

// ─── Correctness tests — Utility ─────────────────────────────────────────────

describe('Utility correctness', () => {
  it('bytesToHuman 0', () => expect(bytesToHuman(0)).toBe('0 B'));
  it('bytesToHuman 1023', () => expect(bytesToHuman(1023)).toBe('1023 B'));
  it('bytesToHuman 1024', () => expect(bytesToHuman(1024)).toBe('1.00 KB'));
  it('bytesToHuman 1048576', () => expect(bytesToHuman(1048576)).toBe('1.00 MB'));
  it('bytesToHuman 1073741824', () => expect(bytesToHuman(1073741824)).toBe('1.00 GB'));
  it('bytesToHuman 1536', () => expect(bytesToHuman(1536)).toBe('1.50 KB'));
  it('bytesToHuman throws on negative', () => {
    expect(() => bytesToHuman(-1)).toThrow(RangeError);
  });
  it('isAscii true for plain ASCII', () => expect(isAscii('hello')).toBe(true));
  it('isAscii true for empty', () => expect(isAscii('')).toBe(true));
  it('isAscii false for unicode', () => expect(isAscii('café')).toBe(false));
  it('isAscii false for emoji', () => expect(isAscii('hi 😀')).toBe(false));
  it('isPrintable true for printable', () => expect(isPrintable('Hello World!')).toBe(true));
  it('isPrintable false for tab', () => expect(isPrintable('\t')).toBe(false));
  it('isPrintable false for newline', () => expect(isPrintable('\n')).toBe(false));
  it('isPrintable true for empty', () => expect(isPrintable('')).toBe(true));
  it('countBytes ASCII', () => expect(countBytes('hello')).toBe(5));
  it('countBytes empty', () => expect(countBytes('')).toBe(0));
  it('countBytes multibyte', () => expect(countBytes('café')).toBe(5)); // 'é' = 2 bytes
  it('countBytes emoji', () => expect(countBytes('😀')).toBe(4)); // emoji = 4 bytes
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('toBase64 / fromBase64 Buffer input', () => {
    const buf = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe]);
    expect(fromBase64(toBase64(buf))).toBe(buf.toString('utf8'));
  });
  it('toHex / fromHex null bytes', () => {
    const s = '\x00\x01\x02';
    expect(fromHex(toHex(s))).toBe(s);
  });
  it('isValidBase64 empty string', () => expect(isValidBase64('')).toBe(true));
  it('isValidBase64Url empty string', () => expect(isValidBase64Url('')).toBe(true));
  it('isValidHex only zeros', () => expect(isValidHex('0000')).toBe(true));
  it('rot13 empty', () => expect(rot13('')).toBe(''));
  it('rot47 empty', () => expect(rot47('')).toBe(''));
  it('reverseString with spaces', () => expect(reverseString('a b c')).toBe('c b a'));
  it('encodeHtml empty', () => expect(encodeHtml('')).toBe(''));
  it('decodeHtml empty', () => expect(decodeHtml('')).toBe(''));
  it('stripHtmlTags self-closing', () => expect(stripHtmlTags('<br/>')).toBe(''));
  it('encodeFormData empty object', () => expect(encodeFormData({})).toBe(''));
  it('sha256 different inputs differ', () => expect(sha256('a')).not.toBe(sha256('b')));
  it('md5 empty string', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
  it('checksum returns 32-bit unsigned', () => {
    const c = checksum('test');
    expect(c).toBeGreaterThanOrEqual(0);
    expect(c).toBeLessThanOrEqual(0xffffffff);
  });
  it('isAscii all 7-bit chars', () => {
    const allAscii = Array.from({ length: 128 }, (_, i) => String.fromCharCode(i)).join('');
    expect(isAscii(allAscii)).toBe(true);
  });
  it('isPrintable false for char 127 (DEL)', () => expect(isPrintable('\x7f')).toBe(false));
  it('bytesToHuman 500 bytes', () => expect(bytesToHuman(500)).toBe('500 B'));
  it('toHexBytes empty', () => expect(toHexBytes('')).toEqual([]));
  it('fromBinary handles extra whitespace', () => {
    expect(fromBinary(' 01000001 ')).toBe('A');
  });
});
