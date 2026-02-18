import { GridFactor } from './types';

/**
 * IEA Global Grid Emission Factors by Country (2024 estimates).
 * Source: International Energy Agency.
 * Factor in kgCO2e per kWh.
 */
export const IEA_GRID_FACTORS: GridFactor[] = [
  { country: 'United Kingdom', countryCode: 'GB', factor: 0.207, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'United States', countryCode: 'US', factor: 0.371, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Australia', countryCode: 'AU', factor: 0.656, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Canada', countryCode: 'CA', factor: 0.12, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Germany', countryCode: 'DE', factor: 0.338, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'France', countryCode: 'FR', factor: 0.052, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'China', countryCode: 'CN', factor: 0.555, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'India', countryCode: 'IN', factor: 0.708, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Japan', countryCode: 'JP', factor: 0.457, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'South Korea', countryCode: 'KR', factor: 0.415, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Brazil', countryCode: 'BR', factor: 0.074, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'South Africa', countryCode: 'ZA', factor: 0.928, unit: 'kgCO2e/kWh', year: 2024 },
  {
    country: 'United Arab Emirates',
    countryCode: 'AE',
    factor: 0.404,
    unit: 'kgCO2e/kWh',
    year: 2024,
  },
  { country: 'Saudi Arabia', countryCode: 'SA', factor: 0.625, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Norway', countryCode: 'NO', factor: 0.008, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Sweden', countryCode: 'SE', factor: 0.013, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Italy', countryCode: 'IT', factor: 0.233, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Spain', countryCode: 'ES', factor: 0.149, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Poland', countryCode: 'PL', factor: 0.635, unit: 'kgCO2e/kWh', year: 2024 },
  { country: 'Mexico', countryCode: 'MX', factor: 0.423, unit: 'kgCO2e/kWh', year: 2024 },
];

/**
 * Get the grid emission factor for a specific country.
 * @param countryCode - ISO 2-letter country code
 * @returns Grid factor or undefined if country not found
 */
export function getGridFactor(countryCode: string): GridFactor | undefined {
  return IEA_GRID_FACTORS.find((f) => f.countryCode === countryCode.toUpperCase());
}
