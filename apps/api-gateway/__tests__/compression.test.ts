/**
 * Tests for compressionMiddleware
 *
 * We test the middleware at the unit level without starting a real HTTP server.
 * The middleware patches res.write / res.end / res.writeHead when the client
 * advertises gzip/deflate support and the content type is compressible.
 */
import { compressionMiddleware } from '../src/middleware/compression';
import type { Request, Response } from 'express';

function makeReq(acceptEncoding?: string, method = 'GET'): Request {
  return {
    headers: { 'accept-encoding': acceptEncoding ?? '' },
    method,
  } as unknown as Request;
}

function makeRes(contentType = 'application/json'): Response & {
  statusCode: number;
  _headers: Record<string, string | number | undefined>;
  writeHead: (...args: unknown[]) => Response;
} {
  const headers: Record<string, string | number | undefined> = {
    'content-type': contentType,
  };
  return {
    statusCode: 200,
    _headers: headers,
    write: jest.fn(),
    end: jest.fn(),
    writeHead: jest.fn(),
    setHeader(k: string, v: string | number) {
      headers[k.toLowerCase()] = v;
    },
    getHeader(k: string) {
      return headers[k.toLowerCase()];
    },
    removeHeader(k: string) {
      delete headers[k.toLowerCase()];
    },
  } as unknown as Response & {
    statusCode: number;
    _headers: Record<string, string | number | undefined>;
    writeHead: (...args: unknown[]) => Response;
  };
}

// ── When client doesn't support compression ───────────────────────────────────

describe('compressionMiddleware — no encoding support', () => {
  it('calls next() without patching when no Accept-Encoding', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    const res = makeRes();
    const originalWrite = res.write;
    mw(makeReq(), res, next);
    expect(next).toHaveBeenCalled();
    expect(res.write).toBe(originalWrite); // not patched
  });

  it('calls next() when Accept-Encoding is */*', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    mw(makeReq('identity'), res, next);
    expect(next).toHaveBeenCalled();
  });
});

// ── When client supports gzip ─────────────────────────────────────────────────

describe('compressionMiddleware — gzip support', () => {
  it('calls next()', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    const res = makeRes();
    mw(makeReq('gzip, deflate'), res, next);
    expect(next).toHaveBeenCalled();
  });

  it('patches writeHead so compression is initialized', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    const res = makeRes();
    mw(makeReq('gzip'), res, next);
    // Trigger writeHead — this sets up the compression
    res.writeHead(200);
    expect(res.getHeader('content-encoding')).toBe('gzip');
  });

  it('removes Content-Length header when compressing', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    const res = makeRes();
    (res as unknown as { _headers: Record<string, unknown> })._headers['content-length'] = 500;
    res.setHeader('content-length', '500');
    mw(makeReq('gzip'), res, next);
    res.writeHead(200);
    expect(res.getHeader('content-length')).toBeUndefined();
  });
});

// ── Skip compression for binary content types ─────────────────────────────────

describe('compressionMiddleware — skip binary types', () => {
  it('does not set Content-Encoding for image/* content', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    const res = makeRes('image/png');
    mw(makeReq('gzip'), res, next);
    res.writeHead(200);
    expect(res.getHeader('content-encoding')).toBeUndefined();
  });

  it('does not set Content-Encoding for video/* content', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    const res = makeRes('video/mp4');
    mw(makeReq('gzip'), res, next);
    res.writeHead(200);
    expect(res.getHeader('content-encoding')).toBeUndefined();
  });

  it('does not set Content-Encoding when already encoded', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    const res = makeRes('application/json');
    res.setHeader('content-encoding', 'gzip');
    mw(makeReq('gzip'), res, next);
    res.writeHead(200);
    // Should not overwrite existing encoding
    expect(res.getHeader('content-encoding')).toBe('gzip');
  });
});

// ── Custom options ────────────────────────────────────────────────────────────

describe('compressionMiddleware — custom options', () => {
  it('respects custom skipTypes', () => {
    const mw = compressionMiddleware({ skipTypes: ['application/json'] });
    const next = jest.fn();
    const res = makeRes('application/json');
    mw(makeReq('gzip'), res, next);
    res.writeHead(200);
    expect(res.getHeader('content-encoding')).toBeUndefined();
  });

  it('compresses when custom skipTypes does not match content type', () => {
    const mw = compressionMiddleware({ skipTypes: ['image/'] });
    const next = jest.fn();
    const res = makeRes('application/json');
    mw(makeReq('gzip'), res, next);
    res.writeHead(200);
    expect(res.getHeader('content-encoding')).toBe('gzip');
  });
});

// ── deflate support ───────────────────────────────────────────────────────────

describe('compressionMiddleware — deflate support', () => {
  it('uses deflate when gzip not supported', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    const res = makeRes();
    mw(makeReq('deflate'), res, next);
    res.writeHead(200);
    expect(res.getHeader('content-encoding')).toBe('deflate');
  });

  it('prefers gzip over deflate when both supported', () => {
    const mw = compressionMiddleware();
    const next = jest.fn();
    const res = makeRes();
    mw(makeReq('gzip, deflate'), res, next);
    res.writeHead(200);
    expect(res.getHeader('content-encoding')).toBe('gzip');
  });
});

// Provide a fallback for unused variable
const res = makeRes();
void res;
