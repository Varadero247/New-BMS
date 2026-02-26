import { Defect, DefectCategory, DefectSeverity, InspectionCriteria, InspectionResult, InspectionStatus, AnalysisMode, BoundingBox, ImageMetadata } from './types';

export const SEVERITY_SCORES: Record<DefectSeverity, number> = {
  critical: 100,
  major: 60,
  minor: 25,
  cosmetic: 5,
};

export const DEFECT_CATEGORIES: DefectCategory[] = [
  'crack', 'scratch', 'dent', 'corrosion', 'contamination',
  'dimensional', 'surface', 'assembly', 'other',
];

export function isValidSeverity(s: string): s is DefectSeverity {
  return ['critical', 'major', 'minor', 'cosmetic'].includes(s);
}

export function isValidCategory(c: string): c is DefectCategory {
  return DEFECT_CATEGORIES.includes(c as DefectCategory);
}

export function isValidMode(m: string): m is AnalysisMode {
  return ['defect-detection', 'dimensional', 'surface-quality', 'assembly-check'].includes(m);
}

export function getSeverityScore(severity: DefectSeverity): number {
  return SEVERITY_SCORES[severity];
}

export function computeDefectPenalty(defect: Defect): number {
  return getSeverityScore(defect.severity) * defect.confidence;
}

export function computeInspectionScore(defects: Defect[]): number {
  if (defects.length === 0) return 100;
  const totalPenalty = defects.reduce((acc, d) => acc + computeDefectPenalty(d), 0);
  return Math.max(0, 100 - totalPenalty);
}

export function determineStatus(
  score: number,
  defects: Defect[],
  criteria: InspectionCriteria
): InspectionStatus {
  const hasCritical = defects.some((d) => d.severity === 'critical');
  if (hasCritical) return 'fail';

  const minScore = criteria.minScore ?? 70;
  if (score < minScore) return 'fail';

  const maxDefects = criteria.maxDefects ?? Infinity;
  if (defects.length > maxDefects) return 'fail';

  if (criteria.allowedSeverities) {
    const hasDisallowed = defects.some((d) => !criteria.allowedSeverities!.includes(d.severity));
    if (hasDisallowed) return 'fail';
  }

  if (score >= 90) return 'pass';
  return 'conditional';
}

export function filterDefectsByConfidence(defects: Defect[], minConfidence: number): Defect[] {
  return defects.filter((d) => d.confidence >= minConfidence);
}

export function groupDefectsBySeverity(defects: Defect[]): Record<DefectSeverity, Defect[]> {
  const result: Record<DefectSeverity, Defect[]> = { critical: [], major: [], minor: [], cosmetic: [] };
  for (const d of defects) result[d.severity].push(d);
  return result;
}

export function groupDefectsByCategory(defects: Defect[]): Partial<Record<DefectCategory, Defect[]>> {
  const result: Partial<Record<DefectCategory, Defect[]>> = {};
  for (const d of defects) {
    if (!result[d.category]) result[d.category] = [];
    result[d.category]!.push(d);
  }
  return result;
}

export function validateBoundingBox(bb: BoundingBox, image: ImageMetadata): boolean {
  return bb.x >= 0 && bb.y >= 0 && bb.x + bb.width <= image.width && bb.y + bb.height <= image.height;
}

export function computeDefectArea(bb: BoundingBox): number {
  return bb.width * bb.height;
}

export function buildInspectionResult(
  inspectionId: string,
  imageId: string,
  defects: Defect[],
  criteria: InspectionCriteria,
  processingTimeMs: number
): InspectionResult {
  const score = computeInspectionScore(defects);
  const status = determineStatus(score, defects, criteria);
  return {
    inspectionId,
    imageId,
    status,
    defects,
    score,
    analysedAt: new Date().toISOString(),
    processingTimeMs,
    mode: criteria.mode,
  };
}

export function sortDefectsBySeverity(defects: Defect[]): Defect[] {
  const order: DefectSeverity[] = ['critical', 'major', 'minor', 'cosmetic'];
  return [...defects].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
}

export function getMostSevereDefect(defects: Defect[]): Defect | null {
  if (defects.length === 0) return null;
  return sortDefectsBySeverity(defects)[0];
}

export function countBySeverity(defects: Defect[]): Record<DefectSeverity, number> {
  const counts: Record<DefectSeverity, number> = { critical: 0, major: 0, minor: 0, cosmetic: 0 };
  for (const d of defects) counts[d.severity]++;
  return counts;
}

export function averageConfidence(defects: Defect[]): number {
  if (defects.length === 0) return 0;
  return defects.reduce((a, d) => a + d.confidence, 0) / defects.length;
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}
