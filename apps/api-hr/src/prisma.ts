import { PrismaClient, Prisma } from '@ims/database/hr';
import { encryptIfPresent, decryptIfEncrypted } from '@ims/encryption';
export { Prisma };

declare global {
  // eslint-disable-next-line no-var
  var hrPrisma: InstanceType<typeof PrismaClient> | undefined;
}

// PII fields on Employee model that must be encrypted at rest
const EMPLOYEE_PII_FIELDS = ['personalEmail', 'accountNumber', 'bankName'] as const;

function encryptEmployeePII(data: Record<string, unknown>): void {
  for (const field of EMPLOYEE_PII_FIELDS) {
    if (field in data && data[field] != null) {
      data[field] = encryptIfPresent(data[field] as string);
    }
  }
}

function decryptEmployeePII(record: Record<string, unknown>): Record<string, unknown> {
  const result = { ...record };
  for (const field of EMPLOYEE_PII_FIELDS) {
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
  if (params.model === 'Employee') {
    // Encrypt on writes
    if (params.action === 'create' || params.action === 'update') {
      if (params.args.data) {
        encryptEmployeePII(params.args.data as Record<string, unknown>);
      }
    }
    if (params.action === 'upsert') {
      if (params.args.create) {
        encryptEmployeePII(params.args.create as Record<string, unknown>);
      }
      if (params.args.update) {
        encryptEmployeePII(params.args.update as Record<string, unknown>);
      }
    }
    if (params.action === 'createMany' && Array.isArray(params.args.data)) {
      for (const record of params.args.data as Record<string, unknown>[]) {
        encryptEmployeePII(record);
      }
    }
  }

  const result = await next(params);

  // Decrypt on reads
  if (params.model === 'Employee') {
    if (Array.isArray(result)) {
      return result.map((r) =>
        r && typeof r === 'object' ? decryptEmployeePII(r as Record<string, unknown>) : r
      );
    } else if (result && typeof result === 'object') {
      return decryptEmployeePII(result as Record<string, unknown>);
    }
  }

  return result;
});

export const prisma: InstanceType<typeof PrismaClient> = global.hrPrisma || client;

if (process.env.NODE_ENV !== 'production') {
  global.hrPrisma = prisma;
}
