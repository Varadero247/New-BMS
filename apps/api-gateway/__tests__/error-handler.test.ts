import { Request, Response, NextFunction } from 'express';

// Mock @ims/monitoring - must be before import of error-handler
const mockLogger = { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() };
jest.mock('@ims/monitoring', () => ({
  createLogger: jest.fn(() => mockLogger),
}));

import { errorHandler, AppError } from '../src/middleware/error-handler';

const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  method: 'GET',
  path: '/api/test',
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('Error Handler Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('status code handling', () => {
    it('should use the statusCode from the error when provided', () => {
      const err: AppError = new Error('Bad request');
      err.statusCode = 400;
      err.code = 'BAD_REQUEST';

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should default to 500 when no statusCode is provided', () => {
      const err: AppError = new Error('Something broke');

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('error code handling', () => {
    it('should use the code from the error when provided', () => {
      const err: AppError = new Error('Not authorized');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'UNAUTHORIZED',
          }),
        })
      );
    });

    it('should default to INTERNAL_ERROR when no code is provided', () => {
      const err: AppError = new Error('Unknown failure');

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
          }),
        })
      );
    });
  });

  describe('error message handling', () => {
    it('should use the message from the error for 4xx status codes', () => {
      const err: AppError = new Error('Validation failed');
      err.statusCode = 422;
      err.code = 'VALIDATION_ERROR';

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Validation failed',
          }),
        })
      );
    });

    it('should mask error message for 500 status codes', () => {
      const err: AppError = new Error('Database connection pool exhausted');
      err.statusCode = 500;

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Internal server error',
          }),
        })
      );
    });

    it('should default to generic message when error has no message and no statusCode', () => {
      const err: AppError = new Error();
      err.message = '';

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Internal server error',
          }),
        })
      );
    });
  });

  describe('response shape', () => {
    it('should return proper error JSON with success: false for 4xx', () => {
      const err: AppError = new Error('Resource not found');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      });
    });

    it('should handle a fully default error (no statusCode, code, or message)', () => {
      const err: AppError = new Error();
      err.message = '';

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
        },
      });
    });
  });

  describe('stack trace security', () => {
    it('should never include stack trace regardless of NODE_ENV', () => {
      for (const env of ['development', 'production', 'test']) {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = env;

        const err: AppError = new Error('Error in ' + env);
        err.statusCode = 500;
        err.code = 'TEST_ERROR';

        const req = mockRequest();
        const res = mockResponse();

        errorHandler(err, req as Request, res as Response, mockNext);

        const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
        expect(jsonCall.error).not.toHaveProperty('stack');

        process.env.NODE_ENV = originalEnv;
        jest.clearAllMocks();
      }
    });

    it('should mask 500 error messages in all environments', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const err: AppError = new Error('Sensitive database details');
      err.statusCode = 500;

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error.message).toBe('Internal server error');
      expect(jsonCall.error).not.toHaveProperty('stack');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('structured error logging', () => {
    it('should log the error using structured logger', () => {
      const err: AppError = new Error('Logged error');
      err.statusCode = 503;

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error', {
        error: 'Logged error',
        code: undefined,
        statusCode: 503,
      });
    });
  });

  describe('various HTTP error status codes', () => {
    it('should handle 400 Bad Request', () => {
      const err: AppError = new Error('Invalid input');
      err.statusCode = 400;
      err.code = 'BAD_REQUEST';

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Invalid input' },
      });
    });

    it('should handle 403 Forbidden', () => {
      const err: AppError = new Error('Access denied');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    });

    it('should handle 409 Conflict', () => {
      const err: AppError = new Error('Resource conflict');
      err.statusCode = 409;
      err.code = 'CONFLICT';

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'CONFLICT', message: 'Resource conflict' },
      });
    });
  });
});


describe('Error Handler — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle 422 Unprocessable Entity and expose the message', () => {
    const err: AppError = new Error('Unprocessable data');
    err.statusCode = 422;
    err.code = 'UNPROCESSABLE_ENTITY';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'UNPROCESSABLE_ENTITY', message: 'Unprocessable data' },
    });
  });

  it('should mask the message for 503 Service Unavailable', () => {
    const err: AppError = new Error('Redis connection timed out');
    err.statusCode = 503;
    err.code = 'SERVICE_UNAVAILABLE';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(503);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.message).toBe('Internal server error');
    expect(payload.success).toBe(false);
  });

  it('should log all three fields: error message, code, and statusCode', () => {
    const err: AppError = new Error('Payment required');
    err.statusCode = 402;
    err.code = 'PAYMENT_REQUIRED';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error', {
      error: 'Payment required',
      code: 'PAYMENT_REQUIRED',
      statusCode: 402,
    });
  });

  it('should never call next() after handling the error', () => {
    const err: AppError = new Error('Not implemented');
    err.statusCode = 501;

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should always return success: false regardless of status code', () => {
    for (const statusCode of [400, 401, 403, 404, 500, 502, 503]) {
      const err: AppError = new Error('Some error');
      err.statusCode = statusCode;

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);

      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload.success).toBe(false);
      jest.clearAllMocks();
    }
  });
});
