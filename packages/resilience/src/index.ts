import CircuitBreaker from 'opossum';

/**
 * Circuit Breaker and Resilience Patterns for IMS Microservices
 */

export interface CircuitBreakerOptions {
  /** Time in milliseconds before the action times out */
  timeout?: number;
  /** Error percentage at which to open the circuit */
  errorThresholdPercentage?: number;
  /** Time in milliseconds to wait before testing if the service is back */
  resetTimeout?: number;
  /** Time in milliseconds for the rolling window */
  rollingCountTimeout?: number;
  /** Number of buckets for the rolling window */
  rollingCountBuckets?: number;
  /** Name for logging and identification */
  name?: string;
  /** Volume threshold - minimum requests before circuit can trip */
  volumeThreshold?: number;
  /** Enable/disable the circuit breaker */
  enabled?: boolean;
}

export interface CircuitBreakerStats {
  name: string;
  state: 'OPEN' | 'HALF_OPEN' | 'CLOSED';
  failures: number;
  successes: number;
  fallbacks: number;
  timeouts: number;
  cacheHits: number;
  cacheMisses: number;
  percentile: {
    0: number;
    25: number;
    50: number;
    75: number;
    90: number;
    95: number;
    99: number;
    99.5: number;
    99.9: number;
    100: number;
  };
}

export type CircuitBreakerState = 'OPEN' | 'HALF_OPEN' | 'CLOSED';

export interface CircuitBreakerEventHandlers {
  onOpen?: (name: string) => void;
  onClose?: (name: string) => void;
  onHalfOpen?: (name: string) => void;
  onSuccess?: (name: string, result: unknown) => void;
  onFailure?: (name: string, error: Error) => void;
  onTimeout?: (name: string) => void;
  onFallback?: (name: string, result: unknown) => void;
}

const DEFAULT_OPTIONS: Required<Omit<CircuitBreakerOptions, 'name'>> = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
  rollingCountTimeout: 10000,
  rollingCountBuckets: 10,
  volumeThreshold: 5,
  enabled: true,
};

// Global registry of circuit breakers
const circuitBreakerRegistry = new Map<string, CircuitBreaker<unknown[], unknown>>();

/**
 * Create a circuit breaker for an async function
 */
export function createCircuitBreaker<TArgs extends unknown[], TResult>(
  asyncFunction: (...args: TArgs) => Promise<TResult>,
  options: CircuitBreakerOptions = {},
  eventHandlers?: CircuitBreakerEventHandlers
): CircuitBreaker<TArgs, TResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const name = opts.name || `circuit-${Date.now()}`;

  if (!opts.enabled) {
    // Return a pass-through "breaker" that just calls the function
    const passThrough = {
      fire: asyncFunction,
      fallback: () => passThrough,
      on: () => passThrough,
      isOpen: () => false,
      isClosed: () => true,
      isHalfOpen: () => false,
      stats: { failures: 0, successes: 0 },
      status: { state: 'CLOSED' },
    } as unknown as CircuitBreaker<TArgs, TResult>;
    return passThrough;
  }

  const breaker = new CircuitBreaker<TArgs, TResult>(asyncFunction, {
    timeout: opts.timeout,
    errorThresholdPercentage: opts.errorThresholdPercentage,
    resetTimeout: opts.resetTimeout,
    rollingCountTimeout: opts.rollingCountTimeout,
    rollingCountBuckets: opts.rollingCountBuckets,
    volumeThreshold: opts.volumeThreshold,
    name,
  });

  // Attach event handlers
  if (eventHandlers?.onOpen) {
    breaker.on('open', () => eventHandlers.onOpen!(name));
  }

  if (eventHandlers?.onClose) {
    breaker.on('close', () => eventHandlers.onClose!(name));
  }

  if (eventHandlers?.onHalfOpen) {
    breaker.on('halfOpen', () => eventHandlers.onHalfOpen!(name));
  }

  if (eventHandlers?.onSuccess) {
    breaker.on('success', (result: unknown) => eventHandlers.onSuccess!(name, result));
  }

  if (eventHandlers?.onFailure) {
    breaker.on('failure', (error: Error) => eventHandlers.onFailure!(name, error));
  }

  if (eventHandlers?.onTimeout) {
    breaker.on('timeout', () => eventHandlers.onTimeout!(name));
  }

  if (eventHandlers?.onFallback) {
    breaker.on('fallback', (result: unknown) => eventHandlers.onFallback!(name, result));
  }

  // Register the breaker
  circuitBreakerRegistry.set(name, breaker as CircuitBreaker<unknown[], unknown>);

  return breaker;
}

/**
 * Get a circuit breaker by name
 */
export function getCircuitBreaker(name: string): CircuitBreaker<unknown[], unknown> | undefined {
  return circuitBreakerRegistry.get(name);
}

/**
 * Get all registered circuit breakers
 */
export function getAllCircuitBreakers(): Map<string, CircuitBreaker<unknown[], unknown>> {
  return new Map(circuitBreakerRegistry);
}

/**
 * Get the state of a circuit breaker
 */
export function getCircuitBreakerState(breaker: CircuitBreaker<unknown[], unknown>): CircuitBreakerState {
  if (breaker.opened) return 'OPEN';
  if (breaker.halfOpen) return 'HALF_OPEN';
  return 'CLOSED';
}

/**
 * Get stats for all circuit breakers
 */
export function getCircuitBreakerStats(): Record<string, { state: CircuitBreakerState; stats: unknown }> {
  const result: Record<string, { state: CircuitBreakerState; stats: unknown }> = {};

  for (const [name, breaker] of circuitBreakerRegistry) {
    result[name] = {
      state: getCircuitBreakerState(breaker),
      stats: breaker.stats,
    };
  }

  return result;
}

/**
 * Reset a circuit breaker
 */
export function resetCircuitBreaker(name: string): boolean {
  const breaker = circuitBreakerRegistry.get(name);
  if (breaker) {
    breaker.close();
    return true;
  }
  return false;
}

/**
 * Clear all circuit breakers (for testing)
 */
export function clearCircuitBreakers(): void {
  for (const breaker of circuitBreakerRegistry.values()) {
    breaker.shutdown();
  }
  circuitBreakerRegistry.clear();
}

/**
 * Retry pattern with exponential backoff
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Backoff multiplier */
  backoffMultiplier?: number;
  /** Jitter factor (0-1) to randomize delays */
  jitter?: number;
  /** Function to determine if an error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Callback for each retry attempt */
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'isRetryable'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: 0.1,
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (opts.isRetryable && !opts.isRetryable(lastError)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      // Add jitter
      const jitterAmount = delay * opts.jitter * (Math.random() * 2 - 1);
      delay = Math.round(delay + jitterAmount);

      // Notify about retry
      opts.onRetry?.(attempt, lastError, delay);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Timeout wrapper for async functions
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Bulkhead pattern - limit concurrent executions
 */
export class Bulkhead {
  private readonly maxConcurrent: number;
  private readonly maxQueue: number;
  private running = 0;
  private queue: Array<{
    fn: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor(maxConcurrent: number, maxQueue = 100) {
    this.maxConcurrent = maxConcurrent;
    this.maxQueue = maxQueue;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running < this.maxConcurrent) {
      return this.run(fn);
    }

    if (this.queue.length >= this.maxQueue) {
      throw new Error('Bulkhead queue is full');
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve: resolve as (value: unknown) => void, reject });
    });
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    this.running++;

    try {
      return await fn();
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const { fn, resolve, reject } = this.queue.shift()!;
      this.run(fn).then(resolve).catch(reject);
    }
  }

  get stats() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      maxQueue: this.maxQueue,
    };
  }
}

/**
 * Create a service client with circuit breaker
 */
export interface ServiceClientOptions extends CircuitBreakerOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  retryOptions?: RetryOptions;
}

export function createServiceClient(options: ServiceClientOptions) {
  const { baseUrl, headers = {}, retryOptions, ...breakerOptions } = options;

  const makeRequest = async <T>(
    path: string,
    requestOptions: RequestInit = {}
  ): Promise<T> => {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...requestOptions.headers,
      },
    });

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }

    return response.json() as Promise<T>;
  };

  const breaker = createCircuitBreaker(
    async <T>(path: string, requestOptions: RequestInit = {}): Promise<T> => {
      if (retryOptions) {
        return withRetry(() => makeRequest<T>(path, requestOptions), retryOptions);
      }
      return makeRequest<T>(path, requestOptions);
    },
    breakerOptions
  );

  return {
    get: <T>(path: string, options?: RequestInit) =>
      breaker.fire(path, { ...options, method: 'GET' }) as Promise<T>,

    post: <T>(path: string, body: unknown, options?: RequestInit) =>
      breaker.fire(path, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
      }) as Promise<T>,

    put: <T>(path: string, body: unknown, options?: RequestInit) =>
      breaker.fire(path, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
      }) as Promise<T>,

    patch: <T>(path: string, body: unknown, options?: RequestInit) =>
      breaker.fire(path, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(body),
      }) as Promise<T>,

    delete: <T>(path: string, options?: RequestInit) =>
      breaker.fire(path, { ...options, method: 'DELETE' }) as Promise<T>,

    breaker,
  };
}

// Export the CircuitBreaker type for use in other modules
export { CircuitBreaker };

export default {
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
  createServiceClient,
};
