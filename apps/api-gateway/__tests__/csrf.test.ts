import { Request, Response, NextFunction } from 'express';
import { csrfProtection, generateCsrfToken, tokenStore } from '../src/middleware/csrf';

// Mock express objects
const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  method: 'GET',
  path: '/api/test',
  cookies: {},
  headers: {},
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    locals: {},
  };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('CSRF Protection Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('csrfProtection', () => {
    it('should skip ignored paths', () => {
      const middleware = csrfProtection();
      const req = mockRequest({ path: '/auth/login', method: 'POST' });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should skip non-protected methods (GET)', () => {
      const middleware = csrfProtection();
      const req = mockRequest({ method: 'GET', path: '/api/users' });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject POST without CSRF token', () => {
      const middleware = csrfProtection();
      const req = mockRequest({ method: 'POST', path: '/api/users' });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'CSRF_TOKEN_MISSING',
          message: 'CSRF token is required for this request',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject POST with mismatched tokens', () => {
      const middleware = csrfProtection();
      const req = mockRequest({
        method: 'POST',
        path: '/api/users',
        cookies: { _csrf: 'cookie-token' },
        headers: { 'x-csrf-token': 'different-token' },
      });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'Invalid CSRF token',
        },
      });
    });

    it('should accept POST with valid matching tokens', () => {
      const token = 'valid-matching-token-12345';
      tokenStore.set(token);

      const middleware = csrfProtection();
      const req = mockRequest({
        method: 'POST',
        path: '/api/users',
        cookies: { _csrf: token },
        headers: { 'x-csrf-token': token },
      });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject PUT without CSRF token', () => {
      const middleware = csrfProtection();
      const req = mockRequest({ method: 'PUT', path: '/api/users/1' });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should reject DELETE without CSRF token', () => {
      const middleware = csrfProtection();
      const req = mockRequest({ method: 'DELETE', path: '/api/users/1' });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should reject PATCH without CSRF token', () => {
      const middleware = csrfProtection();
      const req = mockRequest({ method: 'PATCH', path: '/api/users/1' });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should use custom cookie name', () => {
      const token = 'custom-token-12345';
      tokenStore.set(token);

      const middleware = csrfProtection({ cookieName: 'my_csrf' });
      const req = mockRequest({
        method: 'POST',
        path: '/api/users',
        cookies: { my_csrf: token },
        headers: { 'x-csrf-token': token },
      });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should use custom header name', () => {
      const token = 'custom-header-token-12345';
      tokenStore.set(token);

      const middleware = csrfProtection({ headerName: 'X-My-CSRF' });
      const req = mockRequest({
        method: 'POST',
        path: '/api/users',
        cookies: { _csrf: token },
        headers: { 'x-my-csrf': token },
      });
      const res = mockResponse();

      middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('generateCsrfToken', () => {
    it('should generate and return a CSRF token', () => {
      const handler = generateCsrfToken();
      const req = mockRequest();
      const res = mockResponse();

      handler(req as Request, res as Response, mockNext);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          csrfToken: expect.any(String),
        },
      });
    });

    it('should set cookie with secure options in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const handler = generateCsrfToken();
      const req = mockRequest();
      const res = mockResponse();

      handler(req as Request, res as Response, mockNext);

      expect(res.cookie).toHaveBeenCalledWith(
        '_csrf',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('tokenStore', () => {
    beforeEach(() => {
      // Clear the token store
      tokenStore.cleanup();
    });

    it('should store and validate tokens', () => {
      const token = 'test-token-storage';
      tokenStore.set(token);
      expect(tokenStore.isValid(token)).toBe(true);
    });

    it('should reject unknown tokens', () => {
      expect(tokenStore.isValid('unknown-token')).toBe(false);
    });

    it('should delete tokens', () => {
      const token = 'test-delete-token';
      tokenStore.set(token);
      expect(tokenStore.isValid(token)).toBe(true);

      tokenStore.delete(token);
      expect(tokenStore.isValid(token)).toBe(false);
    });
  });
});

describe('CSRF Protection Middleware — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenStore.cleanup();
  });

  it('should skip OPTIONS method (preflight) without requiring token', () => {
    const middleware = csrfProtection();
    const req = mockRequest({ method: 'OPTIONS', path: '/api/users' });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should skip HEAD method without requiring token', () => {
    const middleware = csrfProtection();
    const req = mockRequest({ method: 'HEAD', path: '/api/users' });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should skip custom ignorePath supplied in options', () => {
    const middleware = csrfProtection({ ignorePaths: ['/api/webhook'] });
    const req = mockRequest({ method: 'POST', path: '/api/webhook/receive' });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('generateCsrfToken stores token in tokenStore', () => {
    const handler = generateCsrfToken();
    const req = mockRequest();
    const res = mockResponse();

    handler(req as Request, res as Response, mockNext);

    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    const token: string = jsonCall.data.csrfToken;
    expect(tokenStore.isValid(token)).toBe(true);
  });

  it('tokenStore.isValid returns false for expired token', () => {
    const token = 'expiry-test-token';
    // Manually insert with old timestamp by accessing private internals via cast
    (tokenStore as any).tokens.set(token, { createdAt: Date.now() - 2 * 60 * 60 * 1000 });
    expect(tokenStore.isValid(token)).toBe(false);
  });
});
