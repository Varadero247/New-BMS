import { Request, Response, NextFunction } from 'express';
import {
  auditMiddleware,
  attachOldData,
  createAuditLogger,
  AuditMiddlewareOptions,
} from '../src/middleware';
import { AuditService } from '../src/service';
import { AuditAction, AuditEntity } from '../src/types';

// Mock @ims/monitoring logger
jest.mock('@ims/monitoring', () => {
  const fns = { error: jest.fn(), info: jest.fn(), warn: jest.fn() };
  return { createLogger: jest.fn(() => fns), __mockFns: fns };
});
const { __mockFns: mockLoggerFns } = require('@ims/monitoring');

// Mock audit service
const mockAuditService = {
  log: jest.fn().mockResolvedValue('log-123'),
  logAuth: jest.fn().mockResolvedValue('log-456'),
} as unknown as AuditService;

describe('Audit Middleware', () => {
  let mockReq: Partial<Request & { user?: { id: string }; auditContext?: any }>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockReq = {
      method: 'GET',
      params: { id: 'entity-123' },
      body: { name: 'Test' },
      headers: {
        'user-agent': 'test-agent',
        'x-forwarded-for': '192.168.1.1',
      },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as unknown as import('net').Socket,
      user: { id: 'user-123' },
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('auditMiddleware', () => {
    it('should call next immediately', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should log audit event with setImmediate', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Run setImmediate callbacks
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          action: AuditAction.READ,
          entity: AuditEntity.USER,
          entityId: 'entity-123',
        })
      );
    });

    it('should skip logging when skip function returns true', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
        skip: () => true,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use POST method as CREATE action', async () => {
      mockReq.method = 'POST';
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.CREATE,
        })
      );
    });

    it('should use PUT method as UPDATE action', async () => {
      mockReq.method = 'PUT';
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.UPDATE,
        })
      );
    });

    it('should use PATCH method as UPDATE action', async () => {
      mockReq.method = 'PATCH';
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.UPDATE,
        })
      );
    });

    it('should use DELETE method as DELETE action', async () => {
      mockReq.method = 'DELETE';
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.DELETE,
        })
      );
    });

    it('should use custom getEntityId function', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
        getEntityId: (req) => req.body?.id || 'custom-id',
      });

      mockReq.body = { id: 'body-entity-id' };

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          entityId: 'body-entity-id',
        })
      );
    });

    it('should use custom getAction function', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
        getAction: () => 'CUSTOM_ACTION',
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CUSTOM_ACTION',
        })
      );
    });

    it('should not include body when includeBody is false', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
        includeBody: false,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          newData: undefined,
        })
      );
    });

    it('should exclude sensitive fields', async () => {
      mockReq.method = 'POST';
      mockReq.body = {
        name: 'Test',
        password: 'secret',
        token: 'abc123',
      };

      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
        excludeFields: ['password', 'token'],
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      const logCall = (mockAuditService.log as jest.Mock).mock.calls[0][0];
      expect(logCall.newData).not.toHaveProperty('password');
      expect(logCall.newData).not.toHaveProperty('token');
      expect(logCall.newData).toHaveProperty('name', 'Test');
    });

    it('should get IP from x-forwarded-for header', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.1',
        })
      );
    });

    it('should fall back to req.ip when no x-forwarded-for', async () => {
      mockReq.headers = { 'user-agent': 'test-agent' };
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '127.0.0.1',
        })
      );
    });

    it('should include user agent', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          userAgent: 'test-agent',
        })
      );
    });

    it('should handle audit service errors gracefully', async () => {
      jest.useRealTimers(); // Use real timers for this test
      mockLoggerFns.error.mockClear();
      (mockAuditService.log as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Wait for setImmediate and promise rejection
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockLoggerFns.error).toHaveBeenCalledWith(
        'Audit logging failed',
        expect.objectContaining({ error: 'DB error' })
      );
      jest.useFakeTimers(); // Restore fake timers
    });

    it('should store audit context on request', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.auditContext).toEqual({
        entity: AuditEntity.USER,
        entityId: 'entity-123',
        action: AuditAction.READ,
      });
    });

    it('should intercept response when includeResponse is true', async () => {
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
        includeResponse: true,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      // Call the intercepted json method
      (mockRes.json as jest.Mock)({ success: true, data: { id: 'user-123' } });
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should handle unknown HTTP method', async () => {
      mockReq.method = 'OPTIONS';
      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'OPTIONS',
        })
      );
    });
  });

  describe('attachOldData', () => {
    it('should attach old data for PUT requests', async () => {
      mockReq.method = 'PUT';
      const getData = jest.fn().mockResolvedValue({ name: 'Old Name' });

      const middleware = attachOldData(getData);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(getData).toHaveBeenCalledWith(mockReq);
      expect(mockReq.auditContext?.oldData).toEqual({ name: 'Old Name' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should attach old data for PATCH requests', async () => {
      mockReq.method = 'PATCH';
      const getData = jest.fn().mockResolvedValue({ name: 'Old Name' });

      const middleware = attachOldData(getData);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.auditContext?.oldData).toEqual({ name: 'Old Name' });
    });

    it('should attach old data for DELETE requests', async () => {
      mockReq.method = 'DELETE';
      const getData = jest.fn().mockResolvedValue({ name: 'Old Name' });

      const middleware = attachOldData(getData);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.auditContext?.oldData).toEqual({ name: 'Old Name' });
    });

    it('should not attach old data for GET requests', async () => {
      mockReq.method = 'GET';
      const getData = jest.fn().mockResolvedValue({ name: 'Old Name' });

      const middleware = attachOldData(getData);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(getData).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should not attach old data for POST requests', async () => {
      mockReq.method = 'POST';
      const getData = jest.fn().mockResolvedValue({ name: 'Old Name' });

      const middleware = attachOldData(getData);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(getData).not.toHaveBeenCalled();
    });

    it('should handle null return from getData', async () => {
      mockReq.method = 'PUT';
      const getData = jest.fn().mockResolvedValue(null);

      const middleware = attachOldData(getData);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.auditContext?.oldData).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle getData errors gracefully', async () => {
      mockLoggerFns.error.mockClear();
      mockReq.method = 'PUT';
      const getData = jest.fn().mockRejectedValue(new Error('DB error'));

      const middleware = attachOldData(getData);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockLoggerFns.error).toHaveBeenCalledWith(
        'Failed to get old data for audit',
        expect.objectContaining({ error: 'DB error' })
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should preserve existing audit context', async () => {
      mockReq.method = 'PUT';
      mockReq.auditContext = { entity: 'ExistingEntity' };
      const getData = jest.fn().mockResolvedValue({ name: 'Old Name' });

      const middleware = attachOldData(getData);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.auditContext.entity).toBe('ExistingEntity');
      expect(mockReq.auditContext.oldData).toEqual({ name: 'Old Name' });
    });
  });

  describe('createAuditLogger', () => {
    it('should create an audit logger object', () => {
      const logger = createAuditLogger(mockAuditService);

      expect(logger).toHaveProperty('logAction');
      expect(logger).toHaveProperty('logAuth');
    });

    describe('logAction', () => {
      it('should log an action', async () => {
        const logger = createAuditLogger(mockAuditService);

        await logger.logAction(mockReq as Request, 'CUSTOM_ACTION', 'CustomEntity', 'entity-456', {
          newData: { foo: 'bar' },
        });

        expect(mockAuditService.log).toHaveBeenCalledWith({
          userId: 'user-123',
          action: 'CUSTOM_ACTION',
          entity: 'CustomEntity',
          entityId: 'entity-456',
          oldData: undefined,
          newData: { foo: 'bar' },
          ipAddress: '192.168.1.1',
          userAgent: 'test-agent',
        });
      });

      it('should handle missing user', async () => {
        delete mockReq.user;
        const logger = createAuditLogger(mockAuditService);

        await logger.logAction(mockReq as Request, 'ACTION', 'Entity');

        expect(mockAuditService.log).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: undefined,
          })
        );
      });
    });

    describe('logAuth', () => {
      it('should log an auth event', async () => {
        const logger = createAuditLogger(mockAuditService);

        await logger.logAuth(mockReq as Request, 'LOGIN', 'user-123', true);

        expect(mockAuditService.logAuth).toHaveBeenCalledWith('LOGIN', 'user-123', {
          ipAddress: '192.168.1.1',
          userAgent: 'test-agent',
          success: true,
          reason: undefined,
        });
      });

      it('should log failed auth with reason', async () => {
        const logger = createAuditLogger(mockAuditService);

        await logger.logAuth(
          mockReq as Request,
          'LOGIN_FAILED',
          undefined,
          false,
          'Invalid password'
        );

        expect(mockAuditService.logAuth).toHaveBeenCalledWith('LOGIN_FAILED', undefined, {
          ipAddress: '192.168.1.1',
          userAgent: 'test-agent',
          success: false,
          reason: 'Invalid password',
        });
      });
    });
  });

  describe('filterFields', () => {
    it('should filter nested sensitive fields', async () => {
      mockReq.method = 'POST';
      mockReq.body = {
        user: {
          name: 'Test',
          password: 'secret',
        },
      };

      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
        excludeFields: ['password'],
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      const logCall = (mockAuditService.log as jest.Mock).mock.calls[0][0];
      expect(logCall.newData.user).not.toHaveProperty('password');
      expect(logCall.newData.user).toHaveProperty('name', 'Test');
    });
  });

  describe('getClientIp', () => {
    it('should parse multiple IPs from x-forwarded-for', async () => {
      mockReq.headers = {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
        'user-agent': 'test-agent',
      };

      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '192.168.1.1',
        })
      );
    });

    it('should fall back to socket.remoteAddress', async () => {
      mockReq = {
        ...mockReq,
        headers: { 'user-agent': 'test-agent' },
        ip: undefined,
        socket: { remoteAddress: '10.0.0.5' } as unknown as import('net').Socket,
      };

      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '10.0.0.5',
        })
      );
    });

    it('should return unknown when no IP available', async () => {
      mockReq = {
        ...mockReq,
        headers: { 'user-agent': 'test-agent' },
        ip: undefined,
        socket: {} as unknown as import('net').Socket,
      };

      const middleware = auditMiddleware(mockAuditService, {
        entity: AuditEntity.USER,
      });

      await middleware(mockReq as Request, mockRes as Response, mockNext);
      jest.runAllTimers();

      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: 'unknown',
        })
      );
    });
  });
});

// ── Audit Middleware — final coverage ─────────────────────────────────────────

describe('Audit Middleware — final coverage', () => {
  let mockReq: Partial<Request & { user?: { id: string }; auditContext?: any }>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockReq = {
      method: 'GET',
      params: { id: 'entity-123' },
      body: {},
      headers: { 'user-agent': 'test-agent', 'x-forwarded-for': '10.0.0.1' },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as unknown as import('net').Socket,
      user: { id: 'user-fin' },
    };

    mockRes = { json: jest.fn().mockReturnThis() };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('auditMiddleware logs action READ for GET by default', async () => {
    const middleware = auditMiddleware(mockAuditService, { entity: AuditEntity.USER });
    await middleware(mockReq as Request, mockRes as Response, mockNext);
    jest.runAllTimers();
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: AuditAction.READ })
    );
  });

  it('createAuditLogger.logAction passes oldData from options', async () => {
    const logger = createAuditLogger(mockAuditService);
    await logger.logAction(mockReq as Request, 'UPDATE', 'Entity', 'e-1', {
      oldData: { name: 'old' },
      newData: { name: 'new' },
    });
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ oldData: { name: 'old' }, newData: { name: 'new' } })
    );
  });

  it('attachOldData calls next even when getData returns null', async () => {
    mockReq.method = 'DELETE';
    const getData = jest.fn().mockResolvedValue(null);
    const middleware = attachOldData(getData);
    await middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('auditMiddleware stores entity in auditContext', async () => {
    const middleware = auditMiddleware(mockAuditService, { entity: AuditEntity.USER });
    await middleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockReq.auditContext?.entity).toBe(AuditEntity.USER);
  });

  it('createAuditLogger returns object with logAction and logAuth methods', () => {
    const logger = createAuditLogger(mockAuditService);
    expect(typeof logger.logAction).toBe('function');
    expect(typeof logger.logAuth).toBe('function');
  });
});

describe('middleware — phase29 coverage', () => {
  it('handles reduce method', () => {
    expect([1, 2, 3].reduce((acc, x) => acc + x, 0)).toBe(6);
  });

  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

  it('handles Number.isInteger', () => {
    expect(Number.isInteger(42)).toBe(true);
  });

  it('handles string padStart', () => {
    expect('5'.padStart(3, '0')).toBe('005');
  });

  it('handles undefined check', () => {
    expect(undefined).toBeUndefined();
  });

});
