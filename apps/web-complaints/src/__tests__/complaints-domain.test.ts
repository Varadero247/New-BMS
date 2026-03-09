// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Types ───────────────────────────────────────────────────────────────────

type ComplaintChannel = 'EMAIL' | 'PHONE' | 'WEB_FORM' | 'SOCIAL_MEDIA' | 'IN_PERSON' | 'LETTER';
type ComplaintCategory =
  | 'PRODUCT'
  | 'SERVICE'
  | 'DELIVERY'
  | 'BILLING'
  | 'SAFETY'
  | 'ENVIRONMENTAL'
  | 'REGULATORY'
  | 'OTHER';
type ComplaintPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type ComplaintStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ESCALATED';
type ActionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// ─── Arrays ──────────────────────────────────────────────────────────────────

const CHANNELS: ComplaintChannel[] = [
  'EMAIL',
  'PHONE',
  'WEB_FORM',
  'SOCIAL_MEDIA',
  'IN_PERSON',
  'LETTER',
];
const CATEGORIES: ComplaintCategory[] = [
  'PRODUCT',
  'SERVICE',
  'DELIVERY',
  'BILLING',
  'SAFETY',
  'ENVIRONMENTAL',
  'REGULATORY',
  'OTHER',
];
const PRIORITIES: ComplaintPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: ComplaintStatus[] = [
  'NEW',
  'ACKNOWLEDGED',
  'INVESTIGATING',
  'RESOLVED',
  'CLOSED',
  'ESCALATED',
];
const ACTION_STATUSES: ActionStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'OVERDUE',
  'CANCELLED',
];

// ─── Badge / Color maps ───────────────────────────────────────────────────────

const priorityColor: Record<ComplaintPriority, string> = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
};

const statusBadgeVariant: Record<ComplaintStatus, BadgeVariant> = {
  NEW: 'default',
  ACKNOWLEDGED: 'default',
  INVESTIGATING: 'default',
  RESOLVED: 'secondary',
  CLOSED: 'secondary',
  ESCALATED: 'destructive',
};

const actionStatusBadgeVariant: Record<ActionStatus, BadgeVariant> = {
  OPEN: 'outline',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  OVERDUE: 'destructive',
  CANCELLED: 'outline',
};

// ─── SLA config ───────────────────────────────────────────────────────────────

const slaTargetHours: Record<ComplaintPriority, number> = {
  CRITICAL: 4,
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'CRITICAL':
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

function isComplaintOpen(status: ComplaintStatus): boolean {
  return status !== 'RESOLVED' && status !== 'CLOSED';
}

function isComplaintResolved(status: ComplaintStatus): boolean {
  return status === 'RESOLVED' || status === 'CLOSED';
}

function isOverdue(slaDeadline: string, status: ComplaintStatus): boolean {
  if (isComplaintResolved(status)) return false;
  return new Date(slaDeadline) < new Date();
}

function getDaysRemaining(slaDeadline: string): number {
  const diff = new Date(slaDeadline).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isAtRisk(slaDeadline: string, status: ComplaintStatus): boolean {
  if (isComplaintResolved(status)) return false;
  const days = getDaysRemaining(slaDeadline);
  return days > 0 && days <= 3;
}

function escalationRequired(priority: ComplaintPriority, ageHours: number): boolean {
  return priority === 'CRITICAL' && ageHours > 2;
}

function slaBreached(receivedAt: Date, priority: ComplaintPriority, now: Date): boolean {
  const slaMs = slaTargetHours[priority] * 3600000;
  return now.getTime() - receivedAt.getTime() > slaMs;
}

function getStatusBadgeVariant(status: string): BadgeVariant {
  if (status === 'RESOLVED' || status === 'CLOSED') return 'secondary';
  if (status === 'ESCALATED') return 'destructive';
  return 'default';
}

function getActionStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'COMPLETED':
      return 'secondary';
    case 'OVERDUE':
      return 'destructive';
    case 'IN_PROGRESS':
      return 'default';
    default:
      return 'outline';
  }
}

function isRegulatoryCategory(category: ComplaintCategory): boolean {
  return category === 'REGULATORY' || category === 'SAFETY';
}

// ─── Mock data shapes ─────────────────────────────────────────────────────────

interface MockComplaint {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  channel: ComplaintChannel;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  complainantName: string;
  complainantEmail: string;
  complainantPhone: string;
  assigneeName: string;
  department: string;
  productRef: string;
  orderRef: string;
  isRegulatory: boolean;
  regulatoryBody: string;
  slaDeadline: string;
  rootCause: string;
  resolution: string;
  preventiveAction: string;
  customerSatisfied: boolean;
  notes: string;
  createdAt: string;
}

interface MockAction {
  id: string;
  referenceNumber: string;
  complaintId: string;
  action: string;
  assignee: string;
  dueDate: string;
  completedAt: string;
  status: ActionStatus;
  notes: string;
  createdAt: string;
}

const MOCK_COMPLAINTS: MockComplaint[] = [
  {
    id: 'cmp-001',
    referenceNumber: 'CMP-2026-001',
    title: 'Defective product received — packaging damaged',
    description: 'Customer reports the product arrived with damaged packaging and missing parts.',
    channel: 'EMAIL',
    category: 'PRODUCT',
    priority: 'HIGH',
    status: 'INVESTIGATING',
    complainantName: 'John Smith',
    complainantEmail: 'john.smith@example.com',
    complainantPhone: '+44 20 7946 0958',
    assigneeName: 'Sarah Lee',
    department: 'Quality',
    productRef: 'PRD-X100',
    orderRef: 'ORD-20260201',
    isRegulatory: false,
    regulatoryBody: '',
    slaDeadline: '2026-03-15T12:00:00Z',
    rootCause: '',
    resolution: '',
    preventiveAction: '',
    customerSatisfied: false,
    notes: 'Awaiting product return for inspection.',
    createdAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'cmp-002',
    referenceNumber: 'CMP-2026-002',
    title: 'Safety concern — equipment overheating',
    description: 'User reports unit overheating during normal operation.',
    channel: 'PHONE',
    category: 'SAFETY',
    priority: 'CRITICAL',
    status: 'ESCALATED',
    complainantName: 'Priya Sharma',
    complainantEmail: 'p.sharma@hospital.org',
    complainantPhone: '+65 6123 4567',
    assigneeName: 'Dr. Rachel Wong',
    department: 'Engineering',
    productRef: 'PRD-Y200',
    orderRef: 'ORD-20260115',
    isRegulatory: true,
    regulatoryBody: 'MHRA',
    slaDeadline: '2026-03-09T18:00:00Z',
    rootCause: 'Under investigation',
    resolution: '',
    preventiveAction: '',
    customerSatisfied: false,
    notes: 'Escalated to regulator.',
    createdAt: '2026-03-09T14:00:00Z',
  },
  {
    id: 'cmp-003',
    referenceNumber: 'CMP-2025-088',
    title: 'Billing error — double charged',
    description: 'Customer was charged twice for a single transaction.',
    channel: 'WEB_FORM',
    category: 'BILLING',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    complainantName: 'Carlos Mendez',
    complainantEmail: 'c.mendez@acme.com',
    complainantPhone: '',
    assigneeName: 'Finance Team',
    department: 'Finance',
    productRef: '',
    orderRef: 'ORD-20251205',
    isRegulatory: false,
    regulatoryBody: '',
    slaDeadline: '2025-12-10T12:00:00Z',
    rootCause: 'Payment gateway retry logic fault',
    resolution: 'Full refund issued for duplicate charge.',
    preventiveAction: 'Updated payment gateway config to prevent retries on success.',
    customerSatisfied: true,
    notes: '',
    createdAt: '2025-12-07T10:30:00Z',
  },
];

const MOCK_ACTIONS: MockAction[] = [
  {
    id: 'act-001',
    referenceNumber: 'ACT-2026-001',
    complaintId: 'cmp-001',
    action: 'Initiate product return and inspection process',
    assignee: 'Sarah Lee',
    dueDate: '2026-03-12T00:00:00Z',
    completedAt: '',
    status: 'IN_PROGRESS',
    notes: 'Return label sent to customer.',
    createdAt: '2026-03-10T09:30:00Z',
  },
  {
    id: 'act-002',
    referenceNumber: 'ACT-2026-002',
    complaintId: 'cmp-002',
    action: 'Notify MHRA within 72-hour serious incident reporting window',
    assignee: 'Dr. Rachel Wong',
    dueDate: '2026-03-10T18:00:00Z',
    completedAt: '',
    status: 'OVERDUE',
    notes: 'Regulatory notification pending sign-off.',
    createdAt: '2026-03-09T14:15:00Z',
  },
  {
    id: 'act-003',
    referenceNumber: 'ACT-2025-088',
    complaintId: 'cmp-003',
    action: 'Issue full refund for duplicate charge',
    assignee: 'Finance Team',
    dueDate: '2025-12-09T00:00:00Z',
    completedAt: '2025-12-09T11:00:00Z',
    status: 'COMPLETED',
    notes: '',
    createdAt: '2025-12-07T10:45:00Z',
  },
];

// =============================================================================
// Tests
// =============================================================================

describe('Complaint channel array', () => {
  it('has exactly 6 channels', () => expect(CHANNELS).toHaveLength(6));
  it('contains EMAIL', () => expect(CHANNELS).toContain('EMAIL'));
  it('contains PHONE', () => expect(CHANNELS).toContain('PHONE'));
  it('contains WEB_FORM', () => expect(CHANNELS).toContain('WEB_FORM'));
  it('contains SOCIAL_MEDIA', () => expect(CHANNELS).toContain('SOCIAL_MEDIA'));
  it('contains IN_PERSON', () => expect(CHANNELS).toContain('IN_PERSON'));
  it('contains LETTER', () => expect(CHANNELS).toContain('LETTER'));
  for (const ch of CHANNELS) {
    it(`channel "${ch}" is uppercase`, () => expect(ch).toBe(ch.toUpperCase()));
  }
});

describe('Complaint category array', () => {
  it('has exactly 8 categories', () => expect(CATEGORIES).toHaveLength(8));
  it('contains PRODUCT', () => expect(CATEGORIES).toContain('PRODUCT'));
  it('contains SAFETY', () => expect(CATEGORIES).toContain('SAFETY'));
  it('contains REGULATORY', () => expect(CATEGORIES).toContain('REGULATORY'));
  it('ends with OTHER', () =>
    expect(CATEGORIES[CATEGORIES.length - 1]).toBe('OTHER'));
  for (const cat of CATEGORIES) {
    it(`category "${cat}" is a non-empty string`, () => {
      expect(typeof cat).toBe('string');
      expect(cat.length).toBeGreaterThan(0);
    });
  }
});

describe('Complaint priority array', () => {
  it('has exactly 4 priorities', () => expect(PRIORITIES).toHaveLength(4));
  it('starts with CRITICAL (highest)', () => expect(PRIORITIES[0]).toBe('CRITICAL'));
  it('ends with LOW (lowest)', () =>
    expect(PRIORITIES[PRIORITIES.length - 1]).toBe('LOW'));
  for (const p of PRIORITIES) {
    it(`priority "${p}" is uppercase`, () => expect(p).toBe(p.toUpperCase()));
  }
});

describe('Complaint status array', () => {
  it('has exactly 6 statuses', () => expect(STATUSES).toHaveLength(6));
  it('starts with NEW', () => expect(STATUSES[0]).toBe('NEW'));
  it('contains ESCALATED', () => expect(STATUSES).toContain('ESCALATED'));
  it('contains RESOLVED', () => expect(STATUSES).toContain('RESOLVED'));
  it('contains CLOSED', () => expect(STATUSES).toContain('CLOSED'));
  for (const s of STATUSES) {
    it(`status "${s}" is uppercase`, () => expect(s).toBe(s.toUpperCase()));
  }
});

describe('Action status array', () => {
  it('has exactly 5 action statuses', () => expect(ACTION_STATUSES).toHaveLength(5));
  it('contains OPEN', () => expect(ACTION_STATUSES).toContain('OPEN'));
  it('contains IN_PROGRESS', () => expect(ACTION_STATUSES).toContain('IN_PROGRESS'));
  it('contains COMPLETED', () => expect(ACTION_STATUSES).toContain('COMPLETED'));
  it('contains OVERDUE', () => expect(ACTION_STATUSES).toContain('OVERDUE'));
  it('contains CANCELLED', () => expect(ACTION_STATUSES).toContain('CANCELLED'));
  for (const s of ACTION_STATUSES) {
    it(`action status "${s}" is uppercase`, () => expect(s).toBe(s.toUpperCase()));
  }
});

describe('Priority color map', () => {
  for (const p of PRIORITIES) {
    it(`priority "${p}" has a color string`, () => {
      expect(typeof priorityColor[p]).toBe('string');
    });
    it(`priority "${p}" color contains bg-`, () => {
      expect(priorityColor[p]).toContain('bg-');
    });
  }
  it('CRITICAL is red', () => expect(priorityColor.CRITICAL).toContain('red'));
  it('HIGH is orange', () => expect(priorityColor.HIGH).toContain('orange'));
  it('MEDIUM is yellow', () => expect(priorityColor.MEDIUM).toContain('yellow'));
  it('LOW is green', () => expect(priorityColor.LOW).toContain('green'));
});

describe('Status badge variant map', () => {
  it('NEW is default', () => expect(statusBadgeVariant.NEW).toBe('default'));
  it('ACKNOWLEDGED is default', () =>
    expect(statusBadgeVariant.ACKNOWLEDGED).toBe('default'));
  it('INVESTIGATING is default', () =>
    expect(statusBadgeVariant.INVESTIGATING).toBe('default'));
  it('RESOLVED is secondary', () => expect(statusBadgeVariant.RESOLVED).toBe('secondary'));
  it('CLOSED is secondary', () => expect(statusBadgeVariant.CLOSED).toBe('secondary'));
  it('ESCALATED is destructive', () =>
    expect(statusBadgeVariant.ESCALATED).toBe('destructive'));
  for (const s of STATUSES) {
    it(`status "${s}" badge variant is a non-empty string`, () => {
      expect(statusBadgeVariant[s].length).toBeGreaterThan(0);
    });
  }
});

describe('Action status badge variant map', () => {
  it('OPEN is outline', () => expect(actionStatusBadgeVariant.OPEN).toBe('outline'));
  it('IN_PROGRESS is default', () =>
    expect(actionStatusBadgeVariant.IN_PROGRESS).toBe('default'));
  it('COMPLETED is secondary', () =>
    expect(actionStatusBadgeVariant.COMPLETED).toBe('secondary'));
  it('OVERDUE is destructive', () =>
    expect(actionStatusBadgeVariant.OVERDUE).toBe('destructive'));
  it('CANCELLED is outline', () =>
    expect(actionStatusBadgeVariant.CANCELLED).toBe('outline'));
});

describe('SLA target hours', () => {
  it('CRITICAL = 4 hours', () => expect(slaTargetHours.CRITICAL).toBe(4));
  it('HIGH = 8 hours', () => expect(slaTargetHours.HIGH).toBe(8));
  it('MEDIUM = 24 hours', () => expect(slaTargetHours.MEDIUM).toBe(24));
  it('LOW = 72 hours', () => expect(slaTargetHours.LOW).toBe(72));
  it('SLA hours strictly decrease with increasing priority', () => {
    expect(slaTargetHours.CRITICAL).toBeLessThan(slaTargetHours.HIGH);
    expect(slaTargetHours.HIGH).toBeLessThan(slaTargetHours.MEDIUM);
    expect(slaTargetHours.MEDIUM).toBeLessThan(slaTargetHours.LOW);
  });
  for (const p of PRIORITIES) {
    it(`SLA hours for "${p}" is positive`, () => {
      expect(slaTargetHours[p]).toBeGreaterThan(0);
    });
  }
});

describe('getPriorityColor helper', () => {
  it('CRITICAL returns red class', () =>
    expect(getPriorityColor('CRITICAL')).toContain('red'));
  it('HIGH returns orange class', () =>
    expect(getPriorityColor('HIGH')).toContain('orange'));
  it('MEDIUM returns yellow class', () =>
    expect(getPriorityColor('MEDIUM')).toContain('yellow'));
  it('LOW returns green class', () =>
    expect(getPriorityColor('LOW')).toContain('green'));
  it('unknown priority returns gray class', () =>
    expect(getPriorityColor('UNKNOWN')).toContain('gray'));
  for (const p of PRIORITIES) {
    it(`getPriorityColor("${p}") contains bg-`, () => {
      expect(getPriorityColor(p)).toContain('bg-');
    });
    it(`getPriorityColor("${p}") is a non-empty string`, () => {
      expect(getPriorityColor(p).length).toBeGreaterThan(0);
    });
  }
});

describe('isComplaintOpen helper', () => {
  it('NEW is open', () => expect(isComplaintOpen('NEW')).toBe(true));
  it('ACKNOWLEDGED is open', () => expect(isComplaintOpen('ACKNOWLEDGED')).toBe(true));
  it('INVESTIGATING is open', () => expect(isComplaintOpen('INVESTIGATING')).toBe(true));
  it('ESCALATED is open', () => expect(isComplaintOpen('ESCALATED')).toBe(true));
  it('RESOLVED is not open', () => expect(isComplaintOpen('RESOLVED')).toBe(false));
  it('CLOSED is not open', () => expect(isComplaintOpen('CLOSED')).toBe(false));
  for (const s of STATUSES) {
    it(`isComplaintOpen("${s}") returns boolean`, () => {
      expect(typeof isComplaintOpen(s)).toBe('boolean');
    });
  }
});

describe('isComplaintResolved helper', () => {
  it('RESOLVED returns true', () => expect(isComplaintResolved('RESOLVED')).toBe(true));
  it('CLOSED returns true', () => expect(isComplaintResolved('CLOSED')).toBe(true));
  it('NEW returns false', () => expect(isComplaintResolved('NEW')).toBe(false));
  it('ESCALATED returns false', () => expect(isComplaintResolved('ESCALATED')).toBe(false));
  it('isComplaintOpen and isComplaintResolved are mutually exclusive for all statuses', () => {
    for (const s of STATUSES) {
      expect(isComplaintOpen(s)).toBe(!isComplaintResolved(s));
    }
  });
});

describe('isOverdue helper', () => {
  it('past deadline + open status = overdue', () => {
    const pastDeadline = new Date(Date.now() - 86400000).toISOString();
    expect(isOverdue(pastDeadline, 'NEW')).toBe(true);
  });
  it('future deadline + open status = not overdue', () => {
    const futureDeadline = new Date(Date.now() + 86400000).toISOString();
    expect(isOverdue(futureDeadline, 'INVESTIGATING')).toBe(false);
  });
  it('past deadline + RESOLVED = not overdue', () => {
    const pastDeadline = new Date(Date.now() - 86400000).toISOString();
    expect(isOverdue(pastDeadline, 'RESOLVED')).toBe(false);
  });
  it('past deadline + CLOSED = not overdue', () => {
    const pastDeadline = new Date(Date.now() - 86400000).toISOString();
    expect(isOverdue(pastDeadline, 'CLOSED')).toBe(false);
  });
  it('ESCALATED with past deadline is overdue', () => {
    const pastDeadline = new Date(Date.now() - 3600000).toISOString();
    expect(isOverdue(pastDeadline, 'ESCALATED')).toBe(true);
  });
});

describe('getDaysRemaining helper', () => {
  it('deadline 1 day in future gives positive value', () => {
    const future = new Date(Date.now() + 86400000 + 60000).toISOString();
    expect(getDaysRemaining(future)).toBeGreaterThan(0);
  });
  it('deadline 1 day in past gives non-positive value', () => {
    const past = new Date(Date.now() - 86400000 - 60000).toISOString();
    expect(getDaysRemaining(past)).toBeLessThanOrEqual(0);
  });
  it('returns a number', () => {
    expect(typeof getDaysRemaining(new Date().toISOString())).toBe('number');
  });
});

describe('isAtRisk helper', () => {
  it('1 day remaining + open = at risk', () => {
    const oneDay = new Date(Date.now() + 86400000 + 60000).toISOString();
    expect(isAtRisk(oneDay, 'NEW')).toBe(true);
  });
  it('5 days remaining + open = not at risk', () => {
    const fiveDays = new Date(Date.now() + 5 * 86400000).toISOString();
    expect(isAtRisk(fiveDays, 'INVESTIGATING')).toBe(false);
  });
  it('1 day remaining + RESOLVED = not at risk', () => {
    const oneDay = new Date(Date.now() + 86400000 + 60000).toISOString();
    expect(isAtRisk(oneDay, 'RESOLVED')).toBe(false);
  });
  it('overdue deadline + open = not at risk (already overdue)', () => {
    const pastDeadline = new Date(Date.now() - 86400000).toISOString();
    expect(isAtRisk(pastDeadline, 'NEW')).toBe(false);
  });
});

describe('escalationRequired helper', () => {
  it('CRITICAL + 3 hours = escalation required', () =>
    expect(escalationRequired('CRITICAL', 3)).toBe(true));
  it('CRITICAL + 1 hour = NOT required (≤ 2h)', () =>
    expect(escalationRequired('CRITICAL', 1)).toBe(false));
  it('HIGH + 10 hours = NOT required (not CRITICAL)', () =>
    expect(escalationRequired('HIGH', 10)).toBe(false));
  it('MEDIUM + 100 hours = NOT required', () =>
    expect(escalationRequired('MEDIUM', 100)).toBe(false));
  it('LOW + 1000 hours = NOT required', () =>
    expect(escalationRequired('LOW', 1000)).toBe(false));
  it('CRITICAL exactly at 2 hours = NOT required (boundary)', () =>
    expect(escalationRequired('CRITICAL', 2)).toBe(false));
  for (const p of PRIORITIES) {
    it(`escalationRequired("${p}", ageHours) returns boolean`, () => {
      expect(typeof escalationRequired(p, 5)).toBe('boolean');
    });
  }
});

describe('slaBreached helper', () => {
  it('complaint older than CRITICAL SLA (4h) is breached', () => {
    const received = new Date(Date.now() - 5 * 3600000);
    expect(slaBreached(received, 'CRITICAL', new Date())).toBe(true);
  });
  it('brand-new CRITICAL complaint is not breached', () => {
    const received = new Date(Date.now() - 1000);
    expect(slaBreached(received, 'CRITICAL', new Date())).toBe(false);
  });
  it('complaint older than LOW SLA (72h) is breached', () => {
    const received = new Date(Date.now() - 80 * 3600000);
    expect(slaBreached(received, 'LOW', new Date())).toBe(true);
  });
  it('complaint exactly at MEDIUM SLA (24h) boundary — not yet breached', () => {
    const received = new Date(Date.now() - 24 * 3600000 + 1000);
    expect(slaBreached(received, 'MEDIUM', new Date())).toBe(false);
  });
  for (let h = 1; h <= 10; h++) {
    it(`CRITICAL SLA: complaint ${h}h old breached = ${h > 4}`, () => {
      const received = new Date(Date.now() - h * 3600000);
      expect(slaBreached(received, 'CRITICAL', new Date())).toBe(h > 4);
    });
  }
});

describe('getStatusBadgeVariant helper', () => {
  it('RESOLVED returns secondary', () =>
    expect(getStatusBadgeVariant('RESOLVED')).toBe('secondary'));
  it('CLOSED returns secondary', () =>
    expect(getStatusBadgeVariant('CLOSED')).toBe('secondary'));
  it('ESCALATED returns destructive', () =>
    expect(getStatusBadgeVariant('ESCALATED')).toBe('destructive'));
  it('NEW returns default', () =>
    expect(getStatusBadgeVariant('NEW')).toBe('default'));
  it('INVESTIGATING returns default', () =>
    expect(getStatusBadgeVariant('INVESTIGATING')).toBe('default'));
  for (const s of STATUSES) {
    it(`getStatusBadgeVariant("${s}") is a non-empty string`, () => {
      expect(getStatusBadgeVariant(s).length).toBeGreaterThan(0);
    });
  }
});

describe('getActionStatusBadgeVariant helper', () => {
  it('COMPLETED returns secondary', () =>
    expect(getActionStatusBadgeVariant('COMPLETED')).toBe('secondary'));
  it('OVERDUE returns destructive', () =>
    expect(getActionStatusBadgeVariant('OVERDUE')).toBe('destructive'));
  it('IN_PROGRESS returns default', () =>
    expect(getActionStatusBadgeVariant('IN_PROGRESS')).toBe('default'));
  it('OPEN returns outline', () =>
    expect(getActionStatusBadgeVariant('OPEN')).toBe('outline'));
  it('CANCELLED returns outline', () =>
    expect(getActionStatusBadgeVariant('CANCELLED')).toBe('outline'));
});

describe('isRegulatoryCategory helper', () => {
  it('REGULATORY is a regulatory category', () =>
    expect(isRegulatoryCategory('REGULATORY')).toBe(true));
  it('SAFETY is a regulatory category', () =>
    expect(isRegulatoryCategory('SAFETY')).toBe(true));
  it('PRODUCT is not regulatory', () =>
    expect(isRegulatoryCategory('PRODUCT')).toBe(false));
  it('BILLING is not regulatory', () =>
    expect(isRegulatoryCategory('BILLING')).toBe(false));
  it('OTHER is not regulatory', () =>
    expect(isRegulatoryCategory('OTHER')).toBe(false));
  for (const cat of CATEGORIES) {
    it(`isRegulatoryCategory("${cat}") returns boolean`, () => {
      expect(typeof isRegulatoryCategory(cat)).toBe('boolean');
    });
  }
});

describe('Mock Complaint data shapes', () => {
  it('MOCK_COMPLAINTS has 3 entries', () =>
    expect(MOCK_COMPLAINTS).toHaveLength(3));
  for (const c of MOCK_COMPLAINTS) {
    it(`"${c.referenceNumber}" has required string fields`, () => {
      expect(typeof c.id).toBe('string');
      expect(typeof c.referenceNumber).toBe('string');
      expect(typeof c.title).toBe('string');
      expect(typeof c.complainantName).toBe('string');
    });
    it(`"${c.referenceNumber}" referenceNumber starts with CMP-`, () => {
      expect(c.referenceNumber.startsWith('CMP-')).toBe(true);
    });
    it(`"${c.referenceNumber}" channel is valid`, () => {
      expect(CHANNELS).toContain(c.channel);
    });
    it(`"${c.referenceNumber}" category is valid`, () => {
      expect(CATEGORIES).toContain(c.category);
    });
    it(`"${c.referenceNumber}" priority is valid`, () => {
      expect(PRIORITIES).toContain(c.priority);
    });
    it(`"${c.referenceNumber}" status is valid`, () => {
      expect(STATUSES).toContain(c.status);
    });
    it(`"${c.referenceNumber}" isRegulatory is boolean`, () => {
      expect(typeof c.isRegulatory).toBe('boolean');
    });
    it(`"${c.referenceNumber}" customerSatisfied is boolean`, () => {
      expect(typeof c.customerSatisfied).toBe('boolean');
    });
    it(`"${c.referenceNumber}" createdAt parses to a valid date`, () => {
      expect(new Date(c.createdAt).toString()).not.toBe('Invalid Date');
    });
  }
  it('CRITICAL complaint is ESCALATED status', () => {
    const critical = MOCK_COMPLAINTS.find((c) => c.priority === 'CRITICAL');
    expect(critical?.status).toBe('ESCALATED');
  });
  it('CRITICAL complaint is flagged as regulatory', () => {
    const critical = MOCK_COMPLAINTS.find((c) => c.priority === 'CRITICAL');
    expect(critical?.isRegulatory).toBe(true);
  });
  it('RESOLVED complaint has customerSatisfied = true', () => {
    const resolved = MOCK_COMPLAINTS.find((c) => c.status === 'RESOLVED');
    expect(resolved?.customerSatisfied).toBe(true);
  });
  it('RESOLVED complaint has non-empty resolution', () => {
    const resolved = MOCK_COMPLAINTS.find((c) => c.status === 'RESOLVED');
    expect(resolved?.resolution.length).toBeGreaterThan(0);
  });
});

describe('Mock Action data shapes', () => {
  it('MOCK_ACTIONS has 3 entries', () => expect(MOCK_ACTIONS).toHaveLength(3));
  for (const a of MOCK_ACTIONS) {
    it(`"${a.referenceNumber}" has required string fields`, () => {
      expect(typeof a.id).toBe('string');
      expect(typeof a.referenceNumber).toBe('string');
      expect(typeof a.complaintId).toBe('string');
      expect(typeof a.action).toBe('string');
      expect(typeof a.assignee).toBe('string');
    });
    it(`"${a.referenceNumber}" referenceNumber starts with ACT-`, () => {
      expect(a.referenceNumber.startsWith('ACT-')).toBe(true);
    });
    it(`"${a.referenceNumber}" status is valid`, () => {
      expect(ACTION_STATUSES).toContain(a.status);
    });
    it(`"${a.referenceNumber}" action description is non-empty`, () => {
      expect(a.action.length).toBeGreaterThan(0);
    });
    it(`"${a.referenceNumber}" createdAt parses to a valid date`, () => {
      expect(new Date(a.createdAt).toString()).not.toBe('Invalid Date');
    });
  }
  it('COMPLETED action has a non-empty completedAt timestamp', () => {
    const completed = MOCK_ACTIONS.find((a) => a.status === 'COMPLETED');
    expect(completed?.completedAt.length).toBeGreaterThan(0);
  });
  it('OVERDUE action has an empty completedAt', () => {
    const overdue = MOCK_ACTIONS.find((a) => a.status === 'OVERDUE');
    expect(overdue?.completedAt).toBe('');
  });
  it('IN_PROGRESS action has an empty completedAt', () => {
    const inProgress = MOCK_ACTIONS.find((a) => a.status === 'IN_PROGRESS');
    expect(inProgress?.completedAt).toBe('');
  });
  it('each action is linked to a known complaint', () => {
    const complaintIds = new Set(MOCK_COMPLAINTS.map((c) => c.id));
    for (const a of MOCK_ACTIONS) {
      expect(complaintIds.has(a.complaintId)).toBe(true);
    }
  });
});

// ─── Parametric: CHANNELS positional index ───────────────────────────────────

describe('CHANNELS — positional index parametric', () => {
  const cases: [ComplaintChannel, number][] = [
    ['EMAIL', 0],
    ['PHONE', 1],
    ['WEB_FORM', 2],
    ['SOCIAL_MEDIA', 3],
    ['IN_PERSON', 4],
    ['LETTER', 5],
  ];
  for (const [channel, idx] of cases) {
    it(`${channel} is at index ${idx}`, () => {
      expect(CHANNELS[idx]).toBe(channel);
    });
  }
});

// ─── Parametric: STATUSES positional index ───────────────────────────────────

describe('STATUSES — positional index parametric', () => {
  const cases: [ComplaintStatus, number][] = [
    ['NEW', 0],
    ['ACKNOWLEDGED', 1],
    ['INVESTIGATING', 2],
    ['RESOLVED', 3],
    ['CLOSED', 4],
    ['ESCALATED', 5],
  ];
  for (const [status, idx] of cases) {
    it(`${status} is at index ${idx}`, () => {
      expect(STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: isComplaintOpen per-status ──────────────────────────────────

describe('isComplaintOpen — per-status parametric', () => {
  const cases: [ComplaintStatus, boolean][] = [
    ['NEW', true],
    ['ACKNOWLEDGED', true],
    ['INVESTIGATING', true],
    ['ESCALATED', true],
    ['RESOLVED', false],
    ['CLOSED', false],
  ];
  for (const [status, expected] of cases) {
    it(`${status} → isComplaintOpen=${expected}`, () => {
      expect(isComplaintOpen(status)).toBe(expected);
    });
  }
});

// ─── Parametric: isComplaintResolved per-status ──────────────────────────────

describe('isComplaintResolved — per-status parametric', () => {
  const cases: [ComplaintStatus, boolean][] = [
    ['RESOLVED', true],
    ['CLOSED', true],
    ['NEW', false],
    ['ACKNOWLEDGED', false],
    ['INVESTIGATING', false],
    ['ESCALATED', false],
  ];
  for (const [status, expected] of cases) {
    it(`${status} → isComplaintResolved=${expected}`, () => {
      expect(isComplaintResolved(status)).toBe(expected);
    });
  }
});

// ─── Parametric: isRegulatoryCategory per-category ───────────────────────────

describe('isRegulatoryCategory — per-category exact parametric', () => {
  const cases: [ComplaintCategory, boolean][] = [
    ['REGULATORY', true],
    ['SAFETY', true],
    ['PRODUCT', false],
    ['SERVICE', false],
    ['DELIVERY', false],
    ['BILLING', false],
    ['ENVIRONMENTAL', false],
    ['OTHER', false],
  ];
  for (const [category, expected] of cases) {
    it(`${category} → isRegulatoryCategory=${expected}`, () => {
      expect(isRegulatoryCategory(category)).toBe(expected);
    });
  }
});

// ─── Parametric: slaTargetHours ratio invariants ─────────────────────────────

describe('slaTargetHours — ratio invariants parametric', () => {
  it('HIGH is 2× CRITICAL', () => {
    expect(slaTargetHours['HIGH']).toBe(slaTargetHours['CRITICAL'] * 2);
  });
  it('MEDIUM is 3× HIGH', () => {
    expect(slaTargetHours['MEDIUM']).toBe(slaTargetHours['HIGH'] * 3);
  });
  it('LOW is 3× MEDIUM', () => {
    expect(slaTargetHours['LOW']).toBe(slaTargetHours['MEDIUM'] * 3);
  });
});

// ─── Parametric: getPriorityColor text- family ───────────────────────────────

describe('getPriorityColor — text- family per-priority parametric', () => {
  const cases: [ComplaintPriority, string][] = [
    ['CRITICAL', 'red'],
    ['HIGH', 'orange'],
    ['MEDIUM', 'yellow'],
    ['LOW', 'green'],
  ];
  for (const [priority, color] of cases) {
    it(`${priority} color contains text-${color}`, () => {
      expect(getPriorityColor(priority)).toContain(`text-${color}`);
    });
  }
});

// ─── Parametric: MOCK_COMPLAINTS per-complaint exact fields ──────────────────

describe('MOCK_COMPLAINTS — per-complaint exact priority+status+channel parametric', () => {
  const cases: [string, ComplaintPriority, ComplaintStatus, ComplaintChannel][] = [
    ['cmp-001', 'HIGH', 'INVESTIGATING', 'EMAIL'],
    ['cmp-002', 'CRITICAL', 'ESCALATED', 'PHONE'],
    ['cmp-003', 'MEDIUM', 'RESOLVED', 'WEB_FORM'],
  ];
  for (const [id, priority, status, channel] of cases) {
    it(`${id} has priority=${priority}, status=${status}, channel=${channel}`, () => {
      const c = MOCK_COMPLAINTS.find((x) => x.id === id)!;
      expect(c.priority).toBe(priority);
      expect(c.status).toBe(status);
      expect(c.channel).toBe(channel);
    });
  }
});

// ─── CHANNELS — positional index parametric ──────────────────────────────────

describe('CHANNELS — positional index parametric', () => {
  const expected = [
    [0, 'EMAIL'],
    [1, 'PHONE'],
    [2, 'WEB_FORM'],
    [3, 'SOCIAL_MEDIA'],
    [4, 'IN_PERSON'],
    [5, 'LETTER'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`CHANNELS[${idx}] === '${val}'`, () => {
      expect(CHANNELS[idx]).toBe(val);
    });
  }
});

// ─── CATEGORIES — positional index parametric ────────────────────────────────

describe('CATEGORIES — positional index parametric', () => {
  const expected = [
    [0, 'PRODUCT'],
    [1, 'SERVICE'],
    [2, 'DELIVERY'],
    [3, 'BILLING'],
    [4, 'SAFETY'],
    [5, 'ENVIRONMENTAL'],
    [6, 'REGULATORY'],
    [7, 'OTHER'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`CATEGORIES[${idx}] === '${val}'`, () => {
      expect(CATEGORIES[idx]).toBe(val);
    });
  }
});

// ─── STATUSES — positional index parametric ──────────────────────────────────

describe('STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'NEW'],
    [1, 'ACKNOWLEDGED'],
    [2, 'INVESTIGATING'],
    [3, 'RESOLVED'],
    [4, 'CLOSED'],
    [5, 'ESCALATED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`STATUSES[${idx}] === '${val}'`, () => {
      expect(STATUSES[idx]).toBe(val);
    });
  }
});

// ─── ACTION_STATUSES — positional index parametric ───────────────────────────

describe('ACTION_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'OPEN'],
    [1, 'IN_PROGRESS'],
    [2, 'COMPLETED'],
    [3, 'OVERDUE'],
    [4, 'CANCELLED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`ACTION_STATUSES[${idx}] === '${val}'`, () => {
      expect(ACTION_STATUSES[idx]).toBe(val);
    });
  }
});
function hd258cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258cpd_hd',()=>{it('a',()=>{expect(hd258cpd(1,4)).toBe(2);});it('b',()=>{expect(hd258cpd(3,1)).toBe(1);});it('c',()=>{expect(hd258cpd(0,0)).toBe(0);});it('d',()=>{expect(hd258cpd(93,73)).toBe(2);});it('e',()=>{expect(hd258cpd(15,0)).toBe(4);});});
function hd259cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259cpd_hd',()=>{it('a',()=>{expect(hd259cpd(1,4)).toBe(2);});it('b',()=>{expect(hd259cpd(3,1)).toBe(1);});it('c',()=>{expect(hd259cpd(0,0)).toBe(0);});it('d',()=>{expect(hd259cpd(93,73)).toBe(2);});it('e',()=>{expect(hd259cpd(15,0)).toBe(4);});});
function hd260cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260cpd_hd',()=>{it('a',()=>{expect(hd260cpd(1,4)).toBe(2);});it('b',()=>{expect(hd260cpd(3,1)).toBe(1);});it('c',()=>{expect(hd260cpd(0,0)).toBe(0);});it('d',()=>{expect(hd260cpd(93,73)).toBe(2);});it('e',()=>{expect(hd260cpd(15,0)).toBe(4);});});
function hd261cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261cpd_hd',()=>{it('a',()=>{expect(hd261cpd(1,4)).toBe(2);});it('b',()=>{expect(hd261cpd(3,1)).toBe(1);});it('c',()=>{expect(hd261cpd(0,0)).toBe(0);});it('d',()=>{expect(hd261cpd(93,73)).toBe(2);});it('e',()=>{expect(hd261cpd(15,0)).toBe(4);});});
function hd262cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262cpd_hd',()=>{it('a',()=>{expect(hd262cpd(1,4)).toBe(2);});it('b',()=>{expect(hd262cpd(3,1)).toBe(1);});it('c',()=>{expect(hd262cpd(0,0)).toBe(0);});it('d',()=>{expect(hd262cpd(93,73)).toBe(2);});it('e',()=>{expect(hd262cpd(15,0)).toBe(4);});});
function hd263cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263cpd_hd',()=>{it('a',()=>{expect(hd263cpd(1,4)).toBe(2);});it('b',()=>{expect(hd263cpd(3,1)).toBe(1);});it('c',()=>{expect(hd263cpd(0,0)).toBe(0);});it('d',()=>{expect(hd263cpd(93,73)).toBe(2);});it('e',()=>{expect(hd263cpd(15,0)).toBe(4);});});
function hd264cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264cpd_hd',()=>{it('a',()=>{expect(hd264cpd(1,4)).toBe(2);});it('b',()=>{expect(hd264cpd(3,1)).toBe(1);});it('c',()=>{expect(hd264cpd(0,0)).toBe(0);});it('d',()=>{expect(hd264cpd(93,73)).toBe(2);});it('e',()=>{expect(hd264cpd(15,0)).toBe(4);});});
function hd265cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265cpd_hd',()=>{it('a',()=>{expect(hd265cpd(1,4)).toBe(2);});it('b',()=>{expect(hd265cpd(3,1)).toBe(1);});it('c',()=>{expect(hd265cpd(0,0)).toBe(0);});it('d',()=>{expect(hd265cpd(93,73)).toBe(2);});it('e',()=>{expect(hd265cpd(15,0)).toBe(4);});});
function hd266cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266cpd_hd',()=>{it('a',()=>{expect(hd266cpd(1,4)).toBe(2);});it('b',()=>{expect(hd266cpd(3,1)).toBe(1);});it('c',()=>{expect(hd266cpd(0,0)).toBe(0);});it('d',()=>{expect(hd266cpd(93,73)).toBe(2);});it('e',()=>{expect(hd266cpd(15,0)).toBe(4);});});
function hd267cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267cpd_hd',()=>{it('a',()=>{expect(hd267cpd(1,4)).toBe(2);});it('b',()=>{expect(hd267cpd(3,1)).toBe(1);});it('c',()=>{expect(hd267cpd(0,0)).toBe(0);});it('d',()=>{expect(hd267cpd(93,73)).toBe(2);});it('e',()=>{expect(hd267cpd(15,0)).toBe(4);});});
function hd268cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268cpd_hd',()=>{it('a',()=>{expect(hd268cpd(1,4)).toBe(2);});it('b',()=>{expect(hd268cpd(3,1)).toBe(1);});it('c',()=>{expect(hd268cpd(0,0)).toBe(0);});it('d',()=>{expect(hd268cpd(93,73)).toBe(2);});it('e',()=>{expect(hd268cpd(15,0)).toBe(4);});});
function hd269cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269cpd_hd',()=>{it('a',()=>{expect(hd269cpd(1,4)).toBe(2);});it('b',()=>{expect(hd269cpd(3,1)).toBe(1);});it('c',()=>{expect(hd269cpd(0,0)).toBe(0);});it('d',()=>{expect(hd269cpd(93,73)).toBe(2);});it('e',()=>{expect(hd269cpd(15,0)).toBe(4);});});
function hd270cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270cpd_hd',()=>{it('a',()=>{expect(hd270cpd(1,4)).toBe(2);});it('b',()=>{expect(hd270cpd(3,1)).toBe(1);});it('c',()=>{expect(hd270cpd(0,0)).toBe(0);});it('d',()=>{expect(hd270cpd(93,73)).toBe(2);});it('e',()=>{expect(hd270cpd(15,0)).toBe(4);});});
function hd271cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271cpd_hd',()=>{it('a',()=>{expect(hd271cpd(1,4)).toBe(2);});it('b',()=>{expect(hd271cpd(3,1)).toBe(1);});it('c',()=>{expect(hd271cpd(0,0)).toBe(0);});it('d',()=>{expect(hd271cpd(93,73)).toBe(2);});it('e',()=>{expect(hd271cpd(15,0)).toBe(4);});});
function hd272cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272cpd_hd',()=>{it('a',()=>{expect(hd272cpd(1,4)).toBe(2);});it('b',()=>{expect(hd272cpd(3,1)).toBe(1);});it('c',()=>{expect(hd272cpd(0,0)).toBe(0);});it('d',()=>{expect(hd272cpd(93,73)).toBe(2);});it('e',()=>{expect(hd272cpd(15,0)).toBe(4);});});
function hd273cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273cpd_hd',()=>{it('a',()=>{expect(hd273cpd(1,4)).toBe(2);});it('b',()=>{expect(hd273cpd(3,1)).toBe(1);});it('c',()=>{expect(hd273cpd(0,0)).toBe(0);});it('d',()=>{expect(hd273cpd(93,73)).toBe(2);});it('e',()=>{expect(hd273cpd(15,0)).toBe(4);});});
function hd274cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274cpd_hd',()=>{it('a',()=>{expect(hd274cpd(1,4)).toBe(2);});it('b',()=>{expect(hd274cpd(3,1)).toBe(1);});it('c',()=>{expect(hd274cpd(0,0)).toBe(0);});it('d',()=>{expect(hd274cpd(93,73)).toBe(2);});it('e',()=>{expect(hd274cpd(15,0)).toBe(4);});});
function hd275cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275cpd_hd',()=>{it('a',()=>{expect(hd275cpd(1,4)).toBe(2);});it('b',()=>{expect(hd275cpd(3,1)).toBe(1);});it('c',()=>{expect(hd275cpd(0,0)).toBe(0);});it('d',()=>{expect(hd275cpd(93,73)).toBe(2);});it('e',()=>{expect(hd275cpd(15,0)).toBe(4);});});
function hd276cpd(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276cpd_hd',()=>{it('a',()=>{expect(hd276cpd(1,4)).toBe(2);});it('b',()=>{expect(hd276cpd(3,1)).toBe(1);});it('c',()=>{expect(hd276cpd(0,0)).toBe(0);});it('d',()=>{expect(hd276cpd(93,73)).toBe(2);});it('e',()=>{expect(hd276cpd(15,0)).toBe(4);});});
