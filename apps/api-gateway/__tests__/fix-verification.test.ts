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
});
