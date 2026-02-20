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
    await expect(
      withAdaptiveTimeout(t, () => new Promise((r) => setTimeout(r, 100)))
    ).rejects.toThrow(/timed out/i);
  });

  it('uses custom error message on timeout', async () => {
    const t = new AdaptiveTimeout({ baseTimeoutMs: 10 });
    await expect(
      withAdaptiveTimeout(t, () => new Promise((r) => setTimeout(r, 100)), 'Database call timed out')
    ).rejects.toThrow('Database call timed out');
  });
});
