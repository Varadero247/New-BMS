import {
  SiemEngine,
  DEFAULT_RULES,
  type SiemEvent,
  type SiemRule,
} from '../src/siem';

// ── Helpers ────────────────────────────────────────────────────────────────

function authFailure(actorId: string, timestamp?: number): SiemEvent {
  return { type: 'AUTH_FAILURE', actorId, timestamp: timestamp ?? Date.now() };
}

function permDenied(actorId: string, timestamp?: number): SiemEvent {
  return { type: 'PERMISSION_DENIED', actorId, timestamp: timestamp ?? Date.now() };
}

// ── SiemEngine – initial state ─────────────────────────────────────────────

describe('SiemEngine – initial state', () => {
  let engine: SiemEngine;
  beforeEach(() => { engine = new SiemEngine([], { cleanupIntervalMs: 999_999 }); });
  afterEach(() => engine.destroy());

  it('starts with 0 actors', () => {
    expect(engine.actorCount).toBe(0);
  });

  it('getAlerts() returns empty array before any ingestion', () => {
    expect(engine.getAlerts()).toHaveLength(0);
  });

  it('getEvents() returns empty array for unknown actor', () => {
    expect(engine.getEvents('nobody')).toHaveLength(0);
  });
});

// ── SiemEngine – ingest() ──────────────────────────────────────────────────

describe('SiemEngine – ingest()', () => {
  let engine: SiemEngine;
  beforeEach(() => { engine = new SiemEngine([], { cleanupIntervalMs: 999_999 }); });
  afterEach(() => engine.destroy());

  it('stores the event', () => {
    engine.ingest(authFailure('alice'));
    expect(engine.getEvents('alice')).toHaveLength(1);
  });

  it('stores timestamp if not provided', () => {
    const before = Date.now();
    engine.ingest({ type: 'AUTH_FAILURE', actorId: 'alice' });
    const events = engine.getEvents('alice');
    expect(events[0].timestamp).toBeGreaterThanOrEqual(before);
  });

  it('tracks multiple actors independently', () => {
    engine.ingest(authFailure('alice'));
    engine.ingest(authFailure('bob'));
    expect(engine.actorCount).toBe(2);
    expect(engine.getEvents('alice')).toHaveLength(1);
    expect(engine.getEvents('bob')).toHaveLength(1);
  });

  it('returns no alerts when no rules configured', () => {
    const alerts = engine.ingest(authFailure('alice'));
    expect(alerts).toHaveLength(0);
  });
});

// ── SiemEngine – threshold rule ────────────────────────────────────────────

describe('SiemEngine – threshold rule', () => {
  const rule: SiemRule = {
    id: 'TEST_BRUTE',
    name: 'Test Brute Force',
    description: '3 failures in 1 min',
    ruleType: 'threshold',
    severity: 'high',
    eventTypes: ['AUTH_FAILURE'],
    windowMs: 60_000,
    threshold: 3,
  };

  let engine: SiemEngine;
  beforeEach(() => { engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 }); });
  afterEach(() => engine.destroy());

  it('does not fire below threshold', () => {
    engine.ingest(authFailure('alice'));
    engine.ingest(authFailure('alice'));
    expect(engine.getAlerts()).toHaveLength(0);
  });

  it('fires at threshold', () => {
    engine.ingest(authFailure('alice'));
    engine.ingest(authFailure('alice'));
    const alerts = engine.ingest(authFailure('alice'));
    expect(alerts).toHaveLength(1);
    expect(alerts[0].ruleId).toBe('TEST_BRUTE');
  });

  it('fires multiple times if events keep coming', () => {
    for (let i = 0; i < 5; i++) engine.ingest(authFailure('alice'));
    expect(engine.getAlerts('alice').length).toBeGreaterThanOrEqual(1);
  });

  it('alert contains correct severity', () => {
    for (let i = 0; i < 3; i++) engine.ingest(authFailure('alice'));
    const alerts = engine.getAlerts('alice');
    expect(alerts[0].severity).toBe('high');
  });

  it('alert contains actorId', () => {
    for (let i = 0; i < 3; i++) engine.ingest(authFailure('alice'));
    expect(engine.getAlerts('alice')[0].actorId).toBe('alice');
  });

  it('does not fire for different actor', () => {
    for (let i = 0; i < 3; i++) engine.ingest(authFailure('alice'));
    expect(engine.getAlerts('bob')).toHaveLength(0);
  });

  it('does not fire for events outside the window', () => {
    const old = Date.now() - 120_000; // 2 minutes ago (window=1min)
    engine.ingest(authFailure('alice', old));
    engine.ingest(authFailure('alice', old));
    engine.ingest(authFailure('alice', old));
    // Engine checks "now - windowMs"; old events fall outside
    expect(engine.getAlerts('alice')).toHaveLength(0);
  });
});

// ── SiemEngine – sequence rule ─────────────────────────────────────────────

describe('SiemEngine – sequence rule', () => {
  const rule: SiemRule = {
    id: 'RECON',
    name: 'Recon',
    description: 'perm denied → priv esc',
    ruleType: 'sequence',
    severity: 'critical',
    eventTypes: ['PERMISSION_DENIED', 'PRIVILEGE_ESCALATION'],
    windowMs: 60_000,
    sequence: ['PERMISSION_DENIED', 'PRIVILEGE_ESCALATION'],
  };

  let engine: SiemEngine;
  beforeEach(() => { engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 }); });
  afterEach(() => engine.destroy());

  it('does not fire on first event in sequence', () => {
    const alerts = engine.ingest(permDenied('alice'));
    expect(alerts).toHaveLength(0);
  });

  it('fires when sequence completes', () => {
    engine.ingest(permDenied('alice'));
    const alerts = engine.ingest({ type: 'PRIVILEGE_ESCALATION', actorId: 'alice' });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].ruleId).toBe('RECON');
  });

  it('does not fire on reversed sequence', () => {
    engine.ingest({ type: 'PRIVILEGE_ESCALATION', actorId: 'alice' });
    const alerts = engine.ingest(permDenied('alice'));
    expect(alerts).toHaveLength(0);
  });
});

// ── SiemEngine – velocity rule ─────────────────────────────────────────────

describe('SiemEngine – velocity rule', () => {
  const rule: SiemRule = {
    id: 'API_ABUSE',
    name: 'API Abuse',
    description: '>2 events/sec',
    ruleType: 'velocity',
    severity: 'medium',
    eventTypes: ['API_ABUSE'],
    windowMs: 1_000,
    maxVelocity: 2,
  };

  let engine: SiemEngine;
  beforeEach(() => { engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 }); });
  afterEach(() => engine.destroy());

  it('fires when velocity exceeds limit', () => {
    const now = Date.now();
    // 10 events in 1s window = 10 ev/s > 2 ev/s
    for (let i = 0; i < 10; i++) {
      engine.ingest({ type: 'API_ABUSE', actorId: 'alice', timestamp: now });
    }
    expect(engine.getAlerts('alice').length).toBeGreaterThanOrEqual(1);
  });
});

// ── SiemEngine – onAlert callback ─────────────────────────────────────────

describe('SiemEngine – onAlert callback', () => {
  it('calls onAlert when a rule fires', () => {
    const onAlert = jest.fn();
    const rule: SiemRule = {
      id: 'CB_RULE',
      name: 'Callback Rule',
      description: '1 event',
      ruleType: 'threshold',
      severity: 'low',
      eventTypes: ['AUTH_FAILURE'],
      windowMs: 60_000,
      threshold: 1,
    };
    const engine = new SiemEngine([rule], { onAlert, cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('alice'));
    expect(onAlert).toHaveBeenCalledTimes(1);
    engine.destroy();
  });
});

// ── SiemEngine – reset() ──────────────────────────────────────────────────

describe('SiemEngine – reset()', () => {
  it('clears all events and alerts', () => {
    const rule: SiemRule = {
      id: 'R', name: 'R', description: 'r',
      ruleType: 'threshold', severity: 'info',
      eventTypes: ['AUTH_FAILURE'], windowMs: 60_000, threshold: 2,
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('alice'));
    engine.ingest(authFailure('alice'));
    engine.reset();
    expect(engine.getAlerts()).toHaveLength(0);
    expect(engine.actorCount).toBe(0);
    engine.destroy();
  });
});

// ── DEFAULT_RULES ──────────────────────────────────────────────────────────

describe('DEFAULT_RULES', () => {
  it('contains BRUTE_FORCE rule', () => {
    expect(DEFAULT_RULES.some((r) => r.id === 'BRUTE_FORCE')).toBe(true);
  });

  it('BRUTE_FORCE rule fires after 5 auth failures within 5 minutes', () => {
    const engine = new SiemEngine([DEFAULT_RULES.find((r) => r.id === 'BRUTE_FORCE')!], { cleanupIntervalMs: 999_999 });
    for (let i = 0; i < 5; i++) engine.ingest(authFailure('hacker'));
    expect(engine.getAlerts('hacker').length).toBeGreaterThanOrEqual(1);
    engine.destroy();
  });

  it('all rules have unique IDs', () => {
    const ids = DEFAULT_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all rules have valid ruleType', () => {
    const validTypes = new Set(['threshold', 'sequence', 'velocity']);
    expect(DEFAULT_RULES.every((r) => validTypes.has(r.ruleType))).toBe(true);
  });
});
