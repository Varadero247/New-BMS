import {
  emailSchema,
  passwordSchema,
  idSchema,
  phoneSchema,
  urlSchema,
  paginationSchema,
  loginSchema,
  registrationSchema,
} from '../src/schemas';

describe('emailSchema', () => {
  it('should accept valid emails', () => {
    expect(() => emailSchema.parse('test@example.com')).not.toThrow();
    expect(() => emailSchema.parse('user.name@domain.org')).not.toThrow();
  });

  it('should reject invalid emails', () => {
    expect(() => emailSchema.parse('invalid')).toThrow();
    expect(() => emailSchema.parse('missing@domain')).toThrow();
    expect(() => emailSchema.parse('@nodomain.com')).toThrow();
  });

  it('should normalize email to lowercase', () => {
    const result = emailSchema.parse('TEST@EXAMPLE.COM');
    expect(result).toBe('test@example.com');
  });

  it('should reject email with HTML (validation before sanitization)', () => {
    // The schema validates email format first, so HTML-wrapped emails fail
    // Sanitization of HTML should happen at the middleware level before schema validation
    expect(() => emailSchema.parse('<b>test</b>@example.com')).toThrow();
  });
});

describe('passwordSchema', () => {
  it('should accept strong passwords', () => {
    expect(() => passwordSchema.parse('P@ssw0rd!')).not.toThrow();
    expect(() => passwordSchema.parse('SecurePass123!')).not.toThrow();
  });

  it('should reject too short passwords', () => {
    expect(() => passwordSchema.parse('Pass1!')).toThrow(/at least 8/);
  });

  it('should require uppercase', () => {
    expect(() => passwordSchema.parse('p@ssw0rd!')).toThrow(/uppercase/);
  });

  it('should require lowercase', () => {
    expect(() => passwordSchema.parse('P@SSW0RD!')).toThrow(/lowercase/);
  });

  it('should require number', () => {
    expect(() => passwordSchema.parse('P@ssword!')).toThrow(/number/);
  });

  it('should require special character', () => {
    expect(() => passwordSchema.parse('Passw0rd1')).toThrow(/special/);
  });

  it('should reject passwords over 128 characters', () => {
    const longPassword = 'P@ssw0rd!' + 'a'.repeat(120);
    expect(() => passwordSchema.parse(longPassword)).toThrow(/less than 128/);
  });
});

describe('idSchema', () => {
  it('should accept valid UUIDs', () => {
    expect(() => idSchema.parse('550e8400-e29b-41d4-a716-446655440000')).not.toThrow();
  });

  it('should accept valid CUIDs', () => {
    expect(() => idSchema.parse('ckl1c2v3h0000ap0v1234abcd')).not.toThrow();
  });

  it('should reject empty strings', () => {
    expect(() => idSchema.parse('')).toThrow();
  });

  it('should reject invalid IDs', () => {
    expect(() => idSchema.parse('not-an-id')).toThrow();
    expect(() => idSchema.parse('12345')).toThrow();
  });
});

describe('phoneSchema', () => {
  it('should accept valid phone numbers', () => {
    // Phone validation depends on locale - using well-formed numbers
    expect(() => phoneSchema.parse('+14155551234')).not.toThrow();
  });

  it('should allow undefined', () => {
    expect(() => phoneSchema.parse(undefined)).not.toThrow();
  });

  it('should reject invalid phone numbers', () => {
    expect(() => phoneSchema.parse('123')).toThrow();
    expect(() => phoneSchema.parse('not-a-phone')).toThrow();
  });
});

describe('urlSchema', () => {
  it('should accept valid URLs', () => {
    expect(() => urlSchema.parse('https://example.com')).not.toThrow();
    expect(() => urlSchema.parse('http://localhost:3000')).not.toThrow();
  });

  it('should reject invalid URLs', () => {
    expect(() => urlSchema.parse('not-a-url')).toThrow();
    expect(() => urlSchema.parse('//missing-protocol.com')).toThrow();
  });

  it('should reject javascript: URLs', () => {
    expect(() => urlSchema.parse('javascript:alert(1)')).toThrow();
  });

  it('should reject data: URLs', () => {
    expect(() => urlSchema.parse('data:text/html,<script>')).toThrow();
  });
});

describe('paginationSchema', () => {
  it('should parse valid pagination params', () => {
    const result = paginationSchema.parse({
      page: '2',
      limit: '50',
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
    expect(result.sortBy).toBe('createdAt');
    expect(result.sortOrder).toBe('asc');
  });

  it('should use defaults for missing values', () => {
    const result = paginationSchema.parse({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortOrder).toBe('desc');
  });

  it('should cap limit at 100', () => {
    const result = paginationSchema.parse({ limit: '500' });
    expect(result.limit).toBe(100);
  });

  it('should reject invalid page numbers', () => {
    expect(() => paginationSchema.parse({ page: '0' })).toThrow();
    expect(() => paginationSchema.parse({ page: '-1' })).toThrow();
  });
});

describe('loginSchema', () => {
  it('should accept valid login data', () => {
    const result = loginSchema.parse({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.email).toBe('test@example.com');
    expect(result.password).toBe('password123');
  });

  it('should reject invalid email', () => {
    expect(() =>
      loginSchema.parse({
        email: 'invalid',
        password: 'password123',
      })
    ).toThrow();
  });

  it('should require password', () => {
    expect(() =>
      loginSchema.parse({
        email: 'test@example.com',
        password: '',
      })
    ).toThrow();
  });

  it('should accept optional rememberMe', () => {
    const result = loginSchema.parse({
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    });

    expect(result.rememberMe).toBe(true);
  });
});

describe('registrationSchema', () => {
  it('should accept valid registration data', () => {
    const result = registrationSchema.parse({
      email: 'newuser@example.com',
      password: 'SecureP@ss1',
      name: 'John Doe',
    });

    expect(result.email).toBe('newuser@example.com');
    expect(result.name).toBe('John Doe');
  });

  it('should reject weak password', () => {
    expect(() =>
      registrationSchema.parse({
        email: 'user@example.com',
        password: 'weak',
        name: 'John',
      })
    ).toThrow();
  });

  it('should reject too short name', () => {
    expect(() =>
      registrationSchema.parse({
        email: 'user@example.com',
        password: 'SecureP@ss1',
        name: 'J',
      })
    ).toThrow();
  });

  it('should sanitize name', () => {
    const result = registrationSchema.parse({
      email: 'user@example.com',
      password: 'SecureP@ss1',
      name: '<b>John</b> Doe',
    });

    expect(result.name).toBe('John Doe');
  });

  it('should accept optional role', () => {
    const result = registrationSchema.parse({
      email: 'admin@example.com',
      password: 'SecureP@ss1',
      name: 'Admin User',
      role: 'ADMIN',
    });

    expect(result.role).toBe('ADMIN');
  });
});
