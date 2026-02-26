// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// Factories
export {
  createTestUser,
  createTestAdmin,
  createTestSession,
  createExpiredSession,
  createTestRisk,
  createTestIncident,
  createTestUsers,
  createTestCredentials,
  createTestJwtPayload,
  type TestUser,
  type TestSession,
  type TestRisk,
  type TestIncident,
} from './factories';

// Mocks
export {
  createMockPrisma,
  createMockRequest,
  createMockResponse,
  createMockNext,
  createMockRedis,
  createMockLogger,
  createMockFile,
  createMockImageFile,
  createMockPdfFile,
} from './mocks';

// Helpers
export {
  wait,
  randomString,
  randomEmail,
  randomPassword,
  randomUuid,
  randomIp,
  randomUserAgent,
  pastDate,
  futureDate,
  expectThrows,
  expectNoThrow,
  suppressConsole,
  xssPayload,
  sqlInjectionPayload,
  authHeader,
  cleanupTestData,
  retry,
  expectApiResponse,
  expectApiError,
} from './helpers';
