// ─── Types ──────────────────────────────────────────────────────────────────

export type ServiceStatusValue = 'operational' | 'degraded' | 'down';

export interface ServiceHealth {
  name: string;
  port: number;
  status: ServiceStatusValue;
  latencyMs: number;
  lastChecked: string;
}

export interface UptimeData {
  '24h': number;
  '7d': number;
  '30d': number;
}

export interface PlatformStatus {
  status: ServiceStatusValue;
  timestamp: string;
  services: ServiceHealth[];
  uptime: UptimeData;
}

// ─── Service Registry ───────────────────────────────────────────────────────

export const SERVICE_REGISTRY: Array<{ name: string; port: number }> = [
  { name: 'API Gateway', port: 4000 },
  { name: 'Health & Safety', port: 4001 },
  { name: 'Environment', port: 4002 },
  { name: 'Quality', port: 4003 },
  { name: 'AI Analysis', port: 4004 },
  { name: 'Inventory', port: 4005 },
  { name: 'HR', port: 4006 },
  { name: 'Payroll', port: 4007 },
  { name: 'Workflows', port: 4008 },
  { name: 'Project Management', port: 4009 },
  { name: 'Automotive', port: 4010 },
  { name: 'Medical', port: 4011 },
  { name: 'Aerospace', port: 4012 },
  { name: 'Finance', port: 4013 },
  { name: 'CRM', port: 4014 },
  { name: 'InfoSec', port: 4015 },
  { name: 'ESG', port: 4016 },
  { name: 'CMMS', port: 4017 },
  { name: 'Portal', port: 4018 },
  { name: 'Food Safety', port: 4019 },
  { name: 'Energy', port: 4020 },
  { name: 'Analytics', port: 4021 },
  { name: 'Field Service', port: 4022 },
  { name: 'ISO 42001', port: 4023 },
  { name: 'ISO 37001', port: 4024 },
];

// ─── In-Memory Health Store ─────────────────────────────────────────────────

const healthStore = new Map<string, ServiceHealth>();

// Mock uptime data
const uptimeData: UptimeData = {
  '24h': 99.98,
  '7d': 99.95,
  '30d': 99.91,
};

// ─── Health Check Functions ─────────────────────────────────────────────────

export function checkServiceHealth(name: string, port: number): ServiceHealth {
  // Attempt real health check via HTTP
  const now = new Date().toISOString();

  // For in-memory usage, simulate a health check with random latency
  const latencyMs = Math.floor(Math.random() * 40) + 5; // 5-45ms
  const statusRoll = Math.random();

  let status: ServiceStatusValue = 'operational';
  if (statusRoll > 0.98) {
    status = 'down';
  } else if (statusRoll > 0.93) {
    status = 'degraded';
  }

  const health: ServiceHealth = {
    name,
    port,
    status,
    latencyMs,
    lastChecked: now,
  };

  healthStore.set(`${name}:${port}`, health);
  return health;
}

export function setServiceHealth(name: string, port: number, status: ServiceStatusValue, latencyMs: number): ServiceHealth {
  const health: ServiceHealth = {
    name,
    port,
    status,
    latencyMs,
    lastChecked: new Date().toISOString(),
  };
  healthStore.set(`${name}:${port}`, health);
  return health;
}

export function getAllServiceStatus(): ServiceHealth[] {
  return SERVICE_REGISTRY.map(service => {
    const existing = healthStore.get(`${service.name}:${service.port}`);
    if (existing) return existing;
    return checkServiceHealth(service.name, service.port);
  });
}

export function getOverallStatus(): ServiceStatusValue {
  const services = getAllServiceStatus();
  if (services.some(s => s.status === 'down')) return 'down';
  if (services.some(s => s.status === 'degraded')) return 'degraded';
  return 'operational';
}

export function getUptime(): UptimeData {
  return { ...uptimeData };
}

export function getPlatformStatus(): PlatformStatus {
  const services = getAllServiceStatus();
  const overall = services.some(s => s.status === 'down')
    ? 'down'
    : services.some(s => s.status === 'degraded')
      ? 'degraded'
      : 'operational';

  return {
    status: overall,
    timestamp: new Date().toISOString(),
    services,
    uptime: getUptime(),
  };
}

// ─── Reset (for testing) ────────────────────────────────────────────────────

export function _resetStores(): void {
  healthStore.clear();
}
