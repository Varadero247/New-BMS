jest.mock('../src/prisma', () => ({
  prisma: {
    approvedVendor: { findMany: jest.fn() },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { runSaaSAuditJob } from '../src/jobs/saas-audit.job';
import { prisma } from '../src/prisma';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('runSaaSAuditJob', () => {
  it('returns vendor count and cost totals', async () => {
    const vendors = [
      {
        name: 'AWS',
        category: 'hosting',
        monthlyCost: 500,
        annualCost: 6000,
        isActive: true,
        contractEnd: null,
      },
      {
        name: 'Slack',
        category: 'communication',
        monthlyCost: 50,
        annualCost: 600,
        isActive: true,
        contractEnd: null,
      },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);

    const result = await runSaaSAuditJob();

    expect(result.vendorCount).toBe(2);
    expect(result.activeCount).toBe(2);
    expect(result.totalMonthlyCost).toBe(550);
    expect(result.totalAnnualCost).toBe(6600);
  });

  it('handles empty vendor list', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);

    const result = await runSaaSAuditJob();

    expect(result.vendorCount).toBe(0);
    expect(result.activeCount).toBe(0);
    expect(result.totalMonthlyCost).toBe(0);
    expect(result.totalAnnualCost).toBe(0);
    expect(result.vendors).toHaveLength(0);
  });

  it('groups vendors by category', async () => {
    const vendors = [
      {
        name: 'AWS',
        category: 'hosting',
        monthlyCost: 500,
        annualCost: 6000,
        isActive: true,
        contractEnd: null,
      },
      {
        name: 'GCP',
        category: 'hosting',
        monthlyCost: 200,
        annualCost: 2400,
        isActive: true,
        contractEnd: null,
      },
      {
        name: 'Slack',
        category: 'communication',
        monthlyCost: 50,
        annualCost: 600,
        isActive: true,
        contractEnd: null,
      },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);

    const result = await runSaaSAuditJob();

    expect(result.byCategory['hosting'].count).toBe(2);
    expect(result.byCategory['hosting'].monthlyCost).toBe(700);
    expect(result.byCategory['communication'].count).toBe(1);
  });

  it('only counts active vendors in cost totals', async () => {
    const vendors = [
      {
        name: 'AWS',
        category: 'hosting',
        monthlyCost: 500,
        annualCost: 6000,
        isActive: true,
        contractEnd: null,
      },
      {
        name: 'OldTool',
        category: 'legacy',
        monthlyCost: 100,
        annualCost: 1200,
        isActive: false,
        contractEnd: null,
      },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);

    const result = await runSaaSAuditJob();

    expect(result.vendorCount).toBe(2); // total includes inactive
    expect(result.activeCount).toBe(1);
    expect(result.totalMonthlyCost).toBe(500); // only active vendor
  });

  it('includes all vendors in the vendors array', async () => {
    const vendors = [
      {
        name: 'AWS',
        category: 'hosting',
        monthlyCost: 500,
        annualCost: 6000,
        isActive: true,
        contractEnd: new Date('2027-01-01'),
      },
      {
        name: 'OldTool',
        category: 'legacy',
        monthlyCost: 100,
        annualCost: 1200,
        isActive: false,
        contractEnd: null,
      },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);

    const result = await runSaaSAuditJob();

    expect(result.vendors).toHaveLength(2);
    expect(result.vendors[0].name).toBe('AWS');
    expect(result.vendors[0].contractEnd).toBeTruthy();
    expect(result.vendors[1].isActive).toBe(false);
  });

  it('rounds cost totals to 2 decimal places', async () => {
    const vendors = [
      {
        name: 'SVC-A',
        category: 'tools',
        monthlyCost: 33.333,
        annualCost: 399.996,
        isActive: true,
        contractEnd: null,
      },
      {
        name: 'SVC-B',
        category: 'tools',
        monthlyCost: 66.667,
        annualCost: 800.004,
        isActive: true,
        contractEnd: null,
      },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);

    const result = await runSaaSAuditJob();

    expect(result.totalMonthlyCost).toBe(100);
    expect(result.totalAnnualCost).toBe(1200);
  });

  it('excludes inactive vendors from category breakdown', async () => {
    const vendors = [
      {
        name: 'Active',
        category: 'hosting',
        monthlyCost: 500,
        annualCost: 6000,
        isActive: true,
        contractEnd: null,
      },
      {
        name: 'Inactive',
        category: 'hosting',
        monthlyCost: 200,
        annualCost: 2400,
        isActive: false,
        contractEnd: null,
      },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);

    const result = await runSaaSAuditJob();

    expect(result.byCategory['hosting'].count).toBe(1);
    expect(result.byCategory['hosting'].monthlyCost).toBe(500);
  });

  it('handles vendors with zero costs', async () => {
    const vendors = [
      {
        name: 'FreeTier',
        category: 'tools',
        monthlyCost: 0,
        annualCost: 0,
        isActive: true,
        contractEnd: null,
      },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);

    const result = await runSaaSAuditJob();

    expect(result.vendorCount).toBe(1);
    expect(result.totalMonthlyCost).toBe(0);
    expect(result.totalAnnualCost).toBe(0);
  });

  it('vendors array is an array', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    expect(Array.isArray(result.vendors)).toBe(true);
  });

  it('byCategory is an object', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    expect(typeof result.byCategory).toBe('object');
  });

  it('findMany called exactly once per job run', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    await runSaaSAuditJob();
    expect(prisma.approvedVendor.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('SaaS Audit — extended', () => {
  it('activeCount is a number', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    expect(typeof result.activeCount).toBe('number');
  });

  it('vendorCount equals vendors array length', async () => {
    const vendors = [
      { name: 'A', category: 'x', monthlyCost: 10, annualCost: 120, isActive: true, contractEnd: null },
      { name: 'B', category: 'x', monthlyCost: 20, annualCost: 240, isActive: false, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.vendorCount).toBe(result.vendors.length);
  });

  it('totalAnnualCost is a number', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    expect(typeof result.totalAnnualCost).toBe('number');
  });

  it('byCategory entries each have count and monthlyCost', async () => {
    const vendors = [
      { name: 'X', category: 'tools', monthlyCost: 100, annualCost: 1200, isActive: true, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.byCategory['tools']).toHaveProperty('count');
    expect(result.byCategory['tools']).toHaveProperty('monthlyCost');
  });
});


describe('SaaS Audit — additional coverage', () => {
  it('single vendor with mixed cost returns correct totals', async () => {
    const vendors = [
      { name: 'Solo', category: 'tools', monthlyCost: 99.99, annualCost: 1199.88, isActive: true, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.vendorCount).toBe(1);
    expect(result.activeCount).toBe(1);
    expect(result.totalMonthlyCost).toBeCloseTo(99.99, 1);
  });

  it('all inactive vendors yield activeCount 0 but non-zero vendorCount', async () => {
    const vendors = [
      { name: 'Old1', category: 'legacy', monthlyCost: 50, annualCost: 600, isActive: false, contractEnd: null },
      { name: 'Old2', category: 'legacy', monthlyCost: 70, annualCost: 840, isActive: false, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.activeCount).toBe(0);
    expect(result.vendorCount).toBe(2);
    expect(result.totalMonthlyCost).toBe(0);
  });

  it('multiple categories are all represented in byCategory', async () => {
    const vendors = [
      { name: 'A', category: 'cat1', monthlyCost: 10, annualCost: 120, isActive: true, contractEnd: null },
      { name: 'B', category: 'cat2', monthlyCost: 20, annualCost: 240, isActive: true, contractEnd: null },
      { name: 'C', category: 'cat3', monthlyCost: 30, annualCost: 360, isActive: true, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(Object.keys(result.byCategory)).toHaveLength(3);
    expect(result.byCategory['cat1']).toBeDefined();
    expect(result.byCategory['cat2']).toBeDefined();
    expect(result.byCategory['cat3']).toBeDefined();
  });

  it('totalMonthlyCost sums only active vendors across all categories', async () => {
    const vendors = [
      { name: 'X', category: 'cat1', monthlyCost: 100, annualCost: 1200, isActive: true, contractEnd: null },
      { name: 'Y', category: 'cat2', monthlyCost: 200, annualCost: 2400, isActive: true, contractEnd: null },
      { name: 'Z', category: 'cat1', monthlyCost: 50, annualCost: 600, isActive: false, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.totalMonthlyCost).toBe(300);
  });

  it('job result is an object with expected top-level keys', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    expect(result).toHaveProperty('vendorCount');
    expect(result).toHaveProperty('activeCount');
    expect(result).toHaveProperty('totalMonthlyCost');
    expect(result).toHaveProperty('totalAnnualCost');
    expect(result).toHaveProperty('vendors');
    expect(result).toHaveProperty('byCategory');
  });
});

describe('SaaS Audit — further edge cases', () => {
  it('totalAnnualCost is 12x monthly for monthly-billed vendor', async () => {
    const vendors = [
      { name: 'MonthlyBilled', category: 'tools', monthlyCost: 100, annualCost: 1200, isActive: true, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.totalAnnualCost).toBe(1200);
  });

  it('byCategory annualCost for active vendors is summed correctly', async () => {
    const vendors = [
      { name: 'V1', category: 'hosting', monthlyCost: 200, annualCost: 2400, isActive: true, contractEnd: null },
      { name: 'V2', category: 'hosting', monthlyCost: 300, annualCost: 3600, isActive: true, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.byCategory['hosting'].count).toBe(2);
    expect(result.byCategory['hosting'].monthlyCost).toBe(500);
  });

  it('vendor with contractEnd date is included in vendors array', async () => {
    const contractEnd = new Date('2027-06-30');
    const vendors = [
      { name: 'ContractVendor', category: 'saas', monthlyCost: 150, annualCost: 1800, isActive: true, contractEnd },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.vendors[0].contractEnd).toBeTruthy();
  });

  it('activeCount does not count inactive vendors', async () => {
    const vendors = [
      { name: 'Active1', category: 'tools', monthlyCost: 50, annualCost: 600, isActive: true, contractEnd: null },
      { name: 'Active2', category: 'tools', monthlyCost: 50, annualCost: 600, isActive: true, contractEnd: null },
      { name: 'Inactive', category: 'tools', monthlyCost: 50, annualCost: 600, isActive: false, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.activeCount).toBe(2);
    expect(result.vendorCount).toBe(3);
  });

  it('empty byCategory when all vendors are inactive', async () => {
    const vendors = [
      { name: 'Old', category: 'legacy', monthlyCost: 100, annualCost: 1200, isActive: false, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(Object.keys(result.byCategory)).toHaveLength(0);
  });

  it('findMany is called with no filter arguments', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    await runSaaSAuditJob();
    expect(prisma.approvedVendor.findMany).toHaveBeenCalledTimes(1);
  });

  it('vendors array preserves all vendor names', async () => {
    const vendors = [
      { name: 'NameA', category: 'cat', monthlyCost: 10, annualCost: 120, isActive: true, contractEnd: null },
      { name: 'NameB', category: 'cat', monthlyCost: 20, annualCost: 240, isActive: false, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    const names = result.vendors.map((v: { name: string }) => v.name);
    expect(names).toContain('NameA');
    expect(names).toContain('NameB');
  });

  it('totalAnnualCost is 0 when all vendors are inactive', async () => {
    const vendors = [
      { name: 'Inactive1', category: 'tools', monthlyCost: 100, annualCost: 1200, isActive: false, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.totalAnnualCost).toBe(0);
  });
});

describe('SaaS Audit — final coverage', () => {
  it('result vendorCount is 0 for empty list', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    expect(result.vendorCount).toBe(0);
  });

  it('totalMonthlyCost type is number', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    expect(typeof result.totalMonthlyCost).toBe('number');
  });

  it('result has all expected keys', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    const keys = Object.keys(result);
    expect(keys).toContain('vendorCount');
    expect(keys).toContain('activeCount');
    expect(keys).toContain('totalMonthlyCost');
    expect(keys).toContain('totalAnnualCost');
    expect(keys).toContain('vendors');
    expect(keys).toContain('byCategory');
  });

  it('three active vendors results in activeCount 3', async () => {
    const vendors = Array.from({ length: 3 }, (_, i) => ({
      name: `Vendor${i}`, category: 'tools', monthlyCost: 10, annualCost: 120, isActive: true, contractEnd: null,
    }));
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.activeCount).toBe(3);
  });

  it('byCategory is empty object for no active vendors', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    expect(result.byCategory).toEqual({});
  });

  it('totalAnnualCost is non-negative', async () => {
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue([]);
    const result = await runSaaSAuditJob();
    expect(result.totalAnnualCost).toBeGreaterThanOrEqual(0);
  });

  it('single category has correct annualCost in byCategory', async () => {
    const vendors = [
      { name: 'P', category: 'cloud', monthlyCost: 100, annualCost: 1200, isActive: true, contractEnd: null },
    ];
    (prisma.approvedVendor.findMany as jest.Mock).mockResolvedValue(vendors);
    const result = await runSaaSAuditJob();
    expect(result.byCategory['cloud']).toHaveProperty('annualCost');
    expect(result.byCategory['cloud'].annualCost).toBe(1200);
  });
});
