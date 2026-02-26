// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type EmissionScope = 'scope1' | 'scope2' | 'scope3';

export type FuelType =
  | 'natural_gas'
  | 'diesel'
  | 'petrol'
  | 'lpg'
  | 'coal'
  | 'heating_oil'
  | 'biodiesel'
  | 'bioethanol'
  | 'grid_electricity'
  | 'renewable_electricity'
  | 'water_supply'
  | 'water_treatment'
  | 'waste_landfill'
  | 'waste_recycled'
  | 'business_travel_car'
  | 'business_travel_rail'
  | 'business_travel_air_domestic'
  | 'business_travel_air_short'
  | 'business_travel_air_long';

export type FactorSet = 'DEFRA' | 'EPA' | 'IEA';

export interface EmissionFactor {
  type: FuelType;
  factor: number;
  unit: string;
  co2eUnit: string;
  scope: EmissionScope;
  source: FactorSet;
  year: number;
}

export interface EmissionResult {
  co2e: number;
  scope: EmissionScope;
  source: FactorSet;
  fuelType: FuelType;
  quantity: number;
  unit: string;
}

export type ElectricityGrid = string; // ISO country code

export interface GridFactor {
  country: string;
  countryCode: string;
  factor: number;
  unit: string;
  year: number;
}
