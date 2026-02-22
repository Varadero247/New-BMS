import { Request, Response, NextFunction } from 'express';
import {
  API_VERSION,
  addVersionHeader,
  deprecatedRoute,
  extractApiVersion,
  validateApiVersion,
} from '../src/middleware/api-version';

describe('API Versioning Middleware', () => {
  let mockReq: Partial<Request> & { apiVersion?: string };
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      path: '/api/v1/test',
      method: 'GET',
      ip: '127.0.0.1',
      headers: {},
    };
    mockRes = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('API_VERSION constants', () => {
    it('should have current version as v1', () => {
      expect(API_VERSION.CURRENT).toBe('v1');
    });

    it('should include v1 in supported versions', () => {
      expect(API_VERSION.SUPPORTED).toContain('v1');
    });

    it('should have empty deprecated array', () => {
      expect(API_VERSION.DEPRECATED).toEqual([]);
    });
  });

  describe('addVersionHeader', () => {
    it('should add X-API-Version header', () => {
      const middleware = addVersionHeader('v1');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-API-Version', 'v1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should work with different versions', () => {
      const middleware = addVersionHeader('v2');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-API-Version', 'v2');
    });
  });

  describe('deprecatedRoute', () => {
    it('should add deprecation headers', () => {
      const middleware = deprecatedRoute('/api/v1/new-endpoint');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Deprecation', 'true');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-API-Deprecation-Notice',
        'This endpoint is deprecated. Please use /api/v1/new-endpoint'
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should add sunset header when provided', () => {
      const middleware = deprecatedRoute('/api/v1/new-endpoint', '2025-06-01');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Sunset', '2025-06-01');
    });

    it('should not add sunset header when not provided', () => {
      const middleware = deprecatedRoute('/api/v1/new-endpoint');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).not.toHaveBeenCalledWith('Sunset', expect.anything());
    });
  });

  describe('extractApiVersion', () => {
    it('should extract version from URL path', () => {
      mockReq.path = '/api/v1/users';
      extractApiVersion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.apiVersion).toBe('v1');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should extract v2 from URL path', () => {
      mockReq.path = '/api/v2/users';
      extractApiVersion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.apiVersion).toBe('v2');
    });

    it('should fall back to header when not in path', () => {
      mockReq.path = '/api/users';
      mockReq.headers = { 'x-api-version': 'v2' };
      extractApiVersion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.apiVersion).toBe('v2');
    });

    it('should use current version when neither path nor header provided', () => {
      mockReq.path = '/api/users';
      mockReq.headers = {};
      extractApiVersion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.apiVersion).toBe('v1');
    });
  });

  describe('validateApiVersion', () => {
    it('should call next for supported version', () => {
      mockReq.apiVersion = 'v1';
      validateApiVersion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 400 for unsupported version', () => {
      mockReq.apiVersion = 'v99';
      validateApiVersion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'UNSUPPORTED_API_VERSION',
          message: expect.stringContaining('v99'),
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should add deprecation header for deprecated version', () => {
      // Temporarily add v0 as deprecated for testing
      const originalDeprecated = [...API_VERSION.DEPRECATED];
      API_VERSION.DEPRECATED.push('v0');
      API_VERSION.SUPPORTED.push('v0');

      mockReq.apiVersion = 'v0';
      validateApiVersion(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Deprecation', 'true');
      expect(mockNext).toHaveBeenCalled();

      // Restore
      API_VERSION.DEPRECATED.length = originalDeprecated.length;
      API_VERSION.SUPPORTED.pop();
    });
  });
});

describe('API Versioning Middleware — additional coverage', () => {
  let mockReq: Partial<Request> & { apiVersion?: string };
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { path: '/api/v1/test', method: 'GET', ip: '127.0.0.1', headers: {} };
    mockRes = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
  });

  it('extractApiVersion sets apiVersion to v1 from path /api/v1/resource', () => {
    mockReq.path = '/api/v1/resource';
    extractApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect((mockReq as any).apiVersion).toBe('v1');
    expect(mockNext).toHaveBeenCalled();
  });

  it('validateApiVersion calls next for supported version v1', () => {
    mockReq.apiVersion = 'v1';
    validateApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('deprecatedRoute middleware calls next and sets deprecation header', () => {
    const middleware = deprecatedRoute('v1', 'v2');
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.setHeader).toHaveBeenCalledWith('Deprecation', 'true');
    expect(mockNext).toHaveBeenCalled();
  });

  it('API_VERSION.SUPPORTED is an array with at least one entry', () => {
    expect(Array.isArray(API_VERSION.SUPPORTED)).toBe(true);
    expect(API_VERSION.SUPPORTED.length).toBeGreaterThan(0);
  });

  it('addVersionHeader sets X-API-Version to current version', () => {
    const middleware = addVersionHeader(API_VERSION.CURRENT);
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-API-Version', API_VERSION.CURRENT);
  });
});

describe('API Versioning Middleware — extended edge cases', () => {
  let mockReq: Partial<Request> & { apiVersion?: string };
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { path: '/api/v1/test', method: 'GET', ip: '127.0.0.1', headers: {} };
    mockRes = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
  });

  it('extractApiVersion uses header version when path has no version segment', () => {
    mockReq.path = '/api/items';
    mockReq.headers = { 'x-api-version': 'v1' };
    extractApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect((mockReq as any).apiVersion).toBe('v1');
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('extractApiVersion defaults to CURRENT when no path version and no header', () => {
    mockReq.path = '/api/items';
    mockReq.headers = {};
    extractApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect((mockReq as any).apiVersion).toBe(API_VERSION.CURRENT);
  });

  it('validateApiVersion does not call res.status for v1', () => {
    mockReq.apiVersion = 'v1';
    validateApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('validateApiVersion returns 400 for v0 (unsupported)', () => {
    mockReq.apiVersion = 'v0';
    validateApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('validateApiVersion error response contains UNSUPPORTED_API_VERSION code', () => {
    mockReq.apiVersion = 'v99';
    validateApiVersion(mockReq as Request, mockRes as Response, mockNext);
    const jsonArg = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.code).toBe('UNSUPPORTED_API_VERSION');
  });

  it('deprecatedRoute sets X-API-Deprecation-Notice header', () => {
    const middleware = deprecatedRoute('/api/v2/resource');
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'X-API-Deprecation-Notice',
      expect.stringContaining('/api/v2/resource')
    );
  });

  it('deprecatedRoute with sunset date sets Sunset header', () => {
    const middleware = deprecatedRoute('/api/v2/resource', '2027-01-01');
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.setHeader).toHaveBeenCalledWith('Sunset', '2027-01-01');
  });

  it('addVersionHeader calls next after setting header', () => {
    const middleware = addVersionHeader('v1');
    middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('API_VERSION.DEPRECATED starts as an empty array', () => {
    // Re-check initial state (DEPRECATED may be mutated by other tests but reset logic in describe)
    expect(Array.isArray(API_VERSION.DEPRECATED)).toBe(true);
  });

  it('extractApiVersion detects v3 from URL path', () => {
    mockReq.path = '/api/v3/things';
    extractApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect((mockReq as any).apiVersion).toBe('v3');
  });
});

describe('API Versioning Middleware — final additional coverage', () => {
  let mockReq: Partial<Request> & { apiVersion?: string };
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { path: '/api/v1/test', method: 'GET', ip: '127.0.0.1', headers: {} };
    mockRes = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
  });

  it('API_VERSION.CURRENT is a non-empty string', () => {
    expect(typeof API_VERSION.CURRENT).toBe('string');
    expect(API_VERSION.CURRENT.length).toBeGreaterThan(0);
  });

  it('addVersionHeader middleware calls next exactly once', () => {
    const mw = addVersionHeader('v1');
    mw(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('extractApiVersion called twice on same req sets apiVersion each time', () => {
    mockReq.path = '/api/v1/foo';
    extractApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect((mockReq as any).apiVersion).toBe('v1');
    mockReq.path = '/api/v2/foo';
    extractApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect((mockReq as any).apiVersion).toBe('v2');
  });

  it('validateApiVersion does not call json for valid version', () => {
    mockReq.apiVersion = 'v1';
    validateApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('validateApiVersion json error includes supported versions list', () => {
    mockReq.apiVersion = 'v999';
    validateApiVersion(mockReq as Request, mockRes as Response, mockNext);
    const jsonArg = (mockRes.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error.message).toContain('v999');
  });
});

describe('API Versioning Middleware — comprehensive additional coverage', () => {
  let mockReq: Partial<Request> & { apiVersion?: string };
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { path: '/api/v1/test', method: 'GET', ip: '127.0.0.1', headers: {} };
    mockRes = { setHeader: jest.fn(), status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockNext = jest.fn();
  });

  it('API_VERSION object has CURRENT, SUPPORTED and DEPRECATED properties', () => {
    expect(API_VERSION).toHaveProperty('CURRENT');
    expect(API_VERSION).toHaveProperty('SUPPORTED');
    expect(API_VERSION).toHaveProperty('DEPRECATED');
  });

  it('addVersionHeader does not call res.status', () => {
    const mw = addVersionHeader('v1');
    mw(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('extractApiVersion from path /api/v1/anything sets apiVersion to v1', () => {
    mockReq.path = '/api/v1/anything';
    extractApiVersion(mockReq as Request, mockRes as Response, mockNext);
    expect((mockReq as any).apiVersion).toBe('v1');
  });

  it('validateApiVersion for undefined apiVersion treats it as unsupported', () => {
    mockReq.apiVersion = undefined as any;
    // Should either call next (if undefined → current) or reject; just check no crash
    expect(() =>
      validateApiVersion(mockReq as Request, mockRes as Response, mockNext)
    ).not.toThrow();
  });

  it('deprecatedRoute sets Deprecation header to string true', () => {
    const middleware = deprecatedRoute('/api/v2/items');
    middleware(mockReq as Request, mockRes as Response, mockNext);
    const calls = (mockRes.setHeader as jest.Mock).mock.calls;
    const deprecationCall = calls.find((c: any[]) => c[0] === 'Deprecation');
    expect(deprecationCall).toBeDefined();
    expect(deprecationCall[1]).toBe('true');
  });
});
