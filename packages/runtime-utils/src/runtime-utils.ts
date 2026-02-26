// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function isNode(): boolean {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getMemoryUsage(): NodeJS.MemoryUsage | null {
  if (typeof process !== 'undefined' && typeof process.memoryUsage === 'function') {
    return process.memoryUsage();
  }
  return null;
}

export function getUptime(): number {
  if (typeof process !== 'undefined' && typeof process.uptime === 'function') {
    return process.uptime();
  }
  return 0;
}

export function getPlatform(): string {
  if (typeof process !== 'undefined' && process.platform) {
    return process.platform;
  }
  return 'unknown';
}

export function getNodeVersion(): string {
  if (typeof process !== 'undefined' && process.version) {
    return process.version;
  }
  return '';
}

export function getEnv(key: string, fallback?: string): string | undefined {
  const val = process.env[key];
  if (val !== undefined) return val;
  return fallback;
}

export function getEnvBool(key: string, fallback?: boolean): boolean {
  const val = process.env[key];
  if (val === undefined) return fallback ?? false;
  return val === 'true' || val === '1' || val === 'yes';
}

export function getEnvNumber(key: string, fallback?: number): number {
  const val = process.env[key];
  if (val === undefined) return fallback ?? 0;
  const n = Number(val);
  return isNaN(n) ? (fallback ?? 0) : n;
}

export function getEnvArray(key: string, sep: string = ','): string[] {
  const val = process.env[key];
  if (!val) return [];
  return val.split(sep).map(s => s.trim()).filter(Boolean);
}

export function getEnvOrThrow(key: string): string {
  const val = process.env[key];
  if (val === undefined || val === '') {
    throw new Error(`Environment variable "${key}" is not set`);
  }
  return val;
}

export function setEnv(key: string, value: string): void {
  process.env[key] = value;
}

export function unsetEnv(key: string): void {
  delete process.env[key];
}

export function hasEnv(key: string): boolean {
  return process.env[key] !== undefined;
}

export function getProcessId(): number {
  return process.pid;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function nextTick(): Promise<void> {
  if (typeof setImmediate !== 'undefined') {
    return new Promise(resolve => setImmediate(resolve));
  }
  return Promise.resolve();
}

export function measureTime(fn: () => void): number {
  const start = Date.now();
  fn();
  return Date.now() - start;
}

export function measureTimeAsync(fn: () => Promise<void>): Promise<number> {
  const start = Date.now();
  return fn().then(() => Date.now() - start);
}

export function createTimer(): { start(): void; stop(): number; elapsed(): number } {
  let startTime = 0;
  let stopTime = 0;
  let running = false;
  return {
    start() {
      startTime = Date.now();
      stopTime = 0;
      running = true;
    },
    stop() {
      stopTime = Date.now();
      running = false;
      return stopTime - startTime;
    },
    elapsed() {
      if (running) return Date.now() - startTime;
      return stopTime - startTime;
    }
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 0) return '0 B';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const idx = Math.min(i, units.length - 1);
  if (idx === 0) return `${bytes} B`;
  const val = bytes / Math.pow(1024, idx);
  return `${val.toFixed(2)} ${units[idx]}`;
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

export function parseBoolean(value: string | boolean | undefined): boolean {
  if (value === undefined) return false;
  if (typeof value === 'boolean') return value;
  const v = value.toLowerCase().trim();
  return v === 'true' || v === '1' || v === 'yes' || v === 'on';
}

export function parseInt10(value: string): number {
  return parseInt(value, 10);
}

export function parseFloat10(value: string): number {
  return parseFloat(value);
}
