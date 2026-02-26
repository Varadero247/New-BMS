import { Discount, DiscountType, LineItem, PriceQuote, PriceRule, PriceTier, PricingModel } from './types';

export function applyTier(tiers: PriceTier[], qty: number): number {
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  for (const tier of sorted) {
    if (qty >= tier.minQty && (tier.maxQty === undefined || qty <= tier.maxQty)) {
      return tier.unitPrice;
    }
  }
  return tiers[0]?.unitPrice ?? 0;
}

export function applyVolumePrice(tiers: PriceTier[], qty: number): number {
  const unitPrice = applyTier(tiers, qty);
  return unitPrice * qty;
}

export function applyTieredPrice(tiers: PriceTier[], qty: number): number {
  let total = 0;
  let remaining = qty;
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
  for (const tier of sorted) {
    if (remaining <= 0) break;
    const tierMax = tier.maxQty ?? Infinity;
    const tierMin = tier.minQty;
    const tierQty = Math.min(remaining, tierMax - tierMin + 1);
    total += tierQty * tier.unitPrice;
    remaining -= tierQty;
  }
  return total;
}

export function applyDiscount(price: number, discount: Discount, qty: number): number {
  if (discount.minQty !== undefined && qty < discount.minQty) return 0;
  if (discount.maxQty !== undefined && qty > discount.maxQty) return 0;
  switch (discount.type) {
    case 'percentage': return price * (discount.value / 100);
    case 'fixed': return Math.min(discount.value, price);
    case 'buy_x_get_y': return 0; // simplified
    default: return 0;
  }
}

export function calculateSubtotal(unitPrice: number, qty: number): number {
  return Math.max(0, unitPrice * qty);
}

export function calculateTax(amount: number, taxRate: number): number {
  return Math.max(0, amount * (taxRate / 100));
}

export function calculateLineItem(rule: PriceRule, qty: number): LineItem {
  let unitPrice = rule.basePrice;
  let subtotal = 0;

  if (rule.model === 'tiered' && rule.tiers) {
    subtotal = applyTieredPrice(rule.tiers, qty);
    unitPrice = qty > 0 ? subtotal / qty : rule.basePrice;
  } else if (rule.model === 'volume' && rule.tiers) {
    unitPrice = applyTier(rule.tiers, qty);
    subtotal = unitPrice * qty;
  } else {
    subtotal = calculateSubtotal(unitPrice, qty);
  }

  let discountAmount = 0;
  for (const d of rule.discounts ?? []) {
    discountAmount += applyDiscount(subtotal, d, qty);
  }
  discountAmount = Math.min(discountAmount, subtotal);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = calculateTax(afterDiscount, rule.taxRate ?? 0);
  const total = afterDiscount + taxAmount;

  return { ruleId: rule.id, qty, unitPrice, discountAmount, subtotal, taxAmount, total };
}

export function calculateQuote(rules: PriceRule[], quantities: Record<string, number>): PriceQuote {
  const items: LineItem[] = [];
  for (const rule of rules) {
    const qty = quantities[rule.id] ?? 0;
    if (qty > 0) items.push(calculateLineItem(rule, qty));
  }
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const totalDiscount = items.reduce((s, i) => s + i.discountAmount, 0);
  const totalTax = items.reduce((s, i) => s + i.taxAmount, 0);
  const total = items.reduce((s, i) => s + i.total, 0);
  const currency = rules[0]?.currency ?? 'GBP';
  return { items, subtotal, totalDiscount, totalTax, total, currency };
}

export function clampPrice(price: number): number {
  return Math.max(0, price);
}

export function roundPrice(price: number, decimals = 2): number {
  return Math.round(price * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function isValidModel(m: string): m is PricingModel {
  return ['flat', 'tiered', 'volume', 'per_unit'].includes(m);
}

export function isValidDiscountType(d: string): d is DiscountType {
  return ['percentage', 'fixed', 'buy_x_get_y'].includes(d);
}

export function makeRule(id: string, name: string, model: PricingModel, basePrice: number, currency = 'GBP'): PriceRule {
  return { id, name, model, basePrice, currency };
}

export function withDiscount(rule: PriceRule, discount: Discount): PriceRule {
  return { ...rule, discounts: [...(rule.discounts ?? []), discount] };
}

export function withTax(rule: PriceRule, taxRate: number): PriceRule {
  return { ...rule, taxRate };
}

export function withTiers(rule: PriceRule, tiers: PriceTier[]): PriceRule {
  return { ...rule, tiers };
}

export function totalItems(quote: PriceQuote): number {
  return quote.items.reduce((s, i) => s + i.qty, 0);
}
