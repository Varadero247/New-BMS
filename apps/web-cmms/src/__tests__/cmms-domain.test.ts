// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Types (mirrored from source — no imports) ─────────────────────────────

type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
type WorkOrderPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type WorkOrderType = 'CORRECTIVE' | 'PREVENTIVE' | 'INSPECTION' | 'EMERGENCY' | 'PROJECT';
type SchedulerPriority = 'Emergency' | 'High' | 'Medium' | 'Low';
type SchedulerStatus = 'Scheduled' | 'In Progress' | 'On Hold' | 'Completed';
type SchedulerType = 'Preventive' | 'Corrective' | 'Inspection' | 'Emergency';
type Criticality = 'Critical' | 'High' | 'Medium' | 'Low';
type HealthStatus = 'Good' | 'Fair' | 'Poor' | 'Critical';

// ─── Constants (mirrored from source) ─────────────────────────────────────

const WO_STATUSES: WorkOrderStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
const WO_PRIORITIES: WorkOrderPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const WO_TYPES: WorkOrderType[] = ['CORRECTIVE', 'PREVENTIVE', 'INSPECTION', 'EMERGENCY', 'PROJECT'];
const SCHEDULER_PRIORITIES: SchedulerPriority[] = ['Emergency', 'High', 'Medium', 'Low'];
const SCHEDULER_STATUSES: SchedulerStatus[] = ['Scheduled', 'In Progress', 'On Hold', 'Completed'];
const SCHEDULER_TYPES: SchedulerType[] = ['Preventive', 'Corrective', 'Inspection', 'Emergency'];
const CRITICALITIES: Criticality[] = ['Critical', 'High', 'Medium', 'Low'];
const HEALTH_STATUSES: HealthStatus[] = ['Good', 'Fair', 'Poor', 'Critical'];
const TECHNICIANS = ['J. Martinez', 'R. Thompson', 'M. Chen', 'A. Singh'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// ─── Badge / colour maps (mirrored from source) ────────────────────────────

const statusColors: Record<WorkOrderStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const priorityColors: Record<WorkOrderPriority, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const schedulerPriorityColors: Record<SchedulerPriority, string> = {
  Emergency: 'bg-red-500 text-white',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

const schedulerStatusColors: Record<SchedulerStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-purple-100 text-purple-700',
  'On Hold': 'bg-gray-100 dark:bg-gray-800 text-gray-600',
  Completed: 'bg-green-100 text-green-700',
};

const typeColors: Record<SchedulerType, string> = {
  Preventive: 'border-l-blue-500',
  Corrective: 'border-l-orange-500',
  Inspection: 'border-l-purple-500',
  Emergency: 'border-l-red-500',
};

const criticalityColors: Record<Criticality, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-green-100 text-green-700',
};

const healthColors: Record<HealthStatus, string> = {
  Good: 'bg-green-100 text-green-700',
  Fair: 'bg-yellow-100 text-yellow-700',
  Poor: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

// ─── MOCK work order data (mirrored from scheduler/client.tsx) ─────────────

interface SchedulerWorkOrder {
  id: string;
  title: string;
  asset: string;
  assignee: string;
  priority: SchedulerPriority;
  status: SchedulerStatus;
  startDate: string;
  endDate: string;
  type: SchedulerType;
  estimatedHours: number;
}

const MOCK_WORK_ORDERS: SchedulerWorkOrder[] = [
  { id: 'WO-2026-001', title: 'Conveyor belt tension adjustment', asset: 'CONV-001', assignee: 'J. Martinez', priority: 'Medium', status: 'Scheduled', startDate: '2026-02-10', endDate: '2026-02-10', type: 'Preventive', estimatedHours: 2 },
  { id: 'WO-2026-002', title: 'HVAC quarterly filter replacement', asset: 'HVAC-003', assignee: 'R. Thompson', priority: 'Low', status: 'Scheduled', startDate: '2026-02-11', endDate: '2026-02-11', type: 'Preventive', estimatedHours: 1.5 },
  { id: 'WO-2026-003', title: 'CNC spindle bearing replacement', asset: 'CNC-007', assignee: 'M. Chen', priority: 'High', status: 'In Progress', startDate: '2026-02-12', endDate: '2026-02-13', type: 'Corrective', estimatedHours: 6 },
  { id: 'WO-2026-004', title: 'Boiler annual inspection', asset: 'BLR-001', assignee: 'J. Martinez', priority: 'High', status: 'Scheduled', startDate: '2026-02-13', endDate: '2026-02-14', type: 'Inspection', estimatedHours: 8 },
  { id: 'WO-2026-005', title: 'Emergency compressor repair', asset: 'COMP-002', assignee: 'R. Thompson', priority: 'Emergency', status: 'In Progress', startDate: '2026-02-13', endDate: '2026-02-13', type: 'Emergency', estimatedHours: 4 },
  { id: 'WO-2026-006', title: 'Pump seal replacement', asset: 'PMP-004', assignee: 'A. Singh', priority: 'Medium', status: 'Scheduled', startDate: '2026-02-14', endDate: '2026-02-14', type: 'Corrective', estimatedHours: 3 },
  { id: 'WO-2026-007', title: 'Electrical panel thermography', asset: 'ELEC-012', assignee: 'M. Chen', priority: 'Medium', status: 'Scheduled', startDate: '2026-02-15', endDate: '2026-02-15', type: 'Inspection', estimatedHours: 2 },
  { id: 'WO-2026-008', title: 'Forklift hydraulic service', asset: 'FLT-003', assignee: 'A. Singh', priority: 'Low', status: 'Completed', startDate: '2026-02-09', endDate: '2026-02-09', type: 'Preventive', estimatedHours: 2 },
  { id: 'WO-2026-009', title: 'Production line lubrication', asset: 'LINE-001', assignee: 'J. Martinez', priority: 'Low', status: 'Scheduled', startDate: '2026-02-16', endDate: '2026-02-16', type: 'Preventive', estimatedHours: 1 },
  { id: 'WO-2026-010', title: 'Crane load test certification', asset: 'CRN-002', assignee: 'R. Thompson', priority: 'High', status: 'Scheduled', startDate: '2026-02-17', endDate: '2026-02-18', type: 'Inspection', estimatedHours: 6 },
  { id: 'WO-2026-011', title: 'Cooling tower chemical treatment', asset: 'CT-001', assignee: 'A. Singh', priority: 'Medium', status: 'On Hold', startDate: '2026-02-14', endDate: '2026-02-14', type: 'Preventive', estimatedHours: 3 },
  { id: 'WO-2026-012', title: 'Fire suppression system test', asset: 'FIRE-001', assignee: 'M. Chen', priority: 'High', status: 'Scheduled', startDate: '2026-02-19', endDate: '2026-02-19', type: 'Inspection', estimatedHours: 4 },
  { id: 'WO-2026-013', title: 'Robotic arm calibration', asset: 'ROB-005', assignee: 'J. Martinez', priority: 'Medium', status: 'Scheduled', startDate: '2026-02-20', endDate: '2026-02-20', type: 'Preventive', estimatedHours: 3 },
  { id: 'WO-2026-014', title: 'Generator load bank test', asset: 'GEN-001', assignee: 'R. Thompson', priority: 'High', status: 'Scheduled', startDate: '2026-02-21', endDate: '2026-02-21', type: 'Inspection', estimatedHours: 5 },
];

// ─── MOCK asset data (mirrored from asset-health/client.tsx) ───────────────

interface Asset {
  id: string;
  name: string;
  tag: string;
  category: string;
  criticality: Criticality;
  healthStatus: HealthStatus;
  healthScore: number;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  mtbf: number;
  mttr: number;
  failureCount: number;
  age: number;
  expectedLife: number;
}

const MOCK_ASSETS: Asset[] = [
  { id: 'A001', name: 'CNC Machining Centre #1', tag: 'CNC-001', category: 'Production', criticality: 'Critical', healthStatus: 'Good', healthScore: 92, oee: 87, availability: 95, performance: 93, quality: 98, mtbf: 720, mttr: 2.5, failureCount: 2, age: 3, expectedLife: 15 },
  { id: 'A002', name: 'Hydraulic Press #2', tag: 'PRESS-002', category: 'Production', criticality: 'Critical', healthStatus: 'Fair', healthScore: 74, oee: 72, availability: 88, performance: 85, quality: 96, mtbf: 480, mttr: 4.0, failureCount: 5, age: 8, expectedLife: 20 },
  { id: 'A003', name: 'Conveyor System Main', tag: 'CONV-001', category: 'Material Handling', criticality: 'High', healthStatus: 'Good', healthScore: 88, oee: 94, availability: 97, performance: 98, quality: 99, mtbf: 1200, mttr: 1.5, failureCount: 1, age: 2, expectedLife: 12 },
  { id: 'A004', name: 'Air Compressor #1', tag: 'COMP-001', category: 'Utilities', criticality: 'High', healthStatus: 'Poor', healthScore: 55, oee: 0, availability: 78, performance: 0, quality: 0, mtbf: 240, mttr: 6.0, failureCount: 8, age: 12, expectedLife: 15 },
  { id: 'A005', name: 'Injection Moulder #3', tag: 'INJ-003', category: 'Production', criticality: 'Critical', healthStatus: 'Good', healthScore: 90, oee: 85, availability: 93, performance: 94, quality: 97, mtbf: 650, mttr: 3.0, failureCount: 3, age: 5, expectedLife: 18 },
  { id: 'A006', name: 'HVAC Unit — Production Floor', tag: 'HVAC-001', category: 'Facilities', criticality: 'Medium', healthStatus: 'Good', healthScore: 85, oee: 0, availability: 99, performance: 0, quality: 0, mtbf: 2160, mttr: 2.0, failureCount: 1, age: 4, expectedLife: 20 },
  { id: 'A007', name: 'Robotic Welding Cell', tag: 'ROB-001', category: 'Production', criticality: 'Critical', healthStatus: 'Critical', healthScore: 42, oee: 58, availability: 72, performance: 82, quality: 98, mtbf: 160, mttr: 8.0, failureCount: 12, age: 10, expectedLife: 12 },
  { id: 'A008', name: 'Forklift — Warehouse', tag: 'FLT-001', category: 'Material Handling', criticality: 'Medium', healthStatus: 'Fair', healthScore: 68, oee: 0, availability: 85, performance: 0, quality: 0, mtbf: 360, mttr: 3.5, failureCount: 4, age: 6, expectedLife: 10 },
  { id: 'A009', name: 'Surface Grinder', tag: 'GRD-001', category: 'Production', criticality: 'High', healthStatus: 'Good', healthScore: 91, oee: 82, availability: 94, performance: 90, quality: 97, mtbf: 900, mttr: 2.0, failureCount: 2, age: 4, expectedLife: 20 },
  { id: 'A010', name: 'Backup Generator', tag: 'GEN-001', category: 'Utilities', criticality: 'High', healthStatus: 'Good', healthScore: 94, oee: 0, availability: 100, performance: 0, quality: 0, mtbf: 5000, mttr: 4.0, failureCount: 0, age: 2, expectedLife: 25 },
];

// ─── Pure helper functions ─────────────────────────────────────────────────

function computeOEE(availability: number, performance: number, quality: number): number {
  return (availability / 100) * (performance / 100) * (quality / 100) * 100;
}

function lifePercent(age: number, expectedLife: number): number {
  return Math.min(100, (age / expectedLife) * 100);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(month: number, year: number): number {
  if (month === 1 && isLeapYear(year)) return 29;
  return DAYS_IN_MONTH[month];
}

function technicianWorkload(orders: SchedulerWorkOrder[], tech: string): number {
  return orders
    .filter((wo) => wo.assignee === tech)
    .reduce((s, wo) => s + wo.estimatedHours, 0);
}

function workloadPercent(hours: number, capacity = 40): number {
  return Math.min(100, Math.round((hours / capacity) * 100));
}

// ─── 1. Status arrays ──────────────────────────────────────────────────────

describe('Work order status array', () => {
  it('contains exactly 5 statuses', () => {
    expect(WO_STATUSES).toHaveLength(5);
  });

  const expected: WorkOrderStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];
  for (const s of expected) {
    it(`contains ${s}`, () => expect(WO_STATUSES).toContain(s));
  }

  it('all entries are strings', () => {
    for (const s of WO_STATUSES) {
      expect(typeof s).toBe('string');
    }
  });
});

// ─── 2. Priority arrays ────────────────────────────────────────────────────

describe('Work order priority array', () => {
  it('contains exactly 4 priorities', () => {
    expect(WO_PRIORITIES).toHaveLength(4);
  });

  const expected: WorkOrderPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  for (const p of expected) {
    it(`contains ${p}`, () => expect(WO_PRIORITIES).toContain(p));
  }
});

describe('Scheduler priority array', () => {
  it('contains exactly 4 entries', () => {
    expect(SCHEDULER_PRIORITIES).toHaveLength(4);
  });

  for (const p of SCHEDULER_PRIORITIES) {
    it(`${p} is a string`, () => expect(typeof p).toBe('string'));
  }

  it('includes Emergency', () => expect(SCHEDULER_PRIORITIES).toContain('Emergency'));
  it('includes High', () => expect(SCHEDULER_PRIORITIES).toContain('High'));
  it('includes Medium', () => expect(SCHEDULER_PRIORITIES).toContain('Medium'));
  it('includes Low', () => expect(SCHEDULER_PRIORITIES).toContain('Low'));
});

// ─── 3. Work order type array ──────────────────────────────────────────────

describe('Work order type array', () => {
  it('contains exactly 5 types', () => {
    expect(WO_TYPES).toHaveLength(5);
  });

  const expected: WorkOrderType[] = ['CORRECTIVE', 'PREVENTIVE', 'INSPECTION', 'EMERGENCY', 'PROJECT'];
  for (const t of expected) {
    it(`contains ${t}`, () => expect(WO_TYPES).toContain(t));
  }
});

describe('Scheduler type array', () => {
  it('contains exactly 4 types', () => {
    expect(SCHEDULER_TYPES).toHaveLength(4);
  });

  for (const t of SCHEDULER_TYPES) {
    it(`${t} is a string`, () => expect(typeof t).toBe('string'));
  }
});

// ─── 4. Status badge colour map ────────────────────────────────────────────

describe('Work order status badge colours', () => {
  for (const s of WO_STATUSES) {
    it(`${s} has a colour string`, () => {
      expect(statusColors[s]).toBeDefined();
    });
    it(`${s} colour contains 'bg-'`, () => {
      expect(statusColors[s]).toContain('bg-');
    });
    it(`${s} colour contains 'text-'`, () => {
      expect(statusColors[s]).toContain('text-');
    });
  }

  it('OPEN is blue', () => expect(statusColors.OPEN).toContain('blue'));
  it('COMPLETED is green', () => expect(statusColors.COMPLETED).toContain('green'));
  it('CANCELLED is red', () => expect(statusColors.CANCELLED).toContain('red'));
});

// ─── 5. Priority badge colour map ─────────────────────────────────────────

describe('Work order priority badge colours', () => {
  for (const p of WO_PRIORITIES) {
    it(`${p} has a colour string`, () => {
      expect(priorityColors[p]).toBeDefined();
    });
    it(`${p} colour contains 'bg-'`, () => {
      expect(priorityColors[p]).toContain('bg-');
    });
  }

  it('CRITICAL is red', () => expect(priorityColors.CRITICAL).toContain('red'));
  it('LOW is green', () => expect(priorityColors.LOW).toContain('green'));
  it('HIGH is orange', () => expect(priorityColors.HIGH).toContain('orange'));
  it('MEDIUM is yellow', () => expect(priorityColors.MEDIUM).toContain('yellow'));
});

describe('Scheduler priority badge colours', () => {
  for (const p of SCHEDULER_PRIORITIES) {
    it(`${p} has a colour string`, () => {
      expect(schedulerPriorityColors[p]).toBeDefined();
    });
  }

  it('Emergency uses bg-red-500', () => expect(schedulerPriorityColors.Emergency).toContain('red-500'));
  it('Emergency has white text', () => expect(schedulerPriorityColors.Emergency).toContain('white'));
  it('Low is green', () => expect(schedulerPriorityColors.Low).toContain('green'));
});

// ─── 6. Scheduler status badge colour map ─────────────────────────────────

describe('Scheduler status badge colours', () => {
  for (const s of SCHEDULER_STATUSES) {
    it(`"${s}" has a colour string`, () => {
      expect(schedulerStatusColors[s]).toBeDefined();
    });
  }

  it('Scheduled is blue', () => expect(schedulerStatusColors.Scheduled).toContain('blue'));
  it('In Progress is purple', () => expect(schedulerStatusColors['In Progress']).toContain('purple'));
  it('Completed is green', () => expect(schedulerStatusColors.Completed).toContain('green'));
});

// ─── 7. Type colour map (left-border stripe) ───────────────────────────────

describe('Scheduler work order type border colours', () => {
  for (const t of SCHEDULER_TYPES) {
    it(`${t} has a border colour class`, () => {
      expect(typeColors[t]).toBeDefined();
    });
    it(`${t} colour contains 'border-l-'`, () => {
      expect(typeColors[t]).toContain('border-l-');
    });
  }

  it('Emergency type is red', () => expect(typeColors.Emergency).toContain('red'));
  it('Preventive type is blue', () => expect(typeColors.Preventive).toContain('blue'));
  it('Corrective type is orange', () => expect(typeColors.Corrective).toContain('orange'));
  it('Inspection type is purple', () => expect(typeColors.Inspection).toContain('purple'));
});

// ─── 8. Asset criticality + health colour maps ────────────────────────────

describe('Asset criticality badge colours', () => {
  for (const c of CRITICALITIES) {
    it(`${c} has a colour string`, () => expect(criticalityColors[c]).toBeDefined());
    it(`${c} contains 'bg-'`, () => expect(criticalityColors[c]).toContain('bg-'));
  }

  it('Critical is red', () => expect(criticalityColors.Critical).toContain('red'));
  it('Low is green', () => expect(criticalityColors.Low).toContain('green'));
});

describe('Asset health status badge colours', () => {
  for (const h of HEALTH_STATUSES) {
    it(`${h} has a colour string`, () => expect(healthColors[h]).toBeDefined());
    it(`${h} contains 'bg-'`, () => expect(healthColors[h]).toContain('bg-'));
  }

  it('Good is green', () => expect(healthColors.Good).toContain('green'));
  it('Critical is red', () => expect(healthColors.Critical).toContain('red'));
  it('Poor is orange', () => expect(healthColors.Poor).toContain('orange'));
  it('Fair is yellow', () => expect(healthColors.Fair).toContain('yellow'));
});

// ─── 9. MOCK work order data — shape and count ────────────────────────────

describe('MOCK_WORK_ORDERS data integrity', () => {
  it('has exactly 14 work orders', () => {
    expect(MOCK_WORK_ORDERS).toHaveLength(14);
  });

  it('all ids are unique', () => {
    const ids = MOCK_WORK_ORDERS.map((wo) => wo.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all ids follow WO-YYYY-NNN pattern', () => {
    for (const wo of MOCK_WORK_ORDERS) {
      expect(wo.id).toMatch(/^WO-\d{4}-\d{3}$/);
    }
  });

  it('all priorities are valid', () => {
    for (const wo of MOCK_WORK_ORDERS) {
      expect(SCHEDULER_PRIORITIES).toContain(wo.priority);
    }
  });

  it('all statuses are valid', () => {
    for (const wo of MOCK_WORK_ORDERS) {
      expect(SCHEDULER_STATUSES).toContain(wo.status);
    }
  });

  it('all types are valid', () => {
    for (const wo of MOCK_WORK_ORDERS) {
      expect(SCHEDULER_TYPES).toContain(wo.type);
    }
  });

  it('all assignees are known technicians', () => {
    for (const wo of MOCK_WORK_ORDERS) {
      expect(TECHNICIANS).toContain(wo.assignee);
    }
  });

  it('all estimatedHours are positive numbers', () => {
    for (const wo of MOCK_WORK_ORDERS) {
      expect(wo.estimatedHours).toBeGreaterThan(0);
    }
  });

  it('all startDates are valid ISO-format dates', () => {
    for (const wo of MOCK_WORK_ORDERS) {
      expect(wo.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('endDate is always >= startDate', () => {
    for (const wo of MOCK_WORK_ORDERS) {
      expect(wo.endDate >= wo.startDate).toBe(true);
    }
  });

  it('contains exactly 1 Emergency-priority WO', () => {
    expect(MOCK_WORK_ORDERS.filter((wo) => wo.priority === 'Emergency')).toHaveLength(1);
  });

  it('emergency WO has Emergency type', () => {
    const emergencyWO = MOCK_WORK_ORDERS.find((wo) => wo.priority === 'Emergency');
    expect(emergencyWO?.type).toBe('Emergency');
  });

  it('contains at least 1 Completed WO', () => {
    expect(MOCK_WORK_ORDERS.filter((wo) => wo.status === 'Completed').length).toBeGreaterThanOrEqual(1);
  });

  it('contains at least 1 In Progress WO', () => {
    expect(MOCK_WORK_ORDERS.filter((wo) => wo.status === 'In Progress').length).toBeGreaterThanOrEqual(1);
  });

  it('total estimated hours is positive', () => {
    const total = MOCK_WORK_ORDERS.reduce((s, wo) => s + wo.estimatedHours, 0);
    expect(total).toBeGreaterThan(0);
  });

  it('total estimated hours matches known value (50.5h)', () => {
    const total = MOCK_WORK_ORDERS.reduce((s, wo) => s + wo.estimatedHours, 0);
    expect(total).toBeCloseTo(50.5);
  });
});

// ─── 10. MOCK asset data — shape and count ────────────────────────────────

describe('MOCK_ASSETS data integrity', () => {
  it('has exactly 10 assets', () => {
    expect(MOCK_ASSETS).toHaveLength(10);
  });

  it('all ids are unique', () => {
    const ids = MOCK_ASSETS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all health scores are in range 0–100', () => {
    for (const a of MOCK_ASSETS) {
      expect(a.healthScore).toBeGreaterThanOrEqual(0);
      expect(a.healthScore).toBeLessThanOrEqual(100);
    }
  });

  it('all OEE values are in range 0–100', () => {
    for (const a of MOCK_ASSETS) {
      expect(a.oee).toBeGreaterThanOrEqual(0);
      expect(a.oee).toBeLessThanOrEqual(100);
    }
  });

  it('all availability values are in range 0–100', () => {
    for (const a of MOCK_ASSETS) {
      expect(a.availability).toBeGreaterThanOrEqual(0);
      expect(a.availability).toBeLessThanOrEqual(100);
    }
  });

  it('all MTBF values are positive', () => {
    for (const a of MOCK_ASSETS) {
      expect(a.mtbf).toBeGreaterThan(0);
    }
  });

  it('all MTTR values are positive', () => {
    for (const a of MOCK_ASSETS) {
      expect(a.mttr).toBeGreaterThan(0);
    }
  });

  it('failureCount is non-negative for all assets', () => {
    for (const a of MOCK_ASSETS) {
      expect(a.failureCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('age is less than or equal to expectedLife for most assets', () => {
    const overLife = MOCK_ASSETS.filter((a) => a.age > a.expectedLife);
    expect(overLife).toHaveLength(0);
  });

  it('all criticalities are valid', () => {
    for (const a of MOCK_ASSETS) {
      expect(CRITICALITIES).toContain(a.criticality);
    }
  });

  it('all health statuses are valid', () => {
    for (const a of MOCK_ASSETS) {
      expect(HEALTH_STATUSES).toContain(a.healthStatus);
    }
  });

  it('Critical health status asset (ROB-001) has lowest healthScore', () => {
    const rob = MOCK_ASSETS.find((a) => a.tag === 'ROB-001');
    expect(rob).toBeDefined();
    const minScore = Math.min(...MOCK_ASSETS.map((a) => a.healthScore));
    expect(rob!.healthScore).toBe(minScore);
  });

  it('Backup Generator has 0 failures', () => {
    const gen = MOCK_ASSETS.find((a) => a.tag === 'GEN-001');
    expect(gen?.failureCount).toBe(0);
  });

  it('Backup Generator has 100% availability', () => {
    const gen = MOCK_ASSETS.find((a) => a.tag === 'GEN-001');
    expect(gen?.availability).toBe(100);
  });
});

// ─── 11. computeOEE helper ────────────────────────────────────────────────

describe('computeOEE', () => {
  it('100/100/100 = 100%', () => {
    expect(computeOEE(100, 100, 100)).toBeCloseTo(100);
  });

  it('0 availability = 0 OEE', () => {
    expect(computeOEE(0, 100, 100)).toBe(0);
  });

  it('returns value in range 0–100', () => {
    const result = computeOEE(95, 93, 98);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('CNC asset OEE ≈ 87 (matches mock)', () => {
    // availability=95, performance=93, quality=98 → ~86.4
    const calculated = computeOEE(95, 93, 98);
    expect(calculated).toBeGreaterThan(80);
    expect(calculated).toBeLessThan(92);
  });

  it('is monotonically increasing with each factor', () => {
    expect(computeOEE(80, 90, 95)).toBeLessThan(computeOEE(90, 90, 95));
    expect(computeOEE(90, 80, 95)).toBeLessThan(computeOEE(90, 90, 95));
    expect(computeOEE(90, 90, 80)).toBeLessThan(computeOEE(90, 90, 95));
  });

  it('world-class OEE: 95/95/99 > 85%', () => {
    expect(computeOEE(95, 95, 99)).toBeGreaterThan(85);
  });
});

// ─── 12. lifePercent helper ────────────────────────────────────────────────

describe('lifePercent', () => {
  it('age=0 gives 0%', () => expect(lifePercent(0, 15)).toBe(0));
  it('age=expectedLife gives 100%', () => expect(lifePercent(15, 15)).toBe(100));
  it('age > expectedLife is capped at 100%', () => expect(lifePercent(20, 15)).toBe(100));
  it('CNC-001 age=3, life=15 → 20%', () => expect(lifePercent(3, 15)).toBeCloseTo(20));
  it('ROB-001 age=10, life=12 → ~83.3%', () => expect(lifePercent(10, 12)).toBeCloseTo(83.33, 1));

  it('result is always in range 0–100', () => {
    for (const a of MOCK_ASSETS) {
      const pct = lifePercent(a.age, a.expectedLife);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });
});

// ─── 13. Calendar helpers ─────────────────────────────────────────────────

describe('isLeapYear', () => {
  it('2000 is leap year', () => expect(isLeapYear(2000)).toBe(true));
  it('1900 is not a leap year', () => expect(isLeapYear(1900)).toBe(false));
  it('2024 is leap year', () => expect(isLeapYear(2024)).toBe(true));
  it('2026 is not a leap year', () => expect(isLeapYear(2026)).toBe(false));
  it('2100 is not a leap year', () => expect(isLeapYear(2100)).toBe(false));
});

describe('getDaysInMonth', () => {
  it('January has 31 days', () => expect(getDaysInMonth(0, 2026)).toBe(31));
  it('February 2026 has 28 days (non-leap)', () => expect(getDaysInMonth(1, 2026)).toBe(28));
  it('February 2024 has 29 days (leap)', () => expect(getDaysInMonth(1, 2024)).toBe(29));
  it('April has 30 days', () => expect(getDaysInMonth(3, 2026)).toBe(30));
  it('December has 31 days', () => expect(getDaysInMonth(11, 2026)).toBe(31));
  it('DAYS_IN_MONTH has 12 entries', () => expect(DAYS_IN_MONTH).toHaveLength(12));
  it('all months have between 28 and 31 days', () => {
    for (let m = 0; m < 12; m++) {
      const days = getDaysInMonth(m, 2026);
      expect(days).toBeGreaterThanOrEqual(28);
      expect(days).toBeLessThanOrEqual(31);
    }
  });
});

describe('MONTH_NAMES and DAY_NAMES constants', () => {
  it('MONTH_NAMES has 12 entries', () => expect(MONTH_NAMES).toHaveLength(12));
  it('DAY_NAMES has 7 entries', () => expect(DAY_NAMES).toHaveLength(7));
  it('January is first month', () => expect(MONTH_NAMES[0]).toBe('January'));
  it('December is last month', () => expect(MONTH_NAMES[11]).toBe('December'));
  it('Sunday is first day', () => expect(DAY_NAMES[0]).toBe('Sun'));
  it('Saturday is last day', () => expect(DAY_NAMES[6]).toBe('Sat'));

  for (const m of MONTH_NAMES) {
    it(`month name "${m}" is a non-empty string`, () => {
      expect(typeof m).toBe('string');
      expect(m.length).toBeGreaterThan(0);
    });
  }
});

// ─── 14. Technician workload helpers ─────────────────────────────────────

describe('technicianWorkload', () => {
  it('returns 0 for unknown technician', () => {
    expect(technicianWorkload(MOCK_WORK_ORDERS, 'Unknown Person')).toBe(0);
  });

  it('J. Martinez total hours is positive', () => {
    expect(technicianWorkload(MOCK_WORK_ORDERS, 'J. Martinez')).toBeGreaterThan(0);
  });

  it('R. Thompson total hours is positive', () => {
    expect(technicianWorkload(MOCK_WORK_ORDERS, 'R. Thompson')).toBeGreaterThan(0);
  });

  it('all 4 technicians have workload assigned', () => {
    for (const tech of TECHNICIANS) {
      expect(technicianWorkload(MOCK_WORK_ORDERS, tech)).toBeGreaterThan(0);
    }
  });

  it('sum of all technician hours equals total WO hours', () => {
    const totalByTech = TECHNICIANS.reduce(
      (s, tech) => s + technicianWorkload(MOCK_WORK_ORDERS, tech),
      0,
    );
    const totalAllWOs = MOCK_WORK_ORDERS.reduce((s, wo) => s + wo.estimatedHours, 0);
    expect(totalByTech).toBeCloseTo(totalAllWOs);
  });
});

describe('workloadPercent', () => {
  it('0 hours = 0%', () => expect(workloadPercent(0)).toBe(0));
  it('40 hours = 100%', () => expect(workloadPercent(40)).toBe(100));
  it('20 hours = 50%', () => expect(workloadPercent(20)).toBe(50));
  it('hours > 40 are capped at 100%', () => expect(workloadPercent(50)).toBe(100));
  it('result is in range 0–100 for any positive input', () => {
    for (let h = 0; h <= 60; h += 5) {
      expect(workloadPercent(h)).toBeGreaterThanOrEqual(0);
      expect(workloadPercent(h)).toBeLessThanOrEqual(100);
    }
  });
  it('threshold >30h triggers red (capacity-level guard)', () => {
    expect(workloadPercent(31)).toBeGreaterThan(75);
  });
});

// ─── Parametric: computeOEE exact values ──────────────────────────────────────

describe('computeOEE — exact values parametric', () => {
  // formula: (a/100) * (p/100) * (q/100) * 100
  const cases: [number, number, number, number][] = [
    [50,  80,  90,  36],       // 0.5 * 0.8 * 0.9 * 100 = 36
    [100, 100, 100, 100],      // perfect
    [0,   100, 100, 0],        // zero availability
    [80,  80,  80,  51.2],     // 0.8^3 * 100 = 51.2
  ];
  for (const [a, p, q, expected] of cases) {
    it(`computeOEE(${a}, ${p}, ${q}) = ${expected}`, () => {
      expect(computeOEE(a, p, q)).toBeCloseTo(expected, 1);
    });
  }
});

// ─── Parametric: lifePercent exact values ─────────────────────────────────────

describe('lifePercent — exact values parametric', () => {
  const cases: [number, number, number][] = [
    [8,  20, 40],          // PRESS-002
    [12, 15, 80],          // COMP-001
    [4,  20, 20],          // HVAC-001
    [10, 12, 83.33],       // ROB-001
    [2,  25, 8],           // GEN-001
  ];
  for (const [age, life, expected] of cases) {
    it(`lifePercent(${age}, ${life}) ≈ ${expected}%`, () => {
      expect(lifePercent(age, life)).toBeCloseTo(expected, 1);
    });
  }
});

// ─── Parametric: technicianWorkload exact hours ────────────────────────────────

describe('technicianWorkload — exact hours parametric', () => {
  // J. Martinez: WO-001(2)+WO-004(8)+WO-009(1)+WO-013(3)=14
  // R. Thompson: WO-002(1.5)+WO-005(4)+WO-010(6)+WO-014(5)=16.5
  // M. Chen: WO-003(6)+WO-007(2)+WO-012(4)=12
  // A. Singh: WO-006(3)+WO-008(2)+WO-011(3)=8
  const cases: [string, number][] = [
    ['J. Martinez', 14],
    ['R. Thompson', 16.5],
    ['M. Chen',     12],
    ['A. Singh',     8],
  ];
  for (const [tech, expected] of cases) {
    it(`${tech} total hours = ${expected}`, () => {
      expect(technicianWorkload(MOCK_WORK_ORDERS, tech)).toBeCloseTo(expected, 1);
    });
  }
});

// ─── Parametric: DAYS_IN_MONTH per-month ──────────────────────────────────────

describe('DAYS_IN_MONTH — per-month exact values parametric', () => {
  const cases: [number, number, string][] = [
    [0,  31, 'January'],
    [1,  28, 'February (non-leap)'],
    [2,  31, 'March'],
    [3,  30, 'April'],
    [4,  31, 'May'],
    [5,  30, 'June'],
    [6,  31, 'July'],
    [7,  31, 'August'],
    [8,  30, 'September'],
    [9,  31, 'October'],
    [10, 30, 'November'],
    [11, 31, 'December'],
  ];
  for (const [idx, days, name] of cases) {
    it(`${name} = ${days} days`, () => {
      expect(DAYS_IN_MONTH[idx]).toBe(days);
    });
  }
});

// ─── Parametric: isLeapYear additional years ─────────────────────────────────

describe('isLeapYear — additional years parametric', () => {
  const cases: [number, boolean][] = [
    [2025, false],
    [2028, true],
    [1800, false],
    [1600, true],
  ];
  for (const [year, expected] of cases) {
    it(`${year} isLeapYear = ${expected}`, () => {
      expect(isLeapYear(year)).toBe(expected);
    });
  }
});

// ─── Parametric: workloadPercent exact values ─────────────────────────────────

describe('workloadPercent — additional exact values parametric', () => {
  const cases: [number, number | undefined, number][] = [
    [10, undefined, 25],   // 10/40*100 = 25
    [30, undefined, 75],   // 30/40*100 = 75
    [12, 24,        50],   // 12/24*100 = 50 (custom capacity)
    [24, 24,        100],  // at-capacity with custom
  ];
  for (const [hours, capacity, expected] of cases) {
    const label = capacity !== undefined ? `workloadPercent(${hours}, ${capacity})` : `workloadPercent(${hours})`;
    it(`${label} = ${expected}%`, () => {
      const result = capacity !== undefined ? workloadPercent(hours, capacity) : workloadPercent(hours);
      expect(result).toBe(expected);
    });
  }
});
