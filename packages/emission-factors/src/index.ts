// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export { DEFRA_FACTORS } from './defra';
export { EPA_FACTORS } from './epa';
export { IEA_GRID_FACTORS, getGridFactor } from './iea';
export { calculateEmission, getEmissionFactor, convertUnits } from './calculator';
export type {
  EmissionScope,
  FuelType,
  FactorSet,
  EmissionFactor,
  EmissionResult,
  ElectricityGrid,
  GridFactor,
} from './types';
