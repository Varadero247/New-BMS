// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

test.describe('Enterprise Risk Management CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3031');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Risk Management dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Risk|ISO 31000|Control|KRI|Heat Map/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list risks via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/risk/risks', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list risk controls via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/risk/controls', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list KRIs via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/risk/kri', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
