jest.mock('../src/prisma', () => ({
  prisma: {
    uptimeCheck: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    uptimeIncident: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { prisma } from '../src/prisma';
import { runUptimeMonitorJob } from '../src/jobs/uptime-monitor.job';

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NODE_ENV = 'test';
});

describe('runUptimeMonitorJob', () => {
  it('processes active uptime checks', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-1', url: 'https://example.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);

    await runUptimeMonitorJob();

    expect(prisma.uptimeCheck.findMany).toHaveBeenCalledWith({ where: { isActive: true } });
    expect(prisma.uptimeCheck.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'chk-1' },
        data: expect.objectContaining({ lastStatus: 'UP' }),
      })
    );
  });

  it('updates lastCheckedAt and avgResponseMs', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-2', url: 'https://test.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);

    await runUptimeMonitorJob();

    const updateCall = (prisma.uptimeCheck.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.lastCheckedAt).toBeInstanceOf(Date);
    expect(typeof updateCall.data.avgResponseMs).toBe('number');
  });

  it('creates incident when status does not match expected', async () => {
    // Override test mode: simulate a mismatch by using a non-200 expected status
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-3', url: 'https://down.com', active: true, expectedStatus: 201 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.create as jest.Mock).mockResolvedValue({ id: 'inc-1' });

    await runUptimeMonitorJob();

    expect(prisma.uptimeIncident.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ uptimeCheckId: 'chk-3' }),
      })
    );
  });

  it('resolves existing incident when service comes back up', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-4', url: 'https://back-up.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue({
      id: 'inc-open',
      uptimeCheckId: 'chk-4',
      resolvedAt: null,
    });
    (prisma.uptimeIncident.update as jest.Mock).mockResolvedValue({});

    await runUptimeMonitorJob();

    expect(prisma.uptimeIncident.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inc-open' },
        data: expect.objectContaining({ resolvedAt: expect.any(Date) }),
      })
    );
  });

  it('does not resolve when no open incident exists', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-5', url: 'https://stable.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);

    await runUptimeMonitorJob();

    expect(prisma.uptimeIncident.update).not.toHaveBeenCalled();
  });

  it('handles empty check list', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([]);

    await runUptimeMonitorJob();

    expect(prisma.uptimeCheck.update).not.toHaveBeenCalled();
  });

  it('processes multiple checks', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-a', url: 'https://a.com', active: true, expectedStatus: 200 },
      { id: 'chk-b', url: 'https://b.com', active: true, expectedStatus: 200 },
      { id: 'chk-c', url: 'https://c.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);

    await runUptimeMonitorJob();

    expect(prisma.uptimeCheck.update).toHaveBeenCalledTimes(3);
  });

  it('handles database errors gracefully', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    // Should not throw
    await expect(runUptimeMonitorJob()).resolves.toBeUndefined();
  });

  it('includes httpStatus in incident data', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-6', url: 'https://fail.com', active: true, expectedStatus: 201 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.create as jest.Mock).mockResolvedValue({ id: 'inc-2' });

    await runUptimeMonitorJob();

    const createCall = (prisma.uptimeIncident.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.httpStatus).toBe(200); // test mode returns 200
  });

  it('sets error message for unexpected status', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-7', url: 'https://mismatch.com', active: true, expectedStatus: 301 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.create as jest.Mock).mockResolvedValue({ id: 'inc-3' });

    await runUptimeMonitorJob();

    const createCall = (prisma.uptimeIncident.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.errorMessage).toContain('Unexpected status');
  });

  it('only queries active checks', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([]);

    await runUptimeMonitorJob();

    expect(prisma.uptimeCheck.findMany).toHaveBeenCalledWith({ where: { isActive: true } });
  });
});
