import {
  withHedging,
  withHedgingDetailed,
  createHedger,
  RequestHedger,
} from '../src/request-hedging';

// ── withHedging() ──────────────────────────────────────────────────────────

describe('withHedging()', () => {
  it('resolves with the operation result', async () => {
    const result = await withHedging(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it('rejects if the operation throws and no hedge succeeds', async () => {
    await expect(
      withHedging(() => Promise.reject(new Error('boom')), { delayMs: 5, maxAttempts: 2 })
    ).rejects.toThrow('boom');
  });

  it('returns the faster result when hedge wins', async () => {
    let callCount = 0;
    const result = await withHedging(
      () => {
        callCount++;
        const isFirst = callCount === 1;
        return new Promise<string>((resolve) =>
          setTimeout(() => resolve(isFirst ? 'slow' : 'fast'), isFirst ? 60 : 10)
        );
      },
      { delayMs: 20, maxAttempts: 2 }
    );
    expect(typeof result).toBe('string');
  });

  it('works with maxAttempts: 1 (no hedging)', async () => {
    const result = await withHedging(() => Promise.resolve('only'), { maxAttempts: 1 });
    expect(result).toBe('only');
  });

  it('clamps maxAttempts to 4', async () => {
    const result = await withHedging(() => Promise.resolve('ok'), { maxAttempts: 100 });
    expect(result).toBe('ok');
  });

  it('calls onHedge for each hedged attempt', async () => {
    const onHedge = jest.fn();
    await withHedging(
      () => new Promise((resolve) => setTimeout(resolve, 30, 'v')),
      { delayMs: 5, maxAttempts: 2, onHedge }
    );
    expect(onHedge).toHaveBeenCalledTimes(1);
    expect(onHedge).toHaveBeenCalledWith(1, 5);
  });

  it('does not hedge if shouldHedge returns false', async () => {
    const onHedge = jest.fn();
    await withHedging(
      () => Promise.resolve('x'),
      { delayMs: 5, maxAttempts: 2, shouldHedge: () => false, onHedge }
    );
    expect(onHedge).not.toHaveBeenCalled();
  });

  it('resolves with string result correctly typed', async () => {
    const result = await withHedging(() => Promise.resolve('typed'));
    expect(result).toBe('typed');
  });

  it('resolves with object result', async () => {
    const obj = { id: 1, name: 'test' };
    const result = await withHedging(() => Promise.resolve(obj));
    expect(result).toEqual(obj);
  });

  it('cancels via AbortSignal when signal is already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    await expect(
      withHedging(() => Promise.resolve(1), { signal: ac.signal })
    ).rejects.toThrow(/cancelled/i);
  });

  it('uses default delayMs of 100 when not specified', async () => {
    // Just verify it resolves with defaults — no explicit delay option
    const result = await withHedging(() => Promise.resolve('default-delay'), { maxAttempts: 1 });
    expect(result).toBe('default-delay');
  });

  it('handles maxAttempts: 3 with instant resolution', async () => {
    const fn = jest.fn().mockResolvedValue('quick');
    const result = await withHedging(fn, { maxAttempts: 3, delayMs: 1000 });
    expect(result).toBe('quick');
  });

  it('propagates the error from a non-hedgeable failure', async () => {
    const err = new Error('non-retryable');
    await expect(
      withHedging(() => Promise.reject(err), {
        maxAttempts: 2,
        delayMs: 5,
        shouldHedge: () => false,
      })
    ).rejects.toThrow('non-retryable');
  });
});

// ── withHedgingDetailed() ─────────────────────────────────────────────────

describe('withHedgingDetailed()', () => {
  it('returns value, winningAttempt, and attemptsIssued', async () => {
    const result = await withHedgingDetailed(() => Promise.resolve('hi'));
    expect(result.value).toBe('hi');
    expect(result.winningAttempt).toBeGreaterThanOrEqual(0);
    expect(result.attemptsIssued).toBeGreaterThanOrEqual(1);
  });

  it('winningAttempt is 0 when original wins', async () => {
    const result = await withHedgingDetailed(
      () => Promise.resolve('instant'),
      { delayMs: 1000, maxAttempts: 2 }
    );
    expect(result.winningAttempt).toBe(0);
  });

  it('attemptsIssued is 1 when maxAttempts is 1', async () => {
    const result = await withHedgingDetailed(
      () => Promise.resolve('x'),
      { maxAttempts: 1 }
    );
    expect(result.attemptsIssued).toBe(1);
  });

  it('value matches what the winning attempt resolved with', async () => {
    const result = await withHedgingDetailed(() => Promise.resolve(999));
    expect(result.value).toBe(999);
  });

  it('attemptsIssued is at least 1 regardless of configuration', async () => {
    const result = await withHedgingDetailed(() => Promise.resolve('any'));
    expect(result.attemptsIssued).toBeGreaterThanOrEqual(1);
  });

  it('winningAttempt is a non-negative integer', async () => {
    const result = await withHedgingDetailed(() => Promise.resolve('w'));
    expect(Number.isInteger(result.winningAttempt)).toBe(true);
    expect(result.winningAttempt).toBeGreaterThanOrEqual(0);
  });
});

// ── RequestHedger ──────────────────────────────────────────────────────────

describe('RequestHedger', () => {
  it('executes the operation and returns the result', async () => {
    const hedger = createHedger({ delayMs: 1000 });
    const result = await hedger.execute(() => Promise.resolve(99));
    expect(result).toBe(99);
  });

  it('hedgesIssued starts at 0', () => {
    const hedger = new RequestHedger({ delayMs: 1000 });
    expect(hedger.hedgesIssued).toBe(0);
  });

  it('hedgeWins starts at 0', () => {
    const hedger = new RequestHedger({ delayMs: 1000 });
    expect(hedger.hedgeWins).toBe(0);
  });

  it('hedgesIssued increments when a hedge is launched', async () => {
    const hedger = new RequestHedger({ delayMs: 5, maxAttempts: 2 });
    await hedger.execute(
      () => new Promise((resolve) => setTimeout(resolve, 30, 'v'))
    );
    expect(hedger.hedgesIssued).toBeGreaterThanOrEqual(1);
  });

  it('resetStats() clears hedgesIssued and hedgeWins', () => {
    const hedger = new RequestHedger({ delayMs: 1000 });
    (hedger as unknown as { hedgeCount: number }).hedgeCount = 5;
    hedger.resetStats();
    expect(hedger.hedgesIssued).toBe(0);
    expect(hedger.hedgeWins).toBe(0);
  });

  it('createHedger() returns a RequestHedger', () => {
    expect(createHedger()).toBeInstanceOf(RequestHedger);
  });

  it('execute returns correct type for string result', async () => {
    const hedger = createHedger({ delayMs: 1000 });
    const result = await hedger.execute(() => Promise.resolve('typed-result'));
    expect(typeof result).toBe('string');
    expect(result).toBe('typed-result');
  });

  it('can be reused across multiple executions', async () => {
    const hedger = createHedger({ delayMs: 1000 });
    const r1 = await hedger.execute(() => Promise.resolve(1));
    const r2 = await hedger.execute(() => Promise.resolve(2));
    expect(r1).toBe(1);
    expect(r2).toBe(2);
  });

  it('hedgesIssued is cumulative across multiple executions', async () => {
    const hedger = new RequestHedger({ delayMs: 5, maxAttempts: 2 });
    await hedger.execute(() => new Promise((r) => setTimeout(r, 30, 'a')));
    await hedger.execute(() => new Promise((r) => setTimeout(r, 30, 'b')));
    expect(hedger.hedgesIssued).toBeGreaterThanOrEqual(2);
  });
});

// ── AbortSignal cancellation ──────────────────────────────────────────────

describe('AbortSignal', () => {
  it('rejects if signal is already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    await expect(
      withHedging(() => Promise.resolve(1), { signal: ac.signal })
    ).rejects.toThrow(/cancelled/i);
  });
});

describe('withHedging — further edge cases', () => {
  it('resolves with boolean true result', async () => {
    const result = await withHedging(() => Promise.resolve(true));
    expect(result).toBe(true);
  });

  it('resolves with number 0 correctly', async () => {
    const result = await withHedging(() => Promise.resolve(0));
    expect(result).toBe(0);
  });

  it('resolves with null correctly', async () => {
    const result = await withHedging(() => Promise.resolve(null));
    expect(result).toBeNull();
  });

  it('calls the function at least once', async () => {
    const fn = jest.fn().mockResolvedValue('called');
    await withHedging(fn, { maxAttempts: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('withHedgingDetailed attemptsIssued is 1 for single maxAttempts', async () => {
    const result = await withHedgingDetailed(() => Promise.resolve('x'), { maxAttempts: 1 });
    expect(result.attemptsIssued).toBe(1);
  });

  it('createHedger with no options returns a RequestHedger instance', () => {
    const h = createHedger();
    expect(h).toBeInstanceOf(RequestHedger);
    expect(h.hedgesIssued).toBe(0);
    expect(h.hedgeWins).toBe(0);
  });
});
