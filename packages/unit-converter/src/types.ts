export type LengthUnit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'mi';
export type WeightUnit = 'mg' | 'g' | 'kg' | 't' | 'oz' | 'lb' | 'ton';
export type TemperatureUnit = 'C' | 'F' | 'K';
export type VolumeUnit = 'ml' | 'l' | 'gal' | 'qt' | 'pt' | 'fl_oz' | 'm3';
export type PressureUnit = 'pa' | 'kpa' | 'mpa' | 'bar' | 'psi' | 'atm';
export type SpeedUnit = 'm/s' | 'km/h' | 'mph' | 'knot';

export type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'pressure' | 'speed';

export interface ConversionResult {
  value: number;
  from: string;
  to: string;
  category: UnitCategory;
}
