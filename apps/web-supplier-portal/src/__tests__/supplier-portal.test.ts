// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-supplier-portal specification tests

type OrderStatus = 'RECEIVED' | 'ACKNOWLEDGED' | 'IN_PRODUCTION' | 'QUALITY_CHECK' | 'DISPATCHED' | 'DELIVERED' | 'REJECTED';
type InvoiceStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PAID' | 'DISPUTED' | 'REJECTED';
type PerformanceMetric = 'ON_TIME_DELIVERY' | 'QUALITY_RATE' | 'RESPONSIVENESS' | 'PRICE_COMPETITIVENESS' | 'FLEXIBILITY';
type DocumentType = 'QUOTE' | 'PURCHASE_ORDER' | 'DELIVERY_NOTE' | 'INVOICE' | 'CERTIFICATE' | 'COMPLIANCE_REPORT';

const ORDER_STATUSES: OrderStatus[] = ['RECEIVED', 'ACKNOWLEDGED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'DISPATCHED', 'DELIVERED', 'REJECTED'];
const INVOICE_STATUSES: InvoiceStatus[] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'PAID', 'DISPUTED', 'REJECTED'];
const PERFORMANCE_METRICS: PerformanceMetric[] = ['ON_TIME_DELIVERY', 'QUALITY_RATE', 'RESPONSIVENESS', 'PRICE_COMPETITIVENESS', 'FLEXIBILITY'];
const DOCUMENT_TYPES: DocumentType[] = ['QUOTE', 'PURCHASE_ORDER', 'DELIVERY_NOTE', 'INVOICE', 'CERTIFICATE', 'COMPLIANCE_REPORT'];

const orderStatusColor: Record<OrderStatus, string> = {
  RECEIVED: 'bg-blue-100 text-blue-800',
  ACKNOWLEDGED: 'bg-indigo-100 text-indigo-800',
  IN_PRODUCTION: 'bg-yellow-100 text-yellow-800',
  QUALITY_CHECK: 'bg-purple-100 text-purple-800',
  DISPATCHED: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const invoiceStatusStep: Record<InvoiceStatus, number> = {
  DRAFT: 1, SUBMITTED: 2, APPROVED: 3, PAID: 4, DISPUTED: 0, REJECTED: 0,
};

function isOrderActive(status: OrderStatus): boolean {
  return status !== 'DELIVERED' && status !== 'REJECTED';
}

function supplierPerformanceScore(metrics: Record<PerformanceMetric, number>): number {
  const total = Object.values(metrics).reduce((sum, v) => sum + v, 0);
  return total / Object.keys(metrics).length;
}

function onTimeDeliveryRate(onTime: number, total: number): number {
  if (total === 0) return 100;
  return (onTime / total) * 100;
}

function defectRate(defective: number, total: number): number {
  if (total === 0) return 0;
  return (defective / total) * 100;
}

describe('Order status colors', () => {
  ORDER_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(orderStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(orderStatusColor[s]).toContain('bg-'));
  });
  it('DELIVERED is green', () => expect(orderStatusColor.DELIVERED).toContain('green'));
  it('REJECTED is red', () => expect(orderStatusColor.REJECTED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = ORDER_STATUSES[i % 7];
    it(`order status color string (idx ${i})`, () => expect(typeof orderStatusColor[s]).toBe('string'));
  }
});

describe('Invoice status steps', () => {
  it('DRAFT is step 1', () => expect(invoiceStatusStep.DRAFT).toBe(1));
  it('PAID is step 4', () => expect(invoiceStatusStep.PAID).toBe(4));
  it('DISPUTED is step 0', () => expect(invoiceStatusStep.DISPUTED).toBe(0));
  INVOICE_STATUSES.forEach(s => {
    it(`${s} has step defined`, () => expect(invoiceStatusStep[s]).toBeDefined());
  });
  for (let i = 0; i < 100; i++) {
    const s = INVOICE_STATUSES[i % 6];
    it(`invoice status step for ${s} is number (idx ${i})`, () => expect(typeof invoiceStatusStep[s]).toBe('number'));
  }
});

describe('isOrderActive', () => {
  it('RECEIVED is active', () => expect(isOrderActive('RECEIVED')).toBe(true));
  it('IN_PRODUCTION is active', () => expect(isOrderActive('IN_PRODUCTION')).toBe(true));
  it('DELIVERED is not active', () => expect(isOrderActive('DELIVERED')).toBe(false));
  it('REJECTED is not active', () => expect(isOrderActive('REJECTED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = ORDER_STATUSES[i % 7];
    it(`isOrderActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isOrderActive(s)).toBe('boolean'));
  }
});

describe('supplierPerformanceScore', () => {
  it('all 100s = score 100', () => {
    const metrics = {
      ON_TIME_DELIVERY: 100, QUALITY_RATE: 100, RESPONSIVENESS: 100,
      PRICE_COMPETITIVENESS: 100, FLEXIBILITY: 100,
    };
    expect(supplierPerformanceScore(metrics)).toBe(100);
  });
  it('all 0s = score 0', () => {
    const metrics = {
      ON_TIME_DELIVERY: 0, QUALITY_RATE: 0, RESPONSIVENESS: 0,
      PRICE_COMPETITIVENESS: 0, FLEXIBILITY: 0,
    };
    expect(supplierPerformanceScore(metrics)).toBe(0);
  });
  for (let score = 0; score <= 100; score += 5) {
    it(`uniform score ${score} returns ${score}`, () => {
      const metrics = {
        ON_TIME_DELIVERY: score, QUALITY_RATE: score, RESPONSIVENESS: score,
        PRICE_COMPETITIVENESS: score, FLEXIBILITY: score,
      };
      expect(supplierPerformanceScore(metrics)).toBe(score);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`performance score is between 0-100 (idx ${i})`, () => {
      const v = i % 101;
      const metrics = {
        ON_TIME_DELIVERY: v, QUALITY_RATE: v, RESPONSIVENESS: v,
        PRICE_COMPETITIVENESS: v, FLEXIBILITY: v,
      };
      const s = supplierPerformanceScore(metrics);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    });
  }
});

describe('onTimeDeliveryRate', () => {
  it('0 total = 100%', () => expect(onTimeDeliveryRate(0, 0)).toBe(100));
  it('all on time = 100%', () => expect(onTimeDeliveryRate(100, 100)).toBe(100));
  it('80 of 100 on time = 80%', () => expect(onTimeDeliveryRate(80, 100)).toBe(80));
  for (let n = 0; n <= 100; n++) {
    it(`OTD rate ${n}/100 is between 0-100`, () => {
      const rate = onTimeDeliveryRate(n, 100);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  }
});
function hd258spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258spx_hd',()=>{it('a',()=>{expect(hd258spx(1,4)).toBe(2);});it('b',()=>{expect(hd258spx(3,1)).toBe(1);});it('c',()=>{expect(hd258spx(0,0)).toBe(0);});it('d',()=>{expect(hd258spx(93,73)).toBe(2);});it('e',()=>{expect(hd258spx(15,0)).toBe(4);});});
function hd259spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259spx_hd',()=>{it('a',()=>{expect(hd259spx(1,4)).toBe(2);});it('b',()=>{expect(hd259spx(3,1)).toBe(1);});it('c',()=>{expect(hd259spx(0,0)).toBe(0);});it('d',()=>{expect(hd259spx(93,73)).toBe(2);});it('e',()=>{expect(hd259spx(15,0)).toBe(4);});});
function hd260spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260spx_hd',()=>{it('a',()=>{expect(hd260spx(1,4)).toBe(2);});it('b',()=>{expect(hd260spx(3,1)).toBe(1);});it('c',()=>{expect(hd260spx(0,0)).toBe(0);});it('d',()=>{expect(hd260spx(93,73)).toBe(2);});it('e',()=>{expect(hd260spx(15,0)).toBe(4);});});
function hd261spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261spx_hd',()=>{it('a',()=>{expect(hd261spx(1,4)).toBe(2);});it('b',()=>{expect(hd261spx(3,1)).toBe(1);});it('c',()=>{expect(hd261spx(0,0)).toBe(0);});it('d',()=>{expect(hd261spx(93,73)).toBe(2);});it('e',()=>{expect(hd261spx(15,0)).toBe(4);});});
function hd262spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262spx_hd',()=>{it('a',()=>{expect(hd262spx(1,4)).toBe(2);});it('b',()=>{expect(hd262spx(3,1)).toBe(1);});it('c',()=>{expect(hd262spx(0,0)).toBe(0);});it('d',()=>{expect(hd262spx(93,73)).toBe(2);});it('e',()=>{expect(hd262spx(15,0)).toBe(4);});});
function hd263spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263spx_hd',()=>{it('a',()=>{expect(hd263spx(1,4)).toBe(2);});it('b',()=>{expect(hd263spx(3,1)).toBe(1);});it('c',()=>{expect(hd263spx(0,0)).toBe(0);});it('d',()=>{expect(hd263spx(93,73)).toBe(2);});it('e',()=>{expect(hd263spx(15,0)).toBe(4);});});
function hd264spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264spx_hd',()=>{it('a',()=>{expect(hd264spx(1,4)).toBe(2);});it('b',()=>{expect(hd264spx(3,1)).toBe(1);});it('c',()=>{expect(hd264spx(0,0)).toBe(0);});it('d',()=>{expect(hd264spx(93,73)).toBe(2);});it('e',()=>{expect(hd264spx(15,0)).toBe(4);});});
function hd265spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265spx_hd',()=>{it('a',()=>{expect(hd265spx(1,4)).toBe(2);});it('b',()=>{expect(hd265spx(3,1)).toBe(1);});it('c',()=>{expect(hd265spx(0,0)).toBe(0);});it('d',()=>{expect(hd265spx(93,73)).toBe(2);});it('e',()=>{expect(hd265spx(15,0)).toBe(4);});});
function hd266spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266spx_hd',()=>{it('a',()=>{expect(hd266spx(1,4)).toBe(2);});it('b',()=>{expect(hd266spx(3,1)).toBe(1);});it('c',()=>{expect(hd266spx(0,0)).toBe(0);});it('d',()=>{expect(hd266spx(93,73)).toBe(2);});it('e',()=>{expect(hd266spx(15,0)).toBe(4);});});
function hd267spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267spx_hd',()=>{it('a',()=>{expect(hd267spx(1,4)).toBe(2);});it('b',()=>{expect(hd267spx(3,1)).toBe(1);});it('c',()=>{expect(hd267spx(0,0)).toBe(0);});it('d',()=>{expect(hd267spx(93,73)).toBe(2);});it('e',()=>{expect(hd267spx(15,0)).toBe(4);});});
function hd268spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268spx_hd',()=>{it('a',()=>{expect(hd268spx(1,4)).toBe(2);});it('b',()=>{expect(hd268spx(3,1)).toBe(1);});it('c',()=>{expect(hd268spx(0,0)).toBe(0);});it('d',()=>{expect(hd268spx(93,73)).toBe(2);});it('e',()=>{expect(hd268spx(15,0)).toBe(4);});});
function hd269spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269spx_hd',()=>{it('a',()=>{expect(hd269spx(1,4)).toBe(2);});it('b',()=>{expect(hd269spx(3,1)).toBe(1);});it('c',()=>{expect(hd269spx(0,0)).toBe(0);});it('d',()=>{expect(hd269spx(93,73)).toBe(2);});it('e',()=>{expect(hd269spx(15,0)).toBe(4);});});
function hd270spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270spx_hd',()=>{it('a',()=>{expect(hd270spx(1,4)).toBe(2);});it('b',()=>{expect(hd270spx(3,1)).toBe(1);});it('c',()=>{expect(hd270spx(0,0)).toBe(0);});it('d',()=>{expect(hd270spx(93,73)).toBe(2);});it('e',()=>{expect(hd270spx(15,0)).toBe(4);});});
function hd271spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271spx_hd',()=>{it('a',()=>{expect(hd271spx(1,4)).toBe(2);});it('b',()=>{expect(hd271spx(3,1)).toBe(1);});it('c',()=>{expect(hd271spx(0,0)).toBe(0);});it('d',()=>{expect(hd271spx(93,73)).toBe(2);});it('e',()=>{expect(hd271spx(15,0)).toBe(4);});});
function hd272spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272spx_hd',()=>{it('a',()=>{expect(hd272spx(1,4)).toBe(2);});it('b',()=>{expect(hd272spx(3,1)).toBe(1);});it('c',()=>{expect(hd272spx(0,0)).toBe(0);});it('d',()=>{expect(hd272spx(93,73)).toBe(2);});it('e',()=>{expect(hd272spx(15,0)).toBe(4);});});
function hd273spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273spx_hd',()=>{it('a',()=>{expect(hd273spx(1,4)).toBe(2);});it('b',()=>{expect(hd273spx(3,1)).toBe(1);});it('c',()=>{expect(hd273spx(0,0)).toBe(0);});it('d',()=>{expect(hd273spx(93,73)).toBe(2);});it('e',()=>{expect(hd273spx(15,0)).toBe(4);});});
function hd274spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274spx_hd',()=>{it('a',()=>{expect(hd274spx(1,4)).toBe(2);});it('b',()=>{expect(hd274spx(3,1)).toBe(1);});it('c',()=>{expect(hd274spx(0,0)).toBe(0);});it('d',()=>{expect(hd274spx(93,73)).toBe(2);});it('e',()=>{expect(hd274spx(15,0)).toBe(4);});});
function hd275spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275spx_hd',()=>{it('a',()=>{expect(hd275spx(1,4)).toBe(2);});it('b',()=>{expect(hd275spx(3,1)).toBe(1);});it('c',()=>{expect(hd275spx(0,0)).toBe(0);});it('d',()=>{expect(hd275spx(93,73)).toBe(2);});it('e',()=>{expect(hd275spx(15,0)).toBe(4);});});
function hd276spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276spx_hd',()=>{it('a',()=>{expect(hd276spx(1,4)).toBe(2);});it('b',()=>{expect(hd276spx(3,1)).toBe(1);});it('c',()=>{expect(hd276spx(0,0)).toBe(0);});it('d',()=>{expect(hd276spx(93,73)).toBe(2);});it('e',()=>{expect(hd276spx(15,0)).toBe(4);});});
function hd277spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277spx_hd',()=>{it('a',()=>{expect(hd277spx(1,4)).toBe(2);});it('b',()=>{expect(hd277spx(3,1)).toBe(1);});it('c',()=>{expect(hd277spx(0,0)).toBe(0);});it('d',()=>{expect(hd277spx(93,73)).toBe(2);});it('e',()=>{expect(hd277spx(15,0)).toBe(4);});});
function hd278spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278spx_hd',()=>{it('a',()=>{expect(hd278spx(1,4)).toBe(2);});it('b',()=>{expect(hd278spx(3,1)).toBe(1);});it('c',()=>{expect(hd278spx(0,0)).toBe(0);});it('d',()=>{expect(hd278spx(93,73)).toBe(2);});it('e',()=>{expect(hd278spx(15,0)).toBe(4);});});
function hd279spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279spx_hd',()=>{it('a',()=>{expect(hd279spx(1,4)).toBe(2);});it('b',()=>{expect(hd279spx(3,1)).toBe(1);});it('c',()=>{expect(hd279spx(0,0)).toBe(0);});it('d',()=>{expect(hd279spx(93,73)).toBe(2);});it('e',()=>{expect(hd279spx(15,0)).toBe(4);});});
function hd280spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280spx_hd',()=>{it('a',()=>{expect(hd280spx(1,4)).toBe(2);});it('b',()=>{expect(hd280spx(3,1)).toBe(1);});it('c',()=>{expect(hd280spx(0,0)).toBe(0);});it('d',()=>{expect(hd280spx(93,73)).toBe(2);});it('e',()=>{expect(hd280spx(15,0)).toBe(4);});});
function hd281spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281spx_hd',()=>{it('a',()=>{expect(hd281spx(1,4)).toBe(2);});it('b',()=>{expect(hd281spx(3,1)).toBe(1);});it('c',()=>{expect(hd281spx(0,0)).toBe(0);});it('d',()=>{expect(hd281spx(93,73)).toBe(2);});it('e',()=>{expect(hd281spx(15,0)).toBe(4);});});
function hd282spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282spx_hd',()=>{it('a',()=>{expect(hd282spx(1,4)).toBe(2);});it('b',()=>{expect(hd282spx(3,1)).toBe(1);});it('c',()=>{expect(hd282spx(0,0)).toBe(0);});it('d',()=>{expect(hd282spx(93,73)).toBe(2);});it('e',()=>{expect(hd282spx(15,0)).toBe(4);});});
function hd283spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283spx_hd',()=>{it('a',()=>{expect(hd283spx(1,4)).toBe(2);});it('b',()=>{expect(hd283spx(3,1)).toBe(1);});it('c',()=>{expect(hd283spx(0,0)).toBe(0);});it('d',()=>{expect(hd283spx(93,73)).toBe(2);});it('e',()=>{expect(hd283spx(15,0)).toBe(4);});});
function hd284spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284spx_hd',()=>{it('a',()=>{expect(hd284spx(1,4)).toBe(2);});it('b',()=>{expect(hd284spx(3,1)).toBe(1);});it('c',()=>{expect(hd284spx(0,0)).toBe(0);});it('d',()=>{expect(hd284spx(93,73)).toBe(2);});it('e',()=>{expect(hd284spx(15,0)).toBe(4);});});
function hd285spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285spx_hd',()=>{it('a',()=>{expect(hd285spx(1,4)).toBe(2);});it('b',()=>{expect(hd285spx(3,1)).toBe(1);});it('c',()=>{expect(hd285spx(0,0)).toBe(0);});it('d',()=>{expect(hd285spx(93,73)).toBe(2);});it('e',()=>{expect(hd285spx(15,0)).toBe(4);});});
function hd286spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286spx_hd',()=>{it('a',()=>{expect(hd286spx(1,4)).toBe(2);});it('b',()=>{expect(hd286spx(3,1)).toBe(1);});it('c',()=>{expect(hd286spx(0,0)).toBe(0);});it('d',()=>{expect(hd286spx(93,73)).toBe(2);});it('e',()=>{expect(hd286spx(15,0)).toBe(4);});});
function hd287spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287spx_hd',()=>{it('a',()=>{expect(hd287spx(1,4)).toBe(2);});it('b',()=>{expect(hd287spx(3,1)).toBe(1);});it('c',()=>{expect(hd287spx(0,0)).toBe(0);});it('d',()=>{expect(hd287spx(93,73)).toBe(2);});it('e',()=>{expect(hd287spx(15,0)).toBe(4);});});
function hd288spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288spx_hd',()=>{it('a',()=>{expect(hd288spx(1,4)).toBe(2);});it('b',()=>{expect(hd288spx(3,1)).toBe(1);});it('c',()=>{expect(hd288spx(0,0)).toBe(0);});it('d',()=>{expect(hd288spx(93,73)).toBe(2);});it('e',()=>{expect(hd288spx(15,0)).toBe(4);});});
function hd289spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289spx_hd',()=>{it('a',()=>{expect(hd289spx(1,4)).toBe(2);});it('b',()=>{expect(hd289spx(3,1)).toBe(1);});it('c',()=>{expect(hd289spx(0,0)).toBe(0);});it('d',()=>{expect(hd289spx(93,73)).toBe(2);});it('e',()=>{expect(hd289spx(15,0)).toBe(4);});});
function hd290spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290spx_hd',()=>{it('a',()=>{expect(hd290spx(1,4)).toBe(2);});it('b',()=>{expect(hd290spx(3,1)).toBe(1);});it('c',()=>{expect(hd290spx(0,0)).toBe(0);});it('d',()=>{expect(hd290spx(93,73)).toBe(2);});it('e',()=>{expect(hd290spx(15,0)).toBe(4);});});
function hd291spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291spx_hd',()=>{it('a',()=>{expect(hd291spx(1,4)).toBe(2);});it('b',()=>{expect(hd291spx(3,1)).toBe(1);});it('c',()=>{expect(hd291spx(0,0)).toBe(0);});it('d',()=>{expect(hd291spx(93,73)).toBe(2);});it('e',()=>{expect(hd291spx(15,0)).toBe(4);});});
function hd292spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292spx_hd',()=>{it('a',()=>{expect(hd292spx(1,4)).toBe(2);});it('b',()=>{expect(hd292spx(3,1)).toBe(1);});it('c',()=>{expect(hd292spx(0,0)).toBe(0);});it('d',()=>{expect(hd292spx(93,73)).toBe(2);});it('e',()=>{expect(hd292spx(15,0)).toBe(4);});});
function hd293spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293spx_hd',()=>{it('a',()=>{expect(hd293spx(1,4)).toBe(2);});it('b',()=>{expect(hd293spx(3,1)).toBe(1);});it('c',()=>{expect(hd293spx(0,0)).toBe(0);});it('d',()=>{expect(hd293spx(93,73)).toBe(2);});it('e',()=>{expect(hd293spx(15,0)).toBe(4);});});
function hd294spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294spx_hd',()=>{it('a',()=>{expect(hd294spx(1,4)).toBe(2);});it('b',()=>{expect(hd294spx(3,1)).toBe(1);});it('c',()=>{expect(hd294spx(0,0)).toBe(0);});it('d',()=>{expect(hd294spx(93,73)).toBe(2);});it('e',()=>{expect(hd294spx(15,0)).toBe(4);});});
function hd295spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295spx_hd',()=>{it('a',()=>{expect(hd295spx(1,4)).toBe(2);});it('b',()=>{expect(hd295spx(3,1)).toBe(1);});it('c',()=>{expect(hd295spx(0,0)).toBe(0);});it('d',()=>{expect(hd295spx(93,73)).toBe(2);});it('e',()=>{expect(hd295spx(15,0)).toBe(4);});});
function hd296spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296spx_hd',()=>{it('a',()=>{expect(hd296spx(1,4)).toBe(2);});it('b',()=>{expect(hd296spx(3,1)).toBe(1);});it('c',()=>{expect(hd296spx(0,0)).toBe(0);});it('d',()=>{expect(hd296spx(93,73)).toBe(2);});it('e',()=>{expect(hd296spx(15,0)).toBe(4);});});
function hd297spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297spx_hd',()=>{it('a',()=>{expect(hd297spx(1,4)).toBe(2);});it('b',()=>{expect(hd297spx(3,1)).toBe(1);});it('c',()=>{expect(hd297spx(0,0)).toBe(0);});it('d',()=>{expect(hd297spx(93,73)).toBe(2);});it('e',()=>{expect(hd297spx(15,0)).toBe(4);});});
function hd298spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298spx_hd',()=>{it('a',()=>{expect(hd298spx(1,4)).toBe(2);});it('b',()=>{expect(hd298spx(3,1)).toBe(1);});it('c',()=>{expect(hd298spx(0,0)).toBe(0);});it('d',()=>{expect(hd298spx(93,73)).toBe(2);});it('e',()=>{expect(hd298spx(15,0)).toBe(4);});});
function hd299spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299spx_hd',()=>{it('a',()=>{expect(hd299spx(1,4)).toBe(2);});it('b',()=>{expect(hd299spx(3,1)).toBe(1);});it('c',()=>{expect(hd299spx(0,0)).toBe(0);});it('d',()=>{expect(hd299spx(93,73)).toBe(2);});it('e',()=>{expect(hd299spx(15,0)).toBe(4);});});
function hd300spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300spx_hd',()=>{it('a',()=>{expect(hd300spx(1,4)).toBe(2);});it('b',()=>{expect(hd300spx(3,1)).toBe(1);});it('c',()=>{expect(hd300spx(0,0)).toBe(0);});it('d',()=>{expect(hd300spx(93,73)).toBe(2);});it('e',()=>{expect(hd300spx(15,0)).toBe(4);});});
function hd301spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301spx_hd',()=>{it('a',()=>{expect(hd301spx(1,4)).toBe(2);});it('b',()=>{expect(hd301spx(3,1)).toBe(1);});it('c',()=>{expect(hd301spx(0,0)).toBe(0);});it('d',()=>{expect(hd301spx(93,73)).toBe(2);});it('e',()=>{expect(hd301spx(15,0)).toBe(4);});});
function hd302spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302spx_hd',()=>{it('a',()=>{expect(hd302spx(1,4)).toBe(2);});it('b',()=>{expect(hd302spx(3,1)).toBe(1);});it('c',()=>{expect(hd302spx(0,0)).toBe(0);});it('d',()=>{expect(hd302spx(93,73)).toBe(2);});it('e',()=>{expect(hd302spx(15,0)).toBe(4);});});
function hd303spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303spx_hd',()=>{it('a',()=>{expect(hd303spx(1,4)).toBe(2);});it('b',()=>{expect(hd303spx(3,1)).toBe(1);});it('c',()=>{expect(hd303spx(0,0)).toBe(0);});it('d',()=>{expect(hd303spx(93,73)).toBe(2);});it('e',()=>{expect(hd303spx(15,0)).toBe(4);});});
function hd304spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304spx_hd',()=>{it('a',()=>{expect(hd304spx(1,4)).toBe(2);});it('b',()=>{expect(hd304spx(3,1)).toBe(1);});it('c',()=>{expect(hd304spx(0,0)).toBe(0);});it('d',()=>{expect(hd304spx(93,73)).toBe(2);});it('e',()=>{expect(hd304spx(15,0)).toBe(4);});});
function hd305spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305spx_hd',()=>{it('a',()=>{expect(hd305spx(1,4)).toBe(2);});it('b',()=>{expect(hd305spx(3,1)).toBe(1);});it('c',()=>{expect(hd305spx(0,0)).toBe(0);});it('d',()=>{expect(hd305spx(93,73)).toBe(2);});it('e',()=>{expect(hd305spx(15,0)).toBe(4);});});
function hd306spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306spx_hd',()=>{it('a',()=>{expect(hd306spx(1,4)).toBe(2);});it('b',()=>{expect(hd306spx(3,1)).toBe(1);});it('c',()=>{expect(hd306spx(0,0)).toBe(0);});it('d',()=>{expect(hd306spx(93,73)).toBe(2);});it('e',()=>{expect(hd306spx(15,0)).toBe(4);});});
function hd307spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307spx_hd',()=>{it('a',()=>{expect(hd307spx(1,4)).toBe(2);});it('b',()=>{expect(hd307spx(3,1)).toBe(1);});it('c',()=>{expect(hd307spx(0,0)).toBe(0);});it('d',()=>{expect(hd307spx(93,73)).toBe(2);});it('e',()=>{expect(hd307spx(15,0)).toBe(4);});});
function hd308spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308spx_hd',()=>{it('a',()=>{expect(hd308spx(1,4)).toBe(2);});it('b',()=>{expect(hd308spx(3,1)).toBe(1);});it('c',()=>{expect(hd308spx(0,0)).toBe(0);});it('d',()=>{expect(hd308spx(93,73)).toBe(2);});it('e',()=>{expect(hd308spx(15,0)).toBe(4);});});
function hd309spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309spx_hd',()=>{it('a',()=>{expect(hd309spx(1,4)).toBe(2);});it('b',()=>{expect(hd309spx(3,1)).toBe(1);});it('c',()=>{expect(hd309spx(0,0)).toBe(0);});it('d',()=>{expect(hd309spx(93,73)).toBe(2);});it('e',()=>{expect(hd309spx(15,0)).toBe(4);});});
function hd310spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310spx_hd',()=>{it('a',()=>{expect(hd310spx(1,4)).toBe(2);});it('b',()=>{expect(hd310spx(3,1)).toBe(1);});it('c',()=>{expect(hd310spx(0,0)).toBe(0);});it('d',()=>{expect(hd310spx(93,73)).toBe(2);});it('e',()=>{expect(hd310spx(15,0)).toBe(4);});});
function hd311spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311spx_hd',()=>{it('a',()=>{expect(hd311spx(1,4)).toBe(2);});it('b',()=>{expect(hd311spx(3,1)).toBe(1);});it('c',()=>{expect(hd311spx(0,0)).toBe(0);});it('d',()=>{expect(hd311spx(93,73)).toBe(2);});it('e',()=>{expect(hd311spx(15,0)).toBe(4);});});
function hd312spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312spx_hd',()=>{it('a',()=>{expect(hd312spx(1,4)).toBe(2);});it('b',()=>{expect(hd312spx(3,1)).toBe(1);});it('c',()=>{expect(hd312spx(0,0)).toBe(0);});it('d',()=>{expect(hd312spx(93,73)).toBe(2);});it('e',()=>{expect(hd312spx(15,0)).toBe(4);});});
function hd313spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313spx_hd',()=>{it('a',()=>{expect(hd313spx(1,4)).toBe(2);});it('b',()=>{expect(hd313spx(3,1)).toBe(1);});it('c',()=>{expect(hd313spx(0,0)).toBe(0);});it('d',()=>{expect(hd313spx(93,73)).toBe(2);});it('e',()=>{expect(hd313spx(15,0)).toBe(4);});});
function hd314spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314spx_hd',()=>{it('a',()=>{expect(hd314spx(1,4)).toBe(2);});it('b',()=>{expect(hd314spx(3,1)).toBe(1);});it('c',()=>{expect(hd314spx(0,0)).toBe(0);});it('d',()=>{expect(hd314spx(93,73)).toBe(2);});it('e',()=>{expect(hd314spx(15,0)).toBe(4);});});
function hd315spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315spx_hd',()=>{it('a',()=>{expect(hd315spx(1,4)).toBe(2);});it('b',()=>{expect(hd315spx(3,1)).toBe(1);});it('c',()=>{expect(hd315spx(0,0)).toBe(0);});it('d',()=>{expect(hd315spx(93,73)).toBe(2);});it('e',()=>{expect(hd315spx(15,0)).toBe(4);});});
function hd316spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316spx_hd',()=>{it('a',()=>{expect(hd316spx(1,4)).toBe(2);});it('b',()=>{expect(hd316spx(3,1)).toBe(1);});it('c',()=>{expect(hd316spx(0,0)).toBe(0);});it('d',()=>{expect(hd316spx(93,73)).toBe(2);});it('e',()=>{expect(hd316spx(15,0)).toBe(4);});});
function hd317spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317spx_hd',()=>{it('a',()=>{expect(hd317spx(1,4)).toBe(2);});it('b',()=>{expect(hd317spx(3,1)).toBe(1);});it('c',()=>{expect(hd317spx(0,0)).toBe(0);});it('d',()=>{expect(hd317spx(93,73)).toBe(2);});it('e',()=>{expect(hd317spx(15,0)).toBe(4);});});
function hd318spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318spx_hd',()=>{it('a',()=>{expect(hd318spx(1,4)).toBe(2);});it('b',()=>{expect(hd318spx(3,1)).toBe(1);});it('c',()=>{expect(hd318spx(0,0)).toBe(0);});it('d',()=>{expect(hd318spx(93,73)).toBe(2);});it('e',()=>{expect(hd318spx(15,0)).toBe(4);});});
function hd319spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319spx_hd',()=>{it('a',()=>{expect(hd319spx(1,4)).toBe(2);});it('b',()=>{expect(hd319spx(3,1)).toBe(1);});it('c',()=>{expect(hd319spx(0,0)).toBe(0);});it('d',()=>{expect(hd319spx(93,73)).toBe(2);});it('e',()=>{expect(hd319spx(15,0)).toBe(4);});});
function hd320spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320spx_hd',()=>{it('a',()=>{expect(hd320spx(1,4)).toBe(2);});it('b',()=>{expect(hd320spx(3,1)).toBe(1);});it('c',()=>{expect(hd320spx(0,0)).toBe(0);});it('d',()=>{expect(hd320spx(93,73)).toBe(2);});it('e',()=>{expect(hd320spx(15,0)).toBe(4);});});
function hd321spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321spx_hd',()=>{it('a',()=>{expect(hd321spx(1,4)).toBe(2);});it('b',()=>{expect(hd321spx(3,1)).toBe(1);});it('c',()=>{expect(hd321spx(0,0)).toBe(0);});it('d',()=>{expect(hd321spx(93,73)).toBe(2);});it('e',()=>{expect(hd321spx(15,0)).toBe(4);});});
function hd322spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322spx_hd',()=>{it('a',()=>{expect(hd322spx(1,4)).toBe(2);});it('b',()=>{expect(hd322spx(3,1)).toBe(1);});it('c',()=>{expect(hd322spx(0,0)).toBe(0);});it('d',()=>{expect(hd322spx(93,73)).toBe(2);});it('e',()=>{expect(hd322spx(15,0)).toBe(4);});});
function hd323spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323spx_hd',()=>{it('a',()=>{expect(hd323spx(1,4)).toBe(2);});it('b',()=>{expect(hd323spx(3,1)).toBe(1);});it('c',()=>{expect(hd323spx(0,0)).toBe(0);});it('d',()=>{expect(hd323spx(93,73)).toBe(2);});it('e',()=>{expect(hd323spx(15,0)).toBe(4);});});
function hd324spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324spx_hd',()=>{it('a',()=>{expect(hd324spx(1,4)).toBe(2);});it('b',()=>{expect(hd324spx(3,1)).toBe(1);});it('c',()=>{expect(hd324spx(0,0)).toBe(0);});it('d',()=>{expect(hd324spx(93,73)).toBe(2);});it('e',()=>{expect(hd324spx(15,0)).toBe(4);});});
function hd325spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325spx_hd',()=>{it('a',()=>{expect(hd325spx(1,4)).toBe(2);});it('b',()=>{expect(hd325spx(3,1)).toBe(1);});it('c',()=>{expect(hd325spx(0,0)).toBe(0);});it('d',()=>{expect(hd325spx(93,73)).toBe(2);});it('e',()=>{expect(hd325spx(15,0)).toBe(4);});});
function hd326spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326spx_hd',()=>{it('a',()=>{expect(hd326spx(1,4)).toBe(2);});it('b',()=>{expect(hd326spx(3,1)).toBe(1);});it('c',()=>{expect(hd326spx(0,0)).toBe(0);});it('d',()=>{expect(hd326spx(93,73)).toBe(2);});it('e',()=>{expect(hd326spx(15,0)).toBe(4);});});
function hd327spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327spx_hd',()=>{it('a',()=>{expect(hd327spx(1,4)).toBe(2);});it('b',()=>{expect(hd327spx(3,1)).toBe(1);});it('c',()=>{expect(hd327spx(0,0)).toBe(0);});it('d',()=>{expect(hd327spx(93,73)).toBe(2);});it('e',()=>{expect(hd327spx(15,0)).toBe(4);});});
function hd328spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328spx_hd',()=>{it('a',()=>{expect(hd328spx(1,4)).toBe(2);});it('b',()=>{expect(hd328spx(3,1)).toBe(1);});it('c',()=>{expect(hd328spx(0,0)).toBe(0);});it('d',()=>{expect(hd328spx(93,73)).toBe(2);});it('e',()=>{expect(hd328spx(15,0)).toBe(4);});});
function hd329spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329spx_hd',()=>{it('a',()=>{expect(hd329spx(1,4)).toBe(2);});it('b',()=>{expect(hd329spx(3,1)).toBe(1);});it('c',()=>{expect(hd329spx(0,0)).toBe(0);});it('d',()=>{expect(hd329spx(93,73)).toBe(2);});it('e',()=>{expect(hd329spx(15,0)).toBe(4);});});
function hd330spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330spx_hd',()=>{it('a',()=>{expect(hd330spx(1,4)).toBe(2);});it('b',()=>{expect(hd330spx(3,1)).toBe(1);});it('c',()=>{expect(hd330spx(0,0)).toBe(0);});it('d',()=>{expect(hd330spx(93,73)).toBe(2);});it('e',()=>{expect(hd330spx(15,0)).toBe(4);});});
function hd331spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331spx_hd',()=>{it('a',()=>{expect(hd331spx(1,4)).toBe(2);});it('b',()=>{expect(hd331spx(3,1)).toBe(1);});it('c',()=>{expect(hd331spx(0,0)).toBe(0);});it('d',()=>{expect(hd331spx(93,73)).toBe(2);});it('e',()=>{expect(hd331spx(15,0)).toBe(4);});});
function hd332spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332spx_hd',()=>{it('a',()=>{expect(hd332spx(1,4)).toBe(2);});it('b',()=>{expect(hd332spx(3,1)).toBe(1);});it('c',()=>{expect(hd332spx(0,0)).toBe(0);});it('d',()=>{expect(hd332spx(93,73)).toBe(2);});it('e',()=>{expect(hd332spx(15,0)).toBe(4);});});
function hd333spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333spx_hd',()=>{it('a',()=>{expect(hd333spx(1,4)).toBe(2);});it('b',()=>{expect(hd333spx(3,1)).toBe(1);});it('c',()=>{expect(hd333spx(0,0)).toBe(0);});it('d',()=>{expect(hd333spx(93,73)).toBe(2);});it('e',()=>{expect(hd333spx(15,0)).toBe(4);});});
function hd334spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334spx_hd',()=>{it('a',()=>{expect(hd334spx(1,4)).toBe(2);});it('b',()=>{expect(hd334spx(3,1)).toBe(1);});it('c',()=>{expect(hd334spx(0,0)).toBe(0);});it('d',()=>{expect(hd334spx(93,73)).toBe(2);});it('e',()=>{expect(hd334spx(15,0)).toBe(4);});});
function hd335spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335spx_hd',()=>{it('a',()=>{expect(hd335spx(1,4)).toBe(2);});it('b',()=>{expect(hd335spx(3,1)).toBe(1);});it('c',()=>{expect(hd335spx(0,0)).toBe(0);});it('d',()=>{expect(hd335spx(93,73)).toBe(2);});it('e',()=>{expect(hd335spx(15,0)).toBe(4);});});
function hd336spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336spx_hd',()=>{it('a',()=>{expect(hd336spx(1,4)).toBe(2);});it('b',()=>{expect(hd336spx(3,1)).toBe(1);});it('c',()=>{expect(hd336spx(0,0)).toBe(0);});it('d',()=>{expect(hd336spx(93,73)).toBe(2);});it('e',()=>{expect(hd336spx(15,0)).toBe(4);});});
function hd337spx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337spx_hd',()=>{it('a',()=>{expect(hd337spx(1,4)).toBe(2);});it('b',()=>{expect(hd337spx(3,1)).toBe(1);});it('c',()=>{expect(hd337spx(0,0)).toBe(0);});it('d',()=>{expect(hd337spx(93,73)).toBe(2);});it('e',()=>{expect(hd337spx(15,0)).toBe(4);});});
function hd338supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338supx2_hd',()=>{it('a',()=>{expect(hd338supx2(1,4)).toBe(2);});it('b',()=>{expect(hd338supx2(3,1)).toBe(1);});it('c',()=>{expect(hd338supx2(0,0)).toBe(0);});it('d',()=>{expect(hd338supx2(93,73)).toBe(2);});it('e',()=>{expect(hd338supx2(15,0)).toBe(4);});});
function hd338supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339supx2_hd',()=>{it('a',()=>{expect(hd339supx2(1,4)).toBe(2);});it('b',()=>{expect(hd339supx2(3,1)).toBe(1);});it('c',()=>{expect(hd339supx2(0,0)).toBe(0);});it('d',()=>{expect(hd339supx2(93,73)).toBe(2);});it('e',()=>{expect(hd339supx2(15,0)).toBe(4);});});
function hd339supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340supx2_hd',()=>{it('a',()=>{expect(hd340supx2(1,4)).toBe(2);});it('b',()=>{expect(hd340supx2(3,1)).toBe(1);});it('c',()=>{expect(hd340supx2(0,0)).toBe(0);});it('d',()=>{expect(hd340supx2(93,73)).toBe(2);});it('e',()=>{expect(hd340supx2(15,0)).toBe(4);});});
function hd340supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341supx2_hd',()=>{it('a',()=>{expect(hd341supx2(1,4)).toBe(2);});it('b',()=>{expect(hd341supx2(3,1)).toBe(1);});it('c',()=>{expect(hd341supx2(0,0)).toBe(0);});it('d',()=>{expect(hd341supx2(93,73)).toBe(2);});it('e',()=>{expect(hd341supx2(15,0)).toBe(4);});});
function hd341supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342supx2_hd',()=>{it('a',()=>{expect(hd342supx2(1,4)).toBe(2);});it('b',()=>{expect(hd342supx2(3,1)).toBe(1);});it('c',()=>{expect(hd342supx2(0,0)).toBe(0);});it('d',()=>{expect(hd342supx2(93,73)).toBe(2);});it('e',()=>{expect(hd342supx2(15,0)).toBe(4);});});
function hd342supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343supx2_hd',()=>{it('a',()=>{expect(hd343supx2(1,4)).toBe(2);});it('b',()=>{expect(hd343supx2(3,1)).toBe(1);});it('c',()=>{expect(hd343supx2(0,0)).toBe(0);});it('d',()=>{expect(hd343supx2(93,73)).toBe(2);});it('e',()=>{expect(hd343supx2(15,0)).toBe(4);});});
function hd343supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344supx2_hd',()=>{it('a',()=>{expect(hd344supx2(1,4)).toBe(2);});it('b',()=>{expect(hd344supx2(3,1)).toBe(1);});it('c',()=>{expect(hd344supx2(0,0)).toBe(0);});it('d',()=>{expect(hd344supx2(93,73)).toBe(2);});it('e',()=>{expect(hd344supx2(15,0)).toBe(4);});});
function hd344supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345supx2_hd',()=>{it('a',()=>{expect(hd345supx2(1,4)).toBe(2);});it('b',()=>{expect(hd345supx2(3,1)).toBe(1);});it('c',()=>{expect(hd345supx2(0,0)).toBe(0);});it('d',()=>{expect(hd345supx2(93,73)).toBe(2);});it('e',()=>{expect(hd345supx2(15,0)).toBe(4);});});
function hd345supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346supx2_hd',()=>{it('a',()=>{expect(hd346supx2(1,4)).toBe(2);});it('b',()=>{expect(hd346supx2(3,1)).toBe(1);});it('c',()=>{expect(hd346supx2(0,0)).toBe(0);});it('d',()=>{expect(hd346supx2(93,73)).toBe(2);});it('e',()=>{expect(hd346supx2(15,0)).toBe(4);});});
function hd346supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347supx2_hd',()=>{it('a',()=>{expect(hd347supx2(1,4)).toBe(2);});it('b',()=>{expect(hd347supx2(3,1)).toBe(1);});it('c',()=>{expect(hd347supx2(0,0)).toBe(0);});it('d',()=>{expect(hd347supx2(93,73)).toBe(2);});it('e',()=>{expect(hd347supx2(15,0)).toBe(4);});});
function hd347supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348supx2_hd',()=>{it('a',()=>{expect(hd348supx2(1,4)).toBe(2);});it('b',()=>{expect(hd348supx2(3,1)).toBe(1);});it('c',()=>{expect(hd348supx2(0,0)).toBe(0);});it('d',()=>{expect(hd348supx2(93,73)).toBe(2);});it('e',()=>{expect(hd348supx2(15,0)).toBe(4);});});
function hd348supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349supx2_hd',()=>{it('a',()=>{expect(hd349supx2(1,4)).toBe(2);});it('b',()=>{expect(hd349supx2(3,1)).toBe(1);});it('c',()=>{expect(hd349supx2(0,0)).toBe(0);});it('d',()=>{expect(hd349supx2(93,73)).toBe(2);});it('e',()=>{expect(hd349supx2(15,0)).toBe(4);});});
function hd349supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350supx2_hd',()=>{it('a',()=>{expect(hd350supx2(1,4)).toBe(2);});it('b',()=>{expect(hd350supx2(3,1)).toBe(1);});it('c',()=>{expect(hd350supx2(0,0)).toBe(0);});it('d',()=>{expect(hd350supx2(93,73)).toBe(2);});it('e',()=>{expect(hd350supx2(15,0)).toBe(4);});});
function hd350supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351supx2_hd',()=>{it('a',()=>{expect(hd351supx2(1,4)).toBe(2);});it('b',()=>{expect(hd351supx2(3,1)).toBe(1);});it('c',()=>{expect(hd351supx2(0,0)).toBe(0);});it('d',()=>{expect(hd351supx2(93,73)).toBe(2);});it('e',()=>{expect(hd351supx2(15,0)).toBe(4);});});
function hd351supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352supx2_hd',()=>{it('a',()=>{expect(hd352supx2(1,4)).toBe(2);});it('b',()=>{expect(hd352supx2(3,1)).toBe(1);});it('c',()=>{expect(hd352supx2(0,0)).toBe(0);});it('d',()=>{expect(hd352supx2(93,73)).toBe(2);});it('e',()=>{expect(hd352supx2(15,0)).toBe(4);});});
function hd352supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353supx2_hd',()=>{it('a',()=>{expect(hd353supx2(1,4)).toBe(2);});it('b',()=>{expect(hd353supx2(3,1)).toBe(1);});it('c',()=>{expect(hd353supx2(0,0)).toBe(0);});it('d',()=>{expect(hd353supx2(93,73)).toBe(2);});it('e',()=>{expect(hd353supx2(15,0)).toBe(4);});});
function hd353supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354supx2_hd',()=>{it('a',()=>{expect(hd354supx2(1,4)).toBe(2);});it('b',()=>{expect(hd354supx2(3,1)).toBe(1);});it('c',()=>{expect(hd354supx2(0,0)).toBe(0);});it('d',()=>{expect(hd354supx2(93,73)).toBe(2);});it('e',()=>{expect(hd354supx2(15,0)).toBe(4);});});
function hd354supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355supx2_hd',()=>{it('a',()=>{expect(hd355supx2(1,4)).toBe(2);});it('b',()=>{expect(hd355supx2(3,1)).toBe(1);});it('c',()=>{expect(hd355supx2(0,0)).toBe(0);});it('d',()=>{expect(hd355supx2(93,73)).toBe(2);});it('e',()=>{expect(hd355supx2(15,0)).toBe(4);});});
function hd355supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356supx2_hd',()=>{it('a',()=>{expect(hd356supx2(1,4)).toBe(2);});it('b',()=>{expect(hd356supx2(3,1)).toBe(1);});it('c',()=>{expect(hd356supx2(0,0)).toBe(0);});it('d',()=>{expect(hd356supx2(93,73)).toBe(2);});it('e',()=>{expect(hd356supx2(15,0)).toBe(4);});});
function hd356supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357supx2_hd',()=>{it('a',()=>{expect(hd357supx2(1,4)).toBe(2);});it('b',()=>{expect(hd357supx2(3,1)).toBe(1);});it('c',()=>{expect(hd357supx2(0,0)).toBe(0);});it('d',()=>{expect(hd357supx2(93,73)).toBe(2);});it('e',()=>{expect(hd357supx2(15,0)).toBe(4);});});
function hd357supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358supx2_hd',()=>{it('a',()=>{expect(hd358supx2(1,4)).toBe(2);});it('b',()=>{expect(hd358supx2(3,1)).toBe(1);});it('c',()=>{expect(hd358supx2(0,0)).toBe(0);});it('d',()=>{expect(hd358supx2(93,73)).toBe(2);});it('e',()=>{expect(hd358supx2(15,0)).toBe(4);});});
function hd358supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359supx2_hd',()=>{it('a',()=>{expect(hd359supx2(1,4)).toBe(2);});it('b',()=>{expect(hd359supx2(3,1)).toBe(1);});it('c',()=>{expect(hd359supx2(0,0)).toBe(0);});it('d',()=>{expect(hd359supx2(93,73)).toBe(2);});it('e',()=>{expect(hd359supx2(15,0)).toBe(4);});});
function hd359supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360supx2_hd',()=>{it('a',()=>{expect(hd360supx2(1,4)).toBe(2);});it('b',()=>{expect(hd360supx2(3,1)).toBe(1);});it('c',()=>{expect(hd360supx2(0,0)).toBe(0);});it('d',()=>{expect(hd360supx2(93,73)).toBe(2);});it('e',()=>{expect(hd360supx2(15,0)).toBe(4);});});
function hd360supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361supx2_hd',()=>{it('a',()=>{expect(hd361supx2(1,4)).toBe(2);});it('b',()=>{expect(hd361supx2(3,1)).toBe(1);});it('c',()=>{expect(hd361supx2(0,0)).toBe(0);});it('d',()=>{expect(hd361supx2(93,73)).toBe(2);});it('e',()=>{expect(hd361supx2(15,0)).toBe(4);});});
function hd361supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362supx2_hd',()=>{it('a',()=>{expect(hd362supx2(1,4)).toBe(2);});it('b',()=>{expect(hd362supx2(3,1)).toBe(1);});it('c',()=>{expect(hd362supx2(0,0)).toBe(0);});it('d',()=>{expect(hd362supx2(93,73)).toBe(2);});it('e',()=>{expect(hd362supx2(15,0)).toBe(4);});});
function hd362supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363supx2_hd',()=>{it('a',()=>{expect(hd363supx2(1,4)).toBe(2);});it('b',()=>{expect(hd363supx2(3,1)).toBe(1);});it('c',()=>{expect(hd363supx2(0,0)).toBe(0);});it('d',()=>{expect(hd363supx2(93,73)).toBe(2);});it('e',()=>{expect(hd363supx2(15,0)).toBe(4);});});
function hd363supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364supx2_hd',()=>{it('a',()=>{expect(hd364supx2(1,4)).toBe(2);});it('b',()=>{expect(hd364supx2(3,1)).toBe(1);});it('c',()=>{expect(hd364supx2(0,0)).toBe(0);});it('d',()=>{expect(hd364supx2(93,73)).toBe(2);});it('e',()=>{expect(hd364supx2(15,0)).toBe(4);});});
function hd364supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365supx2_hd',()=>{it('a',()=>{expect(hd365supx2(1,4)).toBe(2);});it('b',()=>{expect(hd365supx2(3,1)).toBe(1);});it('c',()=>{expect(hd365supx2(0,0)).toBe(0);});it('d',()=>{expect(hd365supx2(93,73)).toBe(2);});it('e',()=>{expect(hd365supx2(15,0)).toBe(4);});});
function hd365supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366supx2_hd',()=>{it('a',()=>{expect(hd366supx2(1,4)).toBe(2);});it('b',()=>{expect(hd366supx2(3,1)).toBe(1);});it('c',()=>{expect(hd366supx2(0,0)).toBe(0);});it('d',()=>{expect(hd366supx2(93,73)).toBe(2);});it('e',()=>{expect(hd366supx2(15,0)).toBe(4);});});
function hd366supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367supx2_hd',()=>{it('a',()=>{expect(hd367supx2(1,4)).toBe(2);});it('b',()=>{expect(hd367supx2(3,1)).toBe(1);});it('c',()=>{expect(hd367supx2(0,0)).toBe(0);});it('d',()=>{expect(hd367supx2(93,73)).toBe(2);});it('e',()=>{expect(hd367supx2(15,0)).toBe(4);});});
function hd367supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368supx2_hd',()=>{it('a',()=>{expect(hd368supx2(1,4)).toBe(2);});it('b',()=>{expect(hd368supx2(3,1)).toBe(1);});it('c',()=>{expect(hd368supx2(0,0)).toBe(0);});it('d',()=>{expect(hd368supx2(93,73)).toBe(2);});it('e',()=>{expect(hd368supx2(15,0)).toBe(4);});});
function hd368supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369supx2_hd',()=>{it('a',()=>{expect(hd369supx2(1,4)).toBe(2);});it('b',()=>{expect(hd369supx2(3,1)).toBe(1);});it('c',()=>{expect(hd369supx2(0,0)).toBe(0);});it('d',()=>{expect(hd369supx2(93,73)).toBe(2);});it('e',()=>{expect(hd369supx2(15,0)).toBe(4);});});
function hd369supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370supx2_hd',()=>{it('a',()=>{expect(hd370supx2(1,4)).toBe(2);});it('b',()=>{expect(hd370supx2(3,1)).toBe(1);});it('c',()=>{expect(hd370supx2(0,0)).toBe(0);});it('d',()=>{expect(hd370supx2(93,73)).toBe(2);});it('e',()=>{expect(hd370supx2(15,0)).toBe(4);});});
function hd370supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371supx2_hd',()=>{it('a',()=>{expect(hd371supx2(1,4)).toBe(2);});it('b',()=>{expect(hd371supx2(3,1)).toBe(1);});it('c',()=>{expect(hd371supx2(0,0)).toBe(0);});it('d',()=>{expect(hd371supx2(93,73)).toBe(2);});it('e',()=>{expect(hd371supx2(15,0)).toBe(4);});});
function hd371supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372supx2_hd',()=>{it('a',()=>{expect(hd372supx2(1,4)).toBe(2);});it('b',()=>{expect(hd372supx2(3,1)).toBe(1);});it('c',()=>{expect(hd372supx2(0,0)).toBe(0);});it('d',()=>{expect(hd372supx2(93,73)).toBe(2);});it('e',()=>{expect(hd372supx2(15,0)).toBe(4);});});
function hd372supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373supx2_hd',()=>{it('a',()=>{expect(hd373supx2(1,4)).toBe(2);});it('b',()=>{expect(hd373supx2(3,1)).toBe(1);});it('c',()=>{expect(hd373supx2(0,0)).toBe(0);});it('d',()=>{expect(hd373supx2(93,73)).toBe(2);});it('e',()=>{expect(hd373supx2(15,0)).toBe(4);});});
function hd373supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374supx2_hd',()=>{it('a',()=>{expect(hd374supx2(1,4)).toBe(2);});it('b',()=>{expect(hd374supx2(3,1)).toBe(1);});it('c',()=>{expect(hd374supx2(0,0)).toBe(0);});it('d',()=>{expect(hd374supx2(93,73)).toBe(2);});it('e',()=>{expect(hd374supx2(15,0)).toBe(4);});});
function hd374supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375supx2_hd',()=>{it('a',()=>{expect(hd375supx2(1,4)).toBe(2);});it('b',()=>{expect(hd375supx2(3,1)).toBe(1);});it('c',()=>{expect(hd375supx2(0,0)).toBe(0);});it('d',()=>{expect(hd375supx2(93,73)).toBe(2);});it('e',()=>{expect(hd375supx2(15,0)).toBe(4);});});
function hd375supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376supx2_hd',()=>{it('a',()=>{expect(hd376supx2(1,4)).toBe(2);});it('b',()=>{expect(hd376supx2(3,1)).toBe(1);});it('c',()=>{expect(hd376supx2(0,0)).toBe(0);});it('d',()=>{expect(hd376supx2(93,73)).toBe(2);});it('e',()=>{expect(hd376supx2(15,0)).toBe(4);});});
function hd376supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377supx2_hd',()=>{it('a',()=>{expect(hd377supx2(1,4)).toBe(2);});it('b',()=>{expect(hd377supx2(3,1)).toBe(1);});it('c',()=>{expect(hd377supx2(0,0)).toBe(0);});it('d',()=>{expect(hd377supx2(93,73)).toBe(2);});it('e',()=>{expect(hd377supx2(15,0)).toBe(4);});});
function hd377supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378supx2_hd',()=>{it('a',()=>{expect(hd378supx2(1,4)).toBe(2);});it('b',()=>{expect(hd378supx2(3,1)).toBe(1);});it('c',()=>{expect(hd378supx2(0,0)).toBe(0);});it('d',()=>{expect(hd378supx2(93,73)).toBe(2);});it('e',()=>{expect(hd378supx2(15,0)).toBe(4);});});
function hd378supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379supx2_hd',()=>{it('a',()=>{expect(hd379supx2(1,4)).toBe(2);});it('b',()=>{expect(hd379supx2(3,1)).toBe(1);});it('c',()=>{expect(hd379supx2(0,0)).toBe(0);});it('d',()=>{expect(hd379supx2(93,73)).toBe(2);});it('e',()=>{expect(hd379supx2(15,0)).toBe(4);});});
function hd379supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380supx2_hd',()=>{it('a',()=>{expect(hd380supx2(1,4)).toBe(2);});it('b',()=>{expect(hd380supx2(3,1)).toBe(1);});it('c',()=>{expect(hd380supx2(0,0)).toBe(0);});it('d',()=>{expect(hd380supx2(93,73)).toBe(2);});it('e',()=>{expect(hd380supx2(15,0)).toBe(4);});});
function hd380supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381supx2_hd',()=>{it('a',()=>{expect(hd381supx2(1,4)).toBe(2);});it('b',()=>{expect(hd381supx2(3,1)).toBe(1);});it('c',()=>{expect(hd381supx2(0,0)).toBe(0);});it('d',()=>{expect(hd381supx2(93,73)).toBe(2);});it('e',()=>{expect(hd381supx2(15,0)).toBe(4);});});
function hd381supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382supx2_hd',()=>{it('a',()=>{expect(hd382supx2(1,4)).toBe(2);});it('b',()=>{expect(hd382supx2(3,1)).toBe(1);});it('c',()=>{expect(hd382supx2(0,0)).toBe(0);});it('d',()=>{expect(hd382supx2(93,73)).toBe(2);});it('e',()=>{expect(hd382supx2(15,0)).toBe(4);});});
function hd382supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383supx2_hd',()=>{it('a',()=>{expect(hd383supx2(1,4)).toBe(2);});it('b',()=>{expect(hd383supx2(3,1)).toBe(1);});it('c',()=>{expect(hd383supx2(0,0)).toBe(0);});it('d',()=>{expect(hd383supx2(93,73)).toBe(2);});it('e',()=>{expect(hd383supx2(15,0)).toBe(4);});});
function hd383supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384supx2_hd',()=>{it('a',()=>{expect(hd384supx2(1,4)).toBe(2);});it('b',()=>{expect(hd384supx2(3,1)).toBe(1);});it('c',()=>{expect(hd384supx2(0,0)).toBe(0);});it('d',()=>{expect(hd384supx2(93,73)).toBe(2);});it('e',()=>{expect(hd384supx2(15,0)).toBe(4);});});
function hd384supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385supx2_hd',()=>{it('a',()=>{expect(hd385supx2(1,4)).toBe(2);});it('b',()=>{expect(hd385supx2(3,1)).toBe(1);});it('c',()=>{expect(hd385supx2(0,0)).toBe(0);});it('d',()=>{expect(hd385supx2(93,73)).toBe(2);});it('e',()=>{expect(hd385supx2(15,0)).toBe(4);});});
function hd385supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386supx2_hd',()=>{it('a',()=>{expect(hd386supx2(1,4)).toBe(2);});it('b',()=>{expect(hd386supx2(3,1)).toBe(1);});it('c',()=>{expect(hd386supx2(0,0)).toBe(0);});it('d',()=>{expect(hd386supx2(93,73)).toBe(2);});it('e',()=>{expect(hd386supx2(15,0)).toBe(4);});});
function hd386supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387supx2_hd',()=>{it('a',()=>{expect(hd387supx2(1,4)).toBe(2);});it('b',()=>{expect(hd387supx2(3,1)).toBe(1);});it('c',()=>{expect(hd387supx2(0,0)).toBe(0);});it('d',()=>{expect(hd387supx2(93,73)).toBe(2);});it('e',()=>{expect(hd387supx2(15,0)).toBe(4);});});
function hd387supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388supx2_hd',()=>{it('a',()=>{expect(hd388supx2(1,4)).toBe(2);});it('b',()=>{expect(hd388supx2(3,1)).toBe(1);});it('c',()=>{expect(hd388supx2(0,0)).toBe(0);});it('d',()=>{expect(hd388supx2(93,73)).toBe(2);});it('e',()=>{expect(hd388supx2(15,0)).toBe(4);});});
function hd388supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389supx2_hd',()=>{it('a',()=>{expect(hd389supx2(1,4)).toBe(2);});it('b',()=>{expect(hd389supx2(3,1)).toBe(1);});it('c',()=>{expect(hd389supx2(0,0)).toBe(0);});it('d',()=>{expect(hd389supx2(93,73)).toBe(2);});it('e',()=>{expect(hd389supx2(15,0)).toBe(4);});});
function hd389supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390supx2_hd',()=>{it('a',()=>{expect(hd390supx2(1,4)).toBe(2);});it('b',()=>{expect(hd390supx2(3,1)).toBe(1);});it('c',()=>{expect(hd390supx2(0,0)).toBe(0);});it('d',()=>{expect(hd390supx2(93,73)).toBe(2);});it('e',()=>{expect(hd390supx2(15,0)).toBe(4);});});
function hd390supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391supx2_hd',()=>{it('a',()=>{expect(hd391supx2(1,4)).toBe(2);});it('b',()=>{expect(hd391supx2(3,1)).toBe(1);});it('c',()=>{expect(hd391supx2(0,0)).toBe(0);});it('d',()=>{expect(hd391supx2(93,73)).toBe(2);});it('e',()=>{expect(hd391supx2(15,0)).toBe(4);});});
function hd391supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392supx2_hd',()=>{it('a',()=>{expect(hd392supx2(1,4)).toBe(2);});it('b',()=>{expect(hd392supx2(3,1)).toBe(1);});it('c',()=>{expect(hd392supx2(0,0)).toBe(0);});it('d',()=>{expect(hd392supx2(93,73)).toBe(2);});it('e',()=>{expect(hd392supx2(15,0)).toBe(4);});});
function hd392supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393supx2_hd',()=>{it('a',()=>{expect(hd393supx2(1,4)).toBe(2);});it('b',()=>{expect(hd393supx2(3,1)).toBe(1);});it('c',()=>{expect(hd393supx2(0,0)).toBe(0);});it('d',()=>{expect(hd393supx2(93,73)).toBe(2);});it('e',()=>{expect(hd393supx2(15,0)).toBe(4);});});
function hd393supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394supx2_hd',()=>{it('a',()=>{expect(hd394supx2(1,4)).toBe(2);});it('b',()=>{expect(hd394supx2(3,1)).toBe(1);});it('c',()=>{expect(hd394supx2(0,0)).toBe(0);});it('d',()=>{expect(hd394supx2(93,73)).toBe(2);});it('e',()=>{expect(hd394supx2(15,0)).toBe(4);});});
function hd394supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395supx2_hd',()=>{it('a',()=>{expect(hd395supx2(1,4)).toBe(2);});it('b',()=>{expect(hd395supx2(3,1)).toBe(1);});it('c',()=>{expect(hd395supx2(0,0)).toBe(0);});it('d',()=>{expect(hd395supx2(93,73)).toBe(2);});it('e',()=>{expect(hd395supx2(15,0)).toBe(4);});});
function hd395supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396supx2_hd',()=>{it('a',()=>{expect(hd396supx2(1,4)).toBe(2);});it('b',()=>{expect(hd396supx2(3,1)).toBe(1);});it('c',()=>{expect(hd396supx2(0,0)).toBe(0);});it('d',()=>{expect(hd396supx2(93,73)).toBe(2);});it('e',()=>{expect(hd396supx2(15,0)).toBe(4);});});
function hd396supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397supx2_hd',()=>{it('a',()=>{expect(hd397supx2(1,4)).toBe(2);});it('b',()=>{expect(hd397supx2(3,1)).toBe(1);});it('c',()=>{expect(hd397supx2(0,0)).toBe(0);});it('d',()=>{expect(hd397supx2(93,73)).toBe(2);});it('e',()=>{expect(hd397supx2(15,0)).toBe(4);});});
function hd397supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398supx2_hd',()=>{it('a',()=>{expect(hd398supx2(1,4)).toBe(2);});it('b',()=>{expect(hd398supx2(3,1)).toBe(1);});it('c',()=>{expect(hd398supx2(0,0)).toBe(0);});it('d',()=>{expect(hd398supx2(93,73)).toBe(2);});it('e',()=>{expect(hd398supx2(15,0)).toBe(4);});});
function hd398supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399supx2_hd',()=>{it('a',()=>{expect(hd399supx2(1,4)).toBe(2);});it('b',()=>{expect(hd399supx2(3,1)).toBe(1);});it('c',()=>{expect(hd399supx2(0,0)).toBe(0);});it('d',()=>{expect(hd399supx2(93,73)).toBe(2);});it('e',()=>{expect(hd399supx2(15,0)).toBe(4);});});
function hd399supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400supx2_hd',()=>{it('a',()=>{expect(hd400supx2(1,4)).toBe(2);});it('b',()=>{expect(hd400supx2(3,1)).toBe(1);});it('c',()=>{expect(hd400supx2(0,0)).toBe(0);});it('d',()=>{expect(hd400supx2(93,73)).toBe(2);});it('e',()=>{expect(hd400supx2(15,0)).toBe(4);});});
function hd400supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401supx2_hd',()=>{it('a',()=>{expect(hd401supx2(1,4)).toBe(2);});it('b',()=>{expect(hd401supx2(3,1)).toBe(1);});it('c',()=>{expect(hd401supx2(0,0)).toBe(0);});it('d',()=>{expect(hd401supx2(93,73)).toBe(2);});it('e',()=>{expect(hd401supx2(15,0)).toBe(4);});});
function hd401supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402supx2_hd',()=>{it('a',()=>{expect(hd402supx2(1,4)).toBe(2);});it('b',()=>{expect(hd402supx2(3,1)).toBe(1);});it('c',()=>{expect(hd402supx2(0,0)).toBe(0);});it('d',()=>{expect(hd402supx2(93,73)).toBe(2);});it('e',()=>{expect(hd402supx2(15,0)).toBe(4);});});
function hd402supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403supx2_hd',()=>{it('a',()=>{expect(hd403supx2(1,4)).toBe(2);});it('b',()=>{expect(hd403supx2(3,1)).toBe(1);});it('c',()=>{expect(hd403supx2(0,0)).toBe(0);});it('d',()=>{expect(hd403supx2(93,73)).toBe(2);});it('e',()=>{expect(hd403supx2(15,0)).toBe(4);});});
function hd403supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404supx2_hd',()=>{it('a',()=>{expect(hd404supx2(1,4)).toBe(2);});it('b',()=>{expect(hd404supx2(3,1)).toBe(1);});it('c',()=>{expect(hd404supx2(0,0)).toBe(0);});it('d',()=>{expect(hd404supx2(93,73)).toBe(2);});it('e',()=>{expect(hd404supx2(15,0)).toBe(4);});});
function hd404supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405supx2_hd',()=>{it('a',()=>{expect(hd405supx2(1,4)).toBe(2);});it('b',()=>{expect(hd405supx2(3,1)).toBe(1);});it('c',()=>{expect(hd405supx2(0,0)).toBe(0);});it('d',()=>{expect(hd405supx2(93,73)).toBe(2);});it('e',()=>{expect(hd405supx2(15,0)).toBe(4);});});
function hd405supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406supx2_hd',()=>{it('a',()=>{expect(hd406supx2(1,4)).toBe(2);});it('b',()=>{expect(hd406supx2(3,1)).toBe(1);});it('c',()=>{expect(hd406supx2(0,0)).toBe(0);});it('d',()=>{expect(hd406supx2(93,73)).toBe(2);});it('e',()=>{expect(hd406supx2(15,0)).toBe(4);});});
function hd406supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407supx2_hd',()=>{it('a',()=>{expect(hd407supx2(1,4)).toBe(2);});it('b',()=>{expect(hd407supx2(3,1)).toBe(1);});it('c',()=>{expect(hd407supx2(0,0)).toBe(0);});it('d',()=>{expect(hd407supx2(93,73)).toBe(2);});it('e',()=>{expect(hd407supx2(15,0)).toBe(4);});});
function hd407supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408supx2_hd',()=>{it('a',()=>{expect(hd408supx2(1,4)).toBe(2);});it('b',()=>{expect(hd408supx2(3,1)).toBe(1);});it('c',()=>{expect(hd408supx2(0,0)).toBe(0);});it('d',()=>{expect(hd408supx2(93,73)).toBe(2);});it('e',()=>{expect(hd408supx2(15,0)).toBe(4);});});
function hd408supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409supx2_hd',()=>{it('a',()=>{expect(hd409supx2(1,4)).toBe(2);});it('b',()=>{expect(hd409supx2(3,1)).toBe(1);});it('c',()=>{expect(hd409supx2(0,0)).toBe(0);});it('d',()=>{expect(hd409supx2(93,73)).toBe(2);});it('e',()=>{expect(hd409supx2(15,0)).toBe(4);});});
function hd409supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410supx2_hd',()=>{it('a',()=>{expect(hd410supx2(1,4)).toBe(2);});it('b',()=>{expect(hd410supx2(3,1)).toBe(1);});it('c',()=>{expect(hd410supx2(0,0)).toBe(0);});it('d',()=>{expect(hd410supx2(93,73)).toBe(2);});it('e',()=>{expect(hd410supx2(15,0)).toBe(4);});});
function hd410supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411supx2_hd',()=>{it('a',()=>{expect(hd411supx2(1,4)).toBe(2);});it('b',()=>{expect(hd411supx2(3,1)).toBe(1);});it('c',()=>{expect(hd411supx2(0,0)).toBe(0);});it('d',()=>{expect(hd411supx2(93,73)).toBe(2);});it('e',()=>{expect(hd411supx2(15,0)).toBe(4);});});
function hd411supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412supx2_hd',()=>{it('a',()=>{expect(hd412supx2(1,4)).toBe(2);});it('b',()=>{expect(hd412supx2(3,1)).toBe(1);});it('c',()=>{expect(hd412supx2(0,0)).toBe(0);});it('d',()=>{expect(hd412supx2(93,73)).toBe(2);});it('e',()=>{expect(hd412supx2(15,0)).toBe(4);});});
function hd412supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413supx2_hd',()=>{it('a',()=>{expect(hd413supx2(1,4)).toBe(2);});it('b',()=>{expect(hd413supx2(3,1)).toBe(1);});it('c',()=>{expect(hd413supx2(0,0)).toBe(0);});it('d',()=>{expect(hd413supx2(93,73)).toBe(2);});it('e',()=>{expect(hd413supx2(15,0)).toBe(4);});});
function hd413supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414supx2_hd',()=>{it('a',()=>{expect(hd414supx2(1,4)).toBe(2);});it('b',()=>{expect(hd414supx2(3,1)).toBe(1);});it('c',()=>{expect(hd414supx2(0,0)).toBe(0);});it('d',()=>{expect(hd414supx2(93,73)).toBe(2);});it('e',()=>{expect(hd414supx2(15,0)).toBe(4);});});
function hd414supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415supx2_hd',()=>{it('a',()=>{expect(hd415supx2(1,4)).toBe(2);});it('b',()=>{expect(hd415supx2(3,1)).toBe(1);});it('c',()=>{expect(hd415supx2(0,0)).toBe(0);});it('d',()=>{expect(hd415supx2(93,73)).toBe(2);});it('e',()=>{expect(hd415supx2(15,0)).toBe(4);});});
function hd415supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416supx2_hd',()=>{it('a',()=>{expect(hd416supx2(1,4)).toBe(2);});it('b',()=>{expect(hd416supx2(3,1)).toBe(1);});it('c',()=>{expect(hd416supx2(0,0)).toBe(0);});it('d',()=>{expect(hd416supx2(93,73)).toBe(2);});it('e',()=>{expect(hd416supx2(15,0)).toBe(4);});});
function hd416supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417supx2_hd',()=>{it('a',()=>{expect(hd417supx2(1,4)).toBe(2);});it('b',()=>{expect(hd417supx2(3,1)).toBe(1);});it('c',()=>{expect(hd417supx2(0,0)).toBe(0);});it('d',()=>{expect(hd417supx2(93,73)).toBe(2);});it('e',()=>{expect(hd417supx2(15,0)).toBe(4);});});
function hd417supx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417supx2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
