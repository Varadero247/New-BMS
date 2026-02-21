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
