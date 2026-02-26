export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type MatrixDimension = 1 | 2 | 3 | 4 | 5;

export interface RiskCell {
  likelihood: MatrixDimension;
  impact: MatrixDimension;
  score: number;
  level: RiskLevel;
}

export interface RiskMatrix {
  size: 3 | 4 | 5;
  cells: RiskCell[][];
  thresholds: { low: number; medium: number; high: number };
}

export interface MatrixEntry {
  id: string;
  likelihood: MatrixDimension;
  impact: MatrixDimension;
  score: number;
  level: RiskLevel;
}

export interface MatrixSummary {
  total: number;
  byLevel: Record<RiskLevel, number>;
  averageScore: number;
  maxScore: number;
  distribution: Record<RiskLevel, number>;  // percentage
}
