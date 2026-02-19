import {
  correlationIdMiddleware,
  getCorrelationId,
  CORRELATION_ID_HEADER,
} from '../src/correlationId';
import { createHealthCheck } from '../src/healthCheck';

// UUID v4 pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MockReq = { get: jest.Mock; correlationId?: string };
type MockRes = { setHeader: jest.Mock; status: jest.Mock; json: jest.Mock };

describe('correlationIdMiddleware', () => {
  const createMocks = (headerValue?: string) => {
    const mockReq: MockReq = {
      get: jest.fn((header: string) => {
        if (header === CORRELATION_ID_HEADER) return headerValue;
        return undefined;
      }),
      correlationId: undefined,
    };
    const mockRes: MockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockNext = jest.fn();
    return { mockReq, mockRes, mockNext };
  };

  it('returns a middleware function', () => {
    const middleware = correlationIdMiddleware();
    expect(typeof middleware).toBe('function');
  });

  it('calls next()', () => {
    const middleware = correlationIdMiddleware();
    const { mockReq, mockRes, mockNext } = createMocks();

    middleware(mockReq as unknown as import('express').Request, mockRes as unknown as import('express').Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('generates a new UUID when no correlation ID header is present', () => {
    const middleware = correlationIdMiddleware();
    const { mockReq, mockRes, mockNext } = createMocks();

    middleware(mockReq as unknown as import('express').Request, mockRes as unknown as import('express').Response, mockNext);

    expect(mockReq.correlationId).toBeDefined();
    expect(mockReq.correlationId).toMatch(UUID_REGEX);
  });

  it('uses existing header value when provided', () => {
    const existingId = 'my-existing-correlation-id';
    const middleware = correlationIdMiddleware();
    const { mockReq, mockRes, mockNext } = createMocks(existingId);

    middleware(mockReq as unknown as import('express').Request, mockRes as unknown as import('express').Response, mockNext);

    expect(mockReq.correlationId).toBe(existingId);
  });

  it('sets the correlation ID on the response header', () => {
    const middleware = correlationIdMiddleware();
    const { mockReq, mockRes, mockNext } = createMocks();

    middleware(mockReq as unknown as import('express').Request, mockRes as unknown as import('express').Response, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, expect.any(String));
  });

  it('sets req.correlationId to the same value as the response header', () => {
    const middleware = correlationIdMiddleware();
    const { mockReq, mockRes, mockNext } = createMocks();

    middleware(mockReq as unknown as import('express').Request, mockRes as unknown as import('express').Response, mockNext);

    const headerValue = mockRes.setHeader.mock.calls[0][1];
    expect(mockReq.correlationId).toBe(headerValue);
  });
});

describe('getCorrelationId', () => {
  it('returns the correlation ID from the request', () => {
    const mockReq = { correlationId: 'abc-123' };
    expect(getCorrelationId(mockReq as unknown as import('express').Request)).toBe('abc-123');
  });

  it('returns "unknown" when no correlation ID is set', () => {
    const mockReq = {};
    expect(getCorrelationId(mockReq as unknown as import('express').Request)).toBe('unknown');
  });
});

describe('createHealthCheck', () => {
  const originalMemoryUsage = process.memoryUsage;

  beforeEach(() => {
    process.memoryUsage = jest.fn().mockReturnValue({
      heapUsed: 50 * 1024 * 1024,
      heapTotal: 200 * 1024 * 1024,
      rss: 250 * 1024 * 1024,
      external: 10 * 1024 * 1024,
      arrayBuffers: 5 * 1024 * 1024,
    }) as unknown as typeof process.memoryUsage;
  });

  afterEach(() => {
    process.memoryUsage = originalMemoryUsage;
  });

  const createMockRes = (): MockRes => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
  });

  it('returns a handler function', () => {
    const handler = createHealthCheck('test-service');
    expect(typeof handler).toBe('function');
  });

  it('reports healthy status without prisma', async () => {
    const handler = createHealthCheck('test-service');
    const mockRes = createMockRes();

    await handler({} as unknown as import('express').Request, mockRes as unknown as import('express').Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'healthy',
      })
    );
  });

  it('reports healthy status when prisma query succeeds', async () => {
    const mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };
    const handler = createHealthCheck('test-service', mockPrisma as unknown as Parameters<typeof createHealthCheck>[1]);
    const mockRes = createMockRes();

    await handler({} as unknown as import('express').Request, mockRes as unknown as import('express').Response);

    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const responseBody = mockRes.json.mock.calls[0][0];
    expect(responseBody.status).toBe('healthy');
    expect(responseBody.checks.database).toBe('up');
  });

  it('reports unhealthy status when prisma query fails', async () => {
    const mockPrisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error('Connection refused')),
    };
    const handler = createHealthCheck('test-service', mockPrisma as unknown as Parameters<typeof createHealthCheck>[1]);
    const mockRes = createMockRes();

    await handler({} as unknown as import('express').Request, mockRes as unknown as import('express').Response);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    const responseBody = mockRes.json.mock.calls[0][0];
    expect(responseBody.status).toBe('unhealthy');
    expect(responseBody.checks.database).toBe('down');
  });

  it('includes memory information in checks', async () => {
    const handler = createHealthCheck('test-service');
    const mockRes = createMockRes();

    await handler({} as unknown as import('express').Request, mockRes as unknown as import('express').Response);

    const responseBody = mockRes.json.mock.calls[0][0];
    expect(responseBody.checks.memory).toBeDefined();
    expect(typeof responseBody.checks.memory.used).toBe('number');
    expect(typeof responseBody.checks.memory.total).toBe('number');
    expect(typeof responseBody.checks.memory.percentage).toBe('number');
    expect(responseBody.checks.memory.percentage).toBeGreaterThanOrEqual(0);
    expect(responseBody.checks.memory.percentage).toBeLessThanOrEqual(100);
  });

  it('includes service name, uptime, and timestamp', async () => {
    const handler = createHealthCheck('my-service', undefined, '1.2.3');
    const mockRes = createMockRes();

    await handler({} as unknown as import('express').Request, mockRes as unknown as import('express').Response);

    const responseBody = mockRes.json.mock.calls[0][0];
    expect(responseBody.service).toBe('my-service');
    expect(typeof responseBody.uptime).toBe('number');
    expect(responseBody.uptime).toBeGreaterThanOrEqual(0);
    expect(responseBody.timestamp).toBeDefined();
    expect(new Date(responseBody.timestamp).toISOString()).toBe(responseBody.timestamp);
    expect(responseBody.version).toBe('1.2.3');
  });
});
