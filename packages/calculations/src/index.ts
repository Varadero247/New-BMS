// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// Risk calculations
export {
  calculateRiskScore,
  getRiskLevel,
  getRiskColor,
  getRiskLevelFromMatrix,
  getRiskColorFromMatrix,
  calculateResidualRisk,
  getRiskMatrixData,
  type RiskLevel,
} from './risk';

// Safety calculations (ISO 45001)
export {
  calculateLTIFR,
  calculateTRIR,
  calculateSeverityRate,
  calculateNearMissRate,
  calculateSafetyMetrics,
  predictIncidentPyramid,
  getSafetyMetricStatus,
  HEINRICH_RATIOS,
  type SafetyMetricsInput,
  type SafetyMetricsOutput,
} from './safety';

// Quality calculations (ISO 9001)
export {
  calculateCOPQ,
  calculateCOPQBreakdown,
  calculateDPMO,
  calculateFPY,
  calculateRTY,
  calculateSigma,
  calculateDefectRate,
  calculateQualityMetrics,
  getQualityMetricStatus,
  type QualityMetricsInput,
  type QualityMetricsOutput,
} from './quality';

// Environmental calculations (ISO 14001)
export {
  calculateSignificance,
  getSignificanceLevel,
  getSignificanceColor,
  isSignificant,
  calculateAspectSignificance,
  calculateCarbonFootprint,
  calculateWasteDiversionRate,
  ASPECT_TYPES,
  ENVIRONMENTAL_MEDIA,
  type SignificanceLevel,
  type AspectSignificanceInput,
  type AspectSignificanceOutput,
  type AspectType,
  type EnvironmentalMedia,
} from './environment';
