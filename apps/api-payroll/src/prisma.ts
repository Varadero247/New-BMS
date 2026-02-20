import { PrismaClient, Prisma } from '@ims/database/payroll';
import { encryptIfPresent, decryptIfEncrypted } from '@ims/encryption';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var payrollPrisma: InstanceType<typeof PrismaClient> | undefined;
}

// PII fields on Payslip model that must be encrypted at rest
const PAYSLIP_PII_FIELDS = ['bankAccount'] as const;

function encryptPayslipPII(data: Record<string, unknown>): void {
  for (const field of PAYSLIP_PII_FIELDS) {
    if (field in data && data[field] != null) {
      data[field] = encryptIfPresent(data[field] as string);
    }
  }
}

function decryptPayslipPII(record: Record<string, unknown>): Record<string, unknown> {
  const result = { ...record };
  for (const field of PAYSLIP_PII_FIELDS) {
    if (field in result && result[field] != null) {
      result[field] = decryptIfEncrypted(result[field] as string);
    }
  }
  return result;
}

const client = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Prisma middleware: encrypt PII on write, decrypt on read
client.$use(async (params, next) => {
  if (params.model === 'Payslip') {
    if (params.action === 'create' || params.action === 'update') {
      if (params.args.data) {
        encryptPayslipPII(params.args.data as Record<string, unknown>);
      }
    }
    if (params.action === 'upsert') {
      if (params.args.create) {
        encryptPayslipPII(params.args.create as Record<string, unknown>);
      }
      if (params.args.update) {
        encryptPayslipPII(params.args.update as Record<string, unknown>);
      }
    }
    if (params.action === 'createMany' && Array.isArray(params.args.data)) {
      for (const record of params.args.data as Record<string, unknown>[]) {
        encryptPayslipPII(record);
      }
    }
  }

  const result = await next(params);

  if (params.model === 'Payslip') {
    if (Array.isArray(result)) {
      return result.map((r) =>
        r && typeof r === 'object' ? decryptPayslipPII(r as Record<string, unknown>) : r
      );
    } else if (result && typeof result === 'object') {
      return decryptPayslipPII(result as Record<string, unknown>);
    }
  }

  return result;
});

export const prisma: InstanceType<typeof PrismaClient> = global.payrollPrisma || client;

if (process.env.NODE_ENV !== 'production') {
  global.payrollPrisma = prisma;
}
