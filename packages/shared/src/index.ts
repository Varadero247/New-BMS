// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Auth Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'USER';

// ============================================
// Building Types
// ============================================

export interface Building {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  totalArea?: number;
  floors: number;
  yearBuilt?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBuildingRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  totalArea?: number;
  floors?: number;
  yearBuilt?: number;
}

export interface Zone {
  id: string;
  buildingId: string;
  name: string;
  floor: number;
  type: ZoneType;
  area?: number;
  capacity?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ZoneType =
  | 'OFFICE'
  | 'CONFERENCE'
  | 'LOBBY'
  | 'HALLWAY'
  | 'RESTROOM'
  | 'KITCHEN'
  | 'SERVER_ROOM'
  | 'STORAGE'
  | 'PARKING'
  | 'MECHANICAL'
  | 'OUTDOOR'
  | 'OTHER';

// ============================================
// Device Types
// ============================================

export interface Device {
  id: string;
  buildingId: string;
  zoneId?: string;
  name: string;
  type: DeviceType;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  ipAddress?: string;
  macAddress?: string;
  firmware?: string;
  status: DeviceStatus;
  lastSeen?: string;
  installDate?: string;
  warrantyEnd?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DeviceType =
  | 'HVAC'
  | 'THERMOSTAT'
  | 'LIGHTING'
  | 'MOTION_SENSOR'
  | 'DOOR_SENSOR'
  | 'WINDOW_SENSOR'
  | 'SMOKE_DETECTOR'
  | 'CO_DETECTOR'
  | 'WATER_LEAK'
  | 'ENERGY_METER'
  | 'AIR_QUALITY'
  | 'CAMERA'
  | 'ACCESS_CONTROL'
  | 'ELEVATOR'
  | 'FIRE_ALARM'
  | 'SPRINKLER'
  | 'GENERATOR'
  | 'UPS'
  | 'OTHER';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'WARNING' | 'ERROR' | 'MAINTENANCE';

export interface SensorReading {
  id: string;
  deviceId: string;
  type: ReadingType;
  value: number;
  unit: string;
  timestamp: string;
}

export type ReadingType =
  | 'TEMPERATURE'
  | 'HUMIDITY'
  | 'CO2'
  | 'VOC'
  | 'PM25'
  | 'PM10'
  | 'NOISE'
  | 'LIGHT'
  | 'MOTION'
  | 'OCCUPANCY'
  | 'POWER'
  | 'VOLTAGE'
  | 'CURRENT'
  | 'WATER_FLOW'
  | 'PRESSURE';

// ============================================
// Alert Types
// ============================================

export interface Alert {
  id: string;
  buildingId: string;
  deviceId?: string;
  userId?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  status: AlertStatus;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type AlertType =
  | 'SYSTEM'
  | 'DEVICE'
  | 'SECURITY'
  | 'ENVIRONMENTAL'
  | 'MAINTENANCE'
  | 'ENERGY';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';

// ============================================
// Energy Types
// ============================================

export interface EnergyReading {
  id: string;
  buildingId: string;
  type: EnergyType;
  value: number;
  unit: string;
  cost?: number;
  timestamp: string;
}

export type EnergyType = 'ELECTRICITY' | 'GAS' | 'WATER' | 'SOLAR' | 'WIND';

export interface EnergyStats {
  totalConsumption: number;
  totalCost: number;
  averageDaily: number;
  peakUsage: number;
  comparison: {
    previousPeriod: number;
    percentChange: number;
  };
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  buildings: {
    total: number;
    active: number;
  };
  devices: {
    total: number;
    online: number;
    offline: number;
    warning: number;
    error: number;
  };
  alerts: {
    total: number;
    active: number;
    critical: number;
  };
  energy: {
    todayUsage: number;
    monthUsage: number;
    trend: number;
  };
}

// ============================================
// Utility Types
// ============================================

export type DateRange = {
  start: string;
  end: string;
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  BUILDINGS: {
    LIST: '/buildings',
    CREATE: '/buildings',
    GET: (id: string) => `/buildings/${id}`,
    UPDATE: (id: string) => `/buildings/${id}`,
    DELETE: (id: string) => `/buildings/${id}`,
  },
  ZONES: {
    LIST: (buildingId: string) => `/buildings/${buildingId}/zones`,
    CREATE: (buildingId: string) => `/buildings/${buildingId}/zones`,
    GET: (buildingId: string, zoneId: string) => `/buildings/${buildingId}/zones/${zoneId}`,
  },
  DEVICES: {
    LIST: '/devices',
    GET: (id: string) => `/devices/${id}`,
    READINGS: (id: string) => `/devices/${id}/readings`,
    CONTROL: (id: string) => `/devices/${id}/control`,
  },
  ALERTS: {
    LIST: '/alerts',
    GET: (id: string) => `/alerts/${id}`,
    ACKNOWLEDGE: (id: string) => `/alerts/${id}/acknowledge`,
    RESOLVE: (id: string) => `/alerts/${id}/resolve`,
  },
  ENERGY: {
    STATS: '/energy/stats',
    READINGS: '/energy/readings',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
} as const;
