jest.mock('../src/prisma', () => ({
  prisma: {
    monthlySnapshot: { findMany: jest.fn(), findFirst: jest.fn() },
    vatSummary: { upsert: jest.fn() },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { runVatSummaryJob } from '../src/jobs/vat-summary.job';
import { prisma } from '../src/prisma';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('runVatSummaryJob', () => {
  it('creates VAT summary for previous month', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-1' });

    const result = await runVatSummaryJob();

    expect(result).toBe('vat-1');
    expect(prisma.vatSummary.upsert).toHaveBeenCalled();
  });

  it('uses snapshot MRR when available', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([{ mrr: 10000 }]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-2' });

    await runVatSummaryJob();

    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(Number(upsertCall.create.totalRevenue)).toBe(10000);
  });

  it('falls back to zero when no snapshot exists at all', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.monthlySnapshot.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-3' });

    await runVatSummaryJob();

    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(Number(upsertCall.create.totalRevenue)).toBe(0);
  });

  it('calculates UK VAT at 20%', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([{ mrr: 10000 }]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-4' });

    await runVatSummaryJob();

    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    // UK revenue = 10000 * 0.55 = 5500, VAT = 5500 * 0.20 = 1100
    expect(Number(upsertCall.create.ukVat)).toBe(1100);
  });

  it('calculates EU VAT as 0 (reverse charge)', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([{ mrr: 10000 }]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-5' });

    await runVatSummaryJob();

    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(Number(upsertCall.create.euVat)).toBe(0);
  });

  it('calculates GCC VAT at 5%', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([{ mrr: 10000 }]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-6' });

    await runVatSummaryJob();

    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    // GCC revenue = 10000 * 0.10 = 1000, VAT = 1000 * 0.05 = 50
    expect(Number(upsertCall.create.gccVat)).toBe(50);
  });

  it('includes regional breakdown in summary', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([{ mrr: 10000 }]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-7' });

    await runVatSummaryJob();

    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    const breakdown = upsertCall.create.breakdown;
    expect(breakdown).toHaveLength(4);
    expect(breakdown[0].region).toBe('UK');
    expect(breakdown[1].region).toBe('EU');
    expect(breakdown[2].region).toBe('GCC');
    expect(breakdown[3].region).toBe('Rest of World');
  });

  it('sets filing status to DRAFT', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-8' });

    await runVatSummaryJob();

    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertCall.create.filingStatus).toBe('DRAFT');
  });

  it('handles snapshot fetch error gracefully', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
    (prisma.monthlySnapshot.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-9' });

    const result = await runVatSummaryJob();

    expect(result).toBe('vat-9');
    // Falls back to zero revenue when no snapshot is available
    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(Number(upsertCall.create.totalRevenue)).toBe(0);
  });

  it('updates existing VAT summary via upsert', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([{ mrr: 12000 }]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-10' });

    await runVatSummaryJob();

    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertCall.update).toBeDefined();
    expect(Number(upsertCall.update.totalRevenue)).toBe(12000);
  });
});

describe('VAT Summary — extended', () => {
  it('upsert is called exactly once per job run', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-ext-1' });
    await runVatSummaryJob();
    expect(prisma.vatSummary.upsert).toHaveBeenCalledTimes(1);
  });

  it('create block has a period field', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-ext-2' });
    await runVatSummaryJob();
    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertCall.create).toHaveProperty('period');
  });

  it('create block has a ukVat field', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([{ mrr: 10000 }]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-ext-3' });
    await runVatSummaryJob();
    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertCall.create).toHaveProperty('ukVat');
  });

  it('breakdown array has length 4', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-ext-4' });
    await runVatSummaryJob();
    const upsertCall = (prisma.vatSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertCall.create.breakdown).toHaveLength(4);
  });

  it('returns the id returned by upsert', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.vatSummary.upsert as jest.Mock).mockResolvedValue({ id: 'vat-ext-5' });
    const result = await runVatSummaryJob();
    expect(result).toBe('vat-ext-5');
  });
});
