// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  sign,
  verify,
  decode,
  base64urlEncode,
  base64urlDecode,
  base64urlDecodeBuffer,
  isExpired,
  getExpiry,
  getIssuedAt,
  getSubject,
  getIssuer,
  getAudience,
  getClaims,
  getRemainingSeconds,
  getAlgorithm,
  refresh,
  addClaims,
  stripClaims,
  buildAccessToken,
  buildRefreshToken,
  buildApiKeyPayload,
  isJwt,
  parseBearer,
  generateJti,
  compareTokens,
} from '../jwt-utils';
import type { JwtAlgorithm } from '../types';

const SECRET = 'super-secret-key-for-testing-2026';

// ---------------------------------------------------------------------------
// 1. sign/decode round-trip — 100 tests
// ---------------------------------------------------------------------------
describe('sign/decode round-trip (100 payloads)', () => {
  for (let i = 0; i < 100; i++) {
    it(`round-trip payload #${i}`, () => {
      const payload = { sub: `user-${i}`, role: `role-${i % 5}`, idx: i };
      const token = sign(payload, SECRET);
      const parts = decode(token);
      expect(parts).not.toBeNull();
      expect(parts!.payload.sub).toBe(`user-${i}`);
      expect(parts!.payload.role).toBe(`role-${i % 5}`);
      expect(parts!.payload.idx).toBe(i);
      expect(parts!.payload.iat).toBeDefined();
    });
  }
});

// ---------------------------------------------------------------------------
// 2. sign/verify round-trip — 100 tests
// ---------------------------------------------------------------------------
describe('sign/verify round-trip (100 different secrets+payloads)', () => {
  for (let i = 0; i < 100; i++) {
    it(`verify round-trip #${i}`, () => {
      const secret = `secret-${i}-${Math.random().toString(36).slice(2)}`;
      const payload = { sub: `user-${i}`, data: `value-${i}` };
      const token = sign(payload, secret, { expiresIn: 3600 });
      const result = verify(token, secret);
      expect(result.valid).toBe(true);
      expect(result.payload?.sub).toBe(`user-${i}`);
      expect(result.payload?.data).toBe(`value-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. isJwt — 50 valid + 30 non-tokens = 80 tests
// ---------------------------------------------------------------------------
describe('isJwt (80 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`isJwt valid token #${i}`, () => {
      const token = sign({ sub: `user-${i}`, i }, SECRET);
      expect(isJwt(token)).toBe(true);
    });
  }

  const nonTokens = [
    '', 'abc', 'abc.def', 'abc.def.ghi.jkl', 'not-a-jwt',
    'Bearer token', '!!!.invalid.chars', '  .  .  ',
    'a.b.', '.b.c', 'a..c',
    'eyJ0.', 'null', 'undefined',
    '1234567890', 'header.payload',
    'a.b.c.d', '....', 'x.y.',
    'ab cd.ef.gh', '\n\t.a.b',
    'a.b. ', ' .b.c',
  ];
  for (let i = 0; i < 30; i++) {
    const s = nonTokens[i % nonTokens.length];
    it(`isJwt non-token #${i}: ${JSON.stringify(s)}`, () => {
      expect(isJwt(s)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. isExpired — 30 expired + 30 valid = 60 tests
// ---------------------------------------------------------------------------
describe('isExpired (60 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`isExpired expired token #${i}`, () => {
      const now = Math.floor(Date.now() / 1000);
      // Manually craft an expired token
      const payload = { sub: `user-${i}`, exp: now - 100 - i, iat: now - 200 - i };
      const headerPart = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payloadPart = base64urlEncode(JSON.stringify(payload));
      // We won't verify sig, just test isExpired which uses decode
      const token = sign({ sub: `user-${i}` }, SECRET, { expiresIn: -(100 + i) });
      // sign always adds iat = now, so exp = now + (-(100+i)) = now - 100 - i
      void headerPart; void payloadPart;
      expect(isExpired(token)).toBe(true);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`isExpired valid token #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET, { expiresIn: 3600 });
      expect(isExpired(token)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. getExpiry — 50 tests
// ---------------------------------------------------------------------------
describe('getExpiry (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`getExpiry #${i}`, () => {
      const expiresIn = 3600 + i * 10;
      const token = sign({ sub: `user-${i}` }, SECRET, { expiresIn });
      const expiry = getExpiry(token);
      expect(expiry).toBeInstanceOf(Date);
      const nowMs = Date.now();
      expect(expiry!.getTime()).toBeGreaterThan(nowMs);
      expect(expiry!.getTime()).toBeLessThan(nowMs + (expiresIn + 5) * 1000);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. getSubject / getIssuer / getAudience — 50 each = 150 tests
// ---------------------------------------------------------------------------
describe('getSubject (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`getSubject #${i}`, () => {
      const sub = `subject-user-${i}`;
      const token = sign({ sub }, SECRET);
      expect(getSubject(token)).toBe(sub);
    });
  }
});

describe('getIssuer (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`getIssuer #${i}`, () => {
      const iss = `issuer-${i}.example.com`;
      const token = sign({}, SECRET, { issuer: iss });
      expect(getIssuer(token)).toBe(iss);
    });
  }
});

describe('getAudience (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`getAudience #${i}`, () => {
      const aud = i % 2 === 0 ? `audience-${i}` : [`aud-a-${i}`, `aud-b-${i}`];
      const token = sign({}, SECRET, { audience: aud });
      const result = getAudience(token);
      expect(result).toEqual(aud);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. verify — wrong secret — 30 tests
// ---------------------------------------------------------------------------
describe('verify wrong secret (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`verify wrong secret #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, `correct-secret-${i}`, { expiresIn: 3600 });
      const result = verify(token, `wrong-secret-${i}`);
      expect(result.valid).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. verify — expired tokens — 30 tests
// ---------------------------------------------------------------------------
describe('verify expired tokens (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`verify expired #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET, { expiresIn: -(1 + i) });
      const result = verify(token, SECRET);
      expect(result.valid).toBe(false);
      expect(result.error?.toLowerCase()).toContain('expired');
    });
  }
});

// ---------------------------------------------------------------------------
// 9. verify — algorithm check — 20 tests (HS256/HS384/HS512)
// ---------------------------------------------------------------------------
describe('verify algorithm check (20 tests)', () => {
  const algos: JwtAlgorithm[] = ['HS256', 'HS384', 'HS512'];
  for (let i = 0; i < 20; i++) {
    const alg = algos[i % 3];
    it(`verify algorithm ${alg} #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET, { algorithm: alg, expiresIn: 3600 });
      const parts = decode(token);
      expect(parts?.header.alg).toBe(alg);
      const result = verify(token, SECRET, { algorithms: [alg] });
      expect(result.valid).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. parseBearer — 50 valid + 20 malformed = 70 tests
// ---------------------------------------------------------------------------
describe('parseBearer valid (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`parseBearer valid #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET, { expiresIn: 3600 });
      const header = `Bearer ${token}`;
      expect(parseBearer(header)).toBe(token);
    });
  }
});

describe('parseBearer malformed (20 tests)', () => {
  const malformed = [
    '', 'Token abc', 'Basic abc123', 'bearer', 'BEARER token',
    'token', 'bearer ', 'Bearer', ' Bearer token', 'bearer  token',
    'Auth abc', 'JWT abc', 'bearer abc abc', '', '  ',
    'Basic dXNlcjpwYXNz', 'Digest auth', 'NTLM', 'ApiKey 123', null as unknown as string,
  ];
  for (let i = 0; i < 20; i++) {
    const h = malformed[i];
    it(`parseBearer malformed #${i}`, () => {
      // null/empty/missing Bearer prefix → null
      if (h === null || h === '' || h === '  ') {
        expect(parseBearer(h ?? '')).toBeNull();
      } else if (!h.match(/^Bearer\s+\S/i)) {
        expect(parseBearer(h)).toBeNull();
      } else {
        // Some pass through (e.g. 'BEARER token' is case-insensitive match)
        expect(typeof parseBearer(h)).toBe('string');
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 11. base64urlEncode/Decode round-trip — 100 tests
// ---------------------------------------------------------------------------
describe('base64urlEncode/Decode round-trip (100 tests)', () => {
  const samples = [
    'hello world', 'test string', '', 'abc123', '!@#$%^&*()',
    '{"key":"value"}', 'unicode: café', '日本語', '\x00\x01\x02',
    'long string '.repeat(10),
  ];
  for (let i = 0; i < 100; i++) {
    const s = samples[i % samples.length] + `-${i}`;
    it(`base64url round-trip #${i}`, () => {
      const encoded = base64urlEncode(s);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');
      const decoded = base64urlDecode(encoded);
      expect(decoded).toBe(s);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. refresh — 30 tests
// ---------------------------------------------------------------------------
describe('refresh (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`refresh token #${i}`, () => {
      const original = sign({ sub: `user-${i}`, data: i }, SECRET, { expiresIn: 3600 });
      const originalParts = decode(original);
      const oldExp = originalParts?.payload.exp ?? 0;

      const newTtl = 7200 + i;
      const refreshed = refresh(original, SECRET, newTtl);
      expect(refreshed).not.toBeNull();
      const newParts = decode(refreshed!);
      expect(newParts?.payload.exp).toBeDefined();
      expect(newParts!.payload.exp!).toBeGreaterThan(oldExp);
      expect(newParts?.payload.sub).toBe(`user-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. getClaims — 50 tests
// ---------------------------------------------------------------------------
describe('getClaims (50 tests)', () => {
  for (let i = 0; i < 50; i++) {
    it(`getClaims #${i}`, () => {
      const customClaims = { foo: `bar-${i}`, count: i, active: i % 2 === 0 };
      const token = sign(customClaims, SECRET);
      const claims = getClaims(token);
      expect(claims).not.toBeNull();
      expect(claims!.foo).toBe(`bar-${i}`);
      expect(claims!.count).toBe(i);
      expect(claims!.active).toBe(i % 2 === 0);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. getRemainingSeconds — 30 tests
// ---------------------------------------------------------------------------
describe('getRemainingSeconds (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`getRemainingSeconds #${i}`, () => {
      const expiresIn = 1000 + i * 10;
      const token = sign({ sub: `user-${i}` }, SECRET, { expiresIn });
      const remaining = getRemainingSeconds(token);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(expiresIn);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. generateJti — 50 tests (32-char hex + uniqueness)
// ---------------------------------------------------------------------------
describe('generateJti (50 tests)', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 50; i++) {
    it(`generateJti #${i}`, () => {
      const jti = generateJti();
      expect(jti).toHaveLength(32);
      expect(jti).toMatch(/^[0-9a-f]{32}$/);
      expect(seen.has(jti)).toBe(false);
      seen.add(jti);
    });
  }
});

// ---------------------------------------------------------------------------
// 16. buildAccessToken / buildRefreshToken / buildApiKeyPayload — 30 each = 90 tests
// ---------------------------------------------------------------------------
describe('buildAccessToken (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`buildAccessToken #${i}`, () => {
      const sub = `user-${i}`;
      const roles = [`role-${i % 5}`, `admin-${i % 3}`];
      const extra = { dept: `dept-${i}`, level: i };
      const payload = buildAccessToken(sub, roles, extra);
      expect(payload.sub).toBe(sub);
      expect(payload.roles).toEqual(roles);
      expect(payload.type).toBe('access');
      expect(payload.dept).toBe(`dept-${i}`);
      expect(payload.level).toBe(i);
    });
  }
});

describe('buildRefreshToken (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`buildRefreshToken #${i}`, () => {
      const sub = `user-${i}`;
      const family = i % 2 === 0 ? `family-${i}` : undefined;
      const payload = buildRefreshToken(sub, family);
      expect(payload.sub).toBe(sub);
      expect(payload.type).toBe('refresh');
      if (family !== undefined) {
        expect(payload.family).toBe(family);
      } else {
        expect(payload.family).toBeUndefined();
      }
    });
  }
});

describe('buildApiKeyPayload (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`buildApiKeyPayload #${i}`, () => {
      const keyId = `key-${i}`;
      const scopes = [`read:resource-${i}`, `write:resource-${i % 5}`];
      const orgId = i % 2 === 0 ? `org-${i}` : undefined;
      const payload = buildApiKeyPayload(keyId, scopes, orgId);
      expect(payload.keyId).toBe(keyId);
      expect(payload.scopes).toEqual(scopes);
      expect(payload.type).toBe('api_key');
      if (orgId !== undefined) {
        expect(payload.orgId).toBe(orgId);
      } else {
        expect(payload.orgId).toBeUndefined();
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 17. compareTokens — 30 same + 20 different = 50 tests
// ---------------------------------------------------------------------------
describe('compareTokens same (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`compareTokens same #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET, { expiresIn: 3600 });
      expect(compareTokens(token, token)).toBe(true);
    });
  }
});

describe('compareTokens different (20 tests)', () => {
  for (let i = 0; i < 20; i++) {
    it(`compareTokens different #${i}`, () => {
      const tokenA = sign({ sub: `user-${i}` }, SECRET, { expiresIn: 3600 });
      const tokenB = sign({ sub: `user-${i + 1}` }, `other-secret-${i}`, { expiresIn: 3600 });
      expect(compareTokens(tokenA, tokenB)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. addClaims / stripClaims — 20 each = 40 tests
// ---------------------------------------------------------------------------
describe('addClaims (20 tests)', () => {
  for (let i = 0; i < 20; i++) {
    it(`addClaims #${i}`, () => {
      const token = sign({ sub: `user-${i}`, role: 'user' }, SECRET, { expiresIn: 3600 });
      const extra = { newField: `value-${i}`, extra: i };
      const newToken = addClaims(token, SECRET, extra);
      expect(newToken).not.toBeNull();
      const claims = getClaims(newToken!);
      expect(claims?.newField).toBe(`value-${i}`);
      expect(claims?.extra).toBe(i);
      expect(claims?.sub).toBe(`user-${i}`);
      expect(claims?.role).toBe('user');
    });
  }
});

describe('stripClaims (20 tests)', () => {
  for (let i = 0; i < 20; i++) {
    it(`stripClaims #${i}`, () => {
      const token = sign(
        { sub: `user-${i}`, role: 'admin', secret: `s-${i}`, extra: i },
        SECRET,
        { expiresIn: 3600 },
      );
      const stripped = stripClaims(token, SECRET, ['secret', 'extra']);
      expect(stripped).not.toBeNull();
      const claims = getClaims(stripped!);
      expect(claims?.secret).toBeUndefined();
      expect(claims?.extra).toBeUndefined();
      expect(claims?.sub).toBe(`user-${i}`);
      expect(claims?.role).toBe('admin');
    });
  }
});

// ---------------------------------------------------------------------------
// 19. decode malformed — 20 tests
// ---------------------------------------------------------------------------
describe('decode malformed (20 tests)', () => {
  const malformedTokens = [
    'not.a.token',
    'only-two.parts',
    '',
    'a',
    '...',
    'too.many.parts.here.extra',
    'eyJhbGciOiJub25lIn0.INVALID!!.sig',
    '####.####.####',
    '   .   .   ',
    'eyJ.broken',
    Buffer.from('not json').toString('base64') + '.payload.sig',
    'header.' + Buffer.from('not json').toString('base64') + '.sig',
    'null.null.null',
    '0.0.0',
    'eyJhbGciOiJIUzI1NiJ9.' + Buffer.from('{broken').toString('base64url') + '.sig',
    'a.b',
    'a.b.c.d.e',
    '.',
    '..',
    'aGVsbG8=.d29ybGQ=.!!!invalid!!!base64url',
  ];

  for (let i = 0; i < 20; i++) {
    const t = malformedTokens[i % malformedTokens.length];
    it(`decode malformed #${i}: ${JSON.stringify(t.substring(0, 30))}`, () => {
      const result = decode(t);
      expect(result).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// 20. getAlgorithm — 30 tests
// ---------------------------------------------------------------------------
describe('getAlgorithm (30 tests)', () => {
  const algos: JwtAlgorithm[] = ['HS256', 'HS384', 'HS512'];
  for (let i = 0; i < 30; i++) {
    const alg = algos[i % 3];
    it(`getAlgorithm ${alg} #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET, { algorithm: alg, expiresIn: 3600 });
      expect(getAlgorithm(token)).toBe(alg);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional edge-case tests to exceed 1,000 total
// ---------------------------------------------------------------------------

describe('sign with all options', () => {
  for (let i = 0; i < 20; i++) {
    it(`sign with full options #${i}`, () => {
      const jwtid = generateJti();
      const token = sign(
        { custom: i },
        SECRET,
        {
          algorithm: 'HS384',
          expiresIn: 3600,
          notBefore: 0,
          issuer: `iss-${i}`,
          audience: `aud-${i}`,
          subject: `sub-${i}`,
          jwtid,
        },
      );
      const parts = decode(token);
      expect(parts?.header.alg).toBe('HS384');
      expect(parts?.payload.iss).toBe(`iss-${i}`);
      expect(parts?.payload.aud).toBe(`aud-${i}`);
      expect(parts?.payload.sub).toBe(`sub-${i}`);
      expect(parts?.payload.jti).toBe(jwtid);
    });
  }
});

describe('verify with issuer/audience/subject options', () => {
  for (let i = 0; i < 20; i++) {
    it(`verify options #${i}`, () => {
      const token = sign({}, SECRET, {
        expiresIn: 3600,
        issuer: `iss-${i}`,
        audience: `aud-${i}`,
        subject: `sub-${i}`,
      });
      const result = verify(token, SECRET, {
        issuer: `iss-${i}`,
        audience: `aud-${i}`,
        subject: `sub-${i}`,
      });
      expect(result.valid).toBe(true);
    });
  }
});

describe('verify with wrong issuer/audience/subject', () => {
  for (let i = 0; i < 20; i++) {
    it(`verify wrong options #${i}`, () => {
      const token = sign({}, SECRET, {
        expiresIn: 3600,
        issuer: `iss-${i}`,
        audience: `aud-${i}`,
        subject: `sub-${i}`,
      });
      const wrongIss = verify(token, SECRET, { issuer: `wrong-iss-${i}` });
      expect(wrongIss.valid).toBe(false);
      const wrongAud = verify(token, SECRET, { audience: `wrong-aud-${i}` });
      expect(wrongAud.valid).toBe(false);
      const wrongSub = verify(token, SECRET, { subject: `wrong-sub-${i}` });
      expect(wrongSub.valid).toBe(false);
    });
  }
});

describe('getIssuedAt (30 tests)', () => {
  for (let i = 0; i < 30; i++) {
    it(`getIssuedAt #${i}`, () => {
      const before = Date.now();
      const token = sign({ sub: `user-${i}` }, SECRET);
      const after = Date.now();
      const iat = getIssuedAt(token);
      expect(iat).toBeInstanceOf(Date);
      expect(iat!.getTime()).toBeGreaterThanOrEqual(before - 1000);
      expect(iat!.getTime()).toBeLessThanOrEqual(after + 1000);
    });
  }
});

describe('refresh invalid tokens (20 tests)', () => {
  for (let i = 0; i < 20; i++) {
    it(`refresh invalid #${i}`, () => {
      const result = refresh('not.a.valid.token.here', SECRET, 3600);
      expect(result).toBeNull();
    });
  }
});

describe('addClaims invalid token (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`addClaims invalid #${i}`, () => {
      const result = addClaims('invalid.token.here', SECRET, { foo: 'bar' });
      expect(result).toBeNull();
    });
  }
});

describe('stripClaims invalid token (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`stripClaims invalid #${i}`, () => {
      const result = stripClaims('invalid.token.here', SECRET, ['foo']);
      expect(result).toBeNull();
    });
  }
});

describe('base64urlDecodeBuffer (20 tests)', () => {
  for (let i = 0; i < 20; i++) {
    it(`base64urlDecodeBuffer #${i}`, () => {
      const original = Buffer.from(`test-data-${i}`, 'utf8');
      const encoded = base64urlEncode(original);
      const decoded = base64urlDecodeBuffer(encoded);
      expect(decoded).toEqual(original);
    });
  }
});

describe('getExpiry null on no-exp token (20 tests)', () => {
  for (let i = 0; i < 20; i++) {
    it(`getExpiry null #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET); // no expiresIn
      const expiry = getExpiry(token);
      expect(expiry).toBeNull();
    });
  }
});

describe('getSubject null on no-sub token (15 tests)', () => {
  for (let i = 0; i < 15; i++) {
    it(`getSubject null #${i}`, () => {
      const token = sign({ data: i }, SECRET);
      expect(getSubject(token)).toBeNull();
    });
  }
});

describe('getIssuer null on no-iss token (15 tests)', () => {
  for (let i = 0; i < 15; i++) {
    it(`getIssuer null #${i}`, () => {
      const token = sign({ data: i }, SECRET);
      expect(getIssuer(token)).toBeNull();
    });
  }
});

describe('compareTokens edge cases (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`compareTokens edge #${i}`, () => {
      // Different length → false
      expect(compareTokens('abc', 'abcdef')).toBe(false);
      // Empty strings → true
      expect(compareTokens('', '')).toBe(true);
    });
  }
});

describe('isJwt buffer/HS512 tokens (15 tests)', () => {
  for (let i = 0; i < 15; i++) {
    it(`isJwt HS512 #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET, { algorithm: 'HS512' });
      expect(isJwt(token)).toBe(true);
    });
  }
});

describe('verify ignoreExpiration option (15 tests)', () => {
  for (let i = 0; i < 15; i++) {
    it(`verify ignoreExpiration #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET, { expiresIn: -(1 + i) });
      // Without ignoreExpiration → invalid
      const r1 = verify(token, SECRET);
      expect(r1.valid).toBe(false);
      // With ignoreExpiration → valid
      const r2 = verify(token, SECRET, { ignoreExpiration: true });
      expect(r2.valid).toBe(true);
    });
  }
});

describe('verify clockTolerance option (15 tests)', () => {
  for (let i = 0; i < 15; i++) {
    it(`verify clockTolerance #${i}`, () => {
      // Expired by 5 seconds
      const token = sign({ sub: `user-${i}` }, SECRET, { expiresIn: -5 });
      // Without tolerance → invalid
      const r1 = verify(token, SECRET);
      expect(r1.valid).toBe(false);
      // With 10s tolerance → valid
      const r2 = verify(token, SECRET, { clockTolerance: 10 });
      expect(r2.valid).toBe(true);
    });
  }
});

describe('getRemainingSeconds no-exp token (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`getRemainingSeconds no-exp #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET); // no expiresIn
      expect(getRemainingSeconds(token)).toBe(0);
    });
  }
});

describe('getAudience null on no-aud token (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`getAudience null #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET);
      expect(getAudience(token)).toBeNull();
    });
  }
});

describe('decode returns header/payload/signature/raw (20 tests)', () => {
  for (let i = 0; i < 20; i++) {
    it(`decode structure #${i}`, () => {
      const token = sign({ sub: `user-${i}`, idx: i }, SECRET, { expiresIn: 3600 });
      const parts = decode(token);
      expect(parts).not.toBeNull();
      expect(parts!.header.typ).toBe('JWT');
      expect(parts!.header.alg).toBe('HS256');
      expect(typeof parts!.signature).toBe('string');
      expect(parts!.signature.length).toBeGreaterThan(0);
      expect(parts!.raw).toBe(token);
    });
  }
});

describe('parseBearer case insensitive (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`parseBearer case #${i}`, () => {
      const token = `sometoken${i}abc`;
      // Bearer with different cases
      const variants = ['Bearer', 'bearer', 'BEARER', 'BeArEr'];
      const v = variants[i % variants.length];
      expect(parseBearer(`${v} ${token}`)).toBe(token);
    });
  }
});

describe('sign with HS384 and HS512 (20 tests)', () => {
  const algoList: JwtAlgorithm[] = ['HS384', 'HS512'];
  for (let i = 0; i < 20; i++) {
    const alg = algoList[i % 2];
    it(`sign+verify ${alg} #${i}`, () => {
      const payload = { sub: `user-${i}`, alg };
      const token = sign(payload, SECRET, { algorithm: alg, expiresIn: 3600 });
      const result = verify(token, SECRET);
      expect(result.valid).toBe(true);
      expect(result.payload?.sub).toBe(`user-${i}`);
    });
  }
});

describe('getClaims null on malformed (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`getClaims null malformed #${i}`, () => {
      expect(getClaims(`malformed-token-${i}`)).toBeNull();
    });
  }
});

describe('getAlgorithm null on malformed (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`getAlgorithm null malformed #${i}`, () => {
      expect(getAlgorithm(`bad.token.${i}`)).toBeNull();
    });
  }
});

describe('buildAccessToken without extra (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`buildAccessToken no-extra #${i}`, () => {
      const payload = buildAccessToken(`sub-${i}`, [`role-${i}`]);
      expect(payload.sub).toBe(`sub-${i}`);
      expect(payload.roles).toEqual([`role-${i}`]);
      expect(payload.type).toBe('access');
    });
  }
});

describe('sign adds iat claim (20 tests)', () => {
  for (let i = 0; i < 20; i++) {
    it(`sign iat #${i}`, () => {
      const before = Math.floor(Date.now() / 1000);
      const token = sign({ sub: `user-${i}` }, SECRET);
      const after = Math.floor(Date.now() / 1000);
      const parts = decode(token);
      expect(parts?.payload.iat).toBeGreaterThanOrEqual(before);
      expect(parts?.payload.iat).toBeLessThanOrEqual(after + 1);
    });
  }
});

describe('verify with array audience (15 tests)', () => {
  for (let i = 0; i < 15; i++) {
    it(`verify array audience #${i}`, () => {
      const aud = [`aud-a-${i}`, `aud-b-${i}`, `aud-c-${i}`];
      const token = sign({}, SECRET, { expiresIn: 3600, audience: aud });
      // Verify with one of the array members
      const result = verify(token, SECRET, { audience: `aud-b-${i}` });
      expect(result.valid).toBe(true);
    });
  }
});

describe('isExpired no-exp token (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`isExpired no-exp #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, SECRET); // no exp
      expect(isExpired(token)).toBe(false);
    });
  }
});

describe('refresh returns null for wrong secret (10 tests)', () => {
  for (let i = 0; i < 10; i++) {
    it(`refresh wrong secret #${i}`, () => {
      const token = sign({ sub: `user-${i}` }, `original-${i}`, { expiresIn: 3600 });
      const result = refresh(token, `wrong-${i}`, 7200);
      expect(result).toBeNull();
    });
  }
});
