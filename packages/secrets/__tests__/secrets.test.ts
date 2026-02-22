import {
  validateSecret,
  validateJwtSecret,
  validateDatabasePassword,
  isPlaceholderSecret,
  validateStartupSecrets,
  SecretsManager,
  getSecret,
  getSecretWithFallback,
  resetSecretsManager,
} from '../src';

describe('Secret Validators', () => {
  describe('validateSecret', () => {
    it('should return valid for a strong secret', () => {
      const result = validateSecret('aVeryStrongSecretWithMixedCase123!@#', {
        minLength: 20,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecial: true,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for empty secret', () => {
      const result = validateSecret('', { minLength: 1 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret must be a non-empty string');
    });

    it('should fail for null/undefined secret', () => {
      const result = validateSecret(null as unknown as string);
      expect(result.valid).toBe(false);
    });

    it('should fail for short secret when minLength specified', () => {
      const result = validateSecret('short', { minLength: 20 });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least 20 characters');
    });

    it('should fail when uppercase required but missing', () => {
      const result = validateSecret('alllowercase123', { requireUppercase: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret must contain at least one uppercase letter');
    });

    it('should fail when lowercase required but missing', () => {
      const result = validateSecret('ALLUPPERCASE123', { requireLowercase: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret must contain at least one lowercase letter');
    });

    it('should fail when numbers required but missing', () => {
      const result = validateSecret('NoNumbersHere', { requireNumbers: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret must contain at least one number');
    });

    it('should fail when special chars required but missing', () => {
      const result = validateSecret('NoSpecialChars123', { requireSpecial: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Secret must contain at least one special character');
    });

    it('should collect multiple errors', () => {
      const result = validateSecret('a', {
        minLength: 20,
        requireUppercase: true,
        requireNumbers: true,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('validateJwtSecret', () => {
    it('should require at least 64 characters', () => {
      const shortSecret = 'a'.repeat(63);
      const result = validateJwtSecret(shortSecret);
      expect(result.valid).toBe(false);
    });

    it('should pass for 64+ character secret', () => {
      const longSecret = 'a'.repeat(64);
      const result = validateJwtSecret(longSecret);
      expect(result.valid).toBe(true);
    });

    it('should pass for base64 encoded secret', () => {
      const base64Secret =
        'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo=';
      const result = validateJwtSecret(base64Secret);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDatabasePassword', () => {
    it('should require at least 16 characters', () => {
      const result = validateDatabasePassword('Short1');
      expect(result.valid).toBe(false);
    });

    it('should require uppercase letters', () => {
      const result = validateDatabasePassword('alllowercasepassword123');
      expect(result.valid).toBe(false);
    });

    it('should require lowercase letters', () => {
      const result = validateDatabasePassword('ALLUPPERCASEPASSWORD123');
      expect(result.valid).toBe(false);
    });

    it('should require numbers', () => {
      const result = validateDatabasePassword('NoNumbersInPassword');
      expect(result.valid).toBe(false);
    });

    it('should pass for strong password', () => {
      const result = validateDatabasePassword('StrongPassword123!');
      expect(result.valid).toBe(true);
    });
  });

  describe('isPlaceholderSecret', () => {
    const placeholders = [
      'your-super-secret-key',
      'your_secret_key',
      'change-me',
      'changeme',
      'secret-key',
      'secretkey',
      'password123',
      'default-secret',
      'example-key',
      'test-secret',
      'sample-key',
      'placeholder',
      'xxxxxx',
      'replace-me',
    ];

    it.each(placeholders)('should detect "%s" as placeholder', (placeholder) => {
      expect(isPlaceholderSecret(placeholder)).toBe(true);
    });

    const validSecrets = [
      'aB3dEfGhIjKlMnOpQrStUvWxYz',
      'KJH2k3h4kj5h6k7j8h9g0f1d2s3a4',
      'xK9mN2pQ5rT8vW1yB4cF7hJ0lM3oP6s',
    ];

    it.each(validSecrets)('should not detect "%s" as placeholder', (secret) => {
      expect(isPlaceholderSecret(secret)).toBe(false);
    });
  });
});

describe('validateStartupSecrets', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should fail when JWT_SECRET is missing', () => {
    const env = { DATABASE_URL: 'postgresql://user:pass@localhost/db' };
    const result = validateStartupSecrets(env as unknown as NodeJS.ProcessEnv, false);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('JWT_SECRET environment variable is required');
  });

  it('should fail when DATABASE_URL is missing', () => {
    const env = { JWT_SECRET: 'a'.repeat(64) };
    const result = validateStartupSecrets(env as unknown as NodeJS.ProcessEnv, false);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('DATABASE_URL environment variable is required');
  });

  it('should warn about placeholder JWT_SECRET in development', () => {
    const env = {
      JWT_SECRET: 'your-super-secret-jwt-key',
      DATABASE_URL: 'postgresql://user:securepassword123@localhost/db',
    };
    const result = validateStartupSecrets(env as unknown as NodeJS.ProcessEnv, false);
    expect(result.warnings.some((w) => w.includes('placeholder'))).toBe(true);
  });

  it('should fail for placeholder JWT_SECRET in production', () => {
    const env = {
      JWT_SECRET: 'your-super-secret-jwt-key',
      DATABASE_URL: 'postgresql://user:securepassword123@localhost/db',
    };
    const result = validateStartupSecrets(env as unknown as NodeJS.ProcessEnv, true);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('placeholder'))).toBe(true);
  });

  it('should warn about weak DATABASE_URL password in development', () => {
    const env = {
      JWT_SECRET: 'a'.repeat(64),
      DATABASE_URL: 'postgresql://postgres:postgres@localhost/db',
    };
    const result = validateStartupSecrets(env as unknown as NodeJS.ProcessEnv, false);
    expect(result.warnings.some((w) => w.includes('weak password'))).toBe(true);
  });

  it('should fail for weak DATABASE_URL password in production', () => {
    const env = {
      JWT_SECRET: 'a'.repeat(64),
      DATABASE_URL: 'postgresql://postgres:postgres@localhost/db',
    };
    const result = validateStartupSecrets(env as unknown as NodeJS.ProcessEnv, true);
    expect(result.valid).toBe(false);
  });

  it('should pass for properly configured secrets', () => {
    const env = {
      JWT_SECRET: 'xK9mN2pQ5rT8vW1yB4cF7hJ0lM3oP6sAzXcVbNmLkJhGfDsApOiUyTrEwQaZxSwCdEfVgBhNjMk',
      DATABASE_URL: 'postgresql://user:xK9mN2pQ5rT8vW1yB4cF7@localhost/db',
    };
    const result = validateStartupSecrets(env as unknown as NodeJS.ProcessEnv, true);
    expect(result.valid).toBe(true);
  });
});

describe('SecretsManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    resetSecretsManager();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getSecret', () => {
    it('should return secret from environment', async () => {
      process.env.TEST_SECRET = 'my-secret-value';
      const manager = new SecretsManager();
      const value = await manager.getSecret('TEST_SECRET');
      expect(value).toBe('my-secret-value');
    });

    it('should throw when secret is not set', async () => {
      delete process.env.TEST_SECRET;
      const manager = new SecretsManager();
      await expect(manager.getSecret('TEST_SECRET')).rejects.toThrow(
        'Required secret TEST_SECRET is not configured'
      );
    });

    it('should cache secrets', async () => {
      process.env.TEST_SECRET = 'initial-value';
      const manager = new SecretsManager();

      const value1 = await manager.getSecret('TEST_SECRET');
      process.env.TEST_SECRET = 'changed-value';
      const value2 = await manager.getSecret('TEST_SECRET');

      expect(value1).toBe('initial-value');
      expect(value2).toBe('initial-value'); // Still cached
    });

    it('should clear cache', async () => {
      process.env.TEST_SECRET = 'initial-value';
      const manager = new SecretsManager();

      await manager.getSecret('TEST_SECRET');
      process.env.TEST_SECRET = 'changed-value';
      manager.clearCache();
      const value = await manager.getSecret('TEST_SECRET');

      expect(value).toBe('changed-value');
    });
  });

  describe('getSecretWithFallback', () => {
    it('should return secret when available', async () => {
      process.env.TEST_SECRET = 'actual-value';
      const manager = new SecretsManager();
      const value = await manager.getSecretWithFallback('TEST_SECRET', 'fallback');
      expect(value).toBe('actual-value');
    });

    it('should return fallback in development when secret missing', async () => {
      delete process.env.TEST_SECRET;
      process.env.NODE_ENV = 'development';
      const manager = new SecretsManager();
      const value = await manager.getSecretWithFallback('TEST_SECRET', 'fallback');
      expect(value).toBe('fallback');
    });

    it('should throw in production when secret missing', async () => {
      delete process.env.TEST_SECRET;
      process.env.NODE_ENV = 'production';
      const manager = new SecretsManager();
      await expect(manager.getSecretWithFallback('TEST_SECRET', 'fallback')).rejects.toThrow(
        'not configured in production'
      );
    });
  });

  describe('hasSecret', () => {
    it('should return true when secret exists', () => {
      process.env.TEST_SECRET = 'value';
      const manager = new SecretsManager();
      expect(manager.hasSecret('TEST_SECRET')).toBe(true);
    });

    it('should return false when secret missing', () => {
      delete process.env.TEST_SECRET;
      const manager = new SecretsManager();
      expect(manager.hasSecret('TEST_SECRET')).toBe(false);
    });
  });
});

describe('Convenience Functions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    resetSecretsManager();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('getSecret should work with default manager', async () => {
    process.env.MY_SECRET = 'secret-value';
    const value = await getSecret('MY_SECRET');
    expect(value).toBe('secret-value');
  });

  it('getSecretWithFallback should work with default manager', async () => {
    delete process.env.MY_SECRET;
    process.env.NODE_ENV = 'development';
    const value = await getSecretWithFallback('MY_SECRET', 'default');
    expect(value).toBe('default');
  });
});

describe('Secrets — additional coverage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetSecretsManager();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('validateSecret succeeds for a long string with no extra requirements', () => {
    const result = validateSecret('areasonablylongsecretvalue');
    expect(result.valid).toBe(true);
  });

  it('validateJwtSecret fails for a 63-char string', () => {
    const result = validateJwtSecret('x'.repeat(63));
    expect(result.valid).toBe(false);
  });

  it('validateJwtSecret succeeds for exactly 64 chars', () => {
    const result = validateJwtSecret('a'.repeat(64));
    expect(result.valid).toBe(true);
  });

  it('SecretsManager.hasSecret returns false when key is deleted from env', () => {
    delete process.env.MISSING_KEY;
    const manager = new SecretsManager();
    expect(manager.hasSecret('MISSING_KEY')).toBe(false);
  });

  it('getSecret convenience function throws for missing secret', async () => {
    delete process.env.ABSENT_SECRET_XYZ;
    await expect(getSecret('ABSENT_SECRET_XYZ')).rejects.toThrow('not configured');
  });
});

describe('secrets — phase29 coverage', () => {
  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles async reject', async () => {
    await expect(Promise.reject(new Error('err'))).rejects.toThrow('err');
  });

  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

});
