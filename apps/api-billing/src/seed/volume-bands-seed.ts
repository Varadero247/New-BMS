// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
//
// apps/api-billing/src/seed/volume-bands-seed.ts
//
// Seeds VolumeDiscountBand rows from the canonical PRICING constant.
// Run after billing schema migration:
//   DATABASE_URL=... npx ts-node src/seed/volume-bands-seed.ts
//
import { PRICING } from '@ims/config';
import { prisma } from '../prisma';

async function seedVolumeBands() {
  console.log('Seeding VolumeDiscountBand...');

  for (const band of PRICING.volumeDiscounts) {
    const data = {
      minUsers: band.minUsers,
      maxUsers: band.maxUsers ?? null,
      discountPct: band.discountPct,
      label: band.label,
      isActive: true,
    };

    // Upsert by minUsers (unique per band lower bound)
    await prisma.volumeDiscountBand.upsert({
      where: { minUsers: band.minUsers },
      update: data,
      create: data,
    });

    console.log(
      `  Upserted: ${band.minUsers}–${band.maxUsers ?? '∞'} users → ${band.discountPct}% off (${band.label})`
    );
  }

  console.log(`Seeded ${PRICING.volumeDiscounts.length} volume discount bands.`);
}

async function main() {
  try {
    await seedVolumeBands();
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
