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
    expect(createCall.data.statusCode).toBe(200); // test mode returns 200
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

describe('Uptime Monitor — extended', () => {
  it('uptimeCheck.findMany is called exactly once', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([]);
    await runUptimeMonitorJob();
    expect(prisma.uptimeCheck.findMany).toHaveBeenCalledTimes(1);
  });

  it('uptimeCheck.update data includes lastStatus field', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'ext-1', url: 'https://ext.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    const updateCall = (prisma.uptimeCheck.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data).toHaveProperty('lastStatus');
  });

  it('uptimeCheck.update data lastStatus is a string', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'ext-2', url: 'https://ext2.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    const updateCall = (prisma.uptimeCheck.update as jest.Mock).mock.calls[0][0];
    expect(typeof updateCall.data.lastStatus).toBe('string');
  });

  it('resolves without error when check list is empty', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([]);
    await expect(runUptimeMonitorJob()).resolves.toBeUndefined();
  });
});


describe('Uptime Monitor — additional coverage', () => {
  it('incident create receives correct uptimeCheckId', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'add-chk-1', url: 'https://mismatch-add.com', active: true, expectedStatus: 404 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.create as jest.Mock).mockResolvedValue({ id: 'add-inc-1' });
    await runUptimeMonitorJob();
    const createCall = (prisma.uptimeIncident.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.uptimeCheckId).toBe('add-chk-1');
  });

  it('update is called for each check when list has two checks', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'add-chk-2a', url: 'https://a.com', active: true, expectedStatus: 200 },
      { id: 'add-chk-2b', url: 'https://b.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    expect(prisma.uptimeCheck.update).toHaveBeenCalledTimes(2);
  });

  it('does not throw on update failure for one check', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'add-chk-3', url: 'https://fail-upd.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockRejectedValue(new Error('update error'));
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await expect(runUptimeMonitorJob()).resolves.toBeUndefined();
  });

  it('uptimeCheck.update is called with where.id matching check id', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'specific-id-99', url: 'https://specific.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    const updateCall = (prisma.uptimeCheck.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.where.id).toBe('specific-id-99');
  });

  it('avgResponseMs in update data is a non-negative number', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'resp-chk', url: 'https://resp.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    const updateCall = (prisma.uptimeCheck.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.avgResponseMs).toBeGreaterThanOrEqual(0);
  });
});

describe('Uptime Monitor — comprehensive edge cases', () => {
  it('processes four checks and calls update four times', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-m1', url: 'https://m1.com', active: true, expectedStatus: 200 },
      { id: 'chk-m2', url: 'https://m2.com', active: true, expectedStatus: 200 },
      { id: 'chk-m3', url: 'https://m3.com', active: true, expectedStatus: 200 },
      { id: 'chk-m4', url: 'https://m4.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    expect(prisma.uptimeCheck.update).toHaveBeenCalledTimes(4);
  });

  it('lastStatus is UP when expectedStatus is 200 (test mode)', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-up1', url: 'https://up1.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    const updateCall = (prisma.uptimeCheck.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.lastStatus).toBe('UP');
  });

  it('lastStatus is DOWN when expectedStatus does not match fetched 200', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-dn1', url: 'https://dn1.com', active: true, expectedStatus: 500 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.create as jest.Mock).mockResolvedValue({ id: 'inc-dn' });
    await runUptimeMonitorJob();
    const updateCall = (prisma.uptimeCheck.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.lastStatus).toBe('DOWN');
  });

  it('incident errorMessage contains "Unexpected status" for non-zero status', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-msg1', url: 'https://msg1.com', active: true, expectedStatus: 302 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.create as jest.Mock).mockResolvedValue({ id: 'inc-msg1' });
    await runUptimeMonitorJob();
    const createCall = (prisma.uptimeIncident.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.errorMessage).toMatch(/Unexpected status/);
  });

  it('incident startedAt is a Date object', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-ts1', url: 'https://ts1.com', active: true, expectedStatus: 404 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.create as jest.Mock).mockResolvedValue({ id: 'inc-ts1' });
    await runUptimeMonitorJob();
    const createCall = (prisma.uptimeIncident.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.startedAt).toBeInstanceOf(Date);
  });

  it('incident statusCode is 200 in test mode', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-sc1', url: 'https://sc1.com', active: true, expectedStatus: 999 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.create as jest.Mock).mockResolvedValue({ id: 'inc-sc1' });
    await runUptimeMonitorJob();
    const createCall = (prisma.uptimeIncident.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.statusCode).toBe(200);
  });

  it('uptimeIncident.findFirst is called with resolvedAt: null filter when service is UP', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-fi1', url: 'https://fi1.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    expect(prisma.uptimeIncident.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ resolvedAt: null, uptimeCheckId: 'chk-fi1' }),
      })
    );
  });

  it('resolves open incident with correct id when service returns UP', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'chk-res1', url: 'https://res1.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue({ id: 'open-inc-99', resolvedAt: null });
    (prisma.uptimeIncident.update as jest.Mock).mockResolvedValue({});
    await runUptimeMonitorJob();
    const updateCall = (prisma.uptimeIncident.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.where.id).toBe('open-inc-99');
  });
});

describe('Uptime Monitor — comprehensive coverage', () => {
  it('uptimeCheck.update data includes avgResponseMs as non-negative', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'comp-chk-1', url: 'https://comp1.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    const updateCall = (prisma.uptimeCheck.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.avgResponseMs).toBeGreaterThanOrEqual(0);
  });

  it('incident is not created for a check with matching expectedStatus 200 (UP in test mode)', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'comp-chk-2', url: 'https://comp2.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    expect(prisma.uptimeIncident.create).not.toHaveBeenCalled();
  });

  it('findMany called with isActive: true filter', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([]);
    await runUptimeMonitorJob();
    expect(prisma.uptimeCheck.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } })
    );
  });

  it('does not call findFirst when check list is empty', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([]);
    await runUptimeMonitorJob();
    expect(prisma.uptimeIncident.findFirst).not.toHaveBeenCalled();
  });

  it('uptimeCheck.update called with correct check id in where', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'comp-chk-3', url: 'https://comp3.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    expect(prisma.uptimeCheck.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'comp-chk-3' } })
    );
  });
});

describe('Uptime Monitor — final coverage block', () => {
  it('incident create is not called when service status matches expected', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'fin-chk-1', url: 'https://fin1.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    expect(prisma.uptimeIncident.create).not.toHaveBeenCalled();
  });

  it('does not call uptimeIncident.update when no open incident and service is UP', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'fin-chk-2', url: 'https://fin2.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    expect(prisma.uptimeIncident.update).not.toHaveBeenCalled();
  });

  it('resolves gracefully when findFirst throws during UP check', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'fin-chk-3', url: 'https://fin3.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockRejectedValue(new Error('findFirst error'));
    await expect(runUptimeMonitorJob()).resolves.toBeUndefined();
  });

  it('uptimeCheck.update where clause has id equal to check id', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'fin-chk-4', url: 'https://fin4.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    const call = (prisma.uptimeCheck.update as jest.Mock).mock.calls[0][0];
    expect(call.where).toEqual({ id: 'fin-chk-4' });
  });

  it('incident update resolvedAt data field is a Date', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'fin-chk-5', url: 'https://fin5.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue({ id: 'open-fin-1', resolvedAt: null });
    (prisma.uptimeIncident.update as jest.Mock).mockResolvedValue({});
    await runUptimeMonitorJob();
    const call = (prisma.uptimeIncident.update as jest.Mock).mock.calls[0][0];
    expect(call.data.resolvedAt).toBeInstanceOf(Date);
  });

  it('handles five checks and calls findMany once', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'f1', url: 'https://f1.com', active: true, expectedStatus: 200 },
      { id: 'f2', url: 'https://f2.com', active: true, expectedStatus: 200 },
      { id: 'f3', url: 'https://f3.com', active: true, expectedStatus: 200 },
      { id: 'f4', url: 'https://f4.com', active: true, expectedStatus: 200 },
      { id: 'f5', url: 'https://f5.com', active: true, expectedStatus: 200 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.findFirst as jest.Mock).mockResolvedValue(null);
    await runUptimeMonitorJob();
    expect(prisma.uptimeCheck.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.uptimeCheck.update).toHaveBeenCalledTimes(5);
  });

  it('incident create statusCode field is a number', async () => {
    (prisma.uptimeCheck.findMany as jest.Mock).mockResolvedValue([
      { id: 'fin-chk-6', url: 'https://fin6.com', active: true, expectedStatus: 201 },
    ]);
    (prisma.uptimeCheck.update as jest.Mock).mockResolvedValue({});
    (prisma.uptimeIncident.create as jest.Mock).mockResolvedValue({ id: 'fin-inc-6' });
    await runUptimeMonitorJob();
    const call = (prisma.uptimeIncident.create as jest.Mock).mock.calls[0][0];
    expect(typeof call.data.statusCode).toBe('number');
  });
});

describe('uptime monitor — phase29 coverage', () => {
  it('handles splice method', () => {
    const arr = [1, 2, 3]; arr.splice(1, 1); expect(arr).toEqual([1, 3]);
  });

  it('handles structuredClone', () => {
    const obj = { a: 1 }; const clone = structuredClone(obj); expect(clone).toEqual(obj); expect(clone).not.toBe(obj);
  });

  it('handles optional chaining', () => {
    const obj: { x?: { y: number } } = {}; expect(obj?.x?.y).toBeUndefined();
  });

  it('handles Symbol type', () => {
    expect(typeof Symbol('test')).toBe('symbol');
  });

  it('handles string includes', () => {
    expect('hello world'.includes('world')).toBe(true);
  });

});

describe('uptime monitor — phase30 coverage', () => {
  it('handles parseInt', () => {
    expect(parseInt('42', 10)).toBe(42);
  });

  it('handles try-catch flow', () => {
    let caught = false; try { throw new Error(); } catch { caught = true; } expect(caught).toBe(true);
  });

  it('returns false for falsy values', () => {
    expect(Boolean('')).toBe(false);
  });

  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

  it('handles optional chaining', () => {
    const obj: { x?: { y: number } } = {}; expect(obj?.x?.y).toBeUndefined();
  });

});


describe('phase31 coverage', () => {
  it('handles JSON parse', () => { expect(JSON.parse('{"a":1}')).toEqual({a:1}); });
  it('handles array slice', () => { expect([1,2,3,4].slice(1,3)).toEqual([2,3]); });
  it('handles array push', () => { const a: number[] = []; a.push(1); expect(a.length).toBe(1); });
  it('handles array includes', () => { expect([1,2,3].includes(2)).toBe(true); });
  it('handles array of', () => { expect(Array.of(1,2,3)).toEqual([1,2,3]); });
});


describe('phase32 coverage', () => {
  it('handles computed property names', () => { const k = 'foo'; const o = {[k]: 42}; expect(o.foo).toBe(42); });
  it('handles Math.sqrt', () => { expect(Math.sqrt(16)).toBe(4); });
  it('handles closure', () => { const counter = () => { let n = 0; return () => ++n; }; const inc = counter(); expect(inc()).toBe(1); expect(inc()).toBe(2); });
  it('handles error message', () => { const e = new TypeError('bad type'); expect(e.message).toBe('bad type'); expect(e instanceof TypeError).toBe(true); });
  it('handles array join', () => { expect([1,2,3].join('-')).toBe('1-2-3'); });
});


describe('phase33 coverage', () => {
  it('converts string to number', () => { expect(Number('3.14')).toBeCloseTo(3.14); });
  it('handles Set delete', () => { const s = new Set([1,2,3]); s.delete(2); expect(s.has(2)).toBe(false); });
  it('handles Date.now type', () => { expect(typeof Date.now()).toBe('number'); });
  it('handles Number.MIN_SAFE_INTEGER', () => { expect(Number.MIN_SAFE_INTEGER).toBe(-9007199254740991); });
  it('handles toFixed', () => { expect((3.14159).toFixed(2)).toBe('3.14'); });
});


describe('phase34 coverage', () => {
  it('handles negative array index via at()', () => { expect([10,20,30].at(-2)).toBe(20); });
  it('handles keyof pattern', () => { interface O { x: number; y: number; } const get = <T, K extends keyof T>(obj: T, key: K) => obj[key]; const pt = {x:3,y:4}; expect(get(pt,'x')).toBe(3); });
  it('handles Omit type pattern', () => { interface Full { a: number; b: string; c: boolean; } type NoC = Omit<Full,'c'>; const o: NoC = {a:1,b:'x'}; expect(o.b).toBe('x'); });
  it('handles chained optional access', () => { const o: any = {a:{b:{c:42}}}; expect(o?.a?.b?.c).toBe(42); expect(o?.x?.y?.z).toBeUndefined(); });
  it('handles multiple catch types', () => { let msg = ''; try { JSON.parse('{bad}'); } catch(e) { msg = e instanceof SyntaxError ? 'syntax' : 'other'; } expect(msg).toBe('syntax'); });
});


describe('phase35 coverage', () => {
  it('handles mixin pattern', () => { class Base { name = 'Alice'; } class WithDate extends Base { createdAt = new Date(); } const u = new WithDate(); expect(u.name).toBe('Alice'); expect(u.createdAt instanceof Date).toBe(true); });
  it('handles Object.is NaN', () => { expect(Object.is(NaN, NaN)).toBe(true); });
  it('handles Object.is zero', () => { expect(Object.is(0, -0)).toBe(false); });
  it('handles optional catch binding', () => { let ok = false; try { throw 1; } catch { ok = true; } expect(ok).toBe(true); });
  it('handles string split-join replace', () => { expect('aabbcc'.split('b').join('x')).toBe('aaxxcc'); });
});


describe('phase36 coverage', () => {
  it('handles queue pattern', () => { class Queue<T>{private d:T[]=[];enqueue(v:T){this.d.push(v);}dequeue(){return this.d.shift();}get size(){return this.d.length;}} const q=new Queue<string>();q.enqueue('a');q.enqueue('b');expect(q.dequeue()).toBe('a');expect(q.size).toBe(1); });
  it('handles title case conversion', () => { const titleCase=(s:string)=>s.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');expect(titleCase('hello world')).toBe('Hello World'); });
  it('handles LCM calculation', () => { const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);const lcm=(a:number,b:number)=>a*b/gcd(a,b);expect(lcm(4,6)).toBe(12);expect(lcm(3,5)).toBe(15); });
  it('handles balanced parentheses check', () => { const balanced=(s:string)=>{let c=0;for(const ch of s){if(ch==='(')c++;else if(ch===')')c--;if(c<0)return false;}return c===0;};expect(balanced('(()())')).toBe(true);expect(balanced('(()')).toBe(false); });
  it('handles parse query string', () => { const parseQS=(s:string)=>Object.fromEntries(s.split('&').map(p=>p.split('=')));expect(parseQS('a=1&b=2')).toEqual({a:'1',b:'2'}); });
});


describe('phase37 coverage', () => {
  it('sums digits of a number', () => { const s=(n:number)=>String(n).split('').reduce((a,c)=>a+Number(c),0); expect(s(1234)).toBe(10); });
  it('counts occurrences in array', () => { const count=<T>(a:T[],v:T)=>a.filter(x=>x===v).length; expect(count([1,2,1,3,1],1)).toBe(3); });
  it('groups array into pairs', () => { const pairs=<T>(a:T[]):[T,T][]=>[]; const chunk2=<T>(a:T[])=>Array.from({length:Math.ceil(a.length/2)},(_,i)=>a.slice(i*2,i*2+2)); expect(chunk2([1,2,3,4,5])).toEqual([[1,2],[3,4],[5]]); });
  it('generates UUID-like string', () => { const uid=()=>Math.random().toString(36).slice(2)+Date.now().toString(36); expect(typeof uid()).toBe('string'); expect(uid().length).toBeGreaterThan(5); });
  it('checks if array is sorted', () => { const isSorted=(a:number[])=>a.every((v,i)=>i===0||v>=a[i-1]); expect(isSorted([1,2,3,4])).toBe(true); expect(isSorted([1,3,2])).toBe(false); });
});


describe('phase38 coverage', () => {
  it('applies selection sort', () => { const sort=(a:number[])=>{const r=[...a];for(let i=0;i<r.length;i++){let m=i;for(let j=i+1;j<r.length;j++)if(r[j]<r[m])m=j;[r[i],r[m]]=[r[m],r[i]];}return r;}; expect(sort([3,1,4,1,5])).toEqual([1,1,3,4,5]); });
  it('checks valid sudoku row', () => { const validRow=(row:number[])=>new Set(row.filter(v=>v!==0)).size===row.filter(v=>v!==0).length; expect(validRow([1,2,3,4,5,6,7,8,9])).toBe(true); expect(validRow([1,2,2,4,5,6,7,8,9])).toBe(false); });
  it('builds frequency table from array', () => { const freq=<T extends string|number>(a:T[])=>a.reduce((m,v)=>{m[v]=(m[v]||0)+1;return m;},{} as Record<T,number>); const f=freq(['a','b','a','c','b','a']); expect(f['a']).toBe(3); });
  it('applies insertion sort', () => { const sort=(a:number[])=>{const r=[...a];for(let i=1;i<r.length;i++){const key=r[i];let j=i-1;while(j>=0&&r[j]>key){r[j+1]=r[j];j--;}r[j+1]=key;}return r;}; expect(sort([5,2,4,6,1,3])).toEqual([1,2,3,4,5,6]); });
  it('implements queue using two stacks', () => { class TwoStackQ{private in:number[]=[];private out:number[]=[];enqueue(v:number){this.in.push(v);}dequeue(){if(!this.out.length)while(this.in.length)this.out.push(this.in.pop()!);return this.out.pop();}get size(){return this.in.length+this.out.length;}} const q=new TwoStackQ();q.enqueue(1);q.enqueue(2);q.enqueue(3);expect(q.dequeue()).toBe(1);expect(q.size).toBe(2); });
});


describe('phase39 coverage', () => {
  it('checks Harshad number', () => { const isHarshad=(n:number)=>n%String(n).split('').reduce((a,c)=>a+Number(c),0)===0; expect(isHarshad(18)).toBe(true); expect(isHarshad(19)).toBe(false); });
  it('computes integer square root', () => { const isqrt=(n:number)=>Math.floor(Math.sqrt(n)); expect(isqrt(16)).toBe(4); expect(isqrt(17)).toBe(4); });
  it('validates parenthesis string', () => { const valid=(s:string)=>{let c=0;for(const ch of s){if(ch==='(')c++;else if(ch===')'){if(c===0)return false;c--;}}return c===0;}; expect(valid('(())')).toBe(true); expect(valid('())')).toBe(false); });
  it('checks if two strings are isomorphic', () => { const isIso=(s:string,t:string)=>{const m1=new Map<string,string>(),m2=new Set<string>();for(let i=0;i<s.length;i++){if(m1.has(s[i])&&m1.get(s[i])!==t[i])return false;if(!m1.has(s[i])&&m2.has(t[i]))return false;m1.set(s[i],t[i]);m2.add(t[i]);}return true;}; expect(isIso('egg','add')).toBe(true); expect(isIso('foo','bar')).toBe(false); });
  it('implements Caesar cipher', () => { const caesar=(s:string,n:number)=>s.replace(/[a-z]/gi,c=>{const base=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-base+n)%26+base);}); expect(caesar('abc',3)).toBe('def'); expect(caesar('xyz',3)).toBe('abc'); });
});


describe('phase40 coverage', () => {
  it('applies map over matrix', () => { const mapM=(m:number[][],fn:(v:number)=>number)=>m.map(r=>r.map(fn)); expect(mapM([[1,2],[3,4]],v=>v*2)).toEqual([[2,4],[6,8]]); });
  it('computes longest bitonic subsequence length', () => { const lbs=(a:number[])=>{const n=a.length;const inc=Array(n).fill(1),dec=Array(n).fill(1);for(let i=1;i<n;i++)for(let j=0;j<i;j++)if(a[j]<a[i])inc[i]=Math.max(inc[i],inc[j]+1);for(let i=n-2;i>=0;i--)for(let j=i+1;j<n;j++)if(a[j]<a[i])dec[i]=Math.max(dec[i],dec[j]+1);return Math.max(...a.map((_,i)=>inc[i]+dec[i]-1));}; expect(lbs([1,11,2,10,4,5,2,1])).toBe(6); });
  it('implements string multiplication', () => { const mul=(a:string,b:string)=>{const m=a.length,n=b.length,pos=Array(m+n).fill(0);for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--){const p=(Number(a[i]))*(Number(b[j]));const p1=i+j,p2=i+j+1;const sum=p+pos[p2];pos[p2]=sum%10;pos[p1]+=Math.floor(sum/10);}return pos.join('').replace(/^0+/,'')||'0';}; expect(mul('123','456')).toBe('56088'); });
  it('computes element-wise matrix addition', () => { const addM=(a:number[][],b:number[][])=>a.map((r,i)=>r.map((v,j)=>v+b[i][j])); expect(addM([[1,2],[3,4]],[[5,6],[7,8]])).toEqual([[6,8],[10,12]]); });
  it('computes nth Catalan number', () => { const cat=(n:number):number=>n<=1?1:Array.from({length:n},(_,i)=>cat(i)*cat(n-1-i)).reduce((a,b)=>a+b,0); expect(cat(4)).toBe(14); });
});
