/**
 * Safety Metrics Calculations (ISO 45001)
 */

export interface SafetyMetricsInput {
  hoursWorked: number;
  lostTimeInjuries: number;
  totalRecordableInjuries: number;
  daysLost: number;
  nearMisses?: number;
  firstAidCases?: number;
}

export interface SafetyMetricsOutput {
  ltifr: number;
  trir: number;
  severityRate: number;
  nearMissRate?: number;
  firstAidRate?: number;
}

/**
 * Calculate Lost Time Injury Frequency Rate (LTIFR)
 * Formula: (Lost Time Injuries x 1,000,000) / Hours Worked
 * @param lostTimeInjuries - Number of lost time injuries
 * @param hoursWorked - Total hours worked
 * @returns LTIFR value
 */
export function calculateLTIFR(lostTimeInjuries: number, hoursWorked: number): number {
  if (hoursWorked <= 0) return 0;
  return Number(((lostTimeInjuries * 1_000_000) / hoursWorked).toFixed(2));
}

/**
 * Calculate Total Recordable Incident Rate (TRIR)
 * Formula: (Total Recordable Injuries x 200,000) / Hours Worked
 * Note: Uses OSHA standard of 200,000 hours (100 employees working 2,000 hours/year)
 * @param totalRecordableInjuries - Total recordable injuries
 * @param hoursWorked - Total hours worked
 * @returns TRIR value
 */
export function calculateTRIR(totalRecordableInjuries: number, hoursWorked: number): number {
  if (hoursWorked <= 0) return 0;
  return Number(((totalRecordableInjuries * 200_000) / hoursWorked).toFixed(2));
}

/**
 * Calculate Severity Rate
 * Formula: (Days Lost x 1,000,000) / Hours Worked
 * @param daysLost - Total days lost due to injuries
 * @param hoursWorked - Total hours worked
 * @returns Severity rate
 */
export function calculateSeverityRate(daysLost: number, hoursWorked: number): number {
  if (hoursWorked <= 0) return 0;
  return Number(((daysLost * 1_000_000) / hoursWorked).toFixed(2));
}

/**
 * Calculate Near Miss Rate
 * Formula: (Near Misses x 200,000) / Hours Worked
 * @param nearMisses - Number of near misses reported
 * @param hoursWorked - Total hours worked
 * @returns Near miss rate
 */
export function calculateNearMissRate(nearMisses: number, hoursWorked: number): number {
  if (hoursWorked <= 0) return 0;
  return Number(((nearMisses * 200_000) / hoursWorked).toFixed(2));
}

/**
 * Calculate all safety metrics
 * @param input - Safety metrics input data
 * @returns All calculated safety metrics
 */
export function calculateSafetyMetrics(input: SafetyMetricsInput): SafetyMetricsOutput {
  const { hoursWorked, lostTimeInjuries, totalRecordableInjuries, daysLost, nearMisses, firstAidCases } = input;

  const result: SafetyMetricsOutput = {
    ltifr: calculateLTIFR(lostTimeInjuries, hoursWorked),
    trir: calculateTRIR(totalRecordableInjuries, hoursWorked),
    severityRate: calculateSeverityRate(daysLost, hoursWorked),
  };

  if (nearMisses !== undefined) {
    result.nearMissRate = calculateNearMissRate(nearMisses, hoursWorked);
  }

  if (firstAidCases !== undefined) {
    result.firstAidRate = Number(((firstAidCases * 200_000) / hoursWorked).toFixed(2));
  }

  return result;
}

/**
 * Heinrich's Triangle ratios
 * For every 1 major injury, there are:
 * - 29 minor injuries
 * - 300 near misses
 */
export const HEINRICH_RATIOS = {
  majorInjury: 1,
  minorInjury: 29,
  nearMiss: 300,
};

/**
 * Calculate predicted incident pyramid based on Heinrich's Triangle
 * @param majorInjuries - Number of major injuries
 * @returns Predicted numbers based on Heinrich's ratios
 */
export function predictIncidentPyramid(majorInjuries: number): {
  majorInjuries: number;
  minorInjuries: number;
  nearMisses: number;
} {
  return {
    majorInjuries,
    minorInjuries: majorInjuries * HEINRICH_RATIOS.minorInjury,
    nearMisses: majorInjuries * HEINRICH_RATIOS.nearMiss,
  };
}

/**
 * Get safety metric status (RAG rating)
 * @param metricType - Type of metric (ltifr, trir, severityRate)
 * @param value - Metric value
 * @param industryBenchmark - Industry benchmark value
 * @returns Status (GREEN, AMBER, RED)
 */
export function getSafetyMetricStatus(
  metricType: 'ltifr' | 'trir' | 'severityRate',
  value: number,
  industryBenchmark: number
): 'GREEN' | 'AMBER' | 'RED' {
  const ratio = value / industryBenchmark;

  if (ratio <= 0.75) return 'GREEN';
  if (ratio <= 1.25) return 'AMBER';
  return 'RED';
}
