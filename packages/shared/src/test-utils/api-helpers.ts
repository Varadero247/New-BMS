// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// API assertion helpers for integration tests.

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    [key: string]: unknown;
  };
}

/**
 * Assert response has success:true and return data.
 */
export function assertSuccess<T = unknown>(response: { body: unknown }): T {
  const body = response.body as SuccessResponse<T>;
  if (!body.success) {
    throw new Error(
      `Expected success:true but got success:false. Error: ${JSON.stringify((body as unknown as ErrorResponse).error)}`
    );
  }
  return body.data;
}

/**
 * Assert response has success:false and matching error code.
 */
export function assertError(response: { body: unknown }, code: string): ErrorResponse {
  const body = response.body as ErrorResponse;
  if (body.success !== false) {
    throw new Error(`Expected success:false but got success:true. Body: ${JSON.stringify(body)}`);
  }
  if (body.error?.code !== code) {
    throw new Error(`Expected error code "${code}" but got "${body.error?.code}". Body: ${JSON.stringify(body)}`);
  }
  return body;
}

export interface PaginationExpected {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * Assert pagination meta fields are present and correct.
 */
export function assertPagination(data: unknown, expected: PaginationExpected = {}): void {
  const d = data as Record<string, unknown>;
  const fieldsToCheck = ['page', 'limit', 'total', 'totalPages'] as const;
  for (const f of fieldsToCheck) {
    if (typeof d[f] === 'undefined') {
      throw new Error(`Pagination field "${f}" is missing. Data: ${JSON.stringify(d)}`);
    }
  }
  if (expected.page !== undefined && d.page !== expected.page) {
    throw new Error(`Expected page ${expected.page} but got ${d.page}`);
  }
  if (expected.total !== undefined && d.total !== expected.total) {
    throw new Error(`Expected total ${expected.total} but got ${d.total}`);
  }
}

/**
 * Deep check that none of the banned field names appear anywhere in the body.
 */
export function assertNoSensitiveFields(body: unknown, fields: string[]): void {
  const str = JSON.stringify(body);
  for (const f of fields) {
    const key = `"${f}"`;
    if (str.includes(key)) {
      throw new Error(`Sensitive field "${f}" found in response body`);
    }
  }
}

/**
 * Poll condition every 100ms until it returns true or timeout ms elapses.
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  opts: { timeout?: number; interval?: number; message?: string } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100, message = 'Condition not met within timeout' } = opts;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((r) => setTimeout(r, interval));
  }

  throw new Error(`waitFor timeout after ${timeout}ms: ${message}`);
}
