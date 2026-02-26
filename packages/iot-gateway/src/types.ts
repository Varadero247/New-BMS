// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export type IoTProtocol = 'mqtt' | 'http' | 'websocket' | 'modbus' | 'opc-ua';
export type IoTDataType =
  | 'temperature'
  | 'humidity'
  | 'pressure'
  | 'vibration'
  | 'power'
  | 'speed'
  | 'count'
  | 'binary'
  | 'custom';
export type IoTAlertSeverity = 'info' | 'warning' | 'critical';

export interface IoTThreshold {
  min?: number;
  max?: number;
  warningMin?: number;
  warningMax?: number;
}

export interface IoTDevice {
  id: string;
  name: string;
  protocol: IoTProtocol;
  endpoint: string;
  dataType: IoTDataType;
  unit: string;
  calibrationFactor?: number;
  thresholds?: IoTThreshold;
  tags: string[];
  lastSeen?: Date;
  isOnline: boolean;
}

export interface IoTReading {
  deviceId: string;
  value: number | boolean | string;
  unit: string;
  timestamp: Date;
  quality: 'good' | 'uncertain' | 'bad';
}

export interface IoTAlert {
  id: string;
  deviceId: string;
  severity: IoTAlertSeverity;
  message: string;
  value: number;
  threshold: number;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}
