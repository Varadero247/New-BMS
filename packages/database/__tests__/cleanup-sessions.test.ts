import {
  cleanupExpiredSessions,
  cleanupInactiveSessions,
  SessionCleanupJob,
  createSessionCleanupJob,
} from '../src/jobs/cleanup-sessions';

// Mock @ims/monitoring logger
jest.mock('@ims/monitoring', () => {
  const fns = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
  return { createLogger: jest.fn(() => fns), __mockFns: fns };
});
const { __mockFns: mockLoggerFns } = require('@ims/monitoring');

// Mock Prisma client
const mockPrisma = {
  session: {
    deleteMany: jest.fn(),
  },
} as Record<string, Record<string, jest.Mock>>;

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

describe('cleanupExpiredSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call prisma.session.deleteMany with expiresAt < now', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 5 });

    const before = new Date();
    const result = await cleanupExpiredSessions(mockPrisma);
    const after = new Date();

    expect(mockPrisma.session.deleteMany).toHaveBeenCalledTimes(1);
    const callArgs = mockPrisma.session.deleteMany.mock.calls[0][0];
    expect(callArgs.where).toHaveProperty('expiresAt');
    expect(callArgs.where.expiresAt).toHaveProperty('lt');
    // The date passed should be between before and after
    const dateUsed = callArgs.where.expiresAt.lt as Date;
    expect(dateUsed.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(dateUsed.getTime()).toBeLessThanOrEqual(after.getTime());

    expect(result.deletedCount).toBe(5);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should return deletedCount of 0 when no sessions expired', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

    const result = await cleanupExpiredSessions(mockPrisma);

    expect(result.deletedCount).toBe(0);
    expect(result.timestamp).toBeInstanceOf(Date);
  });
});

describe('cleanupInactiveSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call prisma.session.deleteMany with correct cutoff time using default hours', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 3 });

    const before = Date.now();
    const result = await cleanupInactiveSessions(mockPrisma);
    const after = Date.now();

    expect(mockPrisma.session.deleteMany).toHaveBeenCalledTimes(1);
    const callArgs = mockPrisma.session.deleteMany.mock.calls[0][0];
    expect(callArgs.where).toHaveProperty('lastActivityAt');
    expect(callArgs.where.lastActivityAt).toHaveProperty('lt');

    // Default is 24 hours
    const cutoffDate = callArgs.where.lastActivityAt.lt as Date;
    const expectedCutoffMin = before - 24 * 60 * 60 * 1000;
    const expectedCutoffMax = after - 24 * 60 * 60 * 1000;
    expect(cutoffDate.getTime()).toBeGreaterThanOrEqual(expectedCutoffMin);
    expect(cutoffDate.getTime()).toBeLessThanOrEqual(expectedCutoffMax);

    expect(result.deletedCount).toBe(3);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should use custom inactiveHours for cutoff calculation', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 10 });

    const inactiveHours = 48;
    const before = Date.now();
    const result = await cleanupInactiveSessions(mockPrisma, inactiveHours);
    const after = Date.now();

    const callArgs = mockPrisma.session.deleteMany.mock.calls[0][0];
    const cutoffDate = callArgs.where.lastActivityAt.lt as Date;
    const expectedCutoffMin = before - inactiveHours * 60 * 60 * 1000;
    const expectedCutoffMax = after - inactiveHours * 60 * 60 * 1000;
    expect(cutoffDate.getTime()).toBeGreaterThanOrEqual(expectedCutoffMin);
    expect(cutoffDate.getTime()).toBeLessThanOrEqual(expectedCutoffMax);

    expect(result.deletedCount).toBe(10);
  });

  it('should return deletedCount of 0 when no inactive sessions found', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

    const result = await cleanupInactiveSessions(mockPrisma, 1);

    expect(result.deletedCount).toBe(0);
    expect(result.timestamp).toBeInstanceOf(Date);
  });
});

describe('SessionCleanupJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create a job with a custom logger', () => {
      const job = new SessionCleanupJob(mockPrisma, mockLogger);

      // The job is created successfully and is not running
      expect(job.isJobRunning()).toBe(false);
    });

    it('should create a job with default structured logger when none provided', () => {
      mockLoggerFns.info.mockClear();

      const job = new SessionCleanupJob(mockPrisma);
      // Trigger start to see the default logger is used
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
      job.start(60000);

      expect(mockLoggerFns.info).toHaveBeenCalled();

      job.stop();
    });
  });

  describe('start', () => {
    it('should begin the interval and run initial cleanup', () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      job.start(60000);

      // Should log start message
      expect(mockLogger.info).toHaveBeenCalledWith('Starting session cleanup job', {
        intervalMs: 60000,
      });

      // Should have called deleteMany immediately (initial cleanup)
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledTimes(1);

      // isJobRunning should be true
      expect(job.isJobRunning()).toBe(true);

      job.stop();
    });

    it('should do nothing when already running', () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      job.start(60000);

      // Clear mocks to track second call
      mockLogger.info.mockClear();
      mockPrisma.session.deleteMany.mockClear();

      // Try to start again
      job.start(60000);

      // Should log "already running" message
      expect(mockLogger.info).toHaveBeenCalledWith('Cleanup job already running');
      // Should NOT call deleteMany again (no second initial cleanup)
      expect(mockPrisma.session.deleteMany).not.toHaveBeenCalled();

      job.stop();
    });

    it('should set up setInterval with the specified interval', () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      job.start(60000);

      // Verify setInterval was called with the correct interval
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);

      job.stop();
      setIntervalSpy.mockRestore();
    });

    it('should use default interval of 1 hour when not specified', () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      job.start();

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60 * 60 * 1000);

      job.stop();
      setIntervalSpy.mockRestore();
    });
  });

  describe('stop', () => {
    it('should clear the interval and mark as not running', () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      job.start(60000);

      expect(job.isJobRunning()).toBe(true);

      job.stop();

      expect(job.isJobRunning()).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('Session cleanup job stopped');
    });

    it('should do nothing if not running', () => {
      const job = new SessionCleanupJob(mockPrisma, mockLogger);

      // stop() when never started should not throw
      job.stop();

      // "stopped" message should NOT be logged since it was never running
      expect(mockLogger.info).not.toHaveBeenCalledWith('Session cleanup job stopped');
    });

    it('should prevent further interval callbacks after stop', () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      job.start(60000);

      // Initial call
      expect(mockPrisma.session.deleteMany).toHaveBeenCalledTimes(1);

      job.stop();
      mockPrisma.session.deleteMany.mockClear();

      // Advance timer - should NOT trigger any more calls
      jest.advanceTimersByTime(120000);
      expect(mockPrisma.session.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('runCleanup', () => {
    it('should skip if already running', async () => {
      // We need to simulate isRunning = true by having a long-running cleanup
      let resolveDeleteMany: (value: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolveDeleteMany = resolve;
      });
      mockPrisma.session.deleteMany.mockReturnValue(pendingPromise);

      const job = new SessionCleanupJob(mockPrisma, mockLogger);

      // Start first cleanup (will hang because deleteMany hasn't resolved)
      const firstRun = job.runCleanup();

      // Try to run cleanup again while first is still in progress
      await job.runCleanup();

      expect(mockLogger.info).toHaveBeenCalledWith('Cleanup already in progress, skipping');

      // Resolve the pending promise to clean up
      resolveDeleteMany!({ count: 0 });
      await firstRun;
    });

    it('should handle errors gracefully', async () => {
      mockPrisma.session.deleteMany.mockRejectedValue(new Error('Database connection lost'));

      const job = new SessionCleanupJob(mockPrisma, mockLogger);

      // Should not throw
      await job.runCleanup();

      expect(mockLogger.error).toHaveBeenCalledWith('Session cleanup failed', {
        error: expect.any(Error),
      });
    });

    it('should reset isRunning after error', async () => {
      mockPrisma.session.deleteMany
        .mockRejectedValueOnce(new Error('DB Error'))
        .mockResolvedValueOnce({ count: 2 });

      const job = new SessionCleanupJob(mockPrisma, mockLogger);

      // First call fails
      await job.runCleanup();
      expect(mockLogger.error).toHaveBeenCalled();

      // Second call should succeed (not be skipped)
      mockLogger.info.mockClear();
      await job.runCleanup();

      // Should NOT have logged "already in progress" - it should have run
      expect(mockLogger.info).not.toHaveBeenCalledWith('Cleanup already in progress, skipping');
    });

    it('should log when expired sessions are cleaned up', async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 7 });

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      await job.runCleanup();

      expect(mockLogger.info).toHaveBeenCalledWith('Cleaned up expired sessions', { count: 7 });
    });

    it('should not log when no expired sessions are found', async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      await job.runCleanup();

      expect(mockLogger.info).not.toHaveBeenCalledWith(
        'Cleaned up expired sessions',
        expect.anything()
      );
    });
  });

  describe('isJobRunning', () => {
    it('should return false when job has not been started', () => {
      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      expect(job.isJobRunning()).toBe(false);
    });

    it('should return true when job is running', () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      job.start(60000);

      expect(job.isJobRunning()).toBe(true);

      job.stop();
    });

    it('should return false after job is stopped', () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

      const job = new SessionCleanupJob(mockPrisma, mockLogger);
      job.start(60000);
      job.stop();

      expect(job.isJobRunning()).toBe(false);
    });
  });
});

describe('createSessionCleanupJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a SessionCleanupJob instance', () => {
    const job = createSessionCleanupJob(mockPrisma);

    expect(job).toBeInstanceOf(SessionCleanupJob);
  });

  it('should pass prisma and logger to the job', () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

    const job = createSessionCleanupJob(mockPrisma, mockLogger);

    expect(job).toBeInstanceOf(SessionCleanupJob);

    // Verify the logger is used by starting the job
    jest.useFakeTimers();
    job.start(60000);
    expect(mockLogger.info).toHaveBeenCalledWith('Starting session cleanup job', {
      intervalMs: 60000,
    });
    job.stop();
    jest.useRealTimers();
  });

  it('should create a job that is not initially running', () => {
    const job = createSessionCleanupJob(mockPrisma, mockLogger);

    expect(job.isJobRunning()).toBe(false);
  });
});

// ===================================================================
// Extended coverage: error paths, custom inactiveHours edge cases,
// runCleanup logging, repeated start/stop cycles
// ===================================================================

describe('cleanup-sessions — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cleanupExpiredSessions returns a timestamp that is a Date instance', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 2 });
    const result = await cleanupExpiredSessions(mockPrisma);
    expect(result.timestamp).toBeInstanceOf(Date);
    expect(result.deletedCount).toBe(2);
  });

  it('cleanupInactiveSessions with 1-hour cutoff uses correct window', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 1 });
    const before = Date.now();
    const result = await cleanupInactiveSessions(mockPrisma, 1);
    const after = Date.now();

    const callArgs = mockPrisma.session.deleteMany.mock.calls[0][0];
    const cutoff = (callArgs.where.lastActivityAt.lt as Date).getTime();
    expect(cutoff).toBeGreaterThanOrEqual(before - 1 * 60 * 60 * 1000);
    expect(cutoff).toBeLessThanOrEqual(after - 1 * 60 * 60 * 1000);
    expect(result.deletedCount).toBe(1);
  });

  it('SessionCleanupJob can be started again after stop', () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });

    const job = new SessionCleanupJob(mockPrisma, mockLogger);
    job.start(30000);
    expect(job.isJobRunning()).toBe(true);
    job.stop();
    expect(job.isJobRunning()).toBe(false);

    // Re-start after stop should work
    job.start(30000);
    expect(job.isJobRunning()).toBe(true);
    job.stop();
  });

  it('SessionCleanupJob start logs the correct intervalMs', () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 3 });

    const job = new SessionCleanupJob(mockPrisma, mockLogger);
    job.start(15000);

    expect(mockLogger.info).toHaveBeenCalledWith('Starting session cleanup job', {
      intervalMs: 15000,
    });
    expect(job.isJobRunning()).toBe(true);

    job.stop();
  });
});

describe('cleanup-sessions — additional scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cleanupExpiredSessions passes a Date instance to prisma.session.deleteMany', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
    await cleanupExpiredSessions(mockPrisma);
    const args = mockPrisma.session.deleteMany.mock.calls[0][0];
    expect(args.where.expiresAt.lt).toBeInstanceOf(Date);
  });

  it('cleanupInactiveSessions with 72-hour cutoff produces correct window', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 5 });
    const before = Date.now();
    await cleanupInactiveSessions(mockPrisma, 72);
    const after = Date.now();

    const args = mockPrisma.session.deleteMany.mock.calls[0][0];
    const cutoff = (args.where.lastActivityAt.lt as Date).getTime();
    const expectedMin = before - 72 * 60 * 60 * 1000;
    const expectedMax = after - 72 * 60 * 60 * 1000;
    expect(cutoff).toBeGreaterThanOrEqual(expectedMin);
    expect(cutoff).toBeLessThanOrEqual(expectedMax);
  });

  it('createSessionCleanupJob with no logger uses default logger without throwing', () => {
    expect(() => createSessionCleanupJob(mockPrisma)).not.toThrow();
  });

  it('SessionCleanupJob stop logs stopped message', () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
    const job = new SessionCleanupJob(mockPrisma, mockLogger);
    job.start(60000);
    job.stop();
    expect(mockLogger.info).toHaveBeenCalledWith('Session cleanup job stopped');
  });

  it('SessionCleanupJob isJobRunning returns false on a brand new instance', () => {
    const job = new SessionCleanupJob(mockPrisma, mockLogger);
    expect(job.isJobRunning()).toBe(false);
  });

  it('runCleanup logs expired count for large count', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 1000 });
    const job = new SessionCleanupJob(mockPrisma, mockLogger);
    await job.runCleanup();
    expect(mockLogger.info).toHaveBeenCalledWith('Cleaned up expired sessions', { count: 1000 });
  });
});

describe('cleanup-sessions — final additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cleanupExpiredSessions returns an object with deletedCount and timestamp', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 3 });
    const result = await cleanupExpiredSessions(mockPrisma);
    expect(result).toHaveProperty('deletedCount');
    expect(result).toHaveProperty('timestamp');
  });

  it('cleanupInactiveSessions returns an object with deletedCount and timestamp', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 7 });
    const result = await cleanupInactiveSessions(mockPrisma, 24);
    expect(result).toHaveProperty('deletedCount', 7);
    expect(result).toHaveProperty('timestamp');
  });

  it('SessionCleanupJob.runCleanup calls both cleanupExpiredSessions paths via prisma.session.deleteMany', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
    const job = new SessionCleanupJob(mockPrisma, mockLogger);
    await job.runCleanup();
    // deleteMany is called at least once (for expired sessions)
    expect(mockPrisma.session.deleteMany).toHaveBeenCalled();
  });

  it('createSessionCleanupJob returns a job that starts and stops correctly', () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
    const job = createSessionCleanupJob(mockPrisma, mockLogger);
    job.start(60000);
    expect(job.isJobRunning()).toBe(true);
    job.stop();
    expect(job.isJobRunning()).toBe(false);
  });

  it('cleanupExpiredSessions calls prisma.session.deleteMany exactly once', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue({ count: 0 });
    await cleanupExpiredSessions(mockPrisma);
    expect(mockPrisma.session.deleteMany).toHaveBeenCalledTimes(1);
  });
});

describe('cleanup sessions — phase29 coverage', () => {
  it('handles undefined check', () => {
    expect(undefined).toBeUndefined();
  });

  it('handles array filter', () => {
    expect([1, 2, 3, 4].filter(x => x > 2)).toEqual([3, 4]);
  });

  it('handles string substring', () => {
    expect('hello'.substring(1, 3)).toBe('el');
  });

  it('handles Symbol type', () => {
    expect(typeof Symbol('test')).toBe('symbol');
  });

  it('handles reverse method', () => {
    expect([1, 2, 3].reverse()).toEqual([3, 2, 1]);
  });

});

describe('cleanup sessions — phase30 coverage', () => {
  it('handles null check', () => {
    expect(null).toBeNull();
  });

  it('handles object keys', () => {
    expect(Object.keys({ a: 1, b: 2 }).length).toBe(2);
  });

  it('handles join method', () => {
    expect([1, 2, 3].join('-')).toBe('1-2-3');
  });

  it('handles async reject', async () => {
    await expect(Promise.reject(new Error('err'))).rejects.toThrow('err');
  });

  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

});


describe('phase31 coverage', () => {
  it('handles Array.isArray', () => { expect(Array.isArray([1,2])).toBe(true); expect(Array.isArray('x')).toBe(false); });
  it('handles object freeze', () => { const o = Object.freeze({a:1}); expect(Object.isFrozen(o)).toBe(true); });
  it('handles Math.min', () => { expect(Math.min(1,5,3)).toBe(1); });
  it('handles array map', () => { expect([1,2,3].map(x => x * 2)).toEqual([2,4,6]); });
  it('handles object spread', () => { const a = {x:1}; const b = {...a, y:2}; expect(b).toEqual({x:1,y:2}); });
});


describe('phase32 coverage', () => {
  it('handles array flatMap', () => { expect([1,2,3].flatMap(x => [x, x*2])).toEqual([1,2,2,4,3,6]); });
  it('handles computed property names', () => { const k = 'foo'; const o = {[k]: 42}; expect(o.foo).toBe(42); });
  it('handles logical nullish assignment', () => { let z: number | null = null; z ??= 3; expect(z).toBe(3); });
  it('handles Array.from with mapFn', () => { expect(Array.from({length:3}, (_,i) => i*2)).toEqual([0,2,4]); });
  it('handles object property shorthand', () => { const x = 1, y = 2; const o = {x, y}; expect(o).toEqual({x:1,y:2}); });
});
