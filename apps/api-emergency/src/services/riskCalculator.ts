/**
 * Fire Risk Assessment Calculator
 * Matrix based on FSO 2005 guidance and PAS 79-1:2020
 */

export type FireRiskLevel = 'TRIVIAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'INTOLERABLE';

export function calculateFireRiskLevel(likelihood: number, consequence: number): FireRiskLevel {
  const score = likelihood * consequence;
  if (score <= 2) return 'TRIVIAL';
  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 14) return 'HIGH';
  if (score <= 19) return 'VERY_HIGH';
  return 'INTOLERABLE';
}

export function isDrillOverdue(
  lastDrillDate: Date | null,
  requiredFrequencyMonths: number = 6
): boolean {
  if (!lastDrillDate) return true;
  const now = new Date();
  const dueDate = new Date(lastDrillDate);
  dueDate.setMonth(dueDate.getMonth() + requiredFrequencyMonths);
  return now > dueDate;
}

export function isFraOverdue(nextReviewDate: Date): boolean {
  return new Date() > new Date(nextReviewDate);
}

export function isWardenCoverageAdequate(
  wardenCount: number,
  floorCount: number,
  occupancy: number
): boolean {
  // FSO guidance: minimum 1 warden per floor, plus 1 per 50 occupants
  const minWardensByFloors = floorCount;
  const minWardensByOccupancy = Math.ceil(occupancy / 50);
  const required = Math.max(minWardensByFloors, minWardensByOccupancy);
  return wardenCount >= required;
}

export function getNextDrillDueDate(lastDrillDate: Date | null, frequencyMonths: number = 6): Date {
  if (!lastDrillDate) return new Date();
  const next = new Date(lastDrillDate);
  next.setMonth(next.getMonth() + frequencyMonths);
  return next;
}

export function calculateRiskScore(likelihood: number, consequence: number): number {
  return likelihood * consequence;
}
