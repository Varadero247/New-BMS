export type DefectSeverity = 'critical' | 'major' | 'minor' | 'cosmetic';
export type DefectCategory = 'crack' | 'scratch' | 'dent' | 'corrosion' | 'contamination' | 'dimensional' | 'surface' | 'assembly' | 'other';
export type InspectionStatus = 'pass' | 'fail' | 'conditional' | 'pending';
export type AnalysisMode = 'defect-detection' | 'dimensional' | 'surface-quality' | 'assembly-check';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Defect {
  id: string;
  category: DefectCategory;
  severity: DefectSeverity;
  confidence: number; // 0-1
  boundingBox?: BoundingBox;
  description: string;
  area?: number; // px²
}

export interface InspectionResult {
  inspectionId: string;
  imageId: string;
  status: InspectionStatus;
  defects: Defect[];
  score: number; // 0-100
  analysedAt: string;
  processingTimeMs: number;
  mode: AnalysisMode;
}

export interface InspectionCriteria {
  maxDefects?: number;
  allowedSeverities?: DefectSeverity[];
  minScore?: number;
  mode: AnalysisMode;
}

export interface ImageMetadata {
  id: string;
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
}
