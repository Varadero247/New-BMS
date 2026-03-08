// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Phase 161 — Comprehensive data-integrity and computation tests for
 * @ims/emission-factors.
 *
 * Covers:
 *  - Per-factor integrity for all 19 DEFRA, 14 EPA, and 20 IEA grid factors
 *  - getEmissionFactor: lookup, default factorSet, exact values
 *  - getGridFactor: case-insensitive, known values, unknown → undefined
 *  - convertUnits: same-unit identity, cross-unit math, incompatible throws
 *  - calculateEmission: exact co2e, unit conversion path, result field shape
 *  - Cross-data invariants: counts, year, scope distribution, biofuel < fossil
 */

import {
  DEFRA_FACTORS,
  EPA_FACTORS,
  IEA_GRID_FACTORS,
  getEmissionFactor,
  getGridFactor,
  convertUnits,
  calculateEmission,
} from '../src';

// ─── helpers ────────────────────────────────────────────────────────────────

const VALID_SCOPES = new Set(['scope1', 'scope2', 'scope3']);
const VALID_FUEL_TYPES = new Set([
  'natural_gas', 'diesel', 'petrol', 'lpg', 'coal', 'heating_oil',
  'biodiesel', 'bioethanol', 'grid_electricity', 'renewable_electricity',
  'water_supply', 'water_treatment', 'waste_landfill', 'waste_recycled',
  'business_travel_car', 'business_travel_rail',
  'business_travel_air_domestic', 'business_travel_air_short', 'business_travel_air_long',
]);

// ─── DEFRA factor integrity ──────────────────────────────────────────────────

describe('DEFRA_FACTORS integrity', () => {
  for (const f of DEFRA_FACTORS) {
    describe(`DEFRA ${f.type}`, () => {
      it('source is DEFRA', () => {
        expect(f.source).toBe('DEFRA');
      });
      it('factor is a non-negative finite number', () => {
        expect(typeof f.factor).toBe('number');
        expect(Number.isFinite(f.factor)).toBe(true);
        expect(f.factor).toBeGreaterThanOrEqual(0);
      });
      it('co2eUnit is kgCO2e', () => {
        expect(f.co2eUnit).toBe('kgCO2e');
      });
      it('scope is a valid EmissionScope', () => {
        expect(VALID_SCOPES.has(f.scope)).toBe(true);
      });
      it('fuelType is a valid FuelType', () => {
        expect(VALID_FUEL_TYPES.has(f.type)).toBe(true);
      });
    });
  }
});

// ─── EPA factor integrity ────────────────────────────────────────────────────

describe('EPA_FACTORS integrity', () => {
  for (const f of EPA_FACTORS) {
    describe(`EPA ${f.type}`, () => {
      it('source is EPA', () => {
        expect(f.source).toBe('EPA');
      });
      it('factor is a non-negative finite number', () => {
        expect(typeof f.factor).toBe('number');
        expect(Number.isFinite(f.factor)).toBe(true);
        expect(f.factor).toBeGreaterThanOrEqual(0);
      });
      it('co2eUnit is kgCO2e', () => {
        expect(f.co2eUnit).toBe('kgCO2e');
      });
      it('scope is a valid EmissionScope', () => {
        expect(VALID_SCOPES.has(f.scope)).toBe(true);
      });
      it('fuelType is a valid FuelType', () => {
        expect(VALID_FUEL_TYPES.has(f.type)).toBe(true);
      });
    });
  }
});

// ─── IEA grid factor integrity ───────────────────────────────────────────────

describe('IEA_GRID_FACTORS integrity', () => {
  for (const g of IEA_GRID_FACTORS) {
    describe(`IEA grid ${g.countryCode}`, () => {
      it('countryCode is a 2-letter uppercase string', () => {
        expect(g.countryCode).toMatch(/^[A-Z]{2}$/);
      });
      it('country is a non-empty string', () => {
        expect(typeof g.country).toBe('string');
        expect(g.country.length).toBeGreaterThan(0);
      });
      it('factor is a positive finite number', () => {
        expect(typeof g.factor).toBe('number');
        expect(Number.isFinite(g.factor)).toBe(true);
        expect(g.factor).toBeGreaterThan(0);
      });
      it('unit is kgCO2e/kWh', () => {
        expect(g.unit).toBe('kgCO2e/kWh');
      });
      it('year is 2024', () => {
        expect(g.year).toBe(2024);
      });
    });
  }
});

// ─── getEmissionFactor ───────────────────────────────────────────────────────

describe('getEmissionFactor', () => {
  it('defaults to DEFRA when no factorSet supplied', () => {
    const f = getEmissionFactor('diesel');
    expect(f).toBeDefined();
    expect(f!.source).toBe('DEFRA');
  });

  it('returns DEFRA natural_gas with exact factor 2.02', () => {
    const f = getEmissionFactor('natural_gas', 'DEFRA');
    expect(f).toBeDefined();
    expect(f!.factor).toBe(2.02);
    expect(f!.unit).toBe('m3');
  });

  it('returns EPA natural_gas with exact factor 1.885', () => {
    const f = getEmissionFactor('natural_gas', 'EPA');
    expect(f).toBeDefined();
    expect(f!.factor).toBe(1.885);
  });

  it('returns DEFRA coal with exact factor 2.88', () => {
    const f = getEmissionFactor('coal', 'DEFRA');
    expect(f!.factor).toBe(2.88);
    expect(f!.unit).toBe('kg');
    expect(f!.scope).toBe('scope1');
  });

  it('returns DEFRA renewable_electricity with factor 0.0', () => {
    const f = getEmissionFactor('renewable_electricity', 'DEFRA');
    expect(f).toBeDefined();
    expect(f!.factor).toBe(0.0);
    expect(f!.scope).toBe('scope2');
  });

  it('returns DEFRA waste_landfill with exact factor 467.05', () => {
    const f = getEmissionFactor('waste_landfill', 'DEFRA');
    expect(f!.factor).toBe(467.05);
    expect(f!.unit).toBe('tonne');
    expect(f!.scope).toBe('scope3');
  });

  it('returns EPA waste_landfill with exact factor 520.0', () => {
    const f = getEmissionFactor('waste_landfill', 'EPA');
    expect(f!.factor).toBe(520.0);
  });

  it('returns undefined for IEA factorSet (grid-specific)', () => {
    // IEA_FACTORS array is empty — grid factors accessed via getGridFactor
    const f = getEmissionFactor('natural_gas', 'IEA');
    expect(f).toBeUndefined();
  });

  it('returns DEFRA business_travel_rail in scope3', () => {
    const f = getEmissionFactor('business_travel_rail', 'DEFRA');
    expect(f).toBeDefined();
    expect(f!.scope).toBe('scope3');
    expect(f!.factor).toBe(0.035);
  });

  it('returns undefined for EPA business_travel_rail (not in EPA set)', () => {
    const f = getEmissionFactor('business_travel_rail', 'EPA');
    expect(f).toBeUndefined();
  });

  it('returns undefined for EPA water_supply (not in EPA set)', () => {
    expect(getEmissionFactor('water_supply', 'EPA')).toBeUndefined();
  });

  it('returns DEFRA biodiesel with low factor 0.17', () => {
    const f = getEmissionFactor('biodiesel', 'DEFRA');
    expect(f!.factor).toBe(0.17);
  });
});

// ─── getGridFactor ───────────────────────────────────────────────────────────

describe('getGridFactor', () => {
  it('returns GB factor of 0.207', () => {
    const g = getGridFactor('GB');
    expect(g).toBeDefined();
    expect(g!.factor).toBe(0.207);
    expect(g!.country).toBe('United Kingdom');
  });

  it('is case-insensitive — lowercase gb works', () => {
    const g = getGridFactor('gb');
    expect(g).toBeDefined();
    expect(g!.countryCode).toBe('GB');
  });

  it('is case-insensitive — mixed case Gb works', () => {
    const g = getGridFactor('Gb');
    expect(g).toBeDefined();
  });

  it('returns US factor of 0.371', () => {
    const g = getGridFactor('US');
    expect(g!.factor).toBe(0.371);
  });

  it('returns NO (Norway) factor of 0.008 — lowest', () => {
    const g = getGridFactor('NO');
    expect(g!.factor).toBe(0.008);
  });

  it('returns ZA (South Africa) factor of 0.928 — highest', () => {
    const g = getGridFactor('ZA');
    expect(g!.factor).toBe(0.928);
  });

  it('returns AE (UAE) factor of 0.404', () => {
    const g = getGridFactor('AE');
    expect(g!.factor).toBe(0.404);
  });

  it('returns FR (France) factor of 0.052 — low due to nuclear', () => {
    const g = getGridFactor('FR');
    expect(g!.factor).toBe(0.052);
  });

  it('returns undefined for unknown country code XX', () => {
    expect(getGridFactor('XX')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getGridFactor('')).toBeUndefined();
  });
});

// ─── convertUnits ────────────────────────────────────────────────────────────

describe('convertUnits', () => {
  describe('identity (same unit)', () => {
    it('litre → litre = same value', () => {
      expect(convertUnits(5, 'litre', 'litre')).toBe(5);
    });
    it('kWh → kWh = same value', () => {
      expect(convertUnits(100, 'kWh', 'kWh')).toBe(100);
    });
    it('km → km = same value', () => {
      expect(convertUnits(1000, 'km', 'km')).toBe(1000);
    });
  });

  describe('volume conversions', () => {
    it('1 gallon → ~3.78541 litres', () => {
      expect(convertUnits(1, 'gallon', 'litre')).toBeCloseTo(3.78541, 4);
    });
    it('3.78541 litres → 1 gallon (round-trip)', () => {
      expect(convertUnits(3.78541, 'litre', 'gallon')).toBeCloseTo(1, 4);
    });
    it('1 m3 → 1000 litres', () => {
      expect(convertUnits(1, 'm3', 'litre')).toBeCloseTo(1000, 2);
    });
    it('1000 litres → 1 m3', () => {
      expect(convertUnits(1000, 'litre', 'm3')).toBeCloseTo(1, 4);
    });
    it('1 ft3 → ~28.3168 litres', () => {
      expect(convertUnits(1, 'ft3', 'litre')).toBeCloseTo(28.3168, 3);
    });
  });

  describe('mass conversions', () => {
    it('1 tonne → 1000 kg', () => {
      expect(convertUnits(1, 'tonne', 'kg')).toBeCloseTo(1000, 2);
    });
    it('1000 kg → 1 tonne', () => {
      expect(convertUnits(1000, 'kg', 'tonne')).toBeCloseTo(1, 4);
    });
    it('1 lb → ~0.453592 kg', () => {
      expect(convertUnits(1, 'lb', 'kg')).toBeCloseTo(0.453592, 4);
    });
    it('1 ton_us → ~907.185 kg', () => {
      expect(convertUnits(1, 'ton_us', 'kg')).toBeCloseTo(907.185, 2);
    });
  });

  describe('energy conversions', () => {
    it('1 MWh → 1000 kWh', () => {
      expect(convertUnits(1, 'MWh', 'kWh')).toBeCloseTo(1000, 2);
    });
    it('1 GJ → ~277.778 kWh', () => {
      expect(convertUnits(1, 'GJ', 'kWh')).toBeCloseTo(277.778, 2);
    });
    it('1 therm → ~29.3071 kWh', () => {
      expect(convertUnits(1, 'therm', 'kWh')).toBeCloseTo(29.3071, 2);
    });
  });

  describe('distance conversions', () => {
    it('1 mile → ~1.60934 km', () => {
      expect(convertUnits(1, 'mile', 'km')).toBeCloseTo(1.60934, 4);
    });
    it('1.60934 km → 1 mile', () => {
      expect(convertUnits(1.60934, 'km', 'mile')).toBeCloseTo(1, 4);
    });
    it('1 m → 0.001 km', () => {
      expect(convertUnits(1, 'm', 'km')).toBeCloseTo(0.001, 5);
    });
    it('1000 m → 1 km', () => {
      expect(convertUnits(1000, 'm', 'km')).toBeCloseTo(1, 4);
    });
  });

  describe('incompatible / unknown units throw', () => {
    it('litre → km throws', () => {
      expect(() => convertUnits(1, 'litre', 'km')).toThrow();
    });
    it('kg → kWh throws', () => {
      expect(() => convertUnits(1, 'kg', 'kWh')).toThrow();
    });
    it('unknown fromUnit throws', () => {
      expect(() => convertUnits(1, 'furlong', 'km')).toThrow();
    });
    it('unknown toUnit throws', () => {
      expect(() => convertUnits(1, 'km', 'parsec')).toThrow();
    });
  });
});

// ─── calculateEmission ───────────────────────────────────────────────────────

describe('calculateEmission', () => {
  describe('DEFRA exact values', () => {
    it('diesel 1 litre DEFRA → 2.68 kgCO2e, scope1', () => {
      const r = calculateEmission('diesel', 1, 'litre', 'DEFRA');
      expect(r.co2e).toBe(2.68);
      expect(r.scope).toBe('scope1');
      expect(r.source).toBe('DEFRA');
    });

    it('natural_gas 1 m3 DEFRA → 2.02 kgCO2e', () => {
      const r = calculateEmission('natural_gas', 1, 'm3', 'DEFRA');
      expect(r.co2e).toBe(2.02);
    });

    it('grid_electricity 1 kWh DEFRA → 0.207 kgCO2e, scope2', () => {
      const r = calculateEmission('grid_electricity', 1, 'kWh', 'DEFRA');
      expect(r.co2e).toBe(0.207);
      expect(r.scope).toBe('scope2');
    });

    it('renewable_electricity 1 kWh DEFRA → 0.0 kgCO2e', () => {
      const r = calculateEmission('renewable_electricity', 1, 'kWh', 'DEFRA');
      expect(r.co2e).toBe(0);
    });

    it('waste_landfill 1 tonne DEFRA → 467.05 kgCO2e, scope3', () => {
      const r = calculateEmission('waste_landfill', 1, 'tonne', 'DEFRA');
      expect(r.co2e).toBe(467.05);
      expect(r.scope).toBe('scope3');
    });

    it('coal 2 kg DEFRA → 5.76 kgCO2e', () => {
      const r = calculateEmission('coal', 2, 'kg', 'DEFRA');
      expect(r.co2e).toBe(5.76);
    });

    it('business_travel_car 100 km DEFRA → 17.1 kgCO2e', () => {
      const r = calculateEmission('business_travel_car', 100, 'km', 'DEFRA');
      expect(r.co2e).toBe(17.1);
    });

    it('business_travel_rail 100 km DEFRA → 3.5 kgCO2e (low vs car)', () => {
      const r = calculateEmission('business_travel_rail', 100, 'km', 'DEFRA');
      expect(r.co2e).toBe(3.5);
    });
  });

  describe('EPA exact values', () => {
    it('diesel 1 litre EPA → 2.697 kgCO2e', () => {
      const r = calculateEmission('diesel', 1, 'litre', 'EPA');
      expect(r.co2e).toBe(2.697);
    });

    it('grid_electricity 1 kWh EPA → 0.371 kgCO2e (US grid is higher than UK)', () => {
      const r = calculateEmission('grid_electricity', 1, 'kWh', 'EPA');
      expect(r.co2e).toBe(0.371);
    });

    it('waste_landfill 1 tonne EPA → 520 kgCO2e', () => {
      const r = calculateEmission('waste_landfill', 1, 'tonne', 'EPA');
      expect(r.co2e).toBe(520);
    });
  });

  describe('unit conversion path', () => {
    it('diesel 1 gallon DEFRA ≈ diesel 3.78541 litres → co2e ≈ 10.145', () => {
      const r = calculateEmission('diesel', 1, 'gallon', 'DEFRA');
      // 1 gallon = 3.78541 litres; 3.78541 × 2.68 = 10.145...
      expect(r.co2e).toBeCloseTo(3.78541 * 2.68, 2);
    });

    it('grid_electricity 1 MWh DEFRA → 207 kgCO2e', () => {
      const r = calculateEmission('grid_electricity', 1, 'MWh', 'DEFRA');
      // 1 MWh = 1000 kWh; 1000 × 0.207 = 207
      expect(r.co2e).toBe(207);
    });

    it('business_travel_car 1 mile DEFRA → 0.275 kgCO2e', () => {
      const r = calculateEmission('business_travel_car', 1, 'mile', 'DEFRA');
      // 1 mile = 1.60934 km; 1.60934 × 0.171 ≈ 0.275...
      expect(r.co2e).toBeCloseTo(1.60934 * 0.171, 3);
    });
  });

  describe('result field shape', () => {
    it('result.quantity preserves the original value (not the converted value)', () => {
      const r = calculateEmission('diesel', 5, 'gallon', 'DEFRA');
      expect(r.quantity).toBe(5);
    });

    it('result.unit preserves the original unit', () => {
      const r = calculateEmission('diesel', 5, 'gallon', 'DEFRA');
      expect(r.unit).toBe('gallon');
    });

    it('result.fuelType is the input fuelType', () => {
      const r = calculateEmission('coal', 10, 'kg', 'DEFRA');
      expect(r.fuelType).toBe('coal');
    });

    it('co2e is rounded to 3 decimal places', () => {
      const r = calculateEmission('business_travel_car', 1, 'mile', 'DEFRA');
      const decimalPlaces = (r.co2e.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(3);
    });
  });

  describe('error cases', () => {
    it('throws for fuel type not in DEFRA (EPA-only: returns undefined → throws)', () => {
      // This test uses a cast to simulate runtime unknown fuel
      expect(() =>
        calculateEmission('business_travel_rail' as any, 100, 'km', 'EPA')
      ).toThrow();
    });

    it('throws for incompatible unit', () => {
      expect(() =>
        calculateEmission('diesel', 1, 'kWh', 'DEFRA')
      ).toThrow();
    });
  });
});

// ─── cross-data invariants ───────────────────────────────────────────────────

describe('cross-data invariants', () => {
  it('DEFRA_FACTORS has exactly 19 entries', () => {
    expect(DEFRA_FACTORS).toHaveLength(19);
  });

  it('EPA_FACTORS has exactly 14 entries', () => {
    expect(EPA_FACTORS).toHaveLength(14);
  });

  it('IEA_GRID_FACTORS has exactly 20 entries', () => {
    expect(IEA_GRID_FACTORS).toHaveLength(20);
  });

  it('DEFRA covers all 19 FuelTypes (one per type, no duplicates)', () => {
    const types = DEFRA_FACTORS.map((f) => f.type);
    expect(new Set(types).size).toBe(19);
    expect(types.length).toBe(19);
  });

  it('EPA has no duplicate FuelTypes', () => {
    const types = EPA_FACTORS.map((f) => f.type);
    expect(new Set(types).size).toBe(types.length);
  });

  it('IEA has no duplicate countryCodes', () => {
    const codes = IEA_GRID_FACTORS.map((g) => g.countryCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('all DEFRA factors are year 2024', () => {
    expect(DEFRA_FACTORS.every((f) => f.year === 2024)).toBe(true);
  });

  it('all EPA factors are year 2024', () => {
    expect(EPA_FACTORS.every((f) => f.year === 2024)).toBe(true);
  });

  it('all IEA grid factors are year 2024', () => {
    expect(IEA_GRID_FACTORS.every((g) => g.year === 2024)).toBe(true);
  });

  it('DEFRA scope distribution: 8 scope1, 2 scope2, 9 scope3', () => {
    const s1 = DEFRA_FACTORS.filter((f) => f.scope === 'scope1');
    const s2 = DEFRA_FACTORS.filter((f) => f.scope === 'scope2');
    const s3 = DEFRA_FACTORS.filter((f) => f.scope === 'scope3');
    expect(s1).toHaveLength(8);
    expect(s2).toHaveLength(2);
    expect(s3).toHaveLength(9);
  });

  it('biofuels (biodiesel, bioethanol) have lower DEFRA factors than fossil fuels', () => {
    const biodiesel = DEFRA_FACTORS.find((f) => f.type === 'biodiesel')!;
    const bioethanol = DEFRA_FACTORS.find((f) => f.type === 'bioethanol')!;
    const diesel = DEFRA_FACTORS.find((f) => f.type === 'diesel')!;
    const petrol = DEFRA_FACTORS.find((f) => f.type === 'petrol')!;
    expect(biodiesel.factor).toBeLessThan(diesel.factor);
    expect(bioethanol.factor).toBeLessThan(petrol.factor);
  });

  it('renewable_electricity factor is 0 in both DEFRA and EPA', () => {
    const defraRenew = DEFRA_FACTORS.find((f) => f.type === 'renewable_electricity')!;
    const epaRenew = EPA_FACTORS.find((f) => f.type === 'renewable_electricity')!;
    expect(defraRenew.factor).toBe(0);
    expect(epaRenew.factor).toBe(0);
  });

  it('coal has the highest scope1 factor in DEFRA', () => {
    const scope1 = DEFRA_FACTORS.filter((f) => f.scope === 'scope1');
    const maxFactor = Math.max(...scope1.map((f) => f.factor));
    const coalFactor = DEFRA_FACTORS.find((f) => f.type === 'coal')!.factor;
    expect(coalFactor).toBe(maxFactor);
  });

  it('rail travel has lower DEFRA factor than car and air (per km)', () => {
    const rail = DEFRA_FACTORS.find((f) => f.type === 'business_travel_rail')!;
    const car = DEFRA_FACTORS.find((f) => f.type === 'business_travel_car')!;
    const airDom = DEFRA_FACTORS.find((f) => f.type === 'business_travel_air_domestic')!;
    expect(rail.factor).toBeLessThan(car.factor);
    expect(rail.factor).toBeLessThan(airDom.factor);
  });

  it('Norway (NO) has the lowest IEA grid factor', () => {
    const minFactor = Math.min(...IEA_GRID_FACTORS.map((g) => g.factor));
    const norway = IEA_GRID_FACTORS.find((g) => g.countryCode === 'NO')!;
    expect(norway.factor).toBe(minFactor);
  });

  it('South Africa (ZA) has the highest IEA grid factor', () => {
    const maxFactor = Math.max(...IEA_GRID_FACTORS.map((g) => g.factor));
    const za = IEA_GRID_FACTORS.find((g) => g.countryCode === 'ZA')!;
    expect(za.factor).toBe(maxFactor);
  });

  it('IEA GB factor matches DEFRA grid_electricity factor (both 0.207)', () => {
    const ieaGb = IEA_GRID_FACTORS.find((g) => g.countryCode === 'GB')!;
    const defraGrid = DEFRA_FACTORS.find((f) => f.type === 'grid_electricity')!;
    expect(ieaGb.factor).toBe(defraGrid.factor);
  });

  it('IEA US factor matches EPA grid_electricity factor (both 0.371)', () => {
    const ieaUs = IEA_GRID_FACTORS.find((g) => g.countryCode === 'US')!;
    const epaGrid = EPA_FACTORS.find((f) => f.type === 'grid_electricity')!;
    expect(ieaUs.factor).toBe(epaGrid.factor);
  });
});
