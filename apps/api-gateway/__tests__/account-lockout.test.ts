import { Request, Response, NextFunction } from 'express';
import {
  AccountLockoutManager,
  getAccountLockoutManager,
  checkAccountLockout,
  resetAccountLockoutManager,
} from '../src/middleware/account-lockout';

describe('AccountLockoutManager', () => {
  let manager: AccountLockoutManager;
  const savedRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    // Remove REDIS_URL to force in-memory store for tests
    delete process.env.REDIS_URL;
    resetAccountLockoutManager();
    manager = new AccountLockoutManager({ maxAttempts: 5, lockoutDuration: 60 });
  });

  afterEach(async () => {
    await manager.close();
  });

  afterAll(() => {
    // Restore REDIS_URL if it was set
    if (savedRedisUrl) process.env.REDIS_URL = savedRedisUrl;
  });

  describe('recordFailedAttempt', () => {
    it('should record failed attempts', async () => {
      const result = await manager.recordFailedAttempt('test@example.com');
      expect(result.locked).toBe(false);
      expect(result.remainingAttempts).toBe(4);
    });

    it('should decrement remaining attempts with each failure', async () => {
      await manager.recordFailedAttempt('test@example.com');
      const result = await manager.recordFailedAttempt('test@example.com');
      expect(result.remainingAttempts).toBe(3);
    });

    it('should lock account after max attempts', async () => {
      for (let i = 0; i < 4; i++) {
        await manager.recordFailedAttempt('test@example.com');
      }
      const result = await manager.recordFailedAttempt('test@example.com');
      expect(result.locked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should handle different emails independently', async () => {
      await manager.recordFailedAttempt('user1@example.com');
      await manager.recordFailedAttempt('user1@example.com');

      const result = await manager.recordFailedAttempt('user2@example.com');
      expect(result.remainingAttempts).toBe(4); // First attempt for user2
    });

    it('should normalize email to lowercase', async () => {
      await manager.recordFailedAttempt('Test@Example.COM');
      const result = await manager.recordFailedAttempt('test@example.com');
      expect(result.remainingAttempts).toBe(3); // Should be counted as same user
    });

    it('should reset expired lockout on new attempt', async () => {
      const shortManager = new AccountLockoutManager({
        maxAttempts: 2,
        lockoutDuration: 1,
      });

      // Lock the account
      await shortManager.recordFailedAttempt('test@example.com');
      await shortManager.recordFailedAttempt('test@example.com');
      expect(await shortManager.isLocked('test@example.com')).toBe(true);

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // New attempt should start fresh
      const result = await shortManager.recordFailedAttempt('test@example.com');
      expect(result.locked).toBe(false);
      expect(result.remainingAttempts).toBe(1);

      await shortManager.close();
    });
  });

  describe('isLocked', () => {
    it('should return false for unlocked account', async () => {
      const locked = await manager.isLocked('test@example.com');
      expect(locked).toBe(false);
    });

    it('should return true for locked account', async () => {
      for (let i = 0; i < 5; i++) {
        await manager.recordFailedAttempt('test@example.com');
      }
      const locked = await manager.isLocked('test@example.com');
      expect(locked).toBe(true);
    });

    it('should return false after lockout period expires', async () => {
      // Use very short lockout for testing
      const shortLockoutManager = new AccountLockoutManager({
        maxAttempts: 2,
        lockoutDuration: 1, // 1 second
      });

      await shortLockoutManager.recordFailedAttempt('test@example.com');
      await shortLockoutManager.recordFailedAttempt('test@example.com');

      let locked = await shortLockoutManager.isLocked('test@example.com');
      expect(locked).toBe(true);

      // Wait for lockout to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      locked = await shortLockoutManager.isLocked('test@example.com');
      expect(locked).toBe(false);

      await shortLockoutManager.close();
    });

    it('should return false for account without lockout record', async () => {
      const locked = await manager.isLocked('nonexistent@example.com');
      expect(locked).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset lockout counter', async () => {
      await manager.recordFailedAttempt('test@example.com');
      await manager.recordFailedAttempt('test@example.com');

      await manager.reset('test@example.com');

      const remaining = await manager.getRemainingAttempts('test@example.com');
      expect(remaining).toBe(5);
    });

    it('should unlock a locked account', async () => {
      for (let i = 0; i < 5; i++) {
        await manager.recordFailedAttempt('test@example.com');
      }

      expect(await manager.isLocked('test@example.com')).toBe(true);

      await manager.reset('test@example.com');

      expect(await manager.isLocked('test@example.com')).toBe(false);
    });

    it('should handle reset for 00000000-0000-4000-a000-ffffffffffff account', async () => {
      // Should not throw
      await expect(manager.reset('nonexistent@example.com')).resolves.not.toThrow();
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return max attempts for new account', async () => {
      const remaining = await manager.getRemainingAttempts('new@example.com');
      expect(remaining).toBe(5);
    });

    it('should return correct remaining attempts', async () => {
      await manager.recordFailedAttempt('test@example.com');
      await manager.recordFailedAttempt('test@example.com');
      await manager.recordFailedAttempt('test@example.com');

      const remaining = await manager.getRemainingAttempts('test@example.com');
      expect(remaining).toBe(2);
    });

    it('should return 0 for locked account', async () => {
      for (let i = 0; i < 5; i++) {
        await manager.recordFailedAttempt('test@example.com');
      }

      const remaining = await manager.getRemainingAttempts('test@example.com');
      expect(remaining).toBe(0);
    });
  });

  describe('getLockoutTimeRemaining', () => {
    it('should return 0 for unlocked account', async () => {
      const time = await manager.getLockoutTimeRemaining('test@example.com');
      expect(time).toBe(0);
    });

    it('should return remaining time for locked account', async () => {
      for (let i = 0; i < 5; i++) {
        await manager.recordFailedAttempt('test@example.com');
      }

      const time = await manager.getLockoutTimeRemaining('test@example.com');
      expect(time).toBeGreaterThan(0);
      expect(time).toBeLessThanOrEqual(60); // Should be less than lockout duration
    });

    it('should return 0 for account without lockout', async () => {
      const time = await manager.getLockoutTimeRemaining('nonexistent@example.com');
      expect(time).toBe(0);
    });

    it('should return 0 after lockout expires', async () => {
      const shortManager = new AccountLockoutManager({
        maxAttempts: 1,
        lockoutDuration: 1,
      });

      await shortManager.recordFailedAttempt('test@example.com');

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const time = await shortManager.getLockoutTimeRemaining('test@example.com');
      expect(time).toBe(0);

      await shortManager.close();
    });
  });

  describe('close', () => {
    it('should clear memory store on close', async () => {
      await manager.recordFailedAttempt('test@example.com');
      await manager.recordFailedAttempt('test@example.com');

      await manager.close();

      // Create new manager to verify state was cleared
      const newManager = new AccountLockoutManager({ maxAttempts: 5, lockoutDuration: 60 });
      const remaining = await newManager.getRemainingAttempts('test@example.com');
      expect(remaining).toBe(5); // Should be fresh
      await newManager.close();
    });
  });

  describe('configuration', () => {
    it('should respect custom maxAttempts', async () => {
      const customManager = new AccountLockoutManager({ maxAttempts: 3 });

      await customManager.recordFailedAttempt('test@example.com');
      await customManager.recordFailedAttempt('test@example.com');
      const result = await customManager.recordFailedAttempt('test@example.com');

      expect(result.locked).toBe(true);
      await customManager.close();
    });

    it('should respect custom lockoutDuration', async () => {
      const customManager = new AccountLockoutManager({
        maxAttempts: 1,
        lockoutDuration: 2, // 2 seconds
      });

      await customManager.recordFailedAttempt('test@example.com');

      const time = await customManager.getLockoutTimeRemaining('test@example.com');
      expect(time).toBeLessThanOrEqual(2);
      expect(time).toBeGreaterThan(0);

      await customManager.close();
    });
  });
});

describe('getAccountLockoutManager', () => {
  beforeEach(() => {
    resetAccountLockoutManager();
  });

  afterEach(() => {
    resetAccountLockoutManager();
  });

  it('should return a singleton instance', () => {
    const manager1 = getAccountLockoutManager();
    const manager2 = getAccountLockoutManager();
    expect(manager1).toBe(manager2);
  });

  it('should create manager on first call', () => {
    const manager = getAccountLockoutManager();
    expect(manager).toBeInstanceOf(AccountLockoutManager);
  });
});

describe('checkAccountLockout middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let manager: AccountLockoutManager;

  beforeEach(() => {
    delete process.env.REDIS_URL;
    resetAccountLockoutManager();
    manager = new AccountLockoutManager({ maxAttempts: 3, lockoutDuration: 60 });

    mockReq = {
      body: { email: 'test@example.com' },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(async () => {
    await manager.close();
    resetAccountLockoutManager();
  });

  it('should call next for unlocked account', async () => {
    const middleware = checkAccountLockout(manager);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 423 for locked account', async () => {
    // Lock the account
    for (let i = 0; i < 3; i++) {
      await manager.recordFailedAttempt('test@example.com');
    }

    const middleware = checkAccountLockout(manager);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(423);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'ACCOUNT_LOCKED',
        }),
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should include retry time in lockout response', async () => {
    // Lock the account
    for (let i = 0; i < 3; i++) {
      await manager.recordFailedAttempt('test@example.com');
    }

    const middleware = checkAccountLockout(manager);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          retryAfter: expect.any(Number),
        }),
      })
    );
  });

  it('should call next when email is not provided', async () => {
    mockReq.body = {};
    const middleware = checkAccountLockout(manager);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should call next when body is undefined', async () => {
    mockReq.body = undefined;
    const middleware = checkAccountLockout(manager);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should use default manager when none provided', async () => {
    const middleware = checkAccountLockout();
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

describe('resetAccountLockoutManager', () => {
  it('should reset the singleton instance', () => {
    const manager1 = getAccountLockoutManager();
    resetAccountLockoutManager();
    const manager2 = getAccountLockoutManager();

    // Should be different instances after reset
    expect(manager1).not.toBe(manager2);
  });

  it('should handle multiple resets', () => {
    resetAccountLockoutManager();
    resetAccountLockoutManager();
    resetAccountLockoutManager();

    // Should not throw
    const manager = getAccountLockoutManager();
    expect(manager).toBeInstanceOf(AccountLockoutManager);
  });
});
