import { LengthUnit, PressureUnit, SpeedUnit, TemperatureUnit, VolumeUnit, WeightUnit } from './types';

// Length conversions - all to metres
const LENGTH_TO_M: Record<LengthUnit, number> = {
  mm: 0.001, cm: 0.01, m: 1, km: 1000,
  in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
};

// Weight conversions - all to grams
const WEIGHT_TO_G: Record<WeightUnit, number> = {
  mg: 0.001, g: 1, kg: 1000, t: 1_000_000,
  oz: 28.349523, lb: 453.59237, ton: 907184.74,
};

// Volume conversions - all to litres
const VOLUME_TO_L: Record<VolumeUnit, number> = {
  ml: 0.001, l: 1, gal: 3.785411784, qt: 0.946352946,
  pt: 0.473176473, fl_oz: 0.0295735295625, m3: 1000,
};

// Pressure conversions - all to pascals
const PRESSURE_TO_PA: Record<PressureUnit, number> = {
  pa: 1, kpa: 1000, mpa: 1_000_000, bar: 100_000, psi: 6894.757, atm: 101_325,
};

// Speed conversions - all to m/s
const SPEED_TO_MS: Record<SpeedUnit, number> = {
  'm/s': 1, 'km/h': 1 / 3.6, 'mph': 0.44704, 'knot': 0.51444,
};

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  return (value * LENGTH_TO_M[from]) / LENGTH_TO_M[to];
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  return (value * WEIGHT_TO_G[from]) / WEIGHT_TO_G[to];
}

export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  if (from === to) return value;
  let celsius: number;
  switch (from) {
    case 'C': celsius = value; break;
    case 'F': celsius = (value - 32) * (5 / 9); break;
    case 'K': celsius = value - 273.15; break;
  }
  switch (to) {
    case 'C': return celsius;
    case 'F': return celsius * (9 / 5) + 32;
    case 'K': return celsius + 273.15;
  }
}

export function convertVolume(value: number, from: VolumeUnit, to: VolumeUnit): number {
  return (value * VOLUME_TO_L[from]) / VOLUME_TO_L[to];
}

export function convertPressure(value: number, from: PressureUnit, to: PressureUnit): number {
  return (value * PRESSURE_TO_PA[from]) / PRESSURE_TO_PA[to];
}

export function convertSpeed(value: number, from: SpeedUnit, to: SpeedUnit): number {
  return (value * SPEED_TO_MS[from]) / SPEED_TO_MS[to];
}

export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function isLengthUnit(u: string): u is LengthUnit {
  return ['mm','cm','m','km','in','ft','yd','mi'].includes(u);
}

export function isWeightUnit(u: string): u is WeightUnit {
  return ['mg','g','kg','t','oz','lb','ton'].includes(u);
}

export function isTemperatureUnit(u: string): u is TemperatureUnit {
  return ['C','F','K'].includes(u);
}

export function isVolumeUnit(u: string): u is VolumeUnit {
  return ['ml','l','gal','qt','pt','fl_oz','m3'].includes(u);
}

export function isPressureUnit(u: string): u is PressureUnit {
  return ['pa','kpa','mpa','bar','psi','atm'].includes(u);
}

export function isSpeedUnit(u: string): u is SpeedUnit {
  return ['m/s','km/h','mph','knot'].includes(u);
}

export function allLengthUnits(): LengthUnit[] {
  return ['mm','cm','m','km','in','ft','yd','mi'];
}

export function allWeightUnits(): WeightUnit[] {
  return ['mg','g','kg','t','oz','lb','ton'];
}

export function allTemperatureUnits(): TemperatureUnit[] {
  return ['C','F','K'];
}

export function celsiusToFahrenheit(c: number): number {
  return c * (9 / 5) + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return (f - 32) * (5 / 9);
}

export function metresToFeet(m: number): number {
  return m / LENGTH_TO_M['ft'];
}

export function kgToLbs(kg: number): number {
  return kg * WEIGHT_TO_G['kg'] / WEIGHT_TO_G['lb'];
}

export function litrestoGallons(l: number): number {
  return l / VOLUME_TO_L['gal'];
}

export function psiToBar(psi: number): number {
  return convertPressure(psi, 'psi', 'bar');
}
