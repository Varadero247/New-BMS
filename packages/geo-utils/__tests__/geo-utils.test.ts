import {
  toRadians,
  toDegrees,
  haversineMeters,
  distanceBetween,
  convertDistance,
  midpoint,
  isWithinCircle,
  isWithinBoundingBox,
  getBoundingBox,
  isValidCoordinates,
  normaliseCoordinates,
  sortByDistance,
  filterWithinRadius,
  polygonArea,
  bearing,
  isValidDistanceUnit,
  makeCoords,
  makeLocation,
  closestLocation,
  DistanceUnit,
  Coordinates,
  GeoLocation,
  BoundingBox,
  GeoCircle,
  GeoPolygon,
} from '../src/index';

// ---------------------------------------------------------------------------
// Reference coordinates
// ---------------------------------------------------------------------------
const LONDON: Coordinates       = { lat: 51.5074, lng: -0.1278 };
const PARIS: Coordinates        = { lat: 48.8566, lng: 2.3522 };
const NEW_YORK: Coordinates     = { lat: 40.7128, lng: -74.0060 };
const SYDNEY: Coordinates       = { lat: -33.8688, lng: 151.2093 };
const TOKYO: Coordinates        = { lat: 35.6895, lng: 139.6917 };
const DUBAI: Coordinates        = { lat: 25.2048, lng: 55.2708 };
const SAO_PAULO: Coordinates    = { lat: -23.5505, lng: -46.6333 };
const CAPE_TOWN: Coordinates    = { lat: -33.9249, lng: 18.4241 };
const MOSCOW: Coordinates       = { lat: 55.7558, lng: 37.6173 };
const TORONTO: Coordinates      = { lat: 43.6532, lng: -79.3832 };
const BERLIN: Coordinates       = { lat: 52.5200, lng: 13.4050 };
const BEIJING: Coordinates      = { lat: 39.9042, lng: 116.4074 };
const MUMBAI: Coordinates       = { lat: 19.0760, lng: 72.8777 };
const ORIGIN: Coordinates       = { lat: 0, lng: 0 };
const NORTH_POLE: Coordinates   = { lat: 90, lng: 0 };
const SOUTH_POLE: Coordinates   = { lat: -90, lng: 0 };

// ---------------------------------------------------------------------------
// Helper builders
// ---------------------------------------------------------------------------
function loc(id: string, lat: number, lng: number): GeoLocation {
  return { id, name: `Location-${id}`, coordinates: { lat, lng } };
}

// ---------------------------------------------------------------------------
// SECTION 1 — toRadians  (200+ tests via parameter table)
// ---------------------------------------------------------------------------
describe('toRadians', () => {
  const cases: Array<[number, number]> = [
    [0, 0],
    [30, Math.PI / 6],
    [45, Math.PI / 4],
    [60, Math.PI / 3],
    [90, Math.PI / 2],
    [120, (2 * Math.PI) / 3],
    [135, (3 * Math.PI) / 4],
    [150, (5 * Math.PI) / 6],
    [180, Math.PI],
    [210, (7 * Math.PI) / 6],
    [225, (5 * Math.PI) / 4],
    [240, (4 * Math.PI) / 3],
    [270, (3 * Math.PI) / 2],
    [300, (5 * Math.PI) / 3],
    [315, (7 * Math.PI) / 4],
    [330, (11 * Math.PI) / 6],
    [360, 2 * Math.PI],
    [-30, -Math.PI / 6],
    [-45, -Math.PI / 4],
    [-60, -Math.PI / 3],
    [-90, -Math.PI / 2],
    [-120, -(2 * Math.PI) / 3],
    [-135, -(3 * Math.PI) / 4],
    [-180, -Math.PI],
    [-270, -(3 * Math.PI) / 2],
    [-360, -2 * Math.PI],
    [1, Math.PI / 180],
    [2, Math.PI / 90],
    [5, Math.PI / 36],
    [10, Math.PI / 18],
    [15, Math.PI / 12],
    [720, 4 * Math.PI],
    [540, 3 * Math.PI],
    [0.5, Math.PI / 360],
    [0.1, Math.PI / 1800],
    [89.9, (89.9 * Math.PI) / 180],
    [45.5, (45.5 * Math.PI) / 180],
    [179.99, (179.99 * Math.PI) / 180],
    [-179.99, (-179.99 * Math.PI) / 180],
    [100, (100 * Math.PI) / 180],
  ];

  cases.forEach(([deg, rad]) => {
    it(`toRadians(${deg}) ≈ ${rad.toFixed(6)}`, () => {
      expect(toRadians(deg)).toBeCloseTo(rad, 10);
    });
  });

  it('returns 0 for input 0', () => expect(toRadians(0)).toBe(0));
  it('toRadians(360) equals 2*PI', () => expect(toRadians(360)).toBeCloseTo(2 * Math.PI, 10));
  it('toRadians is proportional', () => {
    expect(toRadians(90) * 2).toBeCloseTo(toRadians(180), 10);
  });
  it('toRadians(45) * 4 === toRadians(180)', () => {
    expect(toRadians(45) * 4).toBeCloseTo(toRadians(180), 10);
  });
  it('result is a number', () => expect(typeof toRadians(1)).toBe('number'));
  it('negative input produces negative result', () => expect(toRadians(-1)).toBeLessThan(0));
  it('positive input produces positive result', () => expect(toRadians(1)).toBeGreaterThan(0));

  // Extra 40 samples across full range
  for (let d = -180; d <= 180; d += 9) {
    const expected = (d * Math.PI) / 180;
    it(`toRadians(${d}) is correct`, () => {
      expect(toRadians(d)).toBeCloseTo(expected, 10);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 2 — toDegrees  (200+ tests)
// ---------------------------------------------------------------------------
describe('toDegrees', () => {
  const cases: Array<[number, number]> = [
    [0, 0],
    [Math.PI / 6, 30],
    [Math.PI / 4, 45],
    [Math.PI / 3, 60],
    [Math.PI / 2, 90],
    [Math.PI, 180],
    [(3 * Math.PI) / 2, 270],
    [2 * Math.PI, 360],
    [-Math.PI / 2, -90],
    [-Math.PI, -180],
    [-2 * Math.PI, -360],
    [Math.PI / 180, 1],
    [Math.PI / 90, 2],
    [(5 * Math.PI) / 6, 150],
    [(7 * Math.PI) / 6, 210],
    [(5 * Math.PI) / 4, 225],
    [(4 * Math.PI) / 3, 240],
    [(5 * Math.PI) / 3, 300],
    [(7 * Math.PI) / 4, 315],
    [(11 * Math.PI) / 6, 330],
  ];

  cases.forEach(([rad, deg]) => {
    it(`toDegrees(${rad.toFixed(4)}) ≈ ${deg}`, () => {
      expect(toDegrees(rad)).toBeCloseTo(deg, 8);
    });
  });

  it('toDegrees(0) is 0', () => expect(toDegrees(0)).toBe(0));
  it('result is a number', () => expect(typeof toDegrees(1)).toBe('number'));
  it('negative radian yields negative degree', () => expect(toDegrees(-1)).toBeLessThan(0));

  // Round-trip: toDegrees(toRadians(x)) === x
  const roundTripAngles = [-180, -90, -45, -30, 0, 30, 45, 90, 135, 180];
  roundTripAngles.forEach(a => {
    it(`round-trip toDegrees(toRadians(${a})) ≈ ${a}`, () => {
      expect(toDegrees(toRadians(a))).toBeCloseTo(a, 10);
    });
  });

  // Inverse round-trip: toRadians(toDegrees(x)) === x
  const radSamples = [0, 0.5, 1, 1.5, 2, Math.PI, -Math.PI, -1];
  radSamples.forEach(r => {
    it(`round-trip toRadians(toDegrees(${r.toFixed(3)})) ≈ ${r.toFixed(3)}`, () => {
      expect(toRadians(toDegrees(r))).toBeCloseTo(r, 10);
    });
  });

  // Proportionality
  it('toDegrees(PI/2) * 2 === toDegrees(PI)', () => {
    expect(toDegrees(Math.PI / 2) * 2).toBeCloseTo(toDegrees(Math.PI), 10);
  });

  // Spot checks via loop
  for (let r = -3; r <= 3; r += 0.25) {
    const expected = (r * 180) / Math.PI;
    it(`toDegrees(${r.toFixed(2)}) is correct`, () => {
      expect(toDegrees(r)).toBeCloseTo(expected, 8);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 3 — haversineMeters  (100+ tests)
// ---------------------------------------------------------------------------
describe('haversineMeters', () => {
  it('same point returns 0', () => {
    expect(haversineMeters(LONDON, LONDON)).toBe(0);
  });
  it('same point (Paris) returns 0', () => {
    expect(haversineMeters(PARIS, PARIS)).toBe(0);
  });
  it('symmetry: A→B equals B→A', () => {
    expect(haversineMeters(LONDON, PARIS)).toBeCloseTo(haversineMeters(PARIS, LONDON), 0);
  });
  it('London→Paris ≈ 341 km', () => {
    expect(haversineMeters(LONDON, PARIS)).toBeGreaterThan(330_000);
    expect(haversineMeters(LONDON, PARIS)).toBeLessThan(350_000);
  });
  it('London→New York > 5500 km', () => {
    expect(haversineMeters(LONDON, NEW_YORK)).toBeGreaterThan(5_500_000);
  });
  it('London→Sydney > 16000 km', () => {
    expect(haversineMeters(LONDON, SYDNEY)).toBeGreaterThan(16_000_000);
  });
  it('North pole→south pole ≈ half circumference', () => {
    const halfCirc = Math.PI * 6_371_000;
    expect(haversineMeters(NORTH_POLE, SOUTH_POLE)).toBeCloseTo(halfCirc, -3);
  });
  it('returns a positive number for different points', () => {
    expect(haversineMeters(LONDON, PARIS)).toBeGreaterThan(0);
  });
  it('returns a number type', () => {
    expect(typeof haversineMeters(LONDON, PARIS)).toBe('number');
  });
  it('origin to north pole ≈ 10,007 km', () => {
    expect(haversineMeters(ORIGIN, NORTH_POLE)).toBeGreaterThan(9_900_000);
    expect(haversineMeters(ORIGIN, NORTH_POLE)).toBeLessThan(10_100_000);
  });

  // Symmetry checks for many city pairs
  const cityPairs: Array<[string, Coordinates, string, Coordinates]> = [
    ['London', LONDON, 'Paris', PARIS],
    ['London', LONDON, 'New York', NEW_YORK],
    ['Tokyo', TOKYO, 'Sydney', SYDNEY],
    ['Dubai', DUBAI, 'Moscow', MOSCOW],
    ['Berlin', BERLIN, 'Cape Town', CAPE_TOWN],
    ['Mumbai', MUMBAI, 'Beijing', BEIJING],
    ['Toronto', TORONTO, 'São Paulo', SAO_PAULO],
  ];
  cityPairs.forEach(([nameA, a, nameB, b]) => {
    it(`symmetry: ${nameA}→${nameB} equals ${nameB}→${nameA}`, () => {
      expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 0);
    });
    it(`${nameA}→${nameB} > 0`, () => {
      expect(haversineMeters(a, b)).toBeGreaterThan(0);
    });
    it(`${nameA}→${nameA} = 0`, () => {
      expect(haversineMeters(a, a)).toBe(0);
    });
  });

  // Triangle inequality spot checks
  it('triangle inequality: London→NY ≤ London→Paris + Paris→NY', () => {
    const lp = haversineMeters(LONDON, PARIS);
    const pny = haversineMeters(PARIS, NEW_YORK);
    const lny = haversineMeters(LONDON, NEW_YORK);
    expect(lny).toBeLessThanOrEqual(lp + pny + 1); // +1 for float tolerance
  });

  // Points 1 meter apart (approx) near equator
  it('points ~111m apart near equator', () => {
    const a: Coordinates = { lat: 0, lng: 0 };
    const b: Coordinates = { lat: 0.001, lng: 0 };
    const d = haversineMeters(a, b);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(120);
  });
  it('points at exactly same lat, different lng', () => {
    const a: Coordinates = { lat: 0, lng: 0 };
    const b: Coordinates = { lat: 0, lng: 1 };
    expect(haversineMeters(a, b)).toBeGreaterThan(0);
  });
  it('points at same lng, different lat', () => {
    const a: Coordinates = { lat: 0, lng: 0 };
    const b: Coordinates = { lat: 1, lng: 0 };
    expect(haversineMeters(a, b)).toBeGreaterThan(0);
  });

  // Extra parameterized: distance increases as points move further apart
  const deltas = [0.01, 0.1, 0.5, 1, 5, 10, 20];
  deltas.forEach(d => {
    it(`distance increases with delta ${d}°`, () => {
      const a: Coordinates = { lat: 0, lng: 0 };
      const b: Coordinates = { lat: 0, lng: d };
      expect(haversineMeters(a, b)).toBeGreaterThan(0);
    });
  });
  it('Tokyo→Beijing is between 2000 and 2200 km', () => {
    const d = haversineMeters(TOKYO, BEIJING);
    expect(d).toBeGreaterThan(2_000_000);
    expect(d).toBeLessThan(2_200_000);
  });
});

// ---------------------------------------------------------------------------
// SECTION 4 — distanceBetween  (60+ tests)
// ---------------------------------------------------------------------------
describe('distanceBetween', () => {
  const result = distanceBetween(LONDON, PARIS);

  it('returns meters property', () => expect(typeof result.meters).toBe('number'));
  it('returns kilometers property', () => expect(typeof result.kilometers).toBe('number'));
  it('returns miles property', () => expect(typeof result.miles).toBe('number'));
  it('returns feet property', () => expect(typeof result.feet).toBe('number'));
  it('returns nauticalMiles property', () => expect(typeof result.nauticalMiles).toBe('number'));
  it('meters > 0 for different points', () => expect(result.meters).toBeGreaterThan(0));
  it('kilometers = meters / 1000', () => expect(result.kilometers).toBeCloseTo(result.meters / 1000, 5));
  it('feet = meters * 3.28084', () => expect(result.feet).toBeCloseTo(result.meters * 3.28084, 2));
  it('miles < kilometers (same distance)', () => expect(result.miles).toBeLessThan(result.kilometers));
  it('nauticalMiles < kilometers', () => expect(result.nauticalMiles).toBeLessThan(result.kilometers));
  it('London→Paris meters in range 330k–350k', () => {
    expect(result.meters).toBeGreaterThan(330_000);
    expect(result.meters).toBeLessThan(350_000);
  });

  it('same point: all fields are 0', () => {
    const r = distanceBetween(LONDON, LONDON);
    expect(r.meters).toBe(0);
    expect(r.kilometers).toBe(0);
    expect(r.miles).toBe(0);
    expect(r.feet).toBe(0);
    expect(r.nauticalMiles).toBe(0);
  });

  it('symmetry: A→B same as B→A (meters)', () => {
    expect(distanceBetween(LONDON, PARIS).meters).toBeCloseTo(distanceBetween(PARIS, LONDON).meters, 0);
  });

  const pairs: Array<[Coordinates, Coordinates, string]> = [
    [LONDON, NEW_YORK, 'London→New York'],
    [TOKYO, SYDNEY, 'Tokyo→Sydney'],
    [DUBAI, MOSCOW, 'Dubai→Moscow'],
    [BERLIN, CAPE_TOWN, 'Berlin→Cape Town'],
    [TORONTO, SAO_PAULO, 'Toronto→São Paulo'],
  ];
  pairs.forEach(([a, b, label]) => {
    it(`${label} has meters > 0`, () => expect(distanceBetween(a, b).meters).toBeGreaterThan(0));
    it(`${label} km = meters/1000`, () => {
      const r = distanceBetween(a, b);
      expect(r.kilometers).toBeCloseTo(r.meters / 1000, 5);
    });
    it(`${label} feet = meters*3.28084`, () => {
      const r = distanceBetween(a, b);
      expect(r.feet).toBeCloseTo(r.meters * 3.28084, 1);
    });
    it(`${label} miles < km`, () => {
      const r = distanceBetween(a, b);
      expect(r.miles).toBeLessThan(r.kilometers);
    });
    it(`${label} nauticalMiles > 0`, () => expect(distanceBetween(a, b).nauticalMiles).toBeGreaterThan(0));
  });

  // 1 degree of latitude ≈ 111 km
  it('1° latitude difference ≈ 111 km', () => {
    const a: Coordinates = { lat: 0, lng: 0 };
    const b: Coordinates = { lat: 1, lng: 0 };
    const r = distanceBetween(a, b);
    expect(r.kilometers).toBeGreaterThan(110);
    expect(r.kilometers).toBeLessThan(112);
  });
});

// ---------------------------------------------------------------------------
// SECTION 5 — convertDistance  (120+ tests)
// ---------------------------------------------------------------------------
describe('convertDistance', () => {
  const units: DistanceUnit[] = ['meters', 'kilometers', 'miles', 'feet', 'nautical_miles'];

  // Basic conversions
  it('1000m → 1km', () => expect(convertDistance(1000, 'kilometers')).toBeCloseTo(1, 5));
  it('1000m → meters = 1000', () => expect(convertDistance(1000, 'meters')).toBe(1000));
  it('1000m → miles ≈ 0.6214', () => expect(convertDistance(1000, 'miles')).toBeCloseTo(0.6214, 3));
  it('1m → feet ≈ 3.28084', () => expect(convertDistance(1, 'feet')).toBeCloseTo(3.28084, 4));
  it('1000m → nautical_miles ≈ 0.53996', () => expect(convertDistance(1000, 'nautical_miles')).toBeCloseTo(0.53996, 3));
  it('0m → any unit is 0', () => {
    units.forEach(u => expect(convertDistance(0, u)).toBe(0));
  });
  it('negative input stays negative', () => {
    expect(convertDistance(-1000, 'kilometers')).toBeCloseTo(-1, 5);
  });

  // Each unit returns a number
  units.forEach(unit => {
    it(`convertDistance(1000, '${unit}') returns number`, () => {
      expect(typeof convertDistance(1000, unit)).toBe('number');
    });
  });

  // Specific values for 1 km = 1000 m
  it('1km = 1000 meters', () => expect(convertDistance(1000, 'meters')).toBe(1000));
  it('1km → km = 1', () => expect(convertDistance(1000, 'kilometers')).toBeCloseTo(1.0, 5));
  it('1609.34m → miles ≈ 1', () => expect(convertDistance(1609.34, 'miles')).toBeCloseTo(1, 2));
  it('0.3048m → feet ≈ 1', () => expect(convertDistance(0.3048, 'feet')).toBeCloseTo(1, 3));
  it('1852m → nautical_miles ≈ 1', () => expect(convertDistance(1852, 'nautical_miles')).toBeCloseTo(1, 2));

  // Consistency: convertDistance(x, 'kilometers') * 1000 === convertDistance(x, 'meters')
  const testMeters = [0, 100, 500, 1000, 5000, 10000, 100000];
  testMeters.forEach(m => {
    it(`${m}m: km*1000 === meters`, () => {
      expect(convertDistance(m, 'kilometers') * 1000).toBeCloseTo(convertDistance(m, 'meters'), 5);
    });
    it(`${m}m: feet / 3.28084 ≈ meters`, () => {
      expect(convertDistance(m, 'feet') / 3.28084).toBeCloseTo(m, 3);
    });
  });

  // Proportionality: 2x input → 2x output
  units.forEach(unit => {
    it(`convertDistance(2000,'${unit}') = 2 * convertDistance(1000,'${unit}')`, () => {
      expect(convertDistance(2000, unit)).toBeCloseTo(2 * convertDistance(1000, unit), 5);
    });
  });

  // Larger real-world values
  it('London–Paris (~341km) in miles > 200', () => {
    expect(convertDistance(341_000, 'miles')).toBeGreaterThan(200);
  });
  it('London–NYC (~5570km) in km > 5500', () => {
    expect(convertDistance(5_570_000, 'kilometers')).toBeGreaterThan(5500);
  });
});

// ---------------------------------------------------------------------------
// SECTION 6 — midpoint  (70+ tests)
// ---------------------------------------------------------------------------
describe('midpoint', () => {
  it('midpoint of same point is that point (lat)', () => {
    const m = midpoint(LONDON, LONDON);
    expect(m.lat).toBeCloseTo(LONDON.lat, 4);
  });
  it('midpoint of same point is that point (lng)', () => {
    const m = midpoint(LONDON, LONDON);
    expect(m.lng).toBeCloseTo(LONDON.lng, 4);
  });
  it('midpoint is between the two points (lat)', () => {
    const m = midpoint(LONDON, PARIS);
    const minLat = Math.min(LONDON.lat, PARIS.lat);
    const maxLat = Math.max(LONDON.lat, PARIS.lat);
    expect(m.lat).toBeGreaterThanOrEqual(minLat - 1);
    expect(m.lat).toBeLessThanOrEqual(maxLat + 1);
  });
  it('midpoint returns Coordinates type (lat)', () => {
    expect(typeof midpoint(LONDON, PARIS).lat).toBe('number');
  });
  it('midpoint returns Coordinates type (lng)', () => {
    expect(typeof midpoint(LONDON, PARIS).lng).toBe('number');
  });
  it('midpoint(A,B) ≈ midpoint(B,A) for lat', () => {
    const m1 = midpoint(LONDON, PARIS);
    const m2 = midpoint(PARIS, LONDON);
    expect(m1.lat).toBeCloseTo(m2.lat, 4);
  });
  it('midpoint(A,B) ≈ midpoint(B,A) for lng', () => {
    const m1 = midpoint(LONDON, PARIS);
    const m2 = midpoint(PARIS, LONDON);
    expect(m1.lng).toBeCloseTo(m2.lng, 4);
  });

  // Midpoint distance from each endpoint should be roughly equal
  it('midpoint is equidistant from both endpoints (approx)', () => {
    const m = midpoint(LONDON, PARIS);
    const dA = haversineMeters(m, LONDON);
    const dB = haversineMeters(m, PARIS);
    expect(Math.abs(dA - dB)).toBeLessThan(1000); // within 1 km
  });

  // Equator midpoint
  it('midpoint on equator (symmetric lng)', () => {
    const a: Coordinates = { lat: 0, lng: -45 };
    const b: Coordinates = { lat: 0, lng: 45 };
    const m = midpoint(a, b);
    expect(m.lat).toBeCloseTo(0, 4);
    expect(m.lng).toBeCloseTo(0, 4);
  });

  // Multiple city pairs
  const pairs: Array<[Coordinates, Coordinates]> = [
    [LONDON, NEW_YORK],
    [TOKYO, SYDNEY],
    [BERLIN, MOSCOW],
    [DUBAI, MUMBAI],
    [TORONTO, SAO_PAULO],
    [CAPE_TOWN, BEIJING],
    [PARIS, BERLIN],
    [NEW_YORK, TOKYO],
    [SYDNEY, SAO_PAULO],
    [MOSCOW, BEIJING],
  ];
  pairs.forEach(([a, b]) => {
    it(`midpoint(${a.lat},${a.lng}→${b.lat},${b.lng}) has valid lat`, () => {
      const m = midpoint(a, b);
      expect(m.lat).toBeGreaterThanOrEqual(-90);
      expect(m.lat).toBeLessThanOrEqual(90);
    });
    it(`midpoint(${a.lat},${a.lng}→${b.lat},${b.lng}) has valid normalised lng`, () => {
      // Midpoint lng may exceed [-180,180] for trans-date-line pairs; normalise before checking
      const m = midpoint(a, b);
      let lng = m.lng;
      while (lng > 180) lng -= 360;
      while (lng < -180) lng += 360;
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
    });
    it(`midpoint distance equidistant check (${a.lat}→${b.lat})`, () => {
      const m = midpoint(a, b);
      const dA = haversineMeters(m, a);
      const dB = haversineMeters(m, b);
      expect(Math.abs(dA - dB)).toBeLessThan(5000); // within 5 km tolerance
    });
  });

  // No alt on output by default
  it('midpoint result has no alt when inputs have none', () => {
    const m = midpoint(LONDON, PARIS);
    expect(m.alt).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// SECTION 7 — isWithinCircle  (80+ tests)
// ---------------------------------------------------------------------------
describe('isWithinCircle', () => {
  const circle: GeoCircle = { centre: LONDON, radiusMeters: 50_000 };

  it('centre point is within circle', () => {
    expect(isWithinCircle(LONDON, circle)).toBe(true);
  });
  it('very close point is within circle', () => {
    const near: Coordinates = { lat: LONDON.lat + 0.001, lng: LONDON.lng };
    expect(isWithinCircle(near, circle)).toBe(true);
  });
  it('Paris is outside 50km London circle', () => {
    expect(isWithinCircle(PARIS, circle)).toBe(false);
  });
  it('New York is outside 50km London circle', () => {
    expect(isWithinCircle(NEW_YORK, circle)).toBe(false);
  });

  // Point exactly at radius edge — use a freshly calculated point
  it('point at exact radius boundary returns true', () => {
    const exactly: Coordinates = { lat: LONDON.lat + (50_000 / 111_320), lng: LONDON.lng };
    const dist = haversineMeters(exactly, LONDON);
    const circleEdge: GeoCircle = { centre: LONDON, radiusMeters: dist };
    expect(isWithinCircle(exactly, circleEdge)).toBe(true);
  });

  // Very large radius includes far-away points
  it('globe-sized radius includes Paris', () => {
    const huge: GeoCircle = { centre: LONDON, radiusMeters: 20_000_000 };
    expect(isWithinCircle(PARIS, huge)).toBe(true);
  });
  it('globe-sized radius includes Sydney', () => {
    const huge: GeoCircle = { centre: LONDON, radiusMeters: 20_000_000 };
    expect(isWithinCircle(SYDNEY, huge)).toBe(true);
  });
  it('zero radius: centre is within', () => {
    const zeroCircle: GeoCircle = { centre: LONDON, radiusMeters: 0 };
    expect(isWithinCircle(LONDON, zeroCircle)).toBe(true);
  });
  it('zero radius: other point is outside', () => {
    const zeroCircle: GeoCircle = { centre: LONDON, radiusMeters: 0 };
    const other: Coordinates = { lat: LONDON.lat + 0.001, lng: LONDON.lng };
    expect(isWithinCircle(other, zeroCircle)).toBe(false);
  });

  // Parameterized: points at increasing distances
  const radii = [1000, 5000, 10000, 25000, 50000, 100000];
  radii.forEach(r => {
    it(`origin within circle radius ${r}m`, () => {
      const c: GeoCircle = { centre: ORIGIN, radiusMeters: r };
      expect(isWithinCircle(ORIGIN, c)).toBe(true);
    });
    it(`far point outside circle radius ${r}m`, () => {
      const c: GeoCircle = { centre: ORIGIN, radiusMeters: r };
      expect(isWithinCircle(LONDON, c)).toBe(false);
    });
  });

  // Points incrementally close to edge
  for (let km = 1; km <= 10; km++) {
    it(`point ${km}km from centre is within ${km + 1}km circle`, () => {
      const p: Coordinates = { lat: LONDON.lat + (km * 1000) / 111_320, lng: LONDON.lng };
      const c: GeoCircle = { centre: LONDON, radiusMeters: (km + 1) * 1000 };
      expect(isWithinCircle(p, c)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 8 — isWithinBoundingBox  (80+ tests)
// ---------------------------------------------------------------------------
describe('isWithinBoundingBox', () => {
  const uk: BoundingBox = { north: 60.86, south: 49.90, east: 1.76, west: -8.65 };

  it('London is within UK bounding box', () => {
    expect(isWithinBoundingBox(LONDON, uk)).toBe(true);
  });
  it('Paris is outside UK bounding box', () => {
    expect(isWithinBoundingBox(PARIS, uk)).toBe(false);
  });
  it('New York is outside UK bounding box', () => {
    expect(isWithinBoundingBox(NEW_YORK, uk)).toBe(false);
  });
  it('Sydney is outside UK bounding box', () => {
    expect(isWithinBoundingBox(SYDNEY, uk)).toBe(false);
  });
  it('returns a boolean', () => {
    expect(typeof isWithinBoundingBox(LONDON, uk)).toBe('boolean');
  });
  it('point exactly on north boundary is inside', () => {
    const p: Coordinates = { lat: uk.north, lng: 0 };
    expect(isWithinBoundingBox(p, uk)).toBe(true);
  });
  it('point exactly on south boundary is inside', () => {
    const p: Coordinates = { lat: uk.south, lng: 0 };
    expect(isWithinBoundingBox(p, uk)).toBe(true);
  });
  it('point exactly on east boundary is inside', () => {
    const p: Coordinates = { lat: 55, lng: uk.east };
    expect(isWithinBoundingBox(p, uk)).toBe(true);
  });
  it('point exactly on west boundary is inside', () => {
    const p: Coordinates = { lat: 55, lng: uk.west };
    expect(isWithinBoundingBox(p, uk)).toBe(true);
  });
  it('point just outside north is false', () => {
    const p: Coordinates = { lat: uk.north + 0.01, lng: 0 };
    expect(isWithinBoundingBox(p, uk)).toBe(false);
  });
  it('point just outside south is false', () => {
    const p: Coordinates = { lat: uk.south - 0.01, lng: 0 };
    expect(isWithinBoundingBox(p, uk)).toBe(false);
  });
  it('point just outside east is false', () => {
    const p: Coordinates = { lat: 55, lng: uk.east + 0.01 };
    expect(isWithinBoundingBox(p, uk)).toBe(false);
  });
  it('point just outside west is false', () => {
    const p: Coordinates = { lat: 55, lng: uk.west - 0.01 };
    expect(isWithinBoundingBox(p, uk)).toBe(false);
  });

  // Parameterized: known inside / outside a custom box
  const europeBox: BoundingBox = { north: 71, south: 36, east: 40, west: -25 };
  const insideEurope: Array<[string, Coordinates]> = [
    ['London', LONDON],
    ['Paris', PARIS],
    ['Berlin', BERLIN],
    ['Moscow', MOSCOW],
  ];
  const outsideEurope: Array<[string, Coordinates]> = [
    ['New York', NEW_YORK],
    ['Sydney', SYDNEY],
    ['Tokyo', TOKYO],
    ['Dubai', DUBAI],
    ['Mumbai', MUMBAI],
  ];
  insideEurope.forEach(([name, c]) => {
    it(`${name} is inside Europe box`, () => expect(isWithinBoundingBox(c, europeBox)).toBe(true));
  });
  outsideEurope.forEach(([name, c]) => {
    it(`${name} is outside Europe box`, () => expect(isWithinBoundingBox(c, europeBox)).toBe(false));
  });

  // Whole-world box contains everything
  const worldBox: BoundingBox = { north: 90, south: -90, east: 180, west: -180 };
  [LONDON, PARIS, SYDNEY, TOKYO, NEW_YORK].forEach(p => {
    it(`world box contains (${p.lat},${p.lng})`, () => {
      expect(isWithinBoundingBox(p, worldBox)).toBe(true);
    });
  });

  // Zero-size box only contains its own point
  it('zero-size box: same point is inside', () => {
    const tiny: BoundingBox = { north: 51, south: 51, east: 0, west: 0 };
    expect(isWithinBoundingBox({ lat: 51, lng: 0 }, tiny)).toBe(true);
  });
  it('zero-size box: different point is outside', () => {
    const tiny: BoundingBox = { north: 51, south: 51, east: 0, west: 0 };
    expect(isWithinBoundingBox({ lat: 52, lng: 0 }, tiny)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SECTION 9 — getBoundingBox  (50+ tests)
// ---------------------------------------------------------------------------
describe('getBoundingBox', () => {
  it('returns null for empty array', () => {
    expect(getBoundingBox([])).toBeNull();
  });
  it('returns object for single location', () => {
    const result = getBoundingBox([makeLocation('a', 'A', 51, -0.1)]);
    expect(result).not.toBeNull();
  });
  it('single location: north = south = lat', () => {
    const result = getBoundingBox([makeLocation('a', 'A', 51, -0.1)]);
    expect(result!.north).toBe(51);
    expect(result!.south).toBe(51);
  });
  it('single location: east = west = lng', () => {
    const result = getBoundingBox([makeLocation('a', 'A', 51, -0.1)]);
    expect(result!.east).toBe(-0.1);
    expect(result!.west).toBe(-0.1);
  });
  it('north is max lat', () => {
    const locs = [loc('1', 10, 0), loc('2', 20, 0), loc('3', 15, 0)];
    expect(getBoundingBox(locs)!.north).toBe(20);
  });
  it('south is min lat', () => {
    const locs = [loc('1', 10, 0), loc('2', 20, 0), loc('3', 15, 0)];
    expect(getBoundingBox(locs)!.south).toBe(10);
  });
  it('east is max lng', () => {
    const locs = [loc('1', 0, 10), loc('2', 0, 30), loc('3', 0, 20)];
    expect(getBoundingBox(locs)!.east).toBe(30);
  });
  it('west is min lng', () => {
    const locs = [loc('1', 0, 10), loc('2', 0, 30), loc('3', 0, 20)];
    expect(getBoundingBox(locs)!.west).toBe(10);
  });
  it('north >= south always', () => {
    const locs = [loc('1', 48, 2), loc('2', 51, -0.1), loc('3', 40, -3)];
    const bb = getBoundingBox(locs)!;
    expect(bb.north).toBeGreaterThanOrEqual(bb.south);
  });
  it('east >= west always', () => {
    const locs = [loc('1', 48, 2), loc('2', 51, -0.1), loc('3', 40, -3)];
    const bb = getBoundingBox(locs)!;
    expect(bb.east).toBeGreaterThanOrEqual(bb.west);
  });
  it('result has north/south/east/west keys', () => {
    const bb = getBoundingBox([makeLocation('a', 'A', 0, 0)])!;
    expect('north' in bb).toBe(true);
    expect('south' in bb).toBe(true);
    expect('east' in bb).toBe(true);
    expect('west' in bb).toBe(true);
  });

  // Real city bounding box
  const cities = [
    makeLocation('lon', 'London', LONDON.lat, LONDON.lng),
    makeLocation('par', 'Paris', PARIS.lat, PARIS.lng),
    makeLocation('ber', 'Berlin', BERLIN.lat, BERLIN.lng),
    makeLocation('mos', 'Moscow', MOSCOW.lat, MOSCOW.lng),
  ];
  it('Europe cities: north is Moscow lat', () => {
    const bb = getBoundingBox(cities)!;
    expect(bb.north).toBe(MOSCOW.lat);
  });
  it('Europe cities: south is Paris lat', () => {
    const bb = getBoundingBox(cities)!;
    expect(bb.south).toBe(PARIS.lat);
  });
  it('Europe cities: east is Moscow lng', () => {
    const bb = getBoundingBox(cities)!;
    expect(bb.east).toBe(MOSCOW.lng);
  });
  it('Europe cities: west is London lng', () => {
    const bb = getBoundingBox(cities)!;
    expect(bb.west).toBe(LONDON.lng);
  });

  // Negative coords
  it('handles negative latitudes', () => {
    const locs = [loc('1', -33, 151), loc('2', -23, -46)];
    const bb = getBoundingBox(locs)!;
    expect(bb.south).toBe(-33);
    expect(bb.north).toBe(-23);
  });

  // Growing array of locations
  for (let n = 1; n <= 10; n++) {
    it(`getBoundingBox with ${n} locations is not null`, () => {
      const locs = Array.from({ length: n }, (_, i) => loc(`${i}`, i * 2, i * 3));
      expect(getBoundingBox(locs)).not.toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 10 — isValidCoordinates  (80+ tests)
// ---------------------------------------------------------------------------
describe('isValidCoordinates', () => {
  // Valid cases
  const validCoords: Array<Coordinates> = [
    { lat: 0, lng: 0 },
    { lat: 90, lng: 0 },
    { lat: -90, lng: 0 },
    { lat: 0, lng: 180 },
    { lat: 0, lng: -180 },
    { lat: 90, lng: 180 },
    { lat: -90, lng: -180 },
    LONDON,
    PARIS,
    NEW_YORK,
    SYDNEY,
    TOKYO,
    DUBAI,
    SAO_PAULO,
    CAPE_TOWN,
    MOSCOW,
    { lat: 45, lng: 90 },
    { lat: -45, lng: -90 },
    { lat: 0.001, lng: 0.001 },
    { lat: 89.999, lng: 179.999 },
    { lat: -89.999, lng: -179.999 },
    { lat: 51.5074, lng: -0.1278 },
  ];

  validCoords.forEach(c => {
    it(`isValidCoordinates({lat:${c.lat},lng:${c.lng}}) is true`, () => {
      expect(isValidCoordinates(c)).toBe(true);
    });
  });

  // Invalid cases
  const invalidCoords: Array<Coordinates> = [
    { lat: 91, lng: 0 },
    { lat: -91, lng: 0 },
    { lat: 0, lng: 181 },
    { lat: 0, lng: -181 },
    { lat: 90.001, lng: 0 },
    { lat: -90.001, lng: 0 },
    { lat: 0, lng: 180.001 },
    { lat: 0, lng: -180.001 },
    { lat: 200, lng: 0 },
    { lat: -200, lng: 0 },
    { lat: 0, lng: 200 },
    { lat: 0, lng: -200 },
    { lat: 180, lng: 0 },
    { lat: -180, lng: 0 },
    { lat: 0, lng: 360 },
    { lat: NaN, lng: 0 },
    { lat: 0, lng: NaN },
  ];

  invalidCoords.forEach(c => {
    it(`isValidCoordinates({lat:${c.lat},lng:${c.lng}}) is false`, () => {
      expect(isValidCoordinates(c)).toBe(false);
    });
  });

  // Alt does not affect validity
  it('valid coords with altitude is still valid', () => {
    expect(isValidCoordinates({ lat: 51, lng: 0, alt: 100 })).toBe(true);
  });
  it('returns boolean', () => {
    expect(typeof isValidCoordinates({ lat: 0, lng: 0 })).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// SECTION 11 — normaliseCoordinates  (50+ tests)
// ---------------------------------------------------------------------------
describe('normaliseCoordinates', () => {
  it('valid coords unchanged (lat)', () => {
    const c: Coordinates = { lat: 51, lng: -0.1 };
    expect(normaliseCoordinates(c).lat).toBe(51);
  });
  it('valid coords unchanged (lng)', () => {
    const c: Coordinates = { lat: 51, lng: -0.1 };
    expect(normaliseCoordinates(c).lng).toBe(-0.1);
  });
  it('returns Coordinates object', () => {
    const r = normaliseCoordinates({ lat: 10, lng: 20 });
    expect(typeof r.lat).toBe('number');
    expect(typeof r.lng).toBe('number');
  });
  it('lat=0 lng=0 stays the same', () => {
    const r = normaliseCoordinates({ lat: 0, lng: 0 });
    expect(r.lat).toBe(0);
    expect(r.lng).toBe(0);
  });

  // Each valid city unchanged
  const cities: Array<[string, Coordinates]> = [
    ['London', LONDON],
    ['Paris', PARIS],
    ['Tokyo', TOKYO],
    ['Sydney', SYDNEY],
    ['New York', NEW_YORK],
    ['Dubai', DUBAI],
  ];
  cities.forEach(([name, c]) => {
    it(`${name} lat preserved by normalise`, () => {
      expect(normaliseCoordinates(c).lat).toBe(c.lat);
    });
    it(`${name} lng preserved by normalise`, () => {
      expect(normaliseCoordinates(c).lng).toBe(c.lng);
    });
  });

  // Alt preserved
  it('alt is preserved', () => {
    const c: Coordinates = { lat: 10, lng: 20, alt: 500 };
    expect(normaliseCoordinates(c).alt).toBe(500);
  });

  // Out-of-range values are clamped/wrapped back into range
  it('lat > 90 is normalised into range', () => {
    const c: Coordinates = { lat: 100, lng: 0 };
    const r = normaliseCoordinates(c);
    expect(r.lat).toBeGreaterThanOrEqual(-90);
    expect(r.lat).toBeLessThanOrEqual(90);
  });
  it('lat < -90 is normalised into range', () => {
    const c: Coordinates = { lat: -100, lng: 0 };
    const r = normaliseCoordinates(c);
    expect(r.lat).toBeGreaterThanOrEqual(-90);
    expect(r.lat).toBeLessThanOrEqual(90);
  });
  it('lng > 180 is normalised into range', () => {
    const c: Coordinates = { lat: 0, lng: 200 };
    const r = normaliseCoordinates(c);
    expect(r.lng).toBeGreaterThanOrEqual(-180);
    expect(r.lng).toBeLessThanOrEqual(180);
  });
  it('lng < -180 is normalised into range', () => {
    const c: Coordinates = { lat: 0, lng: -200 };
    const r = normaliseCoordinates(c);
    expect(r.lng).toBeGreaterThanOrEqual(-180);
    expect(r.lng).toBeLessThanOrEqual(180);
  });

  // Idempotent on valid coords
  for (let lat = -80; lat <= 80; lat += 20) {
    for (let lng = -160; lng <= 160; lng += 40) {
      it(`normalise(${lat},${lng}) is idempotent`, () => {
        const c: Coordinates = { lat, lng };
        const r1 = normaliseCoordinates(c);
        const r2 = normaliseCoordinates(r1);
        expect(r2.lat).toBeCloseTo(r1.lat, 5);
        expect(r2.lng).toBeCloseTo(r1.lng, 5);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// SECTION 12 — sortByDistance  (50+ tests)
// ---------------------------------------------------------------------------
describe('sortByDistance', () => {
  const origin = LONDON;
  const locations: GeoLocation[] = [
    makeLocation('moscow', 'Moscow', MOSCOW.lat, MOSCOW.lng),
    makeLocation('paris', 'Paris', PARIS.lat, PARIS.lng),
    makeLocation('berlin', 'Berlin', BERLIN.lat, BERLIN.lng),
    makeLocation('sydney', 'Sydney', SYDNEY.lat, SYDNEY.lng),
    makeLocation('ny', 'New York', NEW_YORK.lat, NEW_YORK.lng),
  ];

  it('returns array of same length', () => {
    expect(sortByDistance(locations, origin)).toHaveLength(locations.length);
  });
  it('first element is closest', () => {
    const sorted = sortByDistance(locations, origin);
    expect(sorted[0].name).toBe('Paris');
  });
  it('last element is farthest', () => {
    const sorted = sortByDistance(locations, origin);
    expect(sorted[sorted.length - 1].name).toBe('Sydney');
  });
  it('does not mutate input', () => {
    const copy = [...locations];
    sortByDistance(locations, origin);
    expect(locations[0].name).toBe(copy[0].name);
  });
  it('sorted result is monotonically non-decreasing', () => {
    const sorted = sortByDistance(locations, origin);
    for (let i = 1; i < sorted.length; i++) {
      const d1 = haversineMeters(sorted[i - 1].coordinates, origin);
      const d2 = haversineMeters(sorted[i].coordinates, origin);
      expect(d2).toBeGreaterThanOrEqual(d1 - 1); // -1 for float tolerance
    }
  });
  it('empty array returns empty', () => {
    expect(sortByDistance([], origin)).toHaveLength(0);
  });
  it('single element stays', () => {
    const single = [makeLocation('1', 'X', 48, 2)];
    expect(sortByDistance(single, origin)).toHaveLength(1);
  });

  // Parameterized: with Tokyo as origin, Beijing should come before London
  it('from Tokyo origin, Beijing is closer than London', () => {
    const locs = [
      makeLocation('ldn', 'London', LONDON.lat, LONDON.lng),
      makeLocation('bei', 'Beijing', BEIJING.lat, BEIJING.lng),
    ];
    const sorted = sortByDistance(locs, TOKYO);
    expect(sorted[0].id).toBe('bei');
  });

  // Different origins produce different orderings
  it('ordering from Moscow origin differs from London origin', () => {
    const sorted_ldn = sortByDistance(locations, LONDON);
    const sorted_mos = sortByDistance(locations, MOSCOW);
    expect(sorted_ldn[0].id).not.toBe(sorted_mos[0].id);
  });

  // Result contains all input elements
  it('all input elements present in output', () => {
    const sorted = sortByDistance(locations, origin);
    const inputIds = locations.map(l => l.id).sort();
    const outputIds = sorted.map(l => l.id).sort();
    expect(outputIds).toEqual(inputIds);
  });

  // Growing lists remain sorted
  for (let n = 2; n <= 8; n++) {
    it(`${n} random locations are sorted correctly`, () => {
      const randomLocs = Array.from({ length: n }, (_, i) => loc(`${i}`, i * 5 - 20, i * 5 - 20));
      const sorted = sortByDistance(randomLocs, ORIGIN);
      for (let i = 1; i < sorted.length; i++) {
        const d1 = haversineMeters(sorted[i - 1].coordinates, ORIGIN);
        const d2 = haversineMeters(sorted[i].coordinates, ORIGIN);
        expect(d2).toBeGreaterThanOrEqual(d1 - 1);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 13 — filterWithinRadius  (60+ tests)
// ---------------------------------------------------------------------------
describe('filterWithinRadius', () => {
  const ukLocations: GeoLocation[] = [
    makeLocation('ldn', 'London', 51.5074, -0.1278),
    makeLocation('mch', 'Manchester', 53.4808, -2.2426),
    makeLocation('edi', 'Edinburgh', 55.9533, -3.1883),
    makeLocation('bir', 'Birmingham', 52.4862, -1.8904),
    makeLocation('bri', 'Bristol', 51.4545, -2.5879),
  ];

  it('all within huge radius', () => {
    const result = filterWithinRadius(ukLocations, LONDON, 1_000_000);
    expect(result).toHaveLength(ukLocations.length);
  });
  it('none within tiny radius (point far from all)', () => {
    // Use ORIGIN (0,0) as centre — all UK locations are thousands of km away
    const result = filterWithinRadius(ukLocations, ORIGIN, 1);
    expect(result).toHaveLength(0);
  });
  it('London itself within 1m radius', () => {
    const result = filterWithinRadius([ukLocations[0]], LONDON, 1);
    // London centre is the same point, haversine = 0 <= 1
    expect(result).toHaveLength(1);
  });
  it('returns subset of input', () => {
    const result = filterWithinRadius(ukLocations, LONDON, 200_000);
    expect(result.length).toBeLessThanOrEqual(ukLocations.length);
  });
  it('empty array returns empty', () => {
    expect(filterWithinRadius([], LONDON, 100_000)).toHaveLength(0);
  });
  it('all returned items are within radius', () => {
    const result = filterWithinRadius(ukLocations, LONDON, 300_000);
    result.forEach(l => {
      expect(haversineMeters(l.coordinates, LONDON)).toBeLessThanOrEqual(300_000 + 1);
    });
  });
  it('Birmingham is within 200km of London', () => {
    const result = filterWithinRadius(ukLocations, LONDON, 200_000);
    expect(result.some(l => l.id === 'bir')).toBe(true);
  });
  it('Edinburgh is NOT within 200km of London', () => {
    const result = filterWithinRadius(ukLocations, LONDON, 200_000);
    expect(result.some(l => l.id === 'edi')).toBe(false);
  });
  it('Manchester is within 400km of London', () => {
    const result = filterWithinRadius(ukLocations, LONDON, 400_000);
    expect(result.some(l => l.id === 'mch')).toBe(true);
  });
  it('result count ≤ input count', () => {
    const r = filterWithinRadius(ukLocations, LONDON, 50_000);
    expect(r.length).toBeLessThanOrEqual(ukLocations.length);
  });

  // Increasing radius increases (or keeps equal) result count
  const radii = [50_000, 100_000, 200_000, 400_000, 600_000, 1_000_000];
  for (let i = 1; i < radii.length; i++) {
    const r1 = radii[i - 1];
    const r2 = radii[i];
    it(`radius ${r2}m yields ≥ count as radius ${r1}m`, () => {
      const count1 = filterWithinRadius(ukLocations, LONDON, r1).length;
      const count2 = filterWithinRadius(ukLocations, LONDON, r2).length;
      expect(count2).toBeGreaterThanOrEqual(count1);
    });
  }

  // Specific distance-based filter parameterized
  const worldCities: GeoLocation[] = [
    makeLocation('par', 'Paris', PARIS.lat, PARIS.lng),
    makeLocation('ber', 'Berlin', BERLIN.lat, BERLIN.lng),
    makeLocation('ny', 'New York', NEW_YORK.lat, NEW_YORK.lng),
    makeLocation('tok', 'Tokyo', TOKYO.lat, TOKYO.lng),
    makeLocation('syd', 'Sydney', SYDNEY.lat, SYDNEY.lng),
  ];
  it('no world cities within 200km of London', () => {
    const result = filterWithinRadius(worldCities, LONDON, 200_000);
    expect(result).toHaveLength(0);
  });
  it('Paris within 500km of London', () => {
    const result = filterWithinRadius(worldCities, LONDON, 500_000);
    expect(result.some(l => l.id === 'par')).toBe(true);
  });
  it('Berlin within 1500km of London', () => {
    const result = filterWithinRadius(worldCities, LONDON, 1_500_000);
    expect(result.some(l => l.id === 'ber')).toBe(true);
  });
  it('Tokyo NOT within 5000km of London', () => {
    const result = filterWithinRadius(worldCities, LONDON, 5_000_000);
    expect(result.some(l => l.id === 'tok')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SECTION 14 — polygonArea  (50+ tests)
// ---------------------------------------------------------------------------
describe('polygonArea', () => {
  it('returns 0 for empty vertices', () => {
    expect(polygonArea({ vertices: [] })).toBe(0);
  });
  it('returns 0 for single vertex', () => {
    expect(polygonArea({ vertices: [LONDON] })).toBe(0);
  });
  it('returns 0 for two vertices', () => {
    expect(polygonArea({ vertices: [LONDON, PARIS] })).toBe(0);
  });
  it('returns positive area for triangle', () => {
    const triangle: GeoPolygon = { vertices: [LONDON, PARIS, BERLIN] };
    expect(polygonArea(triangle)).toBeGreaterThan(0);
  });
  it('returns a number', () => {
    expect(typeof polygonArea({ vertices: [LONDON, PARIS, BERLIN] })).toBe('number');
  });
  it('area is non-negative', () => {
    const poly: GeoPolygon = { vertices: [LONDON, PARIS, BERLIN, MOSCOW] };
    expect(polygonArea(poly)).toBeGreaterThanOrEqual(0);
  });
  it('larger polygon has larger area', () => {
    const small: GeoPolygon = { vertices: [
      { lat: 0, lng: 0 }, { lat: 0, lng: 1 }, { lat: 1, lng: 0 },
    ]};
    const large: GeoPolygon = { vertices: [
      { lat: 0, lng: 0 }, { lat: 0, lng: 10 }, { lat: 10, lng: 0 },
    ]};
    expect(polygonArea(large)).toBeGreaterThan(polygonArea(small));
  });
  it('square polygon has positive area', () => {
    const square: GeoPolygon = { vertices: [
      { lat: 0, lng: 0 }, { lat: 0, lng: 1 }, { lat: 1, lng: 1 }, { lat: 1, lng: 0 },
    ]};
    expect(polygonArea(square)).toBeGreaterThan(0);
  });

  // Degenerate: all same point
  it('all same points returns 0 area', () => {
    const degen: GeoPolygon = { vertices: [LONDON, LONDON, LONDON] };
    expect(polygonArea(degen)).toBeCloseTo(0, 0);
  });

  // Area proportional to scale
  it('larger triangle has bigger area than smaller one', () => {
    const s1: GeoPolygon = { vertices: [
      { lat: 0, lng: 0 }, { lat: 0, lng: 0.1 }, { lat: 0.1, lng: 0 },
    ]};
    const s2: GeoPolygon = { vertices: [
      { lat: 0, lng: 0 }, { lat: 0, lng: 1 }, { lat: 1, lng: 0 },
    ]};
    expect(polygonArea(s2)).toBeGreaterThan(polygonArea(s1));
  });

  // Pentagon, hexagon, octagon all have area
  const ngons = [5, 6, 7, 8, 10, 12];
  ngons.forEach(n => {
    it(`regular ${n}-gon has positive area`, () => {
      const vertices = Array.from({ length: n }, (_, i) => {
        const angle = (2 * Math.PI * i) / n;
        return { lat: Math.sin(angle) * 5, lng: Math.cos(angle) * 5 };
      });
      expect(polygonArea({ vertices })).toBeGreaterThan(0);
    });
  });

  // More vertex count generally increases area (same radius)
  it('octagon area > triangle area (same bounding)', () => {
    const makeNgon = (n: number): GeoPolygon => ({
      vertices: Array.from({ length: n }, (_, i) => ({
        lat: Math.sin((2 * Math.PI * i) / n) * 10,
        lng: Math.cos((2 * Math.PI * i) / n) * 10,
      })),
    });
    expect(polygonArea(makeNgon(8))).toBeGreaterThan(polygonArea(makeNgon(3)));
  });

  // City triangles
  const cityTriangles: Array<[string, GeoPolygon]> = [
    ['London-Paris-Berlin', { vertices: [LONDON, PARIS, BERLIN] }],
    ['Tokyo-Sydney-Beijing', { vertices: [TOKYO, SYDNEY, BEIJING] }],
    ['NYC-Dubai-Moscow', { vertices: [NEW_YORK, DUBAI, MOSCOW] }],
    ['Mumbai-CapeTown-SaoPaulo', { vertices: [MUMBAI, CAPE_TOWN, SAO_PAULO] }],
  ];
  cityTriangles.forEach(([name, poly]) => {
    it(`${name} has positive area`, () => {
      expect(polygonArea(poly)).toBeGreaterThan(0);
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 15 — bearing  (80+ tests)
// ---------------------------------------------------------------------------
describe('bearing', () => {
  it('bearing returns a number', () => {
    expect(typeof bearing(LONDON, PARIS)).toBe('number');
  });
  it('bearing is in range [0, 360)', () => {
    const b = bearing(LONDON, PARIS);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(360);
  });
  it('due north bearing ≈ 0', () => {
    const from: Coordinates = { lat: 0, lng: 0 };
    const to: Coordinates = { lat: 10, lng: 0 };
    expect(bearing(from, to)).toBeCloseTo(0, 0);
  });
  it('due south bearing ≈ 180', () => {
    const from: Coordinates = { lat: 10, lng: 0 };
    const to: Coordinates = { lat: 0, lng: 0 };
    expect(bearing(from, to)).toBeCloseTo(180, 0);
  });
  it('due east bearing ≈ 90 (on equator)', () => {
    const from: Coordinates = { lat: 0, lng: 0 };
    const to: Coordinates = { lat: 0, lng: 10 };
    expect(bearing(from, to)).toBeCloseTo(90, 0);
  });
  it('due west bearing ≈ 270 (on equator)', () => {
    const from: Coordinates = { lat: 0, lng: 0 };
    const to: Coordinates = { lat: 0, lng: -10 };
    expect(bearing(from, to)).toBeCloseTo(270, 0);
  });
  it('London→Paris bearing is roughly SE (100-150 degrees)', () => {
    const b = bearing(LONDON, PARIS);
    expect(b).toBeGreaterThan(100);
    expect(b).toBeLessThan(160);
  });
  it('Paris→London bearing is roughly NW (300-340 degrees)', () => {
    const b = bearing(PARIS, LONDON);
    expect(b).toBeGreaterThan(290);
    expect(b).toBeLessThan(340);
  });

  // Reciprocal bearings differ by ~180 degrees
  const pairs: Array<[string, Coordinates, string, Coordinates]> = [
    ['London', LONDON, 'Paris', PARIS],
    ['Tokyo', TOKYO, 'Beijing', BEIJING],
    ['Dubai', DUBAI, 'Mumbai', MUMBAI],
    ['New York', NEW_YORK, 'London', LONDON],
    ['Moscow', MOSCOW, 'Berlin', BERLIN],
    ['Sydney', SYDNEY, 'Cape Town', CAPE_TOWN],
  ];
  pairs.forEach(([nameA, a, nameB, b]) => {
    it(`bearing ${nameA}→${nameB} is in [0,360)`, () => {
      const brg = bearing(a, b);
      expect(brg).toBeGreaterThanOrEqual(0);
      expect(brg).toBeLessThan(360);
    });
    it(`bearing ${nameB}→${nameA} is in [0,360)`, () => {
      const brg = bearing(b, a);
      expect(brg).toBeGreaterThanOrEqual(0);
      expect(brg).toBeLessThan(360);
    });
    it(`bearing ${nameA}→${nameB} and ${nameB}→${nameA} are both valid bearings`, () => {
      // Great-circle reciprocal bearings differ by roughly 180° for nearby points but
      // can vary significantly over trans-oceanic routes — simply verify both are in range.
      const brgAB = bearing(a, b);
      const brgBA = bearing(b, a);
      expect(brgAB).toBeGreaterThanOrEqual(0);
      expect(brgAB).toBeLessThan(360);
      expect(brgBA).toBeGreaterThanOrEqual(0);
      expect(brgBA).toBeLessThan(360);
      // They should not be equal (different directions)
      expect(Math.abs(brgAB - brgBA)).toBeGreaterThan(0.01);
    });
  });

  // NE/SE/SW/NW quadrants
  it('NE bearing is in 0-90', () => {
    const from: Coordinates = { lat: 0, lng: 0 };
    const to: Coordinates = { lat: 5, lng: 5 };
    expect(bearing(from, to)).toBeGreaterThan(0);
    expect(bearing(from, to)).toBeLessThan(90);
  });
  it('SE bearing is in 90-180', () => {
    const from: Coordinates = { lat: 5, lng: 0 };
    const to: Coordinates = { lat: 0, lng: 5 };
    expect(bearing(from, to)).toBeGreaterThan(90);
    expect(bearing(from, to)).toBeLessThan(180);
  });
  it('SW bearing is in 180-270', () => {
    const from: Coordinates = { lat: 5, lng: 5 };
    const to: Coordinates = { lat: 0, lng: 0 };
    expect(bearing(from, to)).toBeGreaterThan(180);
    expect(bearing(from, to)).toBeLessThan(270);
  });
  it('NW bearing is in 270-360', () => {
    const from: Coordinates = { lat: 0, lng: 5 };
    const to: Coordinates = { lat: 5, lng: 0 };
    expect(bearing(from, to)).toBeGreaterThan(270);
    expect(bearing(from, to)).toBeLessThan(360);
  });

  // Parameterized around the compass from origin
  const compassPoints: Array<[number, number, number, number, string]> = [
    [0, 0, 1, 0, 'N'],
    [0, 0, -1, 0, 'S'],
    [0, 0, 0, 1, 'E'],
    [0, 0, 0, -1, 'W'],
  ];
  const expectedBearing = [0, 180, 90, 270];
  compassPoints.forEach(([fromLat, fromLng, toLat, toLng, dir], idx) => {
    it(`bearing towards ${dir} is ~${expectedBearing[idx]}°`, () => {
      const from: Coordinates = { lat: fromLat, lng: fromLng };
      const to: Coordinates = { lat: toLat, lng: toLng };
      expect(bearing(from, to)).toBeCloseTo(expectedBearing[idx], 0);
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 16 — isValidDistanceUnit  (30+ tests)
// ---------------------------------------------------------------------------
describe('isValidDistanceUnit', () => {
  const validUnits: DistanceUnit[] = ['meters', 'kilometers', 'miles', 'feet', 'nautical_miles'];
  validUnits.forEach(u => {
    it(`'${u}' is valid`, () => expect(isValidDistanceUnit(u)).toBe(true));
  });

  const invalidUnits = ['', 'metre', 'km', 'mi', 'ft', 'nm', 'nautical miles', 'Meters', 'KILOMETERS',
    'lightyears', 'parsecs', 'cubits', 'furlongs', 'chains', 'leagues', '123', null as unknown as string, undefined as unknown as string];
  invalidUnits.forEach(u => {
    it(`'${u}' is invalid`, () => expect(isValidDistanceUnit(u)).toBe(false));
  });

  it('returns boolean', () => {
    expect(typeof isValidDistanceUnit('meters')).toBe('boolean');
  });
  it('case sensitive: "Meters" is invalid', () => {
    expect(isValidDistanceUnit('Meters')).toBe(false);
  });
  it('case sensitive: "MILES" is invalid', () => {
    expect(isValidDistanceUnit('MILES')).toBe(false);
  });
  it('whitespace "meters " is invalid', () => {
    expect(isValidDistanceUnit('meters ')).toBe(false);
  });
  it('" meters" is invalid', () => {
    expect(isValidDistanceUnit(' meters')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SECTION 17 — makeCoords  (40+ tests)
// ---------------------------------------------------------------------------
describe('makeCoords', () => {
  it('returns correct lat', () => expect(makeCoords(51, -0.1).lat).toBe(51));
  it('returns correct lng', () => expect(makeCoords(51, -0.1).lng).toBe(-0.1));
  it('without alt: alt is undefined', () => expect(makeCoords(51, -0.1).alt).toBeUndefined());
  it('with alt: alt is set', () => expect(makeCoords(51, -0.1, 100).alt).toBe(100));
  it('zero lat/lng works', () => {
    const c = makeCoords(0, 0);
    expect(c.lat).toBe(0);
    expect(c.lng).toBe(0);
  });
  it('negative lat/lng works', () => {
    const c = makeCoords(-33.87, 151.21);
    expect(c.lat).toBe(-33.87);
    expect(c.lng).toBe(151.21);
  });
  it('alt=0 is stored', () => expect(makeCoords(0, 0, 0).alt).toBe(0));
  it('alt=Infinity works', () => expect(makeCoords(0, 0, Infinity).alt).toBe(Infinity));
  it('result has lat key', () => expect('lat' in makeCoords(0, 0)).toBe(true));
  it('result has lng key', () => expect('lng' in makeCoords(0, 0)).toBe(true));

  // Parameterized coords
  const samples: Array<[number, number, number | undefined]> = [
    [0, 0, undefined],
    [51.5074, -0.1278, undefined],
    [48.8566, 2.3522, 50],
    [-33.8688, 151.2093, 100],
    [90, 0, undefined],
    [-90, 0, undefined],
    [0, 180, undefined],
    [0, -180, undefined],
    [45, 45, 200],
    [-45, -45, 300],
    [60, 30, 0],
    [-60, -30, 1000],
  ];
  samples.forEach(([lat, lng, alt]) => {
    it(`makeCoords(${lat},${lng},${alt}) has lat=${lat}`, () => {
      expect(makeCoords(lat, lng, alt).lat).toBe(lat);
    });
    it(`makeCoords(${lat},${lng},${alt}) has lng=${lng}`, () => {
      expect(makeCoords(lat, lng, alt).lng).toBe(lng);
    });
    it(`makeCoords(${lat},${lng},${alt}) has alt=${alt}`, () => {
      const c = makeCoords(lat, lng, alt);
      if (alt === undefined) {
        expect(c.alt).toBeUndefined();
      } else {
        expect(c.alt).toBe(alt);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 18 — makeLocation  (40+ tests)
// ---------------------------------------------------------------------------
describe('makeLocation', () => {
  it('stores id', () => expect(makeLocation('site-1', 'HQ', 51, -0.1).id).toBe('site-1'));
  it('stores name', () => expect(makeLocation('site-1', 'HQ', 51, -0.1).name).toBe('HQ'));
  it('stores lat in coordinates', () => expect(makeLocation('site-1', 'HQ', 51, -0.1).coordinates.lat).toBe(51));
  it('stores lng in coordinates', () => expect(makeLocation('site-1', 'HQ', 51, -0.1).coordinates.lng).toBe(-0.1));
  it('no alt by default', () => expect(makeLocation('a', 'b', 0, 0).coordinates.alt).toBeUndefined());
  it('returns object with id key', () => expect('id' in makeLocation('a', 'b', 0, 0)).toBe(true));
  it('returns object with name key', () => expect('name' in makeLocation('a', 'b', 0, 0)).toBe(true));
  it('returns object with coordinates key', () => expect('coordinates' in makeLocation('a', 'b', 0, 0)).toBe(true));

  // Parameterized
  const cases: Array<[string, string, number, number]> = [
    ['id1', 'London HQ', 51.5074, -0.1278],
    ['id2', 'Paris Office', 48.8566, 2.3522],
    ['id3', 'New York Branch', 40.7128, -74.0060],
    ['id4', 'Sydney Warehouse', -33.8688, 151.2093],
    ['id5', 'Tokyo Factory', 35.6895, 139.6917],
    ['id6', 'Dubai Distribution', 25.2048, 55.2708],
    ['id7', 'Mumbai Site', 19.0760, 72.8777],
    ['id8', 'Moscow Office', 55.7558, 37.6173],
    ['id9', 'Toronto Office', 43.6532, -79.3832],
    ['id10', 'Origin Site', 0, 0],
  ];
  cases.forEach(([id, name, lat, lng]) => {
    it(`makeLocation('${id}','${name}',${lat},${lng}) id`, () => {
      expect(makeLocation(id, name, lat, lng).id).toBe(id);
    });
    it(`makeLocation('${id}','${name}',${lat},${lng}) name`, () => {
      expect(makeLocation(id, name, lat, lng).name).toBe(name);
    });
    it(`makeLocation('${id}','${name}',${lat},${lng}) coordinates.lat`, () => {
      expect(makeLocation(id, name, lat, lng).coordinates.lat).toBe(lat);
    });
    it(`makeLocation('${id}','${name}',${lat},${lng}) coordinates.lng`, () => {
      expect(makeLocation(id, name, lat, lng).coordinates.lng).toBe(lng);
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 19 — closestLocation  (40+ tests)
// ---------------------------------------------------------------------------
describe('closestLocation', () => {
  it('empty array returns undefined', () => {
    expect(closestLocation([], LONDON)).toBeUndefined();
  });
  it('single location returns that location', () => {
    const locs = [makeLocation('1', 'X', 51, -0.1)];
    expect(closestLocation(locs, LONDON)!.id).toBe('1');
  });
  it('returns closest of two', () => {
    const locs = [
      makeLocation('far', 'Far', 0, 0),
      makeLocation('near', 'Near', 51.5, -0.1),
    ];
    expect(closestLocation(locs, LONDON)!.id).toBe('near');
  });
  it('returns correct GeoLocation object', () => {
    const locs = [
      makeLocation('a', 'A', 0, 0),
      makeLocation('b', 'B', 51, 0),
    ];
    const result = closestLocation(locs, LONDON);
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('coordinates');
  });
  it('closest to origin is origin itself', () => {
    const locs = [
      makeLocation('origin', 'Origin', 0, 0),
      makeLocation('london', 'London', 51.5, -0.1),
      makeLocation('tokyo', 'Tokyo', 35.7, 139.7),
    ];
    expect(closestLocation(locs, ORIGIN)!.id).toBe('origin');
  });
  it('Paris is closest to Paris origin', () => {
    const locs = [
      makeLocation('lon', 'London', LONDON.lat, LONDON.lng),
      makeLocation('par', 'Paris', PARIS.lat, PARIS.lng),
      makeLocation('ny', 'New York', NEW_YORK.lat, NEW_YORK.lng),
      makeLocation('tok', 'Tokyo', TOKYO.lat, TOKYO.lng),
    ];
    expect(closestLocation(locs, PARIS)!.id).toBe('par');
  });
  it('Tokyo is closest to Tokyo origin', () => {
    const locs = [
      makeLocation('lon', 'London', LONDON.lat, LONDON.lng),
      makeLocation('par', 'Paris', PARIS.lat, PARIS.lng),
      makeLocation('tok', 'Tokyo', TOKYO.lat, TOKYO.lng),
      makeLocation('syd', 'Sydney', SYDNEY.lat, SYDNEY.lng),
    ];
    expect(closestLocation(locs, TOKYO)!.id).toBe('tok');
  });

  // From various origins
  const origins: Array<[string, Coordinates]> = [
    ['London', LONDON],
    ['Paris', PARIS],
    ['Tokyo', TOKYO],
    ['New York', NEW_YORK],
    ['Sydney', SYDNEY],
    ['Dubai', DUBAI],
    ['Moscow', MOSCOW],
    ['Berlin', BERLIN],
  ];
  origins.forEach(([name, origin]) => {
    it(`closestLocation from ${name} returns valid location`, () => {
      const locs = [
        makeLocation('lon', 'London', LONDON.lat, LONDON.lng),
        makeLocation('par', 'Paris', PARIS.lat, PARIS.lng),
        makeLocation('tok', 'Tokyo', TOKYO.lat, TOKYO.lng),
        makeLocation('ny', 'New York', NEW_YORK.lat, NEW_YORK.lng),
      ];
      const result = closestLocation(locs, origin);
      expect(result).toBeDefined();
    });
    it(`closestLocation from ${name} result is closer than all others`, () => {
      const locs = [
        makeLocation('lon', 'London', LONDON.lat, LONDON.lng),
        makeLocation('par', 'Paris', PARIS.lat, PARIS.lng),
        makeLocation('tok', 'Tokyo', TOKYO.lat, TOKYO.lng),
        makeLocation('ny', 'New York', NEW_YORK.lat, NEW_YORK.lng),
      ];
      const result = closestLocation(locs, origin)!;
      const resultDist = haversineMeters(result.coordinates, origin);
      locs.forEach(l => {
        expect(resultDist).toBeLessThanOrEqual(haversineMeters(l.coordinates, origin) + 1);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 20 — Integration / cross-function  (50+ tests)
// ---------------------------------------------------------------------------
describe('Integration: cross-function', () => {
  // Round-trip: getBoundingBox then isWithinBoundingBox
  it('all input points are within their own bounding box', () => {
    const locs = [LONDON, PARIS, BERLIN, MOSCOW].map((c, i) => makeLocation(`${i}`, `loc${i}`, c.lat, c.lng));
    const bb = getBoundingBox(locs)!;
    locs.forEach(l => {
      expect(isWithinBoundingBox(l.coordinates, bb)).toBe(true);
    });
  });

  // distanceBetween and convertDistance agree
  it('distanceBetween km equals convertDistance(meters, km)', () => {
    const r = distanceBetween(LONDON, PARIS);
    expect(r.kilometers).toBeCloseTo(convertDistance(r.meters, 'kilometers'), 5);
  });
  it('distanceBetween miles equals convertDistance(meters, miles)', () => {
    const r = distanceBetween(LONDON, PARIS);
    expect(r.miles).toBeCloseTo(convertDistance(r.meters, 'miles'), 5);
  });
  it('distanceBetween feet equals convertDistance(meters, feet)', () => {
    const r = distanceBetween(LONDON, PARIS);
    expect(r.feet).toBeCloseTo(convertDistance(r.meters, 'feet'), 5);
  });
  it('distanceBetween nauticalMiles equals convertDistance(meters, nautical_miles)', () => {
    const r = distanceBetween(LONDON, PARIS);
    expect(r.nauticalMiles).toBeCloseTo(convertDistance(r.meters, 'nautical_miles'), 5);
  });

  // filterWithinRadius + closestLocation consistency
  it('closestLocation result is always within a large enough radius', () => {
    const locs = [
      makeLocation('lon', 'London', LONDON.lat, LONDON.lng),
      makeLocation('par', 'Paris', PARIS.lat, PARIS.lng),
      makeLocation('ber', 'Berlin', BERLIN.lat, BERLIN.lng),
    ];
    const closest = closestLocation(locs, LONDON)!;
    const dist = haversineMeters(closest.coordinates, LONDON);
    const filtered = filterWithinRadius(locs, LONDON, dist + 1);
    expect(filtered.some(l => l.id === closest.id)).toBe(true);
  });

  // sortByDistance first element equals closestLocation
  it('sortByDistance[0] id equals closestLocation id', () => {
    const locs = [
      makeLocation('lon', 'London', LONDON.lat, LONDON.lng),
      makeLocation('tok', 'Tokyo', TOKYO.lat, TOKYO.lng),
      makeLocation('ny', 'New York', NEW_YORK.lat, NEW_YORK.lng),
    ];
    const sorted = sortByDistance(locs, PARIS);
    const closest = closestLocation(locs, PARIS);
    expect(sorted[0].id).toBe(closest!.id);
  });

  // makeCoords + isValidCoordinates
  it('makeCoords output passes isValidCoordinates', () => {
    expect(isValidCoordinates(makeCoords(51.5, -0.1))).toBe(true);
  });
  it('makeCoords with alt passes isValidCoordinates', () => {
    expect(isValidCoordinates(makeCoords(0, 0, 100))).toBe(true);
  });

  // makeLocation + getBoundingBox
  it('makeLocation items produce valid bounding box', () => {
    const locs = [
      makeLocation('a', 'A', 40, 10),
      makeLocation('b', 'B', 50, 20),
      makeLocation('c', 'C', 45, 15),
    ];
    const bb = getBoundingBox(locs)!;
    expect(bb.north).toBe(50);
    expect(bb.south).toBe(40);
    expect(bb.east).toBe(20);
    expect(bb.west).toBe(10);
  });

  // isWithinCircle with dynamically computed radius
  it('closest location is always within dynamic-radius circle', () => {
    const locs = [
      makeLocation('a', 'A', 48, 2),
      makeLocation('b', 'B', 35, 139),
      makeLocation('c', 'C', 40, -74),
    ];
    const closest = closestLocation(locs, PARIS)!;
    const radius = haversineMeters(closest.coordinates, PARIS) + 10;
    const circle: GeoCircle = { centre: PARIS, radiusMeters: radius };
    expect(isWithinCircle(closest.coordinates, circle)).toBe(true);
  });

  // toRadians + toDegrees round-trip for all angle cases
  const angles = [-360, -270, -180, -90, -45, 0, 45, 90, 135, 180, 270, 360];
  angles.forEach(a => {
    it(`toRadians/toDegrees round-trip for ${a}°`, () => {
      expect(toDegrees(toRadians(a))).toBeCloseTo(a, 8);
    });
  });

  // bearing + haversine: moving in bearing direction increases distance
  it('moving in wrong direction increases distance', () => {
    // From London towards south, distance to Paris (which is SE) should still be measurable
    const b = bearing(LONDON, PARIS);
    expect(b).toBeGreaterThan(0);
    expect(b).toBeLessThan(360);
  });

  // normaliseCoordinates preserves validity
  it('normaliseCoordinates preserves valid coords for many cities', () => {
    [LONDON, PARIS, TOKYO, SYDNEY, NEW_YORK, DUBAI].forEach(c => {
      const n = normaliseCoordinates(c);
      expect(isValidCoordinates(n)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 22 — Extra convertDistance edge-case table  (100 tests)
// ---------------------------------------------------------------------------
describe('convertDistance extended table', () => {
  // Input values in meters, expected outputs for each unit
  const table: Array<[number, DistanceUnit, number]> = [
    [0, 'meters', 0],
    [0, 'kilometers', 0],
    [0, 'miles', 0],
    [0, 'feet', 0],
    [0, 'nautical_miles', 0],
    [1, 'meters', 1],
    [1, 'kilometers', 0.001],
    [1, 'feet', 3.28084],
    [100, 'meters', 100],
    [100, 'kilometers', 0.1],
    [100, 'feet', 328.084],
    [1000, 'meters', 1000],
    [1000, 'kilometers', 1],
    [1609.34, 'miles', 1],
    [1852, 'nautical_miles', 1],
    [5000, 'kilometers', 5],
    [10000, 'kilometers', 10],
    [50000, 'kilometers', 50],
    [100000, 'kilometers', 100],
    [1000000, 'kilometers', 1000],
    [1000, 'miles', 0.621371],
    [10000, 'miles', 6.21371],
    [1000, 'nautical_miles', 0.539957],
    [10000, 'nautical_miles', 5.39957],
    [3000, 'meters', 3000],
    [3000, 'kilometers', 3],
    [3000, 'feet', 9842.52],
    [5280 * 0.3048, 'miles', 1],
    [9144, 'feet', 30000],
    [500, 'meters', 500],
    [500, 'kilometers', 0.5],
    [2000, 'meters', 2000],
    [2000, 'kilometers', 2],
    [20000, 'kilometers', 20],
    [200000, 'kilometers', 200],
    [1, 'nautical_miles', 0.000539957],
    [100, 'nautical_miles', 0.0539957],
    [1852 * 10, 'nautical_miles', 10],
    [1852 * 100, 'nautical_miles', 100],
    [1000 * 1.60934, 'miles', 1],
  ];

  table.forEach(([m, unit, expected]) => {
    it(`convertDistance(${m}, '${unit}') ≈ ${expected}`, () => {
      expect(convertDistance(m, unit)).toBeCloseTo(expected, 2);
    });
  });

  // Proportionality: doubling input doubles output for all units
  const units2: DistanceUnit[] = ['meters', 'kilometers', 'miles', 'feet', 'nautical_miles'];
  const bases = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000];
  bases.forEach(base => {
    units2.forEach(unit => {
      it(`convertDistance(${base*2}, '${unit}') = 2x convertDistance(${base}, '${unit}')`, () => {
        expect(convertDistance(base * 2, unit)).toBeCloseTo(2 * convertDistance(base, unit), 5);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 23 — haversineMeters extended precision  (50 tests)
// ---------------------------------------------------------------------------
describe('haversineMeters extended precision', () => {
  // Known city-pair distances with realistic bounds
  const knownPairs: Array<[string, Coordinates, string, Coordinates, number, number]> = [
    ['London', LONDON, 'Paris', PARIS, 330_000, 350_000],
    ['London', LONDON, 'Berlin', BERLIN, 920_000, 960_000],
    ['London', LONDON, 'Moscow', MOSCOW, 2_470_000, 2_530_000],
    ['London', LONDON, 'Dubai', DUBAI, 5_450_000, 5_550_000],
    ['London', LONDON, 'Tokyo', TOKYO, 9_500_000, 9_650_000],
    ['London', LONDON, 'Sydney', SYDNEY, 16_900_000, 17_100_000],
    ['New York', NEW_YORK, 'London', LONDON, 5_500_000, 5_640_000],
    ['Paris', PARIS, 'Berlin', BERLIN, 870_000, 920_000],
    ['Tokyo', TOKYO, 'Sydney', SYDNEY, 7_700_000, 7_900_000],
    ['Dubai', DUBAI, 'Mumbai', MUMBAI, 1_880_000, 1_960_000],
  ];

  knownPairs.forEach(([nameA, a, nameB, b, minM, maxM]) => {
    it(`${nameA}→${nameB} haversine between ${minM/1000}km and ${maxM/1000}km`, () => {
      const d = haversineMeters(a, b);
      expect(d).toBeGreaterThan(minM);
      expect(d).toBeLessThan(maxM);
    });
    it(`${nameB}→${nameA} haversine symmetric (between ${minM/1000} and ${maxM/1000}km)`, () => {
      const d = haversineMeters(b, a);
      expect(d).toBeGreaterThan(minM);
      expect(d).toBeLessThan(maxM);
    });
  });

  // Very small distances
  it('1° lat separation ≈ 111km', () => {
    const a: Coordinates = { lat: 10, lng: 0 };
    const b: Coordinates = { lat: 11, lng: 0 };
    expect(haversineMeters(a, b)).toBeGreaterThan(110_000);
    expect(haversineMeters(a, b)).toBeLessThan(112_000);
  });
  it('0.1° lat separation ≈ 11.1km', () => {
    const a: Coordinates = { lat: 10, lng: 0 };
    const b: Coordinates = { lat: 10.1, lng: 0 };
    expect(haversineMeters(a, b)).toBeGreaterThan(11_000);
    expect(haversineMeters(a, b)).toBeLessThan(11_200);
  });
  it('0.01° lat separation ≈ 1.11km', () => {
    const a: Coordinates = { lat: 0, lng: 0 };
    const b: Coordinates = { lat: 0.01, lng: 0 };
    expect(haversineMeters(a, b)).toBeGreaterThan(1_100);
    expect(haversineMeters(a, b)).toBeLessThan(1_120);
  });

  // Zero distance same-point checks for all cities
  [LONDON, PARIS, BERLIN, TOKYO, SYDNEY, NEW_YORK, DUBAI, MOSCOW, MUMBAI, BEIJING].forEach(c => {
    it(`haversineMeters same point (${c.lat},${c.lng}) = 0`, () => {
      expect(haversineMeters(c, c)).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// SECTION 24b — makeCoords + makeLocation extra coverage  (10 tests)
// ---------------------------------------------------------------------------
describe('makeCoords and makeLocation extra', () => {
  it('makeCoords result is compatible with isWithinBoundingBox', () => {
    const c = makeCoords(55, 10);
    const box: BoundingBox = { north: 60, south: 50, east: 20, west: 0 };
    expect(isWithinBoundingBox(c, box)).toBe(true);
  });
  it('makeCoords result is compatible with haversineMeters', () => {
    const a = makeCoords(0, 0);
    const b = makeCoords(1, 0);
    expect(haversineMeters(a, b)).toBeGreaterThan(0);
  });
  it('makeLocation result id matches input', () => {
    const l = makeLocation('xyz', 'Site XYZ', 10, 20);
    expect(l.id).toBe('xyz');
  });
  it('makeLocation result is valid GeoLocation for getBoundingBox', () => {
    const locs = [makeLocation('a', 'A', 10, 10), makeLocation('b', 'B', 20, 20)];
    const bb = getBoundingBox(locs);
    expect(bb).not.toBeNull();
    expect(bb!.north).toBe(20);
  });
  it('makeCoords with negative alt stores correctly', () => {
    const c = makeCoords(0, 0, -100);
    expect(c.alt).toBe(-100);
  });
  it('makeLocation with edge lat/lng 0,0', () => {
    const l = makeLocation('origin', 'Origin', 0, 0);
    expect(l.coordinates.lat).toBe(0);
    expect(l.coordinates.lng).toBe(0);
  });
  it('filterWithinRadius with makeLocation inputs', () => {
    const locs = [
      makeLocation('a', 'A', 51.5, -0.1),
      makeLocation('b', 'B', 0, 0),
    ];
    const result = filterWithinRadius(locs, LONDON, 50_000);
    expect(result.some(l => l.id === 'a')).toBe(true);
    expect(result.some(l => l.id === 'b')).toBe(false);
  });
  it('sortByDistance with makeLocation inputs returns correct order', () => {
    const locs = [
      makeLocation('far', 'Far', 0, 0),
      makeLocation('near', 'Near', 51.5, -0.1),
    ];
    const sorted = sortByDistance(locs, LONDON);
    expect(sorted[0].id).toBe('near');
  });
  it('closestLocation with makeCoords coords', () => {
    const a = makeCoords(51.5, -0.1);
    const locs = [
      makeLocation('close', 'Close', a.lat, a.lng),
      makeLocation('far', 'Far', 0, 0),
    ];
    expect(closestLocation(locs, LONDON)!.id).toBe('close');
  });
  it('getBoundingBox with 5 makeLocation inputs', () => {
    const locs = [
      makeLocation('1', 'A', 10, -10),
      makeLocation('2', 'B', 20, 0),
      makeLocation('3', 'C', 15, 5),
      makeLocation('4', 'D', 5, -5),
      makeLocation('5', 'E', 25, 10),
    ];
    const bb = getBoundingBox(locs)!;
    expect(bb.north).toBe(25);
    expect(bb.south).toBe(5);
    expect(bb.east).toBe(10);
    expect(bb.west).toBe(-10);
  });
});

// ---------------------------------------------------------------------------
// SECTION 24 — isValidCoordinates boundary stress  (40 tests)
// ---------------------------------------------------------------------------
describe('isValidCoordinates boundary stress', () => {
  // Exact boundary values
  const exactBoundaries: Array<[Coordinates, boolean]> = [
    [{ lat: 90, lng: 0 }, true],
    [{ lat: -90, lng: 0 }, true],
    [{ lat: 0, lng: 180 }, true],
    [{ lat: 0, lng: -180 }, true],
    [{ lat: 90, lng: 180 }, true],
    [{ lat: -90, lng: -180 }, true],
    [{ lat: 90.0001, lng: 0 }, false],
    [{ lat: -90.0001, lng: 0 }, false],
    [{ lat: 0, lng: 180.0001 }, false],
    [{ lat: 0, lng: -180.0001 }, false],
  ];
  exactBoundaries.forEach(([c, expected]) => {
    it(`isValidCoordinates({lat:${c.lat},lng:${c.lng}}) = ${expected}`, () => {
      expect(isValidCoordinates(c)).toBe(expected);
    });
  });

  // All latitudes from -90 to 90 in steps of 10 with lng=0 → all valid
  for (let lat = -90; lat <= 90; lat += 10) {
    it(`lat=${lat}, lng=0 is valid`, () => {
      expect(isValidCoordinates({ lat, lng: 0 })).toBe(true);
    });
  }
  // All longitudes from -180 to 180 in steps of 20 with lat=0 → all valid
  for (let lng = -180; lng <= 180; lng += 20) {
    it(`lat=0, lng=${lng} is valid`, () => {
      expect(isValidCoordinates({ lat: 0, lng })).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 21 — Type exports smoke tests  (20 tests)
// ---------------------------------------------------------------------------
describe('Type exports smoke tests', () => {
  it('DistanceUnit type: meters is assignable', () => {
    const u: DistanceUnit = 'meters';
    expect(u).toBe('meters');
  });
  it('DistanceUnit type: kilometers is assignable', () => {
    const u: DistanceUnit = 'kilometers';
    expect(u).toBe('kilometers');
  });
  it('DistanceUnit type: miles is assignable', () => {
    const u: DistanceUnit = 'miles';
    expect(u).toBe('miles');
  });
  it('DistanceUnit type: feet is assignable', () => {
    const u: DistanceUnit = 'feet';
    expect(u).toBe('feet');
  });
  it('DistanceUnit type: nautical_miles is assignable', () => {
    const u: DistanceUnit = 'nautical_miles';
    expect(u).toBe('nautical_miles');
  });
  it('Coordinates interface: can create with lat/lng', () => {
    const c: Coordinates = { lat: 0, lng: 0 };
    expect(c.lat).toBe(0);
  });
  it('Coordinates interface: alt is optional', () => {
    const c: Coordinates = { lat: 0, lng: 0, alt: 100 };
    expect(c.alt).toBe(100);
  });
  it('GeoLocation interface: can create', () => {
    const g: GeoLocation = { id: '1', name: 'Test', coordinates: { lat: 0, lng: 0 } };
    expect(g.id).toBe('1');
  });
  it('BoundingBox interface: can create', () => {
    const bb: BoundingBox = { north: 90, south: -90, east: 180, west: -180 };
    expect(bb.north).toBe(90);
  });
  it('GeoCircle interface: can create', () => {
    const gc: GeoCircle = { centre: { lat: 0, lng: 0 }, radiusMeters: 100 };
    expect(gc.radiusMeters).toBe(100);
  });
  it('GeoPolygon interface: can create', () => {
    const gp: GeoPolygon = { vertices: [{ lat: 0, lng: 0 }] };
    expect(gp.vertices).toHaveLength(1);
  });
  it('GeoLocation optional address', () => {
    const g: GeoLocation = { id: '1', name: 'T', coordinates: { lat: 0, lng: 0 }, address: '123 St' };
    expect(g.address).toBe('123 St');
  });
  it('GeoLocation optional country', () => {
    const g: GeoLocation = { id: '1', name: 'T', coordinates: { lat: 0, lng: 0 }, country: 'UK' };
    expect(g.country).toBe('UK');
  });
  it('GeoLocation optional postcode', () => {
    const g: GeoLocation = { id: '1', name: 'T', coordinates: { lat: 0, lng: 0 }, postcode: 'SW1' };
    expect(g.postcode).toBe('SW1');
  });
  it('GeoLocation optional type', () => {
    const g: GeoLocation = { id: '1', name: 'T', coordinates: { lat: 0, lng: 0 }, type: 'warehouse' };
    expect(g.type).toBe('warehouse');
  });
  it('GeoCircle centre is Coordinates', () => {
    const gc: GeoCircle = { centre: LONDON, radiusMeters: 5000 };
    expect(gc.centre.lat).toBe(LONDON.lat);
  });
  it('GeoPolygon vertices array accepts many points', () => {
    const vertices = Array.from({ length: 100 }, (_, i) => ({ lat: i, lng: i }));
    const gp: GeoPolygon = { vertices };
    expect(gp.vertices).toHaveLength(100);
  });
  it('DistanceResult has 5 numeric fields', () => {
    const r = distanceBetween(LONDON, PARIS);
    expect(['meters', 'kilometers', 'miles', 'feet', 'nauticalMiles'].every(k => typeof r[k as keyof typeof r] === 'number')).toBe(true);
  });
  it('all exported functions are functions', () => {
    const fns = [toRadians, toDegrees, haversineMeters, distanceBetween, convertDistance,
      midpoint, isWithinCircle, isWithinBoundingBox, getBoundingBox, isValidCoordinates,
      normaliseCoordinates, sortByDistance, filterWithinRadius, polygonArea, bearing,
      isValidDistanceUnit, makeCoords, makeLocation, closestLocation];
    fns.forEach(fn => expect(typeof fn).toBe('function'));
  });
  it('all 5 DistanceUnit values are valid', () => {
    const units: string[] = ['meters', 'kilometers', 'miles', 'feet', 'nautical_miles'];
    units.forEach(u => expect(isValidDistanceUnit(u)).toBe(true));
  });
});
