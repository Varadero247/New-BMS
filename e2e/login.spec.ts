// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('text=IMS')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"], input[name="email"]', 'admin@ims.local');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard|\/$/);
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/error|invalid|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should persist session after login', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"], input[name="email"]', 'admin@ims.local');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });
});
