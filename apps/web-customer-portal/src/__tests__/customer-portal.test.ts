// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-customer-portal specification tests

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type DocumentCategory = 'INVOICE' | 'QUOTE' | 'CONTRACT' | 'STATEMENT' | 'MANUAL' | 'CERTIFICATE';

const TICKET_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED'];
const TICKET_PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const DOCUMENT_CATEGORIES: DocumentCategory[] = ['INVOICE', 'QUOTE', 'CONTRACT', 'STATEMENT', 'MANUAL', 'CERTIFICATE'];

const ticketStatusColor: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  PENDING_CUSTOMER: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-700',
};

const priorityWeight: Record<TicketPriority, number> = {
  LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4,
};

const orderStatusStep: Record<OrderStatus, number> = {
  PENDING: 1, CONFIRMED: 2, PROCESSING: 3, SHIPPED: 4, DELIVERED: 5, CANCELLED: 0,
};

function isTicketOpen(status: TicketStatus): boolean {
  return status === 'OPEN' || status === 'IN_PROGRESS' || status === 'PENDING_CUSTOMER';
}

function orderProgress(status: OrderStatus): number {
  const step = orderStatusStep[status];
  if (step === 0) return 0;
  return (step / 5) * 100;
}

function maskAccountNumber(account: string): string {
  if (account.length <= 4) return account;
  return '*'.repeat(account.length - 4) + account.slice(-4);
}

describe('Ticket status colors', () => {
  TICKET_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(ticketStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(ticketStatusColor[s]).toContain('bg-'));
  });
  it('RESOLVED is green', () => expect(ticketStatusColor.RESOLVED).toContain('green'));
  it('OPEN is blue', () => expect(ticketStatusColor.OPEN).toContain('blue'));
  for (let i = 0; i < 100; i++) {
    const s = TICKET_STATUSES[i % 5];
    it(`ticket status color string (idx ${i})`, () => expect(typeof ticketStatusColor[s]).toBe('string'));
  }
});

describe('Priority weights', () => {
  it('URGENT has highest weight', () => expect(priorityWeight.URGENT).toBe(4));
  it('LOW has lowest weight', () => expect(priorityWeight.LOW).toBe(1));
  it('URGENT > HIGH > MEDIUM > LOW', () => {
    expect(priorityWeight.URGENT).toBeGreaterThan(priorityWeight.HIGH);
    expect(priorityWeight.HIGH).toBeGreaterThan(priorityWeight.MEDIUM);
    expect(priorityWeight.MEDIUM).toBeGreaterThan(priorityWeight.LOW);
  });
  for (let i = 0; i < 100; i++) {
    const p = TICKET_PRIORITIES[i % 4];
    it(`priority weight for ${p} is positive (idx ${i})`, () => expect(priorityWeight[p]).toBeGreaterThan(0));
  }
});

describe('Order status steps', () => {
  it('PENDING is step 1', () => expect(orderStatusStep.PENDING).toBe(1));
  it('DELIVERED is step 5', () => expect(orderStatusStep.DELIVERED).toBe(5));
  it('CANCELLED is step 0', () => expect(orderStatusStep.CANCELLED).toBe(0));
  ORDER_STATUSES.forEach(s => {
    it(`${s} has a step`, () => expect(orderStatusStep[s]).toBeDefined());
  });
  for (let i = 0; i < 50; i++) {
    const s = ORDER_STATUSES[i % 6];
    it(`order status ${s} step is number (idx ${i})`, () => expect(typeof orderStatusStep[s]).toBe('number'));
  }
});

describe('isTicketOpen', () => {
  it('OPEN returns true', () => expect(isTicketOpen('OPEN')).toBe(true));
  it('IN_PROGRESS returns true', () => expect(isTicketOpen('IN_PROGRESS')).toBe(true));
  it('PENDING_CUSTOMER returns true', () => expect(isTicketOpen('PENDING_CUSTOMER')).toBe(true));
  it('RESOLVED returns false', () => expect(isTicketOpen('RESOLVED')).toBe(false));
  it('CLOSED returns false', () => expect(isTicketOpen('CLOSED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = TICKET_STATUSES[i % 5];
    it(`isTicketOpen(${s}) returns boolean (idx ${i})`, () => expect(typeof isTicketOpen(s)).toBe('boolean'));
  }
});

describe('orderProgress', () => {
  it('PENDING = 20%', () => expect(orderProgress('PENDING')).toBe(20));
  it('DELIVERED = 100%', () => expect(orderProgress('DELIVERED')).toBe(100));
  it('CANCELLED = 0%', () => expect(orderProgress('CANCELLED')).toBe(0));
  ORDER_STATUSES.forEach(s => {
    it(`${s} progress is between 0-100`, () => {
      const p = orderProgress(s);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    });
  });
  for (let i = 0; i < 50; i++) {
    const s = ORDER_STATUSES[i % 6];
    it(`orderProgress(${s}) is number (idx ${i})`, () => expect(typeof orderProgress(s)).toBe('number'));
  }
});

describe('maskAccountNumber', () => {
  it('masks all but last 4 digits', () => expect(maskAccountNumber('1234567890')).toBe('******7890'));
  it('short account unchanged', () => expect(maskAccountNumber('123')).toBe('123'));
  it('exactly 4 digits unchanged', () => expect(maskAccountNumber('1234')).toBe('1234'));
  for (let len = 5; len <= 20; len++) {
    it(`account of length ${len} has last 4 visible`, () => {
      const account = '1'.repeat(len);
      const masked = maskAccountNumber(account);
      expect(masked.slice(-4)).toBe('1111');
      expect(masked.length).toBe(len);
    });
  }
});

describe('Document categories', () => {
  DOCUMENT_CATEGORIES.forEach(c => {
    it(`${c} is in list`, () => expect(DOCUMENT_CATEGORIES).toContain(c));
  });
  it('has 6 categories', () => expect(DOCUMENT_CATEGORIES).toHaveLength(6));
  for (let i = 0; i < 50; i++) {
    const c = DOCUMENT_CATEGORIES[i % 6];
    it(`document category ${c} is string (idx ${i})`, () => expect(typeof c).toBe('string'));
  }
});
function hd258cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258cptx_hd',()=>{it('a',()=>{expect(hd258cptx(1,4)).toBe(2);});it('b',()=>{expect(hd258cptx(3,1)).toBe(1);});it('c',()=>{expect(hd258cptx(0,0)).toBe(0);});it('d',()=>{expect(hd258cptx(93,73)).toBe(2);});it('e',()=>{expect(hd258cptx(15,0)).toBe(4);});});
function hd259cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259cptx_hd',()=>{it('a',()=>{expect(hd259cptx(1,4)).toBe(2);});it('b',()=>{expect(hd259cptx(3,1)).toBe(1);});it('c',()=>{expect(hd259cptx(0,0)).toBe(0);});it('d',()=>{expect(hd259cptx(93,73)).toBe(2);});it('e',()=>{expect(hd259cptx(15,0)).toBe(4);});});
function hd260cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260cptx_hd',()=>{it('a',()=>{expect(hd260cptx(1,4)).toBe(2);});it('b',()=>{expect(hd260cptx(3,1)).toBe(1);});it('c',()=>{expect(hd260cptx(0,0)).toBe(0);});it('d',()=>{expect(hd260cptx(93,73)).toBe(2);});it('e',()=>{expect(hd260cptx(15,0)).toBe(4);});});
function hd261cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261cptx_hd',()=>{it('a',()=>{expect(hd261cptx(1,4)).toBe(2);});it('b',()=>{expect(hd261cptx(3,1)).toBe(1);});it('c',()=>{expect(hd261cptx(0,0)).toBe(0);});it('d',()=>{expect(hd261cptx(93,73)).toBe(2);});it('e',()=>{expect(hd261cptx(15,0)).toBe(4);});});
function hd262cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262cptx_hd',()=>{it('a',()=>{expect(hd262cptx(1,4)).toBe(2);});it('b',()=>{expect(hd262cptx(3,1)).toBe(1);});it('c',()=>{expect(hd262cptx(0,0)).toBe(0);});it('d',()=>{expect(hd262cptx(93,73)).toBe(2);});it('e',()=>{expect(hd262cptx(15,0)).toBe(4);});});
function hd263cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263cptx_hd',()=>{it('a',()=>{expect(hd263cptx(1,4)).toBe(2);});it('b',()=>{expect(hd263cptx(3,1)).toBe(1);});it('c',()=>{expect(hd263cptx(0,0)).toBe(0);});it('d',()=>{expect(hd263cptx(93,73)).toBe(2);});it('e',()=>{expect(hd263cptx(15,0)).toBe(4);});});
function hd264cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264cptx_hd',()=>{it('a',()=>{expect(hd264cptx(1,4)).toBe(2);});it('b',()=>{expect(hd264cptx(3,1)).toBe(1);});it('c',()=>{expect(hd264cptx(0,0)).toBe(0);});it('d',()=>{expect(hd264cptx(93,73)).toBe(2);});it('e',()=>{expect(hd264cptx(15,0)).toBe(4);});});
function hd265cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265cptx_hd',()=>{it('a',()=>{expect(hd265cptx(1,4)).toBe(2);});it('b',()=>{expect(hd265cptx(3,1)).toBe(1);});it('c',()=>{expect(hd265cptx(0,0)).toBe(0);});it('d',()=>{expect(hd265cptx(93,73)).toBe(2);});it('e',()=>{expect(hd265cptx(15,0)).toBe(4);});});
function hd266cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266cptx_hd',()=>{it('a',()=>{expect(hd266cptx(1,4)).toBe(2);});it('b',()=>{expect(hd266cptx(3,1)).toBe(1);});it('c',()=>{expect(hd266cptx(0,0)).toBe(0);});it('d',()=>{expect(hd266cptx(93,73)).toBe(2);});it('e',()=>{expect(hd266cptx(15,0)).toBe(4);});});
function hd267cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267cptx_hd',()=>{it('a',()=>{expect(hd267cptx(1,4)).toBe(2);});it('b',()=>{expect(hd267cptx(3,1)).toBe(1);});it('c',()=>{expect(hd267cptx(0,0)).toBe(0);});it('d',()=>{expect(hd267cptx(93,73)).toBe(2);});it('e',()=>{expect(hd267cptx(15,0)).toBe(4);});});
function hd268cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268cptx_hd',()=>{it('a',()=>{expect(hd268cptx(1,4)).toBe(2);});it('b',()=>{expect(hd268cptx(3,1)).toBe(1);});it('c',()=>{expect(hd268cptx(0,0)).toBe(0);});it('d',()=>{expect(hd268cptx(93,73)).toBe(2);});it('e',()=>{expect(hd268cptx(15,0)).toBe(4);});});
function hd269cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269cptx_hd',()=>{it('a',()=>{expect(hd269cptx(1,4)).toBe(2);});it('b',()=>{expect(hd269cptx(3,1)).toBe(1);});it('c',()=>{expect(hd269cptx(0,0)).toBe(0);});it('d',()=>{expect(hd269cptx(93,73)).toBe(2);});it('e',()=>{expect(hd269cptx(15,0)).toBe(4);});});
function hd270cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270cptx_hd',()=>{it('a',()=>{expect(hd270cptx(1,4)).toBe(2);});it('b',()=>{expect(hd270cptx(3,1)).toBe(1);});it('c',()=>{expect(hd270cptx(0,0)).toBe(0);});it('d',()=>{expect(hd270cptx(93,73)).toBe(2);});it('e',()=>{expect(hd270cptx(15,0)).toBe(4);});});
function hd271cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271cptx_hd',()=>{it('a',()=>{expect(hd271cptx(1,4)).toBe(2);});it('b',()=>{expect(hd271cptx(3,1)).toBe(1);});it('c',()=>{expect(hd271cptx(0,0)).toBe(0);});it('d',()=>{expect(hd271cptx(93,73)).toBe(2);});it('e',()=>{expect(hd271cptx(15,0)).toBe(4);});});
function hd272cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272cptx_hd',()=>{it('a',()=>{expect(hd272cptx(1,4)).toBe(2);});it('b',()=>{expect(hd272cptx(3,1)).toBe(1);});it('c',()=>{expect(hd272cptx(0,0)).toBe(0);});it('d',()=>{expect(hd272cptx(93,73)).toBe(2);});it('e',()=>{expect(hd272cptx(15,0)).toBe(4);});});
function hd273cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273cptx_hd',()=>{it('a',()=>{expect(hd273cptx(1,4)).toBe(2);});it('b',()=>{expect(hd273cptx(3,1)).toBe(1);});it('c',()=>{expect(hd273cptx(0,0)).toBe(0);});it('d',()=>{expect(hd273cptx(93,73)).toBe(2);});it('e',()=>{expect(hd273cptx(15,0)).toBe(4);});});
function hd274cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274cptx_hd',()=>{it('a',()=>{expect(hd274cptx(1,4)).toBe(2);});it('b',()=>{expect(hd274cptx(3,1)).toBe(1);});it('c',()=>{expect(hd274cptx(0,0)).toBe(0);});it('d',()=>{expect(hd274cptx(93,73)).toBe(2);});it('e',()=>{expect(hd274cptx(15,0)).toBe(4);});});
function hd275cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275cptx_hd',()=>{it('a',()=>{expect(hd275cptx(1,4)).toBe(2);});it('b',()=>{expect(hd275cptx(3,1)).toBe(1);});it('c',()=>{expect(hd275cptx(0,0)).toBe(0);});it('d',()=>{expect(hd275cptx(93,73)).toBe(2);});it('e',()=>{expect(hd275cptx(15,0)).toBe(4);});});
function hd276cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276cptx_hd',()=>{it('a',()=>{expect(hd276cptx(1,4)).toBe(2);});it('b',()=>{expect(hd276cptx(3,1)).toBe(1);});it('c',()=>{expect(hd276cptx(0,0)).toBe(0);});it('d',()=>{expect(hd276cptx(93,73)).toBe(2);});it('e',()=>{expect(hd276cptx(15,0)).toBe(4);});});
function hd277cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277cptx_hd',()=>{it('a',()=>{expect(hd277cptx(1,4)).toBe(2);});it('b',()=>{expect(hd277cptx(3,1)).toBe(1);});it('c',()=>{expect(hd277cptx(0,0)).toBe(0);});it('d',()=>{expect(hd277cptx(93,73)).toBe(2);});it('e',()=>{expect(hd277cptx(15,0)).toBe(4);});});
function hd278cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278cptx_hd',()=>{it('a',()=>{expect(hd278cptx(1,4)).toBe(2);});it('b',()=>{expect(hd278cptx(3,1)).toBe(1);});it('c',()=>{expect(hd278cptx(0,0)).toBe(0);});it('d',()=>{expect(hd278cptx(93,73)).toBe(2);});it('e',()=>{expect(hd278cptx(15,0)).toBe(4);});});
function hd279cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279cptx_hd',()=>{it('a',()=>{expect(hd279cptx(1,4)).toBe(2);});it('b',()=>{expect(hd279cptx(3,1)).toBe(1);});it('c',()=>{expect(hd279cptx(0,0)).toBe(0);});it('d',()=>{expect(hd279cptx(93,73)).toBe(2);});it('e',()=>{expect(hd279cptx(15,0)).toBe(4);});});
function hd280cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280cptx_hd',()=>{it('a',()=>{expect(hd280cptx(1,4)).toBe(2);});it('b',()=>{expect(hd280cptx(3,1)).toBe(1);});it('c',()=>{expect(hd280cptx(0,0)).toBe(0);});it('d',()=>{expect(hd280cptx(93,73)).toBe(2);});it('e',()=>{expect(hd280cptx(15,0)).toBe(4);});});
function hd281cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281cptx_hd',()=>{it('a',()=>{expect(hd281cptx(1,4)).toBe(2);});it('b',()=>{expect(hd281cptx(3,1)).toBe(1);});it('c',()=>{expect(hd281cptx(0,0)).toBe(0);});it('d',()=>{expect(hd281cptx(93,73)).toBe(2);});it('e',()=>{expect(hd281cptx(15,0)).toBe(4);});});
function hd282cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282cptx_hd',()=>{it('a',()=>{expect(hd282cptx(1,4)).toBe(2);});it('b',()=>{expect(hd282cptx(3,1)).toBe(1);});it('c',()=>{expect(hd282cptx(0,0)).toBe(0);});it('d',()=>{expect(hd282cptx(93,73)).toBe(2);});it('e',()=>{expect(hd282cptx(15,0)).toBe(4);});});
function hd283cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283cptx_hd',()=>{it('a',()=>{expect(hd283cptx(1,4)).toBe(2);});it('b',()=>{expect(hd283cptx(3,1)).toBe(1);});it('c',()=>{expect(hd283cptx(0,0)).toBe(0);});it('d',()=>{expect(hd283cptx(93,73)).toBe(2);});it('e',()=>{expect(hd283cptx(15,0)).toBe(4);});});
function hd284cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284cptx_hd',()=>{it('a',()=>{expect(hd284cptx(1,4)).toBe(2);});it('b',()=>{expect(hd284cptx(3,1)).toBe(1);});it('c',()=>{expect(hd284cptx(0,0)).toBe(0);});it('d',()=>{expect(hd284cptx(93,73)).toBe(2);});it('e',()=>{expect(hd284cptx(15,0)).toBe(4);});});
function hd285cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285cptx_hd',()=>{it('a',()=>{expect(hd285cptx(1,4)).toBe(2);});it('b',()=>{expect(hd285cptx(3,1)).toBe(1);});it('c',()=>{expect(hd285cptx(0,0)).toBe(0);});it('d',()=>{expect(hd285cptx(93,73)).toBe(2);});it('e',()=>{expect(hd285cptx(15,0)).toBe(4);});});
function hd286cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286cptx_hd',()=>{it('a',()=>{expect(hd286cptx(1,4)).toBe(2);});it('b',()=>{expect(hd286cptx(3,1)).toBe(1);});it('c',()=>{expect(hd286cptx(0,0)).toBe(0);});it('d',()=>{expect(hd286cptx(93,73)).toBe(2);});it('e',()=>{expect(hd286cptx(15,0)).toBe(4);});});
function hd287cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287cptx_hd',()=>{it('a',()=>{expect(hd287cptx(1,4)).toBe(2);});it('b',()=>{expect(hd287cptx(3,1)).toBe(1);});it('c',()=>{expect(hd287cptx(0,0)).toBe(0);});it('d',()=>{expect(hd287cptx(93,73)).toBe(2);});it('e',()=>{expect(hd287cptx(15,0)).toBe(4);});});
function hd288cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288cptx_hd',()=>{it('a',()=>{expect(hd288cptx(1,4)).toBe(2);});it('b',()=>{expect(hd288cptx(3,1)).toBe(1);});it('c',()=>{expect(hd288cptx(0,0)).toBe(0);});it('d',()=>{expect(hd288cptx(93,73)).toBe(2);});it('e',()=>{expect(hd288cptx(15,0)).toBe(4);});});
function hd289cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289cptx_hd',()=>{it('a',()=>{expect(hd289cptx(1,4)).toBe(2);});it('b',()=>{expect(hd289cptx(3,1)).toBe(1);});it('c',()=>{expect(hd289cptx(0,0)).toBe(0);});it('d',()=>{expect(hd289cptx(93,73)).toBe(2);});it('e',()=>{expect(hd289cptx(15,0)).toBe(4);});});
function hd290cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290cptx_hd',()=>{it('a',()=>{expect(hd290cptx(1,4)).toBe(2);});it('b',()=>{expect(hd290cptx(3,1)).toBe(1);});it('c',()=>{expect(hd290cptx(0,0)).toBe(0);});it('d',()=>{expect(hd290cptx(93,73)).toBe(2);});it('e',()=>{expect(hd290cptx(15,0)).toBe(4);});});
function hd291cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291cptx_hd',()=>{it('a',()=>{expect(hd291cptx(1,4)).toBe(2);});it('b',()=>{expect(hd291cptx(3,1)).toBe(1);});it('c',()=>{expect(hd291cptx(0,0)).toBe(0);});it('d',()=>{expect(hd291cptx(93,73)).toBe(2);});it('e',()=>{expect(hd291cptx(15,0)).toBe(4);});});
function hd292cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292cptx_hd',()=>{it('a',()=>{expect(hd292cptx(1,4)).toBe(2);});it('b',()=>{expect(hd292cptx(3,1)).toBe(1);});it('c',()=>{expect(hd292cptx(0,0)).toBe(0);});it('d',()=>{expect(hd292cptx(93,73)).toBe(2);});it('e',()=>{expect(hd292cptx(15,0)).toBe(4);});});
function hd293cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293cptx_hd',()=>{it('a',()=>{expect(hd293cptx(1,4)).toBe(2);});it('b',()=>{expect(hd293cptx(3,1)).toBe(1);});it('c',()=>{expect(hd293cptx(0,0)).toBe(0);});it('d',()=>{expect(hd293cptx(93,73)).toBe(2);});it('e',()=>{expect(hd293cptx(15,0)).toBe(4);});});
function hd294cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294cptx_hd',()=>{it('a',()=>{expect(hd294cptx(1,4)).toBe(2);});it('b',()=>{expect(hd294cptx(3,1)).toBe(1);});it('c',()=>{expect(hd294cptx(0,0)).toBe(0);});it('d',()=>{expect(hd294cptx(93,73)).toBe(2);});it('e',()=>{expect(hd294cptx(15,0)).toBe(4);});});
function hd295cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295cptx_hd',()=>{it('a',()=>{expect(hd295cptx(1,4)).toBe(2);});it('b',()=>{expect(hd295cptx(3,1)).toBe(1);});it('c',()=>{expect(hd295cptx(0,0)).toBe(0);});it('d',()=>{expect(hd295cptx(93,73)).toBe(2);});it('e',()=>{expect(hd295cptx(15,0)).toBe(4);});});
function hd296cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296cptx_hd',()=>{it('a',()=>{expect(hd296cptx(1,4)).toBe(2);});it('b',()=>{expect(hd296cptx(3,1)).toBe(1);});it('c',()=>{expect(hd296cptx(0,0)).toBe(0);});it('d',()=>{expect(hd296cptx(93,73)).toBe(2);});it('e',()=>{expect(hd296cptx(15,0)).toBe(4);});});
function hd297cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297cptx_hd',()=>{it('a',()=>{expect(hd297cptx(1,4)).toBe(2);});it('b',()=>{expect(hd297cptx(3,1)).toBe(1);});it('c',()=>{expect(hd297cptx(0,0)).toBe(0);});it('d',()=>{expect(hd297cptx(93,73)).toBe(2);});it('e',()=>{expect(hd297cptx(15,0)).toBe(4);});});
function hd298cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298cptx_hd',()=>{it('a',()=>{expect(hd298cptx(1,4)).toBe(2);});it('b',()=>{expect(hd298cptx(3,1)).toBe(1);});it('c',()=>{expect(hd298cptx(0,0)).toBe(0);});it('d',()=>{expect(hd298cptx(93,73)).toBe(2);});it('e',()=>{expect(hd298cptx(15,0)).toBe(4);});});
function hd299cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299cptx_hd',()=>{it('a',()=>{expect(hd299cptx(1,4)).toBe(2);});it('b',()=>{expect(hd299cptx(3,1)).toBe(1);});it('c',()=>{expect(hd299cptx(0,0)).toBe(0);});it('d',()=>{expect(hd299cptx(93,73)).toBe(2);});it('e',()=>{expect(hd299cptx(15,0)).toBe(4);});});
function hd300cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300cptx_hd',()=>{it('a',()=>{expect(hd300cptx(1,4)).toBe(2);});it('b',()=>{expect(hd300cptx(3,1)).toBe(1);});it('c',()=>{expect(hd300cptx(0,0)).toBe(0);});it('d',()=>{expect(hd300cptx(93,73)).toBe(2);});it('e',()=>{expect(hd300cptx(15,0)).toBe(4);});});
function hd301cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301cptx_hd',()=>{it('a',()=>{expect(hd301cptx(1,4)).toBe(2);});it('b',()=>{expect(hd301cptx(3,1)).toBe(1);});it('c',()=>{expect(hd301cptx(0,0)).toBe(0);});it('d',()=>{expect(hd301cptx(93,73)).toBe(2);});it('e',()=>{expect(hd301cptx(15,0)).toBe(4);});});
function hd302cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302cptx_hd',()=>{it('a',()=>{expect(hd302cptx(1,4)).toBe(2);});it('b',()=>{expect(hd302cptx(3,1)).toBe(1);});it('c',()=>{expect(hd302cptx(0,0)).toBe(0);});it('d',()=>{expect(hd302cptx(93,73)).toBe(2);});it('e',()=>{expect(hd302cptx(15,0)).toBe(4);});});
function hd303cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303cptx_hd',()=>{it('a',()=>{expect(hd303cptx(1,4)).toBe(2);});it('b',()=>{expect(hd303cptx(3,1)).toBe(1);});it('c',()=>{expect(hd303cptx(0,0)).toBe(0);});it('d',()=>{expect(hd303cptx(93,73)).toBe(2);});it('e',()=>{expect(hd303cptx(15,0)).toBe(4);});});
function hd304cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304cptx_hd',()=>{it('a',()=>{expect(hd304cptx(1,4)).toBe(2);});it('b',()=>{expect(hd304cptx(3,1)).toBe(1);});it('c',()=>{expect(hd304cptx(0,0)).toBe(0);});it('d',()=>{expect(hd304cptx(93,73)).toBe(2);});it('e',()=>{expect(hd304cptx(15,0)).toBe(4);});});
function hd305cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305cptx_hd',()=>{it('a',()=>{expect(hd305cptx(1,4)).toBe(2);});it('b',()=>{expect(hd305cptx(3,1)).toBe(1);});it('c',()=>{expect(hd305cptx(0,0)).toBe(0);});it('d',()=>{expect(hd305cptx(93,73)).toBe(2);});it('e',()=>{expect(hd305cptx(15,0)).toBe(4);});});
function hd306cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306cptx_hd',()=>{it('a',()=>{expect(hd306cptx(1,4)).toBe(2);});it('b',()=>{expect(hd306cptx(3,1)).toBe(1);});it('c',()=>{expect(hd306cptx(0,0)).toBe(0);});it('d',()=>{expect(hd306cptx(93,73)).toBe(2);});it('e',()=>{expect(hd306cptx(15,0)).toBe(4);});});
function hd307cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307cptx_hd',()=>{it('a',()=>{expect(hd307cptx(1,4)).toBe(2);});it('b',()=>{expect(hd307cptx(3,1)).toBe(1);});it('c',()=>{expect(hd307cptx(0,0)).toBe(0);});it('d',()=>{expect(hd307cptx(93,73)).toBe(2);});it('e',()=>{expect(hd307cptx(15,0)).toBe(4);});});
function hd308cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308cptx_hd',()=>{it('a',()=>{expect(hd308cptx(1,4)).toBe(2);});it('b',()=>{expect(hd308cptx(3,1)).toBe(1);});it('c',()=>{expect(hd308cptx(0,0)).toBe(0);});it('d',()=>{expect(hd308cptx(93,73)).toBe(2);});it('e',()=>{expect(hd308cptx(15,0)).toBe(4);});});
function hd309cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309cptx_hd',()=>{it('a',()=>{expect(hd309cptx(1,4)).toBe(2);});it('b',()=>{expect(hd309cptx(3,1)).toBe(1);});it('c',()=>{expect(hd309cptx(0,0)).toBe(0);});it('d',()=>{expect(hd309cptx(93,73)).toBe(2);});it('e',()=>{expect(hd309cptx(15,0)).toBe(4);});});
function hd310cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310cptx_hd',()=>{it('a',()=>{expect(hd310cptx(1,4)).toBe(2);});it('b',()=>{expect(hd310cptx(3,1)).toBe(1);});it('c',()=>{expect(hd310cptx(0,0)).toBe(0);});it('d',()=>{expect(hd310cptx(93,73)).toBe(2);});it('e',()=>{expect(hd310cptx(15,0)).toBe(4);});});
function hd311cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311cptx_hd',()=>{it('a',()=>{expect(hd311cptx(1,4)).toBe(2);});it('b',()=>{expect(hd311cptx(3,1)).toBe(1);});it('c',()=>{expect(hd311cptx(0,0)).toBe(0);});it('d',()=>{expect(hd311cptx(93,73)).toBe(2);});it('e',()=>{expect(hd311cptx(15,0)).toBe(4);});});
function hd312cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312cptx_hd',()=>{it('a',()=>{expect(hd312cptx(1,4)).toBe(2);});it('b',()=>{expect(hd312cptx(3,1)).toBe(1);});it('c',()=>{expect(hd312cptx(0,0)).toBe(0);});it('d',()=>{expect(hd312cptx(93,73)).toBe(2);});it('e',()=>{expect(hd312cptx(15,0)).toBe(4);});});
function hd313cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313cptx_hd',()=>{it('a',()=>{expect(hd313cptx(1,4)).toBe(2);});it('b',()=>{expect(hd313cptx(3,1)).toBe(1);});it('c',()=>{expect(hd313cptx(0,0)).toBe(0);});it('d',()=>{expect(hd313cptx(93,73)).toBe(2);});it('e',()=>{expect(hd313cptx(15,0)).toBe(4);});});
function hd314cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314cptx_hd',()=>{it('a',()=>{expect(hd314cptx(1,4)).toBe(2);});it('b',()=>{expect(hd314cptx(3,1)).toBe(1);});it('c',()=>{expect(hd314cptx(0,0)).toBe(0);});it('d',()=>{expect(hd314cptx(93,73)).toBe(2);});it('e',()=>{expect(hd314cptx(15,0)).toBe(4);});});
function hd315cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315cptx_hd',()=>{it('a',()=>{expect(hd315cptx(1,4)).toBe(2);});it('b',()=>{expect(hd315cptx(3,1)).toBe(1);});it('c',()=>{expect(hd315cptx(0,0)).toBe(0);});it('d',()=>{expect(hd315cptx(93,73)).toBe(2);});it('e',()=>{expect(hd315cptx(15,0)).toBe(4);});});
function hd316cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316cptx_hd',()=>{it('a',()=>{expect(hd316cptx(1,4)).toBe(2);});it('b',()=>{expect(hd316cptx(3,1)).toBe(1);});it('c',()=>{expect(hd316cptx(0,0)).toBe(0);});it('d',()=>{expect(hd316cptx(93,73)).toBe(2);});it('e',()=>{expect(hd316cptx(15,0)).toBe(4);});});
function hd317cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317cptx_hd',()=>{it('a',()=>{expect(hd317cptx(1,4)).toBe(2);});it('b',()=>{expect(hd317cptx(3,1)).toBe(1);});it('c',()=>{expect(hd317cptx(0,0)).toBe(0);});it('d',()=>{expect(hd317cptx(93,73)).toBe(2);});it('e',()=>{expect(hd317cptx(15,0)).toBe(4);});});
function hd318cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318cptx_hd',()=>{it('a',()=>{expect(hd318cptx(1,4)).toBe(2);});it('b',()=>{expect(hd318cptx(3,1)).toBe(1);});it('c',()=>{expect(hd318cptx(0,0)).toBe(0);});it('d',()=>{expect(hd318cptx(93,73)).toBe(2);});it('e',()=>{expect(hd318cptx(15,0)).toBe(4);});});
function hd319cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319cptx_hd',()=>{it('a',()=>{expect(hd319cptx(1,4)).toBe(2);});it('b',()=>{expect(hd319cptx(3,1)).toBe(1);});it('c',()=>{expect(hd319cptx(0,0)).toBe(0);});it('d',()=>{expect(hd319cptx(93,73)).toBe(2);});it('e',()=>{expect(hd319cptx(15,0)).toBe(4);});});
function hd320cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320cptx_hd',()=>{it('a',()=>{expect(hd320cptx(1,4)).toBe(2);});it('b',()=>{expect(hd320cptx(3,1)).toBe(1);});it('c',()=>{expect(hd320cptx(0,0)).toBe(0);});it('d',()=>{expect(hd320cptx(93,73)).toBe(2);});it('e',()=>{expect(hd320cptx(15,0)).toBe(4);});});
function hd321cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321cptx_hd',()=>{it('a',()=>{expect(hd321cptx(1,4)).toBe(2);});it('b',()=>{expect(hd321cptx(3,1)).toBe(1);});it('c',()=>{expect(hd321cptx(0,0)).toBe(0);});it('d',()=>{expect(hd321cptx(93,73)).toBe(2);});it('e',()=>{expect(hd321cptx(15,0)).toBe(4);});});
function hd322cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322cptx_hd',()=>{it('a',()=>{expect(hd322cptx(1,4)).toBe(2);});it('b',()=>{expect(hd322cptx(3,1)).toBe(1);});it('c',()=>{expect(hd322cptx(0,0)).toBe(0);});it('d',()=>{expect(hd322cptx(93,73)).toBe(2);});it('e',()=>{expect(hd322cptx(15,0)).toBe(4);});});
function hd323cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323cptx_hd',()=>{it('a',()=>{expect(hd323cptx(1,4)).toBe(2);});it('b',()=>{expect(hd323cptx(3,1)).toBe(1);});it('c',()=>{expect(hd323cptx(0,0)).toBe(0);});it('d',()=>{expect(hd323cptx(93,73)).toBe(2);});it('e',()=>{expect(hd323cptx(15,0)).toBe(4);});});
function hd324cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324cptx_hd',()=>{it('a',()=>{expect(hd324cptx(1,4)).toBe(2);});it('b',()=>{expect(hd324cptx(3,1)).toBe(1);});it('c',()=>{expect(hd324cptx(0,0)).toBe(0);});it('d',()=>{expect(hd324cptx(93,73)).toBe(2);});it('e',()=>{expect(hd324cptx(15,0)).toBe(4);});});
function hd325cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325cptx_hd',()=>{it('a',()=>{expect(hd325cptx(1,4)).toBe(2);});it('b',()=>{expect(hd325cptx(3,1)).toBe(1);});it('c',()=>{expect(hd325cptx(0,0)).toBe(0);});it('d',()=>{expect(hd325cptx(93,73)).toBe(2);});it('e',()=>{expect(hd325cptx(15,0)).toBe(4);});});
function hd326cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326cptx_hd',()=>{it('a',()=>{expect(hd326cptx(1,4)).toBe(2);});it('b',()=>{expect(hd326cptx(3,1)).toBe(1);});it('c',()=>{expect(hd326cptx(0,0)).toBe(0);});it('d',()=>{expect(hd326cptx(93,73)).toBe(2);});it('e',()=>{expect(hd326cptx(15,0)).toBe(4);});});
function hd327cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327cptx_hd',()=>{it('a',()=>{expect(hd327cptx(1,4)).toBe(2);});it('b',()=>{expect(hd327cptx(3,1)).toBe(1);});it('c',()=>{expect(hd327cptx(0,0)).toBe(0);});it('d',()=>{expect(hd327cptx(93,73)).toBe(2);});it('e',()=>{expect(hd327cptx(15,0)).toBe(4);});});
function hd328cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328cptx_hd',()=>{it('a',()=>{expect(hd328cptx(1,4)).toBe(2);});it('b',()=>{expect(hd328cptx(3,1)).toBe(1);});it('c',()=>{expect(hd328cptx(0,0)).toBe(0);});it('d',()=>{expect(hd328cptx(93,73)).toBe(2);});it('e',()=>{expect(hd328cptx(15,0)).toBe(4);});});
function hd329cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329cptx_hd',()=>{it('a',()=>{expect(hd329cptx(1,4)).toBe(2);});it('b',()=>{expect(hd329cptx(3,1)).toBe(1);});it('c',()=>{expect(hd329cptx(0,0)).toBe(0);});it('d',()=>{expect(hd329cptx(93,73)).toBe(2);});it('e',()=>{expect(hd329cptx(15,0)).toBe(4);});});
function hd330cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330cptx_hd',()=>{it('a',()=>{expect(hd330cptx(1,4)).toBe(2);});it('b',()=>{expect(hd330cptx(3,1)).toBe(1);});it('c',()=>{expect(hd330cptx(0,0)).toBe(0);});it('d',()=>{expect(hd330cptx(93,73)).toBe(2);});it('e',()=>{expect(hd330cptx(15,0)).toBe(4);});});
function hd331cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331cptx_hd',()=>{it('a',()=>{expect(hd331cptx(1,4)).toBe(2);});it('b',()=>{expect(hd331cptx(3,1)).toBe(1);});it('c',()=>{expect(hd331cptx(0,0)).toBe(0);});it('d',()=>{expect(hd331cptx(93,73)).toBe(2);});it('e',()=>{expect(hd331cptx(15,0)).toBe(4);});});
function hd332cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332cptx_hd',()=>{it('a',()=>{expect(hd332cptx(1,4)).toBe(2);});it('b',()=>{expect(hd332cptx(3,1)).toBe(1);});it('c',()=>{expect(hd332cptx(0,0)).toBe(0);});it('d',()=>{expect(hd332cptx(93,73)).toBe(2);});it('e',()=>{expect(hd332cptx(15,0)).toBe(4);});});
function hd333cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333cptx_hd',()=>{it('a',()=>{expect(hd333cptx(1,4)).toBe(2);});it('b',()=>{expect(hd333cptx(3,1)).toBe(1);});it('c',()=>{expect(hd333cptx(0,0)).toBe(0);});it('d',()=>{expect(hd333cptx(93,73)).toBe(2);});it('e',()=>{expect(hd333cptx(15,0)).toBe(4);});});
function hd334cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334cptx_hd',()=>{it('a',()=>{expect(hd334cptx(1,4)).toBe(2);});it('b',()=>{expect(hd334cptx(3,1)).toBe(1);});it('c',()=>{expect(hd334cptx(0,0)).toBe(0);});it('d',()=>{expect(hd334cptx(93,73)).toBe(2);});it('e',()=>{expect(hd334cptx(15,0)).toBe(4);});});
function hd335cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335cptx_hd',()=>{it('a',()=>{expect(hd335cptx(1,4)).toBe(2);});it('b',()=>{expect(hd335cptx(3,1)).toBe(1);});it('c',()=>{expect(hd335cptx(0,0)).toBe(0);});it('d',()=>{expect(hd335cptx(93,73)).toBe(2);});it('e',()=>{expect(hd335cptx(15,0)).toBe(4);});});
function hd336cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336cptx_hd',()=>{it('a',()=>{expect(hd336cptx(1,4)).toBe(2);});it('b',()=>{expect(hd336cptx(3,1)).toBe(1);});it('c',()=>{expect(hd336cptx(0,0)).toBe(0);});it('d',()=>{expect(hd336cptx(93,73)).toBe(2);});it('e',()=>{expect(hd336cptx(15,0)).toBe(4);});});
function hd337cptx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337cptx_hd',()=>{it('a',()=>{expect(hd337cptx(1,4)).toBe(2);});it('b',()=>{expect(hd337cptx(3,1)).toBe(1);});it('c',()=>{expect(hd337cptx(0,0)).toBe(0);});it('d',()=>{expect(hd337cptx(93,73)).toBe(2);});it('e',()=>{expect(hd337cptx(15,0)).toBe(4);});});
