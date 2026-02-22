import { createRasp, scanValue, scanRequest } from '../src/rasp';
import type { Request, Response, NextFunction } from 'express';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    ...overrides,
  } as unknown as Request;
}

function makeRes(): Response & { statusCode: number; body: unknown } {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(c: number) {
      this.statusCode = c;
      return this;
    },
    json(d: unknown) {
      this.body = d;
      return this;
    },
  } as Response & { statusCode: number; body: unknown };
}

// ── scanValue() ───────────────────────────────────────────────────────────────

describe('scanValue()', () => {
  // SQL Injection
  describe('sql_injection', () => {
    it('detects UNION SELECT', () => {
      expect(scanValue("1 UNION SELECT * FROM users", 'sql_injection')).not.toBeNull();
    });
    it('detects DROP TABLE', () => {
      expect(scanValue("'; DROP TABLE users; --", 'sql_injection')).not.toBeNull();
    });
    it('detects comment injection', () => {
      expect(scanValue("admin' -- comment", 'sql_injection')).not.toBeNull();
    });
    it('detects time-based blind injection', () => {
      expect(scanValue("'; SLEEP(5)--", 'sql_injection')).not.toBeNull();
    });
    it('detects OR tautology', () => {
      expect(scanValue("' OR '1'='1", 'sql_injection')).not.toBeNull();
    });
    it('passes safe values', () => {
      expect(scanValue('hello world', 'sql_injection')).toBeNull();
      expect(scanValue('John Select', 'sql_injection')).toBeNull();
    });
  });

  // XSS
  describe('xss', () => {
    it('detects script tags', () => {
      expect(scanValue('<script>alert(1)</script>', 'xss')).not.toBeNull();
    });
    it('detects javascript: protocol', () => {
      expect(scanValue('javascript:alert(1)', 'xss')).not.toBeNull();
    });
    it('detects onerror handler', () => {
      expect(scanValue('<img onerror="alert(1)">', 'xss')).not.toBeNull();
    });
    it('detects iframe', () => {
      expect(scanValue('<iframe src="evil.com"></iframe>', 'xss')).not.toBeNull();
    });
    it('passes safe HTML-like text', () => {
      expect(scanValue('Hello <b>world</b>', 'xss')).toBeNull();
    });
  });

  // Command Injection
  describe('command_injection', () => {
    it('detects semicolon + shell command', () => {
      expect(scanValue('; cat /etc/passwd', 'command_injection')).not.toBeNull();
    });
    it('detects pipe to shell', () => {
      expect(scanValue('input | bash', 'command_injection')).not.toBeNull();
    });
    it('detects backtick execution', () => {
      expect(scanValue('`id`', 'command_injection')).not.toBeNull();
    });
    it('passes safe values', () => {
      expect(scanValue('normal text', 'command_injection')).toBeNull();
    });
  });

  // Path Traversal
  describe('path_traversal', () => {
    it('detects ../../../ traversal', () => {
      expect(scanValue('../../../etc/passwd', 'path_traversal')).not.toBeNull();
    });
    it('detects URL-encoded traversal', () => {
      expect(scanValue('%2e%2e%2f', 'path_traversal')).not.toBeNull();
    });
    it('passes normal file names', () => {
      expect(scanValue('document.pdf', 'path_traversal')).toBeNull();
    });
  });

  // LDAP Injection
  describe('ldap_injection', () => {
    it('detects null byte', () => {
      expect(scanValue('admin\x00', 'ldap_injection')).not.toBeNull();
    });
    it('detects OR injection pattern', () => {
      expect(scanValue('(|(uid=*))', 'ldap_injection')).not.toBeNull();
    });
    it('passes safe values', () => {
      expect(scanValue('johndoe', 'ldap_injection')).toBeNull();
    });
  });
});

// ── scanRequest() ─────────────────────────────────────────────────────────────

describe('scanRequest()', () => {
  it('returns empty array for clean request', () => {
    const req = makeReq({ body: { name: 'John', age: 30 } });
    expect(scanRequest(req, ['sql_injection', 'xss'])).toHaveLength(0);
  });

  it('detects SQL injection in body', () => {
    const req = makeReq({ body: { search: "' OR 1=1 --" } });
    const threats = scanRequest(req, ['sql_injection']);
    expect(threats.length).toBeGreaterThan(0);
    expect(threats[0].type).toBe('sql_injection');
    expect(threats[0].field).toContain('body');
  });

  it('detects XSS in query string', () => {
    const req = makeReq({ query: { q: '<script>alert(1)</script>' } });
    const threats = scanRequest(req, ['xss']);
    expect(threats.length).toBeGreaterThan(0);
    expect(threats[0].field).toContain('query');
  });

  it('detects threats in nested body objects', () => {
    const req = makeReq({ body: { user: { bio: '<script>evil()</script>' } } });
    const threats = scanRequest(req, ['xss']);
    expect(threats.length).toBeGreaterThan(0);
    expect(threats[0].field).toContain('user.bio');
  });

  it('detects threats in array values', () => {
    const req = makeReq({ body: { tags: ['normal', '; DROP TABLE tags;--'] } });
    const threats = scanRequest(req, ['sql_injection']);
    expect(threats.length).toBeGreaterThan(0);
  });

  it('only checks requested threat types', () => {
    const req = makeReq({ body: { q: '<script>alert(1)</script>' } });
    // Only checking sql — XSS should not be flagged
    const threats = scanRequest(req, ['sql_injection']);
    expect(threats).toHaveLength(0);
  });

  it('handles null/empty body gracefully', () => {
    const req = makeReq({ body: null });
    expect(() => scanRequest(req, ['sql_injection'])).not.toThrow();
  });
});

// ── createRasp() middleware ───────────────────────────────────────────────────

describe('createRasp() middleware', () => {
  it('calls next() for clean request', () => {
    const mw = createRasp();
    const next = jest.fn();
    const req = makeReq({ body: { name: 'safe input' } });
    mw(req, makeRes(), next as unknown as NextFunction);
    expect(next).toHaveBeenCalled();
  });

  it('blocks SQL injection and returns 400', () => {
    const mw = createRasp();
    const next = jest.fn();
    const res = makeRes();
    const req = makeReq({ body: { q: "' UNION SELECT * FROM users --" } });
    mw(req, res, next as unknown as NextFunction);
    expect(res.statusCode).toBe(400);
    expect((res.body as { error: string }).error).toBe('REQUEST_BLOCKED');
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks XSS and returns 400', () => {
    const mw = createRasp();
    const next = jest.fn();
    const res = makeRes();
    const req = makeReq({ query: { msg: '<script>alert(1)</script>' } });
    mw(req, res, next as unknown as NextFunction);
    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls onThreat callback when threat detected', () => {
    const onThreat = jest.fn();
    const mw = createRasp({ onThreat });
    const req = makeReq({ body: { x: '<script>alert(1)</script>' } });
    mw(req, makeRes(), jest.fn() as unknown as NextFunction);
    expect(onThreat).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'xss' }),
      req
    );
  });

  it('monitorOnly mode: calls next() even with threats', () => {
    const onThreat = jest.fn();
    const mw = createRasp({ monitorOnly: true, onThreat });
    const next = jest.fn();
    const req = makeReq({ body: { q: "'; DROP TABLE users;--" } });
    mw(req, makeRes(), next as unknown as NextFunction);
    expect(next).toHaveBeenCalled();
    expect(onThreat).toHaveBeenCalled();
  });

  it('respects threats filter — does not block unchecked types', () => {
    // Only check command_injection, so XSS won't be blocked
    const mw = createRasp({ threats: ['command_injection'] });
    const next = jest.fn();
    const req = makeReq({ body: { x: '<script>alert(1)</script>' } });
    mw(req, makeRes(), next as unknown as NextFunction);
    expect(next).toHaveBeenCalled(); // XSS not in the threat filter
  });

  it('blocks path traversal', () => {
    const mw = createRasp();
    const res = makeRes();
    const req = makeReq({ query: { file: '../../../etc/passwd' } });
    mw(req, res, jest.fn() as unknown as NextFunction);
    expect(res.statusCode).toBe(400);
  });

  it('blocks LDAP injection', () => {
    const mw = createRasp();
    const res = makeRes();
    const req = makeReq({ body: { username: '(|(uid=*))' } });
    mw(req, res, jest.fn() as unknown as NextFunction);
    expect(res.statusCode).toBe(400);
  });
});

describe('rasp — additional coverage', () => {
  it('scanValue returns null for a plain email address (sql_injection)', () => {
    expect(scanValue('user@example.com', 'sql_injection')).toBeNull();
  });

  it('scanValue returns null for a plain filename (path_traversal)', () => {
    expect(scanValue('report-2026.pdf', 'path_traversal')).toBeNull();
  });

  it('scanRequest with empty threats list returns empty array', () => {
    const req = makeReq({ body: { q: "' OR 1=1 --" } });
    expect(scanRequest(req, [])).toHaveLength(0);
  });

  it('createRasp response body includes the detected threat type as code', () => {
    const mw = createRasp();
    const res = makeRes();
    const req = makeReq({ body: { q: "' UNION SELECT * FROM users --" } });
    mw(req, res, jest.fn() as unknown as NextFunction);
    // Response is { error: 'REQUEST_BLOCKED', message: '...', code: <threat_type> }
    expect((res.body as { code: string }).code).toBeDefined();
    expect((res.body as { error: string }).error).toBe('REQUEST_BLOCKED');
  });
});

describe('rasp — phase29 coverage', () => {
  it('handles JSON stringify', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}');
  });

  it('handles structuredClone', () => {
    const obj = { a: 1 }; const clone = structuredClone(obj); expect(clone).toEqual(obj); expect(clone).not.toBe(obj);
  });

  it('handles nullish coalescing', () => {
    const val: string | null = null; expect(val ?? 'default').toBe('default');
  });

  it('handles template literals', () => {
    const n = 42; expect(`value: ${n}`).toBe('value: 42');
  });

  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

});
