/**
 * Environmental Aspect Calculations (ISO 14001)
 */

export type SignificanceLevel = 'NEGLIGIBLE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface AspectSignificanceInput {
  scale: number;       // Scale of impact (1-5)
  frequency: number;   // Frequency of occurrence (1-5)
  legalImpact: number; // Legal compliance impact (1-5)
  reversibility?: number; // Reversibility of impact (1-5), optional
  stakeholderConcern?: number; // Stakeholder concern (1-5), optional
}

export interface AspectSignificanceOutput {
  score: number;
  level: SignificanceLevel;
  isSignificant: boolean;
  color: string;
}

/**
 * Calculate environmental aspect significance score
 * Formula: Scale x Frequency x Legal Impact (x optional factors)
 * @param input - Aspect significance input parameters
 * @returns Significance score
 */
export function calculateSignificance(input: AspectSignificanceInput): number {
  const { scale, frequency, legalImpact, reversibility = 1, stakeholderConcern = 1 } = input;

  // Validate and clamp inputs to 1-5 range
  const s = Math.max(1, Math.min(5, scale));
  const f = Math.max(1, Math.min(5, frequency));
  const l = Math.max(1, Math.min(5, legalImpact));
  const r = Math.max(1, Math.min(5, reversibility));
  const sc = Math.max(1, Math.min(5, stakeholderConcern));

  // Base calculation
  let score = s * f * l;

  // Apply optional factors with reduced weight
  if (reversibility !== 1) {
    score = Math.round(score * (1 + (r - 3) * 0.1));
  }
  if (stakeholderConcern !== 1) {
    score = Math.round(score * (1 + (sc - 3) * 0.1));
  }

  return score;
}

/**
 * Get significance level from score
 * @param score - Significance score
 * @returns Significance level
 */
export function getSignificanceLevel(score: number): SignificanceLevel {
  if (score <= 8) return 'NEGLIGIBLE';
  if (score <= 27) return 'LOW';
  if (score <= 64) return 'MODERATE';
  if (score <= 100) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Get significance color from score
 * @param score - Significance score
 * @returns Hex color string
 */
export function getSignificanceColor(score: number): string {
  if (score <= 8) return '#94a3b8'; // slate - negligible
  if (score <= 27) return '#22c55e'; // green - low
  if (score <= 64) return '#eab308'; // yellow - moderate
  if (score <= 100) return '#f97316'; // orange - high
  return '#ef4444'; // red - critical
}

/**
 * Determine if aspect is significant (requires action)
 * @param score - Significance score
 * @param threshold - Significance threshold (default: 27)
 * @returns Boolean indicating if aspect is significant
 */
export function isSignificant(score: number, threshold: number = 27): boolean {
  return score > threshold;
}

/**
 * Calculate complete aspect significance
 * @param input - Aspect significance input parameters
 * @returns Complete significance output
 */
export function calculateAspectSignificance(input: AspectSignificanceInput): AspectSignificanceOutput {
  const score = calculateSignificance(input);
  const level = getSignificanceLevel(score);
  const significant = isSignificant(score);
  const color = getSignificanceColor(score);

  return {
    score,
    level,
    isSignificant: significant,
    color,
  };
}

/**
 * Environmental aspect types
 */
export const ASPECT_TYPES = [
  'EMISSIONS_TO_AIR',
  'DISCHARGE_TO_WATER',
  'WASTE_GENERATION',
  'CONTAMINATION_TO_LAND',
  'RESOURCE_CONSUMPTION',
  'ENERGY_USE',
  'WATER_USE',
  'NOISE',
  'ODOUR',
  'VISUAL_IMPACT',
  'BIODIVERSITY_IMPACT',
] as const;

export type AspectType = (typeof ASPECT_TYPES)[number];

/**
 * Environmental media
 */
export const ENVIRONMENTAL_MEDIA = [
  'AIR',
  'WATER',
  'LAND',
  'GROUNDWATER',
  'SURFACE_WATER',
  'ATMOSPHERE',
  'ECOSYSTEM',
] as const;

export type EnvironmentalMedia = (typeof ENVIRONMENTAL_MEDIA)[number];

/**
 * Calculate carbon footprint equivalent
 * @param emissions - Emissions data object with quantities in kg
 * @returns Total CO2 equivalent in tonnes
 */
export function calculateCarbonFootprint(emissions: {
  co2?: number;
  methane?: number;
  nitrousOxide?: number;
  electricity?: number; // kWh
  gas?: number; // cubic meters
  diesel?: number; // liters
  petrol?: number; // liters
}): number {
  const CO2_FACTORS = {
    methane: 28, // GWP 100-year
    nitrousOxide: 298,
    electricity: 0.233, // kg CO2/kWh (UK grid average)
    gas: 2.02, // kg CO2/m3
    diesel: 2.68, // kg CO2/liter
    petrol: 2.31, // kg CO2/liter
  };

  let total = emissions.co2 || 0;
  total += (emissions.methane || 0) * CO2_FACTORS.methane;
  total += (emissions.nitrousOxide || 0) * CO2_FACTORS.nitrousOxide;
  total += (emissions.electricity || 0) * CO2_FACTORS.electricity;
  total += (emissions.gas || 0) * CO2_FACTORS.gas;
  total += (emissions.diesel || 0) * CO2_FACTORS.diesel;
  total += (emissions.petrol || 0) * CO2_FACTORS.petrol;

  // Convert to tonnes
  return Number((total / 1000).toFixed(2));
}

/**
 * Calculate waste diversion rate
 * @param recycled - Recycled waste (kg)
 * @param composted - Composted waste (kg)
 * @param recovered - Energy recovered waste (kg)
 * @param landfill - Landfill waste (kg)
 * @returns Diversion rate percentage
 */
export function calculateWasteDiversionRate(
  recycled: number,
  composted: number,
  recovered: number,
  landfill: number
): number {
  const total = recycled + composted + recovered + landfill;
  if (total <= 0) return 0;
  const diverted = recycled + composted + recovered;
  return Number(((diverted / total) * 100).toFixed(1));
}
