// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// Temperature
export function celsiusToFahrenheit(c: number): number { return (c * 9) / 5 + 32; }
export function fahrenheitToCelsius(f: number): number { return ((f - 32) * 5) / 9; }
export function celsiusToKelvin(c: number): number { return c + 273.15; }
export function kelvinToCelsius(k: number): number { return k - 273.15; }
export function fahrenheitToKelvin(f: number): number { return celsiusToKelvin(fahrenheitToCelsius(f)); }
export function kelvinToFahrenheit(k: number): number { return celsiusToFahrenheit(kelvinToCelsius(k)); }

// Length
export function metresToFeet(m: number): number { return m * 3.28084; }
export function feetToMetres(ft: number): number { return ft / 3.28084; }
export function metresToInches(m: number): number { return m * 39.3701; }
export function inchesToMetres(inches: number): number { return inches / 39.3701; }
export function kilometresToMiles(km: number): number { return km * 0.621371; }
export function milesToKilometres(miles: number): number { return miles / 0.621371; }
export function metresToYards(m: number): number { return m * 1.09361; }
export function yardsToMetres(yards: number): number { return yards / 1.09361; }
export function centimetresToInches(cm: number): number { return cm / 2.54; }
export function inchesToCentimetres(inches: number): number { return inches * 2.54; }

// Weight
export function kilogramsToPounds(kg: number): number { return kg * 2.20462; }
export function poundsToKilograms(lb: number): number { return lb / 2.20462; }
export function kilogramsToOunces(kg: number): number { return kg * 35.274; }
export function ouncesToKilograms(oz: number): number { return oz / 35.274; }
export function gramsToOunces(g: number): number { return g * 0.035274; }
export function ouncesToGrams(oz: number): number { return oz / 0.035274; }
export function tonsToKilograms(t: number): number { return t * 1000; }
export function kilogramsToTons(kg: number): number { return kg / 1000; }

// Volume
export function litresToGallons(l: number): number { return l * 0.264172; }
export function gallonsToLitres(gal: number): number { return gal / 0.264172; }
export function litresToFluidOunces(l: number): number { return l * 33.814; }
export function fluidOuncesToLitres(fl: number): number { return fl / 33.814; }
export function millilitresToCups(ml: number): number { return ml / 236.588; }
export function cupsToMillilitres(cups: number): number { return cups * 236.588; }

// Speed
export function mpsToKph(mps: number): number { return mps * 3.6; }
export function kphToMps(kph: number): number { return kph / 3.6; }
export function kphToMph(kph: number): number { return kph * 0.621371; }
export function mphToKph(mph: number): number { return mph / 0.621371; }
export function knotsToKph(knots: number): number { return knots * 1.852; }
export function kphToKnots(kph: number): number { return kph / 1.852; }

// Area
export function squareMetresToSquareFeet(sqm: number): number { return sqm * 10.7639; }
export function squareFeetToSquareMetres(sqft: number): number { return sqft / 10.7639; }
export function hectaresToAcres(ha: number): number { return ha * 2.47105; }
export function acresToHectares(acres: number): number { return acres / 2.47105; }

// Digital storage
export function bytesToKilobytes(bytes: number): number { return bytes / 1024; }
export function kilobytesToBytes(kb: number): number { return kb * 1024; }
export function bytesToMegabytes(bytes: number): number { return bytes / (1024 * 1024); }
export function megabytesToBytes(mb: number): number { return mb * 1024 * 1024; }
export function bytesToGigabytes(bytes: number): number { return bytes / (1024 ** 3); }
export function gigabytesToBytes(gb: number): number { return gb * 1024 ** 3; }

// Energy
export function joulesToCalories(j: number): number { return j / 4.184; }
export function caloriesToJoules(cal: number): number { return cal * 4.184; }
export function kilowattHoursToJoules(kwh: number): number { return kwh * 3_600_000; }
export function joulesToKilowattHours(j: number): number { return j / 3_600_000; }

// Pressure
export function pascalsToBar(pa: number): number { return pa / 100000; }
export function barToPascals(bar: number): number { return bar * 100000; }
export function psiToPascals(psi: number): number { return psi * 6894.76; }
export function pascalsToPsi(pa: number): number { return pa / 6894.76; }

// Angle
export function degreesToRadians(deg: number): number { return (deg * Math.PI) / 180; }
export function radiansToDegrees(rad: number): number { return (rad * 180) / Math.PI; }

// Round to N decimal places
export function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
