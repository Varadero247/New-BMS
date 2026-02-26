// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

test.describe('ISO 37001 (Anti-Bribery) CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3025');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display ISO 37001 dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/ISO 37001|Anti-Bribery|Bribery|Corruption|Compliance/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list anti-bribery policies via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/iso37001/policies', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list due diligence records via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/iso37001/due-diligence', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list gifts and hospitality records via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/iso37001/gifts', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
