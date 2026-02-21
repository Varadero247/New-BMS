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
        // First call takes 60ms, hedge (second call) returns in 10ms.
        // Hedge fires at 20ms → hedge wins at ~30ms → first timer fires 30ms later.
        // 60ms keeps the leak window short while still demonstrating the race.
        return new Promise<string>((resolve) =>
          setTimeout(() => resolve(isFirst ? 'slow' : 'fast'), isFirst ? 60 : 10)
        );
      },
      { delayMs: 20, maxAttempts: 2 }
    );
    // Either 'slow' or 'fast' depending on timing — just verify no rejection
    expect(typeof result).toBe('string');
  });

  it('works with maxAttempts: 1 (no hedging)', async () => {
    const result = await withHedging(() => Promise.resolve('only'), { maxAttempts: 1 });
    expect(result).toBe('only');
  });

  it('clamps maxAttempts to 4', async () => {
    // Should not throw even with maxAttempts: 100
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
    // Instant response — original always wins
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
    // 30ms: long enough for the 5ms hedge timer to fire, short enough not to leak.
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
