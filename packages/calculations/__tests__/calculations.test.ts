/**
 * Unit tests for @ims/calculations package
 * Covers risk, safety, quality, and environmental calculation functions.
 */

import {
  calculateRiskScore,
  getRiskLevel,
  getRiskColor,
  getRiskLevelFromMatrix,
  getRiskColorFromMatrix,
  calculateResidualRisk,
  getRiskMatrixData,
} from '../src/risk';

import {
  calculateLTIFR,
  calculateTRIR,
  calculateSeverityRate,
  calculateNearMissRate,
  calculateSafetyMetrics,
  predictIncidentPyramid,
  getSafetyMetricStatus,
  HEINRICH_RATIOS,
} from '../src/safety';

import {
  calculateCOPQ,
  calculateCOPQBreakdown,
  calculateDPMO,
  calculateFPY,
  calculateRTY,
  calculateSigma,
  calculateDefectRate,
  calculateQualityMetrics,
  getQualityMetricStatus,
} from '../src/quality';

import {
  calculateSignificance,
  getSignificanceLevel,
  getSignificanceColor,
  isSignificant,
  calculateAspectSignificance,
  calculateCarbonFootprint,
  calculateWasteDiversionRate,
  ASPECT_TYPES,
  ENVIRONMENTAL_MEDIA,
} from '../src/environment';

// ============================================================
// Risk calculations
// ============================================================

describe('calculateRiskScore', () => {
  it('should return L × S when no detectability given', () => {
    expect(calculateRiskScore(3, 4)).toBe(12);
  });

  it('should return L × S × D when detectability given', () => {
    expect(calculateRiskScore(2, 3, 4)).toBe(24);
  });

  it('should clamp inputs to 1–5 range (low)', () => {
    expect(calculateRiskScore(0, 0, 0)).toBe(1); // 1 × 1 × 1
  });

  it('should clamp inputs to 1–5 range (high)', () => {
    expect(calculateRiskScore(10, 10, 10)).toBe(125); // 5 × 5 × 5
  });

  it('should return 1 for minimum inputs', () => {
    expect(calculateRiskScore(1, 1, 1)).toBe(1);
  });

  it('should return 125 for maximum inputs', () => {
    expect(calculateRiskScore(5, 5, 5)).toBe(125);
  });
});

describe('getRiskLevel', () => {
  it('returns LOW for score ≤ 8', () => {
    expect(getRiskLevel(1)).toBe('LOW');
    expect(getRiskLevel(8)).toBe('LOW');
  });

  it('returns MEDIUM for score ≤ 27', () => {
    expect(getRiskLevel(9)).toBe('MEDIUM');
    expect(getRiskLevel(27)).toBe('MEDIUM');
  });

  it('returns HIGH for score ≤ 64', () => {
    expect(getRiskLevel(28)).toBe('HIGH');
    expect(getRiskLevel(64)).toBe('HIGH');
  });

  it('returns CRITICAL for score > 64', () => {
    expect(getRiskLevel(65)).toBe('CRITICAL');
    expect(getRiskLevel(125)).toBe('CRITICAL');
  });
});

describe('getRiskColor', () => {
  it('returns green for LOW scores', () => {
    expect(getRiskColor(8)).toBe('#22c55e');
  });

  it('returns yellow for MEDIUM scores', () => {
    expect(getRiskColor(9)).toBe('#eab308');
  });

  it('returns orange for HIGH scores', () => {
    expect(getRiskColor(28)).toBe('#f97316');
  });

  it('returns red for CRITICAL scores', () => {
    expect(getRiskColor(65)).toBe('#ef4444');
  });
});

describe('getRiskLevelFromMatrix', () => {
  it('returns LOW for L×S ≤ 4', () => {
    expect(getRiskLevelFromMatrix(1, 4)).toBe('LOW');
    expect(getRiskLevelFromMatrix(2, 2)).toBe('LOW');
  });

  it('returns MEDIUM for L×S ≤ 9', () => {
    expect(getRiskLevelFromMatrix(3, 3)).toBe('MEDIUM');
    expect(getRiskLevelFromMatrix(1, 9)).toBe('MEDIUM');
  });

  it('returns HIGH for L×S ≤ 15', () => {
    expect(getRiskLevelFromMatrix(3, 4)).toBe('HIGH');
    expect(getRiskLevelFromMatrix(3, 5)).toBe('HIGH');
  });

  it('returns CRITICAL for L×S > 15', () => {
    expect(getRiskLevelFromMatrix(4, 4)).toBe('CRITICAL');
    expect(getRiskLevelFromMatrix(5, 5)).toBe('CRITICAL');
  });
});

describe('calculateResidualRisk', () => {
  it('reduces risk by given effectiveness percentage', () => {
    expect(calculateResidualRisk(100, 50)).toBe(50);
  });

  it('reduces to 0 with 100% effectiveness', () => {
    expect(calculateResidualRisk(25, 100)).toBe(0);
  });

  it('does not reduce with 0% effectiveness', () => {
    expect(calculateResidualRisk(25, 0)).toBe(25);
  });

  it('clamps effectiveness to 100', () => {
    expect(calculateResidualRisk(100, 150)).toBe(0);
  });

  it('clamps effectiveness to 0', () => {
    expect(calculateResidualRisk(50, -10)).toBe(50);
  });
});

describe('getRiskColorFromMatrix', () => {
  it('returns green for L×S ≤ 4', () => {
    expect(getRiskColorFromMatrix(1, 4)).toBe('#22c55e');
  });

  it('returns red for L×S > 16', () => {
    expect(getRiskColorFromMatrix(5, 5)).toBe('#ef4444');
  });
});

describe('getRiskMatrixData', () => {
  it('returns 25 cells for 5×5 matrix', () => {
    const { cells } = getRiskMatrixData();
    expect(cells).toHaveLength(25);
  });

  it('each cell has required properties', () => {
    const { cells } = getRiskMatrixData();
    for (const cell of cells) {
      expect(cell).toHaveProperty('likelihood');
      expect(cell).toHaveProperty('severity');
      expect(cell).toHaveProperty('score');
      expect(cell).toHaveProperty('level');
      expect(cell).toHaveProperty('color');
      expect(cell.score).toBe(cell.likelihood * cell.severity);
    }
  });
});

// ============================================================
// Safety calculations
// ============================================================

describe('calculateLTIFR', () => {
  it('calculates LTIFR correctly', () => {
    // 2 LTIs, 1,000,000 hours → LTIFR = 2.00
    expect(calculateLTIFR(2, 1_000_000)).toBe(2.0);
  });

  it('returns 0 when no hours worked', () => {
    expect(calculateLTIFR(5, 0)).toBe(0);
  });

  it('handles fractional result', () => {
    // 1 LTI, 500,000 hours → 2.00
    expect(calculateLTIFR(1, 500_000)).toBe(2.0);
  });
});

describe('calculateTRIR', () => {
  it('calculates TRIR using 200,000 base hours', () => {
    // 5 injuries, 200,000 hours → TRIR = 5.00
    expect(calculateTRIR(5, 200_000)).toBe(5.0);
  });

  it('returns 0 when no hours worked', () => {
    expect(calculateTRIR(3, 0)).toBe(0);
  });
});

describe('calculateSeverityRate', () => {
  it('calculates severity rate correctly', () => {
    expect(calculateSeverityRate(5, 1_000_000)).toBe(5.0);
  });

  it('returns 0 when no hours worked', () => {
    expect(calculateSeverityRate(10, 0)).toBe(0);
  });
});

describe('calculateNearMissRate', () => {
  it('calculates near miss rate correctly', () => {
    expect(calculateNearMissRate(10, 200_000)).toBe(10.0);
  });
});

describe('calculateSafetyMetrics', () => {
  it('calculates all required metrics', () => {
    const result = calculateSafetyMetrics({
      hoursWorked: 1_000_000,
      lostTimeInjuries: 2,
      totalRecordableInjuries: 5,
      daysLost: 20,
      nearMisses: 50,
      firstAidCases: 10,
    });

    expect(result.ltifr).toBe(2.0);
    expect(result.trir).toBe(1.0);
    expect(result.severityRate).toBe(20.0);
    expect(typeof result.nearMissRate).toBe('number');
    expect(typeof result.firstAidRate).toBe('number');
  });

  it('omits nearMissRate and firstAidRate when not provided', () => {
    const result = calculateSafetyMetrics({
      hoursWorked: 500_000,
      lostTimeInjuries: 1,
      totalRecordableInjuries: 2,
      daysLost: 5,
    });

    expect(result.nearMissRate).toBeUndefined();
    expect(result.firstAidRate).toBeUndefined();
  });
});

describe('HEINRICH_RATIOS', () => {
  it('has correct ratios', () => {
    expect(HEINRICH_RATIOS.majorInjury).toBe(1);
    expect(HEINRICH_RATIOS.minorInjury).toBe(29);
    expect(HEINRICH_RATIOS.nearMiss).toBe(300);
  });
});

describe('predictIncidentPyramid', () => {
  it('predicts correct numbers for 1 major injury', () => {
    const result = predictIncidentPyramid(1);
    expect(result.majorInjuries).toBe(1);
    expect(result.minorInjuries).toBe(29);
    expect(result.nearMisses).toBe(300);
  });

  it('scales proportionally for 3 major injuries', () => {
    const result = predictIncidentPyramid(3);
    expect(result.majorInjuries).toBe(3);
    expect(result.minorInjuries).toBe(87);
    expect(result.nearMisses).toBe(900);
  });
});

describe('getSafetyMetricStatus', () => {
  it('returns GREEN when value is 75% or less of benchmark', () => {
    expect(getSafetyMetricStatus('ltifr', 0.5, 1.0)).toBe('GREEN');
  });

  it('returns AMBER when value is within 125% of benchmark', () => {
    expect(getSafetyMetricStatus('ltifr', 1.0, 1.0)).toBe('AMBER');
  });

  it('returns RED when value exceeds 125% of benchmark', () => {
    expect(getSafetyMetricStatus('ltifr', 2.0, 1.0)).toBe('RED');
  });
});

// ============================================================
// Quality calculations
// ============================================================

describe('calculateCOPQ', () => {
  it('sums all four cost categories', () => {
    expect(calculateCOPQ(100, 200, 300, 400)).toBe(1000);
  });

  it('returns 0 when all costs are 0', () => {
    expect(calculateCOPQ(0, 0, 0, 0)).toBe(0);
  });
});

describe('calculateCOPQBreakdown', () => {
  it('calculates percentages correctly', () => {
    const result = calculateCOPQBreakdown(250, 250, 250, 250);
    expect(result.prevention).toBe(25.0);
    expect(result.appraisal).toBe(25.0);
    expect(result.internalFailure).toBe(25.0);
    expect(result.externalFailure).toBe(25.0);
    expect(result.total).toBe(1000);
  });

  it('returns 0 percentages when total is 0', () => {
    const result = calculateCOPQBreakdown(0, 0, 0, 0);
    expect(result.prevention).toBe(0);
    expect(result.total).toBe(0);
  });

  it('splits conformance vs non-conformance costs', () => {
    const result = calculateCOPQBreakdown(100, 200, 300, 400);
    expect(result.conformanceCost).toBe(300);
    expect(result.nonConformanceCost).toBe(700);
  });
});

describe('calculateDPMO', () => {
  it('calculates DPMO correctly', () => {
    // 10 defects, 100 units, 1 opportunity each → DPMO = 100,000
    expect(calculateDPMO(10, 100, 1)).toBe(100_000);
  });

  it('returns 0 when units is 0', () => {
    expect(calculateDPMO(5, 0, 1)).toBe(0);
  });

  it('returns 0 when opportunities is 0', () => {
    expect(calculateDPMO(5, 100, 0)).toBe(0);
  });
});

describe('calculateFPY', () => {
  it('calculates first pass yield correctly', () => {
    // 90 good out of 100 = 90%
    expect(calculateFPY(100, 10)).toBe(90.0);
  });

  it('returns 100% when no defectives', () => {
    expect(calculateFPY(100, 0)).toBe(100.0);
  });

  it('returns 0 when totalUnits is 0', () => {
    expect(calculateFPY(0, 0)).toBe(0);
  });
});

describe('calculateRTY', () => {
  it('multiplies process yields correctly', () => {
    // 90% × 90% × 90% = 72.9%
    const result = calculateRTY([90, 90, 90]);
    expect(result).toBeCloseTo(72.9, 1);
  });

  it('returns 0 for empty array', () => {
    expect(calculateRTY([])).toBe(0);
  });

  it('returns 100 for single 100% process', () => {
    expect(calculateRTY([100])).toBe(100.0);
  });
});

describe('calculateSigma', () => {
  it('returns 6 for near-zero DPMO', () => {
    expect(calculateSigma(0)).toBe(6);
  });

  it('returns 0 for very high DPMO', () => {
    expect(calculateSigma(1_000_000)).toBe(0);
  });

  it('returns approximately 3.0 for 22,750 DPMO (classic 3-sigma)', () => {
    const sigma = calculateSigma(22_750);
    expect(sigma).toBeGreaterThanOrEqual(2.9);
    expect(sigma).toBeLessThanOrEqual(3.1);
  });
});

describe('calculateDefectRate', () => {
  it('calculates defect rate percentage', () => {
    expect(calculateDefectRate(5, 100)).toBe(5.0);
  });

  it('returns 0 when totalUnits is 0', () => {
    expect(calculateDefectRate(0, 0)).toBe(0);
  });
});

describe('calculateQualityMetrics', () => {
  it('returns all required quality metric fields', () => {
    const result = calculateQualityMetrics({
      preventionCost: 1000,
      appraisalCost: 2000,
      internalFailureCost: 3000,
      externalFailureCost: 4000,
      totalUnits: 1000,
      defectiveUnits: 50,
      defectOpportunities: 5,
    });

    expect(typeof result.totalCOPQ).toBe('number');
    expect(typeof result.dpmo).toBe('number');
    expect(typeof result.firstPassYield).toBe('number');
    expect(typeof result.processSigma).toBe('number');
    expect(typeof result.defectRate).toBe('number');
    expect(result.totalCOPQ).toBe(10_000);
    expect(result.firstPassYield).toBe(95.0);
    expect(result.defectRate).toBe(5.0);
  });
});

describe('getQualityMetricStatus', () => {
  it('returns GREEN for DPMO at or below target', () => {
    expect(getQualityMetricStatus('dpmo', 100, 200)).toBe('GREEN');
  });

  it('returns AMBER for DPMO slightly above target', () => {
    expect(getQualityMetricStatus('dpmo', 250, 200)).toBe('AMBER');
  });

  it('returns RED for DPMO far above target', () => {
    expect(getQualityMetricStatus('dpmo', 500, 200)).toBe('RED');
  });

  it('returns GREEN for FPY at or above target', () => {
    expect(getQualityMetricStatus('fpy', 95, 90)).toBe('GREEN');
  });

  it('returns AMBER for FPY slightly below target', () => {
    // 85 is 94.4% of 90 — within 90% threshold
    expect(getQualityMetricStatus('fpy', 85, 90)).toBe('AMBER');
  });

  it('returns RED for FPY far below target', () => {
    expect(getQualityMetricStatus('fpy', 50, 90)).toBe('RED');
  });
});

// ============================================================
// Environmental calculations
// ============================================================

describe('calculateSignificance', () => {
  it('calculates base score as scale × frequency × legal', () => {
    // 3 × 3 × 3 = 27
    expect(calculateSignificance({ scale: 3, frequency: 3, legalImpact: 3 })).toBe(27);
  });

  it('clamps inputs to 1–5 range', () => {
    // 5 × 5 × 5 = 125
    expect(calculateSignificance({ scale: 10, frequency: 10, legalImpact: 10 })).toBe(125);
    // 1 × 1 × 1 = 1
    expect(calculateSignificance({ scale: 0, frequency: 0, legalImpact: 0 })).toBe(1);
  });

  it('applies reversibility modifier when provided', () => {
    const base = calculateSignificance({ scale: 3, frequency: 3, legalImpact: 3 });
    const withR = calculateSignificance({
      scale: 3,
      frequency: 3,
      legalImpact: 3,
      reversibility: 5,
    });
    // With high reversibility, score should be higher than base
    expect(withR).toBeGreaterThan(base);
  });
});

describe('getSignificanceLevel', () => {
  it('returns NEGLIGIBLE for score ≤ 8', () => {
    expect(getSignificanceLevel(1)).toBe('NEGLIGIBLE');
    expect(getSignificanceLevel(8)).toBe('NEGLIGIBLE');
  });

  it('returns LOW for score ≤ 27', () => {
    expect(getSignificanceLevel(9)).toBe('LOW');
    expect(getSignificanceLevel(27)).toBe('LOW');
  });

  it('returns MODERATE for score ≤ 64', () => {
    expect(getSignificanceLevel(28)).toBe('MODERATE');
    expect(getSignificanceLevel(64)).toBe('MODERATE');
  });

  it('returns HIGH for score ≤ 100', () => {
    expect(getSignificanceLevel(65)).toBe('HIGH');
    expect(getSignificanceLevel(100)).toBe('HIGH');
  });

  it('returns CRITICAL for score > 100', () => {
    expect(getSignificanceLevel(101)).toBe('CRITICAL');
  });
});

describe('getSignificanceColor', () => {
  it('returns slate for negligible scores', () => {
    expect(getSignificanceColor(8)).toBe('#94a3b8');
  });

  it('returns green for low scores', () => {
    expect(getSignificanceColor(27)).toBe('#22c55e');
  });

  it('returns yellow for moderate scores', () => {
    expect(getSignificanceColor(64)).toBe('#eab308');
  });

  it('returns orange for high scores', () => {
    expect(getSignificanceColor(100)).toBe('#f97316');
  });

  it('returns red for critical scores', () => {
    expect(getSignificanceColor(101)).toBe('#ef4444');
  });
});

describe('isSignificant', () => {
  it('returns false for score at or below threshold (27)', () => {
    expect(isSignificant(27)).toBe(false);
  });

  it('returns true for score above threshold', () => {
    expect(isSignificant(28)).toBe(true);
  });

  it('uses custom threshold when provided', () => {
    expect(isSignificant(50, 60)).toBe(false);
    expect(isSignificant(61, 60)).toBe(true);
  });
});

describe('calculateAspectSignificance', () => {
  it('returns complete output object', () => {
    const result = calculateAspectSignificance({
      scale: 3,
      frequency: 3,
      legalImpact: 3,
    });

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('level');
    expect(result).toHaveProperty('isSignificant');
    expect(result).toHaveProperty('color');
    expect(result.score).toBe(27);
    expect(result.level).toBe('LOW');
    expect(result.isSignificant).toBe(false);
  });

  it('returns significant=true for high-scoring aspects', () => {
    const result = calculateAspectSignificance({
      scale: 5,
      frequency: 5,
      legalImpact: 5,
    });
    expect(result.isSignificant).toBe(true);
    expect(result.level).toBe('CRITICAL');
  });
});

describe('calculateCarbonFootprint', () => {
  it('returns 0 for empty emissions object', () => {
    expect(calculateCarbonFootprint({})).toBe(0);
  });

  it('converts CO2 kg to tonnes', () => {
    expect(calculateCarbonFootprint({ co2: 1000 })).toBe(1.0);
  });

  it('applies GWP factor for methane', () => {
    // 1 kg CH4 × 28 GWP = 28 kg CO2e = 0.028 tonnes
    expect(calculateCarbonFootprint({ methane: 1 })).toBe(0.03); // rounded
  });

  it('sums multiple emission sources', () => {
    const result = calculateCarbonFootprint({
      co2: 1000, // 1 tonne
      diesel: 1000, // 1000L × 2.68 = 2680 kg = 2.68 tonnes
    });
    expect(result).toBeCloseTo(3.68, 2);
  });
});

describe('calculateWasteDiversionRate', () => {
  it('calculates diversion rate correctly', () => {
    // 75 diverted, 25 landfill = 75%
    expect(calculateWasteDiversionRate(25, 25, 25, 25)).toBe(75.0);
  });

  it('returns 100% when no landfill', () => {
    expect(calculateWasteDiversionRate(100, 0, 0, 0)).toBe(100.0);
  });

  it('returns 0% when all goes to landfill', () => {
    expect(calculateWasteDiversionRate(0, 0, 0, 100)).toBe(0.0);
  });

  it('returns 0 for all-zero inputs', () => {
    expect(calculateWasteDiversionRate(0, 0, 0, 0)).toBe(0);
  });
});

describe('ASPECT_TYPES and ENVIRONMENTAL_MEDIA constants', () => {
  it('ASPECT_TYPES contains expected types', () => {
    expect(ASPECT_TYPES).toContain('EMISSIONS_TO_AIR');
    expect(ASPECT_TYPES).toContain('WASTE_GENERATION');
    expect(ASPECT_TYPES).toContain('ENERGY_USE');
    expect(ASPECT_TYPES).toContain('WATER_USE');
  });

  it('ENVIRONMENTAL_MEDIA contains expected media', () => {
    expect(ENVIRONMENTAL_MEDIA).toContain('AIR');
    expect(ENVIRONMENTAL_MEDIA).toContain('WATER');
    expect(ENVIRONMENTAL_MEDIA).toContain('LAND');
  });
});
