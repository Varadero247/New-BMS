// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { faker } from '@faker-js/faker';

/**
 * Factory functions for creating test data
 */

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  lastActivityAt: Date;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export interface TestRisk {
  id: string;
  title: string;
  description: string;
  severity: string;
  likelihood: string;
  status: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestIncident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  reportedById: string;
  reportedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a test user with optional overrides
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456789', // Fake bcrypt hash
    role: 'USER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a test admin user
 */
export function createTestAdmin(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    role: 'ADMIN',
    ...overrides,
  });
}

/**
 * Create a test session
 */
export function createTestSession(
  userId: string,
  overrides: Partial<TestSession> = {}
): TestSession {
  return {
    id: faker.string.uuid(),
    userId,
    token: faker.string.alphanumeric(64),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    lastActivityAt: new Date(),
    userAgent: faker.internet.userAgent(),
    ipAddress: faker.internet.ip(),
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create an expired session
 */
export function createExpiredSession(
  userId: string,
  overrides: Partial<TestSession> = {}
): TestSession {
  return createTestSession(userId, {
    expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
    ...overrides,
  });
}

/**
 * Create a test risk
 */
export function createTestRisk(createdById: string, overrides: Partial<TestRisk> = {}): TestRisk {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    severity: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    likelihood: faker.helpers.arrayElement(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'CERTAIN']),
    status: faker.helpers.arrayElement(['IDENTIFIED', 'ASSESSED', 'MITIGATED', 'CLOSED']),
    createdById,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a test incident
 */
export function createTestIncident(
  reportedById: string,
  overrides: Partial<TestIncident> = {}
): TestIncident {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    severity: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    status: faker.helpers.arrayElement(['REPORTED', 'INVESTIGATING', 'RESOLVED', 'CLOSED']),
    reportedById,
    reportedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create multiple test users
 */
export function createTestUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
  return Array.from({ length: count }, () => createTestUser(overrides));
}

/**
 * Create test login credentials
 */
export function createTestCredentials(): { email: string; password: string } {
  return {
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12, memorable: false }),
  };
}

/**
 * Create test JWT payload
 */
export function createTestJwtPayload(user: TestUser): {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
} {
  const now = Math.floor(Date.now() / 1000);
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  };
}
