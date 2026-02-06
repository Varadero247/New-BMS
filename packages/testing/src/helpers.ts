import { faker } from '@faker-js/faker';

/**
 * Test helper utilities
 */

/**
 * Wait for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random string of specified length
 */
export function randomString(length: number): string {
  return faker.string.alphanumeric(length);
}

/**
 * Generate a random email
 */
export function randomEmail(): string {
  return faker.internet.email().toLowerCase();
}

/**
 * Generate a random valid password
 */
export function randomPassword(): string {
  return faker.internet.password({ length: 12, memorable: false, pattern: /[A-Za-z0-9!@#$%]/ });
}

/**
 * Generate a random UUID
 */
export function randomUuid(): string {
  return faker.string.uuid();
}

/**
 * Generate a random IP address
 */
export function randomIp(): string {
  return faker.internet.ip();
}

/**
 * Generate a random user agent string
 */
export function randomUserAgent(): string {
  return faker.internet.userAgent();
}

/**
 * Create a date in the past
 */
export function pastDate(days: number = 30): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * Create a date in the future
 */
export function futureDate(days: number = 30): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Assert that an async function throws an error
 */
export async function expectThrows(
  fn: () => Promise<unknown>,
  errorMatch?: string | RegExp
): Promise<Error> {
  let error: Error | undefined;

  try {
    await fn();
  } catch (e) {
    error = e as Error;
  }

  expect(error).toBeDefined();

  if (errorMatch) {
    if (typeof errorMatch === 'string') {
      expect(error?.message).toContain(errorMatch);
    } else {
      expect(error?.message).toMatch(errorMatch);
    }
  }

  return error!;
}

/**
 * Assert that a function does not throw
 */
export async function expectNoThrow(fn: () => Promise<unknown>): Promise<void> {
  let error: Error | undefined;

  try {
    await fn();
  } catch (e) {
    error = e as Error;
  }

  expect(error).toBeUndefined();
}

/**
 * Suppress console output during test execution
 */
export function suppressConsole(): { restore: () => void } {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();

  return {
    restore: () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    },
  };
}

/**
 * Create an XSS attack payload for testing
 */
export function xssPayload(): string {
  return '<script>alert("xss")</script>';
}

/**
 * Create a SQL injection payload for testing
 */
export function sqlInjectionPayload(): string {
  return "'; DROP TABLE users; --";
}

/**
 * Create test authorization header
 */
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(prisma: any, tables: string[]): Promise<void> {
  for (const table of tables.reverse()) {
    try {
      await prisma[table].deleteMany({});
    } catch {
      // Table might not exist or have foreign key constraints
    }
  }
}

/**
 * Retry an async function until it succeeds or max attempts reached
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      if (attempt < maxAttempts) {
        await wait(delayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Assert response has expected status and structure
 */
export function expectApiResponse(
  response: { status: number; body: unknown },
  expectedStatus: number,
  hasSuccess: boolean = true
): void {
  expect(response.status).toBe(expectedStatus);
  if (hasSuccess) {
    expect(response.body).toHaveProperty('success');
  }
}

/**
 * Assert API error response
 */
export function expectApiError(
  response: { status: number; body: { error?: { code?: string } } },
  expectedStatus: number,
  expectedCode?: string
): void {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('error');
  if (expectedCode) {
    expect(response.body.error?.code).toBe(expectedCode);
  }
}
