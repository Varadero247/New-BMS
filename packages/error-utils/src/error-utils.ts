// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ─── Custom Error Classes ────────────────────────────────────────────────────

export class AppError extends Error {
  public code: string;
  public statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.field = field;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(message ?? 'Unauthorized', 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(message ?? 'Forbidden', 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Type Guards ─────────────────────────────────────────────────────────────

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

// ─── Error Conversion ─────────────────────────────────────────────────────────

export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    if (typeof obj['message'] === 'string') return new Error(obj['message']);
  }
  return new Error(String(value));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj['message'] === 'string') return obj['message'];
  }
  return String(error);
}

export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof AppError) return error.code;
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj['code'] === 'string') return obj['code'];
  }
  return undefined;
}

export function getStatusCode(error: unknown): number | undefined {
  if (error instanceof AppError) return error.statusCode;
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj['statusCode'] === 'number') return obj['statusCode'];
  }
  return undefined;
}

// ─── Error Serialization ──────────────────────────────────────────────────────

export function serializeError(error: unknown): {
  message: string;
  name: string;
  code?: string;
  statusCode?: number;
  stack?: string;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
    };
  }
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  return {
    message: getErrorMessage(error),
    name: 'UnknownError',
  };
}

// ─── Error Factories ──────────────────────────────────────────────────────────

export function createError(message: string, code?: string, statusCode?: number): AppError {
  return new AppError(message, code ?? 'UNKNOWN', statusCode);
}

export function wrapError(error: unknown, message: string): Error {
  const original = toError(error);
  const wrapped = new Error(`${message}: ${original.message}`);
  wrapped.stack = original.stack;
  return wrapped;
}

export function isErrorCode(error: unknown, code: string): boolean {
  return getErrorCode(error) === code;
}

// ─── Error Aggregation ────────────────────────────────────────────────────────

export function combineErrors(errors: Error[]): Error {
  if (errors.length === 0) return new Error('No errors');
  if (errors.length === 1) return errors[0];
  const message = errors.map((e) => e.message).join('; ');
  return new Error(message);
}

export function collectErrors<T>(fn: () => T): { result?: T; errors: Error[] } {
  const errors: Error[] = [];
  try {
    const result = fn();
    return { result, errors };
  } catch (e) {
    errors.push(toError(e));
    return { errors };
  }
}

export function assertNoErrors(errors: Error[]): void {
  if (errors.length > 0) {
    throw combineErrors(errors);
  }
}

// ─── Result Type ──────────────────────────────────────────────────────────────

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function mapResult<T, R, E extends Error>(
  result: Result<T, E>,
  fn: (v: T) => R
): Result<R, E> {
  if (result.ok) {
    return { ok: true, value: fn(result.value) };
  }
  return result;
}

export function flatMapResult<T, R, E extends Error>(
  result: Result<T, E>,
  fn: (v: T) => Result<R, E>
): Result<R, E> {
  if (result.ok) {
    return fn(result.value);
  }
  return result;
}

export function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.value;
  throw result.error;
}

export function unwrapOr<T>(result: Result<T>, fallback: T): T {
  if (result.ok) return result.value;
  return fallback;
}

export function fromTryCatch<T>(fn: () => T): Result<T> {
  try {
    const value = fn();
    return ok(value);
  } catch (e) {
    return { ok: false, error: toError(e) };
  }
}
