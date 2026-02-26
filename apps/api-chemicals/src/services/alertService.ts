// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { prisma } from '../prisma';

export async function getSdsNearingReview(daysAhead: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  return prisma.chemSds.findMany({
    where: { status: 'CURRENT', nextReviewDate: { lte: futureDate } },
    include: { chemical: { select: { productName: true, casNumber: true } } },
    orderBy: { nextReviewDate: 'asc' },
  });
}

export async function getCoshhNearingReview(daysAhead: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  return prisma.chemCoshh.findMany({
    where: { status: 'ACTIVE', reviewDate: { lte: futureDate }, deletedAt: null },
    include: { chemical: { select: { productName: true, casNumber: true } } },
    orderBy: { reviewDate: 'asc' },
  });
}

export async function getExpiringStock(daysAhead: number = 60) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  return prisma.chemInventory.findMany({
    where: { isActive: true, expiryDate: { lte: futureDate, not: null } },
    include: { chemical: { select: { productName: true, casNumber: true } } },
    orderBy: { expiryDate: 'asc' },
  });
}

export async function getOverdueMonitoring() {
  return prisma.chemMonitoring.findMany({
    where: { nextMonitoringDue: { lte: new Date() }, actionRequired: false },
    include: { chemical: { select: { productName: true, casNumber: true } } },
    orderBy: { nextMonitoringDue: 'asc' },
  });
}

export async function getLowStock() {
  const items = await prisma.chemInventory.findMany({
    where: { isActive: true, minStockLevel: { not: null } },
    include: { chemical: { select: { productName: true, casNumber: true } } },
  });
  return items.filter(
    (item: Record<string, unknown>) =>
      Number(item.quantityOnhand) <= Number(item.minStockLevel || 0)
  );
}
