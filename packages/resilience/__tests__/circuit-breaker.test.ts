import { createCircuitBreaker, createServiceClient, clearCircuitBreakers } from '../src/index';

afterAll(() => {
  // Shut down opossum rolling-window timers to prevent open-handle leaks.
  clearCircuitBreakers();
});

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
    // Opossum breaker has opened/halfOpen booleans
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
    // Event handlers are wired but may be called async
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
});

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
      circuitBreaker: {
        errorThresholdPercentage: 75,
        resetTimeout: 60000,
      },
    });
    expect(client).toBeDefined();
  });
});
