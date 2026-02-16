/**
 * useGeolocation — React hook for GPS location tracking (field service, inspections)
 * Provides current position, continuous tracking, and distance calculation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number; // meters
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null; // m/s
  timestamp: number;
}

export interface GeolocationState {
  isSupported: boolean;
  position: GeoPosition | null;
  error: string | null;
  loading: boolean;
  getCurrentPosition: () => Promise<GeoPosition | null>;
  startTracking: () => void;
  stopTracking: () => void;
  isTracking: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

function toGeoPosition(pos: GeolocationPosition): GeoPosition {
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
    altitude: pos.coords.altitude,
    altitudeAccuracy: pos.coords.altitudeAccuracy,
    heading: pos.coords.heading,
    speed: pos.coords.speed,
    timestamp: pos.timestamp,
  };
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula).
 * Returns distance in meters.
 */
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGeolocation(options: GeolocationOptions = {}): GeolocationState {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
  } = options;

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition(toGeoPosition(pos));
    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    const messages: Record<number, string> = {
      1: 'Location permission denied',
      2: 'Location unavailable',
      3: 'Location request timed out',
    };
    setError(messages[err.code] || 'Unknown geolocation error');
    setLoading(false);
  }, []);

  const getCurrentPosition = useCallback(async (): Promise<GeoPosition | null> => {
    if (!isSupported) {
      setError('Geolocation not supported');
      return null;
    }

    setLoading(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geo = toGeoPosition(pos);
          setPosition(geo);
          setError(null);
          setLoading(false);
          resolve(geo);
        },
        (err) => {
          handleError(err);
          resolve(null);
        },
        { enableHighAccuracy, timeout, maximumAge }
      );
    });
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, handleError]);

  const startTracking = useCallback(() => {
    if (!isSupported) {
      setError('Geolocation not supported');
      return;
    }

    if (watchIdRef.current !== null) return; // Already tracking

    setLoading(true);
    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy, timeout, maximumAge }
    );
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    isSupported,
    position,
    error,
    loading,
    getCurrentPosition,
    startTracking,
    stopTracking,
    isTracking,
  };
}
