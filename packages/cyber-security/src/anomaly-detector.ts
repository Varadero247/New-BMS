import { RiskAssessment, RiskAction, LoginRecord } from './types';

interface LoginContext {
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  country?: string;
}

export class AnomalyDetector {
  private readonly loginHistory = new Map<string, LoginRecord[]>();
  private readonly MAX_HISTORY = 50;

  recordLogin(userId: string, record: LoginRecord): void {
    const history = this.loginHistory.get(userId) ?? [];
    history.unshift(record);
    if (history.length > this.MAX_HISTORY) history.pop();
    this.loginHistory.set(userId, history);
  }

  assessLoginRisk(userId: string, context: LoginContext): RiskAssessment {
    const history = this.loginHistory.get(userId) ?? [];
    let score = 0;
    const factors: string[] = [];

    // Factor 1: New country
    if (context.country && history.length > 0) {
      const knownCountries = new Set(history.map(h => h.country).filter(Boolean));
      if (!knownCountries.has(context.country)) {
        score += 30;
        factors.push(`Login from new country: ${context.country}`);
      }
    }

    // Factor 2: Impossible travel
    const lastLogin = history.find(h => h.success);
    if (lastLogin && context.country && lastLogin.country &&
        context.country !== lastLogin.country) {
      const timeDiffHours = (context.timestamp.getTime() - lastLogin.timestamp.getTime()) / 3600000;
      if (timeDiffHours < 2) {
        score += 50;
        factors.push(`Impossible travel: country change in ${timeDiffHours.toFixed(1)} hours`);
      }
    }

    // Factor 3: New User-Agent (new device)
    if (history.length > 0) {
      const knownUAs = new Set(history.map(h => h.userAgent));
      if (!knownUAs.has(context.userAgent)) {
        score += 20;
        factors.push('Login from new/unknown device');
      }
    }

    // Factor 4: Unusual time (outside 6am–11pm)
    const hour = context.timestamp.getHours();
    if (hour < 6 || hour > 23) {
      score += 15;
      factors.push(`Login at unusual hour: ${hour}:00`);
    }

    // Factor 5: Multiple recent failures
    const recentFailures = history.filter(h =>
      !h.success &&
      context.timestamp.getTime() - h.timestamp.getTime() < 15 * 60 * 1000
    ).length;
    if (recentFailures >= 3) {
      score += 25;
      factors.push(`${recentFailures} failed attempts in last 15 minutes`);
    }

    const level = score >= 70 ? 'CRITICAL' : score >= 40 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'LOW';
    const action: RiskAction = score >= 70 ? 'BLOCK' : score >= 40 ? 'CHALLENGE' : score >= 20 ? 'NOTIFY' : 'ALLOW';

    return { score: Math.min(100, score), level, action, factors };
  }

  getHistory(userId: string): LoginRecord[] {
    return [...(this.loginHistory.get(userId) ?? [])];
  }

  getRecentFailures(userId: string, windowMs = 15 * 60 * 1000): number {
    const now = Date.now();
    return (this.loginHistory.get(userId) ?? []).filter(
      h => !h.success && now - h.timestamp.getTime() < windowMs
    ).length;
  }

  clearHistory(userId: string): void {
    this.loginHistory.delete(userId);
  }
}
