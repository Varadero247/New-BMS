// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

test.describe('Aerospace CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.post('http://localhost:4000/api/auth/login', {
      data: { email: 'admin@ims.local', password: 'admin123' },
    });
    const body = await response.json();
    const token = body.data?.accessToken;
    await page.goto('http://localhost:3012');
    await page.evaluate((t) => localStorage.setItem('token', t), token);
    await page.reload();
  });

  test('should display Aerospace dashboard', async ({ page }) => {
    await expect(
      page.locator('text=/Aerospace|AS9100|Configuration|OASIS/i').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('should list configuration items via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/aerospace/configuration', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list first article inspections via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/aerospace/fai', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list work orders via API', async ({ page }) => {
    const response = await page.request.get('http://localhost:4000/api/aerospace/workorders', {
      headers: {
        Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
