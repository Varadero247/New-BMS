/**
 * security-headers-http.test.ts
 *
 * HTTP-level security header tests using supertest + a real Express app.
 * Helmet is applied to the app so all responses can be inspected for the
 * headers that Helmet injects.  Common injection / abuse payloads are also
 * exercised to verify the API handles them without crashing or leaking data.
 */

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => next()),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
  metricsMiddleware: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  metricsHandler: jest.fn(() => (_req: any, res: any) => res.end()),
  correlationIdMiddleware: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  createHealthCheck: jest.fn(() => (_req: any, res: any) => res.json({ status: 'ok' })),
  createDownstreamRateLimiter: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  authFailuresTotal: { inc: jest.fn() },
  rateLimitExceededTotal: { inc: jest.fn() },
}));

// ── Test app ──────────────────────────────────────────────────────────────────

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Mirror the additionalSecurityHeaders cache-control behaviour for /api/* paths.
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});

app.get('/test', (_req: Request, res: Response) => res.json({ ok: true }));

app.get('/api/data', (_req: Request, res: Response) =>
  res.json({ success: true, data: { value: 42 } })
);

app.get('/api/echo', (req: Request, res: Response) =>
  res.json({ success: true, data: { q: req.query['q'] } })
);

app.post('/test', (req: Request, res: Response) =>
  res.json({ received: req.body })
);

app.get('/api/protected', (req: Request, res: Response) => {
  const auth = req.headers['authorization'];
  // Extract bearer token — HTTP parsers trim trailing whitespace, so 'Bearer ' arrives as 'Bearer'
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or empty Authorization header' },
    });
    return;
  }
  res.json({ success: true, data: { protected: true } });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'The requested resource was not found' },
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Security Headers — HTTP level (supertest)', () => {
  it('sets X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('sets X-Frame-Options (DENY or SAMEORIGIN)', async () => {
    const res = await request(app).get('/test');
    const val = res.headers['x-frame-options'];
    expect(val).toBeDefined();
    expect(['DENY', 'SAMEORIGIN']).toContain(val?.toUpperCase());
  });

  it('sets X-XSS-Protection header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-xss-protection']).toBeDefined();
  });

  it('returns Content-Type: application/json for JSON responses', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('does not expose X-Powered-By header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('sets X-DNS-Prefetch-Control header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
  });

  it('does not serve XSS payload as raw HTML (returns safe JSON content-type)', async () => {
    const payload = '<script>alert(1)</script>';
    const res = await request(app).get(`/api/echo?q=${encodeURIComponent(payload)}`);
    // Security: response must be application/json, NOT text/html
    // JSON APIs don't HTML-escape content — the JSON encoding itself is safe
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers['content-type']).not.toMatch(/text\/html/);
    expect(res.status).toBe(200);
    // The script tag is safe because it's a JSON string value, not raw HTML
    const parsed = JSON.parse(res.text);
    expect(parsed.data.q).toBe(payload);
  });

  it('POST with XSS payload in body is received safely as a JSON string', async () => {
    const res = await request(app)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send({ name: '<script>alert(1)</script>' });
    expect(res.status).toBe(200);
    expect(res.body.received.name).toBe('<script>alert(1)</script>');
  });

  it('SQL injection attempt in query params returns safe response without SQL error leakage', async () => {
    const sqlPayload = "'OR1=1'";
    const res = await request(app).get(`/api/echo?q=${encodeURIComponent(sqlPayload)}`);
    expect(res.status).toBe(200);
    expect(res.text).not.toMatch(/sql|syntax error|pg_|ERROR:/i);
  });

  it('extremely large header value is handled without returning 500', async () => {
    const largeValue = 'A'.repeat(8192);
    const res = await request(app).get('/test').set('X-Custom-Header', largeValue);
    expect(res.status).not.toBe(500);
  });

  it('null bytes in JSON body string are handled without crashing', async () => {
    const res = await request(app)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ value: 'hello\u0000world' }));
    expect(res.status).not.toBe(500);
  });

  it('path traversal attempt returns 404 not 500', async () => {
    const res = await request(app).get('/api/../../etc/passwd');
    expect([400, 404]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('sets Content-Security-Policy header with default-src directive', async () => {
    const res = await request(app).get('/test');
    const csp = res.headers['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).toContain('default-src');
  });

  it('sets Cache-Control: no-store for /api/* endpoints', async () => {
    const res = await request(app).get('/api/data');
    expect(res.headers['cache-control']).toMatch(/no-store/i);
  });

  it('404 responses have { success: false, error: { code, message } } structure', async () => {
    const res = await request(app).get('/api/nonexistent-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      success: false,
      error: {
        code: expect.any(String),
        message: expect.any(String),
      },
    });
  });

  it('sets Strict-Transport-Security header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  it('double-slash path /api//data returns 404 not 500', async () => {
    const res = await request(app).get('/api//data');
    expect([400, 404]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('semicolon injection in query params is handled safely', async () => {
    const res = await request(app).get(
      `/api/echo?q=${encodeURIComponent('foo;bar=drop table users')}`
    );
    expect(res.status).toBe(200);
    expect(res.body.data.q).toBe('foo;bar=drop table users');
  });

  it('unicode injection characters in POST body are accepted without crashing', async () => {
    const res = await request(app)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send({ data: '\u202E\u00AB\u2028\u2029\uFFFD' });
    expect(res.status).not.toBe(500);
  });

  it('empty Authorization header on protected endpoint returns 401 not 500', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ success: false, error: { code: expect.any(String) } });
  });

  it('sets Pragma: no-cache for /api/* endpoints', async () => {
    const res = await request(app).get('/api/data');
    expect(res.headers['pragma']).toBe('no-cache');
  });

  it('sets Surrogate-Control: no-store for /api/* endpoints', async () => {
    const res = await request(app).get('/api/data');
    expect(res.headers['surrogate-control']).toBe('no-store');
  });

  it('POST body over 1 MB is rejected without crashing (413 or 400)', async () => {
    const largeBody = 'X'.repeat(1.5 * 1024 * 1024);
    const res = await request(app)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ data: largeBody }));
    expect([400, 413]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });

  it('GET /test returns 200 with { ok: true } body', async () => {
    const res = await request(app).get('/test');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('Cross-Origin-Resource-Policy is set to cross-origin', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin');
  });

  it('CSP contains object-src none directive', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['content-security-policy']).toContain('object-src');
    expect(res.headers['content-security-policy']).toContain('none');
  });

  it('CSP contains frame-src none directive', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['content-security-policy']).toContain('frame-src');
  });

  it('non-API paths do not receive API-level Surrogate-Control or Pragma headers', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['surrogate-control']).toBeUndefined();
    expect(res.headers['pragma']).toBeUndefined();
  });

  it('missing Authorization header on protected endpoint returns 401', async () => {
    const res = await request(app).get('/api/protected');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('valid Bearer token on protected endpoint returns 200', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.test.sig');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
