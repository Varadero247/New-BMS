/**
 * Behavioral Analytics — User Activity Anomaly Detection
 *
 * Builds behavioral profiles from historical activity and detects anomalies
 * by comparing new events against established patterns.
 *
 * This is a lightweight, dependency-free in-memory implementation.
 * In production, persist profiles to Redis or PostgreSQL.
 */

export interface ActivityEvent {
  userId: string;
  action: string;
  ip: string;
  /** Country code (e.g. 'GB', 'US') — caller resolves via GeoIP */
  geoCountry?: string;
  timestamp: Date;
}

export interface BehaviorProfile {
  userId: string;
  /** Top 3 countries by login frequency */
  commonCountries: string[];
  /** Hours of day (0-23) where > 5% of logins occur */
  normalLoginHours: number[];
  /** Mean time between events in ms */
  avgIntervalMs: number;
  /** Total events in the profile window */
  eventCount: number;
  updatedAt: Date;
}

export type AnomalyLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface AnomalyResult {
  level: AnomalyLevel;
  score: number;
  reasons: string[];
}

// ── Profile builder ────────────────────────────────────────────────────────────

/**
 * Build a behaviour profile from a list of past events.
 * Events should be ordered oldest-first.
 */
export function buildProfile(userId: string, events: ActivityEvent[]): BehaviorProfile {
  const sortedEvents = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Hour distribution
  const hourCounts = new Array<number>(24).fill(0);
  for (const e of sortedEvents) {
    hourCounts[e.timestamp.getHours()]++;
  }
  const total = sortedEvents.length || 1;
  const normalLoginHours = hourCounts
    .map((count, hour) => ({ hour, pct: count / total }))
    .filter((h) => h.pct > 0.05)
    .map((h) => h.hour);

  // Country frequency
  const countryCount = new Map<string, number>();
  for (const e of sortedEvents) {
    if (e.geoCountry) {
      countryCount.set(e.geoCountry, (countryCount.get(e.geoCountry) ?? 0) + 1);
    }
  }
  const commonCountries = [...countryCount.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([country]) => country);

  // Average interval
  let totalInterval = 0;
  for (let i = 1; i < sortedEvents.length; i++) {
    totalInterval +=
      sortedEvents[i].timestamp.getTime() - sortedEvents[i - 1].timestamp.getTime();
  }
  const avgIntervalMs =
    sortedEvents.length > 1 ? totalInterval / (sortedEvents.length - 1) : 0;

  return {
    userId,
    commonCountries,
    normalLoginHours,
    avgIntervalMs,
    eventCount: sortedEvents.length,
    updatedAt: new Date(),
  };
}

// ── Anomaly detector ───────────────────────────────────────────────────────────

/**
 * Detect anomalies in a new event relative to a user's profile.
 */
export function detectAnomaly(
  event: ActivityEvent,
  profile: BehaviorProfile | null
): AnomalyResult {
  const reasons: string[] = [];
  let score = 0;

  if (!profile || profile.eventCount < 5) {
    // Not enough history to make a judgement
    return { level: 'none', score: 0, reasons: ['Insufficient history'] };
  }

  // --- Unusual country ---
  if (event.geoCountry && !profile.commonCountries.includes(event.geoCountry)) {
    score += 30;
    reasons.push(`Login from new country: ${event.geoCountry}`);
  }

  // --- Unusual hour ---
  const hour = event.timestamp.getHours();
  if (
    profile.normalLoginHours.length > 0 &&
    !profile.normalLoginHours.includes(hour)
  ) {
    score += 20;
    reasons.push(`Login at unusual hour: ${hour}:00`);
  }

  // --- Velocity anomaly (too many events in short succession) ---
  // (In a real implementation, compare to recent events for the same user)
  // Placeholder: flag if avgInterval > 0 and event is far outside pattern

  const level: AnomalyLevel =
    score >= 60 ? 'critical' : score >= 40 ? 'high' : score >= 20 ? 'medium' : score > 0 ? 'low' : 'none';

  return { level, score, reasons };
}

// ── In-memory profile store ────────────────────────────────────────────────────

/**
 * Simple in-memory store for behavioral profiles.
 * Replace with Redis + TTL for production.
 */
export class BehaviorProfileStore {
  private profiles = new Map<string, BehaviorProfile>();
  private events = new Map<string, ActivityEvent[]>();

  /** Record a new activity event and update the user's profile. */
  record(event: ActivityEvent): void {
    const existing = this.events.get(event.userId) ?? [];
    existing.push(event);

    // Keep last 500 events per user
    if (existing.length > 500) {
      existing.splice(0, existing.length - 500);
    }

    this.events.set(event.userId, existing);
    this.profiles.set(event.userId, buildProfile(event.userId, existing));
  }

  /** Get a user's profile (null if none yet). */
  getProfile(userId: string): BehaviorProfile | null {
    return this.profiles.get(userId) ?? null;
  }

  /** Evaluate a new event against the stored profile. */
  evaluate(event: ActivityEvent): AnomalyResult {
    const profile = this.getProfile(event.userId);
    return detectAnomaly(event, profile);
  }

  get userCount(): number {
    return this.profiles.size;
  }
}
