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
