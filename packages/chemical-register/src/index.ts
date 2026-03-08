// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * @ims/chemical-register
 *
 * Shared domain types, constants, and pure utility functions for the
 * Chemical Register module (COSHH / GHS / WEL / SDS lifecycle management).
 *
 * No external dependencies — all logic is pure and side-effect-free.
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export type GhsPictogram =
  | 'GHS01_EXPLOSIVE'
  | 'GHS02_FLAMMABLE'
  | 'GHS03_OXIDISING'
  | 'GHS04_GAS_UNDER_PRESSURE'
  | 'GHS05_CORROSIVE'
  | 'GHS06_TOXIC'
  | 'GHS07_IRRITANT_HARMFUL'
  | 'GHS08_HEALTH_HAZARD'
  | 'GHS09_ENVIRONMENTAL';

export type SignalWord = 'DANGER' | 'WARNING' | 'NONE';

export type PhysicalState =
  | 'GAS'
  | 'LIQUID'
  | 'SOLID_FINE_POWDER'
  | 'SOLID_COARSE_POWDER'
  | 'SOLID_GRANULES'
  | 'SOLID_BULK'
  | 'AEROSOL'
  | 'PASTE';

export type StorageClass =
  | 'CLASS_1_EXPLOSIVES'
  | 'CLASS_2_FLAMMABLE_GAS'
  | 'CLASS_3_FLAMMABLE_LIQUID'
  | 'CLASS_4_FLAMMABLE_SOLID'
  | 'CLASS_5_OXIDISING'
  | 'CLASS_6_TOXIC'
  | 'CLASS_7_RADIOACTIVE'
  | 'CLASS_8_CORROSIVE'
  | 'CLASS_9_OTHER_HAZARDOUS'
  | 'NON_HAZARDOUS';

export type WasteClass =
  | 'NON_HAZARDOUS'
  | 'HAZARDOUS'
  | 'SPECIAL'
  | 'CLINICAL'
  | 'RADIOACTIVE';

export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | 'UNACCEPTABLE';
export type WelStatus = 'BELOW_WEL' | 'AT_WEL' | 'ABOVE_WEL';
export type SdsStatus = 'CURRENT' | 'UNDER_REVIEW' | 'SUPERSEDED' | 'ARCHIVED';
export type CoshhStatus = 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'SUPERSEDED' | 'ARCHIVED';
export type MonitoringResult = 'PASS' | 'ADVISORY' | 'FAIL';
export type DisposalRoute =
  | 'LICENSED_CONTRACTOR'
  | 'HAZARDOUS_WASTE_SITE'
  | 'DRAIN_DILUTED'
  | 'INCINERATION'
  | 'RECYCLING'
  | 'RETURN_TO_SUPPLIER';

// ---------------------------------------------------------------------------
// GHS Pictogram metadata
// ---------------------------------------------------------------------------

export interface PictogramMeta {
  code: GhsPictogram;
  label: string;
  hazardClass: string;
  /** Minimum signal word associated with this pictogram */
  minSignalWord: SignalWord;
}

export const GHS_PICTOGRAMS: Record<GhsPictogram, PictogramMeta> = {
  GHS01_EXPLOSIVE: {
    code: 'GHS01_EXPLOSIVE',
    label: 'Exploding Bomb',
    hazardClass: 'Explosives / Self-reactive / Organic peroxides',
    minSignalWord: 'DANGER',
  },
  GHS02_FLAMMABLE: {
    code: 'GHS02_FLAMMABLE',
    label: 'Flame',
    hazardClass: 'Flammable gases/liquids/solids/pyrophoric',
    minSignalWord: 'DANGER',
  },
  GHS03_OXIDISING: {
    code: 'GHS03_OXIDISING',
    label: 'Flame Over Circle',
    hazardClass: 'Oxidising gases/liquids/solids',
    minSignalWord: 'DANGER',
  },
  GHS04_GAS_UNDER_PRESSURE: {
    code: 'GHS04_GAS_UNDER_PRESSURE',
    label: 'Gas Cylinder',
    hazardClass: 'Gases under pressure',
    minSignalWord: 'WARNING',
  },
  GHS05_CORROSIVE: {
    code: 'GHS05_CORROSIVE',
    label: 'Corrosion',
    hazardClass: 'Skin/eye corrosion, metals corrosive',
    minSignalWord: 'DANGER',
  },
  GHS06_TOXIC: {
    code: 'GHS06_TOXIC',
    label: 'Skull and Crossbones',
    hazardClass: 'Acute toxicity (fatal/toxic)',
    minSignalWord: 'DANGER',
  },
  GHS07_IRRITANT_HARMFUL: {
    code: 'GHS07_IRRITANT_HARMFUL',
    label: 'Exclamation Mark',
    hazardClass: 'Harmful/irritant/skin/respiratory sensitiser',
    minSignalWord: 'WARNING',
  },
  GHS08_HEALTH_HAZARD: {
    code: 'GHS08_HEALTH_HAZARD',
    label: 'Health Hazard',
    hazardClass: 'Carcinogen/mutagen/reproductive/STOT',
    minSignalWord: 'DANGER',
  },
  GHS09_ENVIRONMENTAL: {
    code: 'GHS09_ENVIRONMENTAL',
    label: 'Environment',
    hazardClass: 'Aquatic/environmental hazard',
    minSignalWord: 'WARNING',
  },
};

// ---------------------------------------------------------------------------
// Storage class compatibility matrix
// ---------------------------------------------------------------------------

/**
 * Returns true when the two storage classes must NOT be co-located
 * (simplified incompatibility rules derived from TRGS 510).
 */
export function areStorageClassesIncompatible(a: StorageClass, b: StorageClass): boolean {
  if (a === b) return false;
  const incompatible: Partial<Record<StorageClass, StorageClass[]>> = {
    CLASS_1_EXPLOSIVES: [
      'CLASS_2_FLAMMABLE_GAS',
      'CLASS_3_FLAMMABLE_LIQUID',
      'CLASS_5_OXIDISING',
      'CLASS_7_RADIOACTIVE',
    ],
    CLASS_2_FLAMMABLE_GAS: [
      'CLASS_1_EXPLOSIVES',
      'CLASS_3_FLAMMABLE_LIQUID',
      'CLASS_5_OXIDISING',
    ],
    CLASS_3_FLAMMABLE_LIQUID: [
      'CLASS_1_EXPLOSIVES',
      'CLASS_2_FLAMMABLE_GAS',
      'CLASS_5_OXIDISING',
    ],
    CLASS_5_OXIDISING: [
      'CLASS_1_EXPLOSIVES',
      'CLASS_2_FLAMMABLE_GAS',
      'CLASS_3_FLAMMABLE_LIQUID',
      'CLASS_4_FLAMMABLE_SOLID',
      'CLASS_6_TOXIC',
    ],
    CLASS_7_RADIOACTIVE: ['CLASS_1_EXPLOSIVES', 'CLASS_2_FLAMMABLE_GAS'],
  };
  return (incompatible[a] ?? []).includes(b) || (incompatible[b] ?? []).includes(a);
}

// ---------------------------------------------------------------------------
// Risk scoring (COSHH 5 × 5 matrix)
// ---------------------------------------------------------------------------

/**
 * Calculates a COSHH risk score (1–25) from likelihood and severity (both 1–5).
 * Values are clamped to the valid range.
 */
export function calculateRiskScore(likelihood: number, severity: number): number {
  const l = Math.max(1, Math.min(5, Math.round(likelihood)));
  const s = Math.max(1, Math.min(5, Math.round(severity)));
  return l * s;
}

/** Maps a risk score (1–25) to a named risk level. */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= 2) return 'VERY_LOW';
  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 14) return 'HIGH';
  if (score <= 19) return 'VERY_HIGH';
  return 'UNACCEPTABLE';
}

/** Returns a numeric sort weight for a risk level (higher = more severe). */
export function riskLevelWeight(level: RiskLevel): number {
  const w: Record<RiskLevel, number> = {
    VERY_LOW: 1,
    LOW: 2,
    MEDIUM: 3,
    HIGH: 4,
    VERY_HIGH: 5,
    UNACCEPTABLE: 6,
  };
  return w[level];
}

// ---------------------------------------------------------------------------
// WEL (Workplace Exposure Limit) utilities
// ---------------------------------------------------------------------------

/**
 * Calculates the percentage of a measurement result against a WEL limit.
 * Returns 0 if welLimit is zero or negative.
 * Result is rounded to 1 decimal place.
 */
export function calculateWelPercentage(result: number, welLimit: number): number {
  if (!welLimit || welLimit <= 0) return 0;
  return Math.round((result / welLimit) * 100 * 10) / 10;
}

/** Maps a WEL percentage to an action status. */
export function getWelStatus(percentage: number): WelStatus {
  if (percentage >= 100) return 'ABOVE_WEL';
  if (percentage >= 90) return 'AT_WEL';
  return 'BELOW_WEL';
}

/** Determines monitoring result from WEL status. */
export function welStatusToMonitoringResult(status: WelStatus): MonitoringResult {
  if (status === 'ABOVE_WEL') return 'FAIL';
  if (status === 'AT_WEL') return 'ADVISORY';
  return 'PASS';
}

// ---------------------------------------------------------------------------
// SDS lifecycle utilities
// ---------------------------------------------------------------------------

export interface SdsLifecycle {
  /** Most recent revision date */
  revisionDate: Date;
  /** Target review interval in months (default 36) */
  reviewIntervalMonths?: number;
}

/**
 * Calculates the next SDS review date.
 * Default review interval is 36 months (3 years).
 */
export function calculateSdsNextReviewDate(lifecycle: SdsLifecycle): Date {
  const months = lifecycle.reviewIntervalMonths ?? 36;
  const next = new Date(lifecycle.revisionDate);
  next.setMonth(next.getMonth() + months);
  return next;
}

/** Returns true if the SDS next review date is within `daysAhead` from now. */
export function isSdsNearingReview(lifecycle: SdsLifecycle, daysAhead = 30, now = new Date()): boolean {
  const nextReview = calculateSdsNextReviewDate(lifecycle);
  const diffMs = nextReview.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= daysAhead;
}

/** Returns true if the SDS is past its review date. */
export function isSdsOverdue(lifecycle: SdsLifecycle, now = new Date()): boolean {
  return calculateSdsNextReviewDate(lifecycle).getTime() < now.getTime();
}

// ---------------------------------------------------------------------------
// Stock / inventory utilities
// ---------------------------------------------------------------------------

export interface InventoryItem {
  quantityOnHand: number;
  minStockLevel: number | null;
  expiryDate: Date | null;
}

/** Returns true if stock is at or below the minimum stock level. */
export function isLowStock(item: InventoryItem): boolean {
  if (item.minStockLevel === null) return false;
  return item.quantityOnHand <= item.minStockLevel;
}

/** Returns true if the item is expired as of `now`. */
export function isExpired(item: InventoryItem, now = new Date()): boolean {
  if (!item.expiryDate) return false;
  return item.expiryDate.getTime() < now.getTime();
}

/**
 * Returns true if the item's expiry date falls within `daysAhead` from now.
 * Items that are already expired are NOT included (use isExpired for those).
 */
export function isExpiringWithin(item: InventoryItem, daysAhead = 60, now = new Date()): boolean {
  if (!item.expiryDate) return false;
  const diffMs = item.expiryDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= daysAhead;
}

// ---------------------------------------------------------------------------
// Reference number generation
// ---------------------------------------------------------------------------

/** Generates a Chemical Register reference number: CHEM-YYYY-NNN */
export function generateChemRef(year: number, sequence: number): string {
  return `CHEM-${year}-${String(sequence).padStart(3, '0')}`;
}

/** Generates a COSHH assessment reference: COSHH-YYYY-NNN */
export function generateCoshhRef(year: number, sequence: number): string {
  return `COSHH-${year}-${String(sequence).padStart(3, '0')}`;
}

/** Generates an SDS reference: SDS-YYYY-NNN */
export function generateSdsRef(year: number, sequence: number): string {
  return `SDS-${year}-${String(sequence).padStart(3, '0')}`;
}

// ---------------------------------------------------------------------------
// CAS number validation
// ---------------------------------------------------------------------------

/**
 * Validates a CAS Registry Number using the official check-digit algorithm.
 * Format: XXXXXXX-XX-X (segments of 2–7, 2, 1 digits separated by hyphens).
 */
export function isValidCasNumber(cas: string): boolean {
  if (!cas) return false;
  const clean = cas.replace(/-/g, '');
  if (!/^\d{5,10}$/.test(clean)) return false;

  const digits = clean.split('').map(Number);
  const checkDigit = digits[digits.length - 1];
  const body = digits.slice(0, -1).reverse();
  const sum = body.reduce((acc, d, i) => acc + d * (i + 1), 0);
  return sum % 10 === checkDigit;
}

// ---------------------------------------------------------------------------
// Disposal route determination (heuristic)
// ---------------------------------------------------------------------------

/**
 * Returns a recommended disposal route based on storage class and waste class.
 * This is a heuristic only — final disposal decisions require regulatory review.
 */
export function recommendDisposalRoute(
  storageClass: StorageClass,
  wasteClass: WasteClass
): DisposalRoute {
  if (wasteClass === 'RADIOACTIVE') return 'LICENSED_CONTRACTOR';
  if (wasteClass === 'CLINICAL') return 'INCINERATION';
  if (
    storageClass === 'CLASS_1_EXPLOSIVES' ||
    storageClass === 'CLASS_7_RADIOACTIVE'
  ) return 'LICENSED_CONTRACTOR';
  if (
    storageClass === 'CLASS_2_FLAMMABLE_GAS' ||
    storageClass === 'CLASS_3_FLAMMABLE_LIQUID'
  ) return 'HAZARDOUS_WASTE_SITE';
  if (storageClass === 'CLASS_5_OXIDISING') return 'HAZARDOUS_WASTE_SITE';
  if (wasteClass === 'HAZARDOUS' || wasteClass === 'SPECIAL') return 'HAZARDOUS_WASTE_SITE';
  return 'LICENSED_CONTRACTOR';
}

// ---------------------------------------------------------------------------
// COSHH exposure score — aggregate from multiple tasks
// ---------------------------------------------------------------------------

export interface ExposureTask {
  durationMinutesPerDay: number;
  frequencyDaysPerWeek: number;
  concentrationMgM3: number;
}

/**
 * Calculates an 8-hour TWA (Time Weighted Average) equivalent in mg/m³
 * for a list of exposure tasks in a working day.
 *
 * Formula: Σ(duration_h × concentration) / 8
 */
export function calculateTwa(tasks: ExposureTask[]): number {
  if (tasks.length === 0) return 0;
  const totalExposure = tasks.reduce((sum, t) => {
    const durationHours = t.durationMinutesPerDay / 60;
    return sum + durationHours * t.concentrationMgM3;
  }, 0);
  return Math.round((totalExposure / 8) * 1000) / 1000;
}
