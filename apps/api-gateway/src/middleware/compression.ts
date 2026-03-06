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

    let compressionSetup = false;
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    function shouldCompress(): boolean {
      const contentType = res.getHeader('content-type') as string | undefined;
      const contentEncoding = res.getHeader('content-encoding');

      if (contentEncoding) return false;

      if (contentType && skipTypes.some((t) => contentType.includes(t))) return false;

      // If Content-Length is known and below threshold, skip compression entirely.
      // This avoids buffering and lets the response stream through unmodified.
      const contentLength = parseInt(String(res.getHeader('content-length') ?? '0'), 10);
      if (contentLength > 0 && contentLength < threshold) return false;

      return true;
    }

    function setupCompression() {
      if (compressionSetup) return;
      compressionSetup = true;

      if (!shouldCompress()) return;

      // Announce encoding NOW — before originalWriteHead is called — so the header
      // is included in the response headers sent to the client. Setting it inside
      // res.end() is too late; headers will already have been flushed.
      const encoding = supportsGzip ? 'gzip' : 'deflate';
      res.setHeader('Content-Encoding', encoding);
      res.removeHeader('Content-Length'); // length changes after compression

      const rawChunks: Buffer[] = [];

      (res as unknown as { write: (...args: unknown[]) => boolean }).write = (
        chunk: unknown,
        ...rest: unknown[]
      ): boolean => {
        void rest;
        rawChunks.push(chunk instanceof Buffer ? (chunk as Buffer) : Buffer.from(String(chunk)));
        return true;
      };

      (res as unknown as { end: (...args: unknown[]) => Response }).end = (
        chunk?: unknown,
        ...rest: unknown[]
      ): Response => {
        void rest;
        if (chunk != null) {
          rawChunks.push(chunk instanceof Buffer ? (chunk as Buffer) : Buffer.from(String(chunk)));
        }

        const rawBody = Buffer.concat(rawChunks);

        // Restore originals before sending so recursive calls are safe
        res.write = originalWrite;
        res.end = originalEnd as typeof res.end;

        // If the actual body turned out to be below threshold, undo the encoding
        // header and send uncompressed. We can still do this because we deferred
        // the actual socket write — nothing has been written to the wire yet.
        if (rawBody.length < threshold) {
          res.removeHeader('Content-Encoding');
          originalEnd(rawBody);
          return res;
        }

        // Compress and send
        const stream = supportsGzip ? createGzip({ level }) : createDeflate({ level });
        const compressedChunks: Buffer[] = [];
        stream.on('data', (data: Buffer) => compressedChunks.push(data));
        stream.on('end', () => originalEnd(Buffer.concat(compressedChunks)));
        stream.write(rawBody);
        stream.end();
        return res;
      };
    }

    // Intercept header writes to set up compression before headers are flushed
    const originalWriteHead = res.writeHead.bind(res);
    res.writeHead = function (statusCode: number, ...args: unknown[]) {
      setupCompression();
      return (originalWriteHead as (...a: unknown[]) => Response)(statusCode, ...args) as Response;
    } as typeof res.writeHead;

    next();
  };
}
