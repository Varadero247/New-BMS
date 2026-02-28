import { ZeroTrustContext, TrustDecision } from './types';

export class ZeroTrustVerifier {
  private readonly trustedIPs = new Set<string>();
  private readonly SENSITIVE_ACTIONS = new Set([
    'delete', 'export', 'admin', 'role_change', 'password_reset',
    'bulk_update', 'api_key_create', 'user_create', 'permission_grant',
  ]);

  verify(context: ZeroTrustContext): TrustDecision {
    let trustScore = 100;
    const requiredActions: string[] = [];

    // MFA required for sensitive actions
    if (this.SENSITIVE_ACTIONS.has(context.action) && !context.mfaVerified) {
      trustScore -= 40;
      requiredActions.push('mfa_required');
    }

    // Old session degrades trust
    const sessionAgeHours = context.sessionAge / 3600000;
    if (sessionAgeHours > 8) { trustScore -= 20; requiredActions.push('session_refresh'); }
    else if (sessionAgeHours > 4) { trustScore -= 10; }

    // Previous failures reduce trust
    if (context.previousFailures >= 3) { trustScore -= 30; requiredActions.push('account_review'); }
    else if (context.previousFailures >= 1) { trustScore -= 10; }

    // Untrusted IP reduces trust
    if (this.trustedIPs.size > 0 && !this.trustedIPs.has(context.ipAddress)) {
      trustScore -= 15;
    }

    trustScore = Math.max(0, Math.min(100, trustScore));
    const allowed = trustScore >= 60 && requiredActions.filter(a => a === 'mfa_required').length === 0;

    return {
      allowed,
      trustScore,
      requiredActions,
      reason: allowed
        ? `Access granted (trust score: ${trustScore})`
        : `Access denied: ${requiredActions.join(', ')} (trust score: ${trustScore})`,
    };
  }

  addTrustedIP(ip: string): void { this.trustedIPs.add(ip); }
  removeTrustedIP(ip: string): void { this.trustedIPs.delete(ip); }
  getTrustedIPs(): string[] { return Array.from(this.trustedIPs); }
  isSensitiveAction(action: string): boolean { return this.SENSITIVE_ACTIONS.has(action); }
  getSensitiveActions(): string[] { return Array.from(this.SENSITIVE_ACTIONS); }
}
