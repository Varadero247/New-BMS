import {
  calculateEmission,
  getEmissionFactor,
  convertUnits,
  getGridFactor,
  DEFRA_FACTORS,
  EPA_FACTORS,
  IEA_GRID_FACTORS,
} from '../src';

describe('emission-factors', () => {
  describe('DEFRA factors', () => {
    it('should have natural gas factor of 2.02 kgCO2e/m3', () => {
      const factor = getEmissionFactor('natural_gas', 'DEFRA');
      expect(factor).toBeDefined();
      expect(factor!.factor).toBe(2.02);
      expect(factor!.unit).toBe('m3');
    });

    it('should have diesel factor of 2.68 kgCO2e/litre', () => {
      const factor = getEmissionFactor('diesel', 'DEFRA');
      expect(factor!.factor).toBe(2.68);
    });

    it('should have UK grid electricity at 0.207 kgCO2e/kWh', () => {
      const factor = getEmissionFactor('grid_electricity', 'DEFRA');
      expect(factor!.factor).toBe(0.207);
      expect(factor!.scope).toBe('scope2');
    });

    it('should have all required factor fields', () => {
      for (const factor of DEFRA_FACTORS) {
        expect(factor).toHaveProperty('type');
        expect(factor).toHaveProperty('factor');
        expect(factor).toHaveProperty('unit');
        expect(factor).toHaveProperty('scope');
        expect(factor).toHaveProperty('source');
      }
    });
  });

  describe('EPA factors', () => {
    it('should have US grid electricity factor', () => {
      const factor = getEmissionFactor('grid_electricity', 'EPA');
      expect(factor).toBeDefined();
      expect(factor!.factor).toBe(0.371);
    });

    it('should have diesel factor', () => {
      const factor = getEmissionFactor('diesel', 'EPA');
      expect(factor).toBeDefined();
      expect(factor!.source).toBe('EPA');
    });

    it('should return undefined for unknown fuel type', () => {
      const factor = getEmissionFactor('nonexistent_fuel' as string, 'DEFRA');
      expect(factor).toBeUndefined();
    });

    it('should return undefined for IEA factorSet (grid-specific, empty in FACTOR_SETS)', () => {
      const factor = getEmissionFactor('natural_gas', 'IEA');
      expect(factor).toBeUndefined();
    });
  });

  describe('IEA grid factors', () => {
    it('should find UK grid factor', () => {
      const factor = getGridFactor('GB');
      expect(factor).toBeDefined();
      expect(factor!.factor).toBe(0.207);
    });

    it('should find US grid factor', () => {
      const factor = getGridFactor('US');
      expect(factor!.factor).toBe(0.371);
    });

    it('should handle case-insensitive lookup', () => {
      const factor = getGridFactor('gb');
      expect(factor).toBeDefined();
    });

    it('should return undefined for unknown country', () => {
      const factor = getGridFactor('XX');
      expect(factor).toBeUndefined();
    });

    it('should have at least 15 countries', () => {
      expect(IEA_GRID_FACTORS.length).toBeGreaterThanOrEqual(15);
    });
  });

  describe('calculateEmission', () => {
    it('should calculate natural gas emissions', () => {
      const result = calculateEmission('natural_gas', 1000, 'm3', 'DEFRA');
      expect(result.co2e).toBe(2020);
      expect(result.scope).toBe('scope1');
    });

    it('should calculate diesel emissions', () => {
      const result = calculateEmission('diesel', 500, 'litre', 'DEFRA');
      expect(result.co2e).toBe(1340);
    });

    it('should calculate electricity emissions', () => {
      const result = calculateEmission('grid_electricity', 10000, 'kWh', 'DEFRA');
      expect(result.co2e).toBe(2070);
    });

    it('should handle unit conversion (MWh to kWh)', () => {
      const result = calculateEmission('grid_electricity', 10, 'MWh', 'DEFRA');
      expect(result.co2e).toBe(2070);
    });

    it('should throw for unknown fuel type', () => {
      expect(() => calculateEmission('unknown' as string, 100, 'litre', 'DEFRA')).toThrow();
    });

    it('should use EPA factor set and return source=EPA', () => {
      const result = calculateEmission('diesel', 100, 'litre', 'EPA');
      expect(result.source).toBe('EPA');
      expect(result.co2e).toBeGreaterThan(0);
    });

    it('result includes fuelType, quantity, unit metadata', () => {
      const result = calculateEmission('natural_gas', 50, 'm3', 'DEFRA');
      expect(result.fuelType).toBe('natural_gas');
      expect(result.quantity).toBe(50);
      expect(result.unit).toBe('m3');
    });
  });

  describe('convertUnits', () => {
    it('should convert litres to gallons', () => {
      expect(convertUnits(3.78541, 'litre', 'gallon')).toBeCloseTo(1, 2);
    });

    it('should convert kg to tonnes', () => {
      expect(convertUnits(1000, 'kg', 'tonne')).toBe(1);
    });

    it('should convert kWh to MWh', () => {
      expect(convertUnits(1000, 'kWh', 'MWh')).toBe(1);
    });

    it('should convert km to miles', () => {
      expect(convertUnits(1.60934, 'km', 'mile')).toBeCloseTo(1, 2);
    });

    it('should return same value for same unit', () => {
      expect(convertUnits(42, 'litre', 'litre')).toBe(42);
    });

    it('should throw for incompatible units', () => {
      expect(() => convertUnits(100, 'litre', 'kWh')).toThrow('incompatible units');
    });

    it('should convert m3 to litre', () => {
      // 1 m3 = 1000 litres
      expect(convertUnits(1, 'm3', 'litre')).toBe(1000);
    });

    it('should convert lb to kg', () => {
      // 1 lb ≈ 0.4536 kg
      expect(convertUnits(1, 'lb', 'kg')).toBeCloseTo(0.4536, 3);
    });

    it('should convert m to km', () => {
      // 1000 m = 1 km
      expect(convertUnits(1000, 'm', 'km')).toBe(1);
    });
  });
});

describe('emission-factors — additional coverage', () => {
  it('DEFRA_FACTORS is a non-empty array', () => {
    expect(Array.isArray(DEFRA_FACTORS)).toBe(true);
    expect(DEFRA_FACTORS.length).toBeGreaterThan(0);
  });

  it('EPA_FACTORS is a non-empty array', () => {
    expect(Array.isArray(EPA_FACTORS)).toBe(true);
    expect(EPA_FACTORS.length).toBeGreaterThan(0);
  });

  it('getEmissionFactor returns a factor with scope defined', () => {
    const factor = getEmissionFactor('natural_gas', 'DEFRA');
    expect(['scope1', 'scope2', 'scope3']).toContain(factor!.scope);
  });

  it('calculateEmission result co2e is a finite number', () => {
    const result = calculateEmission('diesel', 100, 'litre', 'EPA');
    expect(Number.isFinite(result.co2e)).toBe(true);
  });

  it('calculateEmission result factor matches getEmissionFactor factor', () => {
    const factor = getEmissionFactor('natural_gas', 'DEFRA')!;
    const result = calculateEmission('natural_gas', 1, 'm3', 'DEFRA');
    expect(result.co2e).toBeCloseTo(factor.factor, 5);
  });

  it('getGridFactor for DE (Germany) returns a defined factor', () => {
    const factor = getGridFactor('DE');
    expect(factor).toBeDefined();
    expect(factor!.factor).toBeGreaterThan(0);
  });
});

describe('emission-factors — final boundary coverage', () => {
  it('DEFRA_FACTORS every entry has a numeric factor', () => {
    for (const f of DEFRA_FACTORS) {
      expect(typeof f.factor).toBe('number');
    }
  });

  it('EPA_FACTORS every entry has a source of "EPA"', () => {
    for (const f of EPA_FACTORS) {
      expect(f.source).toBe('EPA');
    }
  });

  it('calculateEmission petrol fuel in DEFRA returns positive co2e', () => {
    const result = calculateEmission('petrol', 100, 'litre', 'DEFRA');
    expect(result.co2e).toBeGreaterThan(0);
  });

  it('getGridFactor for FR (France) returns a defined factor', () => {
    const factor = getGridFactor('FR');
    expect(factor).toBeDefined();
    expect(factor!.countryCode).toBe('FR');
    expect(factor!.country).toBe('France');
  });

  it('calculateEmission for grid_electricity in EPA has scope2', () => {
    const result = calculateEmission('grid_electricity', 1000, 'kWh', 'EPA');
    expect(result.scope).toBe('scope2');
  });

  it('IEA_GRID_FACTORS every entry has a country and factor property', () => {
    for (const f of IEA_GRID_FACTORS) {
      expect(f).toHaveProperty('country');
      expect(f).toHaveProperty('factor');
    }
  });

  it('convertUnits MWh to kWh', () => {
    expect(convertUnits(1, 'MWh', 'kWh')).toBe(1000);
  });
});
