/**
 * Quality Metrics Calculations (ISO 9001)
 */

export interface QualityMetricsInput {
  preventionCost: number;
  appraisalCost: number;
  internalFailureCost: number;
  externalFailureCost: number;
  totalUnits: number;
  defectiveUnits: number;
  defectOpportunities: number;
}

export interface QualityMetricsOutput {
  totalCOPQ: number;
  dpmo: number;
  firstPassYield: number;
  processSigma: number;
  defectRate: number;
}

/**
 * Calculate Cost of Poor Quality (COPQ)
 * Formula: Prevention + Appraisal + Internal Failure + External Failure
 * @param prevention - Prevention costs (training, planning, etc.)
 * @param appraisal - Appraisal costs (inspection, testing, etc.)
 * @param internalFailure - Internal failure costs (rework, scrap, etc.)
 * @param externalFailure - External failure costs (warranties, returns, etc.)
 * @returns Total COPQ
 */
export function calculateCOPQ(
  prevention: number,
  appraisal: number,
  internalFailure: number,
  externalFailure: number
): number {
  return prevention + appraisal + internalFailure + externalFailure;
}

/**
 * Calculate COPQ breakdown percentages
 */
export function calculateCOPQBreakdown(
  prevention: number,
  appraisal: number,
  internalFailure: number,
  externalFailure: number
): {
  prevention: number;
  appraisal: number;
  internalFailure: number;
  externalFailure: number;
  total: number;
  conformanceCost: number;
  nonConformanceCost: number;
} {
  const total = calculateCOPQ(prevention, appraisal, internalFailure, externalFailure);
  const conformanceCost = prevention + appraisal;
  const nonConformanceCost = internalFailure + externalFailure;

  return {
    prevention: total > 0 ? Number(((prevention / total) * 100).toFixed(1)) : 0,
    appraisal: total > 0 ? Number(((appraisal / total) * 100).toFixed(1)) : 0,
    internalFailure: total > 0 ? Number(((internalFailure / total) * 100).toFixed(1)) : 0,
    externalFailure: total > 0 ? Number(((externalFailure / total) * 100).toFixed(1)) : 0,
    total,
    conformanceCost,
    nonConformanceCost,
  };
}

/**
 * Calculate Defects Per Million Opportunities (DPMO)
 * Formula: (Defects x 1,000,000) / (Units x Opportunities)
 * @param defects - Number of defects found
 * @param units - Total units produced
 * @param opportunities - Number of defect opportunities per unit
 * @returns DPMO value
 */
export function calculateDPMO(defects: number, units: number, opportunities: number): number {
  if (units <= 0 || opportunities <= 0) return 0;
  return Math.round((defects * 1_000_000) / (units * opportunities));
}

/**
 * Calculate First Pass Yield (FPY)
 * Formula: ((Total Units - Defective Units) / Total Units) x 100
 * @param totalUnits - Total units produced
 * @param defectiveUnits - Number of defective units
 * @returns First pass yield percentage
 */
export function calculateFPY(totalUnits: number, defectiveUnits: number): number {
  if (totalUnits <= 0) return 0;
  return Number((((totalUnits - defectiveUnits) / totalUnits) * 100).toFixed(2));
}

/**
 * Calculate Rolled Throughput Yield (RTY)
 * Formula: FPY1 x FPY2 x FPY3 x ... x FPYn
 * @param yields - Array of individual process yields (as percentages)
 * @returns Rolled throughput yield percentage
 */
export function calculateRTY(yields: number[]): number {
  if (yields.length === 0) return 0;
  const product = yields.reduce((acc, y) => acc * (y / 100), 1);
  return Number((product * 100).toFixed(2));
}

/**
 * DPMO to Sigma Level lookup table
 */
const SIGMA_TABLE: Array<{ dpmo: number; sigma: number }> = [
  { dpmo: 933193, sigma: 0 },
  { dpmo: 691462, sigma: 0.5 },
  { dpmo: 500000, sigma: 1.0 },
  { dpmo: 308538, sigma: 1.5 },
  { dpmo: 158655, sigma: 2.0 },
  { dpmo: 66807, sigma: 2.5 },
  { dpmo: 22750, sigma: 3.0 },
  { dpmo: 6210, sigma: 3.5 },
  { dpmo: 1350, sigma: 4.0 },
  { dpmo: 233, sigma: 4.5 },
  { dpmo: 32, sigma: 5.0 },
  { dpmo: 3.4, sigma: 5.5 },
  { dpmo: 0.29, sigma: 6.0 },
];

/**
 * Calculate Process Sigma from DPMO
 * @param dpmo - Defects Per Million Opportunities
 * @returns Sigma level (0-6)
 */
export function calculateSigma(dpmo: number): number {
  if (dpmo >= 933193) return 0;
  if (dpmo <= 0.29) return 6;

  // Find the two closest entries and interpolate
  for (let i = 0; i < SIGMA_TABLE.length - 1; i++) {
    if (dpmo <= SIGMA_TABLE[i].dpmo && dpmo >= SIGMA_TABLE[i + 1].dpmo) {
      const upper = SIGMA_TABLE[i];
      const lower = SIGMA_TABLE[i + 1];
      const ratio = (upper.dpmo - dpmo) / (upper.dpmo - lower.dpmo);
      return Number((upper.sigma + ratio * (lower.sigma - upper.sigma)).toFixed(2));
    }
  }

  return 3.0; // Default to 3 sigma
}

/**
 * Calculate Defect Rate
 * Formula: (Defective Units / Total Units) x 100
 * @param defectiveUnits - Number of defective units
 * @param totalUnits - Total units produced
 * @returns Defect rate percentage
 */
export function calculateDefectRate(defectiveUnits: number, totalUnits: number): number {
  if (totalUnits <= 0) return 0;
  return Number(((defectiveUnits / totalUnits) * 100).toFixed(2));
}

/**
 * Calculate all quality metrics
 * @param input - Quality metrics input data
 * @returns All calculated quality metrics
 */
export function calculateQualityMetrics(input: QualityMetricsInput): QualityMetricsOutput {
  const {
    preventionCost,
    appraisalCost,
    internalFailureCost,
    externalFailureCost,
    totalUnits,
    defectiveUnits,
    defectOpportunities,
  } = input;

  const totalCOPQ = calculateCOPQ(preventionCost, appraisalCost, internalFailureCost, externalFailureCost);
  const dpmo = calculateDPMO(defectiveUnits, totalUnits, defectOpportunities);
  const firstPassYield = calculateFPY(totalUnits, defectiveUnits);
  const processSigma = calculateSigma(dpmo);
  const defectRate = calculateDefectRate(defectiveUnits, totalUnits);

  return {
    totalCOPQ,
    dpmo,
    firstPassYield,
    processSigma,
    defectRate,
  };
}

/**
 * Get quality metric status (RAG rating)
 * @param metricType - Type of metric
 * @param value - Metric value
 * @param target - Target value
 * @returns Status (GREEN, AMBER, RED)
 */
export function getQualityMetricStatus(
  metricType: 'dpmo' | 'fpy' | 'sigma' | 'defectRate',
  value: number,
  target: number
): 'GREEN' | 'AMBER' | 'RED' {
  // For metrics where lower is better
  if (metricType === 'dpmo' || metricType === 'defectRate') {
    if (value <= target) return 'GREEN';
    if (value <= target * 1.5) return 'AMBER';
    return 'RED';
  }

  // For metrics where higher is better
  if (value >= target) return 'GREEN';
  if (value >= target * 0.9) return 'AMBER';
  return 'RED';
}
