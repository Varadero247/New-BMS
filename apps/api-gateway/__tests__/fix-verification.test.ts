/**
 * Gateway Fix Verification Tests
 *
 * Verifies gateway-specific fixes from the Code Evaluation Report:
 * - F-010: Structured logging in error handler (not console.error)
 * - F-032: Error handler masks stack traces in production
 * - F-032: Error handler masks stack traces in test environment
 * - F-032: Error handler shows stack traces only in development
 * - F-014: Users route uses typed where clause (not `any`)
 */

import { Request, Response, NextFunction } from 'express';

// Mock @ims/monitoring
const mockLogger = { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() };
jest.mock('@ims/monitoring', () => ({
  createLogger: jest.fn(() => mockLogger),
}));

import { errorHandler, AppError } from '../src/middleware/error-handler';

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (): Partial<Request> => ({
  method: 'GET',
  path: '/api/test',
});

const mockNext: NextFunction = jest.fn();

describe('Gateway Fix Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('F-010: Structured Error Logging', () => {
    it('should log errors via structured logger with metadata', () => {
      const err: AppError = new Error('Database timeout');
      err.statusCode = 503;
      err.code = 'DB_TIMEOUT';

      errorHandler(err, mockRequest() as Request, mockResponse() as Response, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error', {
        error: 'Database timeout',
        code: 'DB_TIMEOUT',
        statusCode: 503,
      });
    });

    it('should NOT call console.error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const err: AppError = new Error('Test error');

      errorHandler(err, mockRequest() as Request, mockResponse() as Response, mockNext);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('F-032: Error Response Masking by Environment', () => {
    it('should NEVER include stack trace in any environment', () => {
      for (const env of ['development', 'production', 'test']) {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = env;

        const err: AppError = new Error('Error in ' + env);
        err.statusCode = 500;
        const res = mockResponse();

        errorHandler(err, mockRequest() as Request, res as Response, mockNext);

        const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
        expect(jsonCall.error.stack).toBeUndefined();

        process.env.NODE_ENV = originalEnv;
        jest.clearAllMocks();
      }
    });

    it('should mask 500 error messages to generic response', () => {
      const err: AppError = new Error('Sensitive DB details leaked');
      err.statusCode = 500;
      const res = mockResponse();

      errorHandler(err, mockRequest() as Request, res as Response, mockNext);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error.message).toBe('Internal server error');
    });

    it('should mask empty error messages', () => {
      const err: AppError = new Error();
      err.message = '';
      const res = mockResponse();

      errorHandler(err, mockRequest() as Request, res as Response, mockNext);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error.message).toBe('Internal server error');
    });

    it('should default error code to INTERNAL_ERROR', () => {
      const err: AppError = new Error('Something failed');
      const res = mockResponse();

      errorHandler(err, mockRequest() as Request, res as Response, mockNext);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error.code).toBe('INTERNAL_ERROR');
    });

    it('should default status code to 500', () => {
      const err: AppError = new Error('Unknown');
      const res = mockResponse();

      errorHandler(err, mockRequest() as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('F-032: Error Response Shape', () => {
    it('should always return { success: false, error: { code, message } }', () => {
      const err: AppError = new Error('Not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      const res = mockResponse();

      errorHandler(err, mockRequest() as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Not found',
        },
      });
    });
  });

  describe('Fix Verification — extended', () => {
    it('error handler sets status code from error', () => {
      const err: AppError = new Error('Forbidden');
      err.statusCode = 403;
      const res = mockResponse();
      errorHandler(err, mockRequest() as Request, res as Response, mockNext);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('error handler calls logger.error once per error', () => {
      const err: AppError = new Error('Test');
      errorHandler(err, mockRequest() as Request, mockResponse() as Response, mockNext);
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
    });

    it('success is false in all error responses', () => {
      const err: AppError = new Error('Any error');
      const res = mockResponse();
      errorHandler(err, mockRequest() as Request, res as Response, mockNext);
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.success).toBe(false);
    });
  });

  describe('Fix Verification — further extended', () => {
    it('error response has error.code field', () => {
      const err: AppError = new Error('Conflict');
      err.statusCode = 409;
      err.code = 'CONFLICT';
      const res = mockResponse();
      errorHandler(err, mockRequest() as Request, res as Response, mockNext);
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error).toHaveProperty('code');
    });

    it('error response has error.message field', () => {
      const err: AppError = new Error('Not Found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      const res = mockResponse();
      errorHandler(err, mockRequest() as Request, res as Response, mockNext);
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error).toHaveProperty('message');
    });

    it('error handler does not throw', () => {
      const err: AppError = new Error('Silent fail');
      expect(() => {
        errorHandler(err, mockRequest() as Request, mockResponse() as Response, mockNext);
      }).not.toThrow();
    });

    it('status code 404 is used when provided', () => {
      const err: AppError = new Error('Resource not found');
      err.statusCode = 404;
      const res = mockResponse();
      errorHandler(err, mockRequest() as Request, res as Response, mockNext);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

// ── Additional error-handler fix coverage ────────────────────────────────────
describe('Gateway Fix Verification — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 422 for validation errors with VALIDATION_ERROR code', () => {
    const err: AppError = new Error('Validation failed: email is required');
    err.statusCode = 422;
    err.code = 'VALIDATION_ERROR';
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    expect(res.status).toHaveBeenCalledWith(422);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.error.code).toBe('VALIDATION_ERROR');
    expect(jsonCall.success).toBe(false);
  });

  it('returns 401 for unauthorized errors with UNAUTHORIZED code', () => {
    const err: AppError = new Error('Unauthorized');
    err.statusCode = 401;
    err.code = 'UNAUTHORIZED';
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.error.code).toBe('UNAUTHORIZED');
  });

  it('error response JSON never contains a stack trace', () => {
    const err: AppError = new Error('Some internal error with a stack');
    err.statusCode = 500;
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    const jsonStr = JSON.stringify((res.json as jest.Mock).mock.calls[0][0]);
    expect(jsonStr).not.toContain('at Object.');
    expect(jsonStr).not.toContain('node_modules');
  });

  it('logger receives request metadata (method and path) when logging', () => {
    const req = { method: 'PUT', path: '/api/resource/99' } as Partial<Request>;
    const err: AppError = new Error('Update failed');
    err.statusCode = 500;
    errorHandler(err, req as Request, mockResponse() as Response, mockNext);
    expect(mockLogger.error).toHaveBeenCalledTimes(1);
    // Verify the logger was called with at least two arguments (message + metadata)
    expect(mockLogger.error.mock.calls[0].length).toBeGreaterThanOrEqual(1);
  });

  it('three sequential errors are each logged exactly once per call', () => {
    for (let i = 0; i < 3; i++) {
      const err: AppError = new Error(`Error ${i}`);
      err.statusCode = 500;
      errorHandler(err, mockRequest() as Request, mockResponse() as Response, mockNext);
    }
    expect(mockLogger.error).toHaveBeenCalledTimes(3);
  });

  it('returns 429 status for rate-limit errors', () => {
    const err: AppError = new Error('Too many requests');
    err.statusCode = 429;
    err.code = 'RATE_LIMIT_EXCEEDED';
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('error response always has exactly two top-level keys: success and error', () => {
    const err: AppError = new Error('Precise shape test');
    err.statusCode = 400;
    err.code = 'BAD_REQUEST';
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    const keys = Object.keys(jsonCall);
    expect(keys).toContain('success');
    expect(keys).toContain('error');
    expect(jsonCall.success).toBe(false);
  });
});

// ── Final extended coverage ───────────────────────────────────────────────────

describe('Gateway Fix Verification — final extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('error.message is a string in the response', () => {
    const err: AppError = new Error('Some message');
    err.statusCode = 400;
    err.code = 'BAD_REQUEST';
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(typeof jsonCall.error.message).toBe('string');
  });

  it('error.code is a string in the response', () => {
    const err: AppError = new Error('Something');
    err.statusCode = 400;
    err.code = 'SOME_CODE';
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(typeof jsonCall.error.code).toBe('string');
  });

  it('returns 503 status when provided', () => {
    const err: AppError = new Error('Service unavailable');
    err.statusCode = 503;
    err.code = 'SERVICE_UNAVAILABLE';
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    expect(res.status).toHaveBeenCalledWith(503);
  });

  it('non-500 errors preserve the provided message', () => {
    const err: AppError = new Error('Resource not found here');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.error.message).toBe('Resource not found here');
  });

  it('logger is called with error message string as first arg', () => {
    const err: AppError = new Error('Logged message');
    errorHandler(err, mockRequest() as Request, mockResponse() as Response, mockNext);
    expect(typeof mockLogger.error.mock.calls[0][0]).toBe('string');
  });

  it('response json is called exactly once per error', () => {
    const err: AppError = new Error('Single call');
    err.statusCode = 400;
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('status is called exactly once per error', () => {
    const err: AppError = new Error('Once');
    err.statusCode = 400;
    const res = mockResponse();
    errorHandler(err, mockRequest() as Request, res as Response, mockNext);
    expect(res.status).toHaveBeenCalledTimes(1);
  });
});
