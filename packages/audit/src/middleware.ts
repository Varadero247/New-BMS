import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuditService } from './service';
import { AuditAction, AuditEntity } from './types';

/**
 * Extended request type with user and audit info
 */
interface AuditRequest extends Request {
  user?: { id: string };
  auditContext?: {
    entity: string;
    entityId?: string;
    action?: string;
    oldData?: Record<string, unknown>;
  };
}

/**
 * Options for audit middleware
 */
export interface AuditMiddlewareOptions {
  /** Entity type being audited */
  entity: AuditEntity | string;
  /** Get entity ID from request */
  getEntityId?: (req: Request) => string | undefined;
  /** Get action from request */
  getAction?: (req: Request) => string;
  /** Skip audit for certain conditions */
  skip?: (req: Request) => boolean;
  /** Include request body in audit */
  includeBody?: boolean;
  /** Include response in audit */
  includeResponse?: boolean;
  /** Fields to exclude from logging */
  excludeFields?: string[];
}

/**
 * Map HTTP methods to default audit actions
 */
const METHOD_TO_ACTION: Record<string, string> = {
  GET: AuditAction.READ,
  POST: AuditAction.CREATE,
  PUT: AuditAction.UPDATE,
  PATCH: AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

/**
 * Create audit logging middleware
 */
export function auditMiddleware(
  auditService: AuditService,
  options: AuditMiddlewareOptions
): RequestHandler {
  const {
    entity,
    getEntityId = (req) => req.params.id,
    getAction = (req) => METHOD_TO_ACTION[req.method] || req.method,
    skip = () => false,
    includeBody = true,
    includeResponse = false,
    excludeFields = ['password', 'token', 'secret'],
  } = options;

  return async (req: AuditRequest, res: Response, next: NextFunction) => {
    // Skip if condition met
    if (skip(req)) {
      return next();
    }

    const entityId = getEntityId(req);
    const action = getAction(req);

    // Store context for use in response
    req.auditContext = {
      entity,
      entityId,
      action,
    };

    // Capture original json method to intercept response
    if (includeResponse) {
      const originalJson = res.json.bind(res);
      res.json = function (body: unknown): Response {
        // Log after response is sent
        setImmediate(() => {
          logAuditEvent(
            auditService,
            req as AuditRequest,
            action,
            entity,
            entityId,
            excludeFields,
            includeBody ? req.body : undefined,
            body as Record<string, unknown>
          );
        });
        return originalJson(body);
      };
    } else {
      // Log immediately for non-response logging
      setImmediate(() => {
        logAuditEvent(
          auditService,
          req as AuditRequest,
          action,
          entity,
          entityId,
          excludeFields,
          includeBody ? req.body : undefined
        );
      });
    }

    next();
  };
}

/**
 * Internal function to log audit event
 */
async function logAuditEvent(
  auditService: AuditService,
  req: AuditRequest,
  action: string,
  entity: string,
  entityId: string | undefined,
  excludeFields: string[],
  requestBody?: Record<string, unknown>,
  responseBody?: Record<string, unknown>
): Promise<void> {
  try {
    const cleanBody = requestBody ? filterFields(requestBody, excludeFields) : undefined;
    const cleanResponse = responseBody ? filterFields(responseBody, excludeFields) : undefined;

    await auditService.log({
      userId: req.user?.id,
      action,
      entity,
      entityId,
      newData: cleanBody,
      oldData: req.auditContext?.oldData,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

/**
 * Filter out sensitive fields
 */
function filterFields(
  data: Record<string, unknown>,
  excludeFields: string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (excludeFields.includes(key)) {
      continue;
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = filterFields(value as Record<string, unknown>, excludeFields);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Get client IP address
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Middleware to attach old data for update operations
 */
export function attachOldData(
  getData: (req: Request) => Promise<Record<string, unknown> | null>
): RequestHandler {
  return async (req: AuditRequest, res: Response, next: NextFunction) => {
    try {
      if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const oldData = await getData(req);
        if (oldData) {
          req.auditContext = {
            ...req.auditContext,
            entity: req.auditContext?.entity || 'Unknown',
            oldData,
          };
        }
      }
      next();
    } catch (error) {
      // Don't fail the request if we can't get old data
      console.error('Failed to get old data for audit:', error);
      next();
    }
  };
}

/**
 * Manual audit logging helper
 */
export function createAuditLogger(auditService: AuditService) {
  return {
    logAction: async (
      req: Request,
      action: string,
      entity: string,
      entityId?: string,
      data?: { oldData?: Record<string, unknown>; newData?: Record<string, unknown> }
    ) => {
      return auditService.log({
        userId: (req as AuditRequest).user?.id,
        action,
        entity,
        entityId,
        oldData: data?.oldData,
        newData: data?.newData,
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      });
    },

    logAuth: async (
      req: Request,
      action: string,
      userId?: string,
      success?: boolean,
      reason?: string
    ) => {
      return auditService.logAuth(action, userId, {
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        success,
        reason,
      });
    },
  };
}
