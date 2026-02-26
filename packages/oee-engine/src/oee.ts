// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { OEEInput, OEEResult, OEECategory } from './types';

/**
 * Calculate Overall Equipment Effectiveness (OEE).
 *
 * OEE = Availability x Performance x Quality
 *
 * - Availability = (Planned Time - Downtime) / Planned Time
 * - Performance = (Ideal Cycle Time x Total Pieces) / Run Time
 * - Quality = Good Pieces / Total Pieces
 *
 * @param input - OEE calculation inputs
 * @returns Complete OEE result with breakdown
 */
export function calculateOEE(input: OEEInput): OEEResult {
  const { plannedProductionTime, downtime, idealCycleTime, totalPieces, goodPieces } = input;

  if (plannedProductionTime <= 0) throw new Error('Planned production time must be positive');
  if (downtime < 0) throw new Error('Downtime must be non-negative');
  if (downtime > plannedProductionTime)
    throw new Error('Downtime cannot exceed planned production time');
  if (idealCycleTime <= 0) throw new Error('Ideal cycle time must be positive');
  if (totalPieces < 0) throw new Error('Total pieces must be non-negative');
  if (goodPieces < 0) throw new Error('Good pieces must be non-negative');
  if (goodPieces > totalPieces) throw new Error('Good pieces cannot exceed total pieces');

  const runTime = plannedProductionTime - downtime;

  // Availability
  const availability = runTime / plannedProductionTime;

  // Performance (capped at 1.0 to handle measurement inaccuracies)
  const performance = runTime > 0 ? Math.min((idealCycleTime * totalPieces) / runTime, 1.0) : 0;

  // Quality
  const quality = totalPieces > 0 ? goodPieces / totalPieces : 0;

  // OEE
  const oee = availability * performance * quality;

  return {
    availability: Math.round(availability * 10000) / 10000,
    performance: Math.round(performance * 10000) / 10000,
    quality: Math.round(quality * 10000) / 10000,
    oee: Math.round(oee * 10000) / 10000,
    oeePercent: `${(oee * 100).toFixed(1)}%`,
    category: getOEECategory(oee),
    isWorldClass: isWorldClass(oee),
    runTime,
    defectPieces: totalPieces - goodPieces,
  };
}

/**
 * Calculate Mean Time Between Failures (MTBF).
 * @param failures - Number of failures in the period
 * @param operatingHours - Total operating hours in the period
 * @returns MTBF in hours
 */
export function calculateMTBF(failures: number, operatingHours: number): number {
  if (failures < 0) throw new Error('Failures must be non-negative');
  if (operatingHours < 0) throw new Error('Operating hours must be non-negative');
  if (failures === 0) return Infinity;
  return operatingHours / failures;
}

/**
 * Calculate Mean Time To Repair (MTTR).
 * @param repairTimes - Array of repair durations in hours
 * @returns Average repair time in hours
 */
export function calculateMTTR(repairTimes: number[]): number {
  if (repairTimes.length === 0) return 0;
  if (repairTimes.some((t) => t < 0)) throw new Error('Repair times must be non-negative');
  const total = repairTimes.reduce((sum, t) => sum + t, 0);
  return total / repairTimes.length;
}

/**
 * Check if OEE qualifies as world-class (>= 85%).
 * @param oee - OEE value (0-1)
 * @returns true if world-class
 */
export function isWorldClass(oee: number): boolean {
  return oee >= 0.85;
}

/**
 * Categorize OEE into performance tiers.
 * @param oee - OEE value (0-1)
 * @returns Category string
 */
export function getOEECategory(oee: number): OEECategory {
  if (oee >= 0.85) return 'world-class';
  if (oee >= 0.75) return 'good';
  if (oee >= 0.65) return 'average';
  if (oee >= 0.5) return 'below-average';
  return 'poor';
}
