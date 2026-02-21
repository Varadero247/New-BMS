/**
 * Tests for the centralised errorHandler middleware and asyncHandler wrapper.
 */
import { errorHandler, asyncHandler } from '../src';
import type { Request, Response, NextFunction } from 'express';

function makeRes() {
  const res: Partial<Response> = {};
  const json = jest.fn().mockReturnValue(res);
  const status = jest.fn().mockReturnValue({ json });
  res.status = status;
  res.json = json;
  return { res: res as Response, status, json };
}

const req = {} as Request;
const next = jest.fn() as NextFunction;

describe('errorHandler', () => {
  it('returns 400 for ZodError (duck-typed by issues array)', () => {
    const zodErr = Object.assign(new Error('Validation failed'), {
      issues: [{ message: 'Required', path: ['name'] }],
    });
    const { res, status, json } = makeRes();
    errorHandler(zodErr as any, req, res, next);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      })
    );
  });

  it('includes ZodError details in 400 response', () => {
    const issues = [{ message: 'Too short', path: ['title'] }];
    const zodErr = Object.assign(new Error('Zod'), { issues });
    const { res, json } = makeRes();
    errorHandler(zodErr as any, req, res, next);
    const call = json.mock.calls[0][0];
    expect(call.error.details).toEqual(issues);
  });

  it('returns 409 for Prisma P2002 (unique constraint violation)', () => {
    const prismaErr = Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
    const { res, status, json } = makeRes();
    errorHandler(prismaErr as any, req, res, next);
    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'CONFLICT' }),
      })
    );
  });

  it('returns 404 for Prisma P2025 (record not found)', () => {
    const prismaErr = Object.assign(new Error('Record not found'), { code: 'P2025' });
    const { res, status, json } = makeRes();
    errorHandler(prismaErr as any, req, res, next);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'NOT_FOUND' }),
      })
    );
  });

  it('respects custom statusCode on error object', () => {
    const err = Object.assign(new Error('Bad request'), { statusCode: 400, code: 'BAD_REQUEST' });
    const { res, status } = makeRes();
    errorHandler(err as any, req, res, next);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('returns 500 for generic errors', () => {
    const err = new Error('Something broke');
    const { res, status, json } = makeRes();
    errorHandler(err as any, req, res, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'INTERNAL_ERROR', message: 'Internal server error' }),
      })
    );
  });

  it('does not expose internal message for 500 errors', () => {
    const err = new Error('Database password is db_secret_123');
    const { res, json } = makeRes();
    errorHandler(err as any, req, res, next);
    const call = json.mock.calls[0][0];
    expect(call.error.message).toBe('Internal server error');
    expect(call.error.message).not.toContain('db_secret_123');
  });
});

describe('asyncHandler', () => {
  it('calls next(error) when the wrapped handler throws', async () => {
    const nextFn = jest.fn();
    const err = new Error('async error');
    const handler = asyncHandler(async () => {
      throw err;
    });
    await handler(req, {} as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(err);
  });

  it('calls next(error) when the wrapped handler returns a rejected promise', async () => {
    const nextFn = jest.fn();
    const err = new Error('rejected');
    const handler = asyncHandler(() => Promise.reject(err));
    await handler(req, {} as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(err);
  });

  it('does not call next when the handler succeeds', async () => {
    const nextFn = jest.fn();
    const handler = asyncHandler(async (_req, res) => {
      (res as any).sent = true;
    });
    const mockRes = { sent: false } as any;
    await handler(req, mockRes, nextFn);
    expect(nextFn).not.toHaveBeenCalled();
    expect(mockRes.sent).toBe(true);
  });
});

describe('errorHandler — extended', () => {
  it('returns 500 and INTERNAL_ERROR code for errors without a code', () => {
    const err = new Error('no code here');
    const { res, status, json } = makeRes();
    errorHandler(err as any, req, res, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      })
    );
  });

  it('returns success: false for every error type', () => {
    const errors = [
      new Error('generic'),
      Object.assign(new Error('zod'), { issues: [{ message: 'fail', path: [] }] }),
      Object.assign(new Error('p2002'), { code: 'P2002' }),
      Object.assign(new Error('p2025'), { code: 'P2025' }),
    ];
    for (const err of errors) {
      const { res, json } = makeRes();
      errorHandler(err as any, req, res, next);
      expect(json.mock.calls[0][0].success).toBe(false);
    }
  });

  it('includes error.message in non-500 responses', () => {
    const err = Object.assign(new Error('Resource not found'), { code: 'P2025' });
    const { res, json } = makeRes();
    errorHandler(err as any, req, res, next);
    const call = json.mock.calls[0][0];
    expect(call.error).toBeDefined();
    expect(call.error.code).toBe('NOT_FOUND');
  });

  it('returns 409 with CONFLICT code for P2002 errors', () => {
    const prismaErr = Object.assign(new Error('Unique'), { code: 'P2002' });
    const { res, json } = makeRes();
    errorHandler(prismaErr as any, req, res, next);
    expect(json.mock.calls[0][0].error.code).toBe('CONFLICT');
  });

  it('ZodError response body includes success: false at top level', () => {
    const zodErr = Object.assign(new Error('Validation'), {
      issues: [{ message: 'Invalid email', path: ['email'] }],
    });
    const { res, json } = makeRes();
    errorHandler(zodErr as any, req, res, next);
    expect(json.mock.calls[0][0]).toHaveProperty('success', false);
  });
});

describe('asyncHandler — extended', () => {
  it('passes req and res through to the wrapped handler', async () => {
    const nextFn = jest.fn();
    let capturedReq: any;
    let capturedRes: any;
    const handler = asyncHandler(async (r, s) => {
      capturedReq = r;
      capturedRes = s;
    });
    const mockReq = { id: 'test-req' } as any;
    const mockRes = { id: 'test-res' } as any;
    await handler(mockReq, mockRes, nextFn);
    expect(capturedReq).toBe(mockReq);
    expect(capturedRes).toBe(mockRes);
  });
});

// ─── Additional coverage ─────────────────────────────────────────────────────

describe('errorHandler — additional coverage', () => {
  it('uses statusCode 422 when explicitly set on the error', () => {
    const err = Object.assign(new Error('Unprocessable'), { statusCode: 422, code: 'UNPROCESSABLE' });
    const { res, status } = makeRes();
    errorHandler(err as any, req, res, next);
    expect(status).toHaveBeenCalledWith(422);
  });

  it('ZodError details array is passed through as-is', () => {
    const issues = [{ message: 'Min length 3', path: ['username'] }, { message: 'Required', path: ['email'] }];
    const zodErr = Object.assign(new Error('Zod'), { issues });
    const { res, json } = makeRes();
    errorHandler(zodErr as any, req, res, next);
    expect(json.mock.calls[0][0].error.details).toHaveLength(2);
    expect(json.mock.calls[0][0].error.details[1].message).toBe('Required');
  });

  it('asyncHandler next is called with the exact thrown error object', async () => {
    const nextFn = jest.fn();
    const specificErr = new TypeError('expected string');
    const handler = asyncHandler(async () => { throw specificErr; });
    await handler(req, {} as any, nextFn);
    expect(nextFn).toHaveBeenCalledWith(specificErr);
    expect(nextFn.mock.calls[0][0]).toBe(specificErr);
  });

  it('asyncHandler passes next function through to wrapped handler signature', async () => {
    const nextFn = jest.fn();
    let capturedNext: any;
    const handler = asyncHandler(async (_req, _res, nxt) => {
      capturedNext = nxt;
    });
    await handler(req, {} as any, nextFn);
    expect(capturedNext).toBe(nextFn);
  });
});
