// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { IoTDevice, IoTReading, IoTAlert } from './types';

let alertIdCounter = 1;

/** Applies calibration factor to a raw numeric reading. */
export function applyCalibration(value: number, factor: number): number {
  return value * factor;
}

/** Validates that a partial IoTReading has required fields. */
export function validateReading(reading: Partial<IoTReading>): boolean {
  if (!reading.deviceId) return false;
  if (reading.value === undefined || reading.value === null) return false;
  if (!reading.unit) return false;
  if (!reading.timestamp || !(reading.timestamp instanceof Date)) return false;
  if (!reading.quality) return false;
  return true;
}

/**
 * Normalises a raw IoT payload into a structured IoTReading.
 * Returns null if the raw payload is invalid.
 */
export function normalizeReading(raw: unknown, device: IoTDevice): IoTReading | null {
  if (raw === null || raw === undefined) return null;

  let numericValue: number | boolean | string;

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    const rawVal = obj['value'] ?? obj['v'] ?? obj['reading'];
    if (rawVal === undefined) return null;
    numericValue = rawVal as number | boolean | string;
  } else if (typeof raw === 'number' || typeof raw === 'boolean' || typeof raw === 'string') {
    numericValue = raw;
  } else {
    return null;
  }

  // Apply calibration for numeric values
  if (typeof numericValue === 'number' && device.calibrationFactor !== undefined) {
    numericValue = applyCalibration(numericValue, device.calibrationFactor);
  }

  return {
    deviceId: device.id,
    value: numericValue,
    unit: device.unit,
    timestamp: new Date(),
    quality: 'good',
  };
}

/**
 * Checks reading value against device thresholds.
 * Returns an IoTAlert if a threshold is breached, otherwise null.
 */
export function checkThresholds(reading: IoTReading, device: IoTDevice): IoTAlert | null {
  if (!device.thresholds) return null;
  if (typeof reading.value !== 'number') return null;

  const val = reading.value;
  const t = device.thresholds;

  if (t.max !== undefined && val > t.max) {
    return {
      id: `alert-${alertIdCounter++}`,
      deviceId: device.id,
      severity: 'critical',
      message: `${device.name} exceeded maximum threshold (${val} > ${t.max} ${device.unit})`,
      value: val,
      threshold: t.max,
      triggeredAt: reading.timestamp,
    };
  }

  if (t.min !== undefined && val < t.min) {
    return {
      id: `alert-${alertIdCounter++}`,
      deviceId: device.id,
      severity: 'critical',
      message: `${device.name} below minimum threshold (${val} < ${t.min} ${device.unit})`,
      value: val,
      threshold: t.min,
      triggeredAt: reading.timestamp,
    };
  }

  if (t.warningMax !== undefined && val > t.warningMax) {
    return {
      id: `alert-${alertIdCounter++}`,
      deviceId: device.id,
      severity: 'warning',
      message: `${device.name} approaching maximum (${val} > ${t.warningMax} ${device.unit})`,
      value: val,
      threshold: t.warningMax,
      triggeredAt: reading.timestamp,
    };
  }

  if (t.warningMin !== undefined && val < t.warningMin) {
    return {
      id: `alert-${alertIdCounter++}`,
      deviceId: device.id,
      severity: 'warning',
      message: `${device.name} approaching minimum (${val} < ${t.warningMin} ${device.unit})`,
      value: val,
      threshold: t.warningMin,
      triggeredAt: reading.timestamp,
    };
  }

  return null;
}

/**
 * Aggregates a window of readings into summary statistics.
 */
export function aggregateReadings(
  readings: IoTReading[],
  windowMs: number
): { avg: number; min: number; max: number; count: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const numericValues = readings
    .filter(
      (r) =>
        typeof r.value === 'number' &&
        r.timestamp.getTime() >= windowStart
    )
    .map((r) => r.value as number);

  if (numericValues.length === 0) {
    return { avg: 0, min: 0, max: 0, count: 0 };
  }

  const sum = numericValues.reduce((acc, v) => acc + v, 0);
  return {
    avg: parseFloat((sum / numericValues.length).toFixed(4)),
    min: Math.min(...numericValues),
    max: Math.max(...numericValues),
    count: numericValues.length,
  };
}
