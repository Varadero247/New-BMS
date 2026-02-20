/**
 * SIEM Event Correlation Engine
 *
 * In-memory security event aggregation and pattern-matching.
 * Correlates raw security events into actionable alerts when
 * configurable thresholds are crossed within rolling time windows.
 *
 * Supported rule patterns:
 *   - threshold  — N events of matching type in T ms
 *   - sequence   — ordered chain of event types
 *   - velocity   — rate (events per second) exceeds limit
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type SiemEventType =
  | 'AUTH_FAILURE'
  | 'AUTH_SUCCESS'
  | 'PERMISSION_DENIED'
  | 'PRIVILEGE_ESCALATION'
  | 'BRUTE_FORCE_DETECTED'
  | 'ACCOUNT_LOCKOUT'
  | 'SUSPICIOUS_UA'
  | 'IMPOSSIBLE_TRAVEL'
  | 'DATA_EXFILTRATION'
  | 'API_ABUSE'
  | 'SQLI_ATTEMPT'
  | 'XSS_ATTEMPT'
  | 'PATH_TRAVERSAL'
  | string;

export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type RuleType = 'threshold' | 'sequence' | 'velocity';

export interface SiemEvent {
  type: SiemEventType;
  /** Actor identifier — userId, IP, sessionId, or similar */
  actorId: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface SiemRule {
  id: string;
  name: string;
  description: string;
  ruleType: RuleType;
  severity: AlertSeverity;
  /** Event types this rule matches */
  eventTypes: SiemEventType[];
  /** Rolling window in milliseconds */
  windowMs: number;
  /** For 'threshold': minimum event count to fire */
  threshold?: number;
  /** For 'sequence': ordered chain that must appear in window */
  sequence?: SiemEventType[];
  /** For 'velocity': events per second limit */
  maxVelocity?: number;
}

export interface SiemAlert {
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  actorId: string;
  triggeredAt: number;
  eventCount: number;
  /** Subset of events that triggered this alert */
  matchedEvents: SiemEvent[];
  description: string;
}

export interface SiemEngineOptions {
  /** Max events to keep per actor (default: 1000) */
  maxEventsPerActor?: number;
  /** How often to run expired-event cleanup in ms (default: 60s) */
  cleanupIntervalMs?: number;
  /** Called whenever an alert fires */
  onAlert?: (alert: SiemAlert) => void;
}

// ── Built-in Rules ─────────────────────────────────────────────────────────

export const DEFAULT_RULES: SiemRule[] = [
  {
    id: 'BRUTE_FORCE',
    name: 'Brute Force Login',
    description: '5+ auth failures within 5 minutes',
    ruleType: 'threshold',
    severity: 'high',
    eventTypes: ['AUTH_FAILURE'],
    windowMs: 5 * 60 * 1000,
    threshold: 5,
  },
  {
    id: 'CREDENTIAL_STUFFING',
    name: 'Credential Stuffing',
    description: '20+ auth failures within 10 minutes',
    ruleType: 'threshold',
    severity: 'critical',
    eventTypes: ['AUTH_FAILURE'],
    windowMs: 10 * 60 * 1000,
    threshold: 20,
  },
  {
    id: 'ACCOUNT_ENUM',
    name: 'Account Enumeration',
    description: '10+ permission-denied events within 2 minutes',
    ruleType: 'threshold',
    severity: 'medium',
    eventTypes: ['PERMISSION_DENIED'],
    windowMs: 2 * 60 * 1000,
    threshold: 10,
  },
  {
    id: 'SQLI_BURST',
    name: 'SQL Injection Burst',
    description: '3+ SQLi attempts within 1 minute',
    ruleType: 'threshold',
    severity: 'critical',
    eventTypes: ['SQLI_ATTEMPT'],
    windowMs: 60 * 1000,
    threshold: 3,
  },
  {
    id: 'RECON_SEQUENCE',
    name: 'Reconnaissance Sequence',
    description: 'Permission denial followed by privilege escalation attempt',
    ruleType: 'sequence',
    severity: 'high',
    eventTypes: ['PERMISSION_DENIED', 'PRIVILEGE_ESCALATION'],
    windowMs: 5 * 60 * 1000,
    sequence: ['PERMISSION_DENIED', 'PRIVILEGE_ESCALATION'],
  },
  {
    id: 'API_ABUSE_VELOCITY',
    name: 'API Abuse (High Velocity)',
    description: 'More than 50 API_ABUSE events per second',
    ruleType: 'velocity',
    severity: 'high',
    eventTypes: ['API_ABUSE'],
    windowMs: 10 * 1000,
    maxVelocity: 50,
  },
];

// ── Engine ─────────────────────────────────────────────────────────────────

export class SiemEngine {
  private readonly rules: SiemRule[];
  private readonly eventStore = new Map<string, SiemEvent[]>();
  private readonly firedAlerts: SiemAlert[] = [];
  private readonly opts: Required<Omit<SiemEngineOptions, 'onAlert'>> & { onAlert?: (a: SiemAlert) => void };
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(rules: SiemRule[] = DEFAULT_RULES, opts: SiemEngineOptions = {}) {
    this.rules = rules;
    this.opts = {
      maxEventsPerActor: opts.maxEventsPerActor ?? 1_000,
      cleanupIntervalMs: opts.cleanupIntervalMs ?? 60_000,
      onAlert: opts.onAlert,
    };
    this.cleanupTimer = setInterval(() => this.evictExpired(), this.opts.cleanupIntervalMs);
    if (this.cleanupTimer.unref) this.cleanupTimer.unref();
  }

  /**
   * Ingest a security event and evaluate all matching rules.
   * Returns any alerts that fired.
   */
  ingest(event: SiemEvent): SiemAlert[] {
    const stamped: SiemEvent = { ...event, timestamp: event.timestamp ?? Date.now() };
    this.storeEvent(stamped);

    const fired: SiemAlert[] = [];
    for (const rule of this.rules) {
      if (!rule.eventTypes.includes(stamped.type)) continue;
      const alert = this.evaluate(rule, stamped.actorId);
      if (alert) {
        fired.push(alert);
        this.firedAlerts.push(alert);
        this.opts.onAlert?.(alert);
      }
    }
    return fired;
  }

  /** Return all alerts fired so far. */
  getAlerts(actorId?: string): SiemAlert[] {
    if (actorId) return this.firedAlerts.filter((a) => a.actorId === actorId);
    return [...this.firedAlerts];
  }

  /** Return events for a given actor (optionally filtered by type). */
  getEvents(actorId: string, type?: SiemEventType): SiemEvent[] {
    const all = this.eventStore.get(actorId) ?? [];
    return type ? all.filter((e) => e.type === type) : [...all];
  }

  /** Number of unique actors tracked. */
  get actorCount(): number {
    return this.eventStore.size;
  }

  /** Clear all events and alerts (useful for testing). */
  reset(): void {
    this.eventStore.clear();
    this.firedAlerts.length = 0;
  }

  destroy(): void {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.reset();
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private storeEvent(event: SiemEvent): void {
    const list = this.eventStore.get(event.actorId) ?? [];
    list.push(event);
    // Cap per-actor buffer
    while (list.length > this.opts.maxEventsPerActor) list.shift();
    this.eventStore.set(event.actorId, list);
  }

  private windowEvents(actorId: string, eventTypes: SiemEventType[], windowMs: number): SiemEvent[] {
    const cutoff = Date.now() - windowMs;
    const all = this.eventStore.get(actorId) ?? [];
    return all.filter((e) => (e.timestamp ?? 0) >= cutoff && eventTypes.includes(e.type));
  }

  private evaluate(rule: SiemRule, actorId: string): SiemAlert | null {
    const events = this.windowEvents(actorId, rule.eventTypes, rule.windowMs);

    if (rule.ruleType === 'threshold') {
      const threshold = rule.threshold ?? 1;
      if (events.length >= threshold) {
        return this.buildAlert(rule, actorId, events);
      }
    }

    if (rule.ruleType === 'sequence' && rule.sequence) {
      if (this.matchesSequence(events, rule.sequence)) {
        return this.buildAlert(rule, actorId, events);
      }
    }

    if (rule.ruleType === 'velocity' && rule.maxVelocity !== undefined) {
      const windowSec = rule.windowMs / 1000;
      const velocity = events.length / windowSec;
      if (velocity > rule.maxVelocity) {
        return this.buildAlert(rule, actorId, events);
      }
    }

    return null;
  }

  private matchesSequence(events: SiemEvent[], sequence: SiemEventType[]): boolean {
    let seqIdx = 0;
    for (const event of events) {
      if (event.type === sequence[seqIdx]) {
        seqIdx++;
        if (seqIdx === sequence.length) return true;
      }
    }
    return false;
  }

  private buildAlert(rule: SiemRule, actorId: string, matchedEvents: SiemEvent[]): SiemAlert {
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      actorId,
      triggeredAt: Date.now(),
      eventCount: matchedEvents.length,
      matchedEvents: matchedEvents.slice(-20), // Keep last 20 for payload size
      description: rule.description,
    };
  }

  private evictExpired(): void {
    const longestWindow = this.rules.reduce((max, r) => Math.max(max, r.windowMs), 0);
    const cutoff = Date.now() - longestWindow;
    for (const [actorId, events] of this.eventStore) {
      const fresh = events.filter((e) => (e.timestamp ?? 0) >= cutoff);
      if (fresh.length === 0) {
        this.eventStore.delete(actorId);
      } else {
        this.eventStore.set(actorId, fresh);
      }
    }
  }
}

/** Module-level singleton SIEM engine using default rules. */
export const globalSiem = new SiemEngine(DEFAULT_RULES);
