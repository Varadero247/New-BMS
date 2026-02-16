export function calculateRiskScore(likelihood: number, severity: number): number {
  return Math.max(1, Math.min(5, likelihood)) * Math.max(1, Math.min(5, severity));
}

export function getRiskLevel(score: number): string {
  if (score <= 2) return 'VERY_LOW';
  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 14) return 'HIGH';
  if (score <= 19) return 'VERY_HIGH';
  return 'UNACCEPTABLE';
}

export function calculateWelPercentage(result: number, welLimit: number): number {
  if (!welLimit || welLimit <= 0) return 0;
  return Math.round((result / welLimit) * 100 * 10) / 10;
}

export function getWelStatus(percentage: number): string {
  if (percentage >= 100) return 'ABOVE_WEL';
  if (percentage >= 90) return 'AT_WEL';
  return 'BELOW_WEL';
}
