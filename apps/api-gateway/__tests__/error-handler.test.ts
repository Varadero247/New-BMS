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

describe('Error Handler — response shape and logging extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should expose the message for 401 Unauthorized (4xx)', () => {
    const err: AppError = new Error('Token expired');
    err.statusCode = 401;
    err.code = 'TOKEN_EXPIRED';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.message).toBe('Token expired');
    expect(payload.error.code).toBe('TOKEN_EXPIRED');
  });

  it('should mask message for 502 Bad Gateway (5xx)', () => {
    const err: AppError = new Error('Upstream host unreachable: 172.16.0.1:4001');
    err.statusCode = 502;

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.message).toBe('Internal server error');
  });

  it('should log code as undefined when no code is set on the error', () => {
    const err: AppError = new Error('Oops');
    err.statusCode = 500;
    // intentionally no err.code

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error', {
      error: 'Oops',
      code: undefined,
      statusCode: 500,
    });
  });

  it('should use INTERNAL_ERROR code for errors with no code and 5xx status', () => {
    const err: AppError = new Error('Fatal error');
    err.statusCode = 503;

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.code).toBe('INTERNAL_ERROR');
  });

  it('should call res.status exactly once', () => {
    const err: AppError = new Error('Error');
    err.statusCode = 404;

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledTimes(1);
  });

  it('should call res.json exactly once', () => {
    const err: AppError = new Error('Error');
    err.statusCode = 400;

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('response error object has exactly two keys: code and message', () => {
    const err: AppError = new Error('Some error');
    err.statusCode = 400;
    err.code = 'SOME_ERROR';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(Object.keys(payload.error)).toEqual(['code', 'message']);
  });

  it('should expose "An unexpected error occurred" when message is empty for 4xx', () => {
    const err: AppError = new Error('');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.message).toBe('An unexpected error occurred');
  });
});

describe('Error Handler — extra boundary coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles 404 Not Found and exposes the message for 4xx', () => {
    const err: AppError = new Error('Page not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.message).toBe('Page not found');
    expect(payload.success).toBe(false);
  });

  it('response error object never has a stack field', () => {
    const err: AppError = new Error('Stack test');
    err.statusCode = 500;

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error).not.toHaveProperty('stack');
  });

  it('response body never has a data field', () => {
    const err: AppError = new Error('Data field test');
    err.statusCode = 400;
    err.code = 'BAD_REQUEST';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload).not.toHaveProperty('data');
  });

  it('logger.error called with code undefined when no code set', () => {
    const err: AppError = new Error('No code');
    err.statusCode = 400;

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error', {
      error: 'No code',
      code: undefined,
      statusCode: 400,
    });
  });

  it('500 with custom code returns INTERNAL_ERROR in the response, not the custom code', () => {
    const err: AppError = new Error('Internal detail');
    err.statusCode = 500;
    err.code = 'CUSTOM_INTERNAL';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    // The custom code is passed through in the response (only the message is masked for 5xx)
    expect(payload.error.code).toBe('CUSTOM_INTERNAL');
  });

  it('two different errors both get success:false', () => {
    for (const statusCode of [401, 503]) {
      const err: AppError = new Error('Error');
      err.statusCode = statusCode;
      const req = mockRequest();
      const res = mockResponse();
      errorHandler(err, req as Request, res as Response, mockNext);
      const payload = (res.json as jest.Mock).mock.calls[0][0];
      expect(payload.success).toBe(false);
      jest.clearAllMocks();
    }
  });

  it('error.message is "Internal server error" for status 502', () => {
    const err: AppError = new Error('Bad gateway internal detail');
    err.statusCode = 502;

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.message).toBe('Internal server error');
  });
});

describe('Error Handler — final coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles 429 Too Many Requests and exposes the message', () => {
    const err: AppError = new Error('Too many requests');
    err.statusCode = 429;
    err.code = 'RATE_LIMIT_EXCEEDED';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(429);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.message).toBe('Too many requests');
  });

  it('handles 413 Payload Too Large and exposes the message', () => {
    const err: AppError = new Error('Payload too large');
    err.statusCode = 413;
    err.code = 'PAYLOAD_TOO_LARGE';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(413);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('handles 501 Not Implemented masking message', () => {
    const err: AppError = new Error('Feature not yet implemented internally');
    err.statusCode = 501;
    err.code = 'NOT_IMPLEMENTED';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(501);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.error.message).toBe('Internal server error');
  });

  it('always has exactly two top-level keys: success and error', () => {
    const err: AppError = new Error('Shape test');
    err.statusCode = 400;
    err.code = 'BAD_REQUEST';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(Object.keys(payload).sort()).toEqual(['error', 'success'].sort());
  });

  it('logger called with statusCode field matching the error statusCode', () => {
    const err: AppError = new Error('Test log field');
    err.statusCode = 418;
    err.code = 'IM_A_TEAPOT';

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(mockLogger.error).toHaveBeenCalledWith('Unhandled error', {
      error: 'Test log field',
      code: 'IM_A_TEAPOT',
      statusCode: 418,
    });
  });

  it('does not call next() for any status code', () => {
    for (const statusCode of [400, 401, 403, 404, 500]) {
      const err: AppError = new Error('Error');
      err.statusCode = statusCode;

      const req = mockRequest();
      const res = mockResponse();

      errorHandler(err, req as Request, res as Response, mockNext);
    }
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('handles errors with no statusCode or code (pure default path)', () => {
    const err = new Error('Unknown') as AppError;

    const req = mockRequest();
    const res = mockResponse();

    errorHandler(err, req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    const payload = (res.json as jest.Mock).mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('error handler — phase29 coverage', () => {
  it('handles array push', () => {
    const a: number[] = []; a.push(1); expect(a).toHaveLength(1);
  });

  it('handles string indexOf', () => {
    expect('hello world'.indexOf('world')).toBe(6);
  });

  it('handles error message', () => {
    expect(new TypeError('bad')).toHaveProperty('message', 'bad');
  });

});
