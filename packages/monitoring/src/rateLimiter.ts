import rateLimit from 'express-rate-limit';

/**
 * Standard downstream-service rate limiter.
 *
 * Downstream API services sit behind the gateway which already applies Redis-backed
 * rate limiting. This limiter provides a secondary layer to protect against direct
 * access that bypasses the gateway (FINDING-016 / OWASP A04 / CWE-770).
 *
 * Defaults: 500 requests per 15 minutes per IP.
 */
export function createDownstreamRateLimiter(options?: { max?: number; windowMs?: number }) {
  return rateLimit({
    windowMs: options?.windowMs ?? 15 * 60 * 1000, // 15 minutes
    max: options?.max ?? 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests, please try again later.',
    },
  });
}
