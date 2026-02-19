import { AuditService, createAuditService } from '../src/service';
import { AuditAction, AuditEntity, SENSITIVE_FIELDS } from '../src/types';

// Mock Prisma client
const mockPrisma = {
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('AuditService', () => {
  let auditService: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    auditService = createAuditService(mockPrisma as unknown as Parameters<typeof createAuditService>[0]);
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-123' });

      const result = await auditService.log({
        userId: 'user-123',
        action: AuditAction.CREATE,
        entity: AuditEntity.USER,
        entityId: 'entity-456',
        newData: { name: 'Test' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(result).toBe('log-123');
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          action: 'CREATE',
          entity: 'User',
          entityId: 'entity-456',
        }),
      });
    });

    it('should redact sensitive fields', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-123' });

      await auditService.log({
        action: AuditAction.UPDATE,
        entity: AuditEntity.USER,
        newData: {
          email: 'test@example.com',
          password: 'secret123',
          token: 'abc123',
        },
      });

      const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
      expect(createCall.data.newData.email).toBe('test@example.com');
      expect(createCall.data.newData.password).toBe('[REDACTED]');
      expect(createCall.data.newData.token).toBe('[REDACTED]');
    });

    it('should redact nested sensitive fields', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-123' });

      await auditService.log({
        action: AuditAction.UPDATE,
        entity: AuditEntity.USER,
        newData: {
          user: {
            email: 'test@example.com',
            passwordHash: 'hashedvalue',
          },
        },
      });

      const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
      expect(createCall.data.newData.user.email).toBe('test@example.com');
      expect(createCall.data.newData.user.passwordHash).toBe('[REDACTED]');
    });

    it('should return null when disabled', async () => {
      const disabledService = createAuditService(mockPrisma as unknown as Parameters<typeof createAuditService>[0], { enabled: false });

      const result = await disabledService.log({
        action: AuditAction.CREATE,
        entity: AuditEntity.USER,
      });

      expect(result).toBeNull();
      expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('should return null on error and not throw', async () => {
      mockPrisma.auditLog.create.mockRejectedValue(new Error('DB Error'));

      const result = await auditService.log({
        action: AuditAction.CREATE,
        entity: AuditEntity.USER,
      });

      expect(result).toBeNull();
    });
  });

  describe('logCreate', () => {
    it('should log a create operation', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-123' });

      await auditService.logCreate(
        'User',
        'user-123',
        { name: 'John', email: 'john@example.com' },
        { userId: 'admin-1' }
      );

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'CREATE',
          entity: 'User',
          entityId: 'user-123',
          userId: 'admin-1',
        }),
      });
    });
  });

  describe('logUpdate', () => {
    it('should log an update operation with old and new data', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-123' });

      await auditService.logUpdate(
        'User',
        'user-123',
        { name: 'John' },
        { name: 'Jane' },
        { userId: 'admin-1' }
      );

      const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
      expect(createCall.data.action).toBe('UPDATE');
      expect(createCall.data.oldData).toEqual({ name: 'John' });
      expect(createCall.data.newData).toEqual({ name: 'Jane' });
    });
  });

  describe('logDelete', () => {
    it('should log a delete operation', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-123' });

      await auditService.logDelete('User', 'user-123', { name: 'John' }, { userId: 'admin-1' });

      const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
      expect(createCall.data.action).toBe('DELETE');
      expect(createCall.data.oldData).toEqual({ name: 'John' });
    });
  });

  describe('logAuth', () => {
    it('should log authentication events', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-123' });

      await auditService.logAuth('LOGIN', 'user-123', {
        ipAddress: '192.168.1.1',
        success: true,
      });

      const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
      expect(createCall.data.action).toBe('LOGIN');
      expect(createCall.data.entity).toBe('Session');
      expect(createCall.data.newData.success).toBe(true);
    });
  });

  describe('query', () => {
    it('should query audit logs with pagination', async () => {
      const mockLogs = [
        { id: 'log-1', action: 'CREATE', entity: 'User' },
        { id: 'log-2', action: 'UPDATE', entity: 'User' },
      ];
      mockPrisma.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrisma.auditLog.count.mockResolvedValue(100);

      const result = await auditService.query({
        page: 2,
        limit: 20,
      });

      expect(result.logs).toEqual(mockLogs);
      expect(result.total).toBe(100);
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 20,
        })
      );
    });

    it('should filter by entity and action', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await auditService.query({
        entity: 'User',
        action: 'CREATE',
      });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entity: 'User',
            action: 'CREATE',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await auditService.query({ startDate, endDate });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        })
      );
    });
  });

  describe('getEntityHistory', () => {
    it('should get history for a specific entity', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await auditService.getEntityHistory('User', 'user-123');

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entity: 'User',
            entityId: 'user-123',
          }),
        })
      );
    });
  });

  describe('getUserActivity', () => {
    it('should get activity for a specific user', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await auditService.getUserActivity('user-123');

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
          }),
        })
      );
    });
  });

  describe('cleanup', () => {
    it('should delete old audit logs', async () => {
      mockPrisma.auditLog.deleteMany.mockResolvedValue({ count: 150 });

      const result = await auditService.cleanup();

      expect(result).toBe(150);
      expect(mockPrisma.auditLog.deleteMany).toHaveBeenCalledWith({
        where: {
          createdAt: { lt: expect.any(Date) },
        },
      });
    });
  });
});

describe('SENSITIVE_FIELDS', () => {
  it('should include common sensitive field names', () => {
    expect(SENSITIVE_FIELDS).toContain('password');
    expect(SENSITIVE_FIELDS).toContain('token');
    expect(SENSITIVE_FIELDS).toContain('secret');
    expect(SENSITIVE_FIELDS).toContain('apiKey');
  });
});
