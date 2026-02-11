import { Request, Response } from 'express';
import { notFoundHandler } from '../src/middleware/not-found';

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

describe('Not Found Handler Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('status code', () => {
    it('should return 404 status code', () => {
      const req = mockRequest();
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('response shape', () => {
    it('should return success: false', () => {
      const req = mockRequest();
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should return error code NOT_FOUND', () => {
      const req = mockRequest();
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'NOT_FOUND',
          }),
        })
      );
    });
  });

  describe('path info in response', () => {
    it('should include the request method and path in the error message', () => {
      const req = mockRequest({ method: 'GET', path: '/api/nonexistent' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route GET /api/nonexistent not found',
        },
      });
    });

    it('should include POST method in the error message', () => {
      const req = mockRequest({ method: 'POST', path: '/api/missing' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route POST /api/missing not found',
        },
      });
    });

    it('should include PUT method in the error message', () => {
      const req = mockRequest({ method: 'PUT', path: '/api/resource/123' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route PUT /api/resource/123 not found',
        },
      });
    });

    it('should include DELETE method in the error message', () => {
      const req = mockRequest({ method: 'DELETE', path: '/api/items/42' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route DELETE /api/items/42 not found',
        },
      });
    });

    it('should include PATCH method in the error message', () => {
      const req = mockRequest({ method: 'PATCH', path: '/api/users/5' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route PATCH /api/users/5 not found',
        },
      });
    });
  });

  describe('various unknown paths', () => {
    it('should handle root path', () => {
      const req = mockRequest({ method: 'GET', path: '/' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route GET / not found',
        },
      });
    });

    it('should handle deeply nested paths', () => {
      const req = mockRequest({ method: 'GET', path: '/api/v2/deep/nested/path' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route GET /api/v2/deep/nested/path not found',
        },
      });
    });

    it('should handle paths with query-like segments', () => {
      const req = mockRequest({ method: 'GET', path: '/api/search' });
      const res = mockResponse();

      notFoundHandler(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Route GET /api/search not found',
        },
      });
    });
  });
});
