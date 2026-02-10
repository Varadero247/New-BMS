import {
  createCircuitBreaker,
  getCircuitBreaker,
  getAllCircuitBreakers,
  getCircuitBreakerState,
  getCircuitBreakerStats,
  resetCircuitBreaker,
  clearCircuitBreakers,
  withRetry,
  withTimeout,
  Bulkhead,
} from '../src/index';

describe('Resilience Package', () => {
  beforeEach(() => {
    clearCircuitBreakers();
  });

  afterEach(() => {
    clearCircuitBreakers();
  });

  describe('createCircuitBreaker', () => {
    it('should create a circuit breaker', () => {
      const fn = jest.fn().mockResolvedValue('success');
      const breaker = createCircuitBreaker(fn, { name: 'test-breaker' });

      expect(breaker).toBeDefined();
      expect(typeof breaker.fire).toBe('function');
    });

    it('should execute the wrapped function successfully', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const breaker = createCircuitBreaker(fn, { name: 'success-breaker' });

      const result = await breaker.fire();
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should call event handlers on success', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const onSuccess = jest.fn();

      const breaker = createCircuitBreaker(fn, { name: 'event-breaker' }, { onSuccess });

      await breaker.fire();
      expect(onSuccess).toHaveBeenCalledWith('event-breaker', 'success');
    });

    it('should call event handlers on failure', async () => {
      const error = new Error('test error');
      const fn = jest.fn().mockRejectedValue(error);
      const onFailure = jest.fn();

      const breaker = createCircuitBreaker(fn, { name: 'failure-breaker' }, { onFailure });

      await expect(breaker.fire()).rejects.toThrow('test error');
      expect(onFailure).toHaveBeenCalledWith('failure-breaker', error);
    });

    it('should open circuit after threshold failures', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      const onOpen = jest.fn();

      const breaker = createCircuitBreaker(
        fn,
        {
          name: 'threshold-breaker',
          errorThresholdPercentage: 50,
          volumeThreshold: 2,
          rollingCountTimeout: 1000,
        },
        { onOpen }
      );

      // Trigger failures
      await expect(breaker.fire()).rejects.toThrow();
      await expect(breaker.fire()).rejects.toThrow();
      await expect(breaker.fire()).rejects.toThrow();

      // Wait for circuit to open
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(breaker.opened).toBe(true);
    });

    it('should return pass-through when disabled', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const breaker = createCircuitBreaker(fn, { name: 'disabled-breaker', enabled: false });

      const result = await breaker.fire();
      expect(result).toBe('success');
      expect((breaker as any).isOpen()).toBe(false);
      expect((breaker as any).isClosed()).toBe(true);
    });

    it('should register breaker in registry', () => {
      const fn = jest.fn().mockResolvedValue('success');
      createCircuitBreaker(fn, { name: 'registered-breaker' });

      const registered = getCircuitBreaker('registered-breaker');
      expect(registered).toBeDefined();
    });

    it('should use fallback when provided', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      const breaker = createCircuitBreaker(fn, { name: 'fallback-breaker' });

      breaker.fallback(() => 'fallback-value');

      // Trigger enough failures to open circuit
      for (let i = 0; i < 10; i++) {
        try {
          await breaker.fire();
        } catch {
          // ignore
        }
      }

      // Wait for circuit to open
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (breaker.opened) {
        const result = await breaker.fire();
        expect(result).toBe('fallback-value');
      }
    });
  });

  describe('getCircuitBreaker', () => {
    it('should return undefined for non-existent breaker', () => {
      const breaker = getCircuitBreaker('non-existent');
      expect(breaker).toBeUndefined();
    });

    it('should return existing breaker', () => {
      const fn = jest.fn().mockResolvedValue('success');
      createCircuitBreaker(fn, { name: 'get-test' });

      const breaker = getCircuitBreaker('get-test');
      expect(breaker).toBeDefined();
    });
  });

  describe('getAllCircuitBreakers', () => {
    it('should return empty map when no breakers exist', () => {
      const breakers = getAllCircuitBreakers();
      expect(breakers.size).toBe(0);
    });

    it('should return all registered breakers', () => {
      const fn = jest.fn().mockResolvedValue('success');
      createCircuitBreaker(fn, { name: 'breaker-1' });
      createCircuitBreaker(fn, { name: 'breaker-2' });
      createCircuitBreaker(fn, { name: 'breaker-3' });

      const breakers = getAllCircuitBreakers();
      expect(breakers.size).toBe(3);
      expect(breakers.has('breaker-1')).toBe(true);
      expect(breakers.has('breaker-2')).toBe(true);
      expect(breakers.has('breaker-3')).toBe(true);
    });
  });

  describe('getCircuitBreakerState', () => {
    it('should return CLOSED for healthy breaker', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const breaker = createCircuitBreaker(fn, { name: 'state-test' });

      await breaker.fire();

      const state = getCircuitBreakerState(breaker);
      expect(state).toBe('CLOSED');
    });
  });

  describe('getCircuitBreakerStats', () => {
    it('should return stats for all breakers', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      createCircuitBreaker(fn, { name: 'stats-1' });
      createCircuitBreaker(fn, { name: 'stats-2' });

      const stats = getCircuitBreakerStats();
      expect(stats['stats-1']).toBeDefined();
      expect(stats['stats-2']).toBeDefined();
      expect(stats['stats-1'].state).toBe('CLOSED');
    });
  });

  describe('resetCircuitBreaker', () => {
    it('should return false for non-existent breaker', () => {
      const result = resetCircuitBreaker('non-existent');
      expect(result).toBe(false);
    });

    it('should return true for existing breaker', () => {
      const fn = jest.fn().mockResolvedValue('success');
      createCircuitBreaker(fn, { name: 'reset-test' });

      const result = resetCircuitBreaker('reset-test');
      expect(result).toBe(true);
    });
  });

  describe('clearCircuitBreakers', () => {
    it('should clear all breakers', () => {
      const fn = jest.fn().mockResolvedValue('success');
      createCircuitBreaker(fn, { name: 'clear-1' });
      createCircuitBreaker(fn, { name: 'clear-2' });

      expect(getAllCircuitBreakers().size).toBe(2);

      clearCircuitBreakers();

      expect(getAllCircuitBreakers().size).toBe(0);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, {
        maxAttempts: 3,
        initialDelay: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('always fail'));

      await expect(
        withRetry(fn, {
          maxAttempts: 3,
          initialDelay: 10,
        })
      ).rejects.toThrow('always fail');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      const onRetry = jest.fn();

      await withRetry(fn, {
        maxAttempts: 3,
        initialDelay: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), expect.any(Number));
    });

    it('should respect isRetryable function', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('non-retryable'));

      await expect(
        withRetry(fn, {
          maxAttempts: 3,
          initialDelay: 10,
          isRetryable: () => false,
        })
      ).rejects.toThrow('non-retryable');

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should apply exponential backoff', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      const delays: number[] = [];

      await withRetry(fn, {
        maxAttempts: 3,
        initialDelay: 100,
        backoffMultiplier: 2,
        jitter: 0,
        onRetry: (_, __, delay) => delays.push(delay),
      });

      expect(delays[0]).toBe(100); // First retry: 100ms
      expect(delays[1]).toBe(200); // Second retry: 200ms
    });
  });

  describe('withTimeout', () => {
    it('should resolve before timeout', async () => {
      const fn = () => Promise.resolve('success');

      const result = await withTimeout(fn, 1000);

      expect(result).toBe('success');
    });

    it('should reject on timeout', async () => {
      const fn = () => new Promise((resolve) => setTimeout(() => resolve('late'), 200));

      await expect(withTimeout(fn, 50)).rejects.toThrow('Operation timed out');
    });

    it('should use custom error message', async () => {
      const fn = () => new Promise((resolve) => setTimeout(() => resolve('late'), 200));

      await expect(withTimeout(fn, 50, 'Custom timeout message')).rejects.toThrow(
        'Custom timeout message'
      );
    });

    it('should propagate function errors', async () => {
      const fn = () => Promise.reject(new Error('function error'));

      await expect(withTimeout(fn, 1000)).rejects.toThrow('function error');
    });
  });

  describe('Bulkhead', () => {
    it('should execute functions up to max concurrent', async () => {
      const bulkhead = new Bulkhead(2, 10);
      const results: number[] = [];

      const fn = async (n: number) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        results.push(n);
        return n;
      };

      const promises = [
        bulkhead.execute(() => fn(1)),
        bulkhead.execute(() => fn(2)),
        bulkhead.execute(() => fn(3)),
      ];

      await Promise.all(promises);

      expect(results).toHaveLength(3);
    });

    it('should queue excess requests', async () => {
      const bulkhead = new Bulkhead(1, 10);
      let running = 0;
      let maxRunning = 0;

      const fn = async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await new Promise((resolve) => setTimeout(resolve, 50));
        running--;
      };

      await Promise.all([
        bulkhead.execute(fn),
        bulkhead.execute(fn),
        bulkhead.execute(fn),
      ]);

      expect(maxRunning).toBe(1);
    });

    it('should reject when queue is full', async () => {
      const bulkhead = new Bulkhead(1, 1);

      const slowFn = () => new Promise((resolve) => setTimeout(resolve, 1000));

      // First call starts running
      const p1 = bulkhead.execute(slowFn);
      // Second call goes to queue
      const p2 = bulkhead.execute(slowFn);

      // Third call should fail - queue is full
      await expect(bulkhead.execute(slowFn)).rejects.toThrow('Bulkhead queue is full');

      // Cleanup - don't wait for these
      p1.catch(() => {});
      p2.catch(() => {});
    });

    it('should report stats correctly', () => {
      const bulkhead = new Bulkhead(5, 20);

      const stats = bulkhead.stats;

      expect(stats.running).toBe(0);
      expect(stats.queued).toBe(0);
      expect(stats.maxConcurrent).toBe(5);
      expect(stats.maxQueue).toBe(20);
    });
  });
});
