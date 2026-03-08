// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
//
// apps/api-billing/src/seed/pricing-seed.ts
//
// Seeds PricingTierConfig rows from the canonical PRICING constant.
// Run after billing schema migration:
//   DATABASE_URL=... npx ts-node src/seed/pricing-seed.ts
//
import { PRICING } from '@ims/config';
import { prisma } from '../prisma';

async function seedPricingTiers() {
  console.log('Seeding PricingTierConfig...');

  for (const [key, tier] of Object.entries(PRICING.tiers)) {
    const data = {
      tierId: tier.id,
      tierKey: key,
      name: tier.name,
      currencyCode: PRICING.currency,
      listPriceMonthly: 'listPriceMonthly' in tier ? Number(tier.listPriceMonthly) : 0,
      annualMonthlyRate: 'annualMonthlyRate' in tier ? Number(tier.annualMonthlyRate) : 0,
      trialConvertRate: 'trialConvertRate' in tier ? Number(tier.trialConvertRate) : 0,
      annualDiscountPct: 'annualDiscountPct' in tier ? Number(tier.annualDiscountPct) : 0,
      minUsers: 'minUsers' in tier ? Number(tier.minUsers) : 1,
      maxUsers: 'maxUsers' in tier && tier.maxUsers !== null ? Number(tier.maxUsers) : null,
      platformFeeAnnual: 'platformFeeAnnual' in tier && tier.platformFeeAnnual
        ? Number(tier.platformFeeAnnual)
        : null,
      trialEnabled: 'trialEnabled' in tier ? Boolean(tier.trialEnabled) : false,
      trialDays: 'trialDays' in tier && tier.trialDays ? Number(tier.trialDays) : null,
      isActive: true,
      metadata: JSON.stringify(tier),
    };

    await prisma.pricingTierConfig.upsert({
      where: { tierId: tier.id },
      update: data,
      create: data,
    });

    console.log(`  Upserted: ${key} (${tier.id})`);
  }

  console.log(`Seeded ${Object.keys(PRICING.tiers).length} pricing tiers.`);
}

async function main() {
  try {
    await seedPricingTiers();
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
