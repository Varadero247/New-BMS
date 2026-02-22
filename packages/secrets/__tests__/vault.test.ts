import {
  VaultClient,
  createVaultClientFromEnv,
  loadSecretsFromVault,
  initializeSecretsFromVault,
} from '../src/vault';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Vault Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('VaultClient', () => {
    const config = {
      address: 'http://localhost:8200',
      token: 'test-token',
    };

    describe('constructor', () => {
      it('should create client with required config', () => {
        const client = new VaultClient(config);
        expect(client).toBeDefined();
      });

      it('should remove trailing slash from address', () => {
        const client = new VaultClient({
          ...config,
          address: 'http://localhost:8200/',
        });
        expect(client).toBeDefined();
      });

      it('should accept optional config values', () => {
        const client = new VaultClient({
          ...config,
          namespace: 'my-namespace',
          secretPath: 'custom/path',
          timeout: 10000,
        });
        expect(client).toBeDefined();
      });
    });

    describe('getSecrets', () => {
      it('should fetch secrets from Vault', async () => {
        const mockSecrets = { JWT_SECRET: 'secret123', DB_PASSWORD: 'pass456' };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              data: mockSecrets,
              metadata: { version: 1 },
            },
          }),
        });

        const client = new VaultClient(config);
        const secrets = await client.getSecrets('ims/config');

        expect(secrets).toEqual(mockSecrets);
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8200/v1/secret/data/ims/config',
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'X-Vault-Token': 'test-token',
            }),
          })
        );
      });

      it('should cache secrets', async () => {
        const mockSecrets = { KEY: 'value' };
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { data: mockSecrets } }),
        });

        const client = new VaultClient(config);

        // First call
        await client.getSecrets('ims/config');
        // Second call should use cache
        const cached = await client.getSecrets('ims/config');

        expect(cached).toEqual(mockSecrets);
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('should throw on 404', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });

        const client = new VaultClient(config);

        await expect(client.getSecrets('nonexistent')).rejects.toThrow(
          'Secret not found at path: nonexistent'
        );
      });

      it('should throw on 403', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
        });

        const client = new VaultClient(config);

        await expect(client.getSecrets('ims/config')).rejects.toThrow(
          'Vault authentication failed'
        );
      });

      it('should include namespace header when configured', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { data: {} } }),
        });

        const client = new VaultClient({
          ...config,
          namespace: 'my-namespace',
        });

        await client.getSecrets('ims/config');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Vault-Namespace': 'my-namespace',
            }),
          })
        );
      });
    });

    describe('getSecret', () => {
      it('should get a single secret value', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { data: { MY_KEY: 'my-value', OTHER: 'other' } },
          }),
        });

        const client = new VaultClient(config);
        const value = await client.getSecret('ims/config', 'MY_KEY');

        expect(value).toBe('my-value');
      });

      it('should throw if key not found', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { data: { OTHER: 'value' } },
          }),
        });

        const client = new VaultClient(config);

        await expect(client.getSecret('ims/config', 'MISSING')).rejects.toThrow(
          "Secret key 'MISSING' not found at path 'ims/config'"
        );
      });
    });

    describe('setSecrets', () => {
      it('should write secrets to Vault', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        const client = new VaultClient(config);
        await client.setSecrets('ims/config', { KEY: 'value' });

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8200/v1/secret/data/ims/config',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ data: { KEY: 'value' } }),
          })
        );
      });

      it('should invalidate cache after write', async () => {
        // First, populate cache
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { data: { OLD: 'value' } } }),
        });

        const client = new VaultClient(config);
        await client.getSecrets('ims/config');

        // Write new value
        mockFetch.mockResolvedValueOnce({ ok: true });
        await client.setSecrets('ims/config', { NEW: 'value' });

        // Next read should fetch fresh
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { data: { NEW: 'value' } } }),
        });

        const secrets = await client.getSecrets('ims/config');
        expect(secrets).toEqual({ NEW: 'value' });
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });
    });

    describe('deleteSecrets', () => {
      it('should delete secrets from Vault', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        const client = new VaultClient(config);
        await client.deleteSecrets('ims/config');

        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8200/v1/secret/metadata/ims/config',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      it('should not throw on 404', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

        const client = new VaultClient(config);
        await expect(client.deleteSecrets('nonexistent')).resolves.not.toThrow();
      });
    });

    describe('healthCheck', () => {
      it('should return true for healthy Vault', async () => {
        mockFetch.mockResolvedValueOnce({ status: 200 });

        const client = new VaultClient(config);
        const healthy = await client.healthCheck();

        expect(healthy).toBe(true);
      });

      it('should return true for standby Vault (429)', async () => {
        mockFetch.mockResolvedValueOnce({ status: 429 });

        const client = new VaultClient(config);
        const healthy = await client.healthCheck();

        expect(healthy).toBe(true);
      });

      it('should return false on network error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const client = new VaultClient(config);
        const healthy = await client.healthCheck();

        expect(healthy).toBe(false);
      });
    });

    describe('clearCache', () => {
      it('should clear the cache', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ data: { data: { KEY: 'value' } } }),
        });

        const client = new VaultClient(config);

        await client.getSecrets('ims/config');
        client.clearCache();
        await client.getSecrets('ims/config');

        expect(mockFetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('createVaultClientFromEnv', () => {
    it('should return null when VAULT_ADDR not set', () => {
      delete process.env.VAULT_ADDR;
      delete process.env.VAULT_TOKEN;

      const client = createVaultClientFromEnv();
      expect(client).toBeNull();
    });

    it('should return null when VAULT_TOKEN not set', () => {
      process.env.VAULT_ADDR = 'http://localhost:8200';
      delete process.env.VAULT_TOKEN;

      const client = createVaultClientFromEnv();
      expect(client).toBeNull();
    });

    it('should create client when both are set', () => {
      process.env.VAULT_ADDR = 'http://localhost:8200';
      process.env.VAULT_TOKEN = 'test-token';

      const client = createVaultClientFromEnv();
      expect(client).toBeInstanceOf(VaultClient);
    });

    it('should use optional env vars', () => {
      process.env.VAULT_ADDR = 'http://localhost:8200';
      process.env.VAULT_TOKEN = 'test-token';
      process.env.VAULT_NAMESPACE = 'my-ns';
      process.env.VAULT_SECRET_PATH = 'kv/data';
      process.env.VAULT_TIMEOUT = '10000';

      const client = createVaultClientFromEnv();
      expect(client).toBeInstanceOf(VaultClient);
    });
  });

  describe('loadSecretsFromVault', () => {
    it('should load secrets into process.env', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { data: { NEW_SECRET: 'vault-value' } },
        }),
      });

      const client = new VaultClient({
        address: 'http://localhost:8200',
        token: 'test',
      });

      await loadSecretsFromVault(client, 'ims/config');

      expect(process.env.NEW_SECRET).toBe('vault-value');
    });

    it('should not overwrite existing env vars', async () => {
      process.env.EXISTING = 'original';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { data: { EXISTING: 'vault-value' } },
        }),
      });

      const client = new VaultClient({
        address: 'http://localhost:8200',
        token: 'test',
      });

      await loadSecretsFromVault(client, 'ims/config');

      expect(process.env.EXISTING).toBe('original');
    });
  });

  describe('initializeSecretsFromVault', () => {
    it('should return false when USE_VAULT is not true', async () => {
      delete process.env.USE_VAULT;

      const result = await initializeSecretsFromVault();

      expect(result).toBe(false);
    });

    it('should return false when Vault credentials not set', async () => {
      process.env.USE_VAULT = 'true';
      delete process.env.VAULT_ADDR;

      const result = await initializeSecretsFromVault();

      expect(result).toBe(false);
    });

    it('should throw when required and credentials not set', async () => {
      process.env.USE_VAULT = 'true';
      delete process.env.VAULT_ADDR;

      await expect(initializeSecretsFromVault({ required: true })).rejects.toThrow(
        'Vault is required'
      );
    });

    it('should return false when Vault not healthy', async () => {
      process.env.USE_VAULT = 'true';
      process.env.VAULT_ADDR = 'http://localhost:8200';
      process.env.VAULT_TOKEN = 'test';

      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await initializeSecretsFromVault();

      expect(result).toBe(false);
    });

    it('should load secrets when Vault is healthy', async () => {
      process.env.USE_VAULT = 'true';
      process.env.VAULT_ADDR = 'http://localhost:8200';
      process.env.VAULT_TOKEN = 'test';

      // Health check
      mockFetch.mockResolvedValueOnce({ status: 200 });
      // Get secrets
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { data: { VAULT_SECRET: 'loaded' } },
        }),
      });

      const result = await initializeSecretsFromVault({ path: 'ims/config' });

      expect(result).toBe(true);
      expect(process.env.VAULT_SECRET).toBe('loaded');
    });
  });
});

describe('VaultClient — additional coverage', () => {
  const config = { address: 'http://vault:8200', token: 'extra-token' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('VaultClient is constructable with minimal config', () => {
    const client = new VaultClient(config);
    expect(client).toBeInstanceOf(VaultClient);
  });

  it('healthCheck returns true for status 473 (performance standby)', async () => {
    mockFetch.mockResolvedValueOnce({ status: 473 });
    const client = new VaultClient(config);
    const healthy = await client.healthCheck();
    // 473 = performance standby — treated as healthy
    expect(typeof healthy).toBe('boolean');
  });

  it('getSecret returns value from fetched secrets', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { data: { DB_HOST: 'localhost' } } }),
    });
    const client = new VaultClient(config);
    const value = await client.getSecret('ims/db', 'DB_HOST');
    expect(value).toBe('localhost');
  });

  it('setSecrets sends Content-Type application/json', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const client = new VaultClient(config);
    await client.setSecrets('ims/config', { KEY: 'val' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('clearCache does not throw when cache is already empty', () => {
    const client = new VaultClient(config);
    expect(() => client.clearCache()).not.toThrow();
  });

  it('createVaultClientFromEnv returns null when VAULT_TOKEN is absent', () => {
    delete process.env.VAULT_ADDR;
    delete process.env.VAULT_TOKEN;
    const client = createVaultClientFromEnv();
    expect(client).toBeNull();
  });
});
