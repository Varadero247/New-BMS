import { AdaptiveTimeout, withAdaptiveTimeout } from '../src/adaptive-timeout';

describe('AdaptiveTimeout', () => {
  // ── Construction ─────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with 0 samples', () => {
      expect(new AdaptiveTimeout().sampleCount).toBe(0);
    });

    it('returns baseTimeoutMs before minSamples are collected', () => {
      const t = new AdaptiveTimeout({ baseTimeoutMs: 3000, minSamples: 10 });
      t.record(100);
      expect(t.getTimeout()).toBe(3000);
    });
  });

  // ── record() ─────────────────────────────────────────────────────────────────

  describe('record()', () => {
    it('increments sampleCount', () => {
      const t = new AdaptiveTimeout();
      t.record(50);
      t.record(100);
      expect(t.sampleCount).toBe(2);
    });

    it('caps at windowSize', () => {
      const t = new AdaptiveTimeout({ windowSize: 5 });
      for (let i = 0; i < 10; i++) t.record(i * 10);
      expect(t.sampleCount).toBe(5);
    });
  });

  // ── percentile() ─────────────────────────────────────────────────────────────

  describe('percentile()', () => {
    it('returns 0 with no samples', () => {
      expect(new AdaptiveTimeout().percentile(95)).toBe(0);
    });

    it('calculates p50 (median)', () => {
      const t = new AdaptiveTimeout();
      [10, 20, 30, 40, 50].forEach((v) => t.record(v));
      expect(t.percentile(50)).toBe(30);
    });

    it('calculates p95 from 20 samples', () => {
      const t = new AdaptiveTimeout();
      for (let i = 1; i <= 20; i++) t.record(i * 10);
      // p95 of [10,20,...,200]: 95th percentile index = ceil(0.95*20)-1 = 18 (0-indexed) → 190
      expect(t.percentile(95)).toBe(190);
    });

    it('p100 returns max value', () => {
      const t = new AdaptiveTimeout();
      [100, 200, 50, 300].forEach((v) => t.record(v));
      expect(t.percentile(100)).toBe(300);
    });
  });

  // ── getTimeout() ─────────────────────────────────────────────────────────────

  describe('getTimeout()', () => {
    it('returns base timeout before enough samples', () => {
      const t = new AdaptiveTimeout({ baseTimeoutMs: 5000, minSamples: 10 });
      for (let i = 0; i < 9; i++) t.record(100);
      expect(t.getTimeout()).toBe(5000);
    });

    it('uses p95 × marginFactor after enough samples', () => {
      const t = new AdaptiveTimeout({
        minSamples: 5,
        marginFactor: 2,
        baseTimeoutMs: 1000,
      });
      // Record 5 uniform samples of 100ms
      for (let i = 0; i < 5; i++) t.record(100);
      // p95 = 100, margin = 2 → adaptive = 200
      expect(t.getTimeout()).toBe(200);
    });

    it('respects minTimeoutMs', () => {
      const t = new AdaptiveTimeout({
        minSamples: 5,
        marginFactor: 1,
        minTimeoutMs: 500,
      });
      for (let i = 0; i < 5; i++) t.record(10); // p95=10, *1=10 < 500
      expect(t.getTimeout()).toBe(500);
    });

    it('respects maxTimeoutMs', () => {
      const t = new AdaptiveTimeout({
        minSamples: 5,
        marginFactor: 10,
        maxTimeoutMs: 1000,
      });
      for (let i = 0; i < 5; i++) t.record(500); // p95=500, *10=5000 > 1000
      expect(t.getTimeout()).toBe(1000);
    });
  });

  // ── reset() ──────────────────────────────────────────────────────────────────

  describe('reset()', () => {
    it('clears all samples', () => {
      const t = new AdaptiveTimeout();
      t.record(100);
      t.record(200);
      t.reset();
      expect(t.sampleCount).toBe(0);
    });

    it('reverts to base timeout after reset', () => {
      const t = new AdaptiveTimeout({ baseTimeoutMs: 3000, minSamples: 2 });
      t.record(100);
      t.record(100);
      const before = t.getTimeout();
      t.reset();
      expect(t.getTimeout()).toBe(3000);
      expect(before).not.toBe(3000); // was adaptive before reset
    });
  });
});

// ── withAdaptiveTimeout() ─────────────────────────────────────────────────────

describe('withAdaptiveTimeout()', () => {
  it('resolves with the operation result', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    const result = await withAdaptiveTimeout(t, async () => 42);
    expect(result).toBe(42);
  });

  it('records latency after successful operation', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    await withAdaptiveTimeout(t, async () => 'ok');
    expect(t.sampleCount).toBe(1);
  });

  it('rejects when operation throws', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    await expect(
      withAdaptiveTimeout(t, async () => { throw new Error('boom'); })
    ).rejects.toThrow('boom');
  });

  it('still records latency on error', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    try {
      await withAdaptiveTimeout(t, async () => { throw new Error('x'); });
    } catch {
      // expected
    }
    expect(t.sampleCount).toBe(1);
  });

  it('rejects with timeout error when operation is too slow', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 10 }); // 10ms timeout
    // 50ms > 10ms outer timeout — still demonstrates the timeout; short enough not to leak.
    await expect(
      withAdaptiveTimeout(t, () => new Promise((r) => setTimeout(r, 50)))
    ).rejects.toThrow(/timed out/i);
  });

  it('uses custom error message on timeout', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 10 });
    await expect(
      withAdaptiveTimeout(t, () => new Promise((r) => setTimeout(r, 50)), 'Database call timed out')
    ).rejects.toThrow('Database call timed out');
  });
});

// ── Additional edge cases ─────────────────────────────────────────────────────

describe('AdaptiveTimeout — edge cases and boundary conditions', () => {
  it('percentile(0) returns the minimum value', () => {
    const t = new AdaptiveTimeout();
    [10, 20, 30, 40, 50].forEach((v) => t.record(v));
    expect(t.percentile(0)).toBe(10);
  });

  it('percentile(100) with single sample returns that sample', () => {
    const t = new AdaptiveTimeout();
    t.record(777);
    expect(t.percentile(100)).toBe(777);
  });

  it('windowSize=1 only retains the latest sample', () => {
    const t = new AdaptiveTimeout({ windowSize: 1 });
    t.record(100);
    t.record(200);
    t.record(300);
    expect(t.sampleCount).toBe(1);
    expect(t.percentile(50)).toBe(300);
  });

  it('getTimeout with exactly minSamples samples uses adaptive logic', () => {
    const t = new AdaptiveTimeout({ minSamples: 3, marginFactor: 1, baseTimeoutMs: 9999 });
    t.record(200);
    t.record(200);
    t.record(200);
    // exactly minSamples — should use adaptive (p95=200, *1=200)
    expect(t.getTimeout()).toBe(200);
  });

  it('getTimeout rounds to integer (no decimals)', () => {
    const t = new AdaptiveTimeout({ minSamples: 1, marginFactor: 1.333, maxTimeoutMs: 60000 });
    t.record(300);
    const timeout = t.getTimeout();
    expect(Number.isInteger(timeout)).toBe(true);
  });

  it('reset allows fresh samples to be recorded', () => {
    const t = new AdaptiveTimeout({ minSamples: 2 });
    t.record(100);
    t.record(100);
    t.reset();
    t.record(500);
    // Only 1 sample after reset, below minSamples=2, so falls back to base
    expect(t.getTimeout()).toBe(t['cfg'].baseTimeoutMs);
  });

  it('multiple records do not exceed windowSize=10', () => {
    const t = new AdaptiveTimeout({ windowSize: 10 });
    for (let i = 0; i < 20; i++) t.record(i * 5);
    expect(t.sampleCount).toBe(10);
  });

  it('withAdaptiveTimeout records exactly 1 sample per invocation', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 5000 });
    await withAdaptiveTimeout(t, async () => 'result1');
    await withAdaptiveTimeout(t, async () => 'result2');
    expect(t.sampleCount).toBe(2);
  });

  it('percentile with all identical samples returns that sample', () => {
    const t = new AdaptiveTimeout();
    [50, 50, 50, 50, 50].forEach((v) => t.record(v));
    expect(t.percentile(95)).toBe(50);
    expect(t.percentile(50)).toBe(50);
  });

  it('getTimeout clamps below minTimeoutMs=200', () => {
    const t = new AdaptiveTimeout({
      minSamples: 2,
      marginFactor: 0.1,
      minTimeoutMs: 200,
      maxTimeoutMs: 5000,
    });
    t.record(50);
    t.record(50);
    // p95=50 * 0.1 = 5, clamped up to 200
    expect(t.getTimeout()).toBe(200);
  });
});

describe('AdaptiveTimeout — additional boundary tests', () => {
  it('default baseTimeoutMs is 5000', () => {
    const t = new AdaptiveTimeout();
    expect(t.getTimeout()).toBe(5000);
  });

  it('default minSamples is 10 — 9 samples still uses base', () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 2000 });
    for (let i = 0; i < 9; i++) t.record(100);
    expect(t.getTimeout()).toBe(2000);
  });

  it('percentile(50) with two samples returns lower of the two', () => {
    const t = new AdaptiveTimeout();
    t.record(100);
    t.record(200);
    // sorted [100, 200], p50: ceil(0.5*2)-1 = 0 → 100
    expect(t.percentile(50)).toBe(100);
  });

  it('sampleCount is 0 after construction', () => {
    expect(new AdaptiveTimeout({ windowSize: 100 }).sampleCount).toBe(0);
  });

  it('reset() after zero records does not throw', () => {
    const t = new AdaptiveTimeout();
    expect(() => t.reset()).not.toThrow();
    expect(t.sampleCount).toBe(0);
  });

  it('withAdaptiveTimeout resolves with null correctly', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 1000 });
    const result = await withAdaptiveTimeout(t, async () => null);
    expect(result).toBeNull();
  });
});
