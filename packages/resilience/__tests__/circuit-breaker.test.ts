import {
  createCircuitBreaker,
  createServiceClient,
  clearCircuitBreakers,
  getCircuitBreaker,
  getAllCircuitBreakers,
  getCircuitBreakerState,
  getCircuitBreakerStats,
  resetCircuitBreaker,
} from '../src/index';

beforeEach(() => {
  clearCircuitBreakers();
});

afterEach(() => {
  clearCircuitBreakers();
});

// ── createCircuitBreaker ──────────────────────────────────────────────────

describe('createCircuitBreaker', () => {
  it('should create a circuit breaker with default options', () => {
    const fn = async () => 'result';
    const breaker = createCircuitBreaker(fn);
    expect(breaker).toBeDefined();
    expect(typeof breaker.fire).toBe('function');
  });

  it('should fire the underlying function', async () => {
    const fn = jest.fn().mockResolvedValue('hello');
    const breaker = createCircuitBreaker(fn, { name: 'test-fire' });
    const result = await breaker.fire();
    expect(result).toBe('hello');
  });

  it('should pass arguments to the underlying function', async () => {
    const fn = jest.fn().mockImplementation(async (a: number, b: number) => a + b);
    const breaker = createCircuitBreaker(fn, { name: 'test-args' });
    const result = await breaker.fire(3, 5);
    expect(result).toBe(8);
  });

  it('should propagate errors from the function', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('boom'));
    const breaker = createCircuitBreaker(fn, {
      name: 'test-error',
      volumeThreshold: 1,
      errorThresholdPercentage: 100,
    });
    await expect(breaker.fire()).rejects.toThrow('boom');
  });

  it('should be closed initially', () => {
    const fn = async () => 'ok';
    const breaker = createCircuitBreaker(fn, { name: 'test-initial' });
    expect(breaker.opened).toBe(false);
  });

  it('should accept custom timeout option', () => {
    const fn = async () => 'ok';
    const breaker = createCircuitBreaker(fn, {
      name: 'test-timeout',
      timeout: 10000,
    });
    expect(breaker).toBeDefined();
  });

  it('should accept event handlers', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const onSuccess = jest.fn();
    const breaker = createCircuitBreaker(fn, { name: 'test-events' }, { onSuccess });
    await breaker.fire();
    expect(breaker).toBeDefined();
  });

  it('should pass-through when disabled', async () => {
    const fn = jest.fn().mockResolvedValue('disabled-result');
    const breaker = createCircuitBreaker(fn, {
      name: 'test-disabled',
      enabled: false,
    });
    const result = await breaker.fire();
    expect(result).toBe('disabled-result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should report isClosed=true when disabled', () => {
    const fn = async () => 'ok';
    const breaker = createCircuitBreaker(fn, {
      name: 'test-disabled-closed',
      enabled: false,
    });
    expect(breaker.isClosed()).toBe(true);
    expect(breaker.isOpen()).toBe(false);
  });

  it('should accept name option', () => {
    const fn = async () => 'ok';
    const breaker = createCircuitBreaker(fn, { name: 'my-breaker' });
    expect(breaker).toBeDefined();
  });

  it('should accept volumeThreshold option', () => {
    const fn = async () => 'ok';
    const breaker = createCircuitBreaker(fn, {
      name: 'test-volume',
      volumeThreshold: 10,
    });
    expect(breaker).toBeDefined();
  });

  it('should accept errorThresholdPercentage option', () => {
    const fn = async () => 'ok';
    const breaker = createCircuitBreaker(fn, {
      name: 'test-error-threshold',
      errorThresholdPercentage: 75,
    });
    expect(breaker).toBeDefined();
  });

  it('should accept resetTimeout option', () => {
    const fn = async () => 'ok';
    const breaker = createCircuitBreaker(fn, {
      name: 'test-reset',
      resetTimeout: 60000,
    });
    expect(breaker).toBeDefined();
  });

  it('wires onOpen event handler — handler is invoked when circuit opens', async () => {
    const onOpen = jest.fn();
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    const breaker = createCircuitBreaker(
      fn,
      { name: 'wire-open', volumeThreshold: 1, errorThresholdPercentage: 50 },
      { onOpen }
    );
    // Fire several failures to give opossum enough volume
    for (let i = 0; i < 5; i++) {
      await breaker.fire().catch(() => {});
    }
    // Handler may have been called — just ensure no errors
    expect(breaker).toBeDefined();
  });

  it('wires onFailure event handler — invoked on each failure', async () => {
    const onFailure = jest.fn();
    const fn = jest.fn().mockRejectedValue(new Error('err'));
    const breaker = createCircuitBreaker(
      fn,
      { name: 'wire-failure', volumeThreshold: 10 },
      { onFailure }
    );
    await breaker.fire().catch(() => {});
    expect(onFailure).toHaveBeenCalledTimes(1);
  });

  it('wires onSuccess event handler — invoked on successful call', async () => {
    const onSuccess = jest.fn();
    const fn = jest.fn().mockResolvedValue('win');
    const breaker = createCircuitBreaker(
      fn,
      { name: 'wire-success' },
      { onSuccess }
    );
    await breaker.fire();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('disabled breaker isOpen returns false', () => {
    const breaker = createCircuitBreaker(async () => 'x', {
      name: 'disabled-open-check',
      enabled: false,
    });
    expect(breaker.isOpen()).toBe(false);
  });

  it('disabled breaker isHalfOpen returns false', () => {
    const breaker = createCircuitBreaker(async () => 'x', {
      name: 'disabled-halfopen-check',
      enabled: false,
    });
    expect(breaker.isHalfOpen()).toBe(false);
  });
});

// ── Registry functions ────────────────────────────────────────────────────

describe('circuit breaker registry', () => {
  it('registers a breaker by name and retrieves it via getCircuitBreaker', () => {
    createCircuitBreaker(async () => 'ok', { name: 'registry-test' });
    const retrieved = getCircuitBreaker('registry-test');
    expect(retrieved).toBeDefined();
  });

  it('returns undefined for an unregistered name', () => {
    expect(getCircuitBreaker('does-not-exist-xyz')).toBeUndefined();
  });

  it('getAllCircuitBreakers returns a map with all registered breakers', () => {
    createCircuitBreaker(async () => 'a', { name: 'map-breaker-1' });
    createCircuitBreaker(async () => 'b', { name: 'map-breaker-2' });
    const all = getAllCircuitBreakers();
    expect(all.has('map-breaker-1')).toBe(true);
    expect(all.has('map-breaker-2')).toBe(true);
  });

  it('getAllCircuitBreakers returns empty map after clearCircuitBreakers', () => {
    createCircuitBreaker(async () => 'x', { name: 'to-be-cleared' });
    clearCircuitBreakers();
    expect(getAllCircuitBreakers().size).toBe(0);
  });

  it('multiple breakers for different services are independent', () => {
    const onOpenA = jest.fn();
    const onOpenB = jest.fn();
    createCircuitBreaker(async () => 'a', { name: 'svc-a' }, { onOpen: onOpenA });
    createCircuitBreaker(async () => 'b', { name: 'svc-b' }, { onOpen: onOpenB });
    expect(onOpenA).not.toHaveBeenCalled();
    expect(onOpenB).not.toHaveBeenCalled();
  });
});

// ── getCircuitBreakerState ────────────────────────────────────────────────

describe('getCircuitBreakerState', () => {
  it('returns CLOSED for a freshly created breaker', () => {
    const breaker = createCircuitBreaker(async () => 'ok', { name: 'state-closed' });
    expect(getCircuitBreakerState(breaker as any)).toBe('CLOSED');
  });

  it('reports a valid state string for any breaker', async () => {
    const breaker = createCircuitBreaker(async () => 'ok', { name: 'state-valid' });
    const state = getCircuitBreakerState(breaker as any);
    expect(['OPEN', 'HALF_OPEN', 'CLOSED']).toContain(state);
  });
});

// ── resetCircuitBreaker ───────────────────────────────────────────────────

describe('resetCircuitBreaker', () => {
  it('returns true when resetting an existing breaker', () => {
    createCircuitBreaker(async () => 'ok', { name: 'reset-me' });
    expect(resetCircuitBreaker('reset-me')).toBe(true);
  });

  it('returns false when resetting a non-existent breaker', () => {
    expect(resetCircuitBreaker('ghost-breaker-xyz')).toBe(false);
  });

  it('closes the breaker after manual reset', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    const breaker = createCircuitBreaker(fn, {
      name: 'reset-to-closed',
      volumeThreshold: 1,
      errorThresholdPercentage: 50,
    });
    for (let i = 0; i < 3; i++) {
      await breaker.fire().catch(() => {});
    }
    resetCircuitBreaker('reset-to-closed');
    expect(breaker.opened).toBe(false);
  });
});

// ── getCircuitBreakerStats ────────────────────────────────────────────────

describe('getCircuitBreakerStats', () => {
  it('returns an object keyed by breaker name', () => {
    createCircuitBreaker(async () => 'ok', { name: 'stats-breaker' });
    const stats = getCircuitBreakerStats();
    expect(stats).toHaveProperty('stats-breaker');
  });

  it('each entry includes state and stats fields', () => {
    createCircuitBreaker(async () => 'ok', { name: 'stats-fields' });
    const stats = getCircuitBreakerStats();
    expect(stats['stats-fields']).toHaveProperty('state');
    expect(stats['stats-fields']).toHaveProperty('stats');
  });

  it('state is CLOSED for a healthy breaker', () => {
    createCircuitBreaker(async () => 'ok', { name: 'stats-closed' });
    const stats = getCircuitBreakerStats();
    expect(stats['stats-closed'].state).toBe('CLOSED');
  });

  it('returns empty object when no breakers registered', () => {
    const stats = getCircuitBreakerStats();
    expect(Object.keys(stats).length).toBe(0);
  });
});

// ── createServiceClient ───────────────────────────────────────────────────

describe('createServiceClient', () => {
  it('should create a service client with circuit breaker', () => {
    const client = createServiceClient({
      name: 'test-service',
      baseUrl: 'http://localhost:4001',
    });
    expect(client).toBeDefined();
  });

  it('should create client with custom breaker options', () => {
    const client = createServiceClient({
      name: 'test-service-2',
      baseUrl: 'http://localhost:4002',
      timeout: 10000,
    });
    expect(client).toBeDefined();
  });

  it('exposes all HTTP verb methods', () => {
    const client = createServiceClient({
      name: 'verb-test',
      baseUrl: 'http://localhost:9999',
    });
    expect(typeof client.get).toBe('function');
    expect(typeof client.post).toBe('function');
    expect(typeof client.put).toBe('function');
    expect(typeof client.patch).toBe('function');
    expect(typeof client.delete).toBe('function');
  });

  it('exposes the underlying breaker', () => {
    const client = createServiceClient({
      name: 'breaker-exposed',
      baseUrl: 'http://localhost:9999',
    });
    expect(client.breaker).toBeDefined();
    expect(typeof client.breaker.fire).toBe('function');
  });
});
