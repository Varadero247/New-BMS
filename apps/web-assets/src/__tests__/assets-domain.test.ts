// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Domain constants (inlined from source) ───────────────────────────────────

type AssetStatus =
  | 'ACTIVE'
  | 'IN_SERVICE'
  | 'OUT_OF_SERVICE'
  | 'MAINTENANCE'
  | 'DECOMMISSIONED'
  | 'DISPOSED';

type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';

type WorkOrderPriority = 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';

type WorkOrderStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

const ASSET_STATUSES: AssetStatus[] = [
  'ACTIVE',
  'IN_SERVICE',
  'OUT_OF_SERVICE',
  'MAINTENANCE',
  'DECOMMISSIONED',
  'DISPOSED',
];

const ASSET_CONDITIONS: AssetCondition[] = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'];

const WORK_ORDER_PRIORITIES: WorkOrderPriority[] = ['EMERGENCY', 'HIGH', 'MEDIUM', 'LOW'];

const WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
];

// ─── Badge / color maps (inlined from assets/client.tsx) ──────────────────────

function getAssetStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
    case 'IN_SERVICE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'MAINTENANCE':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'OUT_OF_SERVICE':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'DECOMMISSIONED':
    case 'DISPOSED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

function getConditionColor(condition: string): string {
  switch (condition) {
    case 'EXCELLENT':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'GOOD':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'FAIR':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'POOR':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

// ─── Work order color maps (inlined from work-orders/client.tsx) ───────────────

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'EMERGENCY':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'LOW':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
}

function getWorkOrderStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'ASSIGNED':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
    case 'ON_HOLD':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    default:
      // OPEN → yellow
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  }
}

// ─── Depreciation helpers (inlined from depreciation/client.tsx) ───────────────

function getDepreciationPercent(purchaseCost: number, currentValue: number): number {
  if (!purchaseCost || purchaseCost === 0) return 0;
  return ((purchaseCost - (currentValue || 0)) / purchaseCost) * 100;
}

function getDepreciationColor(percent: number): string {
  if (percent >= 80) return 'text-red-600 dark:text-red-400';
  if (percent >= 50) return 'text-orange-600 dark:text-orange-400';
  if (percent >= 25) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-green-600 dark:text-green-400';
}

// ─── Asset lifecycle helpers ───────────────────────────────────────────────────

function isOperational(status: AssetStatus): boolean {
  return status === 'ACTIVE' || status === 'IN_SERVICE';
}

function needsAttention(condition: AssetCondition): boolean {
  return condition === 'POOR' || condition === 'CRITICAL';
}

function isRetired(status: AssetStatus): boolean {
  return status === 'DECOMMISSIONED' || status === 'DISPOSED';
}

function underscoreToLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

// ─── Depreciation calculation (straight-line, from assets.test.ts stub) ────────

function straightLineBookValue(cost: number, salvage: number, lifeYears: number, year: number): number {
  if (lifeYears <= 0) return 0;
  const annual = (cost - salvage) / lifeYears;
  return Math.max(salvage, cost - annual * year);
}

function decliningBalanceBookValue(cost: number, rate: number, year: number): number {
  return cost * Math.pow(1 - rate, year);
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

interface MockAsset {
  id: string;
  referenceNumber: string;
  name: string;
  description: string;
  assetTag: string;
  serialNumber: string;
  category: string;
  location: string;
  department: string;
  status: AssetStatus;
  condition: AssetCondition;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  warrantyExpiry: string | null;
  assignedTo: string;
  notes: string;
  createdAt: string;
}

const MOCK_ASSETS: MockAsset[] = [
  {
    id: 'ast-001',
    referenceNumber: 'AST-2026-001',
    name: 'Dell PowerEdge R740 Server',
    description: 'Primary application server',
    assetTag: 'TAG-001',
    serialNumber: 'SN-DELL-001',
    category: 'IT Equipment',
    location: 'Server Room A',
    department: 'IT',
    status: 'ACTIVE',
    condition: 'EXCELLENT',
    manufacturer: 'Dell',
    model: 'PowerEdge R740',
    purchaseDate: '2023-01-15T00:00:00.000Z',
    purchaseCost: 12000,
    currentValue: 9600,
    warrantyExpiry: '2026-01-15T00:00:00.000Z',
    assignedTo: 'IT Ops Team',
    notes: '3-year ProSupport contract',
    createdAt: '2023-01-15T00:00:00.000Z',
  },
  {
    id: 'ast-002',
    referenceNumber: 'AST-2026-002',
    name: 'Forklift FLK-200',
    description: 'Warehouse counterbalance forklift',
    assetTag: 'TAG-002',
    serialNumber: 'SN-FLK-002',
    category: 'Machinery',
    location: 'Warehouse B',
    department: 'Operations',
    status: 'MAINTENANCE',
    condition: 'FAIR',
    manufacturer: 'Toyota',
    model: 'FLK-200',
    purchaseDate: '2020-06-01T00:00:00.000Z',
    purchaseCost: 35000,
    currentValue: 18000,
    warrantyExpiry: null,
    assignedTo: 'Warehouse Team',
    notes: 'Annual service due',
    createdAt: '2020-06-01T00:00:00.000Z',
  },
  {
    id: 'ast-003',
    referenceNumber: 'AST-2026-003',
    name: 'Vacuum Pump VP-5000',
    description: 'Industrial vacuum pump for production line',
    assetTag: 'TAG-003',
    serialNumber: 'SN-VP-003',
    category: 'Production Equipment',
    location: 'Production Floor 1',
    department: 'Manufacturing',
    status: 'OUT_OF_SERVICE',
    condition: 'POOR',
    manufacturer: 'Busch',
    model: 'VP-5000',
    purchaseDate: '2018-03-20T00:00:00.000Z',
    purchaseCost: 8500,
    currentValue: 850,
    warrantyExpiry: null,
    assignedTo: '',
    notes: 'Awaiting replacement parts',
    createdAt: '2018-03-20T00:00:00.000Z',
  },
  {
    id: 'ast-004',
    referenceNumber: 'AST-2026-004',
    name: 'Company Vehicle — Transit Van',
    description: 'Ford Transit 350L delivery van',
    assetTag: 'TAG-004',
    serialNumber: 'SN-VAN-004',
    category: 'Vehicles',
    location: 'Car Park',
    department: 'Logistics',
    status: 'IN_SERVICE',
    condition: 'GOOD',
    manufacturer: 'Ford',
    model: 'Transit 350L',
    purchaseDate: '2022-09-01T00:00:00.000Z',
    purchaseCost: 28000,
    currentValue: 20000,
    warrantyExpiry: '2025-09-01T00:00:00.000Z',
    assignedTo: 'Logistics Team',
    notes: '',
    createdAt: '2022-09-01T00:00:00.000Z',
  },
  {
    id: 'ast-005',
    referenceNumber: 'AST-2026-005',
    name: 'CNC Milling Machine MX-3',
    description: '5-axis CNC milling machine (decommissioned)',
    assetTag: 'TAG-005',
    serialNumber: 'SN-CNC-005',
    category: 'Production Equipment',
    location: 'Storage Unit 3',
    department: 'Manufacturing',
    status: 'DECOMMISSIONED',
    condition: 'CRITICAL',
    manufacturer: 'Haas',
    model: 'MX-3',
    purchaseDate: '2010-05-01T00:00:00.000Z',
    purchaseCost: 95000,
    currentValue: 0,
    warrantyExpiry: null,
    assignedTo: '',
    notes: 'End of life — awaiting disposal',
    createdAt: '2010-05-01T00:00:00.000Z',
  },
];

interface MockWorkOrder {
  id: string;
  referenceNumber: string;
  assetId: string;
  title: string;
  description: string;
  type: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assigneeName: string;
  scheduledDate: string | null;
  completedDate: string | null;
  estimatedHours: number;
  actualHours: number | null;
  cost: number | null;
  notes: string;
  createdAt: string;
}

const MOCK_WORK_ORDERS: MockWorkOrder[] = [
  {
    id: 'wo-001',
    referenceNumber: 'WO-2026-001',
    assetId: 'ast-002',
    title: 'Annual forklift service',
    description: 'Full service including oil change, brake check, and safety inspection',
    type: 'Preventive',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assigneeName: 'Bob Tech',
    scheduledDate: '2026-03-10T00:00:00.000Z',
    completedDate: null,
    estimatedHours: 4,
    actualHours: null,
    cost: null,
    notes: '',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'wo-002',
    referenceNumber: 'WO-2026-002',
    assetId: 'ast-003',
    title: 'Emergency repair — vacuum pump failure',
    description: 'Pump seized — production halted',
    type: 'Corrective',
    priority: 'EMERGENCY',
    status: 'OPEN',
    assigneeName: '',
    scheduledDate: null,
    completedDate: null,
    estimatedHours: 8,
    actualHours: null,
    cost: null,
    notes: 'Parts ordered',
    createdAt: '2026-03-05T00:00:00.000Z',
  },
  {
    id: 'wo-003',
    referenceNumber: 'WO-2026-003',
    assetId: 'ast-001',
    title: 'Server firmware update',
    description: 'Quarterly firmware and OS patching',
    type: 'Preventive',
    priority: 'LOW',
    status: 'COMPLETED',
    assigneeName: 'IT Ops Team',
    scheduledDate: '2026-02-20T00:00:00.000Z',
    completedDate: '2026-02-21T00:00:00.000Z',
    estimatedHours: 2,
    actualHours: 1.5,
    cost: 0,
    notes: 'No issues found',
    createdAt: '2026-02-15T00:00:00.000Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('Asset status array', () => {
  it('has exactly 6 statuses', () => {
    expect(ASSET_STATUSES).toHaveLength(6);
  });

  it('contains ACTIVE', () => expect(ASSET_STATUSES).toContain('ACTIVE'));
  it('contains IN_SERVICE', () => expect(ASSET_STATUSES).toContain('IN_SERVICE'));
  it('contains OUT_OF_SERVICE', () => expect(ASSET_STATUSES).toContain('OUT_OF_SERVICE'));
  it('contains MAINTENANCE', () => expect(ASSET_STATUSES).toContain('MAINTENANCE'));
  it('contains DECOMMISSIONED', () => expect(ASSET_STATUSES).toContain('DECOMMISSIONED'));
  it('contains DISPOSED', () => expect(ASSET_STATUSES).toContain('DISPOSED'));

  it('all entries are unique', () => {
    expect(new Set(ASSET_STATUSES).size).toBe(ASSET_STATUSES.length);
  });
});

describe('Asset condition array', () => {
  it('has exactly 5 conditions', () => {
    expect(ASSET_CONDITIONS).toHaveLength(5);
  });

  it('contains EXCELLENT', () => expect(ASSET_CONDITIONS).toContain('EXCELLENT'));
  it('contains GOOD', () => expect(ASSET_CONDITIONS).toContain('GOOD'));
  it('contains FAIR', () => expect(ASSET_CONDITIONS).toContain('FAIR'));
  it('contains POOR', () => expect(ASSET_CONDITIONS).toContain('POOR'));
  it('contains CRITICAL', () => expect(ASSET_CONDITIONS).toContain('CRITICAL'));

  it('all entries are unique', () => {
    expect(new Set(ASSET_CONDITIONS).size).toBe(ASSET_CONDITIONS.length);
  });
});

describe('Work order priority array', () => {
  it('has exactly 4 priorities', () => {
    expect(WORK_ORDER_PRIORITIES).toHaveLength(4);
  });

  it('contains EMERGENCY', () => expect(WORK_ORDER_PRIORITIES).toContain('EMERGENCY'));
  it('contains HIGH', () => expect(WORK_ORDER_PRIORITIES).toContain('HIGH'));
  it('contains MEDIUM', () => expect(WORK_ORDER_PRIORITIES).toContain('MEDIUM'));
  it('contains LOW', () => expect(WORK_ORDER_PRIORITIES).toContain('LOW'));
});

describe('Work order status array', () => {
  it('has exactly 6 statuses', () => {
    expect(WORK_ORDER_STATUSES).toHaveLength(6);
  });

  for (const s of ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'] as WorkOrderStatus[]) {
    it(`contains ${s}`, () => expect(WORK_ORDER_STATUSES).toContain(s));
  }
});

describe('getAssetStatusColor', () => {
  it('ACTIVE → green', () => expect(getAssetStatusColor('ACTIVE')).toContain('green'));
  it('IN_SERVICE → green', () => expect(getAssetStatusColor('IN_SERVICE')).toContain('green'));
  it('MAINTENANCE → amber', () => expect(getAssetStatusColor('MAINTENANCE')).toContain('amber'));
  it('OUT_OF_SERVICE → red', () => expect(getAssetStatusColor('OUT_OF_SERVICE')).toContain('red'));
  it('DECOMMISSIONED → gray', () => expect(getAssetStatusColor('DECOMMISSIONED')).toContain('gray'));
  it('DISPOSED → gray', () => expect(getAssetStatusColor('DISPOSED')).toContain('gray'));
  it('unknown → gray (default)', () => expect(getAssetStatusColor('UNKNOWN')).toContain('gray'));

  it('ACTIVE and IN_SERVICE share the same color class', () => {
    expect(getAssetStatusColor('ACTIVE')).toBe(getAssetStatusColor('IN_SERVICE'));
  });

  it('DECOMMISSIONED and DISPOSED share the same color class', () => {
    expect(getAssetStatusColor('DECOMMISSIONED')).toBe(getAssetStatusColor('DISPOSED'));
  });

  for (const status of ASSET_STATUSES) {
    it(`${status} color contains bg-`, () => {
      expect(getAssetStatusColor(status)).toContain('bg-');
    });
    it(`${status} color is a non-empty string`, () => {
      expect(getAssetStatusColor(status).length).toBeGreaterThan(0);
    });
  }
});

describe('getConditionColor', () => {
  it('EXCELLENT → green', () => expect(getConditionColor('EXCELLENT')).toContain('green'));
  it('GOOD → blue', () => expect(getConditionColor('GOOD')).toContain('blue'));
  it('FAIR → yellow', () => expect(getConditionColor('FAIR')).toContain('yellow'));
  it('POOR → orange', () => expect(getConditionColor('POOR')).toContain('orange'));
  it('CRITICAL → red', () => expect(getConditionColor('CRITICAL')).toContain('red'));
  it('unknown → gray (default)', () => expect(getConditionColor('UNKNOWN')).toContain('gray'));

  for (const cond of ASSET_CONDITIONS) {
    it(`${cond} color contains bg-`, () => {
      expect(getConditionColor(cond)).toContain('bg-');
    });
  }
});

describe('getPriorityColor', () => {
  it('EMERGENCY → red', () => expect(getPriorityColor('EMERGENCY')).toContain('red'));
  it('HIGH → orange', () => expect(getPriorityColor('HIGH')).toContain('orange'));
  it('MEDIUM → yellow', () => expect(getPriorityColor('MEDIUM')).toContain('yellow'));
  it('LOW → green', () => expect(getPriorityColor('LOW')).toContain('green'));
  it('unknown → gray (default)', () => expect(getPriorityColor('UNKNOWN')).toContain('gray'));

  for (const priority of WORK_ORDER_PRIORITIES) {
    it(`${priority} color contains bg-`, () => {
      expect(getPriorityColor(priority)).toContain('bg-');
    });
  }
});

describe('getWorkOrderStatusColor', () => {
  it('COMPLETED → green', () => expect(getWorkOrderStatusColor('COMPLETED')).toContain('green'));
  it('IN_PROGRESS → blue', () => expect(getWorkOrderStatusColor('IN_PROGRESS')).toContain('blue'));
  it('ASSIGNED → cyan', () => expect(getWorkOrderStatusColor('ASSIGNED')).toContain('cyan'));
  it('ON_HOLD → amber', () => expect(getWorkOrderStatusColor('ON_HOLD')).toContain('amber'));
  it('CANCELLED → gray', () => expect(getWorkOrderStatusColor('CANCELLED')).toContain('gray'));
  it('OPEN → yellow (default)', () => expect(getWorkOrderStatusColor('OPEN')).toContain('yellow'));

  for (const status of WORK_ORDER_STATUSES) {
    it(`${status} color contains bg-`, () => {
      expect(getWorkOrderStatusColor(status)).toContain('bg-');
    });
  }
});

describe('Asset lifecycle helpers', () => {
  it('isOperational: ACTIVE → true', () => expect(isOperational('ACTIVE')).toBe(true));
  it('isOperational: IN_SERVICE → true', () => expect(isOperational('IN_SERVICE')).toBe(true));
  it('isOperational: MAINTENANCE → false', () => expect(isOperational('MAINTENANCE')).toBe(false));
  it('isOperational: OUT_OF_SERVICE → false', () => expect(isOperational('OUT_OF_SERVICE')).toBe(false));
  it('isOperational: DECOMMISSIONED → false', () => expect(isOperational('DECOMMISSIONED')).toBe(false));
  it('isOperational: DISPOSED → false', () => expect(isOperational('DISPOSED')).toBe(false));

  it('needsAttention: POOR → true', () => expect(needsAttention('POOR')).toBe(true));
  it('needsAttention: CRITICAL → true', () => expect(needsAttention('CRITICAL')).toBe(true));
  it('needsAttention: FAIR → false', () => expect(needsAttention('FAIR')).toBe(false));
  it('needsAttention: GOOD → false', () => expect(needsAttention('GOOD')).toBe(false));
  it('needsAttention: EXCELLENT → false', () => expect(needsAttention('EXCELLENT')).toBe(false));

  it('isRetired: DECOMMISSIONED → true', () => expect(isRetired('DECOMMISSIONED')).toBe(true));
  it('isRetired: DISPOSED → true', () => expect(isRetired('DISPOSED')).toBe(true));
  it('isRetired: ACTIVE → false', () => expect(isRetired('ACTIVE')).toBe(false));
  it('isRetired: MAINTENANCE → false', () => expect(isRetired('MAINTENANCE')).toBe(false));

  for (const status of ASSET_STATUSES) {
    it(`isOperational(${status}) returns a boolean`, () => {
      expect(typeof isOperational(status)).toBe('boolean');
    });
    it(`isRetired(${status}) returns a boolean`, () => {
      expect(typeof isRetired(status)).toBe('boolean');
    });
  }
});

describe('getDepreciationPercent', () => {
  it('fully depreciated (currentValue=0) → 100%', () => {
    expect(getDepreciationPercent(10000, 0)).toBeCloseTo(100);
  });

  it('no depreciation (current = purchase) → 0%', () => {
    expect(getDepreciationPercent(10000, 10000)).toBeCloseTo(0);
  });

  it('half depreciated → 50%', () => {
    expect(getDepreciationPercent(10000, 5000)).toBeCloseTo(50);
  });

  it('zero purchase cost → 0 (avoid division by zero)', () => {
    expect(getDepreciationPercent(0, 0)).toBe(0);
  });

  it('20% depreciated', () => {
    expect(getDepreciationPercent(10000, 8000)).toBeCloseTo(20);
  });

  for (let pct = 0; pct <= 100; pct += 10) {
    it(`${pct}% depreciation result is non-negative`, () => {
      const current = 10000 * (1 - pct / 100);
      expect(getDepreciationPercent(10000, current)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('getDepreciationColor', () => {
  it('percent 80 → red', () => expect(getDepreciationColor(80)).toContain('red'));
  it('percent 100 → red', () => expect(getDepreciationColor(100)).toContain('red'));
  it('percent 50 → orange', () => expect(getDepreciationColor(50)).toContain('orange'));
  it('percent 79 → orange', () => expect(getDepreciationColor(79)).toContain('orange'));
  it('percent 25 → yellow', () => expect(getDepreciationColor(25)).toContain('yellow'));
  it('percent 49 → yellow', () => expect(getDepreciationColor(49)).toContain('yellow'));
  it('percent 0 → green', () => expect(getDepreciationColor(0)).toContain('green'));
  it('percent 24 → green', () => expect(getDepreciationColor(24)).toContain('green'));

  for (let pct = 0; pct <= 100; pct += 5) {
    it(`getDepreciationColor(${pct}) returns a non-empty string`, () => {
      expect(getDepreciationColor(pct).length).toBeGreaterThan(0);
    });
  }
});

describe('straightLineBookValue', () => {
  it('year 0 returns full cost', () => {
    expect(straightLineBookValue(10000, 1000, 5, 0)).toBe(10000);
  });

  it('year = lifeYears returns salvage value', () => {
    expect(straightLineBookValue(10000, 1000, 5, 5)).toBeCloseTo(1000);
  });

  it('zero life returns 0', () => {
    expect(straightLineBookValue(10000, 1000, 0, 1)).toBe(0);
  });

  it('beyond life returns salvage (floored)', () => {
    expect(straightLineBookValue(10000, 1000, 5, 10)).toBeCloseTo(1000);
  });

  it('book value decreases monotonically year over year', () => {
    let prev = straightLineBookValue(50000, 5000, 10, 0);
    for (let yr = 1; yr <= 10; yr++) {
      const current = straightLineBookValue(50000, 5000, 10, yr);
      expect(current).toBeLessThanOrEqual(prev);
      prev = current;
    }
  });

  for (let year = 0; year <= 20; year++) {
    it(`straight-line book value at year ${year} is non-negative`, () => {
      expect(straightLineBookValue(50000, 5000, 10, year)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('decliningBalanceBookValue', () => {
  it('year 0 returns full cost', () => {
    expect(decliningBalanceBookValue(10000, 0.2, 0)).toBeCloseTo(10000);
  });

  it('year 1 at 20% rate → 8000', () => {
    expect(decliningBalanceBookValue(10000, 0.2, 1)).toBeCloseTo(8000);
  });

  it('year 2 at 20% rate → 6400', () => {
    expect(decliningBalanceBookValue(10000, 0.2, 2)).toBeCloseTo(6400);
  });

  it('always positive for rate < 1', () => {
    for (let yr = 0; yr <= 20; yr++) {
      expect(decliningBalanceBookValue(10000, 0.2, yr)).toBeGreaterThanOrEqual(0);
    }
  });

  it('higher year always yields lower value', () => {
    const v5 = decliningBalanceBookValue(10000, 0.2, 5);
    const v6 = decliningBalanceBookValue(10000, 0.2, 6);
    expect(v6).toBeLessThan(v5);
  });

  for (let yr = 0; yr <= 15; yr++) {
    it(`declining balance at year ${yr} is non-negative`, () => {
      expect(decliningBalanceBookValue(10000, 0.25, yr)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('underscoreToLabel', () => {
  it('IN_SERVICE → "IN SERVICE"', () => expect(underscoreToLabel('IN_SERVICE')).toBe('IN SERVICE'));
  it('OUT_OF_SERVICE → "OUT OF SERVICE"', () => expect(underscoreToLabel('OUT_OF_SERVICE')).toBe('OUT OF SERVICE'));
  it('ACTIVE → "ACTIVE"', () => expect(underscoreToLabel('ACTIVE')).toBe('ACTIVE'));
  it('ON_HOLD → "ON HOLD"', () => expect(underscoreToLabel('ON_HOLD')).toBe('ON HOLD'));
  it('IN_PROGRESS → "IN PROGRESS"', () => expect(underscoreToLabel('IN_PROGRESS')).toBe('IN PROGRESS'));
  it('empty string → ""', () => expect(underscoreToLabel('')).toBe(''));

  for (const status of ASSET_STATUSES) {
    it(`underscoreToLabel(${status}) is a string`, () => {
      expect(typeof underscoreToLabel(status)).toBe('string');
    });
  }
});

describe('Mock asset data integrity', () => {
  it('has exactly 5 mock assets', () => {
    expect(MOCK_ASSETS).toHaveLength(5);
  });

  it('all asset ids are unique', () => {
    const ids = MOCK_ASSETS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all reference numbers are unique', () => {
    const refs = MOCK_ASSETS.map((a) => a.referenceNumber);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it('all asset tags are unique', () => {
    const tags = MOCK_ASSETS.map((a) => a.assetTag);
    expect(new Set(tags).size).toBe(tags.length);
  });

  for (const asset of MOCK_ASSETS) {
    it(`${asset.id}: status is a valid AssetStatus`, () => {
      expect(ASSET_STATUSES).toContain(asset.status);
    });

    it(`${asset.id}: condition is a valid AssetCondition`, () => {
      expect(ASSET_CONDITIONS).toContain(asset.condition);
    });

    it(`${asset.id}: referenceNumber starts with AST-`, () => {
      expect(asset.referenceNumber.startsWith('AST-')).toBe(true);
    });

    it(`${asset.id}: name is non-empty`, () => {
      expect(asset.name.length).toBeGreaterThan(0);
    });

    it(`${asset.id}: purchaseCost is non-negative`, () => {
      expect(asset.purchaseCost).toBeGreaterThanOrEqual(0);
    });

    it(`${asset.id}: currentValue is non-negative`, () => {
      expect(asset.currentValue).toBeGreaterThanOrEqual(0);
    });

    it(`${asset.id}: currentValue ≤ purchaseCost`, () => {
      expect(asset.currentValue).toBeLessThanOrEqual(asset.purchaseCost);
    });
  }

  it('exactly 2 operational assets (ACTIVE + IN_SERVICE)', () => {
    expect(MOCK_ASSETS.filter((a) => isOperational(a.status))).toHaveLength(2);
  });

  it('exactly 1 MAINTENANCE asset', () => {
    expect(MOCK_ASSETS.filter((a) => a.status === 'MAINTENANCE')).toHaveLength(1);
  });

  it('exactly 1 retired (DECOMMISSIONED/DISPOSED) asset', () => {
    expect(MOCK_ASSETS.filter((a) => isRetired(a.status))).toHaveLength(1);
  });

  it('assets needing attention (POOR/CRITICAL) count is >= 1', () => {
    expect(MOCK_ASSETS.filter((a) => needsAttention(a.condition)).length).toBeGreaterThanOrEqual(1);
  });

  it('total purchase cost is greater than total current value', () => {
    const totalPurchase = MOCK_ASSETS.reduce((s, a) => s + a.purchaseCost, 0);
    const totalCurrent = MOCK_ASSETS.reduce((s, a) => s + a.currentValue, 0);
    expect(totalPurchase).toBeGreaterThan(totalCurrent);
  });

  it('total depreciation is positive', () => {
    const totalPurchase = MOCK_ASSETS.reduce((s, a) => s + a.purchaseCost, 0);
    const totalCurrent = MOCK_ASSETS.reduce((s, a) => s + a.currentValue, 0);
    expect(totalPurchase - totalCurrent).toBeGreaterThan(0);
  });
});

describe('Mock work order data integrity', () => {
  it('has exactly 3 mock work orders', () => {
    expect(MOCK_WORK_ORDERS).toHaveLength(3);
  });

  it('all work order ids are unique', () => {
    const ids = MOCK_WORK_ORDERS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all reference numbers are unique', () => {
    const refs = MOCK_WORK_ORDERS.map((w) => w.referenceNumber);
    expect(new Set(refs).size).toBe(refs.length);
  });

  for (const wo of MOCK_WORK_ORDERS) {
    it(`${wo.id}: priority is valid`, () => {
      expect(WORK_ORDER_PRIORITIES).toContain(wo.priority);
    });

    it(`${wo.id}: status is valid`, () => {
      expect(WORK_ORDER_STATUSES).toContain(wo.status);
    });

    it(`${wo.id}: referenceNumber starts with WO-`, () => {
      expect(wo.referenceNumber.startsWith('WO-')).toBe(true);
    });

    it(`${wo.id}: title is non-empty`, () => {
      expect(wo.title.length).toBeGreaterThan(0);
    });

    it(`${wo.id}: estimatedHours is positive`, () => {
      expect(wo.estimatedHours).toBeGreaterThan(0);
    });
  }

  it('exactly 1 EMERGENCY priority work order', () => {
    expect(MOCK_WORK_ORDERS.filter((w) => w.priority === 'EMERGENCY')).toHaveLength(1);
  });

  it('exactly 1 COMPLETED work order', () => {
    expect(MOCK_WORK_ORDERS.filter((w) => w.status === 'COMPLETED')).toHaveLength(1);
  });

  it('COMPLETED work order has a completedDate', () => {
    const completed = MOCK_WORK_ORDERS.find((w) => w.status === 'COMPLETED');
    expect(completed?.completedDate).toBeTruthy();
  });

  it('OPEN work orders have no completedDate', () => {
    const openOrders = MOCK_WORK_ORDERS.filter((w) => w.status === 'OPEN');
    for (const wo of openOrders) {
      expect(wo.completedDate).toBeNull();
    }
  });

  it('all work orders reference an existing mock asset', () => {
    const assetIds = new Set(MOCK_ASSETS.map((a) => a.id));
    for (const wo of MOCK_WORK_ORDERS) {
      expect(assetIds.has(wo.assetId)).toBe(true);
    }
  });
});

// ─── Parametric: ASSET_STATUSES positional index ──────────────────────────────

describe('ASSET_STATUSES — positional index parametric', () => {
  const cases: [AssetStatus, number][] = [
    ['ACTIVE', 0],
    ['IN_SERVICE', 1],
    ['OUT_OF_SERVICE', 2],
    ['MAINTENANCE', 3],
    ['DECOMMISSIONED', 4],
    ['DISPOSED', 5],
  ];
  for (const [status, idx] of cases) {
    it(`${status} is at index ${idx}`, () => {
      expect(ASSET_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: ASSET_CONDITIONS positional index ────────────────────────────

describe('ASSET_CONDITIONS — positional index parametric', () => {
  const cases: [AssetCondition, number][] = [
    ['EXCELLENT', 0],
    ['GOOD', 1],
    ['FAIR', 2],
    ['POOR', 3],
    ['CRITICAL', 4],
  ];
  for (const [cond, idx] of cases) {
    it(`${cond} is at index ${idx}`, () => {
      expect(ASSET_CONDITIONS[idx]).toBe(cond);
    });
  }
});

// ─── Parametric: WORK_ORDER_PRIORITIES positional index ───────────────────────

describe('WORK_ORDER_PRIORITIES — positional index parametric', () => {
  const cases: [WorkOrderPriority, number][] = [
    ['EMERGENCY', 0],
    ['HIGH', 1],
    ['MEDIUM', 2],
    ['LOW', 3],
  ];
  for (const [priority, idx] of cases) {
    it(`${priority} is at index ${idx}`, () => {
      expect(WORK_ORDER_PRIORITIES[idx]).toBe(priority);
    });
  }
});

// ─── Parametric: WORK_ORDER_STATUSES positional index ────────────────────────

describe('WORK_ORDER_STATUSES — positional index parametric', () => {
  const cases: [WorkOrderStatus, number][] = [
    ['OPEN', 0],
    ['ASSIGNED', 1],
    ['IN_PROGRESS', 2],
    ['ON_HOLD', 3],
    ['COMPLETED', 4],
    ['CANCELLED', 5],
  ];
  for (const [status, idx] of cases) {
    it(`${status} is at index ${idx}`, () => {
      expect(WORK_ORDER_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: MOCK_ASSETS per-asset exact status+condition+purchaseCost ────

describe('MOCK_ASSETS — per-asset exact status+condition+purchaseCost parametric', () => {
  const cases: [string, AssetStatus, AssetCondition, number][] = [
    ['ast-001', 'ACTIVE', 'EXCELLENT', 12000],
    ['ast-002', 'MAINTENANCE', 'FAIR', 35000],
    ['ast-003', 'OUT_OF_SERVICE', 'POOR', 8500],
    ['ast-004', 'IN_SERVICE', 'GOOD', 28000],
    ['ast-005', 'DECOMMISSIONED', 'CRITICAL', 95000],
  ];
  for (const [id, status, condition, purchaseCost] of cases) {
    it(`${id}: status=${status}, condition=${condition}, purchaseCost=${purchaseCost}`, () => {
      const a = MOCK_ASSETS.find((x) => x.id === id)!;
      expect(a.status).toBe(status);
      expect(a.condition).toBe(condition);
      expect(a.purchaseCost).toBe(purchaseCost);
    });
  }
});

// ─── Parametric: MOCK_WORK_ORDERS per-order exact priority+status ─────────────

describe('MOCK_WORK_ORDERS — per-order exact priority+status parametric', () => {
  const cases: [string, WorkOrderPriority, WorkOrderStatus][] = [
    ['wo-001', 'MEDIUM', 'IN_PROGRESS'],
    ['wo-002', 'EMERGENCY', 'OPEN'],
    ['wo-003', 'LOW', 'COMPLETED'],
  ];
  for (const [id, priority, status] of cases) {
    it(`${id}: priority=${priority}, status=${status}`, () => {
      const wo = MOCK_WORK_ORDERS.find((x) => x.id === id)!;
      expect(wo.priority).toBe(priority);
      expect(wo.status).toBe(status);
    });
  }
});

describe('Depreciation percent — mock asset spot checks', () => {
  it('ast-005 (fully depreciated) → ~100%', () => {
    const asset = MOCK_ASSETS.find((a) => a.id === 'ast-005')!;
    expect(getDepreciationPercent(asset.purchaseCost, asset.currentValue)).toBeCloseTo(100);
  });

  it('ast-001 (20% depreciated) → ~20%', () => {
    const asset = MOCK_ASSETS.find((a) => a.id === 'ast-001')!;
    const pct = getDepreciationPercent(asset.purchaseCost, asset.currentValue);
    expect(pct).toBeCloseTo(20, 0);
  });

  it('ast-001 depreciation color is green (<25%)', () => {
    const asset = MOCK_ASSETS.find((a) => a.id === 'ast-001')!;
    const pct = getDepreciationPercent(asset.purchaseCost, asset.currentValue);
    expect(getDepreciationColor(pct)).toContain('green');
  });

  it('ast-005 depreciation color is red (>=80%)', () => {
    const asset = MOCK_ASSETS.find((a) => a.id === 'ast-005')!;
    const pct = getDepreciationPercent(asset.purchaseCost, asset.currentValue);
    expect(getDepreciationColor(pct)).toContain('red');
  });

  for (const asset of MOCK_ASSETS) {
    it(`${asset.id}: depreciation percent is in [0, 100]`, () => {
      const pct = getDepreciationPercent(asset.purchaseCost, asset.currentValue);
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    });
  }
});
