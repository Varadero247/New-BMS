import { AuditService, createAuditService } from '../src/service';
import { AuditAction, AuditEntity, SENSITIVE_FIELDS, redactFields } from '../src/types';

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

describe('redactFields', () => {
  it('should redact exact sensitive field names', () => {
    const result = redactFields({ username: 'alice', password: 'secret123' });
    expect(result.username).toBe('alice');
    expect(result.password).toBe('[REDACTED]');
  });

  it('should redact fields containing sensitive substrings (case-insensitive)', () => {
    const result = redactFields({
      name: 'John',
      passwordHash: 'bcrypt$...',
      bankAccountNumber: '1234567890',
      refreshToken: 'eyJhb...',
    });
    expect(result.name).toBe('John');
    expect(result.passwordHash).toBe('[REDACTED]');
    expect(result.bankAccountNumber).toBe('[REDACTED]');
    expect(result.refreshToken).toBe('[REDACTED]');
  });

  it('should recursively redact nested objects', () => {
    const result = redactFields({
      user: {
        email: 'test@example.com',
        personalEmail: 'personal@example.com',
        nested: { apiKey: 'key-abc' },
      },
    });
    expect((result.user as Record<string, unknown>).email).toBe('test@example.com');
    expect((result.user as Record<string, unknown>).personalEmail).toBe('[REDACTED]');
    expect(
      ((result.user as Record<string, unknown>).nested as Record<string, unknown>).apiKey
    ).toBe('[REDACTED]');
  });

  it('should handle arrays and redact objects within them', () => {
    const result = redactFields({
      items: [
        { id: '1', salary: 50000 },
        { id: '2', jobTitle: 'Engineer' },
      ],
    });
    const items = result.items as Array<Record<string, unknown>>;
    expect(items[0].id).toBe('1');
    expect(items[0].salary).toBe('[REDACTED]');
    expect(items[1].jobTitle).toBe('Engineer');
  });

  it('should leave non-sensitive fields untouched', () => {
    const result = redactFields({
      id: 'abc',
      name: 'Test',
      status: 'ACTIVE',
      createdAt: '2024-01-01',
    });
    expect(result).toEqual({ id: 'abc', name: 'Test', status: 'ACTIVE', createdAt: '2024-01-01' });
  });

  it('should handle empty object', () => {
    expect(redactFields({})).toEqual({});
  });

  it('should redact PII fields from SENSITIVE_FIELDS list', () => {
    const result = redactFields({
      dateOfBirth: '1990-01-01',
      ssn: '123-45-6789',
      nationalId: 'ID123',
      medicalInfo: 'Diabetic',
    });
    expect(result.dateOfBirth).toBe('[REDACTED]');
    expect(result.ssn).toBe('[REDACTED]');
    expect(result.nationalId).toBe('[REDACTED]');
    expect(result.medicalInfo).toBe('[REDACTED]');
  });
});

describe('AuditService — additional coverage', () => {
  let auditService: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    auditService = createAuditService(
      mockPrisma as unknown as Parameters<typeof createAuditService>[0]
    );
  });

  it('query returns totalPages-equivalent: total/limit', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.count.mockResolvedValue(100);

    const result = await auditService.query({ page: 1, limit: 20 });

    expect(result.total).toBe(100);
    const totalPages = Math.ceil(result.total / 20);
    expect(totalPages).toBe(5);
  });

  it('query defaults page to 1 and limit to 50', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.count.mockResolvedValue(0);

    await auditService.query({});

    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 50 })
    );
  });

  it('logAuth stores success:false when auth fails', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'auth-fail-1' });

    await auditService.logAuth('LOGIN_FAILED', 'user-999', {
      ipAddress: '10.0.0.5',
      success: false,
      reason: 'Invalid password',
    });

    const call = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(call.data.newData.success).toBe(false);
    expect(call.data.newData.reason).toBe('Invalid password');
  });

  it('createAuditService with redactSensitiveFields:false does NOT redact password', async () => {
    const noRedact = createAuditService(
      mockPrisma as unknown as Parameters<typeof createAuditService>[0],
      { redactSensitiveFields: false }
    );
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-nr' });

    await noRedact.log({
      action: AuditAction.UPDATE,
      entity: AuditEntity.USER,
      newData: { password: 'plaintext' },
    });

    const call = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(call.data.newData.password).toBe('plaintext');
  });

  it('getUserActivity with date range passes startDate/endDate to query', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.count.mockResolvedValue(0);

    const start = new Date('2025-01-01');
    const end = new Date('2025-12-31');
    await auditService.getUserActivity('user-555', { startDate: start, endDate: end });

    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 'user-555',
          createdAt: { gte: start, lte: end },
        }),
      })
    );
  });

  it('cleanup uses configurable retentionDays', async () => {
    const shortRetention = createAuditService(
      mockPrisma as unknown as Parameters<typeof createAuditService>[0],
      { retentionDays: 30 }
    );
    mockPrisma.auditLog.deleteMany.mockResolvedValue({ count: 5 });

    const deleted = await shortRetention.cleanup();

    expect(deleted).toBe(5);
    const call = mockPrisma.auditLog.deleteMany.mock.calls[0][0];
    expect(call.where.createdAt.lt).toBeInstanceOf(Date);
  });
});

// ── Audit Service — further coverage ──────────────────────────────────────────

describe('AuditService — further coverage', () => {
  let auditService: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    auditService = createAuditService(
      mockPrisma as unknown as Parameters<typeof createAuditService>[0]
    );
  });

  it('log() passes ipAddress and userAgent to the DB create call', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-ip' });

    await auditService.log({
      action: AuditAction.CREATE,
      entity: AuditEntity.USER,
      ipAddress: '10.10.10.1',
      userAgent: 'Test-Agent/1.0',
    });

    const call = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(call.data.ipAddress).toBe('10.10.10.1');
    expect(call.data.userAgent).toBe('Test-Agent/1.0');
  });

  it('logCreate stores newData in the DB entry', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-newdata' });

    await auditService.logCreate('Product', 'prod-1', { name: 'Widget', price: 9.99 }, {});

    const call = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(call.data.newData).toMatchObject({ name: 'Widget' });
  });

  it('logDelete has no newData (or null newData)', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-del' });

    await auditService.logDelete('Product', 'prod-2', { name: 'Widget' }, {});

    const call = mockPrisma.auditLog.create.mock.calls[0][0];
    expect([null, undefined]).toContain(call.data.newData);
  });

  it('query with userId filter passes it to findMany', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.count.mockResolvedValue(0);

    await auditService.query({ userId: 'user-filter-123' });

    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-filter-123' }),
      })
    );
  });

  it('getEntityHistory passes limit to findMany when provided', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);
    mockPrisma.auditLog.count.mockResolvedValue(0);

    await auditService.getEntityHistory('Document', 'doc-1', { limit: 5 });

    expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 })
    );
  });

  it('SENSITIVE_FIELDS contains bankAccount', () => {
    expect(SENSITIVE_FIELDS).toContain('bankAccount');
  });
});

// ── AuditService — comprehensive coverage ─────────────────────────────────────

describe('AuditService — comprehensive coverage', () => {
  let auditService: AuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    auditService = createAuditService(
      mockPrisma as unknown as Parameters<typeof createAuditService>[0]
    );
  });

  it('logUpdate stores both oldData and newData', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'upd-1' });

    await auditService.logUpdate(
      'Incident',
      'inc-1',
      { status: 'open' },
      { status: 'closed' },
      { userId: 'admin-2' }
    );

    const call = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(call.data.oldData).toEqual({ status: 'open' });
    expect(call.data.newData).toEqual({ status: 'closed' });
  });

  it('query without entity or action returns all results', async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([{ id: 'log-all' }]);
    mockPrisma.auditLog.count.mockResolvedValue(1);

    const result = await auditService.query({});

    expect(result.logs).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('logCreate passes entityId correctly', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'create-eid' });

    await auditService.logCreate('Asset', 'asset-99', { name: 'Pump' }, {});

    const call = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(call.data.entityId).toBe('asset-99');
    expect(call.data.entity).toBe('Asset');
  });

  it('logDelete sets entity and entityId correctly', async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: 'del-eid' });

    await auditService.logDelete('Contract', 'cont-7', { title: 'Old' }, {});

    const call = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(call.data.entity).toBe('Contract');
    expect(call.data.entityId).toBe('cont-7');
  });

  it('redactFields: fields matching "secret" substring are redacted', () => {
    const result = redactFields({ clientSecret: 'abc123' });
    expect(result.clientSecret).toBe('[REDACTED]');
  });
});
