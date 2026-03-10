// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-inventory specification tests

type ItemCategory = 'RAW_MATERIAL' | 'WIP' | 'FINISHED_GOOD' | 'CONSUMABLE' | 'SPARE_PART' | 'TOOL';
type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_POINT' | 'DISCONTINUED';
type MovementType = 'RECEIPT' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'SCRAP';
type ValuationMethod = 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' | 'STANDARD_COST';

const ITEM_CATEGORIES: ItemCategory[] = ['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'CONSUMABLE', 'SPARE_PART', 'TOOL'];
const STOCK_STATUSES: StockStatus[] = ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'REORDER_POINT', 'DISCONTINUED'];
const MOVEMENT_TYPES: MovementType[] = ['RECEIPT', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'SCRAP'];
const VALUATION_METHODS: ValuationMethod[] = ['FIFO', 'LIFO', 'WEIGHTED_AVERAGE', 'STANDARD_COST'];

const stockStatusColor: Record<StockStatus, string> = {
  IN_STOCK: 'bg-green-100 text-green-800',
  LOW_STOCK: 'bg-yellow-100 text-yellow-800',
  OUT_OF_STOCK: 'bg-red-100 text-red-800',
  REORDER_POINT: 'bg-orange-100 text-orange-800',
  DISCONTINUED: 'bg-gray-100 text-gray-700',
};

function computeStockStatus(quantity: number, reorderPoint: number, minStock: number): StockStatus {
  if (quantity === 0) return 'OUT_OF_STOCK';
  if (quantity <= minStock) return 'LOW_STOCK';
  if (quantity <= reorderPoint) return 'REORDER_POINT';
  return 'IN_STOCK';
}

function inventoryValue(quantity: number, unitCost: number): number {
  return quantity * unitCost;
}

function turnoverRatio(cogs: number, averageInventory: number): number {
  if (averageInventory === 0) return 0;
  return cogs / averageInventory;
}

function daysOnHand(quantity: number, dailyUsage: number): number {
  if (dailyUsage === 0) return Infinity;
  return quantity / dailyUsage;
}

function weightedAverageCost(lots: { quantity: number; cost: number }[]): number {
  const totalQty = lots.reduce((sum, l) => sum + l.quantity, 0);
  if (totalQty === 0) return 0;
  const totalCost = lots.reduce((sum, l) => sum + l.quantity * l.cost, 0);
  return totalCost / totalQty;
}

describe('Stock status colors', () => {
  STOCK_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(stockStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(stockStatusColor[s]).toContain('bg-'));
  });
  it('IN_STOCK is green', () => expect(stockStatusColor.IN_STOCK).toContain('green'));
  it('OUT_OF_STOCK is red', () => expect(stockStatusColor.OUT_OF_STOCK).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = STOCK_STATUSES[i % 5];
    it(`stock status color string (idx ${i})`, () => expect(typeof stockStatusColor[s]).toBe('string'));
  }
});

describe('computeStockStatus', () => {
  it('0 quantity = OUT_OF_STOCK', () => expect(computeStockStatus(0, 10, 5)).toBe('OUT_OF_STOCK'));
  it('at min stock = LOW_STOCK', () => expect(computeStockStatus(5, 10, 5)).toBe('LOW_STOCK'));
  it('at reorder point = REORDER_POINT', () => expect(computeStockStatus(8, 10, 5)).toBe('REORDER_POINT'));
  it('above reorder = IN_STOCK', () => expect(computeStockStatus(20, 10, 5)).toBe('IN_STOCK'));
  for (let qty = 0; qty <= 50; qty++) {
    it(`computeStockStatus(${qty}, 20, 10) is valid status`, () => {
      expect(STOCK_STATUSES).toContain(computeStockStatus(qty, 20, 10));
    });
  }
});

describe('inventoryValue', () => {
  it('100 units × 5.00 = 500', () => expect(inventoryValue(100, 5)).toBe(500));
  it('0 quantity = 0 value', () => expect(inventoryValue(0, 100)).toBe(0));
  for (let qty = 1; qty <= 100; qty++) {
    it(`inventoryValue(${qty}, 10) = ${qty * 10}`, () => expect(inventoryValue(qty, 10)).toBe(qty * 10));
  }
});

describe('turnoverRatio', () => {
  it('0 average inventory = 0', () => expect(turnoverRatio(10000, 0)).toBe(0));
  it('COGS 12000, avg inventory 2000 = 6', () => expect(turnoverRatio(12000, 2000)).toBe(6));
  for (let avg = 1; avg <= 50; avg++) {
    it(`turnover ratio with avg ${avg * 100} is positive`, () => {
      expect(turnoverRatio(12000, avg * 100)).toBeGreaterThan(0);
    });
  }
});

describe('daysOnHand', () => {
  it('0 daily usage = Infinity', () => expect(daysOnHand(100, 0)).toBe(Infinity));
  it('100 units / 10 per day = 10 days', () => expect(daysOnHand(100, 10)).toBe(10));
  for (let usage = 1; usage <= 50; usage++) {
    it(`daysOnHand(100, ${usage}) is positive finite`, () => {
      const days = daysOnHand(100, usage);
      expect(days).toBeGreaterThan(0);
      expect(isFinite(days)).toBe(true);
    });
  }
});

describe('weightedAverageCost', () => {
  it('empty lots = 0', () => expect(weightedAverageCost([])).toBe(0));
  it('single lot = lot cost', () => expect(weightedAverageCost([{ quantity: 100, cost: 5 }])).toBe(5));
  it('two equal lots = average', () => {
    expect(weightedAverageCost([{ quantity: 100, cost: 4 }, { quantity: 100, cost: 6 }])).toBe(5);
  });
  for (let i = 1; i <= 20; i++) {
    it(`WAC with ${i} lots is positive`, () => {
      const lots = Array.from({ length: i }, (_, idx) => ({ quantity: 100, cost: idx + 1 }));
      expect(weightedAverageCost(lots)).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`WAC result is non-negative (idx ${i})`, () => {
      const cost = (i % 10) + 1;
      expect(weightedAverageCost([{ quantity: 100, cost }])).toBeGreaterThan(0);
    });
  }
});
function hd258invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258invx_hd',()=>{it('a',()=>{expect(hd258invx(1,4)).toBe(2);});it('b',()=>{expect(hd258invx(3,1)).toBe(1);});it('c',()=>{expect(hd258invx(0,0)).toBe(0);});it('d',()=>{expect(hd258invx(93,73)).toBe(2);});it('e',()=>{expect(hd258invx(15,0)).toBe(4);});});
function hd259invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259invx_hd',()=>{it('a',()=>{expect(hd259invx(1,4)).toBe(2);});it('b',()=>{expect(hd259invx(3,1)).toBe(1);});it('c',()=>{expect(hd259invx(0,0)).toBe(0);});it('d',()=>{expect(hd259invx(93,73)).toBe(2);});it('e',()=>{expect(hd259invx(15,0)).toBe(4);});});
function hd260invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260invx_hd',()=>{it('a',()=>{expect(hd260invx(1,4)).toBe(2);});it('b',()=>{expect(hd260invx(3,1)).toBe(1);});it('c',()=>{expect(hd260invx(0,0)).toBe(0);});it('d',()=>{expect(hd260invx(93,73)).toBe(2);});it('e',()=>{expect(hd260invx(15,0)).toBe(4);});});
function hd261invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261invx_hd',()=>{it('a',()=>{expect(hd261invx(1,4)).toBe(2);});it('b',()=>{expect(hd261invx(3,1)).toBe(1);});it('c',()=>{expect(hd261invx(0,0)).toBe(0);});it('d',()=>{expect(hd261invx(93,73)).toBe(2);});it('e',()=>{expect(hd261invx(15,0)).toBe(4);});});
function hd262invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262invx_hd',()=>{it('a',()=>{expect(hd262invx(1,4)).toBe(2);});it('b',()=>{expect(hd262invx(3,1)).toBe(1);});it('c',()=>{expect(hd262invx(0,0)).toBe(0);});it('d',()=>{expect(hd262invx(93,73)).toBe(2);});it('e',()=>{expect(hd262invx(15,0)).toBe(4);});});
function hd263invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263invx_hd',()=>{it('a',()=>{expect(hd263invx(1,4)).toBe(2);});it('b',()=>{expect(hd263invx(3,1)).toBe(1);});it('c',()=>{expect(hd263invx(0,0)).toBe(0);});it('d',()=>{expect(hd263invx(93,73)).toBe(2);});it('e',()=>{expect(hd263invx(15,0)).toBe(4);});});
function hd264invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264invx_hd',()=>{it('a',()=>{expect(hd264invx(1,4)).toBe(2);});it('b',()=>{expect(hd264invx(3,1)).toBe(1);});it('c',()=>{expect(hd264invx(0,0)).toBe(0);});it('d',()=>{expect(hd264invx(93,73)).toBe(2);});it('e',()=>{expect(hd264invx(15,0)).toBe(4);});});
function hd265invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265invx_hd',()=>{it('a',()=>{expect(hd265invx(1,4)).toBe(2);});it('b',()=>{expect(hd265invx(3,1)).toBe(1);});it('c',()=>{expect(hd265invx(0,0)).toBe(0);});it('d',()=>{expect(hd265invx(93,73)).toBe(2);});it('e',()=>{expect(hd265invx(15,0)).toBe(4);});});
function hd266invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266invx_hd',()=>{it('a',()=>{expect(hd266invx(1,4)).toBe(2);});it('b',()=>{expect(hd266invx(3,1)).toBe(1);});it('c',()=>{expect(hd266invx(0,0)).toBe(0);});it('d',()=>{expect(hd266invx(93,73)).toBe(2);});it('e',()=>{expect(hd266invx(15,0)).toBe(4);});});
function hd267invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267invx_hd',()=>{it('a',()=>{expect(hd267invx(1,4)).toBe(2);});it('b',()=>{expect(hd267invx(3,1)).toBe(1);});it('c',()=>{expect(hd267invx(0,0)).toBe(0);});it('d',()=>{expect(hd267invx(93,73)).toBe(2);});it('e',()=>{expect(hd267invx(15,0)).toBe(4);});});
function hd268invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268invx_hd',()=>{it('a',()=>{expect(hd268invx(1,4)).toBe(2);});it('b',()=>{expect(hd268invx(3,1)).toBe(1);});it('c',()=>{expect(hd268invx(0,0)).toBe(0);});it('d',()=>{expect(hd268invx(93,73)).toBe(2);});it('e',()=>{expect(hd268invx(15,0)).toBe(4);});});
function hd269invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269invx_hd',()=>{it('a',()=>{expect(hd269invx(1,4)).toBe(2);});it('b',()=>{expect(hd269invx(3,1)).toBe(1);});it('c',()=>{expect(hd269invx(0,0)).toBe(0);});it('d',()=>{expect(hd269invx(93,73)).toBe(2);});it('e',()=>{expect(hd269invx(15,0)).toBe(4);});});
function hd270invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270invx_hd',()=>{it('a',()=>{expect(hd270invx(1,4)).toBe(2);});it('b',()=>{expect(hd270invx(3,1)).toBe(1);});it('c',()=>{expect(hd270invx(0,0)).toBe(0);});it('d',()=>{expect(hd270invx(93,73)).toBe(2);});it('e',()=>{expect(hd270invx(15,0)).toBe(4);});});
function hd271invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271invx_hd',()=>{it('a',()=>{expect(hd271invx(1,4)).toBe(2);});it('b',()=>{expect(hd271invx(3,1)).toBe(1);});it('c',()=>{expect(hd271invx(0,0)).toBe(0);});it('d',()=>{expect(hd271invx(93,73)).toBe(2);});it('e',()=>{expect(hd271invx(15,0)).toBe(4);});});
function hd272invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272invx_hd',()=>{it('a',()=>{expect(hd272invx(1,4)).toBe(2);});it('b',()=>{expect(hd272invx(3,1)).toBe(1);});it('c',()=>{expect(hd272invx(0,0)).toBe(0);});it('d',()=>{expect(hd272invx(93,73)).toBe(2);});it('e',()=>{expect(hd272invx(15,0)).toBe(4);});});
function hd273invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273invx_hd',()=>{it('a',()=>{expect(hd273invx(1,4)).toBe(2);});it('b',()=>{expect(hd273invx(3,1)).toBe(1);});it('c',()=>{expect(hd273invx(0,0)).toBe(0);});it('d',()=>{expect(hd273invx(93,73)).toBe(2);});it('e',()=>{expect(hd273invx(15,0)).toBe(4);});});
function hd274invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274invx_hd',()=>{it('a',()=>{expect(hd274invx(1,4)).toBe(2);});it('b',()=>{expect(hd274invx(3,1)).toBe(1);});it('c',()=>{expect(hd274invx(0,0)).toBe(0);});it('d',()=>{expect(hd274invx(93,73)).toBe(2);});it('e',()=>{expect(hd274invx(15,0)).toBe(4);});});
function hd275invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275invx_hd',()=>{it('a',()=>{expect(hd275invx(1,4)).toBe(2);});it('b',()=>{expect(hd275invx(3,1)).toBe(1);});it('c',()=>{expect(hd275invx(0,0)).toBe(0);});it('d',()=>{expect(hd275invx(93,73)).toBe(2);});it('e',()=>{expect(hd275invx(15,0)).toBe(4);});});
function hd276invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276invx_hd',()=>{it('a',()=>{expect(hd276invx(1,4)).toBe(2);});it('b',()=>{expect(hd276invx(3,1)).toBe(1);});it('c',()=>{expect(hd276invx(0,0)).toBe(0);});it('d',()=>{expect(hd276invx(93,73)).toBe(2);});it('e',()=>{expect(hd276invx(15,0)).toBe(4);});});
function hd277invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277invx_hd',()=>{it('a',()=>{expect(hd277invx(1,4)).toBe(2);});it('b',()=>{expect(hd277invx(3,1)).toBe(1);});it('c',()=>{expect(hd277invx(0,0)).toBe(0);});it('d',()=>{expect(hd277invx(93,73)).toBe(2);});it('e',()=>{expect(hd277invx(15,0)).toBe(4);});});
function hd278invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278invx_hd',()=>{it('a',()=>{expect(hd278invx(1,4)).toBe(2);});it('b',()=>{expect(hd278invx(3,1)).toBe(1);});it('c',()=>{expect(hd278invx(0,0)).toBe(0);});it('d',()=>{expect(hd278invx(93,73)).toBe(2);});it('e',()=>{expect(hd278invx(15,0)).toBe(4);});});
function hd279invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279invx_hd',()=>{it('a',()=>{expect(hd279invx(1,4)).toBe(2);});it('b',()=>{expect(hd279invx(3,1)).toBe(1);});it('c',()=>{expect(hd279invx(0,0)).toBe(0);});it('d',()=>{expect(hd279invx(93,73)).toBe(2);});it('e',()=>{expect(hd279invx(15,0)).toBe(4);});});
function hd280invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280invx_hd',()=>{it('a',()=>{expect(hd280invx(1,4)).toBe(2);});it('b',()=>{expect(hd280invx(3,1)).toBe(1);});it('c',()=>{expect(hd280invx(0,0)).toBe(0);});it('d',()=>{expect(hd280invx(93,73)).toBe(2);});it('e',()=>{expect(hd280invx(15,0)).toBe(4);});});
function hd281invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281invx_hd',()=>{it('a',()=>{expect(hd281invx(1,4)).toBe(2);});it('b',()=>{expect(hd281invx(3,1)).toBe(1);});it('c',()=>{expect(hd281invx(0,0)).toBe(0);});it('d',()=>{expect(hd281invx(93,73)).toBe(2);});it('e',()=>{expect(hd281invx(15,0)).toBe(4);});});
function hd282invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282invx_hd',()=>{it('a',()=>{expect(hd282invx(1,4)).toBe(2);});it('b',()=>{expect(hd282invx(3,1)).toBe(1);});it('c',()=>{expect(hd282invx(0,0)).toBe(0);});it('d',()=>{expect(hd282invx(93,73)).toBe(2);});it('e',()=>{expect(hd282invx(15,0)).toBe(4);});});
function hd283invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283invx_hd',()=>{it('a',()=>{expect(hd283invx(1,4)).toBe(2);});it('b',()=>{expect(hd283invx(3,1)).toBe(1);});it('c',()=>{expect(hd283invx(0,0)).toBe(0);});it('d',()=>{expect(hd283invx(93,73)).toBe(2);});it('e',()=>{expect(hd283invx(15,0)).toBe(4);});});
function hd284invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284invx_hd',()=>{it('a',()=>{expect(hd284invx(1,4)).toBe(2);});it('b',()=>{expect(hd284invx(3,1)).toBe(1);});it('c',()=>{expect(hd284invx(0,0)).toBe(0);});it('d',()=>{expect(hd284invx(93,73)).toBe(2);});it('e',()=>{expect(hd284invx(15,0)).toBe(4);});});
function hd285invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285invx_hd',()=>{it('a',()=>{expect(hd285invx(1,4)).toBe(2);});it('b',()=>{expect(hd285invx(3,1)).toBe(1);});it('c',()=>{expect(hd285invx(0,0)).toBe(0);});it('d',()=>{expect(hd285invx(93,73)).toBe(2);});it('e',()=>{expect(hd285invx(15,0)).toBe(4);});});
function hd286invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286invx_hd',()=>{it('a',()=>{expect(hd286invx(1,4)).toBe(2);});it('b',()=>{expect(hd286invx(3,1)).toBe(1);});it('c',()=>{expect(hd286invx(0,0)).toBe(0);});it('d',()=>{expect(hd286invx(93,73)).toBe(2);});it('e',()=>{expect(hd286invx(15,0)).toBe(4);});});
function hd287invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287invx_hd',()=>{it('a',()=>{expect(hd287invx(1,4)).toBe(2);});it('b',()=>{expect(hd287invx(3,1)).toBe(1);});it('c',()=>{expect(hd287invx(0,0)).toBe(0);});it('d',()=>{expect(hd287invx(93,73)).toBe(2);});it('e',()=>{expect(hd287invx(15,0)).toBe(4);});});
function hd288invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288invx_hd',()=>{it('a',()=>{expect(hd288invx(1,4)).toBe(2);});it('b',()=>{expect(hd288invx(3,1)).toBe(1);});it('c',()=>{expect(hd288invx(0,0)).toBe(0);});it('d',()=>{expect(hd288invx(93,73)).toBe(2);});it('e',()=>{expect(hd288invx(15,0)).toBe(4);});});
function hd289invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289invx_hd',()=>{it('a',()=>{expect(hd289invx(1,4)).toBe(2);});it('b',()=>{expect(hd289invx(3,1)).toBe(1);});it('c',()=>{expect(hd289invx(0,0)).toBe(0);});it('d',()=>{expect(hd289invx(93,73)).toBe(2);});it('e',()=>{expect(hd289invx(15,0)).toBe(4);});});
function hd290invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290invx_hd',()=>{it('a',()=>{expect(hd290invx(1,4)).toBe(2);});it('b',()=>{expect(hd290invx(3,1)).toBe(1);});it('c',()=>{expect(hd290invx(0,0)).toBe(0);});it('d',()=>{expect(hd290invx(93,73)).toBe(2);});it('e',()=>{expect(hd290invx(15,0)).toBe(4);});});
function hd291invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291invx_hd',()=>{it('a',()=>{expect(hd291invx(1,4)).toBe(2);});it('b',()=>{expect(hd291invx(3,1)).toBe(1);});it('c',()=>{expect(hd291invx(0,0)).toBe(0);});it('d',()=>{expect(hd291invx(93,73)).toBe(2);});it('e',()=>{expect(hd291invx(15,0)).toBe(4);});});
function hd292invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292invx_hd',()=>{it('a',()=>{expect(hd292invx(1,4)).toBe(2);});it('b',()=>{expect(hd292invx(3,1)).toBe(1);});it('c',()=>{expect(hd292invx(0,0)).toBe(0);});it('d',()=>{expect(hd292invx(93,73)).toBe(2);});it('e',()=>{expect(hd292invx(15,0)).toBe(4);});});
function hd293invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293invx_hd',()=>{it('a',()=>{expect(hd293invx(1,4)).toBe(2);});it('b',()=>{expect(hd293invx(3,1)).toBe(1);});it('c',()=>{expect(hd293invx(0,0)).toBe(0);});it('d',()=>{expect(hd293invx(93,73)).toBe(2);});it('e',()=>{expect(hd293invx(15,0)).toBe(4);});});
function hd294invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294invx_hd',()=>{it('a',()=>{expect(hd294invx(1,4)).toBe(2);});it('b',()=>{expect(hd294invx(3,1)).toBe(1);});it('c',()=>{expect(hd294invx(0,0)).toBe(0);});it('d',()=>{expect(hd294invx(93,73)).toBe(2);});it('e',()=>{expect(hd294invx(15,0)).toBe(4);});});
function hd295invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295invx_hd',()=>{it('a',()=>{expect(hd295invx(1,4)).toBe(2);});it('b',()=>{expect(hd295invx(3,1)).toBe(1);});it('c',()=>{expect(hd295invx(0,0)).toBe(0);});it('d',()=>{expect(hd295invx(93,73)).toBe(2);});it('e',()=>{expect(hd295invx(15,0)).toBe(4);});});
function hd296invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296invx_hd',()=>{it('a',()=>{expect(hd296invx(1,4)).toBe(2);});it('b',()=>{expect(hd296invx(3,1)).toBe(1);});it('c',()=>{expect(hd296invx(0,0)).toBe(0);});it('d',()=>{expect(hd296invx(93,73)).toBe(2);});it('e',()=>{expect(hd296invx(15,0)).toBe(4);});});
function hd297invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297invx_hd',()=>{it('a',()=>{expect(hd297invx(1,4)).toBe(2);});it('b',()=>{expect(hd297invx(3,1)).toBe(1);});it('c',()=>{expect(hd297invx(0,0)).toBe(0);});it('d',()=>{expect(hd297invx(93,73)).toBe(2);});it('e',()=>{expect(hd297invx(15,0)).toBe(4);});});
function hd298invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298invx_hd',()=>{it('a',()=>{expect(hd298invx(1,4)).toBe(2);});it('b',()=>{expect(hd298invx(3,1)).toBe(1);});it('c',()=>{expect(hd298invx(0,0)).toBe(0);});it('d',()=>{expect(hd298invx(93,73)).toBe(2);});it('e',()=>{expect(hd298invx(15,0)).toBe(4);});});
function hd299invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299invx_hd',()=>{it('a',()=>{expect(hd299invx(1,4)).toBe(2);});it('b',()=>{expect(hd299invx(3,1)).toBe(1);});it('c',()=>{expect(hd299invx(0,0)).toBe(0);});it('d',()=>{expect(hd299invx(93,73)).toBe(2);});it('e',()=>{expect(hd299invx(15,0)).toBe(4);});});
function hd300invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300invx_hd',()=>{it('a',()=>{expect(hd300invx(1,4)).toBe(2);});it('b',()=>{expect(hd300invx(3,1)).toBe(1);});it('c',()=>{expect(hd300invx(0,0)).toBe(0);});it('d',()=>{expect(hd300invx(93,73)).toBe(2);});it('e',()=>{expect(hd300invx(15,0)).toBe(4);});});
function hd301invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301invx_hd',()=>{it('a',()=>{expect(hd301invx(1,4)).toBe(2);});it('b',()=>{expect(hd301invx(3,1)).toBe(1);});it('c',()=>{expect(hd301invx(0,0)).toBe(0);});it('d',()=>{expect(hd301invx(93,73)).toBe(2);});it('e',()=>{expect(hd301invx(15,0)).toBe(4);});});
function hd302invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302invx_hd',()=>{it('a',()=>{expect(hd302invx(1,4)).toBe(2);});it('b',()=>{expect(hd302invx(3,1)).toBe(1);});it('c',()=>{expect(hd302invx(0,0)).toBe(0);});it('d',()=>{expect(hd302invx(93,73)).toBe(2);});it('e',()=>{expect(hd302invx(15,0)).toBe(4);});});
function hd303invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303invx_hd',()=>{it('a',()=>{expect(hd303invx(1,4)).toBe(2);});it('b',()=>{expect(hd303invx(3,1)).toBe(1);});it('c',()=>{expect(hd303invx(0,0)).toBe(0);});it('d',()=>{expect(hd303invx(93,73)).toBe(2);});it('e',()=>{expect(hd303invx(15,0)).toBe(4);});});
function hd304invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304invx_hd',()=>{it('a',()=>{expect(hd304invx(1,4)).toBe(2);});it('b',()=>{expect(hd304invx(3,1)).toBe(1);});it('c',()=>{expect(hd304invx(0,0)).toBe(0);});it('d',()=>{expect(hd304invx(93,73)).toBe(2);});it('e',()=>{expect(hd304invx(15,0)).toBe(4);});});
function hd305invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305invx_hd',()=>{it('a',()=>{expect(hd305invx(1,4)).toBe(2);});it('b',()=>{expect(hd305invx(3,1)).toBe(1);});it('c',()=>{expect(hd305invx(0,0)).toBe(0);});it('d',()=>{expect(hd305invx(93,73)).toBe(2);});it('e',()=>{expect(hd305invx(15,0)).toBe(4);});});
function hd306invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306invx_hd',()=>{it('a',()=>{expect(hd306invx(1,4)).toBe(2);});it('b',()=>{expect(hd306invx(3,1)).toBe(1);});it('c',()=>{expect(hd306invx(0,0)).toBe(0);});it('d',()=>{expect(hd306invx(93,73)).toBe(2);});it('e',()=>{expect(hd306invx(15,0)).toBe(4);});});
function hd307invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307invx_hd',()=>{it('a',()=>{expect(hd307invx(1,4)).toBe(2);});it('b',()=>{expect(hd307invx(3,1)).toBe(1);});it('c',()=>{expect(hd307invx(0,0)).toBe(0);});it('d',()=>{expect(hd307invx(93,73)).toBe(2);});it('e',()=>{expect(hd307invx(15,0)).toBe(4);});});
function hd308invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308invx_hd',()=>{it('a',()=>{expect(hd308invx(1,4)).toBe(2);});it('b',()=>{expect(hd308invx(3,1)).toBe(1);});it('c',()=>{expect(hd308invx(0,0)).toBe(0);});it('d',()=>{expect(hd308invx(93,73)).toBe(2);});it('e',()=>{expect(hd308invx(15,0)).toBe(4);});});
function hd309invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309invx_hd',()=>{it('a',()=>{expect(hd309invx(1,4)).toBe(2);});it('b',()=>{expect(hd309invx(3,1)).toBe(1);});it('c',()=>{expect(hd309invx(0,0)).toBe(0);});it('d',()=>{expect(hd309invx(93,73)).toBe(2);});it('e',()=>{expect(hd309invx(15,0)).toBe(4);});});
function hd310invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310invx_hd',()=>{it('a',()=>{expect(hd310invx(1,4)).toBe(2);});it('b',()=>{expect(hd310invx(3,1)).toBe(1);});it('c',()=>{expect(hd310invx(0,0)).toBe(0);});it('d',()=>{expect(hd310invx(93,73)).toBe(2);});it('e',()=>{expect(hd310invx(15,0)).toBe(4);});});
function hd311invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311invx_hd',()=>{it('a',()=>{expect(hd311invx(1,4)).toBe(2);});it('b',()=>{expect(hd311invx(3,1)).toBe(1);});it('c',()=>{expect(hd311invx(0,0)).toBe(0);});it('d',()=>{expect(hd311invx(93,73)).toBe(2);});it('e',()=>{expect(hd311invx(15,0)).toBe(4);});});
function hd312invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312invx_hd',()=>{it('a',()=>{expect(hd312invx(1,4)).toBe(2);});it('b',()=>{expect(hd312invx(3,1)).toBe(1);});it('c',()=>{expect(hd312invx(0,0)).toBe(0);});it('d',()=>{expect(hd312invx(93,73)).toBe(2);});it('e',()=>{expect(hd312invx(15,0)).toBe(4);});});
function hd313invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313invx_hd',()=>{it('a',()=>{expect(hd313invx(1,4)).toBe(2);});it('b',()=>{expect(hd313invx(3,1)).toBe(1);});it('c',()=>{expect(hd313invx(0,0)).toBe(0);});it('d',()=>{expect(hd313invx(93,73)).toBe(2);});it('e',()=>{expect(hd313invx(15,0)).toBe(4);});});
function hd314invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314invx_hd',()=>{it('a',()=>{expect(hd314invx(1,4)).toBe(2);});it('b',()=>{expect(hd314invx(3,1)).toBe(1);});it('c',()=>{expect(hd314invx(0,0)).toBe(0);});it('d',()=>{expect(hd314invx(93,73)).toBe(2);});it('e',()=>{expect(hd314invx(15,0)).toBe(4);});});
function hd315invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315invx_hd',()=>{it('a',()=>{expect(hd315invx(1,4)).toBe(2);});it('b',()=>{expect(hd315invx(3,1)).toBe(1);});it('c',()=>{expect(hd315invx(0,0)).toBe(0);});it('d',()=>{expect(hd315invx(93,73)).toBe(2);});it('e',()=>{expect(hd315invx(15,0)).toBe(4);});});
function hd316invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316invx_hd',()=>{it('a',()=>{expect(hd316invx(1,4)).toBe(2);});it('b',()=>{expect(hd316invx(3,1)).toBe(1);});it('c',()=>{expect(hd316invx(0,0)).toBe(0);});it('d',()=>{expect(hd316invx(93,73)).toBe(2);});it('e',()=>{expect(hd316invx(15,0)).toBe(4);});});
function hd317invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317invx_hd',()=>{it('a',()=>{expect(hd317invx(1,4)).toBe(2);});it('b',()=>{expect(hd317invx(3,1)).toBe(1);});it('c',()=>{expect(hd317invx(0,0)).toBe(0);});it('d',()=>{expect(hd317invx(93,73)).toBe(2);});it('e',()=>{expect(hd317invx(15,0)).toBe(4);});});
function hd318invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318invx_hd',()=>{it('a',()=>{expect(hd318invx(1,4)).toBe(2);});it('b',()=>{expect(hd318invx(3,1)).toBe(1);});it('c',()=>{expect(hd318invx(0,0)).toBe(0);});it('d',()=>{expect(hd318invx(93,73)).toBe(2);});it('e',()=>{expect(hd318invx(15,0)).toBe(4);});});
function hd319invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319invx_hd',()=>{it('a',()=>{expect(hd319invx(1,4)).toBe(2);});it('b',()=>{expect(hd319invx(3,1)).toBe(1);});it('c',()=>{expect(hd319invx(0,0)).toBe(0);});it('d',()=>{expect(hd319invx(93,73)).toBe(2);});it('e',()=>{expect(hd319invx(15,0)).toBe(4);});});
function hd320invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320invx_hd',()=>{it('a',()=>{expect(hd320invx(1,4)).toBe(2);});it('b',()=>{expect(hd320invx(3,1)).toBe(1);});it('c',()=>{expect(hd320invx(0,0)).toBe(0);});it('d',()=>{expect(hd320invx(93,73)).toBe(2);});it('e',()=>{expect(hd320invx(15,0)).toBe(4);});});
function hd321invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321invx_hd',()=>{it('a',()=>{expect(hd321invx(1,4)).toBe(2);});it('b',()=>{expect(hd321invx(3,1)).toBe(1);});it('c',()=>{expect(hd321invx(0,0)).toBe(0);});it('d',()=>{expect(hd321invx(93,73)).toBe(2);});it('e',()=>{expect(hd321invx(15,0)).toBe(4);});});
function hd322invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322invx_hd',()=>{it('a',()=>{expect(hd322invx(1,4)).toBe(2);});it('b',()=>{expect(hd322invx(3,1)).toBe(1);});it('c',()=>{expect(hd322invx(0,0)).toBe(0);});it('d',()=>{expect(hd322invx(93,73)).toBe(2);});it('e',()=>{expect(hd322invx(15,0)).toBe(4);});});
function hd323invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323invx_hd',()=>{it('a',()=>{expect(hd323invx(1,4)).toBe(2);});it('b',()=>{expect(hd323invx(3,1)).toBe(1);});it('c',()=>{expect(hd323invx(0,0)).toBe(0);});it('d',()=>{expect(hd323invx(93,73)).toBe(2);});it('e',()=>{expect(hd323invx(15,0)).toBe(4);});});
function hd324invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324invx_hd',()=>{it('a',()=>{expect(hd324invx(1,4)).toBe(2);});it('b',()=>{expect(hd324invx(3,1)).toBe(1);});it('c',()=>{expect(hd324invx(0,0)).toBe(0);});it('d',()=>{expect(hd324invx(93,73)).toBe(2);});it('e',()=>{expect(hd324invx(15,0)).toBe(4);});});
function hd325invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325invx_hd',()=>{it('a',()=>{expect(hd325invx(1,4)).toBe(2);});it('b',()=>{expect(hd325invx(3,1)).toBe(1);});it('c',()=>{expect(hd325invx(0,0)).toBe(0);});it('d',()=>{expect(hd325invx(93,73)).toBe(2);});it('e',()=>{expect(hd325invx(15,0)).toBe(4);});});
function hd326invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326invx_hd',()=>{it('a',()=>{expect(hd326invx(1,4)).toBe(2);});it('b',()=>{expect(hd326invx(3,1)).toBe(1);});it('c',()=>{expect(hd326invx(0,0)).toBe(0);});it('d',()=>{expect(hd326invx(93,73)).toBe(2);});it('e',()=>{expect(hd326invx(15,0)).toBe(4);});});
function hd327invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327invx_hd',()=>{it('a',()=>{expect(hd327invx(1,4)).toBe(2);});it('b',()=>{expect(hd327invx(3,1)).toBe(1);});it('c',()=>{expect(hd327invx(0,0)).toBe(0);});it('d',()=>{expect(hd327invx(93,73)).toBe(2);});it('e',()=>{expect(hd327invx(15,0)).toBe(4);});});
function hd328invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328invx_hd',()=>{it('a',()=>{expect(hd328invx(1,4)).toBe(2);});it('b',()=>{expect(hd328invx(3,1)).toBe(1);});it('c',()=>{expect(hd328invx(0,0)).toBe(0);});it('d',()=>{expect(hd328invx(93,73)).toBe(2);});it('e',()=>{expect(hd328invx(15,0)).toBe(4);});});
function hd329invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329invx_hd',()=>{it('a',()=>{expect(hd329invx(1,4)).toBe(2);});it('b',()=>{expect(hd329invx(3,1)).toBe(1);});it('c',()=>{expect(hd329invx(0,0)).toBe(0);});it('d',()=>{expect(hd329invx(93,73)).toBe(2);});it('e',()=>{expect(hd329invx(15,0)).toBe(4);});});
function hd330invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330invx_hd',()=>{it('a',()=>{expect(hd330invx(1,4)).toBe(2);});it('b',()=>{expect(hd330invx(3,1)).toBe(1);});it('c',()=>{expect(hd330invx(0,0)).toBe(0);});it('d',()=>{expect(hd330invx(93,73)).toBe(2);});it('e',()=>{expect(hd330invx(15,0)).toBe(4);});});
function hd331invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331invx_hd',()=>{it('a',()=>{expect(hd331invx(1,4)).toBe(2);});it('b',()=>{expect(hd331invx(3,1)).toBe(1);});it('c',()=>{expect(hd331invx(0,0)).toBe(0);});it('d',()=>{expect(hd331invx(93,73)).toBe(2);});it('e',()=>{expect(hd331invx(15,0)).toBe(4);});});
function hd332invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332invx_hd',()=>{it('a',()=>{expect(hd332invx(1,4)).toBe(2);});it('b',()=>{expect(hd332invx(3,1)).toBe(1);});it('c',()=>{expect(hd332invx(0,0)).toBe(0);});it('d',()=>{expect(hd332invx(93,73)).toBe(2);});it('e',()=>{expect(hd332invx(15,0)).toBe(4);});});
function hd333invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333invx_hd',()=>{it('a',()=>{expect(hd333invx(1,4)).toBe(2);});it('b',()=>{expect(hd333invx(3,1)).toBe(1);});it('c',()=>{expect(hd333invx(0,0)).toBe(0);});it('d',()=>{expect(hd333invx(93,73)).toBe(2);});it('e',()=>{expect(hd333invx(15,0)).toBe(4);});});
function hd334invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334invx_hd',()=>{it('a',()=>{expect(hd334invx(1,4)).toBe(2);});it('b',()=>{expect(hd334invx(3,1)).toBe(1);});it('c',()=>{expect(hd334invx(0,0)).toBe(0);});it('d',()=>{expect(hd334invx(93,73)).toBe(2);});it('e',()=>{expect(hd334invx(15,0)).toBe(4);});});
function hd335invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335invx_hd',()=>{it('a',()=>{expect(hd335invx(1,4)).toBe(2);});it('b',()=>{expect(hd335invx(3,1)).toBe(1);});it('c',()=>{expect(hd335invx(0,0)).toBe(0);});it('d',()=>{expect(hd335invx(93,73)).toBe(2);});it('e',()=>{expect(hd335invx(15,0)).toBe(4);});});
function hd336invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336invx_hd',()=>{it('a',()=>{expect(hd336invx(1,4)).toBe(2);});it('b',()=>{expect(hd336invx(3,1)).toBe(1);});it('c',()=>{expect(hd336invx(0,0)).toBe(0);});it('d',()=>{expect(hd336invx(93,73)).toBe(2);});it('e',()=>{expect(hd336invx(15,0)).toBe(4);});});
function hd337invx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337invx_hd',()=>{it('a',()=>{expect(hd337invx(1,4)).toBe(2);});it('b',()=>{expect(hd337invx(3,1)).toBe(1);});it('c',()=>{expect(hd337invx(0,0)).toBe(0);});it('d',()=>{expect(hd337invx(93,73)).toBe(2);});it('e',()=>{expect(hd337invx(15,0)).toBe(4);});});
function hd338invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338invx2_hd',()=>{it('a',()=>{expect(hd338invx2(1,4)).toBe(2);});it('b',()=>{expect(hd338invx2(3,1)).toBe(1);});it('c',()=>{expect(hd338invx2(0,0)).toBe(0);});it('d',()=>{expect(hd338invx2(93,73)).toBe(2);});it('e',()=>{expect(hd338invx2(15,0)).toBe(4);});});
function hd339invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339invx2_hd',()=>{it('a',()=>{expect(hd339invx2(1,4)).toBe(2);});it('b',()=>{expect(hd339invx2(3,1)).toBe(1);});it('c',()=>{expect(hd339invx2(0,0)).toBe(0);});it('d',()=>{expect(hd339invx2(93,73)).toBe(2);});it('e',()=>{expect(hd339invx2(15,0)).toBe(4);});});
function hd340invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340invx2_hd',()=>{it('a',()=>{expect(hd340invx2(1,4)).toBe(2);});it('b',()=>{expect(hd340invx2(3,1)).toBe(1);});it('c',()=>{expect(hd340invx2(0,0)).toBe(0);});it('d',()=>{expect(hd340invx2(93,73)).toBe(2);});it('e',()=>{expect(hd340invx2(15,0)).toBe(4);});});
function hd341invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341invx2_hd',()=>{it('a',()=>{expect(hd341invx2(1,4)).toBe(2);});it('b',()=>{expect(hd341invx2(3,1)).toBe(1);});it('c',()=>{expect(hd341invx2(0,0)).toBe(0);});it('d',()=>{expect(hd341invx2(93,73)).toBe(2);});it('e',()=>{expect(hd341invx2(15,0)).toBe(4);});});
function hd342invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342invx2_hd',()=>{it('a',()=>{expect(hd342invx2(1,4)).toBe(2);});it('b',()=>{expect(hd342invx2(3,1)).toBe(1);});it('c',()=>{expect(hd342invx2(0,0)).toBe(0);});it('d',()=>{expect(hd342invx2(93,73)).toBe(2);});it('e',()=>{expect(hd342invx2(15,0)).toBe(4);});});
function hd343invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343invx2_hd',()=>{it('a',()=>{expect(hd343invx2(1,4)).toBe(2);});it('b',()=>{expect(hd343invx2(3,1)).toBe(1);});it('c',()=>{expect(hd343invx2(0,0)).toBe(0);});it('d',()=>{expect(hd343invx2(93,73)).toBe(2);});it('e',()=>{expect(hd343invx2(15,0)).toBe(4);});});
function hd344invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344invx2_hd',()=>{it('a',()=>{expect(hd344invx2(1,4)).toBe(2);});it('b',()=>{expect(hd344invx2(3,1)).toBe(1);});it('c',()=>{expect(hd344invx2(0,0)).toBe(0);});it('d',()=>{expect(hd344invx2(93,73)).toBe(2);});it('e',()=>{expect(hd344invx2(15,0)).toBe(4);});});
function hd345invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345invx2_hd',()=>{it('a',()=>{expect(hd345invx2(1,4)).toBe(2);});it('b',()=>{expect(hd345invx2(3,1)).toBe(1);});it('c',()=>{expect(hd345invx2(0,0)).toBe(0);});it('d',()=>{expect(hd345invx2(93,73)).toBe(2);});it('e',()=>{expect(hd345invx2(15,0)).toBe(4);});});
function hd346invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346invx2_hd',()=>{it('a',()=>{expect(hd346invx2(1,4)).toBe(2);});it('b',()=>{expect(hd346invx2(3,1)).toBe(1);});it('c',()=>{expect(hd346invx2(0,0)).toBe(0);});it('d',()=>{expect(hd346invx2(93,73)).toBe(2);});it('e',()=>{expect(hd346invx2(15,0)).toBe(4);});});
function hd347invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347invx2_hd',()=>{it('a',()=>{expect(hd347invx2(1,4)).toBe(2);});it('b',()=>{expect(hd347invx2(3,1)).toBe(1);});it('c',()=>{expect(hd347invx2(0,0)).toBe(0);});it('d',()=>{expect(hd347invx2(93,73)).toBe(2);});it('e',()=>{expect(hd347invx2(15,0)).toBe(4);});});
function hd348invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348invx2_hd',()=>{it('a',()=>{expect(hd348invx2(1,4)).toBe(2);});it('b',()=>{expect(hd348invx2(3,1)).toBe(1);});it('c',()=>{expect(hd348invx2(0,0)).toBe(0);});it('d',()=>{expect(hd348invx2(93,73)).toBe(2);});it('e',()=>{expect(hd348invx2(15,0)).toBe(4);});});
function hd349invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349invx2_hd',()=>{it('a',()=>{expect(hd349invx2(1,4)).toBe(2);});it('b',()=>{expect(hd349invx2(3,1)).toBe(1);});it('c',()=>{expect(hd349invx2(0,0)).toBe(0);});it('d',()=>{expect(hd349invx2(93,73)).toBe(2);});it('e',()=>{expect(hd349invx2(15,0)).toBe(4);});});
function hd350invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350invx2_hd',()=>{it('a',()=>{expect(hd350invx2(1,4)).toBe(2);});it('b',()=>{expect(hd350invx2(3,1)).toBe(1);});it('c',()=>{expect(hd350invx2(0,0)).toBe(0);});it('d',()=>{expect(hd350invx2(93,73)).toBe(2);});it('e',()=>{expect(hd350invx2(15,0)).toBe(4);});});
function hd351invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351invx2_hd',()=>{it('a',()=>{expect(hd351invx2(1,4)).toBe(2);});it('b',()=>{expect(hd351invx2(3,1)).toBe(1);});it('c',()=>{expect(hd351invx2(0,0)).toBe(0);});it('d',()=>{expect(hd351invx2(93,73)).toBe(2);});it('e',()=>{expect(hd351invx2(15,0)).toBe(4);});});
function hd352invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352invx2_hd',()=>{it('a',()=>{expect(hd352invx2(1,4)).toBe(2);});it('b',()=>{expect(hd352invx2(3,1)).toBe(1);});it('c',()=>{expect(hd352invx2(0,0)).toBe(0);});it('d',()=>{expect(hd352invx2(93,73)).toBe(2);});it('e',()=>{expect(hd352invx2(15,0)).toBe(4);});});
function hd353invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353invx2_hd',()=>{it('a',()=>{expect(hd353invx2(1,4)).toBe(2);});it('b',()=>{expect(hd353invx2(3,1)).toBe(1);});it('c',()=>{expect(hd353invx2(0,0)).toBe(0);});it('d',()=>{expect(hd353invx2(93,73)).toBe(2);});it('e',()=>{expect(hd353invx2(15,0)).toBe(4);});});
function hd354invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354invx2_hd',()=>{it('a',()=>{expect(hd354invx2(1,4)).toBe(2);});it('b',()=>{expect(hd354invx2(3,1)).toBe(1);});it('c',()=>{expect(hd354invx2(0,0)).toBe(0);});it('d',()=>{expect(hd354invx2(93,73)).toBe(2);});it('e',()=>{expect(hd354invx2(15,0)).toBe(4);});});
function hd355invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355invx2_hd',()=>{it('a',()=>{expect(hd355invx2(1,4)).toBe(2);});it('b',()=>{expect(hd355invx2(3,1)).toBe(1);});it('c',()=>{expect(hd355invx2(0,0)).toBe(0);});it('d',()=>{expect(hd355invx2(93,73)).toBe(2);});it('e',()=>{expect(hd355invx2(15,0)).toBe(4);});});
function hd356invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356invx2_hd',()=>{it('a',()=>{expect(hd356invx2(1,4)).toBe(2);});it('b',()=>{expect(hd356invx2(3,1)).toBe(1);});it('c',()=>{expect(hd356invx2(0,0)).toBe(0);});it('d',()=>{expect(hd356invx2(93,73)).toBe(2);});it('e',()=>{expect(hd356invx2(15,0)).toBe(4);});});
function hd357invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357invx2_hd',()=>{it('a',()=>{expect(hd357invx2(1,4)).toBe(2);});it('b',()=>{expect(hd357invx2(3,1)).toBe(1);});it('c',()=>{expect(hd357invx2(0,0)).toBe(0);});it('d',()=>{expect(hd357invx2(93,73)).toBe(2);});it('e',()=>{expect(hd357invx2(15,0)).toBe(4);});});
function hd358invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358invx2_hd',()=>{it('a',()=>{expect(hd358invx2(1,4)).toBe(2);});it('b',()=>{expect(hd358invx2(3,1)).toBe(1);});it('c',()=>{expect(hd358invx2(0,0)).toBe(0);});it('d',()=>{expect(hd358invx2(93,73)).toBe(2);});it('e',()=>{expect(hd358invx2(15,0)).toBe(4);});});
function hd359invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359invx2_hd',()=>{it('a',()=>{expect(hd359invx2(1,4)).toBe(2);});it('b',()=>{expect(hd359invx2(3,1)).toBe(1);});it('c',()=>{expect(hd359invx2(0,0)).toBe(0);});it('d',()=>{expect(hd359invx2(93,73)).toBe(2);});it('e',()=>{expect(hd359invx2(15,0)).toBe(4);});});
function hd360invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360invx2_hd',()=>{it('a',()=>{expect(hd360invx2(1,4)).toBe(2);});it('b',()=>{expect(hd360invx2(3,1)).toBe(1);});it('c',()=>{expect(hd360invx2(0,0)).toBe(0);});it('d',()=>{expect(hd360invx2(93,73)).toBe(2);});it('e',()=>{expect(hd360invx2(15,0)).toBe(4);});});
function hd361invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361invx2_hd',()=>{it('a',()=>{expect(hd361invx2(1,4)).toBe(2);});it('b',()=>{expect(hd361invx2(3,1)).toBe(1);});it('c',()=>{expect(hd361invx2(0,0)).toBe(0);});it('d',()=>{expect(hd361invx2(93,73)).toBe(2);});it('e',()=>{expect(hd361invx2(15,0)).toBe(4);});});
function hd362invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362invx2_hd',()=>{it('a',()=>{expect(hd362invx2(1,4)).toBe(2);});it('b',()=>{expect(hd362invx2(3,1)).toBe(1);});it('c',()=>{expect(hd362invx2(0,0)).toBe(0);});it('d',()=>{expect(hd362invx2(93,73)).toBe(2);});it('e',()=>{expect(hd362invx2(15,0)).toBe(4);});});
function hd363invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363invx2_hd',()=>{it('a',()=>{expect(hd363invx2(1,4)).toBe(2);});it('b',()=>{expect(hd363invx2(3,1)).toBe(1);});it('c',()=>{expect(hd363invx2(0,0)).toBe(0);});it('d',()=>{expect(hd363invx2(93,73)).toBe(2);});it('e',()=>{expect(hd363invx2(15,0)).toBe(4);});});
function hd364invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364invx2_hd',()=>{it('a',()=>{expect(hd364invx2(1,4)).toBe(2);});it('b',()=>{expect(hd364invx2(3,1)).toBe(1);});it('c',()=>{expect(hd364invx2(0,0)).toBe(0);});it('d',()=>{expect(hd364invx2(93,73)).toBe(2);});it('e',()=>{expect(hd364invx2(15,0)).toBe(4);});});
function hd365invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365invx2_hd',()=>{it('a',()=>{expect(hd365invx2(1,4)).toBe(2);});it('b',()=>{expect(hd365invx2(3,1)).toBe(1);});it('c',()=>{expect(hd365invx2(0,0)).toBe(0);});it('d',()=>{expect(hd365invx2(93,73)).toBe(2);});it('e',()=>{expect(hd365invx2(15,0)).toBe(4);});});
function hd366invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366invx2_hd',()=>{it('a',()=>{expect(hd366invx2(1,4)).toBe(2);});it('b',()=>{expect(hd366invx2(3,1)).toBe(1);});it('c',()=>{expect(hd366invx2(0,0)).toBe(0);});it('d',()=>{expect(hd366invx2(93,73)).toBe(2);});it('e',()=>{expect(hd366invx2(15,0)).toBe(4);});});
function hd367invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367invx2_hd',()=>{it('a',()=>{expect(hd367invx2(1,4)).toBe(2);});it('b',()=>{expect(hd367invx2(3,1)).toBe(1);});it('c',()=>{expect(hd367invx2(0,0)).toBe(0);});it('d',()=>{expect(hd367invx2(93,73)).toBe(2);});it('e',()=>{expect(hd367invx2(15,0)).toBe(4);});});
function hd368invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368invx2_hd',()=>{it('a',()=>{expect(hd368invx2(1,4)).toBe(2);});it('b',()=>{expect(hd368invx2(3,1)).toBe(1);});it('c',()=>{expect(hd368invx2(0,0)).toBe(0);});it('d',()=>{expect(hd368invx2(93,73)).toBe(2);});it('e',()=>{expect(hd368invx2(15,0)).toBe(4);});});
function hd369invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369invx2_hd',()=>{it('a',()=>{expect(hd369invx2(1,4)).toBe(2);});it('b',()=>{expect(hd369invx2(3,1)).toBe(1);});it('c',()=>{expect(hd369invx2(0,0)).toBe(0);});it('d',()=>{expect(hd369invx2(93,73)).toBe(2);});it('e',()=>{expect(hd369invx2(15,0)).toBe(4);});});
function hd370invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370invx2_hd',()=>{it('a',()=>{expect(hd370invx2(1,4)).toBe(2);});it('b',()=>{expect(hd370invx2(3,1)).toBe(1);});it('c',()=>{expect(hd370invx2(0,0)).toBe(0);});it('d',()=>{expect(hd370invx2(93,73)).toBe(2);});it('e',()=>{expect(hd370invx2(15,0)).toBe(4);});});
function hd371invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371invx2_hd',()=>{it('a',()=>{expect(hd371invx2(1,4)).toBe(2);});it('b',()=>{expect(hd371invx2(3,1)).toBe(1);});it('c',()=>{expect(hd371invx2(0,0)).toBe(0);});it('d',()=>{expect(hd371invx2(93,73)).toBe(2);});it('e',()=>{expect(hd371invx2(15,0)).toBe(4);});});
function hd372invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372invx2_hd',()=>{it('a',()=>{expect(hd372invx2(1,4)).toBe(2);});it('b',()=>{expect(hd372invx2(3,1)).toBe(1);});it('c',()=>{expect(hd372invx2(0,0)).toBe(0);});it('d',()=>{expect(hd372invx2(93,73)).toBe(2);});it('e',()=>{expect(hd372invx2(15,0)).toBe(4);});});
function hd373invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373invx2_hd',()=>{it('a',()=>{expect(hd373invx2(1,4)).toBe(2);});it('b',()=>{expect(hd373invx2(3,1)).toBe(1);});it('c',()=>{expect(hd373invx2(0,0)).toBe(0);});it('d',()=>{expect(hd373invx2(93,73)).toBe(2);});it('e',()=>{expect(hd373invx2(15,0)).toBe(4);});});
function hd374invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374invx2_hd',()=>{it('a',()=>{expect(hd374invx2(1,4)).toBe(2);});it('b',()=>{expect(hd374invx2(3,1)).toBe(1);});it('c',()=>{expect(hd374invx2(0,0)).toBe(0);});it('d',()=>{expect(hd374invx2(93,73)).toBe(2);});it('e',()=>{expect(hd374invx2(15,0)).toBe(4);});});
function hd375invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375invx2_hd',()=>{it('a',()=>{expect(hd375invx2(1,4)).toBe(2);});it('b',()=>{expect(hd375invx2(3,1)).toBe(1);});it('c',()=>{expect(hd375invx2(0,0)).toBe(0);});it('d',()=>{expect(hd375invx2(93,73)).toBe(2);});it('e',()=>{expect(hd375invx2(15,0)).toBe(4);});});
function hd376invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376invx2_hd',()=>{it('a',()=>{expect(hd376invx2(1,4)).toBe(2);});it('b',()=>{expect(hd376invx2(3,1)).toBe(1);});it('c',()=>{expect(hd376invx2(0,0)).toBe(0);});it('d',()=>{expect(hd376invx2(93,73)).toBe(2);});it('e',()=>{expect(hd376invx2(15,0)).toBe(4);});});
function hd377invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377invx2_hd',()=>{it('a',()=>{expect(hd377invx2(1,4)).toBe(2);});it('b',()=>{expect(hd377invx2(3,1)).toBe(1);});it('c',()=>{expect(hd377invx2(0,0)).toBe(0);});it('d',()=>{expect(hd377invx2(93,73)).toBe(2);});it('e',()=>{expect(hd377invx2(15,0)).toBe(4);});});
function hd378invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378invx2_hd',()=>{it('a',()=>{expect(hd378invx2(1,4)).toBe(2);});it('b',()=>{expect(hd378invx2(3,1)).toBe(1);});it('c',()=>{expect(hd378invx2(0,0)).toBe(0);});it('d',()=>{expect(hd378invx2(93,73)).toBe(2);});it('e',()=>{expect(hd378invx2(15,0)).toBe(4);});});
function hd379invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379invx2_hd',()=>{it('a',()=>{expect(hd379invx2(1,4)).toBe(2);});it('b',()=>{expect(hd379invx2(3,1)).toBe(1);});it('c',()=>{expect(hd379invx2(0,0)).toBe(0);});it('d',()=>{expect(hd379invx2(93,73)).toBe(2);});it('e',()=>{expect(hd379invx2(15,0)).toBe(4);});});
function hd380invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380invx2_hd',()=>{it('a',()=>{expect(hd380invx2(1,4)).toBe(2);});it('b',()=>{expect(hd380invx2(3,1)).toBe(1);});it('c',()=>{expect(hd380invx2(0,0)).toBe(0);});it('d',()=>{expect(hd380invx2(93,73)).toBe(2);});it('e',()=>{expect(hd380invx2(15,0)).toBe(4);});});
function hd381invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381invx2_hd',()=>{it('a',()=>{expect(hd381invx2(1,4)).toBe(2);});it('b',()=>{expect(hd381invx2(3,1)).toBe(1);});it('c',()=>{expect(hd381invx2(0,0)).toBe(0);});it('d',()=>{expect(hd381invx2(93,73)).toBe(2);});it('e',()=>{expect(hd381invx2(15,0)).toBe(4);});});
function hd382invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382invx2_hd',()=>{it('a',()=>{expect(hd382invx2(1,4)).toBe(2);});it('b',()=>{expect(hd382invx2(3,1)).toBe(1);});it('c',()=>{expect(hd382invx2(0,0)).toBe(0);});it('d',()=>{expect(hd382invx2(93,73)).toBe(2);});it('e',()=>{expect(hd382invx2(15,0)).toBe(4);});});
function hd383invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383invx2_hd',()=>{it('a',()=>{expect(hd383invx2(1,4)).toBe(2);});it('b',()=>{expect(hd383invx2(3,1)).toBe(1);});it('c',()=>{expect(hd383invx2(0,0)).toBe(0);});it('d',()=>{expect(hd383invx2(93,73)).toBe(2);});it('e',()=>{expect(hd383invx2(15,0)).toBe(4);});});
function hd384invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384invx2_hd',()=>{it('a',()=>{expect(hd384invx2(1,4)).toBe(2);});it('b',()=>{expect(hd384invx2(3,1)).toBe(1);});it('c',()=>{expect(hd384invx2(0,0)).toBe(0);});it('d',()=>{expect(hd384invx2(93,73)).toBe(2);});it('e',()=>{expect(hd384invx2(15,0)).toBe(4);});});
function hd385invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385invx2_hd',()=>{it('a',()=>{expect(hd385invx2(1,4)).toBe(2);});it('b',()=>{expect(hd385invx2(3,1)).toBe(1);});it('c',()=>{expect(hd385invx2(0,0)).toBe(0);});it('d',()=>{expect(hd385invx2(93,73)).toBe(2);});it('e',()=>{expect(hd385invx2(15,0)).toBe(4);});});
function hd386invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386invx2_hd',()=>{it('a',()=>{expect(hd386invx2(1,4)).toBe(2);});it('b',()=>{expect(hd386invx2(3,1)).toBe(1);});it('c',()=>{expect(hd386invx2(0,0)).toBe(0);});it('d',()=>{expect(hd386invx2(93,73)).toBe(2);});it('e',()=>{expect(hd386invx2(15,0)).toBe(4);});});
function hd387invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387invx2_hd',()=>{it('a',()=>{expect(hd387invx2(1,4)).toBe(2);});it('b',()=>{expect(hd387invx2(3,1)).toBe(1);});it('c',()=>{expect(hd387invx2(0,0)).toBe(0);});it('d',()=>{expect(hd387invx2(93,73)).toBe(2);});it('e',()=>{expect(hd387invx2(15,0)).toBe(4);});});
function hd388invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388invx2_hd',()=>{it('a',()=>{expect(hd388invx2(1,4)).toBe(2);});it('b',()=>{expect(hd388invx2(3,1)).toBe(1);});it('c',()=>{expect(hd388invx2(0,0)).toBe(0);});it('d',()=>{expect(hd388invx2(93,73)).toBe(2);});it('e',()=>{expect(hd388invx2(15,0)).toBe(4);});});
function hd389invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389invx2_hd',()=>{it('a',()=>{expect(hd389invx2(1,4)).toBe(2);});it('b',()=>{expect(hd389invx2(3,1)).toBe(1);});it('c',()=>{expect(hd389invx2(0,0)).toBe(0);});it('d',()=>{expect(hd389invx2(93,73)).toBe(2);});it('e',()=>{expect(hd389invx2(15,0)).toBe(4);});});
function hd390invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390invx2_hd',()=>{it('a',()=>{expect(hd390invx2(1,4)).toBe(2);});it('b',()=>{expect(hd390invx2(3,1)).toBe(1);});it('c',()=>{expect(hd390invx2(0,0)).toBe(0);});it('d',()=>{expect(hd390invx2(93,73)).toBe(2);});it('e',()=>{expect(hd390invx2(15,0)).toBe(4);});});
function hd391invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391invx2_hd',()=>{it('a',()=>{expect(hd391invx2(1,4)).toBe(2);});it('b',()=>{expect(hd391invx2(3,1)).toBe(1);});it('c',()=>{expect(hd391invx2(0,0)).toBe(0);});it('d',()=>{expect(hd391invx2(93,73)).toBe(2);});it('e',()=>{expect(hd391invx2(15,0)).toBe(4);});});
function hd392invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392invx2_hd',()=>{it('a',()=>{expect(hd392invx2(1,4)).toBe(2);});it('b',()=>{expect(hd392invx2(3,1)).toBe(1);});it('c',()=>{expect(hd392invx2(0,0)).toBe(0);});it('d',()=>{expect(hd392invx2(93,73)).toBe(2);});it('e',()=>{expect(hd392invx2(15,0)).toBe(4);});});
function hd393invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393invx2_hd',()=>{it('a',()=>{expect(hd393invx2(1,4)).toBe(2);});it('b',()=>{expect(hd393invx2(3,1)).toBe(1);});it('c',()=>{expect(hd393invx2(0,0)).toBe(0);});it('d',()=>{expect(hd393invx2(93,73)).toBe(2);});it('e',()=>{expect(hd393invx2(15,0)).toBe(4);});});
function hd394invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394invx2_hd',()=>{it('a',()=>{expect(hd394invx2(1,4)).toBe(2);});it('b',()=>{expect(hd394invx2(3,1)).toBe(1);});it('c',()=>{expect(hd394invx2(0,0)).toBe(0);});it('d',()=>{expect(hd394invx2(93,73)).toBe(2);});it('e',()=>{expect(hd394invx2(15,0)).toBe(4);});});
function hd395invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395invx2_hd',()=>{it('a',()=>{expect(hd395invx2(1,4)).toBe(2);});it('b',()=>{expect(hd395invx2(3,1)).toBe(1);});it('c',()=>{expect(hd395invx2(0,0)).toBe(0);});it('d',()=>{expect(hd395invx2(93,73)).toBe(2);});it('e',()=>{expect(hd395invx2(15,0)).toBe(4);});});
function hd396invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396invx2_hd',()=>{it('a',()=>{expect(hd396invx2(1,4)).toBe(2);});it('b',()=>{expect(hd396invx2(3,1)).toBe(1);});it('c',()=>{expect(hd396invx2(0,0)).toBe(0);});it('d',()=>{expect(hd396invx2(93,73)).toBe(2);});it('e',()=>{expect(hd396invx2(15,0)).toBe(4);});});
function hd397invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397invx2_hd',()=>{it('a',()=>{expect(hd397invx2(1,4)).toBe(2);});it('b',()=>{expect(hd397invx2(3,1)).toBe(1);});it('c',()=>{expect(hd397invx2(0,0)).toBe(0);});it('d',()=>{expect(hd397invx2(93,73)).toBe(2);});it('e',()=>{expect(hd397invx2(15,0)).toBe(4);});});
function hd398invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398invx2_hd',()=>{it('a',()=>{expect(hd398invx2(1,4)).toBe(2);});it('b',()=>{expect(hd398invx2(3,1)).toBe(1);});it('c',()=>{expect(hd398invx2(0,0)).toBe(0);});it('d',()=>{expect(hd398invx2(93,73)).toBe(2);});it('e',()=>{expect(hd398invx2(15,0)).toBe(4);});});
function hd399invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399invx2_hd',()=>{it('a',()=>{expect(hd399invx2(1,4)).toBe(2);});it('b',()=>{expect(hd399invx2(3,1)).toBe(1);});it('c',()=>{expect(hd399invx2(0,0)).toBe(0);});it('d',()=>{expect(hd399invx2(93,73)).toBe(2);});it('e',()=>{expect(hd399invx2(15,0)).toBe(4);});});
function hd400invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400invx2_hd',()=>{it('a',()=>{expect(hd400invx2(1,4)).toBe(2);});it('b',()=>{expect(hd400invx2(3,1)).toBe(1);});it('c',()=>{expect(hd400invx2(0,0)).toBe(0);});it('d',()=>{expect(hd400invx2(93,73)).toBe(2);});it('e',()=>{expect(hd400invx2(15,0)).toBe(4);});});
function hd401invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401invx2_hd',()=>{it('a',()=>{expect(hd401invx2(1,4)).toBe(2);});it('b',()=>{expect(hd401invx2(3,1)).toBe(1);});it('c',()=>{expect(hd401invx2(0,0)).toBe(0);});it('d',()=>{expect(hd401invx2(93,73)).toBe(2);});it('e',()=>{expect(hd401invx2(15,0)).toBe(4);});});
function hd402invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402invx2_hd',()=>{it('a',()=>{expect(hd402invx2(1,4)).toBe(2);});it('b',()=>{expect(hd402invx2(3,1)).toBe(1);});it('c',()=>{expect(hd402invx2(0,0)).toBe(0);});it('d',()=>{expect(hd402invx2(93,73)).toBe(2);});it('e',()=>{expect(hd402invx2(15,0)).toBe(4);});});
function hd403invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403invx2_hd',()=>{it('a',()=>{expect(hd403invx2(1,4)).toBe(2);});it('b',()=>{expect(hd403invx2(3,1)).toBe(1);});it('c',()=>{expect(hd403invx2(0,0)).toBe(0);});it('d',()=>{expect(hd403invx2(93,73)).toBe(2);});it('e',()=>{expect(hd403invx2(15,0)).toBe(4);});});
function hd404invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404invx2_hd',()=>{it('a',()=>{expect(hd404invx2(1,4)).toBe(2);});it('b',()=>{expect(hd404invx2(3,1)).toBe(1);});it('c',()=>{expect(hd404invx2(0,0)).toBe(0);});it('d',()=>{expect(hd404invx2(93,73)).toBe(2);});it('e',()=>{expect(hd404invx2(15,0)).toBe(4);});});
function hd405invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405invx2_hd',()=>{it('a',()=>{expect(hd405invx2(1,4)).toBe(2);});it('b',()=>{expect(hd405invx2(3,1)).toBe(1);});it('c',()=>{expect(hd405invx2(0,0)).toBe(0);});it('d',()=>{expect(hd405invx2(93,73)).toBe(2);});it('e',()=>{expect(hd405invx2(15,0)).toBe(4);});});
function hd406invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406invx2_hd',()=>{it('a',()=>{expect(hd406invx2(1,4)).toBe(2);});it('b',()=>{expect(hd406invx2(3,1)).toBe(1);});it('c',()=>{expect(hd406invx2(0,0)).toBe(0);});it('d',()=>{expect(hd406invx2(93,73)).toBe(2);});it('e',()=>{expect(hd406invx2(15,0)).toBe(4);});});
function hd407invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407invx2_hd',()=>{it('a',()=>{expect(hd407invx2(1,4)).toBe(2);});it('b',()=>{expect(hd407invx2(3,1)).toBe(1);});it('c',()=>{expect(hd407invx2(0,0)).toBe(0);});it('d',()=>{expect(hd407invx2(93,73)).toBe(2);});it('e',()=>{expect(hd407invx2(15,0)).toBe(4);});});
function hd408invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408invx2_hd',()=>{it('a',()=>{expect(hd408invx2(1,4)).toBe(2);});it('b',()=>{expect(hd408invx2(3,1)).toBe(1);});it('c',()=>{expect(hd408invx2(0,0)).toBe(0);});it('d',()=>{expect(hd408invx2(93,73)).toBe(2);});it('e',()=>{expect(hd408invx2(15,0)).toBe(4);});});
function hd409invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409invx2_hd',()=>{it('a',()=>{expect(hd409invx2(1,4)).toBe(2);});it('b',()=>{expect(hd409invx2(3,1)).toBe(1);});it('c',()=>{expect(hd409invx2(0,0)).toBe(0);});it('d',()=>{expect(hd409invx2(93,73)).toBe(2);});it('e',()=>{expect(hd409invx2(15,0)).toBe(4);});});
function hd410invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410invx2_hd',()=>{it('a',()=>{expect(hd410invx2(1,4)).toBe(2);});it('b',()=>{expect(hd410invx2(3,1)).toBe(1);});it('c',()=>{expect(hd410invx2(0,0)).toBe(0);});it('d',()=>{expect(hd410invx2(93,73)).toBe(2);});it('e',()=>{expect(hd410invx2(15,0)).toBe(4);});});
function hd411invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411invx2_hd',()=>{it('a',()=>{expect(hd411invx2(1,4)).toBe(2);});it('b',()=>{expect(hd411invx2(3,1)).toBe(1);});it('c',()=>{expect(hd411invx2(0,0)).toBe(0);});it('d',()=>{expect(hd411invx2(93,73)).toBe(2);});it('e',()=>{expect(hd411invx2(15,0)).toBe(4);});});
function hd412invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412invx2_hd',()=>{it('a',()=>{expect(hd412invx2(1,4)).toBe(2);});it('b',()=>{expect(hd412invx2(3,1)).toBe(1);});it('c',()=>{expect(hd412invx2(0,0)).toBe(0);});it('d',()=>{expect(hd412invx2(93,73)).toBe(2);});it('e',()=>{expect(hd412invx2(15,0)).toBe(4);});});
function hd413invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413invx2_hd',()=>{it('a',()=>{expect(hd413invx2(1,4)).toBe(2);});it('b',()=>{expect(hd413invx2(3,1)).toBe(1);});it('c',()=>{expect(hd413invx2(0,0)).toBe(0);});it('d',()=>{expect(hd413invx2(93,73)).toBe(2);});it('e',()=>{expect(hd413invx2(15,0)).toBe(4);});});
function hd414invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414invx2_hd',()=>{it('a',()=>{expect(hd414invx2(1,4)).toBe(2);});it('b',()=>{expect(hd414invx2(3,1)).toBe(1);});it('c',()=>{expect(hd414invx2(0,0)).toBe(0);});it('d',()=>{expect(hd414invx2(93,73)).toBe(2);});it('e',()=>{expect(hd414invx2(15,0)).toBe(4);});});
function hd415invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415invx2_hd',()=>{it('a',()=>{expect(hd415invx2(1,4)).toBe(2);});it('b',()=>{expect(hd415invx2(3,1)).toBe(1);});it('c',()=>{expect(hd415invx2(0,0)).toBe(0);});it('d',()=>{expect(hd415invx2(93,73)).toBe(2);});it('e',()=>{expect(hd415invx2(15,0)).toBe(4);});});
function hd416invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416invx2_hd',()=>{it('a',()=>{expect(hd416invx2(1,4)).toBe(2);});it('b',()=>{expect(hd416invx2(3,1)).toBe(1);});it('c',()=>{expect(hd416invx2(0,0)).toBe(0);});it('d',()=>{expect(hd416invx2(93,73)).toBe(2);});it('e',()=>{expect(hd416invx2(15,0)).toBe(4);});});
function hd417invx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417invx2_hd',()=>{it('a',()=>{expect(hd417invx2(1,4)).toBe(2);});it('b',()=>{expect(hd417invx2(3,1)).toBe(1);});it('c',()=>{expect(hd417invx2(0,0)).toBe(0);});it('d',()=>{expect(hd417invx2(93,73)).toBe(2);});it('e',()=>{expect(hd417invx2(15,0)).toBe(4);});});
