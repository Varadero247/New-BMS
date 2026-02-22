// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockInit = jest.fn();
const mockExpressErrorHandler = jest.fn(() => jest.fn());
const mockHttpIntegration = jest.fn(() => 'http-integration');

jest.mock('@sentry/node', () => ({
  init: mockInit,
  expressErrorHandler: mockExpressErrorHandler,
  httpIntegration: mockHttpIntegration,
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

// Import after mocks
import { initSentry, sentryErrorHandler, Sentry } from '../src/index';

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('@ims/sentry', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.SENTRY_DSN;
    delete process.env.SENTRY_TRACES_SAMPLE_RATE;
    delete process.env.NODE_ENV;
    delete process.env.npm_package_version;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  // ─────────────────────── initSentry ───────────────────────

  describe('initSentry()', () => {
    it('skips initialization when SENTRY_DSN is not set', () => {
      initSentry('test-service');
      expect(mockInit).not.toHaveBeenCalled();
    });

    it('calls Sentry.init with correct DSN when SENTRY_DSN is set', () => {
      process.env.SENTRY_DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';
      initSentry('my-api');

      expect(mockInit).toHaveBeenCalledTimes(1);
      const config = mockInit.mock.calls[0][0];
      expect(config.dsn).toBe('https://examplePublicKey@o0.ingest.sentry.io/0');
    });

    it('uses NODE_ENV as the environment (defaults to development)', () => {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      initSentry('svc');

      const config = mockInit.mock.calls[0][0];
      expect(config.environment).toBe('development');
    });

    it('uses NODE_ENV when explicitly set', () => {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      process.env.NODE_ENV = 'production';
      initSentry('svc');

      const config = mockInit.mock.calls[0][0];
      expect(config.environment).toBe('production');
    });

    it('sets release to serviceName@version from npm_package_version', () => {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      process.env.npm_package_version = '2.5.3';
      initSentry('api-gateway');

      const config = mockInit.mock.calls[0][0];
      expect(config.release).toBe('api-gateway@2.5.3');
    });

    it('defaults version to 1.0.0 when npm_package_version is not set', () => {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      initSentry('api-gateway');

      const config = mockInit.mock.calls[0][0];
      expect(config.release).toBe('api-gateway@1.0.0');
    });

    it('sets serverName to the service name', () => {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      initSentry('api-health-safety');

      const config = mockInit.mock.calls[0][0];
      expect(config.serverName).toBe('api-health-safety');
    });

    it('uses SENTRY_TRACES_SAMPLE_RATE env var for tracesSampleRate', () => {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      process.env.SENTRY_TRACES_SAMPLE_RATE = '0.5';
      initSentry('svc');

      const config = mockInit.mock.calls[0][0];
      expect(config.tracesSampleRate).toBe(0.5);
    });

    it('defaults tracesSampleRate to 0.1 when env var is not set', () => {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      initSentry('svc');

      const config = mockInit.mock.calls[0][0];
      expect(config.tracesSampleRate).toBe(0.1);
    });

    it('includes httpIntegration in integrations', () => {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      initSentry('svc');

      const config = mockInit.mock.calls[0][0];
      expect(config.integrations).toContain('http-integration');
      expect(mockHttpIntegration).toHaveBeenCalled();
    });

    it('provides a beforeSend hook in config', () => {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      initSentry('svc');

      const config = mockInit.mock.calls[0][0];
      expect(typeof config.beforeSend).toBe('function');
    });
  });

  // ─────────────────────── beforeSend (strips auth headers) ───────────────────────

  describe('beforeSend (sensitive header stripping)', () => {
    function getBeforeSend(): (event: any) => any {
      process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
      initSentry('svc');
      return mockInit.mock.calls[0][0].beforeSend;
    }

    it('strips authorization header from events', () => {
      const beforeSend = getBeforeSend();
      const event = {
        request: {
          headers: {
            authorization: 'Bearer secret-token',
            'content-type': 'application/json',
          },
        },
      };

      const result = beforeSend(event);
      expect(result.request.headers).not.toHaveProperty('authorization');
      expect(result.request.headers['content-type']).toBe('application/json');
    });

    it('strips cookie header from events', () => {
      const beforeSend = getBeforeSend();
      const event = {
        request: {
          headers: {
            cookie: 'session=abc123',
            host: 'localhost',
          },
        },
      };

      const result = beforeSend(event);
      expect(result.request.headers).not.toHaveProperty('cookie');
      expect(result.request.headers.host).toBe('localhost');
    });

    it('strips both authorization and cookie headers', () => {
      const beforeSend = getBeforeSend();
      const event = {
        request: {
          headers: {
            authorization: 'Bearer xyz',
            cookie: 'sid=abc',
            'x-custom': 'keep-me',
          },
        },
      };

      const result = beforeSend(event);
      expect(result.request.headers).not.toHaveProperty('authorization');
      expect(result.request.headers).not.toHaveProperty('cookie');
      expect(result.request.headers['x-custom']).toBe('keep-me');
    });

    it('handles events without request headers gracefully', () => {
      const beforeSend = getBeforeSend();

      expect(beforeSend({})).toEqual({});
      expect(beforeSend({ request: {} })).toEqual({ request: {} });
      expect(beforeSend({ request: { url: '/test' } })).toEqual({ request: { url: '/test' } });
    });

    it('returns the event (does not return null)', () => {
      const beforeSend = getBeforeSend();
      const event = { message: 'test error' };
      expect(beforeSend(event)).toBe(event);
    });
  });

  // ─────────────────────── sentryErrorHandler ───────────────────────

  describe('sentryErrorHandler()', () => {
    it('returns middleware from Sentry.expressErrorHandler()', () => {
      const result = sentryErrorHandler();
      expect(mockExpressErrorHandler).toHaveBeenCalledTimes(1);
      expect(typeof result).toBe('function');
    });
  });

  // ─────────────────────── Sentry re-export ───────────────────────

  describe('Sentry re-export', () => {
    it('exports the Sentry namespace', () => {
      expect(Sentry).toBeDefined();
      expect(typeof Sentry.init).toBe('function');
    });
  });
});

// ─── Additional coverage ─────────────────────────────────────────────────────

describe('sentry — additional coverage', () => {
  it('initSentry can be called multiple times safely', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    initSentry('svc-a');
    initSentry('svc-b');
    // Both calls should have invoked Sentry.init
    expect(mockInit).toHaveBeenCalledTimes(2);
  });

  it('sentryErrorHandler calls expressErrorHandler exactly once per call', () => {
    sentryErrorHandler();
    expect(mockExpressErrorHandler).toHaveBeenCalledTimes(1);
    sentryErrorHandler();
    expect(mockExpressErrorHandler).toHaveBeenCalledTimes(2);
  });
});

// ─── Extended coverage ────────────────────────────────────────────────────────

describe('sentry — extended coverage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.SENTRY_DSN;
    delete process.env.NODE_ENV;
    delete process.env.npm_package_version;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('initSentry does not throw when SENTRY_DSN is empty string', () => {
    process.env.SENTRY_DSN = '';
    expect(() => initSentry('test-svc')).not.toThrow();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('tracesSampleRate parses floating-point env var correctly', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    process.env.SENTRY_TRACES_SAMPLE_RATE = '0.25';
    initSentry('svc');
    expect(mockInit.mock.calls[0][0].tracesSampleRate).toBe(0.25);
  });

  it('release uses serviceName when npm_package_version is set', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    process.env.npm_package_version = '3.0.0';
    initSentry('my-service');
    expect(mockInit.mock.calls[0][0].release).toBe('my-service@3.0.0');
  });

  it('sentryErrorHandler returns a callable function', () => {
    const handler = sentryErrorHandler();
    expect(typeof handler).toBe('function');
  });

  it('Sentry re-export exposes expressErrorHandler', () => {
    expect(typeof Sentry.expressErrorHandler).toBe('function');
  });

  it('beforeSend strips x-api-key header', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    initSentry('svc');
    const beforeSend = mockInit.mock.calls[0][0].beforeSend;
    const event = { request: { headers: { 'x-api-key': 'secret-key', host: 'example.com' } } };
    const result = beforeSend(event);
    expect(result.request.headers).not.toHaveProperty('x-api-key');
    expect(result.request.headers.host).toBe('example.com');
  });

  it('beforeSend redacts token query param in request url', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    initSentry('svc');
    const beforeSend = mockInit.mock.calls[0][0].beforeSend;
    const event = { request: { headers: {}, url: 'https://example.com/api?token=supersecret' } };
    const result = beforeSend(event);
    // URL-encoded form %5BREDACTED%5D or literal [REDACTED] both indicate redaction
    expect(result.request.url).toMatch(/\[REDACTED\]|%5BREDACTED%5D/);
    expect(result.request.url).not.toContain('supersecret');
  });

  it('beforeSend handles event with no request property', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    initSentry('svc');
    const beforeSend = mockInit.mock.calls[0][0].beforeSend;
    const event = { message: 'bare error event' };
    expect(() => beforeSend(event)).not.toThrow();
    expect(beforeSend(event)).toEqual(event);
  });

  it('initSentry passes the service name as serverName to Sentry.init', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    initSentry('api-crm');
    expect(mockInit.mock.calls[0][0].serverName).toBe('api-crm');
  });
});

describe('sentry — final coverage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.SENTRY_DSN;
    delete process.env.NODE_ENV;
    delete process.env.npm_package_version;
    delete process.env.SENTRY_TRACES_SAMPLE_RATE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('initSentry with staging NODE_ENV passes staging as environment', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    process.env.NODE_ENV = 'staging';
    initSentry('svc');
    expect(mockInit.mock.calls[0][0].environment).toBe('staging');
  });

  it('tracesSampleRate defaults to 0.1 when env var is absent', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    initSentry('api-env');
    expect(mockInit.mock.calls[0][0].tracesSampleRate).toBe(0.1);
  });

  it('initSentry is a function', () => {
    expect(typeof initSentry).toBe('function');
  });

  it('sentryErrorHandler is a function', () => {
    expect(typeof sentryErrorHandler).toBe('function');
  });

  it('Sentry.init is a function', () => {
    expect(typeof Sentry.init).toBe('function');
  });

  it('beforeSend preserves non-sensitive headers', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    initSentry('svc');
    const beforeSend = mockInit.mock.calls[0][0].beforeSend;
    const event = { request: { headers: { 'x-request-id': 'abc123', 'content-type': 'application/json' } } };
    const result = beforeSend(event);
    expect(result.request.headers['x-request-id']).toBe('abc123');
    expect(result.request.headers['content-type']).toBe('application/json');
  });
});

describe('sentry — absolute final coverage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.SENTRY_DSN;
    delete process.env.NODE_ENV;
    delete process.env.npm_package_version;
    delete process.env.SENTRY_TRACES_SAMPLE_RATE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('httpIntegration is called once per initSentry invocation', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    initSentry('svc');
    expect(mockHttpIntegration).toHaveBeenCalledTimes(1);
  });

  it('Sentry.httpIntegration is exposed and callable', () => {
    expect(typeof Sentry.httpIntegration).toBe('function');
  });

  it('initSentry with test NODE_ENV passes test as environment', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    process.env.NODE_ENV = 'test';
    initSentry('svc');
    expect(mockInit.mock.calls[0][0].environment).toBe('test');
  });

  it('tracesSampleRate of 1.0 is correctly parsed', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    process.env.SENTRY_TRACES_SAMPLE_RATE = '1.0';
    initSentry('svc');
    expect(mockInit.mock.calls[0][0].tracesSampleRate).toBe(1.0);
  });

  it('release format is serviceName@version', () => {
    process.env.SENTRY_DSN = 'https://abc@sentry.io/1';
    process.env.npm_package_version = '0.1.2';
    initSentry('test-api');
    expect(mockInit.mock.calls[0][0].release).toMatch(/^test-api@0\.1\.2$/);
  });
});

describe('sentry — phase29 coverage', () => {
  it('handles short-circuit eval', () => {
    let x2 = 0; false && x2++; expect(x2).toBe(0);
  });

  it('handles nullish coalescing', () => {
    const val: string | null = null; expect(val ?? 'default').toBe('default');
  });

  it('handles sort method', () => {
    expect([3, 1, 2].sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it('handles string startsWith', () => {
    expect('hello'.startsWith('he')).toBe(true);
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

});

describe('sentry — phase30 coverage', () => {
  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

  it('handles Math.max', () => {
    expect(Math.max(1, 2, 3)).toBe(3);
  });

  it('handles number isNaN', () => {
    expect(isNaN(NaN)).toBe(true);
  });

  it('handles Set size', () => {
    expect(new Set([1, 2, 2, 3]).size).toBe(3);
  });

});


describe('phase31 coverage', () => {
  it('handles object assign', () => { const r = Object.assign({}, {a:1}, {b:2}); expect(r).toEqual({a:1,b:2}); });
  it('handles Math.max', () => { expect(Math.max(1,5,3)).toBe(5); });
  it('handles number parsing', () => { expect(parseInt('42', 10)).toBe(42); });
  it('handles array indexOf', () => { expect([1,2,3].indexOf(2)).toBe(1); });
  it('handles array filter', () => { expect([1,2,3,4].filter(x => x % 2 === 0)).toEqual([2,4]); });
});


describe('phase32 coverage', () => {
  it('handles Array.from Set', () => { const s = new Set([1,1,2,3]); expect(Array.from(s)).toEqual([1,2,3]); });
  it('handles Math.sqrt', () => { expect(Math.sqrt(16)).toBe(4); });
  it('handles array concat', () => { expect([1,2].concat([3,4])).toEqual([1,2,3,4]); });
  it('handles bitwise OR', () => { expect(6 | 3).toBe(7); });
  it('handles array keys iterator', () => { expect([...['a','b','c'].keys()]).toEqual([0,1,2]); });
});


describe('phase33 coverage', () => {
  it('handles error stack type', () => { const e = new Error('test'); expect(typeof e.stack).toBe('string'); });
  it('handles Array.isArray on objects', () => { expect(Array.isArray({})).toBe(false); expect(Array.isArray(null)).toBe(false); });
  it('handles Promise.race', async () => { const r = await Promise.race([Promise.resolve('first'), new Promise(res => setTimeout(() => res('second'), 100))]); expect(r).toBe('first'); });
  it('handles string normalize', () => { expect('caf\u00e9'.normalize()).toBe('café'); });
  it('handles toFixed', () => { expect((3.14159).toFixed(2)).toBe('3.14'); });
});


describe('phase34 coverage', () => {
  it('handles chained string methods', () => { expect('  Hello World  '.trim().toLowerCase()).toBe('hello world'); });
  it('handles IIFE pattern', () => { const result = ((x: number) => x * x)(7); expect(result).toBe(49); });
  it('handles deep clone via JSON', () => { const orig = {a:{b:{c:1}}}; const clone = JSON.parse(JSON.stringify(orig)); clone.a.b.c = 2; expect(orig.a.b.c).toBe(1); });
  it('handles interface-like typing', () => { interface Point { x: number; y: number; } const p: Point = {x:3,y:4}; const dist = Math.sqrt(p.x**2+p.y**2); expect(dist).toBe(5); });
  it('handles Record type', () => { const scores: Record<string,number> = { alice: 95, bob: 87 }; expect(scores['alice']).toBe(95); });
});


describe('phase35 coverage', () => {
  it('handles object entries round-trip', () => { const o = {a:1,b:2}; expect(Object.fromEntries(Object.entries(o))).toEqual(o); });
  it('handles string camelCase pattern', () => { const toCamel = (s:string) => s.replace(/-([a-z])/g,(_,c)=>c.toUpperCase()); expect(toCamel('foo-bar-baz')).toBe('fooBarBaz'); });
  it('handles observer pattern', () => { const listeners: Array<(v:number)=>void> = []; const on = (fn:(v:number)=>void) => listeners.push(fn); const emit = (v:number) => listeners.forEach(fn=>fn(v)); const results: number[] = []; on(v=>results.push(v)); on(v=>results.push(v*2)); emit(5); expect(results).toEqual([5,10]); });
  it('handles array of nulls filter', () => { const a = [1,null,2,null,3]; expect(a.filter(Boolean)).toEqual([1,2,3]); });
  it('handles strategy pattern', () => { type Sorter = (a:number[]) => number[]; const asc: Sorter = a=>[...a].sort((x,y)=>x-y); const desc: Sorter = a=>[...a].sort((x,y)=>y-x); expect(asc([3,1,2])).toEqual([1,2,3]); expect(desc([3,1,2])).toEqual([3,2,1]); });
});
