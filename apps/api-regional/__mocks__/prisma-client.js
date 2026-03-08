// Mock @prisma/client for api-regional unit tests
const mockPrisma = {
  apacRegion: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), upsert: jest.fn() },
  apacCountry: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), upsert: jest.fn() },
  apacLegislation: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), upsert: jest.fn() },
  apacFinancialRule: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), upsert: jest.fn() },
  apacTradeAgreement: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), upsert: jest.fn() },
  apacCountryTradeAgreement: { findMany: jest.fn(), create: jest.fn(), upsert: jest.fn() },
  apacIsoLegislationMapping: { findMany: jest.fn(), create: jest.fn(), upsert: jest.fn() },
  apacOnboardingData: { findUnique: jest.fn(), upsert: jest.fn() },
  $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  $disconnect: jest.fn(),
};

const PrismaClient = jest.fn(() => mockPrisma);

module.exports = { PrismaClient };
