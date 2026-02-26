// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  celsiusToFahrenheit, fahrenheitToCelsius, celsiusToKelvin,
  kelvinToCelsius, fahrenheitToKelvin, kelvinToFahrenheit,
  metresToFeet, feetToMetres, metresToInches, inchesToMetres,
  kilometresToMiles, milesToKilometres, metresToYards, yardsToMetres,
  centimetresToInches, inchesToCentimetres,
  kilogramsToPounds, poundsToKilograms, kilogramsToOunces, ouncesToKilograms,
  gramsToOunces, ouncesToGrams, tonsToKilograms, kilogramsToTons,
  litresToGallons, gallonsToLitres, litresToFluidOunces, fluidOuncesToLitres,
  millilitresToCups, cupsToMillilitres,
  mpsToKph, kphToMps, kphToMph, mphToKph, knotsToKph, kphToKnots,
  squareMetresToSquareFeet, squareFeetToSquareMetres, hectaresToAcres, acresToHectares,
  bytesToKilobytes, kilobytesToBytes, bytesToMegabytes, megabytesToBytes,
  bytesToGigabytes, gigabytesToBytes,
  joulesToCalories, caloriesToJoules, kilowattHoursToJoules, joulesToKilowattHours,
  pascalsToBar, barToPascals, psiToPascals, pascalsToPsi,
  degreesToRadians, radiansToDegrees,
  round
} from "../measurement-utils";

describe("temperature conversions", () => {
  it("0C is 32F", () => { expect(celsiusToFahrenheit(0)).toBe(32); });
  it("100C is 212F", () => { expect(celsiusToFahrenheit(100)).toBe(212); });
  it("32F is 0C", () => { expect(fahrenheitToCelsius(32)).toBe(0); });
  it("0C is 273.15K", () => { expect(celsiusToKelvin(0)).toBe(273.15); });
  it("celsiusToFahrenheit(-50) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-50)))).toBe(-50); });
  it("celsiusToFahrenheit(-49) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-49)))).toBe(-49); });
  it("celsiusToFahrenheit(-48) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-48)))).toBe(-48); });
  it("celsiusToFahrenheit(-47) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-47)))).toBe(-47); });
  it("celsiusToFahrenheit(-46) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-46)))).toBe(-46); });
  it("celsiusToFahrenheit(-45) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-45)))).toBe(-45); });
  it("celsiusToFahrenheit(-44) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-44)))).toBe(-44); });
  it("celsiusToFahrenheit(-43) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-43)))).toBe(-43); });
  it("celsiusToFahrenheit(-42) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-42)))).toBe(-42); });
  it("celsiusToFahrenheit(-41) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-41)))).toBe(-41); });
  it("celsiusToFahrenheit(-40) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-40)))).toBe(-40); });
  it("celsiusToFahrenheit(-39) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-39)))).toBe(-39); });
  it("celsiusToFahrenheit(-38) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-38)))).toBe(-38); });
  it("celsiusToFahrenheit(-37) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-37)))).toBe(-37); });
  it("celsiusToFahrenheit(-36) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-36)))).toBe(-36); });
  it("celsiusToFahrenheit(-35) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-35)))).toBe(-35); });
  it("celsiusToFahrenheit(-34) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-34)))).toBe(-34); });
  it("celsiusToFahrenheit(-33) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-33)))).toBe(-33); });
  it("celsiusToFahrenheit(-32) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-32)))).toBe(-32); });
  it("celsiusToFahrenheit(-31) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-31)))).toBe(-31); });
  it("celsiusToFahrenheit(-30) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-30)))).toBe(-30); });
  it("celsiusToFahrenheit(-29) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-29)))).toBe(-29); });
  it("celsiusToFahrenheit(-28) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-28)))).toBe(-28); });
  it("celsiusToFahrenheit(-27) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-27)))).toBe(-27); });
  it("celsiusToFahrenheit(-26) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-26)))).toBe(-26); });
  it("celsiusToFahrenheit(-25) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-25)))).toBe(-25); });
  it("celsiusToFahrenheit(-24) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-24)))).toBe(-24); });
  it("celsiusToFahrenheit(-23) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-23)))).toBe(-23); });
  it("celsiusToFahrenheit(-22) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-22)))).toBe(-22); });
  it("celsiusToFahrenheit(-21) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-21)))).toBe(-21); });
  it("celsiusToFahrenheit(-20) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-20)))).toBe(-20); });
  it("celsiusToFahrenheit(-19) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-19)))).toBe(-19); });
  it("celsiusToFahrenheit(-18) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-18)))).toBe(-18); });
  it("celsiusToFahrenheit(-17) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-17)))).toBe(-17); });
  it("celsiusToFahrenheit(-16) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-16)))).toBe(-16); });
  it("celsiusToFahrenheit(-15) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-15)))).toBe(-15); });
  it("celsiusToFahrenheit(-14) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-14)))).toBe(-14); });
  it("celsiusToFahrenheit(-13) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-13)))).toBe(-13); });
  it("celsiusToFahrenheit(-12) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-12)))).toBe(-12); });
  it("celsiusToFahrenheit(-11) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-11)))).toBe(-11); });
  it("celsiusToFahrenheit(-10) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-10)))).toBe(-10); });
  it("celsiusToFahrenheit(-9) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-9)))).toBe(-9); });
  it("celsiusToFahrenheit(-8) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-8)))).toBe(-8); });
  it("celsiusToFahrenheit(-7) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-7)))).toBe(-7); });
  it("celsiusToFahrenheit(-6) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-6)))).toBe(-6); });
  it("celsiusToFahrenheit(-5) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-5)))).toBe(-5); });
  it("celsiusToFahrenheit(-4) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-4)))).toBe(-4); });
  it("celsiusToFahrenheit(-3) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-3)))).toBe(-3); });
  it("celsiusToFahrenheit(-2) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-2)))).toBe(-2); });
  it("celsiusToFahrenheit(-1) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(-1)))).toBe(-1); });
  it("celsiusToFahrenheit(0) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(0)))).toBe(0); });
  it("celsiusToFahrenheit(1) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(1)))).toBe(1); });
  it("celsiusToFahrenheit(2) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(2)))).toBe(2); });
  it("celsiusToFahrenheit(3) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(3)))).toBe(3); });
  it("celsiusToFahrenheit(4) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(4)))).toBe(4); });
  it("celsiusToFahrenheit(5) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(5)))).toBe(5); });
  it("celsiusToFahrenheit(6) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(6)))).toBe(6); });
  it("celsiusToFahrenheit(7) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(7)))).toBe(7); });
  it("celsiusToFahrenheit(8) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(8)))).toBe(8); });
  it("celsiusToFahrenheit(9) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(9)))).toBe(9); });
  it("celsiusToFahrenheit(10) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(10)))).toBe(10); });
  it("celsiusToFahrenheit(11) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(11)))).toBe(11); });
  it("celsiusToFahrenheit(12) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(12)))).toBe(12); });
  it("celsiusToFahrenheit(13) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(13)))).toBe(13); });
  it("celsiusToFahrenheit(14) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(14)))).toBe(14); });
  it("celsiusToFahrenheit(15) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(15)))).toBe(15); });
  it("celsiusToFahrenheit(16) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(16)))).toBe(16); });
  it("celsiusToFahrenheit(17) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(17)))).toBe(17); });
  it("celsiusToFahrenheit(18) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(18)))).toBe(18); });
  it("celsiusToFahrenheit(19) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(19)))).toBe(19); });
  it("celsiusToFahrenheit(20) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(20)))).toBe(20); });
  it("celsiusToFahrenheit(21) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(21)))).toBe(21); });
  it("celsiusToFahrenheit(22) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(22)))).toBe(22); });
  it("celsiusToFahrenheit(23) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(23)))).toBe(23); });
  it("celsiusToFahrenheit(24) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(24)))).toBe(24); });
  it("celsiusToFahrenheit(25) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(25)))).toBe(25); });
  it("celsiusToFahrenheit(26) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(26)))).toBe(26); });
  it("celsiusToFahrenheit(27) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(27)))).toBe(27); });
  it("celsiusToFahrenheit(28) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(28)))).toBe(28); });
  it("celsiusToFahrenheit(29) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(29)))).toBe(29); });
  it("celsiusToFahrenheit(30) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(30)))).toBe(30); });
  it("celsiusToFahrenheit(31) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(31)))).toBe(31); });
  it("celsiusToFahrenheit(32) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(32)))).toBe(32); });
  it("celsiusToFahrenheit(33) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(33)))).toBe(33); });
  it("celsiusToFahrenheit(34) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(34)))).toBe(34); });
  it("celsiusToFahrenheit(35) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(35)))).toBe(35); });
  it("celsiusToFahrenheit(36) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(36)))).toBe(36); });
  it("celsiusToFahrenheit(37) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(37)))).toBe(37); });
  it("celsiusToFahrenheit(38) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(38)))).toBe(38); });
  it("celsiusToFahrenheit(39) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(39)))).toBe(39); });
  it("celsiusToFahrenheit(40) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(40)))).toBe(40); });
  it("celsiusToFahrenheit(41) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(41)))).toBe(41); });
  it("celsiusToFahrenheit(42) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(42)))).toBe(42); });
  it("celsiusToFahrenheit(43) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(43)))).toBe(43); });
  it("celsiusToFahrenheit(44) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(44)))).toBe(44); });
  it("celsiusToFahrenheit(45) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(45)))).toBe(45); });
  it("celsiusToFahrenheit(46) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(46)))).toBe(46); });
  it("celsiusToFahrenheit(47) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(47)))).toBe(47); });
  it("celsiusToFahrenheit(48) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(48)))).toBe(48); });
  it("celsiusToFahrenheit(49) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(49)))).toBe(49); });
  it("celsiusToFahrenheit(50) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(50)))).toBe(50); });
  it("celsiusToFahrenheit(51) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(51)))).toBe(51); });
  it("celsiusToFahrenheit(52) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(52)))).toBe(52); });
  it("celsiusToFahrenheit(53) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(53)))).toBe(53); });
  it("celsiusToFahrenheit(54) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(54)))).toBe(54); });
  it("celsiusToFahrenheit(55) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(55)))).toBe(55); });
  it("celsiusToFahrenheit(56) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(56)))).toBe(56); });
  it("celsiusToFahrenheit(57) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(57)))).toBe(57); });
  it("celsiusToFahrenheit(58) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(58)))).toBe(58); });
  it("celsiusToFahrenheit(59) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(59)))).toBe(59); });
  it("celsiusToFahrenheit(60) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(60)))).toBe(60); });
  it("celsiusToFahrenheit(61) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(61)))).toBe(61); });
  it("celsiusToFahrenheit(62) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(62)))).toBe(62); });
  it("celsiusToFahrenheit(63) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(63)))).toBe(63); });
  it("celsiusToFahrenheit(64) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(64)))).toBe(64); });
  it("celsiusToFahrenheit(65) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(65)))).toBe(65); });
  it("celsiusToFahrenheit(66) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(66)))).toBe(66); });
  it("celsiusToFahrenheit(67) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(67)))).toBe(67); });
  it("celsiusToFahrenheit(68) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(68)))).toBe(68); });
  it("celsiusToFahrenheit(69) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(69)))).toBe(69); });
  it("celsiusToFahrenheit(70) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(70)))).toBe(70); });
  it("celsiusToFahrenheit(71) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(71)))).toBe(71); });
  it("celsiusToFahrenheit(72) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(72)))).toBe(72); });
  it("celsiusToFahrenheit(73) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(73)))).toBe(73); });
  it("celsiusToFahrenheit(74) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(74)))).toBe(74); });
  it("celsiusToFahrenheit(75) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(75)))).toBe(75); });
  it("celsiusToFahrenheit(76) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(76)))).toBe(76); });
  it("celsiusToFahrenheit(77) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(77)))).toBe(77); });
  it("celsiusToFahrenheit(78) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(78)))).toBe(78); });
  it("celsiusToFahrenheit(79) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(79)))).toBe(79); });
  it("celsiusToFahrenheit(80) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(80)))).toBe(80); });
  it("celsiusToFahrenheit(81) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(81)))).toBe(81); });
  it("celsiusToFahrenheit(82) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(82)))).toBe(82); });
  it("celsiusToFahrenheit(83) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(83)))).toBe(83); });
  it("celsiusToFahrenheit(84) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(84)))).toBe(84); });
  it("celsiusToFahrenheit(85) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(85)))).toBe(85); });
  it("celsiusToFahrenheit(86) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(86)))).toBe(86); });
  it("celsiusToFahrenheit(87) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(87)))).toBe(87); });
  it("celsiusToFahrenheit(88) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(88)))).toBe(88); });
  it("celsiusToFahrenheit(89) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(89)))).toBe(89); });
  it("celsiusToFahrenheit(90) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(90)))).toBe(90); });
  it("celsiusToFahrenheit(91) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(91)))).toBe(91); });
  it("celsiusToFahrenheit(92) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(92)))).toBe(92); });
  it("celsiusToFahrenheit(93) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(93)))).toBe(93); });
  it("celsiusToFahrenheit(94) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(94)))).toBe(94); });
  it("celsiusToFahrenheit(95) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(95)))).toBe(95); });
  it("celsiusToFahrenheit(96) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(96)))).toBe(96); });
  it("celsiusToFahrenheit(97) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(97)))).toBe(97); });
  it("celsiusToFahrenheit(98) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(98)))).toBe(98); });
  it("celsiusToFahrenheit(99) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(99)))).toBe(99); });
  it("celsiusToFahrenheit(100) roundtrip", () => {
    expect(Math.round(fahrenheitToCelsius(celsiusToFahrenheit(100)))).toBe(100); });
});

describe("length conversions", () => {
  it("1m is ~3.28ft", () => { expect(round(metresToFeet(1), 2)).toBe(3.28); });
  it("feetToMetres roundtrip", () => { expect(round(feetToMetres(metresToFeet(1)), 5)).toBeCloseTo(1, 4); });
  it("1km is ~0.621miles", () => { expect(round(kilometresToMiles(1), 3)).toBe(0.621); });
  it("metres->feet->metres roundtrip 1", () => {
    expect(feetToMetres(metresToFeet(1))).toBeCloseTo(1, 3); });
  it("metres->feet->metres roundtrip 2", () => {
    expect(feetToMetres(metresToFeet(2))).toBeCloseTo(2, 3); });
  it("metres->feet->metres roundtrip 3", () => {
    expect(feetToMetres(metresToFeet(3))).toBeCloseTo(3, 3); });
  it("metres->feet->metres roundtrip 4", () => {
    expect(feetToMetres(metresToFeet(4))).toBeCloseTo(4, 3); });
  it("metres->feet->metres roundtrip 5", () => {
    expect(feetToMetres(metresToFeet(5))).toBeCloseTo(5, 3); });
  it("metres->feet->metres roundtrip 6", () => {
    expect(feetToMetres(metresToFeet(6))).toBeCloseTo(6, 3); });
  it("metres->feet->metres roundtrip 7", () => {
    expect(feetToMetres(metresToFeet(7))).toBeCloseTo(7, 3); });
  it("metres->feet->metres roundtrip 8", () => {
    expect(feetToMetres(metresToFeet(8))).toBeCloseTo(8, 3); });
  it("metres->feet->metres roundtrip 9", () => {
    expect(feetToMetres(metresToFeet(9))).toBeCloseTo(9, 3); });
  it("metres->feet->metres roundtrip 10", () => {
    expect(feetToMetres(metresToFeet(10))).toBeCloseTo(10, 3); });
  it("metres->feet->metres roundtrip 11", () => {
    expect(feetToMetres(metresToFeet(11))).toBeCloseTo(11, 3); });
  it("metres->feet->metres roundtrip 12", () => {
    expect(feetToMetres(metresToFeet(12))).toBeCloseTo(12, 3); });
  it("metres->feet->metres roundtrip 13", () => {
    expect(feetToMetres(metresToFeet(13))).toBeCloseTo(13, 3); });
  it("metres->feet->metres roundtrip 14", () => {
    expect(feetToMetres(metresToFeet(14))).toBeCloseTo(14, 3); });
  it("metres->feet->metres roundtrip 15", () => {
    expect(feetToMetres(metresToFeet(15))).toBeCloseTo(15, 3); });
  it("metres->feet->metres roundtrip 16", () => {
    expect(feetToMetres(metresToFeet(16))).toBeCloseTo(16, 3); });
  it("metres->feet->metres roundtrip 17", () => {
    expect(feetToMetres(metresToFeet(17))).toBeCloseTo(17, 3); });
  it("metres->feet->metres roundtrip 18", () => {
    expect(feetToMetres(metresToFeet(18))).toBeCloseTo(18, 3); });
  it("metres->feet->metres roundtrip 19", () => {
    expect(feetToMetres(metresToFeet(19))).toBeCloseTo(19, 3); });
  it("metres->feet->metres roundtrip 20", () => {
    expect(feetToMetres(metresToFeet(20))).toBeCloseTo(20, 3); });
  it("metres->feet->metres roundtrip 21", () => {
    expect(feetToMetres(metresToFeet(21))).toBeCloseTo(21, 3); });
  it("metres->feet->metres roundtrip 22", () => {
    expect(feetToMetres(metresToFeet(22))).toBeCloseTo(22, 3); });
  it("metres->feet->metres roundtrip 23", () => {
    expect(feetToMetres(metresToFeet(23))).toBeCloseTo(23, 3); });
  it("metres->feet->metres roundtrip 24", () => {
    expect(feetToMetres(metresToFeet(24))).toBeCloseTo(24, 3); });
  it("metres->feet->metres roundtrip 25", () => {
    expect(feetToMetres(metresToFeet(25))).toBeCloseTo(25, 3); });
  it("metres->feet->metres roundtrip 26", () => {
    expect(feetToMetres(metresToFeet(26))).toBeCloseTo(26, 3); });
  it("metres->feet->metres roundtrip 27", () => {
    expect(feetToMetres(metresToFeet(27))).toBeCloseTo(27, 3); });
  it("metres->feet->metres roundtrip 28", () => {
    expect(feetToMetres(metresToFeet(28))).toBeCloseTo(28, 3); });
  it("metres->feet->metres roundtrip 29", () => {
    expect(feetToMetres(metresToFeet(29))).toBeCloseTo(29, 3); });
  it("metres->feet->metres roundtrip 30", () => {
    expect(feetToMetres(metresToFeet(30))).toBeCloseTo(30, 3); });
  it("metres->feet->metres roundtrip 31", () => {
    expect(feetToMetres(metresToFeet(31))).toBeCloseTo(31, 3); });
  it("metres->feet->metres roundtrip 32", () => {
    expect(feetToMetres(metresToFeet(32))).toBeCloseTo(32, 3); });
  it("metres->feet->metres roundtrip 33", () => {
    expect(feetToMetres(metresToFeet(33))).toBeCloseTo(33, 3); });
  it("metres->feet->metres roundtrip 34", () => {
    expect(feetToMetres(metresToFeet(34))).toBeCloseTo(34, 3); });
  it("metres->feet->metres roundtrip 35", () => {
    expect(feetToMetres(metresToFeet(35))).toBeCloseTo(35, 3); });
  it("metres->feet->metres roundtrip 36", () => {
    expect(feetToMetres(metresToFeet(36))).toBeCloseTo(36, 3); });
  it("metres->feet->metres roundtrip 37", () => {
    expect(feetToMetres(metresToFeet(37))).toBeCloseTo(37, 3); });
  it("metres->feet->metres roundtrip 38", () => {
    expect(feetToMetres(metresToFeet(38))).toBeCloseTo(38, 3); });
  it("metres->feet->metres roundtrip 39", () => {
    expect(feetToMetres(metresToFeet(39))).toBeCloseTo(39, 3); });
  it("metres->feet->metres roundtrip 40", () => {
    expect(feetToMetres(metresToFeet(40))).toBeCloseTo(40, 3); });
  it("metres->feet->metres roundtrip 41", () => {
    expect(feetToMetres(metresToFeet(41))).toBeCloseTo(41, 3); });
  it("metres->feet->metres roundtrip 42", () => {
    expect(feetToMetres(metresToFeet(42))).toBeCloseTo(42, 3); });
  it("metres->feet->metres roundtrip 43", () => {
    expect(feetToMetres(metresToFeet(43))).toBeCloseTo(43, 3); });
  it("metres->feet->metres roundtrip 44", () => {
    expect(feetToMetres(metresToFeet(44))).toBeCloseTo(44, 3); });
  it("metres->feet->metres roundtrip 45", () => {
    expect(feetToMetres(metresToFeet(45))).toBeCloseTo(45, 3); });
  it("metres->feet->metres roundtrip 46", () => {
    expect(feetToMetres(metresToFeet(46))).toBeCloseTo(46, 3); });
  it("metres->feet->metres roundtrip 47", () => {
    expect(feetToMetres(metresToFeet(47))).toBeCloseTo(47, 3); });
  it("metres->feet->metres roundtrip 48", () => {
    expect(feetToMetres(metresToFeet(48))).toBeCloseTo(48, 3); });
  it("metres->feet->metres roundtrip 49", () => {
    expect(feetToMetres(metresToFeet(49))).toBeCloseTo(49, 3); });
  it("metres->feet->metres roundtrip 50", () => {
    expect(feetToMetres(metresToFeet(50))).toBeCloseTo(50, 3); });
  it("metres->feet->metres roundtrip 51", () => {
    expect(feetToMetres(metresToFeet(51))).toBeCloseTo(51, 3); });
  it("metres->feet->metres roundtrip 52", () => {
    expect(feetToMetres(metresToFeet(52))).toBeCloseTo(52, 3); });
  it("metres->feet->metres roundtrip 53", () => {
    expect(feetToMetres(metresToFeet(53))).toBeCloseTo(53, 3); });
  it("metres->feet->metres roundtrip 54", () => {
    expect(feetToMetres(metresToFeet(54))).toBeCloseTo(54, 3); });
  it("metres->feet->metres roundtrip 55", () => {
    expect(feetToMetres(metresToFeet(55))).toBeCloseTo(55, 3); });
  it("metres->feet->metres roundtrip 56", () => {
    expect(feetToMetres(metresToFeet(56))).toBeCloseTo(56, 3); });
  it("metres->feet->metres roundtrip 57", () => {
    expect(feetToMetres(metresToFeet(57))).toBeCloseTo(57, 3); });
  it("metres->feet->metres roundtrip 58", () => {
    expect(feetToMetres(metresToFeet(58))).toBeCloseTo(58, 3); });
  it("metres->feet->metres roundtrip 59", () => {
    expect(feetToMetres(metresToFeet(59))).toBeCloseTo(59, 3); });
  it("metres->feet->metres roundtrip 60", () => {
    expect(feetToMetres(metresToFeet(60))).toBeCloseTo(60, 3); });
  it("metres->feet->metres roundtrip 61", () => {
    expect(feetToMetres(metresToFeet(61))).toBeCloseTo(61, 3); });
  it("metres->feet->metres roundtrip 62", () => {
    expect(feetToMetres(metresToFeet(62))).toBeCloseTo(62, 3); });
  it("metres->feet->metres roundtrip 63", () => {
    expect(feetToMetres(metresToFeet(63))).toBeCloseTo(63, 3); });
  it("metres->feet->metres roundtrip 64", () => {
    expect(feetToMetres(metresToFeet(64))).toBeCloseTo(64, 3); });
  it("metres->feet->metres roundtrip 65", () => {
    expect(feetToMetres(metresToFeet(65))).toBeCloseTo(65, 3); });
  it("metres->feet->metres roundtrip 66", () => {
    expect(feetToMetres(metresToFeet(66))).toBeCloseTo(66, 3); });
  it("metres->feet->metres roundtrip 67", () => {
    expect(feetToMetres(metresToFeet(67))).toBeCloseTo(67, 3); });
  it("metres->feet->metres roundtrip 68", () => {
    expect(feetToMetres(metresToFeet(68))).toBeCloseTo(68, 3); });
  it("metres->feet->metres roundtrip 69", () => {
    expect(feetToMetres(metresToFeet(69))).toBeCloseTo(69, 3); });
  it("metres->feet->metres roundtrip 70", () => {
    expect(feetToMetres(metresToFeet(70))).toBeCloseTo(70, 3); });
  it("metres->feet->metres roundtrip 71", () => {
    expect(feetToMetres(metresToFeet(71))).toBeCloseTo(71, 3); });
  it("metres->feet->metres roundtrip 72", () => {
    expect(feetToMetres(metresToFeet(72))).toBeCloseTo(72, 3); });
  it("metres->feet->metres roundtrip 73", () => {
    expect(feetToMetres(metresToFeet(73))).toBeCloseTo(73, 3); });
  it("metres->feet->metres roundtrip 74", () => {
    expect(feetToMetres(metresToFeet(74))).toBeCloseTo(74, 3); });
  it("metres->feet->metres roundtrip 75", () => {
    expect(feetToMetres(metresToFeet(75))).toBeCloseTo(75, 3); });
  it("metres->feet->metres roundtrip 76", () => {
    expect(feetToMetres(metresToFeet(76))).toBeCloseTo(76, 3); });
  it("metres->feet->metres roundtrip 77", () => {
    expect(feetToMetres(metresToFeet(77))).toBeCloseTo(77, 3); });
  it("metres->feet->metres roundtrip 78", () => {
    expect(feetToMetres(metresToFeet(78))).toBeCloseTo(78, 3); });
  it("metres->feet->metres roundtrip 79", () => {
    expect(feetToMetres(metresToFeet(79))).toBeCloseTo(79, 3); });
  it("metres->feet->metres roundtrip 80", () => {
    expect(feetToMetres(metresToFeet(80))).toBeCloseTo(80, 3); });
  it("metres->feet->metres roundtrip 81", () => {
    expect(feetToMetres(metresToFeet(81))).toBeCloseTo(81, 3); });
  it("metres->feet->metres roundtrip 82", () => {
    expect(feetToMetres(metresToFeet(82))).toBeCloseTo(82, 3); });
  it("metres->feet->metres roundtrip 83", () => {
    expect(feetToMetres(metresToFeet(83))).toBeCloseTo(83, 3); });
  it("metres->feet->metres roundtrip 84", () => {
    expect(feetToMetres(metresToFeet(84))).toBeCloseTo(84, 3); });
  it("metres->feet->metres roundtrip 85", () => {
    expect(feetToMetres(metresToFeet(85))).toBeCloseTo(85, 3); });
  it("metres->feet->metres roundtrip 86", () => {
    expect(feetToMetres(metresToFeet(86))).toBeCloseTo(86, 3); });
  it("metres->feet->metres roundtrip 87", () => {
    expect(feetToMetres(metresToFeet(87))).toBeCloseTo(87, 3); });
  it("metres->feet->metres roundtrip 88", () => {
    expect(feetToMetres(metresToFeet(88))).toBeCloseTo(88, 3); });
  it("metres->feet->metres roundtrip 89", () => {
    expect(feetToMetres(metresToFeet(89))).toBeCloseTo(89, 3); });
  it("metres->feet->metres roundtrip 90", () => {
    expect(feetToMetres(metresToFeet(90))).toBeCloseTo(90, 3); });
  it("metres->feet->metres roundtrip 91", () => {
    expect(feetToMetres(metresToFeet(91))).toBeCloseTo(91, 3); });
  it("metres->feet->metres roundtrip 92", () => {
    expect(feetToMetres(metresToFeet(92))).toBeCloseTo(92, 3); });
  it("metres->feet->metres roundtrip 93", () => {
    expect(feetToMetres(metresToFeet(93))).toBeCloseTo(93, 3); });
  it("metres->feet->metres roundtrip 94", () => {
    expect(feetToMetres(metresToFeet(94))).toBeCloseTo(94, 3); });
  it("metres->feet->metres roundtrip 95", () => {
    expect(feetToMetres(metresToFeet(95))).toBeCloseTo(95, 3); });
  it("metres->feet->metres roundtrip 96", () => {
    expect(feetToMetres(metresToFeet(96))).toBeCloseTo(96, 3); });
  it("metres->feet->metres roundtrip 97", () => {
    expect(feetToMetres(metresToFeet(97))).toBeCloseTo(97, 3); });
  it("metres->feet->metres roundtrip 98", () => {
    expect(feetToMetres(metresToFeet(98))).toBeCloseTo(98, 3); });
  it("metres->feet->metres roundtrip 99", () => {
    expect(feetToMetres(metresToFeet(99))).toBeCloseTo(99, 3); });
  it("metres->feet->metres roundtrip 100", () => {
    expect(feetToMetres(metresToFeet(100))).toBeCloseTo(100, 3); });
  it("metres->feet->metres roundtrip 101", () => {
    expect(feetToMetres(metresToFeet(101))).toBeCloseTo(101, 3); });
  it("metres->feet->metres roundtrip 102", () => {
    expect(feetToMetres(metresToFeet(102))).toBeCloseTo(102, 3); });
  it("metres->feet->metres roundtrip 103", () => {
    expect(feetToMetres(metresToFeet(103))).toBeCloseTo(103, 3); });
  it("metres->feet->metres roundtrip 104", () => {
    expect(feetToMetres(metresToFeet(104))).toBeCloseTo(104, 3); });
  it("metres->feet->metres roundtrip 105", () => {
    expect(feetToMetres(metresToFeet(105))).toBeCloseTo(105, 3); });
  it("metres->feet->metres roundtrip 106", () => {
    expect(feetToMetres(metresToFeet(106))).toBeCloseTo(106, 3); });
  it("metres->feet->metres roundtrip 107", () => {
    expect(feetToMetres(metresToFeet(107))).toBeCloseTo(107, 3); });
  it("metres->feet->metres roundtrip 108", () => {
    expect(feetToMetres(metresToFeet(108))).toBeCloseTo(108, 3); });
  it("metres->feet->metres roundtrip 109", () => {
    expect(feetToMetres(metresToFeet(109))).toBeCloseTo(109, 3); });
  it("metres->feet->metres roundtrip 110", () => {
    expect(feetToMetres(metresToFeet(110))).toBeCloseTo(110, 3); });
  it("metres->feet->metres roundtrip 111", () => {
    expect(feetToMetres(metresToFeet(111))).toBeCloseTo(111, 3); });
  it("metres->feet->metres roundtrip 112", () => {
    expect(feetToMetres(metresToFeet(112))).toBeCloseTo(112, 3); });
  it("metres->feet->metres roundtrip 113", () => {
    expect(feetToMetres(metresToFeet(113))).toBeCloseTo(113, 3); });
  it("metres->feet->metres roundtrip 114", () => {
    expect(feetToMetres(metresToFeet(114))).toBeCloseTo(114, 3); });
  it("metres->feet->metres roundtrip 115", () => {
    expect(feetToMetres(metresToFeet(115))).toBeCloseTo(115, 3); });
  it("metres->feet->metres roundtrip 116", () => {
    expect(feetToMetres(metresToFeet(116))).toBeCloseTo(116, 3); });
  it("metres->feet->metres roundtrip 117", () => {
    expect(feetToMetres(metresToFeet(117))).toBeCloseTo(117, 3); });
  it("metres->feet->metres roundtrip 118", () => {
    expect(feetToMetres(metresToFeet(118))).toBeCloseTo(118, 3); });
  it("metres->feet->metres roundtrip 119", () => {
    expect(feetToMetres(metresToFeet(119))).toBeCloseTo(119, 3); });
  it("metres->feet->metres roundtrip 120", () => {
    expect(feetToMetres(metresToFeet(120))).toBeCloseTo(120, 3); });
  it("metres->feet->metres roundtrip 121", () => {
    expect(feetToMetres(metresToFeet(121))).toBeCloseTo(121, 3); });
  it("metres->feet->metres roundtrip 122", () => {
    expect(feetToMetres(metresToFeet(122))).toBeCloseTo(122, 3); });
  it("metres->feet->metres roundtrip 123", () => {
    expect(feetToMetres(metresToFeet(123))).toBeCloseTo(123, 3); });
  it("metres->feet->metres roundtrip 124", () => {
    expect(feetToMetres(metresToFeet(124))).toBeCloseTo(124, 3); });
  it("metres->feet->metres roundtrip 125", () => {
    expect(feetToMetres(metresToFeet(125))).toBeCloseTo(125, 3); });
  it("metres->feet->metres roundtrip 126", () => {
    expect(feetToMetres(metresToFeet(126))).toBeCloseTo(126, 3); });
  it("metres->feet->metres roundtrip 127", () => {
    expect(feetToMetres(metresToFeet(127))).toBeCloseTo(127, 3); });
  it("metres->feet->metres roundtrip 128", () => {
    expect(feetToMetres(metresToFeet(128))).toBeCloseTo(128, 3); });
  it("metres->feet->metres roundtrip 129", () => {
    expect(feetToMetres(metresToFeet(129))).toBeCloseTo(129, 3); });
  it("metres->feet->metres roundtrip 130", () => {
    expect(feetToMetres(metresToFeet(130))).toBeCloseTo(130, 3); });
  it("metres->feet->metres roundtrip 131", () => {
    expect(feetToMetres(metresToFeet(131))).toBeCloseTo(131, 3); });
  it("metres->feet->metres roundtrip 132", () => {
    expect(feetToMetres(metresToFeet(132))).toBeCloseTo(132, 3); });
  it("metres->feet->metres roundtrip 133", () => {
    expect(feetToMetres(metresToFeet(133))).toBeCloseTo(133, 3); });
  it("metres->feet->metres roundtrip 134", () => {
    expect(feetToMetres(metresToFeet(134))).toBeCloseTo(134, 3); });
  it("metres->feet->metres roundtrip 135", () => {
    expect(feetToMetres(metresToFeet(135))).toBeCloseTo(135, 3); });
  it("metres->feet->metres roundtrip 136", () => {
    expect(feetToMetres(metresToFeet(136))).toBeCloseTo(136, 3); });
  it("metres->feet->metres roundtrip 137", () => {
    expect(feetToMetres(metresToFeet(137))).toBeCloseTo(137, 3); });
  it("metres->feet->metres roundtrip 138", () => {
    expect(feetToMetres(metresToFeet(138))).toBeCloseTo(138, 3); });
  it("metres->feet->metres roundtrip 139", () => {
    expect(feetToMetres(metresToFeet(139))).toBeCloseTo(139, 3); });
  it("metres->feet->metres roundtrip 140", () => {
    expect(feetToMetres(metresToFeet(140))).toBeCloseTo(140, 3); });
  it("metres->feet->metres roundtrip 141", () => {
    expect(feetToMetres(metresToFeet(141))).toBeCloseTo(141, 3); });
  it("metres->feet->metres roundtrip 142", () => {
    expect(feetToMetres(metresToFeet(142))).toBeCloseTo(142, 3); });
  it("metres->feet->metres roundtrip 143", () => {
    expect(feetToMetres(metresToFeet(143))).toBeCloseTo(143, 3); });
  it("metres->feet->metres roundtrip 144", () => {
    expect(feetToMetres(metresToFeet(144))).toBeCloseTo(144, 3); });
  it("metres->feet->metres roundtrip 145", () => {
    expect(feetToMetres(metresToFeet(145))).toBeCloseTo(145, 3); });
  it("metres->feet->metres roundtrip 146", () => {
    expect(feetToMetres(metresToFeet(146))).toBeCloseTo(146, 3); });
  it("metres->feet->metres roundtrip 147", () => {
    expect(feetToMetres(metresToFeet(147))).toBeCloseTo(147, 3); });
  it("metres->feet->metres roundtrip 148", () => {
    expect(feetToMetres(metresToFeet(148))).toBeCloseTo(148, 3); });
  it("metres->feet->metres roundtrip 149", () => {
    expect(feetToMetres(metresToFeet(149))).toBeCloseTo(149, 3); });
  it("metres->feet->metres roundtrip 150", () => {
    expect(feetToMetres(metresToFeet(150))).toBeCloseTo(150, 3); });
  it("metres->feet->metres roundtrip 151", () => {
    expect(feetToMetres(metresToFeet(151))).toBeCloseTo(151, 3); });
  it("metres->feet->metres roundtrip 152", () => {
    expect(feetToMetres(metresToFeet(152))).toBeCloseTo(152, 3); });
  it("metres->feet->metres roundtrip 153", () => {
    expect(feetToMetres(metresToFeet(153))).toBeCloseTo(153, 3); });
  it("metres->feet->metres roundtrip 154", () => {
    expect(feetToMetres(metresToFeet(154))).toBeCloseTo(154, 3); });
  it("metres->feet->metres roundtrip 155", () => {
    expect(feetToMetres(metresToFeet(155))).toBeCloseTo(155, 3); });
  it("metres->feet->metres roundtrip 156", () => {
    expect(feetToMetres(metresToFeet(156))).toBeCloseTo(156, 3); });
  it("metres->feet->metres roundtrip 157", () => {
    expect(feetToMetres(metresToFeet(157))).toBeCloseTo(157, 3); });
  it("metres->feet->metres roundtrip 158", () => {
    expect(feetToMetres(metresToFeet(158))).toBeCloseTo(158, 3); });
  it("metres->feet->metres roundtrip 159", () => {
    expect(feetToMetres(metresToFeet(159))).toBeCloseTo(159, 3); });
  it("metres->feet->metres roundtrip 160", () => {
    expect(feetToMetres(metresToFeet(160))).toBeCloseTo(160, 3); });
  it("metres->feet->metres roundtrip 161", () => {
    expect(feetToMetres(metresToFeet(161))).toBeCloseTo(161, 3); });
  it("metres->feet->metres roundtrip 162", () => {
    expect(feetToMetres(metresToFeet(162))).toBeCloseTo(162, 3); });
  it("metres->feet->metres roundtrip 163", () => {
    expect(feetToMetres(metresToFeet(163))).toBeCloseTo(163, 3); });
  it("metres->feet->metres roundtrip 164", () => {
    expect(feetToMetres(metresToFeet(164))).toBeCloseTo(164, 3); });
  it("metres->feet->metres roundtrip 165", () => {
    expect(feetToMetres(metresToFeet(165))).toBeCloseTo(165, 3); });
  it("metres->feet->metres roundtrip 166", () => {
    expect(feetToMetres(metresToFeet(166))).toBeCloseTo(166, 3); });
  it("metres->feet->metres roundtrip 167", () => {
    expect(feetToMetres(metresToFeet(167))).toBeCloseTo(167, 3); });
  it("metres->feet->metres roundtrip 168", () => {
    expect(feetToMetres(metresToFeet(168))).toBeCloseTo(168, 3); });
  it("metres->feet->metres roundtrip 169", () => {
    expect(feetToMetres(metresToFeet(169))).toBeCloseTo(169, 3); });
  it("metres->feet->metres roundtrip 170", () => {
    expect(feetToMetres(metresToFeet(170))).toBeCloseTo(170, 3); });
  it("metres->feet->metres roundtrip 171", () => {
    expect(feetToMetres(metresToFeet(171))).toBeCloseTo(171, 3); });
  it("metres->feet->metres roundtrip 172", () => {
    expect(feetToMetres(metresToFeet(172))).toBeCloseTo(172, 3); });
  it("metres->feet->metres roundtrip 173", () => {
    expect(feetToMetres(metresToFeet(173))).toBeCloseTo(173, 3); });
  it("metres->feet->metres roundtrip 174", () => {
    expect(feetToMetres(metresToFeet(174))).toBeCloseTo(174, 3); });
  it("metres->feet->metres roundtrip 175", () => {
    expect(feetToMetres(metresToFeet(175))).toBeCloseTo(175, 3); });
  it("metres->feet->metres roundtrip 176", () => {
    expect(feetToMetres(metresToFeet(176))).toBeCloseTo(176, 3); });
  it("metres->feet->metres roundtrip 177", () => {
    expect(feetToMetres(metresToFeet(177))).toBeCloseTo(177, 3); });
  it("metres->feet->metres roundtrip 178", () => {
    expect(feetToMetres(metresToFeet(178))).toBeCloseTo(178, 3); });
  it("metres->feet->metres roundtrip 179", () => {
    expect(feetToMetres(metresToFeet(179))).toBeCloseTo(179, 3); });
  it("metres->feet->metres roundtrip 180", () => {
    expect(feetToMetres(metresToFeet(180))).toBeCloseTo(180, 3); });
  it("metres->feet->metres roundtrip 181", () => {
    expect(feetToMetres(metresToFeet(181))).toBeCloseTo(181, 3); });
  it("metres->feet->metres roundtrip 182", () => {
    expect(feetToMetres(metresToFeet(182))).toBeCloseTo(182, 3); });
  it("metres->feet->metres roundtrip 183", () => {
    expect(feetToMetres(metresToFeet(183))).toBeCloseTo(183, 3); });
  it("metres->feet->metres roundtrip 184", () => {
    expect(feetToMetres(metresToFeet(184))).toBeCloseTo(184, 3); });
  it("metres->feet->metres roundtrip 185", () => {
    expect(feetToMetres(metresToFeet(185))).toBeCloseTo(185, 3); });
  it("metres->feet->metres roundtrip 186", () => {
    expect(feetToMetres(metresToFeet(186))).toBeCloseTo(186, 3); });
  it("metres->feet->metres roundtrip 187", () => {
    expect(feetToMetres(metresToFeet(187))).toBeCloseTo(187, 3); });
  it("metres->feet->metres roundtrip 188", () => {
    expect(feetToMetres(metresToFeet(188))).toBeCloseTo(188, 3); });
  it("metres->feet->metres roundtrip 189", () => {
    expect(feetToMetres(metresToFeet(189))).toBeCloseTo(189, 3); });
  it("metres->feet->metres roundtrip 190", () => {
    expect(feetToMetres(metresToFeet(190))).toBeCloseTo(190, 3); });
  it("metres->feet->metres roundtrip 191", () => {
    expect(feetToMetres(metresToFeet(191))).toBeCloseTo(191, 3); });
  it("metres->feet->metres roundtrip 192", () => {
    expect(feetToMetres(metresToFeet(192))).toBeCloseTo(192, 3); });
  it("metres->feet->metres roundtrip 193", () => {
    expect(feetToMetres(metresToFeet(193))).toBeCloseTo(193, 3); });
  it("metres->feet->metres roundtrip 194", () => {
    expect(feetToMetres(metresToFeet(194))).toBeCloseTo(194, 3); });
  it("metres->feet->metres roundtrip 195", () => {
    expect(feetToMetres(metresToFeet(195))).toBeCloseTo(195, 3); });
  it("metres->feet->metres roundtrip 196", () => {
    expect(feetToMetres(metresToFeet(196))).toBeCloseTo(196, 3); });
  it("metres->feet->metres roundtrip 197", () => {
    expect(feetToMetres(metresToFeet(197))).toBeCloseTo(197, 3); });
});

describe("weight conversions", () => {
  it("1kg is ~2.205lbs", () => { expect(round(kilogramsToPounds(1), 3)).toBe(2.205); });
  it("poundsToKilograms roundtrip", () => { expect(round(poundsToKilograms(kilogramsToPounds(1)), 5)).toBeCloseTo(1, 4); });
  it("kg->lb->kg roundtrip 1", () => {
    expect(poundsToKilograms(kilogramsToPounds(1))).toBeCloseTo(1, 3); });
  it("kg->lb->kg roundtrip 2", () => {
    expect(poundsToKilograms(kilogramsToPounds(2))).toBeCloseTo(2, 3); });
  it("kg->lb->kg roundtrip 3", () => {
    expect(poundsToKilograms(kilogramsToPounds(3))).toBeCloseTo(3, 3); });
  it("kg->lb->kg roundtrip 4", () => {
    expect(poundsToKilograms(kilogramsToPounds(4))).toBeCloseTo(4, 3); });
  it("kg->lb->kg roundtrip 5", () => {
    expect(poundsToKilograms(kilogramsToPounds(5))).toBeCloseTo(5, 3); });
  it("kg->lb->kg roundtrip 6", () => {
    expect(poundsToKilograms(kilogramsToPounds(6))).toBeCloseTo(6, 3); });
  it("kg->lb->kg roundtrip 7", () => {
    expect(poundsToKilograms(kilogramsToPounds(7))).toBeCloseTo(7, 3); });
  it("kg->lb->kg roundtrip 8", () => {
    expect(poundsToKilograms(kilogramsToPounds(8))).toBeCloseTo(8, 3); });
  it("kg->lb->kg roundtrip 9", () => {
    expect(poundsToKilograms(kilogramsToPounds(9))).toBeCloseTo(9, 3); });
  it("kg->lb->kg roundtrip 10", () => {
    expect(poundsToKilograms(kilogramsToPounds(10))).toBeCloseTo(10, 3); });
  it("kg->lb->kg roundtrip 11", () => {
    expect(poundsToKilograms(kilogramsToPounds(11))).toBeCloseTo(11, 3); });
  it("kg->lb->kg roundtrip 12", () => {
    expect(poundsToKilograms(kilogramsToPounds(12))).toBeCloseTo(12, 3); });
  it("kg->lb->kg roundtrip 13", () => {
    expect(poundsToKilograms(kilogramsToPounds(13))).toBeCloseTo(13, 3); });
  it("kg->lb->kg roundtrip 14", () => {
    expect(poundsToKilograms(kilogramsToPounds(14))).toBeCloseTo(14, 3); });
  it("kg->lb->kg roundtrip 15", () => {
    expect(poundsToKilograms(kilogramsToPounds(15))).toBeCloseTo(15, 3); });
  it("kg->lb->kg roundtrip 16", () => {
    expect(poundsToKilograms(kilogramsToPounds(16))).toBeCloseTo(16, 3); });
  it("kg->lb->kg roundtrip 17", () => {
    expect(poundsToKilograms(kilogramsToPounds(17))).toBeCloseTo(17, 3); });
  it("kg->lb->kg roundtrip 18", () => {
    expect(poundsToKilograms(kilogramsToPounds(18))).toBeCloseTo(18, 3); });
  it("kg->lb->kg roundtrip 19", () => {
    expect(poundsToKilograms(kilogramsToPounds(19))).toBeCloseTo(19, 3); });
  it("kg->lb->kg roundtrip 20", () => {
    expect(poundsToKilograms(kilogramsToPounds(20))).toBeCloseTo(20, 3); });
  it("kg->lb->kg roundtrip 21", () => {
    expect(poundsToKilograms(kilogramsToPounds(21))).toBeCloseTo(21, 3); });
  it("kg->lb->kg roundtrip 22", () => {
    expect(poundsToKilograms(kilogramsToPounds(22))).toBeCloseTo(22, 3); });
  it("kg->lb->kg roundtrip 23", () => {
    expect(poundsToKilograms(kilogramsToPounds(23))).toBeCloseTo(23, 3); });
  it("kg->lb->kg roundtrip 24", () => {
    expect(poundsToKilograms(kilogramsToPounds(24))).toBeCloseTo(24, 3); });
  it("kg->lb->kg roundtrip 25", () => {
    expect(poundsToKilograms(kilogramsToPounds(25))).toBeCloseTo(25, 3); });
  it("kg->lb->kg roundtrip 26", () => {
    expect(poundsToKilograms(kilogramsToPounds(26))).toBeCloseTo(26, 3); });
  it("kg->lb->kg roundtrip 27", () => {
    expect(poundsToKilograms(kilogramsToPounds(27))).toBeCloseTo(27, 3); });
  it("kg->lb->kg roundtrip 28", () => {
    expect(poundsToKilograms(kilogramsToPounds(28))).toBeCloseTo(28, 3); });
  it("kg->lb->kg roundtrip 29", () => {
    expect(poundsToKilograms(kilogramsToPounds(29))).toBeCloseTo(29, 3); });
  it("kg->lb->kg roundtrip 30", () => {
    expect(poundsToKilograms(kilogramsToPounds(30))).toBeCloseTo(30, 3); });
  it("kg->lb->kg roundtrip 31", () => {
    expect(poundsToKilograms(kilogramsToPounds(31))).toBeCloseTo(31, 3); });
  it("kg->lb->kg roundtrip 32", () => {
    expect(poundsToKilograms(kilogramsToPounds(32))).toBeCloseTo(32, 3); });
  it("kg->lb->kg roundtrip 33", () => {
    expect(poundsToKilograms(kilogramsToPounds(33))).toBeCloseTo(33, 3); });
  it("kg->lb->kg roundtrip 34", () => {
    expect(poundsToKilograms(kilogramsToPounds(34))).toBeCloseTo(34, 3); });
  it("kg->lb->kg roundtrip 35", () => {
    expect(poundsToKilograms(kilogramsToPounds(35))).toBeCloseTo(35, 3); });
  it("kg->lb->kg roundtrip 36", () => {
    expect(poundsToKilograms(kilogramsToPounds(36))).toBeCloseTo(36, 3); });
  it("kg->lb->kg roundtrip 37", () => {
    expect(poundsToKilograms(kilogramsToPounds(37))).toBeCloseTo(37, 3); });
  it("kg->lb->kg roundtrip 38", () => {
    expect(poundsToKilograms(kilogramsToPounds(38))).toBeCloseTo(38, 3); });
  it("kg->lb->kg roundtrip 39", () => {
    expect(poundsToKilograms(kilogramsToPounds(39))).toBeCloseTo(39, 3); });
  it("kg->lb->kg roundtrip 40", () => {
    expect(poundsToKilograms(kilogramsToPounds(40))).toBeCloseTo(40, 3); });
  it("kg->lb->kg roundtrip 41", () => {
    expect(poundsToKilograms(kilogramsToPounds(41))).toBeCloseTo(41, 3); });
  it("kg->lb->kg roundtrip 42", () => {
    expect(poundsToKilograms(kilogramsToPounds(42))).toBeCloseTo(42, 3); });
  it("kg->lb->kg roundtrip 43", () => {
    expect(poundsToKilograms(kilogramsToPounds(43))).toBeCloseTo(43, 3); });
  it("kg->lb->kg roundtrip 44", () => {
    expect(poundsToKilograms(kilogramsToPounds(44))).toBeCloseTo(44, 3); });
  it("kg->lb->kg roundtrip 45", () => {
    expect(poundsToKilograms(kilogramsToPounds(45))).toBeCloseTo(45, 3); });
  it("kg->lb->kg roundtrip 46", () => {
    expect(poundsToKilograms(kilogramsToPounds(46))).toBeCloseTo(46, 3); });
  it("kg->lb->kg roundtrip 47", () => {
    expect(poundsToKilograms(kilogramsToPounds(47))).toBeCloseTo(47, 3); });
  it("kg->lb->kg roundtrip 48", () => {
    expect(poundsToKilograms(kilogramsToPounds(48))).toBeCloseTo(48, 3); });
  it("kg->lb->kg roundtrip 49", () => {
    expect(poundsToKilograms(kilogramsToPounds(49))).toBeCloseTo(49, 3); });
  it("kg->lb->kg roundtrip 50", () => {
    expect(poundsToKilograms(kilogramsToPounds(50))).toBeCloseTo(50, 3); });
  it("kg->lb->kg roundtrip 51", () => {
    expect(poundsToKilograms(kilogramsToPounds(51))).toBeCloseTo(51, 3); });
  it("kg->lb->kg roundtrip 52", () => {
    expect(poundsToKilograms(kilogramsToPounds(52))).toBeCloseTo(52, 3); });
  it("kg->lb->kg roundtrip 53", () => {
    expect(poundsToKilograms(kilogramsToPounds(53))).toBeCloseTo(53, 3); });
  it("kg->lb->kg roundtrip 54", () => {
    expect(poundsToKilograms(kilogramsToPounds(54))).toBeCloseTo(54, 3); });
  it("kg->lb->kg roundtrip 55", () => {
    expect(poundsToKilograms(kilogramsToPounds(55))).toBeCloseTo(55, 3); });
  it("kg->lb->kg roundtrip 56", () => {
    expect(poundsToKilograms(kilogramsToPounds(56))).toBeCloseTo(56, 3); });
  it("kg->lb->kg roundtrip 57", () => {
    expect(poundsToKilograms(kilogramsToPounds(57))).toBeCloseTo(57, 3); });
  it("kg->lb->kg roundtrip 58", () => {
    expect(poundsToKilograms(kilogramsToPounds(58))).toBeCloseTo(58, 3); });
  it("kg->lb->kg roundtrip 59", () => {
    expect(poundsToKilograms(kilogramsToPounds(59))).toBeCloseTo(59, 3); });
  it("kg->lb->kg roundtrip 60", () => {
    expect(poundsToKilograms(kilogramsToPounds(60))).toBeCloseTo(60, 3); });
  it("kg->lb->kg roundtrip 61", () => {
    expect(poundsToKilograms(kilogramsToPounds(61))).toBeCloseTo(61, 3); });
  it("kg->lb->kg roundtrip 62", () => {
    expect(poundsToKilograms(kilogramsToPounds(62))).toBeCloseTo(62, 3); });
  it("kg->lb->kg roundtrip 63", () => {
    expect(poundsToKilograms(kilogramsToPounds(63))).toBeCloseTo(63, 3); });
  it("kg->lb->kg roundtrip 64", () => {
    expect(poundsToKilograms(kilogramsToPounds(64))).toBeCloseTo(64, 3); });
  it("kg->lb->kg roundtrip 65", () => {
    expect(poundsToKilograms(kilogramsToPounds(65))).toBeCloseTo(65, 3); });
  it("kg->lb->kg roundtrip 66", () => {
    expect(poundsToKilograms(kilogramsToPounds(66))).toBeCloseTo(66, 3); });
  it("kg->lb->kg roundtrip 67", () => {
    expect(poundsToKilograms(kilogramsToPounds(67))).toBeCloseTo(67, 3); });
  it("kg->lb->kg roundtrip 68", () => {
    expect(poundsToKilograms(kilogramsToPounds(68))).toBeCloseTo(68, 3); });
  it("kg->lb->kg roundtrip 69", () => {
    expect(poundsToKilograms(kilogramsToPounds(69))).toBeCloseTo(69, 3); });
  it("kg->lb->kg roundtrip 70", () => {
    expect(poundsToKilograms(kilogramsToPounds(70))).toBeCloseTo(70, 3); });
  it("kg->lb->kg roundtrip 71", () => {
    expect(poundsToKilograms(kilogramsToPounds(71))).toBeCloseTo(71, 3); });
  it("kg->lb->kg roundtrip 72", () => {
    expect(poundsToKilograms(kilogramsToPounds(72))).toBeCloseTo(72, 3); });
  it("kg->lb->kg roundtrip 73", () => {
    expect(poundsToKilograms(kilogramsToPounds(73))).toBeCloseTo(73, 3); });
  it("kg->lb->kg roundtrip 74", () => {
    expect(poundsToKilograms(kilogramsToPounds(74))).toBeCloseTo(74, 3); });
  it("kg->lb->kg roundtrip 75", () => {
    expect(poundsToKilograms(kilogramsToPounds(75))).toBeCloseTo(75, 3); });
  it("kg->lb->kg roundtrip 76", () => {
    expect(poundsToKilograms(kilogramsToPounds(76))).toBeCloseTo(76, 3); });
  it("kg->lb->kg roundtrip 77", () => {
    expect(poundsToKilograms(kilogramsToPounds(77))).toBeCloseTo(77, 3); });
  it("kg->lb->kg roundtrip 78", () => {
    expect(poundsToKilograms(kilogramsToPounds(78))).toBeCloseTo(78, 3); });
  it("kg->lb->kg roundtrip 79", () => {
    expect(poundsToKilograms(kilogramsToPounds(79))).toBeCloseTo(79, 3); });
  it("kg->lb->kg roundtrip 80", () => {
    expect(poundsToKilograms(kilogramsToPounds(80))).toBeCloseTo(80, 3); });
  it("kg->lb->kg roundtrip 81", () => {
    expect(poundsToKilograms(kilogramsToPounds(81))).toBeCloseTo(81, 3); });
  it("kg->lb->kg roundtrip 82", () => {
    expect(poundsToKilograms(kilogramsToPounds(82))).toBeCloseTo(82, 3); });
  it("kg->lb->kg roundtrip 83", () => {
    expect(poundsToKilograms(kilogramsToPounds(83))).toBeCloseTo(83, 3); });
  it("kg->lb->kg roundtrip 84", () => {
    expect(poundsToKilograms(kilogramsToPounds(84))).toBeCloseTo(84, 3); });
  it("kg->lb->kg roundtrip 85", () => {
    expect(poundsToKilograms(kilogramsToPounds(85))).toBeCloseTo(85, 3); });
  it("kg->lb->kg roundtrip 86", () => {
    expect(poundsToKilograms(kilogramsToPounds(86))).toBeCloseTo(86, 3); });
  it("kg->lb->kg roundtrip 87", () => {
    expect(poundsToKilograms(kilogramsToPounds(87))).toBeCloseTo(87, 3); });
  it("kg->lb->kg roundtrip 88", () => {
    expect(poundsToKilograms(kilogramsToPounds(88))).toBeCloseTo(88, 3); });
  it("kg->lb->kg roundtrip 89", () => {
    expect(poundsToKilograms(kilogramsToPounds(89))).toBeCloseTo(89, 3); });
  it("kg->lb->kg roundtrip 90", () => {
    expect(poundsToKilograms(kilogramsToPounds(90))).toBeCloseTo(90, 3); });
  it("kg->lb->kg roundtrip 91", () => {
    expect(poundsToKilograms(kilogramsToPounds(91))).toBeCloseTo(91, 3); });
  it("kg->lb->kg roundtrip 92", () => {
    expect(poundsToKilograms(kilogramsToPounds(92))).toBeCloseTo(92, 3); });
  it("kg->lb->kg roundtrip 93", () => {
    expect(poundsToKilograms(kilogramsToPounds(93))).toBeCloseTo(93, 3); });
  it("kg->lb->kg roundtrip 94", () => {
    expect(poundsToKilograms(kilogramsToPounds(94))).toBeCloseTo(94, 3); });
  it("kg->lb->kg roundtrip 95", () => {
    expect(poundsToKilograms(kilogramsToPounds(95))).toBeCloseTo(95, 3); });
  it("kg->lb->kg roundtrip 96", () => {
    expect(poundsToKilograms(kilogramsToPounds(96))).toBeCloseTo(96, 3); });
  it("kg->lb->kg roundtrip 97", () => {
    expect(poundsToKilograms(kilogramsToPounds(97))).toBeCloseTo(97, 3); });
  it("kg->lb->kg roundtrip 98", () => {
    expect(poundsToKilograms(kilogramsToPounds(98))).toBeCloseTo(98, 3); });
  it("kg->lb->kg roundtrip 99", () => {
    expect(poundsToKilograms(kilogramsToPounds(99))).toBeCloseTo(99, 3); });
  it("kg->lb->kg roundtrip 100", () => {
    expect(poundsToKilograms(kilogramsToPounds(100))).toBeCloseTo(100, 3); });
  it("kg->lb->kg roundtrip 101", () => {
    expect(poundsToKilograms(kilogramsToPounds(101))).toBeCloseTo(101, 3); });
  it("kg->lb->kg roundtrip 102", () => {
    expect(poundsToKilograms(kilogramsToPounds(102))).toBeCloseTo(102, 3); });
  it("kg->lb->kg roundtrip 103", () => {
    expect(poundsToKilograms(kilogramsToPounds(103))).toBeCloseTo(103, 3); });
  it("kg->lb->kg roundtrip 104", () => {
    expect(poundsToKilograms(kilogramsToPounds(104))).toBeCloseTo(104, 3); });
  it("kg->lb->kg roundtrip 105", () => {
    expect(poundsToKilograms(kilogramsToPounds(105))).toBeCloseTo(105, 3); });
  it("kg->lb->kg roundtrip 106", () => {
    expect(poundsToKilograms(kilogramsToPounds(106))).toBeCloseTo(106, 3); });
  it("kg->lb->kg roundtrip 107", () => {
    expect(poundsToKilograms(kilogramsToPounds(107))).toBeCloseTo(107, 3); });
  it("kg->lb->kg roundtrip 108", () => {
    expect(poundsToKilograms(kilogramsToPounds(108))).toBeCloseTo(108, 3); });
  it("kg->lb->kg roundtrip 109", () => {
    expect(poundsToKilograms(kilogramsToPounds(109))).toBeCloseTo(109, 3); });
  it("kg->lb->kg roundtrip 110", () => {
    expect(poundsToKilograms(kilogramsToPounds(110))).toBeCloseTo(110, 3); });
  it("kg->lb->kg roundtrip 111", () => {
    expect(poundsToKilograms(kilogramsToPounds(111))).toBeCloseTo(111, 3); });
  it("kg->lb->kg roundtrip 112", () => {
    expect(poundsToKilograms(kilogramsToPounds(112))).toBeCloseTo(112, 3); });
  it("kg->lb->kg roundtrip 113", () => {
    expect(poundsToKilograms(kilogramsToPounds(113))).toBeCloseTo(113, 3); });
  it("kg->lb->kg roundtrip 114", () => {
    expect(poundsToKilograms(kilogramsToPounds(114))).toBeCloseTo(114, 3); });
  it("kg->lb->kg roundtrip 115", () => {
    expect(poundsToKilograms(kilogramsToPounds(115))).toBeCloseTo(115, 3); });
  it("kg->lb->kg roundtrip 116", () => {
    expect(poundsToKilograms(kilogramsToPounds(116))).toBeCloseTo(116, 3); });
  it("kg->lb->kg roundtrip 117", () => {
    expect(poundsToKilograms(kilogramsToPounds(117))).toBeCloseTo(117, 3); });
  it("kg->lb->kg roundtrip 118", () => {
    expect(poundsToKilograms(kilogramsToPounds(118))).toBeCloseTo(118, 3); });
  it("kg->lb->kg roundtrip 119", () => {
    expect(poundsToKilograms(kilogramsToPounds(119))).toBeCloseTo(119, 3); });
  it("kg->lb->kg roundtrip 120", () => {
    expect(poundsToKilograms(kilogramsToPounds(120))).toBeCloseTo(120, 3); });
  it("kg->lb->kg roundtrip 121", () => {
    expect(poundsToKilograms(kilogramsToPounds(121))).toBeCloseTo(121, 3); });
  it("kg->lb->kg roundtrip 122", () => {
    expect(poundsToKilograms(kilogramsToPounds(122))).toBeCloseTo(122, 3); });
  it("kg->lb->kg roundtrip 123", () => {
    expect(poundsToKilograms(kilogramsToPounds(123))).toBeCloseTo(123, 3); });
  it("kg->lb->kg roundtrip 124", () => {
    expect(poundsToKilograms(kilogramsToPounds(124))).toBeCloseTo(124, 3); });
  it("kg->lb->kg roundtrip 125", () => {
    expect(poundsToKilograms(kilogramsToPounds(125))).toBeCloseTo(125, 3); });
  it("kg->lb->kg roundtrip 126", () => {
    expect(poundsToKilograms(kilogramsToPounds(126))).toBeCloseTo(126, 3); });
  it("kg->lb->kg roundtrip 127", () => {
    expect(poundsToKilograms(kilogramsToPounds(127))).toBeCloseTo(127, 3); });
  it("kg->lb->kg roundtrip 128", () => {
    expect(poundsToKilograms(kilogramsToPounds(128))).toBeCloseTo(128, 3); });
  it("kg->lb->kg roundtrip 129", () => {
    expect(poundsToKilograms(kilogramsToPounds(129))).toBeCloseTo(129, 3); });
  it("kg->lb->kg roundtrip 130", () => {
    expect(poundsToKilograms(kilogramsToPounds(130))).toBeCloseTo(130, 3); });
  it("kg->lb->kg roundtrip 131", () => {
    expect(poundsToKilograms(kilogramsToPounds(131))).toBeCloseTo(131, 3); });
  it("kg->lb->kg roundtrip 132", () => {
    expect(poundsToKilograms(kilogramsToPounds(132))).toBeCloseTo(132, 3); });
  it("kg->lb->kg roundtrip 133", () => {
    expect(poundsToKilograms(kilogramsToPounds(133))).toBeCloseTo(133, 3); });
  it("kg->lb->kg roundtrip 134", () => {
    expect(poundsToKilograms(kilogramsToPounds(134))).toBeCloseTo(134, 3); });
  it("kg->lb->kg roundtrip 135", () => {
    expect(poundsToKilograms(kilogramsToPounds(135))).toBeCloseTo(135, 3); });
  it("kg->lb->kg roundtrip 136", () => {
    expect(poundsToKilograms(kilogramsToPounds(136))).toBeCloseTo(136, 3); });
  it("kg->lb->kg roundtrip 137", () => {
    expect(poundsToKilograms(kilogramsToPounds(137))).toBeCloseTo(137, 3); });
  it("kg->lb->kg roundtrip 138", () => {
    expect(poundsToKilograms(kilogramsToPounds(138))).toBeCloseTo(138, 3); });
  it("kg->lb->kg roundtrip 139", () => {
    expect(poundsToKilograms(kilogramsToPounds(139))).toBeCloseTo(139, 3); });
  it("kg->lb->kg roundtrip 140", () => {
    expect(poundsToKilograms(kilogramsToPounds(140))).toBeCloseTo(140, 3); });
  it("kg->lb->kg roundtrip 141", () => {
    expect(poundsToKilograms(kilogramsToPounds(141))).toBeCloseTo(141, 3); });
  it("kg->lb->kg roundtrip 142", () => {
    expect(poundsToKilograms(kilogramsToPounds(142))).toBeCloseTo(142, 3); });
  it("kg->lb->kg roundtrip 143", () => {
    expect(poundsToKilograms(kilogramsToPounds(143))).toBeCloseTo(143, 3); });
  it("kg->lb->kg roundtrip 144", () => {
    expect(poundsToKilograms(kilogramsToPounds(144))).toBeCloseTo(144, 3); });
  it("kg->lb->kg roundtrip 145", () => {
    expect(poundsToKilograms(kilogramsToPounds(145))).toBeCloseTo(145, 3); });
  it("kg->lb->kg roundtrip 146", () => {
    expect(poundsToKilograms(kilogramsToPounds(146))).toBeCloseTo(146, 3); });
  it("kg->lb->kg roundtrip 147", () => {
    expect(poundsToKilograms(kilogramsToPounds(147))).toBeCloseTo(147, 3); });
  it("kg->lb->kg roundtrip 148", () => {
    expect(poundsToKilograms(kilogramsToPounds(148))).toBeCloseTo(148, 3); });
});

describe("speed conversions", () => {
  it("1 mps is 3.6 kph", () => { expect(mpsToKph(1)).toBe(3.6); });
  it("3.6 kph is 1 mps", () => { expect(kphToMps(3.6)).toBe(1); });
  it("kph->mph->kph roundtrip", () => { expect(mphToKph(kphToMph(100))).toBeCloseTo(100, 3); });
  it("kph->mps->kph roundtrip 1", () => {
    expect(round(mpsToKph(kphToMps(1)), 5)).toBeCloseTo(1, 3); });
  it("kph->mps->kph roundtrip 2", () => {
    expect(round(mpsToKph(kphToMps(2)), 5)).toBeCloseTo(2, 3); });
  it("kph->mps->kph roundtrip 3", () => {
    expect(round(mpsToKph(kphToMps(3)), 5)).toBeCloseTo(3, 3); });
  it("kph->mps->kph roundtrip 4", () => {
    expect(round(mpsToKph(kphToMps(4)), 5)).toBeCloseTo(4, 3); });
  it("kph->mps->kph roundtrip 5", () => {
    expect(round(mpsToKph(kphToMps(5)), 5)).toBeCloseTo(5, 3); });
  it("kph->mps->kph roundtrip 6", () => {
    expect(round(mpsToKph(kphToMps(6)), 5)).toBeCloseTo(6, 3); });
  it("kph->mps->kph roundtrip 7", () => {
    expect(round(mpsToKph(kphToMps(7)), 5)).toBeCloseTo(7, 3); });
  it("kph->mps->kph roundtrip 8", () => {
    expect(round(mpsToKph(kphToMps(8)), 5)).toBeCloseTo(8, 3); });
  it("kph->mps->kph roundtrip 9", () => {
    expect(round(mpsToKph(kphToMps(9)), 5)).toBeCloseTo(9, 3); });
  it("kph->mps->kph roundtrip 10", () => {
    expect(round(mpsToKph(kphToMps(10)), 5)).toBeCloseTo(10, 3); });
  it("kph->mps->kph roundtrip 11", () => {
    expect(round(mpsToKph(kphToMps(11)), 5)).toBeCloseTo(11, 3); });
  it("kph->mps->kph roundtrip 12", () => {
    expect(round(mpsToKph(kphToMps(12)), 5)).toBeCloseTo(12, 3); });
  it("kph->mps->kph roundtrip 13", () => {
    expect(round(mpsToKph(kphToMps(13)), 5)).toBeCloseTo(13, 3); });
  it("kph->mps->kph roundtrip 14", () => {
    expect(round(mpsToKph(kphToMps(14)), 5)).toBeCloseTo(14, 3); });
  it("kph->mps->kph roundtrip 15", () => {
    expect(round(mpsToKph(kphToMps(15)), 5)).toBeCloseTo(15, 3); });
  it("kph->mps->kph roundtrip 16", () => {
    expect(round(mpsToKph(kphToMps(16)), 5)).toBeCloseTo(16, 3); });
  it("kph->mps->kph roundtrip 17", () => {
    expect(round(mpsToKph(kphToMps(17)), 5)).toBeCloseTo(17, 3); });
  it("kph->mps->kph roundtrip 18", () => {
    expect(round(mpsToKph(kphToMps(18)), 5)).toBeCloseTo(18, 3); });
  it("kph->mps->kph roundtrip 19", () => {
    expect(round(mpsToKph(kphToMps(19)), 5)).toBeCloseTo(19, 3); });
  it("kph->mps->kph roundtrip 20", () => {
    expect(round(mpsToKph(kphToMps(20)), 5)).toBeCloseTo(20, 3); });
  it("kph->mps->kph roundtrip 21", () => {
    expect(round(mpsToKph(kphToMps(21)), 5)).toBeCloseTo(21, 3); });
  it("kph->mps->kph roundtrip 22", () => {
    expect(round(mpsToKph(kphToMps(22)), 5)).toBeCloseTo(22, 3); });
  it("kph->mps->kph roundtrip 23", () => {
    expect(round(mpsToKph(kphToMps(23)), 5)).toBeCloseTo(23, 3); });
  it("kph->mps->kph roundtrip 24", () => {
    expect(round(mpsToKph(kphToMps(24)), 5)).toBeCloseTo(24, 3); });
  it("kph->mps->kph roundtrip 25", () => {
    expect(round(mpsToKph(kphToMps(25)), 5)).toBeCloseTo(25, 3); });
  it("kph->mps->kph roundtrip 26", () => {
    expect(round(mpsToKph(kphToMps(26)), 5)).toBeCloseTo(26, 3); });
  it("kph->mps->kph roundtrip 27", () => {
    expect(round(mpsToKph(kphToMps(27)), 5)).toBeCloseTo(27, 3); });
  it("kph->mps->kph roundtrip 28", () => {
    expect(round(mpsToKph(kphToMps(28)), 5)).toBeCloseTo(28, 3); });
  it("kph->mps->kph roundtrip 29", () => {
    expect(round(mpsToKph(kphToMps(29)), 5)).toBeCloseTo(29, 3); });
  it("kph->mps->kph roundtrip 30", () => {
    expect(round(mpsToKph(kphToMps(30)), 5)).toBeCloseTo(30, 3); });
  it("kph->mps->kph roundtrip 31", () => {
    expect(round(mpsToKph(kphToMps(31)), 5)).toBeCloseTo(31, 3); });
  it("kph->mps->kph roundtrip 32", () => {
    expect(round(mpsToKph(kphToMps(32)), 5)).toBeCloseTo(32, 3); });
  it("kph->mps->kph roundtrip 33", () => {
    expect(round(mpsToKph(kphToMps(33)), 5)).toBeCloseTo(33, 3); });
  it("kph->mps->kph roundtrip 34", () => {
    expect(round(mpsToKph(kphToMps(34)), 5)).toBeCloseTo(34, 3); });
  it("kph->mps->kph roundtrip 35", () => {
    expect(round(mpsToKph(kphToMps(35)), 5)).toBeCloseTo(35, 3); });
  it("kph->mps->kph roundtrip 36", () => {
    expect(round(mpsToKph(kphToMps(36)), 5)).toBeCloseTo(36, 3); });
  it("kph->mps->kph roundtrip 37", () => {
    expect(round(mpsToKph(kphToMps(37)), 5)).toBeCloseTo(37, 3); });
  it("kph->mps->kph roundtrip 38", () => {
    expect(round(mpsToKph(kphToMps(38)), 5)).toBeCloseTo(38, 3); });
  it("kph->mps->kph roundtrip 39", () => {
    expect(round(mpsToKph(kphToMps(39)), 5)).toBeCloseTo(39, 3); });
  it("kph->mps->kph roundtrip 40", () => {
    expect(round(mpsToKph(kphToMps(40)), 5)).toBeCloseTo(40, 3); });
  it("kph->mps->kph roundtrip 41", () => {
    expect(round(mpsToKph(kphToMps(41)), 5)).toBeCloseTo(41, 3); });
  it("kph->mps->kph roundtrip 42", () => {
    expect(round(mpsToKph(kphToMps(42)), 5)).toBeCloseTo(42, 3); });
  it("kph->mps->kph roundtrip 43", () => {
    expect(round(mpsToKph(kphToMps(43)), 5)).toBeCloseTo(43, 3); });
  it("kph->mps->kph roundtrip 44", () => {
    expect(round(mpsToKph(kphToMps(44)), 5)).toBeCloseTo(44, 3); });
  it("kph->mps->kph roundtrip 45", () => {
    expect(round(mpsToKph(kphToMps(45)), 5)).toBeCloseTo(45, 3); });
  it("kph->mps->kph roundtrip 46", () => {
    expect(round(mpsToKph(kphToMps(46)), 5)).toBeCloseTo(46, 3); });
  it("kph->mps->kph roundtrip 47", () => {
    expect(round(mpsToKph(kphToMps(47)), 5)).toBeCloseTo(47, 3); });
  it("kph->mps->kph roundtrip 48", () => {
    expect(round(mpsToKph(kphToMps(48)), 5)).toBeCloseTo(48, 3); });
  it("kph->mps->kph roundtrip 49", () => {
    expect(round(mpsToKph(kphToMps(49)), 5)).toBeCloseTo(49, 3); });
  it("kph->mps->kph roundtrip 50", () => {
    expect(round(mpsToKph(kphToMps(50)), 5)).toBeCloseTo(50, 3); });
  it("kph->mps->kph roundtrip 51", () => {
    expect(round(mpsToKph(kphToMps(51)), 5)).toBeCloseTo(51, 3); });
  it("kph->mps->kph roundtrip 52", () => {
    expect(round(mpsToKph(kphToMps(52)), 5)).toBeCloseTo(52, 3); });
  it("kph->mps->kph roundtrip 53", () => {
    expect(round(mpsToKph(kphToMps(53)), 5)).toBeCloseTo(53, 3); });
  it("kph->mps->kph roundtrip 54", () => {
    expect(round(mpsToKph(kphToMps(54)), 5)).toBeCloseTo(54, 3); });
  it("kph->mps->kph roundtrip 55", () => {
    expect(round(mpsToKph(kphToMps(55)), 5)).toBeCloseTo(55, 3); });
  it("kph->mps->kph roundtrip 56", () => {
    expect(round(mpsToKph(kphToMps(56)), 5)).toBeCloseTo(56, 3); });
  it("kph->mps->kph roundtrip 57", () => {
    expect(round(mpsToKph(kphToMps(57)), 5)).toBeCloseTo(57, 3); });
  it("kph->mps->kph roundtrip 58", () => {
    expect(round(mpsToKph(kphToMps(58)), 5)).toBeCloseTo(58, 3); });
  it("kph->mps->kph roundtrip 59", () => {
    expect(round(mpsToKph(kphToMps(59)), 5)).toBeCloseTo(59, 3); });
  it("kph->mps->kph roundtrip 60", () => {
    expect(round(mpsToKph(kphToMps(60)), 5)).toBeCloseTo(60, 3); });
  it("kph->mps->kph roundtrip 61", () => {
    expect(round(mpsToKph(kphToMps(61)), 5)).toBeCloseTo(61, 3); });
  it("kph->mps->kph roundtrip 62", () => {
    expect(round(mpsToKph(kphToMps(62)), 5)).toBeCloseTo(62, 3); });
  it("kph->mps->kph roundtrip 63", () => {
    expect(round(mpsToKph(kphToMps(63)), 5)).toBeCloseTo(63, 3); });
  it("kph->mps->kph roundtrip 64", () => {
    expect(round(mpsToKph(kphToMps(64)), 5)).toBeCloseTo(64, 3); });
  it("kph->mps->kph roundtrip 65", () => {
    expect(round(mpsToKph(kphToMps(65)), 5)).toBeCloseTo(65, 3); });
  it("kph->mps->kph roundtrip 66", () => {
    expect(round(mpsToKph(kphToMps(66)), 5)).toBeCloseTo(66, 3); });
  it("kph->mps->kph roundtrip 67", () => {
    expect(round(mpsToKph(kphToMps(67)), 5)).toBeCloseTo(67, 3); });
  it("kph->mps->kph roundtrip 68", () => {
    expect(round(mpsToKph(kphToMps(68)), 5)).toBeCloseTo(68, 3); });
  it("kph->mps->kph roundtrip 69", () => {
    expect(round(mpsToKph(kphToMps(69)), 5)).toBeCloseTo(69, 3); });
  it("kph->mps->kph roundtrip 70", () => {
    expect(round(mpsToKph(kphToMps(70)), 5)).toBeCloseTo(70, 3); });
  it("kph->mps->kph roundtrip 71", () => {
    expect(round(mpsToKph(kphToMps(71)), 5)).toBeCloseTo(71, 3); });
  it("kph->mps->kph roundtrip 72", () => {
    expect(round(mpsToKph(kphToMps(72)), 5)).toBeCloseTo(72, 3); });
  it("kph->mps->kph roundtrip 73", () => {
    expect(round(mpsToKph(kphToMps(73)), 5)).toBeCloseTo(73, 3); });
  it("kph->mps->kph roundtrip 74", () => {
    expect(round(mpsToKph(kphToMps(74)), 5)).toBeCloseTo(74, 3); });
  it("kph->mps->kph roundtrip 75", () => {
    expect(round(mpsToKph(kphToMps(75)), 5)).toBeCloseTo(75, 3); });
  it("kph->mps->kph roundtrip 76", () => {
    expect(round(mpsToKph(kphToMps(76)), 5)).toBeCloseTo(76, 3); });
  it("kph->mps->kph roundtrip 77", () => {
    expect(round(mpsToKph(kphToMps(77)), 5)).toBeCloseTo(77, 3); });
  it("kph->mps->kph roundtrip 78", () => {
    expect(round(mpsToKph(kphToMps(78)), 5)).toBeCloseTo(78, 3); });
  it("kph->mps->kph roundtrip 79", () => {
    expect(round(mpsToKph(kphToMps(79)), 5)).toBeCloseTo(79, 3); });
  it("kph->mps->kph roundtrip 80", () => {
    expect(round(mpsToKph(kphToMps(80)), 5)).toBeCloseTo(80, 3); });
  it("kph->mps->kph roundtrip 81", () => {
    expect(round(mpsToKph(kphToMps(81)), 5)).toBeCloseTo(81, 3); });
  it("kph->mps->kph roundtrip 82", () => {
    expect(round(mpsToKph(kphToMps(82)), 5)).toBeCloseTo(82, 3); });
  it("kph->mps->kph roundtrip 83", () => {
    expect(round(mpsToKph(kphToMps(83)), 5)).toBeCloseTo(83, 3); });
  it("kph->mps->kph roundtrip 84", () => {
    expect(round(mpsToKph(kphToMps(84)), 5)).toBeCloseTo(84, 3); });
  it("kph->mps->kph roundtrip 85", () => {
    expect(round(mpsToKph(kphToMps(85)), 5)).toBeCloseTo(85, 3); });
  it("kph->mps->kph roundtrip 86", () => {
    expect(round(mpsToKph(kphToMps(86)), 5)).toBeCloseTo(86, 3); });
  it("kph->mps->kph roundtrip 87", () => {
    expect(round(mpsToKph(kphToMps(87)), 5)).toBeCloseTo(87, 3); });
  it("kph->mps->kph roundtrip 88", () => {
    expect(round(mpsToKph(kphToMps(88)), 5)).toBeCloseTo(88, 3); });
  it("kph->mps->kph roundtrip 89", () => {
    expect(round(mpsToKph(kphToMps(89)), 5)).toBeCloseTo(89, 3); });
  it("kph->mps->kph roundtrip 90", () => {
    expect(round(mpsToKph(kphToMps(90)), 5)).toBeCloseTo(90, 3); });
  it("kph->mps->kph roundtrip 91", () => {
    expect(round(mpsToKph(kphToMps(91)), 5)).toBeCloseTo(91, 3); });
  it("kph->mps->kph roundtrip 92", () => {
    expect(round(mpsToKph(kphToMps(92)), 5)).toBeCloseTo(92, 3); });
  it("kph->mps->kph roundtrip 93", () => {
    expect(round(mpsToKph(kphToMps(93)), 5)).toBeCloseTo(93, 3); });
  it("kph->mps->kph roundtrip 94", () => {
    expect(round(mpsToKph(kphToMps(94)), 5)).toBeCloseTo(94, 3); });
  it("kph->mps->kph roundtrip 95", () => {
    expect(round(mpsToKph(kphToMps(95)), 5)).toBeCloseTo(95, 3); });
  it("kph->mps->kph roundtrip 96", () => {
    expect(round(mpsToKph(kphToMps(96)), 5)).toBeCloseTo(96, 3); });
  it("kph->mps->kph roundtrip 97", () => {
    expect(round(mpsToKph(kphToMps(97)), 5)).toBeCloseTo(97, 3); });
  it("kph->mps->kph roundtrip 98", () => {
    expect(round(mpsToKph(kphToMps(98)), 5)).toBeCloseTo(98, 3); });
  it("kph->mps->kph roundtrip 99", () => {
    expect(round(mpsToKph(kphToMps(99)), 5)).toBeCloseTo(99, 3); });
  it("kph->mps->kph roundtrip 100", () => {
    expect(round(mpsToKph(kphToMps(100)), 5)).toBeCloseTo(100, 3); });
  it("kph->mps->kph roundtrip 101", () => {
    expect(round(mpsToKph(kphToMps(101)), 5)).toBeCloseTo(101, 3); });
  it("kph->mps->kph roundtrip 102", () => {
    expect(round(mpsToKph(kphToMps(102)), 5)).toBeCloseTo(102, 3); });
  it("kph->mps->kph roundtrip 103", () => {
    expect(round(mpsToKph(kphToMps(103)), 5)).toBeCloseTo(103, 3); });
  it("kph->mps->kph roundtrip 104", () => {
    expect(round(mpsToKph(kphToMps(104)), 5)).toBeCloseTo(104, 3); });
  it("kph->mps->kph roundtrip 105", () => {
    expect(round(mpsToKph(kphToMps(105)), 5)).toBeCloseTo(105, 3); });
  it("kph->mps->kph roundtrip 106", () => {
    expect(round(mpsToKph(kphToMps(106)), 5)).toBeCloseTo(106, 3); });
  it("kph->mps->kph roundtrip 107", () => {
    expect(round(mpsToKph(kphToMps(107)), 5)).toBeCloseTo(107, 3); });
  it("kph->mps->kph roundtrip 108", () => {
    expect(round(mpsToKph(kphToMps(108)), 5)).toBeCloseTo(108, 3); });
  it("kph->mps->kph roundtrip 109", () => {
    expect(round(mpsToKph(kphToMps(109)), 5)).toBeCloseTo(109, 3); });
  it("kph->mps->kph roundtrip 110", () => {
    expect(round(mpsToKph(kphToMps(110)), 5)).toBeCloseTo(110, 3); });
  it("kph->mps->kph roundtrip 111", () => {
    expect(round(mpsToKph(kphToMps(111)), 5)).toBeCloseTo(111, 3); });
  it("kph->mps->kph roundtrip 112", () => {
    expect(round(mpsToKph(kphToMps(112)), 5)).toBeCloseTo(112, 3); });
  it("kph->mps->kph roundtrip 113", () => {
    expect(round(mpsToKph(kphToMps(113)), 5)).toBeCloseTo(113, 3); });
  it("kph->mps->kph roundtrip 114", () => {
    expect(round(mpsToKph(kphToMps(114)), 5)).toBeCloseTo(114, 3); });
  it("kph->mps->kph roundtrip 115", () => {
    expect(round(mpsToKph(kphToMps(115)), 5)).toBeCloseTo(115, 3); });
  it("kph->mps->kph roundtrip 116", () => {
    expect(round(mpsToKph(kphToMps(116)), 5)).toBeCloseTo(116, 3); });
  it("kph->mps->kph roundtrip 117", () => {
    expect(round(mpsToKph(kphToMps(117)), 5)).toBeCloseTo(117, 3); });
  it("kph->mps->kph roundtrip 118", () => {
    expect(round(mpsToKph(kphToMps(118)), 5)).toBeCloseTo(118, 3); });
  it("kph->mps->kph roundtrip 119", () => {
    expect(round(mpsToKph(kphToMps(119)), 5)).toBeCloseTo(119, 3); });
  it("kph->mps->kph roundtrip 120", () => {
    expect(round(mpsToKph(kphToMps(120)), 5)).toBeCloseTo(120, 3); });
  it("kph->mps->kph roundtrip 121", () => {
    expect(round(mpsToKph(kphToMps(121)), 5)).toBeCloseTo(121, 3); });
  it("kph->mps->kph roundtrip 122", () => {
    expect(round(mpsToKph(kphToMps(122)), 5)).toBeCloseTo(122, 3); });
  it("kph->mps->kph roundtrip 123", () => {
    expect(round(mpsToKph(kphToMps(123)), 5)).toBeCloseTo(123, 3); });
  it("kph->mps->kph roundtrip 124", () => {
    expect(round(mpsToKph(kphToMps(124)), 5)).toBeCloseTo(124, 3); });
  it("kph->mps->kph roundtrip 125", () => {
    expect(round(mpsToKph(kphToMps(125)), 5)).toBeCloseTo(125, 3); });
  it("kph->mps->kph roundtrip 126", () => {
    expect(round(mpsToKph(kphToMps(126)), 5)).toBeCloseTo(126, 3); });
  it("kph->mps->kph roundtrip 127", () => {
    expect(round(mpsToKph(kphToMps(127)), 5)).toBeCloseTo(127, 3); });
  it("kph->mps->kph roundtrip 128", () => {
    expect(round(mpsToKph(kphToMps(128)), 5)).toBeCloseTo(128, 3); });
  it("kph->mps->kph roundtrip 129", () => {
    expect(round(mpsToKph(kphToMps(129)), 5)).toBeCloseTo(129, 3); });
  it("kph->mps->kph roundtrip 130", () => {
    expect(round(mpsToKph(kphToMps(130)), 5)).toBeCloseTo(130, 3); });
  it("kph->mps->kph roundtrip 131", () => {
    expect(round(mpsToKph(kphToMps(131)), 5)).toBeCloseTo(131, 3); });
  it("kph->mps->kph roundtrip 132", () => {
    expect(round(mpsToKph(kphToMps(132)), 5)).toBeCloseTo(132, 3); });
  it("kph->mps->kph roundtrip 133", () => {
    expect(round(mpsToKph(kphToMps(133)), 5)).toBeCloseTo(133, 3); });
  it("kph->mps->kph roundtrip 134", () => {
    expect(round(mpsToKph(kphToMps(134)), 5)).toBeCloseTo(134, 3); });
  it("kph->mps->kph roundtrip 135", () => {
    expect(round(mpsToKph(kphToMps(135)), 5)).toBeCloseTo(135, 3); });
  it("kph->mps->kph roundtrip 136", () => {
    expect(round(mpsToKph(kphToMps(136)), 5)).toBeCloseTo(136, 3); });
  it("kph->mps->kph roundtrip 137", () => {
    expect(round(mpsToKph(kphToMps(137)), 5)).toBeCloseTo(137, 3); });
  it("kph->mps->kph roundtrip 138", () => {
    expect(round(mpsToKph(kphToMps(138)), 5)).toBeCloseTo(138, 3); });
  it("kph->mps->kph roundtrip 139", () => {
    expect(round(mpsToKph(kphToMps(139)), 5)).toBeCloseTo(139, 3); });
  it("kph->mps->kph roundtrip 140", () => {
    expect(round(mpsToKph(kphToMps(140)), 5)).toBeCloseTo(140, 3); });
  it("kph->mps->kph roundtrip 141", () => {
    expect(round(mpsToKph(kphToMps(141)), 5)).toBeCloseTo(141, 3); });
  it("kph->mps->kph roundtrip 142", () => {
    expect(round(mpsToKph(kphToMps(142)), 5)).toBeCloseTo(142, 3); });
  it("kph->mps->kph roundtrip 143", () => {
    expect(round(mpsToKph(kphToMps(143)), 5)).toBeCloseTo(143, 3); });
  it("kph->mps->kph roundtrip 144", () => {
    expect(round(mpsToKph(kphToMps(144)), 5)).toBeCloseTo(144, 3); });
  it("kph->mps->kph roundtrip 145", () => {
    expect(round(mpsToKph(kphToMps(145)), 5)).toBeCloseTo(145, 3); });
  it("kph->mps->kph roundtrip 146", () => {
    expect(round(mpsToKph(kphToMps(146)), 5)).toBeCloseTo(146, 3); });
  it("kph->mps->kph roundtrip 147", () => {
    expect(round(mpsToKph(kphToMps(147)), 5)).toBeCloseTo(147, 3); });
});

describe("digital storage", () => {
  it("1024 bytes is 1 KB", () => { expect(bytesToKilobytes(1024)).toBe(1); });
  it("1 KB is 1024 bytes", () => { expect(kilobytesToBytes(1)).toBe(1024); });
  it("1MB roundtrip", () => { expect(round(bytesToMegabytes(1024*1024), 5)).toBeCloseTo(1, 4); });
  it("bytes->KB->bytes 1024", () => {
    expect(kilobytesToBytes(bytesToKilobytes(1*1024))).toBe(1*1024); });
  it("bytes->KB->bytes 2048", () => {
    expect(kilobytesToBytes(bytesToKilobytes(2*1024))).toBe(2*1024); });
  it("bytes->KB->bytes 3072", () => {
    expect(kilobytesToBytes(bytesToKilobytes(3*1024))).toBe(3*1024); });
  it("bytes->KB->bytes 4096", () => {
    expect(kilobytesToBytes(bytesToKilobytes(4*1024))).toBe(4*1024); });
  it("bytes->KB->bytes 5120", () => {
    expect(kilobytesToBytes(bytesToKilobytes(5*1024))).toBe(5*1024); });
  it("bytes->KB->bytes 6144", () => {
    expect(kilobytesToBytes(bytesToKilobytes(6*1024))).toBe(6*1024); });
  it("bytes->KB->bytes 7168", () => {
    expect(kilobytesToBytes(bytesToKilobytes(7*1024))).toBe(7*1024); });
  it("bytes->KB->bytes 8192", () => {
    expect(kilobytesToBytes(bytesToKilobytes(8*1024))).toBe(8*1024); });
  it("bytes->KB->bytes 9216", () => {
    expect(kilobytesToBytes(bytesToKilobytes(9*1024))).toBe(9*1024); });
  it("bytes->KB->bytes 10240", () => {
    expect(kilobytesToBytes(bytesToKilobytes(10*1024))).toBe(10*1024); });
  it("bytes->KB->bytes 11264", () => {
    expect(kilobytesToBytes(bytesToKilobytes(11*1024))).toBe(11*1024); });
  it("bytes->KB->bytes 12288", () => {
    expect(kilobytesToBytes(bytesToKilobytes(12*1024))).toBe(12*1024); });
  it("bytes->KB->bytes 13312", () => {
    expect(kilobytesToBytes(bytesToKilobytes(13*1024))).toBe(13*1024); });
  it("bytes->KB->bytes 14336", () => {
    expect(kilobytesToBytes(bytesToKilobytes(14*1024))).toBe(14*1024); });
  it("bytes->KB->bytes 15360", () => {
    expect(kilobytesToBytes(bytesToKilobytes(15*1024))).toBe(15*1024); });
  it("bytes->KB->bytes 16384", () => {
    expect(kilobytesToBytes(bytesToKilobytes(16*1024))).toBe(16*1024); });
  it("bytes->KB->bytes 17408", () => {
    expect(kilobytesToBytes(bytesToKilobytes(17*1024))).toBe(17*1024); });
  it("bytes->KB->bytes 18432", () => {
    expect(kilobytesToBytes(bytesToKilobytes(18*1024))).toBe(18*1024); });
  it("bytes->KB->bytes 19456", () => {
    expect(kilobytesToBytes(bytesToKilobytes(19*1024))).toBe(19*1024); });
  it("bytes->KB->bytes 20480", () => {
    expect(kilobytesToBytes(bytesToKilobytes(20*1024))).toBe(20*1024); });
  it("bytes->KB->bytes 21504", () => {
    expect(kilobytesToBytes(bytesToKilobytes(21*1024))).toBe(21*1024); });
  it("bytes->KB->bytes 22528", () => {
    expect(kilobytesToBytes(bytesToKilobytes(22*1024))).toBe(22*1024); });
  it("bytes->KB->bytes 23552", () => {
    expect(kilobytesToBytes(bytesToKilobytes(23*1024))).toBe(23*1024); });
  it("bytes->KB->bytes 24576", () => {
    expect(kilobytesToBytes(bytesToKilobytes(24*1024))).toBe(24*1024); });
  it("bytes->KB->bytes 25600", () => {
    expect(kilobytesToBytes(bytesToKilobytes(25*1024))).toBe(25*1024); });
  it("bytes->KB->bytes 26624", () => {
    expect(kilobytesToBytes(bytesToKilobytes(26*1024))).toBe(26*1024); });
  it("bytes->KB->bytes 27648", () => {
    expect(kilobytesToBytes(bytesToKilobytes(27*1024))).toBe(27*1024); });
  it("bytes->KB->bytes 28672", () => {
    expect(kilobytesToBytes(bytesToKilobytes(28*1024))).toBe(28*1024); });
  it("bytes->KB->bytes 29696", () => {
    expect(kilobytesToBytes(bytesToKilobytes(29*1024))).toBe(29*1024); });
  it("bytes->KB->bytes 30720", () => {
    expect(kilobytesToBytes(bytesToKilobytes(30*1024))).toBe(30*1024); });
  it("bytes->KB->bytes 31744", () => {
    expect(kilobytesToBytes(bytesToKilobytes(31*1024))).toBe(31*1024); });
  it("bytes->KB->bytes 32768", () => {
    expect(kilobytesToBytes(bytesToKilobytes(32*1024))).toBe(32*1024); });
  it("bytes->KB->bytes 33792", () => {
    expect(kilobytesToBytes(bytesToKilobytes(33*1024))).toBe(33*1024); });
  it("bytes->KB->bytes 34816", () => {
    expect(kilobytesToBytes(bytesToKilobytes(34*1024))).toBe(34*1024); });
  it("bytes->KB->bytes 35840", () => {
    expect(kilobytesToBytes(bytesToKilobytes(35*1024))).toBe(35*1024); });
  it("bytes->KB->bytes 36864", () => {
    expect(kilobytesToBytes(bytesToKilobytes(36*1024))).toBe(36*1024); });
  it("bytes->KB->bytes 37888", () => {
    expect(kilobytesToBytes(bytesToKilobytes(37*1024))).toBe(37*1024); });
  it("bytes->KB->bytes 38912", () => {
    expect(kilobytesToBytes(bytesToKilobytes(38*1024))).toBe(38*1024); });
  it("bytes->KB->bytes 39936", () => {
    expect(kilobytesToBytes(bytesToKilobytes(39*1024))).toBe(39*1024); });
  it("bytes->KB->bytes 40960", () => {
    expect(kilobytesToBytes(bytesToKilobytes(40*1024))).toBe(40*1024); });
  it("bytes->KB->bytes 41984", () => {
    expect(kilobytesToBytes(bytesToKilobytes(41*1024))).toBe(41*1024); });
  it("bytes->KB->bytes 43008", () => {
    expect(kilobytesToBytes(bytesToKilobytes(42*1024))).toBe(42*1024); });
  it("bytes->KB->bytes 44032", () => {
    expect(kilobytesToBytes(bytesToKilobytes(43*1024))).toBe(43*1024); });
  it("bytes->KB->bytes 45056", () => {
    expect(kilobytesToBytes(bytesToKilobytes(44*1024))).toBe(44*1024); });
  it("bytes->KB->bytes 46080", () => {
    expect(kilobytesToBytes(bytesToKilobytes(45*1024))).toBe(45*1024); });
  it("bytes->KB->bytes 47104", () => {
    expect(kilobytesToBytes(bytesToKilobytes(46*1024))).toBe(46*1024); });
  it("bytes->KB->bytes 48128", () => {
    expect(kilobytesToBytes(bytesToKilobytes(47*1024))).toBe(47*1024); });
  it("bytes->KB->bytes 49152", () => {
    expect(kilobytesToBytes(bytesToKilobytes(48*1024))).toBe(48*1024); });
  it("bytes->KB->bytes 50176", () => {
    expect(kilobytesToBytes(bytesToKilobytes(49*1024))).toBe(49*1024); });
  it("bytes->KB->bytes 51200", () => {
    expect(kilobytesToBytes(bytesToKilobytes(50*1024))).toBe(50*1024); });
  it("bytes->KB->bytes 52224", () => {
    expect(kilobytesToBytes(bytesToKilobytes(51*1024))).toBe(51*1024); });
  it("bytes->KB->bytes 53248", () => {
    expect(kilobytesToBytes(bytesToKilobytes(52*1024))).toBe(52*1024); });
  it("bytes->KB->bytes 54272", () => {
    expect(kilobytesToBytes(bytesToKilobytes(53*1024))).toBe(53*1024); });
  it("bytes->KB->bytes 55296", () => {
    expect(kilobytesToBytes(bytesToKilobytes(54*1024))).toBe(54*1024); });
  it("bytes->KB->bytes 56320", () => {
    expect(kilobytesToBytes(bytesToKilobytes(55*1024))).toBe(55*1024); });
  it("bytes->KB->bytes 57344", () => {
    expect(kilobytesToBytes(bytesToKilobytes(56*1024))).toBe(56*1024); });
  it("bytes->KB->bytes 58368", () => {
    expect(kilobytesToBytes(bytesToKilobytes(57*1024))).toBe(57*1024); });
  it("bytes->KB->bytes 59392", () => {
    expect(kilobytesToBytes(bytesToKilobytes(58*1024))).toBe(58*1024); });
  it("bytes->KB->bytes 60416", () => {
    expect(kilobytesToBytes(bytesToKilobytes(59*1024))).toBe(59*1024); });
  it("bytes->KB->bytes 61440", () => {
    expect(kilobytesToBytes(bytesToKilobytes(60*1024))).toBe(60*1024); });
  it("bytes->KB->bytes 62464", () => {
    expect(kilobytesToBytes(bytesToKilobytes(61*1024))).toBe(61*1024); });
  it("bytes->KB->bytes 63488", () => {
    expect(kilobytesToBytes(bytesToKilobytes(62*1024))).toBe(62*1024); });
  it("bytes->KB->bytes 64512", () => {
    expect(kilobytesToBytes(bytesToKilobytes(63*1024))).toBe(63*1024); });
  it("bytes->KB->bytes 65536", () => {
    expect(kilobytesToBytes(bytesToKilobytes(64*1024))).toBe(64*1024); });
  it("bytes->KB->bytes 66560", () => {
    expect(kilobytesToBytes(bytesToKilobytes(65*1024))).toBe(65*1024); });
  it("bytes->KB->bytes 67584", () => {
    expect(kilobytesToBytes(bytesToKilobytes(66*1024))).toBe(66*1024); });
  it("bytes->KB->bytes 68608", () => {
    expect(kilobytesToBytes(bytesToKilobytes(67*1024))).toBe(67*1024); });
  it("bytes->KB->bytes 69632", () => {
    expect(kilobytesToBytes(bytesToKilobytes(68*1024))).toBe(68*1024); });
  it("bytes->KB->bytes 70656", () => {
    expect(kilobytesToBytes(bytesToKilobytes(69*1024))).toBe(69*1024); });
  it("bytes->KB->bytes 71680", () => {
    expect(kilobytesToBytes(bytesToKilobytes(70*1024))).toBe(70*1024); });
  it("bytes->KB->bytes 72704", () => {
    expect(kilobytesToBytes(bytesToKilobytes(71*1024))).toBe(71*1024); });
  it("bytes->KB->bytes 73728", () => {
    expect(kilobytesToBytes(bytesToKilobytes(72*1024))).toBe(72*1024); });
  it("bytes->KB->bytes 74752", () => {
    expect(kilobytesToBytes(bytesToKilobytes(73*1024))).toBe(73*1024); });
  it("bytes->KB->bytes 75776", () => {
    expect(kilobytesToBytes(bytesToKilobytes(74*1024))).toBe(74*1024); });
  it("bytes->KB->bytes 76800", () => {
    expect(kilobytesToBytes(bytesToKilobytes(75*1024))).toBe(75*1024); });
  it("bytes->KB->bytes 77824", () => {
    expect(kilobytesToBytes(bytesToKilobytes(76*1024))).toBe(76*1024); });
  it("bytes->KB->bytes 78848", () => {
    expect(kilobytesToBytes(bytesToKilobytes(77*1024))).toBe(77*1024); });
  it("bytes->KB->bytes 79872", () => {
    expect(kilobytesToBytes(bytesToKilobytes(78*1024))).toBe(78*1024); });
  it("bytes->KB->bytes 80896", () => {
    expect(kilobytesToBytes(bytesToKilobytes(79*1024))).toBe(79*1024); });
  it("bytes->KB->bytes 81920", () => {
    expect(kilobytesToBytes(bytesToKilobytes(80*1024))).toBe(80*1024); });
  it("bytes->KB->bytes 82944", () => {
    expect(kilobytesToBytes(bytesToKilobytes(81*1024))).toBe(81*1024); });
  it("bytes->KB->bytes 83968", () => {
    expect(kilobytesToBytes(bytesToKilobytes(82*1024))).toBe(82*1024); });
  it("bytes->KB->bytes 84992", () => {
    expect(kilobytesToBytes(bytesToKilobytes(83*1024))).toBe(83*1024); });
  it("bytes->KB->bytes 86016", () => {
    expect(kilobytesToBytes(bytesToKilobytes(84*1024))).toBe(84*1024); });
  it("bytes->KB->bytes 87040", () => {
    expect(kilobytesToBytes(bytesToKilobytes(85*1024))).toBe(85*1024); });
  it("bytes->KB->bytes 88064", () => {
    expect(kilobytesToBytes(bytesToKilobytes(86*1024))).toBe(86*1024); });
  it("bytes->KB->bytes 89088", () => {
    expect(kilobytesToBytes(bytesToKilobytes(87*1024))).toBe(87*1024); });
  it("bytes->KB->bytes 90112", () => {
    expect(kilobytesToBytes(bytesToKilobytes(88*1024))).toBe(88*1024); });
  it("bytes->KB->bytes 91136", () => {
    expect(kilobytesToBytes(bytesToKilobytes(89*1024))).toBe(89*1024); });
  it("bytes->KB->bytes 92160", () => {
    expect(kilobytesToBytes(bytesToKilobytes(90*1024))).toBe(90*1024); });
  it("bytes->KB->bytes 93184", () => {
    expect(kilobytesToBytes(bytesToKilobytes(91*1024))).toBe(91*1024); });
  it("bytes->KB->bytes 94208", () => {
    expect(kilobytesToBytes(bytesToKilobytes(92*1024))).toBe(92*1024); });
  it("bytes->KB->bytes 95232", () => {
    expect(kilobytesToBytes(bytesToKilobytes(93*1024))).toBe(93*1024); });
  it("bytes->KB->bytes 96256", () => {
    expect(kilobytesToBytes(bytesToKilobytes(94*1024))).toBe(94*1024); });
  it("bytes->KB->bytes 97280", () => {
    expect(kilobytesToBytes(bytesToKilobytes(95*1024))).toBe(95*1024); });
  it("bytes->KB->bytes 98304", () => {
    expect(kilobytesToBytes(bytesToKilobytes(96*1024))).toBe(96*1024); });
  it("bytes->KB->bytes 99328", () => {
    expect(kilobytesToBytes(bytesToKilobytes(97*1024))).toBe(97*1024); });
  it("bytes->KB->bytes 100352", () => {
    expect(kilobytesToBytes(bytesToKilobytes(98*1024))).toBe(98*1024); });
  it("bytes->KB->bytes 101376", () => {
    expect(kilobytesToBytes(bytesToKilobytes(99*1024))).toBe(99*1024); });
  it("bytes->KB->bytes 102400", () => {
    expect(kilobytesToBytes(bytesToKilobytes(100*1024))).toBe(100*1024); });
  it("bytes->KB->bytes 103424", () => {
    expect(kilobytesToBytes(bytesToKilobytes(101*1024))).toBe(101*1024); });
  it("bytes->KB->bytes 104448", () => {
    expect(kilobytesToBytes(bytesToKilobytes(102*1024))).toBe(102*1024); });
  it("bytes->KB->bytes 105472", () => {
    expect(kilobytesToBytes(bytesToKilobytes(103*1024))).toBe(103*1024); });
  it("bytes->KB->bytes 106496", () => {
    expect(kilobytesToBytes(bytesToKilobytes(104*1024))).toBe(104*1024); });
  it("bytes->KB->bytes 107520", () => {
    expect(kilobytesToBytes(bytesToKilobytes(105*1024))).toBe(105*1024); });
  it("bytes->KB->bytes 108544", () => {
    expect(kilobytesToBytes(bytesToKilobytes(106*1024))).toBe(106*1024); });
  it("bytes->KB->bytes 109568", () => {
    expect(kilobytesToBytes(bytesToKilobytes(107*1024))).toBe(107*1024); });
  it("bytes->KB->bytes 110592", () => {
    expect(kilobytesToBytes(bytesToKilobytes(108*1024))).toBe(108*1024); });
  it("bytes->KB->bytes 111616", () => {
    expect(kilobytesToBytes(bytesToKilobytes(109*1024))).toBe(109*1024); });
  it("bytes->KB->bytes 112640", () => {
    expect(kilobytesToBytes(bytesToKilobytes(110*1024))).toBe(110*1024); });
  it("bytes->KB->bytes 113664", () => {
    expect(kilobytesToBytes(bytesToKilobytes(111*1024))).toBe(111*1024); });
  it("bytes->KB->bytes 114688", () => {
    expect(kilobytesToBytes(bytesToKilobytes(112*1024))).toBe(112*1024); });
  it("bytes->KB->bytes 115712", () => {
    expect(kilobytesToBytes(bytesToKilobytes(113*1024))).toBe(113*1024); });
  it("bytes->KB->bytes 116736", () => {
    expect(kilobytesToBytes(bytesToKilobytes(114*1024))).toBe(114*1024); });
  it("bytes->KB->bytes 117760", () => {
    expect(kilobytesToBytes(bytesToKilobytes(115*1024))).toBe(115*1024); });
  it("bytes->KB->bytes 118784", () => {
    expect(kilobytesToBytes(bytesToKilobytes(116*1024))).toBe(116*1024); });
  it("bytes->KB->bytes 119808", () => {
    expect(kilobytesToBytes(bytesToKilobytes(117*1024))).toBe(117*1024); });
  it("bytes->KB->bytes 120832", () => {
    expect(kilobytesToBytes(bytesToKilobytes(118*1024))).toBe(118*1024); });
  it("bytes->KB->bytes 121856", () => {
    expect(kilobytesToBytes(bytesToKilobytes(119*1024))).toBe(119*1024); });
  it("bytes->KB->bytes 122880", () => {
    expect(kilobytesToBytes(bytesToKilobytes(120*1024))).toBe(120*1024); });
  it("bytes->KB->bytes 123904", () => {
    expect(kilobytesToBytes(bytesToKilobytes(121*1024))).toBe(121*1024); });
  it("bytes->KB->bytes 124928", () => {
    expect(kilobytesToBytes(bytesToKilobytes(122*1024))).toBe(122*1024); });
  it("bytes->KB->bytes 125952", () => {
    expect(kilobytesToBytes(bytesToKilobytes(123*1024))).toBe(123*1024); });
  it("bytes->KB->bytes 126976", () => {
    expect(kilobytesToBytes(bytesToKilobytes(124*1024))).toBe(124*1024); });
  it("bytes->KB->bytes 128000", () => {
    expect(kilobytesToBytes(bytesToKilobytes(125*1024))).toBe(125*1024); });
  it("bytes->KB->bytes 129024", () => {
    expect(kilobytesToBytes(bytesToKilobytes(126*1024))).toBe(126*1024); });
  it("bytes->KB->bytes 130048", () => {
    expect(kilobytesToBytes(bytesToKilobytes(127*1024))).toBe(127*1024); });
  it("bytes->KB->bytes 131072", () => {
    expect(kilobytesToBytes(bytesToKilobytes(128*1024))).toBe(128*1024); });
  it("bytes->KB->bytes 132096", () => {
    expect(kilobytesToBytes(bytesToKilobytes(129*1024))).toBe(129*1024); });
  it("bytes->KB->bytes 133120", () => {
    expect(kilobytesToBytes(bytesToKilobytes(130*1024))).toBe(130*1024); });
  it("bytes->KB->bytes 134144", () => {
    expect(kilobytesToBytes(bytesToKilobytes(131*1024))).toBe(131*1024); });
  it("bytes->KB->bytes 135168", () => {
    expect(kilobytesToBytes(bytesToKilobytes(132*1024))).toBe(132*1024); });
  it("bytes->KB->bytes 136192", () => {
    expect(kilobytesToBytes(bytesToKilobytes(133*1024))).toBe(133*1024); });
  it("bytes->KB->bytes 137216", () => {
    expect(kilobytesToBytes(bytesToKilobytes(134*1024))).toBe(134*1024); });
  it("bytes->KB->bytes 138240", () => {
    expect(kilobytesToBytes(bytesToKilobytes(135*1024))).toBe(135*1024); });
  it("bytes->KB->bytes 139264", () => {
    expect(kilobytesToBytes(bytesToKilobytes(136*1024))).toBe(136*1024); });
  it("bytes->KB->bytes 140288", () => {
    expect(kilobytesToBytes(bytesToKilobytes(137*1024))).toBe(137*1024); });
  it("bytes->KB->bytes 141312", () => {
    expect(kilobytesToBytes(bytesToKilobytes(138*1024))).toBe(138*1024); });
  it("bytes->KB->bytes 142336", () => {
    expect(kilobytesToBytes(bytesToKilobytes(139*1024))).toBe(139*1024); });
  it("bytes->KB->bytes 143360", () => {
    expect(kilobytesToBytes(bytesToKilobytes(140*1024))).toBe(140*1024); });
  it("bytes->KB->bytes 144384", () => {
    expect(kilobytesToBytes(bytesToKilobytes(141*1024))).toBe(141*1024); });
  it("bytes->KB->bytes 145408", () => {
    expect(kilobytesToBytes(bytesToKilobytes(142*1024))).toBe(142*1024); });
  it("bytes->KB->bytes 146432", () => {
    expect(kilobytesToBytes(bytesToKilobytes(143*1024))).toBe(143*1024); });
  it("bytes->KB->bytes 147456", () => {
    expect(kilobytesToBytes(bytesToKilobytes(144*1024))).toBe(144*1024); });
  it("bytes->KB->bytes 148480", () => {
    expect(kilobytesToBytes(bytesToKilobytes(145*1024))).toBe(145*1024); });
  it("bytes->KB->bytes 149504", () => {
    expect(kilobytesToBytes(bytesToKilobytes(146*1024))).toBe(146*1024); });
  it("bytes->KB->bytes 150528", () => {
    expect(kilobytesToBytes(bytesToKilobytes(147*1024))).toBe(147*1024); });
});

describe("angle conversions", () => {
  it("0 deg is 0 rad", () => { expect(degreesToRadians(0)).toBe(0); });
  it("180 deg is PI rad", () => { expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 5); });
  it("PI rad is 180 deg", () => { expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 5); });
  it("degrees->radians->degrees 1", () => {
    expect(radiansToDegrees(degreesToRadians(1))).toBeCloseTo(1, 5); });
  it("degrees->radians->degrees 2", () => {
    expect(radiansToDegrees(degreesToRadians(2))).toBeCloseTo(2, 5); });
  it("degrees->radians->degrees 3", () => {
    expect(radiansToDegrees(degreesToRadians(3))).toBeCloseTo(3, 5); });
  it("degrees->radians->degrees 4", () => {
    expect(radiansToDegrees(degreesToRadians(4))).toBeCloseTo(4, 5); });
  it("degrees->radians->degrees 5", () => {
    expect(radiansToDegrees(degreesToRadians(5))).toBeCloseTo(5, 5); });
  it("degrees->radians->degrees 6", () => {
    expect(radiansToDegrees(degreesToRadians(6))).toBeCloseTo(6, 5); });
  it("degrees->radians->degrees 7", () => {
    expect(radiansToDegrees(degreesToRadians(7))).toBeCloseTo(7, 5); });
  it("degrees->radians->degrees 8", () => {
    expect(radiansToDegrees(degreesToRadians(8))).toBeCloseTo(8, 5); });
  it("degrees->radians->degrees 9", () => {
    expect(radiansToDegrees(degreesToRadians(9))).toBeCloseTo(9, 5); });
  it("degrees->radians->degrees 10", () => {
    expect(radiansToDegrees(degreesToRadians(10))).toBeCloseTo(10, 5); });
  it("degrees->radians->degrees 11", () => {
    expect(radiansToDegrees(degreesToRadians(11))).toBeCloseTo(11, 5); });
  it("degrees->radians->degrees 12", () => {
    expect(radiansToDegrees(degreesToRadians(12))).toBeCloseTo(12, 5); });
  it("degrees->radians->degrees 13", () => {
    expect(radiansToDegrees(degreesToRadians(13))).toBeCloseTo(13, 5); });
  it("degrees->radians->degrees 14", () => {
    expect(radiansToDegrees(degreesToRadians(14))).toBeCloseTo(14, 5); });
  it("degrees->radians->degrees 15", () => {
    expect(radiansToDegrees(degreesToRadians(15))).toBeCloseTo(15, 5); });
  it("degrees->radians->degrees 16", () => {
    expect(radiansToDegrees(degreesToRadians(16))).toBeCloseTo(16, 5); });
  it("degrees->radians->degrees 17", () => {
    expect(radiansToDegrees(degreesToRadians(17))).toBeCloseTo(17, 5); });
  it("degrees->radians->degrees 18", () => {
    expect(radiansToDegrees(degreesToRadians(18))).toBeCloseTo(18, 5); });
  it("degrees->radians->degrees 19", () => {
    expect(radiansToDegrees(degreesToRadians(19))).toBeCloseTo(19, 5); });
  it("degrees->radians->degrees 20", () => {
    expect(radiansToDegrees(degreesToRadians(20))).toBeCloseTo(20, 5); });
  it("degrees->radians->degrees 21", () => {
    expect(radiansToDegrees(degreesToRadians(21))).toBeCloseTo(21, 5); });
  it("degrees->radians->degrees 22", () => {
    expect(radiansToDegrees(degreesToRadians(22))).toBeCloseTo(22, 5); });
  it("degrees->radians->degrees 23", () => {
    expect(radiansToDegrees(degreesToRadians(23))).toBeCloseTo(23, 5); });
  it("degrees->radians->degrees 24", () => {
    expect(radiansToDegrees(degreesToRadians(24))).toBeCloseTo(24, 5); });
  it("degrees->radians->degrees 25", () => {
    expect(radiansToDegrees(degreesToRadians(25))).toBeCloseTo(25, 5); });
  it("degrees->radians->degrees 26", () => {
    expect(radiansToDegrees(degreesToRadians(26))).toBeCloseTo(26, 5); });
  it("degrees->radians->degrees 27", () => {
    expect(radiansToDegrees(degreesToRadians(27))).toBeCloseTo(27, 5); });
  it("degrees->radians->degrees 28", () => {
    expect(radiansToDegrees(degreesToRadians(28))).toBeCloseTo(28, 5); });
  it("degrees->radians->degrees 29", () => {
    expect(radiansToDegrees(degreesToRadians(29))).toBeCloseTo(29, 5); });
  it("degrees->radians->degrees 30", () => {
    expect(radiansToDegrees(degreesToRadians(30))).toBeCloseTo(30, 5); });
  it("degrees->radians->degrees 31", () => {
    expect(radiansToDegrees(degreesToRadians(31))).toBeCloseTo(31, 5); });
  it("degrees->radians->degrees 32", () => {
    expect(radiansToDegrees(degreesToRadians(32))).toBeCloseTo(32, 5); });
  it("degrees->radians->degrees 33", () => {
    expect(radiansToDegrees(degreesToRadians(33))).toBeCloseTo(33, 5); });
  it("degrees->radians->degrees 34", () => {
    expect(radiansToDegrees(degreesToRadians(34))).toBeCloseTo(34, 5); });
  it("degrees->radians->degrees 35", () => {
    expect(radiansToDegrees(degreesToRadians(35))).toBeCloseTo(35, 5); });
  it("degrees->radians->degrees 36", () => {
    expect(radiansToDegrees(degreesToRadians(36))).toBeCloseTo(36, 5); });
  it("degrees->radians->degrees 37", () => {
    expect(radiansToDegrees(degreesToRadians(37))).toBeCloseTo(37, 5); });
  it("degrees->radians->degrees 38", () => {
    expect(radiansToDegrees(degreesToRadians(38))).toBeCloseTo(38, 5); });
  it("degrees->radians->degrees 39", () => {
    expect(radiansToDegrees(degreesToRadians(39))).toBeCloseTo(39, 5); });
  it("degrees->radians->degrees 40", () => {
    expect(radiansToDegrees(degreesToRadians(40))).toBeCloseTo(40, 5); });
  it("degrees->radians->degrees 41", () => {
    expect(radiansToDegrees(degreesToRadians(41))).toBeCloseTo(41, 5); });
  it("degrees->radians->degrees 42", () => {
    expect(radiansToDegrees(degreesToRadians(42))).toBeCloseTo(42, 5); });
  it("degrees->radians->degrees 43", () => {
    expect(radiansToDegrees(degreesToRadians(43))).toBeCloseTo(43, 5); });
  it("degrees->radians->degrees 44", () => {
    expect(radiansToDegrees(degreesToRadians(44))).toBeCloseTo(44, 5); });
  it("degrees->radians->degrees 45", () => {
    expect(radiansToDegrees(degreesToRadians(45))).toBeCloseTo(45, 5); });
  it("degrees->radians->degrees 46", () => {
    expect(radiansToDegrees(degreesToRadians(46))).toBeCloseTo(46, 5); });
  it("degrees->radians->degrees 47", () => {
    expect(radiansToDegrees(degreesToRadians(47))).toBeCloseTo(47, 5); });
  it("degrees->radians->degrees 48", () => {
    expect(radiansToDegrees(degreesToRadians(48))).toBeCloseTo(48, 5); });
  it("degrees->radians->degrees 49", () => {
    expect(radiansToDegrees(degreesToRadians(49))).toBeCloseTo(49, 5); });
  it("degrees->radians->degrees 50", () => {
    expect(radiansToDegrees(degreesToRadians(50))).toBeCloseTo(50, 5); });
  it("degrees->radians->degrees 51", () => {
    expect(radiansToDegrees(degreesToRadians(51))).toBeCloseTo(51, 5); });
  it("degrees->radians->degrees 52", () => {
    expect(radiansToDegrees(degreesToRadians(52))).toBeCloseTo(52, 5); });
  it("degrees->radians->degrees 53", () => {
    expect(radiansToDegrees(degreesToRadians(53))).toBeCloseTo(53, 5); });
  it("degrees->radians->degrees 54", () => {
    expect(radiansToDegrees(degreesToRadians(54))).toBeCloseTo(54, 5); });
  it("degrees->radians->degrees 55", () => {
    expect(radiansToDegrees(degreesToRadians(55))).toBeCloseTo(55, 5); });
  it("degrees->radians->degrees 56", () => {
    expect(radiansToDegrees(degreesToRadians(56))).toBeCloseTo(56, 5); });
  it("degrees->radians->degrees 57", () => {
    expect(radiansToDegrees(degreesToRadians(57))).toBeCloseTo(57, 5); });
  it("degrees->radians->degrees 58", () => {
    expect(radiansToDegrees(degreesToRadians(58))).toBeCloseTo(58, 5); });
  it("degrees->radians->degrees 59", () => {
    expect(radiansToDegrees(degreesToRadians(59))).toBeCloseTo(59, 5); });
  it("degrees->radians->degrees 60", () => {
    expect(radiansToDegrees(degreesToRadians(60))).toBeCloseTo(60, 5); });
  it("degrees->radians->degrees 61", () => {
    expect(radiansToDegrees(degreesToRadians(61))).toBeCloseTo(61, 5); });
  it("degrees->radians->degrees 62", () => {
    expect(radiansToDegrees(degreesToRadians(62))).toBeCloseTo(62, 5); });
  it("degrees->radians->degrees 63", () => {
    expect(radiansToDegrees(degreesToRadians(63))).toBeCloseTo(63, 5); });
  it("degrees->radians->degrees 64", () => {
    expect(radiansToDegrees(degreesToRadians(64))).toBeCloseTo(64, 5); });
  it("degrees->radians->degrees 65", () => {
    expect(radiansToDegrees(degreesToRadians(65))).toBeCloseTo(65, 5); });
  it("degrees->radians->degrees 66", () => {
    expect(radiansToDegrees(degreesToRadians(66))).toBeCloseTo(66, 5); });
  it("degrees->radians->degrees 67", () => {
    expect(radiansToDegrees(degreesToRadians(67))).toBeCloseTo(67, 5); });
  it("degrees->radians->degrees 68", () => {
    expect(radiansToDegrees(degreesToRadians(68))).toBeCloseTo(68, 5); });
  it("degrees->radians->degrees 69", () => {
    expect(radiansToDegrees(degreesToRadians(69))).toBeCloseTo(69, 5); });
  it("degrees->radians->degrees 70", () => {
    expect(radiansToDegrees(degreesToRadians(70))).toBeCloseTo(70, 5); });
  it("degrees->radians->degrees 71", () => {
    expect(radiansToDegrees(degreesToRadians(71))).toBeCloseTo(71, 5); });
  it("degrees->radians->degrees 72", () => {
    expect(radiansToDegrees(degreesToRadians(72))).toBeCloseTo(72, 5); });
  it("degrees->radians->degrees 73", () => {
    expect(radiansToDegrees(degreesToRadians(73))).toBeCloseTo(73, 5); });
  it("degrees->radians->degrees 74", () => {
    expect(radiansToDegrees(degreesToRadians(74))).toBeCloseTo(74, 5); });
  it("degrees->radians->degrees 75", () => {
    expect(radiansToDegrees(degreesToRadians(75))).toBeCloseTo(75, 5); });
  it("degrees->radians->degrees 76", () => {
    expect(radiansToDegrees(degreesToRadians(76))).toBeCloseTo(76, 5); });
  it("degrees->radians->degrees 77", () => {
    expect(radiansToDegrees(degreesToRadians(77))).toBeCloseTo(77, 5); });
  it("degrees->radians->degrees 78", () => {
    expect(radiansToDegrees(degreesToRadians(78))).toBeCloseTo(78, 5); });
  it("degrees->radians->degrees 79", () => {
    expect(radiansToDegrees(degreesToRadians(79))).toBeCloseTo(79, 5); });
  it("degrees->radians->degrees 80", () => {
    expect(radiansToDegrees(degreesToRadians(80))).toBeCloseTo(80, 5); });
  it("degrees->radians->degrees 81", () => {
    expect(radiansToDegrees(degreesToRadians(81))).toBeCloseTo(81, 5); });
  it("degrees->radians->degrees 82", () => {
    expect(radiansToDegrees(degreesToRadians(82))).toBeCloseTo(82, 5); });
  it("degrees->radians->degrees 83", () => {
    expect(radiansToDegrees(degreesToRadians(83))).toBeCloseTo(83, 5); });
  it("degrees->radians->degrees 84", () => {
    expect(radiansToDegrees(degreesToRadians(84))).toBeCloseTo(84, 5); });
  it("degrees->radians->degrees 85", () => {
    expect(radiansToDegrees(degreesToRadians(85))).toBeCloseTo(85, 5); });
  it("degrees->radians->degrees 86", () => {
    expect(radiansToDegrees(degreesToRadians(86))).toBeCloseTo(86, 5); });
  it("degrees->radians->degrees 87", () => {
    expect(radiansToDegrees(degreesToRadians(87))).toBeCloseTo(87, 5); });
  it("degrees->radians->degrees 88", () => {
    expect(radiansToDegrees(degreesToRadians(88))).toBeCloseTo(88, 5); });
  it("degrees->radians->degrees 89", () => {
    expect(radiansToDegrees(degreesToRadians(89))).toBeCloseTo(89, 5); });
  it("degrees->radians->degrees 90", () => {
    expect(radiansToDegrees(degreesToRadians(90))).toBeCloseTo(90, 5); });
  it("degrees->radians->degrees 91", () => {
    expect(radiansToDegrees(degreesToRadians(91))).toBeCloseTo(91, 5); });
  it("degrees->radians->degrees 92", () => {
    expect(radiansToDegrees(degreesToRadians(92))).toBeCloseTo(92, 5); });
  it("degrees->radians->degrees 93", () => {
    expect(radiansToDegrees(degreesToRadians(93))).toBeCloseTo(93, 5); });
  it("degrees->radians->degrees 94", () => {
    expect(radiansToDegrees(degreesToRadians(94))).toBeCloseTo(94, 5); });
  it("degrees->radians->degrees 95", () => {
    expect(radiansToDegrees(degreesToRadians(95))).toBeCloseTo(95, 5); });
  it("degrees->radians->degrees 96", () => {
    expect(radiansToDegrees(degreesToRadians(96))).toBeCloseTo(96, 5); });
  it("degrees->radians->degrees 97", () => {
    expect(radiansToDegrees(degreesToRadians(97))).toBeCloseTo(97, 5); });
});

describe("volume extra", () => {
  it("litresToGallons 1", () => { expect(litresToGallons(1)).toBeCloseTo(0.264172, 4); });
  it("gallonsToLitres roundtrip 1", () => { expect(gallonsToLitres(litresToGallons(1))).toBeCloseTo(1, 4); });
  it("litres->gallons->litres 2", () => { expect(gallonsToLitres(litresToGallons(2))).toBeCloseTo(2, 3); });
  it("litres->gallons->litres 3", () => { expect(gallonsToLitres(litresToGallons(3))).toBeCloseTo(3, 3); });
  it("litres->gallons->litres 4", () => { expect(gallonsToLitres(litresToGallons(4))).toBeCloseTo(4, 3); });
  it("litres->gallons->litres 5", () => { expect(gallonsToLitres(litresToGallons(5))).toBeCloseTo(5, 3); });
  it("litres->gallons->litres 6", () => { expect(gallonsToLitres(litresToGallons(6))).toBeCloseTo(6, 3); });
  it("litres->gallons->litres 7", () => { expect(gallonsToLitres(litresToGallons(7))).toBeCloseTo(7, 3); });
  it("litres->gallons->litres 8", () => { expect(gallonsToLitres(litresToGallons(8))).toBeCloseTo(8, 3); });
  it("litres->gallons->litres 9", () => { expect(gallonsToLitres(litresToGallons(9))).toBeCloseTo(9, 3); });
  it("litres->gallons->litres 10", () => { expect(gallonsToLitres(litresToGallons(10))).toBeCloseTo(10, 3); });
  it("litres->gallons->litres 11", () => { expect(gallonsToLitres(litresToGallons(11))).toBeCloseTo(11, 3); });
  it("litres->gallons->litres 12", () => { expect(gallonsToLitres(litresToGallons(12))).toBeCloseTo(12, 3); });
  it("litres->gallons->litres 13", () => { expect(gallonsToLitres(litresToGallons(13))).toBeCloseTo(13, 3); });
  it("litres->gallons->litres 14", () => { expect(gallonsToLitres(litresToGallons(14))).toBeCloseTo(14, 3); });
  it("litres->gallons->litres 15", () => { expect(gallonsToLitres(litresToGallons(15))).toBeCloseTo(15, 3); });
  it("litres->gallons->litres 16", () => { expect(gallonsToLitres(litresToGallons(16))).toBeCloseTo(16, 3); });
  it("litres->gallons->litres 17", () => { expect(gallonsToLitres(litresToGallons(17))).toBeCloseTo(17, 3); });
  it("litres->gallons->litres 18", () => { expect(gallonsToLitres(litresToGallons(18))).toBeCloseTo(18, 3); });
  it("litres->gallons->litres 19", () => { expect(gallonsToLitres(litresToGallons(19))).toBeCloseTo(19, 3); });
  it("litres->gallons->litres 20", () => { expect(gallonsToLitres(litresToGallons(20))).toBeCloseTo(20, 3); });
  it("litres->gallons->litres 21", () => { expect(gallonsToLitres(litresToGallons(21))).toBeCloseTo(21, 3); });
  it("litres->gallons->litres 22", () => { expect(gallonsToLitres(litresToGallons(22))).toBeCloseTo(22, 3); });
  it("litres->gallons->litres 23", () => { expect(gallonsToLitres(litresToGallons(23))).toBeCloseTo(23, 3); });
  it("litres->gallons->litres 24", () => { expect(gallonsToLitres(litresToGallons(24))).toBeCloseTo(24, 3); });
  it("litres->gallons->litres 25", () => { expect(gallonsToLitres(litresToGallons(25))).toBeCloseTo(25, 3); });
  it("litres->gallons->litres 26", () => { expect(gallonsToLitres(litresToGallons(26))).toBeCloseTo(26, 3); });
  it("litres->gallons->litres 27", () => { expect(gallonsToLitres(litresToGallons(27))).toBeCloseTo(27, 3); });
  it("litres->gallons->litres 28", () => { expect(gallonsToLitres(litresToGallons(28))).toBeCloseTo(28, 3); });
});

describe("area conversions", () => {
  it("1 sqm is ~10.764 sqft", () => { expect(round(squareMetresToSquareFeet(1), 3)).toBe(10.764); });
  it("squareFeetToSquareMetres roundtrip", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(1))).toBeCloseTo(1, 4); });
  it("1 ha is ~2.471 acres", () => { expect(round(hectaresToAcres(1), 3)).toBe(2.471); });
  it("acresToHectares roundtrip", () => { expect(acresToHectares(hectaresToAcres(1))).toBeCloseTo(1, 4); });
  it("sqm->sqft->sqm 2", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(2))).toBeCloseTo(2, 3); });
  it("sqm->sqft->sqm 3", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(3))).toBeCloseTo(3, 3); });
  it("sqm->sqft->sqm 4", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(4))).toBeCloseTo(4, 3); });
  it("sqm->sqft->sqm 5", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(5))).toBeCloseTo(5, 3); });
  it("sqm->sqft->sqm 6", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(6))).toBeCloseTo(6, 3); });
  it("sqm->sqft->sqm 7", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(7))).toBeCloseTo(7, 3); });
  it("sqm->sqft->sqm 8", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(8))).toBeCloseTo(8, 3); });
  it("sqm->sqft->sqm 9", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(9))).toBeCloseTo(9, 3); });
  it("sqm->sqft->sqm 10", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(10))).toBeCloseTo(10, 3); });
  it("sqm->sqft->sqm 11", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(11))).toBeCloseTo(11, 3); });
  it("sqm->sqft->sqm 12", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(12))).toBeCloseTo(12, 3); });
  it("sqm->sqft->sqm 13", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(13))).toBeCloseTo(13, 3); });
  it("sqm->sqft->sqm 14", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(14))).toBeCloseTo(14, 3); });
  it("sqm->sqft->sqm 15", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(15))).toBeCloseTo(15, 3); });
  it("sqm->sqft->sqm 16", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(16))).toBeCloseTo(16, 3); });
  it("sqm->sqft->sqm 17", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(17))).toBeCloseTo(17, 3); });
  it("sqm->sqft->sqm 18", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(18))).toBeCloseTo(18, 3); });
  it("sqm->sqft->sqm 19", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(19))).toBeCloseTo(19, 3); });
  it("sqm->sqft->sqm 20", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(20))).toBeCloseTo(20, 3); });
  it("sqm->sqft->sqm 21", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(21))).toBeCloseTo(21, 3); });
  it("sqm->sqft->sqm 22", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(22))).toBeCloseTo(22, 3); });
  it("sqm->sqft->sqm 23", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(23))).toBeCloseTo(23, 3); });
  it("sqm->sqft->sqm 24", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(24))).toBeCloseTo(24, 3); });
  it("sqm->sqft->sqm 25", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(25))).toBeCloseTo(25, 3); });
  it("sqm->sqft->sqm 26", () => { expect(squareFeetToSquareMetres(squareMetresToSquareFeet(26))).toBeCloseTo(26, 3); });
});

describe("pressure conversions", () => {
  it("100000 Pa is 1 bar", () => { expect(pascalsToBar(100000)).toBe(1); });
  it("1 bar is 100000 Pa", () => { expect(barToPascals(1)).toBe(100000); });
  it("pascalsToBar roundtrip", () => { expect(barToPascals(pascalsToBar(50000))).toBe(50000); });
  it("Pa->bar->Pa 1000", () => { expect(barToPascals(pascalsToBar(1*1000))).toBeCloseTo(1*1000, 3); });
  it("Pa->bar->Pa 2000", () => { expect(barToPascals(pascalsToBar(2*1000))).toBeCloseTo(2*1000, 3); });
  it("Pa->bar->Pa 3000", () => { expect(barToPascals(pascalsToBar(3*1000))).toBeCloseTo(3*1000, 3); });
  it("Pa->bar->Pa 4000", () => { expect(barToPascals(pascalsToBar(4*1000))).toBeCloseTo(4*1000, 3); });
  it("Pa->bar->Pa 5000", () => { expect(barToPascals(pascalsToBar(5*1000))).toBeCloseTo(5*1000, 3); });
  it("Pa->bar->Pa 6000", () => { expect(barToPascals(pascalsToBar(6*1000))).toBeCloseTo(6*1000, 3); });
  it("Pa->bar->Pa 7000", () => { expect(barToPascals(pascalsToBar(7*1000))).toBeCloseTo(7*1000, 3); });
  it("Pa->bar->Pa 8000", () => { expect(barToPascals(pascalsToBar(8*1000))).toBeCloseTo(8*1000, 3); });
  it("Pa->bar->Pa 9000", () => { expect(barToPascals(pascalsToBar(9*1000))).toBeCloseTo(9*1000, 3); });
  it("Pa->bar->Pa 10000", () => { expect(barToPascals(pascalsToBar(10*1000))).toBeCloseTo(10*1000, 3); });
  it("Pa->bar->Pa 11000", () => { expect(barToPascals(pascalsToBar(11*1000))).toBeCloseTo(11*1000, 3); });
  it("Pa->bar->Pa 12000", () => { expect(barToPascals(pascalsToBar(12*1000))).toBeCloseTo(12*1000, 3); });
  it("Pa->bar->Pa 13000", () => { expect(barToPascals(pascalsToBar(13*1000))).toBeCloseTo(13*1000, 3); });
  it("Pa->bar->Pa 14000", () => { expect(barToPascals(pascalsToBar(14*1000))).toBeCloseTo(14*1000, 3); });
  it("Pa->bar->Pa 15000", () => { expect(barToPascals(pascalsToBar(15*1000))).toBeCloseTo(15*1000, 3); });
  it("Pa->bar->Pa 16000", () => { expect(barToPascals(pascalsToBar(16*1000))).toBeCloseTo(16*1000, 3); });
  it("Pa->bar->Pa 17000", () => { expect(barToPascals(pascalsToBar(17*1000))).toBeCloseTo(17*1000, 3); });
  it("Pa->bar->Pa 18000", () => { expect(barToPascals(pascalsToBar(18*1000))).toBeCloseTo(18*1000, 3); });
  it("Pa->bar->Pa 19000", () => { expect(barToPascals(pascalsToBar(19*1000))).toBeCloseTo(19*1000, 3); });
  it("Pa->bar->Pa 20000", () => { expect(barToPascals(pascalsToBar(20*1000))).toBeCloseTo(20*1000, 3); });
  it("Pa->bar->Pa 21000", () => { expect(barToPascals(pascalsToBar(21*1000))).toBeCloseTo(21*1000, 3); });
  it("Pa->bar->Pa 22000", () => { expect(barToPascals(pascalsToBar(22*1000))).toBeCloseTo(22*1000, 3); });
  it("Pa->bar->Pa 23000", () => { expect(barToPascals(pascalsToBar(23*1000))).toBeCloseTo(23*1000, 3); });
  it("Pa->bar->Pa 24000", () => { expect(barToPascals(pascalsToBar(24*1000))).toBeCloseTo(24*1000, 3); });
  it("Pa->bar->Pa 25000", () => { expect(barToPascals(pascalsToBar(25*1000))).toBeCloseTo(25*1000, 3); });
  it("Pa->bar->Pa 26000", () => { expect(barToPascals(pascalsToBar(26*1000))).toBeCloseTo(26*1000, 3); });
  it("Pa->bar->Pa 27000", () => { expect(barToPascals(pascalsToBar(27*1000))).toBeCloseTo(27*1000, 3); });
});

describe("round utility", () => {
  it("round(1.005, 2) is approx 1.01", () => { expect(round(1.005, 2)).toBeCloseTo(1.01, 1); });
  it("round(1.004, 2) is 1", () => { expect(round(1.004, 2)).toBe(1); });
  it("round(0, 5) is 0", () => { expect(round(0, 5)).toBe(0); });
  it("round(1.5, 0) is 2", () => { expect(round(1.5, 0)).toBe(2); });
  it("round(1.23456, 3) is 1.235", () => { expect(round(1.23456, 3)).toBe(1.235); });
  it("round identity 1", () => { expect(round(1.0, 0)).toBe(1); });
  it("round identity 2", () => { expect(round(2.0, 0)).toBe(2); });
  it("round identity 3", () => { expect(round(3.0, 0)).toBe(3); });
  it("round identity 4", () => { expect(round(4.0, 0)).toBe(4); });
  it("round identity 5", () => { expect(round(5.0, 0)).toBe(5); });
  it("round identity 6", () => { expect(round(6.0, 0)).toBe(6); });
  it("round identity 7", () => { expect(round(7.0, 0)).toBe(7); });
  it("round identity 8", () => { expect(round(8.0, 0)).toBe(8); });
  it("round identity 9", () => { expect(round(9.0, 0)).toBe(9); });
  it("round identity 10", () => { expect(round(10.0, 0)).toBe(10); });
  it("round identity 11", () => { expect(round(11.0, 0)).toBe(11); });
  it("round identity 12", () => { expect(round(12.0, 0)).toBe(12); });
  it("round identity 13", () => { expect(round(13.0, 0)).toBe(13); });
  it("round identity 14", () => { expect(round(14.0, 0)).toBe(14); });
  it("round identity 15", () => { expect(round(15.0, 0)).toBe(15); });
  it("round identity 16", () => { expect(round(16.0, 0)).toBe(16); });
  it("round identity 17", () => { expect(round(17.0, 0)).toBe(17); });
  it("round identity 18", () => { expect(round(18.0, 0)).toBe(18); });
  it("round identity 19", () => { expect(round(19.0, 0)).toBe(19); });
  it("round identity 20", () => { expect(round(20.0, 0)).toBe(20); });
  it("round identity 21", () => { expect(round(21.0, 0)).toBe(21); });
  it("round identity 22", () => { expect(round(22.0, 0)).toBe(22); });
  it("round identity 23", () => { expect(round(23.0, 0)).toBe(23); });
  it("round identity 24", () => { expect(round(24.0, 0)).toBe(24); });
  it("round identity 25", () => { expect(round(25.0, 0)).toBe(25); });
  it("round identity 26", () => { expect(round(26.0, 0)).toBe(26); });
  it("round identity 27", () => { expect(round(27.0, 0)).toBe(27); });
  it("round identity 28", () => { expect(round(28.0, 0)).toBe(28); });
  it("round identity 29", () => { expect(round(29.0, 0)).toBe(29); });
  it("round identity 30", () => { expect(round(30.0, 0)).toBe(30); });
});
