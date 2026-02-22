import {
  buildProfile,
  detectAnomaly,
  BehaviorProfileStore,
  type ActivityEvent,
} from '../src/behavioral-analytics';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEvent(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
  return {
    userId: 'u-1',
    action: 'login',
    ip: '1.2.3.4',
    geoCountry: 'GB',
    timestamp: new Date('2026-01-01T09:00:00Z'),
    ...overrides,
  };
}

/** Generate n events at the same hour with the same country */
function bulkEvents(count: number, overrides: Partial<ActivityEvent> = {}): ActivityEvent[] {
  return Array.from({ length: count }, (_, i) =>
    makeEvent({
      timestamp: new Date(`2026-01-${String(i + 1).padStart(2, '0')}T09:00:00Z`),
      ...overrides,
    })
  );
}

// ── buildProfile() ────────────────────────────────────────────────────────────

describe('buildProfile()', () => {
  it('returns a profile with the correct userId', () => {
    const events = bulkEvents(10);
    const p = buildProfile('u-1', events);
    expect(p.userId).toBe('u-1');
  });

  it('correctly identifies common countries', () => {
    const events = [
      ...bulkEvents(7, { geoCountry: 'GB' }),
      ...bulkEvents(2, { geoCountry: 'US' }),
      makeEvent({ geoCountry: 'DE' }),
    ];
    const p = buildProfile('u-1', events);
    expect(p.commonCountries[0]).toBe('GB');
    expect(p.commonCountries).toContain('US');
  });

  it('identifies normal login hours from frequent hours', () => {
    const events: ActivityEvent[] = [];
    // 8 logins at hour 9, 2 at hour 22
    for (let i = 0; i < 8; i++) {
      events.push(makeEvent({ timestamp: new Date(`2026-01-${String(i + 1).padStart(2, '0')}T09:00:00Z`) }));
    }
    events.push(makeEvent({ timestamp: new Date('2026-01-10T22:00:00Z') }));
    events.push(makeEvent({ timestamp: new Date('2026-01-11T22:00:00Z') }));

    const p = buildProfile('u-1', events);
    expect(p.normalLoginHours).toContain(9);
    // hour 22 is 2/10 = 20% — should be included (>5%)
    expect(p.normalLoginHours).toContain(22);
  });

  it('sets eventCount correctly', () => {
    const events = bulkEvents(15);
    const p = buildProfile('u-1', events);
    expect(p.eventCount).toBe(15);
  });

  it('handles empty events gracefully', () => {
    const p = buildProfile('u-1', []);
    expect(p.eventCount).toBe(0);
    expect(p.commonCountries).toHaveLength(0);
    expect(p.normalLoginHours).toHaveLength(0);
  });

  it('sets updatedAt to approximately now', () => {
    const before = Date.now();
    const p = buildProfile('u-1', bulkEvents(5));
    expect(p.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('calculates avgIntervalMs for multiple events', () => {
    const t1 = new Date('2026-01-01T09:00:00Z');
    const t2 = new Date('2026-01-01T10:00:00Z'); // +1hr
    const t3 = new Date('2026-01-01T11:00:00Z'); // +1hr
    const p = buildProfile('u-1', [
      makeEvent({ timestamp: t1 }),
      makeEvent({ timestamp: t2 }),
      makeEvent({ timestamp: t3 }),
    ]);
    expect(p.avgIntervalMs).toBeCloseTo(60 * 60 * 1000, -3); // ~1 hour
  });
});

// ── detectAnomaly() ───────────────────────────────────────────────────────────

describe('detectAnomaly()', () => {
  it('returns "none" when profile is null', () => {
    const result = detectAnomaly(makeEvent(), null);
    expect(result.level).toBe('none');
  });

  it('returns "none" when profile has < 5 events', () => {
    const p = buildProfile('u-1', bulkEvents(3));
    const result = detectAnomaly(makeEvent(), p);
    expect(result.level).toBe('none');
  });

  it('returns "none" for a fully matching event', () => {
    const events = bulkEvents(10, { geoCountry: 'GB' });
    const p = buildProfile('u-1', events);
    const event = makeEvent({ geoCountry: 'GB', timestamp: new Date('2026-02-01T09:00:00Z') });
    const result = detectAnomaly(event, p);
    expect(result.level).toBe('none');
    expect(result.score).toBe(0);
  });

  it('flags new country as medium/high anomaly', () => {
    const events = bulkEvents(10, { geoCountry: 'GB' });
    const p = buildProfile('u-1', events);
    const event = makeEvent({ geoCountry: 'CN' }); // new country
    const result = detectAnomaly(event, p);
    expect(['medium', 'high', 'critical']).toContain(result.level);
    expect(result.reasons.some(r => r.includes('CN'))).toBe(true);
  });

  it('flags unusual hour', () => {
    // Profile established at hour 9
    const events = bulkEvents(10, { geoCountry: 'GB' });
    const p = buildProfile('u-1', events);
    // Event at hour 3 (unusual)
    const event = makeEvent({
      geoCountry: 'GB',
      timestamp: new Date('2026-02-01T03:00:00Z'),
    });
    const result = detectAnomaly(event, p);
    expect(result.score).toBeGreaterThan(0);
    expect(result.reasons.some(r => r.includes('unusual hour') || r.includes('3:00'))).toBe(true);
  });

  it('returns critical when multiple anomalies combine', () => {
    const events = bulkEvents(10, { geoCountry: 'GB' });
    const p = buildProfile('u-1', events);
    // New country + unusual hour
    const event = makeEvent({
      geoCountry: 'CN',
      timestamp: new Date('2026-02-01T03:00:00Z'),
    });
    const result = detectAnomaly(event, p);
    expect(['high', 'critical']).toContain(result.level);
    expect(result.score).toBeGreaterThanOrEqual(40);
  });
});

// ── BehaviorProfileStore ──────────────────────────────────────────────────────

describe('BehaviorProfileStore', () => {
  let store: BehaviorProfileStore;

  beforeEach(() => {
    store = new BehaviorProfileStore();
  });

  it('starts with zero users', () => {
    expect(store.userCount).toBe(0);
  });

  it('getProfile() returns null for unknown user', () => {
    expect(store.getProfile('unknown')).toBeNull();
  });

  it('record() updates profile', () => {
    store.record(makeEvent({ userId: 'u-1' }));
    expect(store.getProfile('u-1')).not.toBeNull();
    expect(store.userCount).toBe(1);
  });

  it('multiple records build up profile', () => {
    for (let i = 0; i < 10; i++) {
      store.record(makeEvent({ userId: 'u-1', geoCountry: 'GB' }));
    }
    const p = store.getProfile('u-1');
    expect(p?.eventCount).toBe(10);
    expect(p?.commonCountries).toContain('GB');
  });

  it('evaluate() returns none when insufficient history', () => {
    store.record(makeEvent({ userId: 'u-1' }));
    const result = store.evaluate(makeEvent({ userId: 'u-1' }));
    expect(result.level).toBe('none');
  });

  it('evaluate() detects anomaly after sufficient history', () => {
    for (let i = 0; i < 10; i++) {
      store.record(makeEvent({ userId: 'u-2', geoCountry: 'GB' }));
    }
    // Now evaluate a login from a new country
    const result = store.evaluate(makeEvent({ userId: 'u-2', geoCountry: 'RU' }));
    expect(result.score).toBeGreaterThan(0);
  });

  it('caps stored events at 500 per user', () => {
    for (let i = 0; i < 600; i++) {
      store.record(makeEvent({ userId: 'u-cap' }));
    }
    const p = store.getProfile('u-cap');
    expect(p?.eventCount).toBeLessThanOrEqual(500);
  });
});

// ── Additional edge-case coverage ─────────────────────────────────────────────

describe('buildProfile() — edge cases', () => {
  it('excludes hours that appear only once out of 20 events (below 5%)', () => {
    const events: ActivityEvent[] = [];
    // 19 events at hour 10, 1 at hour 2 → 1/20 = 5% (≤5%, should be excluded since filter is > 0.05)
    for (let i = 0; i < 19; i++) {
      events.push(makeEvent({ timestamp: new Date(`2026-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`) }));
    }
    events.push(makeEvent({ timestamp: new Date('2026-01-20T02:00:00Z') }));
    const p = buildProfile('u-1', events);
    expect(p.normalLoginHours).toContain(10);
    expect(p.normalLoginHours).not.toContain(2);
  });

  it('handles single-event profiles with avgIntervalMs of 0', () => {
    const p = buildProfile('u-1', [makeEvent()]);
    expect(p.avgIntervalMs).toBe(0);
  });

  it('limits commonCountries to at most 3 entries', () => {
    const events = [
      ...bulkEvents(5, { geoCountry: 'GB' }),
      ...bulkEvents(4, { geoCountry: 'US' }),
      ...bulkEvents(3, { geoCountry: 'DE' }),
      ...bulkEvents(2, { geoCountry: 'FR' }),
    ];
    const p = buildProfile('u-1', events);
    expect(p.commonCountries.length).toBeLessThanOrEqual(3);
  });

  it('events without geoCountry do not appear in commonCountries', () => {
    const events: ActivityEvent[] = [];
    for (let i = 0; i < 10; i++) {
      events.push(makeEvent({ geoCountry: undefined }));
    }
    const p = buildProfile('u-1', events);
    expect(p.commonCountries).toHaveLength(0);
  });

  it('profile userId matches the provided userId', () => {
    const p = buildProfile('user-xyz', bulkEvents(5));
    expect(p.userId).toBe('user-xyz');
  });

  it('updatedAt is a Date instance', () => {
    const p = buildProfile('u-1', bulkEvents(3));
    expect(p.updatedAt).toBeInstanceOf(Date);
  });
});

describe('detectAnomaly() — scoring thresholds', () => {
  it('score of exactly 20 gives level medium', () => {
    // Only unusual hour (score +20, no new country)
    const events = bulkEvents(10, { geoCountry: 'GB' });
    const p = buildProfile('u-1', events);
    // Hour 3 is not in normalLoginHours (hour 9 is normal)
    const event = makeEvent({ geoCountry: 'GB', timestamp: new Date('2026-02-01T03:00:00Z') });
    const result = detectAnomaly(event, p);
    expect(result.score).toBe(20);
    expect(result.level).toBe('medium');
  });

  it('score of exactly 30 gives level medium', () => {
    // Only new country (score +30)
    const events = bulkEvents(10, { geoCountry: 'GB' });
    const p = buildProfile('u-1', events);
    const event = makeEvent({ geoCountry: 'AU', timestamp: new Date('2026-02-01T09:00:00Z') });
    const result = detectAnomaly(event, p);
    expect(result.score).toBe(30);
    expect(result.level).toBe('medium');
  });

  it('score 0 gives level none when profile is sufficient', () => {
    const events = bulkEvents(10, { geoCountry: 'GB' });
    const p = buildProfile('u-1', events);
    const event = makeEvent({ geoCountry: 'GB', timestamp: new Date('2026-02-01T09:00:00Z') });
    const result = detectAnomaly(event, p);
    expect(result.score).toBe(0);
    expect(result.level).toBe('none');
  });

  it('reasons array is empty when score is 0', () => {
    const events = bulkEvents(10, { geoCountry: 'GB' });
    const p = buildProfile('u-1', events);
    const event = makeEvent({ geoCountry: 'GB', timestamp: new Date('2026-02-01T09:00:00Z') });
    const result = detectAnomaly(event, p);
    expect(result.reasons).toHaveLength(0);
  });

  it('event from known country at normal hour produces no reasons', () => {
    const events = bulkEvents(10, { geoCountry: 'US' });
    const p = buildProfile('u-1', events);
    const event = makeEvent({ geoCountry: 'US', timestamp: new Date('2026-02-01T09:00:00Z') });
    const { reasons } = detectAnomaly(event, p);
    expect(reasons).toHaveLength(0);
  });

  it('returns AnomalyResult shape with level, score, reasons', () => {
    const events = bulkEvents(10, { geoCountry: 'GB' });
    const p = buildProfile('u-1', events);
    const result = detectAnomaly(makeEvent({ geoCountry: 'CN' }), p);
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('reasons');
    expect(Array.isArray(result.reasons)).toBe(true);
  });
});

describe('BehaviorProfileStore — additional scenarios', () => {
  let store: BehaviorProfileStore;

  beforeEach(() => {
    store = new BehaviorProfileStore();
  });

  it('supports independent profiles per user', () => {
    for (let i = 0; i < 10; i++) {
      store.record(makeEvent({ userId: 'alice', geoCountry: 'GB' }));
      store.record(makeEvent({ userId: 'bob', geoCountry: 'AU' }));
    }
    expect(store.userCount).toBe(2);
    expect(store.getProfile('alice')?.commonCountries).toContain('GB');
    expect(store.getProfile('bob')?.commonCountries).toContain('AU');
  });

  it('evaluate() returns a valid AnomalyResult shape for new user', () => {
    const result = store.evaluate(makeEvent({ userId: 'brand-new' }));
    expect(['none', 'low', 'medium', 'high', 'critical']).toContain(result.level);
    expect(typeof result.score).toBe('number');
    expect(Array.isArray(result.reasons)).toBe(true);
  });
});
