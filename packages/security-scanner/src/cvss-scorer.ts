export type AttackVector = 'NETWORK' | 'ADJACENT' | 'LOCAL' | 'PHYSICAL';
export type AttackComplexity = 'LOW' | 'HIGH';
export type PrivilegesRequired = 'NONE' | 'LOW' | 'HIGH';
export type UserInteraction = 'NONE' | 'REQUIRED';
export type Scope = 'UNCHANGED' | 'CHANGED';
export type Impact = 'NONE' | 'LOW' | 'HIGH';

export interface CVSSv3Metrics {
  attackVector: AttackVector;
  attackComplexity: AttackComplexity;
  privilegesRequired: PrivilegesRequired;
  userInteraction: UserInteraction;
  scope: Scope;
  confidentialityImpact: Impact;
  integrityImpact: Impact;
  availabilityImpact: Impact;
}

export interface CVSSv3Score {
  baseScore: number;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vector: string;
  impactSubscore: number;
  exploitabilitySubscore: number;
}

export class CVSSScorer {
  private readonly AV: Record<AttackVector, number> = { NETWORK: 0.85, ADJACENT: 0.62, LOCAL: 0.55, PHYSICAL: 0.2 };
  private readonly AC: Record<AttackComplexity, number> = { LOW: 0.77, HIGH: 0.44 };
  private readonly PR_UNCHANGED: Record<PrivilegesRequired, number> = { NONE: 0.85, LOW: 0.62, HIGH: 0.27 };
  private readonly PR_CHANGED: Record<PrivilegesRequired, number> = { NONE: 0.85, LOW: 0.68, HIGH: 0.50 };
  private readonly UI: Record<UserInteraction, number> = { NONE: 0.85, REQUIRED: 0.62 };
  private readonly IMP: Record<Impact, number> = { NONE: 0, LOW: 0.22, HIGH: 0.56 };

  score(m: CVSSv3Metrics): CVSSv3Score {
    const av = this.AV[m.attackVector];
    const ac = this.AC[m.attackComplexity];
    const pr = m.scope === 'CHANGED' ? this.PR_CHANGED[m.privilegesRequired] : this.PR_UNCHANGED[m.privilegesRequired];
    const ui = this.UI[m.userInteraction];

    const iC = this.IMP[m.confidentialityImpact];
    const iI = this.IMP[m.integrityImpact];
    const iA = this.IMP[m.availabilityImpact];

    const iss = 1 - (1 - iC) * (1 - iI) * (1 - iA);
    let impact: number;
    if (m.scope === 'UNCHANGED') {
      impact = 6.42 * iss;
    } else {
      impact = 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15);
    }
    const exploitability = 8.22 * av * ac * pr * ui;

    let baseScore: number;
    if (impact <= 0) {
      baseScore = 0;
    } else if (m.scope === 'UNCHANGED') {
      baseScore = Math.min(impact + exploitability, 10);
    } else {
      baseScore = Math.min(1.08 * (impact + exploitability), 10);
    }
    baseScore = Math.round(baseScore * 10) / 10;

    const impactSubscore = Math.round(impact * 10) / 10;
    const exploitabilitySubscore = Math.round(exploitability * 10) / 10;

    const severity = baseScore === 0 ? 'NONE'
      : baseScore < 4.0 ? 'LOW'
      : baseScore < 7.0 ? 'MEDIUM'
      : baseScore < 9.0 ? 'HIGH'
      : 'CRITICAL';

    const vector = `CVSS:3.1/AV:${m.attackVector[0]}/AC:${m.attackComplexity[0]}/PR:${m.privilegesRequired[0]}/UI:${m.userInteraction[0]}/S:${m.scope[0]}/C:${m.confidentialityImpact[0]}/I:${m.integrityImpact[0]}/A:${m.availabilityImpact[0]}`;

    return { baseScore, severity, vector, impactSubscore, exploitabilitySubscore };
  }

  getSeverity(score: number): CVSSv3Score['severity'] {
    if (score === 0) return 'NONE';
    if (score < 4.0) return 'LOW';
    if (score < 7.0) return 'MEDIUM';
    if (score < 9.0) return 'HIGH';
    return 'CRITICAL';
  }

  isCritical(s: CVSSv3Score): boolean { return s.severity === 'CRITICAL'; }
  isExploitable(s: CVSSv3Score): boolean { return s.exploitabilitySubscore > 2.0; }
}
