// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface LatLng { lat: number; lng: number; }
const R = 6371000; // Earth radius metres
export function toRad(deg: number): number { return deg * Math.PI / 180; }
export function toDeg(rad: number): number { return rad * 180 / Math.PI; }
export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}
export function boundingBox(points: LatLng[]): { min: LatLng; max: LatLng } {
  const lats = points.map(p => p.lat), lngs = points.map(p => p.lng);
  return { min: { lat: Math.min(...lats), lng: Math.min(...lngs) }, max: { lat: Math.max(...lats), lng: Math.max(...lngs) } };
}
export function isWithinRadius(center: LatLng, point: LatLng, radiusMetres: number): boolean {
  return haversineDistance(center, point) <= radiusMetres;
}
export function destinationPoint(origin: LatLng, distanceM: number, bearingDeg: number): LatLng {
  const d = distanceM / R, br = toRad(bearingDeg), lat1 = toRad(origin.lat), lng1 = toRad(origin.lng);
  const lat2 = Math.asin(Math.sin(lat1)*Math.cos(d) + Math.cos(lat1)*Math.sin(d)*Math.cos(br));
  const lng2 = lng1 + Math.atan2(Math.sin(br)*Math.sin(d)*Math.cos(lat1), Math.cos(d)-Math.sin(lat1)*Math.sin(lat2));
  return { lat: toDeg(lat2), lng: toDeg(lng2) };
}
export function pointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length-1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat, xj = polygon[j].lng, yj = polygon[j].lat;
    if (((yi > point.lat) !== (yj > point.lat)) && (point.lng < (xj-xi)*(point.lat-yi)/(yj-yi)+xi)) inside = !inside;
  }
  return inside;
}
export function clampLat(lat: number): number { return Math.max(-90, Math.min(90, lat)); }
export function clampLng(lng: number): number { return ((lng + 180) % 360 + 360) % 360 - 180; }
export function formatLatLng(p: LatLng, decimals = 6): string { return `${p.lat.toFixed(decimals)}, ${p.lng.toFixed(decimals)}`; }
export function parseLatLng(s: string): LatLng | null {
  const m = s.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (!m) return null;
  return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
}
export function distanceInKm(a: LatLng, b: LatLng): number { return haversineDistance(a,b)/1000; }
export function distanceInMiles(a: LatLng, b: LatLng): number { return haversineDistance(a,b)/1609.344; }
