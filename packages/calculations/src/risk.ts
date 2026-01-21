export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Calculate risk score using L x S x D formula
 * @param likelihood - Likelihood of occurrence (1-5)
 * @param severity - Severity of impact (1-5)
 * @param detectability - Detectability (1-5), optional, defaults to 1
 * @returns Risk score
 */
export function calculateRiskScore(
  likelihood: number,
  severity: number,
  detectability: number = 1
): number {
  // Validate inputs
  const l = Math.max(1, Math.min(5, likelihood));
  const s = Math.max(1, Math.min(5, severity));
  const d = Math.max(1, Math.min(5, detectability));

  return l * s * d;
}

/**
 * Get risk level from risk score
 * @param score - Risk score
 * @returns Risk level (LOW, MEDIUM, HIGH, CRITICAL)
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= 8) return 'LOW';
  if (score <= 27) return 'MEDIUM';
  if (score <= 64) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Get risk color from risk score
 * @param score - Risk score
 * @returns Hex color string
 */
export function getRiskColor(score: number): string {
  if (score <= 8) return '#22c55e'; // green - low
  if (score <= 27) return '#eab308'; // yellow - medium
  if (score <= 64) return '#f97316'; // orange - high
  return '#ef4444'; // red - critical
}

/**
 * Get risk level from risk score using 5x5 matrix (L x S only)
 * @param likelihood - Likelihood (1-5)
 * @param severity - Severity (1-5)
 * @returns Risk level
 */
export function getRiskLevelFromMatrix(likelihood: number, severity: number): RiskLevel {
  const score = likelihood * severity;

  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 15) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Calculate residual risk after controls
 * @param initialScore - Initial risk score
 * @param controlEffectiveness - Control effectiveness percentage (0-100)
 * @returns Residual risk score
 */
export function calculateResidualRisk(
  initialScore: number,
  controlEffectiveness: number
): number {
  const effectiveness = Math.max(0, Math.min(100, controlEffectiveness));
  return Math.round(initialScore * (1 - effectiveness / 100));
}

/**
 * Get risk matrix cell data
 * Returns a 5x5 matrix with cell properties
 */
export function getRiskMatrixData(): {
  cells: Array<{
    likelihood: number;
    severity: number;
    score: number;
    level: RiskLevel;
    color: string;
  }>;
} {
  const cells = [];

  for (let l = 1; l <= 5; l++) {
    for (let s = 1; s <= 5; s++) {
      const score = l * s;
      cells.push({
        likelihood: l,
        severity: s,
        score,
        level: getRiskLevelFromMatrix(l, s),
        color: getRiskColor(score),
      });
    }
  }

  return { cells };
}
