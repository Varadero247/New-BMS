import {
  signPortalToken,
  verifyPortalToken,
  portalAuthenticate,
  requirePortalPermission,
  requirePortalType,
} from '../src';
import type { PortalUser } from '../src';

const TEST_SECRET = 'test-portal-secret-key-for-testing-only';

const mockUser: PortalUser = {
  id: 'portal-user-001',
  email: 'supplier@example.com',
  name: 'Test Supplier',
  organisationId: 'org-001',
  organisationName: 'Acme Corp',
  portalType: 'supplier',
  permissions: ['view_orders', 'submit_quotes', 'view_invoices'],
};

const mockCustomer: PortalUser = {
  id: 'portal-user-002',
  email: 'customer@example.com',
  name: 'Test Customer',
  organisationId: 'org-002',
  organisationName: 'Client Inc',
  portalType: 'customer',
  permissions: ['view_orders', 'raise_tickets', 'view_documents'],
};

describe('portal-auth', () => {
  describe('signPortalToken', () => {
    it('should sign a token for a supplier', () => {
      const token = signPortalToken(mockUser, 'supplier', { secret: TEST_SECRET });
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should sign a token for a customer', () => {
      const token = signPortalToken(mockCustomer, 'customer', { secret: TEST_SECRET });
      expect(typeof token).toBe('string');
    });

    it('should throw without PORTAL_JWT_SECRET', () => {
      const originalEnv = process.env.PORTAL_JWT_SECRET;
      delete process.env.PORTAL_JWT_SECRET;
      expect(() => signPortalToken(mockUser, 'supplier')).toThrow('PORTAL_JWT_SECRET');
      process.env.PORTAL_JWT_SECRET = originalEnv;
    });
  });

  describe('verifyPortalToken', () => {
    it('should verify a valid token', () => {
      const token = signPortalToken(mockUser, 'supplier', { secret: TEST_SECRET });
      const decoded = verifyPortalToken(token, { secret: TEST_SECRET });
      expect(decoded).not.toBeNull();
      expect(decoded!.id).toBe(mockUser.id);
      expect(decoded!.email).toBe(mockUser.email);
      expect(decoded!.portalType).toBe('supplier');
      expect(decoded!.permissions).toEqual(mockUser.permissions);
    });

    it('should return null for invalid token', () => {
      const decoded = verifyPortalToken('invalid.token.here', { secret: TEST_SECRET });
      expect(decoded).toBeNull();
    });

    it('should return null for wrong secret', () => {
      const token = signPortalToken(mockUser, 'supplier', { secret: TEST_SECRET });
      const decoded = verifyPortalToken(token, { secret: 'wrong-secret' });
      expect(decoded).toBeNull();
    });

    it('should preserve portal type in token', () => {
      const token = signPortalToken(mockCustomer, 'customer', { secret: TEST_SECRET });
      const decoded = verifyPortalToken(token, { secret: TEST_SECRET });
      expect(decoded!.portalType).toBe('customer');
    });

    it('should preserve organisation ID', () => {
      const token = signPortalToken(mockUser, 'supplier', { secret: TEST_SECRET });
      const decoded = verifyPortalToken(token, { secret: TEST_SECRET });
      expect(decoded!.organisationId).toBe('org-001');
    });
  });

  describe('portalAuthenticate middleware', () => {
    const middleware = portalAuthenticate({ secret: TEST_SECRET });

    it('should authenticate valid token', () => {
      const token = signPortalToken(mockUser, 'supplier', { secret: TEST_SECRET });
      const req: any = { headers: { authorization: `Bearer ${token}` } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.portalUser).toBeDefined();
      expect(req.portalUser.id).toBe(mockUser.id);
    });

    it('should reject missing authorization header', () => {
      const req: any = { headers: {} };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject non-Bearer token', () => {
      const req: any = { headers: { authorization: 'Basic abc123' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject invalid token', () => {
      const req: any = { headers: { authorization: 'Bearer invalid.token.here' } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requirePortalPermission', () => {
    it('should allow user with required permission', () => {
      const middleware = requirePortalPermission('view_orders');
      const req: any = { portalUser: mockUser };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should reject user without required permission', () => {
      const middleware = requirePortalPermission('admin_all');
      const req: any = { portalUser: mockUser };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should reject unauthenticated request', () => {
      const middleware = requirePortalPermission('view_orders');
      const req: any = {};
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('requirePortalType', () => {
    it('should allow matching portal type', () => {
      const middleware = requirePortalType('supplier');
      const req: any = { portalUser: mockUser };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should reject non-matching portal type', () => {
      const middleware = requirePortalType('customer');
      const req: any = { portalUser: mockUser };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should reject unauthenticated request with 401', () => {
      const middleware = requirePortalType('supplier');
      const req: any = {};
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow customer matching customer type', () => {
      const middleware = requirePortalType('customer');
      const req: any = { portalUser: mockCustomer };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('verifyPortalToken — additional fields', () => {
    it('name is not stored in the JWT payload (returns empty string)', () => {
      // The JWT payload omits name/organisationName for compactness.
      // Callers that need these must fetch them from the database.
      const token = signPortalToken(mockUser, 'supplier', { secret: TEST_SECRET });
      const decoded = verifyPortalToken(token, { secret: TEST_SECRET });
      expect(decoded!.name).toBe('');
    });

    it('organisationName is not stored in the JWT payload (returns empty string)', () => {
      const token = signPortalToken(mockUser, 'supplier', { secret: TEST_SECRET });
      const decoded = verifyPortalToken(token, { secret: TEST_SECRET });
      expect(decoded!.organisationName).toBe('');
    });

    it('should return null for completely empty token', () => {
      expect(verifyPortalToken('', { secret: TEST_SECRET })).toBeNull();
    });
  });
});

describe('portal-auth — additional coverage', () => {
  it('signPortalToken produces a token with 3 dot-separated parts for customer', () => {
    const token = signPortalToken(mockCustomer, 'customer', { secret: TEST_SECRET });
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifyPortalToken returns permissions array from token', () => {
    const token = signPortalToken(mockUser, 'supplier', { secret: TEST_SECRET });
    const decoded = verifyPortalToken(token, { secret: TEST_SECRET });
    expect(Array.isArray(decoded!.permissions)).toBe(true);
    expect(decoded!.permissions).toContain('view_orders');
  });

  it('requirePortalPermission allows when user has the exact permission', () => {
    const mw = requirePortalPermission('submit_quotes');
    const req: any = { portalUser: mockUser };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('requirePortalPermission rejects when user has an empty permissions array', () => {
    const mw = requirePortalPermission('view_orders');
    const req: any = { portalUser: { ...mockUser, permissions: [] } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('portalAuthenticate sets portalUser with correct permissions', () => {
    const mw = portalAuthenticate({ secret: TEST_SECRET });
    const token = signPortalToken(mockUser, 'supplier', { secret: TEST_SECRET });
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    mw(req, res, next);
    expect(req.portalUser.permissions).toEqual(mockUser.permissions);
  });

  it('requirePortalType rejects when user has wrong portal type (supplier vs customer)', () => {
    const mw = requirePortalType('supplier');
    const req: any = { portalUser: mockCustomer };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('verifyPortalToken returns id matching the signed user', () => {
    const token = signPortalToken(mockCustomer, 'customer', { secret: TEST_SECRET });
    const decoded = verifyPortalToken(token, { secret: TEST_SECRET });
    expect(decoded!.id).toBe(mockCustomer.id);
  });

  it('verifyPortalToken returns null for a token signed with a completely different algorithm', () => {
    // A malformed but structurally valid-looking string
    const decoded = verifyPortalToken('eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.', {
      secret: TEST_SECRET,
    });
    expect(decoded).toBeNull();
  });
});
