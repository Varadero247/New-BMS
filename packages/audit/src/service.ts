import { PrismaClient } from '@ims/database';
import {
  AuditLogEntry,
  AuditLogQueryOptions,
  AuditLogResult,
  SENSITIVE_FIELDS,
} from './types';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('audit');

/**
 * Audit logging service
 */
export class AuditService {
  private prisma: PrismaClient;
  private enabled: boolean;
  private redactSensitiveFields: boolean;
  private retentionDays: number;

  constructor(
    prisma: PrismaClient,
    options: {
      enabled?: boolean;
      redactSensitiveFields?: boolean;
      retentionDays?: number;
    } = {}
  ) {
    this.prisma = prisma;
    this.enabled = options.enabled !== false;
    this.redactSensitiveFields = options.redactSensitiveFields !== false;
    this.retentionDays = options.retentionDays || 365; // Default 1 year
  }

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<string | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      // Redact sensitive fields
      const oldData = this.redactSensitive(entry.oldData);
      const newData = this.redactSensitive(entry.newData);

      const auditLog = await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId,
          oldData: oldData as object | undefined,
          newData: newData as object | undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });

      return auditLog.id;
    } catch (error) {
      // Audit logging should never fail the main operation
      logger.error('Failed to create audit log', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Log a create operation
   */
  async logCreate(
    entity: string,
    entityId: string,
    data: Record<string, unknown>,
    options: { userId?: string; ipAddress?: string; userAgent?: string } = {}
  ): Promise<string | null> {
    return this.log({
      action: 'CREATE',
      entity,
      entityId,
      newData: data,
      ...options,
    });
  }

  /**
   * Log an update operation
   */
  async logUpdate(
    entity: string,
    entityId: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    options: { userId?: string; ipAddress?: string; userAgent?: string } = {}
  ): Promise<string | null> {
    return this.log({
      action: 'UPDATE',
      entity,
      entityId,
      oldData,
      newData,
      ...options,
    });
  }

  /**
   * Log a delete operation
   */
  async logDelete(
    entity: string,
    entityId: string,
    data: Record<string, unknown>,
    options: { userId?: string; ipAddress?: string; userAgent?: string } = {}
  ): Promise<string | null> {
    return this.log({
      action: 'DELETE',
      entity,
      entityId,
      oldData: data,
      ...options,
    });
  }

  /**
   * Log an authentication event
   */
  async logAuth(
    action: string,
    userId: string | undefined,
    options: {
      ipAddress?: string;
      userAgent?: string;
      success?: boolean;
      reason?: string;
    } = {}
  ): Promise<string | null> {
    return this.log({
      action,
      entity: 'Session',
      userId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      newData: {
        success: options.success,
        reason: options.reason,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Query audit logs
   */
  async query(
    options: AuditLogQueryOptions = {}
  ): Promise<{ logs: AuditLogResult[]; total: number }> {
    const {
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortOrder = 'desc',
    } = options;

    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;

    if (startDate || endDate) {
      const createdAt: Record<string, Date> = {};
      if (startDate) createdAt.gte = startDate;
      if (endDate) createdAt.lte = endDate;
      where.createdAt = createdAt;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs as unknown as AuditLogResult[],
      total,
    };
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityHistory(
    entity: string,
    entityId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ logs: AuditLogResult[]; total: number }> {
    return this.query({
      entity,
      entityId,
      ...options,
    });
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserActivity(
    userId: string,
    options: { page?: number; limit?: number; startDate?: Date; endDate?: Date } = {}
  ): Promise<{ logs: AuditLogResult[]; total: number }> {
    return this.query({
      userId,
      ...options,
    });
  }

  /**
   * Cleanup old audit logs
   */
  async cleanup(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }

  /**
   * Redact sensitive fields from data
   */
  private redactSensitive(
    data: Record<string, unknown> | undefined
  ): Record<string, unknown> | undefined {
    if (!data || !this.redactSensitiveFields) {
      return data;
    }

    return this.redactObject(data);
  }

  private redactObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.redactObject(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          typeof item === 'object' && item !== null
            ? this.redactObject(item as Record<string, unknown>)
            : item
        );
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}

/**
 * Create an audit service instance
 */
export function createAuditService(
  prisma: PrismaClient,
  options?: {
    enabled?: boolean;
    redactSensitiveFields?: boolean;
    retentionDays?: number;
  }
): AuditService {
  return new AuditService(prisma, options);
}
