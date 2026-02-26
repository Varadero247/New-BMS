// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { IoTDevice, IoTProtocol } from './types';

export function createDeviceRegistry() {
  const devices = new Map<string, IoTDevice>();

  function registerDevice(device: IoTDevice): void {
    devices.set(device.id, { ...device });
  }

  function unregisterDevice(id: string): boolean {
    return devices.delete(id);
  }

  function getDevice(id: string): IoTDevice | undefined {
    return devices.get(id);
  }

  function getAllDevices(): IoTDevice[] {
    return Array.from(devices.values());
  }

  function getOnlineDevices(): IoTDevice[] {
    return Array.from(devices.values()).filter((d) => d.isOnline);
  }

  function updateDeviceStatus(id: string, isOnline: boolean): void {
    const device = devices.get(id);
    if (device) {
      device.isOnline = isOnline;
      if (isOnline) device.lastSeen = new Date();
    }
  }

  function getDevicesByTag(tag: string): IoTDevice[] {
    return Array.from(devices.values()).filter((d) => d.tags.includes(tag));
  }

  function getDevicesByProtocol(protocol: IoTProtocol): IoTDevice[] {
    return Array.from(devices.values()).filter((d) => d.protocol === protocol);
  }

  function getDeviceCount(): number {
    return devices.size;
  }

  return {
    registerDevice,
    unregisterDevice,
    getDevice,
    getAllDevices,
    getOnlineDevices,
    updateDeviceStatus,
    getDevicesByTag,
    getDevicesByProtocol,
    getDeviceCount,
  };
}
