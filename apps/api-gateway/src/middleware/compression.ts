// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Request, Response } from 'express';
import { createGzip, createDeflate } from 'zlib';

/**
 * Minimal response compression middleware using Node.js built-in zlib.
 *
 * Supports `Accept-Encoding: gzip` and `deflate`.
 * Only compresses responses larger than `threshold` bytes (default: 1024).
 * Skips compression when the response is already encoded or when the client
 * does not advertise support.
 *
 * Patches res.write/res.end BEFORE next() so interception is in place before
 * any route handler executes. Compression decision is made at send time (inside
 * the patched res.end), when response headers are known but not yet flushed —
 * so Content-Encoding can still be set safely.
 *
 * No external dependencies required.
 */

export interface CompressionOptions {
  /** Minimum response size in bytes to trigger compression. Default: 1024 */
  threshold?: number;
  /** Compression level 1-9. Default: 6 */
  level?: number;
  /** Skip compression for these content-types (partial match). */
  skipTypes?: string[];
}

const DEFAULT_SKIP_TYPES = ['image/', 'video/', 'audio/', 'application/zip'];

export function compressionMiddleware(opts: CompressionOptions = {}) {
  const { threshold = 1024, level = 6, skipTypes = DEFAULT_SKIP_TYPES } = opts;

  return (req: Request, res: Response, next: () => void): void => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const supportsGzip = acceptEncoding.includes('gzip');
    const supportsDeflate = acceptEncoding.includes('deflate');

    if (!supportsGzip && !supportsDeflate) {
      next();
      return;
    }

    const encoding = supportsGzip ? 'gzip' : 'deflate';

    // Decide whether to compress based on content-type and existing encoding.
    // Called from writeHead (before headers are flushed) and from end() if writeHead
    // was not called directly. Returns true if compression was activated.
    function setupCompression(): boolean {
      const contentType = res.getHeader('content-type') as string | undefined;
      const contentEncoding = res.getHeader('content-encoding');
      if (contentEncoding || (contentType && skipTypes.some((t) => contentType.includes(t)))) {
        return false;
      }
      res.setHeader('Content-Encoding', encoding);
      res.removeHeader('Content-Length');
      return true;
    }

    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    const resAny = res as unknown as Record<string, unknown>;
    const originalWriteHead = typeof resAny['writeHead'] === 'function'
      ? (resAny['writeHead'] as (...a: unknown[]) => unknown).bind(res)
      : undefined;

    const rawChunks: Buffer[] = [];
    let intercepting = true;
    let compressionDecided = false;

    // Patch writeHead: set Content-Encoding BEFORE headers are flushed to the wire.
    if (originalWriteHead) {
      resAny['writeHead'] = (statusCode: number, ...args: unknown[]): unknown => {
        if (!compressionDecided) {
          compressionDecided = true;
          setupCompression();
        }
        return originalWriteHead(statusCode, ...args);
      };
    }

    // Patch write to buffer body chunks.
    (res as unknown as { write: (...args: unknown[]) => boolean }).write = (
      chunk: unknown,
      ...rest: unknown[]
    ): boolean => {
      void rest;
      if (!intercepting) return (originalWrite as (...a: unknown[]) => boolean)(chunk, ...rest);
      rawChunks.push(chunk instanceof Buffer ? (chunk as Buffer) : Buffer.from(String(chunk)));
      return true;
    };

    // Patch end: perform actual compression once the full body is available.
    (res as unknown as { end: (...args: unknown[]) => Response }).end = (
      chunk?: unknown,
      ...rest: unknown[]
    ): Response => {
      void rest;
      if (!intercepting) return (originalEnd as (...a: unknown[]) => Response)(chunk, ...rest);

      intercepting = false;

      if (chunk != null) {
        rawChunks.push(chunk instanceof Buffer ? (chunk as Buffer) : Buffer.from(String(chunk)));
      }

      // Restore originals so recursive calls are safe.
      res.write = originalWrite;
      res.end = originalEnd as typeof res.end;
      if (originalWriteHead) resAny['writeHead'] = originalWriteHead;

      const rawBody = Buffer.concat(rawChunks);

      // If writeHead was never called, decide compression now.
      if (!compressionDecided) {
        compressionDecided = true;
        setupCompression();
      }

      // Check if compression was activated and body meets size threshold.
      const activeEncoding = res.getHeader('content-encoding') as string | undefined;
      if (!activeEncoding || rawBody.length < threshold) {
        if (activeEncoding && rawBody.length < threshold) {
          // Body too small — undo the Content-Encoding set in writeHead.
          res.removeHeader('Content-Encoding');
        }
        originalEnd(rawBody);
        return res;
      }

      const stream = supportsGzip ? createGzip({ level }) : createDeflate({ level });
      const compressedChunks: Buffer[] = [];
      stream.on('data', (data: Buffer) => compressedChunks.push(data));
      stream.on('end', () => originalEnd(Buffer.concat(compressedChunks)));
      stream.write(rawBody);
      stream.end();
      return res;
    };

    next();
  };
}
