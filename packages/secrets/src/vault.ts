/**
 * HashiCorp Vault integration for secrets management
 */
import { createLogger } from '@ims/monitoring';

const logger = createLogger('secrets');

export interface VaultConfig {
  /** Vault server address (e.g., http://localhost:8200) */
  address: string;
  /** Vault authentication token */
  token: string;
  /** Optional namespace for Vault Enterprise */
  namespace?: string;
  /** Secret path prefix (default: 'secret/data') */
  secretPath?: string;
  /** Request timeout in milliseconds (default: 5000) */
  timeout?: number;
}

export interface VaultSecret {
  [key: string]: string;
}

export interface VaultResponse {
  data: {
    data: VaultSecret;
    metadata: {
      created_time: string;
      version: number;
    };
  };
}

/**
 * HashiCorp Vault client for KV v2 secrets engine
 */
export class VaultClient {
  private config: Required<VaultConfig>;
  private cache: Map<string, { data: VaultSecret; expires: number }> = new Map();
  private cacheTtl: number = 5 * 60 * 1000; // 5 minutes

  constructor(config: VaultConfig) {
    this.config = {
      address: config.address.replace(/\/$/, ''), // Remove trailing slash
      token: config.token,
      namespace: config.namespace || '',
      secretPath: config.secretPath || 'secret/data',
      timeout: config.timeout || 5000,
    };
  }

  /**
   * Get all secrets at a path
   */
  async getSecrets(path: string): Promise<VaultSecret> {
    // Check cache first
    const cacheKey = path;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const url = `${this.config.address}/v1/${this.config.secretPath}/${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Vault-Token': this.config.token,
          ...(this.config.namespace && { 'X-Vault-Namespace': this.config.namespace }),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Secret not found at path: ${path}`);
        }
        if (response.status === 403) {
          throw new Error('Vault authentication failed - check token permissions');
        }
        throw new Error(`Vault request failed: ${response.status} ${response.statusText}`);
      }

      const result = (await response.json()) as VaultResponse;
      const secrets = result.data.data;

      // Cache the result
      this.cache.set(cacheKey, {
        data: secrets,
        expires: Date.now() + this.cacheTtl,
      });

      return secrets;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Vault request timed out after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get a single secret value
   */
  async getSecret(path: string, key: string): Promise<string> {
    const secrets = await this.getSecrets(path);
    const value = secrets[key];
    if (value === undefined) {
      throw new Error(`Secret key '${key}' not found at path '${path}'`);
    }
    return value;
  }

  /**
   * Write secrets to a path
   */
  async setSecrets(path: string, data: VaultSecret): Promise<void> {
    const url = `${this.config.address}/v1/${this.config.secretPath}/${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Vault-Token': this.config.token,
          'Content-Type': 'application/json',
          ...(this.config.namespace && { 'X-Vault-Namespace': this.config.namespace }),
        },
        body: JSON.stringify({ data }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Vault authentication failed - check token permissions');
        }
        throw new Error(`Vault write failed: ${response.status} ${response.statusText}`);
      }

      // Invalidate cache for this path
      this.cache.delete(path);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Vault request timed out after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Delete secrets at a path
   */
  async deleteSecrets(path: string): Promise<void> {
    // For KV v2, we need to use the metadata path for permanent delete
    const url = `${this.config.address}/v1/${this.config.secretPath.replace('/data', '/metadata')}/${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-Vault-Token': this.config.token,
          ...(this.config.namespace && { 'X-Vault-Namespace': this.config.namespace }),
        },
        signal: controller.signal,
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Vault delete failed: ${response.status} ${response.statusText}`);
      }

      // Invalidate cache
      this.cache.delete(path);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error(`Vault request timed out after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Check if Vault is healthy and accessible
   */
  async healthCheck(): Promise<boolean> {
    const url = `${this.config.address}/v1/sys/health`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Vault returns 200 for initialized/unsealed, 429 for standby, 472 for DR secondary
      return response.status === 200 || response.status === 429 || response.status === 472;
    } catch {
      return false;
    }
  }

  /**
   * Clear the secrets cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set cache TTL
   */
  setCacheTtl(ttlMs: number): void {
    this.cacheTtl = ttlMs;
  }
}

/**
 * Create a Vault client from environment variables
 * Returns null if Vault is not configured
 */
export function createVaultClientFromEnv(): VaultClient | null {
  const address = process.env.VAULT_ADDR;
  const token = process.env.VAULT_TOKEN;

  if (!address || !token) {
    return null;
  }

  return new VaultClient({
    address,
    token,
    namespace: process.env.VAULT_NAMESPACE,
    secretPath: process.env.VAULT_SECRET_PATH,
    timeout: process.env.VAULT_TIMEOUT ? parseInt(process.env.VAULT_TIMEOUT, 10) : undefined,
  });
}

/**
 * Load secrets from Vault and merge into process.env
 * Only loads secrets that are not already defined in process.env
 */
export async function loadSecretsFromVault(
  client: VaultClient,
  path: string
): Promise<Record<string, string>> {
  try {
    const secrets = await client.getSecrets(path);

    // Merge into process.env (don't overwrite existing values)
    for (const [key, value] of Object.entries(secrets)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }

    return secrets;
  } catch (error) {
    logger.error('Failed to load secrets from Vault', { error: (error as Error).message });
    throw error;
  }
}

/**
 * Initialize secrets from Vault if configured
 * Falls back gracefully to environment variables if Vault is not available
 */
export async function initializeSecretsFromVault(options?: {
  path?: string;
  required?: boolean;
}): Promise<boolean> {
  const { path = 'ims/config', required = false } = options || {};

  // Check if Vault is configured
  if (process.env.USE_VAULT !== 'true') {
    logger.info('Vault not enabled (USE_VAULT !== "true"), using environment variables');
    return false;
  }

  const client = createVaultClientFromEnv();
  if (!client) {
    if (required) {
      throw new Error('Vault is required but VAULT_ADDR or VAULT_TOKEN is not set');
    }
    logger.warn('Vault credentials not configured, using environment variables');
    return false;
  }

  // Check Vault health
  const healthy = await client.healthCheck();
  if (!healthy) {
    if (required) {
      throw new Error('Vault is not healthy or accessible');
    }
    logger.warn('Vault is not accessible, using environment variables');
    return false;
  }

  // Load secrets
  try {
    await loadSecretsFromVault(client, path);
    logger.info('Secrets loaded from Vault', { path });
    return true;
  } catch (error) {
    if (required) {
      throw error;
    }
    logger.warn('Failed to load from Vault, using environment variables', { error: (error as Error).message });
    return false;
  }
}

export default {
  VaultClient,
  createVaultClientFromEnv,
  loadSecretsFromVault,
  initializeSecretsFromVault,
};
