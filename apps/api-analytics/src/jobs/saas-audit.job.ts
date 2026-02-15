import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('saas-audit-job');

export interface SaaSAuditResult {
  vendorCount: number;
  activeCount: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  vendors: Array<{
    name: string;
    category: string;
    monthlyCost: number;
    annualCost: number;
    contractEnd: string | null;
    isActive: boolean;
  }>;
  byCategory: Record<string, { count: number; monthlyCost: number; annualCost: number }>;
}

export async function runSaaSAuditJob(): Promise<SaaSAuditResult> {
  logger.info('Starting SaaS audit job');

  const allVendors = await prisma.approvedVendor.findMany({
    orderBy: { name: 'asc' },
  });

  const activeVendors = allVendors.filter((v) => v.isActive);

  const totalMonthlyCost = activeVendors.reduce((sum, v) => sum + Number(v.monthlyCost || 0), 0);
  const totalAnnualCost = activeVendors.reduce((sum, v) => sum + Number(v.annualCost || 0), 0);

  // Group by category
  const byCategory: Record<string, { count: number; monthlyCost: number; annualCost: number }> = {};
  for (const vendor of activeVendors) {
    const cat = vendor.category || 'uncategorised';
    if (!byCategory[cat]) {
      byCategory[cat] = { count: 0, monthlyCost: 0, annualCost: 0 };
    }
    byCategory[cat].count++;
    byCategory[cat].monthlyCost += Number(vendor.monthlyCost || 0);
    byCategory[cat].annualCost += Number(vendor.annualCost || 0);
  }

  // Round category totals
  for (const cat of Object.keys(byCategory)) {
    byCategory[cat].monthlyCost = Math.round(byCategory[cat].monthlyCost * 100) / 100;
    byCategory[cat].annualCost = Math.round(byCategory[cat].annualCost * 100) / 100;
  }

  const vendors = allVendors.map((v) => ({
    name: v.name,
    category: v.category,
    monthlyCost: Number(v.monthlyCost),
    annualCost: Number(v.annualCost),
    contractEnd: v.contractEnd ? v.contractEnd.toISOString() : null,
    isActive: v.isActive,
  }));

  const result: SaaSAuditResult = {
    vendorCount: allVendors.length,
    activeCount: activeVendors.length,
    totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
    totalAnnualCost: Math.round(totalAnnualCost * 100) / 100,
    vendors,
    byCategory,
  };

  logger.info('SaaS audit completed', {
    vendorCount: result.vendorCount,
    activeCount: result.activeCount,
    totalMonthlyCost: result.totalMonthlyCost,
    totalAnnualCost: result.totalAnnualCost,
    categories: Object.keys(byCategory).length,
  });

  return result;
}
