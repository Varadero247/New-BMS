import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import {
  sanitizeObject,
  sanitizeString,
  containsXss,
  containsSqlInjection,
  SanitizeStringOptions,
} from './sanitize';

/**
 * Express middleware options
 */
export interface SanitizeMiddlewareOptions {
  /** Sanitization options for strings */
  stringOptions?: SanitizeStringOptions;
  /** Fields to skip (e.g., 'password') */
  skipFields?: string[];
  /** Whether to reject requests with XSS patterns (default: true) */
  rejectXss?: boolean;
  /** Whether to reject requests with SQL injection patterns (default: true) */
  rejectSqlInjection?: boolean;
}

/**
 * Validation middleware options
 */
export interface ValidateMiddlewareOptions {
  /** Which part of request to validate */
  source?: 'body' | 'query' | 'params';
  /** Whether to sanitize before validation */
  sanitize?: boolean;
}

/**
 * Create Express middleware that sanitizes request body
 */
export function sanitizeMiddleware(
  options: SanitizeMiddlewareOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const {
    stringOptions = {},
    skipFields = ['password', 'currentPassword', 'newPassword', 'confirmPassword'],
    rejectXss = true,
    rejectSqlInjection = true,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Only process POST, PUT, PATCH requests with body
      if (!['POST', 'PUT', 'PATCH'].includes(req.method) || !req.body) {
        return next();
      }

      // Check for attack patterns in raw body
      const bodyString = JSON.stringify(req.body);

      if (rejectXss && containsXss(bodyString)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_INPUT',
            message: 'Request contains potentially malicious content',
          },
        });
      }

      if (rejectSqlInjection && containsSqlInjection(bodyString)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_INPUT',
            message: 'Request contains potentially malicious content',
          },
        });
      }

      // Sanitize body, but skip password fields
      req.body = sanitizeObjectWithSkip(req.body, stringOptions, skipFields);

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Sanitize object while skipping certain fields
 */
function sanitizeObjectWithSkip(
  obj: Record<string, unknown>,
  options: SanitizeStringOptions,
  skipFields: string[]
): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (skipFields.includes(key)) {
      // Don't sanitize passwords, just pass through
      result[key] = value;
    } else if (typeof value === 'string') {
      result[key] = sanitizeString(value, options);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'string') {
          return sanitizeString(item, options);
        } else if (typeof item === 'object' && item !== null) {
          return sanitizeObjectWithSkip(item as Record<string, unknown>, options, skipFields);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObjectWithSkip(value as Record<string, unknown>, options, skipFields);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Create Express middleware that validates request against Zod schema
 */
export function validateMiddleware<T>(
  schema: ZodSchema<T>,
  options: ValidateMiddlewareOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const { source = 'body', sanitize = true } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let data = req[source];

      // Optionally sanitize before validation
      if (sanitize && typeof data === 'object') {
        data = sanitizeObject(data);
      }

      // Validate with Zod
      const result = schema.safeParse(data);

      if (!result.success) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: formatZodErrors(result.error),
          },
        });
      }

      // Replace request data with validated & sanitized data
      (req as unknown as Record<string, unknown>)[source] = result.data;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Format Zod errors into a user-friendly structure
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return errors;
}

/**
 * Create Express middleware that validates and sanitizes specific fields
 */
export function validateFieldsMiddleware(
  fieldValidators: Record<string, (value: unknown) => { valid: boolean; message?: string; value?: unknown }>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, string> = {};

    for (const [field, validator] of Object.entries(fieldValidators)) {
      const value = req.body[field];
      const result = validator(value);

      if (!result.valid) {
        errors[field] = result.message || `Invalid ${field}`;
      } else if (result.value !== undefined) {
        req.body[field] = result.value;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errors,
        },
      });
    }

    next();
  };
}

/**
 * Create Express middleware for query parameter sanitization
 */
export function sanitizeQueryMiddleware(
  options: SanitizeStringOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.query && typeof req.query === 'object') {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          (req.query as Record<string, string>)[key] = sanitizeString(value, options);
        }
      }
    }
    next();
  };
}
