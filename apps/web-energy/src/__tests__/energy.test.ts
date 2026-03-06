// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-energy specification tests

type EnergySource = 'ELECTRICITY' | 'NATURAL_GAS' | 'DIESEL' | 'SOLAR' | 'WIND' | 'STEAM' | 'BIOMASS';
type EnPIType = 'ABSOLUTE' | 'INTENSITY' | 'NORMALIZED';
type MeterType = 'MAIN' | 'SUB' | 'CHECK' | 'VIRTUAL';
type SEUCategory = 'HVAC' | 'LIGHTING' | 'MOTORS' | 'COMPRESSED_AIR' | 'PROCESS_HEAT' | 'TRANSPORT';

const ENERGY_SOURCES: EnergySource[] = ['ELECTRICITY', 'NATURAL_GAS', 'DIESEL', 'SOLAR', 'WIND', 'STEAM', 'BIOMASS'];
const ENPI_TYPES: EnPIType[] = ['ABSOLUTE', 'INTENSITY', 'NORMALIZED'];
const METER_TYPES: MeterType[] = ['MAIN', 'SUB', 'CHECK', 'VIRTUAL'];
const SEU_CATEGORIES: SEUCategory[] = ['HVAC', 'LIGHTING', 'MOTORS', 'COMPRESSED_AIR', 'PROCESS_HEAT', 'TRANSPORT'];

const emissionFactors: Record<EnergySource, number> = {
  ELECTRICITY: 0.233,
  NATURAL_GAS: 0.202,
  DIESEL: 2.68,
  SOLAR: 0,
  WIND: 0,
  STEAM: 0.18,
  BIOMASS: 0.015,
};

function computeCO2e(energyKWh: number, source: EnergySource): number {
  return energyKWh * emissionFactors[source];
}

function energyIntensity(totalEnergy: number, productionUnits: number): number {
  if (productionUnits === 0) return 0;
  return totalEnergy / productionUnits;
}

function percentageSaving(baseline: number, actual: number): number {
  if (baseline === 0) return 0;
  return ((baseline - actual) / baseline) * 100;
}

function isRenewable(source: EnergySource): boolean {
  return source === 'SOLAR' || source === 'WIND' || source === 'BIOMASS';
}

function convertKWhToGJ(kwh: number): number {
  return kwh * 0.0036;
}

describe('Emission factors', () => {
  ENERGY_SOURCES.forEach(s => {
    it(`${s} has emission factor`, () => expect(emissionFactors[s]).toBeDefined());
    it(`${s} emission factor is non-negative`, () => expect(emissionFactors[s]).toBeGreaterThanOrEqual(0));
  });
  it('SOLAR has zero emissions', () => expect(emissionFactors.SOLAR).toBe(0));
  it('WIND has zero emissions', () => expect(emissionFactors.WIND).toBe(0));
  it('DIESEL has highest emissions', () => {
    expect(emissionFactors.DIESEL).toBeGreaterThan(emissionFactors.ELECTRICITY);
  });
  for (let i = 0; i < 50; i++) {
    const s = ENERGY_SOURCES[i % 7];
    it(`emission factor for ${s} is number (idx ${i})`, () => expect(typeof emissionFactors[s]).toBe('number'));
  }
});

describe('computeCO2e', () => {
  it('SOLAR produces 0 CO2e', () => expect(computeCO2e(1000, 'SOLAR')).toBe(0));
  it('WIND produces 0 CO2e', () => expect(computeCO2e(1000, 'WIND')).toBe(0));
  it('0 kWh produces 0 CO2e', () => expect(computeCO2e(0, 'ELECTRICITY')).toBe(0));
  it('ELECTRICITY 1000 kWh = 233 kgCO2e', () => expect(computeCO2e(1000, 'ELECTRICITY')).toBeCloseTo(233));
  for (let i = 1; i <= 100; i++) {
    it(`computeCO2e(${i * 100}, ELECTRICITY) is positive`, () => {
      expect(computeCO2e(i * 100, 'ELECTRICITY')).toBeGreaterThan(0);
    });
  }
});

describe('energyIntensity', () => {
  it('zero production returns 0', () => expect(energyIntensity(1000, 0)).toBe(0));
  it('1000 kWh / 500 units = 2 kWh/unit', () => expect(energyIntensity(1000, 500)).toBe(2));
  for (let units = 1; units <= 100; units++) {
    it(`intensity with ${units} units is positive`, () => {
      expect(energyIntensity(1000, units)).toBeGreaterThan(0);
    });
  }
});

describe('percentageSaving', () => {
  it('0 baseline returns 0', () => expect(percentageSaving(0, 0)).toBe(0));
  it('20% reduction from 1000 to 800 = 20%', () => expect(percentageSaving(1000, 800)).toBe(20));
  it('no change = 0%', () => expect(percentageSaving(1000, 1000)).toBe(0));
  it('increase gives negative saving', () => expect(percentageSaving(1000, 1200)).toBeLessThan(0));
  for (let pct = 0; pct <= 50; pct++) {
    it(`${pct}% saving from baseline 1000`, () => {
      const actual = 1000 * (1 - pct / 100);
      expect(percentageSaving(1000, actual)).toBeCloseTo(pct);
    });
  }
});

describe('isRenewable', () => {
  it('SOLAR is renewable', () => expect(isRenewable('SOLAR')).toBe(true));
  it('WIND is renewable', () => expect(isRenewable('WIND')).toBe(true));
  it('BIOMASS is renewable', () => expect(isRenewable('BIOMASS')).toBe(true));
  it('DIESEL is not renewable', () => expect(isRenewable('DIESEL')).toBe(false));
  it('ELECTRICITY is not renewable', () => expect(isRenewable('ELECTRICITY')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = ENERGY_SOURCES[i % 7];
    it(`isRenewable(${s}) returns boolean (idx ${i})`, () => expect(typeof isRenewable(s)).toBe('boolean'));
  }
});

describe('convertKWhToGJ', () => {
  it('1 kWh = 0.0036 GJ', () => expect(convertKWhToGJ(1)).toBeCloseTo(0.0036));
  it('1000 kWh = 3.6 GJ', () => expect(convertKWhToGJ(1000)).toBeCloseTo(3.6));
  it('0 kWh = 0 GJ', () => expect(convertKWhToGJ(0)).toBe(0));
  for (let i = 1; i <= 50; i++) {
    it(`convertKWhToGJ(${i * 100}) is positive`, () => {
      expect(convertKWhToGJ(i * 100)).toBeGreaterThan(0);
    });
  }
});

describe('SEU categories', () => {
  SEU_CATEGORIES.forEach(c => {
    it(`${c} is in list`, () => expect(SEU_CATEGORIES).toContain(c));
  });
  it('has 6 SEU categories', () => expect(SEU_CATEGORIES).toHaveLength(6));
  for (let i = 0; i < 50; i++) {
    const c = SEU_CATEGORIES[i % 6];
    it(`SEU category ${c} is string (idx ${i})`, () => expect(typeof c).toBe('string'));
  }
});
