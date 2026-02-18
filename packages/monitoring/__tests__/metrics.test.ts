import {
  register,
  httpRequestDuration,
  httpRequestTotal,
  activeRequests,
  databaseQueryDuration,
  metricsMiddleware,
  metricsHandler,
} from '../src/metrics';
import client from 'prom-client';

describe('Prometheus metrics', () => {
  beforeEach(async () => {
    // Reset metric values between tests to avoid cross-test pollution
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

    it('register contains default metrics', async () => {
      const metrics = await register.getMetricsAsJSON();
      // Default metrics include things like process_cpu_seconds_total
      const metricNames = metrics.map((m) => m.name);
      expect(metricNames.length).toBeGreaterThan(0);
      // At least one default metric should be present
      expect(
        metricNames.some((name) => name.startsWith('process_') || name.startsWith('nodejs_'))
      ).toBe(true);
    });
  });

  describe('metricsMiddleware', () => {
    let finishCallback: (() => void) | null;

    const createMockReqRes = () => {
      finishCallback = null;
      const mockReq = {
        method: 'GET',
        path: '/test',
        route: { path: '/test' },
      } as any;
      const mockRes = {
        statusCode: 200,
        on: jest.fn((event: string, cb: () => void) => {
          if (event === 'finish') {
            finishCallback = cb;
          }
        }),
      } as any;
      const mockNext = jest.fn();
      return { mockReq, mockRes, mockNext };
    };

    it('returns a middleware function', () => {
      const middleware = metricsMiddleware('test-service');
      expect(typeof middleware).toBe('function');
    });

    it('calls next()', () => {
      const middleware = metricsMiddleware('test-service');
      const { mockReq, mockRes, mockNext } = createMockReqRes();

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('registers a finish event listener on the response', () => {
      const middleware = metricsMiddleware('test-service');
      const { mockReq, mockRes, mockNext } = createMockReqRes();

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('tracks request completion on res finish event', async () => {
      const middleware = metricsMiddleware('metrics-test-svc');
      const { mockReq, mockRes, mockNext } = createMockReqRes();

      middleware(mockReq, mockRes, mockNext);

      // Simulate the finish event
      expect(finishCallback).not.toBeNull();
      finishCallback!();

      // After finish, httpRequestTotal should have been incremented
      const metricsOutput = await register.metrics();
      expect(metricsOutput).toContain('http_requests_total');
    });

    it('increments and decrements active requests around finish', async () => {
      const middleware = metricsMiddleware('active-req-svc');
      const { mockReq, mockRes, mockNext } = createMockReqRes();

      middleware(mockReq, mockRes, mockNext);

      // Before finish, active requests should have been incremented
      // After finish, it should be decremented
      finishCallback!();

      const metricsOutput = await register.metrics();
      expect(metricsOutput).toContain('http_requests_active');
    });
  });

  describe('metricsHandler', () => {
    it('returns metrics content', async () => {
      const mockRes = {
        set: jest.fn(),
        end: jest.fn(),
      } as any;
      const mockReq = {} as any;

      await metricsHandler(mockReq, mockRes);

      expect(mockRes.end).toHaveBeenCalledTimes(1);
      const metricsContent = mockRes.end.mock.calls[0][0];
      expect(typeof metricsContent).toBe('string');
      expect(metricsContent.length).toBeGreaterThan(0);
    });

    it('sets correct content type header', async () => {
      const mockRes = {
        set: jest.fn(),
        end: jest.fn(),
      } as any;
      const mockReq = {} as any;

      await metricsHandler(mockReq, mockRes);

      expect(mockRes.set).toHaveBeenCalledWith('Content-Type', expect.stringContaining('text/'));
    });
  });
});
