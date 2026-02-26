export type DistanceUnit = 'meters' | 'kilometers' | 'miles' | 'feet' | 'nautical_miles';
export type CoordinateSystem = 'WGS84' | 'OSGB36' | 'UTM';
export type BoundaryType = 'circle' | 'polygon' | 'rectangle';

export interface Coordinates {
  lat: number;
  lng: number;
  alt?: number;   // altitude in meters
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoLocation {
  id: string;
  name: string;
  coordinates: Coordinates;
  address?: string;
  country?: string;
  postcode?: string;
  type?: string;
}

export interface GeoCircle {
  centre: Coordinates;
  radiusMeters: number;
}

export interface GeoPolygon {
  vertices: Coordinates[];
}

export interface DistanceResult {
  meters: number;
  kilometers: number;
  miles: number;
  feet: number;
  nauticalMiles: number;
}
