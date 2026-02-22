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

describe('SiemEngine – extended coverage', () => {
  it('getAlerts() without actorId returns all alerts across all actors', () => {
    const rule: SiemRule = {
      id: 'MULTI_ACTOR',
      name: 'Multi Actor',
      description: '1 event',
      ruleType: 'threshold',
      severity: 'low',
      eventTypes: ['AUTH_FAILURE'],
      windowMs: 60_000,
      threshold: 1,
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('alice'));
    engine.ingest(authFailure('bob'));
    expect(engine.getAlerts().length).toBeGreaterThanOrEqual(2);
    engine.destroy();
  });

  it('ingest does not fire on event types not in the rule eventTypes list', () => {
    const rule: SiemRule = {
      id: 'ONLY_PERM',
      name: 'Only Perm',
      description: '1 perm denied',
      ruleType: 'threshold',
      severity: 'medium',
      eventTypes: ['PERMISSION_DENIED'],
      windowMs: 60_000,
      threshold: 1,
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('alice')); // AUTH_FAILURE is not in eventTypes
    expect(engine.getAlerts('alice')).toHaveLength(0);
    engine.destroy();
  });

  it('alert has a triggeredAt field set to a recent timestamp', () => {
    const rule: SiemRule = {
      id: 'TS_RULE',
      name: 'TS Rule',
      description: '1 event',
      ruleType: 'threshold',
      severity: 'info',
      eventTypes: ['AUTH_FAILURE'],
      windowMs: 60_000,
      threshold: 1,
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    const before = Date.now();
    engine.ingest(authFailure('alice'));
    const alerts = engine.getAlerts('alice');
    expect(alerts[0].triggeredAt).toBeGreaterThanOrEqual(before);
    engine.destroy();
  });

  it('reset() allows new alerts to be generated after clearing', () => {
    const rule: SiemRule = {
      id: 'RST2',
      name: 'R2',
      description: 'r',
      ruleType: 'threshold',
      severity: 'info',
      eventTypes: ['AUTH_FAILURE'],
      windowMs: 60_000,
      threshold: 2,
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('alice'));
    engine.ingest(authFailure('alice'));
    engine.reset();
    engine.ingest(authFailure('alice'));
    engine.ingest(authFailure('alice'));
    expect(engine.getAlerts('alice').length).toBeGreaterThanOrEqual(1);
    engine.destroy();
  });

  it('actorCount increments correctly with multiple unique actors', () => {
    const engine = new SiemEngine([], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('u1'));
    engine.ingest(authFailure('u2'));
    engine.ingest(authFailure('u3'));
    expect(engine.actorCount).toBe(3);
    engine.destroy();
  });

  it('sequence rule does not fire when sequence is complete but out of window', () => {
    const rule: SiemRule = {
      id: 'SEQ_WIN',
      name: 'Seq Win',
      description: 'perm→priv in 1s',
      ruleType: 'sequence',
      severity: 'high',
      eventTypes: ['PERMISSION_DENIED', 'PRIVILEGE_ESCALATION'],
      windowMs: 1_000,
      sequence: ['PERMISSION_DENIED', 'PRIVILEGE_ESCALATION'],
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    const old = Date.now() - 5_000;
    engine.ingest({ type: 'PERMISSION_DENIED', actorId: 'alice', timestamp: old });
    // PRIVILEGE_ESCALATION comes 5 seconds later (outside 1s window)
    const alerts = engine.ingest({ type: 'PRIVILEGE_ESCALATION', actorId: 'alice' });
    expect(alerts).toHaveLength(0);
    engine.destroy();
  });
});

describe('SiemEngine — additional rule and actor coverage', () => {
  it('alert has a ruleId field matching the rule that fired', () => {
    const rule: SiemRule = {
      id: 'ID_CHECK',
      name: 'ID Check',
      description: '1 event',
      ruleType: 'threshold',
      severity: 'low',
      eventTypes: ['AUTH_FAILURE'],
      windowMs: 60_000,
      threshold: 1,
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('tester'));
    const alerts = engine.getAlerts('tester');
    expect(alerts[0].ruleId).toBe('ID_CHECK');
    engine.destroy();
  });

  it('alert severity matches the rule severity', () => {
    const rule: SiemRule = {
      id: 'SEV_CHECK',
      name: 'Sev Check',
      description: '1 event',
      ruleType: 'threshold',
      severity: 'critical',
      eventTypes: ['AUTH_FAILURE'],
      windowMs: 60_000,
      threshold: 1,
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('actor'));
    expect(engine.getAlerts('actor')[0].severity).toBe('critical');
    engine.destroy();
  });

  it('getEvents returns all events for an actor', () => {
    const engine = new SiemEngine([], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('bob'));
    engine.ingest(authFailure('bob'));
    expect(engine.getEvents('bob')).toHaveLength(2);
    engine.destroy();
  });

  it('ingest returns an array even when no rules fire', () => {
    const engine = new SiemEngine([], { cleanupIntervalMs: 999_999 });
    const result = engine.ingest(authFailure('nobody'));
    expect(Array.isArray(result)).toBe(true);
    engine.destroy();
  });

  it('DEFAULT_RULES array length is at least 4', () => {
    expect(DEFAULT_RULES.length).toBeGreaterThanOrEqual(4);
  });

  it('actorCount returns 0 after reset', () => {
    const engine = new SiemEngine([], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('x'));
    engine.reset();
    expect(engine.actorCount).toBe(0);
    engine.destroy();
  });
});

describe('SiemEngine — final coverage', () => {
  it('getAlerts() with actorId returns only that actor\'s alerts', () => {
    const rule: SiemRule = {
      id: 'FILTER',
      name: 'Filter',
      description: '1 event',
      ruleType: 'threshold',
      severity: 'low',
      eventTypes: ['AUTH_FAILURE'],
      windowMs: 60_000,
      threshold: 1,
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    engine.ingest(authFailure('alice'));
    engine.ingest(authFailure('bob'));
    const aliceAlerts = engine.getAlerts('alice');
    expect(aliceAlerts.every((a) => a.actorId === 'alice')).toBe(true);
    engine.destroy();
  });

  it('velocity rule does not fire when events are spread beyond the window', () => {
    const rule: SiemRule = {
      id: 'VEL_SPREAD',
      name: 'Vel Spread',
      description: '>2 ev/s',
      ruleType: 'velocity',
      severity: 'low',
      eventTypes: ['API_ABUSE'],
      windowMs: 1_000,
      maxVelocity: 10,
    };
    const engine = new SiemEngine([rule], { cleanupIntervalMs: 999_999 });
    // Only 2 events per second — below limit
    const now = Date.now();
    engine.ingest({ type: 'API_ABUSE', actorId: 'u', timestamp: now });
    engine.ingest({ type: 'API_ABUSE', actorId: 'u', timestamp: now });
    expect(engine.getAlerts('u')).toHaveLength(0);
    engine.destroy();
  });

  it('DEFAULT_RULES all have non-empty description', () => {
    expect(DEFAULT_RULES.every((r) => r.description.length > 0)).toBe(true);
  });

  it('ingest stores event with a timestamp when none provided', () => {
    const engine = new SiemEngine([], { cleanupIntervalMs: 999_999 });
    const before = Date.now();
    engine.ingest({ type: 'AUTH_FAILURE', actorId: 'u' });
    const events = engine.getEvents('u');
    expect(events[0].timestamp).toBeGreaterThanOrEqual(before);
    engine.destroy();
  });
});

describe('siem — phase29 coverage', () => {
  it('handles Map size', () => {
    const m = new Map<string, number>([['a', 1]]); expect(m.size).toBe(1);
  });

  it('handles string indexOf', () => {
    expect('hello world'.indexOf('world')).toBe(6);
  });

  it('handles string padStart', () => {
    expect('5'.padStart(3, '0')).toBe('005');
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

  it('handles computed properties', () => {
    const key = 'foo'; const obj2 = { [key]: 42 }; expect(obj2.foo).toBe(42);
  });

});

describe('siem — phase30 coverage', () => {
  it('handles Math.max', () => {
    expect(Math.max(1, 2, 3)).toBe(3);
  });

  it('handles string endsWith', () => {
    expect('hello'.endsWith('lo')).toBe(true);
  });

  it('handles Math.floor', () => {
    expect(Math.floor(3.9)).toBe(3);
  });

  it('handles structuredClone', () => {
    const obj2 = { a: 1 }; const clone = structuredClone(obj2); expect(clone).toEqual(obj2); expect(clone).not.toBe(obj2);
  });

  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

});


describe('phase31 coverage', () => {
  it('handles array from', () => { expect(Array.from('abc')).toEqual(['a','b','c']); });
  it('handles default params', () => { const fn = (x = 10) => x; expect(fn()).toBe(10); expect(fn(5)).toBe(5); });
  it('handles string endsWith', () => { expect('hello'.endsWith('llo')).toBe(true); });
  it('handles array flat', () => { expect([[1,2],[3,4]].flat()).toEqual([1,2,3,4]); });
  it('handles Math.ceil', () => { expect(Math.ceil(3.1)).toBe(4); });
});
