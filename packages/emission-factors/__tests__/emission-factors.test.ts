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
  });
});
