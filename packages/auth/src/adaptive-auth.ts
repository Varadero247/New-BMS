// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Adaptive Authentication — Risk Scoring Engine
 *
 * Assigns a 0–100 risk score to each login attempt based on contextual
 * factors. The calling layer decides what action to take:
 *
 *   score < 30  → ALLOW (low risk, no extra friction)
 *   30 ≤ score < 60 → STEP_UP_MFA (require second factor)
 *   score ≥ 60  → BLOCK (reject / require manual review)
 */

export interface LoginContext {
  /** User identifier */
  userId: string;
  /** Source IP address */
  ip: string;
  /** User-Agent header */
  userAgent?: string;
  /** Rough geolocation (country code or geohash — caller provides) */
  geoCountry?: string;
  /** Whether this IP/device has been seen before for this user */
  isKnownDevice?: boolean;
  /** Whether the IP/geolocation has been seen before for this user */
  isKnownLocation?: boolean;
  /** Number of failed attempts in the last window */
  recentFailedAttempts?: number;
  /** Hour of day (0-23) in the user's local timezone */
  hourOfDay?: number;
  /** Typical login hours for this user (0-23 array) */
  normalLoginHours?: number[];
  /** Whether this is a Tor exit node or known proxy/VPN */
  isTorOrProxy?: boolean;
  /** Whether the account has MFA enabled */
  mfaEnabled?: boolean;
}

export type RiskAction = 'ALLOW' | 'STEP_UP_MFA' | 'BLOCK';

export interface RiskAssessment {
  score: number;
  action: RiskAction;
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  points: number;
  reason: string;
}

/** Calculate a risk score for a login attempt. */
export function assessLoginRisk(ctx: LoginContext): RiskAssessment {
  const factors: RiskFactor[] = [];
  let score = 0;

  // --- Factor 1: Unknown device ---
  if (ctx.isKnownDevice === false) {
    factors.push({ name: 'unknown_device', points: 25, reason: 'Login from unrecognised device' });
    score += 25;
  }

  // --- Factor 2: Unknown location ---
  if (ctx.isKnownLocation === false) {
    factors.push({ name: 'unknown_location', points: 20, reason: 'Login from new location' });
    score += 20;
  }

  // --- Factor 3: Tor / proxy / VPN ---
  if (ctx.isTorOrProxy) {
    factors.push({
      name: 'tor_or_proxy',
      points: 30,
      reason: 'Connection via anonymising proxy or Tor exit node',
    });
    score += 30;
  }

  // --- Factor 4: Unusual login hour ---
  if (
    ctx.hourOfDay !== undefined &&
    ctx.normalLoginHours &&
    ctx.normalLoginHours.length > 0 &&
    !ctx.normalLoginHours.includes(ctx.hourOfDay)
  ) {
    factors.push({
      name: 'unusual_hour',
      points: 15,
      reason: `Login at hour ${ctx.hourOfDay} outside normal window`,
    });
    score += 15;
  }

  // --- Factor 5: Recent failed attempts ---
  const failures = ctx.recentFailedAttempts ?? 0;
  if (failures >= 5) {
    factors.push({
      name: 'brute_force',
      points: 40,
      reason: `${failures} failed attempts recently — possible brute force`,
    });
    score += 40;
  } else if (failures >= 3) {
    factors.push({
      name: 'failed_attempts',
      points: 20,
      reason: `${failures} failed attempts recently`,
    });
    score += 20;
  }

  // --- Factor 6: No MFA on sensitive account ---
  if (ctx.mfaEnabled === false) {
    factors.push({
      name: 'no_mfa',
      points: 10,
      reason: 'Account has no MFA enrolled — higher risk if credentials compromised',
    });
    score += 10;
  }

  // Cap at 100
  const finalScore = Math.min(score, 100);

  const action: RiskAction =
    finalScore >= 60 ? 'BLOCK' : finalScore >= 30 ? 'STEP_UP_MFA' : 'ALLOW';

  return { score: finalScore, action, factors };
}

/** Determine recommended action string from a risk score. */
export function riskScoreToAction(score: number): RiskAction {
  if (score >= 60) return 'BLOCK';
  if (score >= 30) return 'STEP_UP_MFA';
  return 'ALLOW';
}
