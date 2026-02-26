import { BoundingBox, Coordinates, DistanceResult, DistanceUnit, GeoCircle, GeoLocation, GeoPolygon } from './types';

const EARTH_RADIUS_M = 6_371_000;
const KM_PER_MILE = 1.60934;
const FEET_PER_METER = 3.28084;
const NM_PER_KM = 0.539957;

export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinDLng * sinDLng;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function distanceBetween(a: Coordinates, b: Coordinates): DistanceResult {
  const meters = haversineMeters(a, b);
  const kilometers = meters / 1000;
  const miles = kilometers / KM_PER_MILE;
  const feet = meters * FEET_PER_METER;
  const nauticalMiles = kilometers * NM_PER_KM;
  return { meters, kilometers, miles, feet, nauticalMiles };
}

export function convertDistance(meters: number, to: DistanceUnit): number {
  switch (to) {
    case 'meters': return meters;
    case 'kilometers': return meters / 1000;
    case 'miles': return (meters / 1000) / KM_PER_MILE;
    case 'feet': return meters * FEET_PER_METER;
    case 'nautical_miles': return (meters / 1000) * NM_PER_KM;
    default: return meters;
  }
}

export function midpoint(a: Coordinates, b: Coordinates): Coordinates {
  const dLng = toRadians(b.lng - a.lng);
  const aLat = toRadians(a.lat);
  const bLat = toRadians(b.lat);
  const aLng = toRadians(a.lng);
  const bx = Math.cos(bLat) * Math.cos(dLng);
  const by = Math.cos(bLat) * Math.sin(dLng);
  const lat = toDegrees(Math.atan2(Math.sin(aLat) + Math.sin(bLat), Math.sqrt((Math.cos(aLat) + bx) ** 2 + by ** 2)));
  const lng = toDegrees(aLng + Math.atan2(by, Math.cos(aLat) + bx));
  return { lat, lng };
}

export function isWithinCircle(point: Coordinates, circle: GeoCircle): boolean {
  return haversineMeters(point, circle.centre) <= circle.radiusMeters;
}

export function isWithinBoundingBox(point: Coordinates, box: BoundingBox): boolean {
  return point.lat >= box.south && point.lat <= box.north && point.lng >= box.west && point.lng <= box.east;
}

export function getBoundingBox(locations: GeoLocation[]): BoundingBox | null {
  if (locations.length === 0) return null;
  const lats = locations.map(l => l.coordinates.lat);
  const lngs = locations.map(l => l.coordinates.lng);
  return { north: Math.max(...lats), south: Math.min(...lats), east: Math.max(...lngs), west: Math.min(...lngs) };
}

export function isValidCoordinates(coords: Coordinates): boolean {
  return coords.lat >= -90 && coords.lat <= 90 && coords.lng >= -180 && coords.lng <= 180;
}

export function normaliseCoordinates(coords: Coordinates): Coordinates {
  let lat = coords.lat;
  let lng = coords.lng;
  while (lat > 90) lat -= 180;
  while (lat < -90) lat += 180;
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return { ...coords, lat, lng };
}

export function sortByDistance(locations: GeoLocation[], origin: Coordinates): GeoLocation[] {
  return [...locations].sort((a, b) =>
    haversineMeters(a.coordinates, origin) - haversineMeters(b.coordinates, origin)
  );
}

export function filterWithinRadius(locations: GeoLocation[], centre: Coordinates, radiusMeters: number): GeoLocation[] {
  return locations.filter(l => haversineMeters(l.coordinates, centre) <= radiusMeters);
}

export function polygonArea(polygon: GeoPolygon): number {
  const v = polygon.vertices;
  if (v.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < v.length; i++) {
    const j = (i + 1) % v.length;
    area += toRadians(v[j].lng - v[i].lng) * (2 + Math.sin(toRadians(v[i].lat)) + Math.sin(toRadians(v[j].lat)));
  }
  return Math.abs(area * EARTH_RADIUS_M * EARTH_RADIUS_M / 2);
}

export function bearing(from: Coordinates, to: Coordinates): number {
  const dLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);
  const y = Math.sin(dLng) * Math.cos(toLat);
  const x = Math.cos(fromLat) * Math.sin(toLat) - Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);
  return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

export function isValidDistanceUnit(u: string): u is DistanceUnit {
  return ['meters', 'kilometers', 'miles', 'feet', 'nautical_miles'].includes(u);
}

export function makeCoords(lat: number, lng: number, alt?: number): Coordinates {
  return { lat, lng, ...(alt !== undefined ? { alt } : {}) };
}

export function makeLocation(id: string, name: string, lat: number, lng: number): GeoLocation {
  return { id, name, coordinates: { lat, lng } };
}

export function closestLocation(locations: GeoLocation[], origin: Coordinates): GeoLocation | undefined {
  if (locations.length === 0) return undefined;
  return sortByDistance(locations, origin)[0];
}
