import { MatrixDimension, MatrixEntry, MatrixSummary, RiskCell, RiskLevel, RiskMatrix } from './types';

export const DEFAULT_THRESHOLDS = { low: 4, medium: 9, high: 16 };

export function computeRiskScore(likelihood: MatrixDimension, impact: MatrixDimension): number {
  return likelihood * impact;
}

export function scoreToRiskLevel(score: number, thresholds = DEFAULT_THRESHOLDS): RiskLevel {
  if (score <= thresholds.low) return 'low';
  if (score <= thresholds.medium) return 'medium';
  if (score <= thresholds.high) return 'high';
  return 'critical';
}

export function buildRiskMatrix(size: 3 | 4 | 5 = 5, thresholds = DEFAULT_THRESHOLDS): RiskMatrix {
  const cells: RiskCell[][] = [];
  for (let l = 1; l <= size; l++) {
    const row: RiskCell[] = [];
    for (let i = 1; i <= size; i++) {
      const score = computeRiskScore(l as MatrixDimension, i as MatrixDimension);
      row.push({ likelihood: l as MatrixDimension, impact: i as MatrixDimension, score, level: scoreToRiskLevel(score, thresholds) });
    }
    cells.push(row);
  }
  return { size, cells, thresholds };
}

export function getCell(matrix: RiskMatrix, likelihood: MatrixDimension, impact: MatrixDimension): RiskCell | undefined {
  return matrix.cells[likelihood - 1]?.[impact - 1];
}

export function classifyRisk(likelihood: MatrixDimension, impact: MatrixDimension, thresholds = DEFAULT_THRESHOLDS): RiskLevel {
  return scoreToRiskLevel(computeRiskScore(likelihood, impact), thresholds);
}

export function summariseEntries(entries: MatrixEntry[]): MatrixSummary {
  const byLevel: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  let totalScore = 0;
  let maxScore = 0;
  for (const e of entries) {
    byLevel[e.level]++;
    totalScore += e.score;
    if (e.score > maxScore) maxScore = e.score;
  }
  const total = entries.length;
  const distribution: Record<RiskLevel, number> = {
    low: total > 0 ? (byLevel.low / total) * 100 : 0,
    medium: total > 0 ? (byLevel.medium / total) * 100 : 0,
    high: total > 0 ? (byLevel.high / total) * 100 : 0,
    critical: total > 0 ? (byLevel.critical / total) * 100 : 0,
  };
  return { total, byLevel, averageScore: total > 0 ? totalScore / total : 0, maxScore, distribution };
}

export function makeEntry(id: string, likelihood: MatrixDimension, impact: MatrixDimension, thresholds = DEFAULT_THRESHOLDS): MatrixEntry {
  const score = computeRiskScore(likelihood, impact);
  return { id, likelihood, impact, score, level: scoreToRiskLevel(score, thresholds) };
}

export function filterByLevel(entries: MatrixEntry[], level: RiskLevel): MatrixEntry[] {
  return entries.filter(e => e.level === level);
}

export function sortByScore(entries: MatrixEntry[], direction: 'asc' | 'desc' = 'desc'): MatrixEntry[] {
  return [...entries].sort((a, b) => direction === 'asc' ? a.score - b.score : b.score - a.score);
}

export function isValidDimension(n: number): n is MatrixDimension {
  return [1, 2, 3, 4, 5].includes(n);
}

export function isValidLevel(l: string): l is RiskLevel {
  return ['low', 'medium', 'high', 'critical'].includes(l);
}

export function maxPossibleScore(size: 3 | 4 | 5): number {
  return size * size;
}

export function minPossibleScore(): number {
  return 1;
}

export function heatmapColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
  }
}

export function riskPriority(level: RiskLevel): number {
  switch (level) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
  }
}
