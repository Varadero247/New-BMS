import { PrismaClient } from '@ims/database';
import { createLogger } from '@ims/monitoring';
import {
  computeAuditChecksum,
  verifyAuditChecksum,
  computeChanges,
  type ChangeDetail,
  type EnhancedAuditEntry,
} from '@ims/esig';

const logger = createLogger('audit-enhanced');

export interface EnhancedAuditCreateParams {
  tenantId?: string;
  userId: string;
  userEmail: string;
  userFullName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceRef: string;
  changes: ChangeDetail[];
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  esignatureId?: string;
  systemVersion?: string;
}

export interface EnhancedAuditQueryOptions {
  tenantId?: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Enhanced audit trail service for 21 CFR Part 11 compliance.
 * Features:
 * - Field-level change tracking
 * - SHA-256 tamper detection checksums
 * - Electronic signature linking
 * - Full user context (IP, user agent, session)
 */
export class EnhancedAuditService {
  private prisma: PrismaClient;
  private systemVersion: string;

  constructor(prisma: PrismaClient, systemVersion: string = '1.0.0') {
    this.prisma = prisma;
    this.systemVersion = systemVersion;
  }

  /**
   * Create an enhanced audit trail entry with checksum.
   */
  async createEntry(params: EnhancedAuditCreateParams): Promise<string | null> {
    try {
      const now = new Date();
      const checksum = computeAuditChecksum({
        userId: params.userId,
        action: params.action,
        resourceId: params.resourceId,
        timestamp: now,
        changes: params.changes,
      });

      const entry = await this.prisma.enhancedAuditTrail.create({
        data: {
          tenantId: params.tenantId || 'default',
          userId: params.userId,
          userEmail: params.userEmail,
          userFullName: params.userFullName,
          action: params.action,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          resourceRef: params.resourceRef,
          changes: params.changes as unknown as object,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
          sessionId: params.sessionId || '',
          esignatureId: params.esignatureId,
          systemVersion: params.systemVersion || this.systemVersion,
          checksum,
          createdAt: now,
        },
      });

      return entry.id;
    } catch (error) {
      logger.error('Failed to create enhanced audit entry', {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Log a create operation with auto-computed changes.
   */
  async logCreate(
    params: Omit<EnhancedAuditCreateParams, 'action' | 'changes'> & {
      newData: Record<string, unknown>;
    }
  ): Promise<string | null> {
    const changes = Object.entries(params.newData).map(([field, newValue]) => ({
      field,
      oldValue: null as unknown,
      newValue,
    }));

    return this.createEntry({
      ...params,
      action: 'CREATE',
      changes,
    });
  }

  /**
   * Log an update operation with auto-computed field diff.
   */
  async logUpdate(
    params: Omit<EnhancedAuditCreateParams, 'action' | 'changes'> & {
      oldData: Record<string, unknown>;
      newData: Record<string, unknown>;
    }
  ): Promise<string | null> {
    const changes = computeChanges(params.oldData, params.newData);

    return this.createEntry({
      ...params,
      action: 'UPDATE',
      changes,
    });
  }

  /**
   * Log a delete operation.
   */
  async logDelete(
    params: Omit<EnhancedAuditCreateParams, 'action' | 'changes'> & {
      deletedData: Record<string, unknown>;
    }
  ): Promise<string | null> {
    const changes = Object.entries(params.deletedData).map(([field, oldValue]) => ({
      field,
      oldValue,
      newValue: null as unknown,
    }));

    return this.createEntry({
      ...params,
      action: 'DELETE',
      changes,
    });
  }

  /**
   * Log an approval/sign action.
   */
  async logApproval(
    params: Omit<EnhancedAuditCreateParams, 'action' | 'changes'> & {
      meaning: string;
      esignatureId: string;
    }
  ): Promise<string | null> {
    return this.createEntry({
      ...params,
      action: 'APPROVE',
      changes: [{ field: 'signature', oldValue: null, newValue: params.meaning }],
    });
  }

  /**
   * Query the enhanced audit trail.
   */
  async query(options: EnhancedAuditQueryOptions = {}): Promise<{
    entries: EnhancedAuditEntry[];
    total: number;
  }> {
    const {
      tenantId,
      userId,
      resourceType,
      resourceId,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options;

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;
    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    if (action) where.action = action;

    if (startDate || endDate) {
      const createdAt: Record<string, Date> = {};
      if (startDate) createdAt.gte = startDate;
      if (endDate) createdAt.lte = endDate;
      where.createdAt = createdAt;
    }

    const skip = (page - 1) * Math.min(limit, 100);
    const take = Math.min(limit, 100);

    const [entries, total] = await Promise.all([
      this.prisma.enhancedAuditTrail.findMany({
        where: where as Record<string, unknown>,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { esignature: true },
      }),
      this.prisma.enhancedAuditTrail.count({ where: where as Record<string, unknown> }),
    ]);

    return {
      entries: entries.map((e) => ({
        id: e.id,
        tenantId: e.tenantId,
        userId: e.userId,
        userEmail: e.userEmail,
        userFullName: e.userFullName,
        action: e.action,
        resourceType: e.resourceType,
        resourceId: e.resourceId,
        resourceRef: e.resourceRef,
        changes: (e.changes as unknown as ChangeDetail[]) || [],
        ipAddress: e.ipAddress,
        userAgent: e.userAgent,
        sessionId: e.sessionId,
        timestamp: e.createdAt,
        esignatureId: e.esignatureId || undefined,
        systemVersion: e.systemVersion,
        checksum: e.checksum,
      })),
      total,
    };
  }

  /**
   * Get full audit history for a specific resource.
   */
  async getResourceHistory(
    resourceType: string,
    resourceId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ entries: EnhancedAuditEntry[]; total: number }> {
    return this.query({
      resourceType,
      resourceId,
      ...options,
    });
  }

  /**
   * Verify integrity of an audit entry (tamper detection).
   */
  async verifyEntry(entryId: string): Promise<{
    valid: boolean;
    entryId: string;
    checksumMatch: boolean;
  }> {
    const entry = await this.prisma.enhancedAuditTrail.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      return { valid: false, entryId, checksumMatch: false };
    }

    const checksumMatch = verifyAuditChecksum({
      userId: entry.userId,
      action: entry.action,
      resourceId: entry.resourceId,
      timestamp: entry.createdAt,
      changes: (entry.changes as unknown as ChangeDetail[]) || [],
      storedChecksum: entry.checksum,
    });

    if (!checksumMatch) {
      logger.warn('Audit entry checksum mismatch — possible tampering', {
        entryId,
        userId: entry.userId,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
      });
    }

    return { valid: checksumMatch, entryId, checksumMatch };
  }
}

/**
 * Create an enhanced audit service instance.
 */
export function createEnhancedAuditService(
  prisma: PrismaClient,
  systemVersion?: string
): EnhancedAuditService {
  return new EnhancedAuditService(prisma, systemVersion);
}
