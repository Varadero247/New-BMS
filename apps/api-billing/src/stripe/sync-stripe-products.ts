// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
//
// apps/api-billing/src/stripe/sync-stripe-products.ts
//
// Syncs the canonical PRICING config to Stripe Products + Prices.
// Run once after any pricing change:
//   STRIPE_SECRET_KEY=sk_live_... npx ts-node src/stripe/sync-stripe-products.ts
//
// This script is ADDITIVE: it creates or updates Stripe objects, never deletes them.
// Archive old prices in Stripe manually if needed.
//
import Stripe from 'stripe';
import { PRICING } from '@ims/config';

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('FATAL: STRIPE_SECRET_KEY env var is required');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

interface StripeProductResult {
  tier: string;
  productId: string;
  monthlyPriceId: string | null;
  annualPriceId: string | null;
  trialPriceId: string | null;
  platformFeePriceId: string | null;
}

async function upsertProduct(name: string, description: string, metadata: Record<string, string>) {
  // Search for existing product by metadata key
  const existing = await stripe.products.search({
    query: `metadata['ims_tier_id']:'${metadata['ims_tier_id']}'`,
  });

  if (existing.data.length > 0) {
    const product = await stripe.products.update(existing.data[0].id, { name, description, metadata });
    console.log(`  Updated product: ${product.id} (${name})`);
    return product;
  }

  const product = await stripe.products.create({ name, description, metadata });
  console.log(`  Created product: ${product.id} (${name})`);
  return product;
}

async function createPrice(
  productId: string,
  unitAmount: number,
  recurring: { interval: 'month' | 'year'; intervalCount?: number },
  currency: string,
  metadata: Record<string, string>
) {
  // Stripe prices are immutable — always create a new one
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: unitAmount, // in pence
    currency,
    recurring,
    metadata,
  });
  console.log(`    Created price: ${price.id} (${currency.toUpperCase()} ${unitAmount / 100}/${recurring.interval})`);
  return price;
}

async function syncTier(tierKey: string): Promise<StripeProductResult> {
  const tier = PRICING.tiers[tierKey as keyof typeof PRICING.tiers];
  const currency = PRICING.currency.toLowerCase();

  console.log(`\nSyncing tier: ${tier.name}`);

  const product = await upsertProduct(
    `Nexara IMS — ${tier.name}`,
    `Nexara IMS ${tier.name} plan`,
    {
      ims_tier_id: tier.id,
      ims_tier_key: tierKey,
    }
  );

  const results: StripeProductResult = {
    tier: tierKey,
    productId: product.id,
    monthlyPriceId: null,
    annualPriceId: null,
    trialPriceId: null,
    platformFeePriceId: null,
  };

  // Monthly price (per user per month)
  if ('listPriceMonthly' in tier && typeof tier.listPriceMonthly === 'number') {
    const monthlyPrice = await createPrice(
      product.id,
      Math.round(tier.listPriceMonthly * 100),
      { interval: 'month' },
      currency,
      { ims_billing_cycle: 'monthly', ims_tier_id: tier.id }
    );
    results.monthlyPriceId = monthlyPrice.id;
  }

  // Annual price (per user per month, billed annually — Stripe bills the annual total upfront)
  if ('annualMonthlyRate' in tier && typeof tier.annualMonthlyRate === 'number') {
    const annualTotal = Math.round(tier.annualMonthlyRate * 12 * 100);
    const annualPrice = await createPrice(
      product.id,
      annualTotal,
      { interval: 'year' },
      currency,
      { ims_billing_cycle: 'annual', ims_per_user_monthly: String(tier.annualMonthlyRate), ims_tier_id: tier.id }
    );
    results.annualPriceId = annualPrice.id;
  }

  // Trial convert rate (for automatic trial-to-paid conversion)
  if ('trialConvertRate' in tier && typeof tier.trialConvertRate === 'number') {
    const trialPrice = await createPrice(
      product.id,
      Math.round(tier.trialConvertRate * 100),
      { interval: 'month' },
      currency,
      { ims_billing_cycle: 'trial_convert', ims_tier_id: tier.id }
    );
    results.trialPriceId = trialPrice.id;
  }

  // Platform fee (Enterprise / Enterprise+)
  if ('platformFeeAnnual' in tier && typeof tier.platformFeeAnnual === 'number' && tier.platformFeeAnnual) {
    const feeProduct = await upsertProduct(
      `Nexara IMS — ${tier.name} Platform Fee`,
      `Annual platform fee for ${tier.name} plan`,
      { ims_tier_id: `${tier.id}_platform_fee` }
    );
    const feePrice = await createPrice(
      feeProduct.id,
      Math.round(tier.platformFeeAnnual * 100),
      { interval: 'year' },
      currency,
      { ims_fee_type: 'platform', ims_tier_id: tier.id }
    );
    results.platformFeePriceId = feePrice.id;
  }

  return results;
}

async function main() {
  console.log('=== Nexara IMS — Stripe Product Sync ===');
  console.log(`Currency: ${PRICING.currency}`);
  console.log(`Tiers to sync: ${Object.keys(PRICING.tiers).join(', ')}\n`);

  const results: StripeProductResult[] = [];

  for (const tierKey of Object.keys(PRICING.tiers)) {
    try {
      const result = await syncTier(tierKey);
      results.push(result);
    } catch (err) {
      console.error(`  ERROR syncing ${tierKey}:`, err);
    }
  }

  console.log('\n=== Sync Complete ===');
  console.log('Price IDs (add to .env or Stripe dashboard):');
  for (const r of results) {
    console.log(`\n${r.tier}:`);
    console.log(`  Product:       ${r.productId}`);
    if (r.monthlyPriceId) console.log(`  Monthly:       ${r.monthlyPriceId}`);
    if (r.annualPriceId)  console.log(`  Annual:        ${r.annualPriceId}`);
    if (r.trialPriceId)   console.log(`  Trial Convert: ${r.trialPriceId}`);
    if (r.platformFeePriceId) console.log(`  Platform Fee:  ${r.platformFeePriceId}`);
  }
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
