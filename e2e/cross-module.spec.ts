// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

test.describe('Cross-Module Navigation', () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    const response = await request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    token = body.data?.accessToken;
  });

  test('should access gateway health endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:4000/health');
    expect(response.ok()).toBeTruthy();
  });

  test('should access H&S API through gateway', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/health-safety/risks', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should access Environment API through gateway', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/environment/aspects', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should access Quality API through gateway', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/quality/processes', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should access Inventory API through gateway', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/inventory/items', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should access HR API through gateway', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/hr/employees', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should access dashboard stats', async ({ request }) => {
    const response = await request.get('http://localhost:4000/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data).toBeDefined();
  });
});
