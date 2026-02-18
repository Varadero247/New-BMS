import { withRetry, withTimeout, Bulkhead } from '../src/index';

describe('withRetry — comprehensive', () => {
  it('should succeed on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');
    const result = await withRetry(fn, { maxAttempts: 3, initialDelay: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const fn = jest.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('success');
    const result = await withRetry(fn, { maxAttempts: 3, initialDelay: 10 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after max attempts exhausted', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('always fails'));
    await expect(withRetry(fn, { maxAttempts: 3, initialDelay: 10 })).rejects.toThrow(
      'always fails'
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use default options when none provided', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
  });

  it('should respect maxAttempts of 1 (no retries)', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(withRetry(fn, { maxAttempts: 1, initialDelay: 10 })).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should stop retrying for non-retryable errors', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('not retryable'));
    const isRetryable = (e: Error) => e.message !== 'not retryable';

    await expect(withRetry(fn, { maxAttempts: 5, initialDelay: 10, isRetryable })).rejects.toThrow(
      'not retryable'
    );
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry for retryable errors', async () => {
    const fn = jest.fn().mockRejectedValueOnce(new Error('retryable')).mockResolvedValue('ok');
    const isRetryable = () => true;

    const result = await withRetry(fn, { maxAttempts: 3, initialDelay: 10, isRetryable });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call onRetry callback for each retry', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const onRetry = jest.fn();

    await withRetry(fn, { maxAttempts: 5, initialDelay: 10, onRetry });
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number));
    expect(onRetry).toHaveBeenCalledWith(2, expect.any(Error), expect.any(Number));
  });

  it('should not call onRetry on the first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const onRetry = jest.fn();

    await withRetry(fn, { maxAttempts: 3, initialDelay: 10, onRetry });
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('should apply exponential backoff', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const delays: number[] = [];
    const onRetry = (_: number, __: Error, delay: number) => delays.push(delay);

    await withRetry(fn, {
      maxAttempts: 5,
      initialDelay: 100,
      backoffMultiplier: 2,
      jitter: 0,
      onRetry,
    });

    // delay 1 ~= 100, delay 2 ~= 200 (with 0 jitter)
    expect(delays[0]).toBeCloseTo(100, -1);
    expect(delays[1]).toBeCloseTo(200, -1);
  });

  it('should cap delay at maxDelay', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const delays: number[] = [];
    const onRetry = (_: number, __: Error, delay: number) => delays.push(delay);

    await withRetry(fn, {
      maxAttempts: 5,
      initialDelay: 100,
      maxDelay: 150,
      backoffMultiplier: 10,
      jitter: 0,
      onRetry,
    });

    expect(delays[0]).toBeCloseTo(100, -1);
    expect(delays[1]).toBeLessThanOrEqual(160); // maxDelay + some jitter tolerance
  });
});

describe('withTimeout — comprehensive', () => {
  it('should resolve when function completes within timeout', async () => {
    const fn = () => new Promise<string>((resolve) => setTimeout(() => resolve('done'), 10));
    const result = await withTimeout(fn, 5000);
    expect(result).toBe('done');
  });

  it('should reject when function exceeds timeout', async () => {
    const fn = () => new Promise<string>((resolve) => setTimeout(() => resolve('done'), 500));
    await expect(withTimeout(fn, 10)).rejects.toThrow('Operation timed out');
  });

  it('should use custom error message', async () => {
    const fn = () => new Promise<string>((resolve) => setTimeout(() => resolve('done'), 500));
    await expect(withTimeout(fn, 10, 'Custom timeout message')).rejects.toThrow(
      'Custom timeout message'
    );
  });

  it('should propagate errors from the function', async () => {
    const fn = () => Promise.reject(new Error('function error'));
    await expect(withTimeout(fn, 5000)).rejects.toThrow('function error');
  });

  it('should resolve immediately for instant functions', async () => {
    const fn = () => Promise.resolve(42);
    const result = await withTimeout(fn, 1000);
    expect(result).toBe(42);
  });

  it('should handle returning complex objects', async () => {
    const fn = () => Promise.resolve({ key: 'value', nested: { num: 42 } });
    const result = await withTimeout(fn, 1000);
    expect(result).toEqual({ key: 'value', nested: { num: 42 } });
  });
});

describe('Bulkhead — comprehensive', () => {
  it('should execute function immediately when under limit', async () => {
    const bulkhead = new Bulkhead(5);
    const result = await bulkhead.execute(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('should track running count', async () => {
    const bulkhead = new Bulkhead(5);
    expect(bulkhead.stats.running).toBe(0);

    let resolveInner: Function;
    const pending = bulkhead.execute(
      () =>
        new Promise((resolve) => {
          resolveInner = resolve;
        })
    );

    // Small delay to let execution start
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(bulkhead.stats.running).toBe(1);

    resolveInner!('done');
    await pending;
    expect(bulkhead.stats.running).toBe(0);
  });

  it('should queue when at max concurrent', async () => {
    const bulkhead = new Bulkhead(1);
    const resolvers: Function[] = [];

    const p1 = bulkhead.execute(() => new Promise((resolve) => resolvers.push(resolve)));
    const p2 = bulkhead.execute(() => new Promise((resolve) => resolvers.push(resolve)));

    await new Promise((r) => setTimeout(r, 10));
    expect(bulkhead.stats.queued).toBe(1);

    resolvers[0]('first');
    await p1;

    await new Promise((r) => setTimeout(r, 10));
    resolvers[1]('second');
    const result = await p2;
    expect(result).toBe('second');
  });

  it('should reject when queue is full', async () => {
    const bulkhead = new Bulkhead(1, 1);
    const resolvers: Function[] = [];

    bulkhead.execute(() => new Promise((resolve) => resolvers.push(resolve)));
    bulkhead.execute(() => new Promise((resolve) => resolvers.push(resolve)));

    await expect(bulkhead.execute(() => Promise.resolve('overflow'))).rejects.toThrow(
      'Bulkhead queue is full'
    );

    // Cleanup
    resolvers.forEach((r) => r('done'));
  });

  it('should report stats correctly', () => {
    const bulkhead = new Bulkhead(3, 10);
    const stats = bulkhead.stats;
    expect(stats.maxConcurrent).toBe(3);
    expect(stats.maxQueue).toBe(10);
    expect(stats.running).toBe(0);
    expect(stats.queued).toBe(0);
  });

  it('should handle errors in executed functions', async () => {
    const bulkhead = new Bulkhead(5);
    await expect(bulkhead.execute(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');

    // Bulkhead should still work after error
    const result = await bulkhead.execute(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
  });

  it('should default maxQueue to 100', () => {
    const bulkhead = new Bulkhead(5);
    expect(bulkhead.stats.maxQueue).toBe(100);
  });

  it('should process queue in FIFO order', async () => {
    const bulkhead = new Bulkhead(1);
    const resolvers: Function[] = [];
    const results: string[] = [];

    bulkhead.execute(() => new Promise((resolve) => resolvers.push(resolve)));
    const p2 = bulkhead.execute(async () => {
      results.push('second');
      return 'second';
    });
    const p3 = bulkhead.execute(async () => {
      results.push('third');
      return 'third';
    });

    await new Promise((r) => setTimeout(r, 10));
    resolvers[0]('first');

    await p2;
    await p3;

    expect(results).toEqual(['second', 'third']);
  });
});
