// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { FuelType, FactorSet, EmissionResult, EmissionFactor } from './types';
import { DEFRA_FACTORS } from './defra';
import { EPA_FACTORS } from './epa';

const FACTOR_SETS: Record<FactorSet, EmissionFactor[]> = {
  DEFRA: DEFRA_FACTORS,
  EPA: EPA_FACTORS,
  IEA: [], // IEA factors are grid-specific, use getGridFactor instead
};

// Unit conversion factors (to base unit for each fuel type)
const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  volume: {
    litre: 1,
    gallon: 3.78541,
    m3: 1000,
    ft3: 28.3168,
  },
  mass: {
    kg: 1,
    tonne: 1000,
    lb: 0.453592,
    ton_us: 907.185,
  },
  energy: {
    kWh: 1,
    MWh: 1000,
    GJ: 277.778,
    therm: 29.3071,
  },
  distance: {
    km: 1,
    mile: 1.60934,
    m: 0.001,
  },
};

/**
 * Get the emission factor for a given fuel type and factor set.
 * @param fuelType - Type of fuel or activity
 * @param factorSet - Factor set to use (DEFRA, EPA)
 * @returns The emission factor or undefined
 */
export function getEmissionFactor(
  fuelType: FuelType,
  factorSet: FactorSet = 'DEFRA'
): EmissionFactor | undefined {
  const factors = FACTOR_SETS[factorSet];
  if (!factors) return undefined;
  return factors.find((f) => f.type === fuelType);
}

/**
 * Convert between units of the same category.
 * @param value - Value to convert
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Converted value
 */
export function convertUnits(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return value;

  for (const category of Object.values(UNIT_CONVERSIONS)) {
    if (category[fromUnit] !== undefined && category[toUnit] !== undefined) {
      return (value * category[fromUnit]) / category[toUnit];
    }
  }

  throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}: incompatible units`);
}

/**
 * Calculate CO2e emissions for a given fuel/activity.
 * @param fuelType - Type of fuel or activity
 * @param quantity - Quantity consumed
 * @param unit - Unit of the quantity
 * @param factorSet - Which factor set to use
 * @returns Emission result with CO2e and metadata
 */
export function calculateEmission(
  fuelType: FuelType,
  quantity: number,
  unit: string,
  factorSet: FactorSet = 'DEFRA'
): EmissionResult {
  const factor = getEmissionFactor(fuelType, factorSet);
  if (!factor) {
    throw new Error(`No emission factor found for ${fuelType} in ${factorSet}`);
  }

  // Convert quantity to the factor's base unit if needed
  let convertedQuantity = quantity;
  if (unit !== factor.unit) {
    convertedQuantity = convertUnits(quantity, unit, factor.unit);
  }

  const co2e = convertedQuantity * factor.factor;

  return {
    co2e: Math.round(co2e * 1000) / 1000,
    scope: factor.scope,
    source: factorSet,
    fuelType,
    quantity,
    unit,
  };
}
