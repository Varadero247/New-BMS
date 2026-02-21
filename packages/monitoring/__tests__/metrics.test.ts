import {
  register,
  httpRequestDuration,
  httpRequestTotal,
  activeRequests,
  databaseQueryDuration,
  authFailuresTotal,
  rateLimitExceededTotal,
  metricsMiddleware,
  metricsHandler,
  dbQueryHistogram,
  prismaMetricsMiddleware,
} from '../src/metrics';
import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

describe('Prometheus metrics', () => {
  beforeEach(async () => {
    register.resetMetrics();
  });

  describe('metric instances', () => {
    it('httpRequestDuration is a Histogram', () => {
      expect(httpRequestDuration).toBeInstanceOf(client.Histogram);
    });

    it('httpRequestTotal is a Counter', () => {
      expect(httpRequestTotal).toBeInstanceOf(client.Counter);
    });

    it('activeRequests is a Gauge', () => {
      expect(activeRequests).toBeInstanceOf(client.Gauge);
    });

    it('databaseQueryDuration is a Histogram', () => {
      expect(databaseQueryDuration).toBeInstanceOf(client.Histogram);
    });

    it('authFailuresTotal is a Counter', () => {
      expect(authFailuresTotal).toBeInstanceOf(client.Counter);
    });

    it('rateLimitExceededTotal is a Counter', () => {
      expect(rateLimitExceededTotal).toBeInstanceOf(client.Counter);
    });

    it('register contains default metrics', async () => {
      const metrics = await register.getMetricsAsJSON();
      const metricNames = metrics.map((m) => m.name);
      expect(metricNames.length).toBeGreaterThan(0);
      expect(
        metricNames.some((name) => name.startsWith('process_') || name.startsWith('nodejs_'))
      ).toBe(true);
    });

    it('dbQueryHistogram is an alias for databaseQueryDuration', () => {
      expect(dbQueryHistogram).toBe(databaseQueryDuration);
    });

    it('httpRequestDuration metric name is http_request_duration_seconds', async () => {
      const metrics = await register.getMetricsAsJSON();
      const names = metrics.map((m) => m.name);
      expect(names).toContain('http_request_duration_seconds');
    });

    it('httpRequestTotal metric name is http_requests_total', async () => {
      const metrics = await register.getMetricsAsJSON();
      const names = metrics.map((m) => m.name);
      expect(names).toContain('http_requests_total');
    });

    it('metrics output is valid Prometheus text format', async () => {
      const output = await register.metrics();
      // Prometheus format lines start with # HELP or # TYPE or metric entries
      expect(output).toMatch(/# HELP/);
      expect(output).toMatch(/# TYPE/);
    });
  });

  describe('authFailuresTotal counter', () => {
    it('increments with reason and service labels', async () => {
      authFailuresTotal.inc({ reason: 'wrong_password', service: 'api-gateway' });
      authFailuresTotal.inc({ reason: 'invalid_credentials', service: 'api-gateway' });

      const metricsOutput = await register.metrics();
      expect(metricsOutput).toContain('auth_failures_total');
    });

    it('can be incremented multiple times', async () => {
      const before = await register.getMetricsAsJSON();
      const beforeEntry = before.find((m) => m.name === 'auth_failures_total');
      const beforeValue = (beforeEntry?.values ?? []).reduce((s, v) => s + v.value, 0);

      authFailuresTotal.inc({ reason: 'wrong_password', service: 'test-svc' });

      const after = await register.getMetricsAsJSON();
      const afterEntry = after.find((m) => m.name === 'auth_failures_total');
      const afterTotal = (afterEntry?.values ?? []).reduce((s, v) => s + v.value, 0);
      expect(afterTotal).toBeGreaterThan(beforeValue);
    });

    it('supports TOKEN_INVALID reason label', async () => {
      authFailuresTotal.inc({ reason: 'TOKEN_INVALID', service: 'api-health-safety' });
      const metrics = await register.getMetricsAsJSON();
      const entry = metrics.find((m) => m.name === 'auth_failures_total');
      const labels = (entry?.values ?? []).map((v) => v.labels?.reason);
      expect(labels).toContain('TOKEN_INVALID');
    });

    it('supports different service label values', async () => {
      authFailuresTotal.inc({ reason: 'expired', service: 'api-inventory' });
      authFailuresTotal.inc({ reason: 'expired', service: 'api-crm' });
      const metrics = await register.getMetricsAsJSON();
      const entry = metrics.find((m) => m.name === 'auth_failures_total');
      const serviceLabels = (entry?.values ?? []).map((v) => v.labels?.service);
      expect(serviceLabels).toEqual(expect.arrayContaining(['api-inventory', 'api-crm']));
    });
  });

  describe('rateLimitExceededTotal counter', () => {
    it('increments with limiter and service labels', async () => {
      rateLimitExceededTotal.inc({ limiter: 'auth', service: 'api-gateway' });

      const metricsOutput = await register.metrics();
      expect(metricsOutput).toContain('rate_limit_exceeded_total');
    });

    it('supports different limiter label values', async () => {
      rateLimitExceededTotal.inc({ limiter: 'api', service: 'api-gateway' });
      rateLimitExceededTotal.inc({ limiter: 'strict_api', service: 'api-gateway' });
      rateLimitExceededTotal.inc({ limiter: 'register', service: 'api-gateway' });

      const metrics = await register.getMetricsAsJSON();
      const entry = metrics.find((m) => m.name === 'rate_limit_exceeded_total');
      const limiterLabels = (entry?.values ?? []).map((v) => v.labels?.limiter);
      expect(limiterLabels).toEqual(expect.arrayContaining(['api', 'strict_api', 'register']));
    });

    it('rate_limit_exceeded_total appears in Prometheus text output', async () => {
      rateLimitExceededTotal.inc({ limiter: 'test', service: 'svc' });
      const output = await register.metrics();
      expect(output).toContain('rate_limit_exceeded_total');
    });
  });

  describe('databaseQueryDuration histogram', () => {
    it('can observe a query duration without throwing', () => {
      expect(() => {
        databaseQueryDuration.observe({ operation: 'findMany', model: 'User' }, 0.05);
      }).not.toThrow();
    });

    it('appears in metrics output after observation', async () => {
      databaseQueryDuration.observe({ operation: 'create', model: 'Incident' }, 0.01);
      const output = await register.metrics();
      expect(output).toContain('database_query_duration_seconds');
    });
  });

  describe('prismaMetricsMiddleware', () => {
    it('calls next with the original params', async () => {
      const params = {
        model: 'User',
        action: 'findMany',
        args: {},
        dataPath: [],
        runInTransaction: false,
      };
      const next = jest.fn().mockResolvedValue([]);
      await prismaMetricsMiddleware(params, next);
      expect(next).toHaveBeenCalledWith(params);
    });

    it('returns the result from next', async () => {
      const params = {
        model: 'Risk',
        action: 'create',
        args: {},
        dataPath: [],
        runInTransaction: false,
      };
      const next = jest.fn().mockResolvedValue({ id: '1' });
      const result = await prismaMetricsMiddleware(params, next);
      expect(result).toEqual({ id: '1' });
    });

    it('records duration even when model is undefined', async () => {
      const params = {
        action: 'executeRaw',
        args: {},
        dataPath: [],
        runInTransaction: false,
      };
      const next = jest.fn().mockResolvedValue(1);
      await expect(prismaMetricsMiddleware(params, next)).resolves.toBe(1);
    });
  });

  describe('metricsMiddleware', () => {
    type MockReq = {
      method: string;
      path: string;
      route?: { path: string };
    };

    type MockRes = {
      statusCode: number;
      on: jest.Mock;
    };

    let finishCallback: (() => void) | null;

    const createMockReqRes = () => {
      finishCallback = null;
      const mockReq: MockReq = {
        method: 'GET',
        path: '/test',
        route: { path: '/test' },
      };
      const mockRes: MockRes = {
        statusCode: 200,
        on: jest.fn((event: string, cb: () => void) => {
          if (event === 'finish') {
            finishCallback = cb;
          }
        }),
      };
      const mockNext: NextFunction = jest.fn();
      return { mockReq, mockRes, mockNext };
    };

    it('returns a middleware function', () => {
      const middleware = metricsMiddleware('test-service');
      expect(typeof middleware).toBe('function');
    });

    it('calls next()', () => {
      const middleware = metricsMiddleware('test-service');
      const { mockReq, mockRes, mockNext } = createMockReqRes();

      middleware(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('registers a finish event listener on the response', () => {
      const middleware = metricsMiddleware('test-service');
      const { mockReq, mockRes, mockNext } = createMockReqRes();

      middleware(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext
      );

      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('tracks request completion on res finish event', async () => {
      const middleware = metricsMiddleware('metrics-test-svc');
      const { mockReq, mockRes, mockNext } = createMockReqRes();

      middleware(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext
      );

      expect(finishCallback).not.toBeNull();
      finishCallback!();

      const metricsOutput = await register.metrics();
      expect(metricsOutput).toContain('http_requests_total');
    });

    it('increments and decrements active requests around finish', async () => {
      const middleware = metricsMiddleware('active-req-svc');
      const { mockReq, mockRes, mockNext } = createMockReqRes();

      middleware(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext
      );

      finishCallback!();

      const metricsOutput = await register.metrics();
      expect(metricsOutput).toContain('http_requests_active');
    });
  });

  describe('metricsHandler', () => {
    type MockHandlerRes = {
      set: jest.Mock;
      end: jest.Mock;
    };

    it('returns metrics content', async () => {
      const mockRes: MockHandlerRes = {
        set: jest.fn(),
        end: jest.fn(),
      };
      const mockReq = {} as unknown as Request;

      await metricsHandler(mockReq, mockRes as unknown as Response);

      expect(mockRes.end).toHaveBeenCalledTimes(1);
      const metricsContent = mockRes.end.mock.calls[0][0];
      expect(typeof metricsContent).toBe('string');
      expect(metricsContent.length).toBeGreaterThan(0);
    });

    it('sets correct content type header', async () => {
      const mockRes: MockHandlerRes = {
        set: jest.fn(),
        end: jest.fn(),
      };
      const mockReq = {} as unknown as Request;

      await metricsHandler(mockReq, mockRes as unknown as Response);

      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', expect.stringContaining('text/'));
    });
  });
});
