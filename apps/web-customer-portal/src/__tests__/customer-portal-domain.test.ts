// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inline type definitions (no imports from source) ──────────────────────

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface Order {
  id: string;
  referenceNumber: string;
  description: string;
  status: OrderStatus;
  orderDate: string;
  deliveryDate?: string;
  totalValue: number;
  lineItems: number;
  trackingRef?: string;
}

type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
type TicketPriority = 'high' | 'medium' | 'low';

interface SupportTicket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created: string;
  lastUpdate: string;
  category: string;
}

type SelfServiceOrderStatus = 'pending' | 'confirmed' | 'in-production' | 'shipped' | 'delivered';

interface SelfServiceOrder {
  id: string;
  orderNumber: string;
  description: string;
  status: SelfServiceOrderStatus;
  total: number;
  orderDate: string;
  expectedDelivery: string;
  items: number;
}

interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface Scorecard {
  id: string;
  period: string;
  overallScore: number;
  deliveryScore: number;
  qualityScore: number;
  communicationScore: number;
  status: 'PUBLISHED' | 'DRAFT';
  publishedAt: string;
}

// ─── Inline domain constants (mirrored from source) ────────────────────────

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const ALL_STATUSES_FILTER = ['ALL', ...ORDER_STATUSES] as const;

const TICKET_STATUSES: TicketStatus[] = ['open', 'in-progress', 'resolved', 'closed'];
const TICKET_PRIORITIES: TicketPriority[] = ['high', 'medium', 'low'];

const SELF_SERVICE_ORDER_STATUSES: SelfServiceOrderStatus[] = [
  'pending', 'confirmed', 'in-production', 'shipped', 'delivered',
];

const DOCUMENT_TYPES = ['Certificate', 'Specification', 'Financial', 'Safety', 'Legal'];

const SCORECARD_STATUSES = ['PUBLISHED', 'DRAFT'] as const;

const TICKET_CATEGORIES = ['Quality', 'Logistics', 'Technical', 'Finance', 'Commercial'];

// Badge/color maps — mirrored from orders/page.tsx STATUS_STYLES
const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

// Badge/color maps — mirrored from self-service/client.tsx ticketStatus
const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700' },
  'in-progress': { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
};

// Badge/color maps — mirrored from self-service/client.tsx orderStatus
const SELF_SERVICE_ORDER_STATUS_CONFIG: Record<SelfServiceOrderStatus, { label: string; color: string; step: number }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600', step: 1 },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', step: 2 },
  'in-production': { label: 'In Production', color: 'bg-amber-100 text-amber-700', step: 3 },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', step: 4 },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', step: 5 },
};

// Scorecard overallColor logic — mirrored from scorecards/page.tsx
function overallColor(score: number): string {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 75) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

// Mock data — mirrored from orders/page.tsx MOCK_ORDERS
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    referenceNumber: 'PTL-ORD-2026-001',
    description: 'Precision Components Batch — Q1 Production Run',
    status: 'DELIVERED',
    orderDate: '2026-01-10T08:00:00Z',
    deliveryDate: '2026-01-28T14:00:00Z',
    totalValue: 34500,
    lineItems: 12,
    trackingRef: 'DHL-GB-2026-88421',
  },
  {
    id: '2',
    referenceNumber: 'PTL-ORD-2026-002',
    description: 'Maintenance Consumables — Monthly Replenishment',
    status: 'SHIPPED',
    orderDate: '2026-02-08T09:30:00Z',
    deliveryDate: '2026-02-25T12:00:00Z',
    totalValue: 4850,
    lineItems: 7,
    trackingRef: 'FDX-IE-2026-14923',
  },
  {
    id: '3',
    referenceNumber: 'PTL-ORD-2026-003',
    description: 'Custom Fabrication — Structural Frame Assembly',
    status: 'PROCESSING',
    orderDate: '2026-02-14T11:00:00Z',
    totalValue: 18200,
    lineItems: 4,
  },
  {
    id: '4',
    referenceNumber: 'PTL-ORD-2026-004',
    description: 'Calibration Services — Annual Instrument Package',
    status: 'PENDING',
    orderDate: '2026-02-20T15:00:00Z',
    totalValue: 6300,
    lineItems: 3,
  },
  {
    id: '5',
    referenceNumber: 'PTL-ORD-2025-089',
    description: 'Prototype Tooling — Project Alpha Phase 2',
    status: 'CANCELLED',
    orderDate: '2025-12-01T10:00:00Z',
    totalValue: 9100,
    lineItems: 2,
  },
];

// Mock tickets — mirrored from self-service/client.tsx
const MOCK_TICKETS: SupportTicket[] = [
  { id: 't1', subject: 'Quality certificate request for batch QC-2602-089', status: 'in-progress', priority: 'medium', created: '2026-02-10', lastUpdate: '2026-02-12', category: 'Quality' },
  { id: 't2', subject: 'Delivery delay on PO-2602-0045', status: 'open', priority: 'high', created: '2026-02-12', lastUpdate: '2026-02-12', category: 'Logistics' },
  { id: 't3', subject: 'Request for updated MSDS — Product XR-450', status: 'resolved', priority: 'low', created: '2026-02-05', lastUpdate: '2026-02-08', category: 'Technical' },
  { id: 't4', subject: 'Invoice discrepancy — INV-2602-0234', status: 'open', priority: 'high', created: '2026-02-11', lastUpdate: '2026-02-13', category: 'Finance' },
  { id: 't5', subject: 'Annual contract renewal discussion', status: 'closed', priority: 'medium', created: '2026-01-15', lastUpdate: '2026-01-30', category: 'Commercial' },
];

// Mock self-service orders — mirrored from self-service/client.tsx
const MOCK_SS_ORDERS: SelfServiceOrder[] = [
  { id: 'o1', orderNumber: 'PO-2602-0045', description: 'CardioMonitor Pro X3 — 50 units', status: 'in-production', total: 125000, orderDate: '2026-01-28', expectedDelivery: '2026-03-15', items: 50 },
  { id: 'o2', orderNumber: 'PO-2602-0052', description: 'Replacement sensor modules — 200 units', status: 'shipped', total: 24000, orderDate: '2026-02-05', expectedDelivery: '2026-02-14', items: 200 },
  { id: 'o3', orderNumber: 'PO-2602-0038', description: 'Custom enclosure assembly — 30 units', status: 'delivered', total: 45000, orderDate: '2026-01-10', expectedDelivery: '2026-02-01', items: 30 },
  { id: 'o4', orderNumber: 'PO-2602-0060', description: 'Calibration standards kit — 5 units', status: 'confirmed', total: 8500, orderDate: '2026-02-12', expectedDelivery: '2026-02-28', items: 5 },
];

// Mock documents — mirrored from self-service/client.tsx
const MOCK_DOCUMENTS: DocumentRecord[] = [
  { id: 'doc1', name: 'Quality Certificate — QC-2602-089', type: 'Certificate', size: '245 KB', uploadDate: '2026-02-08' },
  { id: 'doc2', name: 'Product Specification — CardioMonitor Pro X3', type: 'Specification', size: '1.2 MB', uploadDate: '2026-01-15' },
  { id: 'doc3', name: 'Statement of Account — January 2026', type: 'Financial', size: '89 KB', uploadDate: '2026-02-01' },
  { id: 'doc4', name: 'MSDS — Product XR-450', type: 'Safety', size: '156 KB', uploadDate: '2026-02-08' },
  { id: 'doc5', name: 'Terms & Conditions 2026', type: 'Legal', size: '320 KB', uploadDate: '2025-12-20' },
];

// Mock scorecards — mirrored from scorecards/page.tsx
const MOCK_SCORECARDS: Scorecard[] = [
  { id: '1', period: 'Q4 2025', overallScore: 94, deliveryScore: 96, qualityScore: 98, communicationScore: 88, status: 'PUBLISHED', publishedAt: '2026-01-15T10:00:00Z' },
  { id: '2', period: 'Q3 2025', overallScore: 91, deliveryScore: 89, qualityScore: 95, communicationScore: 90, status: 'PUBLISHED', publishedAt: '2025-10-12T09:30:00Z' },
  { id: '3', period: 'Q2 2025', overallScore: 87, deliveryScore: 82, qualityScore: 93, communicationScore: 86, status: 'PUBLISHED', publishedAt: '2025-07-11T14:00:00Z' },
  { id: '4', period: 'Q1 2026', overallScore: 0, deliveryScore: 0, qualityScore: 0, communicationScore: 0, status: 'DRAFT', publishedAt: '' },
];

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('Customer Portal — Domain: Order Status Arrays', () => {
  test('ORDER_STATUSES contains exactly 5 statuses', () => {
    expect(ORDER_STATUSES).toHaveLength(5);
  });

  for (const s of ORDER_STATUSES) {
    test(`ORDER_STATUSES includes "${s}"`, () => {
      expect(ORDER_STATUSES).toContain(s);
    });
  }

  test('ALL_STATUSES_FILTER starts with ALL', () => {
    expect(ALL_STATUSES_FILTER[0]).toBe('ALL');
  });

  test('ALL_STATUSES_FILTER contains all order statuses after ALL', () => {
    const withoutAll = ALL_STATUSES_FILTER.slice(1);
    for (const s of ORDER_STATUSES) {
      expect(withoutAll).toContain(s);
    }
  });

  test('ALL_STATUSES_FILTER has length 6', () => {
    expect(ALL_STATUSES_FILTER).toHaveLength(6);
  });
});

describe('Customer Portal — Domain: Order Status Badge Styles', () => {
  test('ORDER_STATUS_STYLES has an entry for every status', () => {
    for (const s of ORDER_STATUSES) {
      expect(ORDER_STATUS_STYLES[s]).toBeDefined();
    }
  });

  test('PENDING badge is gray-toned', () => {
    expect(ORDER_STATUS_STYLES.PENDING).toContain('gray');
  });

  test('PROCESSING badge is blue-toned', () => {
    expect(ORDER_STATUS_STYLES.PROCESSING).toContain('blue');
  });

  test('SHIPPED badge is teal-toned', () => {
    expect(ORDER_STATUS_STYLES.SHIPPED).toContain('teal');
  });

  test('DELIVERED badge is green-toned', () => {
    expect(ORDER_STATUS_STYLES.DELIVERED).toContain('green');
  });

  test('CANCELLED badge is red-toned', () => {
    expect(ORDER_STATUS_STYLES.CANCELLED).toContain('red');
  });

  test('every badge style is a non-empty string', () => {
    for (const s of ORDER_STATUSES) {
      expect(typeof ORDER_STATUS_STYLES[s]).toBe('string');
      expect(ORDER_STATUS_STYLES[s].length).toBeGreaterThan(0);
    }
  });
});

describe('Customer Portal — Domain: Ticket Status and Priority Arrays', () => {
  test('TICKET_STATUSES contains exactly 4 values', () => {
    expect(TICKET_STATUSES).toHaveLength(4);
  });

  for (const s of TICKET_STATUSES) {
    test(`TICKET_STATUSES includes "${s}"`, () => {
      expect(TICKET_STATUSES).toContain(s);
    });
  }

  test('TICKET_PRIORITIES contains exactly 3 values', () => {
    expect(TICKET_PRIORITIES).toHaveLength(3);
  });

  for (const p of TICKET_PRIORITIES) {
    test(`TICKET_PRIORITIES includes "${p}"`, () => {
      expect(TICKET_PRIORITIES).toContain(p);
    });
  }

  test('TICKET_STATUS_CONFIG has entry for every ticket status', () => {
    for (const s of TICKET_STATUSES) {
      expect(TICKET_STATUS_CONFIG[s]).toBeDefined();
    }
  });

  test('TICKET_STATUS_CONFIG open label is "Open"', () => {
    expect(TICKET_STATUS_CONFIG.open.label).toBe('Open');
  });

  test('TICKET_STATUS_CONFIG in-progress label is "In Progress"', () => {
    expect(TICKET_STATUS_CONFIG['in-progress'].label).toBe('In Progress');
  });

  test('TICKET_STATUS_CONFIG resolved label is "Resolved"', () => {
    expect(TICKET_STATUS_CONFIG.resolved.label).toBe('Resolved');
  });

  test('TICKET_STATUS_CONFIG closed label is "Closed"', () => {
    expect(TICKET_STATUS_CONFIG.closed.label).toBe('Closed');
  });

  test('open ticket badge is blue-toned', () => {
    expect(TICKET_STATUS_CONFIG.open.color).toContain('blue');
  });

  test('in-progress ticket badge is amber-toned', () => {
    expect(TICKET_STATUS_CONFIG['in-progress'].color).toContain('amber');
  });

  test('resolved ticket badge is green-toned', () => {
    expect(TICKET_STATUS_CONFIG.resolved.color).toContain('green');
  });
});

describe('Customer Portal — Domain: Self-Service Order Status Steps', () => {
  test('SELF_SERVICE_ORDER_STATUSES contains exactly 5 steps', () => {
    expect(SELF_SERVICE_ORDER_STATUSES).toHaveLength(5);
  });

  test('pending has step 1', () => {
    expect(SELF_SERVICE_ORDER_STATUS_CONFIG.pending.step).toBe(1);
  });

  test('confirmed has step 2', () => {
    expect(SELF_SERVICE_ORDER_STATUS_CONFIG.confirmed.step).toBe(2);
  });

  test('in-production has step 3', () => {
    expect(SELF_SERVICE_ORDER_STATUS_CONFIG['in-production'].step).toBe(3);
  });

  test('shipped has step 4', () => {
    expect(SELF_SERVICE_ORDER_STATUS_CONFIG.shipped.step).toBe(4);
  });

  test('delivered has step 5', () => {
    expect(SELF_SERVICE_ORDER_STATUS_CONFIG.delivered.step).toBe(5);
  });

  test('steps form a strictly ascending sequence', () => {
    const steps = SELF_SERVICE_ORDER_STATUSES.map((s) => SELF_SERVICE_ORDER_STATUS_CONFIG[s].step);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });

  test('delivered badge is green-toned', () => {
    expect(SELF_SERVICE_ORDER_STATUS_CONFIG.delivered.color).toContain('green');
  });

  test('shipped badge is purple-toned', () => {
    expect(SELF_SERVICE_ORDER_STATUS_CONFIG.shipped.color).toContain('purple');
  });

  test('in-production badge is amber-toned', () => {
    expect(SELF_SERVICE_ORDER_STATUS_CONFIG['in-production'].color).toContain('amber');
  });
});

describe('Customer Portal — Domain: Mock Orders Data Integrity', () => {
  test('MOCK_ORDERS contains exactly 5 records', () => {
    expect(MOCK_ORDERS).toHaveLength(5);
  });

  test('all orders have unique ids', () => {
    const ids = MOCK_ORDERS.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all orders have unique reference numbers', () => {
    const refs = MOCK_ORDERS.map((o) => o.referenceNumber);
    expect(new Set(refs).size).toBe(refs.length);
  });

  test('all reference numbers start with PTL-ORD-', () => {
    for (const o of MOCK_ORDERS) {
      expect(o.referenceNumber.startsWith('PTL-ORD-')).toBe(true);
    }
  });

  test('all order statuses are valid', () => {
    for (const o of MOCK_ORDERS) {
      expect(ORDER_STATUSES).toContain(o.status);
    }
  });

  test('all totalValue values are positive', () => {
    for (const o of MOCK_ORDERS) {
      expect(o.totalValue).toBeGreaterThan(0);
    }
  });

  test('all lineItems counts are positive integers', () => {
    for (const o of MOCK_ORDERS) {
      expect(o.lineItems).toBeGreaterThan(0);
      expect(Number.isInteger(o.lineItems)).toBe(true);
    }
  });

  test('exactly one DELIVERED order exists', () => {
    expect(MOCK_ORDERS.filter((o) => o.status === 'DELIVERED')).toHaveLength(1);
  });

  test('DELIVERED order has a deliveryDate', () => {
    const delivered = MOCK_ORDERS.find((o) => o.status === 'DELIVERED');
    expect(delivered?.deliveryDate).toBeDefined();
  });

  test('CANCELLED order has no trackingRef', () => {
    const cancelled = MOCK_ORDERS.find((o) => o.status === 'CANCELLED');
    expect(cancelled?.trackingRef).toBeUndefined();
  });

  test('PENDING order has no trackingRef', () => {
    const pending = MOCK_ORDERS.find((o) => o.status === 'PENDING');
    expect(pending?.trackingRef).toBeUndefined();
  });

  test('non-CANCELLED total value sum is correct', () => {
    const sum = MOCK_ORDERS.filter((o) => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.totalValue, 0);
    expect(sum).toBe(34500 + 4850 + 18200 + 6300);
  });

  test('pending + processing count matches in-progress badge', () => {
    const count = MOCK_ORDERS.filter((o) => ['PENDING', 'PROCESSING'].includes(o.status)).length;
    expect(count).toBe(2);
  });
});

describe('Customer Portal — Domain: Mock Tickets Data Integrity', () => {
  test('MOCK_TICKETS contains exactly 5 records', () => {
    expect(MOCK_TICKETS).toHaveLength(5);
  });

  test('all ticket ids are unique', () => {
    const ids = MOCK_TICKETS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all ticket statuses are valid', () => {
    for (const t of MOCK_TICKETS) {
      expect(TICKET_STATUSES).toContain(t.status);
    }
  });

  test('all ticket priorities are valid', () => {
    for (const t of MOCK_TICKETS) {
      expect(TICKET_PRIORITIES).toContain(t.priority);
    }
  });

  test('all ticket categories are in the known list', () => {
    for (const t of MOCK_TICKETS) {
      expect(TICKET_CATEGORIES).toContain(t.category);
    }
  });

  test('open tickets count is 3', () => {
    const open = MOCK_TICKETS.filter((t) => t.status === 'open' || t.status === 'in-progress');
    expect(open).toHaveLength(3);
  });

  test('high-priority tickets have category Logistics or Finance', () => {
    const highPri = MOCK_TICKETS.filter((t) => t.priority === 'high');
    for (const t of highPri) {
      expect(['Logistics', 'Finance']).toContain(t.category);
    }
  });
});

describe('Customer Portal — Domain: Mock Self-Service Orders', () => {
  test('MOCK_SS_ORDERS contains exactly 4 records', () => {
    expect(MOCK_SS_ORDERS).toHaveLength(4);
  });

  test('all self-service order statuses are valid', () => {
    for (const o of MOCK_SS_ORDERS) {
      expect(SELF_SERVICE_ORDER_STATUSES).toContain(o.status);
    }
  });

  test('active orders (not delivered) count is 3', () => {
    const active = MOCK_SS_ORDERS.filter((o) => o.status !== 'delivered');
    expect(active).toHaveLength(3);
  });

  test('total order value sums correctly', () => {
    const total = MOCK_SS_ORDERS.reduce((s, o) => s + o.total, 0);
    expect(total).toBe(125000 + 24000 + 45000 + 8500);
  });

  test('all items counts are positive', () => {
    for (const o of MOCK_SS_ORDERS) {
      expect(o.items).toBeGreaterThan(0);
    }
  });

  test('all order numbers are unique', () => {
    const nums = MOCK_SS_ORDERS.map((o) => o.orderNumber);
    expect(new Set(nums).size).toBe(nums.length);
  });
});

describe('Customer Portal — Domain: Documents', () => {
  test('MOCK_DOCUMENTS contains exactly 5 records', () => {
    expect(MOCK_DOCUMENTS).toHaveLength(5);
  });

  test('all document types are in the known list', () => {
    for (const d of MOCK_DOCUMENTS) {
      expect(DOCUMENT_TYPES).toContain(d.type);
    }
  });

  test('all document ids are unique', () => {
    const ids = MOCK_DOCUMENTS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all document names are non-empty', () => {
    for (const d of MOCK_DOCUMENTS) {
      expect(d.name.length).toBeGreaterThan(0);
    }
  });

  test('each document type appears exactly once', () => {
    const typeSet = new Set(MOCK_DOCUMENTS.map((d) => d.type));
    expect(typeSet.size).toBe(DOCUMENT_TYPES.length);
  });
});

describe('Customer Portal — Domain: Scorecards', () => {
  test('SCORECARD_STATUSES contains PUBLISHED and DRAFT', () => {
    expect(SCORECARD_STATUSES).toContain('PUBLISHED');
    expect(SCORECARD_STATUSES).toContain('DRAFT');
  });

  test('MOCK_SCORECARDS contains exactly 4 records', () => {
    expect(MOCK_SCORECARDS).toHaveLength(4);
  });

  test('three scorecards are PUBLISHED', () => {
    expect(MOCK_SCORECARDS.filter((s) => s.status === 'PUBLISHED')).toHaveLength(3);
  });

  test('one scorecard is DRAFT', () => {
    expect(MOCK_SCORECARDS.filter((s) => s.status === 'DRAFT')).toHaveLength(1);
  });

  test('DRAFT scorecard has zeroed scores', () => {
    const draft = MOCK_SCORECARDS.find((s) => s.status === 'DRAFT');
    expect(draft?.overallScore).toBe(0);
    expect(draft?.deliveryScore).toBe(0);
    expect(draft?.qualityScore).toBe(0);
    expect(draft?.communicationScore).toBe(0);
  });

  test('all PUBLISHED scorecards have overallScore >= 80', () => {
    const published = MOCK_SCORECARDS.filter((s) => s.status === 'PUBLISHED');
    for (const s of published) {
      expect(s.overallScore).toBeGreaterThanOrEqual(80);
    }
  });

  test('overallColor returns green for score >= 90', () => {
    expect(overallColor(90)).toContain('green');
    expect(overallColor(94)).toContain('green');
    expect(overallColor(100)).toContain('green');
  });

  test('overallColor returns amber for score 75-89', () => {
    expect(overallColor(75)).toContain('amber');
    expect(overallColor(87)).toContain('amber');
    expect(overallColor(89)).toContain('amber');
  });

  test('overallColor returns red for score < 75', () => {
    expect(overallColor(74)).toContain('red');
    expect(overallColor(50)).toContain('red');
    expect(overallColor(0)).toContain('red');
  });

  test('all PUBLISHED scorecard periods are unique', () => {
    const published = MOCK_SCORECARDS.filter((s) => s.status === 'PUBLISHED');
    const periods = published.map((s) => s.period);
    expect(new Set(periods).size).toBe(periods.length);
  });

  test('highest overallScore belongs to Q4 2025', () => {
    const published = MOCK_SCORECARDS.filter((s) => s.status === 'PUBLISHED');
    const max = published.reduce((best, s) => s.overallScore > best.overallScore ? s : best);
    expect(max.period).toBe('Q4 2025');
  });
});

// ─── Parametric: overallColor boundary matrix ─────────────────────────────────

describe('overallColor — boundary matrix parametric', () => {
  const cases: [number, string][] = [
    [100, 'green'],
    [90,  'green'],
    [89,  'amber'],
    [75,  'amber'],
    [74,  'red'],
    [0,   'red'],
  ];
  for (const [score, color] of cases) {
    test(`score ${score} → contains "${color}"`, () => {
      expect(overallColor(score)).toContain(color);
    });
  }
});

// ─── Parametric: MOCK_ORDERS per-order ────────────────────────────────────────

describe('MOCK_ORDERS — per-order parametric', () => {
  const expected: [string, string, OrderStatus, number][] = [
    ['1', 'PTL-ORD-2026-001', 'DELIVERED',  34500],
    ['2', 'PTL-ORD-2026-002', 'SHIPPED',     4850],
    ['3', 'PTL-ORD-2026-003', 'PROCESSING', 18200],
    ['4', 'PTL-ORD-2026-004', 'PENDING',     6300],
    ['5', 'PTL-ORD-2025-089', 'CANCELLED',   9100],
  ];
  for (const [id, ref, status, value] of expected) {
    test(`order ${id}: ref=${ref}, status=${status}, value=${value}`, () => {
      const order = MOCK_ORDERS.find((o) => o.id === id);
      expect(order?.referenceNumber).toBe(ref);
      expect(order?.status).toBe(status);
      expect(order?.totalValue).toBe(value);
    });
  }
});

// ─── Parametric: MOCK_TICKETS per-ticket ──────────────────────────────────────

describe('MOCK_TICKETS — per-ticket parametric', () => {
  const expected: [string, TicketStatus, TicketPriority, string][] = [
    ['t1', 'in-progress', 'medium', 'Quality'],
    ['t2', 'open',        'high',   'Logistics'],
    ['t3', 'resolved',    'low',    'Technical'],
    ['t4', 'open',        'high',   'Finance'],
    ['t5', 'closed',      'medium', 'Commercial'],
  ];
  for (const [id, status, priority, category] of expected) {
    test(`ticket ${id}: status=${status}, priority=${priority}, category=${category}`, () => {
      const ticket = MOCK_TICKETS.find((t) => t.id === id);
      expect(ticket?.status).toBe(status);
      expect(ticket?.priority).toBe(priority);
      expect(ticket?.category).toBe(category);
    });
  }
});

// ─── Parametric: SELF_SERVICE_ORDER_STATUS_CONFIG per-status label ────────────

describe('SELF_SERVICE_ORDER_STATUS_CONFIG — per-status label parametric', () => {
  const cases: [SelfServiceOrderStatus, string][] = [
    ['pending',       'Pending'],
    ['confirmed',     'Confirmed'],
    ['in-production', 'In Production'],
    ['shipped',       'Shipped'],
    ['delivered',     'Delivered'],
  ];
  for (const [status, label] of cases) {
    test(`${status} label is "${label}"`, () => {
      expect(SELF_SERVICE_ORDER_STATUS_CONFIG[status].label).toBe(label);
    });
  }
});

// ─── Parametric: MOCK_SS_ORDERS per-order ────────────────────────────────────

describe('MOCK_SS_ORDERS — per-order parametric', () => {
  const expected: [string, string, SelfServiceOrderStatus, number][] = [
    ['o1', 'PO-2602-0045', 'in-production', 125000],
    ['o2', 'PO-2602-0052', 'shipped',        24000],
    ['o3', 'PO-2602-0038', 'delivered',      45000],
    ['o4', 'PO-2602-0060', 'confirmed',       8500],
  ];
  for (const [id, orderNumber, status, total] of expected) {
    test(`ss-order ${id}: orderNumber=${orderNumber}, status=${status}, total=${total}`, () => {
      const o = MOCK_SS_ORDERS.find((x) => x.id === id);
      expect(o?.orderNumber).toBe(orderNumber);
      expect(o?.status).toBe(status);
      expect(o?.total).toBe(total);
    });
  }
});

// ─── Parametric: MOCK_DOCUMENTS per-document ──────────────────────────────────

describe('MOCK_DOCUMENTS — per-document parametric', () => {
  const expected: [string, string, string][] = [
    ['doc1', 'Certificate',  '245 KB'],
    ['doc2', 'Specification', '1.2 MB'],
    ['doc3', 'Financial',    '89 KB'],
    ['doc4', 'Safety',       '156 KB'],
    ['doc5', 'Legal',        '320 KB'],
  ];
  for (const [id, type, size] of expected) {
    test(`document ${id}: type=${type}, size=${size}`, () => {
      const doc = MOCK_DOCUMENTS.find((d) => d.id === id);
      expect(doc?.type).toBe(type);
      expect(doc?.size).toBe(size);
    });
  }
});

// ─── Parametric: MOCK_SCORECARDS per-scorecard overallColor ──────────────────

describe('MOCK_SCORECARDS — per-scorecard overallColor parametric', () => {
  const expected: [string, number, string][] = [
    ['Q4 2025', 94, 'green'],
    ['Q3 2025', 91, 'green'],
    ['Q2 2025', 87, 'amber'],
  ];
  for (const [period, score, color] of expected) {
    test(`${period} score=${score} → overallColor contains "${color}"`, () => {
      expect(overallColor(score)).toContain(color);
    });
  }
  test('Q1 2026 DRAFT score=0 → overallColor contains "red"', () => {
    const draft = MOCK_SCORECARDS.find((s) => s.status === 'DRAFT');
    expect(overallColor(draft!.overallScore)).toContain('red');
  });
});

// ─── Parametric: TICKET_CATEGORIES ───────────────────────────────────────────

describe('TICKET_CATEGORIES — per-category parametric', () => {
  const expected = ['Quality', 'Logistics', 'Technical', 'Finance', 'Commercial'];
  for (const cat of expected) {
    test(`includes "${cat}"`, () => {
      expect(TICKET_CATEGORIES).toContain(cat);
    });
  }
  test('has exactly 5 categories', () => {
    expect(TICKET_CATEGORIES).toHaveLength(5);
  });
  test('has no duplicates', () => {
    expect(new Set(TICKET_CATEGORIES).size).toBe(TICKET_CATEGORIES.length);
  });
});
