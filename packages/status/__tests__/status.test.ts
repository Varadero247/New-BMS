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
    it('should have exactly 42 services', () => {
      expect(SERVICE_REGISTRY).toHaveLength(42);
    });

    it('should have unique names', () => {
      const names = SERVICE_REGISTRY.map((s) => s.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('should have unique ports', () => {
      const ports = SERVICE_REGISTRY.map((s) => s.port);
      expect(new Set(ports).size).toBe(ports.length);
    });

    it('should have ports in range 4000-4041', () => {
      for (const service of SERVICE_REGISTRY) {
        expect(service.port).toBeGreaterThanOrEqual(4000);
        expect(service.port).toBeLessThanOrEqual(4041);
      }
    });

    it('should include API Gateway at 4000', () => {
      const gateway = SERVICE_REGISTRY.find((s) => s.port === 4000);
      expect(gateway).toBeDefined();
      expect(gateway!.name).toBe('API Gateway');
    });

    it('should include all late-phase services', () => {
      const ports = SERVICE_REGISTRY.map((s) => s.port);
      // Ports added in later phases
      expect(ports).toContain(4025); // Marketing
      expect(ports).toContain(4027); // Risk
      expect(ports).toContain(4032); // Complaints
      expect(ports).toContain(4036); // Incidents
      expect(ports).toContain(4037); // Audits
      expect(ports).toContain(4040); // Chemicals
      expect(ports).toContain(4041); // Emergency
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
    it('should return status for all 42 services', () => {
      const statuses = getAllServiceStatus();
      expect(statuses).toHaveLength(42);
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
      expect(status.services).toHaveLength(42);
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

describe('Status Package — additional coverage', () => {
  it('SERVICE_REGISTRY is an array with entries', () => {
    expect(Array.isArray(SERVICE_REGISTRY)).toBe(true);
    expect(SERVICE_REGISTRY.length).toBeGreaterThan(0);
  });
});

describe('Status Package — extended coverage', () => {
  beforeEach(() => {
    _resetStores();
  });

  it('setServiceHealth returns an object with the correct name and port', () => {
    const h = setServiceHealth('Quality', 4003, 'operational', 12);
    expect(h.name).toBe('Quality');
    expect(h.port).toBe(4003);
  });

  it('setServiceHealth lastChecked is a valid ISO date string', () => {
    const h = setServiceHealth('HR', 4006, 'operational', 10);
    expect(() => new Date(h.lastChecked)).not.toThrow();
    expect(new Date(h.lastChecked).toString()).not.toBe('Invalid Date');
  });

  it('checkServiceHealth latencyMs is between 5 and 45', () => {
    for (let i = 0; i < 20; i++) {
      const h = checkServiceHealth('Finance', 4013);
      expect(h.latencyMs).toBeGreaterThanOrEqual(5);
      expect(h.latencyMs).toBeLessThanOrEqual(45);
    }
  });

  it('getOverallStatus returns down when multiple services are down', () => {
    for (const svc of SERVICE_REGISTRY) {
      setServiceHealth(svc.name, svc.port, 'operational', 5);
    }
    setServiceHealth('CRM', 4014, 'down', 0);
    setServiceHealth('Inventory', 4005, 'down', 0);
    expect(getOverallStatus()).toBe('down');
  });

  it('getPlatformStatus timestamp is a valid ISO date', () => {
    const ps = getPlatformStatus();
    expect(() => new Date(ps.timestamp)).not.toThrow();
    expect(new Date(ps.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('getPlatformStatus returns degraded when one service is degraded and none down', () => {
    for (const svc of SERVICE_REGISTRY) {
      setServiceHealth(svc.name, svc.port, 'operational', 5);
    }
    setServiceHealth('AI Analysis', 4004, 'degraded', 200);
    const ps = getPlatformStatus();
    expect(ps.status).toBe('degraded');
  });

  it('getAllServiceStatus returns same count as SERVICE_REGISTRY', () => {
    const statuses = getAllServiceStatus();
    expect(statuses).toHaveLength(SERVICE_REGISTRY.length);
  });

  it('SERVICE_REGISTRY entries each have a name string and numeric port', () => {
    for (const entry of SERVICE_REGISTRY) {
      expect(typeof entry.name).toBe('string');
      expect(typeof entry.port).toBe('number');
    }
  });

  it('getUptime 7d is less than 100 and greater than 0', () => {
    const u = getUptime();
    expect(u['7d']).toBeLessThan(100);
    expect(u['7d']).toBeGreaterThan(0);
  });

  it('setServiceHealth with down status is reflected in getOverallStatus', () => {
    for (const svc of SERVICE_REGISTRY) {
      setServiceHealth(svc.name, svc.port, 'operational', 5);
    }
    const first = SERVICE_REGISTRY[0];
    setServiceHealth(first.name, first.port, 'down', 0);
    expect(getOverallStatus()).toBe('down');
  });
});
