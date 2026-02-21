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
