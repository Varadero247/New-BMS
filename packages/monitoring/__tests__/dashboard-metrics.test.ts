import {
  RollingCounter,
  LatencyTracker,
  DashboardMetrics,
} from '../src/dashboard-metrics';

// ── RollingCounter ────────────────────────────────────────────────────────────

describe('RollingCounter', () => {
  it('starts at 0', () => {
    const c = new RollingCounter(60_000, 60);
    expect(c.total).toBe(0);
  });

  it('increment() increases total', () => {
    const c = new RollingCounter(60_000, 60);
    c.increment();
    c.increment();
    expect(c.total).toBe(2);
  });

  it('increment() accepts custom delta', () => {
    const c = new RollingCounter(60_000, 60);
    c.increment(5);
    expect(c.total).toBe(5);
  });

  it('rate returns increments per second', () => {
    const c = new RollingCounter(60_000, 60);
    // 60 increments over 60s window → 1 req/s
    for (let i = 0; i < 60; i++) c.increment();
    expect(c.rate).toBe(1);
  });

  it('total does not go negative', () => {
    const c = new RollingCounter(1, 1);
    c.increment(10);
    expect(c.total).toBeGreaterThanOrEqual(0);
  });
});

// ── LatencyTracker ────────────────────────────────────────────────────────────

describe('LatencyTracker', () => {
  it('avg returns 0 with no data', () => {
    const t = new LatencyTracker();
    expect(t.avg).toBe(0);
  });

  it('count starts at 0', () => {
    expect(new LatencyTracker().count).toBe(0);
  });

  it('errorCount starts at 0', () => {
    expect(new LatencyTracker().errorCount).toBe(0);
  });

  it('errorRate is 0 with no data', () => {
    expect(new LatencyTracker().errorRate).toBe(0);
  });

  it('avg equals first recorded value', () => {
    const t = new LatencyTracker();
    t.record(100);
    expect(t.avg).toBe(100);
  });

  it('avg converges toward recent values', () => {
    const t = new LatencyTracker(1); // alpha=1: avg always equals last value
    t.record(100);
    t.record(50);
    expect(t.avg).toBe(50);
  });

  it('count increments on each record', () => {
    const t = new LatencyTracker();
    t.record(10);
    t.record(20);
    expect(t.count).toBe(2);
  });

  it('errorCount increments when isError=true', () => {
    const t = new LatencyTracker();
    t.record(10, false);
    t.record(20, true);
    expect(t.errorCount).toBe(1);
  });

  it('errorRate is 50% with one error in two requests', () => {
    const t = new LatencyTracker();
    t.record(10, false);
    t.record(20, true);
    expect(t.errorRate).toBe(50);
  });

  it('errorRate is 100% when all requests error', () => {
    const t = new LatencyTracker();
    t.record(10, true);
    t.record(20, true);
    expect(t.errorRate).toBe(100);
  });
});

// ── DashboardMetrics ──────────────────────────────────────────────────────────

describe('DashboardMetrics', () => {
  let metrics: DashboardMetrics;
  const startTime = new Date(Date.now() - 10_000); // 10 seconds ago

  beforeEach(() => {
    metrics = new DashboardMetrics({ startTime });
  });

  describe('recordRequest()', () => {
    it('increments request counter', () => {
      metrics.recordRequest(50);
      metrics.recordRequest(100);
      expect(metrics.requests.total).toBe(2);
    });

    it('records latency in tracker', () => {
      metrics.recordRequest(200, false);
      expect(metrics.latency.avg).toBe(200);
    });

    it('records errors', () => {
      metrics.recordRequest(500, true);
      expect(metrics.latency.errorCount).toBe(1);
    });
  });

  describe('getBusinessKpis()', () => {
    it('returns a snapshot with timestamp', () => {
      const kpi = metrics.getBusinessKpis();
      expect(kpi.timestamp).toBeInstanceOf(Date);
    });

    it('reflects recorded requests', () => {
      metrics.recordRequest(100);
      metrics.recordRequest(200);
      const kpi = metrics.getBusinessKpis();
      expect(kpi.requestsLastMinute).toBe(2);
    });

    it('reflects error rate', () => {
      metrics.recordRequest(100, false);
      metrics.recordRequest(200, true);
      const kpi = metrics.getBusinessKpis();
      expect(kpi.errorRatePercent).toBe(50);
    });

    it('reflects avg response time', () => {
      const t = new DashboardMetrics({ startTime });
      t.recordRequest(100); // alpha=0.05 EMA starts at 100
      const kpi = t.getBusinessKpis();
      expect(kpi.avgResponseTimeMs).toBe(100);
    });
  });

  describe('getSystemHealth()', () => {
    it('returns healthy when no checks configured', async () => {
      const snap = await metrics.getSystemHealth();
      expect(snap.overall).toBe('healthy');
      expect(snap.components).toHaveLength(0);
    });

    it('reports uptime in seconds', async () => {
      const snap = await metrics.getSystemHealth();
      expect(snap.uptimeSeconds).toBeGreaterThanOrEqual(9);
    });

    it('includes database health when checkDatabase is provided', async () => {
      const m = new DashboardMetrics({
        startTime,
        checkDatabase: async () => 50,
      });
      const snap = await m.getSystemHealth();
      const db = snap.components.find((c) => c.name === 'database');
      expect(db?.status).toBe('healthy');
      expect(db?.latencyMs).toBe(50);
    });

    it('marks database degraded when latency 100-499ms', async () => {
      const m = new DashboardMetrics({
        startTime,
        checkDatabase: async () => 200,
      });
      const snap = await m.getSystemHealth();
      const db = snap.components.find((c) => c.name === 'database');
      expect(db?.status).toBe('degraded');
    });

    it('marks database unhealthy when it throws', async () => {
      const m = new DashboardMetrics({
        startTime,
        checkDatabase: async () => { throw new Error('conn refused'); },
      });
      const snap = await m.getSystemHealth();
      const db = snap.components.find((c) => c.name === 'database');
      expect(db?.status).toBe('unhealthy');
      expect(db?.details).toContain('conn refused');
    });

    it('marks overall as unhealthy when any component is unhealthy', async () => {
      const m = new DashboardMetrics({
        startTime,
        checkDatabase: async () => { throw new Error('down'); },
        checkCache: async () => 10,
      });
      const snap = await m.getSystemHealth();
      expect(snap.overall).toBe('unhealthy');
    });

    it('marks overall as degraded when only degraded components', async () => {
      const m = new DashboardMetrics({
        startTime,
        checkDatabase: async () => 200, // degraded
      });
      const snap = await m.getSystemHealth();
      expect(snap.overall).toBe('degraded');
    });

    it('includes cache health when checkCache is provided', async () => {
      const m = new DashboardMetrics({
        startTime,
        checkCache: async () => 5,
      });
      const snap = await m.getSystemHealth();
      const cache = snap.components.find((c) => c.name === 'cache');
      expect(cache?.status).toBe('healthy');
    });

    it('returns timestamp as a Date', async () => {
      const snap = await metrics.getSystemHealth();
      expect(snap.timestamp).toBeInstanceOf(Date);
    });
  });
});
