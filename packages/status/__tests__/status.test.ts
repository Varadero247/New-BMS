import {
  SERVICE_REGISTRY,
  checkServiceHealth,
  setServiceHealth,
  getAllServiceStatus,
  getOverallStatus,
  getUptime,
  getPlatformStatus,
  _resetStores,
} from '../src/index';

describe('@ims/status', () => {
  beforeEach(() => {
    _resetStores();
  });

  describe('SERVICE_REGISTRY', () => {
    it('should have exactly 25 services', () => {
      expect(SERVICE_REGISTRY).toHaveLength(25);
    });

    it('should have unique names', () => {
      const names = SERVICE_REGISTRY.map((s) => s.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should have unique ports', () => {
      const ports = SERVICE_REGISTRY.map((s) => s.port);
      expect(new Set(ports).size).toBe(ports.length);
    });

    it('should have ports in range 4000-4024', () => {
      for (const service of SERVICE_REGISTRY) {
        expect(service.port).toBeGreaterThanOrEqual(4000);
        expect(service.port).toBeLessThanOrEqual(4024);
      }
    });

    it('should include API Gateway at 4000', () => {
      const gateway = SERVICE_REGISTRY.find((s) => s.port === 4000);
      expect(gateway).toBeDefined();
      expect(gateway!.name).toBe('API Gateway');
    });
  });

  describe('checkServiceHealth', () => {
    it('should return a health result', () => {
      const health = checkServiceHealth('Test Service', 9999);
      expect(health.name).toBe('Test Service');
      expect(health.port).toBe(9999);
      expect(['operational', 'degraded', 'down']).toContain(health.status);
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
      expect(health.lastChecked).toBeDefined();
    });
  });

  describe('setServiceHealth', () => {
    it('should set a specific health status', () => {
      const health = setServiceHealth('Test', 9999, 'degraded', 100);
      expect(health.status).toBe('degraded');
      expect(health.latencyMs).toBe(100);
    });

    it('should persist the status', () => {
      setServiceHealth('API Gateway', 4000, 'operational', 5);
      const all = getAllServiceStatus();
      const gateway = all.find((s) => s.name === 'API Gateway');
      expect(gateway!.status).toBe('operational');
      expect(gateway!.latencyMs).toBe(5);
    });
  });

  describe('getAllServiceStatus', () => {
    it('should return status for all 25 services', () => {
      const statuses = getAllServiceStatus();
      expect(statuses).toHaveLength(25);
    });

    it('each service should have all required fields', () => {
      const statuses = getAllServiceStatus();
      for (const s of statuses) {
        expect(s.name).toBeDefined();
        expect(s.port).toBeDefined();
        expect(['operational', 'degraded', 'down']).toContain(s.status);
        expect(typeof s.latencyMs).toBe('number');
        expect(s.lastChecked).toBeDefined();
      }
    });
  });

  describe('getOverallStatus', () => {
    it('should return a valid status value', () => {
      const status = getOverallStatus();
      expect(['operational', 'degraded', 'down']).toContain(status);
    });

    it('should return down if any service is down', () => {
      // Set all to operational first
      for (const svc of SERVICE_REGISTRY) {
        setServiceHealth(svc.name, svc.port, 'operational', 5);
      }
      // Set one to down
      setServiceHealth('API Gateway', 4000, 'down', 0);
      expect(getOverallStatus()).toBe('down');
    });

    it('should return degraded if any service is degraded and none down', () => {
      for (const svc of SERVICE_REGISTRY) {
        setServiceHealth(svc.name, svc.port, 'operational', 5);
      }
      setServiceHealth('API Gateway', 4000, 'degraded', 50);
      expect(getOverallStatus()).toBe('degraded');
    });

    it('should return operational if all services are operational', () => {
      for (const svc of SERVICE_REGISTRY) {
        setServiceHealth(svc.name, svc.port, 'operational', 5);
      }
      expect(getOverallStatus()).toBe('operational');
    });
  });

  describe('getUptime', () => {
    it('should return uptime data', () => {
      const uptime = getUptime();
      expect(uptime['24h']).toBe(99.98);
      expect(uptime['7d']).toBe(99.95);
      expect(uptime['30d']).toBe(99.91);
    });

    it('should return a new object each time', () => {
      const u1 = getUptime();
      const u2 = getUptime();
      expect(u1).not.toBe(u2);
      expect(u1).toEqual(u2);
    });
  });

  describe('getPlatformStatus', () => {
    it('should return complete platform status', () => {
      const status = getPlatformStatus();
      expect(status.status).toBeDefined();
      expect(status.timestamp).toBeDefined();
      expect(status.services).toHaveLength(25);
      expect(status.uptime).toBeDefined();
      expect(status.uptime['24h']).toBe(99.98);
    });

    it('should have consistent overall status', () => {
      for (const svc of SERVICE_REGISTRY) {
        setServiceHealth(svc.name, svc.port, 'operational', 5);
      }
      const status = getPlatformStatus();
      expect(status.status).toBe('operational');
    });
  });
});
