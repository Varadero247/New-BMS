import { prisma } from '../prisma';

export async function getSdsNearingReview(daysAhead: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  return (prisma as any).chemSds.findMany({
    where: { status: 'CURRENT', nextReviewDate: { lte: futureDate } },
    include: { chemical: { select: { productName: true, casNumber: true } } },
    orderBy: { nextReviewDate: 'asc' },
  });
}

export async function getCoshhNearingReview(daysAhead: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  return (prisma as any).chemCoshh.findMany({
    where: { status: 'ACTIVE', reviewDate: { lte: futureDate }, deletedAt: null },
    include: { chemical: { select: { productName: true, casNumber: true } } },
    orderBy: { reviewDate: 'asc' },
  });
}

export async function getExpiringStock(daysAhead: number = 60) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  return (prisma as any).chemInventory.findMany({
    where: { isActive: true, expiryDate: { lte: futureDate, not: null } },
    include: { chemical: { select: { productName: true, casNumber: true } } },
    orderBy: { expiryDate: 'asc' },
  });
}

export async function getOverdueMonitoring() {
  return (prisma as any).chemMonitoring.findMany({
    where: { nextMonitoringDue: { lte: new Date() }, actionRequired: false },
    include: { chemical: { select: { productName: true, casNumber: true } } },
    orderBy: { nextMonitoringDue: 'asc' },
  });
}

export async function getLowStock() {
  const items = await (prisma as any).chemInventory.findMany({
    where: { isActive: true, minStockLevel: { not: null } },
    include: { chemical: { select: { productName: true, casNumber: true } } },
  });
  return items.filter((item: any) => item.quantityOnhand <= (item.minStockLevel || 0));
}
