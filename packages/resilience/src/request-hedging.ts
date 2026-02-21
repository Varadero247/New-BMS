/**
 * Request Hedging
 *
 * Reduces tail latency on idempotent operations by issuing a second
 * (hedged) request after a configurable delay if the first has not
 * yet completed. The result of whichever attempt finishes first is
 * returned; the slower attempt is abandoned.
 *
 * This is the "hedged requests" pattern from Google SRE Book §22.
 *
 * IMPORTANT: Only use with idempotent operations (GET, HEAD, or
 * operations with application-level idempotency keys).
 *
 * Usage:
 *   const result = await withHedging(
 *     () => fetchUserProfile(userId),
 *     { delayMs: 50, maxAttempts: 2 }
 *   );
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface HedgingOptions {
  /**
   * Milliseconds to wait before issuing the hedged (duplicate) request.
   * Typical value: p95 - p50 of the operation's latency distribution.
   * Default: 100ms
   */
  delayMs?: number;
  /**
   * Total number of attempts (including the initial one).
   * Maximum supported: 4. Default: 2.
   */
  maxAttempts?: number;
  /**
   * Determines whether a given error should trigger a hedge attempt.
   * By default, any error triggers a hedge.
   */
  shouldHedge?: (error: unknown) => boolean;
  /**
   * Called each time a hedged attempt is launched.
   * Useful for metrics / logging.
   */
  onHedge?: (attempt: number, delayMs: number) => void;
  /**
   * AbortSignal to cancel all in-flight hedged requests.
   */
  signal?: AbortSignal;
}

export interface HedgingResult<T> {
  /** The result from the fastest successful attempt */
  value: T;
  /** 0-based index of the attempt that won (0 = original, 1+ = hedged) */
  winningAttempt: number;
  /** How many attempts were issued in total */
  attemptsIssued: number;
}

// ── Core function ──────────────────────────────────────────────────────────

/**
 * Execute `fn` with hedging. Returns the result of the fastest attempt.
 *
 * @param fn      - The async operation to hedge (must be idempotent)
 * @param options - Hedging configuration
 */
export async function withHedging<T>(
  fn: () => Promise<T>,
  options: HedgingOptions = {}
): Promise<T> {
  const { value } = await withHedgingDetailed(fn, options);
  return value;
}

/**
 * Like `withHedging`, but also returns metadata about which attempt won.
 */
export async function withHedgingDetailed<T>(
  fn: () => Promise<T>,
  options: HedgingOptions = {}
): Promise<HedgingResult<T>> {
  const {
    delayMs     = 100,
    maxAttempts = 2,
    shouldHedge = () => true,
    onHedge,
    signal,
  } = options;

  const clampedMax = Math.min(Math.max(maxAttempts, 1), 4);
  const abortControllers: AbortController[] = [];
  const hedgeTimers: ReturnType<typeof setTimeout>[] = [];

  let attemptsIssued = 0;

  // Race all attempts — first successful result wins
  return new Promise<HedgingResult<T>>((resolve, reject) => {
    let settled = false;
    let pendingAttempts = 0;
    const errors: unknown[] = [];

    const settle = (result: HedgingResult<T> | Error, index: number) => {
      if (settled) return;

      if (result instanceof Error) {
        errors.push(result);
        pendingAttempts--;
        if (pendingAttempts === 0) {
          // All attempts failed — reject with the first error
          settled = true;
          for (const t of hedgeTimers) clearTimeout(t);
          reject(errors[0]);
        }
        return;
      }

      settled = true;
      // Clear any pending hedge timers so they don't keep the event loop alive
      for (const t of hedgeTimers) clearTimeout(t);
      // Cancel all other in-flight attempts (best effort)
      for (const ac of abortControllers) {
        try { ac.abort(); } catch { /* ignore */ }
      }
      resolve(result);
    };

    const launchAttempt = (attemptIndex: number) => {
      if (settled) return;
      if (signal?.aborted) { reject(new Error('Hedging cancelled by AbortSignal')); return; }

      const ac = new AbortController();
      abortControllers.push(ac);
      attemptsIssued++;
      pendingAttempts++;

      if (attemptIndex > 0) onHedge?.(attemptIndex, delayMs);

      fn()
        .then((value) => {
          settle({ value, winningAttempt: attemptIndex, attemptsIssued }, attemptIndex);
        })
        .catch((err) => {
          // If the error suggests we should hedge, the hedge timer will handle it.
          // If not retryable or already at max, propagate.
          if (!shouldHedge(err)) {
            settled = true;
            reject(err);
            return;
          }
          settle(err instanceof Error ? err : new Error(String(err)), attemptIndex);
        });
    };

    // Launch attempt 0 immediately
    launchAttempt(0);

    // Schedule hedged attempts
    for (let i = 1; i < clampedMax; i++) {
      const idx = i;
      const timer = setTimeout(() => {
        if (!settled) launchAttempt(idx);
      }, delayMs * idx);

      hedgeTimers.push(timer);
      // If parent signal aborts, clear timers
      signal?.addEventListener('abort', () => clearTimeout(timer), { once: true });
    }
  });
}

// ── Hedging Pool ───────────────────────────────────────────────────────────

/**
 * Pre-configured hedger that can be reused for a specific operation type.
 *
 * @example
 * const hedger = createHedger({ delayMs: 75, maxAttempts: 2 });
 * const data = await hedger.execute(() => fetchFromDB(id));
 */
export class RequestHedger {
  private readonly opts: HedgingOptions;
  private hedgeCount = 0;
  private winCount   = 0;

  constructor(opts: HedgingOptions = {}) {
    this.opts = opts;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const result = await withHedgingDetailed(fn, {
      ...this.opts,
      onHedge: (attempt, delay) => {
        this.hedgeCount++;
        this.opts.onHedge?.(attempt, delay);
      },
    });
    if (result.winningAttempt > 0) this.winCount++;
    return result.value;
  }

  /** How many hedge (duplicate) requests have been issued. */
  get hedgesIssued(): number { return this.hedgeCount; }
  /** How many times a hedged attempt won over the original. */
  get hedgeWins(): number    { return this.winCount; }
  /** Reset stats counters. */
  resetStats(): void { this.hedgeCount = 0; this.winCount = 0; }
}

export function createHedger(opts: HedgingOptions = {}): RequestHedger {
  return new RequestHedger(opts);
}
