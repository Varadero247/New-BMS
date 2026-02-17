// ISO 31000:2018 Risk Scoring Service

const LIKELIHOOD_MAP: Record<string, number> = {
  RARE: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, ALMOST_CERTAIN: 5,
};

const CONSEQUENCE_MAP: Record<string, number> = {
  INSIGNIFICANT: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, CATASTROPHIC: 5,
};

export function likelihoodToNum(likelihood: string): number {
  return LIKELIHOOD_MAP[likelihood] || 3;
}

export function consequenceToNum(consequence: string): number {
  return CONSEQUENCE_MAP[consequence] || 3;
}

export function numToLikelihood(n: number): string {
  const map: Record<number, string> = { 1: 'RARE', 2: 'UNLIKELY', 3: 'POSSIBLE', 4: 'LIKELY', 5: 'ALMOST_CERTAIN' };
  return map[Math.max(1, Math.min(5, n))] || 'POSSIBLE';
}

export function numToConsequence(n: number): string {
  const map: Record<number, string> = { 1: 'INSIGNIFICANT', 2: 'MINOR', 3: 'MODERATE', 4: 'MAJOR', 5: 'CATASTROPHIC' };
  return map[Math.max(1, Math.min(5, n))] || 'MODERATE';
}

export function getRiskLevel(score: number): string {
  if (score >= 20) return 'CRITICAL';
  if (score >= 15) return 'VERY_HIGH';
  if (score >= 8) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  return 'LOW';
}

export function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'CRITICAL': return '#EF4444';
    case 'VERY_HIGH': return '#F97316';
    case 'HIGH': return '#F59E0B';
    case 'MEDIUM': return '#EAB308';
    case 'LOW': return '#22C55E';
    default: return '#6B7280';
  }
}

export function calculateScore(likelihood: number, consequence: number): number {
  return Math.max(1, Math.min(5, likelihood)) * Math.max(1, Math.min(5, consequence));
}

export function getAppetiteStatus(residualScore: number, appetiteStatement: { maximumTolerableScore: number; acceptableResidualScore: number } | null): string {
  if (!appetiteStatement) return 'UNKNOWN';
  if (residualScore <= appetiteStatement.acceptableResidualScore) return 'WITHIN';
  if (residualScore <= appetiteStatement.maximumTolerableScore) return 'AT_LIMIT';
  return 'EXCEEDS';
}

const EFFECTIVENESS_MAP: Record<string, number> = {
  STRONG: 4, ADEQUATE: 3, WEAK: 2, NONE_EFFECTIVE: 1,
};

export function getControlEffectivenessOverall(controls: Array<{ effectiveness: string }>): string {
  if (!controls || controls.length === 0) return 'NONE_EFFECTIVE';
  const avg = controls.reduce((sum, c) => sum + (EFFECTIVENESS_MAP[c.effectiveness] || 1), 0) / controls.length;
  if (avg >= 3.5) return 'STRONG';
  if (avg >= 2.5) return 'ADEQUATE';
  if (avg >= 1.5) return 'WEAK';
  return 'NONE_EFFECTIVE';
}

const REDUCTION_MAP: Record<string, number> = {
  STRONG: 2, ADEQUATE: 1, WEAK: 0, NONE_EFFECTIVE: 0,
};

export function calculateResidualScores(
  inherentL: number, inherentC: number, controlEffectiveness: string
): { residualLikelihood: number; residualConsequence: number; residualScore: number } {
  const reduction = REDUCTION_MAP[controlEffectiveness] || 0;
  const residualLikelihood = Math.max(1, inherentL - reduction);
  const residualConsequence = Math.max(1, inherentC - Math.floor(reduction / 2));
  return {
    residualLikelihood,
    residualConsequence,
    residualScore: residualLikelihood * residualConsequence,
  };
}

export function mapCoshhToRisk(coshh: Record<string, unknown>): Record<string, unknown> {
  const inherentL = coshh.inherentLikelihood || 3;
  const inherentC = coshh.inherentSeverity || 3;
  const residualL = coshh.residualLikelihood || inherentL;
  const residualC = coshh.residualSeverity || inherentC;
  const inherentScore = inherentL * inherentC;
  const residualScore = residualL * residualC;
  return {
    title: `${coshh.chemicalName || coshh.substance || 'Chemical'} — ${coshh.activity || 'exposure'} risk`,
    category: 'HEALTH_SAFETY',
    sourceModule: 'CHEMICAL_COSHH',
    sourceCoshhId: coshh.id,
    inherentLikelihood: inherentL,
    inherentConsequence: inherentC,
    inherentScore,
    inherentRiskLevel: getRiskLevel(inherentScore),
    residualLikelihoodNum: residualL,
    residualConsequenceNum: residualC,
    residualScore,
    residualRiskLevel: getRiskLevel(residualScore),
    likelihood: numToLikelihood(inherentL),
    consequence: numToConsequence(inherentC),
    residualLikelihood: numToLikelihood(residualL),
    residualConsequence: numToConsequence(residualC),
    regulatoryRef: 'ISO 45001:2018 cl.6.1 / COSHH 2002',
    ownerName: coshh.assessorName || coshh.assessor,
  };
}

export function mapFraToRisk(fra: Record<string, unknown>): Record<string, unknown> {
  const inherentL = fra.likelihoodRating || 3;
  const inherentC = fra.consequenceRating || 3;
  const inherentScore = inherentL * inherentC;
  return {
    title: `${fra.premisesName || fra.premises || 'Premises'} — Fire risk`,
    category: 'HEALTH_SAFETY',
    sourceModule: 'FIRE_EMERGENCY',
    sourceFireRiskId: fra.id,
    inherentLikelihood: inherentL,
    inherentConsequence: inherentC,
    inherentScore,
    inherentRiskLevel: getRiskLevel(inherentScore),
    likelihood: numToLikelihood(inherentL),
    consequence: numToConsequence(inherentC),
    regulatoryRef: 'FSO 2005 / ISO 45001 cl.8.2',
  };
}

export function mapIncidentToRisk(incident: Record<string, unknown>): Record<string, unknown> {
  const severityMap: Record<string, number> = { MINOR: 2, MODERATE: 3, MAJOR: 4, CRITICAL: 5, CATASTROPHIC: 5 };
  const consequenceVal = severityMap[incident.severity] || 3;
  const inherentScore = 3 * consequenceVal;
  return {
    title: `${incident.title || 'Incident'} — recurrence risk`,
    category: 'HEALTH_SAFETY',
    sourceModule: 'HEALTH_SAFETY',
    sourceIncidentId: incident.id,
    inherentLikelihood: 3,
    inherentConsequence: consequenceVal,
    inherentScore,
    inherentRiskLevel: getRiskLevel(inherentScore),
    likelihood: 'POSSIBLE',
    consequence: numToConsequence(consequenceVal),
  };
}
