'use client';

import { useState, useCallback } from 'react';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface UseGeoLocationResult {
  /** Current location data, or null if not yet captured */
  location: GeoLocation | null;
  /** Error message, or null */
  error: string | null;
  /** Whether a capture is in progress */
  loading: boolean;
  /** Trigger a location capture */
  capture: () => void;
}

const TIMEOUT_MS = 10000;

/**
 * Hook to capture the device's current GPS location via the Geolocation API.
 *
 * @example
 * ```tsx
 * const { location, error, loading, capture } = useGeoLocation();
 * ```
 */
export function useGeoLocation(): UseGeoLocationResult {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        let message: string;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access.';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Position unavailable. Check your device location settings.';
            break;
          case err.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
          default:
            message = 'An unknown error occurred while retrieving location.';
        }
        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: TIMEOUT_MS,
        maximumAge: 0,
      }
    );
  }, []);

  return { location, error, loading, capture };
}
