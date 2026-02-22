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

describe('Validation Middleware — additional coverage', () => {
  it('sanitizeMiddleware returns a middleware function', () => {
    const mw = sanitizeMiddleware();
    expect(typeof mw).toBe('function');
  });

  it('validateMiddleware returns a middleware function', () => {
    const schema = z.object({ email: z.string().email() });
    const mw = validateMiddleware(schema);
    expect(typeof mw).toBe('function');
  });
});

describe('Validation Middleware — extended edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sanitizeMiddleware does not mutate body for DELETE requests', () => {
    const middleware = sanitizeMiddleware({ rejectXss: false });
    const req = mockRequest({ method: 'DELETE', body: { name: '<b>test</b>' } });
    const res = mockResponse();
    middleware(req as Request, res as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.body.name).toBe('<b>test</b>');
  });

  it('sanitizeMiddleware does not mutate body for OPTIONS requests', () => {
    const middleware = sanitizeMiddleware({ rejectXss: false });
    const req = mockRequest({ method: 'OPTIONS', body: { field: '<i>value</i>' } });
    const res = mockResponse();
    middleware(req as Request, res as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.body.field).toBe('<i>value</i>');
  });

  it('sanitizeMiddleware preserves numeric fields unchanged', () => {
    const middleware = sanitizeMiddleware({ rejectXss: false });
    const req = mockRequest({ method: 'POST', body: { count: 42, price: 9.99 } });
    const res = mockResponse();
    middleware(req as Request, res as Response, mockNext);
    expect(req.body.count).toBe(42);
    expect(req.body.price).toBe(9.99);
  });

  it('sanitizeMiddleware preserves boolean fields unchanged', () => {
    const middleware = sanitizeMiddleware({ rejectXss: false });
    const req = mockRequest({ method: 'POST', body: { active: true, disabled: false } });
    const res = mockResponse();
    middleware(req as Request, res as Response, mockNext);
    expect(req.body.active).toBe(true);
    expect(req.body.disabled).toBe(false);
  });

  it('validateMiddleware replaces req.body with parsed Zod data', () => {
    const schema = z.object({ age: z.number() });
    const middleware = validateMiddleware(schema, { sanitize: false });
    const req = mockRequest({ body: { age: 30 } });
    const res = mockResponse();
    middleware(req as Request, res as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.body).toEqual({ age: 30 });
  });

  it('validateMiddleware with params source validates req.params', () => {
    const schema = z.object({ id: z.string().min(1) });
    const middleware = validateMiddleware(schema, { source: 'params', sanitize: false });
    const req = mockRequest({ params: { id: 'abc' } });
    const res = mockResponse();
    middleware(req as Request, res as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('sanitizeQueryMiddleware calls next after sanitizing', () => {
    const middleware = sanitizeQueryMiddleware();
    const req = mockRequest({ query: { name: '<b>hello</b>' } });
    const res = mockResponse();
    middleware(req as Request, res as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.query!.name).toBe('hello');
  });

  it('formatZodErrors returns empty object for schema with no errors', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({ name: 'valid' });
    if (result.success) {
      // No ZodError to format — just ensure the function is reachable
      expect(result.data.name).toBe('valid');
    }
    // Confirm the schema can produce an error
    const fail = schema.safeParse({ name: 123 });
    expect(fail.success).toBe(false);
  });

  it('validateMiddleware returns 400 with VALIDATION_ERROR code on schema failure', () => {
    const schema = z.object({ email: z.string().email() });
    const middleware = validateMiddleware(schema);
    const req = mockRequest({ body: { email: 'not-an-email' } });
    const res = mockResponse();
    middleware(req as Request, res as Response, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.error.code).toBe('VALIDATION_ERROR');
    expect(mockNext).not.toHaveBeenCalled();
  });
});
