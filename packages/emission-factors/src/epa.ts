// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { EmissionFactor } from './types';

/**
 * US EPA Emission Factors Hub 2024.
 * Factors converted to consistent units (kgCO2e).
 */
export const EPA_FACTORS: EmissionFactor[] = [
  // Scope 1 - Stationary combustion
  {
    type: 'natural_gas',
    factor: 1.885,
    unit: 'm3',
    co2eUnit: 'kgCO2e',
    scope: 'scope1',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'diesel',
    factor: 2.697,
    unit: 'litre',
    co2eUnit: 'kgCO2e',
    scope: 'scope1',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'petrol',
    factor: 2.348,
    unit: 'litre',
    co2eUnit: 'kgCO2e',
    scope: 'scope1',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'lpg',
    factor: 1.534,
    unit: 'litre',
    co2eUnit: 'kgCO2e',
    scope: 'scope1',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'coal',
    factor: 2.423,
    unit: 'kg',
    co2eUnit: 'kgCO2e',
    scope: 'scope1',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'heating_oil',
    factor: 2.543,
    unit: 'litre',
    co2eUnit: 'kgCO2e',
    scope: 'scope1',
    source: 'EPA',
    year: 2024,
  },

  // Scope 2 - US average grid
  {
    type: 'grid_electricity',
    factor: 0.371,
    unit: 'kWh',
    co2eUnit: 'kgCO2e',
    scope: 'scope2',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'renewable_electricity',
    factor: 0.0,
    unit: 'kWh',
    co2eUnit: 'kgCO2e',
    scope: 'scope2',
    source: 'EPA',
    year: 2024,
  },

  // Scope 3
  {
    type: 'waste_landfill',
    factor: 520.0,
    unit: 'tonne',
    co2eUnit: 'kgCO2e',
    scope: 'scope3',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'waste_recycled',
    factor: 18.5,
    unit: 'tonne',
    co2eUnit: 'kgCO2e',
    scope: 'scope3',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'business_travel_car',
    factor: 0.21,
    unit: 'km',
    co2eUnit: 'kgCO2e',
    scope: 'scope3',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'business_travel_air_domestic',
    factor: 0.255,
    unit: 'km',
    co2eUnit: 'kgCO2e',
    scope: 'scope3',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'business_travel_air_short',
    factor: 0.161,
    unit: 'km',
    co2eUnit: 'kgCO2e',
    scope: 'scope3',
    source: 'EPA',
    year: 2024,
  },
  {
    type: 'business_travel_air_long',
    factor: 0.201,
    unit: 'km',
    co2eUnit: 'kgCO2e',
    scope: 'scope3',
    source: 'EPA',
    year: 2024,
  },
];
