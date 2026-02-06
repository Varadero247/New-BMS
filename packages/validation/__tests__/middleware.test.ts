import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  sanitizeMiddleware,
  validateMiddleware,
  sanitizeQueryMiddleware,
  formatZodErrors,
} from '../src/middleware';

// Mock Express objects
const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  method: 'POST',
  body: {},
  query: {},
  params: {},
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('sanitizeMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip GET requests', () => {
    const middleware = sanitizeMiddleware();
    const req = mockRequest({ method: 'GET', body: { name: '<script>test</script>' } });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body.name).toBe('<script>test</script>'); // unchanged
  });

  it('should sanitize POST request body', () => {
    // Use simple HTML that doesn't trigger XSS detection
    const middleware = sanitizeMiddleware({ rejectXss: false });
    const req = mockRequest({
      method: 'POST',
      body: { name: '<b>John</b>' },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body.name).toBe('John');
  });

  it('should sanitize PUT request body', () => {
    const middleware = sanitizeMiddleware();
    const req = mockRequest({
      method: 'PUT',
      body: { title: '<b>Hello</b>' },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body.title).toBe('Hello');
  });

  it('should sanitize PATCH request body', () => {
    // Use simple HTML that doesn't trigger XSS detection
    const middleware = sanitizeMiddleware({ rejectXss: false });
    const req = mockRequest({
      method: 'PATCH',
      body: { description: '<i>italictext</i>' },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body.description).toBe('italictext');
  });

  it('should not sanitize password fields', () => {
    const middleware = sanitizeMiddleware();
    const req = mockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'P@ssw0rd<>!',
      },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body.password).toBe('P@ssw0rd<>!'); // unchanged
  });

  it('should reject requests with XSS patterns when enabled', () => {
    const middleware = sanitizeMiddleware({ rejectXss: true });
    const req = mockRequest({
      method: 'POST',
      body: { name: '<script>alert(1)</script>' },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_INPUT',
        message: 'Request contains potentially malicious content',
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject requests with SQL injection patterns when enabled', () => {
    const middleware = sanitizeMiddleware({ rejectSqlInjection: true });
    const req = mockRequest({
      method: 'POST',
      body: { search: "'; DROP TABLE users; --" },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle nested objects', () => {
    const middleware = sanitizeMiddleware({ rejectXss: false });
    const req = mockRequest({
      method: 'POST',
      body: {
        user: {
          name: '<b>John</b>',
          profile: {
            bio: '<strong>Hello</strong> World',
          },
        },
      },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body.user.name).toBe('John');
    expect(req.body.user.profile.bio).toBe('Hello World');
  });

  it('should handle arrays', () => {
    const middleware = sanitizeMiddleware({ rejectXss: false });
    const req = mockRequest({
      method: 'POST',
      body: {
        tags: ['<b>tag1</b>', '<i>tag2</i>'],
      },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body.tags).toEqual(['tag1', 'tag2']);
  });
});

describe('validateMiddleware', () => {
  const schema = z.object({
    name: z.string().min(2, 'Name too short'),
    age: z.number().min(0, 'Age must be positive'),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass valid data', () => {
    const middleware = validateMiddleware(schema);
    const req = mockRequest({
      body: { name: 'John', age: 25 },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject invalid data with validation errors', () => {
    const middleware = validateMiddleware(schema);
    const req = mockRequest({
      body: { name: 'J', age: -5 },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: expect.objectContaining({
          name: expect.arrayContaining(['Name too short']),
          age: expect.arrayContaining(['Age must be positive']),
        }),
      },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should validate query params when specified', () => {
    const querySchema = z.object({
      search: z.string().min(1),
    });
    const middleware = validateMiddleware(querySchema, { source: 'query' });
    const req = mockRequest({
      query: { search: '' },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should sanitize before validation when enabled', () => {
    const middleware = validateMiddleware(schema, { sanitize: true });
    const req = mockRequest({
      body: { name: '<b>John</b>', age: 25 },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body.name).toBe('John');
  });
});

describe('sanitizeQueryMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sanitize query parameters', () => {
    const middleware = sanitizeQueryMiddleware();
    const req = mockRequest({
      query: { search: '<b>test</b>' },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.query!.search).toBe('test');
  });

  it('should handle multiple query params', () => {
    const middleware = sanitizeQueryMiddleware();
    const req = mockRequest({
      query: {
        q: '<b>search</b>',
        filter: '<i>filter</i>',
      },
    });
    const res = mockResponse();

    middleware(req as Request, res as Response, mockNext);

    expect(req.query!.q).toBe('search');
    expect(req.query!.filter).toBe('filter');
  });
});

describe('formatZodErrors', () => {
  it('should format simple errors', () => {
    const schema = z.object({
      email: z.string().email(),
    });
    const result = schema.safeParse({ email: 'invalid' });

    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(formatted.email).toBeDefined();
      expect(formatted.email.length).toBeGreaterThan(0);
    }
  });

  it('should handle nested path errors', () => {
    const schema = z.object({
      user: z.object({
        email: z.string().email(),
      }),
    });
    const result = schema.safeParse({ user: { email: 'invalid' } });

    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(formatted['user.email']).toBeDefined();
    }
  });

  it('should handle multiple errors on same field', () => {
    const schema = z.object({
      password: z.string().min(8).regex(/[A-Z]/, 'Must contain uppercase'),
    });
    const result = schema.safeParse({ password: 'short' });

    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(formatted.password.length).toBeGreaterThanOrEqual(1);
    }
  });
});
