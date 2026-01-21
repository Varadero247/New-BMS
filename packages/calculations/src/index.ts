// Risk calculations
export {
  calculateRiskScore,
  getRiskLevel,
  getRiskColor,
  getRiskLevelFromMatrix,
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
