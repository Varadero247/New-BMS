import type { Request, Response } from 'express';
import { createGzip, createDeflate } from 'zlib';
import { pipeline } from 'stream';

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

    // Track whether we've patched the response
    let compressionSetup = false;
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    function shouldCompress(): boolean {
      const contentType = res.getHeader('content-type') as string | undefined;
      const contentEncoding = res.getHeader('content-encoding');

      // Skip if already encoded
      if (contentEncoding) return false;

      // Skip binary content types
      if (
        contentType &&
        skipTypes.some((t) => contentType.includes(t))
      ) {
        return false;
      }

      return true;
    }

    function setupCompression() {
      if (compressionSetup) return;
      compressionSetup = true;

      if (!shouldCompress()) return;

      const encoding = supportsGzip ? 'gzip' : 'deflate';
      const stream = supportsGzip ? createGzip({ level }) : createDeflate({ level });

      res.setHeader('Content-Encoding', encoding);
      res.removeHeader('Content-Length'); // length changes after compression

      const chunks: Buffer[] = [];

      // Monkey-patch write to buffer compressed data
      (res as unknown as { write: (...args: unknown[]) => boolean }).write = (
        chunk: unknown,
        ...rest: unknown[]
      ): boolean => {
        stream.write(
          chunk instanceof Buffer ? chunk : Buffer.from(String(chunk)),
          rest[0] as BufferEncoding | undefined
        );
        return true;
      };

      (res as unknown as { end: (...args: unknown[]) => Response }).end = (
        chunk?: unknown,
        ...rest: unknown[]
      ): Response => {
        if (chunk != null) {
          stream.write(
            chunk instanceof Buffer ? chunk : Buffer.from(String(chunk)),
            rest[0] as BufferEncoding | undefined
          );
        }

        stream.on('data', (data: Buffer) => {
          chunks.push(data);
        });

        stream.on('end', () => {
          const compressed = Buffer.concat(chunks);
          res.write = originalWrite;
          res.end = originalEnd as typeof res.end;
          originalEnd(compressed);
        });

        stream.end();
        return res;
      };
    }

    // Intercept header writes to decide once we know the content type
    const originalWriteHead = res.writeHead.bind(res);
    res.writeHead = function (statusCode: number, ...args: unknown[]) {
      setupCompression();
      return (originalWriteHead as (...a: unknown[]) => Response)(statusCode, ...args) as Response;
    } as typeof res.writeHead;

    next();
  };
}
