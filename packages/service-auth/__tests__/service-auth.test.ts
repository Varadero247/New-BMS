import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {
  generateServiceToken,
  verifyServiceToken,
  requireServiceAuth,
  optionalServiceAuth,
  hasServicePermission,
  requireServicePermission,
  createServiceHeaders,
  addServiceTokenToProxy,
  configureServiceAuth,
  resetServiceAuthConfig,
  ServiceAuthRequest,
} from '../src/index';

describe('Service Auth Package', () => {
  const TEST_SECRET = 'test-service-secret-that-is-at-least-32-characters-long';

  beforeEach(() => {
    resetServiceAuthConfig();
    process.env.SERVICE_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.SERVICE_SECRET;
    delete process.env.JWT_SECRET;
  });

  describe('generateServiceToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateServiceToken('api-gateway');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include service name in payload', () => {
      const token = generateServiceToken('api-gateway');
      const decoded = jwt.decode(token) as any;

      expect(decoded.serviceName).toBe('api-gateway');
      expect(decoded.serviceId).toBe('service-api-gateway');
    });

    it('should include permissions when provided', () => {
      const token = generateServiceToken('api-gateway', ['read:users', 'write:users']);
      const decoded = jwt.decode(token) as any;

      expect(decoded.permissions).toEqual(['read:users', 'write:users']);
    });

    it('should use default empty permissions when not provided', () => {
      const token = generateServiceToken('api-gateway');
      const decoded = jwt.decode(token) as any;

      expect(decoded.permissions).toEqual([]);
    });

    it('should throw error when no secret is set', () => {
      delete process.env.SERVICE_SECRET;
      delete process.env.JWT_SECRET;
      // Clear cached secret from module load time
      configureServiceAuth({ secret: '' });

      expect(() => generateServiceToken('test')).toThrow(
        'SERVICE_SECRET or JWT_SECRET environment variable must be set'
      );
    });

    it('should throw error when secret is too short', () => {
      process.env.SERVICE_SECRET = 'short';
      // Ensure config picks up the short env var
      configureServiceAuth({ secret: 'short' });

      expect(() => generateServiceToken('test')).toThrow(
        'Service secret must be at least 32 characters'
      );
    });

    it('should fall back to JWT_SECRET when SERVICE_SECRET not set', () => {
      delete process.env.SERVICE_SECRET;
      process.env.JWT_SECRET = TEST_SECRET;

      const token = generateServiceToken('api-gateway');
      expect(token).toBeDefined();
    });
  });

  describe('verifyServiceToken', () => {
    it('should verify a valid token', () => {
      const token = generateServiceToken('api-gateway');
      const payload = verifyServiceToken(token);

      expect(payload.serviceName).toBe('api-gateway');
      expect(payload.serviceId).toBe('service-api-gateway');
    });

    it('should throw for invalid token', () => {
      expect(() => verifyServiceToken('invalid-token')).toThrow('Invalid service token');
    });

    it('should throw for expired token', () => {
      // Configure short expiry
      configureServiceAuth({ tokenExpiry: '1ms' });

      const token = generateServiceToken('api-gateway');

      // Wait for expiry
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(() => verifyServiceToken(token)).toThrow('Service token has expired');
          resolve();
        }, 10);
      });
    });

    it('should throw for token with wrong issuer', () => {
      const wrongToken = jwt.sign({ serviceName: 'test' }, TEST_SECRET, {
        issuer: 'wrong-issuer',
        audience: 'ims-services',
      });

      expect(() => verifyServiceToken(wrongToken)).toThrow('Invalid service token');
    });

    it('should throw for token with wrong audience', () => {
      const wrongToken = jwt.sign({ serviceName: 'test' }, TEST_SECRET, {
        issuer: 'ims-api-gateway',
        audience: 'wrong-audience',
      });

      expect(() => verifyServiceToken(wrongToken)).toThrow('Invalid service token');
    });

    it('should verify token with permissions', () => {
      const token = generateServiceToken('api-gateway', ['read:data']);
      const payload = verifyServiceToken(token);

      expect(payload.permissions).toEqual(['read:data']);
    });
  });

  describe('requireServiceAuth middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockReq = { headers: {} };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should call next for valid token', () => {
      const token = generateServiceToken('api-gateway');
      mockReq.headers = { 'x-service-token': token };

      requireServiceAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should attach service payload to request', () => {
      const token = generateServiceToken('api-gateway', ['read:data']);
      mockReq.headers = { 'x-service-token': token };

      requireServiceAuth(mockReq as Request, mockRes as Response, mockNext);

      const serviceReq = mockReq as ServiceAuthRequest;
      expect(serviceReq.service).toBeDefined();
      expect(serviceReq.service?.serviceName).toBe('api-gateway');
      expect(serviceReq.service?.permissions).toEqual(['read:data']);
    });

    it('should return 401 when no token provided', () => {
      requireServiceAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVICE_AUTH_REQUIRED',
          message: 'Service authentication required',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      mockReq.headers = { 'x-service-token': 'invalid-token' };

      requireServiceAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_SERVICE_TOKEN',
          message: 'Invalid service token',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalServiceAuth middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockReq = { headers: {} };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should call next even without token', () => {
      optionalServiceAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as ServiceAuthRequest).service).toBeUndefined();
    });

    it('should attach service info when valid token provided', () => {
      const token = generateServiceToken('api-gateway');
      mockReq.headers = { 'x-service-token': token };

      optionalServiceAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as ServiceAuthRequest).service?.serviceName).toBe('api-gateway');
    });

    it('should call next with invalid token (optional)', () => {
      mockReq.headers = { 'x-service-token': 'invalid-token' };

      optionalServiceAuth(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockReq as ServiceAuthRequest).service).toBeUndefined();
    });
  });

  describe('hasServicePermission', () => {
    it('should return true when permission exists', () => {
      const req = {
        service: {
          serviceId: 'service-test',
          serviceName: 'test',
          permissions: ['read:users', 'write:users'],
        },
      } as ServiceAuthRequest;

      expect(hasServicePermission(req, 'read:users')).toBe(true);
    });

    it('should return false when permission missing', () => {
      const req = {
        service: {
          serviceId: 'service-test',
          serviceName: 'test',
          permissions: ['read:users'],
        },
      } as ServiceAuthRequest;

      expect(hasServicePermission(req, 'write:users')).toBe(false);
    });

    it('should return false when no service attached', () => {
      const req = {} as ServiceAuthRequest;

      expect(hasServicePermission(req, 'read:users')).toBe(false);
    });

    it('should return false when permissions is undefined', () => {
      const req = {
        service: {
          serviceId: 'service-test',
          serviceName: 'test',
        },
      } as ServiceAuthRequest;

      expect(hasServicePermission(req, 'read:users')).toBe(false);
    });
  });

  describe('requireServicePermission middleware', () => {
    let mockReq: Partial<ServiceAuthRequest>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockReq = { headers: {} };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });

    it('should call next when permission exists', () => {
      mockReq.service = {
        serviceId: 'service-test',
        serviceName: 'test',
        permissions: ['read:users'],
      };

      const middleware = requireServicePermission('read:users');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no service attached', () => {
      const middleware = requireServicePermission('read:users');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SERVICE_AUTH_REQUIRED',
          message: 'Service authentication required',
        },
      });
    });

    it('should return 403 when permission missing', () => {
      mockReq.service = {
        serviceId: 'service-test',
        serviceName: 'test',
        permissions: ['read:users'],
      };

      const middleware = requireServicePermission('write:users');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Required permissions: write:users',
        },
      });
    });

    it('should require all specified permissions', () => {
      mockReq.service = {
        serviceId: 'service-test',
        serviceName: 'test',
        permissions: ['read:users'],
      };

      const middleware = requireServicePermission('read:users', 'write:users');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should pass when all permissions exist', () => {
      mockReq.service = {
        serviceId: 'service-test',
        serviceName: 'test',
        permissions: ['read:users', 'write:users', 'delete:users'],
      };

      const middleware = requireServicePermission('read:users', 'write:users');
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('createServiceHeaders', () => {
    it('should return headers object with token', () => {
      const headers = createServiceHeaders('api-gateway');

      expect(headers).toHaveProperty('X-Service-Token');
      expect(typeof headers['X-Service-Token']).toBe('string');
    });

    it('should generate valid token in header', () => {
      const headers = createServiceHeaders('api-gateway');
      const payload = verifyServiceToken(headers['X-Service-Token']);

      expect(payload.serviceName).toBe('api-gateway');
    });
  });

  describe('addServiceTokenToProxy', () => {
    it('should return a function that sets header', () => {
      const modifier = addServiceTokenToProxy('api-gateway');
      expect(typeof modifier).toBe('function');
    });

    it('should set X-Service-Token header on proxy request', () => {
      const modifier = addServiceTokenToProxy('api-gateway');
      const mockProxyReq = {
        setHeader: jest.fn(),
      };

      modifier(mockProxyReq);

      expect(mockProxyReq.setHeader).toHaveBeenCalledWith('X-Service-Token', expect.any(String));
    });

    it('should set valid token on proxy request', () => {
      const modifier = addServiceTokenToProxy('api-gateway');
      let capturedToken = '';
      const mockProxyReq = {
        setHeader: jest.fn((header, value) => {
          if (header === 'X-Service-Token') {
            capturedToken = value;
          }
        }),
      };

      modifier(mockProxyReq);

      const payload = verifyServiceToken(capturedToken);
      expect(payload.serviceName).toBe('api-gateway');
    });
  });

  describe('configureServiceAuth', () => {
    it('should allow custom configuration', () => {
      configureServiceAuth({
        tokenExpiry: '2h',
        issuer: 'custom-issuer',
        audience: 'custom-audience',
      });

      const token = generateServiceToken('test');
      const decoded = jwt.decode(token, { complete: true }) as any;

      expect(decoded.payload.iss).toBe('custom-issuer');
      expect(decoded.payload.aud).toBe('custom-audience');
    });

    it('should allow custom secret', () => {
      const customSecret = 'a-custom-secret-that-is-definitely-long-enough-for-jwt';
      configureServiceAuth({ secret: customSecret });

      const token = generateServiceToken('test');

      // Should be verifiable with custom secret
      const payload = jwt.verify(token, customSecret, {
        issuer: 'ims-api-gateway',
        audience: 'ims-services',
      }) as any;

      expect(payload.serviceName).toBe('test');
    });
  });

  describe('resetServiceAuthConfig', () => {
    it('should reset to default configuration', () => {
      configureServiceAuth({
        issuer: 'custom-issuer',
      });

      resetServiceAuthConfig();

      const token = generateServiceToken('test');
      const decoded = jwt.decode(token, { complete: true }) as any;

      expect(decoded.payload.iss).toBe('ims-api-gateway');
    });
  });
});
