// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"], input[name="email"]', 'admin@ims.local');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
  });

  test('should navigate to Settings module', async ({ page }) => {
    await page.goto('http://localhost:3004');
    await expect(page.locator('text=/Settings|Organisation|Configuration/i').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('should list roles via API', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const response = await page.request.get('http://localhost:4000/api/roles', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should list users via API', async ({ page }) => {
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const response = await page.request.get('http://localhost:4000/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should navigate to roles management page', async ({ page }) => {
    await page.goto('http://localhost:3000/roles');
    await expect(page.locator('text=/Role|Permission|Access/i').first()).toBeVisible({
      timeout: 10000,
    });
  });
});
