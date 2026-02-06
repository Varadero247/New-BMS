/**
 * Secret validation utilities
 */

export interface SecretValidationResult {
  valid: boolean;
  errors: string[];
}

export interface SecretRequirements {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecial?: boolean;
}

const DEFAULT_JWT_REQUIREMENTS: SecretRequirements = {
  minLength: 64,
};

const DEFAULT_PASSWORD_REQUIREMENTS: SecretRequirements = {
  minLength: 16,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
};

/**
 * Validates a secret against specified requirements
 */
export function validateSecret(
  secret: string,
  requirements: SecretRequirements = {}
): SecretValidationResult {
  const errors: string[] = [];

  if (!secret || typeof secret !== 'string') {
    return { valid: false, errors: ['Secret must be a non-empty string'] };
  }

  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecial } =
    requirements;

  if (minLength && secret.length < minLength) {
    errors.push(`Secret must be at least ${minLength} characters (got ${secret.length})`);
  }

  if (requireUppercase && !/[A-Z]/.test(secret)) {
    errors.push('Secret must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(secret)) {
    errors.push('Secret must contain at least one lowercase letter');
  }

  if (requireNumbers && !/[0-9]/.test(secret)) {
    errors.push('Secret must contain at least one number');
  }

  if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(secret)) {
    errors.push('Secret must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates JWT secret meets security requirements
 */
export function validateJwtSecret(secret: string): SecretValidationResult {
  return validateSecret(secret, DEFAULT_JWT_REQUIREMENTS);
}

/**
 * Validates database password meets security requirements
 */
export function validateDatabasePassword(password: string): SecretValidationResult {
  return validateSecret(password, DEFAULT_PASSWORD_REQUIREMENTS);
}

/**
 * Checks if a secret looks like a placeholder/default value
 */
export function isPlaceholderSecret(secret: string): boolean {
  const placeholderPatterns = [
    /^your[-_]?/i,
    /^change[-_]?me/i,
    /^secret[-_]?key/i,
    /^password/i,
    /^default/i,
    /^example/i,
    /^test[-_]?/i,
    /^sample/i,
    /^placeholder/i,
    /^xxx+$/i,
    /^replace[-_]?me/i,
  ];

  return placeholderPatterns.some((pattern) => pattern.test(secret));
}

/**
 * Validates that required environment variables are set and secure
 */
export interface StartupValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateStartupSecrets(
  env: NodeJS.ProcessEnv = process.env,
  isProduction: boolean = process.env.NODE_ENV === 'production'
): StartupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // JWT_SECRET validation
  const jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push('JWT_SECRET environment variable is required');
  } else {
    if (isPlaceholderSecret(jwtSecret)) {
      if (isProduction) {
        errors.push('JWT_SECRET appears to be a placeholder value - not allowed in production');
      } else {
        warnings.push('JWT_SECRET appears to be a placeholder value - update for production');
      }
    }

    const jwtValidation = validateJwtSecret(jwtSecret);
    if (!jwtValidation.valid) {
      if (isProduction) {
        errors.push(...jwtValidation.errors.map((e) => `JWT_SECRET: ${e}`));
      } else {
        warnings.push(...jwtValidation.errors.map((e) => `JWT_SECRET: ${e}`));
      }
    }
  }

  // JWT_REFRESH_SECRET validation (optional but recommended)
  const jwtRefreshSecret = env.JWT_REFRESH_SECRET;
  if (jwtRefreshSecret) {
    if (isPlaceholderSecret(jwtRefreshSecret)) {
      if (isProduction) {
        errors.push('JWT_REFRESH_SECRET appears to be a placeholder value');
      } else {
        warnings.push('JWT_REFRESH_SECRET appears to be a placeholder value');
      }
    }
  }

  // DATABASE_URL validation
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push('DATABASE_URL environment variable is required');
  } else {
    // Check for default postgres password in connection string
    if (databaseUrl.includes(':postgres@') || databaseUrl.includes(':password@')) {
      if (isProduction) {
        errors.push('DATABASE_URL contains a weak password - not allowed in production');
      } else {
        warnings.push('DATABASE_URL contains a weak password - update for production');
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
