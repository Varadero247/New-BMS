/**
 * @ims/secrets - Secure secrets management for IMS
 */

export {
  validateSecret,
  validateJwtSecret,
  validateDatabasePassword,
  isPlaceholderSecret,
  validateStartupSecrets,
  type SecretValidationResult,
  type SecretRequirements,
  type StartupValidationResult,
} from './validators';

export {
  VaultClient,
  createVaultClientFromEnv,
  loadSecretsFromVault,
  initializeSecretsFromVault,
  type VaultConfig,
  type VaultSecret,
} from './vault';

/**
 * SecretsManager - Manages secret retrieval with caching
 *
 * In the future, this can be extended to support:
 * - AWS Secrets Manager
 * - HashiCorp Vault
 * - Azure Key Vault
 * - Google Secret Manager
 */
export class SecretsManager {
  private cache: Map<string, { value: string; expires: number }> = new Map();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttl = ttlMs;
  }

  /**
   * Get a secret value from environment or cache
   */
  async getSecret(name: string): Promise<string> {
    // Check cache first
    const cached = this.cache.get(name);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    // Get from environment
    const value = process.env[name];
    if (!value) {
      throw new Error(`Required secret ${name} is not configured`);
    }

    // Cache the value
    this.cache.set(name, {
      value,
      expires: Date.now() + this.ttl,
    });

    return value;
  }

  /**
   * Get a secret with a fallback value (use only in development)
   */
  async getSecretWithFallback(name: string, fallback: string): Promise<string> {
    try {
      return await this.getSecret(name);
    } catch {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Required secret ${name} is not configured in production`);
      }
      return fallback;
    }
  }

  /**
   * Clear the secrets cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if a secret exists
   */
  hasSecret(name: string): boolean {
    return !!process.env[name];
  }
}

// Default singleton instance
let defaultManager: SecretsManager | null = null;

/**
 * Get the default SecretsManager instance
 */
export function getSecretsManager(): SecretsManager {
  if (!defaultManager) {
    defaultManager = new SecretsManager();
  }
  return defaultManager;
}

/**
 * Convenience function to get a secret using the default manager
 */
export async function getSecret(name: string): Promise<string> {
  return getSecretsManager().getSecret(name);
}

/**
 * Convenience function to get a secret with fallback using the default manager
 */
export async function getSecretWithFallback(name: string, fallback: string): Promise<string> {
  return getSecretsManager().getSecretWithFallback(name, fallback);
}

/**
 * Reset the default manager (useful for testing)
 */
export function resetSecretsManager(): void {
  defaultManager = null;
}
