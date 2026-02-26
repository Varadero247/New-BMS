export type DiscountType = 'percentage' | 'fixed' | 'buy_x_get_y';
export type PricingModel = 'flat' | 'tiered' | 'volume' | 'per_unit';

export interface Discount {
  type: DiscountType;
  value: number;
  minQty?: number;
  maxQty?: number;
  code?: string;
}

export interface PriceTier {
  minQty: number;
  maxQty?: number;
  unitPrice: number;
}

export interface PriceRule {
  id: string;
  name: string;
  model: PricingModel;
  basePrice: number;
  currency: string;
  tiers?: PriceTier[];
  discounts?: Discount[];
  taxRate?: number;
}

export interface LineItem {
  ruleId: string;
  qty: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface PriceQuote {
  items: LineItem[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  currency: string;
}
